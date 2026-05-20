import { useState, useCallback } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { Analytics } from '@vercel/analytics/react'
import * as dataService from './services/dataService'
import Header from './components/Header'
import SummaryMetrics from './components/SummaryMetrics'
import TrendPanel from './components/TrendPanel'
import MapPanel from './components/MapPanel'
import StateDetail from './components/StateDetail'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } }
})

function Dashboard() {
  const [view, setView] = useState('medical')
  const [selectedState, setSelectedState] = useState(null)

  const { data: summary, isLoading } = useQuery({
    queryKey: ['summary', view],
    queryFn: () => dataService.getLatestNational(view)
  })

  const { data: yearlyTrend } = useQuery({
    queryKey: ['yearlyTrend', view, selectedState],
    queryFn: () => dataService.getYearlyTrend(view, selectedState ? 'State' : 'National', selectedState)
  })

  const { data: monthlyTrend } = useQuery({
    queryKey: ['monthlyTrend', view, selectedState],
    queryFn: () => dataService.getMonthlyTrend(view, selectedState ? 'State' : 'National', selectedState)
  })

  const { data: stateData } = useQuery({
    queryKey: ['stateData', view],
    queryFn: () => dataService.getStateData(view)
  })

  const { data: countyData } = useQuery({
    queryKey: ['countyData', view, selectedState],
    queryFn: () => dataService.getCountyData(view, selectedState),
    enabled: !!selectedState
  })

  const handleStateClick = useCallback((stateAbbr) => {
    setSelectedState(stateAbbr)
  }, [])

  const handleBackToAll = useCallback(() => {
    setSelectedState(null)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading Medicare Enrollment Data...</p>
        </div>
      </div>
    )
  }

  const latestData = summary?.[0]

  return (
    <div className="min-h-screen bg-background font-[var(--font-family)]">
      <div className="w-full max-w-[1400px] mx-auto p-6 space-y-6">
        <Header view={view} setView={setView} latestData={latestData} />
        <SummaryMetrics data={latestData} view={view} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Map + Trends */}
          <div className="lg:col-span-2 space-y-6">
            <MapPanel
              view={view}
              stateData={stateData}
              selectedState={selectedState}
              onStateClick={handleStateClick}
            />
            <TrendPanel
              view={view}
              yearlyTrend={yearlyTrend}
              monthlyTrend={monthlyTrend}
              selectedState={selectedState}
            />
          </div>

          {/* Right: State Detail Sidebar */}
          <div className="space-y-6">
            <StateDetail
              view={view}
              state={selectedState}
              stateData={stateData}
              countyData={countyData}
              yearlyTrend={yearlyTrend}
              onClose={handleBackToAll}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
      <Analytics />
    </QueryClientProvider>
  )
}
