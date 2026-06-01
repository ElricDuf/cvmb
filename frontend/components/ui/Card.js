/**
 * Card — carte de contenu standard (fond blanc, rayon et ombre homogènes).
 *
 * padding : "sm" | "md" (défaut) | "lg"
 * as      : élément HTML rendu (div, article, section, form...)
 */
export default function Card({ children, padding = 'md', as = 'div', className = '', ...rest }) {
  const Tag = as
  return (
    <Tag className={`uiCard pad-${padding} ${className}`} {...rest}>
      {children}

      <style jsx>{`
        .uiCard {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-card);
          box-shadow: var(--shadow-card);
        }
        .pad-sm { padding: 18px; }
        .pad-md { padding: 28px; }
        .pad-lg { padding: 40px; }

        @media (max-width: 768px) {
          .uiCard {
            border-radius: 20px;
          }
          .pad-md, .pad-lg { padding: 20px; }
        }
      `}</style>
    </Tag>
  )
}
