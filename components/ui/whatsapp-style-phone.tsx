"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ChevronDown, Search, Phone } from "lucide-react"

const countries = [
  { code: "+91", country: "India", flag: "🇮🇳", iso: "IN" },
  { code: "+1", country: "United States", flag: "🇺🇸", iso: "US" },
  { code: "+1", country: "Canada", flag: "🇨🇦", iso: "CA" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧", iso: "GB" },
  { code: "+61", country: "Australia", flag: "🇦🇺", iso: "AU" },
  { code: "+49", country: "Germany", flag: "🇩🇪", iso: "DE" },
  { code: "+33", country: "France", flag: "🇫🇷", iso: "FR" },
  { code: "+81", country: "Japan", flag: "🇯🇵", iso: "JP" },
  { code: "+86", country: "China", flag: "🇨🇳", iso: "CN" },
  { code: "+55", country: "Brazil", flag: "🇧🇷", iso: "BR" },
  { code: "+7", country: "Russia", flag: "🇷🇺", iso: "RU" },
  { code: "+82", country: "South Korea", flag: "🇰🇷", iso: "KR" },
  { code: "+39", country: "Italy", flag: "🇮🇹", iso: "IT" },
  { code: "+34", country: "Spain", flag: "🇪🇸", iso: "ES" },
  { code: "+31", country: "Netherlands", flag: "🇳🇱", iso: "NL" },
  { code: "+41", country: "Switzerland", flag: "🇨🇭", iso: "CH" },
  { code: "+46", country: "Sweden", flag: "🇸🇪", iso: "SE" },
  { code: "+47", country: "Norway", flag: "🇳🇴", iso: "NO" },
  { code: "+45", country: "Denmark", flag: "🇩🇰", iso: "DK" },
  { code: "+971", country: "UAE", flag: "🇦🇪", iso: "AE" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦", iso: "SA" },
  { code: "+92", country: "Pakistan", flag: "🇵🇰", iso: "PK" },
  { code: "+880", country: "Bangladesh", flag: "🇧🇩", iso: "BD" },
  { code: "+94", country: "Sri Lanka", flag: "🇱🇰", iso: "LK" },
  { code: "+65", country: "Singapore", flag: "🇸🇬", iso: "SG" },
  { code: "+60", country: "Malaysia", flag: "🇲🇾", iso: "MY" },
  { code: "+66", country: "Thailand", flag: "🇹🇭", iso: "TH" },
  { code: "+84", country: "Vietnam", flag: "🇻🇳", iso: "VN" },
  { code: "+63", country: "Philippines", flag: "🇵🇭", iso: "PH" },
  { code: "+62", country: "Indonesia", flag: "🇮🇩", iso: "ID" },
]

interface WhatsAppStylePhoneProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  label?: string
  required?: boolean
}

export function WhatsAppStylePhone({
  value,
  onChange,
  placeholder = "9876543210",
  disabled = false,
  label = "Phone Number",
  required = false,
}: WhatsAppStylePhoneProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCountry, setSelectedCountry] = useState(countries.find((c) => c.iso === "IN") || countries[0])
  const [phoneNumber, setPhoneNumber] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  // Extract country code and phone number from value
  useEffect(() => {
    if (value) {
      try {
        const foundCountry = countries.find((c) => value.startsWith(c.code))
        if (foundCountry) {
          setSelectedCountry(foundCountry)
          setPhoneNumber(value.replace(foundCountry.code, "").trim())
        } else {
          // If no country code is found, it might be just the phone number
          setPhoneNumber(value)
        }
      } catch (e) {
        console.error("Error parsing phone number:", e)
        setError("Invalid phone number format")
      }
    }
  }, [value])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleCountrySelect = (country: (typeof countries)[0]) => {
    setSelectedCountry(country)
    setIsOpen(false)
    setSearchTerm("")
    const fullNumber = phoneNumber ? `${country.code} ${phoneNumber}` : `${country.code} `
    onChange(fullNumber)
    setError(null)
  }

  const handlePhoneNumberChange = (number: string) => {
    // Only allow numbers, spaces, and hyphens
    const cleanNumber = number.replace(/[^\d\s-]/g, "")
    setPhoneNumber(cleanNumber)
    const fullNumber = cleanNumber ? `${selectedCountry.code} ${cleanNumber}` : `${selectedCountry.code} `
    onChange(fullNumber)
    setError(null)
  }

  const filteredCountries = countries.filter(
    (country) =>
      country.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.includes(searchTerm) ||
      country.iso.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium text-orange-600 flex items-center gap-2">
          <Phone className="h-4 w-4" />
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <div className="relative" ref={dropdownRef}>
        {/* Main Input Container */}
        <div
          className={`flex border-2 ${error ? "border-red-500" : "border-orange-200"} rounded-lg overflow-hidden hover:border-orange-400 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200 bg-white`}
        >
          {/* Country Selector Button */}
          <Button
            type="button"
            variant="ghost"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className="flex items-center gap-2 px-3 py-2 h-12 border-0 rounded-none border-r-2 border-orange-200 hover:bg-orange-50 focus:bg-orange-50 min-w-[80px]"
          >
            <span className="text-xl">{selectedCountry.flag}</span>
            <ChevronDown className={`h-4 w-4 text-orange-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </Button>

          {/* Country Code Display */}
          <div className="flex items-center px-3 py-2 bg-orange-50 border-r-2 border-orange-200 min-w-[60px]">
            <span className="text-sm font-mono font-medium text-orange-700">{selectedCountry.code}</span>
          </div>

          {/* Phone Number Input */}
          <Input
            type="tel"
            value={phoneNumber}
            onChange={(e) => handlePhoneNumberChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 border-0 rounded-none font-mono focus-visible:ring-0 h-12 text-gray-800 placeholder:text-gray-400"
          />
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-orange-200 rounded-lg shadow-xl z-50 max-h-80 overflow-hidden">
            {/* Search Input */}
            <div className="p-3 border-b border-orange-100 bg-orange-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-400" />
                <Input
                  type="text"
                  placeholder="Search country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-orange-200 focus:border-orange-500 focus:ring-orange-200"
                />
              </div>
            </div>

            {/* Countries List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredCountries.map((country) => (
                <button
                  key={`${country.iso}-${country.code}`}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={`w-full flex items-center justify-between px-4 py-3 hover:bg-orange-50 focus:bg-orange-50 focus:outline-none text-left transition-colors ${
                    selectedCountry.iso === country.iso ? "bg-orange-100 border-l-4 border-orange-500" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{country.flag}</span>
                    <span className="text-sm font-medium text-gray-900">{country.country}</span>
                  </div>
                  <span className="text-sm font-mono text-orange-600 font-medium">{country.code}</span>
                </button>
              ))}

              {filteredCountries.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No countries found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Helper Text */}
      <p className="text-xs text-gray-500 flex items-center gap-1">
        <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
        Complete number:{" "}
        <span className="font-mono text-orange-600">
          {selectedCountry.code} {phoneNumber || placeholder}
        </span>
      </p>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}
