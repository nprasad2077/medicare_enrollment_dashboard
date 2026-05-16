import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp } from 'lucide-react'

function formatAxis(val) {
  if (val >= 1e6) return (val / 1e6).toFixed(0) + 'M'
  if (val >= 1e3) return (val / 1e3).toFixed(0) + 'K'
  return val
}

export default function TrendPanel({ view, yearlyTrend, monthlyTrend, selectedState }) {
  const [tab, setTab] = useState('yearly')
  const isMedical = view === 'medical'
  const cat1 = isMedical ? 'FFS' : 'PDP'
  const cat2 = isMedical ? 'MA' : 'MAPD'
  const color1 = '#ef4444'
  const color2 = '#0ea5e9'
  const areaLabel = selectedState || 'National'

  const rawData = tab === 'yearly' ? yearlyTrend : monthlyTrend?.slice().reverse()
  const chartData = rawData?.map(d => ({
    label: tab === 'yearly' ? d.YEAR : `${d.MONTH?.slice(0, 3)} ${d.YEAR?.slice(-2)}`,
    total: Number(d.TOTAL) || 0,
    cat1: Number(d[cat1]) || 0,
    cat2: Number(d[cat2]) || 0,
    pct1: Number(d.TOTAL) ? Math.round((Number(d[cat1]) / Number(d.TOTAL)) * 100) : 0,
    pct2: Number(d.TOTAL) ? Math.round((Number(d[cat2]) / Number(d.TOTAL)) * 100) : 0
  })) || []

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
              Yearly
            </button>
            <button
              onClick={() => setTab('monthly')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                tab === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              12-Month
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Line Chart */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Enrollment Count</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#737373' }} axisLine={{ stroke: '#d4d4d4' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#737373' }} tickFormatter={formatAxis} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value, name) => [Number(value).toLocaleString(), name === 'total' ? 'Total' : name === 'cat1' ? cat1 : cat2]}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e5e5', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="total" stroke="#171717" strokeWidth={2} dot={{ r: 3 }} name="total" />
              <Line type="monotone" dataKey="cat1" stroke={color1} strokeWidth={2} dot={{ r: 3 }} name="cat1" />
              <Line type="monotone" dataKey="cat2" stroke={color2} strokeWidth={2} dot={{ r: 3 }} name="cat2" />
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
          <ResponsiveContainer width="100%" height={180}>
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
      </CardContent>
    </Card>
  )
}
