import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import brandLogo from '../../Logo-CCIBG-bleu_Web 2.png'
// On importe le fichier CSS que nous venons de créer
import styles from '../../styles/Topbar.module.css' 

export default function Topbar() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const accountMenuRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const readSession = () => {
      const rawSession = window.localStorage.getItem('cvmb:session')
      if (!rawSession) {
        setSession(null)
        return
      }
      try {
        setSession(JSON.parse(rawSession))
      } catch {
        window.localStorage.removeItem('cvmb:session')
        setSession(null)
      }
    }

    readSession()

    const handleStorage = (event) => {
      if (event.key === 'cvmb:session') readSession()
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  useEffect(() => {
    if (!session) {
      setMenuOpen(false)
      return undefined
    }

    const handlePointerDown = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [session])

  const fullName = [session?.user?.prenom, session?.user?.nom].filter(Boolean).join(' ').trim()
  const accountHref = session ? '/account' : '/login'

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('cvmb:session')
    }
    setSession(null)
    setMenuOpen(false)
    await router.push('/login')
  }

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarInner}>
        <div className={styles.brandGroup}>
          <Link href="/" className={styles.siteBrand} aria-label="Accueil Comment va ma boîte ?">
            <span className={styles.siteBrandMark} aria-hidden="true">
              CMB
            </span>
            <span className={styles.siteBrandText}>
              <strong>Comment va ma boîte ?</strong>
              <span>Accueil</span>
            </span>
          </Link>

          <a
            href="https://www.bordeauxgironde.cci.fr/"
            className={styles.cciBrand}
            aria-label="Site de la CCI Bordeaux Gironde"
            target="_blank"
            rel="noreferrer"
          >
            <img src={brandLogo.src} alt="CCI Bordeaux Gironde" className={styles.brandLogo} />
          </a>
        </div>

        <Link href="/evaluate" className={styles.evaluateButton}>
          S’évaluer
        </Link>

        <div className={styles.accountActions} ref={accountMenuRef}>
          {session ? (
            <>
              <button
                type="button"
                className={`${styles.accountButton} ${styles.accountButtonLogged} ${menuOpen ? styles.accountButtonOpen : ''}`}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-controls="account-menu"
                onClick={() => setMenuOpen((value) => !value)}
              >
                <span className={styles.accountAvatar} aria-hidden="true">
                  {(session?.user?.prenom?.[0] || session?.user?.nom?.[0] || '?').toUpperCase()}
                </span>
                <span className={styles.accountText}>
                  <strong>{fullName || 'Utilisateur'}</strong>
                  <span>Mon compte</span>
                </span>
                <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.accountChevron}>
                  <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {menuOpen ? (
                <div className={styles.accountMenu} id="account-menu" role="menu" aria-label="Navigation du compte">
                  <Link href="/dashboard_user" className={styles.menuLink} role="menuitem" onClick={() => setMenuOpen(false)}>
                    Mes diagnostics
                  </Link>
                  <Link href="/account" className={styles.menuLink} role="menuitem" onClick={() => setMenuOpen(false)}>
                    Profil complet
                  </Link>
                  <Link href="/diagnostic" className={styles.menuLink} role="menuitem" onClick={() => setMenuOpen(false)}>
                    Dernier diagnostic
                  </Link>
                  <div className={styles.menuDivider}></div>
                  <button type="button" className={styles.menuLogout} role="menuitem" onClick={handleLogout}>
                    Déconnexion
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <Link href={accountHref} className={styles.accountButton} aria-label="Connexion">
              <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.accountIcon}>
                <circle cx="12" cy="8" r="3.25" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <path d="M6.5 19.25c1.35-2.9 4-4.5 5.5-4.5s4.15 1.6 5.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span className={`${styles.accountText} ${styles.accountTextGuest}`}>
                <strong>Connexion</strong>
                <span>Accéder au compte</span>
              </span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}