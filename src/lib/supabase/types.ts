export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  PostgrestVersion: "12"
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          license_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          license_number?: string | null
        }
        Update: {
          full_name?: string | null
          phone?: string | null
          license_number?: string | null
        }
        Relationships: []
      }
      inspections: {
        Row: {
          id: string
          inspector_id: string | null
          client_name: string | null
          installation_type: 'residential' | 'commercial' | 'industrial' | 'other' | null
          address: string | null
          connection_size_amps: number | null
          owner_name: string | null
          owner_phone: string | null
          owner_email: string | null
          electrician_name: string | null
          electrician_phone: string | null
          electrician_email: string | null
          designer_name: string | null
          designer_phone: string | null
          designer_email: string | null
          has_generator: boolean
          inspection_date: string | null
          status: 'draft' | 'in_progress' | 'completed' | 'submitted'
          approval_status: 'approved' | 'approved_with_recommendations' | 'rejected' | null
          inspector_signature: string | null
          completion_percentage: number
          pdf_url: string | null
          created_at: string
          updated_at: string
          submitted_at: string | null
        }
        Insert: {
          id?: string
          inspector_id?: string | null
          client_name?: string | null
          installation_type?: 'residential' | 'commercial' | 'industrial' | 'other' | null
          address?: string | null
          connection_size_amps?: number | null
          owner_name?: string | null
          owner_phone?: string | null
          owner_email?: string | null
          electrician_name?: string | null
          electrician_phone?: string | null
          electrician_email?: string | null
          designer_name?: string | null
          designer_phone?: string | null
          designer_email?: string | null
          has_generator?: boolean
          inspection_date?: string | null
          status?: 'draft' | 'in_progress' | 'completed' | 'submitted'
        }
        Update: {
          client_name?: string | null
          installation_type?: 'residential' | 'commercial' | 'industrial' | 'other' | null
          address?: string | null
          connection_size_amps?: number | null
          owner_name?: string | null
          owner_phone?: string | null
          owner_email?: string | null
          electrician_name?: string | null
          electrician_phone?: string | null
          electrician_email?: string | null
          designer_name?: string | null
          designer_phone?: string | null
          designer_email?: string | null
          has_generator?: boolean
          inspection_date?: string | null
          status?: 'draft' | 'in_progress' | 'completed' | 'submitted'
          approval_status?: 'approved' | 'approved_with_recommendations' | 'rejected' | null
          inspector_signature?: string | null
          completion_percentage?: number
          pdf_url?: string | null
          submitted_at?: string | null
        }
        Relationships: []
      }
      visual_checks: {
        Row: {
          id: string
          inspection_id: string
          category: string
          item_key: string
          item_label: string
          result: 'pass' | 'fail' | 'na' | null
          notes: string | null
          photo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          inspection_id: string
          category: string
          item_key: string
          item_label: string
          result?: 'pass' | 'fail' | 'na' | null
          notes?: string | null
          photo_url?: string | null
        }
        Update: {
          result?: 'pass' | 'fail' | 'na' | null
          notes?: string | null
          photo_url?: string | null
        }
        Relationships: []
      }
      instruments: {
        Row: {
          id: string
          inspection_id: string
          sort_order: number
          name: string | null
          model: string | null
          serial_number: string | null
          calibration_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          inspection_id: string
          sort_order?: number
          name?: string | null
          model?: string | null
          serial_number?: string | null
          calibration_date?: string | null
        }
        Update: {
          name?: string | null
          model?: string | null
          serial_number?: string | null
          calibration_date?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      panels: {
        Row: {
          id: string
          inspection_id: string
          sort_order: number
          panel_name: string
          created_at: string
        }
        Insert: {
          id?: string
          inspection_id: string
          sort_order?: number
          panel_name: string
        }
        Update: {
          panel_name?: string
          sort_order?: number
        }
        Relationships: []
      }
      circuit_measurements: {
        Row: {
          id: string
          panel_id: string
          circuit_number: number
          ins_1l_e: number | null
          ins_2l_e: number | null
          ins_3l_e: number | null
          ins_n_e: number | null
          ins_1l_n: number | null
          ins_2l_n: number | null
          ins_3l_n: number | null
          ins_1l_2l: number | null
          ins_3l_2l: number | null
          ins_3l_1l: number | null
          grounding_continuity: number | null
          fault_loop_impedance: number | null
          overcurrent_protection: 'pass' | 'fail' | 'na' | null
          phase_sequence: 'pass' | 'fail' | 'na' | null
          voltage_1l_e: number | null
          voltage_2l_e: number | null
          voltage_3l_e: number | null
          voltage_1l_n: number | null
          created_at: string
        }
        Insert: {
          id?: string
          panel_id: string
          circuit_number: number
          ins_1l_e?: number | null
          ins_2l_e?: number | null
          ins_3l_e?: number | null
          ins_n_e?: number | null
          ins_1l_n?: number | null
          ins_2l_n?: number | null
          ins_3l_n?: number | null
          ins_1l_2l?: number | null
          ins_3l_2l?: number | null
          ins_3l_1l?: number | null
          grounding_continuity?: number | null
          fault_loop_impedance?: number | null
          overcurrent_protection?: 'pass' | 'fail' | 'na' | null
          phase_sequence?: 'pass' | 'fail' | 'na' | null
          voltage_1l_e?: number | null
          voltage_2l_e?: number | null
          voltage_3l_e?: number | null
          voltage_1l_n?: number | null
        }
        Update: {
          ins_1l_e?: number | null
          ins_2l_e?: number | null
          ins_3l_e?: number | null
          ins_n_e?: number | null
          ins_1l_n?: number | null
          ins_2l_n?: number | null
          ins_3l_n?: number | null
          ins_1l_2l?: number | null
          ins_3l_2l?: number | null
          ins_3l_1l?: number | null
          grounding_continuity?: number | null
          fault_loop_impedance?: number | null
          overcurrent_protection?: 'pass' | 'fail' | 'na' | null
          phase_sequence?: 'pass' | 'fail' | 'na' | null
          voltage_1l_e?: number | null
          voltage_2l_e?: number | null
          voltage_3l_e?: number | null
          voltage_1l_n?: number | null
        }
        Relationships: []
      }
      fault_loop: {
        Row: {
          id: string
          inspection_id: string
          zph1_n: number | null
          zph1_e: number | null
          zph2_n: number | null
          zph2_e: number | null
          zph3_n: number | null
          zph3_e: number | null
          z_1ph_2ph: number | null
          isc2ph_1: number | null
          isc2ph_2: number | null
          isc2ph_3: number | null
          isc3ph_1: number | null
          isc3ph_2: number | null
          isc3ph_3: number | null
          created_at: string
        }
        Insert: {
          id?: string
          inspection_id: string
          zph1_n?: number | null
          zph1_e?: number | null
          zph2_n?: number | null
          zph2_e?: number | null
          zph3_n?: number | null
          zph3_e?: number | null
          z_1ph_2ph?: number | null
          isc2ph_1?: number | null
          isc2ph_2?: number | null
          isc2ph_3?: number | null
          isc3ph_1?: number | null
          isc3ph_2?: number | null
          isc3ph_3?: number | null
        }
        Update: {
          zph1_n?: number | null
          zph1_e?: number | null
          zph2_n?: number | null
          zph2_e?: number | null
          zph3_n?: number | null
          zph3_e?: number | null
          z_1ph_2ph?: number | null
          isc2ph_1?: number | null
          isc2ph_2?: number | null
          isc2ph_3?: number | null
          isc3ph_1?: number | null
          isc3ph_2?: number | null
          isc3ph_3?: number | null
        }
        Relationships: []
      }
      defects: {
        Row: {
          id: string
          inspection_id: string
          visual_check_id: string | null
          sort_order: number
          description: string
          severity: 'critical' | 'major' | 'minor' | null
          photo_url: string | null
          target_repair_date: string | null
          resolved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          inspection_id: string
          visual_check_id?: string | null
          sort_order?: number
          description: string
          severity?: 'critical' | 'major' | 'minor' | null
          photo_url?: string | null
          target_repair_date?: string | null
          resolved?: boolean
        }
        Update: {
          description?: string
          severity?: 'critical' | 'major' | 'minor' | null
          photo_url?: string | null
          target_repair_date?: string | null
          resolved?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          id: string
          inspection_id: string
          sort_order: number
          text: string
          electrician_response: string | null
          designer_response: string | null
          created_at: string
        }
        Insert: {
          id?: string
          inspection_id: string
          sort_order?: number
          text: string
          electrician_response?: string | null
          designer_response?: string | null
        }
        Update: {
          text?: string
          electrician_response?: string | null
          designer_response?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      generator_certificates: {
        Row: {
          id: string
          inspection_id: string
          manufacturer: string | null
          model: string | null
          serial_number: string | null
          power_rating: string | null
          installation_location: string | null
          panel_location: string | null
          supplier: string | null
          permit_number: string | null
          created_at: string
        }
        Insert: {
          id?: string
          inspection_id: string
          manufacturer?: string | null
          model?: string | null
          serial_number?: string | null
          power_rating?: string | null
          installation_location?: string | null
          panel_location?: string | null
          supplier?: string | null
          permit_number?: string | null
        }
        Update: {
          manufacturer?: string | null
          model?: string | null
          serial_number?: string | null
          power_rating?: string | null
          installation_location?: string | null
          panel_location?: string | null
          supplier?: string | null
          permit_number?: string | null
        }
        Relationships: []
      }
      generator_doc_reviews: {
        Row: {
          id: string
          certificate_id: string
          item_key: string
          item_label: string
          result: 'pass' | 'fail' | 'na' | null
          notes: string | null
        }
        Insert: {
          id?: string
          certificate_id: string
          item_key: string
          item_label: string
          result?: 'pass' | 'fail' | 'na' | null
          notes?: string | null
        }
        Update: {
          result?: 'pass' | 'fail' | 'na' | null
          notes?: string | null
        }
        Relationships: []
      }
      generator_visual_checks: {
        Row: {
          id: string
          certificate_id: string
          item_key: string
          item_label: string
          result: 'pass' | 'fail' | 'na' | null
          notes: string | null
        }
        Insert: {
          id?: string
          certificate_id: string
          item_key: string
          item_label: string
          result?: 'pass' | 'fail' | 'na' | null
          notes?: string | null
        }
        Update: {
          result?: 'pass' | 'fail' | 'na' | null
          notes?: string | null
        }
        Relationships: []
      }
      lookup_values: {
        Row: {
          id: string
          category: string
          key: string
          label_he: string
          label_en: string | null
          sort_order: number
        }
        Insert: {
          id?: string
          category: string
          key: string
          label_he: string
          label_en?: string | null
          sort_order?: number
        }
        Update: {
          label_he?: string
          label_en?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      check_item_templates: {
        Row: {
          id: string
          section: string
          category_id: string | null
          category_he: string | null
          category_en: string | null
          item_key: string
          item_label_he: string
          item_label_en: string | null
          sort_order: number
        }
        Insert: {
          id?: string
          section: string
          category_id?: string | null
          category_he?: string | null
          category_en?: string | null
          item_key: string
          item_label_he: string
          item_label_en?: string | null
          sort_order?: number
        }
        Update: {
          item_label_he?: string
          item_label_en?: string | null
          sort_order?: number
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Inspection = Database['public']['Tables']['inspections']['Row']
export type VisualCheck = Database['public']['Tables']['visual_checks']['Row']
export type Instrument = Database['public']['Tables']['instruments']['Row']
export type Panel = Database['public']['Tables']['panels']['Row']
export type CircuitMeasurement = Database['public']['Tables']['circuit_measurements']['Row']
export type FaultLoop = Database['public']['Tables']['fault_loop']['Row']
export type Defect = Database['public']['Tables']['defects']['Row']
export type Recommendation = Database['public']['Tables']['recommendations']['Row']
export type GeneratorCertificate = Database['public']['Tables']['generator_certificates']['Row']
export type GeneratorDocReview = Database['public']['Tables']['generator_doc_reviews']['Row']
export type GeneratorVisualCheck = Database['public']['Tables']['generator_visual_checks']['Row']
export type LookupValue = Database['public']['Tables']['lookup_values']['Row']
export type CheckItemTemplate = Database['public']['Tables']['check_item_templates']['Row']
