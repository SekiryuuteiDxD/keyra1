"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Check, Star, Zap, Crown, Users } from "lucide-react"
import { useRouter } from "next/navigation"

interface Plan {
  id: string
  name: string
  price: number
  originalPrice?: number
  duration: string
  description: string
  features: string[]
  popular?: boolean
  icon: any
  color: string
  bgColor: string
}

export default function PlanPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string>("")

  const plans: Plan[] = [
    {
      id: "single",
      name: "Single User",
      price: 50,
      originalPrice: 99,
      duration: "1 Month",
      description: "Perfect for individual users",
      features: [
        "Generate unlimited QR codes",
        "Phone number QR codes",
        "Text QR codes",
        "Basic analytics",
        "Email support",
      ],
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: "premium",
      name: "Premium",
      price: 500,
      originalPrice: 999,
      duration: "3 Months",
      description: "Most popular choice for professionals",
      features: [
        "Everything in Single User",
        "Advanced QR customization",
        "Bulk QR generation",
        "Priority support",
        "Analytics dashboard",
        "Export options",
      ],
      popular: true,
      icon: Star,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 10000,
      originalPrice: 19999,
      duration: "12 Months",
      description: "For large organizations",
      features: [
        "Everything in Business",
        "Unlimited team members",
        "Advanced security",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantee",
      ],
      icon: Crown,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
    // Redirect to payment page with selected plan
    router.push(`/payment?plan=${planId}`)
  }

  const handleSubscribe = (planId: string) => {
    // Direct subscription
    router.push(`/payment?plan=${planId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold text-orange-500">My Plans</h1>
        <div className="w-10" />
      </header>

      <div className="p-4 space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">Choose Your Plan</h2>
          <p className="text-gray-600">Select the perfect plan for your QR code needs</p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => {
            const IconComponent = plan.icon
            const isSelected = selectedPlan === plan.id

            return (
              <Card
                key={plan.id}
                className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                  plan.popular ? "ring-2 ring-orange-500" : ""
                } ${isSelected ? "ring-2 ring-blue-500" : ""}`}
                onClick={() => handlePlanSelect(plan.id)}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-orange-500 hover:bg-orange-600">
                    Most Popular
                  </Badge>
                )}

                <CardHeader className="text-center pb-4">
                  <div
                    className={`w-16 h-16 ${plan.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}
                  >
                    <IconComponent className={`h-8 w-8 ${plan.color}`} />
                  </div>

                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <p className="text-sm text-gray-600">{plan.description}</p>

                  <div className="space-y-1">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-3xl font-bold text-gray-800">₹{plan.price}</span>
                      {plan.originalPrice && (
                        <span className="text-lg text-gray-500 line-through">₹{plan.originalPrice}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{plan.duration}</p>
                    {plan.originalPrice && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Save ₹{plan.originalPrice - plan.price}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSubscribe(plan.id)
                    }}
                    className={`w-full ${
                      plan.popular ? "bg-orange-500 hover:bg-orange-600" : "bg-gray-800 hover:bg-gray-900"
                    }`}
                  >
                    Subscribe Now
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Features Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Why Choose Our Plans?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Fast & Reliable</h3>
                <p className="text-sm text-gray-600">Generate QR codes instantly with 99.9% uptime</p>
              </div>

              <div className="text-center space-y-2">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Easy to Use</h3>
                <p className="text-sm text-gray-600">Simple interface designed for everyone</p>
              </div>

              <div className="text-center space-y-2">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                  <Crown className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Premium Support</h3>
                <p className="text-sm text-gray-600">Get help when you need it most</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Money Back Guarantee */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="pt-6 text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">30-Day Money Back Guarantee</h3>
              <p className="text-sm text-gray-600">
                Not satisfied? Get a full refund within 30 days, no questions asked.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="space-y-3">
              <h3 className="font-semibold">Need Help Choosing?</h3>
              <p className="text-sm text-gray-600">Our team is here to help you find the perfect plan</p>
              <div className="flex justify-center space-x-3">
                <Button variant="outline" size="sm" onClick={() => window.open("https://wa.me/918839073733")}>
                  WhatsApp Support
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push("/contact")}>
                  Contact Us
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
