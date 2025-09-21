"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Mail, Phone, Lock, User, Sparkles, QrCode, Camera, Users, Shield, ArrowRight, CheckCircle, ArrowLeft } from 'lucide-react'
import { useRouter } from "next/navigation"
import { registerUser, loginUser } from "@/lib/auth-service"

export default function CustomerAuthPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginData, setLoginData] = useState({
    emailOrPhone: "",
    password: "",
  })
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const router = useRouter()

  const validateName = (name: string): boolean => {
    if (!name.trim()) return false
    const nameParts = name.trim().split(/\s+/)
    if (nameParts.length < 2) return false
    if (nameParts.some((part) => part.length < 2)) return false
    if (!/^[a-zA-Z\s]+$/.test(name)) return false
    return true
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/
    const cleanPhone = phone.replace(/\D/g, "")
    return phoneRegex.test(cleanPhone)
  }

  const handleLogin = async () => {
    if (!loginData.emailOrPhone || !loginData.password) {
      alert("Please fill in all fields")
      return
    }

    if (!validateEmail(loginData.emailOrPhone) && !validatePhone(loginData.emailOrPhone)) {
      alert("Please enter a valid email address or phone number")
      return
    }

    if (loginData.password.length < 6) {
      alert("Password must be at least 6 characters long")
      return
    }

    setIsLoading(true)

    try {
      const { user, sessionToken, error } = await loginUser(
        loginData.emailOrPhone,
        loginData.password
      )

      if (error) {
        alert(`Login failed: ${error}`)
        return
      }

      if (user && sessionToken) {
        // Store session data
        const sessionData = {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isLoggedIn: true,
          userType: user.userType,
          loginTime: new Date().toISOString(),
          sessionToken: sessionToken
        }

        localStorage.setItem("keyra-user-session", JSON.stringify(sessionData))
        
        // Redirect based on user type
        if (user.userType === 'admin') {
          router.push("/admin")
        } else {
          router.push("/")
        }
      }
    } catch (error: any) {
      console.error("Login error:", error)
      alert("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async () => {
    if (!signupData.name || !signupData.email || !signupData.phone || !signupData.password) {
      alert("Please fill in all fields")
      return
    }

    if (!validateName(signupData.name)) {
      alert("Please enter a valid full name (first and last name, letters only)")
      return
    }

    if (!validateEmail(signupData.email)) {
      alert("Please enter a valid email address")
      return
    }

    if (!validatePhone(signupData.phone)) {
      alert("Please enter a valid Indian mobile number (10 digits starting with 6-9)")
      return
    }

    if (signupData.password !== signupData.confirmPassword) {
      alert("Passwords don't match")
      return
    }

    if (signupData.password.length < 6) {
      alert("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      const { user, error } = await registerUser({
        name: signupData.name,
        email: signupData.email,
        phone: signupData.phone,
        password: signupData.password,
        userType: 'customer'
      })

      if (error) {
        alert(`Registration failed: ${error}`)
        return
      }

      if (user) {
        // Auto-login after successful registration
        const { user: logedUser, sessionToken, error: loginError } = await loginUser(
          signupData.email,
          signupData.password
        )

        if (loginError || !logedUser || !sessionToken) {
          alert("Registration successful! Please login.")
          return
        }

        // Store session data
        const sessionData = {
          id: logedUser.id,
          name: logedUser.name,
          email: logedUser.email,
          phone: logedUser.phone,
          isLoggedIn: true,
          userType: logedUser.userType,
          loginTime: new Date().toISOString(),
          sessionToken: sessionToken
        }

        localStorage.setItem("keyra-user-session", JSON.stringify(sessionData))
        router.push("/")
      }
    } catch (error: any) {
      console.error("Registration error:", error)
      alert("Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: QrCode,
      title: "QR Code Generation",
      description: "Create instant QR codes for phone numbers and contact info",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Camera,
      title: "Smart Scanner",
      description: "Scan QR codes with advanced camera technology",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Users,
      title: "Social Platform",
      description: "Share moments and connect with friends",
      color: "from-green-500 to-blue-500",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security",
      color: "from-orange-500 to-red-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fillRule=evenodd%3E%3Cg fill=%23ffffff fillOpacity=0.1%3E%3Ccircle cx=30 cy=30 r=4/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        </div>

        <div className="relative z-10 px-4 py-8">
          {/* Back Button */}
          <div className="mb-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/auth")}
              className="text-white hover:bg-white/20 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Auth Selection
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Customer Portal</h1>
            <p className="text-lg text-white/90 max-w-xl mx-auto leading-relaxed">
              Join thousands of users creating and sharing QR codes with Keyra
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300"
              >
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r ${feature.color} rounded-lg mb-3`}
                >
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{feature.title}</h3>
                <p className="text-white/80 text-xs">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auth Section */}
      <div className="px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <Tabs defaultValue="login" className="w-full">
                {/* Tab Headers */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-1 rounded-t-3xl">
                  <TabsList className="grid w-full grid-cols-2 bg-transparent p-1">
                    <TabsTrigger
                      value="login"
                      className="rounded-2xl data-[state=active]:bg-white data-[state=active]:text-blue-600 text-white/80 font-semibold"
                    >
                      Login
                    </TabsTrigger>
                    <TabsTrigger
                      value="signup"
                      className="rounded-2xl data-[state=active]:bg-white data-[state=active]:text-blue-600 text-white/80 font-semibold"
                    >
                      Sign Up
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Login Tab */}
                <TabsContent value="login" className="p-8 space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      Welcome Back!
                    </h2>
                    <p className="text-gray-600">Sign in to your customer account</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-bold text-gray-700">Email or Phone Number</Label>
                      <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          {loginData.emailOrPhone.includes("@") ? (
                            <Mail className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Phone className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <Input
                          type="text"
                          placeholder="Enter email or phone number"
                          value={loginData.emailOrPhone}
                          onChange={(e) => setLoginData({ ...loginData, emailOrPhone: e.target.value })}
                          className="pl-10 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-bold text-gray-700">Password</Label>
                      <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          className="pl-10 pr-10 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      onClick={handleLogin}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl py-3 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Signing In...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>Sign In</span>
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </Button>

                    <div className="text-center">
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Forgot your password?
                      </button>
                    </div>
                  </div>
                </TabsContent>

                {/* Signup Tab */}
                <TabsContent value="signup" className="p-8 space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      Join Keyra!
                    </h2>
                    <p className="text-gray-600">Create your customer account</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-bold text-gray-700">Full Name</Label>
                      <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          type="text"
                          placeholder="Enter your full name"
                          value={signupData.name}
                          onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                          className="pl-10 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Enter first and last name (letters only)</p>
                    </div>

                    <div>
                      <Label className="text-sm font-bold text-gray-700">Email Address</Label>
                      <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                          className="pl-10 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">We'll use this for account verification</p>
                    </div>

                    <div>
                      <Label className="text-sm font-bold text-gray-700">Phone Number</Label>
                      <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          type="tel"
                          placeholder="+91 9876543210"
                          value={signupData.phone}
                          onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                          className="pl-10 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">10-digit Indian mobile number</p>
                    </div>

                    <div>
                      <Label className="text-sm font-bold text-gray-700">Password</Label>
                      <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          className="pl-10 pr-10 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                    </div>

                    <div>
                      <Label className="text-sm font-bold text-gray-700">Confirm Password</Label>
                      <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={signupData.confirmPassword}
                          onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                          className="pl-10 pr-10 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Must match your password</p>
                    </div>

                    <Button
                      onClick={handleSignup}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl py-3 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Creating Account...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>Create Account</span>
                          <Sparkles className="w-5 h-5" />
                        </div>
                      )}
                    </Button>

                    <div className="text-center text-xs text-gray-600">
                      By signing up, you agree to our{" "}
                      <button className="text-blue-600 hover:text-blue-700 font-medium">Terms of Service</button> and{" "}
                      <button className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="px-4 pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3">
              Customer Benefits
            </h2>
            <p className="text-gray-600">Everything you need for QR code management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 w-12 h-12 rounded-xl flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Easy QR Creation</h3>
              <p className="text-gray-600 text-sm">
                Generate QR codes for phone numbers, contacts, and more in seconds.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="bg-gradient-to-r from-blue-400 to-cyan-500 w-12 h-12 rounded-xl flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Advanced Scanner</h3>
              <p className="text-gray-600 text-sm">Scan any QR code with our advanced camera technology.</p>
            </div>

            <div className="text-center space-y-3">
              <div className="bg-gradient-to-r from-cyan-400 to-teal-500 w-12 h-12 rounded-xl flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Social Features</h3>
              <p className="text-gray-600 text-sm">Connect with friends and share your QR codes socially.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
