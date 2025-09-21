"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Home, Receipt } from "lucide-react"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Extract txnid from searchParams
  const txnid = searchParams.get("txnid")

  useEffect(() => {
    // Get subscription data from localStorage
    const subscriptionData = localStorage.getItem("subscription")
    if (subscriptionData) {
      const subscription = JSON.parse(subscriptionData)
      // You might want to add a check here:
      // if (subscription.paymentId === txnid) {
      //   setPaymentDetails(subscription);
      // } else {
      //   // Handle mismatch, e.g., clear details or show an error
      //   setPaymentDetails(null);
      // }
      setPaymentDetails(subscription)
    }
    setIsLoading(false)
  }, [txnid])

  const downloadReceipt = () => {
    if (!paymentDetails) return

    const receiptData = {
      transactionId: paymentDetails.paymentId,
      plan: paymentDetails.plan.name,
      amount: paymentDetails.amount,
      date: new Date(paymentDetails.subscribedAt).toLocaleDateString(),
      customer: paymentDetails.billingInfo.fullName,
      email: paymentDetails.billingInfo.email,
      paymentGateway: "PayU",
    }

    const dataStr = JSON.stringify(receiptData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `receipt_${paymentDetails.paymentId}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto pt-8">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
            <p className="text-gray-600">Your subscription has been activated</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {paymentDetails && (
              <div className="bg-gray-50 p-4 rounded-lg text-left">
                <h3 className="font-semibold mb-3">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="font-mono">{paymentDetails.paymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Plan:</span>
                    <span>{paymentDetails.plan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span>₹{paymentDetails.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Gateway:</span>
                    <span>{paymentDetails.paymentGateway || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date(paymentDetails.subscribedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button onClick={downloadReceipt} variant="outline" className="w-full" disabled={!paymentDetails}>
                <Receipt className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>

              <Button onClick={() => router.push("/dashboard")} className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>

            <div className="text-xs text-gray-500">
              <p>A confirmation email has been sent to your registered email address.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
