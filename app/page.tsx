"use client"

import { useState, useEffect } from "react"
import { verifySession, updateUserProfile, saveUserQRCode, getUserQRCodes } from "@/lib/auth-service"
import type { User, UserProfile } from "@/lib/auth-service"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, ChevronDown, LogOut, Settings, Search, QrCode, Menu, Loader2, Download, Share2, Copy, Printer, MessageSquare, Camera } from 'lucide-react'
import QRCode from "qrcode"
import { useRouter } from "next/navigation"

interface UserSession extends User {
  isLoggedIn: boolean
  loginTime: string
  sessionToken: string
}

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [userSession, setUserSession] = useState<UserSession | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [formData, setFormData] = useState({
    details: "",
    name: "",
    address: "",
    phone: "",
    employeeCode: "",
    planType: "single",
  })
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [generatedId, setGeneratedId] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const sessionData = localStorage.getItem("keyra-user-session")
        if (sessionData) {
          const session = JSON.parse(sessionData)
          if (session.isLoggedIn && session.sessionToken) {
            // Verify session with database
            const { user, profile, error } = await verifySession(session.sessionToken)
            
            if (error || !user) {
              console.error("Session verification failed:", error)
              localStorage.removeItem("keyra-user-session")
              router.push("/auth")
              return
            }

            // Update session with fresh data
            const updatedSession = {
              ...session,
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              userType: user.userType
            }
            
            setUserSession(updatedSession)
            localStorage.setItem("keyra-user-session", JSON.stringify(updatedSession))

            // Load user profile data for form pre-filling
            if (profile) {
              setFormData((prev) => ({
                ...prev,
                name: user.name || "",
                phone: user.phone || "",
                address: profile.address || "",
                employeeCode: profile.employeeCode || "",
                planType: profile.planType || "single",
              }))
            } else {
              // Pre-fill form with user data if no profile
              setFormData((prev) => ({
                ...prev,
                name: user.name || "",
                phone: user.phone || "",
              }))
            }
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

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth <= 768 ||
          /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      )
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Prevent zoom on input focus (mobile)
  useEffect(() => {
    if (isMobile) {
      const viewport = document.querySelector('meta[name="viewport"]')
      if (viewport) {
        viewport.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no")
      }
    }
  }, [isMobile])

  // Show loading screen while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <QrCode className="w-10 h-10 text-white" />
          </div>
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Loading Keyra...
          </h2>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!userSession) {
    return null
  }

  const generateUniqueId = () => {
    const timestamp = Date.now().toString()
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `KYR-${timestamp.slice(-6)}${randomNum.slice(-3)}`
  }

  const generateQR = async () => {
    if (!formData.phone.trim()) {
      alert("📱 Please enter a phone number")
      return
    }

    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    setIsGenerating(true)
    try {
      const newId = generateUniqueId()
      setGeneratedId(newId)

      let formattedNumber = formData.phone.trim()
      formattedNumber = formattedNumber.replace(/[\s\-()]/g, "")

      if (!formattedNumber.startsWith("+")) {
        formattedNumber = `+${formattedNumber}`
      }

      const qrData = `tel:${formattedNumber}`

      const url = await QRCode.toDataURL(qrData, {
        width: isMobile ? 400 : 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      })

      setQrCodeUrl(url)

      if (!formData.employeeCode) {
        const newEmployeeCode = `EMP${Date.now().toString().slice(-6)}`
        setFormData((prev) => ({ ...prev, employeeCode: newEmployeeCode }))
      }

      // Save QR code to database
      if (userSession) {
        await saveUserQRCode(userSession.id, {
          qrCodeId: newId,
          qrData: qrData,
          qrType: 'phone',
          qrImageUrl: url,
          metadata: {
            name: formData.name,
            address: formData.address,
            phone: formData.phone,
            employeeCode: formData.employeeCode,
            planType: formData.planType,
            details: formData.details
          }
        })

        // Update user profile
        await updateUserProfile(userSession.id, {
          address: formData.address,
          employeeCode: formData.employeeCode,
          planType: formData.planType
        })
      }

      // Success haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100])
      }
    } catch (error) {
      console.error("Error generating QR code:", error)
      alert("❌ Failed to generate QR code. Please try again.")

      // Error haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200])
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleScanToCall = () => {
    router.push("/simple-scanner")
  }

  const handleScanToText = () => {
    router.push("/scan-text")
  }

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      if (userSession?.sessionToken) {
        // Logout from database
        const { logoutUser } = await import("@/lib/auth-service")
        await logoutUser(userSession.sessionToken)
      }
      localStorage.removeItem("keyra-user-session")
      router.push("/auth")
    }
  }

  const handleDownload = async () => {
    if (!qrCodeUrl) {
      alert("📱 No QR code to download. Please generate one first.")
      return
    }

    try {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      canvas.width = 400
      canvas.height = 500

      const imageLoadPromise = new Promise((resolve) => {
        img.onload = () => {
          // White background
          ctx.fillStyle = "white"
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          // Header
          ctx.fillStyle = "#000"
          ctx.font = "bold 24px Arial"
          ctx.textAlign = "center"
          ctx.fillText("Keyra", canvas.width / 2, 40)

          ctx.font = "14px Arial"
          ctx.fillText("ID Number", canvas.width / 2, 65)

          ctx.font = "bold 16px monospace"
          ctx.fillText(generatedId, canvas.width / 2, 90)

          // QR Code
          const qrSize = 250
          const qrX = (canvas.width - qrSize) / 2
          const qrY = 110
          ctx.drawImage(img, qrX, qrY, qrSize, qrSize)

          // Details (hide phone number)
          ctx.font = "12px Arial"
          ctx.textAlign = "left"
          const detailsY = qrY + qrSize + 30
          ctx.fillText(`Name: ${formData.name || "Not provided"}`, 20, detailsY)
          ctx.fillText(`Address: ${formData.address || "Not provided"}`, 20, detailsY + 20)
          ctx.fillText(`Phone: [Hidden - Scan QR to Call]`, 20, detailsY + 40)
          ctx.fillText(`Quote: ${formData.details || "Any problem scan & call"}`, 20, detailsY + 60)

          resolve(canvas.toDataURL("image/png", 1.0))
        }
      })

      img.src = qrCodeUrl
      const downloadUrl = await imageLoadPromise

      // Create download link
      const link = document.createElement("a")
      link.download = `keyra-qr-${generatedId}.png`
      link.href = downloadUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Success feedback
      if (navigator.vibrate) {
        navigator.vibrate(100)
      }
      alert("📥 QR Code downloaded successfully!")
    } catch (error) {
      console.error("Download error:", error)
      alert("❌ Failed to download. Please try again.")
    }
  }

  const handleMobileShare = async () => {
    if (!qrCodeUrl) {
      alert("📱 No QR code to share. Please generate one first.")
      return
    }

    try {
      if (navigator.share) {
        // Convert to blob for sharing
        const response = await fetch(qrCodeUrl)
        const blob = await response.blob()
        const file = new File([blob], `keyra-qr-${generatedId}.png`, { type: "image/png" })

        await navigator.share({
          title: `Keyra QR Code - ${generatedId}`,
          text: `📱 My QR code for ${formData.name || formData.phone}`,
          files: [file],
        })
      } else {
        // Fallback to copy
        handleCopy()
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        handleCopy()
      }
    }
  }

  const handleCopy = async () => {
    if (!qrCodeUrl) {
      alert("📱 No QR code to copy. Please generate one first.")
      return
    }

    try {
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()

      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
        alert("📋 QR Code copied to clipboard!")
      } else {
        const textToCopy = `Keyra QR Code
Name: ${formData.name || "Not provided"}
Address: ${formData.address || "Not provided"}
Phone: [Hidden - Scan QR to Call]
ID: ${generatedId}`
        await navigator.clipboard.writeText(textToCopy)
        alert("📋 QR Code details copied!")
      }

      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    } catch (error) {
      alert("❌ Unable to copy. Please use the download option.")
    }
  }

  const handleMobilePrint = () => {
    if (!qrCodeUrl) {
      alert("📱 No QR code to print. Please generate one first.")
      return
    }

    // On mobile, download is often better than print
    if (isMobile) {
      const choice = confirm(
        "📱 On mobile, downloading works better than printing. Would you like to download instead?",
      )
      if (choice) {
        handleDownload()
        return
      }
    }

    // Simplified mobile print
    const printContent = `
      <div style="text-align: center; padding: 20px; font-family: Arial;">
        <h1 style="margin: 0;">Keyra</h1>
        <p>ID: ${generatedId}</p>
        <img src="${qrCodeUrl}" style="width: 200px; height: 200px; margin: 20px 0;">
        <p><strong>Name:</strong> ${formData.name || "Not provided"}</p>
        <p><strong>Address:</strong> ${formData.address || "Not provided"}</p>
        <p><strong>Phone:</strong> ${formData.phone}</p>
        <p><strong>Quote:</strong> ${formData.details || "Any problem scan & call"}</p>
      </div>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Print QR Code</title></head>
          <body>${printContent}</body>
          <script>window.print(); window.close();</script>
        </html>
      `)
      printWindow.document.close()
    } else {
      alert("📱 Please allow popups for printing, or use download instead.")
    }
  }

  const menuItems = [
    { name: "🏠 Home", path: "/" },
    { name: "📱 QR Generate", path: "/" },
    { name: "📷 Scan QR", action: handleScanToCall },
    { name: "💬 Scan Message", action: handleScanToText },
    { name: "📞 Customer Care", path: "/customer-care" },
    { name: "🌟 Social", path: "/social" },
    { name: "👤 Profile", path: "/profile" },
    { name: "💳 My Plan", path: "/plan" },
    { name: "💰 Payment & Billing", path: "/payment" },
    { name: "📄 Terms & Conditions", path: "/terms" },
    { name: "🔄 Refund Policy", path: "/refund" },
    { name: "ℹ️ About Us", path: "/about-us" },
    { name: "🛡️ Privacy Policy", path: "/privacy" },
    { name: "📞 Contact Us", path: "/contact" },
    { name: "⚙️ Settings", path: "/settings" },
    { name: "🚪 Logout", action: handleLogout },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Mobile-Optimized Header */}
      <header className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-50 border-b border-gray-200">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="h-12 w-12 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <div className="text-center">
          <h1 className="text-xl font-bold text-orange-500 tracking-wide">Keyra</h1>
          <p className="text-xs text-gray-500">Welcome, {userSession.name}!</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(userSession?.userType === "admin" ? "/admin" : "/settings")}
          className="h-12 w-12 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <Settings className="h-6 w-6" />
        </Button>
      </header>

      {/* Mobile Side Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setIsMenuOpen(false)}>
          <div
            className="bg-white w-80 h-full p-6 transform transition-transform duration-300 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Menu</h2>
                <p className="text-sm text-gray-600">Hello, {userSession.name}!</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(false)}
                className="h-10 w-10 rounded-full"
              >
                ✕
              </Button>
            </div>
            <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-200px)] pb-4">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  className={`block w-full text-left py-4 px-4 text-lg hover:bg-gray-100 rounded-xl transition-colors active:bg-gray-200 ${
                    item.name.includes("Logout") ? "text-red-600 hover:bg-red-50" : ""
                  } ${item.name.includes("Payment") ? "bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 font-semibold" : ""}`}
                  onClick={() => {
                    if (item.action) {
                      item.action()
                    } else if (item.path) {
                      router.push(item.path)
                    }
                    setIsMenuOpen(false)
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Button variant="ghost">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 lg:h-10 lg:w-10">
                  <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Avatar className="mr-2 h-6 w-6 lg:h-8 lg:w-8">
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {menuItems.slice(10, -1).map((item, index) => (
                  <DropdownMenuItem key={index} onClick={item.action || (() => router.push(item.path))}>
                    {item.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-md mx-auto">
        {/* Mobile Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-3 bg-gray-100 border-none rounded-2xl text-lg focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all"
          />
        </div>

        {/* Action Buttons Row - Adjusted to fit in one frame */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={generateQR}
            disabled={isGenerating}
            className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white rounded-2xl px-3 py-3 flex flex-col items-center gap-1 shadow-lg active:scale-95 transition-all min-h-[80px]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-xs font-medium">Generating...</span>
              </>
            ) : (
              <>
                <QrCode className="h-5 w-5" />
                <span className="text-xs font-medium text-center leading-tight">Generate QR</span>
              </>
            )}
          </Button>

          <Button
            onClick={handleScanToCall}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl px-3 py-3 flex flex-col items-center gap-1 shadow-lg active:scale-95 transition-all min-h-[80px]"
          >
            <Camera className="h-5 w-5" />
            <span className="text-xs font-medium text-center leading-tight">Scan QR</span>
          </Button>

          <Button
            onClick={handleScanToText}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-2xl px-3 py-3 flex flex-col items-center gap-1 shadow-lg active:scale-95 transition-all min-h-[80px]"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs font-medium text-center leading-tight">Scan to Text</span>
          </Button>
        </div>

        {/* Mobile Form Section */}
        <div className="space-y-6">
          <div>
            <Label htmlFor="form" className="text-lg font-semibold text-gray-700 mb-2 block">
              📝 Quote
            </Label>
            <Textarea
              id="form"
              placeholder="Enter your quote here..."
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              className="min-h-[100px] text-lg rounded-xl border-2 border-gray-200 focus:border-orange-500 transition-colors resize-none"
            />
          </div>

          <div>
            <Label htmlFor="name" className="text-lg font-semibold text-gray-700 mb-2 block">
              👤 Name
            </Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <Label htmlFor="address" className="text-lg font-semibold text-gray-700 mb-2 block">
              🏠 Address
            </Label>
            <Textarea
              id="address"
              placeholder="Enter your address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="min-h-[80px] text-lg rounded-xl border-2 border-gray-200 focus:border-orange-500 transition-colors resize-none"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-lg font-semibold text-orange-600 mb-2 block">
              📱 Phone Number *
            </Label>
            <Input
              id="phone"
              placeholder="+91 9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="py-3 text-lg rounded-xl border-2 border-orange-300 focus:border-orange-500 transition-colors"
              type="tel"
              inputMode="tel"
            />
            <p className="text-sm text-gray-600 mt-2 px-2">💡 Include country code (e.g., +91 for India, +1 for US)</p>
          </div>

          {/* Mobile Payment Plans */}
          <div>
            <Label className="text-lg font-semibold text-gray-700 mb-3 block">💳 Choose Plan</Label>
            <RadioGroup
              value={formData.planType}
              onValueChange={(value) => setFormData({ ...formData, planType: value })}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-orange-300 transition-colors">
                <RadioGroupItem value="single" id="single" className="h-5 w-5" />
                <Label htmlFor="single" className="flex-1 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold">Single Person</span>
                      <p className="text-sm text-gray-600">Individual use</p>
                    </div>
                    <span className="text-orange-600 font-bold">₹50</span>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-orange-300 transition-colors">
                <RadioGroupItem value="franchise" id="franchise" className="h-5 w-5" />
                <Label htmlFor="franchise" className="flex-1 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold">Franchise</span>
                      <p className="text-sm text-gray-600">Small business</p>
                    </div>
                    <span className="text-orange-600 font-bold">₹500</span>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-orange-300 transition-colors">
                <RadioGroupItem value="office" id="office" className="h-5 w-5" />
                <Label htmlFor="office" className="flex-1 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold">Office</span>
                      <p className="text-sm text-gray-600">Enterprise</p>
                    </div>
                    <span className="text-orange-600 font-bold">₹10,000</span>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="employeeCode" className="text-lg font-semibold text-gray-700 mb-2 block">
              🏷️ Employee Code
            </Label>
            <Input
              id="employeeCode"
              placeholder="Auto-generated if empty"
              value={formData.employeeCode}
              onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
              className="py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Bottom Generate QR Button */}
          <div className="pt-4">
            <Button
              onClick={generateQR}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white rounded-2xl py-4 text-lg font-semibold shadow-lg active:scale-95 transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin mr-3" />
                  Generating QR Code...
                </>
              ) : (
                <>
                  <QrCode className="h-6 w-6 mr-3" />
                  Generate QR Code
                </>
              )}
            </Button>
            <p className="text-center text-sm text-gray-600 mt-3 px-2">
              💡 Fill in your phone number and quote to generate your personal QR code
            </p>
          </div>

          {/* Mobile QR Code Display */}
          {qrCodeUrl && (
            <Card className="bg-white border-2 border-gray-300 rounded-3xl shadow-lg overflow-hidden">
              <CardContent className="p-6">
                <div className="text-center space-y-6">
                  {/* Header */}
                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold text-black">Keyra</h2>
                    <p className="text-gray-600 font-medium">ID Number</p>
                    <div className="border-t-2 border-gray-200 pt-3">
                      <p className="text-xl font-mono font-bold text-black tracking-wider bg-gray-100 py-2 px-4 rounded-lg inline-block">
                        {generatedId}
                      </p>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center py-4">
                    <div className="bg-white p-4 rounded-2xl shadow-inner border-2 border-gray-200">
                      <img
                        src={qrCodeUrl || "/placeholder.svg"}
                        alt="Generated QR Code"
                        className="w-64 h-64 mx-auto"
                        style={{ imageRendering: "pixelated" }}
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 text-left bg-gray-50 p-4 rounded-2xl">
                    <p className="text-base text-black">
                      <span className="font-semibold">👤 Name:</span> {formData.name || "Not provided"}
                    </p>
                    <p className="text-base text-black">
                      <span className="font-semibold">🏠 Address:</span> {formData.address || "Not provided"}
                    </p>
                    <p className="text-base text-black">
                      <span className="font-semibold">📱 Phone:</span>{" "}
                      <span className="font-mono bg-gray-200 px-2 py-1 rounded">Hidden for privacy</span>
                    </p>
                    <p className="text-base text-black">
                      <span className="font-semibold">💬 Quote:</span> {formData.details || "Any problem scan & call"}
                    </p>
                  </div>

                  {/* Privacy Notice */}
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 text-left">
                    <p className="text-sm text-purple-800 font-medium">
                      🔒 <strong>Privacy Protected:</strong> Your phone number is hidden but encoded in the QR code.
                      Only people who scan the code can access it.
                    </p>
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <Button
                      onClick={handleDownload}
                      className="bg-green-500 hover:bg-green-600 text-white rounded-xl py-3 active:scale-95 transition-all"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={handleMobileShare}
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-3 active:scale-95 transition-all"
                    >
                      <Share2 className="h-5 w-5 mr-2" />
                      Share
                    </Button>
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      className="border-2 border-gray-300 rounded-xl py-3 active:scale-95 transition-all"
                    >
                      <Copy className="h-5 w-5 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={handleMobilePrint}
                      variant="outline"
                      className="border-2 border-gray-300 rounded-xl py-3 active:scale-95 transition-all"
                    >
                      <Printer className="h-5 w-5 mr-2" />
                      Print
                    </Button>
                  </div>

                  {/* Mobile Instructions */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 text-left">
                    <p className="text-sm text-blue-800 font-medium">
                      📱 <strong>How to use:</strong> Open your phone's camera app and point it at the QR code to
                      instantly call {formData.name || "this contact"}!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default HomePage
