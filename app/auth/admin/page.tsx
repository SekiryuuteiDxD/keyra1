"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Shield, UserCheck, Lock } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminAuth() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    adminKey: "",
  })

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminKey: "",
    department: "",
  })

  const handleLogin = (e: any) => {
    e.preventDefault()
    e.stopPropagation()

    console.log("Login button clicked")
    console.log("Login data:", loginData)

    if (!loginData.email || !loginData.password || !loginData.adminKey) {
      alert("Please fill in all fields including admin key")
      return false
    }

    console.log("Admin key entered:", loginData.adminKey)
    console.log("Expected key: solvixgoat")

    // Simple admin key validation (in real app, this would be server-side)
    if (loginData.adminKey !== "solvixgoat") {
      alert("Invalid admin key. Access denied.")
      return false
    }

    setIsLoading(true)
    console.log("Starting authentication process...")

    // Simulate API call
    setTimeout(() => {
      try {
        // Store admin session
        const userData = {
          id: Date.now().toString(),
          name: "Admin User",
          email: loginData.email,
          isLoggedIn: true,
          userType: "admin",
          permissions: ["manage_users", "view_analytics", "system_settings", "employee_management"],
          loginTime: new Date().toISOString(),
        }

        localStorage.setItem("keyra-user-session", JSON.stringify(userData))
        console.log("Session stored successfully:", userData)
        console.log("Redirecting to admin panel...")

        // Use Next.js router for navigation
        router.push("/admin")

        // Fallback navigation after a short delay
        setTimeout(() => {
          if (window.location.pathname !== "/admin") {
            console.log("Router navigation failed, using window.location...")
            window.location.href = "/admin"
          }
        }, 1000)
      } catch (error) {
        console.error("Error during login:", error)
        alert("Login failed. Please try again.")
        setIsLoading(false)
      }
    }, 2000)

    return false
  }

  const handleSignup = (e: any) => {
    e.preventDefault()
    e.stopPropagation()

    console.log("Signup button clicked")
    console.log("Signup data:", signupData)

    if (
      !signupData.name ||
      !signupData.email ||
      !signupData.password ||
      !signupData.adminKey ||
      !signupData.department
    ) {
      alert("Please fill in all fields")
      return false
    }

    if (signupData.password !== signupData.confirmPassword) {
      alert("Passwords don't match")
      return false
    }

    if (signupData.password.length < 8) {
      alert("Admin password must be at least 8 characters")
      return false
    }

    console.log("Admin key entered:", signupData.adminKey)
    console.log("Expected key: solvixgoat")

    // Simple admin key validation (in real app, this would be server-side)
    if (signupData.adminKey !== "solvixgoat") {
      alert("Invalid admin key. Access denied.")
      return false
    }

    setIsLoading(true)
    console.log("Starting signup process...")

    // Simulate API call
    setTimeout(() => {
      try {
        // Store admin session
        const userData = {
          id: Date.now().toString(),
          name: signupData.name,
          email: signupData.email,
          department: signupData.department,
          isLoggedIn: true,
          userType: "admin",
          permissions: ["manage_users", "view_analytics", "system_settings", "employee_management"],
          loginTime: new Date().toISOString(),
        }

        localStorage.setItem("keyra-user-session", JSON.stringify(userData))
        console.log("Session stored successfully:", userData)
        console.log("Redirecting to admin panel...")

        // Use Next.js router for navigation
        router.push("/admin")

        // Fallback navigation after a short delay
        setTimeout(() => {
          if (window.location.pathname !== "/admin") {
            console.log("Router navigation failed, using window.location...")
            window.location.href = "/admin"
          }
        }, 1000)
      } catch (error) {
        console.error("Error during signup:", error)
        alert("Signup failed. Please try again.")
        setIsLoading(false)
      }
    }, 2000)

    return false
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Admin Portal
          </CardTitle>
          <p className="text-gray-600 text-sm">Secure access to Keyra QR management</p>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Register
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="loginEmail">Email Address</Label>
                  <Input
                    id="loginEmail"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    placeholder="admin@keyra.com"
                    className="mt-1"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <Label htmlFor="loginPassword">Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="loginPassword"
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      placeholder="Enter your password"
                      autoComplete="off"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowPassword(!showPassword)
                      }}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="loginAdminKey">Admin Access Key</Label>
                  <Input
                    id="loginAdminKey"
                    type="password"
                    value={loginData.adminKey}
                    onChange={(e) => setLoginData({ ...loginData, adminKey: e.target.value })}
                    placeholder="Enter admin access key"
                    className="mt-1"
                    autoComplete="off"
                  />
                  <p className="text-xs text-gray-500 mt-1">Required for admin access verification</p>
                </div>

                <Button
                  type="button"
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-2.5"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Authenticating...
                    </div>
                  ) : (
                    "Login to Admin Panel"
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="signupName">Full Name</Label>
                  <Input
                    id="signupName"
                    type="text"
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="mt-1"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <Label htmlFor="signupEmail">Email Address</Label>
                  <Input
                    id="signupEmail"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    placeholder="admin@keyra.com"
                    className="mt-1"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <Label htmlFor="signupPassword">Password</Label>
                  <Input
                    id="signupPassword"
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    placeholder="Create a strong password"
                    className="mt-1"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                    className="mt-1"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <Label htmlFor="signupAdminKey">Admin Access Key</Label>
                  <Input
                    id="signupAdminKey"
                    type="password"
                    value={signupData.adminKey}
                    onChange={(e) => setSignupData({ ...signupData, adminKey: e.target.value })}
                    placeholder="Enter admin access key"
                    className="mt-1"
                    autoComplete="off"
                  />
                  <p className="text-xs text-gray-500 mt-1">Contact system administrator for access key</p>
                </div>

                <div>
                  <Label htmlFor="signupDepartment">Department</Label>
                  <Input
                    id="signupDepartment"
                    type="text"
                    value={signupData.department}
                    onChange={(e) => setSignupData({ ...signupData, department: e.target.value })}
                    placeholder="Enter your department"
                    className="mt-1"
                    autoComplete="off"
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleSignup}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-2.5"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating Account...
                    </div>
                  ) : (
                    "Create Admin Account"
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-center text-xs text-gray-500 space-y-1">
              <p>🔒 Secure admin authentication</p>
              <p>Access key required for verification</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
