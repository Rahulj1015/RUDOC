export default function Navbar({
  activeTab,
  selectedService,
  selectedCollege,
  currentUser,
  theme,
  onToggleTheme,
  onOpenAuth,
  onOpenUpload,
  onOpenReport,
}) {
  const getTabTitle = (tab) => {
    switch (tab) {
      case 'overview':
        return 'Dashboard Cockpit'
      case 'colleges':
        return 'Dream College Navigator & Admission Checklist'
      case 'services':
        return 'Government Schemes & Service Matcher'
      case 'vault':
        return 'Personal Document Vault'
      case 'mismatches':
        return 'Cross-Document Spelling & DOB Mismatch Checker'
      case 'tasks':
        return 'Missing Document Procurement Plan'
      case 'guide':
        return 'Official Application Process & Portal Routes'
      default:
        return 'RUDOC'
    }
  }

  const getThemeIcon = () => {
    if (theme === 'dark') return '🌙'
    if (theme === 'emerald') return '💎'
    return '☀️'
  }

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <h2 className="page-title">{getTabTitle(activeTab)}</h2>
        {activeTab === 'colleges' && selectedCollege && (
          <span className="selected-service-chip">
            🎓 Target: {selectedCollege.shortName}
          </span>
        )}
        {activeTab === 'services' && selectedService && (
          <span className="selected-service-chip">
            🎯 Target: {selectedService.title}
          </span>
        )}
      </div>

      <div className="navbar-right">
        {/* Theme Switcher Toggle */}
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          title={`Theme: ${theme}. Click to switch.`}
        >
          {getThemeIcon()}
        </button>

        {/* Export Report */}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onOpenReport}
        >
          📄 Export Report
        </button>

        {/* Upload Doc */}
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onOpenUpload}
        >
          ➕ Upload Doc
        </button>

        {/* User Profile Badge */}
        <div className="user-profile-badge" onClick={onOpenAuth} title="Manage Account / Switch Profile">
          <div className="user-avatar">
            {currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'}
          </div>
          <div className="user-info-text">
            <span className="user-name">{currentUser?.name || 'Guest User'}</span>
            <span className="user-role">{currentUser?.role || 'Applicant'}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
