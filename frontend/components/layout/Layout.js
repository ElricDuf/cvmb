import Topbar from './Topbar'
import Footer from './Footer'

export default function Layout({ children, showTopbar = true, showFooter = true }) {
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
