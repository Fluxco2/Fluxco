import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create client if env vars are available (avoids build-time errors)
const _supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Export a getter that ensures non-null at runtime
export const supabase: SupabaseClient = _supabase as SupabaseClient;

// Types for our database tables
export interface EmployeeUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'engineer' | 'sales' | 'operations';
  created_at: string;
  last_login: string | null;
}

export interface Supplier {
  id: string;
  email: string;
  company_name: string;
  contact_name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  certifications: string[];
  specialties: string[];
  is_verified: boolean;
  created_at: string;
  last_login: string | null;
}

export interface QuoteRequest {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  product_interest: string | null;
  project_details: string | null;
  status: 'new' | 'contacted' | 'quoted' | 'won' | 'lost';
  assigned_to: string | null;
  estimated_value: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  project_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_company: string | null;
  rated_power_kva: number;
  primary_voltage: number;
  secondary_voltage: number;
  frequency: number;
  phases: number;
  vector_group: string | null;
  cooling_class: string | null;
  impedance_percent: number | null;
  design_specs: Record<string, unknown> | null;
  status: 'design' | 'review' | 'approved' | 'manufacturing' | 'testing' | 'shipped' | 'completed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  lead_engineer: string | null;
  sales_rep: string | null;
  quoted_price: number | null;
  final_price: number | null;
  quote_date: string | null;
  order_date: string | null;
  target_delivery: string | null;
  actual_delivery: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceListing {
  id: string;
  serial_number: string | null;
  rated_power_kva: number;
  primary_voltage: number;
  secondary_voltage: number;
  frequency: number;
  phases: number;
  impedance_percent: number | null;
  vector_group: string | null;
  cooling_class: string | null;
  conductor_type: string | null;
  steel_grade: string | null;
  estimated_cost: number | null;
  no_load_loss_w: number | null;
  load_loss_w: number | null;
  efficiency_percent: number | null;
  total_weight_kg: number | null;
  design_specs: Record<string, unknown> | null;
  spec_mode: 'lite' | 'pro' | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  zipcode: string | null;
  asking_price: number | null;
  notes: string | null;
  status: 'pending_review' | 'approved' | 'listed' | 'sold' | 'rejected' | 'expired' | 'completed';
  reviewed_by: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupplierBid {
  id: string;
  listing_id: string;
  supplier_id: string;
  bid_price: number;
  lead_time_weeks: number;
  notes: string | null;
  proposal_url: string | null;
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';
  interest_expressed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  project_id: string | null;
  customer_name: string;
  customer_company: string | null;
  shipping_address: string | null;
  quantity: number;
  unit_price: number | null;
  total_price: number | null;
  status: 'pending' | 'in_production' | 'quality_check' | 'ready_to_ship' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number: string | null;
  carrier: string | null;
  order_date: string;
  estimated_ship_date: string | null;
  actual_ship_date: string | null;
  delivery_date: string | null;
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RFQ {
  id: string;
  rfq_number: string;
  project_id: string | null;
  rated_power_kva: number;
  primary_voltage: number;
  secondary_voltage: number;
  frequency: number;
  phases: number;
  vector_group: string | null;
  cooling_class: string | null;
  quantity: number;
  special_requirements: string | null;
  bid_deadline: string;
  delivery_deadline: string | null;
  status: 'draft' | 'open' | 'closed' | 'awarded' | 'cancelled';
  winning_bid_id: string | null;
  winning_supplier_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Bid {
  id: string;
  rfq_id: string;
  supplier_id: string;
  unit_price: number;
  total_price: number;
  lead_time_weeks: number;
  notes: string | null;
  technical_specs: Record<string, unknown> | null;
  status: 'pending' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface Contract {
  id: string;
  contract_number: string;
  rfq_id: string | null;
  bid_id: string | null;
  supplier_id: string;
  project_id: string | null;
  quantity: number;
  unit_price: number;
  total_value: number;
  status: 'active' | 'in_production' | 'shipped' | 'completed' | 'cancelled';
  contract_date: string;
  delivery_date: string | null;
  actual_delivery_date: string | null;
  terms: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id: string;
  job_id: string;
  job_title: string;
  name: string;
  email: string;
  phone: string | null;
  about: string | null;
  resume_url: string | null;
  status: 'new' | 'reviewed' | 'interviewing' | 'offered' | 'hired' | 'rejected';
  reviewed_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  user_id: string;
  email: string;
  company_name: string;
  contact_name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  notion_customer_id: string | null;
  created_at: string;
  last_login: string | null;
}

export interface CustomerProject {
  id: string;
  project_number: string;
  customer_id: string;
  name: string;
  spec_mode: 'lite' | 'pro';
  rated_power_kva: number | null;
  primary_voltage: number | null;
  secondary_voltage: number | null;
  frequency: number;
  phases: number;
  design_requirements: Record<string, unknown> | null;
  pro_spec: Record<string, unknown> | null;
  design_result: Record<string, unknown> | null;
  estimated_cost: number | null;
  status: 'draft' | 'submitted' | 'quoted' | 'ordered' | 'completed';
  version: number;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  sku: string | null;
  type: 'new' | 'refurbished';
  category: string;
  manufacturer: string | null;
  model: string | null;
  capacity: string;
  voltage: string | null;
  frequency: number;
  phases: number;
  cooling_class: string | null;
  feoc_compliant: boolean;
  certifications: string[];
  location: string | null;
  quantity: number;
  available: boolean;
  price: string | null;
  condition: string | null;
  year_manufactured: number | null;
  notes: string | null;
  images: string[];
  created_at: string;
  updated_at: string;
}
