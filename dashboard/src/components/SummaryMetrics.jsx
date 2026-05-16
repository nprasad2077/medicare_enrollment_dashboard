import { Card, CardContent } from './ui/card'
import { Users, TrendingUp, PieChart, Activity } from 'lucide-react'

function formatNum(n) {
  if (!n) return '0'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K'
  return n.toLocaleString()
}

export default function SummaryMetrics({ data, view }) {
  if (!data) return null

  const total = Number(data.TOT_BENES) || 0
  const isMedical = view === 'medical'
  const cat1Val = isMedical ? Number(data.MA) || 0 : Number(data.MAPD) || 0
  const cat2Val = isMedical ? Number(data.FFS) || 0 : Number(data.PDP) || 0
  const cat1Label = isMedical ? 'Medicare Advantage' : 'MAPD'
  const cat2Label = isMedical ? 'Fee-for-Service' : 'PDP'
  const cat1Pct = total ? Math.round((cat1Val / total) * 100) : 0
  const cat2Pct = total ? Math.round((cat2Val / total) * 100) : 0

  const metrics = [
    {
      label: 'Total Enrollment',
      value: formatNum(total),
      sub: 'All beneficiaries',
      icon: Users,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      label: cat1Label,
      value: formatNum(cat1Val),
      sub: `${cat1Pct}% of total`,
      icon: TrendingUp,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    {
      label: cat2Label,
      value: formatNum(cat2Val),
      sub: `${cat2Pct}% of total`,
      icon: PieChart,
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600'
    },
    {
      label: 'Penetration Rate',
      value: `${cat1Pct}%`,
      sub: `${cat1Label} share`,
      icon: Activity,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => (
        <Card key={m.label} className="border border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{m.label}</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{m.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{m.sub}</p>
              </div>
              <div className={`w-10 h-10 ${m.iconBg} rounded-lg flex items-center justify-center`}>
                <m.icon className={`w-5 h-5 ${m.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
