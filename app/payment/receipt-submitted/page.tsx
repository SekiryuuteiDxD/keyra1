"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, Home, Receipt, Mail } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export default function ReceiptSubmittedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [receiptData, setReceiptData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const receiptId = searchParams.get("receipt")

    if (receiptId) {
      const receipt = localStorage.getItem(`receipt_${receiptId}`)
      if (receipt) {
        setReceiptData(JSON.parse(receipt))
      }
    }

    setIsLoading(false)
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
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
            <CardTitle className="text-2xl text-green-600">Receipt Submitted!</CardTitle>
            <p className="text-gray-600">Your payment receipt has been uploaded successfully</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {receiptData && (
              <div className="bg-gray-50 p-4 rounded-lg text-left">
                <h3 className="font-semibold mb-3">Submission Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Receipt ID:</span>
                    <span className="font-mono text-xs">{receiptData.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Plan:</span>
                    <span>{receiptData.paymentDetails.plan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span>₹{receiptData.paymentDetails.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="font-mono text-xs">{receiptData.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Submitted:</span>
                    <span>{new Date(receiptData.uploadedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Pending Review</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg text-left">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">What happens next?</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Admin will review your receipt within 24 hours</li>
                    <li>• You'll receive email notification once approved</li>
                    <li>• Your subscription will be activated immediately</li>
                    <li>• Full access to all features will be granted</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg text-left">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-800 mb-2">Important Notes</h3>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Keep your transaction ID safe for reference</li>
                    <li>• Check your email for updates</li>
                    <li>• Contact support if no response in 48 hours</li>
                    <li>• You can continue using basic features meanwhile</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={() => router.push("/")} className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>

              <Button onClick={() => router.push("/plan")} variant="outline" className="w-full">
                <Receipt className="h-4 w-4 mr-2" />
                View My Plans
              </Button>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>📧 Support: keyraqrapp@gmail.com</p>
              <p>📱 WhatsApp: +91 9876543210</p>
              <p>⏰ Support Hours: 9 AM - 6 PM (Mon-Sat)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
