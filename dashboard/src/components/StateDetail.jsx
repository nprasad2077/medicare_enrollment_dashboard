import { useMemo } from 'react'

export default function StateDetail({ view, state, stateData, countyData, yearlyTrend, monthlyTrend, trendTab, setTrendTab, onClose }) {
  const isMedical = view === 'medical'
  const cat1 = isMedical ? 'FFS' : 'PDP'
  const cat2 = isMedical ? 'MA' : 'MAPD'

  const stateInfo = stateData?.find(s => s.state === state)
  const total = stateInfo ? Number(stateInfo.TOTAL) : 0
  const v1 = stateInfo ? Number(stateInfo[cat1]) : 0
  const v2 = stateInfo ? Number(stateInfo[cat2]) : 0
  const pct1 = total ? Math.round((v1 / total) * 100) : 0
  const pct2 = total ? Math.round((v2 / total) * 100) : 0
  const countyCount = countyData?.length || 0

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
    })
  }, [countyData, cat1, cat2])

  const trendData = trendTab === 'yearly' ? yearlyTrend : monthlyTrend

  return (
    <div className="state-detail">
      <div className="state-detail-header">
        <span>
          {state} ({countyCount} counties) | TOTAL: {total.toLocaleString()} | {cat1}: {v1.toLocaleString()} ({pct1}% of total) | {cat2}: {v2.toLocaleString()} ({pct2}% of total)
        </span>
        <button onClick={onClose}>✕</button>
      </div>
      <div className="state-detail-body">
        <div className="county-table">
          <h4>{stateInfo?.name || state}</h4>
          <div style={{ maxHeight: 350, overflowY: 'auto' }}>
            <table className="data-grid">
              <thead>
                <tr>
                  <th>County</th>
                  <th>TOTAL</th>
                  <th>{cat1}</th>
                  <th>{cat2}</th>
                  <th>{cat1} %</th>
                  <th>{cat2} %</th>
                </tr>
              </thead>
              <tbody>
                {countyRows.map((row, i) => (
                  <tr key={i}>
                    <td>{row.county}</td>
                    <td>{row.total.toLocaleString()}</td>
                    <td>{row.val1.toLocaleString()}</td>
                    <td>{row.val2.toLocaleString()}</td>
                    <td>{row.pct1}%</td>
                    <td>{row.pct2}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="state-trends">
          <div className="tab-bar">
            <button className={trendTab === 'yearly' ? 'active' : ''} onClick={() => setTrendTab('yearly')}>Yearly Trend</button>
            <button className={trendTab === 'monthly' ? 'active' : ''} onClick={() => setTrendTab('monthly')}>12-Month Trend</button>
            <button className="active">Grid</button>
          </div>
          <h4>Enrollment Count {trendTab === 'yearly' ? 'Yearly' : '12-Month'} Trend: State Total</h4>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            <table className="data-grid">
              <thead>
                <tr>
                  <th>Year</th>
                  {trendTab === 'monthly' && <th>Month</th>}
                  <th>TOTAL</th>
                  <th>{cat1}</th>
                  <th>{cat2}</th>
                  <th>{cat1} %</th>
                  <th>{cat2} %</th>
                </tr>
              </thead>
              <tbody>
                {trendData?.map((row, i) => {
                  const t = Number(row.TOTAL) || 1
                  return (
                    <tr key={i}>
                      <td>{row.YEAR}</td>
                      {trendTab === 'monthly' && <td>{row.MONTH}</td>}
                      <td>{Number(row.TOTAL).toLocaleString()}</td>
                      <td>{Number(row[cat1]).toLocaleString()}</td>
                      <td>{Number(row[cat2]).toLocaleString()}</td>
                      <td>{Math.round((Number(row[cat1]) / t) * 100)}%</td>
                      <td>{Math.round((Number(row[cat2]) / t) * 100)}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
