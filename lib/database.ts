import { supabase } from './supabase'
import type { Employee, Advertisement, PaymentReceipt } from './supabase'

// ================= Database Connection =================
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('employees').select('count').limit(1)
    return !error
  } catch (error) {
    console.error('Database connection check failed:', error)
    return false
  }
}

// ================= Employees =================
export const getAllEmployees = async () => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error: any) {
    console.error('Error fetching employees:', error)
    return { data: [], error: error.message }
  }
}

export const createEmployee = async (
  employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>
) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .insert([employee])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    console.error('Error creating employee:', error)
    return { data: null, error: error.message }
  }
}

export const updateEmployee = async (id: string, updates: Partial<Employee>) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    console.error('Error updating employee:', error)
    return { data: null, error: error.message }
  }
}

export const deleteEmployee = async (id: string) => {
  try {
    const { error } = await supabase.from('employees').delete().eq('id', id)
    if (error) throw error
    return { error: null }
  } catch (error: any) {
    console.error('Error deleting employee:', error)
    return { error: error.message }
  }
}

export const searchEmployees = async (query: string) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .or(
        `name.ilike.%${query}%,employee_code.ilike.%${query}%,phone.ilike.%${query}%`
      )
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error: any) {
    console.error('Error searching employees:', error)
    return { data: [], error: error.message }
  }
}

export const bulkDeleteEmployees = async (ids: string[]) => {
  try {
    const { error } = await supabase.from('employees').delete().in('id', ids)
    if (error) throw error
    return { error: null }
  } catch (error: any) {
    console.error('Error bulk deleting employees:', error)
    return { error: error.message }
  }
}

// ================= Advertisements =================
export const getAllAdvertisements = async () => {
  try {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error: any) {
    console.error('Error fetching advertisements:', error)
    return { data: [], error: error.message }
  }
}

export const createAdvertisement = async (
  ad: Omit<Advertisement, 'id' | 'created_at' | 'updated_at'>
) => {
  try {
    const { data, error } = await supabase
      .from('advertisements')
      .insert([ad])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    console.error('Error creating advertisement:', error)
    return { data: null, error: error.message }
  }
}

export const updateAdvertisement = async (
  id: string,
  updates: Partial<Advertisement>
) => {
  try {
    const { data, error } = await supabase
      .from('advertisements')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    console.error('Error updating advertisement:', error)
    return { data: null, error: error.message }
  }
}

export const deleteAdvertisement = async (id: string) => {
  try {
    const { error } = await supabase.from('advertisements').delete().eq('id', id)
    if (error) throw error
    return { error: null }
  } catch (error: any) {
    console.error('Error deleting advertisement:', error)
    return { error: error.message }
  }
}

// ================= Payment Receipts =================
export const getAllPaymentReceipts = async () => {
  try {
    const { data, error } = await supabase
      .from('payment_receipts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error: any) {
    console.error('Error fetching payment receipts:', error)
    return { data: [], error: error.message }
  }
}

export const updatePaymentReceiptStatus = async (
  id: string,
  status: 'approved' | 'rejected',
  notes?: string
) => {
  try {
    const { data, error } = await supabase
      .from('payment_receipts')
      .update({
        status,
        admin_notes: notes || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    console.error('Error updating payment receipt:', error)
    return { data: null, error: error.message }
  }
}

// ================= Analytics =================
export const getAnalytics = async () => {
  try {
    const [usersCount, employeesCount, adsCount, subscriptionsCount, qrCodesCount, receiptsCount] =
      await Promise.all([
        supabase.from('users').select('id', { count: 'exact' }),
        supabase.from('employees').select('id', { count: 'exact' }),
        supabase.from('advertisements').select('id', { count: 'exact' }),
        supabase.from('subscriptions').select('id', { count: 'exact' }),
        supabase.from('user_qr_codes').select('id', { count: 'exact' }),
        supabase.from('payment_receipts').select('id', { count: 'exact' }),
      ])

    return {
      data: {
        totalUsers: usersCount.count || 0,
        totalEmployees: employeesCount.count || 0,
        totalAds: adsCount.count || 0,
        totalSubscriptions: subscriptionsCount.count || 0,
        totalQRCodes: qrCodesCount.count || 0,
        totalReceipts: receiptsCount.count || 0,
      },
      error: null,
    }
  } catch (error: any) {
    console.error('Error fetching analytics:', error)
    return {
      data: {
        totalUsers: 0,
        totalEmployees: 0,
        totalAds: 0,
        totalSubscriptions: 0,
        totalQRCodes: 0,
        totalReceipts: 0,
      },
      error: error.message,
    }
  }
}

// ================= Recent Activity =================
export const getRecentActivity = async () => {
  try {
    const [recentUsers, recentEmployees, recentQRCodes, recentReceipts] =
      await Promise.all([
        supabase.from('users').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('employees').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('qr_codes').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('payment_receipts').select('*').order('created_at', { ascending: false }).limit(5),
      ])

    return {
      data: {
        recentUsers: recentUsers.data || [],
        recentEmployees: recentEmployees.data || [],
        recentQRCodes: recentQRCodes.data || [],
        recentReceipts: recentReceipts.data || [],
      },
      error: null,
    }
  } catch (error: any) {
    console.error('Error fetching recent activity:', error)
    return {
      data: {
        recentUsers: [],
        recentEmployees: [],
        recentQRCodes: [],
        recentReceipts: [],
      },
      error: error.message,
    }
  }
}
