import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { MapPin, X, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function formatNum(n) {
  if (!n) return '0'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K'
  return n.toLocaleString()
}

export default function StateDetail({ view, state, stateData, countyData, countyLoading, selectedCounty, onCountyClick, yearlyTrend, onClose }) {
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
      .map(s => ({ name: s.state, total: Number(s.TOTAL) || 0 }))
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
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topStates} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 10, fill: '#737373' }} tickFormatter={v => formatNum(v)} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#525252' }} width={35} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => [Number(value).toLocaleString(), 'Total Enrollment']} contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e5e5', borderRadius: '8px' }} />
              <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                {topStates.map((entry, i) => (
                  <Cell key={entry.name} fill={i === 0 ? '#0ea5e9' : i < 3 ? '#38bdf8' : '#bae6fd'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 mt-3">Select a state on the map for detailed breakdown</p>
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
                  <th className="text-left py-2 px-3 font-medium text-gray-600">County</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">TOTAL</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">{cat2}</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">{cat1}</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">{cat2}%</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">{cat1}%</th>
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
                        <span className="text-xs text-gray-500">Loading counties...</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No county data available</span>
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
