// Rate limiter en mémoire simple — pas de dépendance externe.
// Compte les tentatives par IP sur une fenêtre glissante.

function createRateLimiter({ windowMs = 15 * 60 * 1000, max = 20, message = 'Trop de tentatives, réessayez plus tard.' } = {}) {
  const store = new Map() // ip -> { count, resetAt }

  // Nettoyage périodique pour éviter les fuites mémoire.
  setInterval(() => {
    const now = Date.now()
    for (const [ip, entry] of store.entries()) {
      if (entry.resetAt <= now) store.delete(ip)
    }
  }, windowMs).unref()

  return function rateLimitMiddleware(req, res, next) {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown'
    const now = Date.now()
    const entry = store.get(ip)

    if (!entry || entry.resetAt <= now) {
      store.set(ip, { count: 1, resetAt: now + windowMs })
      return next()
    }

    entry.count += 1

    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000))
      return res.status(429).json({ error: message })
    }

    return next()
  }
}

module.exports = { createRateLimiter }
