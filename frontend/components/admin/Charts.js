// Composants de visualisation légers (SVG, sans dépendance externe)
// pour l'espace gestionnaire : camembert, barre de progression, histogramme.

function polarToCartesian(cx, cy, r, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}

function arcPath(cx, cy, r, startAngle, endAngle) {
  // Cas du cercle complet (une seule tranche à 100 %).
  if (endAngle - startAngle >= 359.999) {
    return [
      `M ${cx} ${cy - r}`,
      `A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r}`,
      'Z',
    ].join(' ')
  }
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1
  return [`M ${cx} ${cy}`, `L ${start.x} ${start.y}`, `A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`, 'Z'].join(' ')
}

export function PieChart({ title, data = [], size = 230 }) {
  const total = data.reduce((t, d) => t + (d.value || 0), 0)
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 6

  let angle = 0
  const slices = data
    .filter((d) => (d.value || 0) > 0)
    .map((d) => {
      const portion = total > 0 ? d.value / total : 0
      const start = angle
      const end = angle + portion * 360
      angle = end
      const mid = (start + end) / 2
      const labelPos = polarToCartesian(cx, cy, r * 0.62, mid)
      return { ...d, start, end, portion, labelPos }
    })

  return (
    <div className="pieWrap">
      {title ? <h4 className="pieTitle">{title}</h4> : null}
      {total === 0 ? (
        <p className="pieEmpty">Aucune donnée sur la période.</p>
      ) : (
        <svg viewBox={`0 0 ${size} ${size}`} className="pieSvg" role="img" aria-label={title || 'Camembert'}>
          {slices.map((s, i) => (
            <path key={i} d={arcPath(cx, cy, r, s.start, s.end)} fill={s.color} stroke="#fff" strokeWidth="1.5" />
          ))}
          {slices.map((s, i) =>
            s.portion > 0.05 ? (
              <text key={`t${i}`} x={s.labelPos.x} y={s.labelPos.y} textAnchor="middle" className="pieLabel">
                <tspan x={s.labelPos.x} dy="-2">{s.value}</tspan>
                <tspan x={s.labelPos.x} dy="14">{Math.round(s.portion * 100)}%</tspan>
              </text>
            ) : null,
          )}
        </svg>
      )}
      <ul className="pieLegend">
        {data.map((d, i) => (
          <li key={i}>
            <span className="legendDot" style={{ background: d.color }} aria-hidden="true" />
            {d.label}
          </li>
        ))}
      </ul>

      <style jsx>{`
        .pieWrap { display: flex; flex-direction: column; align-items: center; }
        .pieTitle { margin: 0 0 12px; font-size: var(--fs-md); font-weight: 700; color: #4a4f63; }
        .pieSvg { width: 100%; max-width: 260px; height: auto; }
        .pieEmpty { color: #8b90a3; font-size: var(--fs-sm); padding: 40px 0; }
        :global(.pieLabel) { font-size: 11px; font-weight: 700; fill: #2b2f45; }
        .pieLegend { list-style: none; margin: 16px 0 0; padding: 0; display: flex; flex-direction: column; gap: 6px; font-size: var(--fs-xs); color: #555a6e; max-width: 280px; }
        .pieLegend li { display: flex; align-items: center; gap: 8px; }
        .legendDot { width: 12px; height: 12px; border-radius: 3px; flex: 0 0 auto; }
      `}</style>
    </div>
  )
}

export function ProgressBar({ value, color }) {
  const pct = Math.max(0, Math.min(100, Math.round(value || 0)))
  const auto = pct >= 70 ? '#c0392b' : pct >= 45 ? '#e67e22' : '#9aa520'
  return (
    <div className="barRow">
      <span className="barTrack">
        <span className="barFill" style={{ width: `${pct}%`, background: color || auto }} />
      </span>
      <strong className="barValue" style={{ color: color || auto }}>{pct},00%</strong>
      <style jsx>{`
        .barRow { display: flex; align-items: center; gap: 12px; }
        .barTrack { position: relative; width: 90px; height: 8px; border-radius: 999px; background: #ececf1; overflow: hidden; }
        .barFill { position: absolute; inset: 0 auto 0 0; border-radius: 999px; }
        .barValue { font-size: var(--fs-sm); font-weight: 800; white-space: nowrap; }
      `}</style>
    </div>
  )
}

export function BarHistogram({ data = [], color = '#3146f5' }) {
  const max = Math.max(1, ...data.map((d) => d.count || 0))
  return (
    <div className="hist">
      {data.map((d, i) => (
        <div className="histCol" key={i}>
          <div className="histBarArea">
            <span className="histCount">{d.count}</span>
            <span className="histBar" style={{ height: `${(d.count / max) * 100}%`, background: color }} />
          </div>
          <span className="histLabel">{d.label || d.etape}</span>
        </div>
      ))}
      <style jsx>{`
        .hist { display: flex; align-items: flex-end; gap: 16px; height: 220px; padding: 8px 4px 0; }
        .histCol { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; }
        .histBarArea { flex: 1; width: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; }
        .histBar { width: 60%; max-width: 56px; border-radius: 8px 8px 0 0; min-height: 2px; transition: height 0.3s; }
        .histCount { font-size: var(--fs-sm); font-weight: 700; color: #4a4f63; margin-bottom: 4px; }
        .histLabel { margin-top: 8px; font-size: var(--fs-xs); color: #6b7082; text-align: center; }
      `}</style>
    </div>
  )
}
