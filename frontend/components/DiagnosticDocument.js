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

/* ─── Palette ──────────────────────────────────────────── */
const BLUE       = '#3146f5'
const BLUE_LIGHT = '#eff6ff'
const BLUE_BG    = '#e7ebff'
const MUTED      = '#64748b'
const DARK       = '#1e293b'
const WHITE      = '#ffffff'
const BORDER     = '#e2e8f0'
const BG_PAGE    = '#f8fafc'
const BG_CARD    = '#ffffff'

const TONE = {
  red:    { bg: '#fef2f2', text: '#dc2626', border: '#fee2e2', bar: '#ef4444' },
  orange: { bg: '#fff7ed', text: '#c2410c', border: '#ffedd5', bar: '#f97316' },
  green:  { bg: '#f0fdf4', text: '#15803d', border: '#dcfce7', bar: '#16a34a' },
  blue:   { bg: '#eff6ff', text: '#1d4ed8', border: '#dbeafe', bar: '#3146f5' },
}

function getTone(tone) {
  return TONE[tone] || TONE.blue
}

function barColor(pct) {
  if (pct >= 75) return '#16a34a'
  if (pct >= 50) return '#3146f5'
  if (pct >= 25) return '#f97316'
  return '#ef4444'
}

function ringColor(tone) {
  if (tone === 'red')    return '#ef4444'
  if (tone === 'orange') return '#f97316'
  if (tone === 'green')  return '#16a34a'
  return '#2563eb'
}

function formatDate() {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date())
}

const sectorLabels = {
  commerce: 'Commerce', artisan: 'Artisanat',
  liberal: 'Professions liberales', industrial: 'Industrie', services: 'Services',
}
const sizeLabels = { TPE: 'TPE', PME: 'PME' }

/* ─── Styles ───────────────────────────────────────────── */
const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: BG_PAGE,
    paddingBottom: 52,
  },

  /* ── Header ── */
  header: {
    backgroundColor: BLUE,
    paddingTop: 22,
    paddingBottom: 18,
    paddingHorizontal: 32,
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
    width: 34,
    height: 34,
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
  headerRight: {
    alignItems: 'flex-end',
    gap: 3,
  },
  headerDate: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 8.5,
  },
  headerChip: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 4,
  },

  /* ── Body ── */
  body: {
    paddingHorizontal: 32,
    paddingTop: 24,
  },

  /* ── Top cards row (fragilite + radar) ── */
  topRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  card: {
    backgroundColor: BG_CARD,
    borderRadius: 14,
    padding: '18 20',
    border: `1 solid ${BORDER}`,
  },
  fragilityCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  fragilityBody: {
    flex: 1,
  },
  fragilityTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
    marginBottom: 6,
  },
  fragilityDesc: {
    fontSize: 8.5,
    color: MUTED,
    lineHeight: 1.5,
  },
  radarCard: {
    flex: 1,
    alignItems: 'center',
  },
  radarCardTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },

  /* ── Analyse globale ── */
  globalCard: {
    backgroundColor: BG_CARD,
    borderRadius: 14,
    padding: '18 22',
    border: `1 solid ${BORDER}`,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
    marginBottom: 20,
  },
  globalCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  globalCircleText: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    lineHeight: 1,
  },
  globalCircleSub: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.6,
    marginTop: 2,
  },
  globalBody: {
    flex: 1,
  },
  globalTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
    marginBottom: 5,
  },
  globalScore: {
    fontSize: 9,
    color: MUTED,
    marginBottom: 5,
  },
  globalDesc: {
    fontSize: 9,
    color: MUTED,
    lineHeight: 1.5,
    marginBottom: 8,
  },
  adviceBox: {
    backgroundColor: BLUE_LIGHT,
    borderLeft: `3 solid ${BLUE}`,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 8,
  },
  adviceLabel: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  adviceText: {
    fontSize: 8.5,
    color: '#1e40af',
    lineHeight: 1.5,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  chip: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
    backgroundColor: BLUE_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    border: `1 solid #dbeafe`,
  },

  /* ── Progress bars ── */
  barsCard: {
    backgroundColor: BG_CARD,
    borderRadius: 14,
    padding: '16 20',
    border: `1 solid ${BORDER}`,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottom: `1 solid ${BORDER}`,
  },
  barRow: {
    marginBottom: 9,
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    alignItems: 'center',
  },
  barName: {
    fontSize: 9,
    color: DARK,
    fontFamily: 'Helvetica-Bold',
    flex: 1,
  },
  barPct: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    marginLeft: 6,
  },
  barTrack: {
    height: 7,
    backgroundColor: BLUE_BG,
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFill: {
    height: 7,
    borderRadius: 999,
  },

  /* ── Pillar cards (page 2) ── */
  pillarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  pillar: {
    width: '47.5%',
    backgroundColor: BG_CARD,
    borderRadius: 12,
    padding: '14 16',
    border: `1 solid ${BORDER}`,
  },
  pillarHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 7,
    gap: 8,
  },
  pillarTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
    flex: 1,
  },
  badge: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
  },
  pillarDesc: {
    fontSize: 8.5,
    color: MUTED,
    lineHeight: 1.5,
    marginBottom: 7,
  },
  pillarAdvice: {
    fontSize: 8,
    color: '#1e40af',
    backgroundColor: BLUE_LIGHT,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    lineHeight: 1.4,
    marginBottom: 7,
  },
  pillarAdviceLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
    marginBottom: 2,
  },
  pillarMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTop: `1 solid ${BORDER}`,
  },
  pillarMetaText: {
    fontSize: 7.5,
    color: MUTED,
  },
  pillarMetaBold: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
  },

  /* ── Footer ── */
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTop: `1 solid ${BORDER}`,
    paddingHorizontal: 32,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: WHITE,
  },
  footerText: {
    fontSize: 7.5,
    color: '#9499ac',
  },
})

/* ─── Anneau de difficulte (View-based) ───────────────── */
function DifficultyRing({ pct, tone }) {
  const color = ringColor(tone)
  const size = 110
  const ring = size
  const inner = size - 22

  return (
    <View style={{ width: ring, height: ring, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
      {/* Cercle extérieur coloré */}
      <View style={{
        position: 'absolute',
        width: ring,
        height: ring,
        borderRadius: ring / 2,
        backgroundColor: color,
        opacity: 0.12,
      }} />
      {/* Cercle intérieur blanc (crée l'effet donut) */}
      <View style={{
        position: 'absolute',
        width: inner,
        height: inner,
        borderRadius: inner / 2,
        border: `5 solid ${color}`,
        backgroundColor: WHITE,
      }} />
      {/* Texte centré */}
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 20, fontFamily: 'Helvetica-Bold', color, lineHeight: 1 }}>
          {pct}%
        </Text>
        <Text style={{ fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: '#94a3b8', letterSpacing: 0.8, marginTop: 2 }}>
          DIFFICULTE
        </Text>
      </View>
    </View>
  )
}

/* ─── Radar SVG ───────────────────────────────────────── */
function RadarSvg({ categories }) {
  const cx = 140
  const cy = 135
  const maxR = 96
  const n = categories.length
  const angle = (i) => (2 * Math.PI * i) / n - Math.PI / 2
  const pt = (i, pct) => {
    const r = (pct / 100) * maxR
    return [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))]
  }
  const polyStr = (pct) =>
    categories.map((_, i) => pt(i, pct).map((v) => v.toFixed(1)).join(',')).join(' ')
  const dataStr = categories
    .map((c, i) => pt(i, c.percentage).map((v) => v.toFixed(1)).join(','))
    .join(' ')

  return (
    <Svg viewBox="0 0 280 270" style={{ width: 240, height: 232 }}>
      {/* Niveaux de grille */}
      {[25, 50, 75, 100].map((pct) => (
        <Polygon
          key={pct}
          points={polyStr(pct)}
          fill={pct === 100 ? 'rgba(49,70,245,0.03)' : 'none'}
          stroke={pct === 100 ? 'rgba(49,70,245,0.2)' : 'rgba(49,70,245,0.1)'}
          strokeWidth="0.7"
        />
      ))}
      {/* Axes */}
      {categories.map((_, i) => {
        const [ex, ey] = pt(i, 100)
        return (
          <Line key={i} x1={cx} y1={cy} x2={ex} y2={ey}
            stroke="rgba(49,70,245,0.12)" strokeWidth="0.7" />
        )
      })}
      {/* Polygone de données */}
      <Polygon
        points={dataStr}
        fill="rgba(49,70,245,0.12)"
        stroke={BLUE}
        strokeWidth="1.5"
      />
      {/* Points de données */}
      {categories.map((cat, i) => {
        const [px, py] = pt(i, cat.percentage)
        return (
          <Circle key={cat.id} cx={px} cy={py} r="4"
            fill={getTone(cat.tone).bar} stroke={WHITE} strokeWidth="1.5" />
        )
      })}
      {/* Labels */}
      {categories.map((cat, i) => {
        const labelR = maxR + 26
        const lx = cx + labelR * Math.cos(angle(i))
        const ly = cy + labelR * Math.sin(angle(i))
        const anchor = Math.abs(Math.cos(angle(i))) < 0.15
          ? 'middle'
          : Math.cos(angle(i)) > 0 ? 'start' : 'end'
        return (
          <Text key={`nom-${cat.id}`}
            x={lx} y={ly - 4}
            style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', fill: DARK, textAnchor: anchor }}
          >
            {cat.nom}
          </Text>
        )
      })}
      {/* Scores sur les labels */}
      {categories.map((cat, i) => {
        const labelR = maxR + 26
        const lx = cx + labelR * Math.cos(angle(i))
        const ly = cy + labelR * Math.sin(angle(i))
        const anchor = Math.abs(Math.cos(angle(i))) < 0.15
          ? 'middle'
          : Math.cos(angle(i)) > 0 ? 'start' : 'end'
        return (
          <Text key={`pct-${cat.id}`}
            x={lx} y={ly + 9}
            style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', fill: getTone(cat.tone).bar, textAnchor: anchor }}
          >
            {cat.percentage}%
          </Text>
        )
      })}
      {/* Score central */}
      <Text x={cx} y={cy - 5}
        style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', fill: BLUE, textAnchor: 'middle' }}
      >
        {Math.round(categories.reduce((s, c) => s + c.percentage, 0) / n)}%
      </Text>
      <Text x={cx} y={cy + 9}
        style={{ fontSize: 6.5, fontFamily: 'Helvetica-Bold', fill: '#94a3b8', textAnchor: 'middle', letterSpacing: 0.8 }}
      >
        MAITRISE
      </Text>
    </Svg>
  )
}

/* ─── En-tête réutilisable ────────────────────────────── */
function Header({ title, sub, date, sector, size }) {
  return (
    <View style={s.header}>
      <View style={s.headerBrand}>
        <View style={s.headerBadge}>
          <Text style={s.headerBadgeText}>CMB</Text>
        </View>
        <View>
          <Text style={s.headerTitle}>{title}</Text>
          <Text style={s.headerSub}>{sub}</Text>
        </View>
      </View>
      <View style={s.headerRight}>
        <Text style={s.headerDate}>Rapport du {date}</Text>
        {(sector || size) ? (
          <Text style={s.headerChip}>{[size, sector].filter(Boolean).join(' · ')}</Text>
        ) : null}
      </View>
    </View>
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

  const globalDifficulty = global.difficultyPercentage ?? 0
  const globalScore      = global.percentage ?? 0
  const globalTone       = global.tone || 'red'

  return (
    <Document
      title="Diagnostic – Comment va ma boite ?"
      author="CCI Bordeaux Gironde"
      subject="Resultats du diagnostic d'entreprise"
    >
      {/* ══════════════════ PAGE 1 : Synthese ══════════════════ */}
      <Page size="A4" style={s.page}>
        <Header
          title="Comment va ma boite ?"
          sub="CCI Bordeaux Gironde"
          date={date}
          sector={sector}
          size={size}
        />

        <View style={s.body}>

          {/* ── Ligne du haut : anneau fragilite + radar ── */}
          <View style={s.topRow}>
            {/* Carte fragilite */}
            <View style={[s.card, s.fragilityCard]}>
              <DifficultyRing pct={globalDifficulty} tone={globalTone} />
              <View style={s.fragilityBody}>
                <Text style={s.fragilityTitle}>
                  {global.title || 'Diagnostic calcule'}
                </Text>
                <Text style={s.fragilityDesc}>
                  {global.description || 'Resultats calcules a partir des reponses au questionnaire.'}
                </Text>
              </View>
            </View>

            {/* Carte radar */}
            {categories.length >= 3 ? (
              <View style={[s.card, s.radarCard]}>
                <Text style={s.radarCardTitle}>Repartition des scores</Text>
                <RadarSvg categories={categories} />
              </View>
            ) : null}
          </View>

          {/* ── Analyse globale ── */}
          <View style={s.globalCard}>
            <View style={s.globalCircle}>
              <Text style={s.globalCircleText}>{globalScore}%</Text>
              <Text style={s.globalCircleSub}>MAITRISE</Text>
            </View>
            <View style={s.globalBody}>
              <Text style={s.globalTitle}>Analyse Globale</Text>
              <Text style={s.globalScore}>
                Score global : {global.score ?? 0} / {global.scoreMax ?? 0} points — {globalScore}% de maitrise
              </Text>
              <Text style={s.globalDesc}>
                {global.description || 'Les reponses renseignees permettent de produire un diagnostic coherent.'}
              </Text>
              {global.advice ? (
                <View style={s.adviceBox}>
                  <Text style={s.adviceLabel}>CONSEIL PERSONNALISE</Text>
                  <Text style={s.adviceText}>{global.advice}</Text>
                </View>
              ) : null}
              {(size || sector) ? (
                <View style={s.chipsRow}>
                  {size   ? <Text style={s.chip}>Taille : {size}</Text>   : null}
                  {sector ? <Text style={s.chip}>Secteur : {sector}</Text> : null}
                </View>
              ) : null}
            </View>
          </View>

          {/* ── Barres de maitrise ── */}
          <View style={s.barsCard}>
            <Text style={s.sectionTitle}>Taux de maitrise par categorie</Text>
            {categories.map((cat) => {
              const color = barColor(cat.percentage)
              return (
                <View key={cat.id} style={s.barRow}>
                  <View style={s.barHeader}>
                    <Text style={s.barName}>{cat.nom}</Text>
                    <Text style={[s.barPct, { color }]}>{cat.percentage}%</Text>
                  </View>
                  <View style={s.barTrack}>
                    <View style={[s.barFill, { width: `${cat.percentage}%`, backgroundColor: color }]} />
                  </View>
                </View>
              )
            })}
          </View>

        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>© CCI Bordeaux Gironde — Diagnostic confidentiel</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} / ${totalPages}`
          } />
        </View>
      </Page>

      {/* ══════════════════ PAGE 2 : Detail par pilier ══════════ */}
      {categories.length > 0 ? (
        <Page size="A4" style={s.page}>
          <Header
            title="Analyse detaillee"
            sub="Comment va ma boite ?"
            date={date}
            sector={sector}
            size={size}
          />

          <View style={[s.body, { paddingTop: 20 }]}>
            <Text style={[s.sectionTitle, { marginBottom: 14 }]}>Detail par pilier</Text>
            <View style={s.pillarsGrid}>
              {categories.map((cat) => {
                const tone = getTone(cat.tone)
                const color = barColor(cat.percentage)
                return (
                  <View key={cat.id} style={s.pillar}>
                    {/* Titre + badge difficulte */}
                    <View style={s.pillarHeaderRow}>
                      <Text style={s.pillarTitle}>
                        {cat.ordre ? `Partie ${cat.ordre} : ` : ''}{cat.nom}
                      </Text>
                      <Text style={[s.badge, { backgroundColor: tone.bg, color: tone.text, border: `1 solid ${tone.border}` }]}>
                        Difficulte : {cat.difficultyPercentage}%
                      </Text>
                    </View>

                    {/* Barre de maitrise mini */}
                    <View style={[s.barTrack, { marginBottom: 8 }]}>
                      <View style={[s.barFill, { width: `${cat.percentage}%`, backgroundColor: color }]} />
                    </View>

                    {/* Description */}
                    {cat.description ? (
                      <Text style={s.pillarDesc}>{cat.description}</Text>
                    ) : null}

                    {/* Conseil */}
                    {cat.advice ? (
                      <View style={s.pillarAdvice}>
                        <Text style={s.pillarAdviceLabel}>CONSEIL</Text>
                        <Text>{cat.advice}</Text>
                      </View>
                    ) : null}

                    {/* Meta score */}
                    <View style={s.pillarMeta}>
                      <Text style={s.pillarMetaText}>{cat.score} / {cat.scoreMax} points</Text>
                      <Text style={[s.pillarMetaBold, { color }]}>
                        {cat.percentage}% de maitrise
                      </Text>
                    </View>
                  </View>
                )
              })}
            </View>
          </View>

          <View style={s.footer} fixed>
            <Text style={s.footerText}>© CCI Bordeaux Gironde — Diagnostic confidentiel</Text>
            <Text style={s.footerText} render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            } />
          </View>
        </Page>
      ) : null}
    </Document>
  )
}
