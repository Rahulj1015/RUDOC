import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  aadhaarCenters,
  colleges,
  demoUsers,
  documentEquivalents,
  documentGuides,
  services,
} from './data.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DB_PATH = path.resolve(__dirname, '../database/rudoc-db.json')

let memoryDb = null

function initializeDb() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8')
      memoryDb = JSON.parse(raw)
      // Merge any new colleges or services from code if missing in saved json
      if (!memoryDb.colleges || memoryDb.colleges.length < colleges.length) {
        memoryDb.colleges = colleges
      }
      if (!memoryDb.services || memoryDb.services.length < services.length) {
        memoryDb.services = services
      }
      if (!memoryDb.aadhaarCenters) {
        memoryDb.aadhaarCenters = aadhaarCenters
      }
      if (!memoryDb.documentEquivalents) {
        memoryDb.documentEquivalents = documentEquivalents
      }
      if (!memoryDb.documentGuides) {
        memoryDb.documentGuides = documentGuides
      }
      return
    }
  } catch (err) {
    console.warn('Could not read existing database, creating new seed:', err.message)
  }

  // Initial Seed
  memoryDb = {
    version: '2.0.0',
    lastSaved: new Date().toISOString(),
    currentUserId: demoUsers[0].id,
    users: JSON.parse(JSON.stringify(demoUsers)),
    colleges: JSON.parse(JSON.stringify(colleges)),
    services: JSON.parse(JSON.stringify(services)),
    aadhaarCenters: JSON.parse(JSON.stringify(aadhaarCenters)),
    documentEquivalents: JSON.parse(JSON.stringify(documentEquivalents)),
    documentGuides: JSON.parse(JSON.stringify(documentGuides)),
    taskStore: {},
    auditLogs: [],
  }

  saveDb()
}

export function saveDb() {
  if (!memoryDb) return
  memoryDb.lastSaved = new Date().toISOString()
  try {
    const dir = path.dirname(DB_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(memoryDb, null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to persist database to disk:', err.message)
  }
}

export function getDb() {
  if (!memoryDb) initializeDb()
  return memoryDb
}

export function getCurrentUser() {
  const db = getDb()
  const user = db.users.find((u) => u.id === db.currentUserId)
  return user || db.users[0]
}

export function setCurrentUser(userIdOrObj) {
  const db = getDb()
  if (typeof userIdOrObj === 'string') {
    db.currentUserId = userIdOrObj
  } else if (userIdOrObj && userIdOrObj.id) {
    db.currentUserId = userIdOrObj.id
  }
  saveDb()
  return getCurrentUser()
}

export function getUsers() {
  return getDb().users
}

export function addUser(user) {
  const db = getDb()
  const newUser = {
    id: user.id || `user-${Date.now()}`,
    name: user.name || 'Applicant',
    email: user.email,
    role: user.role || 'Student / Applicant',
    dob: user.dob || '2004-05-14',
    fatherName: user.fatherName || '',
    goal: user.goal || 'Prepare admissions and identity documents',
    documents: user.documents || [],
  }
  db.users.push(newUser)
  db.currentUserId = newUser.id
  saveDb()
  return newUser
}

export function getUserDocuments(userId) {
  const db = getDb()
  const uId = userId || db.currentUserId
  const user = db.users.find((u) => u.id === uId)
  return user ? user.documents || [] : []
}

export function addUserDocument(userId, doc) {
  const db = getDb()
  const uId = userId || db.currentUserId
  const user = db.users.find((u) => u.id === uId)
  if (!user) return null

  if (!user.documents) user.documents = []
  const newDoc = {
    id: doc.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    name: doc.name,
    category: doc.category || 'Identity',
    status: doc.status || 'Verified',
    holderName: doc.holderName || user.name,
    dob: doc.dob || user.dob,
    docNumber: doc.docNumber || 'DOC-' + Math.floor(100000 + Math.random() * 900000),
    issuer: doc.issuer || 'Official Issuing Authority',
    updatedAt: new Date().toISOString().split('T')[0],
    confidence: doc.confidence || 95,
    extractedText: doc.extractedText || '',
  }

  // Remove existing doc with same name if replacing
  user.documents = user.documents.filter((d) => d.name.toLowerCase() !== newDoc.name.toLowerCase())
  user.documents.push(newDoc)
  saveDb()
  return newDoc
}

export function deleteUserDocument(userId, docId) {
  const db = getDb()
  const uId = userId || db.currentUserId
  const user = db.users.find((u) => u.id === uId)
  if (!user || !user.documents) return false
  const initialLen = user.documents.length
  user.documents = user.documents.filter((d) => d.id !== docId)
  saveDb()
  return user.documents.length < initialLen
}

export function getColleges() {
  return getDb().colleges
}

export function getCollegeById(id) {
  const db = getDb()
  return db.colleges.find((c) => c.id === id) || null
}

export function getServices() {
  return getDb().services
}

export function getServiceById(id) {
  const db = getDb()
  return db.services.find((s) => s.id === id) || null
}

export function getAadhaarCenters() {
  return getDb().aadhaarCenters
}

export function getTasksForService(serviceId) {
  const db = getDb()
  return db.taskStore[serviceId] || null
}

export function setTasksForService(serviceId, taskList) {
  const db = getDb()
  db.taskStore[serviceId] = taskList
  saveDb()
  return taskList
}

export function updateTaskStatus(serviceId, taskId, status) {
  const db = getDb()
  const taskList = db.taskStore[serviceId]
  if (!taskList || !taskList.tasks) return null
  taskList.tasks = taskList.tasks.map((task) =>
    task.id === taskId ? { ...task, status: status || task.status } : task
  )
  saveDb()
  return taskList
}

// Auto init on import
initializeDb()
