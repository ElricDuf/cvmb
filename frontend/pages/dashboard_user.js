import Layout from '../components/layout/Layout'
import styles from '../styles/dashboard_user.module.css'

const historyItems = [
  { date: '25 octobre 2020', score: 78 },
  { date: '5 mars 2019', score: 62 },
  { date: '12 septembre 2018', score: 55 },
]

const chartPoints = [
  { label: '12 sept. 2018', score: 55, x: 20, y: 150 },
  { label: '5 mars 2019', score: 62, x: 160, y: 122 },
  { label: '25 oct. 2020', score: 78, x: 300, y: 72 },
]

const chartPath = 'M44 150 L184 122 L324 72'

function SidebarIcon({ type }) {
  if (type === 'history') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="navIcon">
        <path d="M6.5 7.5h9M6.5 12h9M6.5 16.5h5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M9 4.5h6.5a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2H9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    )
  }

  if (type === 'info') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="navIcon">
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 11v5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="8" r="1" fill="currentColor" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="navIcon">
      <path d="M10.2 4.7c1.7-1.1 4.1-.8 5.3.8 1.1 1.4 1 3.4-.2 4.9-.5.6-1.3 1.1-2.1 1.4l-.5.2v2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="18" r="1.2" fill="currentColor" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="historyIcon">
      <rect x="5" y="4.8" width="14" height="15" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 3.8v3M16 3.8v3M5 8.4h14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 11.2h4M8 14.3h6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="chevronIcon">
      <path d="M10 8l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DashboardHeader() {
  return (
    <header className="dashboardHeader" aria-label="En-tête du tableau de bord">
      <div className="profileChip" aria-label="Profil utilisateur">
        <span className="avatar">J</span>
        <span>
          <strong>Jean Dupont</strong>
          <small>Entreprise</small>
        </span>
      </div>

      <div className="headerTitle">
        <p>COMMENT VA MA BOÎTE ?</p>
      </div>

      <button className="headerAction" type="button" aria-label="Compte utilisateur">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="accountIcon">
          <circle cx="12" cy="9" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path d="M6.8 18.2c1.2-2.8 3.8-4.2 5.2-4.2s4 1.4 5.2 4.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </button>
    </header>
  )
}

function Sidebar() {
  const menuItems = [
    { label: 'Historique', icon: 'history', active: true },
    { label: 'Informations', icon: 'info', active: false },
    { label: 'Se réévaluer', icon: 'refresh', active: false },
  ]

  return (
    <aside className="sidebar" aria-label="Navigation du tableau de bord">
      <div className="sidebarProfile">
        <span className="sidebarAvatar">J</span>
        <div>
          <strong>Jean Dupont</strong>
          <span>Entreprise</span>
        </div>
      </div>

      <nav className="sidebarNav">
        {menuItems.map((item) => (
          <a key={item.label} href="#" className={`navItem ${item.active ? 'active' : ''}`}>
            <SidebarIcon type={item.icon} />
            <span>{item.label}</span>
            {item.icon === 'refresh' ? (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="navIcon navIconRight">
                <path d="M14.5 6.2a7 7 0 1 0 2.8 9.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M15.2 4.8v4h4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : null}
          </a>
        ))}
      </nav>
    </aside>
  )
}

function HistoryCard({ date, score }) {
  return (
    <article className="historyRow">
      <div className="historyLeft">
        <span className="historyBadge">
          <CalendarIcon />
        </span>
        <strong>{date}</strong>
      </div>

      <div className="historyScore">
        <span>SCORE</span>
        <strong>{score}%</strong>
      </div>

      <button className="rowButton" type="button" aria-label={`Consulter le questionnaire du ${date}`}>
        <ChevronIcon />
      </button>
    </article>
  )
}

function EvolutionChart() {
  return (
    <svg viewBox="0 0 360 200" role="img" aria-label="Évolution des scores" className="chartSvg">
      <rect x="32" y="24" width="296" height="142" fill="#fff" stroke="rgba(36, 45, 76, 0.18)" />
      <path d="M48 48H310M48 80H310M48 112H310M48 144H310" stroke="rgba(36, 45, 76, 0.08)" strokeDasharray="2 3" />
      <path d="M48 30V166M146 30V166M244 30V166M310 30V166" stroke="rgba(36, 45, 76, 0.08)" strokeDasharray="2 3" />
      <path d={chartPath} fill="none" stroke="#2547ff" strokeWidth="2.2" />
      {chartPoints.map((point) => (
        <g key={point.label}>
          <circle cx={point.x + 24} cy={point.y} r="3.2" fill="#2547ff" />
          <text x={point.x + 24} y={point.y - 8} textAnchor="middle" fontSize="9" fill="#5c6277">
            {point.score}%
          </text>
          <text x={point.x + 24} y="186" textAnchor="middle" fontSize="8.5" fill="#5c6277">
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
  return (
    <Layout showTopbar={false}>
      <div className={styles.dashboardPage}>
        <DashboardHeader />

        <div className={styles.dashboardBody}>
          <Sidebar />

          <main className={styles.contentArea}>
            <section className={`${styles.panel} ${styles.historyPanel}`}>
              <h1>Historique de questionnaire</h1>
              <div className={styles.historyList}>
                {historyItems.map((item) => (
                  <HistoryCard key={item.date} {...item} />
                ))}
              </div>
            </section>

            <section className={`${styles.panel} ${styles.evolutionPanel}`}>
              <h2>Evolution</h2>
              <div className={styles.chartWrap}>
                <EvolutionChart />
              </div>
            </section>
          </main>
        </div>
      </div>
    </Layout>
  )
}