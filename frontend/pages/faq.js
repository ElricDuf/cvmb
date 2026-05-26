import Layout from '../components/layout/Layout'

export default function FaqPage() {
  return (
    <Layout>
      <section className="page">
        <h1>FAQ</h1>
        <p>Page dédiée aux réponses fréquentes sur le diagnostic, le questionnaire et l’accompagnement.</p>
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
