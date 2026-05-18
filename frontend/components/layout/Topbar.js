import brandLogo from '../../Logo-CCIBG-bleu_Web 2.png'

export default function Topbar() {
  return (
    <>
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
      `}</style>
    </>
  )
}
