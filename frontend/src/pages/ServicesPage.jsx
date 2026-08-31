import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL ?? ''

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
  const [aadhaarCenters, setAadhaarCenters] = useState([])
  const [activeSubTab, setActiveSubTab] = useState('services') // 'services' | 'aadhaar-centers'
  const [selectedCity, setSelectedCity] = useState('All')

  const categories = [
    'All',
    'Civil Services & Defense',
    'Government ID & Identity',
    'Travel & Identity',
    'Finance & Tax',
    'Scholarships & Grants',
    'Transport & Licence',
  ]

  useEffect(() => {
    fetch(`${API_URL}/api/aadhaar-centers`)
      .then((res) => (res.ok ? res.json() : { aadhaarCenters: [] }))
      .then((data) => setAadhaarCenters(data.aadhaarCenters || []))
      .catch(() => setAadhaarCenters([]))
  }, [])

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

  const cities = ['All', 'Pune', 'Mumbai', 'New Delhi', 'Bengaluru', 'Hyderabad', 'Kolkata', 'Ahmedabad']

  const filteredCenters = aadhaarCenters.filter((c) => {
    const matchesCity = selectedCity === 'All' || c.city.toLowerCase().includes(selectedCity.toLowerCase())
    const q = search.trim().toLowerCase()
    const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q) || c.city.toLowerCase().includes(q)
    return matchesCity && matchesSearch
  })

  return (
    <div className="page-container">
      {/* Search & Sub-Navigation Header */}
      <div className="section-header-banner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span className="badge badge-teal">National Portals & Civil Schemes</span>
            <h2 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--text-primary)', marginTop: '4px' }}>
              🏛️ Government Portals & Aadhaar Center Locator
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '750px', marginTop: '4px' }}>
              Verify required documents for UPSC Civil Services, Passport Seva, PAN-Aadhaar, Scholarships, and locate nearest UIDAI Kendra.
            </p>
          </div>

          {/* Sub Tab Switcher */}
          <div className="apple-segmented-bar">
            <button
              type="button"
              className={`apple-segmented-item ${activeSubTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('services')}
            >
              🎯 Govt & Civil Services
            </button>
            <button
              type="button"
              className={`apple-segmented-item ${activeSubTab === 'aadhaar-centers' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('aadhaar-centers')}
            >
              📍 Aadhaar Seva Kendra Locator
            </button>
          </div>
        </div>
      </div>

      {/* 1. SERVICES TAB */}
      {activeSubTab === 'services' && (
        <>
          {/* Categories Pill Bar */}
          <div className="apple-segmented-bar" style={{ margin: '20px 0 16px 0' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`apple-segmented-item ${categoryFilter === cat ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ marginBottom: '24px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="🔍 Search UPSC Civil Services, Passport Tatkaal, Aadhaar Update, NSP Scholarships, PAN Card..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '14px 18px', fontSize: '15px' }}
            />
          </div>

          {/* 2-Column Split: Services Directory & Live Audit */}
          <div className="match-columns">
            {/* Left Column: Services List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  Available Government Schemes & Portals ({filteredServices.length})
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Click to check eligibility</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '720px', overflowY: 'auto', paddingRight: '4px' }}>
                {filteredServices.map((svc) => {
                  const isSelected = selectedService?.id === svc.id
                  return (
                    <div
                      key={svc.id}
                      className={`college-card-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => onSelectService(svc.id)}
                      style={{
                        background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-glass)',
                        borderRadius: '16px',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'var(--spring-transition)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            background: svc.badgeColor || 'var(--primary-gradient)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '22px',
                            color: 'white',
                            flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          }}
                        >
                          {svc.badgeIcon || '🏛️'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                            {svc.title}
                          </h4>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                            {svc.category} • Fee: {svc.fee}
                          </span>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                            <span className="badge badge-teal" style={{ fontSize: '10px' }}>
                              ⏱️ {svc.deadline}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right Column: Live Requirement Gap Audit */}
            {selectedService && (
              <div style={{ background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border-glass)', padding: '24px', position: 'sticky', top: '90px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-glass)', paddingBottom: '18px' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '16px',
                        background: selectedService.badgeColor || 'var(--primary-gradient)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '26px',
                        color: 'white',
                        boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
                      }}
                    >
                      {selectedService.badgeIcon || '🏛️'}
                    </div>
                    <div>
                      <span className="badge badge-teal" style={{ marginBottom: '4px' }}>Target Service Portal</span>
                      <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
                        {selectedService.title}
                      </h3>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {selectedService.category} • Deadline: {selectedService.deadline}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: readiness === 100 ? '#10b981' : 'var(--primary)' }}>
                      {readiness}%
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>Readiness Score</span>
                  </div>
                </div>

                {/* Portal Link */}
                {selectedService.officialPortal?.url && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--primary-light)', padding: '10px 14px', borderRadius: '12px', margin: '18px 0' }}>
                    <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700' }}>
                      🌐 Official Portal: {selectedService.officialPortal.label}
                    </span>
                    <a
                      href={selectedService.officialPortal.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ textDecoration: 'none' }}
                    >
                      Open Official Link ↗
                    </a>
                  </div>
                )}

                {/* Requirements Gap Matrix */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '360px', overflowY: 'auto' }}>
                  {/* Matched */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <span style={{ color: '#10b981', fontWeight: '800' }}>✓</span>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>
                        Matched in Vault ({match?.matchedCount ?? 0} / {match?.totalRequired ?? 0})
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {match?.availableDocuments?.map((d, i) => (
                        <span key={i} className="badge badge-teal" style={{ padding: '6px 12px', fontSize: '12px' }}>
                          ✓ {d.requiredName} {d.isEquivalentMatch && <span style={{ opacity: 0.8 }}>(via {d.userDocName})</span>}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <span style={{ color: '#ef4444', fontWeight: '800' }}>✕</span>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>
                        Missing Requirements ({match?.missingCount ?? 0})
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
                          <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{doc.name}</strong>
                          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                            {doc.guide?.nextStep || 'Procure from designated government office.'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => {
                      onCreateTasks(selectedService.id)
                      onNavigate('tasks')
                    }}
                  >
                    📋 Generate Missing Document Procurement Tasks
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* 2. AADHAAR SEVA KENDRA LOCATOR TAB */}
      {activeSubTab === 'aadhaar-centers' && (
        <div style={{ marginTop: '20px' }}>
          {/* City Filter Bar */}
          <div className="apple-segmented-bar" style={{ marginBottom: '20px' }}>
            {cities.map((city) => (
              <button
                key={city}
                type="button"
                className={`apple-segmented-item ${selectedCity === city ? 'active' : ''}`}
                onClick={() => setSelectedCity(city)}
              >
                {city}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
            {filteredCenters.map((center) => (
              <div
                key={center.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="badge badge-teal">UIDAI Verified Center</span>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)' }}>📍 {center.city}</span>
                </div>

                <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                  {center.name}
                </h4>

                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                  🏢 {center.address}
                </p>

                <div style={{ background: 'rgba(0,0,0,0.03)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-glass)', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <strong>⏱️ Timings:</strong> {center.timings}
                  <div style={{ marginTop: '4px' }}>
                    <strong>🛠️ Services:</strong> {center.servicesOffered}
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                  <a
                    href={center.bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', textDecoration: 'none', textAlign: 'center' }}
                  >
                    📅 Book UIDAI Appointment Online ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
