"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import jsQR from "jsqr"

export default function SimpleQRScanner() {
  const [message, setMessage] = useState("Click Start to access camera")
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  const startScanning = async () => {
    try {
      setMessage("Requesting camera access...")

      // Stop any existing stream
      stopScanning()

      // Request camera with basic constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setMessage("Camera accessed! Scanning for QR codes...")
        setScanning(true)

        // Start scanning for QR codes
        scanIntervalRef.current = setInterval(() => {
          scanQRCode()
        }, 500)
      }
    } catch (error: any) {
      console.error("Error accessing camera:", error)
      setMessage(`Camera error: ${error.name} - ${error.message}`)
    }
  }

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }

    setScanning(false)
  }

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Get image data for QR detection
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

      try {
        // Attempt to detect QR code
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        })

        if (qrCode) {
          // QR code detected!
          setResult(qrCode.data)
          stopScanning()
          setMessage("QR Code found!")
        }
      } catch (error) {
        console.error("QR scanning error:", error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Simple QR Scanner</h1>

      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md mb-4">
        <p className="text-center mb-4">{message}</p>

        <div className="relative w-full aspect-square bg-black mb-4">
          {/* Video element for camera feed */}
          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />

          {/* Scanning overlay */}
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-white rounded-lg"></div>
            </div>
          )}

          {/* Hidden canvas for processing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex gap-4 justify-center">
          {!scanning ? (
            <Button onClick={startScanning} className="bg-blue-500 hover:bg-blue-600">
              Start Camera
            </Button>
          ) : (
            <Button onClick={stopScanning} className="bg-red-500 hover:bg-red-600">
              Stop Camera
            </Button>
          )}

          <Button onClick={() => router.push("/")} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>

      {result && (
        <div className="bg-green-100 p-4 rounded-lg border border-green-300 w-full max-w-md">
          <h2 className="font-bold text-green-800 mb-2">QR Code Detected:</h2>
          <p className="break-all font-mono bg-white p-2 rounded">{result}</p>

          {result.startsWith("tel:") && (
            <Button
              onClick={() => (window.location.href = result)}
              className="w-full mt-4 bg-green-500 hover:bg-green-600"
            >
              Call {result.replace("tel:", "")}
            </Button>
          )}
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600 max-w-md">
        <h3 className="font-bold mb-2">Troubleshooting:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Make sure you've granted camera permissions</li>
          <li>Ensure you're using a secure connection (HTTPS)</li>
          <li>Try using Chrome or Safari for best compatibility</li>
          <li>Hold the QR code steady about 6-8 inches from camera</li>
          <li>Ensure the QR code is well-lit and not blurry</li>
        </ul>
      </div>
    </div>
  )
}
