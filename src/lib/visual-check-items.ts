export interface VisualCheckItem {
  key: string
  label: string
  labelHe: string
}

export interface VisualCheckCategory {
  id: string
  label: string
  labelHe: string
  items: VisualCheckItem[]
}

export const VISUAL_CHECK_CATEGORIES: VisualCheckCategory[] = [
  {
    id: 'general',
    label: 'General',
    labelHe: 'כללי',
    items: [
      { key: 'gen_panel_conformity',       label: 'Panel and equipment conformity to standards',          labelHe: 'התאמת הלוח והציוד שבו לתקנים' },
      { key: 'gen_plan_conformity',         label: 'Conformity to approved plans',                         labelHe: 'התאמה לתוכניות' },
      { key: 'gen_diagram_nameplate',       label: 'Panel diagram adjacent to nameplate',                  labelHe: 'תרשים הלוח בצמוד ללוחית הלוח' },
      { key: 'gen_access_ventilation',      label: 'Good access, ventilation, lighting, and location',     labelHe: 'גישה נוחה, תנאי אוורור, אור, מיקום הלוח' },
      { key: 'gen_stable_surface',          label: 'Installed on a stable surface',                        labelHe: 'קביעה על משטחי יציב' },
      { key: 'gen_spacing_1_75',            label: 'Spacing ≥1.75 cm between supply types',                labelHe: 'מרווחים בין שני סוגי אספקה פחות מ-1.75 ס"מ' },
    ],
  },
  {
    id: 'cables_conductors',
    label: 'Cables & Conductors',
    labelHe: 'כבלים ומוליכים',
    items: [
      { key: 'cable_fuse_conductor_match',  label: 'Fuse-to-conductor cross-section match',                labelHe: 'התאמת המבטחים לשטחי המוליכים' },
      { key: 'cable_neutral_ground_screw',  label: 'Neutral and ground each in a separate screw',          labelHe: 'מוליכי אפס והארקה כל אחד בבורג נפרד' },
      { key: 'cable_color_coding',          label: 'Conductor color coding (blue = neutral)',               labelHe: 'צבעי זיהוי המוליכים (הצבע הכחול)' },
      { key: 'cable_entry_protection',      label: 'Cable entry through protected opening (no injuries)',   labelHe: 'כניסת הכבלים דרך פתח מוגן למניעת פציעות' },
      { key: 'cable_circuit_separation',    label: 'Separation between circuits',                          labelHe: 'הפרדה בין מעגלים' },
      { key: 'cable_bending_angles',        label: 'Conductor bending angles within panel',                labelHe: 'זוויות כיפוף מוליכים בלוח' },
      { key: 'cable_ties_connections',      label: 'Cable ties and connections in good condition',         labelHe: 'תקינות מעלי כבל וחיבורים' },
    ],
  },
  {
    id: 'water_protection',
    label: 'Water Protection',
    labelHe: 'מים',
    items: [
      { key: 'water_no_pipe_proximity',     label: 'No proximity to water or gas pipes',                   labelHe: 'אין קרבה לצנרת מים, גז' },
      { key: 'water_sealing_covers',        label: 'Sealing/covers preventing water ingress',              labelHe: 'איטומים/כיסויים למניעת חדירת מים' },
      { key: 'water_fire_sealing',          label: 'Sealing to prevent fire spread',                       labelHe: 'איטום למניעת הפצות אש' },
    ],
  },
  {
    id: 'fire_protection',
    label: 'Fire Protection',
    labelHe: 'אש',
    items: [
      { key: 'fire_detection_trip',         label: 'Fire detection/suppression system and trip coil connection', labelHe: 'קיום מערכת גילוי/כיבוי אש וחיבור לסליל הפסקה' },
      { key: 'fire_resistant_cables',       label: 'Fire-resistant cables where required',                 labelHe: 'כבלים חסיני אש (במידת הצורך)' },
      { key: 'fire_panel_base',             label: 'Panel base grounded',                                  labelHe: 'מסד הלוח מוארק' },
    ],
  },
  {
    id: 'grounding',
    label: 'Grounding',
    labelHe: 'הארקה',
    items: [
      { key: 'gnd_panel_door',             label: 'Panel door grounded (when equipment mounted)',         labelHe: 'דלת הלוח מוארקת (כשמותקן עליה ציוד)' },
      { key: 'gnd_metallic_continuity',    label: 'Grounding continuity to metallic services',            labelHe: 'רציפות הארקה לשירותים מתכתיים' },
      { key: 'gnd_ct_grounding',           label: 'Current transformer (CT) grounding',                  labelHe: 'הארקת שנאי זרם' },
    ],
  },
  {
    id: 'height_compliance',
    label: 'Height Compliance',
    labelHe: 'גובה',
    items: [
      { key: 'height_operating_devices',   label: 'Operating devices ≥1.4 m height (residential)',       labelHe: 'גובה אמצעי הפעלה (במתקן דירתי מעל 1.4 מ\')' },
      { key: 'height_terminals',           label: 'Connection terminals at proper height',                labelHe: 'גובה מחדקי חיבורים' },
    ],
  },
  {
    id: 'tests_measurements',
    label: 'Tests & Measurements',
    labelHe: 'בדיקות מדידות',
    items: [
      { key: 'test_disconnect_capacity',   label: 'Disconnect capacity vs. expected fault current',       labelHe: 'כושר ניתוק – התאמה לזרם קצר צפוי' },
      { key: 'test_trip_coil',             label: 'Trip coil (Trip coil) function',                      labelHe: 'פעולת סליל הפסקה – Trip coil' },
      { key: 'test_ins_supply',            label: 'Insulation resistance – supply cable',                 labelHe: 'התנגדות בידוד כבל ההזנה' },
      { key: 'test_ins_branch',            label: 'Insulation resistance – branch cables',                labelHe: 'התנגדות בידוד כבלים למעגלים' },
      { key: 'test_rcd_condition',         label: 'RCD / surge protector in good condition',             labelHe: 'תקינות מפסקי מגן בזרם דלף' },
    ],
  },
  {
    id: 'signage_labeling',
    label: 'Signage & Labeling',
    labelHe: 'שילוט',
    items: [
      { key: 'sign_supply_source',         label: 'Supply source label',                                  labelHe: 'שילוט מקור ההזנה' },
      { key: 'sign_panel_purpose',         label: 'Panel purpose label (sticker)',                        labelHe: 'שילוט מטרת הלוח (מ"מ)' },
      { key: 'sign_breaker_designations',  label: 'Breaker designations – durable labeling',             labelHe: 'שילוט ייעוד המפסקים (בר-קיימא)' },
      { key: 'sign_cable_labeling',        label: 'Cable designation labeling',                           labelHe: 'שילוט ייעוד הכבלים' },
      { key: 'sign_terminals_100a',        label: 'Terminal marking for panels >100 A',                  labelHe: 'סימון מחדקים (בלוחות מעל 100A)' },
      { key: 'sign_door_breakers',         label: 'Breaker names on panel door',                         labelHe: 'שילוט שמות המפסקים על דלת הלוח' },
      { key: 'sign_spare_breakers',        label: 'Spare breakers or no label in connected position',    labelHe: 'מפסקים שמורים ללא שילוט במצב מחובר' },
    ],
  },
]

export const GENERATOR_DOC_REVIEW_ITEMS: VisualCheckItem[] = [
  { key: 'gen_doc_single_line',           label: 'Single-line connection plans',                         labelHe: 'תכניות חיבור קו יחיד' },
  { key: 'gen_doc_layout_plans',          label: 'Equipment layout plans',                               labelHe: 'תכניות פריסת ציוד' },
  { key: 'gen_doc_grounding_plan',        label: 'Grounding plan + protection method',                   labelHe: 'תכנית הארקה + שיטת הגנה' },
  { key: 'gen_doc_switching_data',        label: 'Switching/protection data',                            labelHe: 'נתוני מיתוג/הגנה' },
  { key: 'gen_doc_electrician_declaration', label: 'Electrician declaration',                            labelHe: 'הצהרת חשמלאי' },
  { key: 'gen_doc_maintenance_reports',   label: 'Previous maintenance reports',                         labelHe: 'דוחות תחזוקה קודמים' },
]

export const GENERATOR_VISUAL_ITEMS: VisualCheckItem[] = [
  { key: 'gen_vis_grounding_conformity',  label: 'Grounding conformity to plans',                       labelHe: 'תאימות הארקה לתכניות' },
  { key: 'gen_vis_system_grounding',      label: 'Generator system grounding location',                  labelHe: 'מיקום הארקת מערכת גנרטור' },
  { key: 'gen_vis_protection_grounding',  label: 'Protection grounding location',                        labelHe: 'מיקום הארקת הגנה' },
  { key: 'gen_vis_room_clean',            label: 'Generator room clean & ventilated (not used as storage)', labelHe: 'חדר גנרטור נקי ומאוורר (לא משמש למחסן)' },
]
