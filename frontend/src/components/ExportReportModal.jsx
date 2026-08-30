export default function ExportReportModal({ isOpen, onClose, selectedService, match, auditData, profile }) {
  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <div className="card-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img
              src="/logo.png"
              alt="RUDOC Official"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                objectFit: 'cover',
                border: '1px solid #cbd5e1',
              }}
            />
            <div>
              <span className="badge badge-teal" style={{ marginBottom: '4px' }}>Official Application Audit</span>
              <h3 className="card-title" style={{ margin: 0 }}>RUDOC Document Readiness Report</h3>
              <p className="card-subtitle">Candidate: {profile?.name || 'Applicant'} • Generated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Target Service Card */}
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Target Application</span>
                <h4 style={{ fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>{selectedService?.title}</h4>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '20px', fontWeight: '800', color: match?.completionPercentage === 100 ? '#16a34a' : '#0d9488' }}>
                  {match?.completionPercentage ?? 0}%
                </span>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Ready</span>
              </div>
            </div>
            {selectedService?.officialPortal?.url && (
              <p style={{ fontSize: '12px', color: '#0d9488', marginTop: '6px' }}>
                Official Link: {selectedService.officialPortal.url}
              </p>
            )}
          </div>

          {/* Identity Audit Status */}
          <div style={{
            background: auditData?.issues?.length === 0 ? '#f0fdf4' : '#fffbeb',
            border: `1px solid ${auditData?.issues?.length === 0 ? '#bbf7d0' : '#fef3c7'}`,
            padding: '12px 14px',
            borderRadius: '8px',
          }}>
            <strong style={{ fontSize: '13px', color: auditData?.issues?.length === 0 ? '#166534' : '#92400e' }}>
              🔍 Identity & Spelling Consistency: {auditData?.issues?.length === 0 ? 'Passed (100% Match)' : `${auditData?.issues?.length} Potential Issues`}
            </strong>
            <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
              {auditData?.summary}
            </p>
          </div>

          {/* Available Documents */}
          <div>
            <h5 style={{ fontSize: '13px', fontWeight: '700', color: '#166534', marginBottom: '8px' }}>
              ✅ Verified & Available Documents ({match?.availableDocuments?.length ?? 0}):
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {match?.availableDocuments?.map((doc, i) => (
                <li key={i} style={{ background: '#f0fdf4', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: '#166534', display: 'flex', justifyContent: 'space-between' }}>
                  <span>✓ {doc.name}</span>
                  <span style={{ color: '#15803d', fontWeight: '700' }}>Matched ({doc.matchedDocName})</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Missing Documents */}
          {match?.missingDocuments?.length > 0 && (
            <div>
              <h5 style={{ fontSize: '13px', fontWeight: '700', color: '#9a3412', marginBottom: '8px' }}>
                ⚠️ Missing Documents To Procure ({match?.missingDocuments?.length}):
              </h5>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {match?.missingDocuments?.map((doc, i) => (
                  <li key={i} style={{ background: '#fff7ed', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: '#9a3412', display: 'flex', justifyContent: 'space-between' }}>
                    <span>✗ {doc.name}</span>
                    <span style={{ color: '#c2410c' }}>Source: {doc.guide?.source || 'Official Portal'}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            RUDOC Assistant • Not an official govt endorsement
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button type="button" className="btn btn-primary" onClick={handlePrint}>
              🖨️ Print / Save PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

