// ============================================================
//  AUTH — Comment Va Ma Boîte (CVMB)
//  Tokens signés (HMAC SHA-256) + middleware d'authentification
//  et de contrôle d'accès par rôle.
//  Aucune dépendance externe : on s'appuie sur le module `crypto`.
// ============================================================

const { createHmac, timingSafeEqual } = require('crypto')

const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  'cvmb-dev-secret-change-me-in-production-please-1234567890'

// Durée de vie d'un token : 12 heures.
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000

const ROLES = {
  DIRIGEANT: 'dirigeant',
  CONSEILLER: 'conseiller',
  ADMIN_LOCAL: 'admin_local',
  ADMIN_NATIONAL: 'admin_national',
}

function base64url(input) {
  return Buffer.from(input).toString('base64url')
}

function sign(body) {
  return createHmac('sha256', AUTH_SECRET).update(body).digest('base64url')
}

// Crée un token "body.signature" où body encode { sub, role, cciId, email, exp }.
function signToken(payload, ttlMs = TOKEN_TTL_MS) {
  const claims = {
    sub: payload.id,
    role: payload.role,
    cciId: payload.cciId ?? null,
    email: payload.email ?? null,
    exp: Date.now() + ttlMs,
  }

  const body = base64url(JSON.stringify(claims))
  return `${body}.${sign(body)}`
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') {
    return null
  }

  const parts = token.split('.')
  if (parts.length !== 2) {
    return null
  }

  const [body, signature] = parts
  const expected = sign(body)

  const signatureBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null
  }

  let claims
  try {
    claims = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
  } catch {
    return null
  }

  if (!claims || typeof claims.exp !== 'number' || claims.exp < Date.now()) {
    return null
  }

  return claims
}

function extractToken(req) {
  const header = req.headers?.authorization || ''
  if (header.startsWith('Bearer ')) {
    return header.slice(7).trim()
  }
  // Fallback : query string (utile pour les téléchargements / liens directs).
  if (typeof req.query?.token === 'string') {
    return req.query.token
  }
  return null
}

// Middleware : exige un token valide, attache req.auth = { id, role, cciId, email }.
function authenticate(req, res, next) {
  const claims = verifyToken(extractToken(req))

  if (!claims) {
    return res.status(401).json({ error: 'Authentification requise.' })
  }

  req.auth = {
    id: claims.sub,
    role: claims.role,
    cciId: claims.cciId ?? null,
    email: claims.email ?? null,
  }

  return next()
}

// Middleware factory : exige que le rôle de l'utilisateur soit dans la liste.
function requireRole(...roles) {
  const allowed = new Set(roles)
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ error: 'Authentification requise.' })
    }
    if (!allowed.has(req.auth.role)) {
      return res.status(403).json({ error: 'Accès refusé.' })
    }
    return next()
  }
}

const isAdmin = (req) =>
  req.auth &&
  (req.auth.role === ROLES.ADMIN_LOCAL || req.auth.role === ROLES.ADMIN_NATIONAL)

const isNationalAdmin = (req) =>
  req.auth && req.auth.role === ROLES.ADMIN_NATIONAL

module.exports = {
  ROLES,
  TOKEN_TTL_MS,
  signToken,
  verifyToken,
  authenticate,
  requireRole,
  isAdmin,
  isNationalAdmin,
}
