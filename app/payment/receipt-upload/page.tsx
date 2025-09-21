"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, FileImage, CheckCircle, AlertCircle, Camera } from "lucide-react"

export default function ReceiptUploadPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string>("")
  const [transactionId, setTransactionId] = useState("")
  const [notes, setNotes] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const paymentId = searchParams.get("payment")

    if (paymentId) {
      const paymentData = localStorage.getItem(`payment_${paymentId}`)
      if (paymentData) {
        const details = JSON.parse(paymentData)
        setPaymentDetails(details)
      } else {
        router.push("/payment")
        return
      }
    } else {
      router.push("/payment")
      return
    }

    setIsLoading(false)
  }, [searchParams, router])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB")
        return
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }

      setReceiptFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setReceiptPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!receiptFile) {
      alert("Please upload a receipt image")
      return
    }

    if (!transactionId.trim()) {
      alert("Please enter the transaction ID")
      return
    }

    setIsUploading(true)

    try {
      // Create receipt data
      const receiptData = {
        id: `RECEIPT_${Date.now()}`,
        paymentId: paymentDetails.paymentId,
        transactionId: transactionId.trim(),
        fileName: receiptFile.name,
        fileSize: receiptFile.size,
        uploadedAt: new Date().toISOString(),
        notes: notes.trim(),
        status: "pending",
        paymentDetails: paymentDetails,
      }

      // Convert file to base64 for storage (in real app, upload to server)
      const reader = new FileReader()
      reader.onload = () => {
        const base64Data = reader.result as string
        receiptData.fileData = base64Data

        // Store receipt data
        localStorage.setItem(`receipt_${receiptData.id}`, JSON.stringify(receiptData))

        // Add to pending receipts list for admin
        const pendingReceipts = JSON.parse(localStorage.getItem("pending_receipts") || "[]")
        pendingReceipts.push(receiptData)
        localStorage.setItem("pending_receipts", JSON.stringify(pendingReceipts))

        // Update payment status
        const updatedPaymentDetails = {
          ...paymentDetails,
          receiptUploaded: true,
          receiptId: receiptData.id,
          status: "receipt_uploaded",
        }
        localStorage.setItem(`payment_${paymentDetails.paymentId}`, JSON.stringify(updatedPaymentDetails))

        setIsUploading(false)
        router.push(`/payment/receipt-submitted?receipt=${receiptData.id}`)
      }
      reader.readAsDataURL(receiptFile)
    } catch (error) {
      console.error("Upload error:", error)
      setIsUploading(false)
      alert("Failed to upload receipt. Please try again.")
    }
  }

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

  if (!paymentDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Payment Not Found</h2>
          <p className="text-gray-600 mb-4">Please complete the payment first.</p>
          <Button onClick={() => router.push("/payment")}>Go to Payment</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold text-orange-500">Upload Receipt</h1>
        <div className="w-10" />
      </header>

      <div className="p-4 space-y-6 max-w-md mx-auto">
        {/* Payment Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg">{paymentDetails.plan.name} Plan</h3>
              <p className="text-2xl font-bold text-green-600">₹{paymentDetails.amount}</p>
            </div>

            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-mono text-xs">{paymentDetails.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span>{paymentDetails.billingInfo.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">UPI ID:</span>
                <span className="font-mono text-xs">{paymentDetails.upiId}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Instructions */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-blue-800 text-center">Upload Payment Receipt</h3>
              <div className="text-sm text-blue-700 space-y-2">
                <p>
                  📱 <strong>What to upload:</strong>
                </p>
                <ul className="space-y-1 ml-4">
                  <li>• Screenshot of payment confirmation</li>
                  <li>• Transaction receipt from your UPI app</li>
                  <li>• Bank SMS confirmation (optional)</li>
                </ul>
                <p className="mt-3">
                  🔍 <strong>Make sure the image shows:</strong>
                </p>
                <ul className="space-y-1 ml-4">
                  <li>• Transaction ID/Reference number</li>
                  <li>• Amount paid (₹{paymentDetails.amount})</li>
                  <li>• Date and time of payment</li>
                  <li>• Recipient name (Nitin Simaiya)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Receipt Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="receipt-upload" className="cursor-pointer">
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    receiptFile
                      ? "border-green-300 bg-green-50"
                      : "border-gray-300 hover:border-orange-400 hover:bg-orange-50"
                  }`}
                >
                  {receiptPreview ? (
                    <div className="space-y-3">
                      <img
                        src={receiptPreview || "/placeholder.svg"}
                        alt="Receipt preview"
                        className="max-w-full max-h-48 mx-auto rounded-lg shadow-md"
                      />
                      <p className="text-sm text-green-600 font-medium">✅ Receipt uploaded successfully</p>
                      <p className="text-xs text-gray-500">{receiptFile?.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <Camera className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium">Click to upload receipt</p>
                        <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </Label>
              <Input id="receipt-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>

            {receiptFile && (
              <Button
                variant="outline"
                onClick={() => {
                  setReceiptFile(null)
                  setReceiptPreview("")
                }}
                className="w-full"
              >
                <FileImage className="h-4 w-4 mr-2" />
                Choose Different Image
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Transaction Details */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="transaction-id">Transaction ID / Reference Number *</Label>
              <Input
                id="transaction-id"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter transaction ID from your payment app"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">💡 Find this in your UPI app's payment confirmation screen</p>
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information about the payment..."
                className="mt-1 min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isUploading || !receiptFile || !transactionId.trim()}
          className="w-full bg-green-600 hover:bg-green-700 py-3"
        >
          {isUploading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Uploading Receipt...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Submit Receipt for Review</span>
            </div>
          )}
        </Button>

        {/* Help Text */}
        <div className="text-center text-xs text-gray-500 space-y-1 p-4 bg-gray-100 rounded-lg">
          <p>📞 Need help? Contact support at keyraqrapp@gmail.com</p>
          <p>⏱️ Admin will review your receipt within 24 hours</p>
          <p>✅ You'll get email confirmation once approved</p>
        </div>
      </div>
    </div>
  )
}
