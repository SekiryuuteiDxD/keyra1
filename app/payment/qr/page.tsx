"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Copy, Clock, AlertTriangle, CheckCircle } from "lucide-react"

interface PaymentDetails {
  paymentId: string
  plan: {
    id: string
    name: string
    price: number
  }
  amount: number
  subtotal: number
  gst: number
  billingInfo: {
    fullName: string
    email: string
    phone: string
  }
  timestamp: string
  status: string
  upiId: string
  recipientName: string
}

export default function PaymentQRPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [timeLeft, setTimeLeft] = useState<number>(3600)
  const [copied, setCopied] = useState(false)

  const upiId = "simaiyanitinokicici"
  const merchantName = "Nitin Simaiya"

  // Memoized function to avoid recreating on every render
  const navigateToPayment = useCallback(() => {
    router.push("/payment")
  }, [router])

  // Load payment details - runs only once when component mounts
  useEffect(() => {
    const paymentId = searchParams.get("payment")

    if (!paymentId) {
      setError("No payment ID provided")
      setIsLoading(false)
      return
    }

    const paymentData = localStorage.getItem(`payment_${paymentId}`)
    if (!paymentData) {
      setError("Payment not found")
      setIsLoading(false)
      return
    }

    try {
      const details = JSON.parse(paymentData)
      setPaymentDetails(details)
      setIsLoading(false)
    } catch (err) {
      console.error("Error parsing payment data:", err)
      setError("Failed to load payment data")
      setIsLoading(false)
    }
  }, [searchParams])

  // Timer countdown - separate effect that runs independently
  useEffect(() => {
    if (!paymentDetails || isLoading) return

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer)
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [paymentDetails, isLoading])

  // Handle timer expiration - separate effect to avoid dependency issues
  useEffect(() => {
    if (timeLeft === 0 && paymentDetails && !isLoading) {
      navigateToPayment()
    }
  }, [timeLeft, paymentDetails, isLoading, navigateToPayment])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(upiId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handlePaymentComplete = () => {
    if (paymentDetails) {
      router.push(`/payment/receipt-upload?payment=${paymentDetails.paymentId}`)
    }
  }

  const handleBackToPayment = () => {
    router.push("/payment")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    )
  }

  if (error || !paymentDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Payment Error</h2>
            <p className="text-gray-600 mb-4">{error || "Payment details not found"}</p>
            <Button onClick={handleBackToPayment} className="w-full">
              Back to Payment
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={handleBackToPayment}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold text-orange-500">Payment QR Code</h1>
        <div className="w-10" />
      </header>

      <div className="p-4 space-y-6">
        {/* Timer */}
        <Card className={`${timeLeft < 600 ? "border-red-200 bg-red-50" : "border-orange-200 bg-orange-50"}`}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-center space-x-2">
              <Clock className={`h-5 w-5 ${timeLeft < 600 ? "text-red-500" : "text-orange-500"}`} />
              <span
                className={`font-mono text-lg font-semibold ${timeLeft < 600 ? "text-red-600" : "text-orange-600"}`}
              >
                {formatTime(timeLeft)}
              </span>
            </div>
            <p className="text-center text-sm text-gray-600 mt-1">
              {timeLeft < 600 ? "Payment expires soon!" : "Time remaining to complete payment"}
            </p>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Plan:</span>
                <span className="font-semibold capitalize">{paymentDetails.plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-green-600">₹{paymentDetails.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-semibold">{paymentDetails.billingInfo.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-mono text-sm">{paymentDetails.paymentId}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Scan QR Code to Pay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <img
                  src="/payment-qr-code.png"
                  alt="Payment QR Code"
                  className="border-2 border-gray-200 rounded-lg"
                  width={300}
                  height={300}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">UPI ID:</p>
                <div className="flex items-center justify-between bg-white p-3 rounded border">
                  <span className="font-mono text-sm">{upiId}</span>
                  <Button variant="outline" size="sm" onClick={copyUpiId} className="ml-2 bg-transparent">
                    {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                  1
                </div>
                <p>Open any UPI app (Google Pay, PhonePe, Paytm, etc.)</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                  2
                </div>
                <p>
                  Scan the QR code above or use UPI ID: <span className="font-mono">{upiId}</span>
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                  3
                </div>
                <p>Verify the amount: ₹{paymentDetails.amount}</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                  4
                </div>
                <p>Complete the payment and take a screenshot</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                  5
                </div>
                <p>Upload the payment receipt for verification</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handlePaymentComplete}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
          size="lg"
        >
          I've Completed the Payment
        </Button>

        <Card>
          <CardContent className="pt-4">
            <div className="text-center text-sm text-gray-600">
              <p>Need help? Contact support:</p>
              <div className="flex justify-center space-x-4 mt-2">
                <Button variant="outline" size="sm" onClick={() => window.open("https://wa.me/918839073733")}>
                  WhatsApp
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open("mailto:keyraqrapp@gmail.com")}>
                  Email
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
