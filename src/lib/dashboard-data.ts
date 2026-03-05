import type { Inspection } from '@/lib/supabase/types'

export const DEMO_INSPECTIONS: Inspection[] = [
  { id: '1', inspector_id: 'dev', client_name: 'ישראל ישראלי', installation_type: 'residential', address: 'רחוב הרצל 12, תל אביב', connection_size_amps: 100, inspection_date: '2026-02-20', status: 'submitted', approval_status: 'approved', created_at: '2026-02-20T10:00:00Z', updated_at: '2026-02-20T10:00:00Z', owner_name: null, owner_phone: null, owner_email: null, electrician_name: null, electrician_phone: null, electrician_email: null, designer_name: null, designer_phone: null, designer_email: null, has_generator: false, completion_percentage: 100, pdf_url: null, inspector_signature: null, submitted_at: null },
  { id: '2', inspector_id: 'dev', client_name: 'מפעל ABC', installation_type: 'industrial', address: 'אזור תעשייה, חיפה', connection_size_amps: 630, inspection_date: '2026-02-15', status: 'submitted', approval_status: 'approved_with_recommendations', created_at: '2026-02-15T08:00:00Z', updated_at: '2026-02-15T08:00:00Z', owner_name: null, owner_phone: null, owner_email: null, electrician_name: null, electrician_phone: null, electrician_email: null, designer_name: null, designer_phone: null, designer_email: null, has_generator: true, completion_percentage: 100, pdf_url: null, inspector_signature: null, submitted_at: null },
  { id: '3', inspector_id: 'dev', client_name: 'מרכז קניות', installation_type: 'commercial', address: 'שדרות בן גוריון 5, ירושלים', connection_size_amps: 400, inspection_date: '2026-02-10', status: 'in_progress', approval_status: null, created_at: '2026-02-10T09:00:00Z', updated_at: '2026-02-10T09:00:00Z', owner_name: null, owner_phone: null, owner_email: null, electrician_name: null, electrician_phone: null, electrician_email: null, designer_name: null, designer_phone: null, designer_email: null, has_generator: false, completion_percentage: 60, pdf_url: null, inspector_signature: null, submitted_at: null },
  { id: '4', inspector_id: 'dev', client_name: 'דוד כהן', installation_type: 'residential', address: 'רחוב ויצמן 3, רמת גן', connection_size_amps: 63, inspection_date: '2026-01-28', status: 'submitted', approval_status: 'rejected', created_at: '2026-01-28T11:00:00Z', updated_at: '2026-01-28T11:00:00Z', owner_name: null, owner_phone: null, owner_email: null, electrician_name: null, electrician_phone: null, electrician_email: null, designer_name: null, designer_phone: null, designer_email: null, has_generator: false, completion_percentage: 100, pdf_url: null, inspector_signature: null, submitted_at: null },
  { id: '5', inspector_id: 'dev', client_name: 'בניין משרדים', installation_type: 'commercial', address: 'אחד העם 20, תל אביב', connection_size_amps: 250, inspection_date: '2026-01-20', status: 'draft', approval_status: null, created_at: '2026-01-20T14:00:00Z', updated_at: '2026-01-20T14:00:00Z', owner_name: null, owner_phone: null, owner_email: null, electrician_name: null, electrician_phone: null, electrician_email: null, designer_name: null, designer_phone: null, designer_email: null, has_generator: false, completion_percentage: 20, pdf_url: null, inspector_signature: null, submitted_at: null },
]

const COLOR_APPROVED         = '#16a34a'
const COLOR_WITH_RECS        = '#f59e0b'
const COLOR_REJECTED         = '#dc2626'
const COLOR_IN_PROGRESS      = '#94a3b8'

export const DEMO_STATUS = [
  { name: 'מאושר',     value: 2, color: COLOR_APPROVED    },
  { name: 'עם המלצות', value: 1, color: COLOR_WITH_RECS   },
  { name: 'נדחה',      value: 1, color: COLOR_REJECTED    },
  { name: 'בתהליך',    value: 1, color: COLOR_IN_PROGRESS },
]

export const DEMO_CATEGORY = [
  { category: 'שילוט/תיוג', count: 8 },
  { category: 'הארקה', count: 6 },
  { category: 'כבלים', count: 5 },
  { category: 'כיסויים', count: 4 },
  { category: 'הגנת אש', count: 3 },
]

export const DEMO_MONTHLY = [
  { month: 'ספט', count: 3 },
  { month: 'אוק', count: 5 },
  { month: 'נוב', count: 4 },
  { month: 'דצמ', count: 7 },
  { month: 'ינו', count: 6 },
  { month: 'פבר', count: 5 },
]

export const DEMO_DEFECTS = [
  { defect: 'שילוט מפסקים', count: 12 },
  { defect: 'בידוד לא תקין', count: 9 },
  { defect: 'הארקת לוח', count: 8 },
  { defect: 'כיסויי מגע', count: 7 },
  { defect: 'איטום אש', count: 6 },
  { defect: 'תיוג כבלים', count: 5 },
  { defect: 'מפסק פחת', count: 4 },
  { defect: 'גובה התקנה', count: 3 },
]

export interface StatusDataItem { name: string; value: number; color: string }

export const buildStatusData = (inspections: Inspection[]): StatusDataItem[] =>
  [
    { name: 'מאושר',       value: inspections.filter(i => i.approval_status === 'approved').length,                                        color: COLOR_APPROVED    },
    { name: 'עם המלצות',   value: inspections.filter(i => i.approval_status === 'approved_with_recommendations').length,                   color: COLOR_WITH_RECS   },
    { name: 'נדחה',        value: inspections.filter(i => i.approval_status === 'rejected').length,                                        color: COLOR_REJECTED    },
    { name: 'בתהליך',      value: inspections.filter(i => i.status === 'draft' || i.status === 'in_progress').length,                      color: COLOR_IN_PROGRESS },
  ].filter(d => d.value > 0)
