import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/layout/Layout'

const ANSWERS_STORAGE_KEY = 'cvmb:questionnaireAnswers'

export default function QuestionnairePage() {
  const router = useRouter()
  const [payload, setPayload] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [completed, setCompleted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const selectedSize = useMemo(() => {
    const value = router.query.size
    return Array.isArray(value) ? value[0] : value
  }, [router.query.size])

  const selectedSector = useMemo(() => {
    const value = router.query.sector
    return Array.isArray(value) ? value[0] : value
  }, [router.query.sector])

  useEffect(() => {
    if (!router.isReady) {
      return
    }

    if (!selectedSize || !selectedSector) {
      setError('Sélectionnez une taille d’entreprise et un secteur avant de commencer le questionnaire.')
      setPayload(null)
      setLoading(false)
      setCompleted(false)
      return
    }

    let cancelled = false

    async function loadQuestions() {
      setLoading(true)
      setError('')
      setCompleted(false)
      setCurrentIndex(0)
      setAnswers({})

      try {
        const response = await fetch(
          `/api/questionnaire?size=${encodeURIComponent(selectedSize)}&sector=${encodeURIComponent(selectedSector)}`,
        )
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Impossible de charger les questions filtrées.')
        }

        if (!cancelled) {
          setPayload(data)
          // Restauration des réponses sauvegardées automatiquement (même contexte)
          if (typeof window !== 'undefined') {
            try {
              const saved = JSON.parse(window.localStorage.getItem(ANSWERS_STORAGE_KEY) || 'null')
              if (saved && saved.size === selectedSize && saved.sector === selectedSector && saved.answers) {
                setAnswers(saved.answers)
              }
            } catch {
              /* ignore */
            }
          }
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError.message || 'Impossible de charger les questions filtrées.')
          setPayload(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadQuestions()

    return () => {
      cancelled = true
    }
  }, [router.isReady, selectedSize, selectedSector])

  const questions = useMemo(() => {
    if (!payload?.categories) {
      return []
    }

    return payload.categories.flatMap((category) =>
      category.questions.map((question) => ({
        ...question,
        category,
      })),
    )
  }, [payload])

  const currentQuestion = questions[currentIndex] || null
  const totalQuestions = questions.length
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] || '' : ''
  const progress = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0

  // Sauvegarde automatique des réponses
  useEffect(() => {
    if (typeof window === 'undefined' || !selectedSize || !selectedSector) {
      return
    }
    if (Object.keys(answers).length === 0) {
      return
    }
    try {
      window.localStorage.setItem(
        ANSWERS_STORAGE_KEY,
        JSON.stringify({ size: selectedSize, sector: selectedSector, answers }),
      )
    } catch {
      /* ignore */
    }
  }, [answers, selectedSize, selectedSector])

  const handlePrevious = () => {
    if (completed) {
      setCompleted(false)
      return
    }

    if (currentIndex === 0) {
      router.push('/evaluate')
      return
    }

    setCurrentIndex((value) => Math.max(value - 1, 0))
  }

  const handleNext = () => {
    if (!currentQuestion || !selectedAnswer) {
      return
    }

    if (currentIndex >= totalQuestions - 1) {
      setCompleted(true)
      return
    }

    setCurrentIndex((value) => value + 1)
  }

  const handleAnswerChange = (questionId, value) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: value,
    }))
  }

  const handleSubmitDiagnostic = async () => {
    if (!payload || submitting) {
      return
    }

    const answerEntries = questions
      .map((question) => ({
        questionId: question.id,
        responseId: answers[question.id],
      }))
      .filter((entry) => Boolean(entry.responseId))

    if (answerEntries.length !== questions.length) {
      setSubmitError('Toutes les questions doivent recevoir une réponse avant de générer le diagnostic.')
      return
    }

    setSubmitting(true)
    setSubmitError('')

    let savedSession = null

    if (typeof window !== 'undefined') {
      try {
        savedSession = JSON.parse(window.localStorage.getItem('cvmb:session') || 'null')
      } catch {
        savedSession = null
      }
    }

    const userId = savedSession?.user?.id || null
    const entrepriseId = savedSession?.entreprise?.id || savedSession?.enterprise?.id || null
    let questionnaireContext = null

    if (typeof window !== 'undefined') {
      try {
        questionnaireContext = JSON.parse(window.localStorage.getItem('cvmb:questionnaireContext') || 'null')
      } catch {
        questionnaireContext = null
      }
    }

    try {
      const response = await fetch('/api/diagnostics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          size: selectedSize,
          sector: selectedSector,
          userId,
          entrepriseId,
          siret: questionnaireContext?.siret || null,
          answers: answerEntries,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Impossible de calculer le diagnostic.')
      }

      window.localStorage.setItem('cvmb:lastDiagnostic', JSON.stringify(data))
      window.localStorage.setItem('cvmb:lastDiagnosticId', data.id)
      window.localStorage.removeItem(ANSWERS_STORAGE_KEY)

      await router.push({
        pathname: '/diagnostic',
        query: { diagnosticId: data.id },
      })
    } catch (submitDiagnosticError) {
      setSubmitError(submitDiagnosticError.message || 'Impossible de calculer le diagnostic.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!router.isReady || loading) {
    return (
      <Layout>
        <div className="quiz">
          <div className="stateCard">
            <p>Chargement des questions…</p>
          </div>
        </div>
        <style jsx>{`
          .quiz {
            max-width: 760px;
            margin: 0 auto;
            padding: 40px 24px 64px;
          }
          .stateCard {
            background: #fff;
            border: 1px solid var(--border-subtle);
            border-radius: 16px;
            box-shadow: var(--shadow-card);
            padding: 40px;
            color: var(--text-muted);
            text-align: center;
          }
        `}</style>
      </Layout>
    )
  }

  const isLast = currentIndex >= totalQuestions - 1
  const categoryName = currentQuestion?.category?.nom || ''

  return (
    <Layout>
      <div className="quiz">
        {/* En-tête : compteur + catégorie + barre de progression */}
        {!error && totalQuestions > 0 ? (
          <div className="quizTop">
            <div className="quizMeta">
              <span className="counter">
                Question {Math.min(currentIndex + 1, totalQuestions)} sur {totalQuestions}
              </span>
              {categoryName ? <span className="topCategory">{categoryName}</span> : null}
            </div>
            <div className="track">
              <div className="bar" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="stateCard errorCard">
            <p>{error}</p>
            <button type="button" className="btnGhost" onClick={() => router.push('/evaluate')}>
              Revenir à la saisie
            </button>
          </div>
        ) : completed ? (
          <div className="stateCard completionCard">
            <p className="completionTitle">Questionnaire terminé</p>
            <p className="completionText">
              Toutes les questions ont reçu une réponse. Vous pouvez générer votre diagnostic.
            </p>
            {submitError ? <p className="submitError">{submitError}</p> : null}
            <div className="footer">
              <button type="button" className="btnPrev" onClick={handlePrevious}>
                <ArrowLeft /> Précédent
              </button>
              <span className="autosave">
                <SaveIcon /> Réponses sauvegardées automatiquement
              </span>
              <button type="button" className="btnNext" onClick={handleSubmitDiagnostic} disabled={submitting}>
                {submitting ? 'Calcul…' : 'Valider'} <ArrowRight />
              </button>
            </div>
          </div>
        ) : currentQuestion ? (
          <>
            <p className="eyebrow catEyebrow">{categoryName}</p>
            <h1 className="question">{currentQuestion.texte}</h1>

            <div className="options">
              {(currentQuestion.responses || []).map((option) => {
                const checked = Number(selectedAnswer) === option.id
                return (
                  <label key={option.id} className="option" data-selected={checked}>
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option.id}
                      checked={checked}
                      onChange={() => handleAnswerChange(currentQuestion.id, option.id)}
                    />
                    <span className="radio" aria-hidden="true" />
                    <span className="optLabel">{option.texte}</span>
                  </label>
                )
              })}
            </div>

            <div className="footer">
              <button type="button" className="btnPrev" onClick={handlePrevious}>
                <ArrowLeft /> Précédent
              </button>
              <span className="autosave">
                <SaveIcon /> Réponses sauvegardées automatiquement
              </span>
              <button type="button" className="btnNext" onClick={handleNext} disabled={!selectedAnswer}>
                {isLast ? 'Terminer' : 'Suivant'} <ArrowRight />
              </button>
            </div>
          </>
        ) : (
          <div className="stateCard">
            <p>Aucune question ne correspond aux critères sélectionnés.</p>
            <button type="button" className="btnGhost" onClick={() => router.push('/evaluate')}>
              Modifier la sélection
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .quiz {
          max-width: 760px;
          margin: 0 auto;
          padding: 36px 24px 64px;
        }

        /* --- En-tête --- */
        .quizTop {
          margin-bottom: 36px;
        }

        .quizMeta {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 16px;
          margin-bottom: 12px;
        }

        .counter {
          font-size: var(--fs-sm);
          font-weight: var(--fw-semibold);
          color: var(--text-muted);
        }

        .topCategory {
          font-size: var(--fs-sm);
          font-weight: var(--fw-bold);
          color: var(--blue-primary);
          text-align: right;
        }

        .track {
          height: 6px;
          background: #e6e8f4;
          border-radius: 999px;
          overflow: hidden;
        }

        .bar {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #9333ea 0%, #3551f2 100%);
          transition: width 0.4s ease;
        }

        /* --- Question --- */
        .catEyebrow {
          margin: 0 0 10px;
        }

        .question {
          margin: 0 0 28px;
          font-size: var(--fs-h2);
          font-weight: var(--fw-black);
          line-height: var(--lh-tight);
          letter-spacing: -0.02em;
          color: var(--text-dark);
        }

        /* --- Options --- */
        .options {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 36px;
        }

        .option {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          background: #fff;
          border: 1px solid var(--border-subtle);
          border-radius: 14px;
          box-shadow: 0 4px 14px rgba(32, 41, 72, 0.05);
          cursor: pointer;
          transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
        }

        .option:hover {
          border-color: rgba(49, 70, 245, 0.45);
        }

        .option[data-selected='true'] {
          border-color: var(--blue-primary);
          background: #f6f7ff;
          box-shadow: 0 0 0 3px rgba(49, 70, 245, 0.12);
        }

        .option input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .radio {
          width: 22px;
          height: 22px;
          border: 2px solid #c8cde0;
          border-radius: 50%;
          flex: 0 0 auto;
          position: relative;
          transition: border-color 0.18s ease;
        }

        .option[data-selected='true'] .radio {
          border-color: var(--blue-primary);
        }

        .option[data-selected='true'] .radio::after {
          content: '';
          position: absolute;
          inset: 3px;
          border-radius: 50%;
          background: var(--blue-primary);
        }

        .optLabel {
          font-size: var(--fs-lead);
          font-weight: var(--fw-semibold);
          color: var(--text-dark);
        }

        /* --- Pied de page --- */
        .footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .autosave {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: var(--fs-sm);
          color: var(--text-muted);
          text-align: center;
        }

        .btnPrev,
        .btnNext {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          border-radius: var(--radius-btn);
          font-size: var(--fs-sm);
          font-weight: var(--fw-bold);
          cursor: pointer;
          transition: transform 0.18s ease, filter 0.18s ease, background 0.18s ease;
        }

        .btnPrev {
          padding: 13px 22px;
          background: #fff;
          color: var(--text-dark);
          border: 1px solid var(--border-subtle);
          box-shadow: 0 4px 12px rgba(32, 41, 72, 0.06);
        }

        .btnPrev:hover {
          background: #f6f7fb;
        }

        .btnNext {
          padding: 14px 26px;
          border: 0;
          color: #fff;
          background: var(--btn-gradient);
          box-shadow: var(--shadow-btn);
        }

        .btnNext:hover:not(:disabled) {
          filter: brightness(1.06);
          transform: translateY(-2px);
        }

        .btnNext:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* --- États --- */
        .stateCard {
          background: #fff;
          border: 1px solid var(--border-subtle);
          border-radius: 16px;
          box-shadow: var(--shadow-card);
          padding: 40px;
          color: var(--text-muted);
          text-align: center;
        }

        .errorCard {
          color: #8a2d4f;
          background: #fff7fa;
        }

        .completionCard {
          color: var(--text-dark);
        }

        .completionTitle {
          margin: 0 0 8px;
          font-size: var(--fs-h2);
          font-weight: var(--fw-black);
          color: var(--text-dark);
        }

        .completionText {
          margin: 0 0 24px;
          color: var(--text-muted);
        }

        .completionCard .footer {
          margin-top: 8px;
        }

        .submitError {
          margin: 0 0 16px;
          color: var(--danger);
          font-size: var(--fs-md);
        }

        .btnGhost {
          margin-top: 16px;
          padding: 12px 20px;
          border: 0;
          border-radius: var(--radius-btn);
          background: var(--blue-primary);
          color: #fff;
          font-weight: var(--fw-bold);
          font-size: var(--fs-sm);
          cursor: pointer;
        }

        @media (max-width: 600px) {
          .quiz {
            padding: 24px 16px 48px;
          }

          .footer {
            flex-wrap: wrap;
            gap: 12px;
          }

          .autosave {
            order: 3;
            width: 100%;
            justify-content: center;
          }

          .btnPrev {
            order: 1;
          }

          .btnNext {
            order: 2;
            margin-left: auto;
          }

          .option {
            padding: 16px 18px;
          }

          .optLabel {
            font-size: var(--fs-base);
          }
        }
      `}</style>
    </Layout>
  )
}

/* --- Petites icônes inline --- */
function ArrowLeft() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}

function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <path d="M17 21v-8H7v8M7 3v5h8" />
    </svg>
  )
}
