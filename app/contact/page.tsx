"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Phone, Mail, MapPin, MessageCircle, Send, Clock, Users } from "lucide-react"
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

export default function ContactPage() {
  const [userSession, setUserSession] = useState<UserSession | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
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
            // Pre-fill form with user data
            setFormData((prev) => ({
              ...prev,
              name: session.name || "",
              email: session.email || "",
            }))
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Store message in localStorage for admin review
      const messageId = Date.now().toString()
      const messageData = {
        id: messageId,
        ...formData,
        userId: userSession?.id,
        timestamp: new Date().toISOString(),
        status: "unread",
      }

      const existingMessages = JSON.parse(localStorage.getItem("contact-messages") || "[]")
      existingMessages.push(messageData)
      localStorage.setItem("contact-messages", JSON.stringify(existingMessages))

      setSubmitStatus("success")
      setFormData({ name: userSession?.name || "", email: userSession?.email || "", subject: "", message: "" })
    } catch (error) {
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

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
          <h1 className="text-xl font-bold text-orange-500 tracking-wide">Contact Us</h1>
        </div>
        <div className="w-12 h-12"></div>
      </header>

      <div className="p-4 max-w-4xl mx-auto space-y-6">
        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <Phone className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-800 mb-1">Call Us</h3>
              <p className="text-sm text-blue-600">+91 883 907 3733</p>
              <Button
                size="sm"
                className="mt-2 bg-blue-600 hover:bg-blue-700"
                onClick={() => window.open("tel:+918839073733")}
              >
                Call Now
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-green-800 mb-1">WhatsApp</h3>
              <p className="text-sm text-green-600">Quick Support</p>
              <Button
                size="sm"
                className="mt-2 bg-green-600 hover:bg-green-700"
                onClick={() => window.open("https://wa.me/918839073733")}
              >
                Chat Now
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <Mail className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-800 mb-1">Email</h3>
              <p className="text-sm text-purple-600">keyraqrapp@gmail.com</p>
              <Button
                size="sm"
                className="mt-2 bg-purple-600 hover:bg-purple-700"
                onClick={() => window.open("mailto:keyraqrapp@gmail.com")}
              >
                Send Email
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Send className="w-5 h-5 mr-2 text-orange-500" />
              Send us a Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  className="w-full min-h-[120px]"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              {submitStatus === "success" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 text-sm">✅ Message sent successfully! We'll get back to you soon.</p>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm">❌ Failed to send message. Please try again.</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Office Information */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <MapPin className="w-6 h-6 text-orange-500 mr-2" />
              <h3 className="text-xl font-semibold text-gray-800">Our Office</h3>
            </div>

            <div className="space-y-2 mb-4">
              <p className="font-semibold text-gray-800">Keyra QR App Headquarters</p>
              <p className="text-gray-600">Pune, Maharashtra 411001</p>
              <p className="text-gray-600">India</p>
            </div>

            <Button
              variant="outline"
              className="border-2 border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
              onClick={() => window.open("https://maps.google.com/?q=Pune,Maharashtra,India")}
            >
              <MapPin className="w-4 h-4 mr-2" />
              View on Map
            </Button>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Clock className="w-6 h-6 text-blue-500 mr-2" />
              <h3 className="text-xl font-semibold text-gray-800">Business Hours</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Support Hours</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday: 10:00 AM - 4:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Emergency Support</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>WhatsApp: 24/7 Available</p>
                  <p>Email: Response within 24 hours</p>
                  <p>Critical Issues: Call anytime</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-green-500 mr-2" />
              <h3 className="text-xl font-semibold text-gray-800">Quick Help</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-700 text-sm">Payment Issues?</h4>
                  <p className="text-xs text-gray-600">Contact us with your transaction ID</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 text-sm">QR Code Not Working?</h4>
                  <p className="text-xs text-gray-600">Try refreshing or regenerating the code</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-700 text-sm">Account Problems?</h4>
                  <p className="text-xs text-gray-600">We'll help you recover your account</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 text-sm">Feature Requests?</h4>
                  <p className="text-xs text-gray-600">We love hearing your ideas!</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
