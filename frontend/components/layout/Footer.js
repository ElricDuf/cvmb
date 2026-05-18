export default function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="footerContent">
          <p>&copy; CCI Bordeaux Gironde. Tous droits réservés.</p>
          <nav className="footerNav">
            <a href="#">Mentions légales</a>
            <a href="#">Confidentialité</a>
            <a href="#">Contact</a>
            <a href="#">FAQ</a>
          </nav>
        </div>
      </footer>

      <style jsx>{`
        .footer {
          width: 100%;
          background: rgba(255, 255, 255, 0.92);
          border-top: 1px solid rgba(61, 72, 120, 0.12);
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
          color: #3551f2;
          text-decoration: none;
          font-size: 0.95rem;
          transition: color 0.2s ease;
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
