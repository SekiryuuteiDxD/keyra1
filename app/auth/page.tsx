"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { QrCode, Users, Crown, Shield, ArrowRight, Sparkles, Settings, Camera, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AuthSelectionPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fillRule=evenodd%3E%3Cg fill=%23ffffff fillOpacity=0.1%3E%3Ccircle cx=30 cy=30 r=4/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        </div>

        <div className="relative z-10 px-4 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl mb-6">
              <QrCode className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Keyra
              </span>
            </h1>
            <p className="text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
              The ultimate QR code platform that connects your digital world with beautiful social experiences
            </p>
            <div className="flex items-center justify-center space-x-2 text-white/80">
              <Sparkles className="w-5 h-5" />
              <span className="text-lg">Choose your access level to continue</span>
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Auth Selection Cards */}
      <div className="px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Customer Card */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-8 text-white">
                  <div className="flex items-center justify-between mb-6">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                      <Users className="w-8 h-8" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">10K+</div>
                      <div className="text-white/80 text-sm">Active Users</div>
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold mb-3">Customer Portal</h2>
                  <p className="text-white/90 text-lg mb-6">
                    Create, scan, and share QR codes with our social platform
                  </p>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center space-x-3">
                      <QrCode className="w-5 h-5 text-white/80" />
                      <span className="text-white/90">Generate QR codes instantly</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Camera className="w-5 h-5 text-white/80" />
                      <span className="text-white/90">Advanced QR scanner</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-white/80" />
                      <span className="text-white/90">Social sharing features</span>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <Button
                    onClick={() => router.push("/auth/customer")}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-2xl py-4 text-lg font-semibold transition-all duration-300 group-hover:scale-105"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Users className="w-6 h-6" />
                      <span>Continue as Customer</span>
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Button>

                  <div className="mt-4 text-center">
                    <p className="text-gray-600 text-sm">Perfect for individuals and small businesses</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admin Card */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-red-500 to-orange-500 p-8 text-white">
                  <div className="flex items-center justify-between mb-6">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                      <Crown className="w-8 h-8" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">99.9%</div>
                      <div className="text-white/80 text-sm">Uptime</div>
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold mb-3">Admin Portal</h2>
                  <p className="text-white/90 text-lg mb-6">
                    Comprehensive platform management and analytics dashboard
                  </p>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-white/80" />
                      <span className="text-white/90">User & employee management</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="w-5 h-5 text-white/80" />
                      <span className="text-white/90">Analytics & reporting</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Settings className="w-5 h-5 text-white/80" />
                      <span className="text-white/90">System configuration</span>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <Button
                    onClick={() => router.push("/auth/admin")}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-2xl py-4 text-lg font-semibold transition-all duration-300 group-hover:scale-105"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Crown className="w-6 h-6" />
                      <span>Continue as Admin</span>
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Button>

                  <div className="mt-4 text-center">
                    <p className="text-gray-600 text-sm">Requires admin key and verification</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Comparison */}
      <div className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Platform Features
            </h2>
            <p className="text-gray-600 text-xl">Everything you need for QR code management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">QR Generation</h3>
              <p className="text-gray-600">
                Create instant QR codes for phone numbers, contacts, URLs, and more with advanced customization options.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="bg-gradient-to-r from-purple-400 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Smart Scanner</h3>
              <p className="text-gray-600">
                Advanced QR code scanning with camera technology, supporting multiple formats and instant actions.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="bg-gradient-to-r from-orange-400 to-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Social Platform</h3>
              <p className="text-gray-600">
                Share moments, connect with friends, and build your digital community with integrated social features.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <QrCode className="w-8 h-8" />
              <span className="text-2xl font-bold">Keyra</span>
            </div>
            <p className="text-gray-400 text-lg mb-6">Connecting your digital world with beautiful experiences</p>
            <div className="flex justify-center space-x-8 text-sm text-gray-400">
              <button className="hover:text-white transition-colors">Privacy Policy</button>
              <button className="hover:text-white transition-colors">Terms of Service</button>
              <button className="hover:text-white transition-colors">Support</button>
              <button className="hover:text-white transition-colors">About</button>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-700 text-center text-sm text-gray-500">
            © 2024 Keyra Technologies. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
