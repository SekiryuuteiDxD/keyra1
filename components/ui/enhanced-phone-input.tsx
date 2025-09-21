"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { ChevronDown, Search, X } from "lucide-react"

interface Country {
  name: string
  code: string
  dialCode: string
  flag: string
  region: string
}

const countries: Country[] = [
  // Popular countries first
  { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸", region: "Americas" },
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧", region: "Europe" },
  { name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳", region: "Asia" },
  { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦", region: "Americas" },
  { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺", region: "Oceania" },

  // All other countries
  { name: "Afghanistan", code: "AF", dialCode: "+93", flag: "🇦🇫", region: "Asia" },
  { name: "Albania", code: "AL", dialCode: "+355", flag: "🇦🇱", region: "Europe" },
  { name: "Algeria", code: "DZ", dialCode: "+213", flag: "🇩🇿", region: "Africa" },
  { name: "Argentina", code: "AR", dialCode: "+54", flag: "🇦🇷", region: "Americas" },
  { name: "Armenia", code: "AM", dialCode: "+374", flag: "🇦🇲", region: "Asia" },
  { name: "Austria", code: "AT", dialCode: "+43", flag: "🇦🇹", region: "Europe" },
  { name: "Azerbaijan", code: "AZ", dialCode: "+994", flag: "🇦🇿", region: "Asia" },
  { name: "Bahrain", code: "BH", dialCode: "+973", flag: "🇧🇭", region: "Asia" },
  { name: "Bangladesh", code: "BD", dialCode: "+880", flag: "🇧🇩", region: "Asia" },
  { name: "Belarus", code: "BY", dialCode: "+375", flag: "🇧🇾", region: "Europe" },
  { name: "Belgium", code: "BE", dialCode: "+32", flag: "🇧🇪", region: "Europe" },
  { name: "Brazil", code: "BR", dialCode: "+55", flag: "🇧🇷", region: "Americas" },
  { name: "Bulgaria", code: "BG", dialCode: "+359", flag: "🇧🇬", region: "Europe" },
  { name: "Cambodia", code: "KH", dialCode: "+855", flag: "🇰🇭", region: "Asia" },
  { name: "Cameroon", code: "CM", dialCode: "+237", flag: "🇨🇲", region: "Africa" },
  { name: "Chile", code: "CL", dialCode: "+56", flag: "🇨🇱", region: "Americas" },
  { name: "China", code: "CN", dialCode: "+86", flag: "🇨🇳", region: "Asia" },
  { name: "Colombia", code: "CO", dialCode: "+57", flag: "🇨🇴", region: "Americas" },
  { name: "Croatia", code: "HR", dialCode: "+385", flag: "🇭🇷", region: "Europe" },
  { name: "Czech Republic", code: "CZ", dialCode: "+420", flag: "🇨🇿", region: "Europe" },
  { name: "Denmark", code: "DK", dialCode: "+45", flag: "🇩🇰", region: "Europe" },
  { name: "Egypt", code: "EG", dialCode: "+20", flag: "🇪🇬", region: "Africa" },
  { name: "Estonia", code: "EE", dialCode: "+372", flag: "🇪🇪", region: "Europe" },
  { name: "Finland", code: "FI", dialCode: "+358", flag: "🇫🇮", region: "Europe" },
  { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷", region: "Europe" },
  { name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪", region: "Europe" },
  { name: "Ghana", code: "GH", dialCode: "+233", flag: "🇬🇭", region: "Africa" },
  { name: "Greece", code: "GR", dialCode: "+30", flag: "🇬🇷", region: "Europe" },
  { name: "Hungary", code: "HU", dialCode: "+36", flag: "🇭🇺", region: "Europe" },
  { name: "Iceland", code: "IS", dialCode: "+354", flag: "🇮🇸", region: "Europe" },
  { name: "Indonesia", code: "ID", dialCode: "+62", flag: "🇮🇩", region: "Asia" },
  { name: "Iran", code: "IR", dialCode: "+98", flag: "🇮🇷", region: "Asia" },
  { name: "Iraq", code: "IQ", dialCode: "+964", flag: "🇮🇶", region: "Asia" },
  { name: "Ireland", code: "IE", dialCode: "+353", flag: "🇮🇪", region: "Europe" },
  { name: "Israel", code: "IL", dialCode: "+972", flag: "🇮🇱", region: "Asia" },
  { name: "Italy", code: "IT", dialCode: "+39", flag: "🇮🇹", region: "Europe" },
  { name: "Japan", code: "JP", dialCode: "+81", flag: "🇯🇵", region: "Asia" },
  { name: "Jordan", code: "JO", dialCode: "+962", flag: "🇯🇴", region: "Asia" },
  { name: "Kazakhstan", code: "KZ", dialCode: "+7", flag: "🇰🇿", region: "Asia" },
  { name: "Kenya", code: "KE", dialCode: "+254", flag: "🇰🇪", region: "Africa" },
  { name: "Kuwait", code: "KW", dialCode: "+965", flag: "🇰🇼", region: "Asia" },
  { name: "Latvia", code: "LV", dialCode: "+371", flag: "🇱🇻", region: "Europe" },
  { name: "Lebanon", code: "LB", dialCode: "+961", flag: "🇱🇧", region: "Asia" },
  { name: "Lithuania", code: "LT", dialCode: "+370", flag: "🇱🇹", region: "Europe" },
  { name: "Luxembourg", code: "LU", dialCode: "+352", flag: "🇱🇺", region: "Europe" },
  { name: "Malaysia", code: "MY", dialCode: "+60", flag: "🇲🇾", region: "Asia" },
  { name: "Mexico", code: "MX", dialCode: "+52", flag: "🇲🇽", region: "Americas" },
  { name: "Morocco", code: "MA", dialCode: "+212", flag: "🇲🇦", region: "Africa" },
  { name: "Netherlands", code: "NL", dialCode: "+31", flag: "🇳🇱", region: "Europe" },
  { name: "New Zealand", code: "NZ", dialCode: "+64", flag: "🇳🇿", region: "Oceania" },
  { name: "Nigeria", code: "NG", dialCode: "+234", flag: "🇳🇬", region: "Africa" },
  { name: "Norway", code: "NO", dialCode: "+47", flag: "🇳🇴", region: "Europe" },
  { name: "Pakistan", code: "PK", dialCode: "+92", flag: "🇵🇰", region: "Asia" },
  { name: "Philippines", code: "PH", dialCode: "+63", flag: "🇵🇭", region: "Asia" },
  { name: "Poland", code: "PL", dialCode: "+48", flag: "🇵🇱", region: "Europe" },
  { name: "Portugal", code: "PT", dialCode: "+351", flag: "🇵🇹", region: "Europe" },
  { name: "Qatar", code: "QA", dialCode: "+974", flag: "🇶🇦", region: "Asia" },
  { name: "Romania", code: "RO", dialCode: "+40", flag: "🇷🇴", region: "Europe" },
  { name: "Russia", code: "RU", dialCode: "+7", flag: "🇷🇺", region: "Europe" },
  { name: "Saudi Arabia", code: "SA", dialCode: "+966", flag: "🇸🇦", region: "Asia" },
  { name: "Singapore", code: "SG", dialCode: "+65", flag: "🇸🇬", region: "Asia" },
  { name: "Slovakia", code: "SK", dialCode: "+421", flag: "🇸🇰", region: "Europe" },
  { name: "Slovenia", code: "SI", dialCode: "+386", flag: "🇸🇮", region: "Europe" },
  { name: "South Africa", code: "ZA", dialCode: "+27", flag: "🇿🇦", region: "Africa" },
  { name: "South Korea", code: "KR", dialCode: "+82", flag: "🇰🇷", region: "Asia" },
  { name: "Spain", code: "ES", dialCode: "+34", flag: "🇪🇸", region: "Europe" },
  { name: "Sri Lanka", code: "LK", dialCode: "+94", flag: "🇱🇰", region: "Asia" },
  { name: "Sweden", code: "SE", dialCode: "+46", flag: "🇸🇪", region: "Europe" },
  { name: "Switzerland", code: "CH", dialCode: "+41", flag: "🇨🇭", region: "Europe" },
  { name: "Thailand", code: "TH", dialCode: "+66", flag: "🇹🇭", region: "Asia" },
  { name: "Turkey", code: "TR", dialCode: "+90", flag: "🇹🇷", region: "Asia" },
  { name: "Ukraine", code: "UA", dialCode: "+380", flag: "🇺🇦", region: "Europe" },
  { name: "United Arab Emirates", code: "AE", dialCode: "+971", flag: "🇦🇪", region: "Asia" },
  { name: "Uruguay", code: "UY", dialCode: "+598", flag: "🇺🇾", region: "Americas" },
  { name: "Venezuela", code: "VE", dialCode: "+58", flag: "🇻🇪", region: "Americas" },
  { name: "Vietnam", code: "VN", dialCode: "+84", flag: "🇻🇳", region: "Asia" },
]

interface EnhancedPhoneInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export function EnhancedPhoneInput({
  value = "",
  onChange,
  placeholder = "Enter phone number",
  className = "",
}: EnhancedPhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[2]) // Default to India
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRegion, setSelectedRegion] = useState<string>("All")

  const regions = ["All", "Asia", "Europe", "Americas", "Africa", "Oceania"]

  const filteredCountries = useMemo(() => {
    return countries.filter((country) => {
      const matchesSearch =
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.dialCode.includes(searchTerm) ||
        country.code.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRegion = selectedRegion === "All" || country.region === selectedRegion
      return matchesSearch && matchesRegion
    })
  }, [searchTerm, selectedRegion])

  useEffect(() => {
    const fullNumber = phoneNumber ? `${selectedCountry.dialCode} ${phoneNumber}` : ""
    if (onChange && fullNumber !== value) {
      onChange(fullNumber)
    }
  }, [selectedCountry.dialCode, phoneNumber]) // Removed onChange and value from dependencies

  useEffect(() => {
    if (value && value !== `${selectedCountry.dialCode} ${phoneNumber}`) {
      // Parse existing value
      const parts = value.split(" ")
      if (parts.length >= 2) {
        const dialCode = parts[0]
        const number = parts.slice(1).join(" ")
        const country = countries.find((c) => c.dialCode === dialCode)
        if (country && country.code !== selectedCountry.code) {
          setSelectedCountry(country)
        }
        if (number !== phoneNumber) {
          setPhoneNumber(number)
        }
      }
    }
  }, [value]) // Only depend on value prop

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    // Only allow numbers, spaces, hyphens, and parentheses
    const cleaned = input.replace(/[^\d\s\-()]/g, "")
    setPhoneNumber(cleaned)
  }

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country)
    setIsOpen(false)
    setSearchTerm("")
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex">
        {/* Country Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 z-50 w-80 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
              {/* Search and Filter */}
              <div className="p-3 border-b border-gray-200">
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search countries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Region Filter */}
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full py-1 px-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              {/* Countries List */}
              <div className="max-h-60 overflow-y-auto">
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
                      selectedCountry.code === country.code ? "bg-blue-50 text-blue-600" : ""
                    }`}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{country.name}</div>
                      <div className="text-xs text-gray-500">{country.region}</div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">{country.dialCode}</span>
                  </button>
                ))}
                {filteredCountries.length === 0 && (
                  <div className="px-3 py-4 text-center text-gray-500">No countries found</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Full Number Preview */}
      {phoneNumber && (
        <div className="mt-1 text-sm text-gray-600">
          Complete number:{" "}
          <span className="font-medium">
            {selectedCountry.dialCode} {phoneNumber}
          </span>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  )
}

// Also export as default for compatibility
export default EnhancedPhoneInput
