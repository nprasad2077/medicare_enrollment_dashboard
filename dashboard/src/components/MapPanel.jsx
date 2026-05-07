import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const STATE_GEO_URL = 'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json'

function getPenetrationColor(pct, view) {
  if (view === 'medical') {
    if (pct >= 67) return '#2d1b4e'
    if (pct >= 51) return '#6b3fa0'
    if (pct >= 34) return '#d64b8a'
    if (pct >= 17) return '#f4a261'
    return '#f7dc6f'
  }
  if (pct >= 79) return '#1a3a5c'
  if (pct >= 60) return '#a8d8ea'
  if (pct >= 40) return '#2d8f6f'
  if (pct >= 21) return '#7dcea0'
  return '#f7dc6f'
}

function getLegendItems(view) {
  if (view === 'medical') {
    return [
      { color: '#f7dc6f', label: '1% - 17%' },
      { color: '#f4a261', label: '17% - 34%' },
      { color: '#d64b8a', label: '34% - 51%' },
      { color: '#6b3fa0', label: '51% - 67%' },
      { color: '#2d1b4e', label: '67% - 86%' }
    ]
  }
  return [
    { color: '#f7dc6f', label: '2% - 21%' },
    { color: '#7dcea0', label: '21% - 40%' },
    { color: '#2d8f6f', label: '40% - 60%' },
    { color: '#a8d8ea', label: '60% - 79%' },
    { color: '#1a3a5c', label: '79% - 98%' }
  ]
}

export default function MapPanel({ view, stateData, mapTab, setMapTab, onStateClick, selectedState }) {
  const [geoData, setGeoData] = useState(null)

  useEffect(() => {
    fetch(STATE_GEO_URL).then(r => r.json()).then(setGeoData).catch(console.error)
  }, [])

  const isMedical = view === 'medical'
  const penetrationLabel = isMedical
    ? 'Medicare Advantage (MA) & Other Health Plans Penetration Rate'
    : 'Medicare Advantage Prescription Drug Plans (MAPD) Penetration Rate'
  const pctKey = isMedical ? 'MA' : 'MAPD'

  const stateMap = {}
  stateData?.forEach(s => { stateMap[s.name] = s })

  function style(feature) {
    const st = stateMap[feature.properties.name]
    const total = st ? Number(st.TOTAL) : 0
    const val = st ? Number(st[pctKey]) : 0
    const pct = total ? (val / total) * 100 : 0
    return {
      fillColor: getPenetrationColor(pct, view),
      weight: 1,
      opacity: 1,
      color: '#fff',
      fillOpacity: 0.8
    }
  }

  function onEachFeature(feature, layer) {
    const st = stateMap[feature.properties.name]
    if (st) {
      const total = Number(st.TOTAL)
      const val = Number(st[pctKey])
      const other = isMedical ? Number(st.FFS) : Number(st.PDP)
      const pct = total ? Math.round((val / total) * 100) : 0
      const otherPct = 100 - pct
      const otherLabel = isMedical ? 'FFS' : 'PDP'

      layer.bindTooltip(`
        <div class="tooltip-box"><table>
          <tr><td>State</td><td><b>${feature.properties.name}</b></td></tr>
          <tr><td>${pctKey} %</td><td>${pct}%</td></tr>
          <tr><td>${pctKey}</td><td>${val?.toLocaleString()}</td></tr>
          <tr><td>${otherLabel} %</td><td>${otherPct}%</td></tr>
          <tr><td>${otherLabel}</td><td>${other?.toLocaleString()}</td></tr>
          <tr><td>TOTAL</td><td>${total?.toLocaleString()}</td></tr>
        </table></div>
      `, { sticky: true })

      layer.on('click', () => onStateClick(st.state))
    }
  }

  return (
    <div className="map-panel">
      <div className="tab-bar" style={{ marginBottom: 8 }}>
        <button className={mapTab === 'all' ? 'active' : ''} onClick={() => setMapTab('all')}>All Areas</button>
        <button className={mapTab === 'counties' ? 'active' : ''} onClick={() => setMapTab('counties')}>
          {selectedState ? `${selectedState} Counties` : 'Counties'}
        </button>
      </div>
      <h3>{penetrationLabel}</h3>
      <div style={{ position: 'relative' }}>
        <MapContainer center={[39.8, -98.5]} zoom={4} className="map-container" scrollWheelZoom={true}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap, &copy; CARTO'
          />
          {geoData && <GeoJSON key={view} data={geoData} style={style} onEachFeature={onEachFeature} />}
        </MapContainer>
        <div className="penetration-legend">
          <h4>⊕ Penetration Rate</h4>
          <h4>{pctKey} %</h4>
          {getLegendItems(view).map(item => (
            <div className="legend-row" key={item.label}>
              <span className="legend-color" style={{ background: item.color }}></span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="map-note">*Map includes data for all 50 United States plus Washington D.C. Click to view state level information. See "Grid" for additional US territories.</p>
    </div>
  )
}
