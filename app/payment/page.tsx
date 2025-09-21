"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { EnhancedPhoneInput } from "@/components/ui/enhanced-phone-input"
import { ArrowLeft, CreditCard, CheckCircle, Star, Crown, Building, Wallet } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedPlan, setSelectedPlan] = useState(searchParams.get("plan") || "single")
  const [paymentMethod, setPaymentMethod] = useState("upi")
  const [isProcessing, setIsProcessing] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [billingInfo, setBillingInfo] = useState({
    fullName: "",
    email: "",
    phone: "+91 ",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstNumber: "",
  })

  const plans = [
    {
      id: "single",
      name: "Single Person",
      description: "Individual use",
      price: 50,
      originalPrice: 99,
      period: "per month",
      icon: Star,
      color: "bg-blue-500",
      features: ["Generate unlimited QR codes", "Basic phone integration", "Standard support", "Mobile app access"],
      discount: "50% OFF",
    },
    {
      id: "franchise",
      name: "Franchise",
      description: "Small business",
      price: 500,
      originalPrice: 999,
      period: "per month",
      icon: Crown,
      color: "bg-purple-500",
      features: [
        "Everything in Single Person",
        "Multi-location support",
        "Advanced analytics",
        "Priority support",
        "Custom branding",
      ],
      discount: "50% OFF",
      popular: true,
    },
    {
      id: "office",
      name: "Office",
      description: "Enterprise",
      price: 10000,
      originalPrice: 19999,
      period: "per month",
      icon: Building,
      color: "bg-orange-500",
      features: [
        "Everything in Franchise",
        "Enterprise security",
        "API access",
        "Custom integrations",
        "Dedicated support",
      ],
      discount: "50% OFF",
    },
  ]

  const currentPlan = plans.find((plan) => plan.id === selectedPlan) || plans[0]

  useEffect(() => {
    const userData = localStorage.getItem("keyra-user-session")
    if (userData) {
      const user = JSON.parse(userData)
      setBillingInfo((prev) => ({
        ...prev,
        fullName: user.name || "",
        email: user.email || "",
        phone: user.phone || "+91 ",
      }))
    }
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setBillingInfo((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const calculateTotal = () => {
    const subtotal = currentPlan.price
    const gst = Math.round(subtotal * 0.18)
    const total = subtotal + gst
    return { subtotal, gst, total }
  }

  const handlePayment = async () => {
    if (!agreedToTerms) {
      alert("Please agree to the terms and conditions")
      return
    }

    if (
      !billingInfo.fullName ||
      !billingInfo.email ||
      !billingInfo.phone ||
      !billingInfo.address ||
      !billingInfo.city ||
      !billingInfo.state ||
      !billingInfo.pincode
    ) {
      alert("Please fill in all required billing information")
      return
    }

    setIsProcessing(true)

    try {
      const { total } = calculateTotal()
      const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Create payment data
      const paymentData = {
        paymentId,
        plan: currentPlan,
        billingInfo,
        amount: total,
        subtotal: currentPlan.price,
        gst: Math.round(currentPlan.price * 0.18),
        timestamp: new Date().toISOString(),
        status: "pending",
        upiId: "simaiyanitin@okicici",
        recipientName: "Nitin Simaiya",
      }

      // Store payment data
      localStorage.setItem(`payment_${paymentId}`, JSON.stringify(paymentData))
      localStorage.setItem("current_payment", paymentId)

      setIsProcessing(false)

      // Redirect to QR payment page
      router.push(`/payment/qr?payment=${paymentId}`)
    } catch (error) {
      console.error("Payment error:", error)
      setIsProcessing(false)
      alert("Payment initiation failed. Please try again.")
    }
  }

  const { subtotal, gst, total } = calculateTotal()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold text-orange-500">Payment</h1>
        <div className="w-10" />
      </header>

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Plan Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Choose Your Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
              {plans.map((plan) => (
                <div key={plan.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={plan.id} id={plan.id} />
                  <div className="flex-1 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${plan.color} text-white`}>
                        <plan.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{plan.name}</h3>
                          {plan.popular && <Badge className="bg-orange-500">Popular</Badge>}
                        </div>
                        <p className="text-sm text-gray-600">{plan.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">₹{plan.price}</span>
                        <span className="text-sm text-gray-500 line-through">₹{plan.originalPrice}</span>
                      </div>
                      <p className="text-xs text-gray-600">{plan.period}</p>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        {plan.discount}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Billing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={billingInfo.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={billingInfo.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Phone Number *</Label>
                <EnhancedPhoneInput
                  value={billingInfo.phone}
                  onChange={(value) => handleInputChange("phone", value)}
                  placeholder="Phone number"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={billingInfo.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter your address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={billingInfo.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="City"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={billingInfo.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="State"
                />
              </div>
              <div>
                <Label htmlFor="pincode">PIN Code</Label>
                <Input
                  id="pincode"
                  value={billingInfo.pincode}
                  onChange={(e) => handleInputChange("pincode", e.target.value)}
                  placeholder="PIN Code"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3 p-3 border rounded-lg bg-blue-50">
              <div className="p-2 bg-blue-600 rounded-lg text-white">
                <Wallet className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">UPI Payment</h3>
                <p className="text-sm text-gray-600">
                  Pay securely using any UPI app (Google Pay, PhonePe, Paytm, etc.)
                </p>
              </div>
            </div>

            <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-sm text-orange-800">
                <p className="font-medium mb-1">Payment Process:</p>
                <ul className="space-y-1 text-xs">
                  <li>1. Click "Pay Now" to get QR code</li>
                  <li>2. Scan QR code with any UPI app</li>
                  <li>3. Complete payment</li>
                  <li>4. Upload payment receipt</li>
                  <li>5. Admin will review and approve</li>
                  <li>6. Get full access after approval</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>{currentPlan.name} Plan</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>GST (18%)</span>
              <span>₹{gst}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>₹{total}</span>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">What you'll get:</h4>
              <ul className="space-y-1">
                {currentPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Terms and Conditions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={setAgreedToTerms} />
              <div className="text-sm">
                <label htmlFor="terms" className="cursor-pointer">
                  I agree to the{" "}
                  <a href="/terms" className="text-orange-500 hover:underline">
                    Terms and Conditions
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-orange-500 hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
          onClick={handlePayment}
          disabled={isProcessing || !agreedToTerms}
        >
          {isProcessing ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Wallet className="h-5 w-5" />
              <span>Pay ₹{total}</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  )
}
