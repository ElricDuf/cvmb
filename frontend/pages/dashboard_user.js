import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../components/layout/Layout'
import styles from '../styles/dashboard_user.module.css'
import { authFetch } from '../lib/api'

const historyStorageKey = 'cvmb:session'

function formatHistoryDate(value) {
  if (!value) {
    return 'Date inconnue'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Date inconnue'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function buildChartGeometry(items) {
  if (!items.length) {
    return { points: [], path: '' }
  }

  const minX = 44
  const maxX = 324
  const minY = 150
  const maxY = 56
  const denominator = Math.max(items.length - 1, 1)

  const points = items.map((item, index) => {
    const x = minX + ((maxX - minX) * index) / denominator
    const y = minY - ((minY - maxY) * Math.max(0, Math.min(100, item.percentage || 0))) / 100

    return {
      ...item,
      x,
      y,
    }
  })

  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${Math.round(point.x)} ${Math.round(point.y)}`)
    .join(' ')

  return { points, path }
}

function SidebarIcon({ type }) {
  if (type === 'history') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.navIcon}>
        <path d="M6.5 7.5h9M6.5 12h9M6.5 16.5h5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M9 4.5h6.5a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2H9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    )
  }

  if (type === 'info') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.navIcon}>
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 11v5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="8" r="1" fill="currentColor" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.navIcon}>
      <path d="M10.2 4.7c1.7-1.1 4.1-.8 5.3.8 1.1 1.4 1 3.4-.2 4.9-.5.6-1.3 1.1-2.1 1.4l-.5.2v2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="18" r="1.2" fill="currentColor" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.historyIcon}>
      <rect x="5" y="4.8" width="14" height="15" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 3.8v3M16 3.8v3M5 8.4h14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 11.2h4M8 14.3h6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.chevronIcon}>
      <path d="M10 8l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Sidebar({ profile }) {
  const menuItems = [
    { label: 'Historique', icon: 'history', active: true, href: '/dashboard_user' },
    { label: 'Informations', icon: 'info', active: false, href: '/account' },
    { label: 'Se réévaluer', icon: 'refresh', active: false, href: '/evaluate' },
  ]

  return (
    <aside className={styles.sidebar} aria-label="Navigation du tableau de bord">
      <div className={styles.sidebarProfile}>
        <span className={styles.sidebarAvatar}>{profile?.initials || 'U'}</span>
        <div>
          <strong>{profile?.name || 'Utilisateur'}</strong>
          <span>{profile?.company || 'Entreprise'}</span>
        </div>
      </div>

      <nav className={styles.sidebarNav}>
        {menuItems.map((item) => (
          <Link key={item.label} href={item.href} className={`${styles.navItem} ${item.active ? styles.active : ''}`}>
            <SidebarIcon type={item.icon} />
            <span>{item.label}</span>
            {item.icon === 'refresh' ? (
              <svg viewBox="0 0 24 24" aria-hidden="true" className={`${styles.navIcon} ${styles.navIconRight}`}>
                <path d="M14.5 6.2a7 7 0 1 0 2.8 9.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M15.2 4.8v4h4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : null}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

function HistoryCard({ date, score, companyName, companySize, scoreLabel, onOpen }) {
  return (
    <article className={styles.historyRow}>
      <div className={styles.historyLeft}>
        <span className={styles.historyBadge}>
          <CalendarIcon />
        </span>
        <div>
          <strong>{date}</strong>
          <span style={{ display: 'block', fontSize: '0.8rem', color: '#7c8197', marginTop: '2px' }}>
            {companyName}
            {companySize ? ` · ${companySize}` : ''}
          </span>
        </div>
      </div>

      <div className={styles.historyScore}>
        <span>SCORE</span>
        <strong>{scoreLabel || `${score}%`}</strong>
      </div>

      <button className={styles.rowButton} type="button" aria-label={`Consulter le questionnaire du ${date}`} onClick={onOpen}>
        <ChevronIcon />
      </button>
    </article>
  )
}

function EvolutionChart({ points, path }) {
  return (
    <svg viewBox="0 0 360 200" role="img" aria-label="Évolution des scores" className={styles.chartSvg}>
      <rect x="32" y="24" width="296" height="142" fill="#fff" stroke="rgba(36, 45, 76, 0.18)" />
      <path d="M48 48H310M48 80H310M48 112H310M48 144H310" stroke="rgba(36, 45, 76, 0.08)" strokeDasharray="2 3" />
      <path d="M48 30V166M146 30V166M244 30V166M310 30V166" stroke="rgba(36, 45, 76, 0.08)" strokeDasharray="2 3" />
      {path ? <path d={path} fill="none" stroke="#2547ff" strokeWidth="2.2" /> : null}
      {points.map((point) => (
        <g key={point.label}>
          <circle cx={point.x} cy={point.y} r="3.2" fill="#2547ff" />
          <text x={point.x} y={point.y - 8} textAnchor="middle" fontSize="9" fill="#5c6277">
            {point.score}%
          </text>
          <text x={point.x} y="186" textAnchor="middle" fontSize="8.5" fill="#5c6277">
            {point.label}
          </text>
        </g>
      ))}
      <text x="180" y="18" textAnchor="middle" fontSize="10" fill="#3d4357">
        Évolution des scores
      </text>
      <text x="14" y="102" textAnchor="middle" fontSize="8.5" fill="#5c6277" transform="rotate(-90 14 102)">
        Score (%)
      </text>
      <text x="180" y="194" textAnchor="middle" fontSize="8.5" fill="#5c6277">
        Date du questionnaire
      </text>
    </svg>
  )
}

export default function DashboardUserPage() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [historyData, setHistoryData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const savedSession = window.localStorage.getItem(historyStorageKey)

    if (!savedSession) {
      setLoading(false)
      setError('Connectez-vous pour consulter votre historique.')
      return
    }

    let parsedSession = null

    try {
      parsedSession = JSON.parse(savedSession)
    } catch {
      window.localStorage.removeItem(historyStorageKey)
      setLoading(false)
      setError('Votre session est invalide. Reconnectez-vous.')
      return
    }

    setSession(parsedSession)

    if (parsedSession?.mustChangePassword) {
      setLoading(false)
      router.replace('/account?firstLogin=1')
      return
    }

    if (!parsedSession?.user?.id) {
      setLoading(false)
      setError('Votre session est incomplète. Reconnectez-vous.')
      return
    }

    let cancelled = false

    async function loadHistory() {
      setLoading(true)
      setError('')

      try {
        const response = await authFetch(`/api/users/${parsedSession.user.id}/questionnaires`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Impossible de charger l’historique.')
        }

        if (!cancelled) {
          setHistoryData(Array.isArray(data.questionnaires) ? data.questionnaires : [])
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || 'Impossible de charger l’historique.')
          setHistoryData([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadHistory()

    const handleFocus = () => {
      if (!cancelled) {
        loadHistory()
      }
    }

    const handleStorage = (event) => {
      if (event.key === 'cvmb:session' || event.key === 'cvmb:lastDiagnosticId') {
        setSessionFromStorage()
      }
    }

    function setSessionFromStorage() {
      const latestSession = window.localStorage.getItem(historyStorageKey)

      if (!latestSession) {
        return
      }

      try {
        const nextSession = JSON.parse(latestSession)
        setSession(nextSession)
      } catch {
        return
      }
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('storage', handleStorage)

    return () => {
      cancelled = true
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const profile = useMemo(() => {
    const user = session?.user || {}
    const name = [user.prenom, user.nom].filter(Boolean).join(' ').trim()
    const initials = [user.prenom, user.nom]
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || (user.email?.[0] || 'U').toUpperCase()

    return {
      name: name || user.email || 'Utilisateur',
      company: session?.entreprise?.raisonSociale || session?.enterprise?.raisonSociale || 'Entreprise',
      initials,
    }
  }, [session])

  const chartData = useMemo(() => {
    return buildChartGeometry(
      historyData
        .slice()
        .reverse()
        .map((item) => ({
          label: formatHistoryDate(item.createdAt),
          score: item.percentage || 0,
          percentage: item.percentage || 0,
        })),
    )
  }, [historyData])

  const handleOpenQuestionnaire = (diagnosticId) => {
    router.push({
      pathname: '/diagnostic',
      query: { diagnosticId },
    })
  }

  return (
    <Layout>
      <div className={styles.dashboardPage}>
        <div className={styles.dashboardBody}>
          <Sidebar profile={profile} />

          <main className={styles.contentArea}>
            <section className={`${styles.panel} ${styles.historyPanel}`}>
              <h1>Historique de questionnaire</h1>
              {loading ? (
                <p>Chargement de votre historique...</p>
              ) : error ? (
                <p>{error}</p>
              ) : historyData.length ? (
                <div className={styles.historyList}>
                  {historyData.map((item) => (
                    <HistoryCard
                      key={item.id}
                      date={formatHistoryDate(item.createdAt)}
                      score={item.percentage}
                      scoreLabel={`${item.percentage}%`}
                      companyName={item.company?.name || 'Entreprise'}
                      companySize={item.company?.size || ''}
                      onOpen={() => handleOpenQuestionnaire(item.id)}
                    />
                  ))}
                </div>
              ) : (
                <p>Aucun questionnaire terminé n’a encore été enregistré pour ce compte.</p>
              )}
            </section>

            <section className={`${styles.panel} ${styles.evolutionPanel}`}>
              <h2>Evolution</h2>
              <div className={styles.chartWrap}>
                {chartData.points.length ? <EvolutionChart points={chartData.points} path={chartData.path} /> : <p>Aucune évolution disponible pour le moment.</p>}
              </div>
            </section>
          </main>
        </div>
      </div>
    </Layout>
  )
}