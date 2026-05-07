import ReactECharts from 'echarts-for-react'

function formatNum(n) {
  if (!n) return '0'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K'
  return n.toLocaleString()
}

export default function Summary({ data, view }) {
  if (!data) return <div className="summary">Loading...</div>

  const total = Number(data.TOT_BENES) || 0
  let left, right, leftLabel, rightLabel, leftColor, rightColor

  if (view === 'medical') {
    left = Number(data.MA) || 0
    right = Number(data.FFS) || 0
    leftLabel = 'MA'
    rightLabel = 'FFS'
    leftColor = '#6b3fa0'
    rightColor = '#d64b8a'
  } else {
    left = Number(data.MAPD) || 0
    right = Number(data.PDP) || 0
    leftLabel = 'MAPD'
    rightLabel = 'PDP'
    leftColor = '#2d8f6f'
    rightColor = '#2980b9'
  }

  const leftPct = total ? Math.round((left / total) * 100) : 0
  const rightPct = total ? Math.round((right / total) * 100) : 0

  const donutOption = {
    series: [{
      type: 'pie',
      radius: ['55%', '80%'],
      data: [
        { value: left, name: leftLabel, itemStyle: { color: leftColor } },
        { value: right, name: rightLabel, itemStyle: { color: rightColor } }
      ],
      label: { show: false },
      emphasis: { scale: false }
    }],
    graphic: [{
      type: 'text',
      left: 'center',
      top: '40%',
      style: { text: formatNum(total), fontSize: 18, fontWeight: 'bold', fill: '#1a3a5c', textAlign: 'center' }
    }, {
      type: 'text',
      left: 'center',
      top: '58%',
      style: { text: 'Total\nEnrollment', fontSize: 10, fill: '#666', textAlign: 'center' }
    }]
  }

  return (
    <div className="summary">
      <div className="summary-side">
        <div className="value">{leftLabel}: {formatNum(left)}</div>
        <div className="pct">({leftPct}% of total)</div>
      </div>
      <div className="summary-center">
        <ReactECharts option={donutOption} style={{ width: 150, height: 150 }} opts={{ renderer: 'svg' }} />
      </div>
      <div className="summary-side">
        <div className="value">{rightLabel}: {formatNum(right)}</div>
        <div className="pct">({rightPct}% of total)</div>
      </div>
    </div>
  )
}
