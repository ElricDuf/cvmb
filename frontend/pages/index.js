import dynamic from 'next/dynamic'
import Link from 'next/link'

const SimplePdf = dynamic(() => import('../components/SimplePdf'), { ssr: false })

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>CVMB - Next.js Frontend</h1>
      <p>This is a minimal scaffold. Use the frontend to render PDFs with react-pdf.</p>
      <SimplePdf />
      <p>Backend API endpoint example: <Link href="/api">/api</Link></p>
    </main>
  )
}
