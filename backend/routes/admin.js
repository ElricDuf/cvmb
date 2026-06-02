// ============================================================
//  ROUTES ADMIN — Comment Va Ma Boîte (CVMB)
//  - Espace gestionnaire (admin_local) : diagnostics + statistiques,
//    scopé sur la CCI de l'utilisateur.
//  - Super-admin (admin_national) : gestion globale (CCI, questions,
//    messages de recommandation, comptes admin) + accès toutes CCI.
// ============================================================

const express = require('express')
const { authenticate, requireRole, ROLES, isNationalAdmin } = require('../auth')

const ADMIN_ROLES = [ROLES.ADMIN_LOCAL, ROLES.ADMIN_NATIONAL]

// ---------- Helpers ----------

function toInt(value, fallback = undefined) {
  const n = Number(value)
  return Number.isInteger(n) ? n : fallback
}

function clampPct(value) {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}

function parseDate(value) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

// Pourcentage de "santé" d'un diagnostic (score / score_max).
function healthPct(diagnostic) {
  const scores = diagnostic.scores_categories || []
  const max = scores.reduce((t, s) => t + (s.score_max || 0), 0)
  const total = diagnostic.score_global || 0
  if (max <= 0) return null
  return clampPct((total / max) * 100)
}

// "Difficulté" = inverse de la santé (plus c'est haut, plus la boîte est fragile).
function difficultyPct(diagnostic) {
  const health = healthPct(diagnostic)
  if (health === null) return null
  return clampPct(100 - health)
}

// Un diagnostic est "AVEC login" si le dirigeant a finalisé la création de
// son compte (il n'a plus l'obligation de changer son mot de passe temporaire).
function isWithLogin(diagnostic) {
  const dirigeant = diagnostic.entreprise?.dirigeant
  return Boolean(dirigeant && dirigeant.doit_modifier_mot_de_passe === false)
}

// Construit le filtre `entreprise` selon le rôle + les filtres de requête.
function buildEntrepriseScope(req) {
  const where = {}

  if (req.auth.role === ROLES.ADMIN_LOCAL) {
    // Admin local : forcé sur sa propre CCI.
    where.cci_id = req.auth.cciId ?? -1
    return where
  }

  // Admin national : filtres optionnels.
  const cciId = toInt(req.query.cciId)
  if (cciId) {
    where.cci_id = cciId
  }
  const region = (req.query.region || '').trim()
  if (region && region.toLowerCase() !== 'toutes' && region.toLowerCase() !== 'all') {
    where.cci = { region }
  }
  return where
}

function buildDateRange(req) {
  const from = parseDate(req.query.from)
  const to = parseDate(req.query.to)
  if (!from && !to) return undefined
  const range = {}
  if (from) range.gte = from
  if (to) {
    // Inclure toute la journée de fin.
    const end = new Date(to)
    end.setHours(23, 59, 59, 999)
    range.lte = end
  }
  return range
}

function csvEscape(value) {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (/[",\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

// ============================================================
//  Factory
// ============================================================

module.exports = function createAdminRouter(prisma, helpers = {}) {
  const { hashPassword, generateTemporaryPassword } = helpers
  const router = express.Router()

  // Toutes les routes /api/admin exigent une authentification + un rôle admin.
  router.use(authenticate, requireRole(...ADMIN_ROLES))

  // Middleware réservé au super-admin.
  const nationalOnly = requireRole(ROLES.ADMIN_NATIONAL)

  // ----------------------------------------------------------
  //  Contexte de l'admin connecté (pour l'UI)
  // ----------------------------------------------------------
  router.get('/me', async (req, res, next) => {
    try {
      const utilisateur = await prisma.utilisateur.findUnique({
        where: { id: req.auth.id },
        include: { cci: true },
      })
      if (!utilisateur) {
        return res.status(404).json({ error: 'Utilisateur introuvable.' })
      }
      res.json({
        id: utilisateur.id,
        email: utilisateur.email,
        prenom: utilisateur.prenom,
        nom: utilisateur.nom,
        role: utilisateur.role,
        cci: utilisateur.cci
          ? { id: utilisateur.cci.id, nom: utilisateur.cci.nom, region: utilisateur.cci.region, estNational: utilisateur.cci.est_national }
          : null,
        isNational: req.auth.role === ROLES.ADMIN_NATIONAL,
      })
    } catch (error) {
      next(error)
    }
  })

  // Liste des CCI (pour les filtres) — accessible aux deux rôles admin.
  router.get('/ccis', async (req, res, next) => {
    try {
      const ccis = await prisma.cci.findMany({ orderBy: { nom: 'asc' } })
      res.json(
        ccis.map((c) => ({
          id: c.id,
          nom: c.nom,
          code: c.code,
          region: c.region,
          estNational: c.est_national,
        })),
      )
    } catch (error) {
      next(error)
    }
  })

  // Liste des régions distinctes (pour le filtre).
  router.get('/regions', async (req, res, next) => {
    try {
      const rows = await prisma.cci.findMany({
        where: { region: { not: null } },
        select: { region: true },
        distinct: ['region'],
        orderBy: { region: 'asc' },
      })
      res.json(rows.map((r) => r.region).filter(Boolean))
    } catch (error) {
      next(error)
    }
  })

  // ----------------------------------------------------------
  //  TABLEAU DE BORD — liste paginée des diagnostics
  // ----------------------------------------------------------
  router.get('/diagnostics', async (req, res, next) => {
    try {
      const page = Math.max(1, toInt(req.query.page, 1))
      const pageSize = Math.min(100, Math.max(1, toInt(req.query.pageSize, 20)))
      const search = (req.query.search || '').trim()

      const entrepriseScope = buildEntrepriseScope(req)
      const dateRange = buildDateRange(req)

      const where = { entreprise: { ...entrepriseScope } }
      if (dateRange) where.cree_le = dateRange
      if (req.query.statut) where.statut = String(req.query.statut)

      if (search) {
        where.entreprise.OR = [
          { raison_sociale: { contains: search, mode: 'insensitive' } },
          { siret: { contains: search } },
          { dirigeant: { email: { contains: search, mode: 'insensitive' } } },
          { dirigeant: { nom: { contains: search, mode: 'insensitive' } } },
          { dirigeant: { prenom: { contains: search, mode: 'insensitive' } } },
        ]
      }

      const [total, diagnostics] = await Promise.all([
        prisma.diagnostic.count({ where }),
        prisma.diagnostic.findMany({
          where,
          orderBy: { cree_le: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: {
            scores_categories: true,
            rendez_vous: true,
            entreprise: {
              include: { dirigeant: true, cci: true },
            },
          },
        }),
      ])

      // Filtre éventuel sur la difficulté (post-calcul).
      const difMin = toInt(req.query.difficulteMin)
      const difMax = toInt(req.query.difficulteMax)

      const rows = diagnostics
        .map((d) => {
          const dirigeant = d.entreprise?.dirigeant
          const fullName = [dirigeant?.prenom, dirigeant?.nom].filter(Boolean).join(' ').trim()
          return {
            id: d.id,
            projet: d.entreprise?.raison_sociale || `Projet ${d.id}`,
            siret: d.entreprise?.siret || null,
            entrepreneur: fullName || 'Dirigeant',
            email: dirigeant?.email || null,
            difficulte: difficultyPct(d),
            niveauDifficulte: d.niveau_difficulte || null,
            statut: d.statut,
            date: d.cree_le ? d.cree_le.toISOString() : null,
            cci: d.entreprise?.cci ? { id: d.entreprise.cci.id, nom: d.entreprise.cci.nom } : null,
            avecLogin: isWithLogin(d),
            hasRendezVous: (d.rendez_vous || []).length > 0,
          }
        })
        .filter((r) => {
          if (difMin !== undefined && (r.difficulte === null || r.difficulte < difMin)) return false
          if (difMax !== undefined && (r.difficulte === null || r.difficulte > difMax)) return false
          return true
        })

      res.json({
        rows,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
      })
    } catch (error) {
      next(error)
    }
  })

  // Export CSV (mêmes filtres, sans pagination).
  router.get('/diagnostics/export', async (req, res, next) => {
    try {
      const search = (req.query.search || '').trim()
      const entrepriseScope = buildEntrepriseScope(req)
      const dateRange = buildDateRange(req)

      const where = { entreprise: { ...entrepriseScope } }
      if (dateRange) where.cree_le = dateRange
      if (req.query.statut) where.statut = String(req.query.statut)
      if (search) {
        where.entreprise.OR = [
          { raison_sociale: { contains: search, mode: 'insensitive' } },
          { siret: { contains: search } },
          { dirigeant: { email: { contains: search, mode: 'insensitive' } } },
        ]
      }

      const diagnostics = await prisma.diagnostic.findMany({
        where,
        orderBy: { cree_le: 'desc' },
        include: {
          scores_categories: true,
          entreprise: { include: { dirigeant: true, cci: true } },
        },
      })

      const header = [
        'ID',
        'Projet',
        'SIRET',
        'Entrepreneur',
        'Email',
        'CCI',
        'Statut',
        'Score (%)',
        'Difficulte (%)',
        'Niveau',
        'Date',
      ]

      const lines = [header.join(';')]
      for (const d of diagnostics) {
        const dirigeant = d.entreprise?.dirigeant
        const fullName = [dirigeant?.prenom, dirigeant?.nom].filter(Boolean).join(' ').trim()
        lines.push(
          [
            d.id,
            d.entreprise?.raison_sociale || `Projet ${d.id}`,
            d.entreprise?.siret || '',
            fullName,
            dirigeant?.email || '',
            d.entreprise?.cci?.nom || '',
            d.statut,
            healthPct(d) ?? '',
            difficultyPct(d) ?? '',
            d.niveau_difficulte || '',
            d.cree_le ? d.cree_le.toISOString().slice(0, 10) : '',
          ]
            .map(csvEscape)
            .join(';'),
        )
      }

      const csv = '﻿' + lines.join('\n') // BOM pour Excel
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', 'attachment; filename="diagnostics.csv"')
      res.send(csv)
    } catch (error) {
      next(error)
    }
  })

  // ----------------------------------------------------------
  //  STATISTIQUES agrégées
  // ----------------------------------------------------------
  router.get('/stats', async (req, res, next) => {
    try {
      const entrepriseScope = buildEntrepriseScope(req)
      const dateRange = buildDateRange(req)

      const where = { entreprise: { ...entrepriseScope } }
      if (dateRange) where.cree_le = dateRange

      const diagnostics = await prisma.diagnostic.findMany({
        where,
        include: {
          scores_categories: true,
          entreprise: { include: { dirigeant: true } },
          reponses: {
            include: {
              question: { include: { categorie: true } },
              reponse_possible: true,
            },
          },
        },
      })

      // --- Général : part AVEC / SANS login ---
      let avecLogin = 0
      let sansLogin = 0
      // --- Envoi mail ---
      let mailAvecLogin = 0
      let mailSansLogin = 0
      let sansDemandeMail = 0
      // --- Statuts / abandons ---
      const statuts = { termine: 0, en_cours: 0, abandonne: 0 }
      const abandonsParEtape = {}
      // --- Répartition des scores (terminés) ---
      const buckets = [
        { label: '0-20 %', min: 0, max: 20, count: 0 },
        { label: '21-40 %', min: 21, max: 40, count: 0 },
        { label: '41-60 %', min: 41, max: 60, count: 0 },
        { label: '61-80 %', min: 61, max: 80, count: 0 },
        { label: '81-100 %', min: 81, max: 100, count: 0 },
      ]
      // --- Réponses aux questions ---
      const questionsMap = new Map()

      for (const d of diagnostics) {
        const withLogin = isWithLogin(d)
        if (withLogin) avecLogin += 1
        else sansLogin += 1

        const demandeMail = d.entreprise?.demande_contact
        if (demandeMail) {
          if (withLogin) mailAvecLogin += 1
          else mailSansLogin += 1
        } else {
          sansDemandeMail += 1
        }

        if (statuts[d.statut] !== undefined) statuts[d.statut] += 1
        if (d.statut !== 'termine') {
          const etape = d.derniere_etape_atteinte || 'Non démarré'
          abandonsParEtape[etape] = (abandonsParEtape[etape] || 0) + 1
        }

        if (d.statut === 'termine') {
          const pct = healthPct(d)
          if (pct !== null) {
            const bucket = buckets.find((b) => pct >= b.min && pct <= b.max)
            if (bucket) bucket.count += 1
          }
        }

        for (const rep of d.reponses || []) {
          if (!rep.question) continue
          const qId = rep.question.id
          if (!questionsMap.has(qId)) {
            questionsMap.set(qId, {
              questionId: qId,
              texte: rep.question.texte,
              categorie: rep.question.categorie?.nom || null,
              totalReponses: 0,
              moyennePoints: 0,
              sommePoints: 0,
              reponses: new Map(),
            })
          }
          const entry = questionsMap.get(qId)
          entry.totalReponses += 1
          entry.sommePoints += rep.points_obtenus || 0
          const label = rep.reponse_possible?.texte || 'Sans réponse'
          entry.reponses.set(label, (entry.reponses.get(label) || 0) + 1)
        }
      }

      const reponsesQuestions = Array.from(questionsMap.values())
        .map((q) => ({
          questionId: q.questionId,
          texte: q.texte,
          categorie: q.categorie,
          totalReponses: q.totalReponses,
          moyennePoints: q.totalReponses ? Math.round(q.sommePoints / q.totalReponses) : 0,
          distribution: Array.from(q.reponses.entries())
            .map(([label, count]) => ({ label, count }))
            .sort((a, b) => b.count - a.count),
        }))
        .sort((a, b) => b.totalReponses - a.totalReponses)

      res.json({
        total: diagnostics.length,
        general: { avecLogin, sansLogin },
        envoiMail: {
          demandeAvecLogin: mailAvecLogin,
          demandeSansLogin: mailSansLogin,
          sansDemande: sansDemandeMail,
        },
        abandons: {
          statuts,
          parEtape: Object.entries(abandonsParEtape)
            .map(([etape, count]) => ({ etape, count }))
            .sort((a, b) => b.count - a.count),
          tauxAbandon: diagnostics.length
            ? clampPct(((statuts.abandonne + statuts.en_cours) / diagnostics.length) * 100)
            : 0,
        },
        repartitionScores: buckets,
        reponsesQuestions,
      })
    } catch (error) {
      next(error)
    }
  })

  // ==========================================================
  //  SUPER-ADMIN (admin_national) — gestion globale
  // ==========================================================

  // ---- CCI ----
  router.post('/ccis', nationalOnly, async (req, res, next) => {
    try {
      const { nom, code, region, estNational } = req.body || {}
      if (!nom || !code) {
        return res.status(400).json({ error: 'nom et code sont requis.' })
      }
      const cci = await prisma.cci.create({
        data: {
          nom: String(nom),
          code: String(code),
          region: region ? String(region) : null,
          est_national: Boolean(estNational),
        },
      })
      res.status(201).json(cci)
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Ce code CCI existe déjà.' })
      }
      next(error)
    }
  })

  router.patch('/ccis/:id', nationalOnly, async (req, res, next) => {
    try {
      const id = toInt(req.params.id)
      if (!id) return res.status(400).json({ error: 'id invalide.' })
      const { nom, code, region, estNational } = req.body || {}
      const cci = await prisma.cci.update({
        where: { id },
        data: {
          ...(nom !== undefined ? { nom: String(nom) } : {}),
          ...(code !== undefined ? { code: String(code) } : {}),
          ...(region !== undefined ? { region: region ? String(region) : null } : {}),
          ...(estNational !== undefined ? { est_national: Boolean(estNational) } : {}),
        },
      })
      res.json(cci)
    } catch (error) {
      if (error.code === 'P2025') return res.status(404).json({ error: 'CCI introuvable.' })
      if (error.code === 'P2002') return res.status(409).json({ error: 'Ce code CCI existe déjà.' })
      next(error)
    }
  })

  router.delete('/ccis/:id', nationalOnly, async (req, res, next) => {
    try {
      const id = toInt(req.params.id)
      if (!id) return res.status(400).json({ error: 'id invalide.' })
      const [users, entreprises] = await Promise.all([
        prisma.utilisateur.count({ where: { cci_id: id } }),
        prisma.entreprise.count({ where: { cci_id: id } }),
      ])
      if (users > 0 || entreprises > 0) {
        return res.status(409).json({
          error: 'Impossible de supprimer : des utilisateurs ou entreprises sont rattachés à cette CCI.',
        })
      }
      await prisma.cci.delete({ where: { id } })
      res.json({ success: true })
    } catch (error) {
      if (error.code === 'P2025') return res.status(404).json({ error: 'CCI introuvable.' })
      next(error)
    }
  })

  // ---- Catégories (lecture) ----
  router.get('/categories', async (req, res, next) => {
    try {
      const categories = await prisma.categorie.findMany({ orderBy: { ordre: 'asc' } })
      res.json(categories)
    } catch (error) {
      next(error)
    }
  })

  // ---- Questions ----
  router.get('/questions', async (req, res, next) => {
    try {
      const categorieId = toInt(req.query.categorieId)
      const questions = await prisma.question.findMany({
        where: categorieId ? { categorie_id: categorieId } : undefined,
        orderBy: [{ categorie_id: 'asc' }, { ordre: 'asc' }],
        include: {
          categorie: true,
          reponses_possibles: { orderBy: { ordre: 'asc' } },
        },
      })
      res.json(questions)
    } catch (error) {
      next(error)
    }
  })

  router.post('/questions', nationalOnly, async (req, res, next) => {
    try {
      const { categorieId, texte, secteur, taille, pointsMax, ordre, active, reponses } = req.body || {}
      if (!categorieId || !texte) {
        return res.status(400).json({ error: 'categorieId et texte sont requis.' })
      }
      const question = await prisma.question.create({
        data: {
          categorie_id: toInt(categorieId),
          texte: String(texte),
          secteur: secteur ? String(secteur) : null,
          taille: taille ? String(taille) : null,
          points_max: toInt(pointsMax, 100),
          ordre: toInt(ordre, 0),
          active: active === undefined ? true : Boolean(active),
          reponses_possibles: Array.isArray(reponses)
            ? {
                create: reponses.map((r, i) => ({
                  texte: String(r.texte || ''),
                  points: toInt(r.points, 0),
                  ordre: toInt(r.ordre, i),
                })),
              }
            : undefined,
        },
        include: { reponses_possibles: true, categorie: true },
      })
      res.status(201).json(question)
    } catch (error) {
      next(error)
    }
  })

  router.patch('/questions/:id', nationalOnly, async (req, res, next) => {
    try {
      const id = toInt(req.params.id)
      if (!id) return res.status(400).json({ error: 'id invalide.' })
      const { categorieId, texte, secteur, taille, pointsMax, ordre, active } = req.body || {}
      const question = await prisma.question.update({
        where: { id },
        data: {
          ...(categorieId !== undefined ? { categorie_id: toInt(categorieId) } : {}),
          ...(texte !== undefined ? { texte: String(texte) } : {}),
          ...(secteur !== undefined ? { secteur: secteur ? String(secteur) : null } : {}),
          ...(taille !== undefined ? { taille: taille ? String(taille) : null } : {}),
          ...(pointsMax !== undefined ? { points_max: toInt(pointsMax, 100) } : {}),
          ...(ordre !== undefined ? { ordre: toInt(ordre, 0) } : {}),
          ...(active !== undefined ? { active: Boolean(active) } : {}),
        },
        include: { reponses_possibles: { orderBy: { ordre: 'asc' } }, categorie: true },
      })
      res.json(question)
    } catch (error) {
      if (error.code === 'P2025') return res.status(404).json({ error: 'Question introuvable.' })
      next(error)
    }
  })

  router.delete('/questions/:id', nationalOnly, async (req, res, next) => {
    try {
      const id = toInt(req.params.id)
      if (!id) return res.status(400).json({ error: 'id invalide.' })
      const usage = await prisma.reponseDiagnostic.count({ where: { question_id: id } })
      if (usage > 0) {
        // On désactive plutôt que de supprimer pour préserver l'historique.
        await prisma.question.update({ where: { id }, data: { active: false } })
        return res.json({ success: true, softDeleted: true })
      }
      await prisma.reponsePossible.deleteMany({ where: { question_id: id } })
      await prisma.question.delete({ where: { id } })
      res.json({ success: true })
    } catch (error) {
      if (error.code === 'P2025') return res.status(404).json({ error: 'Question introuvable.' })
      next(error)
    }
  })

  // ---- Réponses possibles ----
  router.post('/questions/:id/reponses', nationalOnly, async (req, res, next) => {
    try {
      const questionId = toInt(req.params.id)
      if (!questionId) return res.status(400).json({ error: 'id invalide.' })
      const { texte, points, ordre } = req.body || {}
      const reponse = await prisma.reponsePossible.create({
        data: {
          question_id: questionId,
          texte: String(texte || ''),
          points: toInt(points, 0),
          ordre: toInt(ordre, 0),
        },
      })
      res.status(201).json(reponse)
    } catch (error) {
      next(error)
    }
  })

  router.patch('/reponses/:id', nationalOnly, async (req, res, next) => {
    try {
      const id = toInt(req.params.id)
      if (!id) return res.status(400).json({ error: 'id invalide.' })
      const { texte, points, ordre } = req.body || {}
      const reponse = await prisma.reponsePossible.update({
        where: { id },
        data: {
          ...(texte !== undefined ? { texte: String(texte) } : {}),
          ...(points !== undefined ? { points: toInt(points, 0) } : {}),
          ...(ordre !== undefined ? { ordre: toInt(ordre, 0) } : {}),
        },
      })
      res.json(reponse)
    } catch (error) {
      if (error.code === 'P2025') return res.status(404).json({ error: 'Réponse introuvable.' })
      next(error)
    }
  })

  router.delete('/reponses/:id', nationalOnly, async (req, res, next) => {
    try {
      const id = toInt(req.params.id)
      if (!id) return res.status(400).json({ error: 'id invalide.' })
      await prisma.reponsePossible.delete({ where: { id } })
      res.json({ success: true })
    } catch (error) {
      if (error.code === 'P2025') return res.status(404).json({ error: 'Réponse introuvable.' })
      next(error)
    }
  })

  // ---- Messages de recommandation ----
  router.get('/recommandations', async (req, res, next) => {
    try {
      const messages = await prisma.messageRecommandation.findMany({
        orderBy: [{ categorie_id: 'asc' }, { score_min: 'asc' }],
        include: { categorie: true },
      })
      res.json(messages)
    } catch (error) {
      next(error)
    }
  })

  router.post('/recommandations', nationalOnly, async (req, res, next) => {
    try {
      const { secteur, taille, categorieId, scoreMin, scoreMax, titre, message, orientation } = req.body || {}
      if (message === undefined || scoreMin === undefined || scoreMax === undefined) {
        return res.status(400).json({ error: 'message, scoreMin et scoreMax sont requis.' })
      }
      const created = await prisma.messageRecommandation.create({
        data: {
          secteur: secteur ? String(secteur) : null,
          taille: taille ? String(taille) : null,
          categorie_id: categorieId ? toInt(categorieId) : null,
          score_min: toInt(scoreMin, 0),
          score_max: toInt(scoreMax, 100),
          titre: titre ? String(titre) : null,
          message: String(message),
          orientation: orientation ? String(orientation) : null,
        },
      })
      res.status(201).json(created)
    } catch (error) {
      next(error)
    }
  })

  router.patch('/recommandations/:id', nationalOnly, async (req, res, next) => {
    try {
      const id = toInt(req.params.id)
      if (!id) return res.status(400).json({ error: 'id invalide.' })
      const { secteur, taille, categorieId, scoreMin, scoreMax, titre, message, orientation } = req.body || {}
      const updated = await prisma.messageRecommandation.update({
        where: { id },
        data: {
          ...(secteur !== undefined ? { secteur: secteur ? String(secteur) : null } : {}),
          ...(taille !== undefined ? { taille: taille ? String(taille) : null } : {}),
          ...(categorieId !== undefined ? { categorie_id: categorieId ? toInt(categorieId) : null } : {}),
          ...(scoreMin !== undefined ? { score_min: toInt(scoreMin, 0) } : {}),
          ...(scoreMax !== undefined ? { score_max: toInt(scoreMax, 100) } : {}),
          ...(titre !== undefined ? { titre: titre ? String(titre) : null } : {}),
          ...(message !== undefined ? { message: String(message) } : {}),
          ...(orientation !== undefined ? { orientation: orientation ? String(orientation) : null } : {}),
        },
      })
      res.json(updated)
    } catch (error) {
      if (error.code === 'P2025') return res.status(404).json({ error: 'Message introuvable.' })
      next(error)
    }
  })

  router.delete('/recommandations/:id', nationalOnly, async (req, res, next) => {
    try {
      const id = toInt(req.params.id)
      if (!id) return res.status(400).json({ error: 'id invalide.' })
      await prisma.messageRecommandation.delete({ where: { id } })
      res.json({ success: true })
    } catch (error) {
      if (error.code === 'P2025') return res.status(404).json({ error: 'Message introuvable.' })
      next(error)
    }
  })

  // ---- Comptes admin (conseillers / admins locaux / nationaux) ----
  router.get('/admins', nationalOnly, async (req, res, next) => {
    try {
      const admins = await prisma.utilisateur.findMany({
        where: { role: { in: [ROLES.CONSEILLER, ROLES.ADMIN_LOCAL, ROLES.ADMIN_NATIONAL] } },
        orderBy: { cree_le: 'desc' },
        include: { cci: true },
      })
      res.json(
        admins.map((a) => ({
          id: a.id,
          email: a.email,
          prenom: a.prenom,
          nom: a.nom,
          role: a.role,
          actif: a.actif,
          cci: a.cci ? { id: a.cci.id, nom: a.cci.nom } : null,
          derniereConnexion: a.derniere_connexion,
          creeLe: a.cree_le,
        })),
      )
    } catch (error) {
      next(error)
    }
  })

  router.post('/admins', nationalOnly, async (req, res, next) => {
    try {
      const { email, prenom, nom, role, cciId, telephone } = req.body || {}
      const allowedRoles = [ROLES.CONSEILLER, ROLES.ADMIN_LOCAL, ROLES.ADMIN_NATIONAL]
      if (!email || !role || !allowedRoles.includes(role)) {
        return res.status(400).json({ error: 'email et un rôle valide sont requis.' })
      }
      if ((role === ROLES.ADMIN_LOCAL || role === ROLES.CONSEILLER) && !cciId) {
        return res.status(400).json({ error: 'Une CCI est requise pour ce rôle.' })
      }

      const tempPassword =
        typeof generateTemporaryPassword === 'function'
          ? generateTemporaryPassword()
          : Math.random().toString(36).slice(2, 10)

      if (typeof hashPassword !== 'function') {
        return res.status(500).json({ error: 'Hachage de mot de passe indisponible.' })
      }

      const created = await prisma.utilisateur.create({
        data: {
          email: String(email).toLowerCase().trim(),
          mot_de_passe: hashPassword(tempPassword),
          prenom: prenom ? String(prenom) : null,
          nom: nom ? String(nom) : null,
          telephone: telephone ? String(telephone) : null,
          role,
          cci_id: cciId ? toInt(cciId) : null,
          doit_modifier_mot_de_passe: true,
          actif: true,
        },
      })

      res.status(201).json({
        id: created.id,
        email: created.email,
        role: created.role,
        // Mot de passe temporaire renvoyé une seule fois à la création.
        motDePasseTemporaire: tempPassword,
      })
    } catch (error) {
      if (error.code === 'P2002') return res.status(409).json({ error: 'Cet email est déjà utilisé.' })
      next(error)
    }
  })

  router.patch('/admins/:id', nationalOnly, async (req, res, next) => {
    try {
      const id = toInt(req.params.id)
      if (!id) return res.status(400).json({ error: 'id invalide.' })
      const { prenom, nom, role, cciId, actif, telephone } = req.body || {}
      const allowedRoles = [ROLES.CONSEILLER, ROLES.ADMIN_LOCAL, ROLES.ADMIN_NATIONAL]
      if (role !== undefined && !allowedRoles.includes(role)) {
        return res.status(400).json({ error: 'Rôle invalide.' })
      }
      const updated = await prisma.utilisateur.update({
        where: { id },
        data: {
          ...(prenom !== undefined ? { prenom: prenom ? String(prenom) : null } : {}),
          ...(nom !== undefined ? { nom: nom ? String(nom) : null } : {}),
          ...(telephone !== undefined ? { telephone: telephone ? String(telephone) : null } : {}),
          ...(role !== undefined ? { role } : {}),
          ...(cciId !== undefined ? { cci_id: cciId ? toInt(cciId) : null } : {}),
          ...(actif !== undefined ? { actif: Boolean(actif) } : {}),
        },
      })
      res.json({ id: updated.id, email: updated.email, role: updated.role, actif: updated.actif })
    } catch (error) {
      if (error.code === 'P2025') return res.status(404).json({ error: 'Compte introuvable.' })
      next(error)
    }
  })

  return router
}
