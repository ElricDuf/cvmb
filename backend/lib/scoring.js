// Logique de scoring et de narration des diagnostics (fonctions pures).

const { clampPercentage, normalizeRequiredString, sectorLabels, sizeLabels } = require('./utils')

const categoryAdviceTemplates = {
  1: {
    fallback: 'formalisez les processus administratifs et fiabilisez les donnees comptables de pilotage.',
    sector: {
      commerce:   'fiabilisez les routines de rapprochement caisse, banque et stocks.',
      artisan:    'securisez le suivi devis-factures et la tracabilite des avances de chantier.',
      liberal:    'renforcez la gestion documentaire et les obligations de confidentialite.',
      industrial: 'cadrez les controles administratifs de production et les clotures periodiques.',
      services:   'standardisez les contrats, devis et validations de prestation.',
    },
  },
  2: {
    fallback: 'mettez en place un suivi de tresorerie hebdomadaire et des alertes sur les echeances critiques.',
    sector: {
      commerce:   'pilotez la marge et la rotation des stocks pour limiter la tension de tresorerie.',
      artisan:    'securisez les acomptes, les delais de facturation et les relances de fin de chantier.',
      liberal:    'stabilisez les encaissements et planifiez les charges fiscales/sociales.',
      industrial: 'suivez le besoin en fonds de roulement et negociez les conditions fournisseurs.',
      services:   'cadrez les conditions de paiement et automatisez les relances d impayes.',
    },
  },
  3: {
    fallback: 'structurez l acquisition et le suivi de la performance commerciale avec des indicateurs simples.',
    sector: {
      commerce:   'renforcez la visibilite omnicanale et le pilotage des campagnes locales.',
      artisan:    'ameliorez la prise de rendez-vous en ligne et la valorisation des realisations.',
      liberal:    'developpez la visibilite d expertise et la qualite du parcours de prise de contact.',
      industrial: 'soutenez le developpement commercial par des outils de suivi des leads B2B.',
      services:   'clarifiez l offre, les preuves de valeur et la conversion des demandes entrantes.',
    },
  },
  4: {
    fallback: 'stabilisez la relation clients-fournisseurs avec des engagements, delais et points de controle partages.',
    sector: {
      commerce:   'securisez les approvisionnements et le suivi de satisfaction apres-vente.',
      artisan:    'formalisez les attentes clients et les jalons de validation des travaux.',
      liberal:    'renforcez la communication client et la coordination avec les partenaires externes.',
      industrial: 'fiabilisez la chaine fournisseurs et la gestion des non-conformites.',
      services:   'cadrez la qualite de service avec des SLA, des revues et des plans d amelioration.',
    },
  },
}

function getDifficultyProfile(difficultyPercentage) {
  if (difficultyPercentage >= 75) {
    return { band: 'critical', title: 'Signes de fragilite critique', tone: 'red',
      summary: 'plusieurs fragilites importantes sont presentes et necessitent une action prioritaire' }
  }
  if (difficultyPercentage >= 50) {
    return { band: 'warning', title: 'Vigilance renforcee', tone: 'orange',
      summary: 'des points de vigilance sont identifies et doivent etre traites rapidement' }
  }
  if (difficultyPercentage >= 25) {
    return { band: 'intermediate', title: 'Situation intermediaire', tone: 'green',
      summary: 'la situation est contrastee avec de vraies marges de progression' }
  }
  return { band: 'stable', title: 'Situation stable', tone: 'blue',
    summary: 'le niveau de maitrise est satisfaisant' }
}

function buildContextPrefix(size, sector) {
  const sizeLabel   = sizeLabels[size]   || size
  const sectorLabel = sectorLabels[sector] || sector
  if (!sizeLabel && !sectorLabel) return ''
  if (sizeLabel && sectorLabel) return `Pour une ${sizeLabel} du secteur ${sectorLabel}, `
  if (sizeLabel) return `Pour une ${sizeLabel}, `
  return `Pour le secteur ${sectorLabel}, `
}

function buildGlobalAdvice(profile, size, sector) {
  const sectorAdvice = {
    commerce:   'Priorisez le suivi de marge par produit et la maitrise des stocks.',
    artisan:    'Priorisez le pilotage des devis, acomptes et encaissements de chantier.',
    liberal:    'Priorisez la regularite de facturation et la planification de charge.',
    industrial: 'Priorisez le suivi du BFR et des cycles achats-production-livraison.',
    services:   'Priorisez la securisation des contrats et le recouvrement des impayes.',
  }
  const sizeAdvice = {
    TPE: 'Concentrez-vous sur 1 a 2 actions simples, mesurables et deployables rapidement.',
    PME: 'Nommez un pilote par axe, avec indicateurs de suivi mensuels et revues d equipe.',
  }
  const bandAction = {
    critical:     'Commencez par un plan de stabilisation immediat et hebdomadaire.',
    warning:      'Mettez en place un plan d actions priorise avec jalons sur 90 jours.',
    intermediate: 'Transformez les points encore fragiles en standards de fonctionnement.',
    stable:       'Capitalisez sur vos acquis et formalisez un plan de prevention des risques.',
  }
  return [bandAction[profile.band], sectorAdvice[sector] || null, sizeAdvice[size] || null]
    .filter(Boolean).join(' ')
}

function resolveCategoryTemplate(categoryId, categoryName) {
  if (categoryAdviceTemplates[categoryId]) return categoryAdviceTemplates[categoryId]
  const name = String(categoryName || '').toLowerCase()
  if (name.includes('administrative') || name.includes('comptable')) return categoryAdviceTemplates[1]
  if (name.includes('tresorerie') || name.includes('bancaire'))        return categoryAdviceTemplates[2]
  if (name.includes('commerciale') || name.includes('digitale'))       return categoryAdviceTemplates[3]
  if (name.includes('clients') || name.includes('fournisseurs'))       return categoryAdviceTemplates[4]
  return { fallback: 'definissez des objectifs clairs, un responsable et des indicateurs de suivi concrets.', sector: {} }
}

function buildCategoryAdvice(profile, { categoryId, categoryName, size, sector }) {
  const template = resolveCategoryTemplate(categoryId, categoryName)
  const coreAdvice = template.sector[sector] || template.fallback
  const urgencyPrefix = {
    critical: 'Action prioritaire:', warning: 'Action recommandee:',
    intermediate: 'Action de consolidation:', stable: 'Action preventive:',
  }
  const sizeAdjustment = {
    TPE: 'Gardez un plan court, avec des responsabilites explicites meme si elles sont portees par le dirigeant.',
    PME: 'Documentez le plan et partagez-le avec les responsables concernes pour execution.',
  }
  return `${urgencyPrefix[profile.band]} ${coreAdvice} ${sizeAdjustment[size] || ''}`.trim()
}

function getDiagnosticNarrative(difficultyPercentage, options = {}) {
  const { size, sector, categoryId = null, categoryName = null } = options
  const profile = getDifficultyProfile(difficultyPercentage)
  const contextPrefix = buildContextPrefix(size, sector)
  const description = categoryName
    ? `${contextPrefix}${profile.summary} sur le volet ${categoryName}.`
    : `${contextPrefix}${profile.summary} a l echelle globale de l entreprise.`
  const advice = categoryName
    ? buildCategoryAdvice(profile, { categoryId, categoryName, size, sector })
    : buildGlobalAdvice(profile, size, sector)
  return { title: profile.title, description, advice, tone: profile.tone }
}

async function loadRecommendationMessages(prisma, { size, sector, categoryIds = [] }) {
  const normalizedIds = Array.from(
    new Set((categoryIds || []).map(Number).filter((n) => Number.isInteger(n) && n > 0))
  )
  return prisma.messageRecommandation.findMany({
    where: {
      AND: [
        { OR: [{ secteur: null }, { secteur: sector }] },
        { OR: [{ taille: null },  { taille: size }] },
        normalizedIds.length > 0
          ? { OR: [{ categorie_id: null }, { categorie_id: { in: normalizedIds } }] }
          : { categorie_id: null },
      ],
    },
    orderBy: [{ score_min: 'asc' }, { score_max: 'asc' }, { id: 'asc' }],
  })
}

function selectBestRecommendation(messages, { score, size, sector, categoryId = null }) {
  const normalizedScore = clampPercentage(Number(score) || 0)
  const scoped = (messages || []).filter((item) => {
    const sameCategory = categoryId === null ? item.categorie_id === null : item.categorie_id === categoryId
    if (!sameCategory) return false
    return normalizedScore >= Number(item.score_min) && normalizedScore <= Number(item.score_max)
  })
  if (!scoped.length) return null
  const specificity = (item) => {
    let v = 0
    if (item.secteur && item.secteur === sector) v += 2
    if (item.taille  && item.taille  === size)   v += 1
    return v
  }
  return scoped.sort((l, r) => {
    const diff = specificity(r) - specificity(l)
    if (diff !== 0) return diff
    const lRange = Number(l.score_max) - Number(l.score_min)
    const rRange = Number(r.score_max) - Number(r.score_min)
    if (lRange !== rRange) return lRange - rRange
    return Number(r.id) - Number(l.id)
  })[0]
}

function applyRecommendationToNarrative(narrative, recommendation) {
  if (!recommendation) return narrative
  return {
    ...narrative,
    title:       normalizeRequiredString(recommendation.titre)       || narrative.title,
    description: normalizeRequiredString(recommendation.message)     || narrative.description,
    advice:      normalizeRequiredString(recommendation.orientation)  || narrative.advice,
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
            { OR: [{ taille: null },  { taille: size }] },
          ],
        },
        orderBy: { ordre: 'asc' },
        include: { reponses_possibles: { orderBy: { ordre: 'asc' } } },
      },
    },
  }
}

async function loadQuestionnaireData(prisma, size, sector) {
  const categories = await prisma.categorie.findMany(buildQuestionnaireQuery(size, sector))
  const filteredCategories = categories
    .map((cat) => ({
      id: cat.id,
      nom: cat.nom,
      ordre: cat.ordre,
      questions: cat.questions.map((q) => ({
        id: q.id,
        categorieId: q.categorie_id,
        texte: q.texte,
        secteur: q.secteur,
        taille: q.taille,
        pointsMax: q.points_max,
        ordre: q.ordre,
        active: q.active,
        responses: q.reponses_possibles.map((r) => ({
          id: r.id, questionId: r.question_id, texte: r.texte, points: r.points, ordre: r.ordre,
        })),
      })),
    }))
    .filter((cat) => cat.questions.length > 0)
  const questionCount = filteredCategories.reduce((t, c) => t + c.questions.length, 0)
  return { filteredCategories, questionCount }
}

module.exports = {
  getDifficultyProfile,
  getDiagnosticNarrative,
  loadRecommendationMessages,
  selectBestRecommendation,
  applyRecommendationToNarrative,
  buildQuestionnaireQuery,
  loadQuestionnaireData,
}
