const STORAGE_KEY = 'nlkart_logs'
const SESSION_KEY = 'nlkart_session_id'
const MAX_LOGS = 1000

const LEVELS = ['error', 'warn', 'info', 'flow']
const CATEGORIES = ['auth', 'product', 'cart', 'order', 'navigation', 'system']

function generateId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9)
}

export function getSessionId() {
  let sessionId = sessionStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    sessionId = generateId()
    sessionStorage.setItem(SESSION_KEY, sessionId)
  }
  return sessionId
}

function getUserId() {
  try {
    const user = localStorage.getItem('user')
    if (user && user !== 'undefined') {
      const parsed = JSON.parse(user)
      return parsed.userId || parsed.id || null
    }
  } catch {
    // ignore
  }
  return null
}

function getStoredLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch {
    // ignore
  }
  return []
}

function storeLogs(logs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs))
  } catch {
    // ignore - storage full, etc.
  }
}

export function log(level, category, action, data = null) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    category,
    action,
    data,
    sessionId: getSessionId(),
    userId: getUserId(),
  }

  const logs = getStoredLogs()
  logs.push(entry)

  // Trim oldest logs if exceeding max
  if (logs.length > MAX_LOGS) {
    logs.splice(0, logs.length - MAX_LOGS)
  }

  storeLogs(logs)
}

export function logFlow(category, action, data) {
  log('flow', category, action, data)
}

export function logInfo(category, action, data) {
  log('info', category, action, data)
}

export function logWarn(category, action, data) {
  log('warn', category, action, data)
}

export function logError(category, action, data) {
  log('error', category, action, data)
}

export function getLogs() {
  return getStoredLogs()
}

export function clearLogs() {
  localStorage.removeItem(STORAGE_KEY)
}

export function exportLogs() {
  return JSON.stringify(getStoredLogs(), null, 2)
}
