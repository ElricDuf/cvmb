import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/layout/Layout'

const storageKey = 'cvmb:lastDiagnostic'

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
            <div className="radarList" aria-label="Répartition des scores par catégorie">
              {(diagnostic.categories || []).map((category) => (
                <div key={category.id} className="radarItem">
                  <div className="radarItemHeader">
                    <span>{category.nom}</span>
                    <strong>{category.difficultyPercentage}%</strong>
                  </div>
                  <div className="radarTrack" aria-hidden="true">
                    <div className="radarFill" style={{ width: `${category.difficultyPercentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
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

          .radarList {
            display: flex;
            flex-direction: column;
            gap: 14px;
            margin-top: 16px;
          }

          .radarItemHeader {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 8px;
            font-size: 0.95rem;
            color: var(--text-main);
          }

          .radarTrack {
            height: 10px;
            border-radius: 999px;
            background: #e9eefc;
            overflow: hidden;
          }

          .radarFill {
            height: 100%;
            border-radius: inherit;
            background: linear-gradient(90deg, var(--primary), #7da0ff);
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