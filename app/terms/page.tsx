"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TermsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold text-orange-500">Terms & Conditions</h1>
        <div className="w-10" />
      </header>

      <div className="p-4 max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Terms and Conditions for Keyra QR App</CardTitle>
            <p className="text-sm text-gray-600">Last updated: January 2025</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h3>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using Keyra QR App, you accept and agree to be bound by the terms and provision of this
                agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">2. Service Description</h3>
              <p className="text-gray-700 leading-relaxed">
                Keyra QR App provides QR code generation and management services including but not limited to:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                <li>Phone number QR code generation</li>
                <li>Text QR code generation</li>
                <li>Contact card QR codes</li>
                <li>QR code scanning and validation</li>
                <li>QR code analytics and management</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">3. Subscription Plans</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">Single Person Plan (₹50/month)</h4>
                  <p className="text-sm text-gray-600">Individual use with basic features</p>
                </div>
                <div>
                  <h4 className="font-medium">Franchise Plan (₹500/month)</h4>
                  <p className="text-sm text-gray-600">Small business use with advanced features</p>
                </div>
                <div>
                  <h4 className="font-medium">Office Plan (₹10,000/month)</h4>
                  <p className="text-sm text-gray-600">Enterprise use with premium features</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">4. Payment Terms</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>All payments are processed through UPI payment gateway</li>
                <li>Subscription fees are charged monthly in advance</li>
                <li>All prices include applicable GST (18%)</li>
                <li>Payment receipts must be uploaded for verification</li>
                <li>Service activation requires admin approval of payment receipt</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">5. User Responsibilities</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Provide accurate and complete information during registration</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Use the service only for lawful purposes</li>
                <li>Not attempt to reverse engineer or hack the application</li>
                <li>Report any security vulnerabilities or bugs immediately</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">6. Prohibited Uses</h3>
              <p className="text-gray-700 leading-relaxed mb-2">You may not use our service:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>
                  To violate any international, federal, provincial, or state regulations, rules, laws, or local
                  ordinances
                </li>
                <li>
                  To infringe upon or violate our intellectual property rights or the intellectual property rights of
                  others
                </li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">7. Privacy Policy</h3>
              <p className="text-gray-700 leading-relaxed">
                Your privacy is important to us. We collect and use your personal information in accordance with our
                Privacy Policy. By using our service, you consent to the collection and use of your information as
                outlined in our Privacy Policy.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">8. Intellectual Property</h3>
              <p className="text-gray-700 leading-relaxed">
                The service and its original content, features, and functionality are and will remain the exclusive
                property of Keyra QR App and its licensors. The service is protected by copyright, trademark, and other
                laws.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">9. Termination</h3>
              <p className="text-gray-700 leading-relaxed">
                We may terminate or suspend your account and bar access to the service immediately, without prior notice
                or liability, under our sole discretion, for any reason whatsoever and without limitation, including but
                not limited to a breach of the Terms.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">10. Disclaimer</h3>
              <p className="text-gray-700 leading-relaxed">
                The information on this app is provided on an "as is" basis. To the fullest extent permitted by law,
                this Company excludes all representations, warranties, conditions and terms.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">11. Limitation of Liability</h3>
              <p className="text-gray-700 leading-relaxed">
                In no event shall Keyra QR App, nor its directors, employees, partners, agents, suppliers, or
                affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">12. Changes to Terms</h3>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a
                revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">13. Contact Information</h3>
              <div className="space-y-2 text-gray-700">
                <p>If you have any questions about these Terms and Conditions, please contact us:</p>
                <p>Email: keyraqrapp@gmail.com</p>
                <p>WhatsApp: +91 88390 73733</p>
                <p>Address: India</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
