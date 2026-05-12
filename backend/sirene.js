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

const SIRENE_BASE = process.env.SIRENE_API_BASE || 'https://api.insee.fr/entreprises/sirene/V3'

function _getAuthHeaders() {
  const key = process.env.SIRENE_API_KEY
  if (!key) {
    throw Object.assign(new Error('SIRENE_API_KEY not configured'), { statusCode: 500 })
  }
  return { Authorization: `Bearer ${key}` }
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

    const raisonSociale = (unite && (unite.denominationUniteLegale || unite.nomUniteLegale)) || null
    const codePostal = (etab && (etab.adresseEtablissement?.codePostalEtablissement || etab.adresseEtablissement?.codePostal)) || null
    const activitePrincipale = etab?.activitePrincipaleUniteLegale || etab?.activitePrincipale || (unite && unite.activitePrincipaleUniteLegale) || null
    const trancheEffectif = unite?.trancheEffectifsUniteLegale || unite?.trancheEffectifUniteLegale || null

    return {
      siret: etab?.siret || String(siret).replace(/\D/g, ''),
      siren: etab?.siren || (unite && unite.siren) || null,
      raisonSociale,
      codePostal,
      activitePrincipale,
      trancheEffectif,
      raw: data,
      found: true
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

    return {
      siren: unite?.siren || String(siren).replace(/\D/g, ''),
      raisonSociale,
      trancheEffectif,
      raw: data,
      found: true
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
}
