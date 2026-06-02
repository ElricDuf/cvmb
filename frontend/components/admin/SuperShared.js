// Petits composants partagés pour la console super-admin.

export function Modal({ title, children, onClose }) {
  return (
    <div className="ov" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="md" onClick={(e) => e.stopPropagation()}>
        <div className="mdHead">
          <h3>{title}</h3>
          <button type="button" onClick={onClose} aria-label="Fermer">×</button>
        </div>
        <div className="mdBody">{children}</div>
      </div>
      <style jsx>{`
        .ov { position: fixed; inset: 0; background: rgba(20, 24, 45, 0.45); display: grid; place-items: center; padding: 20px; z-index: 60; overflow-y: auto; }
        .md { background: #fff; border-radius: 16px; width: min(560px, 100%); box-shadow: 0 30px 60px rgba(20, 24, 45, 0.3); max-height: 90vh; display: flex; flex-direction: column; }
        .mdHead { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #f1f2f6; }
        .mdHead h3 { margin: 0; font-size: var(--fs-h3); color: #1d2030; }
        .mdHead button { border: 0; background: transparent; font-size: 26px; line-height: 1; color: #9499ac; cursor: pointer; }
        .mdBody { padding: 22px 24px; overflow-y: auto; }
      `}</style>
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <label className="fieldRow">
      <span>{label}</span>
      {children}
      <style jsx>{`
        .fieldRow { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; font-size: var(--fs-xs); font-weight: 700; color: #5b6075; }
        .fieldRow :global(input), .fieldRow :global(select), .fieldRow :global(textarea) { padding: 10px 12px; border: 1px solid #e0e2ec; border-radius: 8px; font-size: var(--fs-sm); font-weight: 500; font-family: inherit; }
        .fieldRow :global(textarea) { min-height: 90px; resize: vertical; }
      `}</style>
    </label>
  )
}
