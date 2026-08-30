import { useState } from 'react'

export default function DocumentsPage({
  documents,
  profile,
  onOpenUpload,
  onDeleteDocument,
  onNavigate,
}) {
  const [filterCategory, setFilterCategory] = useState('All')

  const categories = ['All', 'Identity', 'Education', 'Revenue & Certificate', 'Finance']

  const filteredDocs = documents.filter(
    (d) => filterCategory === 'All' || d.category === filterCategory
  )

  return (
    <div className="page-container">
      {/* Vault Header Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 className="card-title">🔐 Personal Document Vault</h3>
            <p className="card-subtitle">
              Encrypted, verified store of all your identity, academic, and certificate documents.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('mismatches')}
            >
              🔍 Check Spelling & Mismatches
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onOpenUpload}
            >
              ➕ Upload Document
            </button>
          </div>
        </div>

        {/* Master Identity Summary */}
        <div style={{ marginTop: '16px', padding: '12px 16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Master Profile Name</span>
            <p style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{profile?.name || 'Applicant'}</p>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Registered DOB</span>
            <p style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{profile?.dob || '2004-05-14'}</p>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Total Vault Files</span>
            <p style={{ fontSize: '14px', fontWeight: '800', color: '#0d9488' }}>{documents.length} Documents</p>
          </div>
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`btn btn-sm ${filterCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Vault Grid */}
      <div className="vault-grid">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="vault-card">
            <div>
              <div className="vault-card-top">
                <span className="badge badge-teal">{doc.category}</span>
                <span className={`badge ${doc.status === 'Verified' ? 'badge-green' : 'badge-amber'}`}>
                  {doc.status}
                </span>
              </div>

              <h4 className="doc-name">{doc.name}</h4>

              <div className="doc-meta">
                <div className="doc-meta-row">
                  <span>Name on Doc:</span>
                  <strong>{doc.holderName || 'N/A'}</strong>
                </div>
                <div className="doc-meta-row">
                  <span>DOB on Doc:</span>
                  <strong>{doc.dob || 'N/A'}</strong>
                </div>
                <div className="doc-meta-row">
                  <span>Doc ID/No:</span>
                  <strong>{doc.docNumber || 'DOC-XXXX'}</strong>
                </div>
                <div className="doc-meta-row">
                  <span>Issuer:</span>
                  <strong>{doc.issuer || 'Official Issuer'}</strong>
                </div>
              </div>

              <div style={{ margin: '8px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                  <span>OCR Confidence</span>
                  <strong>{doc.confidence ?? 95}%</strong>
                </div>
                <div className="progress-bar-bg" style={{ height: '6px' }}>
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${doc.confidence ?? 95}%` }}
                  />
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                Updated {doc.updatedAt || 'Recently'}
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ color: '#ef4444', borderColor: '#fecaca', padding: '2px 8px', fontSize: '11px' }}
                onClick={() => onDeleteDocument(doc.id)}
              >
                🗑️ Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

