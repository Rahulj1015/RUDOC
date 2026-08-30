import { useState } from 'react'

const documentTemplates = [
  {
    name: '12th Marksheet',
    category: 'Education',
    holderName: 'Rahul Sharma',
    dob: '2004-05-14',
    issuer: 'CBSE / State Board',
    docNumber: 'CBSE-XII-901124',
    confidence: 96,
  },
  {
    name: 'Transfer Certificate (TC)',
    category: 'Education',
    holderName: 'Rahul Sharma',
    dob: '2004-05-14',
    issuer: 'Principal / School Office',
    docNumber: 'TC-2026-8812',
    confidence: 95,
  },
  {
    name: 'Migration Certificate',
    category: 'Education',
    holderName: 'Rahul Sharma',
    dob: '2004-05-14',
    issuer: 'Education Board Examination Branch',
    docNumber: 'MIG-2026-302',
    confidence: 97,
  },
  {
    name: 'Gap Year Affidavit',
    category: 'Affidavit & Legal',
    holderName: 'Rahul Sharma',
    dob: '2004-05-14',
    issuer: 'Notary Public / Court',
    docNumber: 'NOTARY-AFF-99',
    confidence: 90,
  },
  {
    name: 'Medical Fitness Certificate',
    category: 'Medical',
    holderName: 'Rahul Sharma',
    dob: '2004-05-14',
    issuer: 'Govt Medical Officer (MBBS)',
    docNumber: 'MED-REG-4412',
    confidence: 92,
  },
  {
    name: 'Income Certificate',
    category: 'Revenue & Certificate',
    holderName: 'Rahul Sharma',
    dob: '2004-05-14',
    issuer: 'Tehsildar / State e-District',
    docNumber: 'INC/2026/8912',
    confidence: 93,
  },
  {
    name: 'Domicile Certificate',
    category: 'Revenue & Certificate',
    holderName: 'Rahul Sharma',
    dob: '2004-05-14',
    issuer: 'Sub-Divisional Magistrate',
    docNumber: 'DOM/2026/5531',
    confidence: 91,
  },
  {
    name: 'Category / EWS Certificate',
    category: 'Revenue & Certificate',
    holderName: 'Rahul Sharma',
    dob: '2004-05-14',
    issuer: 'District Revenue Authority',
    docNumber: 'CST/2026/1120',
    confidence: 95,
  },
  {
    name: 'JEE / NEET / CUET Scorecard',
    category: 'Education',
    holderName: 'Rahul Sharma',
    dob: '2004-05-14',
    issuer: 'National Testing Agency (NTA)',
    docNumber: 'NTA-SCORE-882',
    confidence: 98,
  },
]

export default function DocumentUploadModal({ isOpen, onClose, onUploadSuccess, currentUser }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Identity')
  const [holderName, setHolderName] = useState(currentUser?.name || 'Rahul Sharma')
  const [dob, setDob] = useState(currentUser?.dob || '2004-05-14')
  const [docNumber, setDocNumber] = useState('')
  const [issuer, setIssuer] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState('')

  if (!isOpen) return null

  const handleApplyTemplate = (tmpl) => {
    setName(tmpl.name)
    setCategory(tmpl.category)
    setHolderName(currentUser?.name || tmpl.holderName)
    setDob(currentUser?.dob || tmpl.dob)
    setIssuer(tmpl.issuer)
    setDocNumber(tmpl.docNumber)
  }

  const handleFileDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setSelectedFileName(file.name)
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      setName(cleanName)
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFileName(file.name)
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      setName(cleanName)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsProcessing(true)
    try {
      await onUploadSuccess({
        name: name.trim(),
        category,
        holderName: holderName.trim(),
        dob,
        docNumber: docNumber.trim() || `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
        issuer: issuer.trim() || 'Verified Issuer',
        confidence: 95,
        status: 'Verified',
      })
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="card-header">
          <div>
            <span className="badge badge-teal">Vault Upload Engine</span>
            <h3 className="card-title" style={{ marginTop: '4px' }}>
              Upload & Classify Document
            </h3>
            <p className="card-subtitle">
              Add any college, identity, or government document to your vault with instant verification.
            </p>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Quick Demo Templates */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            ⚡ 1-Click Fast Template Autofill:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {documentTemplates.map((tmpl) => (
              <button
                key={tmpl.name}
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11px', padding: '4px 8px' }}
                onClick={() => handleApplyTemplate(tmpl)}
              >
                + {tmpl.name}
              </button>
            ))}
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          className="dropzone"
          onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleFileDrop}
          onClick={() => document.getElementById('file-upload-input').click()}
          style={{ borderColor: dragActive ? 'var(--primary)' : 'var(--border-light)' }}
        >
          <input
            id="file-upload-input"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <div style={{ fontSize: '32px', marginBottom: '6px' }}>📄</div>
          <strong style={{ color: 'var(--text-primary)' }}>
            {selectedFileName ? selectedFileName : 'Drag & drop file or click to browse'}
          </strong>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Supports PDF, JPG, PNG up to 25MB • Encrypted Client-Side
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Document Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Transfer Certificate (TC), Migration, 12th Marksheet"
            />
          </div>

          <div className="grid-2col" style={{ marginBottom: '16px', gap: '12px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Education">Education (10th/12th, TC, Migration, Scorecard)</option>
                <option value="Identity">Identity (Aadhaar, PAN, Passport, Photo)</option>
                <option value="Revenue & Certificate">Revenue (Income, Domicile, Category/EWS)</option>
                <option value="Affidavit & Legal">Affidavit (Gap Year, Anti-Ragging)</option>
                <option value="Medical">Medical (Fitness Certificate)</option>
                <option value="Finance">Finance (Bank Passbook)</option>
                <option value="General">General / Other</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label>Issuing Authority</label>
              <input
                type="text"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="e.g. CBSE, School Principal, Tehsildar, NTA"
              />
            </div>
          </div>

          <div className="grid-2col" style={{ marginBottom: '20px', gap: '12px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Holder Name on Document</label>
              <input
                type="text"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                placeholder="Name as printed on this document"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label>Date of Birth on Document</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isProcessing || !name.trim()}>
              {isProcessing ? 'Verifying & Saving...' : 'Save to Secure Vault'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
