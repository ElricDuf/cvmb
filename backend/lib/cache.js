// Cache mémoire pour les diagnostics non encore persistés en base.
// Limité à 50 entrées (LRU manuel). Perdu au redémarrage du process —
// acceptable pour les diagnostics anonymes de courte durée.

const diagnosticCache = new Map()

function storeDiagnosticResult(result) {
  diagnosticCache.set(result.id, result)
  if (result?.uuid) diagnosticCache.set(result.uuid, result)

  if (diagnosticCache.size > 50) {
    const firstKey = diagnosticCache.keys().next().value
    if (firstKey) diagnosticCache.delete(firstKey)
  }
}

module.exports = { diagnosticCache, storeDiagnosticResult }
