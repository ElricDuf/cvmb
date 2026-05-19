import { useState } from 'react'
import Layout from '../components/layout/Layout'

const initialCredentials = {
  identifier: '72aa8bfa81a14233819e73d035fc426a',
  password: 'JKHjAg',
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="copyIcon">
      <rect x="8.2" y="8.2" width="8.8" height="8.8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.2 15.8H5.4c-.9 0-1.6-.7-1.6-1.6V6.2c0-.9.7-1.6 1.6-1.6h8c.9 0 1.6.7 1.6 1.6V7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export default function AccompagnementPage() {
  const [copiedField, setCopiedField] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    alert('Demande d\'accompagnement envoyée (simulation)')
  }

  const copyValue = async (value, fieldName) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(fieldName)
    } catch {
      setCopiedField('')
    }
  }

  return (
    <Layout>
      <section className="accompagnementPage">
        <header className="hero">
          <h1>Finalisez votre demande d&apos;accompagnement</h1>
          <p>Un conseiller CCI reviendra vers vous pour approfondir votre diagnostic.</p>
        </header>

        <section className="formCard" aria-labelledby="accompagnement-title">
          <form onSubmit={handleSubmit} className="requestForm" id="accompagnement-title">
            <label className="contactToggle">
              <input type="checkbox" defaultChecked />
              <span>Souhaitez-vous être contacté par un conseiller de votre CCI ?</span>
            </label>

            <div className="fieldsGrid">
              <label>
                <span className="labelRow">
                  <span>Raison sociale</span>
                  <span className="requiredMark" aria-hidden="true">*</span>
                </span>
                <input type="text" name="companyName" required />
              </label>
              <label>
                <span className="labelRow">
                  <span>Nom et prénom du dirigeant</span>
                  <span className="requiredMark" aria-hidden="true">*</span>
                </span>
                <input type="text" name="managerName" required />
              </label>
              <label>
                <span className="labelRow">
                  <span>Téléphone</span>
                  <span className="requiredMark" aria-hidden="true">*</span>
                </span>
                <input type="tel" name="phone" required />
              </label>
              <label>
                <span className="labelRow">
                  <span>Effectif de l&apos;entreprise</span>
                  <span className="requiredMark" aria-hidden="true">*</span>
                </span>
                <select name="workforce" required defaultValue="">
                  <option value="" disabled>
                    Sélectionner...
                  </option>
                  <option>1 à 9 salariés</option>
                  <option>10 à 19 salariés</option>
                  <option>20 à 49 salariés</option>
                  <option>50 salariés et plus</option>
                </select>
              </label>
              <label>
                <span className="labelRow">
                  <span>Année de création de l&apos;entreprise</span>
                  <span className="requiredMark" aria-hidden="true">*</span>
                </span>
                <input type="number" name="creationYear" min="1900" max="2026" required />
              </label>
              <label>
                <span className="labelRow">
                  <span>Email</span>
                  <span className="requiredMark" aria-hidden="true">*</span>
                </span>
                <input type="email" name="email" required />
              </label>
              <label>
                Commune
                <input type="text" name="city" />
              </label>
              <label>
                <span className="labelRow">
                  <span>SIRET</span>
                  <span className="requiredMark" aria-hidden="true">*</span>
                </span>
                <input type="text" name="siret" inputMode="numeric" required />
              </label>
            </div>

            <div className="credentialsCard">
              <div className="credentialsIntro">
                <span className="infoIcon" aria-hidden="true">i</span>
                <p>
                  Nous vous avons créé un espace personnel. Cet espace vous sera accessible avec l&apos;identifiant et mot de passe ci-dessous. Vous pourrez, une fois connecté, changer ces valeurs.
                </p>
              </div>

              <div className="credentialsGrid">
                <label>
                  IDENTIFIANT
                  <div className="readonlyField">
                    <input type="text" value={initialCredentials.identifier} readOnly aria-readonly="true" />
                    <button type="button" className="copyButton" onClick={() => copyValue(initialCredentials.identifier, 'identifier')} aria-label="Copier l'identifiant">
                      <CopyIcon />
                    </button>
                  </div>
                  {copiedField === 'identifier' ? <span className="copyHint">Identifiant copié</span> : null}
                </label>

                <label>
                  MOT DE PASSE
                  <div className="readonlyField">
                    <input type="text" value={initialCredentials.password} readOnly aria-readonly="true" />
                    <button type="button" className="copyButton" onClick={() => copyValue(initialCredentials.password, 'password')} aria-label="Copier le mot de passe">
                      <CopyIcon />
                    </button>
                  </div>
                  {copiedField === 'password' ? <span className="copyHint">Mot de passe copié</span> : null}
                </label>
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
        .accompagnementPage {
          max-width: 1180px;
          margin: 0 auto;
          padding: 40px 24px 72px;
        }

        .hero {
          text-align: center;
          margin-bottom: 28px;
        }

        .hero h1 {
          margin: 0;
          color: #20232b;
          font-size: clamp(2.1rem, 4.5vw, 3.15rem);
          line-height: 1.02;
          letter-spacing: -0.04em;
          font-weight: 800;
        }

        .hero p {
          margin: 14px auto 0;
          max-width: 660px;
          color: #676b77;
          font-size: 1rem;
        }

        .formCard {
          max-width: 740px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.94);
          border: 1px solid rgba(94, 100, 130, 0.08);
          border-radius: 32px;
          box-shadow: 0 26px 60px rgba(57, 69, 126, 0.12);
          padding: 28px;
        }

        .requestForm {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .contactToggle {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-size: 0.95rem;
          color: #2b2f3a;
          font-weight: 500;
        }

        .contactToggle input {
          width: 16px;
          height: 16px;
          accent-color: #3444f4;
        }

        .fieldsGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px 20px;
        }

        .fieldsGrid label,
        .credentialsGrid label {
          display: flex;
          flex-direction: column;
          gap: 7px;
          color: #2a2d36;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.01em;
        }

        .labelRow {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          width: fit-content;
        }

        .requiredMark {
          color: #e11d48;
        }

        .fieldsGrid input,
        .fieldsGrid select {
          height: 42px;
          border: 0;
          border-radius: 2px;
          background: #f3f3f7;
          color: #222633;
          padding: 0 14px;
          font: inherit;
          outline: none;
          box-shadow: inset 0 0 0 1px transparent;
          transition: box-shadow 0.18s ease, background 0.18s ease;
        }

        .fieldsGrid input:focus,
        .fieldsGrid select:focus,
        .readonlyField:focus-within {
          box-shadow: 0 0 0 3px rgba(52, 68, 244, 0.14);
          background: #ffffff;
        }

        .credentialsCard {
          background: #e9e9ee;
          border-left: 6px solid #3444f4;
          border-radius: 20px;
          padding: 18px 18px 16px;
        }

        .credentialsIntro {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 18px;
          color: #5e6270;
          font-size: 0.9rem;
          line-height: 1.45;
        }

        .infoIcon {
          width: 16px;
          height: 16px;
          min-width: 16px;
          border-radius: 50%;
          border: 1px solid #3444f4;
          color: #3444f4;
          display: grid;
          place-items: center;
          font-size: 0.7rem;
          font-weight: 700;
          margin-top: 2px;
        }

        .credentialsGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .readonlyField {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border-radius: 2px;
          padding-right: 10px;
        }

        .readonlyField input {
          flex: 1;
          height: 42px;
          border: 0;
          background: transparent;
          padding: 0 12px;
          font: inherit;
          color: #2c2f3a;
          outline: none;
        }

        .copyButton {
          width: 30px;
          height: 30px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #3444f4;
          display: grid;
          place-items: center;
          cursor: pointer;
        }

        .copyIcon {
          width: 16px;
          height: 16px;
        }

        .copyHint {
          color: #3444f4;
          font-size: 0.74rem;
          font-weight: 700;
        }

        .actions {
          display: flex;
          justify-content: center;
          padding-top: 4px;
        }

        .submitButton {
          min-width: 112px;
          height: 38px;
          padding: 0 28px;
          border: 0;
          border-radius: 999px;
          background: linear-gradient(180deg, #3c48f4 0%, #2e35de 100%);
          color: #ffffff;
          font-size: 0.94rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          box-shadow: 0 16px 28px rgba(52, 68, 244, 0.22);
          cursor: pointer;
        }

        .submitButton:hover {
          filter: brightness(1.04);
        }

        @media (max-width: 768px) {
          .accompagnementPage {
            padding: 28px 16px 56px;
          }

          .formCard {
            padding: 18px;
            border-radius: 24px;
          }

          .fieldsGrid,
          .credentialsGrid {
            grid-template-columns: 1fr;
          }

          .hero {
            margin-bottom: 18px;
          }

          .hero p {
            font-size: 0.96rem;
          }

          .contactToggle {
            align-items: flex-start;
          }
        }
      `}</style>
    </Layout>
  )
}