import Layout from '../components/layout/Layout'
import { PageContainer, PageHeader } from '../components/ui'

export default function FaqPage() {
  return (
    <Layout>
      <PageContainer>
        <PageHeader
          title="FAQ"
          lead="Page dédiée aux réponses fréquentes sur le diagnostic, le questionnaire et l’accompagnement."
        />
      </PageContainer>
    </Layout>
  )
}
