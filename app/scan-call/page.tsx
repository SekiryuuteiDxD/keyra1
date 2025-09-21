"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Menu,
  Camera,
  Phone,
  Flashlight,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Settings,
  Bug,
  Copy,
  MessageSquare,
  User,
  Globe,
  Mail,
} from "lucide-react"
import { useRouter } from "next/navigation"
import jsQR from "jsqr"

interface QRResult {
  data: string
  type: "phone" | "contact" | "url" | "email" | "text" | "other"
  phoneNumber?: string
  contactInfo?: any
}

const icons = {
  phone: Phone,
  contact: User,
  url: Globe,
  email: Mail,
  text: MessageSquare,
}

export default function ScanCallPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [qrResult, setQrResult] = useState<QRResult | null>(null)
  const [error, setError] = useState("")
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [flashOn, setFlashOn] = useState(false)
  const [debugInfo, setDebugInfo] = useState("")
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState("")
  const [scanCount, setScanCount] = useState(0)
  const [showDebugView, setShowDebugView] = useState(false)
  const [cameraResolution, setCameraResolution] = useState({ width: 0, height: 0 })
  const [callHistory, setCallHistory] = useState<string[]>([])

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkBrowserSupport()
    getCameraDevices()
    loadCallHistory()
    return () => cleanup()
  }, [])

  const loadCallHistory = () => {
    const saved = localStorage.getItem("qr-call-history")
    if (saved) {
      setCallHistory(JSON.parse(saved))
    }
  }

  const saveToCallHistory = (phoneNumber: string) => {
    const updated = [phoneNumber, ...callHistory.filter((n) => n !== phoneNumber).slice(0, 9)]
    setCallHistory(updated)
    localStorage.setItem("qr-call-history", JSON.stringify(updated))
  }

  const checkBrowserSupport = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Camera not supported in this browser. Please use Chrome, Safari, or Firefox.")
      return false
    }

    const isSecure = window.location.protocol === "https:" || window.location.hostname === "localhost"
    if (!isSecure) {
      setError("Camera requires HTTPS. Please use a secure connection.")
      return false
    }

    return true
  }

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
  }, [])

  const getCameraDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const cameras = devices.filter((device) => device.kind === "videoinput")
      setCameraDevices(cameras)

      // Prefer back camera for QR scanning
      const backCamera = cameras.find(
        (camera) =>
          camera.label.toLowerCase().includes("back") ||
          camera.label.toLowerCase().includes("rear") ||
          camera.label.toLowerCase().includes("environment") ||
          camera.label.toLowerCase().includes("main"),
      )

      if (backCamera) {
        setSelectedCamera(backCamera.deviceId)
      } else if (cameras.length > 0) {
        setSelectedCamera(cameras[0].deviceId)
      }

      setDebugInfo(`Found ${cameras.length} camera(s)`)
    } catch (err) {
      console.error("Error getting camera devices:", err)
      setDebugInfo("Error accessing camera list")
    }
  }

  const requestCameraPermission = async () => {
    try {
      setError("")
      setDebugInfo("Requesting camera permission...")

      const permissionStream = await navigator.mediaDevices.getUserMedia({ video: true })
      permissionStream.getTracks().forEach((track) => track.stop())

      setHasPermission(true)
      setDebugInfo("Camera permission granted")
      return true
    } catch (err: any) {
      console.error("Camera permission error:", err)
      setHasPermission(false)

      const errorMessages = {
        NotAllowedError: "Camera access denied. Please allow camera permissions.",
        NotFoundError: "No camera found on this device.",
        NotSupportedError: "Camera not supported in this browser.",
        NotReadableError: "Camera is being used by another application.",
        OverconstrainedError: "Camera constraints not supported.",
      }

      setError(errorMessages[err.name as keyof typeof errorMessages] || `Camera error: ${err.message}`)
      setDebugInfo(`Permission error: ${err.name}`)
      return false
    }
  }

  const startCamera = async () => {
    try {
      setError("")
      setQrResult(null)
      setDebugInfo("Initializing camera...")
      setScanCount(0)

      if (!checkBrowserSupport()) return

      const hasPermission = await requestCameraPermission()
      if (!hasPermission) return

      cleanup()
      await initializeCamera()
    } catch (err: any) {
      console.error("Camera start error:", err)
      setIsScanning(false)
      setError(`Failed to start camera: ${err.message}`)
      setDebugInfo(`Start error: ${err.name}`)
    }
  }

  const initializeCamera = async () => {
    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: "environment",
        width: { ideal: 1920, min: 640 },
        height: { ideal: 1080, min: 480 },
        frameRate: { ideal: 30, min: 15 },
      },
    }

    if (selectedCamera) {
      constraints.video = {
        ...constraints.video,
        deviceId: { exact: selectedCamera },
      }
    }

    try {
      setDebugInfo("Starting camera with high resolution...")
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      await setupVideoStream(stream)
    } catch (err) {
      console.log("High-res failed, trying standard resolution:", err)
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })
        await setupVideoStream(fallbackStream)
      } catch (fallbackErr) {
        console.log("Environment camera failed, trying user camera:", fallbackErr)
        const userStream = await navigator.mediaDevices.getUserMedia({ video: true })
        await setupVideoStream(userStream)
      }
    }
  }

  const setupVideoStream = async (stream: MediaStream) => {
    streamRef.current = stream

    if (videoRef.current) {
      videoRef.current.srcObject = stream

      await new Promise<void>((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              const { videoWidth, videoHeight } = videoRef.current
              setCameraResolution({ width: videoWidth, height: videoWidth })

              videoRef.current
                .play()
                .then(() => {
                  setIsScanning(true)
                  setDebugInfo(`Camera ready: ${videoWidth}×${videoHeight}`)
                  startQRDetection()
                  resolve()
                })
                .catch((err) => {
                  setDebugInfo(`Video play error: ${err.message}`)
                  resolve()
                })
            }
          }
        }
      })
    }
  }

  const startQRDetection = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }

    scanIntervalRef.current = setInterval(() => {
      if (!isScanning || !videoRef.current || !canvasRef.current) return
      detectQRCode()
    }, 100) // Scan every 100ms for better responsiveness
  }

  const detectQRCode = () => {
    try {
      const video = videoRef.current!
      const canvas = canvasRef.current!
      const context = canvas.getContext("2d", { willReadFrequently: true })!

      if (video.readyState !== video.HAVE_ENOUGH_DATA) return

      // Set canvas size to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw current frame
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Get image data
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

      setScanCount((prev) => prev + 1)

      // Try multiple detection strategies for better accuracy
      const strategies = [
        { inversionAttempts: "dontInvert" },
        { inversionAttempts: "onlyInvert" },
        { inversionAttempts: "attemptBoth" },
      ]

      for (const strategy of strategies) {
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height, strategy as any)

        if (qrCode && qrCode.data) {
          handleQRDetected(qrCode.data)
          return
        }
      }

      // Update debug info periodically
      if (scanCount % 20 === 0) {
        setDebugInfo(`Scanning for phone numbers... (${scanCount} attempts)`)
      }
    } catch (err: any) {
      console.error("QR detection error:", err)
      if (scanCount % 50 === 0) {
        setDebugInfo(`Detection error: ${err.message}`)
      }
    }
  }

  const parseQRData = (data: string): QRResult => {
    const trimmedData = data.trim()

    // Phone number detection (primary focus)
    if (trimmedData.startsWith("tel:")) {
      const phoneNumber = trimmedData.replace("tel:", "").trim()
      return { data: trimmedData, type: "phone", phoneNumber }
    }

    // Direct phone number pattern
    const phonePattern = /^\+?[\d\s\-()]{7,}$/
    if (phonePattern.test(trimmedData)) {
      return { data: trimmedData, type: "phone", phoneNumber: trimmedData }
    }

    // vCard contact detection
    if (trimmedData.startsWith("BEGIN:VCARD")) {
      const phoneMatch = trimmedData.match(/TEL[^:]*:([^\r\n]+)/i)
      const nameMatch = trimmedData.match(/FN:([^\r\n]+)/i)

      if (phoneMatch) {
        return {
          data: trimmedData,
          type: "contact",
          phoneNumber: phoneMatch[1].trim(),
          contactInfo: {
            name: nameMatch ? nameMatch[1].trim() : "Unknown Contact",
            phone: phoneMatch[1].trim(),
          },
        }
      }
    }

    // URL detection (might contain phone info)
    if (trimmedData.match(/^https?:\/\//i)) {
      return { data: trimmedData, type: "url" }
    }

    // Email detection
    if (trimmedData.startsWith("mailto:") || trimmedData.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return { data: trimmedData, type: "email" }
    }

    // Default to text
    return { data: trimmedData, type: "text" }
  }

  const handleQRDetected = (data: string) => {
    console.log("QR Code detected:", data)

    const result = parseQRData(data)
    setQrResult(result)
    stopCamera()

    setDebugInfo(`QR detected: ${result.type.toUpperCase()}`)

    // Auto-vibrate if supported
    if ("vibrate" in navigator) {
      navigator.vibrate(200)
    }

    // Auto-handle phone numbers
    if (result.type === "phone" && result.phoneNumber) {
      setTimeout(() => {
        handlePhoneCall(result.phoneNumber!)
      }, 1000)
    } else if (result.type === "contact" && result.phoneNumber) {
      setTimeout(() => {
        handleContactCall(result)
      }, 1000)
    }
  }

  const handlePhoneCall = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, "")
    if (confirm(`📞 Call ${phoneNumber}?`)) {
      saveToCallHistory(phoneNumber)
      window.location.href = `tel:${cleanNumber}`
    } else {
      // Reset to scan again
      setQrResult(null)
    }
  }

  const handleContactCall = (result: QRResult) => {
    const { contactInfo, phoneNumber } = result
    const displayName = contactInfo?.name || "Unknown Contact"

    if (confirm(`📞 Call ${displayName}?\nNumber: ${phoneNumber}`)) {
      saveToCallHistory(`${displayName} - ${phoneNumber}`)
      window.location.href = `tel:${phoneNumber}`
    } else {
      setQrResult(null)
    }
  }

  const handleManualInput = () => {
    const phoneNumber = prompt("Enter phone number manually (with country code):")
    if (phoneNumber) {
      const formattedNumber = phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`
      if (confirm(`📞 Call ${formattedNumber}?`)) {
        saveToCallHistory(formattedNumber)
        window.location.href = `tel:${formattedNumber}`
      }
    }
  }

  const toggleFlash = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0]
      const capabilities = track.getCapabilities()

      if ("torch" in capabilities) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !flashOn } as any],
          })
          setFlashOn(!flashOn)
          setDebugInfo(`Flash ${!flashOn ? "ON" : "OFF"}`)
        } catch (err) {
          setDebugInfo("Flash not supported")
        }
      } else {
        setDebugInfo("Flash not available")
      }
    }
  }

  const stopCamera = () => {
    cleanup()
    setIsScanning(false)
    setDebugInfo("Camera stopped")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("📋 Copied to clipboard!")
  }

  const getResultIcon = (type: string) => {
    return icons[type as keyof typeof icons] || Phone
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm p-4 flex items-center justify-between absolute top-0 left-0 right-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="text-white hover:bg-white/20">
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold text-white">Scan to Call</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={isScanning ? toggleFlash : () => setShowDebugView(!showDebugView)}
          className="text-white hover:bg-white/20"
        >
          {isScanning ? (
            <Flashlight className={`h-6 w-6 ${flashOn ? "text-yellow-400" : ""}`} />
          ) : (
            <Bug className="h-6 w-6" />
          )}
        </Button>
      </header>

      <div className="relative h-screen">
        {/* Camera View */}
        {isScanning && (
          <div className="relative w-full h-full">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />
            <canvas ref={canvasRef} className="hidden" />

            {/* Phone-focused Scanning Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Main scanning frame with phone icon */}
                <div className="w-72 h-72 border-4 border-white/50 rounded-3xl relative overflow-hidden">
                  {/* Corner indicators */}
                  <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-2xl"></div>
                  <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-2xl"></div>
                  <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-2xl"></div>
                  <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-2xl"></div>

                  {/* Phone icon in center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-green-500/20 p-4 rounded-full">
                      <Phone className="h-8 w-8 text-green-400" />
                    </div>
                  </div>

                  {/* Animated scanning line */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse absolute top-1/2 transform -translate-y-1/2"></div>
                  </div>
                </div>

                <div className="text-center mt-6 space-y-2">
                  <p className="text-white text-lg font-semibold">📱 Scan QR code to call instantly</p>
                  <p className="text-white/70 text-sm">
                    Scans: {scanCount} | {cameraResolution.width}×{cameraResolution.height}
                  </p>
                </div>
              </div>
            </div>

            {/* Real-time info overlay */}
            {debugInfo && (
              <div className="absolute top-20 left-4 right-4">
                <Card className="bg-black/70 backdrop-blur-sm border-white/20">
                  <CardContent className="p-3">
                    <p className="text-xs text-white font-mono">{debugInfo}</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* QR Result Display */}
        {qrResult && (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-6">
            <div className="bg-green-100 p-6 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-white">QR Code Detected!</h2>

            <Card className="bg-white/95 backdrop-blur-sm max-w-md w-full">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  {getResultIcon(qrResult.type)}
                  <span className="font-semibold text-lg capitalize text-green-600">
                    {qrResult.type === "phone"
                      ? "Phone Number"
                      : qrResult.type === "contact"
                        ? "Contact Card"
                        : qrResult.type}
                  </span>
                </div>

                {qrResult.type === "contact" && qrResult.contactInfo ? (
                  <div className="bg-green-50 p-4 rounded-lg space-y-2">
                    <p className="font-semibold text-green-800">{qrResult.contactInfo.name}</p>
                    <p className="text-green-700 font-mono">{qrResult.phoneNumber}</p>
                  </div>
                ) : qrResult.phoneNumber ? (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-green-800 font-mono text-lg">{qrResult.phoneNumber}</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800 font-mono text-sm break-all">{qrResult.data}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  {(qrResult.type === "phone" || qrResult.type === "contact") && qrResult.phoneNumber ? (
                    <Button
                      onClick={() => handlePhoneCall(qrResult.phoneNumber!)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </Button>
                  ) : qrResult.type === "url" ? (
                    <Button
                      onClick={() => window.open(qrResult.data, "_blank")}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Open URL
                    </Button>
                  ) : (
                    <Button
                      onClick={() => copyToClipboard(qrResult.data)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Text
                    </Button>
                  )}

                  <Button onClick={() => copyToClipboard(qrResult.data)} variant="outline" className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={() => {
                setQrResult(null)
                startCamera()
              }}
              className="bg-green-600 hover:bg-green-700 text-white rounded-2xl px-8 py-3"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Scan Another
            </Button>
          </div>
        )}

        {/* Initial State */}
        {!isScanning && !qrResult && (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-6">
            <div className="bg-green-100 p-8 rounded-full">
              <Phone className="h-16 w-16 text-green-600" />
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">Scan to Call</h2>
              <p className="text-gray-300 max-w-md text-lg">
                Scan QR codes containing phone numbers, contact cards, or business cards to call instantly!
              </p>
            </div>

            {/* Supported formats */}
            <div className="grid grid-cols-2 gap-4 max-w-md w-full">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl text-center">
                <Phone className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-white text-sm font-medium">Phone Numbers</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl text-center">
                <User className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <p className="text-white text-sm font-medium">Contact Cards</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl text-center">
                <Globe className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <p className="text-white text-sm font-medium">Business Cards</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl text-center">
                <MessageSquare className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                <p className="text-white text-sm font-medium">Any QR Code</p>
              </div>
            </div>

            {/* Debug Info */}
            {debugInfo && (
              <Card className="bg-blue-50 border-blue-200 max-w-md w-full">
                <CardContent className="p-3">
                  <p className="text-xs text-blue-600 font-mono">{debugInfo}</p>
                </CardContent>
              </Card>
            )}

            {/* Error Display */}
            {error && (
              <Card className="bg-red-50 border-red-200 max-w-md w-full">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium block">{error}</span>
                      {hasPermission === false && (
                        <Button
                          onClick={() => window.location.reload()}
                          variant="outline"
                          size="sm"
                          className="mt-2 text-xs"
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Camera Selection */}
            {cameraDevices.length > 1 && (
              <Card className="bg-gray-50 border-gray-200 max-w-md w-full">
                <CardContent className="p-4">
                  <label className="text-sm font-medium text-gray-700 block mb-2">📷 Select Camera:</label>
                  <select
                    value={selectedCamera}
                    onChange={(e) => setSelectedCamera(e.target.value)}
                    className="w-full p-3 text-sm border rounded-lg"
                  >
                    {cameraDevices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                </CardContent>
              </Card>
            )}

            {/* Call History */}
            {callHistory.length > 0 && (
              <Card className="bg-gray-50 border-gray-200 max-w-md w-full">
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">📞 Recent Calls:</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {callHistory.slice(0, 3).map((item, index) => (
                      <div
                        key={index}
                        className="text-xs bg-white p-2 rounded border cursor-pointer hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => {
                          if (confirm(`📞 Call ${item}?`)) {
                            window.location.href = `tel:${item.split(" - ")[1] || item}`
                          }
                        }}
                      >
                        <Phone className="h-3 w-3 text-green-600" />
                        {item.length > 30 ? `${item.substring(0, 30)}...` : item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4 w-full max-w-md">
              <Button
                onClick={startCamera}
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-2xl py-4 text-lg font-semibold"
                disabled={hasPermission === false}
              >
                <Camera className="h-6 w-6 mr-3" />
                {hasPermission === false ? "Camera Access Denied" : "Start Phone Scanner"}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleManualInput}
                  variant="outline"
                  className="border-2 border-green-300 text-green-600 hover:bg-green-50 rounded-2xl py-3"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Manual Input
                </Button>
                <Button
                  onClick={() => router.push("/customer-care")}
                  variant="outline"
                  className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-2xl py-3"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Support
                </Button>
              </div>
            </div>

            {/* Pro Tips */}
            <Card className="bg-yellow-50 border-yellow-200 max-w-md w-full">
              <CardContent className="p-4">
                <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Calling Tips:
                </h3>
                <div className="text-sm text-yellow-700 space-y-2">
                  <p>• Works with business cards and contact QR codes</p>
                  <p>• Automatically detects phone numbers in any format</p>
                  <p>• Supports international numbers with country codes</p>
                  <p>• Saves call history for quick redialing</p>
                  <p>• Handles vCard contact information</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bottom Controls */}
        {isScanning && (
          <div className="absolute bottom-8 left-4 right-4 flex justify-center gap-4">
            <Button
              onClick={stopCamera}
              variant="outline"
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 rounded-2xl px-6 py-3"
            >
              Stop Scanner
            </Button>
            <Button
              onClick={handleManualInput}
              variant="outline"
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 rounded-2xl px-6 py-3"
            >
              Manual Input
            </Button>
            {cameraDevices.length > 1 && (
              <Button
                onClick={() => {
                  const currentIndex = cameraDevices.findIndex((d) => d.deviceId === selectedCamera)
                  const nextIndex = (currentIndex + 1) % cameraDevices.length
                  setSelectedCamera(cameraDevices[nextIndex].deviceId)
                  stopCamera()
                  setTimeout(startCamera, 500)
                }}
                variant="outline"
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 rounded-2xl px-6 py-3"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Switch
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
