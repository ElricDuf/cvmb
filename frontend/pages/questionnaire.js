import { useState } from 'react'
import Link from 'next/link'
import Layout from '../components/layout/Layout'

const sections = [
  { id: 1, title: 'Partie 1 :', label: 'Gestion administrative et comptable' },
  { id: 2, title: 'Partie 2 :', label: 'Gestion administrative et comptable' },
  { id: 3, title: 'Partie 3 :', label: 'Gestion administrative et comptable' },
  { id: 4, title: 'Partie 4 :', label: 'Gestion administrative et comptable' },
]

export default function QuestionnairePage() {
  const [selectedOption, setSelectedOption] = useState(null)
  const progress = 20

  return (
    <Layout>
      <div className="questionnaireContainer">
        {/* Navigation des parties */}
        <div className="sectionTabs">
          {sections.map((s) => (
            <div key={s.id} className="tab" data-active={s.id === 2}>
              <span className="tabTitle">{s.title}</span>
              <span className="tabLabel">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Barre de progression */}
        <div className="progressSection">
          <div className="progressText">
            <span>PROGRESSION DU DIAGNOSTIC</span>
            <span className="percentage">{progress}%</span>
          </div>
          <div className="progressTrack">
            <div className="progressBar" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Bouton retour */}
        <button className="backButton">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          QUESTION PRÉCÉDENTE
        </button>

        {/* Carte de question */}
        <div className="questionCard">
          <div className="questionHeader">
            <h2>Avez vous déjà eu recourt au chômage ?</h2>
          </div>
          <div className="optionsList">
            {['Non', 'Oui'].map((option) => (
              <label key={option} className="optionItem">
                <input
                  type="radio"
                  name="chomage"
                  value={option}
                  checked={selectedOption === option}
                  onChange={() => setSelectedOption(option)}
                />
                <span className="radioCustom" />
                <span className="optionText">{option}</span>
              </label>
            ))}
          </div>
          <div className="cardActions">
            <button className="submitBtn">VALIDER</button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .questionnaireContainer {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        /* Tabs */
        .sectionTabs {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 40px;
        }

        .tab {
          background: #d9dffb;
          padding: 20px 15px;
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

        /* Progress Bar */
        .progressSection {
          margin-bottom: 30px;
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

        /* Navigation */
        .backButton {
          display: flex;
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

        /* Question Card */
        .questionCard {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .questionHeader {
          background: #e7ebff;
          padding: 30px;
          text-align: center;
        }

        .questionHeader h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #1e1c28;
          font-weight: 700;
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

        input[type='radio'] {
          display: none;
        }

        .radioCustom {
          width: 20px;
          height: 20px;
          border: 2px solid #ced4da;
          border-radius: 50%;
          margin-right: 15px;
          position: relative;
        }

        input[type='radio']:checked + .radioCustom {
          border-color: #3551f2;
        }

        input[type='radio']:checked + .radioCustom::after {
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

        .submitBtn {
          background: #0026e6;
          color: white;
          border: none;
          padding: 14px 40px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 38, 230, 0.3);
        }

        @media (max-width: 768px) {
          .sectionTabs {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </Layout>
  )
}