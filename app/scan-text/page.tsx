"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Menu, Copy, Lightbulb, MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ScanTextPage() {
  const router = useRouter()

  const handleOpenWhatsApp = () => {
    // Replace with actual WhatsApp number
    window.location.href = "https://wa.me/911234567890"
  }

  const handleCopyWhatsAppNumber = () => {
    navigator.clipboard.writeText("+91 123 456 7890")
    alert("📋 WhatsApp number copied!")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold text-orange-500">Scan Text</h1>
        <div className="w-10" />
      </header>

      <div className="p-4 space-y-8">
        {/* WhatsApp Customer Service Section */}
        <div className="text-center space-y-6">
          {/* Header */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-green-100 p-2 rounded-full">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-600">WhatsApp Support</h2>
          </div>

          {/* Description */}
          <p className="text-green-600 text-lg font-medium mb-8">
            Prefer to chat? Scan our WhatsApp QR code to message our support team!
          </p>

          {/* QR Code Card */}
          <Card className="bg-white border-2 border-green-200 rounded-3xl shadow-lg overflow-hidden mx-auto max-w-sm">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className="bg-gray-50 p-6 rounded-2xl">
                  <img
                    src="/whatsapp-support-qr.png"
                    alt="WhatsApp QR Code"
                    className="w-48 h-48 mx-auto"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
                <p className="text-sm text-gray-600 font-medium">WhatsApp Support QR Code</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Support Access */}
          <div className="space-y-4 mt-8">
            <div className="flex items-center justify-center gap-2">
              <div className="bg-green-100 p-1 rounded-full">
                <MessageSquare className="h-4 w-4 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-green-600">Text-Based Support</h3>
            </div>

            <p className="text-green-600 text-sm leading-relaxed">
              Scan this code to open WhatsApp and start chatting with our customer service team instantly.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center mt-8">
            <Button
              onClick={handleOpenWhatsApp}
              className="bg-green-600 hover:bg-green-700 text-white rounded-2xl px-6 py-3 flex items-center gap-2 font-semibold"
            >
              <MessageSquare className="h-4 w-4" />
              Open WhatsApp
            </Button>
            <Button
              onClick={handleCopyWhatsAppNumber}
              variant="outline"
              className="border-2 border-green-300 text-green-600 hover:bg-green-50 rounded-2xl px-6 py-3 flex items-center gap-2 font-semibold"
            >
              <Copy className="h-4 w-4" />
              Copy Number
            </Button>
          </div>

          {/* Pro Tip */}
          <Card className="bg-green-50 border-2 border-green-200 rounded-2xl mt-8">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 text-left">
                <div className="bg-yellow-100 p-1 rounded-full mt-1">
                  <Lightbulb className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <span className="font-bold text-green-800">Pro Tip:</span>
                  <span className="text-green-700 text-sm ml-1">
                    WhatsApp support is available 24/7 for all your questions and assistance needs!
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
