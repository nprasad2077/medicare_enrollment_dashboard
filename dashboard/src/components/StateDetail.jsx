import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { MapPin, X, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function formatNum(n) {
  if (n === null || n === undefined) return '0'
  const numVal = Number(n)
  if (isNaN(numVal)) return '0'
  if (numVal >= 1e6) return (numVal / 1e6).toFixed(1) + 'M'
  if (numVal >= 1e3) return (numVal / 1e3).toFixed(0) + 'K'
  return numVal.toLocaleString()
}

export default function StateDetail({ view, state, stateData, countyData, countyLoading, selectedCounty, onStateClick, onCountyClick, yearlyTrend, onClose }) {
  const isMedical = view === 'medical'
  const cat1 = isMedical ? 'MA' : 'MAPD'
  const cat2 = isMedical ? 'FFS' : 'PDP'

  const stateInfo = stateData?.find(s => s.state === state)

  const countyRows = useMemo(() => {
    if (!countyData) return []
    return countyData.map(row => {
      const t = Number(row.TOTAL) || 0
      const c1 = Number(row[cat1]) || 0
      const c2 = Number(row[cat2]) || 0
      return {
        county: row.county,
        total: t,
        val1: c1,
        val2: c2,
        pct1: t ? Math.round((c1 / t) * 100) : 0,
        pct2: t ? Math.round((c2 / t) * 100) : 0
      }
    }).sort((a, b) => a.county.localeCompare(b.county))
  }, [countyData, cat1, cat2])

  // Top states for the overview bar chart
  const topStates = useMemo(() => {
    if (!stateData) return []
    return stateData
      .map(s => ({ state: s.state, name: s.name || s.state, total: Number(s.TOTAL) || 0 }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
  }, [stateData])

  // No state selected - show overview
  if (!state) {
    return (
      <Card className="border border-gray-200">
        <CardHeader className="pb-4 border-b border-gray-100">
          <CardTitle className="flex items-center gap-3 text-gray-900">
            <BarChart3 className="w-5 h-5 text-amber-600" />
            Top States by Enrollment
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ResponsiveContainer width="100%" height={450}>
            <BarChart
              data={topStates}
              layout="vertical"
              margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
              onClick={(e) => {
                const clicked = e?.activePayload?.[0]?.payload
                if (clicked?.state && onStateClick) {
                  onStateClick(clicked.state)
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <XAxis type="number" tick={{ fontSize: 10, fill: '#737373' }} tickFormatter={v => formatNum(v)} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="state"
                tick={{ fontSize: 11, fill: '#374151', fontWeight: 600, cursor: 'pointer' }}
                width={35}
                axisLine={false}
                tickLine={false}
                onClick={(tickData) => {
                  if (tickData?.value && onStateClick) {
                    onStateClick(tickData.value)
                  }
                }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(238, 242, 255, 0.7)' }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null
                  const item = payload[0].payload
                  const rank = topStates.findIndex(s => s.state === item.state) + 1
                  return (
                    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-xs space-y-1.5 min-w-[200px]">
                      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-1.5">
                        <span className="font-bold text-gray-900 text-sm">{item.name}</span>
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 rounded border border-blue-200">
                          Rank #{rank}
                        </span>
                      </div>
                      <div className="text-gray-600 flex justify-between items-center">
                        <span>Total Enrollment:</span>
                        <span className="font-semibold text-gray-900">{item.total.toLocaleString()}</span>
                      </div>
                      <div className="text-blue-600 font-medium pt-1.5 border-t border-gray-100 flex items-center justify-between">
                        <span>Click to focus map</span>
                        <span className="text-sm">→</span>
                      </div>
                    </div>
                  )
                }}
              />
              <Bar
                dataKey="total"
                radius={[0, 4, 4, 0]}
                onClick={(data) => {
                  if (data?.state && onStateClick) {
                    onStateClick(data.state)
                  }
                }}
                className="cursor-pointer"
              >
                {topStates.map((entry, i) => (
                  <Cell
                    key={entry.state}
                    fill={i === 0 ? '#0ea5e9' : i < 3 ? '#38bdf8' : '#bae6fd'}
                    className="cursor-pointer transition-all duration-150 hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span>Click any state bar to zoom in & view county breakdown</span>
          </p>
        </CardContent>
      </Card>
    )
  }

  // State selected - show detail with county table
  const total = stateInfo ? Number(stateInfo.TOTAL) : 0
  const v1 = stateInfo ? Number(stateInfo[cat1]) : 0
  const v2 = stateInfo ? Number(stateInfo[cat2]) : 0
  const pct1 = total ? Math.round((v1 / total) * 100) : 0
  const pct2 = total ? Math.round((v2 / total) * 100) : 0

  return (
    <div className="space-y-0">
      {/* Dark blue state banner */}
      <div className="bg-[#1e3a5f] text-white rounded-t-xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap text-sm">
          <span className="font-bold">{stateInfo?.name?.toUpperCase() || state}</span>
          <span className="text-gray-300">({countyRows.length} counties)</span>
          <span className="text-gray-400">|</span>
          <span>TOTAL: {total.toLocaleString()}</span>
          <span className="text-gray-400">|</span>
          <span>{cat2}: {v2.toLocaleString()} ({pct2}% of total)</span>
          <span className="text-gray-400">|</span>
          <span>{cat1}: {v1.toLocaleString()} ({pct1}% of total)</span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/20 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* County data table */}
      <Card className="border border-gray-200 rounded-t-none">
        <CardHeader className="pb-2 border-b border-gray-100">
          <CardTitle className="flex items-center gap-3 text-gray-900 text-sm">
            <MapPin className="w-4 h-4 text-violet-600" />
            {stateInfo?.name || state}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 px-0">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">County</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-700">TOTAL</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-700">{cat2}</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-700">{cat1}</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-700">{cat2}%</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-700">{cat1}%</th>
                </tr>
              </thead>
              <tbody>
                {countyRows.map(row => (
                  <tr
                    key={row.county}
                    onClick={() => onCountyClick(row.county)}
                    className={`border-b border-gray-50 cursor-pointer transition-colors hover:bg-blue-50 ${
                      selectedCounty === row.county ? 'bg-blue-50 ring-2 ring-blue-400 ring-inset' : ''
                    }`}
                  >
                    <td className="py-2 px-3 font-medium text-gray-900">{row.county}</td>
                    <td className="text-right py-2 px-3 text-gray-700">{row.total.toLocaleString()}</td>
                    <td className="text-right py-2 px-3 text-gray-700">{row.val2.toLocaleString()}</td>
                    <td className="text-right py-2 px-3 text-gray-700">{row.val1.toLocaleString()}</td>
                    <td className="text-right py-2 px-3 text-gray-700">{row.pct2}%</td>
                    <td className="text-right py-2 px-3 text-gray-700">{row.pct1}%</td>
                  </tr>
                ))}
                {countyRows.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8">
                    {countyLoading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-[3px] border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                        <span className="text-xs text-gray-600">Loading counties...</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-600">No county data available</span>
                    )}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
