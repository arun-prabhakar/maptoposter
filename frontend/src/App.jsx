import { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Slider } from './components/ui/slider'
import { Button } from './components/ui/button'
import { Checkbox } from './components/ui/checkbox'
import { Separator } from './components/ui/separator'
import { ThemeCard } from './components/ThemeCard'
import { ProgressTracker } from './components/ProgressTracker'
import { Map, Download, ChevronDown, ChevronUp } from 'lucide-react'

// Configure axios defaults
axios.defaults.timeout = 30000

function App() {
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [theme, setTheme] = useState('feature_based')
  const [distance, setDistance] = useState([15000])
  const [themes, setThemes] = useState([])
  const [loading, setLoading] = useState(false)
  const [jobId, setJobId] = useState(null)
  const [jobStatus, setJobStatus] = useState(null)
  const [generatedImage, setGeneratedImage] = useState(null)

  // Advanced options
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [width, setWidth] = useState(12)
  const [height, setHeight] = useState(16)
  const [dpi, setDpi] = useState(300)
  const [showWater, setShowWater] = useState(true)
  const [showParks, setShowParks] = useState(true)
  const [showBuildings, setShowBuildings] = useState(false)
  const [showRailways, setShowRailways] = useState(false)

  useEffect(() => {
    fetchThemes()
  }, [])

  useEffect(() => {
    if (jobId && jobStatus?.status !== 'completed' && jobStatus?.status !== 'failed') {
      const interval = setInterval(() => {
        checkJobStatus(jobId)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [jobId, jobStatus])

  const fetchThemes = async () => {
    try {
      const response = await axios.get('/api/themes', { timeout: 10000 })
      setThemes(response.data)
    } catch (error) {
      console.error('Error fetching themes:', error)
    }
  }

  const generatePoster = async (e) => {
    e.preventDefault()
    setLoading(true)
    setJobStatus(null)
    setGeneratedImage(null)

    try {
      const response = await axios.post('/api/generate', {
        city,
        country,
        theme,
        distance: distance[0],
        width,
        height,
        dpi,
        show_water: showWater,
        show_parks: showParks,
        show_buildings: showBuildings,
        show_railways: showRailways
      }, { timeout: 30000 })
      setJobId(response.data.job_id)
      setJobStatus(response.data)
    } catch (error) {
      console.error('Error generating poster:', error)
      alert(error.response?.data?.detail || error.message || 'Error generating poster')
      setLoading(false)
    }
  }

  const checkJobStatus = async (id) => {
    try {
      const response = await axios.get(`/api/job/${id}`, { timeout: 10000 })
      setJobStatus(response.data)

      if (response.data.status === 'completed') {
        setGeneratedImage(response.data.file_url + '?download=false')
        setLoading(false)
      } else if (response.data.status === 'failed') {
        alert('Poster generation failed: ' + response.data.message)
        setLoading(false)
        setJobId(null)
      }
    } catch (error) {
      console.error('Error checking job status:', error)
    }
  }

  const downloadImage = () => {
    if (generatedImage) {
      const downloadUrl = generatedImage.replace('?download=false', '?download=true')
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${city.toLowerCase()}_${theme}_poster.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const distanceKm = (distance[0] / 1000).toFixed(1)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Map className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Map Poster Generator</h1>
              <p className="text-sm text-muted-foreground">
                Create beautiful, minimalist map posters for any city
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Build Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Build a Poster</CardTitle>
                <CardDescription>
                  All current CLI options are supported
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={generatePoster} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Venice"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Italy"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Radius (meters)</Label>
                      <span className="text-sm font-medium">{distance[0]}</span>
                    </div>
                    <Slider
                      value={distance}
                      onValueChange={setDistance}
                      min={4000}
                      max={30000}
                      step={1000}
                      className="py-4"
                    />
                    <p className="text-xs text-muted-foreground">
                      4-6k for compact districts, 8-12k for downtown focus, 15-20k for big metros
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-base">Theme</Label>
                      <span className="text-xs text-muted-foreground">
                        Scroll to explore palettes
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                      {themes.map((t) => (
                        <ThemeCard
                          key={t.name}
                          theme={t}
                          selected={theme === t.name}
                          onClick={() => setTheme(t.name)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <span className="font-medium">Advanced Options</span>
                      {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showAdvanced && (
                      <div className="mt-4 space-y-4 p-4 border border-border rounded-lg">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="width">Width (in)</Label>
                            <Input
                              id="width"
                              type="number"
                              min="6"
                              max="48"
                              value={width}
                              onChange={(e) => setWidth(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="height">Height (in)</Label>
                            <Input
                              id="height"
                              type="number"
                              min="6"
                              max="48"
                              value={height}
                              onChange={(e) => setHeight(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="dpi">DPI</Label>
                            <select
                              id="dpi"
                              value={dpi}
                              onChange={(e) => setDpi(parseInt(e.target.value))}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            >
                              <option value="150">150</option>
                              <option value="300">300</option>
                              <option value="600">600</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label>Map Features</Label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="water"
                                checked={showWater}
                                onCheckedChange={setShowWater}
                              />
                              <label htmlFor="water" className="text-sm cursor-pointer">
                                Water Bodies
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="parks"
                                checked={showParks}
                                onCheckedChange={setShowParks}
                              />
                              <label htmlFor="parks" className="text-sm cursor-pointer">
                                Parks & Green Spaces
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="buildings"
                                checked={showBuildings}
                                onCheckedChange={setShowBuildings}
                              />
                              <label htmlFor="buildings" className="text-sm cursor-pointer">
                                Buildings (slower)
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="railways"
                                checked={showRailways}
                                onCheckedChange={setShowRailways}
                              />
                              <label htmlFor="railways" className="text-sm cursor-pointer">
                                Railways
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base"
                    disabled={loading}
                  >
                    {loading ? 'Generating...' : 'Generate Poster'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Progress & Result */}
          <div className="space-y-6">
            <ProgressTracker jobStatus={jobStatus} />

            {generatedImage && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Poster</CardTitle>
                  <CardDescription>
                    Your poster is ready to download
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <img
                    src={generatedImage}
                    alt="Generated poster"
                    className="w-full rounded-lg border border-border"
                  />
                  <Button
                    onClick={downloadImage}
                    className="w-full"
                    size="lg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Poster
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-12">
        <div className="container mx-auto px-6 py-6">
          <p className="text-sm text-muted-foreground text-center">
            © OpenStreetMap contributors
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
