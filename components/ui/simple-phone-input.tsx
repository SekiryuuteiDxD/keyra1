"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Phone, ChevronDown } from "lucide-react"

const countries = [
  { name: "India", code: "+91", flag: "🇮🇳" },
  { name: "United States", code: "+1", flag: "🇺🇸" },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
  { name: "Canada", code: "+1", flag: "🇨🇦" },
  { name: "Australia", code: "+61", flag: "🇦🇺" },
  { name: "Germany", code: "+49", flag: "🇩🇪" },
  { name: "France", code: "+33", flag: "🇫🇷" },
  { name: "Japan", code: "+81", flag: "🇯🇵" },
  { name: "China", code: "+86", flag: "🇨🇳" },
  { name: "Brazil", code: "+55", flag: "🇧🇷" },
  { name: "Russia", code: "+7", flag: "🇷🇺" },
  { name: "Italy", code: "+39", flag: "🇮🇹" },
  { name: "Spain", code: "+34", flag: "🇪🇸" },
  { name: "Netherlands", code: "+31", flag: "🇳🇱" },
  { name: "Switzerland", code: "+41", flag: "🇨🇭" },
  { name: "Sweden", code: "+46", flag: "🇸🇪" },
  { name: "Norway", code: "+47", flag: "🇳🇴" },
  { name: "Denmark", code: "+45", flag: "🇩🇰" },
  { name: "UAE", code: "+971", flag: "🇦🇪" },
  { name: "Saudi Arabia", code: "+966", flag: "🇸🇦" },
  { name: "Pakistan", code: "+92", flag: "🇵🇰" },
  { name: "Bangladesh", code: "+880", flag: "🇧🇩" },
  { name: "Sri Lanka", code: "+94", flag: "🇱🇰" },
  { name: "Singapore", code: "+65", flag: "🇸🇬" },
  { name: "Malaysia", code: "+60", flag: "🇲🇾" },
]

interface SimplePhoneInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  label?: string
  required?: boolean
}

export function SimplePhoneInput({
  value,
  onChange,
  placeholder = "Enter phone number",
  disabled = false,
  label = "Phone Number",
  required = false,
}: SimplePhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState(countries[0])
  const [phoneNumber, setPhoneNumber] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    if (value) {
      const country = countries.find((c) => value.startsWith(c.code))
      if (country) {
        setSelectedCountry(country)
        setPhoneNumber(value.replace(country.code, "").trim())
      }
    }
  }, [value])

  const handleCountryChange = (country: (typeof countries)[0]) => {
    setSelectedCountry(country)
    const fullNumber = phoneNumber ? `${country.code} ${phoneNumber}` : country.code + " "
    onChange(fullNumber)
    setShowDropdown(false)
  }

  const handlePhoneChange = (number: string) => {
    const cleanNumber = number.replace(/[^\d\s-]/g, "")
    setPhoneNumber(cleanNumber)
    const fullNumber = cleanNumber ? `${selectedCountry.code} ${cleanNumber}` : selectedCountry.code + " "
    onChange(fullNumber)
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Phone className="h-4 w-4 text-orange-500" />
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <div className="flex border-2 border-gray-200 rounded-lg overflow-hidden hover:border-orange-300 focus-within:border-orange-500">
        {/* Country Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setShowDropdown(!showDropdown)}
            disabled={disabled}
            className="h-12 px-3 bg-gray-50 hover:bg-gray-100 border-r border-gray-200 flex items-center gap-2 min-w-[120px] disabled:opacity-50"
          >
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="font-mono text-sm font-medium">{selectedCountry.code}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
          </button>

          {showDropdown && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />

              {/* Dropdown */}
              <div className="absolute top-full left-0 z-50 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-[300px] overflow-y-auto min-w-[280px]">
                {countries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountryChange(country)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 text-left transition-colors border-b border-gray-100 last:border-b-0 ${
                      selectedCountry.code === country.code ? "bg-orange-100" : ""
                    }`}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{country.name}</div>
                      <div className="text-xs text-gray-500 font-mono">{country.code}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Phone Input */}
        <Input
          type="tel"
          value={phoneNumber}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 h-12 border-0 rounded-none font-mono focus-visible:ring-0"
        />
      </div>

      {/* Preview */}
      <div className="text-xs text-gray-500 font-mono bg-orange-50 px-3 py-2 rounded border border-orange-200">
        <span className="font-medium text-orange-700">Complete Number:</span> {selectedCountry.code}{" "}
        {phoneNumber || "___________"}
      </div>
    </div>
  )
}
