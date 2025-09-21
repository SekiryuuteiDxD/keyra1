"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Heart, Target, Star, Users, Award, Globe, Phone, Mail, MessageCircle } from "lucide-react"
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

export default function AboutUsPage() {
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
          <h1 className="text-xl font-bold text-orange-500 tracking-wide">About Us</h1>
        </div>
        <div className="w-12 h-12"></div>
      </header>

      <div className="p-4 max-w-4xl mx-auto space-y-6">
        {/* Hero Section */}
        <Card className="bg-gradient-to-r from-orange-50 to-pink-50 border-orange-200">
          <CardContent className="p-8 text-center">
            <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Globe className="w-10 h-10 text-orange-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Keyra</h2>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Your ultimate QR code companion, making digital connections simple, secure, and seamless. We're
              revolutionizing how people share and access information in the digital age.
            </p>
          </CardContent>
        </Card>

        {/* Mission, Vision, Values */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <Target className="w-6 h-6 mr-2" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 leading-relaxed">
                To democratize digital connectivity by providing powerful, user-friendly QR code solutions that bridge
                the gap between physical and digital worlds.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <Star className="w-6 h-6 mr-2" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 leading-relaxed">
                To become the world's most trusted QR code platform, empowering billions of seamless digital
                interactions every day.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-800">
                <Heart className="w-6 h-6 mr-2" />
                Our Values
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-700 leading-relaxed">
                Innovation, Security, Simplicity, and User-centricity drive everything we do. Your privacy and
                experience are our top priorities.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Our Story */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-6 h-6 mr-2 text-orange-500" />
              Our Story
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              Founded in 2024, Keyra emerged from a simple observation: QR codes were everywhere, but the tools to
              create and manage them were scattered, complex, and often unreliable. We set out to change that.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Starting as a small team of passionate developers and designers, we've grown into a comprehensive platform
              that serves thousands of users worldwide. Our journey has been driven by one core belief: technology
              should make life simpler, not more complicated.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Today, Keyra stands as a testament to what's possible when innovation meets user needs. We're not just
              building QR codes; we're building bridges between the physical and digital worlds.
            </p>
          </CardContent>
        </Card>

        {/* Key Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="w-6 h-6 mr-2 text-orange-500" />
              What Makes Us Special
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Lightning Fast</h4>
                    <p className="text-sm text-gray-600">Generate QR codes instantly with our optimized algorithms</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Bank-Grade Security</h4>
                    <p className="text-sm text-gray-600">Your data is protected with enterprise-level encryption</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Universal Compatibility</h4>
                    <p className="text-sm text-gray-600">Works seamlessly across all devices and platforms</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Smart Analytics</h4>
                    <p className="text-sm text-gray-600">Track performance with detailed insights and metrics</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">24/7 Support</h4>
                    <p className="text-sm text-gray-600">Our team is always here to help you succeed</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Continuous Innovation</h4>
                    <p className="text-sm text-gray-600">Regular updates with new features and improvements</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">Keyra by the Numbers</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500 mb-2">10K+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500 mb-2">100K+</div>
                <div className="text-sm text-gray-600">QR Codes Generated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500 mb-2">99.9%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-500 mb-2">50+</div>
                <div className="text-sm text-gray-600">Countries Served</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="w-6 h-6 mr-2 text-orange-500" />
              Get in Touch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Have questions, suggestions, or just want to say hello? We'd love to hear from you! Our team is always
              ready to help and we value every piece of feedback.
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <Phone className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-800 mb-1">Call Us</h4>
                <p className="text-sm text-blue-600">+91 883 907 3733</p>
                <Button
                  size="sm"
                  className="mt-2 bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.open("tel:+918839073733")}
                >
                  Call Now
                </Button>
              </div>

              <div className="bg-green-50 p-4 rounded-lg text-center">
                <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-800 mb-1">WhatsApp</h4>
                <p className="text-sm text-green-600">Quick Support</p>
                <Button
                  size="sm"
                  className="mt-2 bg-green-600 hover:bg-green-700"
                  onClick={() => window.open("https://wa.me/918839073733")}
                >
                  Chat Now
                </Button>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <Mail className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-purple-800 mb-1">Email</h4>
                <p className="text-sm text-purple-600">keyraqrapp@gmail.com</p>
                <Button
                  size="sm"
                  className="mt-2 bg-purple-600 hover:bg-purple-700"
                  onClick={() => window.open("mailto:keyraqrapp@gmail.com")}
                >
                  Send Email
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-orange-100 mb-6 leading-relaxed">
              Join thousands of users who trust Keyra for their QR code needs. Experience the difference today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push("/scanner")}
                className="bg-white text-orange-500 hover:bg-gray-100 font-semibold px-8 py-3"
              >
                Start Scanning
              </Button>
              <Button
                onClick={() => router.push("/plan")}
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-orange-500 font-semibold px-8 py-3"
              >
                View Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
