'use client'

import { supabase } from './supabase'
import { realtimeDatabase } from './realtime-database'

export interface PaymentReceipt {
  id: string
  user_id: string
  plan_type: string
  amount: number
  receipt_image_url: string
  status: 'pending' | 'approved' | 'rejected' | 'processing'
  admin_notes?: string | null
  created_at: string
  updated_at?: string
}

interface PaymentRequest {
  id: string
  userId: string
  planType: string
  amount: number
  receiptUrl: string
  timestamp: string
}

interface QueueStatus {
  queueLength: number
  currentProcessing: boolean
  processedCount: number
  failedCount: number
}

export interface PaymentSubmission {
  userId: string
  planType: string
  amount: number
  receiptUrl: string
  userEmail?: string
  userName?: string
}

export interface PaymentResult {
  success: boolean
  receiptId?: string
  error?: string
  receipt?: PaymentReceipt
}

class PaymentProcessor {
  private queue: PaymentRequest[] = []
  private processingQueue: Map<string, PaymentSubmission> = new Map()
  private processing = false
  private isProcessing = false
  private processedCount = 0
  private failedCount = 0
  private retryAttempts = new Map<string, number>()
  private maxRetries = 3
  private retryDelay = 1000

  constructor() {
    console.log('[PaymentProcessor] Initialized with real-time capabilities')
  }

  async submitPayment(paymentData: PaymentSubmission): Promise<PaymentResult> {
    try {
      const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const paymentRequest: PaymentRequest = {
        id: paymentId,
        userId: paymentData.userId,
        planType: paymentData.planType,
        amount: paymentData.amount,
        receiptUrl: paymentData.receiptUrl,
        timestamp: new Date().toISOString()
      }

      // Add to queue
      this.queue.push(paymentRequest)

      // Notify real-time system
      realtimeDatabase.notifyPaymentSubmitted({
        id: paymentId,
        userId: paymentData.userId,
        planType: paymentData.planType,
        amount: paymentData.amount,
        receiptUrl: paymentData.receiptUrl
      })

      // Start processing if not already running
      if (!this.processing) {
        this.processQueue()
      }

      // Generate unique receipt ID
      const receiptId = `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Create payment receipt
      const receipt: PaymentReceipt = {
        id: receiptId,
        user_id: paymentData.userId,
        plan_type: paymentData.planType,
        amount: paymentData.amount,
        receipt_image_url: paymentData.receiptUrl,
        status: 'pending',
        admin_notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Add to processing queue
      this.processingQueue.set(receiptId, paymentData)

      // Broadcast payment submitted event
      realtimeDatabase.notifyPaymentSubmitted({
        id: receiptId,
        userId: paymentData.userId,
        planType: paymentData.planType,
        amount: paymentData.amount,
        receiptUrl: paymentData.receiptUrl,
        receipt: receipt
      })

      console.log('[PaymentProcessor] Payment submitted successfully:', receiptId)

      return { success: true, paymentId, receiptId, receipt }
    } catch (error: any) {
      console.error('Error submitting payment:', error)
      return { success: false, error: error.message || 'Failed to submit payment' }
    }
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return

    this.processing = true

    while (this.queue.length > 0) {
      const payment = this.queue.shift()!
      
      try {
        await this.processPayment(payment)
        this.processedCount++
      } catch (error) {
        console.error('Error processing payment:', error)
        await this.handlePaymentError(payment, error)
      }

      // Small delay between processing
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    this.processing = false
  }

  private async processPayment(payment: PaymentRequest): Promise<void> {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Simulate random success/failure for demo
    const success = Math.random() > 0.1 // 90% success rate

    if (success) {
      realtimeDatabase.notifySystemEvent(
        `Payment ${payment.id} processed successfully`,
        'info'
      )
    } else {
      throw new Error('Payment processing failed')
    }
  }

  private async handlePaymentError(payment: PaymentRequest, error: any) {
    const attempts = this.retryAttempts.get(payment.id) || 0
    
    if (attempts < this.maxRetries) {
      // Retry
      this.retryAttempts.set(payment.id, attempts + 1)
      this.queue.unshift(payment) // Add back to front of queue
      
      realtimeDatabase.notifySystemEvent(
        `Retrying payment ${payment.id} (attempt ${attempts + 1}/${this.maxRetries})`,
        'warning'
      )
    } else {
      // Max retries reached
      this.failedCount++
      this.retryAttempts.delete(payment.id)
      
      realtimeDatabase.notifySystemEvent(
        `Payment ${payment.id} failed after ${this.maxRetries} attempts`,
        'error'
      )
    }
  }

  async approvePayment(receiptId: string, adminNotes?: string): Promise<boolean> {
    try {
      // Simulate approval process
      await new Promise(resolve => setTimeout(resolve, 500))

      realtimeDatabase.notifyPaymentApproved(receiptId, adminNotes)
      
      console.log('[PaymentProcessor] Payment approved successfully:', receiptId)
      return true

    } catch (error: any) {
      console.error('[PaymentProcessor] Error approving payment:', error)
      return false
    }
  }

  async rejectPayment(receiptId: string, adminNotes: string): Promise<boolean> {
    try {
      // Simulate rejection process
      await new Promise(resolve => setTimeout(resolve, 500))

      realtimeDatabase.notifyPaymentRejected(receiptId, adminNotes)
      
      console.log('[PaymentProcessor] Payment rejected successfully:', receiptId)
      return true

    } catch (error: any) {
      console.error('[PaymentProcessor] Error rejecting payment:', error)
      return false
    }
  }

  async updatePaymentStatus(receiptId: string, status: 'approved' | 'rejected', adminNotes?: string): Promise<PaymentResult> {
    try {
      if (status === 'approved') {
        const success = await this.approvePayment(receiptId, adminNotes)
        return { success }
      } else {
        const success = await this.rejectPayment(receiptId, adminNotes || 'Payment rejected')
        return { success }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update payment status'
      }
    }
  }

  async getAllPaymentReceipts(): Promise<{ success: boolean; receipts?: PaymentReceipt[]; error?: string }> {
    try {
      // In a real implementation, this would fetch from database
      // For now, return mock data
      const mockReceipts: PaymentReceipt[] = [
        {
          id: 'receipt_1',
          user_id: 'user_1',
          plan_type: 'premium',
          amount: 999,
          receipt_image_url: '/placeholder.svg?height=400&width=300&text=Receipt+1',
          status: 'pending',
          admin_notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'receipt_2',
          user_id: 'user_2',
          plan_type: 'basic',
          amount: 499,
          receipt_image_url: '/placeholder.svg?height=400&width=300&text=Receipt+2',
          status: 'approved',
          admin_notes: 'Payment verified successfully',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date().toISOString()
        }
      ]

      return {
        success: true,
        receipts: mockReceipts
      }

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch payment receipts'
      }
    }
  }

  getQueueStatus() {
    return {
      queueLength: this.processingQueue.size,
      currentProcessing: this.isProcessing ? 1 : 0,
      processedCount: this.processedCount,
      failedCount: this.failedCount
    }
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.size === 0) {
      return
    }

    this.isProcessing = true
    console.log('[PaymentProcessor] Processing queue with', this.processingQueue.size, 'items')

    try {
      // Process items in queue (mock processing)
      for (const [receiptId, submission] of this.processingQueue.entries()) {
        console.log('[PaymentProcessor] Processing receipt:', receiptId)
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // In real implementation, this would update database
        // For now, just log the processing
        console.log('[PaymentProcessor] Processed receipt:', receiptId)
      }

    } catch (error) {
      console.error('[PaymentProcessor] Error processing queue:', error)
    } finally {
      this.isProcessing = false
    }
  }

  // Utility method to simulate payment processing
  async simulatePaymentProcessing(receiptId: string): Promise<void> {
    console.log('[PaymentProcessor] Simulating payment processing for:', receiptId)
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Randomly approve or keep pending for demo
    const shouldAutoApprove = Math.random() > 0.7
    
    if (shouldAutoApprove) {
      await this.approvePayment(receiptId, 'Auto-approved for demo')
    }
  }

  clearQueue() {
    this.queue = []
    this.processingQueue.clear()
    this.retryAttempts.clear()
  }

  getQueueContents() {
    return Array.from(this.processingQueue.values())
  }
}

// Export singleton instance
export const paymentProcessor = new PaymentProcessor()
