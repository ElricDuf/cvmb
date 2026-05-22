import { useRouter } from 'next/router'
import { useState } from 'react'
import Layout from '../components/layout/Layout'

const sectorOptions = [
  {
    id: 'merchant',
    title: 'Commerçant',
    description: 'Vente de marchandises au détail ou en gros en boutique ou en ligne.',
    icon: 'store',
  },
  {
    id: 'artisan',
    title: 'Artisan',
    description: 'Activité de production, de transformation ou de prestation de services manuels.',
    icon: 'tools',
  },
  {
    id: 'liberal',
    title: 'Profession Libérale',
    description: 'Services intellectuels, techniques ou de soins produits de manière indépendante.',
    icon: 'document',
  },
  {
    id: 'industrial',
    title: 'Industriel',
    description: 'Transformation de matières premières et fabrication de produits à grande échelle.',
    icon: 'factory',
  },
  {
    id: 'services',
    title: 'Prestataire de services',
    description: 'Activités tertiaires destinées aux particuliers ou aux entreprises.',
    icon: 'services',
  },
]

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="topbarIcon">
      <circle cx="12" cy="8" r="3.25" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6.5 19.25c1.35-2.9 4-4.5 5.5-4.5s4.15 1.6 5.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="labelIcon">
      <circle cx="12" cy="12" r="8.75" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 10.1v5.15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="7.3" r="1.05" fill="currentColor" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="checkIcon">
      <path d="M6.6 12.3l3.2 3.2 7.6-7.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StoreIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="sectorSvg">
      <path d="M5.2 9.1h13.6M6.4 9.1v9h11.2v-9" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 5.9h10v3.2H7z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9.1 18.1v-4.2h5.8v4.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ToolsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="sectorSvg">
      <path d="M8.2 6.2a3.1 3.1 0 0 0 4.1 4.1l5.3 5.3a1.5 1.5 0 0 1-2.1 2.1l-5.3-5.3a3.1 3.1 0 0 0-4.1-4.1l2.1 2.1" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.2 5.2l4.6 4.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="sectorSvg">
      <path d="M7 4.6h7.6l2.4 2.4v12.4H7z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M14.6 4.6v2.7h2.4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9.1 11h5.8M9.1 14h4.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function FactoryIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="sectorSvg">
      <path d="M5.2 18.1h13.6V9.2l-4 2.4V9.2l-4 2.4V9.2l-5.6 3.2z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M8 18.1v-3.6M11.5 18.1v-2.1M15 18.1v-4.3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function ServicesIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="sectorSvg">
      <path d="M8.2 6.4l9.4 9.4M7.4 10.4a2.3 2.3 0 1 0 3.3-3.3L7.4 10.4z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.8 13l1.8 1.8M16.6 15.8l1.4 1.4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function SectorIcon({ icon }) {
  if (icon === 'store') return <StoreIcon />
  if (icon === 'tools') return <ToolsIcon />
  if (icon === 'document') return <DocumentIcon />
  if (icon === 'factory') return <FactoryIcon />
  return <ServicesIcon />
}

export default function EvaluatePage() {
  const router = useRouter()
  const [companySize, setCompanySize] = useState('TPE')
  const [selectedSector, setSelectedSector] = useState('artisan')

  const handleSubmit = (event) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const siret = String(formData.get('siret') || '').trim().replace(/\D/g, '')

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        'cvmb:questionnaireContext',
        JSON.stringify({
          siret,
          size: companySize,
          sector: selectedSector,
        }),
      )
    }

    router.push({
      pathname: '/questionnaire',
      query: {
        size: companySize,
        sector: selectedSector,
      },
    })
  }

  return (
    <Layout>
      <section className="evaluatePage">
        <section className="formPanel" aria-labelledby="initial-form-title">
          <h1 id="initial-form-title">Saisie des informations entreprise</h1>

          <form className="formGrid" onSubmit={handleSubmit}>
            <div className="fieldBlock">
              <label htmlFor="siret" className="fieldLabelRow">
                <span className="labelText">Numéro de SIRET</span>
                <InfoIcon />
              </label>
              <input id="siret" name="siret" type="text" inputMode="numeric" autoComplete="off" aria-describedby="siret-help" />
              <p id="siret-help" className="srOnly">
                Saisissez le numéro de SIRET de l’entreprise.
              </p>
            </div>

            <div className="sizeSwitch" role="group" aria-label="Taille de l’entreprise">
              <span className="sizeHighlight" style={{ transform: companySize === 'PME' ? 'translateX(100%)' : 'translateX(0)' }} />
              <button
                type="button"
                className="sizeButton"
                data-active={companySize === 'TPE'}
                onClick={() => setCompanySize('TPE')}
              >
                TPE
              </button>
              <button
                type="button"
                className="sizeButton"
                data-active={companySize === 'PME'}
                onClick={() => setCompanySize('PME')}
              >
                PME
              </button>
            </div>

            <div className="sectorBlock">
              <h2>Secteur d&apos;activité</h2>
              <div className="sectorGrid">
                {sectorOptions.map((sector) => {
                  const isSelected = selectedSector === sector.id

                  return (
                    <button
                      key={sector.id}
                      type="button"
                      className="sectorCard"
                      data-selected={isSelected}
                      onClick={() => setSelectedSector(sector.id)}
                    >
                      <span className="sectorCheck" aria-hidden="true">
                        <CheckIcon />
                      </span>
                      <span className="sectorBadge" aria-hidden="true">
                        <SectorIcon icon={sector.icon} />
                      </span>
                      <span className="sectorName">{sector.title}</span>
                      <span className="sectorDescription">{sector.description}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="actions">
              <button type="submit" className="submitButton">
                VALIDER
              </button>
            </div>
          </form>
        </section>
      </section>

      <style jsx>{`
        .evaluatePage {
          max-width: 1180px;
          margin: 0 auto;
          padding: 28px 24px 0;
        }

        .formPanel {
          max-width: 668px;
          margin: 0 auto;
          text-align: center;
        }

        .formPanel h1 {
          margin: 0;
          font-size: clamp(1.55rem, 2.8vw, 2.05rem);
          font-weight: 700;
          color: #1e1c28;
          letter-spacing: -0.02em;
        }

        .formGrid {
          margin-top: 26px;
          text-align: left;
        }

        .fieldBlock {
          margin-bottom: 16px;
        }

        /* Label row: text + small info icon on same line */
        .fieldLabelRow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.95rem;
          font-weight: 400;
          color: #1f1d27;
          width: fit-content;
          white-space: nowrap;
        }

        .labelText {
          display: inline-block;
          white-space: nowrap;
        }

        .labelIcon {
          width: 15px;
          height: 15px;
          color: #8a8fa3;
          flex: 0 0 auto;
          transform: translateY(1px);
        }

        input {
          display: block;
          width: 100%;
          height: 34px;
          padding: 0 12px;
          border-radius: 6px;
          border: 1px solid rgba(61, 72, 120, 0.16);
          background: rgba(255, 255, 255, 0.96);
          color: #1e1c28;
          box-shadow: inset 0 1px 2px rgba(27, 34, 67, 0.03);
          outline: none;
          margin-top: 6px;
        }

        input:focus {
          border-color: #4f5bd6;
          box-shadow: 0 0 0 3px rgba(79, 91, 214, 0.12);
        }

        .sizeSwitch {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: stretch;
          padding: 4px;
          margin-bottom: 16px;
          border-radius: 999px;
          background: #efeff4;
          border: 1px solid rgba(61, 72, 120, 0.14);
          box-shadow: inset 0 2px 6px rgba(27, 34, 67, 0.05);
          overflow: hidden;
        }

        .sizeHighlight {
          position: absolute;
          inset: 4px;
          width: calc(50% - 4px);
          border-radius: 999px;
          background: #ffffff;
          box-shadow: 0 4px 12px rgba(27, 34, 67, 0.12);
          transition: transform 180ms ease;
        }

        .sizeButton {
          position: relative;
          z-index: 1;
          height: 36px;
          border: 0;
          border-radius: 999px;
          background: transparent;
          color: #2b2a33;
          font-size: 0.98rem;
          font-weight: 400;
          cursor: pointer;
        }

        .sizeButton[data-active='false'] {
          color: #5d6171;
        }

        .sectorBlock {
          margin-top: 6px;
        }

        .sectorBlock h2 {
          margin: 0 0 10px;
        }

        .sectorGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .sectorCard {
          position: relative;
          min-height: 146px;
          padding: 16px 14px 14px;
          border-radius: 10px;
          border: 1px solid rgba(61, 72, 120, 0.12);
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 10px 24px rgba(39, 44, 86, 0.05);
          cursor: pointer;
          text-align: center;
          transition:
            transform 160ms ease,
            box-shadow 160ms ease,
            border-color 160ms ease;
        }

        .sectorCard:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 28px rgba(39, 44, 86, 0.08);
        }

        .sectorCard[data-selected='true'] {
          border-color: #4b58bb;
          box-shadow: 0 12px 28px rgba(53, 81, 242, 0.12);
        }

        .sectorCheck {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: #3551f2;
          color: #fff;
          display: grid;
          place-items: center;
          opacity: 0;
          transform: scale(0.85);
          transition: opacity 160ms ease, transform 160ms ease;
        }

        .sectorCard[data-selected='true'] .sectorCheck {
          opacity: 1;
          transform: scale(1);
        }

        .checkIcon {
          width: 14px;
          height: 14px;
        }

        .sectorBadge {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          margin: 0 auto 11px;
          border-radius: 999px;
          color: #3551f2;
          background: #ececf6;
        }

        .sectorSvg {
          width: 19px;
          height: 19px;
        }

        .sectorName {
          display: block;
          margin-bottom: 8px;
          font-size: 0.86rem;
          line-height: 1.25;
          font-weight: 400;
          color: #1f1d27;
        }

        .sectorDescription {
          display: block;
          font-size: 0.78rem;
          line-height: 1.45;
          color: #22202d;
        }

        .actions {
          display: flex;
          justify-content: center;
          padding: 24px 0 8px;
        }

        .submitButton {
          min-width: 125px;
          height: 42px;
          padding: 0 24px;
          border: 0;
          border-radius: 6px;
          background: linear-gradient(180deg, #4a62ff 0%, #3146f5 100%);
          color: #fff;
          font-size: 0.84rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          box-shadow: 0 10px 22px rgba(49, 70, 245, 0.22);
          cursor: pointer;
        }

        .srOnly {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        @media (max-width: 860px) {
          .evaluatePage {
            padding-top: 22px;
          }

          .sectorGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .evaluatePage {
            padding-inline: 16px;
          }

          .formPanel h1 {
            font-size: clamp(1.25rem, 6vw, 1.6rem);
          }

          .sectorGrid {
            grid-template-columns: 1fr;
          }

          .sectorCard {
            min-height: 138px;
          }

          .submitButton {
            width: 100%;
            max-width: 180px;
          }

          /* On small screens, keep same stacked layout */
          .fieldBlock {
            margin-bottom: 12px;
          }

          .fieldLabelRow {
            font-size: 0.95rem;
          }

          .fieldLabelRow .labelIcon {
            width: 14px;
            height: 14px;
          }
        }
      `}</style>
    </Layout>
  )
}