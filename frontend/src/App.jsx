import { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Slider } from './components/ui/slider'
import { Button } from './components/ui/button'
import { Checkbox } from './components/ui/checkbox'
import { Separator } from './components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import { ScrollArea } from "./components/ui/scroll-area"
import { ThemeCard } from './components/ThemeCard'
import { ProgressTracker } from './components/ProgressTracker'
import { Map, Download, Settings2, Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react'

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
  const [width, setWidth] = useState(12)
  const [height, setHeight] = useState(16)
  const [dpi, setDpi] = useState(300)
  const [showWater, setShowWater] = useState(true)
  const [showParks, setShowParks] = useState(true)
  const [showBuildings, setShowBuildings] = useState(false)
  const [showRailways, setShowRailways] = useState(false)
  const [showAttribution, setShowAttribution] = useState(true)
  const [format, setFormat] = useState('png')
  const [aspectRatios, setAspectRatios] = useState([])
  const [formatOptions, setFormatOptions] = useState([])

  useEffect(() => {
    fetchThemes()
    fetchPresets()
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

  const fetchPresets = async () => {
    try {
      const response = await axios.get('/api/presets', { timeout: 10000 })
      setAspectRatios(response.data.aspect_ratios || [])
      setFormatOptions(response.data.format_options || [])
    } catch (error) {
      console.error('Error fetching presets:', error)
    }
  }

  const generatePoster = async (e) => {
    if (e) e.preventDefault()
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
        format,
        show_water: showWater,
        show_parks: showParks,
        show_buildings: showBuildings,
        show_railways: showRailways,
        show_attribution: showAttribution
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

  const downloadImage = async () => {
    if (!jobStatus || !jobId) return

    try {
      if (format === 'both' && jobStatus.file_paths) {
        const pngUrl = `/api/download/${jobId}?file_type=png`
        const pngLink = document.createElement('a')
        pngLink.href = pngUrl
        pngLink.download = `${city.toLowerCase()}_${theme}_poster.png`
        document.body.appendChild(pngLink)
        pngLink.click()
        document.body.removeChild(pngLink)

        setTimeout(() => {
          const svgUrl = `/api/download/${jobId}?file_type=svg`
          const svgLink = document.createElement('a')
          svgLink.href = svgUrl
          svgLink.download = `${city.toLowerCase()}_${theme}_poster.svg`
          document.body.appendChild(svgLink)
          svgLink.click()
          document.body.removeChild(svgLink)
        }, 500)
      } else {
        const extension = format === 'svg' ? 'svg' : 'png'
        const downloadUrl = `/api/download/${jobId}`
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = `${city.toLowerCase()}_${theme}_poster.${extension}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar - Controls */}
      <aside className="w-96 flex flex-col border-r border-border bg-card overflow-hidden shrink-0 shadow-xl z-10">
        <header className="p-6 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Map className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Map Poster</h1>
              <p className="text-xs text-muted-foreground">Minimalist City Art</p>
            </div>
          </div>
        </header>

        <Tabs defaultValue="essential" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-4 bg-muted/10 border-b border-border">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-muted">
              <TabsTrigger value="essential" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Essential
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                Advanced
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <div className="px-6 py-6 space-y-8">
              <TabsContent value="essential" className="mt-0 space-y-8 pb-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-semibold">City</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Venice"
                      className="bg-muted/50 border-none h-11 focus-visible:ring-1 focus-visible:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-semibold">Country</Label>
                    <Input
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. Italy"
                      className="bg-muted/50 border-none h-11 focus-visible:ring-1 focus-visible:ring-primary"
                    />
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-semibold">Radius</Label>
                      <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
                        {distance[0]}m
                      </span>
                    </div>
                    <Slider
                      value={distance}
                      onValueChange={setDistance}
                      min={4000}
                      max={30000}
                      step={1000}
                      className="py-2"
                    />
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">
                      4km (district) - 15km (downtown) - 30km (metro)
                    </p>
                  </div>
                </div>

                <div className="space-y-4 border-t border-border pt-6">
                  <div className="flex justify-between items-end">
                    <Label className="text-sm font-semibold">Theme</Label>
                    <span className="text-[10px] text-muted-foreground uppercase">{themes.length} Options</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
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
              </TabsContent>

              <TabsContent value="advanced" className="mt-0 space-y-8 pb-4">
                {/* Print Settings */}
                <div className="space-y-6">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Print Settings</Label>

                  {aspectRatios.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Predefined Sizes</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {aspectRatios.map((ratio) => (
                          <Button
                            key={ratio.name}
                            type="button"
                            variant={width === ratio.width && height === ratio.height ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setWidth(ratio.width)
                              setHeight(ratio.height)
                            }}
                            className="justify-start text-[11px] h-9 px-3"
                          >
                            <span className="mr-2 opacity-70">{ratio.icon}</span>
                            <span className="truncate">{ratio.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="width" className="text-[11px]">Width (in)</Label>
                      <Input
                        id="width"
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        className="bg-muted/50 border-none h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height" className="text-[11px]">Height (in)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="bg-muted/50 border-none h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dpi" className="text-[11px]">DPI</Label>
                      <select
                        id="dpi"
                        value={dpi}
                        onChange={(e) => setDpi(parseInt(e.target.value))}
                        className="flex h-10 w-full rounded-md border-none bg-muted/50 px-3 py-2 text-sm"
                      >
                        <option value="150">150</option>
                        <option value="300">300</option>
                        <option value="600">600</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Output Settings */}
                <div className="space-y-6 border-t border-border pt-6">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Output Format</Label>
                  <div className="grid gap-2">
                    {formatOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-start space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${format === option.value
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border bg-muted/30 hover:bg-muted/50"
                          }`}
                        onClick={() => setFormat(option.value)}
                      >
                        <div className={`mt-1 h-4 w-4 rounded-full border flex items-center justify-center ${format === option.value ? "border-primary" : "border-muted-foreground"}`}>
                          {format === option.value && <div className="h-2 w-2 rounded-full bg-primary" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold">{option.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{option.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Map Features */}
                <div className="space-y-6 border-t border-border pt-6">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Map Features</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="water" checked={showWater} onCheckedChange={setShowWater} />
                      <label htmlFor="water" className="text-xs font-medium cursor-pointer">Water</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="parks" checked={showParks} onCheckedChange={setShowParks} />
                      <label htmlFor="parks" className="text-xs font-medium cursor-pointer">Parks</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="buildings" checked={showBuildings} onCheckedChange={setShowBuildings} />
                      <label htmlFor="buildings" className="text-xs font-medium cursor-pointer">Buildings</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="railways" checked={showRailways} onCheckedChange={setShowRailways} />
                      <label htmlFor="railways" className="text-xs font-medium cursor-pointer">Railways</label>
                    </div>
                  </div>
                </div>

                {/* Attribution */}
                <div className="space-y-4 border-t border-border pt-6">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Attribution</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="attribution" checked={showAttribution} onCheckedChange={setShowAttribution} />
                    <label htmlFor="attribution" className="text-xs font-medium cursor-pointer">Show "powered by arun.im"</label>
                  </div>
                </div>
              </TabsContent>
            </div>
          </ScrollArea>

          <footer className="p-6 border-t border-border bg-card">
            <Button
              className="w-full h-12 text-sm font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={loading || !city || !country}
              onClick={generatePoster}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Poster...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Poster
                </>
              )}
            </Button>
          </footer>
        </Tabs>
      </aside>

      {/* Main Content - Preview */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-12 bg-muted/20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />

        {!jobStatus && !generatedImage && (
          <div className="text-center space-y-6 max-w-md animate-in fade-in zoom-in duration-500">
            <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center shadow-inner">
              <Map className="w-12 h-12 text-muted-foreground/30" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Ready to map?</h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Enter a city and country in the sidebar to create your custom minimalist map poster.
              </p>
            </div>
          </div>
        )}

        {jobStatus && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-full max-w-2xl animate-in slide-in-from-bottom-8 duration-700">
              {!generatedImage ? (
                <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-sm">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl">Building Your Art...</CardTitle>
                    <CardDescription>We're fetching data and rendering your custom map.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <ProgressTracker jobStatus={jobStatus} />
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-8 animate-in zoom-in duration-1000">
                  <div className="relative group mx-auto max-h-[70vh] flex justify-center">
                    <img
                      src={generatedImage}
                      alt="Generated poster"
                      className="rounded-lg shadow-2xl border-8 border-white object-contain"
                      style={{ height: '70vh' }}
                    />
                    <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-black/10 pointer-events-none" />
                  </div>

                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={downloadImage}
                      className="h-12 px-8 font-bold shadow-lg"
                      size="lg"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download High-Res
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setGeneratedImage(null);
                        setJobStatus(null);
                      }}
                      className="h-12 px-8 font-bold"
                      size="lg"
                    >
                      Create New
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
