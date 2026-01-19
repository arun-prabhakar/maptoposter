from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os
import sys
import json
import uuid
import tempfile
import shutil
from typing import Optional, List, Dict
from datetime import datetime, timedelta
import asyncio
from pathlib import Path

# Determine base directory (handles both local dev and Docker)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if not os.path.exists(os.path.join(BASE_DIR, "themes")):
    # We're in backend/ subdirectory in local dev
    BASE_DIR = os.path.dirname(BASE_DIR)

# Change working directory to base directory so create_map_poster can find themes/fonts
os.chdir(BASE_DIR)

# Add base directory to path to import create_map_poster
sys.path.insert(0, BASE_DIR)
import create_map_poster as cmp

app = FastAPI(title="Map Poster Generator API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use temporary directory for posters with auto-cleanup
TEMP_POSTERS_DIR = tempfile.mkdtemp(prefix="maptoposter_")
print(f"📁 Temporary posters directory: {TEMP_POSTERS_DIR}")

# In-memory job storage (in production, use Redis or a database)
jobs = {}

# File cleanup configuration
FILE_EXPIRY_HOURS = 2  # Delete files older than 2 hours

def cleanup_old_files():
    """Remove poster files older than FILE_EXPIRY_HOURS."""
    try:
        now = datetime.now()
        count = 0
        for file_path in Path(TEMP_POSTERS_DIR).glob("*.png"):
            file_age = now - datetime.fromtimestamp(file_path.stat().st_mtime)
            if file_age > timedelta(hours=FILE_EXPIRY_HOURS):
                file_path.unlink()
                count += 1
        if count > 0:
            print(f"🧹 Cleaned up {count} old poster files")
    except Exception as e:
        print(f"Error during cleanup: {e}")

class PosterRequest(BaseModel):
    city: str
    country: str
    theme: str = "feature_based"
    distance: int = 29000

class JobStatus(BaseModel):
    job_id: str
    status: str  # queued, processing, completed, failed
    message: str
    file_url: Optional[str] = None
    progress: int = 0

class ThemeInfo(BaseModel):
    name: str
    display_name: str
    description: str
    colors: Dict[str, str]

@app.get("/")
async def root():
    return {"message": "Map Poster Generator API", "version": "1.0.0"}

@app.get("/api/themes", response_model=List[ThemeInfo])
async def get_themes():
    """Get all available themes."""
    themes = []
    themes_dir = os.path.join(BASE_DIR, "themes")

    if not os.path.exists(themes_dir):
        raise HTTPException(status_code=500, detail=f"Themes directory not found at {themes_dir}")

    for file in sorted(os.listdir(themes_dir)):
        if file.endswith('.json'):
            theme_name = file[:-5]
            theme_path = os.path.join(themes_dir, file)
            try:
                with open(theme_path, 'r') as f:
                    theme_data = json.load(f)
                    themes.append(ThemeInfo(
                        name=theme_name,
                        display_name=theme_data.get('name', theme_name),
                        description=theme_data.get('description', ''),
                        colors={
                            'bg': theme_data.get('bg', '#FFFFFF'),
                            'text': theme_data.get('text', '#000000'),
                            'water': theme_data.get('water', '#C0C0C0'),
                            'parks': theme_data.get('parks', '#F0F0F0'),
                            'road_motorway': theme_data.get('road_motorway', '#0A0A0A'),
                            'road_primary': theme_data.get('road_primary', '#1A1A1A'),
                        }
                    ))
            except Exception as e:
                print(f"Error loading theme {theme_name}: {e}")
                continue

    return themes

@app.post("/api/generate", response_model=JobStatus)
async def generate_poster(request: PosterRequest, background_tasks: BackgroundTasks):
    """Generate a map poster. Returns a job ID to track progress."""
    # Validate theme
    available_themes = cmp.get_available_themes()
    if request.theme not in available_themes:
        raise HTTPException(status_code=400, detail=f"Theme '{request.theme}' not found")

    # Validate distance
    if request.distance < 1000 or request.distance > 50000:
        raise HTTPException(status_code=400, detail="Distance must be between 1000 and 50000 meters")

    # Create job
    job_id = str(uuid.uuid4())
    jobs[job_id] = {
        "status": "queued",
        "message": "Job queued for processing",
        "progress": 0,
        "request": request.dict()
    }

    # Add background task
    background_tasks.add_task(process_poster_generation, job_id, request)

    return JobStatus(
        job_id=job_id,
        status="queued",
        message="Job queued for processing",
        progress=0
    )

def _generate_poster_sync(job_id: str, request: PosterRequest):
    """Synchronous poster generation function to run in thread pool."""
    try:
        jobs[job_id]["status"] = "processing"
        jobs[job_id]["message"] = "Looking up coordinates..."
        jobs[job_id]["progress"] = 10

        # Load theme
        cmp.THEME = cmp.load_theme(request.theme)

        # Get coordinates
        coords = cmp.get_coordinates(request.city, request.country)
        jobs[job_id]["progress"] = 30
        jobs[job_id]["message"] = "Downloading map data..."

        # Generate output filename in temp directory
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        city_slug = request.city.lower().replace(' ', '_')
        filename = f"{city_slug}_{request.theme}_{timestamp}.png"
        output_file = os.path.join(TEMP_POSTERS_DIR, filename)

        jobs[job_id]["progress"] = 50
        jobs[job_id]["message"] = "Rendering map..."

        # Create poster
        cmp.create_poster(request.city, request.country, coords, request.distance, output_file)

        jobs[job_id]["status"] = "completed"
        jobs[job_id]["progress"] = 100
        jobs[job_id]["message"] = "Poster generated successfully"
        jobs[job_id]["file_path"] = output_file
        jobs[job_id]["file_url"] = f"/api/download/{job_id}"

    except Exception as e:
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["message"] = f"Error: {str(e)}"
        jobs[job_id]["progress"] = 0
        print(f"Job {job_id} failed: {e}")
        import traceback
        traceback.print_exc()

async def process_poster_generation(job_id: str, request: PosterRequest):
    """Background task to generate poster - runs blocking code in thread pool."""
    # Run the synchronous poster generation in a thread pool to avoid blocking the event loop
    await asyncio.to_thread(_generate_poster_sync, job_id, request)

@app.get("/api/job/{job_id}", response_model=JobStatus)
async def get_job_status(job_id: str):
    """Get the status of a poster generation job."""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    job = jobs[job_id]
    return JobStatus(
        job_id=job_id,
        status=job["status"],
        message=job["message"],
        file_url=job.get("file_url"),
        progress=job["progress"]
    )

@app.get("/api/download/{job_id}")
async def download_poster(job_id: str, download: bool = True, background_tasks: BackgroundTasks = None):
    """Download or view the generated poster."""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    job = jobs[job_id]
    if job["status"] != "completed":
        raise HTTPException(status_code=400, detail="Poster not ready yet")

    file_path = job.get("file_path")
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Poster file not found")

    # Get filename from request data
    request_data = job.get("request", {})
    city_slug = request_data.get("city", "poster").lower().replace(' ', '_')
    theme = request_data.get("theme", "default")
    download_filename = f"{city_slug}_{theme}_poster.png"

    # Schedule cleanup in background after serving
    if background_tasks:
        background_tasks.add_task(cleanup_old_files)

    # Prepare headers based on download parameter
    headers = {"Cache-Control": "no-cache"}
    if download:
        headers["Content-Disposition"] = f'attachment; filename="{download_filename}"'
    else:
        headers["Content-Disposition"] = f'inline; filename="{download_filename}"'

    # Stream the file
    return FileResponse(
        path=file_path,
        media_type="image/png",
        filename=download_filename,
        headers=headers
    )

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.on_event("startup")
async def startup_event():
    """Run cleanup on startup and schedule periodic cleanup."""
    print("🚀 Starting Map Poster Generator API")
    cleanup_old_files()

    # Schedule periodic cleanup every hour
    async def periodic_cleanup():
        while True:
            await asyncio.sleep(3600)  # 1 hour
            cleanup_old_files()

    asyncio.create_task(periodic_cleanup())

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    print("🛑 Shutting down Map Poster Generator API")
    # Optional: Remove temp directory on shutdown
    # shutil.rmtree(TEMP_POSTERS_DIR, ignore_errors=True)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
