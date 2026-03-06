/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  renderToBuffer,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer'
import type { Style } from '@react-pdf/types'
import path from 'path'

// ── Hebrew fonts ────────────────────────────────────────────────────────────
Font.register({
  family: 'Heebo',
  src: path.join(process.cwd(), 'public/fonts/Heebo-Regular.ttf'),
})
Font.registerHyphenationCallback((word) => [word])

// ── Styles ──────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    fontFamily: 'Heebo',
    fontSize: 9,
    direction: 'rtl',
    paddingTop: 28,
    paddingBottom: 40,
    paddingHorizontal: 28,
    backgroundColor: '#fff',
  } as Style,

  // ── Header ──
  header: {
    backgroundColor: '#1B3A5C',
    borderRadius: 4,
    padding: 14,
    marginBottom: 14,
    alignItems: 'center',
  } as Style,
  headerTitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  } as Style,
  headerSub: {
    fontSize: 9,
    color: '#b8c9de',
    textAlign: 'center',
  } as Style,

  // ── Section ──
  section: {
    marginBottom: 10,
    border: '1pt solid #d1d5db',
    borderRadius: 4,
  } as Style,
  sectionTitle: {
    backgroundColor: '#e8f0fb',
    fontSize: 10,
    color: '#1B3A5C',
    padding: '5pt 8pt',
    borderBottom: '1pt solid #d1d5db',
    textAlign: 'right',
  } as Style,
  sectionBody: {
    padding: '7pt 10pt',
  } as Style,

  // ── Grid rows ──
  row2: { flexDirection: 'row-reverse', gap: 10, marginBottom: 5 } as Style,
  row3: { flexDirection: 'row-reverse', gap: 8, marginBottom: 5 } as Style,
  row4: { flexDirection: 'row-reverse', gap: 6, marginBottom: 5 } as Style,
  cell: { flex: 1 } as Style,
  label: { fontSize: 7.5, color: '#6b7280', marginBottom: 1.5, textAlign: 'right' } as Style,
  value: { fontSize: 9, color: '#111827', textAlign: 'right' } as Style,
  valueBold: { fontSize: 9, color: '#111827', textAlign: 'right' } as Style,

  // ── Note box ──
  noteBox: {
    border: '1pt solid #fbbf24',
    backgroundColor: '#fffbeb',
    borderRadius: 3,
    padding: '6pt 8pt',
    marginBottom: 10,
  } as Style,
  noteText: { fontSize: 8, color: '#78350f', textAlign: 'right', lineHeight: 1.5 } as Style,

  // ── Table ──
  table: { border: '1pt solid #d1d5db', borderRadius: 3, marginTop: 4 } as Style,
  tHeaderRow: {
    flexDirection: 'row-reverse',
    backgroundColor: '#f3f4f6',
    borderBottom: '1pt solid #d1d5db',
  } as Style,
  tRow: {
    flexDirection: 'row-reverse',
    borderBottom: '0.5pt solid #e5e7eb',
  } as Style,
  tRowAlt: {
    flexDirection: 'row-reverse',
    backgroundColor: '#f9fafb',
    borderBottom: '0.5pt solid #e5e7eb',
  } as Style,
  tCellHdr: {
    padding: '3pt 5pt',
    fontSize: 8,
    color: '#374151',
    textAlign: 'right',
  } as Style,
  tCell: { padding: '3pt 5pt', fontSize: 8, color: '#111827', textAlign: 'right' } as Style,

  // ── Status badge ──
  badgeGreen: {
    backgroundColor: '#16a34a',
    color: '#fff',
    borderRadius: 3,
    padding: '2pt 7pt',
    fontSize: 9,
    textAlign: 'center',
    alignSelf: 'flex-start',
  } as Style,
  badgeYellow: {
    backgroundColor: '#d97706',
    color: '#fff',
    borderRadius: 3,
    padding: '2pt 7pt',
    fontSize: 9,
    textAlign: 'center',
    alignSelf: 'flex-start',
  } as Style,
  badgeRed: {
    backgroundColor: '#dc2626',
    color: '#fff',
    borderRadius: 3,
    padding: '2pt 7pt',
    fontSize: 9,
    textAlign: 'center',
    alignSelf: 'flex-start',
  } as Style,

  passText: { color: '#16a34a' } as Style,
  failText: { color: '#dc2626' } as Style,
  naText: { color: '#9ca3af' } as Style,

  // ── Signature ──
  signatureRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 6,
    gap: 12,
  } as Style,
  signatureBlock: { flex: 1, alignItems: 'center' } as Style,
  signatureLabel: { fontSize: 8, color: '#6b7280', marginBottom: 4, textAlign: 'center' } as Style,
  signatureBox: {
    width: '100%',
    height: 50,
    border: '1pt solid #d1d5db',
    borderRadius: 3,
    backgroundColor: '#f9fafb',
  } as Style,
  signatureLine: {
    borderBottom: '1pt solid #374151',
    width: '100%',
    marginTop: 40,
  } as Style,

  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 14,
    left: 28,
    right: 28,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    borderTop: '0.5pt solid #e5e7eb',
    paddingTop: 4,
    fontSize: 7.5,
    color: '#9ca3af',
  } as Style,
})

// ── Helpers ─────────────────────────────────────────────────────────────────
function fmt(d: string | null) {
  if (!d) return '—'
  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(d))
}

const INSTALLATION: Record<string, string> = {
  residential: 'מגורים',
  commercial: 'מסחרי',
  industrial: 'תעשייתי',
  other: 'אחר',
}
const APPROVAL: Record<string, string> = {
  approved: 'המתקן אושר לחיבור',
  approved_with_recommendations: 'המתקן אושר לחיבור עם המלצות',
  rejected: 'המתקן לא אושר לחיבור',
}

function resultText(r: string | null) {
  if (r === 'pass') return 'תקין'
  if (r === 'fail') return 'לא תקין'
  return 'לא רלוונטי'
}
function resultStyle(r: string | null) {
  if (r === 'pass') return S.passText
  if (r === 'fail') return S.failText
  return S.naText
}

// ── Severity label ──────────────────────────────────────────────────────────
function severityLabel(s: string) {
  if (s === 'critical') return 'קריטי'
  if (s === 'major') return 'חמור'
  return 'קל'
}

// ── PDF Component ────────────────────────────────────────────────────────────

function InspectionPDF({ data }: { data: any }) {
  const {
    inspection,
    visualChecks,
    instruments,
    panels,
    faultLoop,
    defects,
    recommendations,
    generator,
  } = data

  const approvalBadge =
    inspection.approval_status === 'approved'
      ? S.badgeGreen
      : inspection.approval_status === 'rejected'
        ? S.badgeRed
        : S.badgeYellow

  // Group visual checks by category

  const vcByCategory: Record<string, any[]> = {}

  visualChecks.forEach((vc: any) => {
    const cat = vc.category || 'general'
    if (!vcByCategory[cat]) vcByCategory[cat] = []
    vcByCategory[cat].push(vc)
  })
  const CATEGORY_LABELS: Record<string, string> = {
    general: 'כללי',
    cables_conductors: 'כבלים ומוליכים',
    water_protection: 'מים',
    fire_protection: 'אש',
    grounding: 'הארקה',
    height_compliance: 'גובה',
    tests_measurements: 'בדיקות מדידות',
    signage_labeling: 'שילוט',
  }
  const CATEGORY_ORDER = [
    'general',
    'cables_conductors',
    'water_protection',
    'fire_protection',
    'grounding',
    'height_compliance',
    'tests_measurements',
    'signage_labeling',
  ]

  return (
    <Document title={`דוח בדיקה - ${inspection.client_name}`} language="he">
      {/* ══ PAGE 1: General Info + Visual Checks ══════════════════════════════ */}
      <Page size="A4" style={S.page}>
        {/* Header */}
        <View style={S.header}>
          <Text style={S.headerTitle}>דוח בדיקה ראשונית של מתקן חשמלי</Text>
          <Text style={S.headerSub}>
            {inspection.client_name} | תאריך בדיקה: {fmt(inspection.inspection_date)}
          </Text>
        </View>

        {/* Administrative note */}
        <View style={S.noteBox}>
          <Text style={S.noteText}>
            דוח בדיקה זה מתבסס על מסמכים שנמסרו לבודק על ידי מזמין הבדיקה ומתכנן המתקן והם משקפים את
            מצב המתקן במועד הבדיקה. שינויים שיבוצעו במתקן החשמל לאחר מועד הבדיקה מחייבים בדיקה נוספת
            והם באחריות הבלעדית של מבצעי השינוי.
          </Text>
        </View>

        {/* Installation details */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>נתונים כלליים של המתקן</Text>
          <View style={S.sectionBody}>
            <View style={S.row3}>
              <View style={S.cell}>
                <Text style={S.label}>שם הלקוח / המתקן</Text>
                <Text style={S.valueBold}>{inspection.client_name || '—'}</Text>
              </View>
              <View style={S.cell}>
                <Text style={S.label}>סוג המתקן</Text>
                <Text style={S.value}>{INSTALLATION[inspection.installation_type] || '—'}</Text>
              </View>
              <View style={S.cell}>
                <Text style={S.label}>כתובת המתקן</Text>
                <Text style={S.value}>{inspection.address || '—'}</Text>
              </View>
            </View>
            <View style={S.row3}>
              <View style={S.cell}>
                <Text style={S.label}>גודל חיבור (אמפר)</Text>
                <Text style={S.value}>{inspection.connection_size_amps || '—'}</Text>
              </View>
              <View style={S.cell}>
                <Text style={S.label}>תאריך הבדיקה</Text>
                <Text style={S.value}>{fmt(inspection.inspection_date)}</Text>
              </View>
              <View style={S.cell}>
                <Text style={S.label}>כולל גנרטור</Text>
                <Text style={S.value}>{inspection.has_generator ? 'כן' : 'לא'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Parties */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>פרטי בעל המתקן, המתכנן והמבצע</Text>
          <View style={S.sectionBody}>
            <View style={S.row3}>
              {/* Owner */}
              <View style={S.cell}>
                <Text style={S.label}>בעל המתקן</Text>
                <Text style={S.value}>{inspection.owner_name || '—'}</Text>
                {inspection.owner_phone ? (
                  <Text style={S.label}>{inspection.owner_phone}</Text>
                ) : null}
                {inspection.owner_email ? (
                  <Text style={S.label}>{inspection.owner_email}</Text>
                ) : null}
              </View>
              {/* Electrician */}
              <View style={S.cell}>
                <Text style={S.label}>החשמלאי המבצע</Text>
                <Text style={S.value}>{inspection.electrician_name || '—'}</Text>
                {inspection.electrician_phone ? (
                  <Text style={S.label}>{inspection.electrician_phone}</Text>
                ) : null}
                {inspection.electrician_license ? (
                  <Text style={S.label}>רישיון: {inspection.electrician_license}</Text>
                ) : null}
              </View>
              {/* Designer */}
              <View style={S.cell}>
                <Text style={S.label}>המתכנן</Text>
                <Text style={S.value}>{inspection.designer_name || '—'}</Text>
                {inspection.designer_phone ? (
                  <Text style={S.label}>{inspection.designer_phone}</Text>
                ) : null}
              </View>
            </View>
          </View>
        </View>

        {/* Visual Inspection — grouped by category */}
        {visualChecks.length > 0 && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>
              ביקורת של המתקן ושל המסמכים הטכניים הנלווים ({visualChecks.length} פריטים)
            </Text>
            <View style={S.sectionBody}>
              {CATEGORY_ORDER.filter((catId) => vcByCategory[catId]?.length).map((catId) => (
                <View key={catId} style={{ marginBottom: 6 }}>
                  <Text
                    style={[
                      S.label,
                      { fontSize: 8, color: '#1B3A5C', marginBottom: 2, textAlign: 'right' },
                    ]}
                  >
                    {CATEGORY_LABELS[catId] || catId}
                  </Text>
                  <View style={S.table}>
                    <View style={S.tHeaderRow}>
                      <Text style={[S.tCellHdr, { flex: 4 }]}>פריט הבדיקה</Text>
                      <Text style={[S.tCellHdr, { flex: 1, textAlign: 'center' }]}>תוצאה</Text>
                      <Text style={[S.tCellHdr, { flex: 2 }]}>הערות</Text>
                    </View>
                    {}
                    {vcByCategory[catId].map((vc: any, i: number) => (
                      <View key={i} style={i % 2 === 0 ? S.tRow : S.tRowAlt}>
                        <Text style={[S.tCell, { flex: 4 }]}>{vc.item_label || vc.item_key}</Text>
                        <Text
                          style={[
                            S.tCell,
                            { flex: 1, textAlign: 'center' },
                            resultStyle(vc.result),
                          ]}
                        >
                          {resultText(vc.result)}
                        </Text>
                        <Text style={[S.tCell, { flex: 2 }]}>{vc.notes || ''}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
              {/* Any items with unknown category */}
              {}
              {visualChecks.filter((vc: any) => !CATEGORY_ORDER.includes(vc.category ?? 'general'))
                .length > 0 && (
                <View style={{ marginBottom: 6 }}>
                  <View style={S.table}>
                    <View style={S.tHeaderRow}>
                      <Text style={[S.tCellHdr, { flex: 4 }]}>פריט הבדיקה</Text>
                      <Text style={[S.tCellHdr, { flex: 1, textAlign: 'center' }]}>תוצאה</Text>
                      <Text style={[S.tCellHdr, { flex: 2 }]}>הערות</Text>
                    </View>
                    {visualChecks
                      .filter((vc: any) => !CATEGORY_ORDER.includes(vc.category || 'general'))
                      .map((vc: any, i: number) => (
                        <View key={i} style={i % 2 === 0 ? S.tRow : S.tRowAlt}>
                          <Text style={[S.tCell, { flex: 4 }]}>{vc.item_label || vc.item_key}</Text>
                          <Text
                            style={[
                              S.tCell,
                              { flex: 1, textAlign: 'center' },
                              resultStyle(vc.result),
                            ]}
                          >
                            {resultText(vc.result)}
                          </Text>
                          <Text style={[S.tCell, { flex: 2 }]}>{vc.notes || ''}</Text>
                        </View>
                      ))}
                  </View>
                </View>
              )}
              {/* Visual check photos */}
              {}
              {visualChecks.filter((vc: any) => vc.photo_url && vc.photo_url.startsWith('http'))
                .length > 0 && (
                <View style={{ marginTop: 6 }}>
                  <Text style={[S.label, { marginBottom: 4, color: '#1B3A5C' }]}>
                    תמונות מהבדיקה החזותית
                  </Text>
                  <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6 }}>
                    {}
                    {visualChecks
                      .filter((vc: any) => vc.photo_url && vc.photo_url.startsWith('http'))
                      .map((vc: any, i: number) => (
                        <View key={i} style={{ alignItems: 'center', width: 100 }}>
                          {/* eslint-disable-next-line jsx-a11y/alt-text */}
                          <Image
                            src={vc.photo_url}
                            style={{ width: 100, height: 75, objectFit: 'cover', borderRadius: 3 }}
                          />
                          <Text
                            style={[S.label, { textAlign: 'center', marginTop: 2, fontSize: 7 }]}
                          >
                            {vc.item_label || vc.item_key}
                          </Text>
                        </View>
                      ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        <Footer />
      </Page>

      {/* ══ PAGE 2: Instruments + Panels + Fault Loop ═════════════════════════ */}
      <Page size="A4" style={S.page}>
        <View style={S.header}>
          <Text style={S.headerTitle}>מדידות וציוד — {inspection.client_name}</Text>
        </View>

        {/* Instruments */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>מכשירי מדידה שבאמצעותם נערכו מדידות</Text>
          <View style={S.sectionBody}>
            {instruments.length === 0 ? (
              <Text style={S.label}>לא הוזנו מכשירי מדידה</Text>
            ) : (
              <View style={S.table}>
                <View style={S.tHeaderRow}>
                  <Text style={[S.tCellHdr, { flex: 3 }]}>שם המכשיר</Text>
                  <Text style={[S.tCellHdr, { flex: 2 }]}>יצרן / דגם</Text>
                  <Text style={[S.tCellHdr, { flex: 2 }]}>מספר סידורי</Text>
                  <Text style={[S.tCellHdr, { flex: 2 }]}>תאריך הכיול</Text>
                </View>
                {}
                {instruments.map((inst: any, i: number) => (
                  <View key={i} style={i % 2 === 0 ? S.tRow : S.tRowAlt}>
                    <Text style={[S.tCell, { flex: 3 }]}>
                      {inst.name || inst.instrument_type || '—'}
                    </Text>
                    <Text style={[S.tCell, { flex: 2 }]}>{inst.model || '—'}</Text>
                    <Text style={[S.tCell, { flex: 2 }]}>{inst.serial_number || '—'}</Text>
                    <Text style={[S.tCell, { flex: 2 }]}>{fmt(inst.calibration_date)}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Panels */}
        {panels.length > 0 &&
          panels.map((panel: any, pi: number) => {
            const circuits = Array.isArray(panel.circuit_measurements)
              ? panel.circuit_measurements
              : []
            const pfLabel = (v: string | null) =>
              v === 'pass' ? 'תקין' : v === 'fail' ? 'ליקוי' : v === 'na' ? 'נ/ר' : '—'
            return (
              <View key={pi} style={S.section}>
                <Text style={S.sectionTitle}>
                  תוצאות הבדיקה של לוח: {panel.panel_name || panel.name || `לוח ${pi + 1}`}
                </Text>
                <View style={S.sectionBody}>
                  {circuits.length > 0 && (
                    <View style={S.table}>
                      <View style={S.tHeaderRow}>
                        <Text style={[S.tCellHdr, { flex: 1 }]}>מעגל</Text>
                        <Text style={[S.tCellHdr, { flex: 1.5 }]}>1L-E (MΩ)</Text>
                        <Text style={[S.tCellHdr, { flex: 1.5 }]}>N-E (MΩ)</Text>
                        <Text style={[S.tCellHdr, { flex: 1.5 }]}>הארקה (Ω)</Text>
                        <Text style={[S.tCellHdr, { flex: 1.5 }]}>עכבה (Ω)</Text>
                        <Text style={[S.tCellHdr, { flex: 1.5 }]}>מתח 1L-N (V)</Text>
                        <Text style={[S.tCellHdr, { flex: 1 }]}>הגנה</Text>
                        <Text style={[S.tCellHdr, { flex: 1 }]}>רצף פ&apos;</Text>
                      </View>
                      {circuits.map((c: any, ci: number) => (
                        <View key={ci} style={ci % 2 === 0 ? S.tRow : S.tRowAlt}>
                          <Text style={[S.tCell, { flex: 1 }]}>{c.circuit_number ?? ci + 1}</Text>
                          <Text style={[S.tCell, { flex: 1.5 }]}>{c.ins_1l_e ?? '—'}</Text>
                          <Text style={[S.tCell, { flex: 1.5 }]}>{c.ins_n_e ?? '—'}</Text>
                          <Text style={[S.tCell, { flex: 1.5 }]}>
                            {c.grounding_continuity ?? '—'}
                          </Text>
                          <Text style={[S.tCell, { flex: 1.5 }]}>
                            {c.fault_loop_impedance ?? '—'}
                          </Text>
                          <Text style={[S.tCell, { flex: 1.5 }]}>{c.voltage_1l_n ?? '—'}</Text>
                          <Text style={[S.tCell, { flex: 1 }]}>
                            {pfLabel(c.overcurrent_protection)}
                          </Text>
                          <Text style={[S.tCell, { flex: 1 }]}>{pfLabel(c.phase_sequence)}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {circuits.length === 0 && <Text style={S.label}>לא הוזנו מדידות</Text>}
                </View>
              </View>
            )
          })}

        {/* Fault Loop */}
        {faultLoop && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>עכבת לולאת התקלה וזרמי קצר</Text>
            <View style={S.sectionBody}>
              <View style={S.table}>
                <View style={S.tHeaderRow}>
                  <Text style={[S.tCellHdr, { flex: 2 }]}>פאזה</Text>
                  <Text style={[S.tCellHdr, { flex: 2 }]}>Zph-N (Ω)</Text>
                  <Text style={[S.tCellHdr, { flex: 2 }]}>Zph-E (Ω)</Text>
                  <Text style={[S.tCellHdr, { flex: 2 }]}>Isc2ph (A)</Text>
                  <Text style={[S.tCellHdr, { flex: 2 }]}>Isc3ph (A)</Text>
                </View>
                {[
                  { label: 'פאזה 1', zn: faultLoop.zph1_n, ze: faultLoop.zph1_e },
                  { label: 'פאזה 2', zn: faultLoop.zph2_n, ze: faultLoop.zph2_e },
                  { label: 'פאזה 3', zn: faultLoop.zph3_n, ze: faultLoop.zph3_e },
                ].map((p, pi) => {
                  const isc2 = p.zn ? (230 / parseFloat(String(p.zn))).toFixed(1) : '—'
                  const isc3 = p.zn ? ((1.55 * 230) / parseFloat(String(p.zn))).toFixed(1) : '—'
                  return (
                    <View key={pi} style={pi % 2 === 0 ? S.tRow : S.tRowAlt}>
                      <Text style={[S.tCell, { flex: 2 }]}>{p.label}</Text>
                      <Text style={[S.tCell, { flex: 2 }]}>{p.zn ?? '—'}</Text>
                      <Text style={[S.tCell, { flex: 2 }]}>{p.ze ?? '—'}</Text>
                      <Text style={[S.tCell, { flex: 2 }]}>{isc2}</Text>
                      <Text style={[S.tCell, { flex: 2 }]}>{isc3}</Text>
                    </View>
                  )
                })}
                {faultLoop.z_1ph_2ph != null && (
                  <View style={S.tRow}>
                    <Text style={[S.tCell, { flex: 2 }]}>פאזה-פאזה (1-2)</Text>
                    <Text style={[S.tCell, { flex: 2 }]}>{faultLoop.z_1ph_2ph}</Text>
                    <Text style={[S.tCell, { flex: 2 }]}>—</Text>
                    <Text style={[S.tCell, { flex: 2 }]}>
                      {(400 / parseFloat(String(faultLoop.z_1ph_2ph))).toFixed(1)}
                    </Text>
                    <Text style={[S.tCell, { flex: 2 }]}>—</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        <Footer />
      </Page>

      {/* ══ PAGE 3: Defects + Recommendations + Approval + Signature ══════════ */}
      <Page size="A4" style={S.page}>
        <View style={S.header}>
          <Text style={S.headerTitle}>ליקויים, המלצות ואישור — {inspection.client_name}</Text>
        </View>

        {/* Generator */}
        {generator && inspection.has_generator && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>תעודת גנרטור</Text>
            <View style={S.sectionBody}>
              {/* Cert details */}
              <View style={[S.row4, { marginBottom: 6 }]}>
                {[
                  ['יצרן', generator.cert?.manufacturer],
                  ['דגם', generator.cert?.model],
                  ['מספר סידורי', generator.cert?.serial_number],
                  ['הספק', generator.cert?.power_rating],
                  ['מיקום התקנה', generator.cert?.installation_location],
                  ['מיקום לוח', generator.cert?.panel_location],
                  ['ספק', generator.cert?.supplier],
                  ['מספר היתר', generator.cert?.permit_number],
                ]
                  .filter(([, v]) => v)
                  .map(([label, val], i) => (
                    <View key={i} style={S.cell}>
                      <Text style={S.label}>{label}</Text>
                      <Text style={S.value}>{val || '—'}</Text>
                    </View>
                  ))}
              </View>
              {/* Doc reviews */}
              {generator.docReviews?.length > 0 && (
                <View style={[S.table, { marginBottom: 4 }]}>
                  <View style={S.tHeaderRow}>
                    <Text style={[S.tCellHdr, { flex: 4 }]}>בדיקת מסמכים</Text>
                    <Text style={[S.tCellHdr, { flex: 1, textAlign: 'center' }]}>תוצאה</Text>
                    <Text style={[S.tCellHdr, { flex: 2 }]}>הערות</Text>
                  </View>
                  {}
                  {generator.docReviews.map((vc: any, i: number) => (
                    <View key={i} style={i % 2 === 0 ? S.tRow : S.tRowAlt}>
                      <Text style={[S.tCell, { flex: 4 }]}>{vc.item_label}</Text>
                      <Text
                        style={[S.tCell, { flex: 1, textAlign: 'center' }, resultStyle(vc.result)]}
                      >
                        {resultText(vc.result)}
                      </Text>
                      <Text style={[S.tCell, { flex: 2 }]}>{vc.notes || ''}</Text>
                    </View>
                  ))}
                </View>
              )}
              {/* Visual checks */}
              {generator.visualChecks?.length > 0 && (
                <View style={S.table}>
                  <View style={S.tHeaderRow}>
                    <Text style={[S.tCellHdr, { flex: 4 }]}>בדיקה חזותית</Text>
                    <Text style={[S.tCellHdr, { flex: 1, textAlign: 'center' }]}>תוצאה</Text>
                    <Text style={[S.tCellHdr, { flex: 2 }]}>הערות</Text>
                  </View>
                  {}
                  {generator.visualChecks.map((vc: any, i: number) => (
                    <View key={i} style={i % 2 === 0 ? S.tRow : S.tRowAlt}>
                      <Text style={[S.tCell, { flex: 4 }]}>{vc.item_label}</Text>
                      <Text
                        style={[S.tCell, { flex: 1, textAlign: 'center' }, resultStyle(vc.result)]}
                      >
                        {resultText(vc.result)}
                      </Text>
                      <Text style={[S.tCell, { flex: 2 }]}>{vc.notes || ''}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Defects */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>רשימת הליקויים שהתגלו במהלך הבדיקה ({defects.length})</Text>
          <View style={S.sectionBody}>
            {defects.length === 0 ? (
              <Text style={[S.value, S.passText]}>לא נמצאו ליקויים</Text>
            ) : (
              <View>
                <View style={S.table}>
                  <View style={S.tHeaderRow}>
                    <Text style={[S.tCellHdr, { flex: 5 }]}>הליקוי</Text>
                    <Text style={[S.tCellHdr, { flex: 1, textAlign: 'center' }]}>חומרה</Text>
                    <Text style={[S.tCellHdr, { flex: 2 }]}>תאריך תיקון</Text>
                    <Text style={[S.tCellHdr, { flex: 1, textAlign: 'center' }]}>תוקן</Text>
                  </View>
                  {}
                  {defects.map((d: any, i: number) => (
                    <View key={i} style={i % 2 === 0 ? S.tRow : S.tRowAlt}>
                      <Text style={[S.tCell, { flex: 5 }]}>{d.description}</Text>
                      <Text
                        style={[
                          S.tCell,
                          { flex: 1, textAlign: 'center' },
                          d.severity === 'critical' ? S.failText : {},
                        ]}
                      >
                        {severityLabel(d.severity)}
                      </Text>
                      <Text style={[S.tCell, { flex: 2 }]}>{fmt(d.target_repair_date) || '—'}</Text>
                      <Text
                        style={[
                          S.tCell,
                          { flex: 1, textAlign: 'center' },
                          d.resolved ? S.passText : {},
                        ]}
                      >
                        {d.resolved ? 'כן' : 'לא'}
                      </Text>
                    </View>
                  ))}
                </View>
                {/* Defect photos */}
                {}
                {defects.filter((d: any) => d.photo_url && d.photo_url.startsWith('http')).length >
                  0 && (
                  <View style={{ marginTop: 6 }}>
                    <Text style={[S.label, { marginBottom: 4, color: '#1B3A5C' }]}>
                      תמונות ליקויים
                    </Text>
                    <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6 }}>
                      {}
                      {defects
                        .filter((d: any) => d.photo_url && d.photo_url.startsWith('http'))
                        .map((d: any, i: number) => (
                          <View key={i} style={{ alignItems: 'center', width: 100 }}>
                            <Image
                              src={d.photo_url}
                              style={{
                                width: 100,
                                height: 75,
                                objectFit: 'cover',
                                borderRadius: 3,
                              }}
                            />
                            <Text style={[S.label, { textAlign: 'center', marginTop: 2 }]}>
                              ליקוי {i + 1}
                            </Text>
                          </View>
                        ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Recommendations */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>רשימת המלצות ({recommendations.length})</Text>
          <View style={S.sectionBody}>
            {recommendations.length === 0 ? (
              <Text style={S.label}>אין המלצות</Text>
            ) : (
              <View style={S.table}>
                <View style={S.tHeaderRow}>
                  <Text style={[S.tCellHdr, { flex: 1 }]}>#</Text>
                  <Text style={[S.tCellHdr, { flex: 4 }]}>המלצה</Text>
                  <Text style={[S.tCellHdr, { flex: 2.5 }]}>תגובת חשמלאי</Text>
                  <Text style={[S.tCellHdr, { flex: 2.5 }]}>תגובת מתכנן</Text>
                </View>
                {}
                {recommendations.map((r: any, i: number) => (
                  <View key={i} style={i % 2 === 0 ? S.tRow : S.tRowAlt}>
                    <Text style={[S.tCell, { flex: 1, textAlign: 'center' }]}>{i + 1}</Text>
                    <Text style={[S.tCell, { flex: 4 }]}>{r.text || r.description || '—'}</Text>
                    <Text style={[S.tCell, { flex: 2.5 }]}>{r.electrician_response || ''}</Text>
                    <Text style={[S.tCell, { flex: 2.5 }]}>{r.designer_response || ''}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Approval */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>סטטוס האישור לחיבור המתקן הנבדק</Text>
          <View style={S.sectionBody}>
            <Text style={approvalBadge}>
              {APPROVAL[inspection.approval_status] || 'ממתין לאישור'}
            </Text>
          </View>
        </View>

        {/* Signatures */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>חתימות</Text>
          <View style={S.sectionBody}>
            <View style={S.signatureRow}>
              <View style={S.signatureBlock}>
                <Text style={S.signatureLabel}>חתימת הבודק</Text>
                {inspection.inspector_signature ? (
                  <Image
                    src={inspection.inspector_signature}
                    style={{ width: '100%', height: 50 }}
                  />
                ) : (
                  <View style={S.signatureBox} />
                )}
                <View style={S.signatureLine} />
                <Text style={S.signatureLabel}>
                  תאריך: {fmt(inspection.submitted_at || inspection.updated_at)}
                </Text>
              </View>
              <View style={S.signatureBlock}>
                <Text style={S.signatureLabel}>חתימת בעל המתקן</Text>
                <View style={S.signatureBox} />
                <View style={S.signatureLine} />
                <Text style={S.signatureLabel}>תאריך: ________________</Text>
              </View>
              <View style={S.signatureBlock}>
                <Text style={S.signatureLabel}>חתימת החשמלאי המבצע</Text>
                <View style={S.signatureBox} />
                <View style={S.signatureLine} />
                <Text style={S.signatureLabel}>תאריך: ________________</Text>
              </View>
            </View>
          </View>
        </View>

        <Footer />
      </Page>
    </Document>
  )
}

function Footer() {
  return (
    <View style={S.footer} fixed>
      <Text>מערכת ניהול בדיקות חשמל</Text>
      <Text
        render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
          `עמוד ${pageNumber} מתוך ${totalPages}`
        }
      />
    </View>
  )
}

// ── Route handler ────────────────────────────────────────────────────────────
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  // Dev mode — demo PDF
  if (!supabaseUrl?.startsWith('http')) {
    const demoData = {
      inspection: {
        id,
        client_name: 'ישראל ישראלי',
        installation_type: 'residential',
        address: 'רחוב הרצל 1, תל אביב',
        connection_size_amps: 100,
        owner_name: 'ישראל ישראלי',
        owner_phone: '050-1234567',
        owner_email: 'israel@example.com',
        electrician_name: 'שמעון חשמלאי',
        electrician_phone: '052-9876543',
        electrician_license: 'B1-12345',
        designer_name: null,
        designer_phone: null,
        has_generator: true,
        inspection_date: new Date().toISOString().split('T')[0],
        approval_status: 'approved_with_recommendations',
        inspector_signature: null,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      visualChecks: [
        // כללי
        {
          category: 'general',
          item_key: 'gen_panel_conformity',
          item_label: 'התאמת הלוח והציוד שבו לתקנים',
          result: 'pass',
          notes: '',
        },
        {
          category: 'general',
          item_key: 'gen_plan_conformity',
          item_label: 'התאמה לתוכניות',
          result: 'pass',
          notes: '',
        },
        {
          category: 'general',
          item_key: 'gen_diagram_nameplate',
          item_label: 'תרשים הלוח בצמוד ללוחית הלוח',
          result: 'pass',
          notes: '',
        },
        {
          category: 'general',
          item_key: 'gen_access_ventilation',
          item_label: 'גישה נוחה, תנאי אוורור, אור, מיקום הלוח',
          result: 'pass',
          notes: '',
        },
        {
          category: 'general',
          item_key: 'gen_stable_surface',
          item_label: 'קביעה על משטחי יציב',
          result: 'pass',
          notes: '',
        },
        {
          category: 'general',
          item_key: 'gen_spacing_1_75',
          item_label: 'מרווחים בין שני סוגי אספקה פחות מ-1.75 ס"מ',
          result: 'pass',
          notes: '',
        },
        // כבלים ומוליכים
        {
          category: 'cables_conductors',
          item_key: 'cable_fuse_conductor_match',
          item_label: 'התאמת המבטחים לשטחי המוליכים',
          result: 'pass',
          notes: '',
        },
        {
          category: 'cables_conductors',
          item_key: 'cable_neutral_ground_screw',
          item_label: 'מוליכי אפס והארקה כל אחד בבורג נפרד',
          result: 'pass',
          notes: '',
        },
        {
          category: 'cables_conductors',
          item_key: 'cable_color_coding',
          item_label: 'צבעי זיהוי המוליכים (הצבע הכחול)',
          result: 'pass',
          notes: '',
        },
        {
          category: 'cables_conductors',
          item_key: 'cable_entry_protection',
          item_label: 'כניסת הכבלים דרך פתח מוגן למניעת פציעות',
          result: 'pass',
          notes: '',
        },
        {
          category: 'cables_conductors',
          item_key: 'cable_circuit_separation',
          item_label: 'הפרדה בין מעגלים',
          result: 'pass',
          notes: '',
        },
        {
          category: 'cables_conductors',
          item_key: 'cable_bending_angles',
          item_label: 'זוויות כיפוף מוליכים בלוח',
          result: 'pass',
          notes: '',
        },
        {
          category: 'cables_conductors',
          item_key: 'cable_ties_connections',
          item_label: 'תקינות מעלי כבל וחיבורים',
          result: 'pass',
          notes: '',
        },
        // מים
        {
          category: 'water_protection',
          item_key: 'water_no_pipe_proximity',
          item_label: 'אין קרבה לצנרת מים, גז',
          result: 'pass',
          notes: '',
        },
        {
          category: 'water_protection',
          item_key: 'water_sealing_covers',
          item_label: 'איטומים/כיסויים למניעת חדירת מים',
          result: 'pass',
          notes: '',
        },
        {
          category: 'water_protection',
          item_key: 'water_fire_sealing',
          item_label: 'איטום למניעת הפצות אש',
          result: 'pass',
          notes: '',
        },
        // אש
        {
          category: 'fire_protection',
          item_key: 'fire_detection_trip',
          item_label: 'קיום מערכת גילוי/כיבוי אש וחיבור לסליל הפסקה',
          result: 'na',
          notes: '',
        },
        {
          category: 'fire_protection',
          item_key: 'fire_resistant_cables',
          item_label: 'כבלים חסיני אש (במידת הצורך)',
          result: 'pass',
          notes: '',
        },
        {
          category: 'fire_protection',
          item_key: 'fire_panel_base',
          item_label: 'מסד הלוח מוארק',
          result: 'pass',
          notes: '',
        },
        // הארקה
        {
          category: 'grounding',
          item_key: 'gnd_panel_door',
          item_label: 'דלת הלוח מוארקת (כשמותקן עליה ציוד)',
          result: 'pass',
          notes: '',
        },
        {
          category: 'grounding',
          item_key: 'gnd_metallic_continuity',
          item_label: 'רציפות הארקה לשירותים מתכתיים',
          result: 'pass',
          notes: '',
        },
        {
          category: 'grounding',
          item_key: 'gnd_ct_grounding',
          item_label: 'הארקת שנאי זרם',
          result: 'na',
          notes: '',
        },
        // גובה
        {
          category: 'height_compliance',
          item_key: 'height_operating_devices',
          item_label: "גובה אמצעי הפעלה (במתקן דירתי מעל 1.4 מ')",
          result: 'pass',
          notes: '',
        },
        {
          category: 'height_compliance',
          item_key: 'height_terminals',
          item_label: 'גובה מחדקי חיבורים',
          result: 'pass',
          notes: '',
        },
        // בדיקות מדידות
        {
          category: 'tests_measurements',
          item_key: 'test_disconnect_capacity',
          item_label: 'כושר ניתוק – התאמה לזרם קצר צפוי',
          result: 'pass',
          notes: '',
        },
        {
          category: 'tests_measurements',
          item_key: 'test_trip_coil',
          item_label: 'פעולת סליל הפסקה – Trip coil',
          result: 'na',
          notes: '',
        },
        {
          category: 'tests_measurements',
          item_key: 'test_ins_supply',
          item_label: 'התנגדות בידוד כבל ההזנה',
          result: 'pass',
          notes: '',
        },
        {
          category: 'tests_measurements',
          item_key: 'test_ins_branch',
          item_label: 'התנגדות בידוד כבלים למעגלים',
          result: 'pass',
          notes: '',
        },
        {
          category: 'tests_measurements',
          item_key: 'test_rcd_condition',
          item_label: 'תקינות מפסקי מגן בזרם דלף',
          result: 'pass',
          notes: '',
        },
        // שילוט
        {
          category: 'signage_labeling',
          item_key: 'sign_supply_source',
          item_label: 'שילוט מקור ההזנה',
          result: 'pass',
          notes: '',
        },
        {
          category: 'signage_labeling',
          item_key: 'sign_panel_purpose',
          item_label: 'שילוט מטרת הלוח (מ"מ)',
          result: 'pass',
          notes: '',
        },
        {
          category: 'signage_labeling',
          item_key: 'sign_breaker_designations',
          item_label: 'שילוט ייעוד המפסקים (בר-קיימא)',
          result: 'fail',
          notes: 'חסר שילוט על 3 מפסקים',
        },
        {
          category: 'signage_labeling',
          item_key: 'sign_cable_labeling',
          item_label: 'שילוט ייעוד הכבלים',
          result: 'pass',
          notes: '',
        },
        {
          category: 'signage_labeling',
          item_key: 'sign_terminals_100a',
          item_label: 'סימון מחדקים (בלוחות מעל 100A)',
          result: 'na',
          notes: '',
        },
        {
          category: 'signage_labeling',
          item_key: 'sign_door_breakers',
          item_label: 'שילוט שמות המפסקים על דלת הלוח',
          result: 'pass',
          notes: '',
        },
        {
          category: 'signage_labeling',
          item_key: 'sign_spare_breakers',
          item_label: 'מפסקים שמורים ללא שילוט במצב מחובר',
          result: 'pass',
          notes: '',
        },
      ],
      instruments: [
        {
          name: 'מגה-אוהמטר (Megohmmeter)',
          model: 'Fluke 1587',
          serial_number: 'SN-001',
          calibration_date: '2025-06-01',
        },
        {
          name: 'בודק לולאת תקלה (Loop Tester)',
          model: 'Metrel MI3102',
          serial_number: 'SN-002',
          calibration_date: '2025-06-01',
        },
      ],
      panels: [
        {
          panel_name: 'לוח ראשי',
          circuit_measurements: [
            {
              circuit_number: 1,
              ins_1l_e: 200,
              grounding_continuity: 0.3,
              fault_loop_impedance: 0.45,
              voltage: 230,
            },
            {
              circuit_number: 2,
              ins_1l_e: 185,
              grounding_continuity: 0.4,
              fault_loop_impedance: 0.48,
              voltage: 230,
            },
            {
              circuit_number: 3,
              ins_1l_e: 210,
              grounding_continuity: 0.3,
              fault_loop_impedance: 0.42,
              voltage: 230,
            },
          ],
        },
      ],
      generator: {
        cert: {
          manufacturer: 'Perkins',
          model: '1104A-44TG2',
          serial_number: 'GEN-001',
          power_rating: '80 kVA',
          installation_location: 'חדר גנרטור',
          panel_location: 'לוח חשמל ראשי',
          supplier: 'אנרגיה בע"מ',
          permit_number: 'P-2025-001',
        },
        docReviews: [
          { item_label: 'תעודת מקור', result: 'pass', notes: '' },
          { item_label: 'תעודת כיול', result: 'pass', notes: '' },
        ],
        visualChecks: [
          { item_label: 'בדיקה חזותית כללית', result: 'pass', notes: '' },
          { item_label: 'רמת שמן', result: 'pass', notes: '' },
        ],
      },
      faultLoop: {
        zph1_n: '0.35',
        zph1_e: '0.41',
        zph2_n: '0.37',
        zph2_e: '0.42',
        zph3_n: '0.36',
        zph3_e: '0.40',
      },
      defects: [
        {
          description: 'חסר שילוט על 3 מפסקים בלוח הראשי',
          severity: 'minor',
          resolved: false,
          fix_deadline: '2026-03-15',
        },
      ],
      recommendations: [
        { text: 'יש לסמן את כל המפסקים בלוח בשלטים עמידים ובר-קיימא', electrician_response: '' },
      ],
    }

    const pdfBuffer = await renderToBuffer(<InspectionPDF data={demoData} />)
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="inspection-${id}.pdf"`,
      },
    })
  }

  // Production mode
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [
      { data: inspection },
      { data: visualChecks },
      { data: instruments },
      { data: panels },
      { data: faultLoop },
      { data: defects },
      { data: recommendations },
      { data: genCert },
    ] = await Promise.all([
      supabase.from('inspections').select('*').eq('id', id).eq('inspector_id', user.id).single(),
      supabase.from('visual_checks').select('*').eq('inspection_id', id).order('created_at'),
      supabase.from('instruments').select('*').eq('inspection_id', id).order('sort_order'),
      supabase
        .from('panels')
        .select('*, circuit_measurements(*)')
        .eq('inspection_id', id)
        .order('sort_order'),
      supabase.from('fault_loop').select('*').eq('inspection_id', id).maybeSingle(),
      supabase.from('defects').select('*').eq('inspection_id', id).order('created_at'),
      supabase.from('recommendations').select('*').eq('inspection_id', id).order('sort_order'),
      supabase.from('generator_certificates').select('*').eq('inspection_id', id).maybeSingle(),
    ])

    // Fetch generator doc/visual checks if cert exists
    let generator = null
    if (genCert) {
      const [{ data: docReviews }, { data: genVisualChecks }] = await Promise.all([
        supabase
          .from('generator_doc_reviews')
          .select('*')
          .eq('certificate_id', genCert.id)
          .order('created_at'),
        supabase
          .from('generator_visual_checks')
          .select('*')
          .eq('certificate_id', genCert.id)
          .order('created_at'),
      ])
      generator = {
        cert: genCert,
        docReviews: docReviews ?? [],
        visualChecks: genVisualChecks ?? [],
      }
    }

    if (!inspection) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const pdfBuffer = await renderToBuffer(
      <InspectionPDF
        data={{
          inspection,
          visualChecks: visualChecks ?? [],
          instruments: instruments ?? [],
          panels: panels ?? [],
          faultLoop: faultLoop ?? null,
          defects: defects ?? [],
          recommendations: recommendations ?? [],
          generator,
        }}
      />
    )

    // Store in Supabase Storage (non-fatal)
    let pdfUrl: string | null = null
    try {
      const fileName = `inspections/${id}/report-${Date.now()}.pdf`
      const { data: uploadData } = await supabase.storage
        .from('photos')
        .upload(fileName, pdfBuffer, { contentType: 'application/pdf', upsert: true })
      if (uploadData) {
        const {
          data: { publicUrl },
        } = supabase.storage.from('photos').getPublicUrl(fileName)
        pdfUrl = publicUrl
        await supabase.from('inspections').update({ pdf_url: pdfUrl }).eq('id', id)
      }
    } catch {
      /* non-fatal */
    }

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="inspection-${id}.pdf"`,
        ...(pdfUrl ? { 'X-PDF-URL': pdfUrl } : {}),
      },
    })
  } catch (err) {
    console.error('PDF generation error:', err)
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  }
}
