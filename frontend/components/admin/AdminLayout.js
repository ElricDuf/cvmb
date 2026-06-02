import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { readSession, isAdminRole } from '../../lib/adminApi'

const NAV = [
  { key: 'statistiques', label: 'Statistiques', href: '/admin/statistiques' },
  { key: 'questionnaires', label: 'Questionnaires', href: '/admin/questionnaires' },
]

function StatIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="navIco">
      <circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5.5 19c1.3-3 4-4.6 6.5-4.6S17.2 16 18.5 19" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}
function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="navIco">
      <rect x="5" y="4" width="14" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.5 9h7M8.5 12.5h7M8.5 16h4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

export default function AdminLayout({ active, children }) {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const s = readSession()
    if (!s || !isAdminRole(s.user?.role)) {
      router.replace('/login')
      return
    }
    setSession(s)
    setReady(true)
  }, [router])

  if (!ready) {
    return (
      <div className="bootScreen">
        Chargement de l’espace gestionnaire…
        <style jsx>{`
          .bootScreen { min-height: 60vh; display: grid; place-items: center; color: #6b7082; font-size: var(--fs-md); }
        `}</style>
      </div>
    )
  }

  const user = session.user
  const cci = session.cci
  const isNational = user?.role === 'admin_national'
  const initials = (user?.prenom?.[0] || user?.nom?.[0] || 'A').toUpperCase()

  const handleLogout = () => {
    window.localStorage.removeItem('cvmb:session')
    router.push('/login')
  }

  return (
    <div className="adminRoot">
      <header className="adminTop">
        <a href="https://www.bordeauxgironde.cci.fr/" target="_blank" rel="noreferrer" className="cciBadge">
          <span className="cciBadgeMark">CCI</span>
          <span>BORDEAUX<br />GIRONDE</span>
        </a>
        <span className="brandTitle">COMMENT VA MA BOÎTE ?</span>
        <button type="button" className="accountIcon" onClick={handleLogout} aria-label="Déconnexion" title="Déconnexion">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
            <path d="M5.5 19c1.3-3 4-4.6 6.5-4.6S17.2 16 18.5 19" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <nav className="navCard" aria-label="Navigation gestionnaire">
        <div className="profile">
          <span className="avatar">{initials}</span>
          <div>
            <strong>{[user?.prenom, user?.nom].filter(Boolean).join(' ') || 'Admin'}</strong>
            <span>{cci?.nom || 'CCI'}</span>
          </div>
        </div>
        <div className="navPills">
          {NAV.map((item) => (
            <Link key={item.key} href={item.href} className={`pill ${active === item.key ? 'pillActive' : ''}`}>
              {item.key === 'statistiques' ? <StatIcon /> : <ListIcon />}
              {item.label}
            </Link>
          ))}
          {isNational ? (
            <Link href="/admin/super" className={`pill pillSuper ${active === 'super' ? 'pillActive' : ''}`}>
              Super admin
            </Link>
          ) : null}
        </div>
        <span className="navSpacer" />
      </nav>

      <main className="adminMain">{children}</main>

      <footer className="adminFooter">
        <span>©2026 CCI BORDEAUX GIRONDE. TOUS DROITS RÉSERVÉS.</span>
        <span className="footLinks">
          <Link href="/mentions-legales">MENTIONS LÉGALES</Link>
          <Link href="/confidentialite">CONFIDENTIALITÉ</Link>
          <Link href="/contact">CONTACT</Link>
          <Link href="/faq">FAQ</Link>
        </span>
      </footer>

      <style jsx>{`
        .adminRoot { min-height: 100vh; background: linear-gradient(180deg, #f7f8fc 0%, #f3f4f9 100%); display: flex; flex-direction: column; }
        .adminTop { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 18px 32px; background: #fff; border-bottom: 1px solid #eceef4; }
        .cciBadge { display: inline-flex; align-items: center; gap: 8px; justify-self: start; text-decoration: none; color: #1c2bb5; font-size: 11px; font-weight: 800; line-height: 1.05; }
        .cciBadgeMark { display: grid; place-items: center; width: 34px; height: 26px; border-radius: 7px; background: #2433c4; color: #fff; font-size: 12px; }
        .brandTitle { justify-self: center; font-size: 22px; font-weight: 800; letter-spacing: 0.02em; color: #2433d6; white-space: nowrap; }
        .accountIcon { justify-self: end; width: 38px; height: 38px; border-radius: 50%; border: 1px solid #e2e4ee; background: #fff; color: #2433d6; cursor: pointer; display: grid; place-items: center; }
        .accountIcon svg { width: 22px; height: 22px; }

        .navCard { display: flex; align-items: center; gap: 24px; margin: -1px 0 0; padding: 16px 32px; background: #fff; border-bottom: 1px solid #eceef4; box-shadow: 0 18px 30px -28px rgba(36, 51, 120, 0.5); }
        .profile { display: flex; align-items: center; gap: 12px; min-width: 200px; }
        .avatar { width: 42px; height: 42px; border-radius: 50%; background: #3146f5; color: #fff; display: grid; place-items: center; font-weight: 800; }
        .profile strong { display: block; font-size: var(--fs-md); color: #20232f; }
        .profile span { font-size: var(--fs-xs); color: #8a8fa3; }
        .navPills { display: flex; gap: 10px; margin: 0 auto; }
        .navSpacer { min-width: 200px; }
        :global(.navCard .pill) { display: inline-flex; align-items: center; gap: 8px; padding: 11px 22px; border-radius: 999px; font-size: var(--fs-sm); font-weight: 700; color: #5b6075; text-decoration: none; transition: background 0.15s, color 0.15s; }
        :global(.navCard .pill:hover) { background: #f1f2f8; }
        :global(.navCard .pillActive) { background: #3146f5; color: #fff; box-shadow: 0 12px 22px -8px rgba(49, 70, 245, 0.6); }
        :global(.navCard .pillSuper) { border: 1px solid #e2e4ee; }
        :global(.navIco) { width: 18px; height: 18px; }

        .adminMain { flex: 1; width: min(1180px, 100%); margin: 0 auto; padding: 36px 32px 56px; box-sizing: border-box; }
        .adminFooter { display: flex; justify-content: space-between; gap: 16px; padding: 22px 40px; background: #fff; border-top: 1px solid #eceef4; font-size: 11px; letter-spacing: 0.04em; color: #9499ac; }
        .footLinks { display: flex; gap: 22px; }
        :global(.adminFooter a) { color: #9499ac; text-decoration: none; }
        @media (max-width: 820px) {
          .navCard { flex-wrap: wrap; }
          .profile, .navSpacer { min-width: 0; }
          .navPills { margin: 0; flex-wrap: wrap; }
          .adminFooter { flex-direction: column; }
        }
      `}</style>
    </div>
  )
}
