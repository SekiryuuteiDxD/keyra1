"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, RefreshCw, Home } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PaymentFailedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Failed Header */}
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-600">We couldn't process your payment. Please try again.</p>
        </div>

        {/* Common Reasons */}
        <Card>
          <CardHeader>
            <CardTitle>Common Reasons for Payment Failure</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start space-x-2">
                <span className="text-red-500">•</span>
                <span>Insufficient balance in your account</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-500">•</span>
                <span>Incorrect card details or expired card</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-500">•</span>
                <span>Network connectivity issues</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-500">•</span>
                <span>Transaction limit exceeded</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-500">•</span>
                <span>Bank server temporarily unavailable</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button className="w-full" onClick={() => router.back()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>

          <Button className="w-full" variant="outline" onClick={() => router.push("/plan")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Choose Different Plan
          </Button>

          <Button className="w-full" variant="outline" onClick={() => router.push("/")}>
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
        </div>

        {/* Support */}
        <div className="text-center text-sm text-gray-600">
          <p>Still having issues? Contact our support team</p>
          <Button variant="link" onClick={() => router.push("/customer-care")}>
            Customer Support
          </Button>
        </div>
      </div>
    </div>
  )
}
