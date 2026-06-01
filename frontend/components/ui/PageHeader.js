/**
 * PageHeader — en-tête de page standard (sur-titre + titre + chapô).
 * Garantit la même typographie de titre/chapô sur toutes les pages.
 *
 * eyebrow : petit sur-titre optionnel
 * title   : titre principal (rendu en <h1>)
 * lead    : chapô optionnel
 * align   : "left" (défaut) | "center"
 */
export default function PageHeader({ eyebrow, title, lead, align = 'left', children }) {
  return (
    <header className={`pageHeader ${align}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1 className="page-title">{title}</h1>
      {lead ? <p className="page-lead">{lead}</p> : null}
      {children}

      <style jsx>{`
        .pageHeader {
          margin-bottom: var(--space-6);
        }
        .pageHeader.center {
          text-align: center;
        }
        .pageHeader.center :global(.page-lead) {
          margin-left: auto;
          margin-right: auto;
          max-width: 660px;
        }
      `}</style>
    </header>
  )
}
