import http from 'node:http'
import {
  aadhaarCenters,
  colleges,
  demoUsers,
  documentEquivalents,
  documentGuides,
  services,
} from './data.js'
import {
  addUser,
  addUserDocument,
  deleteUserDocument,
  getAadhaarCenters,
  getCollegeById,
  getColleges,
  getCurrentUser,
  getDb,
  getServiceById,
  getServices,
  getTasksForService,
  getUserDocuments,
  getUsers,
  saveDb,
  setCurrentUser,
  setTasksForService,
  updateTaskStatus,
} from './db.js'

const PORT = process.env.PORT || 4000

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

// Levenshtein Distance for Cross-Document Fuzzy Matching
function levenshteinDistance(s1, s2) {
  const a = s1.toLowerCase().trim()
  const b = s2.toLowerCase().trim()
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0))

  for (let i = 0; i <= a.length; i++) dp[i][0] = i
  for (let j = 0; j <= b.length; j++) dp[0][j] = j

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
  }
  return dp[a.length][b.length]
}

function calculateStringSimilarity(s1, s2) {
  if (!s1 || !s2) return 0
  if (s1.toLowerCase().trim() === s2.toLowerCase().trim()) return 100
  const maxLen = Math.max(s1.length, s2.length)
  if (maxLen === 0) return 100
  const dist = levenshteinDistance(s1, s2)
  const score = Math.max(0, Math.round(((maxLen - dist) / maxLen) * 100))
  return score
}

function checkDocumentEquivalency(userDocName, requiredDocName) {
  if (!userDocName || !requiredDocName) return false
  const u = userDocName.toLowerCase().trim()
  const r = requiredDocName.toLowerCase().trim()

  if (u === r || u.includes(r) || r.includes(u)) return true

  const alternatives = documentEquivalents[requiredDocName] || []
  return alternatives.some((alt) => {
    const a = alt.toLowerCase().trim()
    return u === a || u.includes(a) || a.includes(u)
  })
}

// Cross-Document Mismatch Audit (Smart & Simple Indian Governance Model)
function auditDocumentMismatches() {
  const currentUser = getCurrentUser()
  const userDocs = getUserDocuments()
  const issues = []

  const knownOfficialKeywords = [
    'aadhaar',
    'pan',
    '10th',
    '12th',
    'marksheet',
    'passport',
    'domicile',
    'caste',
    'income',
    'degree',
    'transfer certificate',
    'tc',
    'migration',
    'scorecard',
    'driving',
    'voter',
    'passbook',
  ]

  // Filter only genuine official identity & academic certificates
  const officialDocs = userDocs.filter((d) => {
    const name = (d.name || '').toLowerCase()
    const cat = (d.category || '').toLowerCase()
    if (cat === 'general' || cat === 'notes' || cat === 'other' || name.includes('question') || name.includes('note') || name.includes('syllabus')) {
      return false
    }
    return knownOfficialKeywords.some((kw) => name.includes(kw))
  })

  // Find Class 10 Marksheet as the Primary Legal Benchmark
  const benchmarkDoc =
    officialDocs.find((d) => d.name.toLowerCase().includes('10th')) ||
    officialDocs.find((d) => d.name.toLowerCase().includes('aadhaar')) ||
    officialDocs[0]

  if (benchmarkDoc && officialDocs.length > 1) {
    const diffDocs = []
    const dobDiffDocs = []

    officialDocs.forEach((doc) => {
      if (doc.id === benchmarkDoc.id) return

      if (benchmarkDoc.holderName && doc.holderName) {
        const nameSim = calculateStringSimilarity(benchmarkDoc.holderName, doc.holderName)
        if (nameSim < 100) {
          diffDocs.push({ doc, nameSim })
        }
      }

      if (benchmarkDoc.dob && doc.dob && benchmarkDoc.dob !== doc.dob) {
        dobDiffDocs.push(doc)
      }
    })

    // Group Name Variations into a single, clean actionable issue
    if (diffDocs.length > 0) {
      const avgSim = Math.round(diffDocs.reduce((acc, d) => acc + d.nameSim, 0) / diffDocs.length)
      const docNames = diffDocs.map((d) => d.doc.name).join(', ')
      const sampleVal = diffDocs[0].doc.holderName

      const isMiddleNameDiff =
        benchmarkDoc.holderName.toLowerCase().includes(sampleVal.toLowerCase()) ||
        sampleVal.toLowerCase().includes(benchmarkDoc.holderName.toLowerCase())

      issues.push({
        id: 'issue-name-benchmark',
        type: isMiddleNameDiff ? 'Middle Name Variation' : 'Name Spelling Discrepancy',
        severity: isMiddleNameDiff ? 'MEDIUM' : avgSim < 75 ? 'HIGH' : 'MEDIUM',
        docA: { name: `${benchmarkDoc.name} (Benchmark)`, value: benchmarkDoc.holderName },
        docB: { name: docNames, value: sampleVal },
        similarity: avgSim,
        similarityScore: avgSim,
        message: `Name on Class 10 Marksheet is "${benchmarkDoc.holderName}", whereas ${docNames} list "${sampleVal}".`,
        recommendation: isMiddleNameDiff
          ? 'In Indian colleges (JoSAA / CSAS / UPSC), Class 10 is the legal master document. Submit a standard "One-and-the-Same Person" Notary Affidavit (₹100 stamp paper) or update Aadhaar name on myaadhaar.uidai.gov.in.'
          : 'Different spelling detected! Apply for an official demographic correction on UIDAI portal using your 10th marksheet, or carry an attested Notary Affidavit.',
        advice: isMiddleNameDiff
          ? 'Carry a standard "One-and-the-Same Person" Notary Affidavit (₹100 stamp paper) to admission counselling.'
          : 'Apply for an official demographic correction on UIDAI portal using your 10th marksheet.',
      })
    }

    // Group DOB Mismatches
    if (dobDiffDocs.length > 0) {
      const docNames = dobDiffDocs.map((d) => d.name).join(', ')
      issues.push({
        id: 'issue-dob-benchmark',
        type: 'Date of Birth Mismatch',
        severity: 'HIGH',
        docA: { name: `${benchmarkDoc.name} (Benchmark)`, value: benchmarkDoc.dob },
        docB: { name: docNames, value: dobDiffDocs[0].dob },
        similarity: 0,
        similarityScore: 0,
        message: `Date of Birth conflict: ${benchmarkDoc.dob} on ${benchmarkDoc.name} vs ${dobDiffDocs[0].dob} on ${docNames}.`,
        recommendation:
          '10th Marksheet is universally treated as the sole benchmark for Date of Birth. Immediately update your Aadhaar card online via myaadhaar.uidai.gov.in using your 10th marksheet.',
        advice:
          'Update your Aadhaar card online via myaadhaar.uidai.gov.in using your 10th marksheet.',
      })
    }
  }

  // Calculate clean, balanced score (0 to 100)
  const penalty = issues.reduce((acc, iss) => acc + (iss.severity === 'HIGH' ? 15 : 10), 0)
  const overallScore = Math.max(70, 100 - penalty)

  return {
    candidateName: currentUser?.name || 'Applicant',
    totalDocumentsAudited: officialDocs.length,
    overallScore: issues.length === 0 ? 100 : overallScore,
    status: issues.length === 0 ? 'CLEAN_VERIFIED' : 'MINOR_WARNINGS',
    summary:
      issues.length === 0
        ? 'All vault documents are 100% consistent across candidate name and Date of Birth.'
        : `Detected ${issues.length} item(s) with name/DOB variations. Check the actionable fixes below.`,
    issues,
  }
}

// Requirement Match for College
function getMatchForCollege(collegeId) {
  const college = getCollegeById(collegeId) || colleges[0]
  const userDocs = getUserDocuments()
  const availableDocuments = []
  const missingDocuments = []

  college.requiredDocuments.forEach((reqDoc) => {
    const matchedUserDoc = userDocs.find((uDoc) => checkDocumentEquivalency(uDoc.name, reqDoc))
    if (matchedUserDoc) {
      availableDocuments.push({
        requiredName: reqDoc,
        userDocName: matchedUserDoc.name,
        category: matchedUserDoc.category,
        status: matchedUserDoc.status,
        confidence: matchedUserDoc.confidence,
        docNumber: matchedUserDoc.docNumber,
        isEquivalentMatch: matchedUserDoc.name.toLowerCase() !== reqDoc.toLowerCase(),
      })
    } else {
      missingDocuments.push({
        name: reqDoc,
        guide: documentGuides[reqDoc] || {
          priority: 'Medium',
          difficulty: 'Medium',
          source: 'College Administration or State Revenue Portal',
          timeline: '3-7 Days',
          cost: 'Standard fee',
          link: college.officialPortal.url,
          nextStep: `Arrange official verified copy of ${reqDoc} before reporting.`,
        },
      })
    }
  })

  const total = college.requiredDocuments.length
  const completionPercentage = total > 0 ? Math.round((availableDocuments.length / total) * 100) : 0

  return {
    collegeId: college.id,
    collegeName: college.name,
    shortName: college.shortName,
    stream: college.stream,
    officialPortal: college.officialPortal,
    totalRequired: total,
    matchedCount: availableDocuments.length,
    missingCount: missingDocuments.length,
    completionPercentage,
    availableDocuments,
    missingDocuments,
    specificNotes: college.specificNotes || [],
    generatedAt: new Date().toISOString(),
  }
}

// Requirement Match for Govt Service
function getMatchForService(serviceId) {
  const service = getServiceById(serviceId) || services[0]
  const userDocs = getUserDocuments()
  const availableDocuments = []
  const missingDocuments = []

  service.requiredDocuments.forEach((reqDoc) => {
    const matchedUserDoc = userDocs.find((uDoc) => checkDocumentEquivalency(uDoc.name, reqDoc))
    if (matchedUserDoc) {
      availableDocuments.push({
        requiredName: reqDoc,
        userDocName: matchedUserDoc.name,
        category: matchedUserDoc.category,
        status: matchedUserDoc.status,
        confidence: matchedUserDoc.confidence,
        docNumber: matchedUserDoc.docNumber,
        isEquivalentMatch: matchedUserDoc.name.toLowerCase() !== reqDoc.toLowerCase(),
      })
    } else {
      missingDocuments.push({
        name: reqDoc,
        guide: documentGuides[reqDoc] || {
          priority: 'Medium',
          difficulty: 'Medium',
          source: 'Relevant Issuing Authority',
          timeline: '3-7 Days',
          cost: 'Standard fee',
          link: service.officialPortal.url,
          nextStep: `Procure ${reqDoc} from the designated government counter or online portal.`,
        },
      })
    }
  })

  const total = service.requiredDocuments.length
  const completionPercentage = total > 0 ? Math.round((availableDocuments.length / total) * 100) : 0

  return {
    serviceId: service.id,
    serviceTitle: service.title,
    category: service.category,
    officialPortal: service.officialPortal,
    totalRequired: total,
    matchedCount: availableDocuments.length,
    missingCount: missingDocuments.length,
    completionPercentage,
    availableDocuments,
    missingDocuments,
    steps: service.steps || [],
    commonPitfalls: service.commonPitfalls || [],
    generatedAt: new Date().toISOString(),
  }
}

function createTasksForService(serviceId) {
  const match = getMatchForService(serviceId)
  if (!match) return null

  const tasks = match.missingDocuments.map((doc, idx) => ({
    id: `task-${serviceId}-${idx + 1}`,
    docName: doc.name,
    priority: doc.guide?.priority || 'Medium',
    status: 'Not Started',
    source: doc.guide?.source || 'Designated Office',
    timeline: doc.guide?.timeline || '3-5 Days',
    cost: doc.guide?.cost || '₹50 - ₹200',
    link: doc.guide?.link || '#',
    nextStep: doc.guide?.nextStep || 'Apply at earliest to prevent admission rejection.',
  }))

  const taskList = {
    serviceId,
    serviceTitle: match.serviceTitle,
    generatedAt: new Date().toISOString(),
    tasks,
  }

  setTasksForService(serviceId, taskList)
  return taskList
}

// Multi-Mode AI Agent Intelligence
function generateAIResponse(query) {
  const q = (query || '').toLowerCase().trim()
  const userDocs = getUserDocuments()
  const userDocNames = userDocs.map((d) => d.name)

  // 1. App Section Navigation Intent
  if (q.includes('where is') || q.includes('how to find') || q.includes('go to') || q.includes('show me')) {
    if (q.includes('college') || q.includes('university') || q.includes('institute') || q.includes('admission') || q.includes('iit') || q.includes('dy patil')) {
      return {
        answer: `🎓 **You can find all real universities in the "College Admissions" tab!**\n\nThere you can:\n- Explore 50+ real institutes (Dr. D. Y. Patil, COEP Tech, VJTI, IIT Bombay, AIIMS, BITS Pilani, Harvard, Oxford, etc.).\n- View exact mandatory document checklists, cutoff requirements, fees, deadlines, and official portal links.\n- Run live readiness matches against your current document vault.`,
        actionTab: 'colleges',
        actionLabel: '👉 Open College Admissions Tab',
        relatedDocs: ['10th Marksheet', '12th Marksheet', 'Transfer Certificate (TC)', 'Migration Certificate'],
        suggestedAction: 'Click below to explore all colleges.',
      }
    }

    if (q.includes('vault') || q.includes('document') || q.includes('my doc') || q.includes('upload') || q.includes('camera') || q.includes('scan')) {
      return {
        answer: `📁 **Your verified certificates and camera scanner are in the "Document Vault" tab!**\n\nFeatures:\n- Real Camera / Photo OCR scanner to extract text instantly into the vault.\n- Check OCR confidence scores and issuing authority records.\n- Delete or manage uploaded documents in real time.`,
        actionTab: 'vault',
        actionLabel: '👉 Open Document Vault',
        relatedDocs: ['Aadhaar Card', 'PAN Card', '10th Marksheet', '12th Marksheet'],
        suggestedAction: 'Click below to manage your vault documents.',
      }
    }

    if (q.includes('mismatch') || q.includes('spelling') || q.includes('audit') || q.includes('dob error')) {
      return {
        answer: `🔍 **The "Mismatch Checker" tab runs automated Levenshtein spelling & DOB consistency audits!**\n\nIt flags:\n- Name spelling variations between 10th Marksheet and Aadhaar/PAN.\n- Conflicting Dates of Birth.\n- Actionable advice on required Notary Affidavits and UIDAI correction procedures.`,
        actionTab: 'mismatches',
        actionLabel: '👉 Go to Mismatch Checker',
        relatedDocs: ['10th Marksheet', 'Aadhaar Card', 'PAN Card'],
        suggestedAction: 'Click below to run a cross-document audit.',
      }
    }

    if (q.includes('task') || q.includes('checklist') || q.includes('todo') || q.includes('plan')) {
      return {
        answer: `✅ **The "Action Checklist" tab tracks your missing document procurement plan!**\n\nIt provides prioritized action items (High/Medium/Low), timeline estimates, and direct portal links.`,
        actionTab: 'tasks',
        actionLabel: '👉 View Action Checklist',
        relatedDocs: ['Transfer Certificate (TC)', 'Migration Certificate', 'Gap Year Affidavit'],
        suggestedAction: 'Click below to view your procurement roadmap.',
      }
    }
  }

  // 2. Dr. D. Y. Patil & Maharashtra Admissions
  if (q.includes('dy patil') || q.includes('dpu') || q.includes('dyp') || q.includes('akurdi') || q.includes('pimpri') || q.includes('coep') || q.includes('vjti')) {
    return {
      answer: `🏥 **Dr. D. Y. Patil Vidyapeeth (DPU) & Maharashtra Colleges Admission Guide:**\n\n1. **Entrance Scorecards:** NEET UG (for MBBS/BDS via MCC Deemed University counselling) or MHT-CET / JEE Main (for B.Tech Engineering via State CET Cell / DPU AIET).\n2. **Mandatory Academic Records:** Original 10th Marksheet (DOB benchmark) & 12th Board Marksheet.\n3. **Institutional Certificates:** Transfer Certificate (TC/SLC) & Migration Certificate from last attended junior college.\n4. **State Reservation:** Maharashtra Domicile Certificate, Caste Certificate, and Caste Validity Certificate (mandatory for backward class quotas).\n5. **Affidavits:** Notary Gap Year Affidavit on ₹100 stamp paper for droppers & Anti-Ragging undertaking.`,
      actionTab: 'colleges',
      actionLabel: '👉 View Dr. D. Y. Patil Profile in Colleges Tab',
      relatedDocs: ['NEET UG Scorecard & Admit Card', 'JEE Main Scorecard', 'Transfer Certificate (TC)', 'Domicile', 'Gap Year Affidavit'],
      suggestedAction: 'Open the College Admissions tab to see Dr. D. Y. Patil Vidyapeeth and COEP Tech!',
    }
  }

  // 3. UPSC & Civil Services
  if (q.includes('upsc') || q.includes('ias') || q.includes('ips') || q.includes('civil service') || q.includes('daf')) {
    return {
      answer: `🏛️ **UPSC Civil Services Examination (IAS/IPS) Detailed Application Form (DAF) Checklist:**\n\n1. **Date of Birth Benchmark:** Matriculation (Class 10) Passing Certificate or Marksheet is the sole accepted legal proof of Date of Birth.\n2. **Degree Proof:** Official Graduation Degree Certificate or provisional passing certificate issued by university Registrar.\n3. **Category / Caste Certificate:** Central Government format SC/ST/OBC-NCL/EWS certificate (OBC-NCL must be issued within the prescribed financial year before prelims notification cutoff).\n4. **Identity Proof:** Valid Aadhaar Card, Passport, or Voter ID with 100% identical spelling.`,
      actionTab: 'services',
      actionLabel: '👉 View UPSC Civil Services Details',
      relatedDocs: ['10th Marksheet', 'Graduation Degree / Passing Certificate', 'Category / EWS Certificate', 'Aadhaar Card'],
      suggestedAction: 'Match your vault against the UPSC Civil Services requirement checklist!',
    }
  }

  // 4. Aadhaar Centers & Corrections
  if (q.includes('aadhaar') || q.includes('adhar') || q.includes('uidai') || q.includes('ask') || q.includes('kendra')) {
    return {
      answer: `🆔 **Aadhaar Demographic Update & Seva Kendra Locator:**\n\n- **Online Portal:** \`myaadhaar.uidai.gov.in\` (Fee: ₹50)\n- **Physical Kendra (ASK):** ₹100 for biometric & name updates.\n- **Accepted for Name Update:** Passport, PAN Card, Voter ID, Driving Licence, or 10th Marksheet.\n- **Accepted for DOB Update:** 10th Class Marksheet / Passing Certificate or Birth Certificate.\n- **Important Limitation:** You are permitted only **2 lifetime name updates** without a Gazette notification.`,
      actionTab: 'services',
      actionLabel: '👉 View Aadhaar Seva Kendra Directory',
      relatedDocs: ['Aadhaar Card', '10th Marksheet', 'PAN Card'],
      suggestedAction: 'Check your Mismatch Checker tab to ensure your Aadhaar name matches your 10th marksheet.',
    }
  }

  // 5. Global Universities (Harvard, MIT, Oxford, Stanford)
  if (q.includes('harvard') || q.includes('mit') || q.includes('oxford') || q.includes('stanford') || q.includes('study abroad') || q.includes('ielts') || q.includes('toefl')) {
    return {
      answer: `🌍 **International Admissions (Harvard, MIT, Oxford, Stanford) Document Checklist:**\n\n1. **Valid Indian Passport:** Must have at least 6 months validity beyond your intended course start date.\n2. **Standardized Test Scores:** SAT / ACT (Undergrad) or GRE / GMAT (Postgrad) + TOEFL / IELTS / Duolingo English Proficiency.\n3. **Academic Transcripts:** Certified English copies of 10th & 12th Board marksheets.\n4. **Recommendation Letters (LOR):** 2 Teacher evaluations and 1 Counselor evaluation.\n5. **Personal Essay & SOP:** Statement of Purpose highlighting academic curiosity and extracurricular achievements.\n6. **Financial Solvency:** Bank Solvency Certificate and Sponsor Affidavit for student visa (I-20 / CAS).`,
      actionTab: 'colleges',
      actionLabel: '👉 Explore Global Universities (Harvard / MIT / Oxford)',
      relatedDocs: ['Valid Passport', 'TOEFL / IELTS Scorecard', 'Letter of Recommendation (LOR)', 'Statement of Purpose (SOP)', 'Financial Solvency Affidavit'],
      suggestedAction: 'Open the College Admissions tab to view Harvard and Oxford requirements!',
    }
  }

  // 6. Name / DOB Mismatch Fixes
  if (q.includes('mismatch') || q.includes('spelling') || q.includes('affidavit') || q.includes('differ') || q.includes('kumar')) {
    return {
      answer: `⚖️ **How to Fix Name & DOB Discrepancies Before Admission Submission:**\n\n1. **The 10th Marksheet Rule:** In Indian admissions (IITs, DU, AIIMS, UPSC), the name and DOB on your Class 10 certificate are treated as the absolute benchmark.\n2. **If Aadhaar differs from 10th Marksheet:** Update Aadhaar online via \`myaadhaar.uidai.gov.in\` using scanned Class 10 marksheet (Takes 3-5 days).\n3. **If Surname / Initial differs (e.g. Rahul Kr vs Rahul Kumar):** Obtain a **One-and-the-Same Person Affidavit** drafted on ₹100 non-judicial stamp paper from a local Notary public.\n4. **If Name was legally changed:** Submit a copy of the official Central / State Government Gazette Notification along with two local newspaper advertisements.`,
      actionTab: 'mismatches',
      actionLabel: '👉 Run Live Mismatch Audit',
      relatedDocs: ['10th Marksheet', 'Aadhaar Card', 'PAN Card'],
      suggestedAction: 'Go to Mismatch Checker to see consistency confidence scores for your vault documents.',
    }
  }

  // 7. General Assistant Fallback
  return {
    answer: `🤖 **Hello! I am your RUDOC Intelligent Document & Admission Co-Pilot.**\n\nI can help you with:\n1. **Real Colleges & Universities:** Ask about *Dr. D. Y. Patil, COEP Tech, VJTI, IIT Bombay, DU CSAS, AIIMS, BITS, Harvard, or Oxford*.\n2. **Competitive Exams & UPSC:** Ask about *UPSC Civil Services DAF, JEE JoSAA, NEET MCC, or CAT*.\n3. **Government Services & Aadhaar:** Ask about *Aadhaar Seva Kendra locator, Passport Tatkaal, or PAN-Aadhaar linkage*.\n4. **Mismatch Auditing:** Ask *"How to fix Aadhaar name spelling mismatch?"* or *"What is Gap Year affidavit format?"*\n5. **Camera & OCR:** Upload or snap documents directly in the Document Vault.`,
    actionTab: 'colleges',
    actionLabel: '👉 Explore College Directory',
    relatedDocs: ['Aadhaar Card', '10th Marksheet', 'Transfer Certificate (TC)', 'Income Certificate'],
    suggestedAction: 'Try asking: "What documents are required for Dr. D. Y. Patil?" or "Where is Aadhaar section?"',
  }
}

function getOverview() {
  const currentUser = getCurrentUser()
  const userDocs = getUserDocuments()
  const audit = auditDocumentMismatches()
  const db = getDb()
  const taskLists = Object.values(db.taskStore || {})
  const allTasks = taskLists.flatMap((tl) => tl.tasks || [])
  const completedTasks = allTasks.filter((t) => t.status === 'Completed')

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
      services: getServices().length,
      colleges: getColleges().length,
      aadhaarCenters: getAadhaarCenters().length,
      documents: userDocs.length,
      savedTaskLists: taskLists.length,
      activeTasks: allTasks.length - completedTasks.length,
      completedTasks: completedTasks.length,
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
    const user = getCurrentUser()
    sendJson(response, 200, {
      ok: true,
      app: 'RUDOC Flagship API',
      version: '2.0.0',
      currentUser: user ? user.name : 'Guest',
      timestamp: new Date().toISOString(),
    })
    return
  }

  // Auth: Users List
  if (request.method === 'GET' && path === '/api/auth/users') {
    const users = getUsers()
    const currentUser = getCurrentUser()
    sendJson(response, 200, {
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        docsCount: (u.documents || []).length,
      })),
      currentUser,
    })
    return
  }

  // Auth: Login / Switch User
  if (request.method === 'POST' && path === '/api/auth/login') {
    try {
      const body = await readJsonBody(request)
      const users = getUsers()
      const found = users.find((u) => u.email === body.email || u.id === body.userId)
      if (found) {
        setCurrentUser(found.id)
        sendJson(response, 200, { success: true, user: found })
      } else {
        const newUser = addUser({
          name: body.name || (body.email ? body.email.split('@')[0] : 'Applicant'),
          email: body.email || 'applicant@example.com',
          role: 'Registered Applicant',
          dob: body.dob || '2004-05-14',
          goal: 'College & Government Document Readiness',
        })
        sendJson(response, 200, { success: true, user: newUser })
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
      const newUser = addUser({
        name: body.name || 'New Applicant',
        email: body.email || 'user@example.com',
        role: 'Applicant',
        dob: body.dob || '2004-05-14',
        fatherName: body.fatherName || '',
        goal: body.goal || 'Prepare admissions and identity documents',
      })
      sendJson(response, 201, { success: true, user: newUser })
    } catch {
      sendJson(response, 400, { error: 'Invalid register payload' })
    }
    return
  }

  // User Documents: Get
  if (request.method === 'GET' && path === '/api/user/documents') {
    const docs = getUserDocuments()
    sendJson(response, 200, {
      documents: docs,
      profile: getCurrentUser(),
    })
    return
  }

  // User Documents: Add (with OCR support)
  if (request.method === 'POST' && path === '/api/user/documents') {
    try {
      const body = await readJsonBody(request)
      if (!body.name) {
        sendJson(response, 400, { error: 'Document name is required' })
        return
      }
      const currentUser = getCurrentUser()
      const newDoc = addUserDocument(currentUser.id, body)
      sendJson(response, 201, { success: true, document: newDoc })
    } catch {
      sendJson(response, 400, { error: 'Invalid document upload payload' })
    }
    return
  }

  // User Documents: Delete
  if (request.method === 'DELETE' && path.startsWith('/api/user/documents/')) {
    const docId = path.replace('/api/user/documents/', '')
    const currentUser = getCurrentUser()
    const ok = deleteUserDocument(currentUser.id, docId)
    if (ok) {
      sendJson(response, 200, { success: true, message: 'Document removed from vault' })
    } else {
      sendJson(response, 404, { error: 'Document not found' })
    }
    return
  }

  // Dynamic In-Memory Cache for Global & Live API Universities
  // Colleges List (with Live Global Search API)
  if (request.method === 'GET' && path === '/api/colleges') {
    const searchQuery = (url.searchParams.get('search') || '').trim().toLowerCase()
    const localColleges = getColleges()

    if (!searchQuery) {
      sendJson(response, 200, { colleges: localColleges })
      return
    }

    // 1. Filter local premier and regional colleges
    const matchedLocal = localColleges.filter((c) => {
      return (
        c.name.toLowerCase().includes(searchQuery) ||
        c.shortName.toLowerCase().includes(searchQuery) ||
        c.location.toLowerCase().includes(searchQuery) ||
        c.stream.toLowerCase().includes(searchQuery) ||
        c.id.toLowerCase().includes(searchQuery)
      )
    })

    // 2. Fetch live results from Hipo Open Global Universities API
    let liveGlobalResults = []
    if (searchQuery.length >= 2) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2500)
        const apiUrl = `http://universities.hipolabs.com/search?name=${encodeURIComponent(searchQuery)}`
        const apiRes = await fetch(apiUrl, { signal: controller.signal })
        clearTimeout(timeoutId)

        if (apiRes.ok) {
          const rawList = await apiRes.json()
          liveGlobalResults = rawList.slice(0, 25).map((univ, idx) => {
            const isIndia = (univ.country || '').toLowerCase() === 'india'
            const isTech = /tech|engineer|polytechnic|science|iit|nit|iiit/i.test(univ.name)
            const isMed = /medic|health|dental|pharma|nurs|hospital/i.test(univ.name)
            const isLaw = /law|jurid/i.test(univ.name)
            const isMgmt = /manage|business|commerce|econom/i.test(univ.name)

            let stream = 'Higher Education & Research'
            if (isTech) stream = 'Engineering & Technology (B.Tech / B.E.)'
            else if (isMed) stream = 'Medical & Healthcare (MBBS / BDS)'
            else if (isLaw) stream = 'Law (LL.B. / LL.M.)'
            else if (isMgmt) stream = 'Management & Commerce (MBA / BBA)'

            const reqDocs = isIndia
              ? isTech
                ? ['10th Marksheet', '12th Marksheet', 'JEE / State CET Scorecard', 'Transfer Certificate (TC)', 'Migration Certificate', 'Domicile Certificate', 'Aadhaar Card', 'Medical Fitness Certificate']
                : isMed
                  ? ['10th Marksheet', '12th Marksheet', 'NEET UG Scorecard', 'Transfer Certificate (TC)', 'Migration Certificate', 'Domicile Certificate', 'Medical Fitness Certificate', 'Aadhaar Card']
                  : ['10th Marksheet', '12th Marksheet', 'Entrance Exam Scorecard', 'Transfer Certificate (TC)', 'Migration Certificate', 'Aadhaar Card']
              : ['Valid Passport', '10th Marksheet', '12th Marksheet', 'Official Academic Transcripts', 'TOEFL / IELTS Scorecard', 'Letter of Recommendation (LOR)', 'Statement of Purpose (SOP)', 'Financial Solvency Affidavit']

            const portalUrl = (univ.web_pages && univ.web_pages[0]) || `https://${univ.domains?.[0] || 'google.com'}`
            const cleanId = `univ-${univ.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 35)}-${idx}`

            return {
              id: cleanId,
              name: univ.name,
              shortName: univ.name.length > 35 ? univ.name.split('(')[0].trim() : univ.name,
              logoIcon: isTech ? '⚙️' : isMed ? '🏥' : isLaw ? '⚖️' : isMgmt ? '💼' : '🏛️',
              crestEmoji: '🎓',
              gradientBadge: isTech
                ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                : isMed
                  ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                  : 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
              badgeColor: '#0284c7',
              location: `${univ['state-province'] ? univ['state-province'] + ', ' : ''}${univ.country}`,
              type: isIndia ? 'Government / AICTE / State Approved Institute' : 'Global Accredited University',
              stream,
              ranking: isIndia ? 'UGC / NIRF Approved' : 'QS / Times Higher Education Recognized',
              fee: isIndia ? '₹85,000 - ₹1,80,000 / year' : '$20,000 - $55,000 / year',
              deadline: 'Annual Intake / State Admission Window',
              officialPortal: {
                label: univ.name,
                url: portalUrl,
              },
              description: `Accredited university located in ${univ.location || univ.country}.`,
              requiredDocuments: reqDocs,
              specificNotes: [
                `Admissions via official portal: ${portalUrl}`,
                'Class 10 marksheet is the legal proof of Date of Birth.',
                'Keep minimum 3 sets of attested document photocopies.',
              ],
            }
          })
        }
      } catch (err) {
        console.warn('Live global search fallback:', err.message)
      }
    }

    // Merge and deduplicate by normalized name
    const seenNames = new Set()
    const combined = []

    matchedLocal.forEach((c) => {
      const norm = c.name.toLowerCase().trim()
      if (!seenNames.has(norm)) {
        seenNames.add(norm)
        combined.push(c)
      }
    })

    liveGlobalResults.forEach((c) => {
      const norm = c.name.toLowerCase().trim()
      if (!seenNames.has(norm)) {
        seenNames.add(norm)
        combined.push(c)
      }
    })

    sendJson(response, 200, { colleges: combined })
    return
  }

  // College Matching
  if (request.method === 'GET' && path.startsWith('/api/colleges/') && path.endsWith('/match')) {
    const collegeId = decodeURIComponent(path.replace('/api/colleges/', '').replace('/match', ''))
    const match = getMatchForCollege(collegeId)
    sendJson(response, 200, match)
    return
  }

  // Services List
  if (request.method === 'GET' && path === '/api/services') {
    sendJson(response, 200, { services: getServices() })
    return
  }

  // Aadhaar Centers Directory
  if (request.method === 'GET' && path === '/api/aadhaar-centers') {
    sendJson(response, 200, { aadhaarCenters: getAadhaarCenters() })
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

  // Requirement Match for Service
  if (request.method === 'GET' && path.startsWith('/api/match/')) {
    const serviceId = decodeURIComponent(path.replace('/api/match/', ''))
    const match = getMatchForService(serviceId)
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
    const existing = getTasksForService(serviceId)
    sendJson(response, 200, existing || createTasksForService(serviceId))
    return
  }

  // Update Task Status
  if (request.method === 'PATCH' && path.startsWith('/api/tasks/')) {
    const parts = path.split('/').filter(Boolean)
    const serviceId = decodeURIComponent(parts[2] ?? '')
    const taskId = decodeURIComponent(parts[3] ?? '')

    try {
      const body = await readJsonBody(request)
      const taskList = updateTaskStatus(serviceId, taskId, body.status)
      if (!taskList) {
        sendJson(response, 404, { error: 'Task list not found' })
        return
      }
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
    console.log(`RUDOC Flagship API running at http://127.0.0.1:${PORT}`)
  })
}

export default handleRequest
