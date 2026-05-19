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
        :global(html) {
          scroll-behavior: smooth;
        }

        :global(body) {
          margin: 0;
          font-family: Arial, Helvetica, sans-serif;
          background:
            radial-gradient(circle at top left, rgba(67, 95, 255, 0.05), transparent 28%),
            radial-gradient(circle at top right, rgba(67, 95, 255, 0.04), transparent 22%),
            linear-gradient(180deg, #fcfbff 0%, #f7f7fc 100%);
          color: #26252f;
        }

        .layoutMain {
          min-height: calc(100vh - 180px);
          color: #26252f;
        }
      `}</style>
    </>
  )
}
