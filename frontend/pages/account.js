import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Layout from '../components/layout/Layout'
import styles from '../styles/dashboard_user.module.css'

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

function Sidebar({ profile }) {
  const menuItems = [
    { label: 'Historique', icon: 'history', active: false, href: '/dashboard_user' },
    { label: 'Informations', icon: 'info', active: true, href: '/account' },
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

function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="accountBadgeIcon">
      <circle cx="12" cy="9" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M6.8 18.2c1.2-2.8 3.8-4.2 5.2-4.2s4 1.4 5.2 4.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function buildInitialFormState() {
  return {
    companyName: '',
    directorName: '',
    phone: '',
    workforce: '',
    creationYear: '',
    email: '',
    commune: '',
    siret: '',
  }
}

function buildFormStateFromAccount(account) {
  return {
    companyName: account?.entreprise?.raisonSociale || '',
    directorName: [account?.user?.prenom, account?.user?.nom].filter(Boolean).join(' ').trim(),
    phone: account?.user?.telephone || '',
    workforce: account?.entreprise?.effectifTexte || '',
    creationYear: account?.entreprise?.anneeCreation ? String(account.entreprise.anneeCreation) : '',
    email: account?.user?.email || '',
    commune: account?.entreprise?.ville || '',
    siret: account?.entreprise?.siret || '',
  }
}

export default function AccountPage() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [accountLoading, setAccountLoading] = useState(true)
  const [accountError, setAccountError] = useState('')
  const [accountSaving, setAccountSaving] = useState(false)
  const [accountSuccess, setAccountSuccess] = useState('')
  const [accountForm, setAccountForm] = useState(buildInitialFormState())
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const savedSession = window.localStorage.getItem('cvmb:session')

    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession)
        setSession(parsedSession)

        if (!parsedSession?.user?.id) {
          setAccountLoading(false)
          setAccountError('Votre session est incomplète. Reconnectez-vous.')
          return
        }

        let cancelled = false

        async function loadAccount() {
          setAccountLoading(true)
          setAccountError('')

          try {
            const response = await fetch(`/api/account/${parsedSession.user.id}`)
            const data = await response.json()

            if (!response.ok) {
              throw new Error(data.error || 'Impossible de charger votre compte.')
            }

            if (cancelled) {
              return
            }

            const nextSession = {
              ...parsedSession,
              user: {
                ...parsedSession.user,
                ...data.user,
              },
              entreprise: data.entreprise || parsedSession.entreprise || parsedSession.enterprise || null,
              mustChangePassword: Boolean(data.user?.mustChangePassword ?? parsedSession.mustChangePassword),
            }

            setSession(nextSession)
            setAccountForm(buildFormStateFromAccount(data))
            window.localStorage.setItem('cvmb:session', JSON.stringify(nextSession))
          } catch (loadError) {
            if (!cancelled) {
              setAccountError(loadError.message || 'Impossible de charger votre compte.')
            }
          } finally {
            if (!cancelled) {
              setAccountLoading(false)
            }
          }
        }

        loadAccount()

        return () => {
          cancelled = true
        }
      } catch {
        window.localStorage.removeItem('cvmb:session')
        setAccountLoading(false)
        setAccountError('Votre session est invalide. Reconnectez-vous.')
      }
    } else {
      setAccountLoading(false)
      setAccountError('Connectez-vous pour consulter votre compte.')
    }
  }, [])

  const mustChangePassword = Boolean(session?.mustChangePassword) || router.query.firstLogin === '1'
  const profile = {
    initials: [session?.user?.prenom, session?.user?.nom]
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'U',
    name: [session?.user?.prenom, session?.user?.nom].filter(Boolean).join(' ').trim() || session?.user?.email || 'Utilisateur',
    company: session?.entreprise?.raisonSociale || session?.enterprise?.raisonSociale || 'Entreprise',
  }
  const showStateCard = accountLoading || (!session?.user?.id && accountError)

  const handleAccountFieldChange = (event) => {
    const { name, value } = event.target

    setAccountForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()

    if (!session?.user?.id) {
      setPasswordError('Votre session est introuvable. Reconnectez-vous pour modifier votre mot de passe.')
      return
    }

    if (!newPassword || newPassword !== confirmPassword) {
      setPasswordError('Le nouveau mot de passe et sa confirmation doivent correspondre.')
      return
    }

    setPasswordSubmitting(true)
    setPasswordError('')
    setPasswordSuccess('')

    try {
      const response = await fetch('/api/auth/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Impossible de mettre à jour le mot de passe.')
      }

      const nextSession = {
        ...session,
        mustChangePassword: false,
      }

      window.localStorage.setItem('cvmb:session', JSON.stringify(nextSession))
      setSession(nextSession)
      setNewPassword('')
      setConfirmPassword('')
      setPasswordSuccess('Votre mot de passe a été modifié.')

      if (router.query.firstLogin) {
        await router.replace('/account')
      }
    } catch (submitError) {
      setPasswordError(submitError.message || 'Impossible de mettre à jour le mot de passe.')
    } finally {
      setPasswordSubmitting(false)
    }
  }

  const handleAccountSubmit = async (event) => {
    event.preventDefault()

    if (!session?.user?.id) {
      setAccountError('Votre session est introuvable. Reconnectez-vous pour modifier votre compte.')
      return
    }

    setAccountSaving(true)
    setAccountError('')
    setAccountSuccess('')

    try {
      const response = await fetch(`/api/account/${session.user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountForm),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Impossible de mettre à jour votre compte.')
      }

      const nextSession = {
        ...session,
        user: {
          ...session.user,
          ...data.user,
        },
        entreprise: data.entreprise || null,
        mustChangePassword: Boolean(data.user?.mustChangePassword),
      }

      setSession(nextSession)
      setAccountForm(buildFormStateFromAccount(data))
      setAccountSuccess('Votre compte a été mis à jour.')
      window.localStorage.setItem('cvmb:session', JSON.stringify(nextSession))
      window.localStorage.setItem('cvmb:lastAccount', JSON.stringify(data.user))
    } catch (saveError) {
      setAccountError(saveError.message || 'Impossible de mettre à jour votre compte.')
    } finally {
      setAccountSaving(false)
    }
  }

  return (
    <Layout>
      <div className={styles.dashboardPage}>
        <div className={styles.dashboardBody}>
          <Sidebar profile={profile} />

          <main className="accountContent">
            {showStateCard ? (
              <div className="stateCard">{accountError || 'Chargement de votre compte...'}</div>
            ) : (
              <section className="accountCard" aria-labelledby="account-title">
                <div className="accountIntro">
                  <span className="accountIntroIcon" aria-hidden="true">
                    <AccountIcon />
                  </span>
                  <p>
                    {mustChangePassword
                      ? 'Votre compte vient d’être créé. Définissez votre mot de passe pour continuer.'
                      : 'Souhaitez-vous être contacté par un conseiller de votre CCI ?'}
                  </p>
                </div>

                {accountError ? <p className="accountMessage errorMessage" role="alert">{accountError}</p> : null}
                {accountSuccess ? <p className="accountMessage successMessage" role="status">{accountSuccess}</p> : null}

                {mustChangePassword ? (
                  <section className="securityCard" aria-labelledby="security-title">
                    <h2 id="security-title">Création du mot de passe</h2>
                    <p>Choisissez votre mot de passe personnel pour accéder à votre espace.</p>

                    <form className="passwordForm" onSubmit={handlePasswordSubmit}>
                      <div className="field">
                        <label htmlFor="newPassword">Nouveau mot de passe *</label>
                        <input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(event) => setNewPassword(event.target.value)}
                          required
                        />
                      </div>

                      <div className="field">
                        <label htmlFor="confirmPassword">Confirmation *</label>
                        <input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          required
                        />
                      </div>

                      {passwordError ? <p className="passwordMessage errorMessage" role="alert">{passwordError}</p> : null}
                      {passwordSuccess ? <p className="passwordMessage successMessage" role="status">{passwordSuccess}</p> : null}

                      <div className="actions">
                        <button type="submit" disabled={passwordSubmitting}>
                          {passwordSubmitting ? 'MISE À JOUR...' : 'DÉFINIR LE MOT DE PASSE'}
                        </button>
                      </div>
                    </form>
                  </section>
                ) : (
                  <form className="accountForm" onSubmit={handleAccountSubmit}>
                    <div className="field">
                      <label htmlFor="companyName">Raison sociale *</label>
                      <input
                        id="companyName"
                        name="companyName"
                        type="text"
                        value={accountForm.companyName}
                        onChange={handleAccountFieldChange}
                        required
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="directorName">Nom et prénom du dirigeant *</label>
                      <input
                        id="directorName"
                        name="directorName"
                        type="text"
                        value={accountForm.directorName}
                        onChange={handleAccountFieldChange}
                        required
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="phone">Téléphone *</label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={accountForm.phone}
                        onChange={handleAccountFieldChange}
                        required
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="workforce">Effectif de l'entreprise *</label>
                      <select id="workforce" name="workforce" value={accountForm.workforce} onChange={handleAccountFieldChange} required>
                        <option value="" disabled>
                          Sélectionner...
                        </option>
                        <option value="1 à 9 salariés">1 à 9 salariés</option>
                        <option value="10 à 19 salariés">10 à 19 salariés</option>
                        <option value="20 à 49 salariés">20 à 49 salariés</option>
                        <option value="50 salariés et plus">50 salariés et plus</option>
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="creationYear">Année de création de l'entreprise *</label>
                      <input
                        id="creationYear"
                        name="creationYear"
                        type="number"
                        value={accountForm.creationYear}
                        onChange={handleAccountFieldChange}
                        required
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="email">Email *</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={accountForm.email}
                        onChange={handleAccountFieldChange}
                        required
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="commune">Commune</label>
                      <input
                        id="commune"
                        name="commune"
                        type="text"
                        value={accountForm.commune}
                        onChange={handleAccountFieldChange}
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="siret">SIRET *</label>
                      <input
                        id="siret"
                        name="siret"
                        type="text"
                        value={accountForm.siret}
                        onChange={handleAccountFieldChange}
                        required
                      />
                    </div>

                    <div className="actions">
                      <button type="submit" disabled={accountSaving}>
                        {accountSaving ? 'ENREGISTREMENT...' : 'MODIFIER'}
                      </button>
                    </div>
                  </form>
                )}
              </section>
            )}
          </main>
        </div>
      </div>

      <style jsx>{`
        .accountContent {
          padding: 28px 24px 0;
          display: grid;
          align-content: start;
        }

        .accountCard {
          max-width: 960px;
          margin: 0 auto;
          width: 100%;
          background: rgba(255, 255, 255, 0.92);
          border-radius: 34px;
          padding: 36px 40px 32px;
          box-shadow: 0 18px 40px rgba(32, 41, 72, 0.08);
        }

        .stateCard {
          max-width: 960px;
          margin: 0 auto;
          width: 100%;
          padding: 28px 32px;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.92);
          color: #2d3142;
          box-shadow: 0 18px 40px rgba(32, 41, 72, 0.08);
          text-align: center;
        }

        .accountIntro {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
          color: #2d3142;
          font-size: 1rem;
          font-weight: 500;
        }

        .accountIntro p {
          margin: 0;
        }

        .accountMessage {
          margin: 0 0 20px;
          font-size: 0.94rem;
          font-weight: 600;
        }

        .securityCard {
          margin-bottom: 28px;
          padding: 20px 22px;
          border-radius: 22px;
          background: linear-gradient(180deg, rgba(52, 68, 244, 0.08), rgba(52, 68, 244, 0.03));
        }

        .securityCard h2 {
          margin: 0 0 8px;
          color: #20253a;
          font-size: 1.2rem;
          font-weight: 800;
        }

        .securityCard p {
          margin: 0 0 18px;
          color: #5c6276;
        }

        .passwordForm {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 24px;
        }

        .passwordForm .field {
          margin: 0;
        }

        .passwordMessage {
          grid-column: 1 / -1;
          margin: 0;
          font-size: 0.92rem;
          font-weight: 600;
        }

        .errorMessage {
          color: #b42318;
        }

        .successMessage {
          color: #1b7f3a;
        }

        .accountIntroIcon {
          display: grid;
          place-items: center;
          width: 18px;
          height: 18px;
          border-radius: 5px;
          background: linear-gradient(180deg, #4154ef 0%, #2f46f5 100%);
          color: #fff;
          flex: 0 0 auto;
        }

        .accountBadgeIcon {
          width: 12px;
          height: 12px;
        }

        .accountForm {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px 24px;
        }

        .field {
          display: grid;
          gap: 8px;
        }

        .field label {
          font-size: 0.92rem;
          font-weight: 700;
          color: #3a3f54;
        }

        .field input,
        .field select {
          width: 100%;
          height: 42px;
          border: 0;
          border-radius: 0;
          background: #f4f4f8;
          color: #2d3142;
          padding: 0 14px;
          font: inherit;
          outline: none;
        }

        .field select {
          appearance: none;
          background-image: linear-gradient(45deg, transparent 50%, #7d8196 50%), linear-gradient(135deg, #7d8196 50%, transparent 50%);
          background-position: calc(100% - 22px) 18px, calc(100% - 16px) 18px;
          background-size: 6px 6px, 6px 6px;
          background-repeat: no-repeat;
          padding-right: 34px;
        }

        .actions {
          grid-column: 1 / -1;
          display: flex;
          justify-content: center;
          padding-top: 12px;
        }

        .actions button {
          min-width: 140px;
          height: 46px;
          border: 0;
          border-radius: 8px;
          background: linear-gradient(180deg, #4154ef 0%, #2f46f5 100%);
          color: #fff;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          box-shadow: 0 14px 24px rgba(49, 70, 245, 0.26);
        }

        .actions button:disabled {
          opacity: 0.72;
          cursor: progress;
        }

        @media (max-width: 980px) {
          .accountCard {
            padding: 28px 24px;
          }

          .passwordForm {
            grid-template-columns: 1fr;
          }

          .accountForm {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  )
}
