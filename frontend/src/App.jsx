import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

// Configure axios defaults
axios.defaults.timeout = 30000 // 30 seconds default timeout

function App() {
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [theme, setTheme] = useState('feature_based')
  const [distance, setDistance] = useState(29000)
  const [themes, setThemes] = useState([])
  const [loading, setLoading] = useState(false)
  const [jobId, setJobId] = useState(null)
  const [jobStatus, setJobStatus] = useState(null)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [selectedThemeInfo, setSelectedThemeInfo] = useState(null)

  // Advanced options
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [width, setWidth] = useState(12)
  const [height, setHeight] = useState(16)
  const [dpi, setDpi] = useState(300)
  const [showWater, setShowWater] = useState(true)
  const [showParks, setShowParks] = useState(true)
  const [showBuildings, setShowBuildings] = useState(false)
  const [showRailways, setShowRailways] = useState(false)
  const [presets, setPresets] = useState(null)

  // Fetch available themes and presets on mount
  useEffect(() => {
    fetchThemes()
    fetchPresets()
  }, [])

  // Poll job status when we have a job ID
  useEffect(() => {
    if (jobId && jobStatus?.status !== 'completed' && jobStatus?.status !== 'failed') {
      const interval = setInterval(() => {
        checkJobStatus(jobId)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [jobId, jobStatus])

  // Update selected theme info when theme changes
  useEffect(() => {
    const themeInfo = themes.find(t => t.name === theme)
    setSelectedThemeInfo(themeInfo)
  }, [theme, themes])

  const fetchThemes = async () => {
    try {
      const response = await axios.get('/api/themes', {
        timeout: 10000 // 10 second timeout
      })
      setThemes(response.data)
    } catch (error) {
      console.error('Error fetching themes:', error)
      // Set a default theme if fetch fails
      setThemes([{
        name: 'feature_based',
        display_name: 'Feature-Based Shading',
        description: 'Classic black & white with road hierarchy',
        colors: {
          bg: '#FFFFFF',
          text: '#000000',
          water: '#C0C0C0',
          parks: '#F0F0F0',
          road_motorway: '#0A0A0A',
          road_primary: '#1A1A1A'
        }
      }])
    }
  }

  const fetchPresets = async () => {
    try {
      const response = await axios.get('/api/presets', {
        timeout: 10000
      })
      setPresets(response.data)
    } catch (error) {
      console.error('Error fetching presets:', error)
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
        distance: parseInt(distance),
        width: parseInt(width),
        height: parseInt(height),
        dpi: parseInt(dpi),
        show_water: showWater,
        show_parks: showParks,
        show_buildings: showBuildings,
        show_railways: showRailways
      }, {
        timeout: 30000 // 30 second timeout for initial request
      })
      setJobId(response.data.job_id)
      setJobStatus(response.data)
    } catch (error) {
      console.error('Error generating poster:', error)
      const errorMsg = error.response?.data?.detail || error.message || 'Error generating poster'
      alert(errorMsg)
      setLoading(false)
    }
  }

  const checkJobStatus = async (id) => {
    try {
      const response = await axios.get(`/api/job/${id}`, {
        timeout: 10000 // 10 second timeout for status checks
      })
      setJobStatus(response.data)

      if (response.data.status === 'completed') {
        // file_url is /api/download/{job_id}
        // For preview, use ?download=false, for download use ?download=true
        const downloadUrl = response.data.file_url
        setGeneratedImage(downloadUrl + '?download=false')
        setLoading(false)
      } else if (response.data.status === 'failed') {
        alert('Poster generation failed: ' + response.data.message)
        setLoading(false)
        setJobId(null)
      }
    } catch (error) {
      console.error('Error checking job status:', error)
      // Don't alert on polling errors, just log them
    }
  }

  const downloadImage = () => {
    if (generatedImage) {
      // Replace ?download=false with ?download=true for actual download
      const downloadUrl = generatedImage.replace('?download=false', '?download=true')
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${city.toLowerCase()}_${theme}_poster.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="App">
      <header className="header">
        <h1>🗺️ Map Poster Generator</h1>
        <p>Create beautiful, minimalist map posters for any city in the world</p>
      </header>

      <div className="container">
        <div className="form-section">
          <form onSubmit={generatePoster}>
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., New York"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g., USA"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="theme">Theme</label>
              <select
                id="theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                {themes.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.display_name}
                  </option>
                ))}
              </select>
              {selectedThemeInfo && (
                <p className="theme-description">{selectedThemeInfo.description}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="distance">
                Map Radius: {(distance / 1000).toFixed(1)} km
              </label>
              <input
                type="range"
                id="distance"
                min="4000"
                max="30000"
                step="1000"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
              />
              <div className="distance-guide">
                <small>Small (4-6km) • Medium (8-12km) • Large (15-30km)</small>
              </div>
            </div>

            {/* Advanced Options Toggle */}
            <div className="advanced-toggle">
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? '▼' : '▶'} Advanced Options
              </button>
            </div>

            {/* Advanced Options Panel */}
            {showAdvanced && (
              <div className="advanced-options">
                {/* Output Size */}
                <div className="advanced-section">
                  <h4>📐 Output Size</h4>
                  {presets && (
                    <div className="preset-buttons">
                      {presets.output_sizes.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={`preset-btn ${width === preset.width && height === preset.height ? 'active' : ''}`}
                          onClick={() => {
                            setWidth(preset.width)
                            setHeight(preset.height)
                          }}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="size-inputs">
                    <div className="input-inline">
                      <label>Width (in)</label>
                      <input
                        type="number"
                        min="6"
                        max="48"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                      />
                    </div>
                    <div className="input-inline">
                      <label>Height (in)</label>
                      <input
                        type="number"
                        min="6"
                        max="48"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* DPI Selection */}
                <div className="advanced-section">
                  <h4>🎯 Quality (DPI)</h4>
                  {presets && (
                    <div className="dpi-options">
                      {presets.dpi_options.map((option, idx) => (
                        <label key={idx} className="radio-option">
                          <input
                            type="radio"
                            name="dpi"
                            value={option.value}
                            checked={dpi === option.value}
                            onChange={() => setDpi(option.value)}
                          />
                          <span className="radio-label">
                            <strong>{option.name}</strong>
                            <small>{option.description}</small>
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Map Features */}
                <div className="advanced-section">
                  <h4>🗺️ Map Features</h4>
                  {presets && (
                    <div className="preset-buttons">
                      {presets.feature_sets.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="preset-btn"
                          onClick={() => {
                            setShowWater(preset.water)
                            setShowParks(preset.parks)
                            setShowBuildings(preset.buildings)
                            setShowRailways(preset.railways)
                          }}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="feature-toggles">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={showWater}
                        onChange={(e) => setShowWater(e.target.checked)}
                      />
                      <span>Water Bodies</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={showParks}
                        onChange={(e) => setShowParks(e.target.checked)}
                      />
                      <span>Parks & Green Spaces</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={showBuildings}
                        onChange={(e) => setShowBuildings(e.target.checked)}
                      />
                      <span>Buildings (slower)</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={showRailways}
                        onChange={(e) => setShowRailways(e.target.checked)}
                      />
                      <span>Railways</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {selectedThemeInfo && (
              <div className="theme-preview">
                <h3>Theme Colors</h3>
                <div className="color-palette">
                  <div className="color-item">
                    <div className="color-box" style={{ backgroundColor: selectedThemeInfo.colors.bg }}></div>
                    <span>Background</span>
                  </div>
                  <div className="color-item">
                    <div className="color-box" style={{ backgroundColor: selectedThemeInfo.colors.text }}></div>
                    <span>Text</span>
                  </div>
                  <div className="color-item">
                    <div className="color-box" style={{ backgroundColor: selectedThemeInfo.colors.water }}></div>
                    <span>Water</span>
                  </div>
                  <div className="color-item">
                    <div className="color-box" style={{ backgroundColor: selectedThemeInfo.colors.parks }}></div>
                    <span>Parks</span>
                  </div>
                  <div className="color-item">
                    <div className="color-box" style={{ backgroundColor: selectedThemeInfo.colors.road_motorway }}></div>
                    <span>Motorway</span>
                  </div>
                  <div className="color-item">
                    <div className="color-box" style={{ backgroundColor: selectedThemeInfo.colors.road_primary }}></div>
                    <span>Primary</span>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="generate-btn">
              {loading ? 'Generating...' : 'Generate Poster'}
            </button>
          </form>

          {jobStatus && (
            <div className="status-section">
              <div className="status-message">
                <strong>Status:</strong> {jobStatus.status}
              </div>
              <div className="status-message">
                {jobStatus.message}
              </div>
              {jobStatus.status === 'processing' && (
                <>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${jobStatus.progress}%` }}
                    ></div>
                  </div>
                  <div className="status-note">
                    <small>⏱️ This may take 2-5 minutes depending on map size...</small>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="preview-section">
          {generatedImage ? (
            <div className="result">
              <h2>Your Poster</h2>
              <img
                src={generatedImage}
                alt="Generated map poster"
                className="generated-image"
              />
              <button onClick={downloadImage} className="download-btn">
                Download Poster
              </button>
            </div>
          ) : (
            <div className="placeholder">
              <div className="placeholder-content">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                  <rect x="20" y="20" width="80" height="80" rx="4" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"/>
                  <path d="M40 60 L50 50 L60 60 L70 45 L80 55" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <circle cx="45" cy="40" r="3" fill="currentColor"/>
                </svg>
                <p>Your generated poster will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="footer">
        <p>Powered by OpenStreetMap • Map data © OpenStreetMap contributors</p>
      </footer>
    </div>
  )
}

export default App
