const express = require('express')
const { signToken, authenticate } = require('../auth')
const { verifyPassword, hashPassword } = require('../lib/crypto')
const { normalizeRequiredString, normalizeNumericId } = require('../lib/utils')
const { createRateLimiter } = require('../lib/rateLimit')

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
})

module.exports = function createAuthRouter(prisma) {
  const router = express.Router()

  router.post('/login', loginLimiter, async (req, res, next) => {
    try {
      const email    = normalizeRequiredString(req.body?.identifier)
      const password = normalizeRequiredString(req.body?.password)

      if (!email || !password) {
        return res.status(400).json({ error: 'identifier and password are required' })
      }

      const utilisateur = await prisma.utilisateur.findUnique({
        where: { email },
        include: {
          cci: true,
          entreprises: { orderBy: { cree_le: 'desc' }, take: 1 },
        },
      })

      if (!utilisateur || !utilisateur.actif || !verifyPassword(password, utilisateur.mot_de_passe)) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      await prisma.utilisateur.update({
        where: { id: utilisateur.id },
        data: { derniere_connexion: new Date() },
      })

      const token = signToken({
        id: utilisateur.id,
        role: utilisateur.role,
        cciId: utilisateur.cci_id,
        email: utilisateur.email,
      })

      return res.json({
        token,
        user: {
          id: utilisateur.id,
          email: utilisateur.email,
          prenom: utilisateur.prenom,
          nom: utilisateur.nom,
          role: utilisateur.role,
          cciId: utilisateur.cci_id,
        },
        cci: utilisateur.cci
          ? { id: utilisateur.cci.id, nom: utilisateur.cci.nom, code: utilisateur.cci.code,
              region: utilisateur.cci.region, estNational: utilisateur.cci.est_national }
          : null,
        entreprise: utilisateur.entreprises[0]
          ? { id: utilisateur.entreprises[0].id, raisonSociale: utilisateur.entreprises[0].raison_sociale,
              siret: utilisateur.entreprises[0].siret, taille: utilisateur.entreprises[0].taille,
              secteur: utilisateur.entreprises[0].secteur }
          : null,
        mustChangePassword: utilisateur.doit_modifier_mot_de_passe,
      })
    } catch (error) {
      next(error)
    }
  })

  router.post('/password', async (req, res, next) => {
    try {
      const userId          = normalizeNumericId(req.body?.userId)
      const currentPassword = normalizeRequiredString(req.body?.currentPassword)
      const newPassword     = normalizeRequiredString(req.body?.newPassword)

      if (!userId || !newPassword) {
        return res.status(400).json({ error: 'userId and newPassword are required' })
      }

      const utilisateur = await prisma.utilisateur.findUnique({ where: { id: userId } })

      if (!utilisateur) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const isFirstSetup = Boolean(utilisateur.doit_modifier_mot_de_passe)

      if (!isFirstSetup && (!currentPassword || !verifyPassword(currentPassword, utilisateur.mot_de_passe))) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      await prisma.utilisateur.update({
        where: { id: utilisateur.id },
        data: { mot_de_passe: hashPassword(newPassword), doit_modifier_mot_de_passe: false },
      })

      return res.json({ success: true })
    } catch (error) {
      next(error)
    }
  })

  return router
}
