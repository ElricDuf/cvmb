import Layout from '../components/layout/Layout'

export default function ContactPage() {
  return (
    <Layout>
      <section className="page">
        <h1>Contact</h1>
        <p>Page de contact à compléter avec les coordonnées de la CCI et les canaux de prise de rendez-vous.</p>
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
