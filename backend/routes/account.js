const express = require('express')
const { authenticate } = require('../auth')
const { hashPassword } = require('../lib/crypto')
const { getEntrepriseBySiret } = require('../sirene')
const {
  normalizeRequiredString, normalizeBoolean, normalizeNumericId,
  normalizeWorkforceLabel, splitFullName, workforceToEffectif,
  normalizeCompanySize, normalizeSector, formatAccountPayload,
} = require('../lib/utils')
const { ensureNationalCci, persistDiagnosticSnapshot } = require('../lib/entreprise')
const { generateTemporaryPassword } = require('../lib/crypto')

module.exports = function createAccountRouter(prisma) {
  const router = express.Router()

  /* ── GET /account/:userId ── (requiert authentification, soi-même uniquement) */
  router.get('/account/:userId', authenticate, async (req, res, next) => {
    try {
      const userId = normalizeNumericId(req.params.userId)
      if (!userId) return res.status(400).json({ error: 'userId must be a positive integer' })

      const isAdmin = req.auth.role === 'admin_local' || req.auth.role === 'admin_national'
      if (!isAdmin && req.auth.id !== userId) return res.status(403).json({ error: 'Accès refusé.' })

      const utilisateur = await prisma.utilisateur.findUnique({
        where: { id: userId },
        include: { entreprises: { orderBy: { cree_le: 'desc' }, take: 1 } },
      })

      if (!utilisateur) return res.status(404).json({ error: 'User not found' })
      res.json(formatAccountPayload(utilisateur, utilisateur.entreprises[0] || null))
    } catch (error) { next(error) }
  })

  /* ── PATCH /account/:userId ── (requiert authentification, soi-même uniquement) */
  router.patch('/account/:userId', authenticate, async (req, res, next) => {
    try {
      const userId      = normalizeNumericId(req.params.userId)
      const email       = normalizeRequiredString(req.body?.email)
      const companyName = normalizeRequiredString(req.body?.companyName)
      const directorName = normalizeRequiredString(req.body?.directorName)
      const phone       = normalizeRequiredString(req.body?.phone)
      const workforce   = normalizeWorkforceLabel(req.body?.workforce)
      const creationYear = normalizeNumericId(req.body?.creationYear)
      const commune     = normalizeRequiredString(req.body?.commune)
      const siret       = normalizeRequiredString(req.body?.siret)?.replace(/\D/g, '')

      if (!userId) return res.status(400).json({ error: 'userId must be a positive integer' })

      const isAdmin = req.auth.role === 'admin_local' || req.auth.role === 'admin_national'
      if (!isAdmin && req.auth.id !== userId) return res.status(403).json({ error: 'Accès refusé.' })

      if (!email || !companyName || !directorName || !phone || !workforce || !creationYear || !siret) {
        return res.status(400).json({ error: 'All account fields are required' })
      }
      if (siret.length !== 14) return res.status(400).json({ error: 'siret must contain 14 digits' })

      const utilisateur = await prisma.utilisateur.findUnique({
        where: { id: userId },
        include: { entreprises: { orderBy: { cree_le: 'desc' }, take: 1 } },
      })
      if (!utilisateur) return res.status(404).json({ error: 'User not found' })

      const { firstName, lastName } = splitFullName(directorName)

      const duplicateUser = await prisma.utilisateur.findUnique({ where: { email } })
      if (duplicateUser && duplicateUser.id !== utilisateur.id) {
        return res.status(409).json({ error: 'This email is already used by another account' })
      }

      const currentEntreprise  = utilisateur.entreprises[0] || null
      const duplicateEntreprise = await prisma.entreprise.findUnique({ where: { siret } })
      if (duplicateEntreprise && duplicateEntreprise.id !== currentEntreprise?.id && duplicateEntreprise.dirigeant_id !== utilisateur.id) {
        return res.status(409).json({ error: 'This SIRET is already used by another company' })
      }

      const cci = utilisateur.cci_id
        ? await prisma.cci.findUnique({ where: { id: utilisateur.cci_id } })
        : await ensureNationalCci(prisma)

      const updatedUser = await prisma.utilisateur.update({
        where: { id: utilisateur.id },
        data: { email, prenom: firstName, nom: lastName, telephone: phone },
      })

      const updatedEntreprise = currentEntreprise
        ? await prisma.entreprise.update({
            where: { id: currentEntreprise.id },
            data: { siret, raison_sociale: companyName, ville: commune,
              effectif: workforceToEffectif(workforce), effectif_texte: workforce,
              annee_creation: creationYear, mis_a_jour_le: new Date() },
          })
        : await prisma.entreprise.create({
            data: {
              dirigeant_id: updatedUser.id,
              cci_id: cci?.id || (await ensureNationalCci(prisma)).id,
              siret, raison_sociale: companyName, ville: commune,
              taille: null, effectif: workforceToEffectif(workforce),
              effectif_texte: workforce, annee_creation: creationYear, demande_contact: true,
            },
          })

      res.json(formatAccountPayload(updatedUser, updatedEntreprise))
    } catch (error) { next(error) }
  })

  /* ── POST /accompagnement/submit ── (public) */
  router.post('/accompagnement/submit', async (req, res, next) => {
    try {
      const companyName      = normalizeRequiredString(req.body?.companyName)
      const managerName      = normalizeRequiredString(req.body?.managerName)
      const phone            = normalizeRequiredString(req.body?.phone)
      const workforce        = normalizeRequiredString(req.body?.workforce)
      const creationYear     = normalizeNumericId(req.body?.creationYear)
      const email            = normalizeRequiredString(req.body?.email)
      const city             = normalizeRequiredString(req.body?.city)
      const siret            = normalizeRequiredString(req.body?.siret)?.replace(/\D/g, '')
      const contactRequested = normalizeBoolean(req.body?.contactRequested)
      const diagnostic       = req.body?.diagnostic || null

      if (!companyName || !managerName || !phone || !workforce || !creationYear || !email || !siret) {
        return res.status(400).json({ error: 'Missing required fields' })
      }
      if (siret.length !== 14) return res.status(400).json({ error: 'siret must contain 14 digits' })
      if (!diagnostic || !Array.isArray(diagnostic.answers) || !diagnostic.answers.length) {
        return res.status(400).json({ error: 'diagnostic snapshot is required to create the account' })
      }

      const cci          = await ensureNationalCci(prisma)
      const tempPassword = generateTemporaryPassword()
      const { firstName, lastName } = splitFullName(managerName)
      const filters      = diagnostic.filters || {}
      const size         = normalizeCompanySize(filters.size)
      const sector       = normalizeSector(filters.sector)
      const sireneCompany = await getEntrepriseBySiret(siret).catch(() => null)

      const utilisateur = await prisma.utilisateur.upsert({
        where: { email },
        create: {
          email, mot_de_passe: hashPassword(tempPassword),
          prenom: firstName, nom: lastName, telephone: phone,
          role: 'dirigeant', cci_id: cci.id, actif: true, doit_modifier_mot_de_passe: true,
        },
        update: {
          mot_de_passe: hashPassword(tempPassword),
          prenom: firstName, nom: lastName, telephone: phone,
          role: 'dirigeant', cci_id: cci.id, actif: true, doit_modifier_mot_de_passe: true,
        },
      })

      const entreprise = await prisma.entreprise.upsert({
        where: { siret },
        create: {
          dirigeant_id: utilisateur.id, cci_id: cci.id, siret,
          raison_sociale: companyName, code_postal: sireneCompany?.codePostal || null,
          ville: city, secteur: sector, taille: size,
          effectif: workforceToEffectif(workforce), effectif_texte: workforce,
          annee_creation: creationYear, demande_contact: contactRequested,
        },
        update: {
          dirigeant_id: utilisateur.id, cci_id: cci.id,
          raison_sociale: companyName, code_postal: sireneCompany?.codePostal || null,
          ville: city, secteur: sector, taille: size,
          effectif: workforceToEffectif(workforce), effectif_texte: workforce,
          annee_creation: creationYear, demande_contact: contactRequested, mis_a_jour_le: new Date(),
        },
      })

      const persistedDiagnostic = await persistDiagnosticSnapshot(prisma, entreprise.id, diagnostic)

      res.status(201).json({
        credentials: { identifier: utilisateur.email, password: tempPassword },
        user: { id: utilisateur.id, email: utilisateur.email, prenom: utilisateur.prenom,
          nom: utilisateur.nom, mustChangePassword: utilisateur.doit_modifier_mot_de_passe },
        entreprise: { id: entreprise.id, siret: entreprise.siret, raisonSociale: entreprise.raison_sociale,
          ville: entreprise.ville, effectif: entreprise.effectif, effectifTexte: entreprise.effectif_texte,
          anneeCreation: entreprise.annee_creation, demandeContact: entreprise.demande_contact },
        diagnostic: persistedDiagnostic,
      })
    } catch (error) { next(error) }
  })

  return router
}
