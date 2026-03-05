-- Electrical Inspection App - Supabase Schema
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  license_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INSPECTIONS
-- ============================================================
CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspector_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Step 1: General Info
  client_name TEXT,
  installation_type TEXT CHECK (installation_type IN ('residential', 'commercial', 'industrial', 'other')),
  address TEXT,
  connection_size_amps INTEGER CHECK (connection_size_amps BETWEEN 6 AND 2000),

  -- Owner details
  owner_name TEXT,
  owner_phone TEXT,
  owner_email TEXT,

  -- Electrician details
  electrician_name TEXT,
  electrician_phone TEXT,
  electrician_email TEXT,

  -- Designer details
  designer_name TEXT,
  designer_phone TEXT,
  designer_email TEXT,

  -- Inspection type
  has_generator BOOLEAN DEFAULT FALSE,
  inspection_date DATE DEFAULT CURRENT_DATE,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'submitted')),
  approval_status TEXT CHECK (approval_status IN ('approved', 'approved_with_recommendations', 'rejected')),

  -- Signature (base64 data URL)
  inspector_signature TEXT,

  -- Step 9 summary data
  completion_percentage INTEGER DEFAULT 0,

  -- PDF
  pdf_url TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ
);

-- ============================================================
-- VISUAL CHECKS (Step 2)
-- ============================================================
CREATE TABLE visual_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item_key TEXT NOT NULL,
  item_label TEXT NOT NULL,
  result TEXT CHECK (result IN ('pass', 'fail', 'na')),
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(inspection_id, item_key)
);

-- ============================================================
-- INSTRUMENTS (Step 3)
-- ============================================================
CREATE TABLE instruments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  name TEXT,
  model TEXT,
  serial_number TEXT,
  calibration_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PANELS (Step 4)
-- ============================================================
CREATE TABLE panels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  panel_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CIRCUIT MEASUREMENTS (Step 4 matrix)
-- ============================================================
CREATE TABLE circuit_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  panel_id UUID REFERENCES panels(id) ON DELETE CASCADE,
  circuit_number INTEGER NOT NULL CHECK (circuit_number BETWEEN 1 AND 12),

  -- Insulation resistance (MΩ)
  ins_1l_e NUMERIC,
  ins_2l_e NUMERIC,
  ins_3l_e NUMERIC,
  ins_n_e NUMERIC,
  ins_1l_n NUMERIC,
  ins_2l_n NUMERIC,
  ins_3l_n NUMERIC,
  ins_1l_2l NUMERIC,
  ins_3l_2l NUMERIC,
  ins_3l_1l NUMERIC,

  -- Grounding continuity (Ω)
  grounding_continuity NUMERIC,

  -- Fault loop impedance (Ω)
  fault_loop_impedance NUMERIC,

  -- Pass/fail checks
  overcurrent_protection TEXT CHECK (overcurrent_protection IN ('pass', 'fail', 'na')),
  phase_sequence TEXT CHECK (phase_sequence IN ('pass', 'fail', 'na')),

  -- Voltage measurements (V)
  voltage_1l_e NUMERIC,
  voltage_2l_e NUMERIC,
  voltage_3l_e NUMERIC,
  voltage_1l_n NUMERIC,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(panel_id, circuit_number)
);

-- ============================================================
-- FAULT LOOP (Step 5)
-- ============================================================
CREATE TABLE fault_loop (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE UNIQUE,

  zph1_n NUMERIC,
  zph1_e NUMERIC,
  zph2_n NUMERIC,
  zph2_e NUMERIC,
  zph3_n NUMERIC,
  zph3_e NUMERIC,
  z_1ph_2ph NUMERIC,

  -- Auto-calculated (stored for reporting)
  isc2ph_1 NUMERIC,
  isc2ph_2 NUMERIC,
  isc2ph_3 NUMERIC,
  isc3ph_1 NUMERIC,
  isc3ph_2 NUMERIC,
  isc3ph_3 NUMERIC,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DEFECTS (Step 6)
-- ============================================================
CREATE TABLE defects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
  visual_check_id UUID REFERENCES visual_checks(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  description TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('critical', 'major', 'minor')),
  photo_url TEXT,
  target_repair_date DATE,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RECOMMENDATIONS (Step 7)
-- ============================================================
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  text TEXT NOT NULL,
  electrician_response TEXT,
  designer_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GENERATOR CERTIFICATE (Step 8)
-- ============================================================
CREATE TABLE generator_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE UNIQUE,

  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  power_rating TEXT,
  installation_location TEXT,
  panel_location TEXT,
  supplier TEXT,
  permit_number TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generator document review items
CREATE TABLE generator_doc_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certificate_id UUID REFERENCES generator_certificates(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  item_label TEXT NOT NULL,
  result TEXT CHECK (result IN ('pass', 'fail', 'na')),
  notes TEXT,
  UNIQUE(certificate_id, item_key)
);

-- Generator visual inspection items
CREATE TABLE generator_visual_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certificate_id UUID REFERENCES generator_certificates(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  item_label TEXT NOT NULL,
  result TEXT CHECK (result IN ('pass', 'fail', 'na')),
  notes TEXT,
  UNIQUE(certificate_id, item_key)
);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inspections_updated_at BEFORE UPDATE ON inspections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE visual_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE instruments ENABLE ROW LEVEL SECURITY;
ALTER TABLE panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE circuit_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE fault_loop ENABLE ROW LEVEL SECURITY;
ALTER TABLE defects ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE generator_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generator_doc_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE generator_visual_checks ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only access their own profile
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (auth.uid() = id);

-- Inspections: inspector can CRUD their own
CREATE POLICY "inspections_own" ON inspections FOR ALL
  USING (auth.uid() = inspector_id)
  WITH CHECK (auth.uid() = inspector_id);

-- Related tables: access via parent inspection
CREATE POLICY "visual_checks_own" ON visual_checks FOR ALL
  USING (EXISTS (SELECT 1 FROM inspections WHERE id = inspection_id AND inspector_id = auth.uid()));

CREATE POLICY "instruments_own" ON instruments FOR ALL
  USING (EXISTS (SELECT 1 FROM inspections WHERE id = inspection_id AND inspector_id = auth.uid()));

CREATE POLICY "panels_own" ON panels FOR ALL
  USING (EXISTS (SELECT 1 FROM inspections WHERE id = inspection_id AND inspector_id = auth.uid()));

CREATE POLICY "circuit_measurements_own" ON circuit_measurements FOR ALL
  USING (EXISTS (SELECT 1 FROM panels p JOIN inspections i ON i.id = p.inspection_id WHERE p.id = panel_id AND i.inspector_id = auth.uid()));

CREATE POLICY "fault_loop_own" ON fault_loop FOR ALL
  USING (EXISTS (SELECT 1 FROM inspections WHERE id = inspection_id AND inspector_id = auth.uid()));

CREATE POLICY "defects_own" ON defects FOR ALL
  USING (EXISTS (SELECT 1 FROM inspections WHERE id = inspection_id AND inspector_id = auth.uid()));

CREATE POLICY "recommendations_own" ON recommendations FOR ALL
  USING (EXISTS (SELECT 1 FROM inspections WHERE id = inspection_id AND inspector_id = auth.uid()));

CREATE POLICY "generator_certificates_own" ON generator_certificates FOR ALL
  USING (EXISTS (SELECT 1 FROM inspections WHERE id = inspection_id AND inspector_id = auth.uid()));

CREATE POLICY "generator_doc_reviews_own" ON generator_doc_reviews FOR ALL
  USING (EXISTS (SELECT 1 FROM generator_certificates gc JOIN inspections i ON i.id = gc.inspection_id WHERE gc.id = certificate_id AND i.inspector_id = auth.uid()));

CREATE POLICY "generator_visual_checks_own" ON generator_visual_checks FOR ALL
  USING (EXISTS (SELECT 1 FROM generator_certificates gc JOIN inspections i ON i.id = gc.inspection_id WHERE gc.id = certificate_id AND i.inspector_id = auth.uid()));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
