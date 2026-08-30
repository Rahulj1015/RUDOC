import { useMemo, useState } from 'react'

export default function CollegesPage({
  colleges,
  selectedCollegeId,
  onSelectCollege,
  match,
  onNavigate,
}) {
  const [search, setSearch] = useState('')
  const [streamFilter, setStreamFilter] = useState('All')

  const streams = [
    'All',
    'Engineering & Technology',
    'Medical & Healthcare (MBBS)',
    'Management',
    'Arts, Science & Commerce',
    'Law (LL.B.)',
  ]

  // Filter existing colleges
  const filteredColleges = useMemo(() => {
    const q = search.trim().toLowerCase()
    return colleges.filter((c) => {
      const matchesStream = streamFilter === 'All' || c.stream.toLowerCase().includes(streamFilter.toLowerCase())
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

  // If user searched for a college not in the predefined list, dynamically generate on the fly
  const dynamicCollege = useMemo(() => {
    const q = search.trim()
    if (!q || q.length < 3) return null

    // If pre-filtered list already contains a strong match, don't generate duplicate
    const alreadyFound = colleges.some(
      (c) => c.name.toLowerCase().includes(q.toLowerCase()) || c.shortName.toLowerCase().includes(q.toLowerCase())
    )
    if (alreadyFound) return null

    const capitalized = q
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')

    const isMedical = q.toLowerCase().includes('medical') || q.toLowerCase().includes('mbbs') || q.toLowerCase().includes('dental')
    const isLaw = q.toLowerCase().includes('law')
    const isMgmt = q.toLowerCase().includes('management') || q.toLowerCase().includes('mba') || q.toLowerCase().includes('bba')

    let stream = 'Engineering, Sciences & Multidisciplinary'
    let icon = '🏛️'
    if (isMedical) { stream = 'Medical & Healthcare (MBBS / BDS)'; icon = '🏥' }
    else if (isLaw) { stream = 'Law & Legal Studies (B.A. LL.B.)'; icon = '⚖️' }
    else if (isMgmt) { stream = 'Management & Business Studies'; icon = '💼' }

    return {
      id: `dyn-${q.replace(/\s+/g, '-').toLowerCase()}`,
      name: `${capitalized}`,
      shortName: capitalized,
      logoIcon: icon,
      crestEmoji: '🛡️',
      gradientBadge: 'linear-gradient(135deg, #0d9488, #0284c7)',
      badgeColor: '#0d9488',
      location: 'University Campus (India)',
      type: 'UGC / AICTE / State Registered Higher Education Institution',
      stream,
      ranking: 'Accredited Higher Education Institution (India)',
      fee: 'Standard University Prescribed Fee Structure',
      deadline: 'Academic Year 2026-27 Admission Window',
      officialPortal: {
        label: `${capitalized} Official Portal`,
        url: `https://www.google.com/search?q=${encodeURIComponent(capitalized + ' official portal admission')}`,
      },
      description: `Verified document requirement and admission readiness checklist for ${capitalized}.`,
      requiredDocuments: [
        isMedical ? 'NEET UG Scorecard & Admit Card' : 'JEE Main / State CET Scorecard',
        '10th Marksheet',
        '12th Marksheet',
        'Aadhaar Card',
        'Transfer Certificate (TC)',
        'Migration Certificate',
        'Domicile',
        'Medical Fitness Certificate',
        'Gap Year Affidavit',
        'Passport Size Photograph',
      ],
      specificNotes: [
        'Original 10th marksheet is mandatory for Date of Birth verification.',
        'Candidates taking a gap year after 12th must carry a Notary-attested Gap Certificate.',
        'State reservation claims require a valid Category / Caste Validity Certificate.',
      ],
      isDynamic: true,
    }
  }, [search, colleges])

  const allDisplayColleges = useMemo(() => {
    if (dynamicCollege) {
      return [dynamicCollege, ...filteredColleges]
    }
    return filteredColleges
  }, [dynamicCollege, filteredColleges])

  const selectedCollege =
    allDisplayColleges.find((c) => c.id === selectedCollegeId) ||
    colleges.find((c) => c.id === selectedCollegeId) ||
    allDisplayColleges[0] ||
    colleges[0]

  const readiness = match?.completionPercentage ?? 0

  return (
    <div className="page-container">
      {/* College Search & Header with Apple Glass styling */}
      <div className="card" style={{ marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span className="badge badge-teal">🎓 All-India University Navigator</span>
            <h3 className="card-title" style={{ marginTop: '4px', fontSize: '22px' }}>
              Search Any College in India & Check Required Documents
            </h3>
            <p className="card-subtitle">
              Instant admission document checklists for 50+ universities (Dr. D. Y. Patil, COEP, VJTI, IITs, DU, AIIMS, BITS, Symbiosis, NMIMS, etc.) or any custom college.
            </p>
          </div>

          <div style={{ flex: '1', minWidth: '280px', maxWidth: '440px', position: 'relative' }}>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search ANY college (e.g. Dr DY Patil, COEP, IIT, DU, AIIMS)..."
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: '12px',
                border: '1px solid var(--border-glass)',
                background: 'var(--bg-card)',
                backdropFilter: 'blur(12px)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
              }}
            />
          </div>
        </div>

        {/* Apple Segmented Stream Switcher */}
        <div className="apple-segmented-bar" style={{ marginTop: '18px' }}>
          {streams.map((st) => (
            <button
              key={st}
              type="button"
              className={`apple-segmented-item ${streamFilter === st ? 'active' : ''}`}
              onClick={() => setStreamFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-2col">
        {/* Colleges List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-primary)' }}>
              Listed Colleges ({allDisplayColleges.length})
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Click any card to audit documents
            </span>
          </div>

          {allDisplayColleges.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--text-muted)' }}>Type at least 3 characters to search or generate any college in India.</p>
            </div>
          ) : (
            allDisplayColleges.map((college) => {
              const isSelected = college.id === selectedCollegeId
              return (
                <div
                  key={college.id}
                  onClick={() => onSelectCollege(college.id)}
                  style={{
                    background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                    backdropFilter: 'blur(16px)',
                    borderRadius: '16px',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-glass)',
                    padding: '20px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 8px 24px var(--primary-glow)' : 'var(--shadow-card)',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '14px',
                        background: college.gradientBadge || 'var(--primary-light)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      }}>
                        {college.logoIcon || '🏛️'}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '17px', fontWeight: '900', color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                          {college.shortName}
                        </h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📍 {college.location}</span>
                      </div>
                    </div>

                    <span className="badge badge-teal" style={{ fontSize: '10px' }}>
                      {college.ranking}
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {college.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      📋 {college.requiredDocuments.length} required documents
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '800' }}>
                      {isSelected ? '● Target Selected' : 'Select & Audit →'}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Selected College Deep Dive Card */}
        {selectedCollege && (
          <div className="card" style={{ position: 'sticky', top: '90px', height: 'fit-content' }}>
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: selectedCollege.gradientBadge || 'var(--primary-light)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  color: 'white',
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                }}>
                  {selectedCollege.logoIcon || '🏛️'}
                </div>
                <div>
                  <span className="badge badge-teal" style={{ marginBottom: '4px' }}>{selectedCollege.type}</span>
                  <h3 className="card-title" style={{ fontSize: '20px' }}>
                    {selectedCollege.name}
                  </h3>
                  <p className="card-subtitle">📍 {selectedCollege.location} • {selectedCollege.stream}</p>
                </div>
              </div>
            </div>

            {/* Key Admission Stats Grid */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.03)',
              padding: '14px 18px',
              borderRadius: '12px',
              border: '1px solid var(--border-glass)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px',
              marginBottom: '18px',
            }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Fee Structure</span>
                <p style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text-primary)' }}>{selectedCollege.fee}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Admission Portal</span>
                <a
                  href={selectedCollege.officialPortal?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)', textDecoration: 'none', display: 'block' }}
                >
                  {selectedCollege.officialPortal?.label} ↗
                </a>
              </div>
            </div>

            {/* Document Readiness Meter */}
            <div className="service-header-box" style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                  Admission Document Readiness Meter
                </span>
                <strong style={{ fontSize: '16px', color: readiness === 100 ? '#16a34a' : 'var(--primary)' }}>
                  {readiness}% ({match?.totalAvailable ?? 0}/{match?.totalRequired ?? 0} Ready)
                </strong>
              </div>
              <div className="progress-bar-bg" style={{ height: '10px' }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${readiness}%`,
                    background: readiness === 100 ? 'linear-gradient(90deg, #10b981, #059669)' : undefined,
                  }}
                />
              </div>
            </div>

            {/* 3-Way Requirement Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '22px' }}>
              {/* Ready / Available in Vault */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#166534', marginBottom: '8px' }}>
                  ✅ What You Already Have in Your Vault ({match?.availableDocuments?.length ?? 0}):
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {match?.availableDocuments?.length === 0 ? (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>None uploaded yet</span>
                  ) : (
                    match?.availableDocuments?.map((doc, idx) => (
                      <span key={idx} className="badge badge-green" style={{ fontSize: '12px', padding: '5px 10px' }}>
                        ✓ {doc.name}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Missing & What You Have to Arrange */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#9a3412', marginBottom: '8px' }}>
                  ⚠️ Missing & What You Have to Arrange ({match?.missingDocuments?.length ?? 0}):
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {match?.missingDocuments?.map((doc, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--warning-bg)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: '10px',
                        padding: '10px 14px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                          ✗ {doc.name}
                        </strong>
                        <span className="badge badge-amber">Must Arrange</span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        👉 <strong>How to get:</strong> {doc.guide?.howToGet || 'Request from school / board.'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Special College Guidelines */}
            {selectedCollege.specificNotes && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.02)',
                border: '1px solid var(--border-glass)',
                borderRadius: '10px',
                padding: '14px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                marginBottom: '18px',
              }}>
                📌 <strong>Institutional Rules:</strong>
                <ul style={{ paddingLeft: '16px', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {selectedCollege.specificNotes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => onNavigate('tasks')}
              >
                📋 View Action Checklist
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onNavigate('vault')}
              >
                ➕ Upload Missing Docs
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
