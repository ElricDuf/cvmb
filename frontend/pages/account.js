import Link from 'next/link'
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

function Sidebar() {
  const menuItems = [
    { label: 'Historique', icon: 'history', active: false, href: '/dashboard_user' },
    { label: 'Informations', icon: 'info', active: true, href: '/account' },
    { label: 'Se réévaluer', icon: 'refresh', active: false, href: '/evaluate' },
  ]

  return (
    <aside className={styles.sidebar} aria-label="Navigation du tableau de bord">
      <div className={styles.sidebarProfile}>
        <span className={styles.sidebarAvatar}>J</span>
        <div>
          <strong>Jean Dupont</strong>
          <span>Entreprise</span>
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

export default function AccountPage() {
  return (
    <Layout>
      <div className={styles.dashboardPage}>
        <div className={styles.dashboardBody}>
          <Sidebar />

          <main className="accountContent">
            <section className="accountCard" aria-labelledby="account-title">
              <div className="accountIntro">
                <span className="accountIntroIcon" aria-hidden="true">
                  <AccountIcon />
                </span>
                <p>Souhaitez-vous être contacté par un conseiller de votre CCI ?</p>
              </div>

              <form className="accountForm">
                <div className="field">
                  <label htmlFor="companyName">Raison sociale *</label>
                  <input id="companyName" type="text" defaultValue="CCI Bordeaux Gironde" />
                </div>

                <div className="field">
                  <label htmlFor="directorName">Nom et prénom du dirigeant *</label>
                  <input id="directorName" type="text" defaultValue="Jean Dupont" />
                </div>

                <div className="field">
                  <label htmlFor="phone">Téléphone *</label>
                  <input id="phone" type="tel" defaultValue="06 12 34 56 78" />
                </div>

                <div className="field">
                  <label htmlFor="workforce">Effectif de l'entreprise *</label>
                  <select id="workforce" defaultValue="">
                    <option value="" disabled>
                      Sélectionner...
                    </option>
                    <option value="1-2">1 à 2</option>
                    <option value="3-10">3 à 10</option>
                    <option value="11-50">11 à 50</option>
                    <option value="50+">50+</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="creationYear">Année de création de l'entreprise *</label>
                  <input id="creationYear" type="text" defaultValue="2016" />
                </div>

                <div className="field">
                  <label htmlFor="email">Email *</label>
                  <input id="email" type="email" defaultValue="jean.dupont@exemple.fr" />
                </div>

                <div className="field">
                  <label htmlFor="commune">Commune</label>
                  <input id="commune" type="text" defaultValue="Bordeaux" />
                </div>

                <div className="field">
                  <label htmlFor="siret">SIRET *</label>
                  <input id="siret" type="text" defaultValue="123 456 789 00012" />
                </div>

                <div className="actions">
                  <button type="submit">MODIFIER</button>
                </div>
              </form>
            </section>
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

        @media (max-width: 980px) {
          .accountCard {
            padding: 28px 24px;
          }

          .accountForm {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  )
}
