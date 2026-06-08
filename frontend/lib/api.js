// Helper fetch authentifié pour les pages utilisateur.
// Lit le token depuis cvmb:session et l'envoie dans Authorization.

const SESSION_KEY = 'cvmb:session'

export function getSession() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export async function authFetch(url, options = {}) {
  const session = getSession()
  const token   = session?.token

  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(url, { ...options, headers })

  if (res.status === 401 && typeof window !== 'undefined') {
    window.localStorage.removeItem(SESSION_KEY)
    window.location.href = '/login'
    throw new Error('Session expirée.')
  }

  return res
}
