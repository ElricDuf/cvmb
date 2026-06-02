import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/layout/Layout'
import { PageContainer, PageHeader, Card } from '../components/ui'

const EMPTY_FORM = {
  companyName: '',
  managerName: '',
  phone: '',
  workforce: '',
  creationYear: '',
  email: '',
  city: '',
  siret: '',
  contactRequested: true,
}

// État de la recherche SIRENE : idle | loading | found | notfound | error
const LOOKUP_MESSAGES = {
  loading: 'Recherche de votre entreprise dans la base SIRENE…',
  found: 'Champs pré-remplis depuis la base SIRENE. Vous pouvez les corriger si besoin.',
  notfound: 'SIRET introuvable dans la base SIRENE. Saisissez les informations manuellement.',
  error: 'La recherche automatique est indisponible. Saisissez les informations manuellement.',
}

export default function AccompagnementPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [values, setValues] = useState(EMPTY_FORM)
  const [lookupStatus, setLookupStatus] = useState('idle')
  // Mémorise le dernier SIRET interrogé pour éviter les appels redondants au blur
  const lastLookupRef = useRef('')

  const setField = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setField(name, type === 'checkbox' ? checked : value)
  }

  const siretDigits = (values.siret || '').replace(/\D/g, '')
  const canLookup = siretDigits.length === 14

  const lookupSiret = async () => {
    if (!canLookup || lookupStatus === 'loading') return
    if (siretDigits === lastLookupRef.current && lookupStatus === 'found') return

    lastLookupRef.current = siretDigits
    setLookupStatus('loading')

    try {
      const response = await fetch(`/api/sirene/siret/${siretDigits}`)

      if (!response.ok) {
        // 404 : SIRET inconnu ; autre code (clé API absente, INSEE indispo…) : erreur
        setLookupStatus(response.status === 404 ? 'notfound' : 'error')
        return
      }

      const data = await response.json()
      const ent = data && data.entreprise

      if (!ent || ent.found === false) {
        setLookupStatus('notfound')
        return
      }

      // Pré-remplissage : on n'écrase un champ que si SIRENE renvoie une valeur,
      // l'utilisateur reste libre de tout modifier ensuite (fallback manuel).
      setValues((prev) => ({
        ...prev,
        companyName: ent.raisonSociale || prev.companyName,
        workforce: ent.effectifLabel || prev.workforce,
        creationYear: ent.anneeCreation || prev.creationYear,
        city: ent.ville || prev.city,
      }))
      setLookupStatus('found')
    } catch {
      setLookupStatus('error')
    }
  }

  const handleSiretBlur = () => {
    if (canLookup && siretDigits !== lastLookupRef.current) {
      lookupSiret()
    }
  }

  // Mémorisation : récupère le SIRET saisi avant le questionnaire pour le pré-remplir ici.
  const autoLookupDoneRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const ctx = JSON.parse(window.localStorage.getItem('cvmb:questionnaireContext') || 'null')
      const savedSiret = (ctx?.siret || '').replace(/\D/g, '')
      if (savedSiret.length === 14) {
        setField('siret', savedSiret)
      }
    } catch {
      /* ignore */
    }
  }, [])

  // Lance automatiquement la recherche SIRENE une fois le SIRET mémorisé pré-rempli.
  useEffect(() => {
    if (autoLookupDoneRef.current) return
    if (siretDigits.length === 14 && lookupStatus === 'idle') {
      autoLookupDoneRef.current = true
      lookupSiret()
    }
  }, [siretDigits, lookupStatus])

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
      const payload = {
        companyName: values.companyName,
        managerName: values.managerName,
        phone: values.phone,
        workforce: values.workforce,
        creationYear: values.creationYear,
        email: values.email,
        city: values.city,
        siret: values.siret,
        contactRequested: Boolean(values.contactRequested),
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
      <PageContainer width="wide">
        <PageHeader
          align="center"
          title="Finalisez votre demande d'accompagnement"
          lead="Renseignez votre SIRET pour pré-remplir automatiquement vos informations, ou saisissez-les manuellement."
        />

        <Card as="section" padding="md" className="formCard" aria-labelledby="accompagnement-title">
          <form onSubmit={handleSubmit} className="requestForm" id="accompagnement-title">
            <label className="contactToggle">
              <input
                type="checkbox"
                name="contactRequested"
                checked={values.contactRequested}
                onChange={handleChange}
              />
              <span>Souhaitez-vous être contacté par un conseiller de votre CCI ?</span>
            </label>

            {/* --- Recherche SIRENE --- */}
            <div className="siretLookup">
              <label className="siretField">
                <span className="labelRow">
                  <span>SIRET</span>
                  <span className="requiredMark" aria-hidden="true">*</span>
                </span>
                <div className="siretRow">
                  <input
                    type="text"
                    name="siret"
                    inputMode="numeric"
                    maxLength={17}
                    placeholder="14 chiffres"
                    value={values.siret}
                    onChange={handleChange}
                    onBlur={handleSiretBlur}
                    required
                  />
                  <button
                    type="button"
                    className="btn-secondary lookupButton"
                    onClick={lookupSiret}
                    disabled={!canLookup || lookupStatus === 'loading'}
                  >
                    {lookupStatus === 'loading' ? 'RECHERCHE…' : 'REMPLIR AUTOMATIQUEMENT'}
                  </button>
                </div>
              </label>

              <p
                className={`lookupStatus ${lookupStatus}`}
                role="status"
                aria-live="polite"
              >
                {lookupStatus === 'idle'
                  ? 'Astuce : saisissez votre SIRET (14 chiffres) pour remplir les champs automatiquement.'
                  : LOOKUP_MESSAGES[lookupStatus]}
              </p>
            </div>

            <div className="fieldsGrid">
              <label>
                <span className="labelRow">
                  <span>Raison sociale</span>
                  <span className="requiredMark" aria-hidden="true">*</span>
                </span>
                <input type="text" name="companyName" value={values.companyName} onChange={handleChange} required />
              </label>
              <label>
                <span className="labelRow">
                  <span>Nom et prénom du dirigeant</span>
                  <span className="requiredMark" aria-hidden="true">*</span>
                </span>
                <input type="text" name="managerName" value={values.managerName} onChange={handleChange} required />
              </label>
              <label>
                <span className="labelRow">
                  <span>Téléphone</span>
                  <span className="requiredMark" aria-hidden="true">*</span>
                </span>
                <input type="tel" name="phone" value={values.phone} onChange={handleChange} required />
              </label>
              <label>
                <span className="labelRow">
                  <span>Effectif de l&apos;entreprise</span>
                  <span className="requiredMark" aria-hidden="true">*</span>
                </span>
                <select name="workforce" value={values.workforce} onChange={handleChange} required>
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
                <input type="number" name="creationYear" min="1900" max="2026" value={values.creationYear} onChange={handleChange} required />
              </label>
              <label>
                <span className="labelRow">
                  <span>Email</span>
                  <span className="requiredMark" aria-hidden="true">*</span>
                </span>
                <input type="email" name="email" value={values.email} onChange={handleChange} required />
              </label>
              <label>
                Commune
                <input type="text" name="city" value={values.city} onChange={handleChange} />
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
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'VALIDATION EN COURS...' : 'VALIDER'}
              </button>
            </div>
          </form>
        </Card>
      </PageContainer>

      <style jsx>{`
        .formCard {
          max-width: var(--content-narrow);
          margin: 0 auto;
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
          font-size: var(--fs-md);
          color: #2b2f3a;
          font-weight: var(--fw-medium);
        }

        .contactToggle input {
          width: 16px;
          height: 16px;
          accent-color: #3444f4;
        }

        /* --- Bloc de recherche SIRENE --- */
        .siretLookup {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 16px 18px;
          border: 1px solid rgba(49, 70, 245, 0.18);
          border-radius: 16px;
          background: rgba(231, 235, 255, 0.45);
        }

        .siretField {
          display: flex;
          flex-direction: column;
          gap: 7px;
          color: #2a2d36;
          font-size: var(--fs-xs);
          font-weight: var(--fw-semibold);
          letter-spacing: 0.01em;
        }

        .siretRow {
          display: flex;
          gap: 10px;
          align-items: stretch;
        }

        .siretRow input {
          flex: 1;
          min-width: 0;
          height: 42px;
          border: 0;
          border-radius: var(--radius-input, 6px);
          background: #fff;
          color: #222633;
          padding: 0 14px;
          font: inherit;
          outline: none;
          box-shadow: inset 0 0 0 1px rgba(49, 70, 245, 0.16);
          transition: box-shadow 0.18s ease;
        }

        .siretRow input:focus {
          box-shadow: 0 0 0 3px rgba(49, 70, 245, 0.18);
        }

        .lookupButton {
          min-width: auto;
          height: 42px;
          padding: 0 18px;
          font-size: var(--fs-2xs);
          white-space: nowrap;
        }

        .lookupStatus {
          margin: 0;
          font-size: var(--fs-sm);
          line-height: var(--lh-snug);
          color: var(--text-muted);
        }

        .lookupStatus.loading { color: var(--blue-primary); }
        .lookupStatus.found   { color: #1a7f47; }
        .lookupStatus.notfound,
        .lookupStatus.error   { color: #b45309; }

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
          font-size: var(--fs-xs);
          font-weight: var(--fw-semibold);
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
          border-radius: var(--radius-input, 6px);
          background: var(--bg-input, #f3f3f7);
          color: #222633;
          padding: 0 14px;
          font: inherit;
          outline: none;
          box-shadow: inset 0 0 0 1px transparent;
          transition: box-shadow 0.18s ease, background 0.18s ease;
        }

        .fieldsGrid input:focus,
        .fieldsGrid select:focus {
          box-shadow: 0 0 0 3px rgba(49, 70, 245, 0.14);
          background: #ffffff;
        }

        .credentialsCard {
          background: var(--blue-bg, #e7ebff);
          border-left: 6px solid var(--blue-primary, #3146f5);
          border-radius: 20px;
          padding: 18px 18px 16px;
        }

        .credentialsIntro {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 18px;
          color: var(--text-muted);
          font-size: var(--fs-md);
          line-height: var(--lh-normal);
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
          font-size: var(--fs-2xs);
          font-weight: var(--fw-bold);
          margin-top: 2px;
        }

        .formError {
          margin: 0;
          color: var(--danger);
          font-size: var(--fs-md);
          font-weight: var(--fw-semibold);
        }

        .actions {
          display: flex;
          justify-content: center;
          padding-top: 4px;
        }

        @media (max-width: 768px) {
          .fieldsGrid {
            grid-template-columns: 1fr;
          }

          .siretRow {
            flex-direction: column;
          }

          .lookupButton {
            width: 100%;
          }

          .contactToggle {
            align-items: flex-start;
          }
        }
      `}</style>
    </Layout>
  )
}
