import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Employee {
  id: string
  name: string
  phone: string
  address: string
  employee_code: string
  permission: string
  qr_code_url: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface Advertisement {
  id: string
  title: string
  description: string
  category: string
  image_url: string
  link_url: string
  button_text: string
  views_count: number
  clicks_count: number
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface PaymentReceipt {
  id: string
  user_id: string
  plan_type: string
  amount: number
  receipt_image_url: string
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  name: string
  phone: string
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

export interface QRCode {
  id: string
  user_id: string
  employee_id: string
  qr_data: string
  qr_type: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_type: string
  status: 'active' | 'inactive' | 'expired'
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
}
