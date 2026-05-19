import Layout from '../components/layout/Layout'
import LoginForm from '../components/auth/LoginForm'

export default function LoginPage() {
  return (
    <Layout>
      <LoginForm />

      <style jsx>{`
        :global(body) {
          overflow-x: hidden;
          background:
            radial-gradient(circle at top center, rgba(255, 255, 255, 0.78), transparent 36%),
            linear-gradient(180deg, #faf8ff 0%, #f6f6fb 100%);
        }
      `}</style>
    </Layout>
  )
}
