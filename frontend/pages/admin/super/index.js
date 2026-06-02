import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '../../../components/admin/AdminLayout'
import { Modal, Field } from '../../../components/admin/SuperShared'
import { adminFetch, readSession } from '../../../lib/adminApi'

const SECTEURS = ['', 'commerce', 'artisan', 'liberal', 'industrial', 'services']
const TAILLES = ['', 'TPE', 'PME']
const ROLES = [
  { value: 'conseiller', label: 'Conseiller' },
  { value: 'admin_local', label: 'Admin local (CCI)' },
  { value: 'admin_national', label: 'Super admin (national)' },
]

const TABS = [
  { key: 'ccis', label: 'CCI' },
  { key: 'questions', label: 'Questions' },
  { key: 'recommandations', label: 'Messages de recommandation' },
  { key: 'admins', label: 'Comptes admin' },
]

function useList(path) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setItems(await adminFetch(path))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [path])
  useEffect(() => { reload() }, [reload])
  return { items, loading, error, reload, setItems }
}

/* ----------------------------- CCI ----------------------------- */
function CcisSection() {
  const { items, loading, error, reload } = useList('/ccis')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ nom: '', code: '', region: '', estNational: false })
  const [msg, setMsg] = useState('')

  const openNew = () => { setForm({ nom: '', code: '', region: '', estNational: false }); setEditing('new') }
  const openEdit = (c) => { setForm({ nom: c.nom, code: c.code, region: c.region || '', estNational: c.estNational }); setEditing(c.id) }

  const save = async () => {
    setMsg('')
    try {
      if (editing === 'new') {
        await adminFetch('/ccis', { method: 'POST', body: JSON.stringify(form) })
      } else {
        await adminFetch(`/ccis/${editing}`, { method: 'PATCH', body: JSON.stringify(form) })
      }
      setEditing(null)
      reload()
    } catch (e) { setMsg(e.message) }
  }
  const remove = async (id) => {
    if (!window.confirm('Supprimer cette CCI ?')) return
    try { await adminFetch(`/ccis/${id}`, { method: 'DELETE' }); reload() }
    catch (e) { window.alert(e.message) }
  }

  return (
    <div>
      <div className="secHead">
        <h2>CCI ({items.length})</h2>
        <button type="button" className="addBtn" onClick={openNew}>+ Nouvelle CCI</button>
      </div>
      {loading ? <p className="state">Chargement…</p> : error ? <p className="state err">{error}</p> : (
        <table className="grid">
          <thead><tr><th>Nom</th><th>Code</th><th>Région</th><th>National</th><th></th></tr></thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.nom}</strong></td>
                <td>{c.code}</td>
                <td>{c.region || '—'}</td>
                <td>{c.estNational ? 'Oui' : '—'}</td>
                <td className="rowActions">
                  <button type="button" onClick={() => openEdit(c)}>Modifier</button>
                  <button type="button" className="danger" onClick={() => remove(c.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {editing ? (
        <Modal title={editing === 'new' ? 'Nouvelle CCI' : 'Modifier la CCI'} onClose={() => setEditing(null)}>
          <Field label="Nom"><input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} /></Field>
          <Field label="Code (ex: 33)"><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></Field>
          <Field label="Région"><input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} /></Field>
          <label className="chk"><input type="checkbox" checked={form.estNational} onChange={(e) => setForm({ ...form, estNational: e.target.checked })} /> Siège national</label>
          {msg ? <p className="formErr">{msg}</p> : null}
          <button type="button" className="saveBtn" onClick={save}>Enregistrer</button>
        </Modal>
      ) : null}
      <SectionStyles />
    </div>
  )
}

/* --------------------------- QUESTIONS --------------------------- */
function QuestionsSection() {
  const cats = useList('/categories')
  const { items, loading, error, reload } = useList('/questions')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [msg, setMsg] = useState('')

  const openNew = () => { setForm({ categorieId: cats.items[0]?.id || '', texte: '', secteur: '', taille: '', pointsMax: 100, ordre: 0, active: true }); setEditing('new') }
  const openEdit = (q) => { setForm({ categorieId: q.categorie_id, texte: q.texte, secteur: q.secteur || '', taille: q.taille || '', pointsMax: q.points_max, ordre: q.ordre, active: q.active }); setEditing(q.id) }

  const save = async () => {
    setMsg('')
    try {
      const body = JSON.stringify(form)
      if (editing === 'new') await adminFetch('/questions', { method: 'POST', body })
      else await adminFetch(`/questions/${editing}`, { method: 'PATCH', body })
      setEditing(null); reload()
    } catch (e) { setMsg(e.message) }
  }
  const remove = async (id) => {
    if (!window.confirm('Supprimer (ou désactiver) cette question ?')) return
    try { await adminFetch(`/questions/${id}`, { method: 'DELETE' }); reload() }
    catch (e) { window.alert(e.message) }
  }
  const addReponse = async (qId) => {
    const texte = window.prompt('Libellé de la réponse ?')
    if (!texte) return
    const points = Number(window.prompt('Points ?', '0')) || 0
    try { await adminFetch(`/questions/${qId}/reponses`, { method: 'POST', body: JSON.stringify({ texte, points }) }); reload() }
    catch (e) { window.alert(e.message) }
  }
  const editReponse = async (rep) => {
    const texte = window.prompt('Libellé ?', rep.texte)
    if (texte === null) return
    const points = Number(window.prompt('Points ?', String(rep.points))) || 0
    try { await adminFetch(`/reponses/${rep.id}`, { method: 'PATCH', body: JSON.stringify({ texte, points }) }); reload() }
    catch (e) { window.alert(e.message) }
  }
  const removeReponse = async (id) => {
    if (!window.confirm('Supprimer cette réponse ?')) return
    try { await adminFetch(`/reponses/${id}`, { method: 'DELETE' }); reload() }
    catch (e) { window.alert(e.message) }
  }

  return (
    <div>
      <div className="secHead">
        <h2>Questions ({items.length})</h2>
        <button type="button" className="addBtn" onClick={openNew}>+ Nouvelle question</button>
      </div>
      {loading ? <p className="state">Chargement…</p> : error ? <p className="state err">{error}</p> : (
        <div className="qCards">
          {items.map((q) => (
            <div className="qCard" key={q.id}>
              <div className="qTop">
                <div>
                  <span className="tag">{q.categorie?.nom || 'Catégorie'}</span>
                  {q.secteur ? <span className="tag tagAlt">{q.secteur}</span> : null}
                  {q.taille ? <span className="tag tagAlt">{q.taille}</span> : null}
                  {!q.active ? <span className="tag tagOff">Inactive</span> : null}
                </div>
                <div className="rowActions">
                  <button type="button" onClick={() => openEdit(q)}>Modifier</button>
                  <button type="button" onClick={() => addReponse(q.id)}>+ Réponse</button>
                  <button type="button" className="danger" onClick={() => remove(q.id)}>Suppr.</button>
                </div>
              </div>
              <p className="qTexte">{q.texte}</p>
              <ul className="repList">
                {(q.reponses_possibles || []).map((r) => (
                  <li key={r.id}>
                    <span>{r.texte} <em>({r.points} pts)</em></span>
                    <span className="repBtns">
                      <button type="button" onClick={() => editReponse(r)}>✎</button>
                      <button type="button" className="danger" onClick={() => removeReponse(r.id)}>✕</button>
                    </span>
                  </li>
                ))}
                {(q.reponses_possibles || []).length === 0 ? <li className="muted">Aucune réponse possible.</li> : null}
              </ul>
            </div>
          ))}
        </div>
      )}
      {editing ? (
        <Modal title={editing === 'new' ? 'Nouvelle question' : 'Modifier la question'} onClose={() => setEditing(null)}>
          <Field label="Catégorie">
            <select value={form.categorieId} onChange={(e) => setForm({ ...form, categorieId: e.target.value })}>
              {cats.items.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </Field>
          <Field label="Texte"><textarea value={form.texte} onChange={(e) => setForm({ ...form, texte: e.target.value })} /></Field>
          <Field label="Secteur (vide = tous)">
            <select value={form.secteur} onChange={(e) => setForm({ ...form, secteur: e.target.value })}>
              {SECTEURS.map((s) => <option key={s} value={s}>{s || 'Tous les secteurs'}</option>)}
            </select>
          </Field>
          <Field label="Taille (vide = TPE et PME)">
            <select value={form.taille} onChange={(e) => setForm({ ...form, taille: e.target.value })}>
              {TAILLES.map((t) => <option key={t} value={t}>{t || 'TPE et PME'}</option>)}
            </select>
          </Field>
          <Field label="Points max"><input type="number" value={form.pointsMax} onChange={(e) => setForm({ ...form, pointsMax: e.target.value })} /></Field>
          <Field label="Ordre"><input type="number" value={form.ordre} onChange={(e) => setForm({ ...form, ordre: e.target.value })} /></Field>
          <label className="chk"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label>
          {msg ? <p className="formErr">{msg}</p> : null}
          <button type="button" className="saveBtn" onClick={save}>Enregistrer</button>
        </Modal>
      ) : null}
      <SectionStyles />
    </div>
  )
}

/* ------------------------ RECOMMANDATIONS ------------------------ */
function RecommandationsSection() {
  const cats = useList('/categories')
  const { items, loading, error, reload } = useList('/recommandations')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [msg, setMsg] = useState('')

  const openNew = () => { setForm({ categorieId: '', secteur: '', taille: '', scoreMin: 0, scoreMax: 100, titre: '', message: '', orientation: '' }); setEditing('new') }
  const openEdit = (m) => { setForm({ categorieId: m.categorie_id || '', secteur: m.secteur || '', taille: m.taille || '', scoreMin: m.score_min, scoreMax: m.score_max, titre: m.titre || '', message: m.message, orientation: m.orientation || '' }); setEditing(m.id) }

  const save = async () => {
    setMsg('')
    try {
      const body = JSON.stringify(form)
      if (editing === 'new') await adminFetch('/recommandations', { method: 'POST', body })
      else await adminFetch(`/recommandations/${editing}`, { method: 'PATCH', body })
      setEditing(null); reload()
    } catch (e) { setMsg(e.message) }
  }
  const remove = async (id) => {
    if (!window.confirm('Supprimer ce message ?')) return
    try { await adminFetch(`/recommandations/${id}`, { method: 'DELETE' }); reload() }
    catch (e) { window.alert(e.message) }
  }

  return (
    <div>
      <div className="secHead">
        <h2>Messages de recommandation ({items.length})</h2>
        <button type="button" className="addBtn" onClick={openNew}>+ Nouveau message</button>
      </div>
      {loading ? <p className="state">Chargement…</p> : error ? <p className="state err">{error}</p> : (
        <div className="qCards">
          {items.map((m) => (
            <div className="qCard" key={m.id}>
              <div className="qTop">
                <div>
                  <span className="tag">{m.categorie?.nom || 'Score global'}</span>
                  <span className="tag tagAlt">{m.score_min}–{m.score_max}%</span>
                  {m.secteur ? <span className="tag tagAlt">{m.secteur}</span> : null}
                  {m.taille ? <span className="tag tagAlt">{m.taille}</span> : null}
                </div>
                <div className="rowActions">
                  <button type="button" onClick={() => openEdit(m)}>Modifier</button>
                  <button type="button" className="danger" onClick={() => remove(m.id)}>Suppr.</button>
                </div>
              </div>
              {m.titre ? <strong className="recoTitre">{m.titre}</strong> : null}
              <p className="qTexte">{m.message}</p>
              {m.orientation ? <p className="reco-or"><em>Orientation : {m.orientation}</em></p> : null}
            </div>
          ))}
        </div>
      )}
      {editing ? (
        <Modal title={editing === 'new' ? 'Nouveau message' : 'Modifier le message'} onClose={() => setEditing(null)}>
          <Field label="Catégorie (vide = score global)">
            <select value={form.categorieId} onChange={(e) => setForm({ ...form, categorieId: e.target.value })}>
              <option value="">Score global</option>
              {cats.items.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </Field>
          <div className="two">
            <Field label="Score min (%)"><input type="number" value={form.scoreMin} onChange={(e) => setForm({ ...form, scoreMin: e.target.value })} /></Field>
            <Field label="Score max (%)"><input type="number" value={form.scoreMax} onChange={(e) => setForm({ ...form, scoreMax: e.target.value })} /></Field>
          </div>
          <div className="two">
            <Field label="Secteur (vide = tous)">
              <select value={form.secteur} onChange={(e) => setForm({ ...form, secteur: e.target.value })}>
                {SECTEURS.map((s) => <option key={s} value={s}>{s || 'Tous'}</option>)}
              </select>
            </Field>
            <Field label="Taille (vide = toutes)">
              <select value={form.taille} onChange={(e) => setForm({ ...form, taille: e.target.value })}>
                {TAILLES.map((t) => <option key={t} value={t}>{t || 'Toutes'}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Titre"><input value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} /></Field>
          <Field label="Message"><textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></Field>
          <Field label="Orientation"><textarea value={form.orientation} onChange={(e) => setForm({ ...form, orientation: e.target.value })} /></Field>
          {msg ? <p className="formErr">{msg}</p> : null}
          <button type="button" className="saveBtn" onClick={save}>Enregistrer</button>
        </Modal>
      ) : null}
      <SectionStyles />
    </div>
  )
}

/* ---------------------------- ADMINS ---------------------------- */
function AdminsSection() {
  const ccis = useList('/ccis')
  const { items, loading, error, reload } = useList('/admins')
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ email: '', prenom: '', nom: '', role: 'admin_local', cciId: '' })
  const [msg, setMsg] = useState('')
  const [created, setCreated] = useState(null)

  const openNew = () => { setForm({ email: '', prenom: '', nom: '', role: 'admin_local', cciId: ccis.items[0]?.id || '' }); setCreated(null); setMsg(''); setCreating(true) }
  const save = async () => {
    setMsg('')
    try {
      const res = await adminFetch('/admins', { method: 'POST', body: JSON.stringify(form) })
      setCreated(res); reload()
    } catch (e) { setMsg(e.message) }
  }
  const toggle = async (a) => {
    try { await adminFetch(`/admins/${a.id}`, { method: 'PATCH', body: JSON.stringify({ actif: !a.actif }) }); reload() }
    catch (e) { window.alert(e.message) }
  }

  const roleLabel = (r) => ROLES.find((x) => x.value === r)?.label || r

  return (
    <div>
      <div className="secHead">
        <h2>Comptes admin ({items.length})</h2>
        <button type="button" className="addBtn" onClick={openNew}>+ Nouveau compte</button>
      </div>
      {loading ? <p className="state">Chargement…</p> : error ? <p className="state err">{error}</p> : (
        <table className="grid">
          <thead><tr><th>Email</th><th>Nom</th><th>Rôle</th><th>CCI</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td><strong>{a.email}</strong></td>
                <td>{[a.prenom, a.nom].filter(Boolean).join(' ') || '—'}</td>
                <td>{roleLabel(a.role)}</td>
                <td>{a.cci?.nom || '—'}</td>
                <td><span className={`badge ${a.actif ? 'on' : 'off'}`}>{a.actif ? 'Actif' : 'Inactif'}</span></td>
                <td className="rowActions">
                  <button type="button" onClick={() => toggle(a)}>{a.actif ? 'Désactiver' : 'Réactiver'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {creating ? (
        <Modal title="Nouveau compte admin" onClose={() => setCreating(false)}>
          {created ? (
            <div className="createdBox">
              <p>Compte créé : <strong>{created.email}</strong></p>
              <p>Mot de passe temporaire (à transmettre une seule fois) :</p>
              <code>{created.motDePasseTemporaire}</code>
              <button type="button" className="saveBtn" onClick={() => setCreating(false)}>Fermer</button>
            </div>
          ) : (
            <>
              <Field label="Email"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
              <div className="two">
                <Field label="Prénom"><input value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} /></Field>
                <Field label="Nom"><input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} /></Field>
              </div>
              <Field label="Rôle">
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </Field>
              {form.role !== 'admin_national' ? (
                <Field label="CCI">
                  <select value={form.cciId} onChange={(e) => setForm({ ...form, cciId: e.target.value })}>
                    <option value="">— Choisir —</option>
                    {ccis.items.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                </Field>
              ) : null}
              {msg ? <p className="formErr">{msg}</p> : null}
              <button type="button" className="saveBtn" onClick={save}>Créer le compte</button>
            </>
          )}
        </Modal>
      ) : null}
      <SectionStyles />
    </div>
  )
}

function SectionStyles() {
  return (
    <style jsx global>{`
      .secHead { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
      .secHead h2 { margin: 0; font-size: var(--fs-h3); color: #1d2030; }
      .addBtn { padding: 10px 18px; border: 0; border-radius: 9px; background: #2433d6; color: #fff; font-weight: 700; cursor: pointer; }
      .grid { width: 100%; border-collapse: collapse; background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 24px 50px -34px rgba(36,51,120,.5); }
      .grid th { text-align: left; font-size: var(--fs-xs); color: #8a8fa3; font-weight: 700; padding: 12px 16px; border-bottom: 1px solid #eef0f5; }
      .grid td { padding: 14px 16px; border-bottom: 1px solid #f1f2f6; font-size: var(--fs-sm); color: #353946; }
      .rowActions { display: flex; gap: 8px; justify-content: flex-end; }
      .rowActions button { border: 1px solid #e2e4ee; background: #fff; border-radius: 8px; padding: 7px 12px; font-size: var(--fs-xs); font-weight: 700; color: #4a4f63; cursor: pointer; }
      .rowActions button.danger { color: #c0392b; border-color: #f0d4cf; }
      .qCards { display: flex; flex-direction: column; gap: 16px; }
      .qCard { background: #fff; border-radius: 14px; padding: 18px 20px; box-shadow: 0 24px 50px -34px rgba(36,51,120,.5); }
      .qTop { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; margin-bottom: 10px; flex-wrap: wrap; }
      .tag { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #e4e9ff; color: #2433d6; font-size: var(--fs-xs); font-weight: 700; margin-right: 6px; }
      .tagAlt { background: #eef0f6; color: #5b6075; }
      .tagOff { background: #fdecea; color: #c0392b; }
      .qTexte { margin: 0; font-size: var(--fs-sm); color: #353946; }
      .recoTitre { display: block; margin-bottom: 4px; color: #1d2030; }
      .reco-or { margin: 8px 0 0; color: #6b7082; font-size: var(--fs-xs); }
      .repList { list-style: none; margin: 12px 0 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
      .repList li { display: flex; justify-content: space-between; align-items: center; font-size: var(--fs-xs); color: #555a6e; background: #f8f9fc; padding: 7px 12px; border-radius: 8px; }
      .repList li.muted { color: #9499ac; background: transparent; }
      .repBtns button { border: 0; background: transparent; cursor: pointer; color: #6b7082; font-size: 13px; margin-left: 8px; }
      .repBtns button.danger { color: #c0392b; }
      .state { color: #8a8fa3; padding: 24px 0; }
      .state.err { color: #b42318; }
      .chk { display: flex; align-items: center; gap: 8px; font-size: var(--fs-sm); color: #4a4f63; margin-bottom: 14px; }
      .two { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
      .saveBtn { width: 100%; padding: 12px; border: 0; border-radius: 9px; background: #3146f5; color: #fff; font-weight: 700; cursor: pointer; margin-top: 6px; }
      .formErr { color: #b42318; font-size: var(--fs-sm); margin: 0 0 12px; }
      .badge { padding: 4px 10px; border-radius: 999px; font-size: var(--fs-xs); font-weight: 700; }
      .badge.on { background: #e3f6ea; color: #1e7e44; }
      .badge.off { background: #fdecea; color: #c0392b; }
      .createdBox code { display: block; padding: 12px; background: #f4f5f9; border-radius: 8px; font-size: var(--fs-md); margin: 10px 0 18px; word-break: break-all; }
    `}</style>
  )
}

export default function SuperAdmin() {
  const router = useRouter()
  const [tab, setTab] = useState('ccis')
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const s = readSession()
    if (s && s.user?.role !== 'admin_national') {
      router.replace('/admin/questionnaires')
      return
    }
    setAllowed(true)
  }, [router])

  if (!allowed) return null

  return (
    <AdminLayout active="super">
      <h1 className="pageTitle">Super Admin - Gestion du site</h1>
      <p className="pageSub">Gérez les CCI, le questionnaire, les recommandations et les comptes administrateurs.</p>

      <div className="superTabs">
        {TABS.map((t) => (
          <button key={t.key} type="button" className={`stab ${tab === t.key ? 'stabActive' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      <div className="superBody">
        {tab === 'ccis' ? <CcisSection /> : null}
        {tab === 'questions' ? <QuestionsSection /> : null}
        {tab === 'recommandations' ? <RecommandationsSection /> : null}
        {tab === 'admins' ? <AdminsSection /> : null}
      </div>

      <style jsx>{`
        .pageTitle { margin: 0 0 6px; font-size: 30px; font-weight: 800; color: #1d2030; }
        .pageSub { margin: 0 0 24px; color: #6b7082; font-size: var(--fs-md); }
        .superTabs { display: flex; gap: 10px; margin-bottom: 26px; flex-wrap: wrap; }
        .stab { padding: 11px 20px; border: 0; border-radius: 999px; background: #eef0f6; color: #5b6075; font-weight: 700; font-size: var(--fs-sm); cursor: pointer; }
        .stabActive { background: #3146f5; color: #fff; box-shadow: 0 12px 22px -8px rgba(49,70,245,.6); }
      `}</style>
    </AdminLayout>
  )
}
