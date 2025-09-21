"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

interface UserSession {
  id: string
  name: string
  email: string
  phone: string
  isLoggedIn: boolean
  loginTime: string
  userType?: string
}

export default function PrivacyPage() {
  const [userSession, setUserSession] = useState<UserSession | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const sessionData = localStorage.getItem("keyra-user-session")
        if (sessionData) {
          const session = JSON.parse(sessionData)
          if (session.isLoggedIn) {
            setUserSession(session)
          } else {
            router.push("/auth")
          }
        } else {
          router.push("/auth")
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        router.push("/auth")
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  // Show loading screen while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!userSession) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-50 border-b border-gray-200">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-12 w-12 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="text-center">
          <h1 className="text-xl font-bold text-orange-500 tracking-wide">Privacy Policy</h1>
        </div>
        <div className="w-12 h-12"></div>
      </header>

      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          {/* Header Icon */}
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Privacy Policy</h2>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <p className="text-sm text-blue-800">
                🔒 <strong>Your privacy is our priority.</strong> This policy explains how we collect, use, and protect
                your information.
              </p>
            </div>
          </div>

          {/* Privacy Policy Content */}
          <div className="space-y-6 text-gray-700">
            <section>
              <div className="flex items-center mb-3">
                <Database className="w-6 h-6 text-blue-600 mr-2" />
                <h3 className="text-xl font-semibold text-gray-800">Information We Collect</h3>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Personal Information:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>Name and contact details</li>
                    <li>Email address and phone number</li>
                    <li>Profile information and photos</li>
                    <li>Payment information (processed securely)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Usage Information:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>QR codes generated and scanned</li>
                    <li>App usage patterns and preferences</li>
                    <li>Device information and IP address</li>
                    <li>Location data (with permission)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center mb-3">
                <Eye className="w-6 h-6 text-green-600 mr-2" />
                <h3 className="text-xl font-semibold text-gray-800">How We Use Your Information</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Service Delivery:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                    <li>Generate and manage QR codes</li>
                    <li>Process payments securely</li>
                    <li>Provide customer support</li>
                    <li>Send service notifications</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Improvement:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                    <li>Analyze usage patterns</li>
                    <li>Enhance user experience</li>
                    <li>Develop new features</li>
                    <li>Prevent fraud and abuse</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center mb-3">
                <Lock className="w-6 h-6 text-purple-600 mr-2" />
                <h3 className="text-xl font-semibold text-gray-800">Data Protection & Security</h3>
              </div>
              <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                <p className="leading-relaxed mb-3">
                  We implement industry-standard security measures to protect your data:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-purple-800 mb-2">Technical Safeguards:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-purple-700">
                      <li>End-to-end encryption</li>
                      <li>Secure data transmission (HTTPS)</li>
                      <li>Regular security audits</li>
                      <li>Access controls and monitoring</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-800 mb-2">Operational Safeguards:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-purple-700">
                      <li>Employee training programs</li>
                      <li>Data minimization practices</li>
                      <li>Regular backup procedures</li>
                      <li>Incident response protocols</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center mb-3">
                <UserCheck className="w-6 h-6 text-orange-600 mr-2" />
                <h3 className="text-xl font-semibold text-gray-800">Your Rights & Controls</h3>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="leading-relaxed mb-3">You have full control over your personal information:</p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Access:</strong> Request a copy of your personal data
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Correction:</strong> Update or correct inaccurate information
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Deletion:</strong> Request deletion of your account and data
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Portability:</strong> Export your data in a readable format
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Opt-out:</strong> Unsubscribe from marketing communications
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center mb-3">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
                <h3 className="text-xl font-semibold text-gray-800">Data Sharing & Third Parties</h3>
              </div>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <p className="leading-relaxed mb-3 text-red-800">
                  <strong>We do NOT sell your personal information.</strong> We only share data in these limited
                  circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-red-700">
                  <li>
                    <strong>Service Providers:</strong> Trusted partners who help us operate the service (payment
                    processors, cloud storage)
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> When required by law or to protect our rights
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In case of merger or acquisition (with notice to users)
                  </li>
                  <li>
                    <strong>With Consent:</strong> When you explicitly authorize sharing
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">🍪 Cookies & Tracking</h3>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="leading-relaxed mb-3">
                  We use cookies and similar technologies to enhance your experience:
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Essential Cookies:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Authentication and security</li>
                      <li>Session management</li>
                      <li>Basic functionality</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Optional Cookies:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Analytics and performance</li>
                      <li>Personalization</li>
                      <li>Marketing (with consent)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">📱 Mobile App Permissions</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="leading-relaxed mb-3">Our mobile app requests these permissions:</p>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Camera:</strong> To scan QR codes and take profile photos
                  </div>
                  <div>
                    <strong>Storage:</strong> To save generated QR codes and images
                  </div>
                  <div>
                    <strong>Contacts:</strong> To import contacts (optional)
                  </div>
                  <div>
                    <strong>Location:</strong> For location-based features (optional)
                  </div>
                  <div>
                    <strong>Notifications:</strong> To send important updates
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-3">
                  💡 You can manage these permissions in your device settings at any time.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">🌍 International Data Transfers</h3>
              <p className="leading-relaxed">
                Your data may be processed in countries other than your own. We ensure adequate protection through
                appropriate safeguards and comply with applicable data protection laws.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">👶 Children's Privacy</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="leading-relaxed">
                  Keyra is not intended for children under 13. We do not knowingly collect personal information from
                  children. If you believe we have collected information from a child, please contact us immediately.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">📞 Contact Us About Privacy</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="leading-relaxed mb-3">For privacy-related questions or to exercise your rights:</p>
                <div className="space-y-2">
                  <p>
                    <strong>Email:</strong> keyraqrapp@gmail.com
                  </p>
                  <p>
                    <strong>Phone:</strong> +91 8839073733
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">🔄 Policy Updates</h3>
              <p className="leading-relaxed">
                We may update this privacy policy from time to time. We'll notify you of significant changes via email
                or in-app notification. Your continued use of the service after changes constitutes acceptance of the
                updated policy.
              </p>
            </section>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-gray-200 space-y-3">
            <Button
              onClick={() => router.push("/contact")}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-3"
            >
              🛡️ Contact Us
            </Button>
            <Button
              onClick={() => router.push("/settings")}
              variant="outline"
              className="w-full border-2 border-blue-300 text-blue-600 rounded-xl py-3"
            >
              ⚙️ Manage Privacy Settings
            </Button>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="w-full border-2 border-gray-300 rounded-xl py-3"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Menu
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
