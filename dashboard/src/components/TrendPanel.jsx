import ReactECharts from 'echarts-for-react'

function formatAxis(val) {
  if (val >= 1e6) return (val / 1e6).toFixed(0) + 'M'
  if (val >= 1e3) return (val / 1e3).toFixed(0) + 'K'
  return val
}

export default function TrendPanel({ view, trendTab, setTrendTab, yearlyTrend, monthlyTrend, selectedState }) {
  const areaLabel = selectedState || 'All Areas'
  const data = trendTab === 'yearly' ? yearlyTrend : monthlyTrend?.slice().reverse()

  const isMedical = view === 'medical'
  const cat1 = isMedical ? 'FFS' : 'PDP'
  const cat2 = isMedical ? 'MA' : 'MAPD'
  const color1 = isMedical ? '#d64b8a' : '#2980b9'
  const color2 = isMedical ? '#6b3fa0' : '#2d8f6f'

  const xLabels = data?.map(d => trendTab === 'yearly' ? d.YEAR : `${d.MONTH}/${d.YEAR?.slice(-2)}`) || []

  const countOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 60, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: xLabels, axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { formatter: formatAxis, fontSize: 10 } },
    series: [
      { name: 'TOTAL', type: 'line', data: data?.map(d => Number(d.TOTAL)) || [], lineStyle: { color: '#222', width: 2 }, itemStyle: { color: '#222' }, symbol: 'circle', symbolSize: 6 },
      { name: cat1, type: 'line', data: data?.map(d => Number(d[cat1])) || [], lineStyle: { color: color1, width: 2 }, itemStyle: { color: color1 }, symbol: 'circle', symbolSize: 5 },
      { name: cat2, type: 'line', data: data?.map(d => Number(d[cat2])) || [], lineStyle: { color: color2, width: 2 }, itemStyle: { color: color2 }, symbol: 'circle', symbolSize: 5 }
    ]
  }

  const pctData = data?.map(d => {
    const total = Number(d.TOTAL) || 1
    return { pct1: (Number(d[cat1]) / total) * 100, pct2: (Number(d[cat2]) / total) * 100 }
  }) || []

  const pctOption = {
    tooltip: { trigger: 'axis', formatter: (p) => p.map(s => `${s.seriesName}: ${s.value?.toFixed(0)}%`).join('<br/>') },
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: xLabels, axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%', fontSize: 10 } },
    series: [
      { name: cat1, type: 'bar', stack: 'pct', data: pctData.map(d => d.pct1), itemStyle: { color: color1 }, barWidth: '60%' },
      { name: cat2, type: 'bar', stack: 'pct', data: pctData.map(d => d.pct2), itemStyle: { color: color2 } }
    ]
  }

  return (
    <div className="trend-panel">
      <div className="tab-bar">
        <button className={trendTab === 'yearly' ? 'active' : ''} onClick={() => setTrendTab('yearly')}>Yearly Trend</button>
        <button className={trendTab === 'monthly' ? 'active' : ''} onClick={() => setTrendTab('monthly')}>12-Month Trend</button>
      </div>
      <div className="trend-section">
        <h3>Enrollment Count {trendTab === 'yearly' ? 'Yearly' : '12-Month'} Trend: {areaLabel}</h3>
        <ReactECharts option={countOption} style={{ height: 220 }} opts={{ renderer: 'svg' }} />
        <div className="legend">
          <span className="legend-item"><span className="legend-dot" style={{ background: color1 }}></span>{cat1}</span>
          <span className="legend-item"><span className="legend-dot" style={{ background: color2 }}></span>{cat2}</span>
          <span className="legend-item"><span className="legend-dot" style={{ background: '#222' }}></span>TOTAL</span>
        </div>
      </div>
      <div className="trend-section">
        <h3>Percent of Total Enrollment {trendTab === 'yearly' ? 'Yearly' : '12-Month'} Trend: {areaLabel}</h3>
        <ReactECharts option={pctOption} style={{ height: 220 }} opts={{ renderer: 'svg' }} />
        <div className="legend">
          <span className="legend-item"><span className="legend-dot" style={{ background: color1 }}></span>{cat1}</span>
          <span className="legend-item"><span className="legend-dot" style={{ background: color2 }}></span>{cat2}</span>
        </div>
      </div>
    </div>
  )
}
