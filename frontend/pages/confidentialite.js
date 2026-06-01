import Layout from '../components/layout/Layout'
import { PageContainer, PageHeader } from '../components/ui'

export default function ConfidentialitePage() {
  return (
    <Layout>
      <PageContainer>
        <PageHeader
          title="Confidentialité"
          lead="Page dédiée aux règles de confidentialité, à la gestion des données et à la protection des informations saisies."
        />
      </PageContainer>
    </Layout>
  )
}
