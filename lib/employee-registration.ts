'use client'

import { supabase } from '@/lib/supabase'
import QRCode from 'qrcode'

export interface Employee {
  id: string
  name: string
  phone: string
  email: string
  address: string
  employee_code: string
  permission: 'read' | 'write' | 'admin'
  qr_code_url?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface EmployeeRegistrationData {
  name: string
  phone: string
  email: string
  address: string
  employeeCode: string
  permission: 'read' | 'write' | 'admin'
  createdBy: string
}

export interface EmployeeResult {
  success: boolean
  employee?: Employee
  error?: string
}

export interface EmployeeListResult {
  success: boolean
  employees?: Employee[]
  error?: string
}

class EmployeeRegistration {
  constructor() {
    console.log('[EmployeeRegistration] Initialized with Supabase backend')
  }

  async registerEmployee(data: EmployeeRegistrationData): Promise<EmployeeResult> {
    try {
      if (!data.name || !data.phone || !data.employeeCode) {
        return { success: false, error: 'Name, phone, and employee code are required' }
      }

      // Check duplicate employee_code
      const { data: existing, error: checkError } = await supabase
        .from('employees')
        .select('id')
        .eq('employee_code', data.employeeCode)
        .maybeSingle()

      if (checkError) throw checkError
      if (existing) {
        return { success: false, error: 'Employee code already exists' }
      }

      const now = new Date().toISOString()
      const insertData = {
        name: data.name,
        phone: data.phone,
        // email: data.email,
        address: data.address,
        employee_code: data.employeeCode,
        permission: data.permission,
        created_by: data.createdBy,
        created_at: now,
        updated_at: now
      }

      const { data: inserted, error } = await supabase
        .from('employees')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error

      return { success: true, employee: inserted }
    } catch (err: any) {
      console.error('[EmployeeRegistration] Error registering employee:', err)
      return { success: false, error: err.message || 'Failed to register employee' }
    }
  }

  async updateEmployee(employeeId: string, updates: Partial<EmployeeRegistrationData>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('employees')
        .update({
          name: updates.name,
          phone: updates.phone,
          email: updates.email,
          address: updates.address,
          employee_code: updates.employeeCode,
          permission: updates.permission,
          updated_at: new Date().toISOString()
        })
        .eq('id', employeeId)

      if (error) throw error
      return true
    } catch (err: any) {
      console.error('[EmployeeRegistration] Error updating employee:', err)
      return false
    }
  }

  async deleteEmployee(employeeId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('employees').delete().eq('id', employeeId)
      if (error) throw error
      return true
    } catch (err: any) {
      console.error('[EmployeeRegistration] Error deleting employee:', err)
      return false
    }
  }

  async getAllEmployees(): Promise<EmployeeListResult> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, employees: data || [] }
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to fetch employees' }
    }
  }

  async getEmployeeById(employeeId: string): Promise<EmployeeResult> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .single()

      if (error) throw error
      return { success: true, employee: data }
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to fetch employee' }
    }
  }

  async searchEmployees(query: string): Promise<EmployeeListResult> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .or(`name.ilike.%${query}%,employee_code.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)

      if (error) throw error
      return { success: true, employees: data || [] }
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to search employees' }
    }
  }

  async generateEmployeeQR(employeeId: string): Promise<string> {
    const { data: employee, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .single()

    if (error || !employee) throw new Error('Employee not found')

    const qrData = `EMPLOYEE:${employee.employee_code}|${employee.phone}|${employee.email}`
    const qrImage = await QRCode.toDataURL(qrData, { width: 300 })

    // upload QR to Supabase Storage
    const fileName = `qr_codes/${employee.employee_code}.png`
    const base64Data = qrImage.split(',')[1]
    const fileBuffer = Buffer.from(base64Data, 'base64')

    const { error: uploadError } = await supabase.storage
      .from('employee_qr_codes')
      .upload(fileName, fileBuffer, {
        contentType: 'image/png',
        upsert: true
      })

    if (uploadError) throw uploadError

    const { data: publicUrl } = supabase.storage
      .from('employee_qr_codes')
      .getPublicUrl(fileName)

    // update employee with QR URL
    await supabase.from('employees').update({
      qr_code_url: publicUrl.publicUrl,
      updated_at: new Date().toISOString()
    }).eq('id', employeeId)

    return publicUrl.publicUrl
  }
  async getRegistrationStats() {
  const { data: employees, error } = await supabase
    .from("employees")
    .select("permission")

  if (error) throw error

  return {
    totalEmployees: employees.length,
    // pendingRegistrations: employees.filter(emp => emp.status === "pending").length,
    adminCount: employees.filter(emp => emp.permission === "admin").length,
    writeCount: employees.filter(emp => emp.permission === "write").length,
    readCount: employees.filter(emp => emp.permission === "read").length
  }
}

}

export const employeeRegistration = new EmployeeRegistration()

  
