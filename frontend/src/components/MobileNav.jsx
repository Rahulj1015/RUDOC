export default function MobileNav({ activeTab, onSelectTab, auditIssuesCount }) {
  const items = [
    { id: 'overview', label: 'Home', icon: '📊' },
    { id: 'colleges', label: 'Colleges', icon: '🎓' },
    { id: 'services', label: 'Govt & IDs', icon: '🎯' },
    { id: 'vault', label: 'Vault', icon: '📁' },
    {
      id: 'mismatches',
      label: 'Audit',
      icon: '🔍',
      badge: auditIssuesCount > 0 ? auditIssuesCount : null,
    },
    { id: 'tasks', label: 'Tasks', icon: '✅' },
  ]

  return (
    <nav className="mobile-bottom-nav">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`mobile-nav-btn ${activeTab === item.id ? 'active' : ''}`}
          onClick={() => onSelectTab(item.id)}
        >
          <span className="mobile-nav-icon">
            {item.icon}
            {item.badge && <span className="mobile-nav-badge">{item.badge}</span>}
          </span>
          <span className="mobile-nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
