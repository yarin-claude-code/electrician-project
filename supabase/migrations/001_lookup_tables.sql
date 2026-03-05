-- Migration 001: Lookup tables for hardcoded data
-- Run this against your Supabase project via the SQL editor or CLI.

-- ============================================================
-- LOOKUP VALUES (simple enum-like dropdowns)
-- ============================================================
-- Stores option lists for: installation_type, panel_type,
-- instrument_type, defect_severity, approval_status, inspection_status
CREATE TABLE IF NOT EXISTS lookup_values (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category     TEXT NOT NULL,
  key          TEXT NOT NULL,
  label_he     TEXT NOT NULL,
  label_en     TEXT,
  sort_order   INTEGER DEFAULT 0,
  UNIQUE (category, key)
);

-- Public read (no auth required — these are static reference data)
ALTER TABLE lookup_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lookup_values_read" ON lookup_values FOR SELECT USING (true);

-- ============================================================
-- CHECK ITEM TEMPLATES (visual checklist definitions)
-- ============================================================
-- Stores the template for visual_checks step, generator doc
-- reviews, and generator visual checks.
CREATE TABLE IF NOT EXISTS check_item_templates (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section        TEXT NOT NULL, -- 'main' | 'generator_doc' | 'generator_visual'
  category_id    TEXT,          -- e.g. 'general', 'grounding' (null for generator sections)
  category_he    TEXT,
  category_en    TEXT,
  item_key       TEXT NOT NULL UNIQUE,
  item_label_he  TEXT NOT NULL,
  item_label_en  TEXT,
  sort_order     INTEGER DEFAULT 0
);

-- Public read
ALTER TABLE check_item_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "check_item_templates_read" ON check_item_templates FOR SELECT USING (true);

-- ============================================================
-- SEED: lookup_values
-- ============================================================

-- installation_type
INSERT INTO lookup_values (category, key, label_he, label_en, sort_order) VALUES
  ('installation_type', 'residential', 'מגורים',  'Residential', 1),
  ('installation_type', 'commercial',  'מסחרי',   'Commercial',  2),
  ('installation_type', 'industrial',  'תעשייתי', 'Industrial',  3),
  ('installation_type', 'other',       'אחר',     'Other',       4)
ON CONFLICT (category, key) DO NOTHING;

-- panel_type
INSERT INTO lookup_values (category, key, label_he, label_en, sort_order) VALUES
  ('panel_type', 'main_panel',        'לוח ראשי',           'Main Panel',        1),
  ('panel_type', 'sub_panel',         'לוח משנה',           'Sub-Panel',         2),
  ('panel_type', 'residential_panel', 'לוח דירתי',          'Residential Panel', 3),
  ('panel_type', 'floor_panel',       'לוח קומה',           'Floor Panel',       4),
  ('panel_type', 'stairwell_panel',   'לוח חדר מדרגות',     'Stairwell Panel',   5),
  ('panel_type', 'outdoor_panel',     'לוח חיצוני',         'Outdoor Panel',     6),
  ('panel_type', 'commercial_panel',  'לוח מסחרי',          'Commercial Panel',  7),
  ('panel_type', 'industrial_panel',  'לוח תעשייתי',        'Industrial Panel',  8),
  ('panel_type', 'generator_panel',   'לוח גנרטור',         'Generator Panel',   9),
  ('panel_type', 'other',             'אחר',                'Other',             10)
ON CONFLICT (category, key) DO NOTHING;

-- instrument_type
INSERT INTO lookup_values (category, key, label_he, label_en, sort_order) VALUES
  ('instrument_type', 'megohmmeter',        'מגה-אוהמטר (Megohmmeter)',         'Megohmmeter',         1),
  ('instrument_type', 'multimeter',         'מולטימטר (Multimeter)',             'Multimeter',          2),
  ('instrument_type', 'clamp_meter',        'מהדק אמפר (Clamp Meter)',           'Clamp Meter',         3),
  ('instrument_type', 'loop_tester',        'בודק לולאת תקלה (Loop Tester)',     'Loop Tester',         4),
  ('instrument_type', 'rcd_tester',         'בודק RCD / GFCI',                  'RCD/GFCI Tester',     5),
  ('instrument_type', 'continuity_tester',  'בודק רציפות (Continuity Tester)',  'Continuity Tester',   6),
  ('instrument_type', 'voltage_tester',     'בודק מתח (Voltage Tester)',         'Voltage Tester',      7),
  ('instrument_type', 'power_analyzer',     'אנלייזר חשמלי (Power Analyzer)',   'Power Analyzer',      8),
  ('instrument_type', 'oscilloscope',       'אוסצילוסקופ (Oscilloscope)',        'Oscilloscope',        9),
  ('instrument_type', 'other',              'אחר',                              'Other',               10)
ON CONFLICT (category, key) DO NOTHING;

-- defect_severity
INSERT INTO lookup_values (category, key, label_he, label_en, sort_order) VALUES
  ('defect_severity', 'critical', 'קריטי',  'Critical', 1),
  ('defect_severity', 'major',    'מהותי',  'Major',    2),
  ('defect_severity', 'minor',    'קל',     'Minor',    3)
ON CONFLICT (category, key) DO NOTHING;

-- approval_status
INSERT INTO lookup_values (category, key, label_he, label_en, sort_order) VALUES
  ('approval_status', 'approved',                      'מאושר',                              'Approved',                        1),
  ('approval_status', 'approved_with_recommendations', 'מאושר עם המלצות',                   'Approved with recommendations',   2),
  ('approval_status', 'rejected',                      'נדחה',                               'Rejected',                        3)
ON CONFLICT (category, key) DO NOTHING;

-- inspection_status
INSERT INTO lookup_values (category, key, label_he, label_en, sort_order) VALUES
  ('inspection_status', 'draft',       'טיוטה',       'Draft',       1),
  ('inspection_status', 'in_progress', 'בתהליך',      'In Progress', 2),
  ('inspection_status', 'completed',   'הושלם',       'Completed',   3),
  ('inspection_status', 'submitted',   'הוגש',        'Submitted',   4)
ON CONFLICT (category, key) DO NOTHING;

-- ============================================================
-- SEED: check_item_templates — main visual checks
-- ============================================================
INSERT INTO check_item_templates (section, category_id, category_he, category_en, item_key, item_label_he, item_label_en, sort_order) VALUES
  -- general
  ('main','general','כללי','General','gen_panel_conformity',  'התאמת הלוח והציוד שבו לתקנים',                       'Panel and equipment conformity to standards',          1),
  ('main','general','כללי','General','gen_plan_conformity',   'התאמה לתוכניות',                                      'Conformity to approved plans',                         2),
  ('main','general','כללי','General','gen_diagram_nameplate', 'תרשים הלוח בצמוד ללוחית הלוח',                       'Panel diagram adjacent to nameplate',                  3),
  ('main','general','כללי','General','gen_access_ventilation','גישה נוחה, תנאי אוורור, אור, מיקום הלוח',            'Good access, ventilation, lighting, and location',     4),
  ('main','general','כללי','General','gen_stable_surface',    'קביעה על משטחי יציב',                                 'Installed on a stable surface',                        5),
  ('main','general','כללי','General','gen_spacing_1_75',      'מרווחים בין שני סוגי אספקה פחות מ-1.75 ס"מ',         'Spacing ≥1.75 cm between supply types',                6),
  -- cables_conductors
  ('main','cables_conductors','כבלים ומוליכים','Cables & Conductors','cable_fuse_conductor_match','התאמת המבטחים לשטחי המוליכים',   'Fuse-to-conductor cross-section match',                1),
  ('main','cables_conductors','כבלים ומוליכים','Cables & Conductors','cable_neutral_ground_screw','מוליכי אפס והארקה כל אחד בבורג נפרד','Neutral and ground each in a separate screw',     2),
  ('main','cables_conductors','כבלים ומוליכים','Cables & Conductors','cable_color_coding',       'צבעי זיהוי המוליכים (הצבע הכחול)',  'Conductor color coding (blue = neutral)',               3),
  ('main','cables_conductors','כבלים ומוליכים','Cables & Conductors','cable_entry_protection',   'כניסת הכבלים דרך פתח מוגן למניעת פציעות','Cable entry through protected opening',           4),
  ('main','cables_conductors','כבלים ומוליכים','Cables & Conductors','cable_circuit_separation', 'הפרדה בין מעגלים',                   'Separation between circuits',                          5),
  ('main','cables_conductors','כבלים ומוליכים','Cables & Conductors','cable_bending_angles',     'זוויות כיפוף מוליכים בלוח',          'Conductor bending angles within panel',                 6),
  ('main','cables_conductors','כבלים ומוליכים','Cables & Conductors','cable_ties_connections',   'תקינות מעלי כבל וחיבורים',           'Cable ties and connections in good condition',          7),
  -- water_protection
  ('main','water_protection','מים','Water Protection','water_no_pipe_proximity','אין קרבה לצנרת מים, גז',             'No proximity to water or gas pipes',                   1),
  ('main','water_protection','מים','Water Protection','water_sealing_covers',   'איטומים/כיסויים למניעת חדירת מים',  'Sealing/covers preventing water ingress',              2),
  ('main','water_protection','מים','Water Protection','water_fire_sealing',     'איטום למניעת הפצות אש',              'Sealing to prevent fire spread',                       3),
  -- fire_protection
  ('main','fire_protection','אש','Fire Protection','fire_detection_trip',  'קיום מערכת גילוי/כיבוי אש וחיבור לסליל הפסקה','Fire detection/suppression system and trip coil connection',1),
  ('main','fire_protection','אש','Fire Protection','fire_resistant_cables','כבלים חסיני אש (במידת הצורך)',           'Fire-resistant cables where required',                 2),
  ('main','fire_protection','אש','Fire Protection','fire_panel_base',       'מסד הלוח מוארק',                        'Panel base grounded',                                  3),
  -- grounding
  ('main','grounding','הארקה','Grounding','gnd_panel_door',       'דלת הלוח מוארקת (כשמותקן עליה ציוד)',   'Panel door grounded (when equipment mounted)',          1),
  ('main','grounding','הארקה','Grounding','gnd_metallic_continuity','רציפות הארקה לשירותים מתכתיים',         'Grounding continuity to metallic services',            2),
  ('main','grounding','הארקה','Grounding','gnd_ct_grounding',     'הארקת שנאי זרם',                         'Current transformer (CT) grounding',                   3),
  -- height_compliance
  ('main','height_compliance','גובה','Height Compliance','height_operating_devices','גובה אמצעי הפעלה (במתקן דירתי מעל 1.4 מ'')',  'Operating devices ≥1.4 m height (residential)',       1),
  ('main','height_compliance','גובה','Height Compliance','height_terminals',         'גובה מחדקי חיבורים',                              'Connection terminals at proper height',                2),
  -- tests_measurements
  ('main','tests_measurements','בדיקות מדידות','Tests & Measurements','test_disconnect_capacity','כושר ניתוק – התאמה לזרם קצר צפוי', 'Disconnect capacity vs. expected fault current',       1),
  ('main','tests_measurements','בדיקות מדידות','Tests & Measurements','test_trip_coil',          'פעולת סליל הפסקה – Trip coil',       'Trip coil function',                                   2),
  ('main','tests_measurements','בדיקות מדידות','Tests & Measurements','test_ins_supply',         'התנגדות בידוד כבל ההזנה',            'Insulation resistance – supply cable',                 3),
  ('main','tests_measurements','בדיקות מדידות','Tests & Measurements','test_ins_branch',         'התנגדות בידוד כבלים למעגלים',        'Insulation resistance – branch cables',                4),
  ('main','tests_measurements','בדיקות מדידות','Tests & Measurements','test_rcd_condition',      'תקינות מפסקי מגן בזרם דלף',          'RCD / surge protector in good condition',              5),
  -- signage_labeling
  ('main','signage_labeling','שילוט','Signage & Labeling','sign_supply_source',    'שילוט מקור ההזנה',                        'Supply source label',                                  1),
  ('main','signage_labeling','שילוט','Signage & Labeling','sign_panel_purpose',    'שילוט מטרת הלוח (מ"מ)',                   'Panel purpose label (sticker)',                         2),
  ('main','signage_labeling','שילוט','Signage & Labeling','sign_breaker_designations','שילוט ייעוד המפסקים (בר-קיימא)',        'Breaker designations – durable labeling',              3),
  ('main','signage_labeling','שילוט','Signage & Labeling','sign_cable_labeling',   'שילוט ייעוד הכבלים',                     'Cable designation labeling',                           4),
  ('main','signage_labeling','שילוט','Signage & Labeling','sign_terminals_100a',   'סימון מחדקים (בלוחות מעל 100A)',          'Terminal marking for panels >100 A',                   5),
  ('main','signage_labeling','שילוט','Signage & Labeling','sign_door_breakers',    'שילוט שמות המפסקים על דלת הלוח',         'Breaker names on panel door',                          6),
  ('main','signage_labeling','שילוט','Signage & Labeling','sign_spare_breakers',   'מפסקים שמורים ללא שילוט במצב מחובר',     'Spare breakers or no label in connected position',     7)
ON CONFLICT (item_key) DO NOTHING;

-- ============================================================
-- SEED: check_item_templates — generator doc review
-- ============================================================
INSERT INTO check_item_templates (section, category_id, item_key, item_label_he, item_label_en, sort_order) VALUES
  ('generator_doc', NULL, 'gen_doc_single_line',          'תכניות חיבור קו יחיד',       'Single-line connection plans',  1),
  ('generator_doc', NULL, 'gen_doc_layout_plans',         'תכניות פריסת ציוד',           'Equipment layout plans',        2),
  ('generator_doc', NULL, 'gen_doc_grounding_plan',       'תכנית הארקה + שיטת הגנה',    'Grounding plan + protection method', 3),
  ('generator_doc', NULL, 'gen_doc_switching_data',       'נתוני מיתוג/הגנה',            'Switching/protection data',     4),
  ('generator_doc', NULL, 'gen_doc_electrician_declaration','הצהרת חשמלאי',              'Electrician declaration',       5),
  ('generator_doc', NULL, 'gen_doc_maintenance_reports',  'דוחות תחזוקה קודמים',         'Previous maintenance reports',  6)
ON CONFLICT (item_key) DO NOTHING;

-- ============================================================
-- SEED: check_item_templates — generator visual checks
-- ============================================================
INSERT INTO check_item_templates (section, category_id, item_key, item_label_he, item_label_en, sort_order) VALUES
  ('generator_visual', NULL, 'gen_vis_grounding_conformity', 'תאימות הארקה לתכניות',                                            'Grounding conformity to plans',                                         1),
  ('generator_visual', NULL, 'gen_vis_system_grounding',     'מיקום הארקת מערכת גנרטור',                                        'Generator system grounding location',                                   2),
  ('generator_visual', NULL, 'gen_vis_protection_grounding', 'מיקום הארקת הגנה',                                                'Protection grounding location',                                         3),
  ('generator_visual', NULL, 'gen_vis_room_clean',           'חדר גנרטור נקי ומאוורר (לא משמש למחסן)',                          'Generator room clean & ventilated (not used as storage)',               4)
ON CONFLICT (item_key) DO NOTHING;
