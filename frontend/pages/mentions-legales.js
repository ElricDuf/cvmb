import Layout from '../components/layout/Layout'
import { PageContainer, PageHeader } from '../components/ui'

export default function MentionsLegalesPage() {
  return (
    <Layout>
      <PageContainer>
        <PageHeader
          title="Mentions légales"
          lead="Page dédiée aux informations légales du service. Le contenu détaillé peut être complété ici."
        />
      </PageContainer>
    </Layout>
  )
}
