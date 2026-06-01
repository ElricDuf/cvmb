import Layout from '../components/layout/Layout'
import { PageContainer, PageHeader } from '../components/ui'

export default function ContactPage() {
  return (
    <Layout>
      <PageContainer>
        <PageHeader
          title="Contact"
          lead="Page de contact à compléter avec les coordonnées de la CCI et les canaux de prise de rendez-vous."
        />
      </PageContainer>
    </Layout>
  )
}
