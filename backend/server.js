require('dotenv').config()

const express = require('express')
const cors = require('cors')
const { randomUUID, randomBytes, scryptSync, timingSafeEqual } = require('crypto')
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

function normalizeRequiredString(value) {
  const normalized = String(value || '').trim()
  return normalized.length > 0 ? normalized : null
}

function normalizeBoolean(value) {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'on'].includes(value.trim().toLowerCase())
  }

  return Boolean(value)
}

function splitFullName(fullName) {
  const parts = String(fullName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!parts.length) {
    return { firstName: null, lastName: null }
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: null }
  }

  return {
    firstName: parts.shift(),
    lastName: parts.join(' '),
  }
}

function workforceToEffectif(workforce) {
  const normalized = normalizeRequiredString(workforce)

  switch (normalized) {
    case '1 à 9 salariés':
      return 9
    case '10 à 19 salariés':
      return 19
    case '20 à 49 salariés':
      return 49
    case '50 salariés et plus':
      return 50
    default:
      return null
  }
}

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${derivedKey}`
}

function verifyPassword(password, storedPassword) {
  const [salt, storedKey] = String(storedPassword || '').split(':')

  if (!salt || !storedKey) {
    return false
  }

  const derivedKey = scryptSync(password, salt, 64)
  const expectedKey = Buffer.from(storedKey, 'hex')

  if (derivedKey.length !== expectedKey.length) {
    return false
  }

  return timingSafeEqual(derivedKey, expectedKey)
}

function generateTemporaryPassword() {
  return randomBytes(6).toString('base64url')
}

async function ensureNationalCci() {
  const existingCci = await prisma.cci.findFirst({
    where: { est_national: true },
    orderBy: { id: 'asc' },
  })

  if (existingCci) {
    return existingCci
  }

  return prisma.cci.create({
    data: {
      nom: 'CCI nationale',
      code: 'NAT',
      region: 'National',
      est_national: true,
    },
  })
}

async function persistDiagnosticSnapshot(entrepriseId, diagnostic) {
  const answers = Array.isArray(diagnostic?.answers) ? diagnostic.answers : []
  const categories = Array.isArray(diagnostic?.categories) ? diagnostic.categories : []
  const global = diagnostic?.global || {}

  if (!answers.length || !categories.length) {
    throw new Error('diagnostic snapshot is incomplete')
  }

  const created = await prisma.diagnostic.create({
    data: {
      entreprise_id: Number(entrepriseId),
      statut: 'termine',
      score_global: Math.round(Number(global.score) || 0),
      niveau_difficulte: normalizeRequiredString(global.title),
      termine_le: diagnostic?.createdAt ? new Date(diagnostic.createdAt) : new Date(),
      reponses: {
        create: answers.map((answer) => ({
          question: { connect: { id: Number(answer.questionId) } },
          reponse_possible: { connect: { id: Number(answer.responseId) } },
          points_obtenus: Number(answer.points) || 0,
        })),
      },
      scores_categories: {
        create: categories.map((category) => ({
          categorie: { connect: { id: Number(category.id) } },
          score: Number(category.score) || 0,
          score_max: Number(category.scoreMax) || 0,
        })),
      },
    },
    include: { reponses: true, scores_categories: true },
  })

  const persistedDiagnostic = {
    id: created.id,
    filters: diagnostic.filters || null,
    questionCount: diagnostic.questionCount || answers.length,
    global: {
      score: created.score_global || Number(global.score) || 0,
      scoreMax: Number(global.scoreMax) || 0,
      percentage: Number(global.percentage) || 0,
      difficultyPercentage: Number(global.difficultyPercentage) || 0,
      title: global.title || null,
      description: global.description || null,
      tone: global.tone || null,
    },
    categories: categories.map((category) => ({
      id: Number(category.id),
      nom: category.nom,
      ordre: category.ordre,
      score: Number(category.score) || 0,
      scoreMax: Number(category.scoreMax) || 0,
      percentage: Number(category.percentage) || 0,
      difficultyPercentage: Number(category.difficultyPercentage) || 0,
      title: category.title || null,
      description: category.description || null,
      tone: category.tone || null,
    })),
    answers: answers.map((answer) => ({
      questionId: Number(answer.questionId),
      questionText: answer.questionText,
      categoryId: Number(answer.categoryId),
      categoryName: answer.categoryName,
      responseId: Number(answer.responseId),
      responseText: answer.responseText,
      points: Number(answer.points) || 0,
    })),
    createdAt: created.cree_le ? created.cree_le.toISOString() : diagnostic.createdAt,
  }

  storeDiagnosticResult(persistedDiagnostic)

  if (diagnostic.id) {
    storeDiagnosticResult({ ...persistedDiagnostic, uuid: diagnostic.id })
  }

  return persistedDiagnostic
}

function normalizeCompanySize(value) {
  const normalized = String(value || '').trim().toUpperCase()
  return allowedCompanySizes.has(normalized) ? normalized : null
}

function normalizeWorkforceLabel(value) {
  const normalized = String(value || '').trim()

  switch (normalized) {
    case '1 à 9 salariés':
    case '1-2':
      return '1 à 9 salariés'
    case '10 à 19 salariés':
    case '3-10':
      return '10 à 19 salariés'
    case '20 à 49 salariés':
    case '11-50':
      return '20 à 49 salariés'
    case '50 salariés et plus':
    case '50+':
      return '50 salariés et plus'
    default:
      return normalized || null
  }
}

function normalizeSector(value) {
  const normalized = String(value || '').trim().toLowerCase()
  return sectorAliases[normalized] || null
}

function normalizeNumericId(value) {
  const numberValue = Number(value)
  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : null
}

function formatAccountPayload(utilisateur, entreprise) {
  const primaryEntreprise = entreprise || null

  return {
    user: {
      id: utilisateur.id,
      email: utilisateur.email,
      prenom: utilisateur.prenom,
      nom: utilisateur.nom,
      telephone: utilisateur.telephone,
      role: utilisateur.role,
      mustChangePassword: utilisateur.doit_modifier_mot_de_passe,
    },
    entreprise: primaryEntreprise
      ? {
          id: primaryEntreprise.id,
          raisonSociale: primaryEntreprise.raison_sociale,
          siret: primaryEntreprise.siret,
          ville: primaryEntreprise.ville,
          taille: primaryEntreprise.taille,
          effectif: primaryEntreprise.effectif,
          effectifTexte: primaryEntreprise.effectif_texte,
          anneeCreation: primaryEntreprise.annee_creation,
          demandeContact: primaryEntreprise.demande_contact,
        }
      : null,
  }
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

async function resolveEntrepriseForDiagnostic({ entrepriseId, userId, siret, size, sector }) {
  let resolvedEntrepriseId = entrepriseId

  if (resolvedEntrepriseId) {
    return resolvedEntrepriseId
  }

  if (!userId) {
    return null
  }

  if (siret) {
    const cci = await ensureNationalCci()
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: userId },
    })

    if (utilisateur) {
      const sireneCompany = await getEntrepriseBySiret(siret).catch(() => null)
      const splitName = splitFullName([utilisateur.prenom, utilisateur.nom].filter(Boolean).join(' '))
      const entreprise = await prisma.entreprise.upsert({
        where: { siret },
        create: {
          dirigeant_id: utilisateur.id,
          cci_id: cci.id,
          siret,
          raison_sociale: sireneCompany?.raisonSociale || `${utilisateur.prenom || 'Entreprise'} ${utilisateur.nom || ''}`.trim(),
          code_postal: sireneCompany?.codePostal || null,
          ville: sireneCompany?.ville || null,
          secteur,
          taille: size,
          effectif: null,
          effectif_texte: null,
          annee_creation: null,
          demande_contact: true,
        },
        update: {
          dirigeant_id: utilisateur.id,
          cci_id: cci.id,
          raison_sociale: sireneCompany?.raisonSociale || `${splitName.firstName || 'Entreprise'} ${splitName.lastName || ''}`.trim(),
          code_postal: sireneCompany?.codePostal || null,
          ville: sireneCompany?.ville || null,
          secteur,
          taille: size,
          mis_a_jour_le: new Date(),
        },
      })

      resolvedEntrepriseId = entreprise.id
    }
  }

  if (!resolvedEntrepriseId) {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: userId },
      include: {
        entreprises: {
          orderBy: { cree_le: 'desc' },
          take: 1,
        },
      },
    })

    resolvedEntrepriseId = utilisateur?.entreprises?.[0]?.id || null
  }

  return resolvedEntrepriseId
}

function storeDiagnosticResult(result) {
  diagnosticCache.set(result.id, result)
  if (result?.uuid) {
    diagnosticCache.set(result.uuid, result)
  }

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
    const userId = normalizeNumericId(req.body?.userId ?? req.body?.user_id)
    const siret = normalizeRequiredString(req.body?.siret)?.replace(/\D/g, '')
    const normalizedAnswers = normalizeAnswers(req.body?.answers)
    const resolvedEntrepriseId = await resolveEntrepriseForDiagnostic({
      entrepriseId,
      userId,
      siret,
      size,
      sector,
    })

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

    // Persist to DB if an enterprise can be resolved. Otherwise keep in-memory cache only.
    if (resolvedEntrepriseId) {
      try {
        const persistedDiagnostic = await persistDiagnosticSnapshot(resolvedEntrepriseId, diagnostic)
        return res.status(201).json(persistedDiagnostic)
      } catch (dbError) {
        // If DB persist fails, still return in-memory result but include warning
        console.error('DB persist error:', dbError)
        storeDiagnosticResult(diagnostic)
        return res.status(201).json({ ...diagnostic, warning: 'failed_to_persist' })
      }
    }

    // No enterprise resolved: keep in-memory only
    storeDiagnosticResult(diagnostic)

    res.status(201).json(diagnostic)
  } catch (error) {
    next(error)
  }
})

app.post('/api/diagnostics/:diagnosticId/save', async (req, res, next) => {
  try {
    const requestedDiagnosticId = String(req.params.diagnosticId || '').trim()
    const entrepriseId = normalizeNumericId(req.body?.entrepriseId ?? req.body?.entreprise_id)
    const userId = normalizeNumericId(req.body?.userId ?? req.body?.user_id)
    const siret = normalizeRequiredString(req.body?.siret)?.replace(/\D/g, '')

    if (!userId) {
      return res.status(400).json({ error: 'userId is required to save a diagnostic to an account' })
    }

    const payloadDiagnostic = req.body?.diagnostic
    const cachedDiagnostic = diagnosticCache.get(requestedDiagnosticId)
    const diagnostic = payloadDiagnostic || cachedDiagnostic

    if (!diagnostic) {
      const numericId = normalizeNumericId(requestedDiagnosticId)

      if (numericId) {
        return res.json({ saved: true, alreadyPersisted: true, diagnostic: { id: numericId } })
      }

      return res.status(404).json({ error: 'Diagnostic not found in cache. Reload and try again.' })
    }

    const existingId = normalizeNumericId(diagnostic.id)
    if (existingId) {
      return res.json({ saved: true, alreadyPersisted: true, diagnostic })
    }

    const size = normalizeCompanySize(diagnostic?.filters?.size)
    const sector = normalizeSector(diagnostic?.filters?.sector)

    const resolvedEntrepriseId = await resolveEntrepriseForDiagnostic({
      entrepriseId,
      userId,
      siret,
      size,
      sector,
    })

    if (!resolvedEntrepriseId) {
      return res.status(400).json({ error: 'Unable to resolve a company for this account' })
    }

    const persistedDiagnostic = await persistDiagnosticSnapshot(resolvedEntrepriseId, {
      ...diagnostic,
      id: requestedDiagnosticId || diagnostic.id,
    })

    return res.status(201).json({ saved: true, diagnostic: persistedDiagnostic })
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

app.get('/api/users/:userId/questionnaires', async (req, res, next) => {
  try {
    const userId = normalizeNumericId(req.params.userId)

    if (!userId) {
      return res.status(400).json({ error: 'userId must be a positive integer' })
    }

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: userId },
      include: {
        entreprises: {
          orderBy: { cree_le: 'desc' },
          include: {
            diagnostics: {
              orderBy: { cree_le: 'desc' },
              include: {
                reponses: true,
                scores_categories: true,
              },
            },
          },
        },
      },
    })

    if (!utilisateur) {
      return res.status(404).json({ error: 'User not found' })
    }

    const questionnaires = utilisateur.entreprises.flatMap((entreprise) =>
      entreprise.diagnostics.map((diagnostic) => {
        const categoryScores = diagnostic.scores_categories || []
        const totalScoreMax = categoryScores.reduce((total, item) => total + (item.score_max || 0), 0)
        const totalScore = diagnostic.score_global || 0
        const percentage = totalScoreMax > 0 ? clampPercentage((totalScore / totalScoreMax) * 100) : 0

        return {
          id: diagnostic.id,
          createdAt: diagnostic.cree_le ? diagnostic.cree_le.toISOString() : null,
          status: diagnostic.statut,
          score: totalScore,
          scoreMax: totalScoreMax,
          percentage,
          company: {
            id: entreprise.id,
            name: entreprise.raison_sociale,
            siret: entreprise.siret,
            size: entreprise.taille,
            sector: entreprise.secteur,
          },
          questionCount: diagnostic.reponses.length,
          diagnostics: diagnostic.niveau_difficulte,
        }
      }),
    )
      .sort((left, right) => {
        const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0
        const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0
        return rightTime - leftTime
      })

    return res.json({
      user: {
        id: utilisateur.id,
        email: utilisateur.email,
        prenom: utilisateur.prenom,
        nom: utilisateur.nom,
      },
      questionnaires,
    })
  } catch (error) {
    next(error)
  }
})

app.get('/api/account/:userId', async (req, res, next) => {
  try {
    const userId = normalizeNumericId(req.params.userId)

    if (!userId) {
      return res.status(400).json({ error: 'userId must be a positive integer' })
    }

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: userId },
      include: {
        entreprises: {
          orderBy: { cree_le: 'desc' },
          take: 1,
        },
      },
    })

    if (!utilisateur) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.json(formatAccountPayload(utilisateur, utilisateur.entreprises[0] || null))
  } catch (error) {
    next(error)
  }
})

app.patch('/api/account/:userId', async (req, res, next) => {
  try {
    const userId = normalizeNumericId(req.params.userId)
    const email = normalizeRequiredString(req.body?.email)
    const companyName = normalizeRequiredString(req.body?.companyName)
    const directorName = normalizeRequiredString(req.body?.directorName)
    const phone = normalizeRequiredString(req.body?.phone)
    const workforce = normalizeWorkforceLabel(req.body?.workforce)
    const creationYear = normalizeNumericId(req.body?.creationYear)
    const commune = normalizeRequiredString(req.body?.commune)
    const siret = normalizeRequiredString(req.body?.siret)?.replace(/\D/g, '')

    if (!userId || !email || !companyName || !directorName || !phone || !workforce || !creationYear || !siret) {
      return res.status(400).json({ error: 'All account fields are required' })
    }

    if (siret.length !== 14) {
      return res.status(400).json({ error: 'siret must contain 14 digits' })
    }

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: userId },
      include: {
        entreprises: {
          orderBy: { cree_le: 'desc' },
          take: 1,
        },
      },
    })

    if (!utilisateur) {
      return res.status(404).json({ error: 'User not found' })
    }

    const currentEntreprise = utilisateur.entreprises[0] || null
    const { firstName, lastName } = splitFullName(directorName)
    const duplicateUser = await prisma.utilisateur.findUnique({ where: { email } })

    if (duplicateUser && duplicateUser.id !== utilisateur.id) {
      return res.status(409).json({ error: 'This email is already used by another account' })
    }

    const duplicateEntreprise = await prisma.entreprise.findUnique({ where: { siret } })

    if (duplicateEntreprise && duplicateEntreprise.id !== currentEntreprise?.id && duplicateEntreprise.dirigeant_id !== utilisateur.id) {
      return res.status(409).json({ error: 'This SIRET is already used by another company' })
    }

    const cci = utilisateur.cci_id
      ? await prisma.cci.findUnique({ where: { id: utilisateur.cci_id } })
      : await ensureNationalCci()

    const updatedUser = await prisma.utilisateur.update({
      where: { id: utilisateur.id },
      data: {
        email,
        prenom: firstName,
        nom: lastName,
        telephone: phone,
      },
    })

    const updatedEntreprise = currentEntreprise
      ? await prisma.entreprise.update({
          where: { id: currentEntreprise.id },
          data: {
            siret,
            raison_sociale: companyName,
            ville: commune,
            effectif: workforceToEffectif(workforce),
            effectif_texte: workforce,
            annee_creation: creationYear,
            mis_a_jour_le: new Date(),
          },
        })
      : await prisma.entreprise.create({
          data: {
            dirigeant_id: updatedUser.id,
            cci_id: cci?.id || (await ensureNationalCci()).id,
            siret,
            raison_sociale: companyName,
            ville: commune,
            taille: null,
            effectif: workforceToEffectif(workforce),
            effectif_texte: workforce,
            annee_creation: creationYear,
            demande_contact: true,
          },
        })

    return res.json(formatAccountPayload(updatedUser, updatedEntreprise))
  } catch (error) {
    next(error)
  }
})

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const email = normalizeRequiredString(req.body?.identifier)
    const password = normalizeRequiredString(req.body?.password)

    if (!email || !password) {
      return res.status(400).json({ error: 'identifier and password are required' })
    }

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { email },
      include: {
        cci: true,
        entreprises: {
          orderBy: { cree_le: 'desc' },
          take: 1,
        },
      },
    })

    if (!utilisateur || !utilisateur.actif || !verifyPassword(password, utilisateur.mot_de_passe)) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    await prisma.utilisateur.update({
      where: { id: utilisateur.id },
      data: { derniere_connexion: new Date() },
    })

    return res.json({
      user: {
        id: utilisateur.id,
        email: utilisateur.email,
        prenom: utilisateur.prenom,
        nom: utilisateur.nom,
        role: utilisateur.role,
      },
      entreprise: utilisateur.entreprises[0]
        ? {
            id: utilisateur.entreprises[0].id,
            raisonSociale: utilisateur.entreprises[0].raison_sociale,
            siret: utilisateur.entreprises[0].siret,
            taille: utilisateur.entreprises[0].taille,
            secteur: utilisateur.entreprises[0].secteur,
          }
        : null,
      mustChangePassword: utilisateur.doit_modifier_mot_de_passe,
    })
  } catch (error) {
    next(error)
  }
})

app.post('/api/auth/password', async (req, res, next) => {
  try {
    const userId = normalizeNumericId(req.body?.userId)
    const currentPassword = normalizeRequiredString(req.body?.currentPassword)
    const newPassword = normalizeRequiredString(req.body?.newPassword)

    if (!userId || !newPassword) {
      return res.status(400).json({ error: 'userId and newPassword are required' })
    }

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: userId },
    })

    if (!utilisateur) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isFirstPasswordSetup = Boolean(utilisateur.doit_modifier_mot_de_passe)

    if (!isFirstPasswordSetup) {
      if (!currentPassword || !verifyPassword(currentPassword, utilisateur.mot_de_passe)) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }
    }

    await prisma.utilisateur.update({
      where: { id: utilisateur.id },
      data: {
        mot_de_passe: hashPassword(newPassword),
        doit_modifier_mot_de_passe: false,
      },
    })

    return res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

app.post('/api/accompagnement/submit', async (req, res, next) => {
  try {
    const companyName = normalizeRequiredString(req.body?.companyName)
    const managerName = normalizeRequiredString(req.body?.managerName)
    const phone = normalizeRequiredString(req.body?.phone)
    const workforce = normalizeRequiredString(req.body?.workforce)
    const creationYear = normalizeNumericId(req.body?.creationYear)
    const email = normalizeRequiredString(req.body?.email)
    const city = normalizeRequiredString(req.body?.city)
    const siret = normalizeRequiredString(req.body?.siret)?.replace(/\D/g, '')
    const contactRequested = normalizeBoolean(req.body?.contactRequested)
    const diagnostic = req.body?.diagnostic || null

    if (!companyName || !managerName || !phone || !workforce || !creationYear || !email || !siret) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (siret.length !== 14) {
      return res.status(400).json({ error: 'siret must contain 14 digits' })
    }

    if (!diagnostic || !Array.isArray(diagnostic.answers) || !diagnostic.answers.length) {
      return res.status(400).json({ error: 'diagnostic snapshot is required to create the account' })
    }

    const cci = await ensureNationalCci()
    const tempPassword = generateTemporaryPassword()
    const hashedPassword = hashPassword(tempPassword)
    const { firstName, lastName } = splitFullName(managerName)
    const filters = diagnostic.filters || {}
    const size = normalizeCompanySize(filters.size)
    const sector = normalizeSector(filters.sector)
    const sireneCompany = await getEntrepriseBySiret(siret).catch(() => null)

    const utilisateur = await prisma.utilisateur.upsert({
      where: { email },
      create: {
        email,
        mot_de_passe: hashedPassword,
        prenom: firstName,
        nom: lastName,
        telephone: phone,
        role: 'dirigeant',
        cci_id: cci.id,
        actif: true,
        doit_modifier_mot_de_passe: true,
      },
      update: {
        mot_de_passe: hashedPassword,
        prenom: firstName,
        nom: lastName,
        telephone: phone,
        role: 'dirigeant',
        cci_id: cci.id,
        actif: true,
        doit_modifier_mot_de_passe: true,
      },
    })

    const entreprise = await prisma.entreprise.upsert({
      where: { siret },
      create: {
        dirigeant_id: utilisateur.id,
        cci_id: cci.id,
        siret,
        raison_sociale: companyName,
        code_postal: sireneCompany?.codePostal || null,
        ville: city,
        secteur: sector,
        taille: size,
        effectif: workforceToEffectif(workforce),
        effectif_texte: workforce,
        annee_creation: creationYear,
        demande_contact: contactRequested,
      },
      update: {
        dirigeant_id: utilisateur.id,
        cci_id: cci.id,
        raison_sociale: companyName,
        code_postal: sireneCompany?.codePostal || null,
        ville: city,
        secteur: sector,
        taille: size,
        effectif: workforceToEffectif(workforce),
        effectif_texte: workforce,
        annee_creation: creationYear,
        demande_contact: contactRequested,
        mis_a_jour_le: new Date(),
      },
    })

    const persistedDiagnostic = await persistDiagnosticSnapshot(entreprise.id, diagnostic)

    return res.status(201).json({
      credentials: {
        identifier: utilisateur.email,
        password: tempPassword,
      },
      user: {
        id: utilisateur.id,
        email: utilisateur.email,
        prenom: utilisateur.prenom,
        nom: utilisateur.nom,
        mustChangePassword: utilisateur.doit_modifier_mot_de_passe,
      },
      entreprise: {
        id: entreprise.id,
        siret: entreprise.siret,
        raisonSociale: entreprise.raison_sociale,
        ville: entreprise.ville,
        effectif: entreprise.effectif,
        effectifTexte: entreprise.effectif_texte,
        anneeCreation: entreprise.annee_creation,
        demandeContact: entreprise.demande_contact,
      },
      diagnostic: persistedDiagnostic,
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
