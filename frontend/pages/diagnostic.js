import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/layout/Layout'

const sectorLabels = {
  commerce: 'Commerce',
  artisan: 'Artisanat',
  liberal: 'Professions liberales',
  industrial: 'Industrie',
  services: 'Services',
}

const sizeLabels = {
  TPE: 'TPE',
  PME: 'PME',
}

const storageKey = 'cvmb:lastDiagnostic'

function RadarChart({ categories }) {
  const cx = 200
  const cy = 190
  const maxR = 130
  const n = categories.length

  if (n < 3) return null

  const angle = (i) => (2 * Math.PI * i) / n - Math.PI / 2

  const polarToCart = (i, pct) => {
    const r = (pct / 100) * maxR
    return [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))]
  }

  const gridLevels = [25, 50, 75, 100]

  const gridPolygon = (pct) =>
    categories.map((_, i) => polarToCart(i, pct).join(',')).join(' ')

  const dataPolygon = categories
    .map((cat, i) => polarToCart(i, cat.percentage).join(','))
    .join(' ')

  const toneColor = (tone) => {
    if (tone === 'red') return '#ef4444'
    if (tone === 'orange') return '#f97316'
    if (tone === 'green') return '#16a34a'
    return '#3146f5'
  }

  return (
    <svg
      viewBox="0 0 400 380"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Graphique radar des scores par catégorie"
      style={{ width: '100%', maxWidth: 400, display: 'block', margin: '0 auto' }}
    >
      {/* Grille de fond */}
      {gridLevels.map((pct) => (
        <polygon
          key={pct}
          points={gridPolygon(pct)}
          fill={pct === 100 ? 'rgba(49,70,245,0.04)' : 'none'}
          stroke={pct === 100 ? 'rgba(49,70,245,0.2)' : 'rgba(49,70,245,0.1)'}
          strokeWidth="1"
        />
      ))}

      {/* Axes */}
      {categories.map((_, i) => {
        const [ex, ey] = polarToCart(i, 100)
        return (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={ex} y2={ey}
            stroke="rgba(49,70,245,0.15)"
            strokeWidth="1"
          />
        )
      })}

      {/* Marques de valeurs sur les axes (25/50/75/100) */}
      {categories.map((_, i) =>
        [25, 50, 75, 100].map((pct) => {
          const [mx, my] = polarToCart(i, pct)
          return (
            <circle key={`${i}-${pct}`} cx={mx} cy={my} r="2" fill="rgba(49,70,245,0.2)" />
          )
        })
      )}

      {/* Polygone de données */}
      <polygon
        points={dataPolygon}
        fill="rgba(49,70,245,0.15)"
        stroke="#3146f5"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Points de données */}
      {categories.map((cat, i) => {
        const [px, py] = polarToCart(i, cat.percentage)
        return (
          <circle
            key={cat.id}
            cx={px} cy={py}
            r="5"
            fill={toneColor(cat.tone)}
            stroke="#fff"
            strokeWidth="2"
          />
        )
      })}

      {/* Labels */}
      {categories.map((cat, i) => {
        const labelR = maxR + 28
        const [lx, ly] = [
          cx + labelR * Math.cos(angle(i)),
          cy + labelR * Math.sin(angle(i)),
        ]
        const anchor =
          Math.abs(Math.cos(angle(i))) < 0.1
            ? 'middle'
            : Math.cos(angle(i)) > 0
            ? 'start'
            : 'end'
        return (
          <g key={cat.id}>
            <text
              x={lx}
              y={ly - 4}
              textAnchor={anchor}
              fontSize="11"
              fontWeight="600"
              fill="#20232b"
            >
              {cat.nom}
            </text>
            <text
              x={lx}
              y={ly + 10}
              textAnchor={anchor}
              fontSize="11"
              fontWeight="700"
              fill={toneColor(cat.tone)}
            >
              {cat.percentage}%
            </text>
          </g>
        )
      })}

      {/* Score central */}
      <text
        x={cx} y={cy - 6}
        textAnchor="middle"
        fontSize="22"
        fontWeight="800"
        fill="#3146f5"
      >
        {Math.round(categories.reduce((sum, c) => sum + c.percentage, 0) / n)}%
      </text>
      <text
        x={cx} y={cy + 10}
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fill="#82859a"
        letterSpacing="0.08em"
      >
        MAÎTRISE
      </text>
    </svg>
  )
}

function getBadgeClass(tone) {
  if (tone === 'red') return 'red'
  if (tone === 'orange') return 'orange'
  if (tone === 'blue') return 'blue'
  return 'green'
}

export default function DiagnosticPage() {
  const router = useRouter()
  const [diagnostic, setDiagnostic] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [accountSaveState, setAccountSaveState] = useState('idle')
  const [accountSaveError, setAccountSaveError] = useState('')

  const diagnosticId = useMemo(() => {
    const value = router.query.diagnosticId
    return Array.isArray(value) ? value[0] : value
  }, [router.query.diagnosticId])

  useEffect(() => {
    if (!router.isReady) {
      return
    }

    let cancelled = false

    async function loadDiagnostic() {
      setLoading(true)
      setError('')

      try {
        const cachedValue = window.localStorage.getItem(storageKey)
        const cachedDiagnostic = cachedValue ? JSON.parse(cachedValue) : null

        if (cachedDiagnostic && (!diagnosticId || cachedDiagnostic.id === diagnosticId)) {
          if (!cancelled) {
            setDiagnostic(cachedDiagnostic)
            setLoading(false)
          }
          return
        }

        if (!diagnosticId) {
          if (!cancelled) {
            if (cachedDiagnostic) {
              setDiagnostic(cachedDiagnostic)
            } else {
              setError('Aucun diagnostic récent n’est disponible. Lancez le questionnaire pour générer des résultats.')
            }
            setLoading(false)
          }
          return
        }

        const response = await fetch(`/api/diagnostics/${encodeURIComponent(diagnosticId)}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Impossible de charger le diagnostic calculé.')
        }

        if (!cancelled) {
          setDiagnostic(data)
          window.localStorage.setItem(storageKey, JSON.stringify(data))
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError.message || 'Impossible de charger le diagnostic calculé.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadDiagnostic()

    return () => {
      cancelled = true
    }
  }, [router.isReady, diagnosticId])

  useEffect(() => {
    if (typeof window === 'undefined' || !router.isReady || !diagnostic) {
      return
    }

    const savedSession = window.localStorage.getItem('cvmb:session')

    if (!savedSession) {
      setAccountSaveState('idle')
      setAccountSaveError('')
      return
    }

    let parsedSession = null

    try {
      parsedSession = JSON.parse(savedSession)
    } catch {
      setAccountSaveState('error')
      return
    }

    const userId = parsedSession?.user?.id

    if (!userId) {
      setAccountSaveState('error')
      return
    }

    const sourceDiagnosticId = String(diagnosticId || diagnostic.id || '').trim()

    if (!sourceDiagnosticId) {
      setAccountSaveState('error')
      return
    }

    const alreadyPersistedId = Number(diagnostic.id)
    const isPersistedId = Number.isInteger(alreadyPersistedId) && alreadyPersistedId > 0
    const saveMarkerKey = `cvmb:diagnosticSaved:${userId}:${sourceDiagnosticId}`

    if (isPersistedId || window.localStorage.getItem(saveMarkerKey) === '1') {
      setAccountSaveState('saved')
      setAccountSaveError('')
      return
    }

    let cancelled = false

    async function persistDiagnosticToAccount() {
      try {
        setAccountSaveState('saving')
        setAccountSaveError('')

        let questionnaireContext = null

        try {
          questionnaireContext = JSON.parse(window.localStorage.getItem('cvmb:questionnaireContext') || 'null')
        } catch {
          questionnaireContext = null
        }

        const response = await fetch(`/api/diagnostics/${encodeURIComponent(sourceDiagnosticId)}/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            entrepriseId: parsedSession?.entreprise?.id || parsedSession?.enterprise?.id || null,
            siret: questionnaireContext?.siret || parsedSession?.entreprise?.siret || parsedSession?.enterprise?.siret || null,
            diagnostic,
          }),
        })

        const rawBody = await response.text()
        let data = null

        try {
          data = rawBody ? JSON.parse(rawBody) : null
        } catch {
          data = null
        }

        if (!response.ok || !data?.saved) {
          if (!cancelled) {
            const fallbackError = response.status === 404
              ? 'Endpoint de sauvegarde introuvable. Redémarrez le backend.'
              : `Erreur HTTP ${response.status}${response.statusText ? ` (${response.statusText})` : ''}.`

            setAccountSaveState('error')
            setAccountSaveError(data?.error || fallbackError)
          }
          return
        }

        if (cancelled) {
          return
        }

        const nextDiagnostic = data?.diagnostic || diagnostic

        window.localStorage.setItem(saveMarkerKey, '1')
        window.localStorage.setItem(storageKey, JSON.stringify(nextDiagnostic))

        if (nextDiagnostic?.id) {
          window.localStorage.setItem('cvmb:lastDiagnosticId', String(nextDiagnostic.id))
          window.localStorage.setItem(`cvmb:diagnosticSaved:${userId}:${nextDiagnostic.id}`, '1')
        }

        setDiagnostic(nextDiagnostic)
        setAccountSaveState('saved')
        setAccountSaveError('')
      } catch {
        if (!cancelled) {
          setAccountSaveState('error')
          setAccountSaveError('Erreur réseau ou serveur indisponible.')
        }
        return
      }
    }

    persistDiagnosticToAccount()

    return () => {
      cancelled = true
    }
  }, [router.isReady, diagnostic, diagnosticId])

  const globalDifficulty = diagnostic?.global?.difficultyPercentage ?? 0
  const globalTone = diagnostic?.global?.tone || 'red'
  const globalScore = diagnostic?.global?.percentage ?? 0
  const ringStyle = {
    background: `conic-gradient(${globalTone === 'blue' ? '#2563eb' : globalTone === 'green' ? '#16a34a' : globalTone === 'orange' ? '#f97316' : '#ef4444'} ${globalDifficulty}%, #f1f5f9 0)`,
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Diagnostic envoyé (simulation)')
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="stateCard">
          <p>Chargement du diagnostic...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="stateCard errorCard">
          <p>{error}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
            <Link className="primaryButton large" href="/questionnaire">
              Reprendre le questionnaire
            </Link>
            <Link className="primaryButton large secondary" href="/evaluate">
              Modifier la sélection
            </Link>
          </div>
        </div>
      )
    }

    if (!diagnostic) {
      return (
        <div className="stateCard errorCard">
          <p>Aucun résultat à afficher.</p>
          <Link className="primaryButton large" href="/evaluate">
            Commencer un diagnostic
          </Link>
        </div>
      )
    }

    return (
      <>
        <div className="topCards">
          <article className="card fragility">
            <div className="scoreRing" style={ringStyle}>
              <div className="percent">
                {globalDifficulty}%
                <span>DIFFICULTÉ</span>
              </div>
            </div>
            <div className="cardBody">
              <h2>{diagnostic.global?.title || 'Diagnostic calculé'}</h2>
              <p>{diagnostic.global?.description || 'Résultats calculés à partir des réponses du questionnaire.'}</p>
            </div>
          </article>

          <article className="card radar">
            <h2>Répartition des scores</h2>
            {(diagnostic.categories || []).length >= 3 ? (
              <RadarChart categories={diagnostic.categories} />
            ) : (
              <p style={{ color: '#5e6274', marginTop: 12 }}>Données insuffisantes pour afficher le radar.</p>
            )}
          </article>
        </div>

        <section className="globalAnalysis card big">
          <div className="scoreCircle">{globalScore}%</div>
          <div className="analysisBody">
            <h3>Analyse Globale</h3>
            <p>
              Score global de {diagnostic.global?.score ?? 0} / {diagnostic.global?.scoreMax ?? 0} points, soit {globalScore}% de maîtrise.
            </p>
            <p>{diagnostic.global?.description || 'Les réponses renseignées permettent de produire un diagnostic cohérent.'}</p>
            {diagnostic.global?.advice ? <p className="adviceText">Conseil personnalisé: {diagnostic.global.advice}</p> : null}
            {(diagnostic?.filters?.size || diagnostic?.filters?.sector) ? (
              <div className="contextChips" aria-label="Contexte du diagnostic">
                {diagnostic?.filters?.size ? <span className="contextChip">Taille: {sizeLabels[diagnostic.filters.size] || diagnostic.filters.size}</span> : null}
                {diagnostic?.filters?.sector ? <span className="contextChip">Secteur: {sectorLabels[diagnostic.filters.sector] || diagnostic.filters.sector}</span> : null}
              </div>
            ) : null}
          </div>
        </section>

        <section className="pillarsGrid">
          {(diagnostic.categories || []).map((category) => (
            <article className="pillar" key={category.id}>
              <header className="pillarHeader">
                <h4>Partie {category.ordre} : {category.nom}</h4>
                <span className={`badge ${getBadgeClass(category.tone)}`}>Difficulté : {category.difficultyPercentage}%</span>
              </header>
              <p>{category.description}</p>
              {category.advice ? <p className="categoryAdvice">Conseil: {category.advice}</p> : null}
              <div className="pillarMeta">
                <span>{category.score} / {category.scoreMax} points</span>
                <span>{category.percentage}% de maîtrise</span>
              </div>
            </article>
          ))}
        </section>
      </>
    )
  }

  return (
    <Layout>
      <section className="diagnosticPage">
        <header className="hero">
          <h1>Diagnostic</h1>
          <p className="subtitle">Résultats calculés à partir des réponses de votre questionnaire.</p>
          {accountSaveState === 'saving' ? <p className="accountSaveInfo saving">Enregistrement du diagnostic dans votre compte...</p> : null}
          {accountSaveState === 'saved' ? <p className="accountSaveInfo saved">Diagnostic enregistré dans votre compte.</p> : null}
          {accountSaveState === 'error' ? (
            <p className="accountSaveInfo error">
              Impossible d’enregistrer automatiquement ce diagnostic dans votre compte.
              {accountSaveError ? ` ${accountSaveError}` : ''}
            </p>
          ) : null}
        </header>

        {renderContent()}

        <section className="emailForm card">
          <h3>Recevoir mon diagnostic par mail</h3>
          <p>Veuillez remplir les champs suivants pour recevoir votre diagnostic sous forme de PDF.</p>
          <form onSubmit={handleSubmit} className="contactForm">
            <label>
              Nom, Prénom
              <input type="text" name="name" required />
            </label>
            <label>
              Email
              <input type="email" name="email" required />
            </label>
            <button type="submit" className="primaryButton">Envoyer</button>
          </form>
        </section>

        <div className="ctaWrap">
          <Link className="primaryButton large" href="/accompagnement">
            Prendre un rendez-vous avec un conseiller
          </Link>
        </div>

        <style jsx global>{`
          .diagnosticPage {
            --primary: #3146f5;
            --primary-hover: #2638cc;
            --text-main: #1e293b;
            --text-muted: #64748b;
            --bg-card: #ffffff;
            --bg-page: #f8fafc;
            --border-color: #e2e8f0;
            --radius-card: 16px;
            --shadow-sm: 0 4px 6px -1px rgb(0 0 0 / 0.05);
            --shadow-md: 0 10px 25px -5px rgb(0 0 0 / 0.08);
            --shadow-hover: 0 20px 25px -5px rgb(0 0 0 / 0.1);

            max-width: 1180px;
            margin: 40px auto;
            padding: 0 24px 80px;
            color: var(--text-main);
            font-family: system-ui, -apple-system, sans-serif;
            line-height: 1.6;
          }

          h1, h2, h3, h4 {
            line-height: 1.2;
            margin: 0 0 12px;
            color: var(--text-main);
          }

          p {
            margin: 0;
            color: var(--text-muted);
          }

          .hero {
            text-align: center;
            margin-bottom: 48px;
          }

          .hero h1 {
            font-size: clamp(2.5rem, 5vw, 3.5rem);
            color: var(--primary);
            font-weight: 800;
            letter-spacing: -0.02em;
          }

          .subtitle {
            font-size: 1.125rem;
            margin-top: 12px;
            max-width: 600px;
            margin-inline: auto;
          }

          .accountSaveInfo {
            margin: 14px auto 0;
            width: fit-content;
            max-width: 100%;
            padding: 8px 12px;
            border-radius: 999px;
            font-size: 0.9rem;
            font-weight: 600;
            line-height: 1.2;
            border: 1px solid transparent;
          }

          .accountSaveInfo.saving {
            color: #1d4ed8;
            background: rgba(37, 99, 235, 0.08);
            border-color: rgba(37, 99, 235, 0.2);
          }

          .accountSaveInfo.saved {
            color: #166534;
            background: rgba(22, 163, 74, 0.1);
            border-color: rgba(22, 163, 74, 0.22);
          }

          .accountSaveInfo.error {
            color: #b91c1c;
            background: rgba(239, 68, 68, 0.08);
            border-color: rgba(239, 68, 68, 0.22);
          }

          .topCards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 24px;
            margin-top: 24px;
          }

          .card {
            background: var(--bg-card);
            padding: 32px;
            border-radius: var(--radius-card);
            box-shadow: var(--shadow-md);
            border: 1px solid var(--border-color);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }

          .card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-hover);
          }

          .fragility {
            display: flex;
            gap: 24px;
            align-items: center;
          }

          .fragility h2 {
            font-size: 1.5rem;
          }

          .scoreRing {
            flex-shrink: 0;
            width: 120px;
            height: 120px;
            border-radius: 50%;
            display: grid;
            place-items: center;
            position: relative;
          }

          .scoreRing::before {
            content: '';
            position: absolute;
            width: 100px;
            height: 100px;
            background: white;
            border-radius: 50%;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
          }

          .percent {
            position: relative;
            font-size: 1.75rem;
            font-weight: 800;
            color: #ef4444;
            display: flex;
            flex-direction: column;
            align-items: center;
            line-height: 1;
          }

          .percent span {
            font-size: 0.7rem;
            font-weight: 700;
            color: var(--text-muted);
            margin-top: 4px;
            letter-spacing: 0.05em;
          }

          .card.radar {
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .card.radar h2 {
            width: 100%;
          }

          .card.big {
            display: flex;
            gap: 32px;
            align-items: flex-start;
            margin-top: 32px;
          }

          .scoreCircle {
            flex-shrink: 0;
            width: 88px;
            height: 88px;
            border-radius: 50%;
            background: var(--primary);
            display: grid;
            place-items: center;
            font-size: 1.7rem;
            font-weight: 800;
            color: white;
            box-shadow: 0 10px 20px rgba(49, 70, 245, 0.2);
          }

          .analysisBody h3 {
            font-size: 1.75rem;
          }

          .adviceText {
            margin-top: 12px;
            padding: 10px 12px;
            border-radius: 10px;
            border: 1px solid #dbeafe;
            background: #f8fbff;
            color: #334155;
            font-weight: 500;
          }

          .contextChips {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 12px;
          }

          .contextChip {
            display: inline-flex;
            align-items: center;
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 0.78rem;
            font-weight: 700;
            color: #1e40af;
            background: #eff6ff;
            border: 1px solid #dbeafe;
          }

          .pillarsGrid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
            margin-top: 32px;
          }

          .pillar {
            padding: 24px;
            border-radius: 12px;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            box-shadow: var(--shadow-sm);
            transition: border-color 0.2s ease;
          }

          .pillar:hover {
            border-color: #cbd5e1;
          }

          .pillarHeader {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 12px;
          }

          .pillarHeader h4 {
            margin: 0;
            font-size: 1.1rem;
            flex: 1;
          }

          .pillarMeta {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            margin-top: 16px;
            padding-top: 14px;
            border-top: 1px solid #eef2f7;
            font-size: 0.9rem;
            color: var(--text-muted);
          }

          .categoryAdvice {
            margin-top: 10px;
            padding: 10px 12px;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            color: #334155;
          }

          .badge {
            font-size: 0.75rem;
            padding: 4px 10px;
            border-radius: 999px;
            font-weight: 700;
            white-space: nowrap;
          }

          .badge.red {
            background: #fef2f2;
            color: #dc2626;
            border: 1px solid #fee2e2;
          }

          .badge.orange {
            background: #fff7ed;
            color: #c2410c;
            border: 1px solid #ffedd5;
          }

          .badge.green {
            background: #f0fdf4;
            color: #15803d;
            border: 1px solid #dcfce7;
          }

          .badge.blue {
            background: #eff6ff;
            color: #1d4ed8;
            border: 1px solid #dbeafe;
          }

          .emailForm {
            margin-top: 48px;
            text-align: center;
          }

          .emailForm h3 {
            font-size: 1.5rem;
          }

          .contactForm {
            display: flex;
            gap: 16px;
            justify-content: center;
            align-items: flex-end;
            margin-top: 24px;
            flex-wrap: wrap;
          }

          .contactForm label {
            display: flex;
            flex-direction: column;
            text-align: left;
            font-size: 0.9rem;
            font-weight: 500;
            color: var(--text-main);
            flex: 1;
            min-width: 200px;
            max-width: 320px;
          }

          .contactForm input {
            margin-top: 8px;
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid #cbd5e1;
            font-size: 1rem;
            transition: all 0.2s;
            outline: none;
          }

          .contactForm input:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(49, 70, 245, 0.15);
          }

          .primaryButton {
            height: 46px;
            padding: 0 24px;
            border-radius: 8px;
            border: none;
            background: var(--primary);
            color: white;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.2s, transform 0.1s;
            text-decoration: none;
          }

          .primaryButton:hover {
            background: var(--primary-hover);
          }

          .primaryButton:active {
            transform: scale(0.98);
          }

          .ctaWrap {
            display: flex;
            justify-content: center;
            margin-top: 48px;
          }

          .primaryButton.large {
            display: inline-flex;
            align-items: center;
            height: 54px;
            padding: 0 32px;
            border-radius: 999px;
            text-decoration: none;
            font-size: 1.125rem;
            box-shadow: 0 8px 16px rgba(49, 70, 245, 0.2);
          }

          .primaryButton.large.secondary {
            background: #e5e7eb;
            color: #1e293b;
            box-shadow: none;
          }

          .primaryButton.large:hover {
            box-shadow: 0 12px 24px rgba(49, 70, 245, 0.3);
            transform: translateY(-2px);
          }

          .stateCard {
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
            padding: 40px;
            color: #5e6274;
            text-align: center;
          }

          .errorCard {
            color: #8a2d4f;
            background: #fff7fa;
          }

          @media (max-width: 768px) {
            .diagnosticPage {
              padding: 0 16px 48px;
              margin: 24px auto;
            }

            .fragility {
              flex-direction: column;
              text-align: center;
            }

            .card.big {
              flex-direction: column;
              align-items: center;
              text-align: center;
              padding: 24px;
            }

            .contactForm {
              flex-direction: column;
              align-items: stretch;
            }

            .contactForm label {
              max-width: 100%;
            }

            .primaryButton {
              width: 100%;
              margin-top: 8px;
            }

            .primaryButton.large {
              text-align: center;
              justify-content: center;
              font-size: 1rem;
              padding: 0 20px;
            }

            .pillarsGrid {
              grid-template-columns: 1fr;
            }

            .pillarMeta {
              flex-direction: column;
              align-items: flex-start;
            }
          }
        `}</style>
      </section>
    </Layout>
  )
}