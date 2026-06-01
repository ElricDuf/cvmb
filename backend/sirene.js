/**
 * SIRENE module for querying French business database
 * Provides functions to look up enterprises by SIRET and SIREN
 */

/**
 * Get enterprise information by SIRET
 * @param {string} siret - The SIRET number (14 digits)
 * @returns {Promise<Object>} Enterprise data
 */
const axios = require('axios')

// Portail actuel INSEE (par défaut) : https://api.insee.fr/api-sirene/3.11
// Ancienne plateforme : https://api.insee.fr/entreprises/sirene/V3
const SIRENE_BASE = process.env.SIRENE_API_BASE || 'https://api.insee.fr/api-sirene/3.11'

/**
 * Mappe un code "tranche d'effectif" INSEE vers l'une des options
 * proposées dans le formulaire d'accompagnement.
 * Codes INSEE : https://www.sirene.fr/sirene/public/variable/tefen
 * @param {string|null} code
 * @returns {string|null} Libellé compatible avec le <select> du formulaire
 */
function mapEffectifToWorkforce(code) {
  if (!code) return null
  const c = String(code).trim()
  if (['00', '01', '02', '03'].includes(c)) return '1 à 9 salariés'
  if (c === '11') return '10 à 19 salariés'
  if (c === '12') return '20 à 49 salariés'
  if (['21', '22', '31', '32', '41', '42', '51', '52', '53'].includes(c)) {
    return '50 salariés et plus'
  }
  return null // NN ou inconnu : on laisse l'utilisateur choisir
}

/**
 * Extrait l'année (YYYY) d'une date INSEE de la forme "YYYY-MM-DD".
 * @param {string|null} dateStr
 * @returns {string|null}
 */
function extractYear(dateStr) {
  if (!dateStr) return null
  const match = String(dateStr).match(/^(\d{4})/)
  return match ? match[1] : null
}

/**
 * Construit les en-têtes d'authentification selon le mode configuré.
 * SIRENE_AUTH_MODE :
 *   - 'apikey' (défaut) : portail actuel portail-api.insee.fr, plan « API Key ».
 *                         La clé est envoyée dans l'en-tête X-INSEE-Api-Key-Integration.
 *   - 'bearer'          : ancienne plateforme api.insee.fr (jeton OAuth2 en Authorization: Bearer).
 * SIRENE_API_KEY_HEADER permet, en mode apikey, de surcharger le nom de l'en-tête si besoin.
 */
function _getAuthHeaders() {
  const key = process.env.SIRENE_API_KEY
  if (!key) {
    throw Object.assign(new Error('SIRENE_API_KEY not configured'), { statusCode: 500 })
  }

  const mode = (process.env.SIRENE_AUTH_MODE || 'apikey').toLowerCase()
  const headers = { Accept: 'application/json' }

  if (mode === 'bearer') {
    headers.Authorization = `Bearer ${key}`
  } else {
    const headerName = process.env.SIRENE_API_KEY_HEADER || 'X-INSEE-Api-Key-Integration'
    headers[headerName] = key
  }

  return headers
}

async function _fetch(url) {
  const res = await axios.get(url, { headers: _getAuthHeaders(), timeout: 10000 })
  return res.data
}

async function getEntrepriseBySiret(siret) {
  try {
    const url = `${SIRENE_BASE}/siret/${encodeURIComponent(String(siret))}`
    const data = await _fetch(url)

    const etab = data.etablissement || data
    const unite = data.uniteLegale || (etab && etab.uniteLegale) || null

    const adresse = (etab && etab.adresseEtablissement) || {}

    const raisonSociale =
      (unite && (unite.denominationUniteLegale || unite.nomUniteLegale)) ||
      // Entreprise individuelle : reconstituer prénom + nom
      [unite?.prenomUsuelUniteLegale || unite?.prenom1UniteLegale, unite?.nomUniteLegale]
        .filter(Boolean)
        .join(' ')
        .trim() ||
      null
    const codePostal = adresse.codePostalEtablissement || adresse.codePostal || null
    const ville = adresse.libelleCommuneEtablissement || adresse.libelleCommune || null
    const activitePrincipale =
      etab?.activitePrincipaleUniteLegale ||
      etab?.activitePrincipale ||
      (unite && unite.activitePrincipaleUniteLegale) ||
      null
    const trancheEffectif = unite?.trancheEffectifsUniteLegale || unite?.trancheEffectifUniteLegale || null
    const anneeCreation = extractYear(
      unite?.dateCreationUniteLegale || etab?.dateCreationEtablissement || null,
    )

    return {
      siret: etab?.siret || String(siret).replace(/\D/g, ''),
      siren: etab?.siren || (unite && unite.siren) || null,
      raisonSociale,
      codePostal,
      ville,
      activitePrincipale,
      trancheEffectif,
      effectifLabel: mapEffectifToWorkforce(trancheEffectif),
      anneeCreation,
      raw: data,
      found: true,
    }
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return { siret: String(siret).replace(/\D/g, ''), found: false, status: 404 }
    }
    const error = new Error(err.message || 'SIRENE request failed')
    error.details = err.response ? err.response.data : undefined
    error.statusCode = err.response ? err.response.status : 500
    throw error
  }
}

/**
 * Get enterprise information by SIREN
 * @param {string} siren - The SIREN number (9 digits)
 * @returns {Promise<Object>} Enterprise data
 */
async function getEntrepriseBySiren(siren) {
  try {
    const url = `${SIRENE_BASE}/siren/${encodeURIComponent(String(siren))}`
    const data = await _fetch(url)

    // For SIREN endpoint the main object is likely 'uniteLegale'
    const unite = data.uniteLegale || data

    const raisonSociale = (unite && (unite.denominationUniteLegale || unite.nomUniteLegale)) || null
    const trancheEffectif = unite?.trancheEffectifsUniteLegale || unite?.trancheEffectifUniteLegale || null
    const anneeCreation = extractYear(unite?.dateCreationUniteLegale || null)

    return {
      siren: unite?.siren || String(siren).replace(/\D/g, ''),
      raisonSociale,
      trancheEffectif,
      effectifLabel: mapEffectifToWorkforce(trancheEffectif),
      anneeCreation,
      raw: data,
      found: true,
    }
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return { siren: String(siren).replace(/\D/g, ''), found: false, status: 404 }
    }
    const error = new Error(err.message || 'SIRENE request failed')
    error.details = err.response ? err.response.data : undefined
    error.statusCode = err.response ? err.response.status : 500
    throw error
  }
}

module.exports = {
  getEntrepriseBySiret,
  getEntrepriseBySiren,
  mapEffectifToWorkforce,
  extractYear,
}
