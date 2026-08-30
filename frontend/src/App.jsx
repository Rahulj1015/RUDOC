import { useCallback, useEffect, useState } from 'react'
import './App.css'
import AIAssistant from './components/AIAssistant'
import AuthModal from './components/AuthModal'
import DocumentUploadModal from './components/DocumentUploadModal'
import ExportReportModal from './components/ExportReportModal'
import MismatchDetector from './components/MismatchDetector'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import CollegesPage from './pages/CollegesPage'
import DocumentsPage from './pages/DocumentsPage'
import GuidePage from './pages/GuidePage'
import OverviewPage from './pages/OverviewPage'
import ServicesPage from './pages/ServicesPage'
import TasksPage from './pages/TasksPage'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:4000'

export default function App() {
  const [activeTab, setActiveTab] = useState('overview')
  const [theme, setTheme] = useState(() => localStorage.getItem('rudoc-theme') || 'light')

  // Auth & Profile
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState([])
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  // Services & Colleges
  const [services, setServices] = useState([])
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [colleges, setColleges] = useState([])
  const [selectedCollegeId, setSelectedCollegeId] = useState('')

  // Vault & Matches
  const [documents, setDocuments] = useState([])
  const [overview, setOverview] = useState(null)
  const [match, setMatch] = useState(null)
  const [collegeMatch, setCollegeMatch] = useState(null)
  const [tasks, setTasks] = useState([])
  const [auditData, setAuditData] = useState(null)
  const [error, setError] = useState('')

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)

  // Apply theme to HTML root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('rudoc-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : prev === 'dark' ? 'emerald' : 'light'))
  }

  // Run Mismatch Audit
  const runAudit = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/audit/mismatches`)
      if (res.ok) {
        const data = await res.json()
        setAuditData(data)
      }
    } catch (err) {
      console.warn('Audit fetch error:', err)
    }
  }, [])

  // Load Service Match
  const loadServiceMatch = useCallback(async (serviceId) => {
    if (!serviceId) return
    try {
      const [matchRes, tasksRes] = await Promise.all([
        fetch(`${API_URL}/api/match/${serviceId}`),
        fetch(`${API_URL}/api/tasks/${serviceId}`),
      ])

      if (matchRes.ok) {
        const matchData = await matchRes.json()
        setMatch(matchData)
      }
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json()
        setTasks(tasksData.tasks || [])
      }
    } catch (err) {
      console.warn('Match fetch error:', err)
    }
  }, [])

  // Load College Match
  const loadCollegeMatch = useCallback(async (collegeId) => {
    if (!collegeId) return
    try {
      const res = await fetch(`${API_URL}/api/colleges/${collegeId}/match`)
      if (res.ok) {
        const data = await res.json()
        setCollegeMatch(data)
      }
    } catch (err) {
      console.warn('College match fetch error:', err)
    }
  }, [])

  // Fetch initial data
  const loadInitialData = useCallback(async () => {
    try {
      const [servicesRes, collegesRes, docsRes, overviewRes, auditRes, authRes] = await Promise.all([
        fetch(`${API_URL}/api/services`),
        fetch(`${API_URL}/api/colleges`),
        fetch(`${API_URL}/api/user/documents`),
        fetch(`${API_URL}/api/overview`),
        fetch(`${API_URL}/api/audit/mismatches`),
        fetch(`${API_URL}/api/auth/users`),
      ])

      if (servicesRes.ok && docsRes.ok && overviewRes.ok) {
        const servicesData = await servicesRes.json()
        const collegesData = collegesRes.ok ? await collegesRes.json() : { colleges: [] }
        const docsData = await docsRes.json()
        const overviewData = await overviewRes.json()
        const audit = auditRes.ok ? await auditRes.json() : null
        const authData = authRes.ok ? await authRes.json() : { users: [], currentUser: null }

        setServices(servicesData.services || [])
        setColleges(collegesData.colleges || [])
        setDocuments(docsData.documents || [])
        setOverview(overviewData)
        setAuditData(audit)
        setUsers(authData.users || [])
        setCurrentUser(authData.currentUser || overviewData.profile)

        const defaultServiceId = servicesData.services?.[0]?.id || ''
        const defaultCollegeId = collegesData.colleges?.[0]?.id || ''

        setSelectedServiceId(defaultServiceId)
        setSelectedCollegeId(defaultCollegeId)
        setError('')
      }
    } catch (err) {
      console.warn('Backend connection failed, using demo state:', err)
      setError('Backend API not responding on port 4000. Working in demo preview mode.')
    }
  }, [])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  useEffect(() => {
    if (selectedServiceId) {
      loadServiceMatch(selectedServiceId)
    }
  }, [selectedServiceId, loadServiceMatch])

  useEffect(() => {
    if (selectedCollegeId) {
      loadCollegeMatch(selectedCollegeId)
    }
  }, [selectedCollegeId, loadCollegeMatch])

  // Login handler
  const handleLogin = async (credentials) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })
      if (res.ok) {
        const data = await res.json()
        setCurrentUser(data.user)
        loadInitialData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Register handler
  const handleRegister = async (payload) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const data = await res.json()
        setCurrentUser(data.user)
        loadInitialData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Logout handler
  const handleLogout = () => {
    setIsAuthOpen(false)
  }

  // Document Upload
  const handleUploadSuccess = async (docPayload) => {
    try {
      const response = await fetch(`${API_URL}/api/user/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docPayload),
      })

      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents)
      } else {
        const newDoc = {
          ...docPayload,
          id: `doc-${Date.now()}`,
          updatedAt: new Date().toISOString().split('T')[0],
        }
        setDocuments((prev) => [...prev, newDoc])
      }

      runAudit()
      if (selectedServiceId) loadServiceMatch(selectedServiceId)
      if (selectedCollegeId) loadCollegeMatch(selectedCollegeId)
    } catch (err) {
      console.error('Upload error:', err)
      const newDoc = {
        ...docPayload,
        id: `doc-${Date.now()}`,
        updatedAt: new Date().toISOString().split('T')[0],
      }
      setDocuments((prev) => [...prev, newDoc])
    }
  }

  // Document Deletion
  const handleDeleteDocument = async (docId) => {
    try {
      const response = await fetch(`${API_URL}/api/user/documents/${docId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents)
      } else {
        setDocuments((prev) => prev.filter((d) => d.id !== docId))
      }
      runAudit()
      if (selectedServiceId) loadServiceMatch(selectedServiceId)
      if (selectedCollegeId) loadCollegeMatch(selectedCollegeId)
    } catch (err) {
      console.warn('Delete error:', err)
      setDocuments((prev) => prev.filter((d) => d.id !== docId))
    }
  }

  // Create Tasks
  const handleCreateTasks = async () => {
    if (!selectedServiceId) return
    try {
      const response = await fetch(`${API_URL}/api/tasks/${selectedServiceId}`, {
        method: 'POST',
      })
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks || [])
        setActiveTab('tasks')
      }
    } catch (err) {
      console.error(err)
      setActiveTab('tasks')
    }
  }

  // Update Task Status
  const handleUpdateTaskStatus = async (taskId, status) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    )

    try {
      await fetch(`${API_URL}/api/tasks/${selectedServiceId}/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
    } catch (err) {
      console.error('Failed to patch task status:', err)
    }
  }

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0]
  const selectedCollege = colleges.find((c) => c.id === selectedCollegeId) || colleges[0]
  const readiness = Math.round(
    ((match?.completionPercentage || 0) + (collegeMatch?.completionPercentage || 0)) / 2
  )

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        readiness={readiness}
        auditIssuesCount={auditData?.issues?.length || 0}
        collegesCount={colleges.length}
      />

      {/* Main Content Area */}
      <div className="content-area">
        <Navbar
          activeTab={activeTab}
          selectedService={selectedService}
          selectedCollege={selectedCollege}
          currentUser={currentUser}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenReport={() => setIsReportOpen(true)}
        />

        {error && (
          <div style={{
            background: 'var(--danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            padding: '10px 24px',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span>⚠️ {error}</span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={loadInitialData}
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Tab Pages */}
        {activeTab === 'overview' && (
          <OverviewPage
            overview={overview}
            selectedService={selectedService}
            selectedCollege={selectedCollege}
            match={match}
            collegeMatch={collegeMatch}
            tasks={tasks}
            documents={documents}
            auditData={auditData}
            onNavigate={setActiveTab}
            onCreateTasks={handleCreateTasks}
            onOpenUpload={() => setIsUploadOpen(true)}
            onRunAudit={runAudit}
          />
        )}

        {activeTab === 'colleges' && (
          <CollegesPage
            colleges={colleges}
            selectedCollegeId={selectedCollegeId}
            onSelectCollege={setSelectedCollegeId}
            match={collegeMatch}
            onCreateTasks={handleCreateTasks}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'services' && (
          <ServicesPage
            services={services}
            selectedServiceId={selectedServiceId}
            onSelectService={setSelectedServiceId}
            match={match}
            onCreateTasks={handleCreateTasks}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'vault' && (
          <DocumentsPage
            documents={documents}
            profile={currentUser || overview?.profile}
            onOpenUpload={() => setIsUploadOpen(true)}
            onDeleteDocument={handleDeleteDocument}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'mismatches' && (
          <div className="page-container">
            <MismatchDetector
              auditData={auditData}
              documents={documents}
              onRunAudit={runAudit}
            />
          </div>
        )}

        {activeTab === 'tasks' && (
          <TasksPage
            tasks={tasks}
            selectedService={selectedService}
            onStatusChange={handleUpdateTaskStatus}
            onCreateTasks={handleCreateTasks}
          />
        )}

        {activeTab === 'guide' && (
          <GuidePage service={selectedService} />
        )}
      </div>

      {/* Floating AI Co-Pilot Assistant */}
      <AIAssistant onNavigate={setActiveTab} />

      {/* Auth Login / Switch Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        users={users}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
      />

      {/* Upload Document Modal */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        currentUser={currentUser}
      />

      {/* Export Readiness Report Modal */}
      <ExportReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        selectedService={selectedService}
        match={match}
        auditData={auditData}
        profile={currentUser || overview?.profile}
      />
    </div>
  )
}
