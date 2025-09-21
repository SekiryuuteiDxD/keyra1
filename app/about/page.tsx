"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Menu, QrCode, Smartphone, Users, Shield, Mail, Phone, Globe } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AboutPage() {
  const router = useRouter()

  const features = [
    {
      icon: QrCode,
      title: "QR Code Generation",
      description: "Generate high-quality QR codes for phone numbers, text, and employee data",
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Fully responsive design optimized for mobile devices and tablets",
    },
    {
      icon: Users,
      title: "Employee Management",
      description: "Comprehensive admin panel for managing employees and their QR codes",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with reliable QR code generation",
    },
  ]

  const stats = [
    { number: "10K+", label: "QR Codes Generated" },
    { number: "500+", label: "Active Users" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold text-orange-500">About Keyra</h1>
        <div className="w-10" />
      </header>

      <div className="p-4 space-y-6">
        {/* Hero Section */}
        <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <QrCode className="h-16 w-16 mx-auto" />
              <h2 className="text-3xl font-bold">Keyra</h2>
              <p className="text-lg opacity-90">The ultimate QR code generation and management platform</p>
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle>About Our Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 leading-relaxed">
              Keyra is a comprehensive QR code generation and management platform designed for businesses and
              individuals. Our platform enables seamless creation of QR codes for phone numbers, employee management,
              and digital communication. With our user-friendly interface and powerful admin tools, managing your
              digital presence has never been easier.
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <feature.icon className="h-6 w-6 text-orange-500 mt-1" />
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Our Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-500">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Get in Touch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => (window.location.href = "mailto:support@keyra.com")}
              >
                <Mail className="h-4 w-4 mr-2" />
                support@keyra.com
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => (window.location.href = "tel:+911234567890")}
              >
                <Phone className="h-4 w-4 mr-2" />
                +91 123 456 7890
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.open("https://keyra.com", "_blank")}
              >
                <Globe className="h-4 w-4 mr-2" />
                www.keyra.com
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Version Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-500">
              <p>Keyra v2.1.0</p>
              <p>© 2024 Keyra Technologies. All rights reserved.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
