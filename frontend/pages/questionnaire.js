import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/layout/Layout'

const sectorLabels = {
  commerce: 'Commerçant',
  artisan: 'Artisan',
  liberal: 'Profession libérale',
  industrial: 'Industriel',
  services: 'Prestataire de services',
}

const companySizeLabels = {
  TPE: 'TPE',
  PME: 'PME',
}

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
  const activeCategoryId = currentQuestion?.category?.id || null

  const handlePrevious = () => {
    if (currentIndex === 0) {
      router.push('/evaluate')
      return
    }

    setCurrentIndex((value) => Math.max(value - 1, 0))
    setCompleted(false)
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

    try {
      const response = await fetch('/api/diagnostics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          size: selectedSize,
          sector: selectedSector,
          answers: answerEntries,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Impossible de calculer le diagnostic.')
      }

      window.localStorage.setItem('cvmb:lastDiagnostic', JSON.stringify(data))
      window.localStorage.setItem('cvmb:lastDiagnosticId', data.id)

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
        <div className="questionnaireContainer">
          <div className="stateCard">
            <p>Chargement des questions filtrées...</p>
          </div>
        </div>

        <style jsx>{`
          .questionnaireContainer {
            max-width: 1000px;
            margin: 0 auto;
            padding: 40px 24px;
          }

          .stateCard {
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
            padding: 40px;
            color: #5e6274;
            text-align: center;
          }
        `}</style>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="questionnaireContainer">
        <div className="sectionTabs">
          {(payload?.categories || []).map((category) => (
            <div key={category.id} className="tab" data-active={activeCategoryId === category.id}>
              <span className="tabTitle">Partie {category.ordre} :</span>
              <span className="tabLabel">{category.nom}</span>
              <span className="tabMeta">
                {category.questions.length} question{category.questions.length > 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>

        <div className="progressSection">
          <div className="progressText">
            <span>PROGRESSION DU DIAGNOSTIC</span>
            <span className="percentage">{progress}%</span>
          </div>
          <div className="progressTrack">
            <div className="progressBar" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="metaRow" aria-label="Contexte du questionnaire">
          <span className="metaChip">Taille: {companySizeLabels[selectedSize] || selectedSize}</span>
          <span className="metaChip">Secteur: {sectorLabels[selectedSector] || selectedSector}</span>
          <span className="metaChip">
            {totalQuestions} question{totalQuestions > 1 ? 's' : ''} trouvée{totalQuestions > 1 ? 's' : ''}
          </span>
        </div>

        {error ? (
          <div className="stateCard errorCard">
            <p>{error}</p>
            <button type="button" className="returnButton" onClick={() => router.push('/evaluate')}>
              Revenir à la saisie
            </button>
          </div>
        ) : completed ? (
          <div className="stateCard completionCard">
            <p className="completionTitle">Questionnaire terminé</p>
            <p>Toutes les questions filtrées pour cette entreprise ont été posées.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
              <button type="button" className="submitBtn" onClick={handleSubmitDiagnostic} disabled={submitting}>
                {submitting ? 'Calcul en cours...' : 'Valider'}
              </button>
              <button type="button" className="returnButton" onClick={() => router.push('/evaluate')}>
                Recommencer
              </button>
            </div>
            {submitError ? <p className="submitError">{submitError}</p> : null}
          </div>
        ) : currentQuestion ? (
          <>
            <button className="backButton" type="button" onClick={handlePrevious}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              {currentIndex === 0 ? 'RETOUR À LA SAISIE' : 'QUESTION PRÉCÉDENTE'}
            </button>

            <div className="questionCard">
              <div className="questionHeader">
                <div className="questionHeaderRow">
                  <span className="questionIndex">
                    Question {currentIndex + 1} / {totalQuestions}
                  </span>
                  <span className="questionScope">{currentQuestion.category.nom}</span>
                </div>
                <h2>{currentQuestion.texte}</h2>
              </div>

              <div className="optionsList">
                {(currentQuestion.responses || []).map((option) => (
                  <label key={option.id} className="optionItem">
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option.id}
                      checked={Number(selectedAnswer) === option.id}
                      onChange={() => handleAnswerChange(currentQuestion.id, option.id)}
                    />
                    <span className="radioCustom" />
                    <span className="optionText">{option.texte}</span>
                  </label>
                ))}
              </div>

              <div className="cardActions">
                <button type="button" className="submitBtn" onClick={handleNext} disabled={!selectedAnswer}>
                  {currentIndex >= totalQuestions - 1 ? 'TERMINER' : 'SUIVANTE'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="stateCard">
            <p>Aucune question ne correspond aux critères sélectionnés.</p>
            <button type="button" className="returnButton" onClick={() => router.push('/evaluate')}>
              Modifier la sélection
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .questionnaireContainer {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        .sectionTabs {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 2px;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 24px;
        }

        .tab {
          background: #d9dffb;
          padding: 18px 15px 16px;
          text-align: left;
          color: #3d4878;
          transition: background 0.3s;
        }

        .tab[data-active='true'] {
          background: #9ba8f5;
          color: #1e1c28;
        }

        .tabTitle {
          display: block;
          font-weight: 800;
          font-size: 0.9rem;
          margin-bottom: 4px;
        }

        .tabLabel {
          font-size: 0.85rem;
          line-height: 1.3;
          display: block;
        }

        .tabMeta {
          display: inline-flex;
          margin-top: 8px;
          font-size: 0.72rem;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: inherit;
          opacity: 0.8;
        }

        .progressSection {
          margin-bottom: 18px;
        }

        .progressText {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          font-size: 0.75rem;
          font-weight: 700;
          color: #8a8fa3;
          margin-bottom: 10px;
          letter-spacing: 0.05em;
        }

        .percentage {
          font-size: 1.4rem;
          color: #3551f2;
        }

        .progressTrack {
          height: 8px;
          background: #e2e5f1;
          border-radius: 10px;
          overflow: hidden;
        }

        .progressBar {
          height: 100%;
          background: #3551f2;
          transition: width 0.4s ease;
        }

        .metaRow {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 20px;
        }

        .metaChip {
          display: inline-flex;
          align-items: center;
          min-height: 32px;
          padding: 0 12px;
          border-radius: 999px;
          background: rgba(53, 81, 242, 0.08);
          color: #3551f2;
          font-size: 0.82rem;
          font-weight: 700;
        }

        .backButton {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: #5e6274;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          margin-bottom: 20px;
          padding: 0;
        }

        .questionCard {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .questionHeader {
          background: #e7ebff;
          padding: 28px 30px 30px;
          text-align: center;
        }

        .questionHeaderRow {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .questionIndex,
        .questionScope {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .questionIndex {
          background: rgba(53, 81, 242, 0.14);
          color: #3551f2;
        }

        .questionScope {
          background: rgba(255, 255, 255, 0.7);
          color: #34406f;
        }

        .questionHeader h2 {
          margin: 0;
          font-size: 1.45rem;
          color: #1e1c28;
          font-weight: 700;
          line-height: 1.35;
        }

        .optionsList {
          padding: 30px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .optionItem {
          display: flex;
          align-items: center;
          padding: 20px 24px;
          border: 1px solid #eef0f7;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .optionItem:hover {
          background: #f9faff;
        }

        .optionItem input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .radioCustom {
          width: 20px;
          height: 20px;
          border: 2px solid #ced4da;
          border-radius: 50%;
          margin-right: 15px;
          position: relative;
          flex: 0 0 auto;
        }

        .optionItem input:checked + .radioCustom {
          border-color: #3551f2;
        }

        .optionItem input:checked + .radioCustom::after {
          content: '';
          position: absolute;
          inset: 3px;
          background: #3551f2;
          border-radius: 50%;
        }

        .optionText {
          font-size: 1.05rem;
          color: #1e1c28;
        }

        .cardActions {
          padding: 0 30px 40px;
          display: flex;
          justify-content: flex-end;
        }

        .submitBtn,
        .returnButton {
          border: none;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
        }

        .submitBtn {
          background: #0026e6;
          color: white;
          padding: 14px 40px;
          box-shadow: 0 4px 12px rgba(0, 38, 230, 0.3);
        }

        .submitBtn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }

        .stateCard {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          padding: 40px;
          color: #5e6274;
          text-align: center;
        }

        .submitError {
          margin-top: 16px;
          color: #b42318;
          font-size: 0.95rem;
          text-align: center;
        }

        .errorCard {
          color: #8a2d4f;
          background: #fff7fa;
        }

        .completionCard {
          color: #34406f;
        }

        .completionTitle {
          margin-top: 0;
          font-size: 1.3rem;
          font-weight: 700;
          color: #1e1c28;
        }

        .returnButton {
          margin-top: 14px;
          padding: 12px 18px;
          background: #3551f2;
          color: #fff;
        }

        @media (max-width: 860px) {
          .sectionTabs {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .questionnaireContainer {
            padding: 24px 16px;
          }

          .sectionTabs {
            grid-template-columns: 1fr;
          }

          .questionHeader h2 {
            font-size: 1.18rem;
          }

          .optionsList {
            padding: 20px;
          }

          .optionItem {
            padding: 16px 18px;
          }

          .optionText {
            font-size: 0.98rem;
          }

          .cardActions {
            padding: 0 20px 24px;
          }

          .submitBtn {
            width: 100%;
          }
        }
      `}</style>
    </Layout>
  )
}