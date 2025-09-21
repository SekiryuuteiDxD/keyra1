'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Employee, PaymentReceipt } from '@/lib/supabase'

// ==================== Generic realtime hook ====================
export function useRealtimeUpdates(
  table: string,
  events: ('INSERT' | 'UPDATE' | 'DELETE')[] = ['INSERT', 'UPDATE', 'DELETE']
) {
  const [updates, setUpdates] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const lastUpdateRef = useRef<string>('')

  useEffect(() => {
    let mounted = true

    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          if (!mounted) return

          const updateKey = `${payload.eventType}_${payload.commit_timestamp}_${JSON.stringify(
            payload.new || payload.old
          )}`
          if (lastUpdateRef.current === updateKey) return
          lastUpdateRef.current = updateKey

          if (events.includes(payload.eventType as any)) {
            setUpdates((prev) => [payload, ...prev].slice(0, 100))
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setIsConnected(true)
      })

    return () => {
      mounted = false
      supabase.removeChannel(channel)
      setIsConnected(false)
    }
  }, [table, events])

  const clearUpdates = useCallback(() => {
    setUpdates([])
    lastUpdateRef.current = ''
  }, [])

  return { updates, isConnected, clearUpdates }
}

// ==================== Employees ====================
export function useEmployeeUpdates() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const { updates } = useRealtimeUpdates('employees')

  // Initial fetch
  useEffect(() => {
    let mounted = true
    const fetchEmployees = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && mounted) setEmployees(data || [])
      setLoading(false)
    }
    fetchEmployees()
    return () => {
      mounted = false
    }
  }, [])

  // Apply realtime changes
  useEffect(() => {
    updates.forEach((u) => {
      switch (u.eventType) {
        case 'INSERT':
          setEmployees((prev) => {
            const exists = prev.some((e) => e.id === u.new.id)
            return exists ? prev : [u.new as Employee, ...prev]
          })
          break
        case 'UPDATE':
          setEmployees((prev) =>
            prev.map((e) => (e.id === u.new.id ? (u.new as Employee) : e))
          )
          break
        case 'DELETE':
          setEmployees((prev) => prev.filter((e) => e.id !== u.old.id))
          break
      }
    })
  }, [updates])

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false })
    setEmployees(data || [])
    setLoading(false)
  }, [])

  return { employees, loading, refresh }
}

// ==================== Payment Receipts ====================
export function usePaymentReceiptUpdates() {
  const [paymentReceipts, setPaymentReceipts] = useState<PaymentReceipt[]>([])
  const [loading, setLoading] = useState(true)
  const { updates } = useRealtimeUpdates('payment_receipts')

  // Initial fetch
  useEffect(() => {
    let mounted = true
    const fetchReceipts = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('payment_receipts')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && mounted) setPaymentReceipts(data || [])
      setLoading(false)
    }
    fetchReceipts()
    return () => {
      mounted = false
    }
  }, [])

  // Apply realtime changes
  useEffect(() => {
    updates.forEach((u) => {
      switch (u.eventType) {
        case 'INSERT':
          setPaymentReceipts((prev) => {
            const exists = prev.some((r) => r.id === u.new.id)
            return exists ? prev : [u.new as PaymentReceipt, ...prev]
          })
          break
        case 'UPDATE':
          setPaymentReceipts((prev) =>
            prev.map((r) => (r.id === u.new.id ? (u.new as PaymentReceipt) : r))
          )
          break
        case 'DELETE':
          setPaymentReceipts((prev) => prev.filter((r) => r.id !== u.old.id))
          break
      }
    })
  }, [updates])

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('payment_receipts')
      .select('*')
      .order('created_at', { ascending: false })
    setPaymentReceipts(data || [])
    setLoading(false)
  }, [])

  return { paymentReceipts, loading, refresh }
}
