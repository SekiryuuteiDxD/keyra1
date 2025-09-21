"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Menu,
  Camera,
  Flashlight,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Settings,
  Bug,
  Zap,
  Globe,
  Phone,
  Mail,
  Wifi,
  MapPin,
  Calendar,
  User,
  Link,
  Copy,
  ExternalLink,
  Share2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import jsQR from "jsqr"

interface QRResult {
  data: string
  type: "url" | "phone" | "email" | "wifi" | "sms" | "geo" | "contact" | "calendar" | "text" | "unknown"
  parsed?: any
}

export default function UniversalQRScanner() {
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
  const [detectionHistory, setDetectionHistory] = useState<string[]>([])

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkBrowserSupport()
    getCameraDevices()
    return () => cleanup()
  }, [])

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
              setCameraResolution({ width: videoWidth, height: videoHeight })

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

      // Try multiple detection strategies
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
        setDebugInfo(`Scanning... (${scanCount} attempts) - ${canvas.width}×${canvas.height}`)
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

    // URL detection
    if (trimmedData.match(/^https?:\/\//i) || trimmedData.match(/^www\./i)) {
      return { data: trimmedData, type: "url" }
    }

    // Phone number detection
    if (trimmedData.startsWith("tel:") || trimmedData.match(/^\+?[\d\s\-()]{7,}$/)) {
      return {
        data: trimmedData,
        type: "phone",
        parsed: { number: trimmedData.replace("tel:", "") },
      }
    }

    // Email detection
    if (trimmedData.startsWith("mailto:") || trimmedData.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return {
        data: trimmedData,
        type: "email",
        parsed: { email: trimmedData.replace("mailto:", "") },
      }
    }

    // WiFi detection
    if (trimmedData.startsWith("WIFI:")) {
      const wifiMatch = trimmedData.match(/WIFI:T:([^;]*);S:([^;]*);P:([^;]*);H:([^;]*);?/i)
      if (wifiMatch) {
        return {
          data: trimmedData,
          type: "wifi",
          parsed: {
            security: wifiMatch[1],
            ssid: wifiMatch[2],
            password: wifiMatch[3],
            hidden: wifiMatch[4] === "true",
          },
        }
      }
    }

    // SMS detection
    if (trimmedData.startsWith("sms:") || trimmedData.startsWith("smsto:")) {
      return { data: trimmedData, type: "sms" }
    }

    // Geo location detection
    if (trimmedData.startsWith("geo:")) {
      const geoMatch = trimmedData.match(/geo:([^,]+),([^,?]+)/)
      if (geoMatch) {
        return {
          data: trimmedData,
          type: "geo",
          parsed: {
            latitude: Number.parseFloat(geoMatch[1]),
            longitude: Number.parseFloat(geoMatch[2]),
          },
        }
      }
    }

    // vCard contact detection
    if (trimmedData.startsWith("BEGIN:VCARD")) {
      return { data: trimmedData, type: "contact" }
    }

    // Calendar event detection
    if (trimmedData.startsWith("BEGIN:VEVENT")) {
      return { data: trimmedData, type: "calendar" }
    }

    // Default to text
    return { data: trimmedData, type: "text" }
  }

  const handleQRDetected = (data: string) => {
    console.log("QR Code detected:", data)

    const result = parseQRData(data)
    setQrResult(result)
    stopCamera()

    // Add to history
    setDetectionHistory((prev) => [data, ...prev.slice(0, 9)]) // Keep last 10

    setDebugInfo(`QR detected: ${result.type.toUpperCase()}`)

    // Auto-vibrate if supported
    if ("vibrate" in navigator) {
      navigator.vibrate(200)
    }
  }

  const handleQRAction = (result: QRResult) => {
    switch (result.type) {
      case "url":
        if (confirm(`🌐 Open website?\n${result.data}`)) {
          window.open(result.data, "_blank")
        }
        break

      case "phone":
        const phoneNumber = result.parsed?.number || result.data.replace("tel:", "")
        if (confirm(`📞 Call ${phoneNumber}?`)) {
          window.location.href = `tel:${phoneNumber}`
        }
        break

      case "email":
        const email = result.parsed?.email || result.data.replace("mailto:", "")
        if (confirm(`📧 Send email to ${email}?`)) {
          window.location.href = `mailto:${email}`
        }
        break

      case "sms":
        if (confirm(`💬 Send SMS?\n${result.data}`)) {
          window.location.href = result.data
        }
        break

      case "wifi":
        if (result.parsed) {
          alert(
            `📶 WiFi Network: ${result.parsed.ssid}\nPassword: ${result.parsed.password}\n\nCopy password and connect manually.`,
          )
          navigator.clipboard.writeText(result.parsed.password)
        }
        break

      case "geo":
        if (result.parsed) {
          const { latitude, longitude } = result.parsed
          if (confirm(`📍 Open location?\nLat: ${latitude}, Lng: ${longitude}`)) {
            window.open(`https://maps.google.com/?q=${latitude},${longitude}`, "_blank")
          }
        }
        break

      default:
        // For text and other types, just copy to clipboard
        navigator.clipboard.writeText(result.data)
        alert(`📋 Copied to clipboard:\n${result.data.substring(0, 100)}${result.data.length > 100 ? "..." : ""}`)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("📋 Copied to clipboard!")
  }

  const shareQRData = async (data: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "QR Code Content",
          text: data,
        })
      } catch (err) {
        copyToClipboard(data)
      }
    } else {
      copyToClipboard(data)
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

  const getQRIcon = (type: string) => {
    const icons = {
      url: Globe,
      phone: Phone,
      email: Mail,
      wifi: Wifi,
      sms: Mail,
      geo: MapPin,
      contact: User,
      calendar: Calendar,
      text: Link,
    }
    return icons[type as keyof typeof icons] || Link
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm p-4 flex items-center justify-between absolute top-0 left-0 right-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="text-white hover:bg-white/20">
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold text-white">Universal QR Scanner</h1>
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

            {/* Advanced Scanning Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Main scanning frame */}
                <div className="w-72 h-72 border-4 border-white/50 rounded-3xl relative overflow-hidden">
                  {/* Corner indicators */}
                  <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-2xl"></div>
                  <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-2xl"></div>
                  <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-2xl"></div>
                  <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-2xl"></div>

                  {/* Animated scanning line */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse absolute top-1/2 transform -translate-y-1/2"></div>
                  </div>

                  {/* Grid overlay for better targeting */}
                  <div className="absolute inset-4 border border-white/20 rounded-2xl">
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="border border-white/10"></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-center mt-6 space-y-2">
                  <p className="text-white text-lg font-semibold">📱 Point camera at any QR code</p>
                  <p className="text-white/70 text-sm">
                    Scans: {scanCount} | Resolution: {cameraResolution.width}×{cameraResolution.height}
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
                  {(() => {
                    const IconComponent = getQRIcon(qrResult.type)
                    return <IconComponent className="h-6 w-6 text-blue-600" />
                  })()}
                  <span className="font-semibold text-lg capitalize text-blue-600">
                    {qrResult.type === "url" ? "Website" : qrResult.type}
                  </span>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800 font-mono text-sm break-all max-h-32 overflow-y-auto">{qrResult.data}</p>
                </div>

                {/* Parsed data display */}
                {qrResult.parsed && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-600 font-semibold mb-2">Parsed Information:</p>
                    <div className="text-sm text-blue-800 space-y-1">
                      {Object.entries(qrResult.parsed).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize font-medium">{key}:</span>
                          <span className="font-mono">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleQRAction(qrResult)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {qrResult.type === "url" ? "Open Link" : "Open"}
                  </Button>

                  {/* Additional Open Link button for URLs */}
                  {qrResult.type === "url" && (
                    <Button
                      onClick={() => window.open(qrResult.data, "_blank")}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Visit Site
                    </Button>
                  )}

                  <Button onClick={() => copyToClipboard(qrResult.data)} variant="outline" className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={() => shareQRData(qrResult.data)} variant="outline" className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={() => {
                setQrResult(null)
                startCamera()
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-8 py-3"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Scan Another
            </Button>
          </div>
        )}

        {/* Initial State */}
        {!isScanning && !qrResult && (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-6">
            <div className="bg-blue-100 p-8 rounded-full">
              <Camera className="h-16 w-16 text-blue-600" />
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">Universal QR Scanner</h2>
              <p className="text-gray-300 max-w-md text-lg">
                Scan any QR code - websites, phone numbers, WiFi passwords, contacts, and more!
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-4 max-w-md w-full">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl text-center">
                <Globe className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <p className="text-white text-sm font-medium">Websites</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl text-center">
                <Phone className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-white text-sm font-medium">Phone Numbers</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl text-center">
                <Wifi className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <p className="text-white text-sm font-medium">WiFi Passwords</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl text-center">
                <User className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                <p className="text-white text-sm font-medium">Contacts</p>
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

            {/* Detection History */}
            {detectionHistory.length > 0 && (
              <Card className="bg-gray-50 border-gray-200 max-w-md w-full">
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">📋 Recent Scans:</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {detectionHistory.slice(0, 3).map((item, index) => (
                      <div
                        key={index}
                        className="text-xs bg-white p-2 rounded border cursor-pointer hover:bg-gray-50"
                        onClick={() => copyToClipboard(item)}
                      >
                        {item.substring(0, 50)}
                        {item.length > 50 ? "..." : ""}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4 w-full max-w-md">
              <Button
                onClick={startCamera}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-4 text-lg font-semibold"
                disabled={hasPermission === false}
              >
                <Camera className="h-6 w-6 mr-3" />
                {hasPermission === false ? "Camera Access Denied" : "Start Universal Scanner"}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => router.push("/scan-call")}
                  variant="outline"
                  className="border-2 border-green-300 text-green-600 hover:bg-green-50 rounded-2xl py-3"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Call Scanner
                </Button>
                <Button
                  onClick={() => router.push("/scan-text")}
                  variant="outline"
                  className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-2xl py-3"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Text Scanner
                </Button>
              </div>
            </div>

            {/* Pro Tips */}
            <Card className="bg-yellow-50 border-yellow-200 max-w-md w-full">
              <CardContent className="p-4">
                <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Pro Tips:
                </h3>
                <div className="text-sm text-yellow-700 space-y-2">
                  <p>• Hold phone steady 6-8 inches from QR code</p>
                  <p>• Ensure good lighting or use flash</p>
                  <p>• Clean your camera lens for better detection</p>
                  <p>• Works with damaged or partially obscured codes</p>
                  <p>• Supports all standard QR code formats</p>
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
                Switch Camera
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
