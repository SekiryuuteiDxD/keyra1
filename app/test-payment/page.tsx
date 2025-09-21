'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { CreditCard, Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { paymentProcessor } from '@/lib/payment-processor'
import { usePaymentReceiptUpdates } from '@/hooks/use-realtime'

export default function TestPaymentPage() {
  const { toast } = useToast()
  const { paymentReceipts } = usePaymentReceiptUpdates()
  const [paymentForm, setPaymentForm] = useState({
    userId: `user_${Date.now()}`,
    planType: 'premium',
    amount: 999,
    receiptUrl: '/placeholder.svg?height=400&width=300&text=Test+Payment+Receipt',
    userName: 'Test User',
    userEmail: 'test@example.com'
  })
  const [submitting, setSubmitting] = useState(false)
  const [lastSubmission, setLastSubmission] = useState<any>(null)

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const result = await paymentProcessor.submitPayment({
        userId: paymentForm.userId,
        planType: paymentForm.planType,
        amount: paymentForm.amount,
        receiptUrl: paymentForm.receiptUrl,
        userName: paymentForm.userName,
        userEmail: paymentForm.userEmail
      })

      if (result.success) {
        setLastSubmission(result)
        toast({
          title: "Payment Submitted Successfully!",
          description: `Receipt ID: ${result.receiptId}. Check the admin panel for real-time updates.`,
        })

        // Generate new user ID for next test
        setPaymentForm(prev => ({
          ...prev,
          userId: `user_${Date.now()}`
        }))
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: "Payment Submission Failed",
        description: error.message || "Failed to submit payment",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const quickTestPayments = [
    { planType: 'basic', amount: 299, label: 'Basic Plan' },
    { planType: 'premium', amount: 999, label: 'Premium Plan' },
    { planType: 'enterprise', amount: 2999, label: 'Enterprise Plan' }
  ]

  const submitQuickTest = async (planType: string, amount: number) => {
    setSubmitting(true)
    try {
      const result = await paymentProcessor.submitPayment({
        userId: `quick_user_${Date.now()}`,
        planType,
        amount,
        receiptUrl: `/placeholder.svg?height=400&width=300&text=${planType}+Receipt`,
        userName: `Quick Test User`,
        userEmail: 'quicktest@example.com'
      })

      if (result.success) {
        toast({
          title: "Quick Test Submitted!",
          description: `${planType} plan payment submitted. Receipt ID: ${result.receiptId}`,
        })
      }
    } catch (error: any) {
      toast({
        title: "Quick Test Failed",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Testing Interface</h1>
          <p className="text-gray-600">Test real-time payment processing and admin notifications</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Submission Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Submit Test Payment</span>
              </CardTitle>
              <CardDescription>
                Submit a test payment to see real-time processing in action
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPayment} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="userId">User ID</Label>
                    <Input
                      id="userId"
                      value={paymentForm.userId}
                      onChange={(e) => setPaymentForm({...paymentForm, userId: e.target.value})}
                      placeholder="user_123"
                    />
                  </div>
                  <div>
                    <Label htmlFor="planType">Plan Type</Label>
                    <select
                      id="planType"
                      value={paymentForm.planType}
                      onChange={(e) => setPaymentForm({...paymentForm, planType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="basic">Basic Plan</option>
                      <option value="premium">Premium Plan</option>
                      <option value="enterprise">Enterprise Plan</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({...paymentForm, amount: parseInt(e.target.value)})}
                      placeholder="999"
                    />
                  </div>
                  <div>
                    <Label htmlFor="userName">User Name</Label>
                    <Input
                      id="userName"
                      value={paymentForm.userName}
                      onChange={(e) => setPaymentForm({...paymentForm, userName: e.target.value})}
                      placeholder="Test User"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="userEmail">User Email</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={paymentForm.userEmail}
                    onChange={(e) => setPaymentForm({...paymentForm, userEmail: e.target.value})}
                    placeholder="test@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="receiptUrl">Receipt Image URL</Label>
                  <Input
                    id="receiptUrl"
                    value={paymentForm.receiptUrl}
                    onChange={(e) => setPaymentForm({...paymentForm, receiptUrl: e.target.value})}
                    placeholder="/placeholder.svg?height=400&width=300&text=Receipt"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Submitting Payment...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Submit Test Payment
                    </>
                  )}
                </Button>
              </form>

              {lastSubmission && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">Payment Submitted Successfully!</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Receipt ID: <code className="bg-green-100 px-2 py-1 rounded">{lastSubmission.receiptId}</code>
                  </p>
                  <p className="text-sm text-green-700">
                    Check the admin panel to approve or reject this payment in real-time.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Test Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Test Payments</CardTitle>
              <CardDescription>
                Submit predefined test payments with one click
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quickTestPayments.map((test) => (
                  <Button
                    key={test.planType}
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => submitQuickTest(test.planType, test.amount)}
                    disabled={submitting}
                  >
                    <span>{test.label}</span>
                    <Badge variant="secondary">₹{test.amount}</Badge>
                  </Button>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">How to Test:</h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Submit a payment using the form or quick buttons</li>
                  <li>2. Open the <a href="/admin" className="underline font-medium">Admin Panel</a> in another tab</li>
                  <li>3. Watch the payment appear instantly in the receipts section</li>
                  <li>4. Approve or reject the payment to see real-time notifications</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Payments */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Test Payments ({paymentReceipts.length})</span>
              <Badge variant="outline">Real-time</Badge>
            </CardTitle>
            <CardDescription>
              Live view of all payment submissions and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentReceipts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No payments submitted yet</p>
                  <p className="text-sm">Submit a test payment to see real-time updates</p>
                </div>
              ) : (
                paymentReceipts.slice(0, 10).map((receipt) => (
                  <div key={receipt.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h4 className="font-medium">Plan: {receipt.plan_type}</h4>
                          <p className="text-sm text-gray-600">Amount: ₹{receipt.amount}</p>
                          <p className="text-xs text-gray-500">
                            ID: {receipt.id} • User: {receipt.user_id}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            receipt.status === 'approved' ? 'default' : 
                            receipt.status === 'rejected' ? 'destructive' : 
                            'secondary'
                          }
                        >
                          {receipt.status}
                        </Badge>
                      </div>
                      {receipt.admin_notes && (
                        <p className="text-xs text-gray-500 mt-2 bg-gray-100 p-2 rounded">
                          Admin Notes: {receipt.admin_notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(receipt.created_at).toLocaleString()}
                      </p>
                      {receipt.status === 'pending' && (
                        <div className="flex items-center space-x-1 mt-1">
                          <AlertCircle className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs text-yellow-600">Awaiting Review</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
