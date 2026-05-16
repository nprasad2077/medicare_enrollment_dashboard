import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Map } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

const STATE_GEO_URL = 'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json'

function getPenetrationColor(pct, view) {
  if (view === 'medical') {
    if (pct >= 67) return '#6d28d9'
    if (pct >= 51) return '#8b5cf6'
    if (pct >= 34) return '#a78bfa'
    if (pct >= 17) return '#c4b5fd'
    return '#ede9fe'
  }
  if (pct >= 79) return '#0369a1'
  if (pct >= 60) return '#0ea5e9'
  if (pct >= 40) return '#38bdf8'
  if (pct >= 21) return '#7dd3fc'
  return '#e0f2fe'
}

function getLegendItems(view) {
  if (view === 'medical') {
    return [
      { color: '#ede9fe', label: '< 17%' },
      { color: '#c4b5fd', label: '17–34%' },
      { color: '#a78bfa', label: '34–51%' },
      { color: '#8b5cf6', label: '51–67%' },
      { color: '#6d28d9', label: '> 67%' }
    ]
  }
  return [
    { color: '#e0f2fe', label: '< 21%' },
    { color: '#7dd3fc', label: '21–40%' },
    { color: '#38bdf8', label: '40–60%' },
    { color: '#0ea5e9', label: '60–79%' },
    { color: '#0369a1', label: '> 79%' }
  ]
}

export default function MapPanel({ view, stateData, selectedState, onStateClick }) {
  const [geoData, setGeoData] = useState(null)

  useEffect(() => {
    fetch(STATE_GEO_URL).then(r => r.json()).then(setGeoData).catch(console.error)
  }, [])

  const isMedical = view === 'medical'
  const pctKey = isMedical ? 'MA' : 'MAPD'

  const stateMap = {}
  stateData?.forEach(s => { stateMap[s.name] = s })

  function style(feature) {
    const st = stateMap[feature.properties.name]
    const total = st ? Number(st.TOTAL) : 0
    const val = st ? Number(st[pctKey]) : 0
    const pct = total ? (val / total) * 100 : 0
    const isSelected = st && st.state === selectedState
    return {
      fillColor: getPenetrationColor(pct, view),
      weight: isSelected ? 3 : 1,
      opacity: 1,
      color: isSelected ? '#171717' : '#ffffff',
      fillOpacity: 0.85
    }
  }

  function onEachFeature(feature, layer) {
    const st = stateMap[feature.properties.name]
    if (st) {
      const total = Number(st.TOTAL)
      const val = Number(st[pctKey])
      const pct = total ? Math.round((val / total) * 100) : 0
      layer.bindTooltip(
        `<div style="font-family:Inter,sans-serif;font-size:12px;padding:4px 8px">
          <strong>${feature.properties.name}</strong><br/>
          ${pctKey}: ${pct}% · ${val?.toLocaleString()}<br/>
          Total: ${total?.toLocaleString()}
        </div>`,
        { sticky: true }
      )
      layer.on('click', () => onStateClick(st.state))
    }
  }

  return (
    <Card className="border border-gray-200">
      <CardHeader className="pb-4 border-b border-gray-100">
        <CardTitle className="flex items-center gap-3 text-gray-900">
          <Map className="w-5 h-5 text-emerald-600" />
          {isMedical ? 'Medicare Advantage Penetration by State' : 'MAPD Penetration by State'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="relative">
          <MapContainer center={[39.8, -98.5]} zoom={4} style={{ height: 380, width: '100%', borderRadius: 8 }} scrollWheelZoom={true}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
              attribution='&copy; OpenStreetMap, &copy; CARTO'
            />
            {geoData && <GeoJSON key={`${view}-${selectedState}`} data={geoData} style={style} onEachFeature={onEachFeature} />}
          </MapContainer>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-sm z-[500]">
            <p className="text-xs font-medium text-gray-700 mb-2">{pctKey} Penetration</p>
            <div className="space-y-1">
              {getLegendItems(view).map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm" style={{ background: item.color }} />
                  <span className="text-xs text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">Click a state to view detailed breakdown →</p>
      </CardContent>
    </Card>
  )
}
