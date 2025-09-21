"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function RefundPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold text-orange-500">Refund Policy</h1>
        <div className="w-10" />
      </header>

      <div className="p-4 max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Refund Policy for Keyra QR App</CardTitle>
            <p className="text-sm text-gray-600">Last updated: January 2025</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-3">1. Refund Eligibility</h3>
              <p className="text-gray-700 leading-relaxed mb-3">We offer refunds under the following conditions:</p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Technical Issues</p>
                    <p className="text-sm text-green-700">Service not working due to technical problems on our end</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Service Not Delivered</p>
                    <p className="text-sm text-green-700">
                      Payment made but service access not provided within 48 hours
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Duplicate Payment</p>
                    <p className="text-sm text-green-700">Accidental multiple payments for the same subscription</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">2. Refund Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Request Period: 7 Days</p>
                    <p className="text-sm text-gray-600">Refund requests must be made within 7 days of payment</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">Processing Time: 3-5 Business Days</p>
                    <p className="text-sm text-gray-600">
                      Refunds are processed within 3-5 business days after approval
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Clock className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Bank Credit: 5-7 Business Days</p>
                    <p className="text-sm text-gray-600">Amount credited to your account within 5-7 business days</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">3. Subscription Plan Refunds</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-blue-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Single Person</CardTitle>
                      <Badge variant="secondary">₹50/month</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1">
                      <li>• Full refund if unused</li>
                      <li>• Pro-rated refund available</li>
                      <li>• 7-day refund window</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-purple-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Franchise</CardTitle>
                      <Badge variant="secondary">₹500/month</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1">
                      <li>• Full refund if unused</li>
                      <li>• Pro-rated refund available</li>
                      <li>• 7-day refund window</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-orange-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Office</CardTitle>
                      <Badge variant="secondary">₹10,000/month</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1">
                      <li>• Full refund if unused</li>
                      <li>• Pro-rated refund available</li>
                      <li>• 7-day refund window</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">4. Non-Refundable Situations</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Service Already Used</p>
                    <p className="text-sm text-red-700">Significant usage of QR code generation or scanning features</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Policy Violation</p>
                    <p className="text-sm text-red-700">Account suspended due to terms of service violation</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Late Request</p>
                    <p className="text-sm text-red-700">Refund requested after 7-day window</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">5. How to Request a Refund</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Step 1: Contact Support</h4>
                  <p className="text-sm text-blue-700 mb-2">Reach out to our support team with your refund request:</p>
                  <div className="space-y-1 text-sm">
                    <p>• Email: keyraqrapp@gmail.com</p>
                    <p>• WhatsApp: +91 88390 73733</p>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-2">Step 2: Provide Information</h4>
                  <p className="text-sm text-orange-700 mb-2">Include the following details:</p>
                  <ul className="text-sm space-y-1">
                    <li>• Payment ID or transaction reference</li>
                    <li>• Registered email address</li>
                    <li>• Reason for refund request</li>
                    <li>• Payment receipt screenshot</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Step 3: Review Process</h4>
                  <p className="text-sm text-green-700">
                    Our team will review your request within 24-48 hours and respond with the decision.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">6. Refund Methods</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-3">
                  Refunds will be processed through the same payment method used for the original transaction:
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• UPI payments: Refunded to the same UPI ID</li>
                  <li>• Bank transfers: Refunded to the source bank account</li>
                  <li>• Digital wallets: Refunded to the same wallet</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">7. Partial Refunds</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                In some cases, we may offer partial refunds based on:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Usage of the service during the billing period</li>
                <li>Time remaining in the subscription period</li>
                <li>Specific circumstances of the refund request</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">8. Dispute Resolution</h3>
              <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Escalation Process</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    If you're not satisfied with our refund decision, you can escalate the matter by contacting our
                    senior support team. We are committed to resolving all disputes fairly and promptly.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">9. Contact Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-3">For any refund-related queries, contact us:</p>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Email:</strong> keyraqrapp@gmail.com
                  </p>
                  <p>
                    <strong>WhatsApp:</strong> +91 88390 73733
                  </p>
                  <p>
                    <strong>Support Hours:</strong> Monday to Friday, 9:00 AM to 6:00 PM IST
                  </p>
                  <p>
                    <strong>Response Time:</strong> Within 24 hours
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">10. Policy Updates</h3>
              <p className="text-gray-700 leading-relaxed">
                This refund policy may be updated from time to time. We will notify users of any significant changes via
                email or through the app. Continued use of the service after policy updates constitutes acceptance of
                the new terms.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
