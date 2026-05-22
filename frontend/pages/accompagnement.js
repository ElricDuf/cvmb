import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/layout/Layout'

export default function AccompagnementPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    const form = event.currentTarget

    if (!form.reportValidity()) {
      return
    }

    const diagnosticPayloadRaw = window.localStorage.getItem('cvmb:lastDiagnostic')

    if (!diagnosticPayloadRaw) {
      setError('Votre diagnostic est manquant. Relancez le questionnaire avant de valider la demande.')
      return
    }

    let diagnosticPayload = null

    try {
      diagnosticPayload = JSON.parse(diagnosticPayloadRaw)
    } catch {
      setError('Le diagnostic enregistré est invalide. Relancez le questionnaire avant de valider la demande.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const formData = new FormData(form)
      const payload = {
        companyName: formData.get('companyName'),
        managerName: formData.get('managerName'),
        phone: formData.get('phone'),
        workforce: formData.get('workforce'),
        creationYear: formData.get('creationYear'),
        email: formData.get('email'),
        city: formData.get('city'),
        siret: formData.get('siret'),
        contactRequested: formData.get('contactRequested') === 'on',
        diagnostic: diagnosticPayload,
      }

      const response = await fetch('/api/accompagnement/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Impossible de valider la demande d\'accompagnement.')
      }

      window.localStorage.setItem('cvmb:lastAccount', JSON.stringify(data.user))
      window.localStorage.setItem(
        'cvmb:session',
        JSON.stringify({
          user: data.user,
          entreprise: data.entreprise || null,
          mustChangePassword: Boolean(data.user?.mustChangePassword),
        }),
      )
      await router.push('/dashboard_user')
    } catch (submitError) {
      setError(submitError.message || 'Impossible de valider la demande d\'accompagnement.')
    } finally {
      setSubmitting(false)
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
              <input type="checkbox" name="contactRequested" defaultChecked />
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
                  La validation crée votre compte, relie votre diagnostic à votre entreprise et vous demandera de définir votre mot de passe à la première arrivée dans votre espace.
                </p>
              </div>
            </div>

            {error ? <p className="formError" role="alert">{error}</p> : null}

            <div className="actions">
              <button type="submit" className="submitButton" disabled={submitting}>
                {submitting ? 'VALIDATION EN COURS...' : 'VALIDER'}
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

        .fieldsGrid label {
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

        .formError {
          margin: 0;
          color: #b42318;
          font-size: 0.92rem;
          font-weight: 600;
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

        .submitButton:disabled {
          opacity: 0.72;
          cursor: progress;
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

          .fieldsGrid {
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