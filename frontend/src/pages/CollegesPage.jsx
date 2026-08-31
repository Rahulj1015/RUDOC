import { useMemo, useState } from 'react'

export default function CollegesPage({
  colleges,
  selectedCollegeId,
  onSelectCollege,
  match,
  onCreateTasks,
  onNavigate,
}) {
  const [search, setSearch] = useState('')
  const [streamFilter, setStreamFilter] = useState('All')

  const streams = [
    'All',
    'Engineering & Technology',
    'Medical & Healthcare (MBBS)',
    'Management (MBA/BBA)',
    'Law (CLAT / LL.B.)',
    'Global Universities (USA / UK)',
  ]

  // Filter real colleges from verified database
  const filteredColleges = useMemo(() => {
    const q = search.trim().toLowerCase()
    return colleges.filter((c) => {
      let matchesStream = true
      if (streamFilter === 'Engineering & Technology') {
        matchesStream = c.stream.toLowerCase().includes('engineering') || c.stream.toLowerCase().includes('tech')
      } else if (streamFilter === 'Medical & Healthcare (MBBS)') {
        matchesStream = c.stream.toLowerCase().includes('medical') || c.stream.toLowerCase().includes('mbbs') || c.stream.toLowerCase().includes('health')
      } else if (streamFilter === 'Management (MBA/BBA)') {
        matchesStream = c.stream.toLowerCase().includes('management') || c.stream.toLowerCase().includes('mba') || c.stream.toLowerCase().includes('bba')
      } else if (streamFilter === 'Law (CLAT / LL.B.)') {
        matchesStream = c.stream.toLowerCase().includes('law')
      } else if (streamFilter === 'Global Universities (USA / UK)') {
        matchesStream = c.location.toLowerCase().includes('united states') || c.location.toLowerCase().includes('united kingdom') || c.stream.toLowerCase().includes('global')
      }

      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.shortName.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.ranking.toLowerCase().includes(q) ||
        c.requiredDocuments.some((d) => d.toLowerCase().includes(q))

      return matchesStream && matchesSearch
    })
  }, [colleges, search, streamFilter])

  const currentCollege = useMemo(() => {
    return colleges.find((c) => c.id === selectedCollegeId) || filteredColleges[0] || colleges[0]
  }, [colleges, selectedCollegeId, filteredColleges])

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="section-header-banner">
        <div>
          <span className="badge badge-teal">Official Academic Directory</span>
          <h2 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--text-primary)', marginTop: '4px' }}>
            🎓 Real Universities & Admission Document Auditor
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '750px', marginTop: '4px' }}>
            Select your dream university (IITs, AIIMS, Dr. D. Y. Patil, COEP Tech, DU CSAS, BITS, Harvard, Oxford) to audit your document readiness in real time.
          </p>
        </div>
      </div>

      {/* Stream Tabs Filter */}
      <div className="apple-segmented-bar" style={{ margin: '20px 0 16px 0' }}>
        {streams.map((s) => (
          <button
            key={s}
            type="button"
            className={`apple-segmented-item ${streamFilter === s ? 'active' : ''}`}
            onClick={() => setStreamFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Search Input Bar */}
      <div style={{ marginBottom: '24px' }}>
        <input
          type="text"
          className="input-field"
          placeholder="🔍 Search 50+ real universities by name, location (Pune, Mumbai, Delhi, Boston), stream, or exam..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '14px 18px', fontSize: '15px' }}
        />
      </div>

      {/* 2-Column Split: College List & Deep Readiness Audit */}
      <div className="match-columns">
        {/* Left Column: Real Colleges Directory */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>
              Verified Institutes ({filteredColleges.length})
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Click to audit vault</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '720px', overflowY: 'auto', paddingRight: '4px' }}>
            {filteredColleges.map((college) => {
              const isSelected = (currentCollege?.id === college.id)
              return (
                <div
                  key={college.id}
                  className={`college-card-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectCollege(college.id)}
                  style={{
                    background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-glass)',
                    borderRadius: '16px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'var(--spring-transition)',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: college.gradientBadge || 'var(--primary-gradient)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                        color: 'white',
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }}
                    >
                      {college.logoIcon || '🏛️'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                          {college.shortName}
                        </h4>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                        📍 {college.location}
                      </span>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                        <span className="badge badge-teal" style={{ fontSize: '10px' }}>
                          🏆 {college.ranking.split('•')[0]}
                        </span>
                        <span className="badge badge-gray" style={{ fontSize: '10px' }}>
                          {college.stream.split(',')[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {filteredColleges.length === 0 && (
              <div style={{ textAlign: 'center', padding: '36px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '36px', display: 'block', marginBottom: '8px' }}>🏛️</span>
                <strong style={{ color: 'var(--text-primary)' }}>No colleges found matching "{search}"</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Try searching for Dr. D. Y. Patil, IIT Bombay, COEP, AIIMS, DU, BITS Pilani, Harvard, or Oxford.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Readiness Audit Cockpit */}
        {currentCollege && (
          <div style={{ background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border-glass)', padding: '24px', position: 'sticky', top: '90px' }}>
            {/* Header Profile */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-glass)', paddingBottom: '18px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '16px',
                    background: currentCollege.gradientBadge || 'var(--primary-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '26px',
                    color: 'white',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
                  }}
                >
                  {currentCollege.logoIcon || '🏛️'}
                </div>
                <div>
                  <span className="badge badge-teal" style={{ marginBottom: '4px' }}>Target Admission Profile</span>
                  <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
                    {currentCollege.name}
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    📍 {currentCollege.location} • {currentCollege.type}
                  </span>
                </div>
              </div>

              {/* Readiness Progress Meter */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '24px', fontWeight: '900', color: match?.completionPercentage === 100 ? '#10b981' : 'var(--primary)' }}>
                  {match?.completionPercentage ?? 0}%
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>Vault Readiness</span>
              </div>
            </div>

            {/* Quick Metrics (Fee, Deadline, Ranking) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', margin: '18px 0' }}>
              <div style={{ background: 'rgba(0,0,0,0.03)', padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Annual Fee</span>
                <strong style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'block', marginTop: '2px' }}>{currentCollege.fee}</strong>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.03)', padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Admission Window</span>
                <strong style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'block', marginTop: '2px' }}>{currentCollege.deadline}</strong>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.03)', padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Accreditation</span>
                <strong style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'block', marginTop: '2px' }}>{currentCollege.ranking.split('•')[0]}</strong>
              </div>
            </div>

            {/* Official Portal Link */}
            {currentCollege.officialPortal?.url && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--primary-light)', padding: '10px 14px', borderRadius: '12px', marginBottom: '18px' }}>
                <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700' }}>
                  🌐 Official Website: {currentCollege.officialPortal.label}
                </span>
                <a
                  href={currentCollege.officialPortal.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  Visit Portal ↗
                </a>
              </div>
            )}

            {/* Live Requirement Gap Matrix */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '360px', overflowY: 'auto' }}>
              {/* Matched Documents */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ color: '#10b981', fontWeight: '800' }}>✓</span>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>
                    Matched in Your Vault ({match?.matchedCount ?? 0} / {match?.totalRequired ?? 0})
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {match?.availableDocuments?.map((d, i) => (
                    <span
                      key={i}
                      className="badge badge-teal"
                      style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      ✓ {d.requiredName} {d.isEquivalentMatch && <span style={{ opacity: 0.8 }}>(via {d.userDocName})</span>}
                    </span>
                  ))}
                  {match?.availableDocuments?.length === 0 && (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No required documents found in your vault yet.
                    </span>
                  )}
                </div>
              </div>

              {/* Missing Documents (Actionable Gaps) */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ color: '#ef4444', fontWeight: '800' }}>✕</span>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>
                    Missing Documents & Procurement Actions ({match?.missingCount ?? 0})
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {match?.missingDocuments?.map((doc, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(239, 68, 68, 0.06)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        padding: '10px 14px',
                        borderRadius: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{doc.name}</strong>
                        <span className="badge badge-warning" style={{ fontSize: '10px' }}>
                          {doc.guide?.priority || 'Required'}
                        </span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                        {doc.guide?.nextStep || 'Arrange from relevant school/board administration.'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Rules & Pitfalls */}
              {currentCollege.specificNotes && currentCollege.specificNotes.length > 0 && (
                <div style={{ background: 'rgba(0,0,0,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                  <strong style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                    ⚠️ Important Verification Criteria:
                  </strong>
                  <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>
                    {currentCollege.specificNotes.map((note, idx) => (
                      <li key={idx} style={{ marginBottom: '3px' }}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)', display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  onCreateTasks(currentCollege.id)
                  onNavigate('tasks')
                }}
              >
                📋 Generate Missing Document Checklist
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
