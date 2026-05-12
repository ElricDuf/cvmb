import brandLogo from '../Logo-CCIBG-bleu_Web 2.png'
import meetingImage from '../Business team meeting.png'

function TargetIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="infoIcon">
      <circle cx="12" cy="12" r="7.4" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" />
    </svg>
  )
}

function AdvantageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="infoIcon">
      <path
        d="M12 3.8l1.7 2.96 3.35.78-.95 3.25 1.9 2.77-2.8 1.63-.35 3.35-3.2-.98-3.2.98-.35-3.35-2.8-1.63 1.9-2.77-.95-3.25 3.35-.78L12 3.8z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinejoin="round"
      />
      <path d="M9.1 12.1l1.85 1.85 4-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ObjectiveIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="infoIcon">
      <path d="M4.5 16.8l4.1-4.2 2.8 2.7 5.5-5.8" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.6 9.5h2.8v2.8" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function QuestionnaireIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="stepSvg">
      <rect x="5.2" y="4.4" width="13.6" height="15.2" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 4.4v3.2M15 4.4v3.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M8 11h8M8 14h5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="8.2" cy="11" r="0.8" fill="currentColor" />
      <circle cx="8.2" cy="14" r="0.8" fill="currentColor" />
    </svg>
  )
}

function DiagnosticIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="stepSvg">
      <path d="M4.7 18.2h14.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <rect x="6" y="12.4" width="2.5" height="5.8" rx="0.7" fill="currentColor" />
      <rect x="10.75" y="9.2" width="2.5" height="9" rx="0.7" fill="currentColor" />
      <rect x="15.5" y="6.8" width="2.5" height="11.4" rx="0.7" fill="currentColor" />
      <path d="M6.4 8.4l3.3 1.8 3.8-3 2.8 1.3 2.6-2.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SupportIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="stepSvg">
      <path d="M6.8 12.4a5.2 5.2 0 0 1 10.4 0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M5.2 11.8h1.3c.8 0 1.5.7 1.5 1.5v2.2c0 .8-.7 1.5-1.5 1.5H5.2a.9.9 0 0 1-.9-.9v-3.4a.9.9 0 0 1 .9-.9zm13.6 0h1.3a.9.9 0 0 1 .9.9v3.4a.9.9 0 0 1-.9.9h-1.3c-.8 0-1.5-.7-1.5-1.5v-2.2c0-.8.7-1.5 1.5-1.5z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M10 18.1c.8.8 1.8 1.3 3 1.3 1.5 0 2.8-.7 3.6-1.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M11.2 8.3l1.8 1.8 3.2-3.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Home() {
  return (
    <main className="page" id="top">
      <header className="topbar">
        <div className="topbarInner">
          <div className="brand">
            <img src={brandLogo.src} alt="CCI Bordeaux Gironde" className="brandLogo" />
          </div>
          <button className="accountButton" type="button" aria-label="Connexion">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="accountIcon">
              <circle cx="12" cy="8" r="3.25" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M6.5 19.25c1.35-2.9 4-4.5 5.5-4.5s4.15 1.6 5.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      <section className="heroShell">
        <div className="heroGrid">
          <div className="heroCopy">
            <p className="eyebrow">Diagnostic gratuit et rapide</p>
            <h1>COMMENT VA MA BOÎTE ?</h1>
            <p className="lead">
              Un diagnostic rapide et gratuit pour identifier vos points forts et axes d’amélioration.
            </p>
            <a className="primaryButton" href="#evaluation">
              JE M’ÉVALUE
            </a>
          </div>

          <div className="infoStack" aria-label="Informations clés">
            <article className="infoCard">
              <div className="infoBadge">
                <TargetIcon />
              </div>
              <div>
                <h2>CIBLE</h2>
                <p>Dirigeants de TPE et PME souhaitant faire le point sur la santé globale de leur entreprise.</p>
              </div>
            </article>

            <article className="infoCard">
              <div className="infoBadge">
                <AdvantageIcon />
              </div>
              <div>
                <h2>AVANTAGES</h2>
                <p>Un outil gratuit, anonyme et confidentiel pour prendre du recul sur votre activité en 10 minutes.</p>
              </div>
            </article>

            <article className="infoCard">
              <div className="infoBadge">
                <ObjectiveIcon />
              </div>
              <div>
                <h2>OBJECTIF</h2>
                <p>Détecter les opportunités de croissance et prévenir les risques éventuels de votre structure.</p>
              </div>
            </article>
          </div>
        </div>

        <section className="sectionBlock sectionDivider" aria-labelledby="how-title">
          <h2 id="how-title" className="sectionTitle">COMMENT ÇA MARCHE ?</h2>
          <div className="stepsGrid">
            <article className="stepCard">
              <div className="stepNumber">1</div>
              <div className="stepIcon">
                <QuestionnaireIcon />
              </div>
              <h3>RÉPONDEZ AU QUESTIONNAIRE</h3>
              <p>Parcourez les différents piliers de votre entreprise à travers 4 catégories de questions simples.</p>
            </article>

            <article className="stepCard">
              <div className="stepNumber">2</div>
              <div className="stepIcon">
                <DiagnosticIcon />
              </div>
              <h3>OBTENEZ VOTRE DIAGNOSTIC</h3>
              <p>Visualisez instantanément vos résultats sous forme de graphiques détaillés et obtenez des conseils personnalisés.</p>
            </article>

            <article className="stepCard">
              <div className="stepNumber">3</div>
              <div className="stepIcon">
                <SupportIcon />
              </div>
              <h3>RECEVEZ UN ACCOMPAGNEMENT</h3>
              <p>Un conseiller CCI vous contacte pour approfondir les pistes d’amélioration.</p>
            </article>
          </div>
        </section>

        <section className="ctaSection" id="evaluation">
          <div className="ctaVisual">
            <img src={meetingImage.src} alt="Réunion d’équipe" className="ctaImage" />
            <div className="ctaOverlay">
              <p className="ctaKicker">MAXIMISEZ VOTRE POTENTIEL</p>
              <h2>Bénéficiez d’un diagnostic complet pour transformer vos défis en opportunités</h2>
              <a className="primaryButton secondaryButton" href="#top">
                LANCER MON ÉVALUATION
              </a>
            </div>
          </div>
        </section>

        <footer className="footer">
          <p>© CCI Bordeaux Gironde. Tous droits réservés.</p>
          <nav>
            <a href="#">Mentions légales</a>
            <a href="#">Confidentialité</a>
            <a href="#">Contact</a>
            <a href="#">FAQ</a>
          </nav>
        </footer>
      </section>

      <style jsx>{`
        :global(html) {
          scroll-behavior: smooth;
        }

        :global(body) {
          margin: 0;
          font-family: Arial, Helvetica, sans-serif;
          background:
            radial-gradient(circle at top left, rgba(67, 95, 255, 0.05), transparent 28%),
            radial-gradient(circle at top right, rgba(67, 95, 255, 0.04), transparent 22%),
            linear-gradient(180deg, #fcfbff 0%, #f7f7fc 100%);
          color: #26252f;
        }

        .page {
          min-height: 100vh;
          color: #26252f;
        }

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

        .heroShell {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 24px 0;
        }

        .brandLogo {
          display: block;
          width: 132px;
          height: auto;
        }

        .accountButton {
          width: 40px;
          height: 40px;
          border: 0;
          border-radius: 999px;
          background: rgba(53, 81, 242, 0.08);
          color: #3551f2;
          display: grid;
          place-items: center;
          cursor: pointer;
        }

        .accountIcon {
          width: 22px;
          height: 22px;
        }

        .heroGrid {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(330px, 0.95fr);
          gap: 40px;
          align-items: center;
          padding: 52px 0 32px;
        }

        .eyebrow {
          margin: 0 0 10px;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #4f5bd6;
        }

        .heroCopy h1 {
          margin: 0;
          font-size: clamp(3rem, 7vw, 4.9rem);
          line-height: 0.95;
          letter-spacing: -0.05em;
          color: #3146f5;
          max-width: 10ch;
        }

        .lead {
          margin: 18px 0 28px;
          max-width: 30rem;
          font-size: 1.05rem;
          line-height: 1.65;
          color: #5e6274;
        }

        .primaryButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 158px;
          padding: 14px 24px;
          border-radius: 8px;
          border: 0;
          background: linear-gradient(180deg, #4a62ff 0%, #3146f5 100%);
          color: #fff;
          text-decoration: none;
          font-size: 0.84rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          box-shadow: 0 10px 22px rgba(49, 70, 245, 0.22);
        }

        .infoStack {
          display: grid;
          gap: 16px;
        }

        .infoCard {
          display: grid;
          grid-template-columns: 56px 1fr;
          gap: 14px;
          align-items: start;
          padding: 16px 18px 16px 16px;
          border: 1px solid rgba(106, 118, 200, 0.24);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.82);
          box-shadow: 0 10px 28px rgba(40, 51, 125, 0.08);
          backdrop-filter: blur(10px);
        }

        .infoBadge {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: #e7ebff;
          color: #3551f2;
          box-shadow: inset 0 0 0 1px rgba(53, 81, 242, 0.08);
        }

        .infoIcon {
          width: 24px;
          height: 24px;
        }

        .infoCard h2,
        .stepCard h3,
        .ctaOverlay h2,
        .sectionTitle {
          margin: 0;
        }

        .infoCard h2 {
          font-size: 1.08rem;
          letter-spacing: 0.01em;
          color: #2b2a33;
        }

        .infoCard p,
        .stepCard p,
        .ctaOverlay p,
        .footer p,
        .footer a {
          color: #5e6274;
        }

        .infoCard p {
          margin: 8px 0 0;
          line-height: 1.55;
          font-size: 0.97rem;
        }

        .sectionBlock {
          padding: 36px 0 10px;
        }

        .sectionDivider {
          margin-top: 8px;
          border-top: 1px solid rgba(61, 72, 120, 0.14);
        }

        .sectionTitle {
          text-align: center;
          padding-top: 34px;
          font-size: clamp(1.55rem, 3.2vw, 2.1rem);
          letter-spacing: -0.03em;
          color: #2a2831;
        }

        .stepsGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-top: 28px;
        }

        .stepCard {
          position: relative;
          padding: 32px 22px 26px;
          border: 1px solid rgba(106, 118, 200, 0.18);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.82);
          box-shadow: 0 12px 30px rgba(40, 51, 125, 0.07);
          text-align: center;
        }

        .stepNumber {
          position: absolute;
          top: -23px;
          left: 50%;
          transform: translateX(-50%);
          width: 46px;
          height: 46px;
          border-radius: 999px;
          background: #3551f2;
          color: #fff;
          display: grid;
          place-items: center;
          font-size: 1.05rem;
          font-weight: 700;
          box-shadow: 0 8px 18px rgba(53, 81, 242, 0.3);
        }

        .stepIcon {
          width: 40px;
          height: 40px;
          margin: 2px auto 18px;
          border-radius: 10px;
          color: #3551f2;
          display: grid;
          place-items: center;
          background: rgba(53, 81, 242, 0.08);
        }

        .stepSvg {
          width: 24px;
          height: 24px;
        }

        .stepCard h3 {
          min-height: 3.4em;
          font-size: 1rem;
          line-height: 1.28;
          color: #292731;
          letter-spacing: 0.01em;
        }

        .stepCard p {
          margin: 14px 0 0;
          line-height: 1.65;
          font-size: 0.93rem;
        }

        .ctaSection {
          padding: 42px 0 48px;
        }

        .ctaVisual {
          position: relative;
          overflow: hidden;
          min-height: 370px;
          border-radius: 16px;
          box-shadow: 0 18px 32px rgba(20, 25, 54, 0.16);
          background: #0f1730;
        }

        .ctaImage {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          filter: saturate(0.95) contrast(0.98);
        }

        .ctaVisual::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(14, 19, 37, 0.1) 0%, rgba(14, 19, 37, 0.1) 100%);
        }

        .ctaOverlay {
          position: relative;
          z-index: 1;
          width: min(82%, 500px);
          margin: 0 auto;
          padding: 32px 28px 28px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(10px);
          text-align: center;
          transform: translateY(84px);
        }

        .ctaKicker {
          margin: 0 0 16px;
          font-size: clamp(1.1rem, 2.8vw, 1.7rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #3551f2;
          text-transform: uppercase;
        }

        .ctaOverlay h2 {
          font-size: 0.98rem;
          line-height: 1.65;
          font-weight: 400;
          margin-bottom: 24px;
        }

        .secondaryButton {
          min-width: 196px;
          padding-inline: 26px;
        }

        .footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          flex-wrap: wrap;
          padding: 24px 0 30px;
          border-top: 1px solid rgba(61, 72, 120, 0.12);
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .footer p {
          margin: 0;
        }

        .footer nav {
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
        }

        .footer a {
          text-decoration: none;
        }

        @media (max-width: 920px) {
          .heroGrid,
          .stepsGrid {
            grid-template-columns: 1fr;
          }

          .heroGrid {
            gap: 22px;
            padding-top: 12px;
          }

          .heroCopy h1 {
            max-width: 100%;
          }

          .ctaOverlay {
            width: min(90%, 560px);
            transform: translateY(92px);
          }
        }

        @media (max-width: 640px) {
          .topbarInner {
            padding: 10px 16px;
          }

          .heroShell {
            padding-inline: 16px;
          }

          .brandLogo {
            width: 112px;
          }

          .heroCopy h1 {
            font-size: clamp(2.2rem, 13vw, 3.3rem);
          }

          .eyebrow {
            margin-bottom: 8px;
          }

          .lead {
            margin-bottom: 20px;
            font-size: 0.98rem;
          }

          .infoCard,
          .stepCard,
          .ctaOverlay {
            border-radius: 14px;
          }

          .sectionBlock {
            padding-top: 30px;
          }

          .stepsGrid {
            gap: 24px;
          }

          .stepCard {
            padding-top: 30px;
          }

          .ctaSection {
            padding-bottom: 24px;
          }

          .ctaVisual {
            min-height: 400px;
          }

          .ctaOverlay {
            width: calc(100% - 24px);
            padding: 26px 18px 22px;
            transform: translateY(112px);
          }

          .ctaOverlay h2 {
            font-size: 0.97rem;
          }

          .footer {
            justify-content: center;
            text-align: center;
          }

          .footer nav {
            justify-content: center;
          }
        }
      `}</style>
    </main>
  )
}
