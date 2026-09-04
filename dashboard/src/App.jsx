import { useState, useCallback } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { Analytics } from '@vercel/analytics/react'
import * as dataService from './services/dataService'
import Header from './components/Header'
import SummaryMetrics from './components/SummaryMetrics'
import TrendPanel from './components/TrendPanel'
import MapPanel from './components/MapPanel'
import StateDetail from './components/StateDetail'
import ErrorBoundary from './components/ErrorBoundary'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } }
})

function Dashboard() {
  const [view, setView] = useState('medical')
  const [selectedState, setSelectedState] = useState(null)
  const [selectedCounty, setSelectedCounty] = useState(null)

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

  const { data: countyData, isLoading: countyLoading } = useQuery({
    queryKey: ['countyData', view, selectedState],
    queryFn: () => dataService.getCountyData(view, selectedState),
    enabled: !!selectedState
  })

  const { data: countyYearlyTrend, isLoading: countyYearlyLoading } = useQuery({
    queryKey: ['countyYearlyTrend', view, selectedState, selectedCounty],
    queryFn: () => dataService.getCountyYearlyTrend(view, selectedState, selectedCounty),
    enabled: !!selectedState && !!selectedCounty
  })

  const { data: countyMonthlyTrend, isLoading: countyMonthlyLoading } = useQuery({
    queryKey: ['countyMonthlyTrend', view, selectedState, selectedCounty],
    queryFn: () => dataService.getCountyMonthlyTrend(view, selectedState, selectedCounty),
    enabled: !!selectedState && !!selectedCounty
  })

  const handleStateClick = useCallback((stateAbbr) => {
    setSelectedState(stateAbbr)
    setSelectedCounty(null)
  }, [])

  const handleCountyClick = useCallback((countyName) => {
    setSelectedCounty(countyName)
  }, [])

  const handleBackToAll = useCallback(() => {
    setSelectedState(null)
    setSelectedCounty(null)
  }, [])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background font-[var(--font-family)]" aria-busy="true" aria-label="Loading Medicare Enrollment Dashboard">
        <div className="w-full max-w-[1560px] mx-auto p-6 lg:p-8 space-y-6 lg:space-y-8 animate-pulse">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl" />
              <div className="space-y-2">
                <div className="w-64 h-7 bg-gray-200 rounded" />
                <div className="w-40 h-4 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="w-64 h-10 bg-gray-100 rounded-lg" />
          </div>

          {/* Metrics Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 bg-white border border-gray-200 rounded-xl p-5" />
            ))}
          </div>

          {/* Main Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-[480px] bg-white border border-gray-200 rounded-xl" />
              <div className="h-[360px] bg-white border border-gray-200 rounded-xl" />
            </div>
            <div className="h-[520px] bg-white border border-gray-200 rounded-xl" />
          </div>
        </div>
      </main>
    )
  }

  const latestData = summary?.[0]

  // Determine which trend data to show: county > state > national
  const displayYearlyTrend = selectedCounty ? countyYearlyTrend : yearlyTrend
  const displayMonthlyTrend = selectedCounty ? countyMonthlyTrend : monthlyTrend
  const trendLabel = selectedCounty || (selectedState ? stateData?.find(s => s.state === selectedState)?.name : null)

  return (
    <main className="min-h-screen bg-background font-[var(--font-family)]">
      <div className="w-full max-w-[1560px] mx-auto p-6 lg:p-8 space-y-6 lg:space-y-8">
        <Header view={view} setView={setView} latestData={latestData} onReset={handleBackToAll} />
        <SummaryMetrics data={latestData} view={view} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Map + Trends */}
          <div className="lg:col-span-2 space-y-6">
            <MapPanel
              view={view}
              stateData={stateData}
              countyData={countyData}
              selectedState={selectedState}
              selectedCounty={selectedCounty}
              onStateClick={handleStateClick}
              onCountyClick={handleCountyClick}
            />
            <TrendPanel
              view={view}
              yearlyTrend={displayYearlyTrend}
              monthlyTrend={displayMonthlyTrend}
              selectedState={selectedState}
              selectedCounty={selectedCounty}
              trendLabel={trendLabel}
              loading={selectedCounty ? (countyYearlyLoading || countyMonthlyLoading) : false}
            />
          </div>

          {/* Right: State Detail Sidebar */}
          <div className="space-y-6">
            <StateDetail
              view={view}
              state={selectedState}
              stateData={stateData}
              countyData={countyData}
              countyLoading={countyLoading}
              selectedCounty={selectedCounty}
              onStateClick={handleStateClick}
              onCountyClick={handleCountyClick}
              yearlyTrend={yearlyTrend}
              onClose={handleBackToAll}
            />
          </div>
        </div>
      </div>
    </main>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Dashboard />
        <Analytics />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

