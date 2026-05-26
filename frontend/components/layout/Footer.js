import Link from 'next/link'

export default function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="footerContent">
          <p>&copy; CCI Bordeaux Gironde. Tous droits réservés.</p>
          <nav className="footerNav">
            <Link href="/">Accueil</Link>
            <Link href="/evaluate">Faire le diagnostic</Link>
            <Link href="/dashboard_user">Tableau de bord</Link>
            <Link href="/mentions-legales">Mentions légales</Link>
            <Link href="/confidentialite">Confidentialité</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/faq">FAQ</Link>
          </nav>
        </div>
      </footer>

      <style jsx>{`
        .footer {
          width: 100%;
          background: rgba(255, 255, 255, 0.95);
          border-top: 1px solid rgba(38, 37, 47, 0.06);
          margin-top: 60px;
        }

        .footerContent {
          max-width: 1180px;
          margin: 0 auto;
          padding: 40px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }

        .footerContent p {
          margin: 0;
          font-size: 0.95rem;
          color: #5e6274;
        }

        .footerNav {
          display: flex;
          gap: 32px;
          flex-wrap: wrap;
        }

        .footerNav a {
          color: #24306f;
          text-decoration: none;
          font-size: 0.95rem;
          transition: color 0.15s ease;
        }

        .footerNav a:hover {
          color: #3146f5;
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .footerContent {
            flex-direction: column;
            text-align: center;
          }

          .footerNav {
            justify-content: center;
          }
        }
      `}</style>
    </>
  )
}
