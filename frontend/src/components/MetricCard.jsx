export default function MetricCard({ icon, label, value, colorClass = 'teal' }) {
  return (
    <div className="metric-card">
      <div className={`metric-icon-box ${colorClass}`}>
        {icon}
      </div>
      <div className="metric-info">
        <h3>{value}</h3>
        <span>{label}</span>
      </div>
    </div>
  )
}

