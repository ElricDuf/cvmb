import Layout from '../components/layout/Layout'

export default function MentionsLegalesPage() {
  return (
    <Layout>
      <section className="page">
        <h1>Mentions légales</h1>
        <p>Page dédiée aux informations légales du service. Le contenu détaillé peut être complété ici.</p>
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
          color: #1e1c28;
        }

        p {
          margin: 0;
          color: #5e6274;
          line-height: 1.7;
        }
      `}</style>
    </Layout>
  )
}
