import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Map } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import usStatesGeo from '../data/us-states.json'

const CARTO_KEY = import.meta.env.VITE_CARTO_API_KEY || 'cb1_2w4o_1_6bd6c688e65b4ef542c5d58a';
const TILE_URL = `https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`;

// State FIPS lookup for filtering county GeoJSON
const STATE_FIPS = {
  AL:'01',AK:'02',AZ:'04',AR:'05',CA:'06',CO:'08',CT:'09',DE:'10',DC:'11',FL:'12',
  GA:'13',HI:'15',ID:'16',IL:'17',IN:'18',IA:'19',KS:'20',KY:'21',LA:'22',ME:'23',
  MD:'24',MA:'25',MI:'26',MN:'27',MS:'28',MO:'29',MT:'30',NE:'31',NV:'32',NH:'33',
  NJ:'34',NM:'35',NY:'36',NC:'37',ND:'38',OH:'39',OK:'40',OR:'41',PA:'42',RI:'44',
  SC:'45',SD:'46',TN:'47',TX:'48',UT:'49',VT:'50',VA:'51',WA:'53',WV:'54',WI:'55',
  WY:'56',AS:'60',GU:'66',MP:'69',PR:'72',VI:'78'
}

const countyLoaders = import.meta.glob('../data/counties/*.json');

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

// Component to handle map zoom/pan when state is selected or deselected
function ZoomToCounty({ countyGeoData, selectedState }) {
  const map = useMap()
  useEffect(() => {
    if (!selectedState) {
      map.setView([39.8, -98.5], 4)
      return
    }
    if (countyGeoData && countyGeoData.features && countyGeoData.features.length > 0) {
      const layer = L.geoJSON(countyGeoData)
      const bounds = layer.getBounds()
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] })
      }
    }
  }, [selectedState, countyGeoData, map])
  return null
}

export default function MapPanel({ view, stateData, countyData, selectedState, selectedCounty, onStateClick, onCountyClick }) {
  const [countyGeo, setCountyGeo] = useState(null)

  // Load state county GeoJSON locally when a state is selected
  useEffect(() => {
    if (!selectedState) {
      setCountyGeo(null)
      return
    }
    const fips = STATE_FIPS[selectedState]
    if (!fips) {
      setCountyGeo(null)
      return
    }
    const loader = countyLoaders[`../data/counties/${fips}.json`]
    if (loader) {
      loader().then(mod => {
        setCountyGeo(mod.default || mod)
      }).catch(console.error)
    } else {
      setCountyGeo(null)
    }
  }, [selectedState])

  const isMedical = view === 'medical'
  const pctKey = isMedical ? 'MA' : 'MAPD'
  const pctKey2 = isMedical ? 'FFS' : 'PDP'

  const stateMap = {}
  stateData?.forEach(s => { stateMap[s.name] = s })

  const countyGeoFiltered = countyGeo

  // Build county data lookup by FIPS
  const countyMap = {}
  countyData?.forEach(c => { countyMap[c.fips] = c })

  function stateStyle(feature) {
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

  function onEachState(feature, layer) {
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

  function countyStyle(feature) {
    const fips = feature.id || feature.properties.GEO_ID?.slice(-5)
    const c = countyMap[fips]
    const total = c ? Number(c.TOTAL) : 0
    const val = c ? Number(c[pctKey]) : 0
    const pct = total ? (val / total) * 100 : 0
    const isSelected = c && c.county === selectedCounty
    return {
      fillColor: getPenetrationColor(pct, view),
      weight: isSelected ? 3 : 1,
      opacity: 1,
      color: isSelected ? '#171717' : '#ffffff',
      fillOpacity: 0.85
    }
  }

  function onEachCounty(feature, layer) {
    const fips = feature.id || feature.properties.GEO_ID?.slice(-5)
    const c = countyMap[fips]
    if (c) {
      const total = Number(c.TOTAL)
      const v1 = Number(c[pctKey])
      const v2 = Number(c[pctKey2])
      const pct1 = total ? Math.round((v1 / total) * 100) : 0
      const pct2 = total ? Math.round((v2 / total) * 100) : 0
      const stateName = stateData?.find(s => s.state === selectedState)?.name || selectedState
      layer.bindTooltip(
        `<div style="font-family:Inter,sans-serif;font-size:12px;padding:4px 8px">
          <strong>${c.county}</strong><br/>
          State: ${stateName}<br/>
          ${pctKey}: ${pct1}% · ${v1.toLocaleString()}<br/>
          ${pctKey2}: ${pct2}% · ${v2.toLocaleString()}<br/>
          TOTAL: ${total.toLocaleString()}
        </div>`,
        { sticky: true }
      )
      layer.on('click', () => onCountyClick(c.county))
    }
  }

  const showCountyMap = selectedState && countyGeoFiltered && countyGeoFiltered.features.length > 0

  const stateName = stateData?.find(s => s.state === selectedState)?.name
  const mapTitle = showCountyMap
    ? `${isMedical ? 'Medicare Advantage (MA) & Other Health Plans' : 'Medicare Advantage Prescription Drug Plans (MAPD)'} Penetration Rate`
    : (isMedical ? 'Medicare Advantage Penetration by State' : 'MAPD Penetration by State')

  return (
    <Card className="border border-gray-200">
      <CardHeader className="pb-4 border-b border-gray-100">
        <CardTitle className="flex items-center gap-3 text-gray-900">
          <Map className="w-5 h-5 text-emerald-600" />
          {showCountyMap ? stateName : mapTitle}
        </CardTitle>
        {showCountyMap && (
          <p className="text-xs text-gray-500 mt-1">{mapTitle}</p>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        <div className="relative">
          <MapContainer center={[39.8, -98.5]} zoom={4} style={{ height: 440, width: '100%', borderRadius: 8 }} scrollWheelZoom={true}>
            <TileLayer
              url={TILE_URL}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>'
            />
            {showCountyMap ? (
              <>
                <ZoomToCounty countyGeoData={countyGeoFiltered} selectedState={selectedState} />
                <GeoJSON
                  key={`county-${view}-${selectedState}-${selectedCounty}-${countyData?.length}`}
                  data={countyGeoFiltered}
                  style={countyStyle}
                  onEachFeature={onEachCounty}
                />
              </>
            ) : (
              <>
                <ZoomToCounty countyGeoData={null} selectedState={null} />
                <GeoJSON
                  key={`state-${view}-${selectedState}-${stateData?.length}`}
                  data={usStatesGeo}
                  style={stateStyle}
                  onEachFeature={onEachState}
                />
              </>
            )}
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
        <p className="text-xs text-gray-400 mt-3">
          {showCountyMap ? 'Hover over a county for details. Click to view trends.' : 'Click a state to view detailed breakdown →'}
        </p>
      </CardContent>
    </Card>
  )
}
