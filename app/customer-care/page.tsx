"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  HelpCircle,
  Search,
  ChevronRight,
  Star,
  Users,
  Headphones,
  Shield,
  Zap,
  Heart,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface UserSession {
  id: string
  name: string
  email: string
  phone: string
  isLoggedIn: boolean
  loginTime: string
  userType?: string
}

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  helpful: number
}

export default function CustomerCarePage() {
  const [userSession, setUserSession] = useState<UserSession | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
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

  const faqs: FAQ[] = [
    {
      id: "1",
      question: "How do I generate a QR code?",
      answer:
        "To generate a QR code, go to the main dashboard and click on 'Generate QR Code'. Choose your content type (URL, text, contact, etc.), enter your information, and click 'Generate'. Your QR code will be created instantly!",
      category: "general",
      helpful: 45,
    },
    {
      id: "2",
      question: "How long does payment approval take?",
      answer:
        "Payment receipts are typically reviewed and approved within 2-24 hours during business days (Monday-Friday, 9 AM-6 PM IST). For urgent matters, contact us via WhatsApp.",
      category: "payment",
      helpful: 38,
    },
    {
      id: "3",
      question: "What payment methods do you accept?",
      answer:
        "We accept UPI payments through any UPI-enabled app like Google Pay, PhonePe, Paytm, BHIM, and more. Simply scan our payment QR code and complete the transaction.",
      category: "payment",
      helpful: 42,
    },
    {
      id: "4",
      question: "Can I customize my QR code design?",
      answer:
        "Yes! Premium users can customize QR code colors, add logos, change patterns, and adjust corner styles. Upgrade to a premium plan to access these features.",
      category: "features",
      helpful: 29,
    },
    {
      id: "5",
      question: "How do I scan QR codes?",
      answer:
        "Use our built-in scanner by clicking 'Scan QR Code' on the main page. Point your camera at the QR code and it will automatically detect and process it. You can also use your phone's camera app.",
      category: "general",
      helpful: 51,
    },
    {
      id: "6",
      question: "Is my data secure?",
      answer:
        "We use bank-grade encryption to protect your data. All QR codes and personal information are stored securely, and we never share your data with third parties without your consent.",
      category: "security",
      helpful: 33,
    },
    {
      id: "7",
      question: "Can I track QR code scans?",
      answer:
        "Yes, premium users get detailed analytics including scan counts, locations, devices used, and time stamps. This helps you understand how your QR codes are performing.",
      category: "features",
      helpful: 27,
    },
    {
      id: "8",
      question: "How do I upgrade my plan?",
      answer:
        "Go to 'My Plan' section, choose your desired plan, and complete the payment process. Your account will be upgraded immediately after payment approval.",
      category: "payment",
      helpful: 35,
    },
  ]

  const categories = [
    { id: "all", name: "All Topics", icon: HelpCircle },
    { id: "general", name: "General", icon: Users },
    { id: "payment", name: "Payment", icon: Shield },
    { id: "features", name: "Features", icon: Zap },
    { id: "security", name: "Security", icon: Shield },
  ]

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

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
          <h1 className="text-xl font-bold text-orange-500 tracking-wide">Customer Care</h1>
        </div>
        <div className="w-12 h-12"></div>
      </header>

      <div className="p-4 max-w-4xl mx-auto space-y-6">
        {/* Welcome Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Headphones className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">How can we help you?</h2>
            <p className="text-gray-600 mb-4">
              Welcome {userSession.name}! We're here to provide you with the best support experience.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                <span>4.9/5 Rating</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Contact Options */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-bold text-green-800 mb-2">WhatsApp Support</h3>
              <p className="text-sm text-green-600 mb-3">Get instant help via WhatsApp</p>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => window.open("https://wa.me/918839073733?text=Hi, I need help with Keyra QR App")}
              >
                Chat Now
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Phone className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-bold text-blue-800 mb-2">Call Support</h3>
              <p className="text-sm text-blue-600 mb-3">Speak directly with our team</p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => window.open("tel:+918839073733")}>
                Call +91 8839073733
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Mail className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-bold text-purple-800 mb-2">Email Support</h3>
              <p className="text-sm text-purple-600 mb-3">Send us a detailed message</p>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => window.open("mailto:keyraqrapp@gmail.com?subject=Support Request")}
              >
                Send Email
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Support QR Codes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="w-6 h-6 mr-2 text-orange-500" />
              Quick Access QR Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-green-50 p-4 rounded-lg mb-3">
                  <Image
                    src="/whatsapp-support-qr.png"
                    alt="WhatsApp Support QR"
                    width={120}
                    height={120}
                    className="mx-auto"
                  />
                </div>
                <h4 className="font-semibold text-green-800 mb-1">WhatsApp Support</h4>
                <p className="text-xs text-gray-600">Scan to chat with support</p>
              </div>

              <div className="text-center">
                <div className="bg-blue-50 p-4 rounded-lg mb-3">
                  <Image
                    src="/customer-care-qr.png"
                    alt="Customer Care QR"
                    width={120}
                    height={120}
                    className="mx-auto"
                  />
                </div>
                <h4 className="font-semibold text-blue-800 mb-1">Customer Care</h4>
                <p className="text-xs text-gray-600">Direct access to support</p>
              </div>

              <div className="text-center">
                <div className="bg-purple-50 p-4 rounded-lg mb-3">
                  <Image src="/whatsapp-qr.png" alt="WhatsApp QR" width={120} height={120} className="mx-auto" />
                </div>
                <h4 className="font-semibold text-purple-800 mb-1">General WhatsApp</h4>
                <p className="text-xs text-gray-600">Connect with us anytime</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="w-6 h-6 mr-2 text-orange-500" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="flex items-center gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {category.name}
                    </Button>
                  )
                })}
              </div>

              {/* FAQ List */}
              <div className="space-y-3">
                {filteredFAQs.map((faq) => (
                  <div
                    key={faq.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <button
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">{faq.question}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {faq.category}
                          </Badge>
                          <div className="flex items-center text-xs text-gray-500">
                            <Heart className="w-3 h-3 mr-1" />
                            {faq.helpful} helpful
                          </div>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedFAQ === faq.id ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                        <p className="text-gray-700 leading-relaxed pt-3">{faq.answer}</p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                          <span className="text-xs text-gray-500">Was this helpful?</span>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="text-xs bg-transparent">
                              👍 Yes
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs bg-transparent">
                              👎 No
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredFAQs.length === 0 && (
                <div className="text-center py-8">
                  <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No FAQs found matching your search.</p>
                  <Button
                    variant="outline"
                    className="mt-3 bg-transparent"
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedCategory("all")
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="w-6 h-6 mr-2 text-orange-500" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Support Hours</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span>9:00 AM - 6:00 PM IST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <span>10:00 AM - 4:00 PM IST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span>Closed</span>
                  </div>
                  <div className="flex justify-between font-semibold text-green-600">
                    <span>WhatsApp:</span>
                    <span>24/7 Available</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Contact Details</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">+91 8839073733</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">keyraqrapp@gmail.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">WhatsApp: +91 8839073733</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Still Need Help */}
        <Card className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Still Need Help?</h3>
            <p className="text-orange-100 mb-4">
              Can't find what you're looking for? Our support team is ready to assist you personally.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => router.push("/contact")}
                className="bg-white text-orange-500 hover:bg-gray-100 font-semibold"
              >
                Contact Support
              </Button>
              <Button
                onClick={() => window.open("https://wa.me/918839073733?text=Hi, I need help with Keyra QR App")}
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-orange-500 font-semibold"
              >
                WhatsApp Us
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
