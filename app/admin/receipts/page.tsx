"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, XCircle, Eye, User, FileText } from "lucide-react"

export default function AdminReceiptsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [receipts, setReceipts] = useState([])
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Check admin authentication
    const sessionData = localStorage.getItem("keyra-user-session")
    if (sessionData) {
      const session = JSON.parse(sessionData)
      if (!session.isLoggedIn || session.userType !== "admin") {
        router.push("/auth/admin")
        return
      }
    } else {
      router.push("/auth/admin")
      return
    }

    loadReceipts()

    // Check if reviewing specific receipt
    const reviewId = searchParams.get("review")
    if (reviewId) {
      const receipt = receipts.find((r) => r.id === reviewId)
      if (receipt) {
        setSelectedReceipt(receipt)
      }
    }
  }, [router, searchParams])

  const loadReceipts = () => {
    const savedReceipts = localStorage.getItem("payment_receipts")
    if (savedReceipts) {
      setReceipts(JSON.parse(savedReceipts))
    }
  }

  const handleApprove = async () => {
    if (!selectedReceipt) return

    setIsProcessing(true)
    try {
      const updatedReceipts = receipts.map((receipt) =>
        receipt.id === selectedReceipt.id
          ? {
              ...receipt,
              status: "approved",
              adminNotes: adminNotes.trim(),
              reviewedAt: new Date().toISOString(),
              reviewedBy: "Admin User",
            }
          : receipt,
      )

      setReceipts(updatedReceipts)
      localStorage.setItem("payment_receipts", JSON.stringify(updatedReceipts))

      alert("Payment receipt approved successfully!")
      setSelectedReceipt(null)
      setAdminNotes("")
    } catch (error) {
      console.error("Error approving receipt:", error)
      alert("Failed to approve receipt")
    }
    setIsProcessing(false)
  }

  const handleReject = async () => {
    if (!selectedReceipt) return
    if (!adminNotes.trim()) {
      alert("Please provide a reason for rejection")
      return
    }

    setIsProcessing(true)
    try {
      const updatedReceipts = receipts.map((receipt) =>
        receipt.id === selectedReceipt.id
          ? {
              ...receipt,
              status: "rejected",
              adminNotes: adminNotes.trim(),
              reviewedAt: new Date().toISOString(),
              reviewedBy: "Admin User",
            }
          : receipt,
      )

      setReceipts(updatedReceipts)
      localStorage.setItem("payment_receipts", JSON.stringify(updatedReceipts))

      alert("Payment receipt rejected")
      setSelectedReceipt(null)
      setAdminNotes("")
    } catch (error) {
      console.error("Error rejecting receipt:", error)
      alert("Failed to reject receipt")
    }
    setIsProcessing(false)
  }

  const pendingReceipts = receipts.filter((r) => r.status === "pending")
  const approvedReceipts = receipts.filter((r) => r.status === "approved")
  const rejectedReceipts = receipts.filter((r) => r.status === "rejected")

  if (selectedReceipt) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => setSelectedReceipt(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Receipts
            </Button>
            <h1 className="text-xl font-bold text-orange-500">Review Receipt</h1>
            <div></div>
          </div>

          {/* Receipt Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Payment Receipt Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Customer Name</Label>
                  <p className="font-medium">{selectedReceipt.paymentDetails?.billingInfo?.fullName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p className="font-medium">{selectedReceipt.paymentDetails?.billingInfo?.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Phone</Label>
                  <p className="font-medium">{selectedReceipt.paymentDetails?.billingInfo?.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Plan</Label>
                  <p className="font-medium">{selectedReceipt.paymentDetails?.plan?.name}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Amount</Label>
                    <p className="font-bold text-lg text-green-600">₹{selectedReceipt.paymentDetails?.amount}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Transaction ID</Label>
                    <p className="font-mono text-sm">{selectedReceipt.transactionId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Uploaded At</Label>
                    <p className="text-sm">{new Date(selectedReceipt.uploadedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {selectedReceipt.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Receipt Image */}
              <div className="border-t pt-4">
                <Label className="text-sm font-medium text-gray-600 mb-2 block">Payment Receipt</Label>
                <div className="border rounded-lg p-4 bg-white">
                  <img
                    src={selectedReceipt.receiptFile || "/placeholder.svg"}
                    alt="Payment receipt"
                    className="max-w-full h-auto rounded"
                  />
                </div>
              </div>

              {/* Customer Notes */}
              {selectedReceipt.notes && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-gray-600 mb-2 block">Customer Notes</Label>
                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedReceipt.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Review */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Admin Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="admin-notes">Review Notes</Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this payment verification..."
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isProcessing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Approve Payment
                </Button>

                <Button onClick={handleReject} disabled={isProcessing} variant="destructive" className="flex-1">
                  {isProcessing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Reject Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.push("/admin")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Panel
          </Button>
          <h1 className="text-2xl font-bold text-orange-500">Payment Receipts</h1>
          <div></div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{pendingReceipts.length}</div>
                <p className="text-sm text-gray-600">Pending Review</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{approvedReceipts.length}</div>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{rejectedReceipts.length}</div>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Receipts */}
        {pendingReceipts.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Pending Review ({pendingReceipts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingReceipts.map((receipt) => (
                <div key={receipt.id} className="border rounded-lg p-4 bg-yellow-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-600" />
                      <div>
                        <h3 className="font-semibold">{receipt.paymentDetails?.billingInfo?.fullName}</h3>
                        <p className="text-sm text-gray-600">{receipt.paymentDetails?.billingInfo?.email}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Pending
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-600">Plan:</span>
                      <p className="font-medium">{receipt.paymentDetails?.plan?.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <p className="font-medium">₹{receipt.paymentDetails?.amount}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Transaction ID:</span>
                      <p className="font-mono text-xs">{receipt.transactionId}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Uploaded:</span>
                      <p className="text-xs">{new Date(receipt.uploadedAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" onClick={() => setSelectedReceipt(receipt)}>
                    <Eye className="h-4 w-4 mr-1" />
                    Review Receipt
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* All Receipts */}
        <Card>
          <CardHeader>
            <CardTitle>All Payment Receipts</CardTitle>
          </CardHeader>
          <CardContent>
            {receipts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No payment receipts submitted yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {receipts.map((receipt) => (
                  <div key={receipt.id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-600" />
                      <div>
                        <h4 className="font-medium">{receipt.paymentDetails?.billingInfo?.fullName}</h4>
                        <p className="text-sm text-gray-600">
                          {receipt.paymentDetails?.plan?.name} - ₹{receipt.paymentDetails?.amount}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant={
                          receipt.status === "approved"
                            ? "default"
                            : receipt.status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                        className={
                          receipt.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : receipt.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {receipt.status}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => setSelectedReceipt(receipt)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
