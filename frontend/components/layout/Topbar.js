import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import brandLogo from '../../Logo-CCIBG-bleu_Web 2.png'

export default function Topbar() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const accountMenuRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

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
      if (event.key === 'cvmb:session') {
        readSession()
      }
    }

    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('storage', handleStorage)
    }
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
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
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
    <>
      <header className="topbar">
        <div className="topbarInner">
          <div className="brandGroup">
            <Link href="/" className="siteBrand" aria-label="Accueil Comment va ma boîte ?">
              <span className="siteBrandMark" aria-hidden="true">
                CMB
              </span>
              <span className="siteBrandText">
                <strong>Comment va ma boîte ?</strong>
                <span>Accueil</span>
              </span>
            </Link>

            <a
              href="https://www.bordeauxgironde.cci.fr/"
              className="cciBrand"
              aria-label="Site de la CCI Bordeaux Gironde"
              target="_blank"
              rel="noreferrer"
            >
              <img src={brandLogo.src} alt="CCI Bordeaux Gironde" className="brandLogo" />
            </a>
          </div>

          <Link href="/evaluate" className="evaluateButton">
            S’évaluer
          </Link>

          <div className="accountActions" ref={accountMenuRef}>
            {session ? (
              <>
                <button
                  type="button"
                  className={`accountButton accountButtonLogged ${menuOpen ? 'accountButtonOpen' : ''}`}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-controls="account-menu"
                  onClick={() => setMenuOpen((value) => !value)}
                >
                  <span className="accountAvatar" aria-hidden="true">
                    {(session?.user?.prenom?.[0] || session?.user?.nom?.[0] || '?').toUpperCase()}
                  </span>
                  <span className="accountText">
                    <strong>{fullName || 'Utilisateur'}</strong>
                    <span>Mon compte</span>
                  </span>
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="accountChevron">
                    <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {menuOpen ? (
                  <div className="accountMenu" id="account-menu" role="menu" aria-label="Navigation du compte">
                    <Link href="/dashboard_user" className="menuLink" role="menuitem" onClick={() => setMenuOpen(false)}>
                      Mes diagnostics
                    </Link>
                    <Link href="/account" className="menuLink" role="menuitem" onClick={() => setMenuOpen(false)}>
                      Profil complet
                    </Link>
                    <Link href="/diagnostic" className="menuLink" role="menuitem" onClick={() => setMenuOpen(false)}>
                      Dernier diagnostic
                    </Link>
                    <button type="button" className="menuLogout" role="menuitem" onClick={handleLogout}>
                      Déconnexion
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <Link href={accountHref} className="accountButton" aria-label="Connexion">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="accountIcon">
                  <circle cx="12" cy="8" r="3.25" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M6.5 19.25c1.35-2.9 4-4.5 5.5-4.5s4.15 1.6 5.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <span className="accountText accountTextGuest">
                  <strong>Connexion</strong>
                  <span>Accéder au compte</span>
                </span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <style jsx>{`
        .topbar {
          width: 100%;
          background: rgba(255, 255, 255, 0.95);
          border-bottom: 1px solid rgba(38, 37, 47, 0.06);
          box-shadow: 0 6px 18px rgba(24, 34, 70, 0.03);
        }

        .topbarInner {
          max-width: 1180px;
          margin: 0 auto;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .brandGroup {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          flex: 0 1 auto;
          min-width: 0;
        }

        .siteBrand,
        .cciBrand {
          text-decoration: none;
        }

        .siteBrand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          padding: 6px 10px;
          border-radius: 12px;
          background: rgba(53, 81, 242, 0.06);
          color: #24306f;
        }

        .siteBrandMark {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          background: linear-gradient(180deg, #4a62ff 0%, #3146f5 100%);
          color: #ffffff;
          font-size: 0.86rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          flex: 0 0 auto;
        }

        .siteBrandText {
          display: flex;
          flex-direction: column;
          min-width: 0;
          line-height: 1.1;
        }

        .siteBrandText strong {
          font-size: 0.95rem;
          font-weight: 700;
          color: #24306f;
          white-space: nowrap;
        }

        .siteBrandText span {
          font-size: 0.72rem;
          color: #5e6aa8;
        }

        .brandLogo {
          display: block;
          width: 112px;
          height: auto;
        }

        .evaluateButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 40px;
          padding: 0 16px;
          border-radius: 12px;
          background: linear-gradient(180deg, #4a62ff 0%, #3146f5 100%);
          color: #ffffff;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          box-shadow: 0 8px 18px rgba(49, 70, 245, 0.12);
          white-space: nowrap;
        }

        .evaluateButton:hover {
          filter: brightness(1.03);
        }

        .accountActions {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .accountButton {
          min-width: 40px;
          min-height: 40px;
          padding: 8px 12px;
          border-radius: 12px;
          background: transparent;
          border: 1px solid rgba(61, 72, 120, 0.06);
          color: #24306f;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          justify-self: end;
          text-decoration: none;
          font: inherit;
        }

        .accountButtonLogged {
          min-width: 0;
          padding-right: 12px;
        }

        .accountButtonOpen {
          box-shadow: 0 10px 20px rgba(32, 41, 72, 0.08);
        }

        .accountAvatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(53, 81, 242, 0.12);
          display: grid;
          place-items: center;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          flex: 0 0 auto;
        }

        .accountText {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1.08;
          color: #24306f;
        }

        .accountText strong {
          font-size: 0.9rem;
          font-weight: 700;
          white-space: nowrap;
        }

        .accountText span {
          font-size: 0.72rem;
          color: #5e6aa8;
        }

        .accountTextGuest {
          align-items: flex-start;
        }

        .accountChevron {
          width: 16px;
          height: 16px;
          margin-left: 2px;
          flex: 0 0 auto;
        }

        .accountIcon {
          width: 20px;
          height: 20px;
        }

        .accountMenu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 220px;
          padding: 8px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.98);
          border: 1px solid rgba(61, 72, 120, 0.08);
          box-shadow: 0 18px 36px rgba(24, 34, 70, 0.08);
          display: grid;
          gap: 6px;
          z-index: 20;
        }

        .menuLink,
        .menuLogout {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          width: 100%;
          padding: 9px 12px;
          border-radius: 10px;
          background: transparent;
          border: 0;
          color: #24306f;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          text-align: left;
          font: inherit;
        }

        .menuLink:hover,
        .menuLogout:hover {
          background: rgba(53, 81, 242, 0.06);
          color: #3146f5;
        }

        @media (max-width: 640px) {
          .topbarInner {
            padding-inline: 16px;
            justify-content: center;
          }

          .brandGroup {
            width: 100%;
            justify-content: space-between;
            gap: 8px;
          }

          .siteBrand {
            min-width: 0;
            flex: 1 1 auto;
          }

          .brandLogo {
            width: 96px;
          }

          .evaluateButton {
            width: 100%;
          }

          .accountMenu {
            min-width: min(92vw, 280px);
          }

          .accountText strong {
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      `}</style>
    </>
  )
}
