// Helpers d'appel API pour l'espace admin (lecture du token de session,
// ajout de l'en-tête Authorization, gestion d'erreurs).

const SESSION_KEY = 'cvmb:session'

export function readSession() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getToken() {
  return readSession()?.token || null
}

export function isAdminRole(role) {
  return role === 'admin_local' || role === 'admin_national'
}

export async function adminFetch(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`/api/admin${path}`, { ...options, headers })

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(SESSION_KEY)
      window.location.href = '/login'
    }
    throw new Error('Session expirée, veuillez vous reconnecter.')
  }

  const contentType = response.headers.get('content-type') || ''
  if (!response.ok) {
    let message = 'Erreur serveur.'
    if (contentType.includes('application/json')) {
      const data = await response.json().catch(() => null)
      message = data?.error || message
    }
    throw new Error(message)
  }

  if (contentType.includes('application/json')) {
    return response.json()
  }
  return response
}

// Construit une query string en ignorant les valeurs vides.
export function buildQuery(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).length > 0) {
      search.append(key, value)
    }
  })
  const str = search.toString()
  return str ? `?${str}` : ''
}
