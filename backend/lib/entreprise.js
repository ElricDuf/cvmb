// Helpers base de données liés aux entreprises et à la persistance des diagnostics.

const { storeDiagnosticResult } = require('./cache')
const { normalizeRequiredString, splitFullName } = require('./utils')
const { getEntrepriseBySiret } = require('../sirene')

async function ensureNationalCci(prisma) {
  const existing = await prisma.cci.findFirst({
    where: { est_national: true },
    orderBy: { id: 'asc' },
  })
  if (existing) return existing
  return prisma.cci.create({
    data: { nom: 'CCI nationale', code: 'NAT', region: 'National', est_national: true },
  })
}

async function persistDiagnosticSnapshot(prisma, entrepriseId, diagnostic) {
  const answers    = Array.isArray(diagnostic?.answers)    ? diagnostic.answers    : []
  const categories = Array.isArray(diagnostic?.categories) ? diagnostic.categories : []
  const global     = diagnostic?.global || {}

  if (!answers.length || !categories.length) {
    throw new Error('diagnostic snapshot is incomplete')
  }

  const created = await prisma.diagnostic.create({
    data: {
      entreprise_id:    Number(entrepriseId),
      statut:           'termine',
      score_global:     Math.round(Number(global.score) || 0),
      niveau_difficulte: normalizeRequiredString(global.title),
      termine_le:       diagnostic?.createdAt ? new Date(diagnostic.createdAt) : new Date(),
      reponses: {
        create: answers.map((a) => ({
          question:         { connect: { id: Number(a.questionId) } },
          reponse_possible: { connect: { id: Number(a.responseId) } },
          points_obtenus:   Number(a.points) || 0,
        })),
      },
      scores_categories: {
        create: categories.map((c) => ({
          categorie: { connect: { id: Number(c.id) } },
          score:     Number(c.score)    || 0,
          score_max: Number(c.scoreMax) || 0,
        })),
      },
    },
    include: { reponses: true, scores_categories: true },
  })

  const persisted = {
    id:            created.id,
    filters:       diagnostic.filters || null,
    questionCount: diagnostic.questionCount || answers.length,
    global: {
      score:                created.score_global || Number(global.score) || 0,
      scoreMax:             Number(global.scoreMax)             || 0,
      percentage:           Number(global.percentage)           || 0,
      difficultyPercentage: Number(global.difficultyPercentage) || 0,
      title:       global.title       || null,
      description: global.description || null,
      advice:      global.advice      || null,
      tone:        global.tone        || null,
    },
    categories: categories.map((c) => ({
      id:                   Number(c.id),
      nom:                  c.nom,
      ordre:                c.ordre,
      score:                Number(c.score)                || 0,
      scoreMax:             Number(c.scoreMax)             || 0,
      percentage:           Number(c.percentage)           || 0,
      difficultyPercentage: Number(c.difficultyPercentage) || 0,
      title:       c.title       || null,
      description: c.description || null,
      advice:      c.advice      || null,
      tone:        c.tone        || null,
    })),
    answers: answers.map((a) => ({
      questionId:   Number(a.questionId),
      questionText: a.questionText,
      categoryId:   Number(a.categoryId),
      categoryName: a.categoryName,
      responseId:   Number(a.responseId),
      responseText: a.responseText,
      points:       Number(a.points) || 0,
    })),
    createdAt: created.cree_le ? created.cree_le.toISOString() : diagnostic.createdAt,
  }

  storeDiagnosticResult(persisted)
  if (diagnostic.id) storeDiagnosticResult({ ...persisted, uuid: diagnostic.id })

  return persisted
}

async function resolveEntrepriseForDiagnostic(prisma, { entrepriseId, userId, siret, size, sector }) {
  if (entrepriseId) return entrepriseId

  if (!userId) return null

  if (siret) {
    const cci = await ensureNationalCci(prisma)
    const utilisateur = await prisma.utilisateur.findUnique({ where: { id: userId } })

    if (utilisateur) {
      const sireneCompany = await getEntrepriseBySiret(siret).catch(() => null)
      const split = splitFullName([utilisateur.prenom, utilisateur.nom].filter(Boolean).join(' '))
      const entreprise = await prisma.entreprise.upsert({
        where: { siret },
        create: {
          dirigeant_id:   utilisateur.id,
          cci_id:         cci.id,
          siret,
          raison_sociale: sireneCompany?.raisonSociale || `${utilisateur.prenom || 'Entreprise'} ${utilisateur.nom || ''}`.trim(),
          code_postal:    sireneCompany?.codePostal || null,
          ville:          sireneCompany?.ville || null,
          secteur: sector, taille: size,
          effectif: null, effectif_texte: null, annee_creation: null,
          demande_contact: true,
        },
        update: {
          dirigeant_id:   utilisateur.id,
          cci_id:         cci.id,
          raison_sociale: sireneCompany?.raisonSociale || `${split.firstName || 'Entreprise'} ${split.lastName || ''}`.trim(),
          code_postal:    sireneCompany?.codePostal || null,
          ville:          sireneCompany?.ville || null,
          secteur: sector, taille: size,
          mis_a_jour_le: new Date(),
        },
      })
      return entreprise.id
    }
  }

  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id: userId },
    include: { entreprises: { orderBy: { cree_le: 'desc' }, take: 1 } },
  })
  return utilisateur?.entreprises?.[0]?.id || null
}

module.exports = { ensureNationalCci, persistDiagnosticSnapshot, resolveEntrepriseForDiagnostic }
