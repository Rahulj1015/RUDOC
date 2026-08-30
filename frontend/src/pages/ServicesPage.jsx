import { useState } from 'react'

export default function ServicesPage({
  services,
  selectedServiceId,
  onSelectService,
  match,
  onCreateTasks,
  onNavigate,
}) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')

  const categories = [
    'All',
    'Competitive & Civil Services',
    'Education & Admissions',
    'Government ID & Identity',
    'Scholarship & Welfare',
    'Travel & Identity',
    'Finance & Tax',
  ]

  const filteredServices = services.filter((svc) => {
    const matchesCat = categoryFilter === 'All' || svc.category.toLowerCase().includes(categoryFilter.toLowerCase())
    const q = search.trim().toLowerCase()
    const matchesSearch =
      !q ||
      svc.title.toLowerCase().includes(q) ||
      svc.description.toLowerCase().includes(q) ||
      svc.category.toLowerCase().includes(q) ||
      svc.requiredDocuments.some((d) => d.toLowerCase().includes(q))
    return matchesCat && matchesSearch
  })

  const selectedService = services.find((s) => s.id === selectedServiceId) || filteredServices[0] || services[0]
  const readiness = match?.completionPercentage ?? 0

  return (
    <div className="page-container">
      {/* Search & Filter Header */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span className="badge badge-teal">🏛️ Citizen & Competitive Services</span>
            <h3 className="card-title" style={{ marginTop: '4px', fontSize: '22px' }}>
              Government Services & Competitive Exam Checklists
            </h3>
            <p className="card-subtitle">
              Verify required documents for UPSC Civil Services, Aadhaar correction, NSP Scholarships, Passports, and PAN Card.
            </p>
          </div>

          <div style={{ flex: '1', minWidth: '280px', maxWidth: '440px' }}>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search UPSC, Aadhaar, Passport, Scholarship, PAN..."
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: '12px',
                border: '1px solid var(--border-glass)',
                background: 'var(--bg-card)',
                backdropFilter: 'blur(10px)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '18px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCategoryFilter(cat)}
              style={{ fontSize: '11px', padding: '5px 12px' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-2col">
        {/* Service Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-primary)' }}>
              Available Services ({filteredServices.length})
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Click to match against vault</span>
          </div>

          {filteredServices.map((service) => {
            const isSelected = service.id === selectedServiceId
            return (
              <div
                key={service.id}
                onClick={() => onSelectService(service.id)}
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
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'var(--primary-light)',
                      border: '1px solid var(--primary-glow)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
                    }}>
                      {service.badgeIcon || '🏛️'}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '17px', fontWeight: '900', color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                        {service.title}
                      </h4>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        📂 {service.category}
                      </span>
                    </div>
                  </div>

                  <span className="badge badge-teal" style={{ fontSize: '10px' }}>
                    📅 {service.deadline}
                  </span>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {service.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '10px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    📋 {service.requiredDocuments.length} required documents
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '800' }}>
                    {isSelected ? '● Currently Selected' : 'Click to Match →'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Selected Service In-Depth Matcher */}
        {selectedService && (
          <div className="card" style={{ position: 'sticky', top: '90px', height: 'fit-content' }}>
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '14px',
                  background: 'var(--primary-light)',
                  border: '1px solid var(--primary-glow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                }}>
                  {selectedService.badgeIcon || '🏛️'}
                </div>
                <div>
                  <span className="badge badge-teal" style={{ marginBottom: '4px' }}>{selectedService.category}</span>
                  <h3 className="card-title" style={{ fontSize: '20px' }}>{selectedService.title}</h3>
                  <p className="card-subtitle">{selectedService.description}</p>
                </div>
              </div>
            </div>

            {/* Official Fee & Portal */}
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
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Official Fee</span>
                <p style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text-primary)' }}>{selectedService.fee || 'Varies'}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Official Route</span>
                <a
                  href={selectedService.officialPortal?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)', textDecoration: 'none', display: 'block' }}
                >
                  {selectedService.officialPortal?.label} ↗
                </a>
              </div>
            </div>

            {/* Readiness Bar */}
            <div className="service-header-box" style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                  Vault Readiness Meter
                </span>
                <strong style={{ fontSize: '16px', color: readiness === 100 ? '#16a34a' : 'var(--primary)' }}>
                  {readiness}% Ready ({match?.totalAvailable ?? 0}/{match?.totalRequired ?? 0})
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

            {/* Document Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Required Documents Checklist:
              </h4>

              {selectedService.requiredDocuments.map((docName) => {
                const isReady = match?.availableDocuments?.some((d) => d.name === docName)
                return (
                  <div
                    key={docName}
                    style={{
                      background: isReady ? 'var(--success-bg)' : 'var(--warning-bg)',
                      border: `1px solid ${isReady ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                      borderRadius: '10px',
                      padding: '10px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                        {isReady ? '✓' : '✗'} {docName}
                      </strong>
                    </div>
                    <span className={`badge ${isReady ? 'badge-green' : 'badge-amber'}`}>
                      {isReady ? 'In Vault' : 'Missing'}
                    </span>
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={onCreateTasks}
              >
                📋 Build Missing Document Task Plan
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%' }}
                onClick={() => onNavigate('guide')}
              >
                🏛️ View Official Step-by-Step Guide
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
