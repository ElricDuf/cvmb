require('dotenv').config()

const express = require('express')
const cors    = require('cors')
const { PrismaClient } = require('@prisma/client')

const createAuthRouter        = require('./routes/auth')
const createDiagnosticsRouter = require('./routes/diagnostics')
const createAccountRouter     = require('./routes/account')
const createSireneRouter      = require('./routes/sirene')
const createAdminRouter       = require('./routes/admin')
const { hashPassword, generateTemporaryPassword } = require('./lib/crypto')

const app    = express()
const port   = process.env.PORT || 4000
const prisma = new PrismaClient()

/* ── CORS ───────────────────────────────────────────────────
   Restreint aux origines autorisées.
   En développement : http://localhost:3000
   En production    : définir FRONTEND_URL dans .env
────────────────────────────────────────────────────────── */
const allowedOrigins = new Set(
  (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
)

app.use(cors({
  origin(origin, callback) {
    // Autoriser les appels sans origine (curl, Postman, SSR Next.js côté serveur)
    if (!origin || allowedOrigins.has(origin)) return callback(null, true)
    callback(new Error(`CORS: origine non autorisée : ${origin}`))
  },
  credentials: true,
}))

app.use(express.json())

/* ── Routes ─────────────────────────────────────────────── */
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.use('/api/auth',           createAuthRouter(prisma))
app.use('/api',                createDiagnosticsRouter(prisma))
app.use('/api',                createAccountRouter(prisma))
app.use('/api',                createSireneRouter(prisma))
app.use('/api/admin',          createAdminRouter(prisma, { hashPassword, generateTemporaryPassword }))

/* ── Gestionnaire d'erreurs global ──────────────────────── */
app.use((error, _req, res, _next) => {
  console.error(error)
  const status = error.statusCode || 500
  res.status(status).json({
    error: error.message || 'Internal Server Error',
    details: error.details || undefined,
  })
})

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`)
})
