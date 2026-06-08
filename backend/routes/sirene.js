const express = require('express')
const { getEntrepriseBySiret, getEntrepriseBySiren } = require('../sirene')
const { normalizeNumericId, normalizeRequiredString } = require('../lib/utils')

module.exports = function createSireneRouter(prisma) {
  const router = express.Router()

  router.get('/sirene/siret/:siret', async (req, res, next) => {
    try {
      const entreprise = await getEntrepriseBySiret(req.params.siret)
      res.json({ source: 'sirene', entreprise })
    } catch (error) { next(error) }
  })

  router.get('/sirene/siren/:siren', async (req, res, next) => {
    try {
      const entreprise = await getEntrepriseBySiren(req.params.siren)
      res.json({ source: 'sirene', entreprise })
    } catch (error) { next(error) }
  })

  // Import d'une entreprise depuis SIRENE — bug camelCase corrigé
  router.post('/entreprises/sirene/import', async (req, res, next) => {
    try {
      const { siret, siren, dirigeantId, cciId } = req.body || {}

      if (!siret) return res.status(400).json({ error: 'siret is required to import an entreprise' })
      if (siren)  return res.status(400).json({ error: 'use the lookup endpoint for SIREN; import requires a SIRET' })

      const source = await getEntrepriseBySiret(siret)

      if (!dirigeantId) return res.status(400).json({ error: 'dirigeantId is required to create or update an entreprise' })

      const normalizedSiret = source.siret || String(siret || '').replace(/\D/g, '')

      const entreprise = await prisma.entreprise.upsert({
        where: { siret: normalizedSiret },
        create: {
          dirigeant_id:   Number(dirigeantId),
          cci_id:         cciId ? Number(cciId) : null,
          siret:          normalizedSiret,
          raison_sociale: source.raisonSociale   || null,
          code_postal:    source.codePostal       || null,
          secteur:        source.activitePrincipale || null,
          taille:         source.tailleEntreprise   || null,
        },
        update: {
          cci_id:         cciId ? Number(cciId) : undefined,
          raison_sociale: source.raisonSociale   || null,
          code_postal:    source.codePostal       || null,
          secteur:        source.activitePrincipale || null,
          taille:         source.tailleEntreprise   || null,
          mis_a_jour_le:  new Date(),
        },
      })

      res.status(201).json({ source: 'sirene', entreprise, sirene: source })
    } catch (error) { next(error) }
  })

  return router
}
