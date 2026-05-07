import { useState, useCallback } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import * as dataService from './services/dataService'
import Header from './components/Header'
import Summary from './components/Summary'
import TrendPanel from './components/TrendPanel'
import MapPanel from './components/MapPanel'
import GridPanel from './components/GridPanel'
import StateDetail from './components/StateDetail'
import './App.css'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } }
})

function Dashboard() {
  const [view, setView] = useState('medical')
  const [mainTab, setMainTab] = useState('map')
  const [trendTab, setTrendTab] = useState('yearly')
  const [mapTab, setMapTab] = useState('all')
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
    setMapTab('counties')
  }, [])

  const handleBackToAll = useCallback(() => {
    setSelectedState(null)
    setMapTab('all')
  }, [])

  if (isLoading) {
    return <div className="loading">Loading Medicare Enrollment Data...</div>
  }

  const latestData = summary?.[0]
  const title = view === 'medical'
    ? `📊 CMS Medicare Enrollment for ${latestData?.MONTH || ''} ${latestData?.YEAR || ''}`
    : `📊 CMS Enrollment Counts for ${latestData?.MONTH || ''} ${latestData?.YEAR || ''}`

  return (
    <div className="dashboard">
      <Header title={title} view={view} setView={setView} />
      <div className="dashboard-body">
        <div className="left-panel">
          <Summary data={latestData} view={view} />
          <div className="tab-bar main-tabs">
            <button className={mainTab === 'map' ? 'active' : ''} onClick={() => setMainTab('map')}>Map/Graphs</button>
            <button className={mainTab === 'grid' ? 'active' : ''} onClick={() => setMainTab('grid')}>Grid</button>
          </div>
          {mainTab === 'map' ? (
            <MapPanel
              view={view}
              stateData={stateData}
              mapTab={mapTab}
              setMapTab={setMapTab}
              selectedState={selectedState}
              onStateClick={handleStateClick}
            />
          ) : (
            <GridPanel
              view={view}
              stateData={stateData}
              countyData={countyData}
              selectedState={selectedState}
              onStateClick={handleStateClick}
            />
          )}
        </div>
        <div className="right-panel">
          <TrendPanel
            view={view}
            trendTab={trendTab}
            setTrendTab={setTrendTab}
            yearlyTrend={yearlyTrend}
            monthlyTrend={monthlyTrend}
            selectedState={selectedState}
          />
        </div>
      </div>
      {selectedState && (
        <StateDetail
          view={view}
          state={selectedState}
          stateData={stateData}
          countyData={countyData}
          yearlyTrend={yearlyTrend}
          monthlyTrend={monthlyTrend}
          trendTab={trendTab}
          setTrendTab={setTrendTab}
          onClose={handleBackToAll}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  )
}
