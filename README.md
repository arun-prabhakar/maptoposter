# City Map Poster Generator

Generate beautiful, minimalist map posters for any city in the world.

<img src="posters/singapore_neon_cyberpunk_20260108_184503.png" width="250">
<img src="posters/dubai_midnight_blue_20260108_174920.png" width="250">

## ✨ Features

- **🎨 17 Stunning Themes**: From elegant `noir` to vibrant `neon_cyberpunk`
- **🖼️ Print-Ready Output**: High-resolution PNG & SVG export (up to 600 DPI)
- **🌍 Any City, Anywhere**: Powered by OpenStreetMap data
- **⚡ Modern Web UI**: Sleek, single-page interface with real-time progress
- **🐳 Docker Ready**: One-command deployment

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/arun-prabhakar/maptoposter.git
cd maptoposter

# Start the application
docker-compose up -d

# Open your browser
open http://localhost:3000
```

---

## 🌐 Web UI

The redesigned web interface provides a premium, single-page experience:

| Feature | Description |
|---------|-------------|
| **Essential Panel** | Quick access to City, Country, Radius, and Theme selection |
| **Advanced Panel** | Fine-tune print size, DPI, output format (PNG/SVG), and map features |
| **Live Preview** | See your generated poster instantly in the main view |
| **Real-time Progress** | Visual step-by-step progress tracker during generation |

### How to Use

1.  **Enter Location**: Type your city and country in the sidebar.
2.  **Select Theme**: Browse and pick a color palette from the list.
3.  **Adjust Radius**: Use the slider to set the map coverage.
4.  **Generate**: Click the button and watch the magic happen!
5.  **Download**: Get your high-resolution poster.

---

## 📸 Examples

| City | Theme | Poster |
|:----:|:-----:|:------:|
| San Francisco | sunset | <img src="posters/san_francisco_sunset_20260108_184122.png" width="200"> |
| Venice | blueprint | <img src="posters/venice_blueprint_20260108_165527.png" width="200"> |
| Tokyo | japanese_ink | <img src="posters/tokyo_japanese_ink_20260108_165830.png" width="200"> |
| Singapore | neon_cyberpunk | <img src="posters/singapore_neon_cyberpunk_20260108_184503.png" width="200"> |

---

## 🎨 Available Themes

| Theme | Description |
|-------|-------------|
| `feature_based` | Classic black & white with road hierarchy |
| `noir` | Pure black background, white roads |
| `midnight_blue` | Navy background with gold roads |
| `blueprint` | Architectural blueprint aesthetic |
| `neon_cyberpunk` | Dark with electric pink/cyan |
| `warm_beige` | Vintage sepia tones |
| `pastel_dream` | Soft muted pastels |
| `japanese_ink` | Minimalist ink wash style |
| `forest` | Deep greens and sage |
| `ocean` | Blues and teals for coastal cities |
| `terracotta` | Mediterranean warmth |
| `sunset` | Warm oranges and pinks |
| `autumn` | Seasonal burnt oranges and reds |
| `copper_patina` | Oxidized copper aesthetic |
| `monochrome_blue` | Single blue color family |
| `gradient_roads` | Smooth gradient shading |
| `contrast_zones` | High contrast urban density |

---

## 🛠️ Installation

### Option 1: Docker (Recommended)

```bash
docker-compose up -d
```

### Option 2: Local Development

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Option 3: CLI Only

```bash
pip install -r requirements.txt
python create_map_poster.py -c "Paris" -C "France" -t pastel_dream
```

---

## 📏 Distance Guide

| Distance | Best For |
|----------|----------|
| 4-6 km | Dense cities (Venice, Amsterdam center) |
| 8-12 km | Medium cities (Paris, Barcelona) |
| 15-20 km | Large metros (Tokyo, Mumbai) |

---

## ⚙️ API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/themes` | GET | List all available themes |
| `/api/presets` | GET | Get aspect ratios and format options |
| `/api/generate` | POST | Start poster generation |
| `/api/job/{id}` | GET | Check generation status |
| `/api/download/{id}` | GET | Download generated poster |

---

## 📂 Project Structure

```
maptoposter/
├── create_map_poster.py    # CLI script
├── docker-compose.yml      # Docker orchestration
├── backend/                # FastAPI server
│   ├── app.py
│   └── Dockerfile
├── frontend/               # React + Vite + shadcn/ui
│   ├── src/
│   │   ├── App.jsx         # Main application
│   │   ├── components/     # UI components
│   │   └── index.css       # Global styles
│   └── Dockerfile
├── themes/                 # Theme JSON files
├── fonts/                  # Roboto font files
└── posters/                # Generated posters
```

---

## 🎨 Adding Custom Themes

Create a JSON file in `themes/`:

```json
{
  "name": "My Theme",
  "description": "Custom theme description",
  "bg": "#FFFFFF",
  "text": "#000000",
  "water": "#C0C0C0",
  "parks": "#F0F0F0",
  "road_motorway": "#0A0A0A",
  "road_primary": "#1A1A1A",
  "road_secondary": "#2A2A2A",
  "road_tertiary": "#3A3A3A",
  "road_residential": "#4A4A4A"
}
```

---

## 🙏 Acknowledgements

Special thanks to [**@originalankur**](https://github.com/originalankur/maptoposter) for creating the original Python map poster generator that inspired this project.

---

## 📜 License

MIT License - feel free to use, modify, and distribute.