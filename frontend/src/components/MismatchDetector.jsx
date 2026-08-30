export default function MismatchDetector({ auditData, documents, onRunAudit }) {
  const issues = auditData?.issues || []
  const overallScore = auditData?.overallScore ?? 100
  const isClean = issues.length === 0

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">🔍 Cross-Document Identity & Spelling Audit</h3>
          <p className="card-subtitle">
            Government & Admission portals reject up to 35% of applications due to minor spelling or DOB differences across ID proofs.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className={`badge ${isClean ? 'badge-green' : overallScore < 70 ? 'badge-red' : 'badge-amber'}`}>
            {isClean ? '✅ 100% Consistent' : `⚠️ Audit Score: ${overallScore}/100`}
          </span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onRunAudit}>
            🔄 Re-scan Vault
          </button>
        </div>
      </div>

      {isClean ? (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
          <h4 style={{ color: '#166534', fontSize: '16px', fontWeight: '800' }}>
            No Discrepancies Detected!
          </h4>
          <p style={{ color: '#15803d', fontSize: '13px', maxWidth: '500px', margin: '6px auto 0' }}>
            All your uploaded documents match in Name and Date of Birth. Your documents are in prime condition for official portal submissions.
          </p>
        </div>
      ) : (
        <div>
          <div style={{
            background: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            fontSize: '13px',
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>⚠️</span>
            <span>
              <strong>Attention Required:</strong> {issues.length} discrepancy warning(s) found across {documents.length} documents. Check details below before submitting.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {issues.map((issue, idx) => (
              <div
                key={idx}
                className={`mismatch-card ${issue.severity === 'HIGH' ? 'high' : ''}`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${issue.severity === 'HIGH' ? 'badge-red' : 'badge-amber'}`}>
                      {issue.severity === 'HIGH' ? 'High Risk Mismatch' : 'Moderate Difference'}
                    </span>
                    <strong style={{ fontSize: '14px', color: '#0f172a' }}>{issue.type.replace('_', ' ')}</strong>
                  </div>
                  {issue.similarity > 0 && (
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>
                      Similarity: {issue.similarity}%
                    </span>
                  )}
                </div>

                <div className="mismatch-compare-row">
                  <div className="compare-box">
                    <span>{issue.docA.name}</span>
                    <strong>{issue.docA.value}</strong>
                  </div>
                  <span style={{ fontSize: '18px', color: '#94a3b8' }}>≠</span>
                  <div className="compare-box">
                    <span>{issue.docB.name}</span>
                    <strong>{issue.docB.value}</strong>
                  </div>
                </div>

                <p style={{ fontSize: '13px', color: '#334155', margin: '8px 0 4px' }}>
                  {issue.message}
                </p>

                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: '#475569',
                }}>
                  💡 <strong>Expert Fix:</strong> {issue.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

