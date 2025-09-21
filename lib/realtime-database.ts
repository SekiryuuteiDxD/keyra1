'use client'

import { supabase } from './supabase'

export interface RealtimePayload {
  event: string
  data: any
  timestamp: string
}

type SubscriptionCallback = (payload: RealtimePayload) => void

class RealtimeDatabase {
  private subscribers: Set<SubscriptionCallback> = new Set()
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private channels: Map<string, any> = new Map()

  constructor() {
    this.connect()
  }

  private connect() {
    // Simulate connection
    this.isConnected = true
    this.reconnectAttempts = 0
    console.log('Real-time database connected (mock)')
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    setTimeout(() => {
      this.connect()
    }, this.reconnectDelay * this.reconnectAttempts)
  }

  subscribe(callback: SubscriptionCallback): () => void {
    this.subscribers.add(callback)
    
    return () => {
      this.subscribers.delete(callback)
    }
  }

  broadcast(payload: RealtimePayload) {
    if (!this.isConnected) {
      console.warn('Cannot broadcast: not connected')
      return
    }

    // Add timestamp if not provided
    if (!payload.timestamp) {
      payload.timestamp = new Date().toISOString()
    }

    // Notify all subscribers
    this.subscribers.forEach(callback => {
      try {
        callback(payload)
      } catch (error) {
        console.error('Error in subscriber callback:', error)
      }
    })
  }

  // Employee events
  notifyEmployeeCreated(employee: any) {
    this.broadcast({
      event: 'employee_created',
      data: employee,
      timestamp: new Date().toISOString()
    })
  }

  notifyEmployeeUpdated(employeeId: string, updates: any) {
    this.broadcast({
      event: 'employee_updated',
      data: { id: employeeId, updates },
      timestamp: new Date().toISOString()
    })
  }

  notifyEmployeeDeleted(employeeId: string, employee?: any) {
    this.broadcast({
      event: 'employee_deleted',
      data: { employeeId, employee },
      timestamp: new Date().toISOString()
    })
  }

  // Payment events
  notifyPaymentSubmitted(paymentData: any) {
    this.broadcast({
      event: 'payment_submitted',
      data: paymentData,
      timestamp: new Date().toISOString()
    })
  }

  notifyPaymentApproved(receiptId: string, adminNotes?: string) {
    this.broadcast({
      event: 'payment_approved',
      data: { receiptId, adminNotes },
      timestamp: new Date().toISOString()
    })
  }

  notifyPaymentRejected(receiptId: string, adminNotes: string) {
    this.broadcast({
      event: 'payment_rejected',
      data: { receiptId, adminNotes },
      timestamp: new Date().toISOString()
    })
  }

  // System events
  notifySystemEvent(message: string, type: 'info' | 'warning' | 'error' = 'info') {
    this.broadcast({
      event: 'system_notification',
      data: { message, type },
      timestamp: new Date().toISOString()
    })
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      subscriberCount: this.subscribers.size
    }
  }

  disconnect() {
    this.isConnected = false
    this.subscribers.clear()
    console.log('Real-time database disconnected')
  }

  subscribeToChannel(tableName: string) {
    if (this.channels.has(tableName)) {
      return this.channels.get(tableName)
    }

    try {
      const channel = supabase
        .channel(`public:${tableName}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: tableName },
          (payload) => {
            console.log(`[RealtimeDatabase] Database change in ${tableName}:`, payload)
            
            // Convert database events to our event system
            switch (payload.eventType) {
              case 'INSERT':
                if (tableName === 'payment_receipts') {
                  this.notifyPaymentSubmitted(payload.new)
                } else if (tableName === 'employees') {
                  this.notifyEmployeeCreated(payload.new)
                }
                break
              case 'UPDATE':
                if (tableName === 'payment_receipts') {
                  if (payload.new.status === 'approved') {
                    this.notifyPaymentApproved(payload.new.id, payload.new.admin_notes)
                  } else if (payload.new.status === 'rejected') {
                    this.notifyPaymentRejected(payload.new.id, payload.new.admin_notes)
                  }
                } else if (tableName === 'employees') {
                  this.notifyEmployeeUpdated(payload.new.id, payload.new)
                }
                break
              case 'DELETE':
                if (tableName === 'employees') {
                  this.notifyEmployeeDeleted(payload.old.id, payload.old)
                }
                break
            }
          }
        )
        .subscribe()

      this.channels.set(tableName, channel)
      console.log(`[RealtimeDatabase] Subscribed to channel: ${tableName}`)
      
      return channel
    } catch (error) {
      console.error(`[RealtimeDatabase] Failed to subscribe to channel ${tableName}:`, error)
      return null
    }
  }
}

// Export singleton instance
export const realtimeDatabase = new RealtimeDatabase()
