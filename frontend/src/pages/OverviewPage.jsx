import MetricCard from '../components/MetricCard'
import MismatchDetector from '../components/MismatchDetector'

export default function OverviewPage({
  overview,
  selectedCollege,
  collegeMatch,
  tasks,
  documents,
  auditData,
  onNavigate,
  onCreateTasks,
  onOpenUpload,
  onRunAudit,
}) {
  const collegeReadiness = collegeMatch?.completionPercentage ?? 0
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length
  const activeTasks = tasks.length - completedTasks

  return (
    <div className="page-container">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <h2>Welcome, {overview?.profile?.name || 'Applicant'} 👋</h2>
          <p>
            Your AI-assisted cockpit for Indian college admissions (IITs, DU, AIIMS, BITS), government services, and document mismatch audits.
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigate('colleges')}
            >
              🎓 Choose Target College
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onNavigate('services')}
            >
              🎯 Govt & ID Services
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onOpenUpload}
            >
              📁 Add Document to Vault
            </button>
          </div>
        </div>
        <div className="hero-logo-container">
          <img src="/logo.png" alt="RUDOC Brand Emblem" className="hero-logo-img" />
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="metrics-grid">
        <MetricCard
          icon="🎓"
          label="College Readiness"
          value={`${collegeReadiness}%`}
          colorClass={collegeReadiness === 100 ? 'green' : 'teal'}
        />
        <MetricCard
          icon="📁"
          label="Vault Documents"
          value={documents.length}
          colorClass="blue"
        />
        <MetricCard
          icon="✅"
          label="Pending Tasks"
          value={activeTasks}
          colorClass={activeTasks > 0 ? 'amber' : 'green'}
        />
        <MetricCard
          icon="🛡️"
          label="Identity Audit Score"
          value={`${auditData?.overallScore ?? 100}/100`}
          colorClass={auditData?.overallScore >= 90 ? 'green' : 'amber'}
        />
      </div>

      {/* 2-Column Dashboard Cards */}
      <div className="grid-2col">
        {/* Target College Readiness */}
        <div className="card">
          <div className="card-header">
            <div>
              <span className="badge badge-teal">Target College</span>
              <h3 className="card-title" style={{ marginTop: '4px' }}>
                {selectedCollege?.name || 'IIT Bombay'}
              </h3>
              <p className="card-subtitle">{selectedCollege?.stream}</p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('colleges')}
            >
              Change College
            </button>
          </div>

          <div className="service-header-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                Admission Document Readiness
              </span>
              <strong style={{ fontSize: '15px', color: collegeReadiness === 100 ? '#16a34a' : 'var(--primary)' }}>
                {collegeMatch?.totalAvailable ?? 0} of {collegeMatch?.totalRequired ?? 0} Ready ({collegeReadiness}%)
              </strong>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${collegeReadiness}%`,
                  background: collegeReadiness === 100 ? 'linear-gradient(90deg, #10b981, #059669)' : undefined,
                }}
              />
            </div>
          </div>

          {/* Quick Match Split Columns */}
          <div className="match-columns">
            <div className="match-col available">
              <h4>✅ Ready ({collegeMatch?.availableDocuments?.length ?? 0})</h4>
              <ul className="match-list">
                {collegeMatch?.availableDocuments?.slice(0, 3).map((doc, idx) => (
                  <li key={idx} className="match-item">
                    <strong>{doc.name}</strong>
                    <span className="badge badge-green">✓ Ready</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="match-col missing">
              <h4>⚠️ Need To Arrange ({collegeMatch?.missingDocuments?.length ?? 0})</h4>
              <ul className="match-list">
                {collegeMatch?.missingDocuments?.slice(0, 3).map((doc, idx) => (
                  <li key={idx} className="match-item">
                    <strong>{doc.name}</strong>
                    <span className="badge badge-amber">Arrange</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => onNavigate('colleges')}
            >
              🎓 Explore Full College Requirements
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onOpenUpload}
            >
              ➕ Upload Document
            </button>
          </div>
        </div>

        {/* Action Checklist & Quick Tasks */}
        <div className="card">
          <div className="card-header">
            <div>
              <span className="badge badge-amber">Action Checklist</span>
              <h3 className="card-title" style={{ marginTop: '4px' }}>
                Procurement Tracker
              </h3>
              <p className="card-subtitle">
                {completedTasks}/{tasks.length} tasks completed
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('tasks')}
            >
              View All
            </button>
          </div>

          {tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', background: 'var(--bg-main)', borderRadius: '12px', border: '1px dashed var(--border-light)' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                No active task plan created yet.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={onCreateTasks}
              >
                + Generate Missing Document Plan
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tasks.slice(0, 3).map((task) => (
                <div key={task.id} className={`task-item ${task.status === 'Completed' ? 'done' : ''}`} style={{ padding: '12px' }}>
                  <div>
                    <span className={`badge ${task.priority === 'High' ? 'badge-red' : 'badge-amber'}`} style={{ marginBottom: '4px' }}>
                      {task.priority} Priority
                    </span>
                    <strong style={{ display: 'block', fontSize: '14px' }}>{task.title}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{task.source}</span>
                  </div>
                  <span className={`badge ${task.status === 'Completed' ? 'badge-green' : 'badge-amber'}`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cross-Document Mismatch Audit Section */}
      <MismatchDetector
        auditData={auditData}
        documents={documents}
        onRunAudit={onRunAudit}
      />
    </div>
  )
}
