"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone } from "lucide-react"

const countries = [
  { name: "Afghanistan", code: "+93", flag: "🇦🇫" },
  { name: "Albania", code: "+355", flag: "🇦🇱" },
  { name: "Algeria", code: "+213", flag: "🇩🇿" },
  { name: "Argentina", code: "+54", flag: "🇦🇷" },
  { name: "Australia", code: "+61", flag: "🇦🇺" },
  { name: "Austria", code: "+43", flag: "🇦🇹" },
  { name: "Bangladesh", code: "+880", flag: "🇧🇩" },
  { name: "Belgium", code: "+32", flag: "🇧🇪" },
  { name: "Brazil", code: "+55", flag: "🇧🇷" },
  { name: "Canada", code: "+1", flag: "🇨🇦" },
  { name: "China", code: "+86", flag: "🇨🇳" },
  { name: "Denmark", code: "+45", flag: "🇩🇰" },
  { name: "Egypt", code: "+20", flag: "🇪🇬" },
  { name: "France", code: "+33", flag: "🇫🇷" },
  { name: "Germany", code: "+49", flag: "🇩🇪" },
  { name: "India", code: "+91", flag: "🇮🇳" },
  { name: "Indonesia", code: "+62", flag: "🇮🇩" },
  { name: "Italy", code: "+39", flag: "🇮🇹" },
  { name: "Japan", code: "+81", flag: "🇯🇵" },
  { name: "Malaysia", code: "+60", flag: "🇲🇾" },
  { name: "Netherlands", code: "+31", flag: "🇳🇱" },
  { name: "Norway", code: "+47", flag: "🇳🇴" },
  { name: "Pakistan", code: "+92", flag: "🇵🇰" },
  { name: "Russia", code: "+7", flag: "🇷🇺" },
  { name: "Saudi Arabia", code: "+966", flag: "🇸🇦" },
  { name: "Singapore", code: "+65", flag: "🇸🇬" },
  { name: "South Korea", code: "+82", flag: "🇰🇷" },
  { name: "Spain", code: "+34", flag: "🇪🇸" },
  { name: "Sri Lanka", code: "+94", flag: "🇱🇰" },
  { name: "Sweden", code: "+46", flag: "🇸🇪" },
  { name: "Switzerland", code: "+41", flag: "🇨🇭" },
  { name: "Thailand", code: "+66", flag: "🇹🇭" },
  { name: "Turkey", code: "+90", flag: "🇹🇷" },
  { name: "UAE", code: "+971", flag: "🇦🇪" },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
  { name: "United States", code: "+1", flag: "🇺🇸" },
  { name: "Vietnam", code: "+84", flag: "🇻🇳" },
]

interface WhatsAppPhoneInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  label?: string
  required?: boolean
}

export function WhatsAppPhoneInput({
  value,
  onChange,
  placeholder = "Enter phone number",
  disabled = false,
  label = "Phone Number",
  required = false,
}: WhatsAppPhoneInputProps) {
  const [selectedCountryCode, setSelectedCountryCode] = useState("+91")
  const [phoneNumber, setPhoneNumber] = useState("")

  useEffect(() => {
    if (value) {
      // Find the country code in the value
      const country = countries.find((c) => value.startsWith(c.code))
      if (country) {
        setSelectedCountryCode(country.code)
        setPhoneNumber(value.replace(country.code, "").trim())
      }
    }
  }, [value])

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountryCode(countryCode)
    const fullNumber = phoneNumber ? `${countryCode} ${phoneNumber}` : countryCode + " "
    onChange(fullNumber)
  }

  const handlePhoneChange = (number: string) => {
    // Only allow numbers, spaces, and hyphens
    const cleanNumber = number.replace(/[^\d\s-]/g, "")
    setPhoneNumber(cleanNumber)
    const fullNumber = cleanNumber ? `${selectedCountryCode} ${cleanNumber}` : selectedCountryCode + " "
    onChange(fullNumber)
  }

  const selectedCountry = countries.find((c) => c.code === selectedCountryCode)

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Phone className="h-4 w-4 text-orange-500" />
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      {/* Country Dropdown */}
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-gray-600 mb-1 block">Country</Label>
          <Select value={selectedCountryCode} onValueChange={handleCountryChange} disabled={disabled}>
            <SelectTrigger className="w-full h-12 text-left">
              <SelectValue>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{selectedCountry?.flag}</span>
                  <span className="flex-1">{selectedCountry?.name}</span>
                  <span className="font-mono text-sm text-gray-600">{selectedCountryCode}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {countries.map((country) => (
                <SelectItem key={country.code} value={country.code} className="h-12">
                  <div className="flex items-center gap-3 w-full">
                    <span className="text-lg">{country.flag}</span>
                    <span className="flex-1 text-left">{country.name}</span>
                    <span className="font-mono text-sm text-gray-600">{country.code}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Phone Number Input */}
        <div>
          <Label className="text-xs text-gray-600 mb-1 block">Phone Number</Label>
          <div className="flex border-2 border-gray-200 rounded-lg overflow-hidden hover:border-orange-300 focus-within:border-orange-500">
            <div className="bg-gray-50 px-3 flex items-center border-r border-gray-200">
              <span className="font-mono text-sm font-medium text-gray-700">{selectedCountryCode}</span>
            </div>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className="flex-1 border-0 rounded-none font-mono focus-visible:ring-0 h-12"
            />
          </div>
        </div>
      </div>

      {/* Complete Number Preview */}
      <div className="text-xs text-gray-500 bg-orange-50 px-3 py-2 rounded border border-orange-200">
        <span className="font-medium text-orange-700">Complete Number:</span>{" "}
        <span className="font-mono">
          {selectedCountryCode} {phoneNumber || "___________"}
        </span>
      </div>
    </div>
  )
}
