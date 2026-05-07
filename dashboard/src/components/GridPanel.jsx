import { useMemo } from 'react'

export default function GridPanel({ view, stateData, countyData, selectedState, onStateClick }) {
  const isMedical = view === 'medical'
  const cat1 = isMedical ? 'FFS' : 'PDP'
  const cat2 = isMedical ? 'MA' : 'MAPD'

  const rows = useMemo(() => {
    const source = selectedState ? countyData : stateData
    if (!source) return []
    return source.map(row => {
      const total = Number(row.TOTAL) || 0
      const v1 = Number(row[cat1]) || 0
      const v2 = Number(row[cat2]) || 0
      return {
        name: row.county || row.name,
        state: row.state,
        total,
        val1: v1,
        val2: v2,
        pct1: total ? Math.round((v1 / total) * 100) : 0,
        pct2: total ? Math.round((v2 / total) * 100) : 0
      }
    })
  }, [stateData, countyData, selectedState, cat1, cat2])

  return (
    <div className="grid-panel">
      <h3 style={{ marginBottom: 8 }}>{selectedState ? `${selectedState}` : 'All Areas'}</h3>
      <div style={{ maxHeight: 500, overflowY: 'auto' }}>
        <table className="data-grid">
          <thead>
            <tr>
              <th>{selectedState ? 'County' : 'State'}</th>
              <th>TOTAL</th>
              <th>{cat1}</th>
              <th>{cat2}</th>
              <th>{cat1} %</th>
              <th>{cat2} %</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={!selectedState ? 'clickable' : ''} onClick={() => !selectedState && onStateClick(row.state)}>
                <td>{row.name}</td>
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
  )
}
