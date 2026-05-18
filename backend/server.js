require('dotenv').config()

const express = require('express')
const cors = require('cors')
const { PrismaClient } = require('@prisma/client')
const { getEntrepriseBySiret, getEntrepriseBySiren } = require('./sirene')

const app = express()
const port = process.env.PORT || 4000
const prisma = new PrismaClient()

const allowedCompanySizes = new Set(['TPE', 'PME'])
const sectorAliases = {
  merchant: 'commerce',
  commerce: 'commerce',
  artisan: 'artisan',
  liberal: 'liberal',
  industrial: 'industrial',
  services: 'services',
}

function normalizeCompanySize(value) {
  const normalized = String(value || '').trim().toUpperCase()
  return allowedCompanySizes.has(normalized) ? normalized : null
}

function normalizeSector(value) {
  const normalized = String(value || '').trim().toLowerCase()
  return sectorAliases[normalized] || null
}

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/questionnaire', async (req, res, next) => {
  try {
    const size = normalizeCompanySize(req.query.size)
    const sector = normalizeSector(req.query.sector)

    if (!size) {
      return res.status(400).json({ error: 'size must be one of TPE or PME' })
    }

    if (!sector) {
      return res.status(400).json({ error: 'sector must be one of commerce, artisan, liberal, industrial or services' })
    }

    const categories = await prisma.categorie.findMany({
      orderBy: { ordre: 'asc' },
      include: {
        questions: {
          where: {
            active: true,
            AND: [
              { OR: [{ secteur: null }, { secteur }] },
              { OR: [{ taille: null }, { taille: size }] },
            ],
          },
          orderBy: { ordre: 'asc' },
          include: {
            reponses_possibles: {
              orderBy: { ordre: 'asc' },
            },
          },
        },
      },
    })

    const filteredCategories = categories
      .map((category) => ({
        id: category.id,
        nom: category.nom,
        ordre: category.ordre,
        questions: category.questions.map((question) => ({
          id: question.id,
          categorieId: question.categorie_id,
          texte: question.texte,
          secteur: question.secteur,
          taille: question.taille,
          pointsMax: question.points_max,
          ordre: question.ordre,
          active: question.active,
          responses: question.reponses_possibles.map((response) => ({
            id: response.id,
            questionId: response.question_id,
            texte: response.texte,
            points: response.points,
            ordre: response.ordre,
          })),
        })),
      }))
      .filter((category) => category.questions.length > 0)

    const questionCount = filteredCategories.reduce((total, category) => total + category.questions.length, 0)

    res.json({
      filters: { size, sector },
      questionCount,
      categories: filteredCategories,
    })
  } catch (error) {
    next(error)
  }
})

app.get('/api/users', (req, res) => {
  // Example endpoint; replace with Prisma DB calls
  res.json([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }])
})

app.get('/api/sirene/siret/:siret', async (req, res, next) => {
  try {
    const entreprise = await getEntrepriseBySiret(req.params.siret)
    res.json({ source: 'sirene', entreprise })
  } catch (error) {
    next(error)
  }
})

app.get('/api/sirene/siren/:siren', async (req, res, next) => {
  try {
    const entreprise = await getEntrepriseBySiren(req.params.siren)
    res.json({ source: 'sirene', entreprise })
  } catch (error) {
    next(error)
  }
})

app.post('/api/entreprises/sirene/import', async (req, res, next) => {
  try {
    const { siret, siren, dirigeantId, cciId } = req.body || {}

    if (!siret) {
      return res.status(400).json({ error: 'siret is required to import an entreprise' })
    }

    if (siren) {
      return res.status(400).json({ error: 'use the lookup endpoint for SIREN; import requires a SIRET' })
    }

    const source = await getEntrepriseBySiret(siret)

    if (!dirigeantId) {
      return res.status(400).json({ error: 'dirigeantId is required to create or update an entreprise' })
    }

    const normalizedSiret = source.siret || String(siret || '').replace(/\D/g, '')

    const entreprise = await prisma.entreprise.upsert({
      where: {
        siret: normalizedSiret
      },
      create: {
        dirigeantId: Number(dirigeantId),
        cciId: cciId ? Number(cciId) : null,
        siret: normalizedSiret,
        raisonSociale: source.raisonSociale || null,
        codePostal: source.codePostal || null,
        secteur: source.activitePrincipale || null,
        taille: source.trancheEffectif || null
      },
      update: {
        cciId: cciId ? Number(cciId) : undefined,
        raisonSociale: source.raisonSociale || null,
        codePostal: source.codePostal || null,
        secteur: source.activitePrincipale || null,
        taille: source.trancheEffectif || null,
        misAJourLe: new Date()
      }
    })

    res.status(201).json({ source: 'sirene', entreprise, sirene: source })
  } catch (error) {
    next(error)
  }
})

app.use((error, req, res, next) => {
  console.error(error)

  const status = error.statusCode || 500
  res.status(status).json({
    error: error.message || 'Internal Server Error',
    details: error.details || undefined
  })
})

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`)
})
