import { useState } from 'react'

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  users,
  onLogin,
  onRegister,
  onLogout,
}) {
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [dob, setDob] = useState('2004-05-14')
  const [goal, setGoal] = useState('')
  const [password, setPassword] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isRegisterMode) {
      onRegister({ name, email, dob, goal })
    } else {
      onLogin({ email })
    }
    onClose()
  }

  const handleQuickSwitch = (user) => {
    onLogin({ userId: user.id, email: user.email })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="card-header">
          <div>
            <span className="badge badge-teal">Account Portal</span>
            <h3 className="card-title" style={{ marginTop: '4px' }}>
              {isRegisterMode ? 'Create RUDOC Student Account' : 'Login to Your Vault'}
            </h3>
            <p className="card-subtitle">
              Access your personal verified documents, college checklists, and mismatch audits.
            </p>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Currently Logged in User Card */}
        {currentUser && (
          <div style={{
            background: 'var(--bg-main)',
            border: '1px solid var(--border-light)',
            padding: '14px 18px',
            borderRadius: '12px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                Currently Signed In
              </span>
              <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: '800' }}>
                {currentUser.name} ({currentUser.email})
              </h4>
              <span style={{ fontSize: '12px', color: 'var(--primary)' }}>{currentUser.role}</span>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              onClick={onLogout}
            >
              Sign Out
            </button>
          </div>
        )}

        {/* One-Click Demo Profile Switcher */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            ⚡ 1-Click Fast Profile Switcher:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {users.map((u) => (
              <div
                key={u.id}
                onClick={() => handleQuickSwitch(u)}
                style={{
                  background: currentUser?.id === u.id ? 'var(--primary-light)' : 'var(--bg-card)',
                  border: `1px solid ${currentUser?.id === u.id ? 'var(--primary)' : 'var(--border-light)'}`,
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{u.name}</strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>{u.email} • {u.role}</span>
                </div>
                <span className={`badge ${currentUser?.id === u.id ? 'badge-teal' : 'badge-green'}`}>
                  {currentUser?.id === u.id ? 'Active' : 'Switch →'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Login / Register Form */}
        <form onSubmit={handleSubmit} style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px', color: 'var(--text-primary)' }}>
            {isRegisterMode ? 'Sign up new applicant' : 'Or sign in with email:'}
          </h4>

          {isRegisterMode && (
            <div className="form-group">
              <label>Full Legal Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="As printed on 10th marksheet"
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. applicant@gmail.com"
            />
          </div>

          {isRegisterMode && (
            <div className="grid-2col" style={{ gap: '12px', marginBottom: '14px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Target Goal</label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. DU CSAS / JoSAA"
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Password / PIN</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter secure passcode"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsRegisterMode(!isRegisterMode)}
            >
              {isRegisterMode ? 'Already have an account? Login' : 'Need new account? Register'}
            </button>
            <button type="submit" className="btn btn-primary">
              {isRegisterMode ? 'Register & Enter Vault' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

