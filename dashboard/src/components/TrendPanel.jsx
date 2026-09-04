import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'

function formatAxis(val) {
  if (val === null || val === undefined) return '0'
  const numVal = Number(val)
  if (isNaN(numVal)) return String(val)
  if (numVal >= 1e6) return (numVal / 1e6).toFixed(1) + 'M'
  if (numVal >= 1e3) return (numVal / 1e3).toFixed(0) + 'K'
  return numVal.toLocaleString()
}

function CustomTooltip({ active, payload, label, tab, cat1, cat2, color1, color2, areaLabel }) {
  if (!active || !payload || !payload.length) return null
  const data = payload[0]?.payload
  if (!data) return null

  const formatDelta = (delta, pct) => {
    if (delta === null || delta === undefined || pct === null || pct === undefined) {
      return <span className="text-gray-400 text-[11px]">—</span>
    }
    const numDelta = Number(delta)
    const numPct = Number(pct)
    if (isNaN(numDelta) || isNaN(numPct)) {
      return <span className="text-gray-400 text-[11px]">—</span>
    }
    const isUp = numDelta > 0
    const isZero = numDelta === 0
    const sign = isUp ? '+' : ''
    const arrow = isUp ? '▲' : isZero ? '●' : '▼'
    const colorClass = isUp
      ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
      : isZero
      ? 'text-gray-600 bg-gray-50 border border-gray-200'
      : 'text-rose-700 bg-rose-50 border border-rose-200'
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold font-mono ${colorClass}`}>
        <span>{arrow}</span>
        <span>{sign}{Math.abs(numDelta) >= 1e6 ? `${(numDelta / 1e6).toFixed(2)}M` : numDelta.toLocaleString()}</span>
        <span className="opacity-85 font-sans font-bold">({sign}{numPct.toFixed(2)}%)</span>
      </span>
    )
  }

  const periodType = tab === 'yearly' ? 'YoY' : 'MoM'

  return (
    <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl p-3.5 shadow-xl text-xs space-y-2.5 min-w-[270px]">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <div>
          <p className="font-bold text-gray-900 text-sm leading-tight">{data.fullLabel || label}</p>
          <p className="text-[11px] text-gray-500 font-medium">{areaLabel}</p>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
          {periodType} Change
        </span>
      </div>

      <div className="space-y-2 pt-0.5">
        {/* Total Row */}
        <div className="flex items-center justify-between gap-3 bg-gray-50/70 p-1.5 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-900 shrink-0" />
            <span className="text-gray-800 font-semibold">Total</span>
          </div>
          <div className="flex items-center gap-2 text-right">
            <span className="font-bold text-gray-900">{data.total.toLocaleString()}</span>
            {formatDelta(data.totalDelta, data.totalPctChange)}
          </div>
        </div>

        {/* Cat 2 (MA / MAPD) */}
        <div className="flex items-center justify-between gap-3 p-1.5 rounded-lg hover:bg-gray-50/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color2 }} />
            <span className="text-gray-700 font-medium">{cat2}</span>
          </div>
          <div className="flex items-center gap-2 text-right">
            <span className="font-bold text-gray-900">{data.cat2.toLocaleString()}</span>
            {formatDelta(data.cat2Delta, data.cat2PctChange)}
          </div>
        </div>

        {/* Cat 1 (FFS / PDP) */}
        <div className="flex items-center justify-between gap-3 p-1.5 rounded-lg hover:bg-gray-50/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color1 }} />
            <span className="text-gray-700 font-medium">{cat1}</span>
          </div>
          <div className="flex items-center gap-2 text-right">
            <span className="font-bold text-gray-900">{data.cat1.toLocaleString()}</span>
            {formatDelta(data.cat1Delta, data.cat1PctChange)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TrendPanel({ view, yearlyTrend, monthlyTrend, selectedState, selectedCounty, trendLabel, loading }) {
  const [tab, setTab] = useState('yearly')
  const isMedical = view === 'medical'
  const cat1 = isMedical ? 'FFS' : 'PDP'
  const cat2 = isMedical ? 'MA' : 'MAPD'
  const color1 = '#ef4444'
  const color2 = '#0ea5e9'
  const areaLabel = trendLabel || selectedState || 'National'

  const rawData = tab === 'yearly' ? yearlyTrend : monthlyTrend?.slice().reverse()
  const chartData = rawData?.map((d, i, arr) => {
    const prev = i > 0 ? arr[i - 1] : null
    const total = Number(d.TOTAL) || 0
    const prevTotal = prev ? (Number(prev.TOTAL) || 0) : null
    const totalDelta = prevTotal !== null ? total - prevTotal : null
    const totalPctChange = (prevTotal && prevTotal > 0) ? (totalDelta / prevTotal) * 100 : null

    const c1 = Number(d[cat1]) || 0
    const prevC1 = prev ? (Number(prev[cat1]) || 0) : null
    const cat1Delta = prevC1 !== null ? c1 - prevC1 : null
    const cat1PctChange = (prevC1 && prevC1 > 0) ? (cat1Delta / prevC1) * 100 : null

    const c2 = Number(d[cat2]) || 0
    const prevC2 = prev ? (Number(prev[cat2]) || 0) : null
    const cat2Delta = prevC2 !== null ? c2 - prevC2 : null
    const cat2PctChange = (prevC2 && prevC2 > 0) ? (cat2Delta / prevC2) * 100 : null

    return {
      label: tab === 'yearly' ? d.YEAR : `${d.MONTH?.slice(0, 3)} ${d.YEAR?.slice(-2)}`,
      fullLabel: tab === 'yearly' ? `Year ${d.YEAR}` : `${d.MONTH} ${d.YEAR}`,
      total,
      totalDelta,
      totalPctChange,
      cat1: c1,
      cat1Delta,
      cat1PctChange,
      cat2: c2,
      cat2Delta,
      cat2PctChange,
      pct1: total ? Math.round((c1 / total) * 100) : 0,
      pct2: total ? Math.round((c2 / total) * 100) : 0
    }
  }) || []

  // Grid data for tables
  const yearlyGridData = yearlyTrend?.map(d => ({
    year: d.YEAR,
    total: Number(d.TOTAL) || 0,
    c1: Number(d[cat1]) || 0,
    c2: Number(d[cat2]) || 0,
    pct1: Number(d.TOTAL) ? Math.round((Number(d[cat1]) / Number(d.TOTAL)) * 100) : 0,
    pct2: Number(d.TOTAL) ? Math.round((Number(d[cat2]) / Number(d.TOTAL)) * 100) : 0
  })) || []

  const monthlyGridData = monthlyTrend?.slice().reverse().map(d => ({
    year: d.YEAR,
    month: d.MONTH,
    total: Number(d.TOTAL) || 0,
    c1: Number(d[cat1]) || 0,
    c2: Number(d[cat2]) || 0,
    pct1: Number(d.TOTAL) ? Math.round((Number(d[cat1]) / Number(d.TOTAL)) * 100) : 0,
    pct2: Number(d.TOTAL) ? Math.round((Number(d[cat2]) / Number(d.TOTAL)) * 100) : 0
  })) || []

  // Dynamic YAxis domain for monthly trend to show clear trajectory curvature
  const yDomain = tab === 'monthly' ? ['auto', 'auto'] : [0, 'auto']

  return (
    <Card className="border border-gray-200">
      <CardHeader className="pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-gray-900">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Enrollment Trends · {areaLabel}
          </CardTitle>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setTab('yearly')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                tab === 'yearly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Yearly Trend
            </button>
            <button
              onClick={() => setTab('monthly')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                tab === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              12-Month Trend
            </button>
            {selectedCounty && (
              <button
                onClick={() => setTab('grid')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  tab === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Grid
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-b-xl">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-[3px] border-gray-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-xs text-gray-500">Loading county data...</p>
            </div>
          </div>
        )}
        {tab === 'grid' ? (
          <>
            {/* Yearly Grid */}
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">Enrollment Count Yearly Trend: {areaLabel}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-600">Year</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600">TOTAL</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600">{cat1}</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600">{cat2}</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600">{cat1} %</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600">{cat2} %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearlyGridData.map(r => (
                      <tr key={r.year} className="border-b border-gray-50">
                        <td className="py-1.5 px-3 text-gray-900">{r.year}</td>
                        <td className="text-right py-1.5 px-3 text-gray-700">{r.total.toLocaleString()}</td>
                        <td className="text-right py-1.5 px-3 text-gray-700">{r.c1.toLocaleString()}</td>
                        <td className="text-right py-1.5 px-3 text-gray-700">{r.c2.toLocaleString()}</td>
                        <td className="text-right py-1.5 px-3 text-gray-700">{r.pct1}%</td>
                        <td className="text-right py-1.5 px-3 text-gray-700">{r.pct2}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Monthly Grid */}
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">Enrollment Count 12-Month Trend: {areaLabel}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-600">Year</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600">Month</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600">TOTAL</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600">{cat1}</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600">{cat2}</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600">{cat1} %</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600">{cat2} %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyGridData.map(r => (
                      <tr key={`${r.year}-${r.month}`} className="border-b border-gray-50">
                        <td className="py-1.5 px-3 text-gray-900">{r.year}</td>
                        <td className="py-1.5 px-3 text-gray-700">{r.month}</td>
                        <td className="text-right py-1.5 px-3 text-gray-700">{r.total.toLocaleString()}</td>
                        <td className="text-right py-1.5 px-3 text-gray-700">{r.c1.toLocaleString()}</td>
                        <td className="text-right py-1.5 px-3 text-gray-700">{r.c2.toLocaleString()}</td>
                        <td className="text-right py-1.5 px-3 text-gray-700">{r.pct1}%</td>
                        <td className="text-right py-1.5 px-3 text-gray-700">{r.pct2}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Line Chart */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Enrollment Count</p>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#737373' }} axisLine={{ stroke: '#d4d4d4' }} tickLine={false} />
                  <YAxis domain={yDomain} tick={{ fontSize: 11, fill: '#737373' }} tickFormatter={formatAxis} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={
                      <CustomTooltip
                        tab={tab}
                        cat1={cat1}
                        cat2={cat2}
                        color1={color1}
                        color2={color2}
                        areaLabel={areaLabel}
                      />
                    }
                  />
                  <Line type="monotone" dataKey="total" stroke="#171717" strokeWidth={2.5} dot={{ r: 3.5 }} activeDot={{ r: 5 }} name="total" />
                  <Line type="monotone" dataKey="cat1" stroke={color1} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 4.5 }} name="cat1" />
                  <Line type="monotone" dataKey="cat2" stroke={color2} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 4.5 }} name="cat2" />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-5 mt-2">
                <span className="flex items-center gap-1.5 text-xs text-gray-600"><span className="w-3 h-0.5 bg-gray-900 rounded" />Total</span>
                <span className="flex items-center gap-1.5 text-xs text-gray-600"><span className="w-3 h-0.5 rounded" style={{ background: color1 }} />{cat1}</span>
                <span className="flex items-center gap-1.5 text-xs text-gray-600"><span className="w-3 h-0.5 rounded" style={{ background: color2 }} />{cat2}</span>
              </div>
            </div>

            {/* Stacked Bar Chart */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Percent of Total</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#737373' }} axisLine={{ stroke: '#d4d4d4' }} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#737373' }} tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value) => [`${value}%`]} contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e5e5', borderRadius: '8px' }} />
                  <Bar dataKey="pct1" stackId="pct" fill={color1} radius={[0, 0, 0, 0]} name={cat1} />
                  <Bar dataKey="pct2" stackId="pct" fill={color2} radius={[4, 4, 0, 0]} name={cat2} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
