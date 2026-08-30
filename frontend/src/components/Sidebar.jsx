export default function Sidebar({
  activeTab,
  onSelectTab,
  readiness,
  auditIssuesCount,
}) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'colleges', label: 'College Admissions', icon: '🎓', badge: 'New', badgeType: 'teal' },
    { id: 'services', label: 'Govt & ID Services', icon: '🎯' },
    { id: 'vault', label: 'Document Vault', icon: '📁' },
    {
      id: 'mismatches',
      label: 'Mismatch Checker',
      icon: '🔍',
      badge: auditIssuesCount > 0 ? `${auditIssuesCount} Alerts` : null,
      badgeType: 'warning',
    },
    { id: 'tasks', label: 'Action Checklist', icon: '✅' },
    { id: 'guide', label: 'Official Portals', icon: '🏛️' },
  ]

  return (
    <aside className="sidebar">
      <div className="brand-section">
        <img src="/logo.png" alt="RUDOC Logo" className="brand-logo-img" />
        <div>
          <h1 className="brand-title">RU<span>DOC</span></h1>
          <p className="brand-subtitle">Document Readiness AI</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onSelectTab(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && (
              <span className={`nav-badge ${item.badgeType}`}>{item.badge}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="readiness-widget">
          <div className="readiness-header">
            <span className="readiness-label">Overall Readiness</span>
            <span className="readiness-value">{readiness}%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${readiness}%` }} />
          </div>
        </div>
      </div>
    </aside>
  )
}
