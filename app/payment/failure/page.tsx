"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle, RefreshCw, Home, HelpCircle } from "lucide-react"

export default function PaymentFailurePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [failureReason, setFailureReason] = useState("")

  useEffect(() => {
    const error = searchParams.get("error")
    const reason = searchParams.get("reason")

    if (reason) {
      setFailureReason(reason)
    } else if (error) {
      setFailureReason(error)
    } else {
      setFailureReason("Payment was cancelled or failed")
    }
  }, [searchParams])

  const retryPayment = () => {
    // Navigate to the plan selection or a generic payment page
    router.push("/plan") // Or router.push("/payment") if you want to keep the current plan context
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto pt-8">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-600">Payment Failed</CardTitle>
            <p className="text-gray-600">Your payment could not be processed</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">What happened?</h3>
              <p className="text-sm text-red-700">{failureReason}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg text-left">
              <h3 className="font-semibold text-blue-800 mb-2">Common reasons for payment failure:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Insufficient balance in account</li>
                <li>• Card expired or blocked</li>
                <li>• Network connectivity issues</li>
                <li>• Payment cancelled by user</li>
                <li>• Bank declined the transaction</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button onClick={retryPayment} className="w-full bg-orange-500 hover:bg-orange-600">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>

              <Button onClick={() => router.push("/dashboard")} variant="outline" className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>

              <Button onClick={() => router.push("/contact")} variant="ghost" className="w-full">
                <HelpCircle className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </div>

            <div className="text-xs text-gray-500">
              <p>If you continue to face issues, please contact our support team.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
