import {
  Document,
  Page,
  View,
  Text,
  Svg,
  Line,
  Polygon,
  Circle,
  StyleSheet,
} from '@react-pdf/renderer'

/* ─── Palette ─────────────────────────────────────────── */
const BLUE      = '#3146f5'
const BLUE_LIGHT = '#e7ebff'
const MUTED     = '#5e6274'
const DARK      = '#20232b'
const WHITE     = '#ffffff'
const BORDER    = '#e2e8f0'

/* ─── Styles ──────────────────────────────────────────── */
const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: '#f7f7fc',
    paddingBottom: 48,
  },

  /* Header */
  header: {
    backgroundColor: BLUE,
    padding: '24 32 20',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadgeText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: WHITE,
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.3,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    marginTop: 2,
  },
  headerDate: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 9,
    textAlign: 'right',
  },

  /* Body */
  body: {
    padding: '24 32 0',
  },

  /* Hero score */
  heroRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  heroCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: '20 24',
    border: `1 solid ${BORDER}`,
  },
  heroLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: MUTED,
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  heroScore: {
    fontSize: 42,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
    lineHeight: 1,
  },
  heroScoreUnit: {
    fontSize: 18,
    color: BLUE,
  },
  heroDesc: {
    fontSize: 9.5,
    color: MUTED,
    marginTop: 8,
    lineHeight: 1.5,
  },
  heroTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
    marginBottom: 6,
  },

  /* Section title */
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottom: `1 solid ${BORDER}`,
  },

  /* Radar bars */
  radarSection: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: '16 20',
    border: `1 solid ${BORDER}`,
    marginBottom: 16,
  },
  radarRow: {
    marginBottom: 10,
  },
  radarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  radarName: {
    fontSize: 9.5,
    color: DARK,
    fontFamily: 'Helvetica-Bold',
  },
  radarPct: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
  },
  radarTrack: {
    height: 6,
    backgroundColor: BLUE_LIGHT,
    borderRadius: 999,
    overflow: 'hidden',
  },
  radarFill: {
    height: 6,
    borderRadius: 999,
  },

  /* Pillar cards */
  pillarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  pillar: {
    width: '47.5%',
    backgroundColor: WHITE,
    borderRadius: 10,
    padding: '14 16',
    border: `1 solid ${BORDER}`,
  },
  pillarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  pillarName: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  pillarDesc: {
    fontSize: 8.5,
    color: MUTED,
    lineHeight: 1.5,
    marginBottom: 6,
  },
  pillarAdvice: {
    fontSize: 8,
    color: '#1e40af',
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    padding: '5 8',
    lineHeight: 1.4,
    marginTop: 4,
  },
  pillarMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTop: `1 solid ${BORDER}`,
  },
  pillarMetaText: {
    fontSize: 8,
    color: MUTED,
  },

  /* Advice global */
  adviceBox: {
    backgroundColor: '#eff6ff',
    borderLeft: `4 solid ${BLUE}`,
    borderRadius: 8,
    padding: '10 14',
    marginBottom: 16,
  },
  adviceLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  adviceText: {
    fontSize: 9,
    color: '#1e40af',
    lineHeight: 1.5,
  },

  /* Footer */
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTop: `1 solid ${BORDER}`,
    padding: '10 32',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: WHITE,
  },
  footerText: {
    fontSize: 7.5,
    color: MUTED,
  },
  footerPage: {
    fontSize: 7.5,
    color: MUTED,
  },
})

/* ─── Helpers ─────────────────────────────────────────── */
const toneColors = {
  red:    { bg: '#fef2f2', text: '#dc2626' },
  orange: { bg: '#fff7ed', text: '#c2410c' },
  green:  { bg: '#f0fdf4', text: '#15803d' },
  blue:   { bg: '#eff6ff', text: '#1d4ed8' },
}

function barColor(pct) {
  if (pct >= 75) return '#16a34a'
  if (pct >= 50) return '#3146f5'
  if (pct >= 25) return '#f97316'
  return '#ef4444'
}

function formatDate() {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date())
}

const sectorLabels = {
  commerce: 'Commerce', artisan: 'Artisanat',
  liberal: 'Professions libérales', industrial: 'Industrie', services: 'Services',
}
const sizeLabels = { TPE: 'TPE', PME: 'PME' }

/* ─── Radar SVG ───────────────────────────────────────── */
function RadarSvg({ categories }) {
  const cx = 160, cy = 155, maxR = 110
  const n = categories.length
  const angle = (i) => (2 * Math.PI * i) / n - Math.PI / 2
  const pt = (i, pct) => {
    const r = (pct / 100) * maxR
    return [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))]
  }
  const polyStr = (pct) => categories.map((_, i) => pt(i, pct).map(v => v.toFixed(1)).join(',')).join(' ')
  const dataStr = categories.map((c, i) => pt(i, c.percentage).map(v => v.toFixed(1)).join(',')).join(' ')

  return (
    <Svg viewBox="0 0 320 310" style={{ width: 320, height: 310 }}>
      {/* Grille */}
      {[25, 50, 75, 100].map((pct) => (
        <Polygon
          key={pct}
          points={polyStr(pct)}
          fill={pct === 100 ? 'rgba(49,70,245,0.04)' : 'none'}
          stroke="rgba(49,70,245,0.15)"
          strokeWidth="0.8"
        />
      ))}
      {/* Axes */}
      {categories.map((_, i) => {
        const [ex, ey] = pt(i, 100)
        return (
          <Line key={i} x1={cx} y1={cy} x2={ex} y2={ey}
            stroke="rgba(49,70,245,0.12)" strokeWidth="0.8" />
        )
      })}
      {/* Données */}
      <Polygon points={dataStr} fill="rgba(49,70,245,0.15)" stroke="#3146f5" strokeWidth="1.5" />
      {/* Points */}
      {categories.map((cat, i) => {
        const [px, py] = pt(i, cat.percentage)
        return (
          <Circle key={cat.id} cx={px} cy={py} r="4"
            fill={toneColors[cat.tone]?.text || BLUE} stroke={WHITE} strokeWidth="1.5" />
        )
      })}
      {/* Labels */}
      {categories.map((cat, i) => {
        const labelR = maxR + 22
        const lx = cx + labelR * Math.cos(angle(i))
        const ly = cy + labelR * Math.sin(angle(i))
        return (
          <Text key={cat.id}
            x={lx} y={ly}
            style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', fill: DARK, textAnchor: 'middle' }}
          >
            {cat.nom} {cat.percentage}%
          </Text>
        )
      })}
    </Svg>
  )
}

/* ─── Document principal ──────────────────────────────── */
export default function DiagnosticDocument({ diagnostic }) {
  const categories = diagnostic?.categories || []
  const global = diagnostic?.global || {}
  const filters = diagnostic?.filters || {}
  const date = formatDate()

  const sector = filters.sector ? (sectorLabels[filters.sector] || filters.sector) : null
  const size   = filters.size   ? (sizeLabels[filters.size]     || filters.size)   : null

  return (
    <Document
      title="Diagnostic – Comment va ma boîte ?"
      author="CCI Bordeaux Gironde"
      subject="Résultats du diagnostic d'entreprise"
    >
      {/* ── Page 1 : synthèse ── */}
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerBrand}>
            <View style={s.headerBadge}>
              <Text style={s.headerBadgeText}>CMB</Text>
            </View>
            <View>
              <Text style={s.headerTitle}>Comment va ma boîte ?</Text>
              <Text style={s.headerSub}>CCI Bordeaux Gironde</Text>
            </View>
          </View>
          <View>
            <Text style={s.headerDate}>Rapport du {date}</Text>
            {(sector || size) ? (
              <Text style={[s.headerDate, { marginTop: 3 }]}>
                {[size, sector].filter(Boolean).join(' · ')}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={s.body}>
          {/* Hero */}
          <View style={s.heroRow}>
            <View style={[s.heroCard, { alignItems: 'center', maxWidth: 140 }]}>
              <Text style={s.heroLabel}>Score global</Text>
              <Text style={s.heroScore}>
                {global.percentage ?? 0}
                <Text style={s.heroScoreUnit}>%</Text>
              </Text>
              <Text style={[s.heroLabel, { marginTop: 6 }]}>
                {global.score ?? 0} / {global.scoreMax ?? 0} pts
              </Text>
            </View>

            <View style={[s.heroCard, { flex: 1 }]}>
              <Text style={s.heroTitle}>{global.title || 'Diagnostic calculé'}</Text>
              <Text style={s.heroDesc}>
                {global.description || 'Résultats calculés à partir de vos réponses au questionnaire.'}
              </Text>
              {global.advice ? (
                <View style={[s.adviceBox, { marginTop: 10, marginBottom: 0 }]}>
                  <Text style={s.adviceLabel}>CONSEIL</Text>
                  <Text style={s.adviceText}>{global.advice}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Radar */}
          {categories.length >= 3 ? (
            <View style={[s.radarSection, { alignItems: 'center' }]}>
              <Text style={s.sectionTitle}>Répartition des scores par catégorie</Text>
              <RadarSvg categories={categories} />
            </View>
          ) : null}

          {/* Barres synthèse */}
          <View style={s.radarSection}>
            <Text style={s.sectionTitle}>Taux de maîtrise par catégorie</Text>
            {categories.map((cat) => {
              const color = barColor(cat.percentage)
              const tone  = toneColors[cat.tone] || toneColors.blue
              return (
                <View key={cat.id} style={s.radarRow}>
                  <View style={s.radarHeader}>
                    <Text style={s.radarName}>{cat.nom}</Text>
                    <Text style={[s.radarPct, { color }]}>{cat.percentage}%</Text>
                  </View>
                  <View style={s.radarTrack}>
                    <View style={[s.radarFill, { width: `${cat.percentage}%`, backgroundColor: color }]} />
                  </View>
                </View>
              )
            })}
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>© CCI Bordeaux Gironde — Diagnostic confidentiel</Text>
          <Text style={s.footerPage} render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} / ${totalPages}`
          } />
        </View>
      </Page>

      {/* ── Page 2 : détail par catégorie ── */}
      {categories.length > 0 ? (
        <Page size="A4" style={s.page}>
          <View style={s.header}>
            <View style={s.headerBrand}>
              <View style={s.headerBadge}>
                <Text style={s.headerBadgeText}>CMB</Text>
              </View>
              <View>
                <Text style={s.headerTitle}>Analyse détaillée</Text>
                <Text style={s.headerSub}>Comment va ma boîte ?</Text>
              </View>
            </View>
            <Text style={s.headerDate}>{date}</Text>
          </View>

          <View style={s.body}>
            <Text style={[s.sectionTitle, { marginTop: 8 }]}>Détail par pilier</Text>
            <View style={s.pillarsGrid}>
              {categories.map((cat) => {
                const tone = toneColors[cat.tone] || toneColors.blue
                return (
                  <View key={cat.id} style={s.pillar}>
                    <View style={s.pillarHeader}>
                      <Text style={s.pillarName}>
                        {cat.ordre ? `${cat.ordre}. ` : ''}{cat.nom}
                      </Text>
                      <Text style={[s.badge, { backgroundColor: tone.bg, color: tone.text }]}>
                        {cat.difficultyPercentage}% diff.
                      </Text>
                    </View>
                    {cat.description ? (
                      <Text style={s.pillarDesc}>{cat.description}</Text>
                    ) : null}
                    {cat.advice ? (
                      <Text style={s.pillarAdvice}>💡 {cat.advice}</Text>
                    ) : null}
                    <View style={s.pillarMeta}>
                      <Text style={s.pillarMetaText}>{cat.score} / {cat.scoreMax} pts</Text>
                      <Text style={[s.pillarMetaText, { fontFamily: 'Helvetica-Bold', color: barColor(cat.percentage) }]}>
                        {cat.percentage}% maîtrise
                      </Text>
                    </View>
                  </View>
                )
              })}
            </View>
          </View>

          <View style={s.footer} fixed>
            <Text style={s.footerText}>© CCI Bordeaux Gironde — Diagnostic confidentiel</Text>
            <Text style={s.footerPage} render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            } />
          </View>
        </Page>
      ) : null}
    </Document>
  )
}
