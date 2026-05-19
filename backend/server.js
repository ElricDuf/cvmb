require('dotenv').config()

const express = require('express')
const cors = require('cors')
const { randomUUID } = require('crypto')
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

const diagnosticCache = new Map()

function normalizeCompanySize(value) {
  const normalized = String(value || '').trim().toUpperCase()
  return allowedCompanySizes.has(normalized) ? normalized : null
}

function normalizeSector(value) {
  const normalized = String(value || '').trim().toLowerCase()
  return sectorAliases[normalized] || null
}

function normalizeNumericId(value) {
  const numberValue = Number(value)
  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : null
}

function normalizeAnswers(rawAnswers) {
  if (Array.isArray(rawAnswers)) {
    return rawAnswers
      .map((answer) => ({
        questionId: normalizeNumericId(answer.questionId ?? answer.question_id),
        responseId: normalizeNumericId(answer.responseId ?? answer.response_id),
      }))
      .filter((answer) => answer.questionId && answer.responseId)
  }

  if (rawAnswers && typeof rawAnswers === 'object') {
    return Object.entries(rawAnswers)
      .map(([questionId, responseId]) => ({
        questionId: normalizeNumericId(questionId),
        responseId: normalizeNumericId(responseId),
      }))
      .filter((answer) => answer.questionId && answer.responseId)
  }

  return []
}

function clampPercentage(value) {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.min(100, Math.max(0, Math.round(value)))
}

function getDiagnosticNarrative(difficultyPercentage) {
  if (difficultyPercentage >= 75) {
    return {
      title: 'Signes de fragilité critique',
      description: 'Les réponses indiquent plusieurs fragilités importantes sur ce périmètre.',
      tone: 'red',
    }
  }

  if (difficultyPercentage >= 50) {
    return {
      title: 'Vigilance renforcée',
      description: 'Des points de vigilance apparaissent et méritent d’être traités rapidement.',
      tone: 'orange',
    }
  }

  if (difficultyPercentage >= 25) {
    return {
      title: 'Situation intermédiaire',
      description: 'La situation est contrastée, avec des marges de progression nettes.',
      tone: 'green',
    }
  }

  return {
    title: 'Situation stable',
    description: 'Les réponses saisies montrent un niveau de maîtrise satisfaisant.',
    tone: 'blue',
  }
}

function buildQuestionnaireQuery(size, sector) {
  return {
    orderBy: { ordre: 'asc' },
    include: {
      questions: {
        where: {
          active: true,
          AND: [
            { OR: [{ secteur: null }, { secteur: sector }] },
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
  }
}

async function loadQuestionnaireData(size, sector) {
  const categories = await prisma.categorie.findMany(buildQuestionnaireQuery(size, sector))

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

  return { filteredCategories, questionCount }
}

function storeDiagnosticResult(result) {
  diagnosticCache.set(result.id, result)

  if (diagnosticCache.size > 50) {
    const firstKey = diagnosticCache.keys().next().value
    if (firstKey) {
      diagnosticCache.delete(firstKey)
    }
  }
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

    const { filteredCategories, questionCount } = await loadQuestionnaireData(size, sector)

    res.json({
      filters: { size, sector },
      questionCount,
      categories: filteredCategories,
    })
  } catch (error) {
    next(error)
  }
})

app.post('/api/diagnostics', async (req, res, next) => {
  try {
    const size = normalizeCompanySize(req.body?.size)
    const sector = normalizeSector(req.body?.sector)
    const entrepriseId = normalizeNumericId(req.body?.entrepriseId ?? req.body?.entreprise_id)
    const normalizedAnswers = normalizeAnswers(req.body?.answers)

    if (!size) {
      return res.status(400).json({ error: 'size must be one of TPE or PME' })
    }

    if (!sector) {
      return res.status(400).json({ error: 'sector must be one of commerce, artisan, liberal, industrial or services' })
    }

    if (!normalizedAnswers.length) {
      return res.status(400).json({ error: 'answers are required to calculate a diagnostic' })
    }

    const { filteredCategories, questionCount } = await loadQuestionnaireData(size, sector)
    const questions = filteredCategories.flatMap((category) =>
      category.questions.map((question) => ({
        ...question,
        categoryId: category.id,
        categoryName: category.nom,
        categoryOrder: category.ordre,
      })),
    )

    const answerByQuestionId = new Map(normalizedAnswers.map((answer) => [answer.questionId, answer.responseId]))
    const categoryResults = new Map()
    const detailedAnswers = []

    let globalScore = 0
    let globalMaxScore = 0

    for (const question of questions) {
      const responseId = answerByQuestionId.get(question.id)

      if (!responseId) {
        return res.status(400).json({ error: `missing answer for question ${question.id}` })
      }

      const response = question.responses.find((item) => item.id === responseId)

      if (!response) {
        return res.status(400).json({ error: `response ${responseId} does not belong to question ${question.id}` })
      }

      const questionScore = Number(response.points) || 0
      const questionMax = Number(question.pointsMax) || 0

      globalScore += questionScore
      globalMaxScore += questionMax

      const categoryAccumulator = categoryResults.get(question.categoryId) || {
        id: question.categoryId,
        nom: question.categoryName,
        ordre: question.categoryOrder,
        score: 0,
        scoreMax: 0,
      }

      categoryAccumulator.score += questionScore
      categoryAccumulator.scoreMax += questionMax
      categoryResults.set(question.categoryId, categoryAccumulator)

      detailedAnswers.push({
        questionId: question.id,
        questionText: question.texte,
        categoryId: question.categoryId,
        categoryName: question.categoryName,
        responseId: response.id,
        responseText: response.texte,
        points: questionScore,
      })
    }

    const globalPercentage = globalMaxScore > 0 ? clampPercentage((globalScore / globalMaxScore) * 100) : 0
    const globalDifficulty = 100 - globalPercentage
    const globalNarrative = getDiagnosticNarrative(globalDifficulty)

    const categories = Array.from(categoryResults.values())
      .sort((left, right) => left.ordre - right.ordre)
      .map((category) => {
        const percentage = category.scoreMax > 0 ? clampPercentage((category.score / category.scoreMax) * 100) : 0
        const difficultyPercentage = 100 - percentage
        const narrative = getDiagnosticNarrative(difficultyPercentage)

        return {
          id: category.id,
          nom: category.nom,
          ordre: category.ordre,
          score: category.score,
          scoreMax: category.scoreMax,
          percentage,
          difficultyPercentage,
          title: narrative.title,
          description: narrative.description,
          tone: narrative.tone,
        }
      })

    const diagnostic = {
      id: randomUUID(),
      filters: { size, sector },
      questionCount,
      global: {
        score: globalScore,
        scoreMax: globalMaxScore,
        percentage: globalPercentage,
        difficultyPercentage: globalDifficulty,
        title: globalNarrative.title,
        description: globalNarrative.description,
        tone: globalNarrative.tone,
      },
      categories,
      answers: detailedAnswers,
      createdAt: new Date().toISOString(),
    }

    // Persist to DB if an entrepriseId was provided. Otherwise keep in-memory cache only.
    if (entrepriseId) {
      try {
        // Create diagnostic with nested responses and category scores
        const created = await prisma.diagnostic.create({
          data: {
            entreprise_id: Number(entrepriseId),
            statut: 'termine',
            score_global: Math.round(globalScore),
            niveau_difficulte: globalNarrative.title,
            termine_le: new Date(),
            reponses: {
              create: detailedAnswers.map((a) => ({
                question: { connect: { id: a.questionId } },
                reponse_possible: { connect: { id: a.responseId } },
                points_obtenus: a.points,
              })),
            },
            scores_categories: {
              create: categories.map((c) => ({
                categorie: { connect: { id: c.id } },
                score: c.score,
                score_max: c.scoreMax,
              })),
            },
          },
          include: { reponses: true, scores_categories: true },
        })

        // Build a stable API payload based on persisted record
        const persistedDiagnostic = {
          id: created.id,
          filters: diagnostic.filters,
          questionCount: diagnostic.questionCount,
          global: {
            score: created.score_global || diagnostic.global.score,
            scoreMax: diagnostic.global.scoreMax,
            percentage: diagnostic.global.percentage,
            difficultyPercentage: diagnostic.global.difficultyPercentage,
            title: diagnostic.global.title,
            description: diagnostic.global.description,
            tone: diagnostic.global.tone,
          },
          categories: categories.map((c) => ({
            id: c.id,
            nom: c.nom,
            ordre: c.ordre,
            score: c.score,
            scoreMax: c.scoreMax,
            percentage: c.percentage,
            difficultyPercentage: c.difficultyPercentage,
            title: c.title,
            description: c.description,
            tone: c.tone,
          })),
          answers: detailedAnswers,
          createdAt: created.cree_le ? created.cree_le.toISOString() : diagnostic.createdAt,
        }

        // Cache under numeric id (string) and legacy uuid (for a short period)
        storeDiagnosticResult(persistedDiagnostic)
        storeDiagnosticResult({ ...persistedDiagnostic, uuid: diagnostic.id })

        return res.status(201).json(persistedDiagnostic)
      } catch (dbError) {
        // If DB persist fails, still return in-memory result but include warning
        console.error('DB persist error:', dbError)
        storeDiagnosticResult(diagnostic)
        return res.status(201).json({ ...diagnostic, warning: 'failed_to_persist' })
      }
    }

    // No entrepriseId: keep in-memory only
    storeDiagnosticResult(diagnostic)

    res.status(201).json(diagnostic)
  } catch (error) {
    next(error)
  }
})

app.get('/api/diagnostics/:diagnosticId', async (req, res, next) => {
  try {
    const param = req.params.diagnosticId
    const cached = diagnosticCache.get(param)

    if (cached) {
      return res.json(cached)
    }

    // Try numeric id to load from DB
    const numericId = Number(param)
    if (Number.isInteger(numericId) && numericId > 0) {
      const record = await prisma.diagnostic.findUnique({
        where: { id: numericId },
        include: { reponses: true, scores_categories: true },
      })

      if (!record) {
        return res.status(404).json({ error: 'Diagnostic not found' })
      }

      // Reconstruct API payload
      const dbCategories = record.scores_categories.map((sc) => ({
        id: sc.categorie_id,
        nom: undefined,
        ordre: 0,
        score: sc.score,
        scoreMax: sc.score_max,
        percentage: sc.score_max > 0 ? clampPercentage((sc.score / sc.score_max) * 100) : 0,
        difficultyPercentage: sc.score_max > 0 ? 100 - clampPercentage((sc.score / sc.score_max) * 100) : 0,
        title: undefined,
        description: undefined,
        tone: undefined,
      }))

      const dbAnswers = record.reponses.map((r) => ({
        questionId: r.question_id,
        responseId: r.reponse_possible_id,
        points: r.points_obtenus,
      }))

      const payload = {
        id: record.id,
        filters: null,
        questionCount: dbAnswers.length,
        global: {
          score: record.score_global || 0,
          scoreMax: dbCategories.reduce((s, c) => s + (c.scoreMax || 0), 0),
          percentage: record.score_global && dbCategories.length ? clampPercentage((record.score_global / (dbCategories.reduce((s, c) => s + (c.scoreMax || 0), 0))) * 100) : 0,
          difficultyPercentage: record.score_global ? 100 - (record.score_global || 0) : 0,
          title: record.niveau_difficulte || undefined,
          description: undefined,
          tone: undefined,
        },
        categories: dbCategories,
        answers: dbAnswers,
        createdAt: record.cree_le ? record.cree_le.toISOString() : undefined,
      }

      // Cache and return
      storeDiagnosticResult(payload)
      return res.json(payload)
    }

    return res.status(404).json({ error: 'Diagnostic not found' })
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
