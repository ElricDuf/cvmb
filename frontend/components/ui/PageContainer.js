/**
 * PageContainer — conteneur de page standard.
 * Centre le contenu et applique une largeur max + un padding homogènes
 * sur toutes les pages.
 *
 * width : "narrow" (740px) | "base" (900px) | "wide" (1180px)
 */
export default function PageContainer({ children, width = 'base', className = '' }) {
  return (
    <section className={`pageContainer ${width} ${className}`}>
      {children}

      <style jsx>{`
        .pageContainer {
          margin: 0 auto;
          padding: 48px 24px 72px;
        }
        .narrow { max-width: var(--content-narrow); }
        .base   { max-width: var(--content-base); }
        .wide   { max-width: var(--content-wide); }

        @media (max-width: 768px) {
          .pageContainer {
            padding: 28px 16px 56px;
          }
        }
      `}</style>
    </section>
  )
}
