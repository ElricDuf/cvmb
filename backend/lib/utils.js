// Utilitaires purs — pas de dépendances externes.

const allowedCompanySizes = new Set(['TPE', 'PME'])

const sectorAliases = {
  merchant: 'commerce',
  commerce: 'commerce',
  artisan: 'artisan',
  liberal: 'liberal',
  industrial: 'industrial',
  services: 'services',
}

const sectorLabels = {
  commerce: 'commerce',
  artisan: 'artisanat',
  liberal: 'professions liberales',
  industrial: 'industrie',
  services: 'services',
}

const sizeLabels = { TPE: 'TPE', PME: 'PME' }

function normalizeRequiredString(value) {
  const normalized = String(value || '').trim()
  return normalized.length > 0 ? normalized : null
}

function normalizeBoolean(value) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return ['true', '1', 'yes', 'on'].includes(value.trim().toLowerCase())
  return Boolean(value)
}

function splitFullName(fullName) {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return { firstName: null, lastName: null }
  if (parts.length === 1) return { firstName: parts[0], lastName: null }
  return { firstName: parts.shift(), lastName: parts.join(' ') }
}

function workforceToEffectif(workforce) {
  switch (normalizeRequiredString(workforce)) {
    case '1 à 9 salariés':  return 9
    case '10 à 19 salariés': return 19
    case '20 à 49 salariés': return 49
    case '50 salariés et plus': return 50
    default: return null
  }
}

function normalizeCompanySize(value) {
  const normalized = String(value || '').trim().toUpperCase()
  return allowedCompanySizes.has(normalized) ? normalized : null
}

function normalizeWorkforceLabel(value) {
  const normalized = String(value || '').trim()
  switch (normalized) {
    case '1 à 9 salariés':
    case '1-2':      return '1 à 9 salariés'
    case '10 à 19 salariés':
    case '3-10':     return '10 à 19 salariés'
    case '20 à 49 salariés':
    case '11-50':    return '20 à 49 salariés'
    case '50 salariés et plus':
    case '50+':      return '50 salariés et plus'
    default:         return normalized || null
  }
}

function normalizeSector(value) {
  const normalized = String(value || '').trim().toLowerCase()
  return sectorAliases[normalized] || null
}

function normalizeNumericId(value) {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : null
}

function normalizeAnswers(rawAnswers) {
  if (Array.isArray(rawAnswers)) {
    return rawAnswers
      .map((a) => ({
        questionId: normalizeNumericId(a.questionId ?? a.question_id),
        responseId:  normalizeNumericId(a.responseId  ?? a.response_id),
      }))
      .filter((a) => a.questionId && a.responseId)
  }
  if (rawAnswers && typeof rawAnswers === 'object') {
    return Object.entries(rawAnswers)
      .map(([qId, rId]) => ({
        questionId: normalizeNumericId(qId),
        responseId:  normalizeNumericId(rId),
      }))
      .filter((a) => a.questionId && a.responseId)
  }
  return []
}

function clampPercentage(value) {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, Math.round(value)))
}

function formatAccountPayload(utilisateur, entreprise) {
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
    entreprise: entreprise
      ? {
          id: entreprise.id,
          raisonSociale: entreprise.raison_sociale,
          siret: entreprise.siret,
          ville: entreprise.ville,
          taille: entreprise.taille,
          effectif: entreprise.effectif,
          effectifTexte: entreprise.effectif_texte,
          anneeCreation: entreprise.annee_creation,
          demandeContact: entreprise.demande_contact,
        }
      : null,
  }
}

module.exports = {
  allowedCompanySizes,
  sectorAliases,
  sectorLabels,
  sizeLabels,
  normalizeRequiredString,
  normalizeBoolean,
  splitFullName,
  workforceToEffectif,
  normalizeCompanySize,
  normalizeWorkforceLabel,
  normalizeSector,
  normalizeNumericId,
  normalizeAnswers,
  clampPercentage,
  formatAccountPayload,
}
