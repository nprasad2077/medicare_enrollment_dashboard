import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { MapPin, X, ChevronRight, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function formatNum(n) {
  if (!n) return '0'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K'
  return n.toLocaleString()
}

export default function StateDetail({ view, state, stateData, countyData, yearlyTrend, onClose }) {
  const isMedical = view === 'medical'
  const cat1 = isMedical ? 'MA' : 'MAPD'
  const cat2 = isMedical ? 'FFS' : 'PDP'
  const color1 = '#0ea5e9'
  const color2 = '#ef4444'

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
        pct1: t ? Math.round((c1 / t) * 100) : 0
      }
    }).sort((a, b) => b.total - a.total)
  }, [countyData, cat1, cat2])

  // Top states for the overview bar chart
  const topStates = useMemo(() => {
    if (!stateData) return []
    return stateData
      .map(s => ({ name: s.state, total: Number(s.TOTAL) || 0, pct: Number(s.TOTAL) ? Math.round((Number(s[cat1]) / Number(s.TOTAL)) * 100) : 0 }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
  }, [stateData, cat1])

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

  // State selected - show detail
  const total = stateInfo ? Number(stateInfo.TOTAL) : 0
  const v1 = stateInfo ? Number(stateInfo[cat1]) : 0
  const v2 = stateInfo ? Number(stateInfo[cat2]) : 0
  const pct1 = total ? Math.round((v1 / total) * 100) : 0

  return (
    <Card className="border border-gray-200">
      <CardHeader className="pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-gray-900">
            <MapPin className="w-5 h-5 text-violet-600" />
            {stateInfo?.name || state}
          </CardTitle>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-5">
        {/* State Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-lg font-semibold text-gray-900">{formatNum(total)}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-lg font-semibold text-blue-700">{formatNum(v1)}</p>
            <p className="text-xs text-gray-500">{cat1}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-lg font-semibold text-red-700">{formatNum(v2)}</p>
            <p className="text-xs text-gray-500">{cat2}</p>
          </div>
        </div>

        {/* Penetration bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>{cat1} Penetration</span>
            <span className="font-medium">{pct1}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct1}%` }} />
          </div>
        </div>

        {/* County List */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Counties ({countyRows.length})
          </p>
          <div className="max-h-[360px] overflow-y-auto space-y-1.5 pr-1">
            {countyRows.map(row => (
              <div key={row.county} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{row.county}</p>
                  <p className="text-xs text-gray-400">{formatNum(row.total)} total</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-blue-600">{row.pct1}%</p>
                    <p className="text-xs text-gray-400">{cat1}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                </div>
              </div>
            ))}
            {countyRows.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">Loading counties...</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
