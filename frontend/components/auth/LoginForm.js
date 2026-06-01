import { useRouter } from 'next/router'
import { useState } from 'react'

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="fieldIcon">
      <rect x="4.5" y="6.5" width="15" height="11" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5.3 7.4l6.7 5.1 6.7-5.1" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="fieldIcon">
      <path d="M7.2 10V8.1a4.8 4.8 0 0 1 9.6 0V10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="5.5" y="10" width="13" height="9" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="14.25" r="1.1" fill="currentColor" />
      <path d="M12 15.1v2.1" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function EyeIcon({ hidden }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="fieldIcon fieldIconSmall">
      <path d="M2.8 12s3.2-5.8 9.2-5.8 9.2 5.8 9.2 5.8-3.2 5.8-9.2 5.8S2.8 12 2.8 12z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
      {hidden ? <path d="M5 5l14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /> : null}
    </svg>
  )
}

function ProfileMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="profileMark">
      <circle cx="12" cy="12" r="11.2" fill="none" stroke="rgba(53, 81, 242, 0.09)" strokeWidth="1.6" />
      <circle cx="12" cy="9" r="3.1" fill="currentColor" />
      <path d="M6.5 18.2c1.45-3 4.05-4.55 5.5-4.55s4.05 1.55 5.5 4.55" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)

    const identifier = String(formData.get('identifier') || '').trim()
    const password = String(formData.get('password') || '').trim()

    if (!identifier || !password) {
      setError('Identifiant et mot de passe sont requis.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Connexion impossible.')
      }

      window.localStorage.setItem('cvmb:session', JSON.stringify(data))

      if (data.mustChangePassword) {
        await router.push('/account?firstLogin=1')
        return
      }

      await router.push('/dashboard_user')
    } catch (submitError) {
      setError(submitError.message || 'Connexion impossible.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="loginShell" aria-labelledby="login-title">
      <form className="loginCard" onSubmit={handleSubmit}>
        <div className="avatarWrap" aria-hidden="true">
          <ProfileMark />
        </div>

        <h2 id="login-title">Connexion</h2>
        <p className="subtitle">Accédez à votre espace personnel.</p>

        <div className="fieldGroup">
          <label htmlFor="identifier">Identifiant</label>
          <div className="inputShell">
            <MailIcon />
            <input id="identifier" name="identifier" type="email" autoComplete="email" placeholder="jean.dupont@entreprise.fr" />
          </div>
        </div>

        <div className="fieldGroup">
          <div className="labelRow">
            <label htmlFor="password">Mot de passe</label>
            <button type="button" className="forgotLink">
              Mot de passe oublié ?
            </button>
          </div>
          <div className="inputShell">
            <LockIcon />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="passwordToggle"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              aria-pressed={showPassword}
            >
              <EyeIcon hidden={!showPassword} />
            </button>
          </div>
        </div>

        <label className="rememberRow" htmlFor="remember-me">
          <span className="checkboxWrap">
            <input id="remember-me" name="remember-me" type="checkbox" />
            <span className="checkboxVisual" aria-hidden="true" />
          </span>
          <span>Se souvenir de moi</span>
        </label>

        <button className="submitButton" type="submit">
          {submitting ? 'CONNEXION...' : 'SE CONNECTER'}
        </button>

        {error ? <p className="formError" role="alert">{error}</p> : null}
      </form>

      <style jsx>{`
        .loginShell {
          width: 100%;
          min-height: calc(100vh - 180px);
          display: grid;
          place-items: center;
          padding: 36px 24px 54px;
          box-sizing: border-box;
          overflow-x: clip;
        }

        .loginCard {
          width: min(100%, 360px);
          padding: 34px 28px 28px;
          box-sizing: border-box;
          border-radius: 40px;
          background: rgba(255, 255, 255, 0.98);
          box-shadow: 0 26px 54px rgba(33, 40, 95, 0.14);
          text-align: center;
          color: #26252f;
        }

        .avatarWrap {
          display: grid;
          place-items: center;
          margin: 0 auto 18px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(244, 245, 249, 0.96);
          color: #3249f4;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 4px 10px rgba(51, 66, 130, 0.06);
        }

        .profileMark {
          width: 26px;
          height: 26px;
        }

        h2 {
          margin: 0;
          font-size: var(--fs-h2);
          line-height: 1.1;
          letter-spacing: -0.04em;
          color: #26252f;
        }

        .subtitle {
          margin: 8px 0 28px;
          font-size: var(--fs-md);
          color: #6e7283;
        }

        .fieldGroup {
          margin-bottom: 16px;
          text-align: left;
        }

        .fieldGroup label {
          display: inline-flex;
          align-items: center;
          font-size: var(--fs-sm);
          font-weight: 700;
          color: #34343d;
          margin-bottom: 6px;
        }

        .labelRow {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 12px;
        }

        .labelRow label {
          margin-bottom: 0;
        }

        .forgotLink {
          padding: 0;
          border: 0;
          background: transparent;
          font-size: var(--fs-xs);
          font-weight: 700;
          color: #3146f5;
          text-decoration: none;
          white-space: nowrap;
          cursor: pointer;
        }

        .inputShell {
          display: grid;
          grid-template-columns: 18px minmax(0, 1fr) 18px;
          align-items: center;
          gap: 10px;
          min-height: 42px;
          padding: 0 14px;
          border: 0;
          background: #f4f4f7;
          border-radius: 2px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85);
        }

        .fieldIcon {
          width: 18px;
          height: 18px;
          color: #9aa0b3;
          flex: 0 0 auto;
        }

        .fieldIconSmall {
          width: 16px;
          height: 16px;
        }

        input {
          width: 100%;
          min-width: 0;
          height: 100%;
          padding: 0;
          border: 0;
          outline: none;
          background: transparent;
          color: #24242d;
          font-size: var(--fs-md);
        }

        input::placeholder {
          color: #a7a9b7;
        }

        .passwordToggle {
          display: grid;
          place-items: center;
          width: 18px;
          height: 18px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #a4a8b9;
          cursor: pointer;
        }

        .rememberRow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin: 6px 0 28px;
          font-size: var(--fs-sm);
          font-weight: 500;
          color: #5f6374;
          cursor: pointer;
          user-select: none;
        }

        .checkboxWrap {
          position: relative;
          display: inline-grid;
          place-items: center;
          width: 16px;
          height: 16px;
        }

        .checkboxWrap input {
          position: absolute;
          inset: 0;
          margin: 0;
          opacity: 0;
          cursor: pointer;
        }

        .checkboxVisual {
          width: 13px;
          height: 13px;
          border-radius: 50%;
          border: 1px solid #d9dce5;
          background: #f8f8fb;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95);
        }

        .checkboxWrap input:checked + .checkboxVisual {
          background: #3146f5;
          border-color: #3146f5;
          box-shadow: 0 0 0 3px rgba(49, 70, 245, 0.1);
        }

        .submitButton {
          width: 100%;
          height: 46px;
          border: 0;
          border-radius: 999px;
          background: linear-gradient(180deg, #3e49ef 0%, #3146f5 100%);
          color: #ffffff;
          font-size: var(--fs-sm);
          font-weight: 800;
          letter-spacing: 0.04em;
          box-shadow: 0 14px 24px rgba(49, 70, 245, 0.3);
          cursor: pointer;
        }

        .submitButton:disabled {
          opacity: 0.72;
          cursor: progress;
        }

        .formError {
          margin: 14px 0 0;
          color: #b42318;
          font-size: var(--fs-sm);
          font-weight: 600;
          text-align: left;
        }

        @media (max-width: 640px) {
          .loginShell {
            padding-inline: 16px;
          }

          .loginCard {
            width: min(100%, 380px);
            padding: 30px 22px 24px;
            border-radius: 32px;
          }

          h2 {
            font-size: var(--fs-h2);
          }
        }
      `}</style>
    </section>
  )
}
