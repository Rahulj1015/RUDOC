import http from 'node:http'
import {
  colleges,
  demoUsers,
  documentEquivalents,
  documentGuides,
  services,
  synthesizeCollege,
} from './data.js'

const PORT = process.env.PORT || 4000
const taskStore = new Map()

// Active user and user document storage
let currentUser = demoUsers[0]
const userVaultStore = new Map()

// Initialize demo users' vaults
demoUsers.forEach((u) => {
  userVaultStore.set(u.id, [...u.documents])
})

function getCurrentDocuments() {
  return userVaultStore.get(currentUser.id) || []
}

function setCurrentDocuments(docs) {
  userVaultStore.set(currentUser.id, docs)
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  })
  response.end(JSON.stringify(payload))
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''
    request.on('data', (chunk) => {
      body += chunk
    })
    request.on('end', () => {
      if (!body) {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(body))
      } catch (error) {
        reject(error)
      }
    })
  })
}

// Levenshtein similarity calculation for name/text comparison
function calculateStringSimilarity(str1, str2) {
  if (!str1 || !str2) return 0
  const s1 = str1.trim().toLowerCase()
  const s2 = str2.trim().toLowerCase()
  if (s1 === s2) return 100

  const track = Array(s2.length + 1).fill(null).map(() =>
    Array(s1.length + 1).fill(null)
  )
  for (let i = 0; i <= s1.length; i += 1) track[0][i] = i
  for (let j = 0; j <= s2.length; j += 1) track[j][0] = j

  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      )
    }
  }

  const distance = track[s2.length][s1.length]
  const maxLength = Math.max(s1.length, s2.length)
  return Math.max(0, Math.round(((maxLength - distance) / maxLength) * 100))
}

// Audit cross-document consistency
function auditDocumentMismatches() {
  const issues = []
  const userDocs = getCurrentDocuments()
  const verifiedDocs = userDocs.filter((d) => d.holderName)

  if (verifiedDocs.length < 2) {
    return {
      status: 'insufficient_documents',
      overallScore: 100,
      issues: [],
      summary: 'Upload at least 2 documents with holder names to run automated cross-document audit.',
    }
  }

  for (let i = 0; i < verifiedDocs.length; i++) {
    for (let j = i + 1; j < verifiedDocs.length; j++) {
      const docA = verifiedDocs[i]
      const docB = verifiedDocs[j]

      const nameSimilarity = calculateStringSimilarity(docA.holderName, docB.holderName)
      if (nameSimilarity < 100) {
        issues.push({
          type: 'NAME_MISMATCH',
          severity: nameSimilarity < 75 ? 'HIGH' : 'MEDIUM',
          similarity: nameSimilarity,
          docA: { id: docA.id, name: docA.name, value: docA.holderName },
          docB: { id: docB.id, name: docB.name, value: docB.holderName },
          message: `Name differs between ${docA.name} ("${docA.holderName}") and ${docB.name} ("${docB.holderName}"). Match confidence: ${nameSimilarity}%.`,
          recommendation: 'Ensure your name matches letter-for-letter with your 10th Marksheet or official ID before applying to prevent rejection.',
        })
      }

      if (docA.dob && docB.dob && docA.dob !== docB.dob) {
        issues.push({
          type: 'DOB_MISMATCH',
          severity: 'HIGH',
          similarity: 0,
          docA: { id: docA.id, name: docA.name, value: docA.dob },
          docB: { id: docB.id, name: docB.name, value: docB.dob },
          message: `Date of Birth mismatch between ${docA.name} (${docA.dob}) and ${docB.name} (${docB.dob}).`,
          recommendation: 'DOB must be identical across all documents. 10th Marksheet DOB is considered definitive by most portals.',
        })
      }
    }
  }

  const highCount = issues.filter((i) => i.severity === 'HIGH').length
  const medCount = issues.filter((i) => i.severity === 'MEDIUM').length
  const overallScore = Math.max(0, 100 - (highCount * 35 + medCount * 15))

  return {
    status: issues.length === 0 ? 'CLEAN' : highCount > 0 ? 'WARNING_HIGH' : 'WARNING_MEDIUM',
    overallScore,
    issues,
    summary: issues.length === 0
      ? 'All documents are consistent. No spelling or DOB discrepancies detected.'
      : `Found ${issues.length} potential discrepancy issues across your documents.`,
  }
}

function isDocumentFulfilled(requiredDocName) {
  const equivalents = documentEquivalents[requiredDocName] || [requiredDocName]
  const userDocs = getCurrentDocuments()
  const matched = userDocs.find((userDoc) =>
    equivalents.some(
      (eq) =>
        userDoc.name.toLowerCase().includes(eq.toLowerCase()) ||
        eq.toLowerCase().includes(userDoc.name.toLowerCase())
    )
  )
  return matched || null
}

function getMatchForService(serviceId) {
  const service = services.find((item) => item.id === serviceId)
  if (!service) return null

  const availableDocuments = []
  const missingDocuments = []

  for (const reqDoc of service.requiredDocuments) {
    const matchedUserDoc = isDocumentFulfilled(reqDoc)
    if (matchedUserDoc) {
      availableDocuments.push({
        name: reqDoc,
        matchedDocId: matchedUserDoc.id,
        matchedDocName: matchedUserDoc.name,
        confidence: matchedUserDoc.confidence ?? 90,
        status: matchedUserDoc.status ?? 'Verified',
        guide: documentGuides[reqDoc] ?? documentGuides[matchedUserDoc.name] ?? null,
      })
    } else {
      missingDocuments.push({
        name: reqDoc,
        guide: documentGuides[reqDoc] ?? null,
      })
    }
  }

  const completionPercentage = Math.round(
    (availableDocuments.length / service.requiredDocuments.length) * 100
  )

  return {
    service,
    availableDocuments,
    missingDocuments,
    completionPercentage,
    totalRequired: service.requiredDocuments.length,
    totalAvailable: availableDocuments.length,
    isReady: completionPercentage === 100,
  }
}

// College Document Matcher (Supports pre-defined AND on-demand synthesized colleges)
function getMatchForCollege(collegeId) {
  let college = colleges.find((item) => item.id === collegeId)
  if (!college) {
    // Synthesize any custom or dynamically searched college name
    const rawQuery = collegeId.replace(/^dyn-/, '').replace(/-/g, ' ')
    college = synthesizeCollege(rawQuery)
  }

  const availableDocuments = []
  const missingDocuments = []

  for (const reqDoc of college.requiredDocuments) {
    const matchedUserDoc = isDocumentFulfilled(reqDoc)
    if (matchedUserDoc) {
      availableDocuments.push({
        name: reqDoc,
        matchedDocId: matchedUserDoc.id,
        matchedDocName: matchedUserDoc.name,
        confidence: matchedUserDoc.confidence ?? 90,
        status: matchedUserDoc.status ?? 'Verified',
        guide: documentGuides[reqDoc] ?? documentGuides[matchedUserDoc.name] ?? null,
      })
    } else {
      missingDocuments.push({
        name: reqDoc,
        guide: documentGuides[reqDoc] ?? null,
      })
    }
  }

  const completionPercentage = Math.round(
    (availableDocuments.length / college.requiredDocuments.length) * 100
  )

  return {
    college,
    availableDocuments,
    missingDocuments,
    completionPercentage,
    totalRequired: college.requiredDocuments.length,
    totalAvailable: availableDocuments.length,
    isReady: completionPercentage === 100,
  }
}

function createTasksForService(serviceId) {
  const match = getMatchForService(serviceId)
  if (!match) return null

  const existing = taskStore.get(serviceId)
  const existingMap = new Map((existing?.tasks || []).map((t) => [t.document, t.status]))

  const taskList = {
    serviceId,
    serviceTitle: match.service.title,
    tasks: match.missingDocuments.map((doc, index) => ({
      id: `${serviceId}-task-${index + 1}`,
      title: `Obtain ${doc.name}`,
      document: doc.name,
      status: existingMap.get(doc.name) || 'Not Started',
      priority: doc.guide?.priority ?? 'Medium',
      source: doc.guide?.source ?? 'Official portal',
      reason: doc.guide?.purpose ?? `${doc.name} is mandatory for ${match.service.title}.`,
      nextStep: doc.guide?.howToGet ?? 'Check the official service portal for accepted format instructions.',
    })),
  }

  taskStore.set(serviceId, taskList)
  return taskList
}

// Robust, Intelligent AI Assistant Engine
function generateAIResponse(query) {
  const q = (query || '').toLowerCase().replace(/[^\w\s]/gi, ' ')

  // 1. App Navigation / Location queries
  if (q.includes('where') || q.includes('kaha') || q.includes('find') || q.includes('section') || q.includes('locate') || q.includes('kisme')) {
    if (q.includes('adhar') || q.includes('aadhaar') || q.includes('aadhar')) {
      return {
        answer: `📍 **Here is where you can find Aadhaar in RUDOC:**

1. **Govt & ID Services Tab:** Check the *"Aadhaar Name / DOB / Address Update"* card for required documents, update steps, fees, and the official UIDAI portal link.
2. **Document Vault Tab:** View your uploaded Aadhaar card, check its verification status, or upload a new scan.
3. **Mismatch Checker Tab:** Compare your Aadhaar name against your 10th Marksheet to detect spelling typos.`,
        actionTab: 'services',
        actionLabel: '👉 Open Govt & ID Services Tab',
        relatedDocs: ['Aadhaar Card', '10th Marksheet'],
        suggestedAction: 'Click the button below to jump straight to the Aadhaar section!',
      }
    }

    if (q.includes('college') || q.includes('university') || q.includes('admission') || q.includes('iit') || q.includes('du') || q.includes('aiims') || q.includes('dy patil')) {
      return {
        answer: `📍 **You can find the College & University Section in the "College Admissions" tab in the left sidebar!**

There you can:
- Choose from 50+ institutes (Dr. D. Y. Patil, COEP, VJTI, IITs, DU, AIIMS, BITS, Symbiosis, NMIMS, MIT Pune, etc.).
- Search ANY registered college in India to get instant verified document requirements, what you already have, and what affidavits to arrange.`,
        actionTab: 'colleges',
        actionLabel: '👉 Go to College Admissions Tab',
        relatedDocs: ['10th Marksheet', '12th Marksheet', 'Transfer Certificate (TC)', 'Migration Certificate'],
        suggestedAction: 'Click below to explore all colleges and institutes.',
      }
    }

    if (q.includes('vault') || q.includes('doc') || q.includes('upload') || q.includes('my document')) {
      return {
        answer: `📍 **Your personal documents are stored in the "Document Vault" tab!**

You can:
- View all your uploaded certificates (Aadhaar, PAN, 10th/12th marksheets, Income certificate, TC).
- Check OCR confidence scores and issuing authority details.
- Upload new documents or use 1-click test templates.`,
        actionTab: 'vault',
        actionLabel: '👉 Open Document Vault',
        relatedDocs: ['Aadhaar Card', 'PAN Card', '10th Marksheet', '12th Marksheet'],
        suggestedAction: 'Click below to enter your secure vault.',
      }
    }

    if (q.includes('mismatch') || q.includes('spelling') || q.includes('audit')) {
      return {
        answer: `📍 **The "Mismatch Checker" tab runs automated spelling and DOB consistency audits across all your documents!**`,
        actionTab: 'mismatches',
        actionLabel: '👉 Go to Mismatch Checker',
        relatedDocs: ['10th Marksheet', 'Aadhaar Card', 'PAN Card'],
        suggestedAction: 'Click below to run a cross-document audit.',
      }
    }
  }

  // 2. Dr DY Patil & Maharashtra Engineering / Medical
  if (q.includes('dy patil') || q.includes('dyp') || q.includes('dpu') || q.includes('coep') || q.includes('vjti') || q.includes('mht cet') || q.includes('pune')) {
    return {
      answer: `🏥 **Dr. D. Y. Patil Vidyapeeth (DPU) & Maharashtra Colleges Admission Checklist:**

1. **Entrance Scorecards:** NEET UG (for MBBS/BDS via MCC Deemed Counselling) or MHT-CET / JEE Main (for B.Tech Engineering via State CET Cell / DPU AIET).
2. **Academic Records:** 10th & 12th Board Marksheets & Passing Certificates.
3. **Institutional Certificates:** Transfer Certificate (TC/SLC), Migration Certificate, and Character Certificate.
4. **State Reservation:** Maharashtra Domicile Certificate, Caste Certificate, and Caste Validity Certificate (for reserved seats).
5. **Affidavits:** Notary Gap Year Affidavit on ₹100 stamp paper for droppers & Anti-Ragging undertaking.`,
      actionTab: 'colleges',
      actionLabel: '👉 View Dr. D. Y. Patil Profile in College Tab',
      relatedDocs: ['NEET UG Scorecard & Admit Card', 'JEE Main Scorecard', 'Transfer Certificate (TC)', 'Domicile', 'Gap Year Affidavit'],
      suggestedAction: 'Open the College Admissions tab to see DY Patil Vidyapeeth and COEP Tech!',
    }
  }

  // 3. UPSC / Civil Services
  if (q.includes('upsc') || q.includes('ias') || q.includes('ips') || q.includes('civil service') || q.includes('daf')) {
    return {
      answer: `🏛️ **UPSC Civil Services Examination (IAS/IPS) Document Checklist:**

1. **Date of Birth Proof:** Matriculation (Class 10) Passing Certificate or Marksheet is the only accepted master proof.
2. **Educational Qualification:** Degree Certificate or provisional passing certificate from a recognized university.
3. **Category / Caste Certificate:** Central Govt format SC/ST/OBC-NCL/EWS certificate (OBC-NCL must be issued within the prescribed financial year before prelims cutoff).
4. **Photo ID & Disability:** Valid Aadhaar / Voter ID / Passport and UDID certificate (for PwD candidates).`,
      actionTab: 'services',
      actionLabel: '👉 View UPSC Service Section',
      relatedDocs: ['10th Marksheet', 'Graduation Degree / Passing Certificate', 'Category / EWS Certificate', 'Aadhaar Card'],
      suggestedAction: 'Match your vault against the UPSC Civil Services requirement checklist!',
    }
  }

  // 4. Aadhaar & PAN Questions
  if (q.includes('adhar') || q.includes('aadhaar') || q.includes('aadhar') || q.includes('uidai')) {
    return {
      answer: `🆔 **Aadhaar Card Guide & Demographic Update:**

- **Official Portal:** \`myaadhaar.uidai.gov.in\`
- **Fee:** ₹50 for online update / ₹100 at Aadhaar Seva Kendra.
- **Documents Accepted for Name Update:** Passport, PAN Card, Voter ID, Driving Licence, or 10th Marksheet.
- **Documents Accepted for DOB Update:** 10th Class Marksheet / Passing Certificate or Birth Certificate.
- **Important Note:** You are allowed only **2 lifetime name updates** without Gazette notification, so ensure zero typos!`,
      actionTab: 'services',
      actionLabel: '👉 Open Aadhaar Update Section',
      relatedDocs: ['Aadhaar Card', '10th Marksheet', 'PAN Card'],
      suggestedAction: 'Check your Mismatch Checker tab to ensure your Aadhaar name matches your 10th marksheet.',
    }
  }

  // Fallback with rich helpful suggestions
  return {
    answer: `🤖 **Hello! I am your RUDOC AI Document Co-Pilot.**

I can assist you with:
1. **Navigating Sections:** Ask *"Where is Aadhaar section?"* or *"Where is College Admissions?"*
2. **Any College in India:** Ask *"What documents for Dr. D. Y. Patil / IIT Bombay / DU / AIIMS / BITS?"*
3. **Competitive Exams:** Ask *"What documents are needed for UPSC DAF, NEET, or JoSAA?"*
4. **Fixing Mismatches:** Ask *"How to fix Aadhaar name spelling mismatch?"*
5. **Certificates & Affidavits:** Ask about *Gap year affidavit, Transfer Certificate (TC), Migration, or Income Certificate validity.*`,
    actionTab: 'colleges',
    actionLabel: '👉 Explore College Admissions Tab',
    relatedDocs: ['Aadhaar Card', '10th Marksheet', 'Transfer Certificate (TC)', 'Income Certificate'],
    suggestedAction: 'Try asking: "Where is Aadhaar section?" or "What documents for Dr DY Patil?"',
  }
}

function getOverview() {
  const taskLists = [...taskStore.values()]
  const tasks = taskLists.flatMap((taskList) => taskList.tasks)
  const completedTasks = tasks.filter((task) => task.status === 'Completed')
  const userDocs = getCurrentDocuments()
  const reviewDocuments = userDocs.filter((doc) => doc.status === 'Needs Review')
  const audit = auditDocumentMismatches()

  return {
    profile: {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      dob: currentUser.dob,
      goal: currentUser.goal,
    },
    stats: {
      services: services.length,
      colleges: colleges.length,
      documents: userDocs.length,
      savedTaskLists: taskLists.length,
      activeTasks: tasks.length - completedTasks.length,
      completedTasks: completedTasks.length,
      reviewDocuments: reviewDocuments.length,
      auditScore: audit.overallScore,
      auditIssuesCount: audit.issues.length,
    },
    auditSummary: audit,
  }
}

export async function handleRequest(request, response) {
  const host = request.headers.host || 'localhost'
  const url = new URL(request.url, `http://${host}`)
  const path = url.pathname

  if (request.method === 'OPTIONS') {
    sendJson(response, 200, { ok: true })
    return
  }

  // Health
  if (request.method === 'GET' && path === '/api/health') {
    sendJson(response, 200, {
      ok: true,
      app: 'RUDOC API',
      version: '1.6.0',
      currentUser: currentUser.name,
      timestamp: new Date().toISOString(),
    })
    return
  }

  // Auth: Users List
  if (request.method === 'GET' && path === '/api/auth/users') {
    sendJson(response, 200, {
      users: demoUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        docsCount: (userVaultStore.get(u.id) || []).length,
      })),
      currentUser,
    })
    return
  }

  // Auth: Login / Switch User
  if (request.method === 'POST' && path === '/api/auth/login') {
    try {
      const body = await readJsonBody(request)
      const found = demoUsers.find((u) => u.email === body.email || u.id === body.userId)
      if (found) {
        currentUser = found
        sendJson(response, 200, { success: true, user: currentUser })
      } else {
        const newUser = {
          id: `user-${Date.now()}`,
          name: body.name || body.email.split('@')[0],
          email: body.email,
          role: 'Registered Applicant',
          dob: body.dob || '2004-01-01',
          fatherName: '',
          goal: 'College & Government Document Readiness',
          documents: [],
        }
        demoUsers.push(newUser)
        userVaultStore.set(newUser.id, [])
        currentUser = newUser
        sendJson(response, 200, { success: true, user: currentUser })
      }
    } catch {
      sendJson(response, 400, { error: 'Invalid login request' })
    }
    return
  }

  // Auth: Register
  if (request.method === 'POST' && path === '/api/auth/register') {
    try {
      const body = await readJsonBody(request)
      const newUser = {
        id: `user-${Date.now()}`,
        name: body.name || 'New Applicant',
        email: body.email || 'user@example.com',
        role: 'Applicant',
        dob: body.dob || '2004-01-01',
        fatherName: body.fatherName || '',
        goal: body.goal || 'Prepare admissions and identity documents',
        documents: [],
      }
      demoUsers.push(newUser)
      userVaultStore.set(newUser.id, [])
      currentUser = newUser
      sendJson(response, 201, { success: true, user: currentUser })
    } catch {
      sendJson(response, 400, { error: 'Invalid register payload' })
    }
    return
  }

  // Colleges List
  if (request.method === 'GET' && path === '/api/colleges') {
    sendJson(response, 200, { colleges })
    return
  }

  // College Matching (with dynamic fallback for ANY searched university)
  if (request.method === 'GET' && path.startsWith('/api/colleges/') && path.endsWith('/match')) {
    const collegeId = decodeURIComponent(path.replace('/api/colleges/', '').replace('/match', ''))
    const match = getMatchForCollege(collegeId)
    sendJson(response, 200, match)
    return
  }

  // AI Assistant Chatbot
  if (request.method === 'POST' && path === '/api/assistant/chat') {
    try {
      const body = await readJsonBody(request)
      const reply = generateAIResponse(body.query || '')
      sendJson(response, 200, { success: true, ...reply })
    } catch {
      sendJson(response, 400, { error: 'Invalid query payload' })
    }
    return
  }

  // Services
  if (request.method === 'GET' && path === '/api/services') {
    sendJson(response, 200, { services })
    return
  }

  // Overview
  if (request.method === 'GET' && path === '/api/overview') {
    sendJson(response, 200, getOverview())
    return
  }

  // Audit
  if (request.method === 'GET' && path === '/api/audit/mismatches') {
    sendJson(response, 200, auditDocumentMismatches())
    return
  }

  // User Documents
  if (request.method === 'GET' && path === '/api/user/documents') {
    sendJson(response, 200, {
      profile: currentUser,
      documents: getCurrentDocuments(),
    })
    return
  }

  // Add Document
  if (request.method === 'POST' && path === '/api/user/documents') {
    try {
      const body = await readJsonBody(request)
      if (!body.name) {
        sendJson(response, 400, { error: 'Document name is required' })
        return
      }

      const newDoc = {
        id: `doc-${Date.now()}`,
        name: body.name,
        category: body.category || 'General',
        status: body.status || 'Verified',
        holderName: body.holderName || currentUser.name,
        dob: body.dob || currentUser.dob,
        docNumber: body.docNumber || `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
        issuer: body.issuer || 'Self Upload',
        updatedAt: new Date().toISOString().split('T')[0],
        confidence: body.confidence || 95,
      }

      const docs = getCurrentDocuments()
      docs.push(newDoc)
      setCurrentDocuments(docs)
      sendJson(response, 201, { success: true, document: newDoc, documents: docs })
    } catch {
      sendJson(response, 400, { error: 'Invalid JSON payload' })
    }
    return
  }

  // Delete Document
  if (request.method === 'DELETE' && path.startsWith('/api/user/documents/')) {
    const docId = decodeURIComponent(path.replace('/api/user/documents/', ''))
    const filtered = getCurrentDocuments().filter((d) => d.id !== docId)
    setCurrentDocuments(filtered)
    sendJson(response, 200, { success: true, documents: filtered })
    return
  }

  // Service Match
  if (request.method === 'GET' && path.startsWith('/api/match/')) {
    const serviceId = decodeURIComponent(path.replace('/api/match/', ''))
    const match = getMatchForService(serviceId)
    if (!match) {
      sendJson(response, 404, { error: 'Service not found' })
      return
    }
    sendJson(response, 200, match)
    return
  }

  // Task generation
  if (request.method === 'POST' && path.startsWith('/api/tasks/')) {
    const serviceId = decodeURIComponent(path.replace('/api/tasks/', ''))
    const taskList = createTasksForService(serviceId)
    if (!taskList) {
      sendJson(response, 404, { error: 'Service not found' })
      return
    }
    sendJson(response, 201, taskList)
    return
  }

  // Get tasks
  if (request.method === 'GET' && path.startsWith('/api/tasks/')) {
    const serviceId = decodeURIComponent(path.replace('/api/tasks/', ''))
    sendJson(response, 200, taskStore.get(serviceId) ?? createTasksForService(serviceId))
    return
  }

  // Update Task Status
  if (request.method === 'PATCH' && path.startsWith('/api/tasks/')) {
    const parts = path.split('/').filter(Boolean)
    const serviceId = decodeURIComponent(parts[2] ?? '')
    const taskId = decodeURIComponent(parts[3] ?? '')
    const taskList = taskStore.get(serviceId)

    if (!taskList) {
      sendJson(response, 404, { error: 'Task list not found' })
      return
    }

    try {
      const body = await readJsonBody(request)
      taskList.tasks = taskList.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: body.status ?? task.status,
            }
          : task
      )
      taskStore.set(serviceId, taskList)
      sendJson(response, 200, taskList)
    } catch {
      sendJson(response, 400, { error: 'Invalid JSON body' })
    }
    return
  }

  sendJson(response, 404, { error: 'Route not found', path })
}

const server = http.createServer(handleRequest)

if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`RUDOC API running at http://127.0.0.1:${PORT}`)
  })
}

export default handleRequest
