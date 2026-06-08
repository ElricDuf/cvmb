const express = require('express')
const { randomUUID } = require('crypto')
const { authenticate } = require('../auth')
const {
  normalizeCompanySize, normalizeSector, normalizeNumericId,
  normalizeRequiredString, normalizeAnswers, clampPercentage,
} = require('../lib/utils')
const {
  getDiagnosticNarrative, loadRecommendationMessages,
  selectBestRecommendation, applyRecommendationToNarrative,
  loadQuestionnaireData,
} = require('../lib/scoring')
const { diagnosticCache, storeDiagnosticResult } = require('../lib/cache')
const { persistDiagnosticSnapshot, resolveEntrepriseForDiagnostic } = require('../lib/entreprise')

module.exports = function createDiagnosticsRouter(prisma) {
  const router = express.Router()

  /* ── GET /questionnaire ── */
  router.get('/questionnaire', async (req, res, next) => {
    try {
      const size   = normalizeCompanySize(req.query.size)
      const sector = normalizeSector(req.query.sector)
      if (!size)   return res.status(400).json({ error: 'size must be one of TPE or PME' })
      if (!sector) return res.status(400).json({ error: 'sector must be one of commerce, artisan, liberal, industrial or services' })

      const { filteredCategories, questionCount } = await loadQuestionnaireData(prisma, size, sector)
      res.json({ filters: { size, sector }, questionCount, categories: filteredCategories })
    } catch (error) { next(error) }
  })

  /* ── POST /diagnostics ── */
  router.post('/diagnostics', async (req, res, next) => {
    try {
      const size              = normalizeCompanySize(req.body?.size)
      const sector            = normalizeSector(req.body?.sector)
      const entrepriseId      = normalizeNumericId(req.body?.entrepriseId ?? req.body?.entreprise_id)
      const userId            = normalizeNumericId(req.body?.userId ?? req.body?.user_id)
      const siret             = normalizeRequiredString(req.body?.siret)?.replace(/\D/g, '')
      const normalizedAnswers = normalizeAnswers(req.body?.answers)

      if (!size)   return res.status(400).json({ error: 'size must be one of TPE or PME' })
      if (!sector) return res.status(400).json({ error: 'sector must be one of commerce, artisan, liberal, industrial or services' })
      if (!normalizedAnswers.length) return res.status(400).json({ error: 'answers are required to calculate a diagnostic' })

      const resolvedEntrepriseId = await resolveEntrepriseForDiagnostic(prisma, { entrepriseId, userId, siret, size, sector })
      const { filteredCategories, questionCount } = await loadQuestionnaireData(prisma, size, sector)
      const questions = filteredCategories.flatMap((cat) =>
        cat.questions.map((q) => ({ ...q, categoryId: cat.id, categoryName: cat.nom, categoryOrder: cat.ordre }))
      )

      const answerMap    = new Map(normalizedAnswers.map((a) => [a.questionId, a.responseId]))
      const categoryResults = new Map()
      const detailedAnswers = []
      let globalScore = 0, globalMaxScore = 0

      for (const question of questions) {
        const responseId = answerMap.get(question.id)
        if (!responseId) return res.status(400).json({ error: `missing answer for question ${question.id}` })

        const response = question.responses.find((r) => r.id === responseId)
        if (!response) return res.status(400).json({ error: `response ${responseId} does not belong to question ${question.id}` })

        const qScore = Number(response.points) || 0
        const qMax   = Number(question.pointsMax) || 0
        globalScore    += qScore
        globalMaxScore += qMax

        const acc = categoryResults.get(question.categoryId) || {
          id: question.categoryId, nom: question.categoryName, ordre: question.categoryOrder, score: 0, scoreMax: 0,
        }
        acc.score    += qScore
        acc.scoreMax += qMax
        categoryResults.set(question.categoryId, acc)

        detailedAnswers.push({
          questionId: question.id, questionText: question.texte,
          categoryId: question.categoryId, categoryName: question.categoryName,
          responseId: response.id, responseText: response.texte, points: qScore,
        })
      }

      const globalPercentage  = globalMaxScore > 0 ? clampPercentage((globalScore / globalMaxScore) * 100) : 0
      const globalDifficulty  = 100 - globalPercentage
      const categoryIds       = Array.from(categoryResults.keys())
      const recommendationMessages = await loadRecommendationMessages(prisma, { size, sector, categoryIds })

      const globalNarrative = applyRecommendationToNarrative(
        getDiagnosticNarrative(globalDifficulty, { size, sector }),
        selectBestRecommendation(recommendationMessages, { score: globalPercentage, size, sector, categoryId: null }),
      )

      const categories = Array.from(categoryResults.values())
        .sort((l, r) => l.ordre - r.ordre)
        .map((cat) => {
          const pct = cat.scoreMax > 0 ? clampPercentage((cat.score / cat.scoreMax) * 100) : 0
          const diff = 100 - pct
          const narrative = applyRecommendationToNarrative(
            getDiagnosticNarrative(diff, { size, sector, categoryId: cat.id, categoryName: cat.nom }),
            selectBestRecommendation(recommendationMessages, { score: pct, size, sector, categoryId: cat.id }),
          )
          return { id: cat.id, nom: cat.nom, ordre: cat.ordre, score: cat.score, scoreMax: cat.scoreMax,
            percentage: pct, difficultyPercentage: diff, ...narrative }
        })

      const diagnostic = {
        id: randomUUID(),
        filters: { size, sector }, questionCount,
        global: { score: globalScore, scoreMax: globalMaxScore, percentage: globalPercentage,
          difficultyPercentage: globalDifficulty, ...globalNarrative },
        categories, answers: detailedAnswers,
        createdAt: new Date().toISOString(),
      }

      if (resolvedEntrepriseId) {
        try {
          const persisted = await persistDiagnosticSnapshot(prisma, resolvedEntrepriseId, diagnostic)
          return res.status(201).json(persisted)
        } catch (dbError) {
          console.error('DB persist error:', dbError)
          storeDiagnosticResult(diagnostic)
          return res.status(201).json({ ...diagnostic, warning: 'failed_to_persist' })
        }
      }

      storeDiagnosticResult(diagnostic)
      res.status(201).json(diagnostic)
    } catch (error) { next(error) }
  })

  /* ── GET /diagnostics/:id ── */
  router.get('/diagnostics/:diagnosticId', async (req, res, next) => {
    try {
      const param  = req.params.diagnosticId
      const cached = diagnosticCache.get(param)
      if (cached) return res.json(cached)

      const numericId = Number(param)
      if (!Number.isInteger(numericId) || numericId <= 0) {
        return res.status(404).json({ error: 'Diagnostic not found' })
      }

      const record = await prisma.diagnostic.findUnique({
        where: { id: numericId },
        include: {
          entreprise: true,
          reponses: true,
          scores_categories: { include: { categorie: true } },
        },
      })

      if (!record) return res.status(404).json({ error: 'Diagnostic not found' })

      const size   = require('../lib/utils').normalizeCompanySize(record.entreprise?.taille)
      const sector = require('../lib/utils').normalizeSector(record.entreprise?.secteur)
      const totalScoreMax   = record.scores_categories.reduce((sum, s) => sum + (s.score_max || 0), 0)
      const globalPercentage = totalScoreMax > 0 ? clampPercentage(((record.score_global || 0) / totalScoreMax) * 100) : 0
      const globalDifficulty = 100 - globalPercentage
      const categoryIds      = record.scores_categories.map((s) => s.categorie_id)
      const recMessages      = await loadRecommendationMessages(prisma, { size, sector, categoryIds })

      const globalNarrative = applyRecommendationToNarrative(
        getDiagnosticNarrative(globalDifficulty, { size, sector }),
        selectBestRecommendation(recMessages, { score: globalPercentage, size, sector, categoryId: null }),
      )

      const dbCategories = record.scores_categories.map((sc) => {
        const pct  = sc.score_max > 0 ? clampPercentage((sc.score / sc.score_max) * 100) : 0
        const diff = 100 - pct
        const narrative = applyRecommendationToNarrative(
          getDiagnosticNarrative(diff, { size, sector, categoryId: sc.categorie_id, categoryName: sc.categorie?.nom }),
          selectBestRecommendation(recMessages, { score: pct, size, sector, categoryId: sc.categorie_id }),
        )
        return { id: sc.categorie_id, nom: sc.categorie?.nom, ordre: sc.categorie?.ordre || 0,
          score: sc.score, scoreMax: sc.score_max, percentage: pct, difficultyPercentage: diff, ...narrative }
      }).sort((l, r) => l.ordre - r.ordre)

      const payload = {
        id: record.id,
        filters: { size, sector },
        questionCount: record.reponses.length,
        global: {
          score: record.score_global || 0, scoreMax: totalScoreMax,
          percentage: globalPercentage, difficultyPercentage: globalDifficulty,
          title: record.niveau_difficulte || globalNarrative.title,
          description: globalNarrative.description,
          advice: globalNarrative.advice,
          tone:   globalNarrative.tone,
        },
        categories: dbCategories,
        answers: record.reponses.map((r) => ({
          questionId: r.question_id, responseId: r.reponse_possible_id, points: r.points_obtenus,
        })),
        createdAt: record.cree_le ? record.cree_le.toISOString() : undefined,
      }

      storeDiagnosticResult(payload)
      res.json(payload)
    } catch (error) { next(error) }
  })

  /* ── POST /diagnostics/:id/save ── */
  router.post('/diagnostics/:diagnosticId/save', async (req, res, next) => {
    try {
      const requestedId  = String(req.params.diagnosticId || '').trim()
      const entrepriseId = normalizeNumericId(req.body?.entrepriseId ?? req.body?.entreprise_id)
      const userId       = normalizeNumericId(req.body?.userId ?? req.body?.user_id)
      const siret        = normalizeRequiredString(req.body?.siret)?.replace(/\D/g, '')

      if (!userId) return res.status(400).json({ error: 'userId is required to save a diagnostic to an account' })

      const payloadDiagnostic = req.body?.diagnostic
      const cachedDiagnostic  = diagnosticCache.get(requestedId)
      const diagnostic        = payloadDiagnostic || cachedDiagnostic

      if (!diagnostic) {
        const numericId = normalizeNumericId(requestedId)
        if (numericId) return res.json({ saved: true, alreadyPersisted: true, diagnostic: { id: numericId } })
        return res.status(404).json({ error: 'Diagnostic not found in cache. Reload and try again.' })
      }

      if (normalizeNumericId(diagnostic.id)) {
        return res.json({ saved: true, alreadyPersisted: true, diagnostic })
      }

      const size   = normalizeCompanySize(diagnostic?.filters?.size)
      const sector = normalizeSector(diagnostic?.filters?.sector)
      const resolvedEntrepriseId = await resolveEntrepriseForDiagnostic(prisma, { entrepriseId, userId, siret, size, sector })

      if (!resolvedEntrepriseId) return res.status(400).json({ error: 'Unable to resolve a company for this account' })

      const persisted = await persistDiagnosticSnapshot(prisma, resolvedEntrepriseId, {
        ...diagnostic, id: requestedId || diagnostic.id,
      })
      res.status(201).json({ saved: true, diagnostic: persisted })
    } catch (error) { next(error) }
  })

  /* ── GET /users/:userId/questionnaires ── (requiert authentification) */
  router.get('/users/:userId/questionnaires', authenticate, async (req, res, next) => {
    try {
      const userId = normalizeNumericId(req.params.userId)
      if (!userId) return res.status(400).json({ error: 'userId must be a positive integer' })

      // Un utilisateur ne peut consulter que son propre historique (sauf admin).
      const isAdmin = req.auth.role === 'admin_local' || req.auth.role === 'admin_national'
      if (!isAdmin && req.auth.id !== userId) {
        return res.status(403).json({ error: 'Accès refusé.' })
      }

      const utilisateur = await prisma.utilisateur.findUnique({
        where: { id: userId },
        include: {
          entreprises: {
            orderBy: { cree_le: 'desc' },
            include: {
              diagnostics: {
                orderBy: { cree_le: 'desc' },
                include: { reponses: true, scores_categories: true },
              },
            },
          },
        },
      })

      if (!utilisateur) return res.status(404).json({ error: 'User not found' })

      const questionnaires = utilisateur.entreprises
        .flatMap((e) =>
          e.diagnostics.map((d) => {
            const totalMax  = (d.scores_categories || []).reduce((t, s) => t + (s.score_max || 0), 0)
            const pct       = totalMax > 0 ? clampPercentage(((d.score_global || 0) / totalMax) * 100) : 0
            return {
              id: d.id,
              createdAt: d.cree_le ? d.cree_le.toISOString() : null,
              status: d.statut,
              score: d.score_global || 0, scoreMax: totalMax, percentage: pct,
              company: { id: e.id, name: e.raison_sociale, siret: e.siret, size: e.taille, sector: e.secteur },
              questionCount: d.reponses.length,
              diagnostics: d.niveau_difficulte,
            }
          })
        )
        .sort((l, r) => {
          const lt = l.createdAt ? new Date(l.createdAt).getTime() : 0
          const rt = r.createdAt ? new Date(r.createdAt).getTime() : 0
          return rt - lt
        })

      res.json({
        user: { id: utilisateur.id, email: utilisateur.email, prenom: utilisateur.prenom, nom: utilisateur.nom },
        questionnaires,
      })
    } catch (error) { next(error) }
  })

  return router
}
