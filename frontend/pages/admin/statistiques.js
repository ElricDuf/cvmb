import { useCallback, useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { PieChart, BarHistogram } from '../../components/admin/Charts'
import { adminFetch, buildQuery, readSession } from '../../lib/adminApi'

const TABS = [
  { key: 'general', label: 'Général' },
  { key: 'abandons', label: 'Abandons' },
  { key: 'scores', label: 'Répartition des scores' },
  { key: 'reponses', label: 'Réponses aux questions' },
]

export default function AdminStatistiques() {
  const [tab, setTab] = useState('general')
  const [from, setFrom] = useState('2023-01-01')
  const [to, setTo] = useState('2024-05-28')
  const [region, setRegion] = useState('')
  const [cciId, setCciId] = useState('')
  const [regions, setRegions] = useState([])
  const [ccis, setCcis] = useState([])
  const [isNational, setIsNational] = useState(false)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const s = readSession()
    const national = s?.user?.role === 'admin_national'
    setIsNational(national)
    if (national) {
      adminFetch('/regions').then(setRegions).catch(() => {})
      adminFetch('/ccis').then(setCcis).catch(() => {})
    }
  }, [])

  const compute = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const query = buildQuery({ from, to, region, cciId })
      const data = await adminFetch(`/stats${query}`)
      setStats(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [from, to, region, cciId])

  useEffect(() => {
    compute()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AdminLayout active="statistiques">
      <h1 className="pageTitle">Espace Gestionnaire - Statistiques</h1>
      <p className="pageSub">Consultez les indicateurs de performance et d’utilisation de la plateforme.</p>

      <section className="filterBar">
        <label className="fld">
          <span>Période</span>
          <div className="dateRange">
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <span className="au">Au</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </label>
        <label className="fld">
          <span>Région</span>
          <select value={region} onChange={(e) => setRegion(e.target.value)} disabled={!isNational}>
            <option value="">Toutes les régions</option>
            {regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <label className="fld">
          <span>CCI</span>
          <select value={cciId} onChange={(e) => setCciId(e.target.value)} disabled={!isNational}>
            <option value="">Toutes les CCI</option>
            {ccis.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
        </label>
        <button type="button" className="computeBtn" onClick={compute}>Calcul statistiques</button>
      </section>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.key} type="button" className={`tab ${tab === t.key ? 'tabActive' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="state">Calcul en cours…</p>
      ) : error ? (
        <p className="state error">{error}</p>
      ) : !stats ? (
        <p className="state">Aucune donnée.</p>
      ) : (
        <>
          {tab === 'general' ? (
            <div className="cardGrid">
              <div className="panel">
                <h3 className="panelTitle">Part de questionnaires AVEC et SANS login</h3>
                <PieChart
                  data={[
                    { label: 'Questionnaires AVEC login', value: stats.general.avecLogin, color: '#9d8df1' },
                    { label: 'Questionnaires SANS login', value: stats.general.sansLogin, color: '#4ec3e0' },
                  ]}
                />
              </div>
              <div className="panel">
                <h3 className="panelTitle">Envoi Mail</h3>
                <PieChart
                  data={[
                    { label: 'Ayant demandé un envoi mail - SANS LOGIN', value: stats.envoiMail.demandeSansLogin, color: '#9d8df1' },
                    { label: 'Ayant demandé un envoi mail - AVEC LOGIN', value: stats.envoiMail.demandeAvecLogin, color: '#4ec3e0' },
                    { label: 'N’ayant pas demandé un envoi mail', value: stats.envoiMail.sansDemande, color: '#a8d92e' },
                  ]}
                />
              </div>
            </div>
          ) : null}

          {tab === 'abandons' ? (
            <div className="panel">
              <div className="kpis">
                <div className="kpi"><strong>{stats.abandons.statuts.termine}</strong><span>Terminés</span></div>
                <div className="kpi"><strong>{stats.abandons.statuts.en_cours}</strong><span>En cours</span></div>
                <div className="kpi"><strong>{stats.abandons.statuts.abandonne}</strong><span>Abandonnés</span></div>
                <div className="kpi"><strong>{stats.abandons.tauxAbandon}%</strong><span>Taux d’abandon</span></div>
              </div>
              <h3 className="panelTitle">Abandons par étape</h3>
              {stats.abandons.parEtape.length === 0 ? (
                <p className="state">Aucun abandon sur la période.</p>
              ) : (
                <BarHistogram data={stats.abandons.parEtape} color="#e67e22" />
              )}
            </div>
          ) : null}

          {tab === 'scores' ? (
            <div className="panel">
              <h3 className="panelTitle">Répartition des scores (diagnostics terminés)</h3>
              <BarHistogram data={stats.repartitionScores} color="#3146f5" />
            </div>
          ) : null}

          {tab === 'reponses' ? (
            <div className="panel">
              <h3 className="panelTitle">Réponses aux questions</h3>
              {stats.reponsesQuestions.length === 0 ? (
                <p className="state">Aucune réponse enregistrée sur la période.</p>
              ) : (
                <div className="qList">
                  {stats.reponsesQuestions.map((q) => (
                    <div className="qItem" key={q.questionId}>
                      <div className="qHead">
                        <span className="qCat">{q.categorie || 'Catégorie'}</span>
                        <span className="qMeta">{q.totalReponses} réponses · moy. {q.moyennePoints} pts</span>
                      </div>
                      <p className="qText">{q.texte}</p>
                      <ul className="qDist">
                        {q.distribution.map((d, i) => {
                          const pct = q.totalReponses ? Math.round((d.count / q.totalReponses) * 100) : 0
                          return (
                            <li key={i}>
                              <span className="qLabel">{d.label}</span>
                              <span className="qBarTrack"><span className="qBarFill" style={{ width: `${pct}%` }} /></span>
                              <span className="qCount">{d.count} ({pct}%)</span>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </>
      )}

      <style jsx>{`
        .pageTitle { margin: 0 0 6px; font-size: 30px; font-weight: 800; color: #1d2030; }
        .pageSub { margin: 0 0 22px; color: #6b7082; font-size: var(--fs-md); }
        .filterBar { display: flex; gap: 20px; align-items: flex-end; flex-wrap: wrap; background: #fff; border-radius: 16px; padding: 20px 24px; box-shadow: 0 24px 50px -34px rgba(36, 51, 120, 0.5); }
        .fld { display: flex; flex-direction: column; gap: 8px; font-size: var(--fs-xs); font-weight: 700; color: #5b6075; }
        .dateRange { display: flex; align-items: center; gap: 10px; }
        .au { color: #9499ac; font-weight: 600; }
        .filterBar input, .filterBar select { padding: 11px 12px; border: 1px solid #e4e6ef; border-radius: 9px; font-size: var(--fs-sm); background: #fbfbfd; }
        .filterBar select { min-width: 170px; }
        .filterBar select:disabled { background: #f1f2f6; color: #9499ac; cursor: not-allowed; }
        .computeBtn { margin-left: auto; padding: 13px 26px; border: 0; border-radius: 10px; background: #2433d6; color: #fff; font-weight: 700; cursor: pointer; }
        .tabs { display: flex; gap: 10px; margin: 24px 0; flex-wrap: wrap; }
        .tab { padding: 11px 22px; border: 0; border-radius: 999px; background: #eef0f6; color: #5b6075; font-weight: 700; font-size: var(--fs-sm); cursor: pointer; }
        .tabActive { background: #3146f5; color: #fff; box-shadow: 0 12px 22px -8px rgba(49, 70, 245, 0.6); }
        .cardGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .panel { background: #fff; border-radius: 18px; padding: 26px; box-shadow: 0 24px 50px -34px rgba(36, 51, 120, 0.5); }
        .panelTitle { margin: 0 0 18px; text-align: center; font-size: var(--fs-md); font-weight: 800; color: #2b2f45; }
        .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 26px; }
        .kpi { background: #f7f8fc; border-radius: 12px; padding: 18px; text-align: center; }
        .kpi strong { display: block; font-size: 26px; color: #2433d6; }
        .kpi span { font-size: var(--fs-xs); color: #6b7082; }
        .state { color: #8a8fa3; padding: 30px 0; text-align: center; }
        .state.error { color: #b42318; }
        .qList { display: flex; flex-direction: column; gap: 18px; }
        .qItem { border: 1px solid #eef0f5; border-radius: 12px; padding: 16px 18px; }
        .qHead { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 6px; }
        .qCat { font-size: var(--fs-xs); font-weight: 800; color: #3146f5; text-transform: uppercase; letter-spacing: 0.03em; }
        .qMeta { font-size: var(--fs-xs); color: #9499ac; }
        .qText { margin: 0 0 12px; font-size: var(--fs-sm); color: #353946; font-weight: 600; }
        .qDist { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
        .qDist li { display: grid; grid-template-columns: minmax(120px, 1.4fr) 2fr auto; align-items: center; gap: 12px; font-size: var(--fs-xs); color: #555a6e; }
        .qBarTrack { height: 8px; border-radius: 999px; background: #eceef4; overflow: hidden; }
        .qBarFill { display: block; height: 100%; background: #4ec3e0; border-radius: 999px; }
        .qCount { white-space: nowrap; color: #6b7082; font-weight: 700; }
        @media (max-width: 820px) {
          .cardGrid { grid-template-columns: 1fr; }
          .kpis { grid-template-columns: 1fr 1fr; }
          .computeBtn { margin-left: 0; }
        }
      `}</style>
    </AdminLayout>
  )
}
