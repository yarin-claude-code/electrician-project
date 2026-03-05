/**
 * lookup.ts
 *
 * Fetches reference data (dropdown options, checklist templates) from Supabase.
 * Falls back to the hardcoded constants in visual-check-items.ts when the DB
 * is unavailable (demo mode, offline, or migration not yet run).
 *
 * Usage (client components):
 *   const types = await fetchLookup('instrument_type')
 *   // → [{ key: 'megohmmeter', label_he: '...', label_en: '...' }, ...]
 *
 * Usage (server components / API routes): same — createClient() auto-selects
 * the stub or real client based on env vars.
 */

import { createClient } from '@/lib/supabase/client'
import {
  VISUAL_CHECK_CATEGORIES,
  GENERATOR_DOC_REVIEW_ITEMS,
  GENERATOR_VISUAL_ITEMS,
  type VisualCheckCategory,
  type VisualCheckItem,
} from '@/lib/visual-check-items'
import type { LookupValue, CheckItemTemplate } from '@/lib/supabase/types'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LookupOption {
  key: string
  label_he: string
  label_en: string | null
  sort_order: number
}

// ── In-memory cache (per page-load / per module) ──────────────────────────────

const _lookupCache = new Map<string, LookupOption[]>()
let _checkItemCache: CheckItemTemplate[] | null = null

// ── Lookup values ─────────────────────────────────────────────────────────────

/**
 * Fetch all options for a given category from `lookup_values`.
 * Returns hardcoded fallback if the table doesn't exist yet or is empty.
 */
export const fetchLookup = async (category: string): Promise<LookupOption[]> => {
  if (_lookupCache.has(category)) return _lookupCache.get(category)!

  const supabase = createClient()
  const { data } = await supabase
    .from('lookup_values')
    .select('key, label_he, label_en, sort_order')
    .eq('category', category)
    .order('sort_order')

  const rows = data as Pick<LookupValue, 'key' | 'label_he' | 'label_en' | 'sort_order'>[] | null

  if (rows && rows.length > 0) {
    _lookupCache.set(category, rows)
    return rows
  }

  // Fallback to hardcoded constants
  const fallback = FALLBACKS[category] ?? []
  _lookupCache.set(category, fallback)
  return fallback
}

// ── Check item templates ───────────────────────────────────────────────────────

/**
 * Fetch all check item templates from `check_item_templates`.
 * Falls back to the hardcoded VISUAL_CHECK_CATEGORIES structure.
 */
export const fetchCheckItemTemplates = async (): Promise<CheckItemTemplate[]> => {
  if (_checkItemCache) return _checkItemCache

  const supabase = createClient()
  const { data } = await supabase
    .from('check_item_templates')
    .select('*')
    .order('sort_order')

  const rows = data as CheckItemTemplate[] | null

  if (rows && rows.length > 0) {
    _checkItemCache = rows
    return rows
  }

  // Fallback: convert VISUAL_CHECK_CATEGORIES to flat template rows
  _checkItemCache = flattenVisualCheckCategories()
  return _checkItemCache
}

/**
 * Fetch visual check categories structured for the wizard UI.
 * Returns DB data shaped as VisualCheckCategory[], or the hardcoded fallback.
 */
export const fetchVisualCheckCategories = async (): Promise<VisualCheckCategory[]> => {
  const templates = await fetchCheckItemTemplates()
  const mainItems = templates.filter(t => t.section === 'main')

  if (mainItems.length === 0) return VISUAL_CHECK_CATEGORIES

  // Group by category_id preserving sort order
  const categoryMap = new Map<string, VisualCheckCategory>()
  for (const t of mainItems) {
    const catId = t.category_id ?? 'other'
    if (!categoryMap.has(catId)) {
      categoryMap.set(catId, {
        id: catId,
        label: t.category_en ?? catId,
        labelHe: t.category_he ?? catId,
        items: [],
      })
    }
    categoryMap.get(catId)!.items.push({
      key: t.item_key,
      label: t.item_label_en ?? t.item_key,
      labelHe: t.item_label_he,
    })
  }
  return Array.from(categoryMap.values())
}

/**
 * Fetch generator doc review items from DB or fallback.
 */
export const fetchGeneratorDocItems = async (): Promise<VisualCheckItem[]> => {
  const templates = await fetchCheckItemTemplates()
  const items = templates.filter(t => t.section === 'generator_doc')
  if (items.length === 0) return GENERATOR_DOC_REVIEW_ITEMS
  return items.map(t => ({ key: t.item_key, label: t.item_label_en ?? t.item_key, labelHe: t.item_label_he }))
}

/**
 * Fetch generator visual check items from DB or fallback.
 */
export const fetchGeneratorVisualItems = async (): Promise<VisualCheckItem[]> => {
  const templates = await fetchCheckItemTemplates()
  const items = templates.filter(t => t.section === 'generator_visual')
  if (items.length === 0) return GENERATOR_VISUAL_ITEMS
  return items.map(t => ({ key: t.item_key, label: t.item_label_en ?? t.item_key, labelHe: t.item_label_he }))
}

// ── Hardcoded fallbacks ────────────────────────────────────────────────────────

const FALLBACKS: Record<string, LookupOption[]> = {
  installation_type: [
    { key: 'residential', label_he: 'מגורים',  label_en: 'Residential', sort_order: 1 },
    { key: 'commercial',  label_he: 'מסחרי',   label_en: 'Commercial',  sort_order: 2 },
    { key: 'industrial',  label_he: 'תעשייתי', label_en: 'Industrial',  sort_order: 3 },
    { key: 'other',       label_he: 'אחר',     label_en: 'Other',       sort_order: 4 },
  ],
  panel_type: [
    { key: 'main_panel',        label_he: 'לוח ראשי',       label_en: 'Main Panel',        sort_order: 1 },
    { key: 'sub_panel',         label_he: 'לוח משנה',       label_en: 'Sub-Panel',         sort_order: 2 },
    { key: 'residential_panel', label_he: 'לוח דירתי',      label_en: 'Residential Panel', sort_order: 3 },
    { key: 'floor_panel',       label_he: 'לוח קומה',       label_en: 'Floor Panel',       sort_order: 4 },
    { key: 'stairwell_panel',   label_he: 'לוח חדר מדרגות', label_en: 'Stairwell Panel',   sort_order: 5 },
    { key: 'outdoor_panel',     label_he: 'לוח חיצוני',     label_en: 'Outdoor Panel',     sort_order: 6 },
    { key: 'commercial_panel',  label_he: 'לוח מסחרי',      label_en: 'Commercial Panel',  sort_order: 7 },
    { key: 'industrial_panel',  label_he: 'לוח תעשייתי',    label_en: 'Industrial Panel',  sort_order: 8 },
    { key: 'generator_panel',   label_he: 'לוח גנרטור',     label_en: 'Generator Panel',   sort_order: 9 },
    { key: 'other',             label_he: 'אחר',             label_en: 'Other',             sort_order: 10 },
  ],
  instrument_type: [
    { key: 'megohmmeter',       label_he: 'מגה-אוהמטר (Megohmmeter)',        label_en: 'Megohmmeter',       sort_order: 1 },
    { key: 'multimeter',        label_he: 'מולטימטר (Multimeter)',            label_en: 'Multimeter',        sort_order: 2 },
    { key: 'clamp_meter',       label_he: 'מהדק אמפר (Clamp Meter)',          label_en: 'Clamp Meter',       sort_order: 3 },
    { key: 'loop_tester',       label_he: 'בודק לולאת תקלה (Loop Tester)',   label_en: 'Loop Tester',       sort_order: 4 },
    { key: 'rcd_tester',        label_he: 'בודק RCD / GFCI',                 label_en: 'RCD/GFCI Tester',  sort_order: 5 },
    { key: 'continuity_tester', label_he: 'בודק רציפות (Continuity Tester)', label_en: 'Continuity Tester', sort_order: 6 },
    { key: 'voltage_tester',    label_he: 'בודק מתח (Voltage Tester)',        label_en: 'Voltage Tester',    sort_order: 7 },
    { key: 'power_analyzer',    label_he: 'אנלייזר חשמלי (Power Analyzer)',  label_en: 'Power Analyzer',    sort_order: 8 },
    { key: 'oscilloscope',      label_he: 'אוסצילוסקופ (Oscilloscope)',       label_en: 'Oscilloscope',      sort_order: 9 },
    { key: 'other',             label_he: 'אחר',                              label_en: 'Other',             sort_order: 10 },
  ],
  defect_severity: [
    { key: 'critical', label_he: 'קריטי', label_en: 'Critical', sort_order: 1 },
    { key: 'major',    label_he: 'מהותי', label_en: 'Major',    sort_order: 2 },
    { key: 'minor',    label_he: 'קל',    label_en: 'Minor',    sort_order: 3 },
  ],
  approval_status: [
    { key: 'approved',                      label_he: 'מאושר',             label_en: 'Approved',                      sort_order: 1 },
    { key: 'approved_with_recommendations', label_he: 'מאושר עם המלצות',  label_en: 'Approved with recommendations', sort_order: 2 },
    { key: 'rejected',                      label_he: 'נדחה',              label_en: 'Rejected',                      sort_order: 3 },
  ],
  inspection_status: [
    { key: 'draft',       label_he: 'טיוטה',  label_en: 'Draft',       sort_order: 1 },
    { key: 'in_progress', label_he: 'בתהליך', label_en: 'In Progress', sort_order: 2 },
    { key: 'completed',   label_he: 'הושלם',  label_en: 'Completed',   sort_order: 3 },
    { key: 'submitted',   label_he: 'הוגש',   label_en: 'Submitted',   sort_order: 4 },
  ],
}

// ── Private helpers ────────────────────────────────────────────────────────────

const flattenVisualCheckCategories = (): CheckItemTemplate[] => {
  const rows: CheckItemTemplate[] = []
  let order = 0
  for (const cat of VISUAL_CHECK_CATEGORIES) {
    for (const item of cat.items) {
      rows.push({
        id: item.key,
        section: 'main',
        category_id: cat.id,
        category_he: cat.labelHe,
        category_en: cat.label,
        item_key: item.key,
        item_label_he: item.labelHe,
        item_label_en: item.label,
        sort_order: order++,
      })
    }
  }
  for (const item of GENERATOR_DOC_REVIEW_ITEMS) {
    rows.push({ id: item.key, section: 'generator_doc', category_id: null, category_he: null, category_en: null, item_key: item.key, item_label_he: item.labelHe, item_label_en: item.label, sort_order: order++ })
  }
  for (const item of GENERATOR_VISUAL_ITEMS) {
    rows.push({ id: item.key, section: 'generator_visual', category_id: null, category_he: null, category_en: null, item_key: item.key, item_label_he: item.labelHe, item_label_en: item.label, sort_order: order++ })
  }
  return rows
}
