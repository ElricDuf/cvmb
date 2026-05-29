import Layout from '../components/layout/Layout'

export default function ConfidentialitePage() {
  return (
    <Layout>
      <section className="page">
        <h1>Confidentialité</h1>
        <p>Page dédiée aux règles de confidentialité, à la gestion des données et à la protection des informations saisies.</p>
      </section>

      <style jsx>{`
        .page {
          max-width: 900px;
          margin: 0 auto;
          padding: 48px 24px 72px;
        }

        h1 {
          margin: 0 0 16px;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text-dark, #20232b);
        }

        p {
          margin: 0;
          color: var(--text-muted, #5e6274);
          line-height: 1.7;
          font-size: 1rem;
        }
      `}</style>
    </Layout>
  )
}
