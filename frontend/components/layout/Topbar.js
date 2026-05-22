import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import brandLogo from '../../Logo-CCIBG-bleu_Web 2.png'

export default function Topbar() {
  const router = useRouter()
  const [session, setSession] = useState(null)

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

  const fullName = [session?.user?.prenom, session?.user?.nom].filter(Boolean).join(' ').trim()
  const accountHref = session ? '/account' : '/login'

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('cvmb:session')
    }

    setSession(null)
    await router.push('/login')
  }

  return (
    <>
      <header className="topbar">
        <div className="topbarInner">
          <Link href="/" className="brand" aria-label="Accueil">
            <img src={brandLogo.src} alt="CCI Bordeaux Gironde" className="brandLogo" />
          </Link>
          <div className="accountActions">
            <Link href={accountHref} className={`accountButton ${session ? 'accountButtonLogged' : ''}`} aria-label={session ? 'Accéder au compte' : 'Connexion'}>
              {session ? (
                <>
                  <span className="accountAvatar" aria-hidden="true">
                    {(session?.user?.prenom?.[0] || session?.user?.nom?.[0] || '?').toUpperCase()}
                  </span>
                  <span className="accountText">
                    <strong>{fullName || 'Utilisateur'}</strong>
                    <span>Mon compte</span>
                  </span>
                </>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true" className="accountIcon">
                  <circle cx="12" cy="8" r="3.25" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M6.5 19.25c1.35-2.9 4-4.5 5.5-4.5s4.15 1.6 5.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              )}
            </Link>

            {session ? (
              <button type="button" className="logoutButton" onClick={handleLogout}>
                Déconnexion
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <style jsx>{`
        .topbar {
          width: 100%;
          background: rgba(255, 255, 255, 0.92);
          border-bottom: 1px solid rgba(61, 72, 120, 0.12);
          box-shadow: 0 6px 18px rgba(24, 34, 70, 0.04);
        }

        .topbarInner {
          max-width: 1180px;
          margin: 0 auto;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .brand {
          justify-self: start;
        }

        .brandLogo {
          display: block;
          width: 132px;
          height: auto;
        }

        .accountActions {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .accountButton {
          min-width: 40px;
          min-height: 40px;
          padding: 8px 14px;
          border-radius: 18px;
          background: rgba(53, 81, 242, 0.08);
          color: #3551f2;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          justify-self: end;
          text-decoration: none;
        }

        .accountButtonLogged {
          min-width: 0;
        }

        .accountAvatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(53, 81, 242, 0.14);
          display: grid;
          place-items: center;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          flex: 0 0 auto;
        }

        .accountText {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1.1;
          color: #24306f;
        }

        .accountText strong {
          font-size: 0.88rem;
          font-weight: 800;
          white-space: nowrap;
        }

        .accountText span {
          font-size: 0.72rem;
          color: #5e6aa8;
        }

        .accountIcon {
          width: 22px;
          height: 22px;
        }

        .logoutButton {
          min-height: 40px;
          padding: 0 12px;
          border-radius: 12px;
          border: 1px solid rgba(53, 81, 242, 0.18);
          background: #ffffff;
          color: #3551f2;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
        }

        @media (max-width: 640px) {
          .topbarInner {
            padding-inline: 16px;
          }

          .brandLogo {
            width: 112px;
          }

          .accountButton {
            padding-inline: 12px;
          }

          .accountText strong {
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .logoutButton {
            padding: 0 10px;
            font-size: 0.76rem;
          }
        }
      `}</style>
    </>
  )
}
