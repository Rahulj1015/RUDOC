export default function GuidePage({ service }) {
  if (!service) {
    return (
      <div className="page-container">
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p>Please select a service from the Services tab to view its official route guide.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Official Route Card */}
      <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)', borderColor: '#99f6e4' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-teal" style={{ marginBottom: '6px' }}>Verified Official Route</span>
            <h3 className="card-title" style={{ fontSize: '20px' }}>{service.title}</h3>
            <p style={{ fontSize: '14px', color: '#0f766e', marginTop: '4px' }}>
              Portal: <strong>{service.officialPortal.label}</strong>
            </p>
          </div>

          {service.officialPortal.url && (
            <a
              href={service.officialPortal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ textDecoration: 'none' }}
            >
              🚀 Open Official Portal ↗
            </a>
          )}
        </div>
      </div>

      {/* 2-Column Guide Details */}
      <div className="grid-2col">
        {/* Step-by-Step Flow */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '16px' }}>
            📋 Standard Application Roadmap
          </h3>

          <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {service.steps.map((step, idx) => (
              <li key={idx} style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Common Pitfalls & Rejection Reasons */}
        <div className="card" style={{ borderColor: '#fed7aa' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <h3 className="card-title" style={{ color: '#9a3412' }}>
              Common Rejection Pitfalls
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(service.commonPitfalls || [
              'Spelling discrepancies between 10th marksheet and Aadhaar card.',
              'Certificates expired or older than the permissible date range.',
              'Blurry, rotated, or illegible document scans.',
            ]).map((pitfall, idx) => (
              <div
                key={idx}
                style={{
                  background: '#fff7ed',
                  border: '1px solid #ffedd5',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '13px',
                  color: '#9a3412',
                  lineHeight: '1.5',
                }}
              >
                ⛔ {pitfall}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b' }}>
            🛡️ <strong>Safety Disclaimer:</strong> RUDOC is an independent preparation assistant. Always review the latest bulletin and guidelines on the official government or institution portal before final submission.
          </div>
        </div>
      </div>
    </div>
  )
}

