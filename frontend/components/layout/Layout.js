import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Topbar from './Topbar'
import Footer from './Footer'

const ADMIN_ALLOWED_PATHS = ['/diagnostic']

function useRedirectAdmins() {
  const router = useRouter()
  useEffect(() => {
    if (ADMIN_ALLOWED_PATHS.includes(router.pathname)) return
    try {
      const raw = window.localStorage.getItem('cvmb:session')
      if (!raw) return
      const session = JSON.parse(raw)
      const role = session?.user?.role
      if (role === 'admin_local' || role === 'admin_national') {
        router.replace('/admin')
      }
    } catch {
      // session illisible, on ignore
    }
  }, [router])
}

export default function Layout({ children, showTopbar = true, showFooter = true }) {
  useRedirectAdmins()

  return (
    <>
      {showTopbar ? <Topbar /> : null}
      <main className="layoutMain">
        {children}
      </main>
      {showFooter ? <Footer /> : null}

      <style jsx>{`
        .layoutMain {
          min-height: calc(100vh - 180px);
        }
      `}</style>
    </>
  )
}
