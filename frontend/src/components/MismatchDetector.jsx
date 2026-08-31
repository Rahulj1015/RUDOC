export default function MismatchDetector({ auditData, documents, onRunAudit }) {
  const issues = auditData?.issues || []
  const overallScore = auditData?.overallScore ?? 100
  const isClean = issues.length === 0

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <span className="badge badge-teal">AI Identity Consistency Engine</span>
          <h3 className="card-title" style={{ marginTop: '4px' }}>🔍 Cross-Document Identity & Spelling Audit</h3>
          <p className="card-subtitle">
            Audits your 10th Marksheet benchmark against Aadhaar, PAN, and certificates to prevent admission rejection.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className={`badge ${isClean ? 'badge-green' : overallScore < 70 ? 'badge-red' : 'badge-amber'}`}>
            {isClean ? '✅ 100% Consistent' : `⚠️ Consistency Score: ${overallScore}/100`}
          </span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onRunAudit}>
            🔄 Re-scan Vault
          </button>
        </div>
      </div>

      {isClean ? (
        <div style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '16px',
          padding: '28px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎉</div>
          <h4 style={{ color: '#10b981', fontSize: '18px', fontWeight: '800' }}>
            No Discrepancies Detected!
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '540px', margin: '8px auto 0' }}>
            All your uploaded official certificates match across Candidate Name and Date of Birth. Your documents are 100% ready for JoSAA / CSAS / UPSC submissions!
          </p>
        </div>
      ) : (
        <div>
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '12px',
            padding: '14px 18px',
            marginBottom: '18px',
            fontSize: '13px',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <span>
              <strong>Attention Required:</strong> {issues.length} item(s) flagged across your official documents. Follow the verified fixes below.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {issues.map((issue, idx) => {
              const docAName = issue.docA?.name || issue.docA || 'Benchmark Document'
              const docAVal = issue.docA?.value || issue.valA || ''
              const docBName = issue.docB?.name || issue.docB || 'Compared Document'
              const docBVal = issue.docB?.value || issue.valB || ''
              const fix = issue.recommendation || issue.advice || 'Verify document consistency.'

              return (
                <div
                  key={idx}
                  className={`mismatch-card ${issue.severity === 'HIGH' ? 'high' : ''}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge ${issue.severity === 'HIGH' ? 'badge-red' : 'badge-amber'}`}>
                        {issue.severity === 'HIGH' ? '🚨 High Risk Discrepancy' : '⚠️ Minor Variation'}
                      </span>
                      <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{issue.type}</strong>
                    </div>
                    {issue.similarity > 0 && (
                      <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)' }}>
                        Fuzzy Match: {issue.similarity}%
                      </span>
                    )}
                  </div>

                  <div className="mismatch-compare-row">
                    <div className="compare-box">
                      <span>{docAName}</span>
                      <strong>{docAVal}</strong>
                    </div>
                    <span style={{ fontSize: '20px', color: 'var(--text-muted)' }}>≠</span>
                    <div className="compare-box">
                      <span>{docBName}</span>
                      <strong>{docBVal}</strong>
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '10px 0 6px 0' }}>
                    {issue.message}
                  </p>

                  <div style={{
                    background: 'var(--primary-light)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                    lineHeight: '1.5',
                  }}>
                    💡 <strong>Expert Legal & Admission Fix:</strong> {fix}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
