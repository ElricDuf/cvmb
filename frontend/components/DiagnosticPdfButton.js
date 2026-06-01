import { PDFDownloadLink } from "@react-pdf/renderer"
import DiagnosticDocument from "./DiagnosticDocument"

const btnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "11px 22px",
  borderRadius: "8px",
  background: "#ffffff",
  border: "1.5px solid #3146f5",
  color: "#3146f5",
  fontSize: "0.88rem",
  fontWeight: "700",
  letterSpacing: "0.02em",
  cursor: "pointer",
  textDecoration: "none",
  whiteSpace: "nowrap",
}

const btnLoadingStyle = {
  ...btnStyle,
  opacity: 0.7,
  cursor: "wait",
  pointerEvents: "none",
}

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ width: 16, height: 16, flexShrink: 0 }}
    >
      <path
        d="M12 3v12M8 11l4 4 4-4M5 19h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function DiagnosticPdfButton({ diagnostic }) {
  const filename = "diagnostic-cvmb-" + new Date().toISOString().slice(0, 10) + ".pdf"

  return (
    <PDFDownloadLink
      document={<DiagnosticDocument diagnostic={diagnostic} />}
      fileName={filename}
      style={{ textDecoration: "none" }}
    >
      {({ loading }) => (
        <span style={loading ? btnLoadingStyle : btnStyle}>
          <DownloadIcon />
          {loading ? "Preparation du PDF..." : "Telecharger le diagnostic (PDF)"}
        </span>
      )}
    </PDFDownloadLink>
  )
}
