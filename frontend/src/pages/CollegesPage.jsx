import { useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL ?? ''

export default function CollegesPage({
  colleges: initialColleges,
  selectedCollegeId,
  onSelectCollege,
  match,
  onCreateTasks,
  onNavigate,
}) {
  const [search, setSearch] = useState('')
  const [streamFilter, setStreamFilter] = useState('All')
  const [collegesList, setCollegesList] = useState(initialColleges || [])
  const [isSearchingLive, setIsSearchingLive] = useState(false)

  const streams = [
    'All',
    'Engineering & Technology',
    'Medical & Healthcare (MBBS)',
    'Management (MBA/BBA)',
    'Law (CLAT / LL.B.)',
    'Global Universities (USA / UK)',
  ]

  // Live Real-Time Search across Local Database + Global Hipo Universities API
  useEffect(() => {
    if (!search.trim()) {
      setCollegesList(initialColleges || [])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearchingLive(true)
      try {
        const res = await fetch(`${API_URL}/api/colleges?search=${encodeURIComponent(search.trim())}`)
        if (res.ok) {
          const data = await res.json()
          setCollegesList(data.colleges || [])
          if (data.colleges?.length > 0 && !data.colleges.some((c) => c.id === selectedCollegeId)) {
            onSelectCollege(data.colleges[0].id)
          }
        }
      } catch (err) {
        console.warn('Live college search error:', err)
      } finally {
        setIsSearchingLive(false)
      }
    }, 280)

    return () => clearTimeout(timer)
  }, [search, initialColleges, selectedCollegeId, onSelectCollege])

  // Filter by stream tab
  const filteredColleges = useMemo(() => {
    return collegesList.filter((c) => {
      if (streamFilter === 'All') return true
      if (streamFilter === 'Engineering & Technology') {
        return c.stream.toLowerCase().includes('engineering') || c.stream.toLowerCase().includes('tech')
      }
      if (streamFilter === 'Medical & Healthcare (MBBS)') {
        return c.stream.toLowerCase().includes('medical') || c.stream.toLowerCase().includes('mbbs') || c.stream.toLowerCase().includes('health')
      }
      if (streamFilter === 'Management (MBA/BBA)') {
        return c.stream.toLowerCase().includes('management') || c.stream.toLowerCase().includes('mba') || c.stream.toLowerCase().includes('bba')
      }
      if (streamFilter === 'Law (CLAT / LL.B.)') {
        return c.stream.toLowerCase().includes('law')
      }
      if (streamFilter === 'Global Universities (USA / UK)') {
        return c.location.toLowerCase().includes('united states') || c.location.toLowerCase().includes('united kingdom') || c.stream.toLowerCase().includes('global')
      }
      return true
    })
  }, [collegesList, streamFilter])

  const currentCollege = useMemo(() => {
    return collegesList.find((c) => c.id === selectedCollegeId) || filteredColleges[0] || collegesList[0] || initialColleges[0]
  }, [collegesList, selectedCollegeId, filteredColleges, initialColleges])

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="section-header-banner">
        <div>
          <span className="badge badge-teal">Global & National Academic Directory</span>
          <h2 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--text-primary)', marginTop: '4px' }}>
            🎓 Universal College & Admission Document Auditor
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '750px', marginTop: '4px' }}>
            Search <strong>any college or university in the world</strong> (JSPM, Sinhgad, PCCOE, PICT, IITs, AIIMS, COEP, BITS, VIT, Harvard, Oxford, etc.) to audit your admission document readiness in real time.
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

      {/* Live Universal Search Bar */}
      <div style={{ marginBottom: '20px', position: 'relative' }}>
        <input
          type="text"
          className="input-field"
          placeholder="🔍 Search ANY college or university in India or the World (e.g. JSPM, Sinhgad, PCCOE, PICT, VIT, COEP, Harvard, Oxford, Waterloo, Toronto)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '16px 20px', fontSize: '15px', borderRadius: '16px' }}
        />
        {isSearchingLive && (
          <div style={{ position: 'absolute', right: '16px', top: '16px', fontSize: '13px', color: 'var(--primary)', fontWeight: '800' }}>
            ⚡ Live Searching...
          </div>
        )}
      </div>

      {/* 2-Column Split: Real-Time Results & Live Readiness Cockpit */}
      <div className="match-columns">
        {/* Left Column: Colleges Directory */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>
              {search ? `Search Results for "${search}"` : 'Premier & Regional Universities'} ({filteredColleges.length})
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Click college to audit vault</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '720px', overflowY: 'auto', paddingRight: '4px' }}>
            {filteredColleges.map((college) => {
              const isSelected = currentCollege?.id === college.id
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
                          🏆 {college.ranking?.split('•')[0] || 'Accredited'}
                        </span>
                        <span className="badge badge-gray" style={{ fontSize: '10px' }}>
                          {college.stream?.split(',')[0] || 'Higher Education'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {filteredColleges.length === 0 && !isSearchingLive && (
              <div style={{ textAlign: 'center', padding: '36px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '36px', display: 'block', marginBottom: '8px' }}>🏛️</span>
                <strong style={{ color: 'var(--text-primary)' }}>No universities found matching "{search}"</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Try searching for JSPM, Sinhgad, PCCOE, PICT, COEP, BITS, VIT, Harvard, or Oxford.
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
                <strong style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'block', marginTop: '2px' }}>{currentCollege.ranking?.split('•')[0] || 'Accredited'}</strong>
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
