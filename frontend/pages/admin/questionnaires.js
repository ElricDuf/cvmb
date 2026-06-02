import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { ProgressBar } from '../../components/admin/Charts'
import { adminFetch, buildQuery, getToken, readSession } from '../../lib/adminApi'

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('fr-FR').format(d)
}

const STATUTS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'termine', label: 'Terminés' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'abandonne', label: 'Abandonnés' },
]

function ActionIcon({ type }) {
  const paths = {
    eye: (
      <>
        <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6z" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 11v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="8" r="1" fill="currentColor" />
      </>
    ),
    stats: (
      <>
        <path d="M6 19V11M12 19V6M18 19v-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="actIco">
      {paths[type]}
    </svg>
  )
}

export default function AdminQuestionnaires() {
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [statut, setStatut] = useState('')
  const [difficulteMin, setDifficulteMin] = useState('')
  const [difficulteMax, setDifficulteMax] = useState('')
  const [cciId, setCciId] = useState('')
  const [ccis, setCcis] = useState([])
  const [isNational, setIsNational] = useState(false)
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    const s = readSession()
    setIsNational(s?.user?.role === 'admin_national')
    if (s?.user?.role === 'admin_national') {
      adminFetch('/ccis').then(setCcis).catch(() => {})
    }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const query = buildQuery({
        page,
        pageSize: 10,
        search: appliedSearch,
        statut,
        difficulteMin,
        difficulteMax,
        cciId,
      })
      const data = await adminFetch(`/diagnostics${query}`)
      setRows(data.rows)
      setPagination(data.pagination)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, appliedSearch, statut, difficulteMin, difficulteMax, cciId])

  useEffect(() => {
    load()
  }, [load])

  const onSubmitSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setAppliedSearch(search.trim())
  }

  const applyFilters = () => {
    setPage(1)
    setShowFilters(false)
    load()
  }

  const exportCsv = () => {
    const token = getToken()
    const query = buildQuery({ search: appliedSearch, statut, difficulteMin, difficulteMax, cciId, token })
    window.open(`/api/admin/diagnostics/export${query}`, '_blank')
  }

  const start = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1
  const end = Math.min(pagination.page * pagination.pageSize, pagination.total)
  const pageNumbers = useMemo(() => {
    const total = pagination.totalPages
    const arr = []
    for (let i = 1; i <= Math.min(total, 3); i += 1) arr.push(i)
    return arr
  }, [pagination.totalPages])

  return (
    <AdminLayout active="questionnaires">
      <h1 className="pageTitle">Espace Gestionnaire - Tableau de Bord</h1>
      <p className="pageSub">Gérez et analysez les diagnostics des entreprises de votre territoire.</p>

      <section className="card">
        <div className="toolbar">
          <form className="searchWrap" onSubmit={onSubmitSearch}>
            <input
              type="search"
              placeholder="Rechercher une entreprise..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" aria-label="Rechercher">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
            </button>
          </form>
          <button type="button" className="filterBtn" onClick={() => setShowFilters((v) => !v)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            Filtrer
          </button>
          <button type="button" className="exportBtn" onClick={exportCsv}>Exporter</button>
        </div>

        {showFilters ? (
          <div className="filtersPanel">
            <label>
              Statut
              <select value={statut} onChange={(e) => setStatut(e.target.value)}>
                {STATUTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </label>
            <label>
              Difficulté min (%)
              <input type="number" min="0" max="100" value={difficulteMin} onChange={(e) => setDifficulteMin(e.target.value)} />
            </label>
            <label>
              Difficulté max (%)
              <input type="number" min="0" max="100" value={difficulteMax} onChange={(e) => setDifficulteMax(e.target.value)} />
            </label>
            {isNational ? (
              <label>
                CCI
                <select value={cciId} onChange={(e) => setCciId(e.target.value)}>
                  <option value="">Toutes les CCI</option>
                  {ccis.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </label>
            ) : null}
            <button type="button" className="applyBtn" onClick={applyFilters}>Appliquer</button>
          </div>
        ) : null}

        <div className="tableScroll">
          <table className="table">
            <thead>
              <tr>
                <th>ID / Projet</th>
                <th>Entrepreneur</th>
                <th>Email</th>
                <th>Difficulté</th>
                <th>Date</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="stateCell">Chargement…</td></tr>
              ) : error ? (
                <tr><td colSpan="6" className="stateCell error">{error}</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan="6" className="stateCell">Aucun diagnostic trouvé.</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong className="projet">{r.projet}</strong>
                      <span className="siret">{r.siret || '—'}</span>
                    </td>
                    <td>{r.entrepreneur}</td>
                    <td className="muted">{r.email || '—'}</td>
                    <td>{r.difficulte === null ? <span className="muted">N/A</span> : <ProgressBar value={r.difficulte} />}</td>
                    <td className="muted">{formatDate(r.date)}</td>
                    <td>
                      <div className="actions">
                        <button type="button" onClick={() => setDetail(r)} aria-label="Voir"><ActionIcon type="eye" /></button>
                        <button type="button" onClick={() => setDetail(r)} aria-label="Détails"><ActionIcon type="info" /></button>
                        <a href={`/admin/statistiques`} aria-label="Statistiques"><ActionIcon type="stats" /></a>
                        <span className={`rdv ${r.hasRendezVous ? 'rdvOn' : ''}`}>RDV</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pager">
          <span>Affichage de {start} à {end} sur {pagination.total} diagnostics</span>
          <div className="pageBtns">
            <button type="button" disabled={pagination.page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹</button>
            {pageNumbers.map((n) => (
              <button key={n} type="button" className={n === pagination.page ? 'pageActive' : ''} onClick={() => setPage(n)}>{n}</button>
            ))}
            {pagination.totalPages > 3 ? <span className="ellipsis">…</span> : null}
            <button type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}>›</button>
          </div>
        </div>
      </section>

      {detail ? (
        <div className="overlay" role="dialog" aria-modal="true" onClick={() => setDetail(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modalClose" onClick={() => setDetail(null)} aria-label="Fermer">×</button>
            <h3>{detail.projet}</h3>
            <dl>
              <div><dt>Entrepreneur</dt><dd>{detail.entrepreneur}</dd></div>
              <div><dt>Email</dt><dd>{detail.email || '—'}</dd></div>
              <div><dt>SIRET</dt><dd>{detail.siret || '—'}</dd></div>
              <div><dt>Statut</dt><dd>{detail.statut}</dd></div>
              <div><dt>Niveau</dt><dd>{detail.niveauDifficulte || '—'}</dd></div>
              <div><dt>Difficulté</dt><dd>{detail.difficulte === null ? 'N/A' : `${detail.difficulte} %`}</dd></div>
              <div><dt>CCI</dt><dd>{detail.cci?.nom || '—'}</dd></div>
              <div><dt>Compte</dt><dd>{detail.avecLogin ? 'Avec login' : 'Sans login'}</dd></div>
              <div><dt>Rendez-vous</dt><dd>{detail.hasRendezVous ? 'Oui' : 'Non'}</dd></div>
              <div><dt>Date</dt><dd>{formatDate(detail.date)}</dd></div>
            </dl>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .pageTitle { margin: 0 0 6px; font-size: 30px; font-weight: 800; color: #1d2030; }
        .pageSub { margin: 0 0 26px; color: #6b7082; font-size: var(--fs-md); }
        .card { background: #fff; border-radius: 18px; box-shadow: 0 24px 50px -34px rgba(36, 51, 120, 0.5); padding: 22px 24px; }
        .toolbar { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
        .searchWrap { display: flex; align-items: center; flex: 1; min-width: 240px; background: #f4f5f9; border-radius: 10px; padding: 0 12px; }
        .searchWrap input { flex: 1; border: 0; background: transparent; outline: none; padding: 12px 8px; font-size: var(--fs-sm); }
        .searchWrap button { border: 0; background: transparent; color: #9499ac; cursor: pointer; }
        .searchWrap svg, .filterBtn svg { width: 18px; height: 18px; }
        .filterBtn { display: inline-flex; align-items: center; gap: 8px; padding: 11px 18px; border: 0; border-radius: 10px; background: #eef0f6; color: #4a4f63; font-weight: 600; cursor: pointer; }
        .exportBtn { margin-left: auto; padding: 12px 26px; border: 0; border-radius: 10px; background: #2433d6; color: #fff; font-weight: 700; cursor: pointer; }
        .filtersPanel { display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-end; margin-top: 16px; padding: 16px; background: #f8f9fc; border-radius: 12px; }
        .filtersPanel label { display: flex; flex-direction: column; gap: 6px; font-size: var(--fs-xs); font-weight: 700; color: #5b6075; }
        .filtersPanel input, .filtersPanel select { padding: 9px 10px; border: 1px solid #e0e2ec; border-radius: 8px; font-size: var(--fs-sm); min-width: 120px; }
        .applyBtn { padding: 10px 20px; border: 0; border-radius: 8px; background: #3146f5; color: #fff; font-weight: 700; cursor: pointer; }
        .tableScroll { overflow-x: auto; margin-top: 18px; }
        .table { width: 100%; border-collapse: collapse; }
        .table th { text-align: left; font-size: var(--fs-xs); text-transform: none; color: #8a8fa3; font-weight: 700; padding: 10px 14px; border-bottom: 1px solid #eef0f5; }
        .table th.right, .actions { text-align: right; }
        .table td { padding: 16px 14px; border-bottom: 1px solid #f1f2f6; font-size: var(--fs-sm); color: #353946; vertical-align: middle; }
        .projet { display: block; color: #20232f; }
        .siret { font-size: var(--fs-xs); color: #b4b8c6; letter-spacing: 0.02em; }
        .muted { color: #8a8fa3; }
        .actions { display: flex; gap: 8px; justify-content: flex-end; align-items: center; }
        .actions button, .actions a { display: grid; place-items: center; width: 32px; height: 32px; border: 0; border-radius: 50%; background: #f1f2f7; color: #5b6075; cursor: pointer; }
        :global(.actIco) { width: 16px; height: 16px; }
        .rdv { padding: 6px 12px; border-radius: 999px; background: #eceef4; color: #9499ac; font-size: var(--fs-xs); font-weight: 800; }
        .rdvOn { background: #e4e9ff; color: #2433d6; }
        .stateCell { text-align: center; padding: 40px; color: #8a8fa3; }
        .stateCell.error { color: #b42318; }
        .pager { display: flex; justify-content: space-between; align-items: center; margin-top: 18px; font-size: var(--fs-sm); color: #6b7082; flex-wrap: wrap; gap: 12px; }
        .pageBtns { display: flex; gap: 6px; align-items: center; }
        .pageBtns button { min-width: 34px; height: 34px; border: 1px solid #e6e8f0; border-radius: 8px; background: #fff; color: #4a4f63; cursor: pointer; }
        .pageBtns button:disabled { opacity: 0.4; cursor: default; }
        .pageActive { background: #2433d6 !important; color: #fff !important; border-color: #2433d6 !important; }
        .ellipsis { color: #9499ac; }
        .overlay { position: fixed; inset: 0; background: rgba(20, 24, 45, 0.45); display: grid; place-items: center; padding: 20px; z-index: 50; }
        .modal { position: relative; background: #fff; border-radius: 16px; padding: 28px; width: min(440px, 100%); box-shadow: 0 30px 60px rgba(20, 24, 45, 0.3); }
        .modal h3 { margin: 0 0 18px; font-size: var(--fs-h3); color: #1d2030; }
        .modalClose { position: absolute; top: 14px; right: 16px; border: 0; background: transparent; font-size: 26px; line-height: 1; color: #9499ac; cursor: pointer; }
        .modal dl { margin: 0; display: grid; gap: 10px; }
        .modal dl > div { display: flex; justify-content: space-between; gap: 16px; border-bottom: 1px solid #f1f2f6; padding-bottom: 8px; }
        .modal dt { color: #8a8fa3; font-size: var(--fs-sm); }
        .modal dd { margin: 0; font-weight: 600; color: #353946; font-size: var(--fs-sm); text-align: right; }
      `}</style>
    </AdminLayout>
  )
}
