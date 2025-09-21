"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { EnhancedPhoneInput } from "@/components/ui/enhanced-phone-input"
import {
  Menu,
  Settings,
  Camera,
  Edit,
  Save,
  User,
  X,
  Globe,
  Briefcase,
  Heart,
  Star,
  Plus,
  Trash2,
  MapPin,
  GraduationCap,
  Languages,
  Gamepad2,
  Shield,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface UserSession {
  id: string
  name: string
  email: string
  phone: string
  isLoggedIn: boolean
  loginTime: string
  userType?: string
}

interface WorkExperience {
  company: string
  position: string
  duration: string
  description: string
}

interface EmergencyContact {
  name: string
  phone: string
  relationship: string
}

interface SocialMedia {
  linkedin?: string
  twitter?: string
  instagram?: string
  facebook?: string
  github?: string
  youtube?: string
  tiktok?: string
}

interface UserProfile {
  name: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  company: string
  jobTitle: string
  department: string
  employeeId: string
  workLocation: string
  bio: string
  avatar: string
  address: string
  city: string
  state: string
  country: string
  zipCode: string
  website: string
  education: string
  skills: string[]
  languages: string[]
  interests: string[]
  socialMedia: SocialMedia
  isPublic: boolean
  showEmail: boolean
  showPhone: boolean
  showAddress: boolean
  showSocialMedia: boolean
  emergencyContact: EmergencyContact
  personalInterests: string[]
  favoriteQuotes: string[]
  achievements: string[]
  certifications: string[]
  workExperience: WorkExperience[]
}

const getDefaultProfile = (): UserProfile => ({
  name: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  company: "",
  jobTitle: "",
  department: "",
  employeeId: "",
  workLocation: "",
  bio: "",
  avatar: "",
  address: "",
  city: "",
  state: "",
  country: "",
  zipCode: "",
  website: "",
  education: "",
  skills: [],
  languages: [],
  interests: [],
  socialMedia: {
    linkedin: "",
    twitter: "",
    instagram: "",
    facebook: "",
    github: "",
    youtube: "",
    tiktok: "",
  },
  isPublic: true,
  showEmail: true,
  showPhone: false,
  showAddress: false,
  showSocialMedia: true,
  emergencyContact: {
    name: "",
    phone: "",
    relationship: "",
  },
  personalInterests: [],
  favoriteQuotes: [],
  achievements: [],
  certifications: [],
  workExperience: [],
})

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [activeSection, setActiveSection] = useState("basic")
  const [profile, setProfile] = useState<UserProfile>(getDefaultProfile())
  const [originalProfile, setOriginalProfile] = useState<UserProfile>(getDefaultProfile())
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string>("")
  const [newSkill, setNewSkill] = useState("")
  const [newLanguage, setNewLanguage] = useState("")
  const [newInterest, setNewInterest] = useState("")
  const [newPersonalInterest, setNewPersonalInterest] = useState("")
  const [newQuote, setNewQuote] = useState("")
  const [newAchievement, setNewAchievement] = useState("")
  const [newCertification, setNewCertification] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [userSession, setUserSession] = useState<UserSession | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    try {
      const sessionData = localStorage.getItem("keyra-user-session")
      if (sessionData) {
        const session = JSON.parse(sessionData)
        if (session.isLoggedIn) {
          setUserSession(session)
          loadUserProfile(session.id)
        } else {
          router.push("/auth")
        }
      } else {
        router.push("/auth")
      }
    } catch (error) {
      console.error("Error checking auth:", error)
      router.push("/auth")
    } finally {
      setIsCheckingAuth(false)
    }
  }

  const safeParseProfile = (profileData: any): UserProfile => {
    const defaultProfile = getDefaultProfile()

    if (!profileData || typeof profileData !== "object") {
      return defaultProfile
    }

    return {
      name: profileData.name || defaultProfile.name,
      email: profileData.email || defaultProfile.email,
      phone: profileData.phone || defaultProfile.phone,
      dateOfBirth: profileData.dateOfBirth || defaultProfile.dateOfBirth,
      gender: profileData.gender || defaultProfile.gender,
      company: profileData.company || defaultProfile.company,
      jobTitle: profileData.jobTitle || defaultProfile.jobTitle,
      department: profileData.department || defaultProfile.department,
      employeeId: profileData.employeeId || defaultProfile.employeeId,
      workLocation: profileData.workLocation || defaultProfile.workLocation,
      bio: profileData.bio || defaultProfile.bio,
      avatar: profileData.avatar || defaultProfile.avatar,
      address: profileData.address || defaultProfile.address,
      city: profileData.city || defaultProfile.city,
      state: profileData.state || defaultProfile.state,
      country: profileData.country || defaultProfile.country,
      zipCode: profileData.zipCode || defaultProfile.zipCode,
      website: profileData.website || defaultProfile.website,
      education: profileData.education || defaultProfile.education,
      skills: Array.isArray(profileData.skills) ? profileData.skills : defaultProfile.skills,
      languages: Array.isArray(profileData.languages) ? profileData.languages : defaultProfile.languages,
      interests: Array.isArray(profileData.interests) ? profileData.interests : defaultProfile.interests,
      socialMedia: {
        linkedin: profileData.socialMedia?.linkedin || defaultProfile.socialMedia.linkedin,
        twitter: profileData.socialMedia?.twitter || defaultProfile.socialMedia.twitter,
        instagram: profileData.socialMedia?.instagram || defaultProfile.socialMedia.instagram,
        facebook: profileData.socialMedia?.facebook || defaultProfile.socialMedia.facebook,
        github: profileData.socialMedia?.github || defaultProfile.socialMedia.github,
        youtube: profileData.socialMedia?.youtube || defaultProfile.socialMedia.youtube,
        tiktok: profileData.socialMedia?.tiktok || defaultProfile.socialMedia.tiktok,
      },
      isPublic: profileData.isPublic !== undefined ? profileData.isPublic : defaultProfile.isPublic,
      showEmail: profileData.showEmail !== undefined ? profileData.showEmail : defaultProfile.showEmail,
      showPhone: profileData.showPhone !== undefined ? profileData.showPhone : defaultProfile.showPhone,
      showAddress: profileData.showAddress !== undefined ? profileData.showAddress : defaultProfile.showAddress,
      showSocialMedia:
        profileData.showSocialMedia !== undefined ? profileData.showSocialMedia : defaultProfile.showSocialMedia,
      emergencyContact: {
        name: profileData.emergencyContact?.name || defaultProfile.emergencyContact.name,
        phone: profileData.emergencyContact?.phone || defaultProfile.emergencyContact.phone,
        relationship: profileData.emergencyContact?.relationship || defaultProfile.emergencyContact.relationship,
      },
      personalInterests: Array.isArray(profileData.personalInterests)
        ? profileData.personalInterests
        : defaultProfile.personalInterests,
      favoriteQuotes: Array.isArray(profileData.favoriteQuotes)
        ? profileData.favoriteQuotes
        : defaultProfile.favoriteQuotes,
      achievements: Array.isArray(profileData.achievements) ? profileData.achievements : defaultProfile.achievements,
      certifications: Array.isArray(profileData.certifications)
        ? profileData.certifications
        : defaultProfile.certifications,
      workExperience: Array.isArray(profileData.workExperience)
        ? profileData.workExperience
        : defaultProfile.workExperience,
    }
  }

  const loadUserProfile = (userId: string) => {
    try {
      const savedProfile = localStorage.getItem(`keyra-profile-${userId}`)
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile)
        const safeProfile = safeParseProfile(profileData)
        setProfile(safeProfile)
        setOriginalProfile(safeProfile)
      } else {
        const sessionData = localStorage.getItem("keyra-user-session")
        if (sessionData) {
          const session = JSON.parse(sessionData)
          const initialProfile: UserProfile = {
            ...getDefaultProfile(),
            name: session.name || "",
            email: session.email || "",
            phone: session.phone || "+91 ",
            employeeId: `EMP${Date.now().toString().slice(-6)}`,
            bio: "QR Code enthusiast using Keyra",
            country: "India",
            languages: ["English"],
          }
          setProfile(initialProfile)
          setOriginalProfile(initialProfile)
          localStorage.setItem(`keyra-profile-${userId}`, JSON.stringify(initialProfile))
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      const defaultProfile = getDefaultProfile()
      setProfile(defaultProfile)
      setOriginalProfile(defaultProfile)
    }
  }

  const handleSave = () => {
    if (!userSession) return

    // Validation
    if (!profile.name.trim()) {
      alert("❌ Name is required!")
      return
    }

    if (!profile.email.trim()) {
      alert("❌ Email is required!")
      return
    }

    if (!profile.phone.trim()) {
      alert("❌ Phone number is required!")
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(profile.email)) {
      alert("❌ Please enter a valid email address!")
      return
    }

    try {
      localStorage.setItem(`keyra-profile-${userSession.id}`, JSON.stringify(profile))

      const updatedSession = {
        ...userSession,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      }
      localStorage.setItem("keyra-user-session", JSON.stringify(updatedSession))
      setUserSession(updatedSession)

      setOriginalProfile({ ...profile })
      setIsEditing(false)

      // Success feedback
      const successMessage = "✅ Profile updated successfully!"
      alert(successMessage)

      // Optional: Show toast notification instead of alert
      // You can replace alert with a toast notification system
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("❌ Failed to save profile. Please try again.")
    }
  }

  const handleCancel = () => {
    setProfile({ ...originalProfile })
    setPreviewImage("")
    setIsEditing(false)
    setActiveSection("basic")
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("❌ Image size should be less than 5MB.")
        return
      }

      if (!file.type.startsWith("image/")) {
        alert("❌ Please select a valid image file.")
        return
      }

      setIsUploading(true)
      const reader = new FileReader()

      reader.onload = (e) => {
        const result = e.target?.result as string
        setPreviewImage(result)
        setProfile({ ...profile, avatar: result })
        setIsUploading(false)
        setTimeout(() => {
          alert("✅ Photo uploaded successfully!")
        }, 500)
      }

      reader.onerror = () => {
        alert("❌ Failed to read image file.")
        setIsUploading(false)
      }

      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setProfile({ ...profile, avatar: "" })
    setPreviewImage("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const triggerImageUpload = () => {
    fileInputRef.current?.click()
  }

  // Helper functions for managing arrays
  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] })
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setProfile({ ...profile, skills: profile.skills.filter((s) => s !== skill) })
  }

  const addLanguage = () => {
    if (newLanguage.trim() && !profile.languages.includes(newLanguage.trim())) {
      setProfile({ ...profile, languages: [...profile.languages, newLanguage.trim()] })
      setNewLanguage("")
    }
  }

  const removeLanguage = (language: string) => {
    setProfile({ ...profile, languages: profile.languages.filter((l) => l !== language) })
  }

  const addInterest = () => {
    if (newInterest.trim() && !profile.interests.includes(newInterest.trim())) {
      setProfile({ ...profile, interests: [...profile.interests, newInterest.trim()] })
      setNewInterest("")
    }
  }

  const removeInterest = (interest: string) => {
    setProfile({ ...profile, interests: profile.interests.filter((i) => i !== interest) })
  }

  const addPersonalInterest = () => {
    if (newPersonalInterest.trim() && !profile.personalInterests.includes(newPersonalInterest.trim())) {
      setProfile({ ...profile, personalInterests: [...profile.personalInterests, newPersonalInterest.trim()] })
      setNewPersonalInterest("")
    }
  }

  const removePersonalInterest = (interest: string) => {
    setProfile({ ...profile, personalInterests: profile.personalInterests.filter((i) => i !== interest) })
  }

  const addQuote = () => {
    if (newQuote.trim() && !profile.favoriteQuotes.includes(newQuote.trim())) {
      setProfile({ ...profile, favoriteQuotes: [...profile.favoriteQuotes, newQuote.trim()] })
      setNewQuote("")
    }
  }

  const removeQuote = (quote: string) => {
    setProfile({ ...profile, favoriteQuotes: profile.favoriteQuotes.filter((q) => q !== quote) })
  }

  const addAchievement = () => {
    if (newAchievement.trim() && !profile.achievements.includes(newAchievement.trim())) {
      setProfile({ ...profile, achievements: [...profile.achievements, newAchievement.trim()] })
      setNewAchievement("")
    }
  }

  const removeAchievement = (achievement: string) => {
    setProfile({ ...profile, achievements: profile.achievements.filter((a) => a !== achievement) })
  }

  const addCertification = () => {
    if (newCertification.trim() && !profile.certifications.includes(newCertification.trim())) {
      setProfile({ ...profile, certifications: [...profile.certifications, newCertification.trim()] })
      setNewCertification("")
    }
  }

  const removeCertification = (certification: string) => {
    setProfile({ ...profile, certifications: profile.certifications.filter((c) => c !== certification) })
  }

  const addWorkExperience = () => {
    setProfile({
      ...profile,
      workExperience: [
        ...profile.workExperience,
        {
          company: "",
          position: "",
          duration: "",
          description: "",
        },
      ],
    })
  }

  const updateWorkExperience = (index: number, field: string, value: string) => {
    const updated = profile.workExperience.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp))
    setProfile({ ...profile, workExperience: updated })
  }

  const removeWorkExperience = (index: number) => {
    setProfile({
      ...profile,
      workExperience: profile.workExperience.filter((_, i) => i !== index),
    })
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  const sections = [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "professional", label: "Professional", icon: Briefcase },
    { id: "personal", label: "Personal", icon: Heart },
    { id: "additional", label: "Additional", icon: Star },
    { id: "social", label: "Social", icon: Globe },
    { id: "privacy", label: "Privacy", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-50">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold text-orange-500">Profile</h1>
        <div className="flex items-center gap-2">
          {isEditing && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant={isEditing ? "default" : "ghost"}
            size="icon"
            onClick={() => {
              if (isEditing) {
                handleSave()
              } else {
                setIsEditing(true)
              }
            }}
            className={isEditing ? "bg-green-600 hover:bg-green-700 text-white" : ""}
          >
            {isEditing ? <Save className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-6 max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="bg-gradient-to-r from-orange-50 to-pink-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group cursor-pointer" onClick={isEditing ? triggerImageUpload : undefined}>
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage
                    src={previewImage || profile.avatar || "/placeholder.svg?height=128&width=128"}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-3xl bg-gradient-to-r from-orange-400 to-pink-400 text-white">
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                {isEditing && (
                  <div className="absolute -bottom-2 -right-2 flex gap-2">
                    <Button
                      size="icon"
                      className="rounded-full w-10 h-10 bg-blue-500 hover:bg-blue-600 shadow-lg"
                      onClick={triggerImageUpload}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                    {(profile.avatar || previewImage) && (
                      <Button
                        size="icon"
                        className="rounded-full w-10 h-10 bg-red-500 hover:bg-red-600 shadow-lg"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">{profile.name || "Your Name"}</h2>
                <p className="text-gray-600">{profile.jobTitle || "Your Job Title"}</p>
                <p className="text-gray-500">{profile.company || "Your Company"}</p>
                <p className="text-sm text-gray-500">ID: {profile.employeeId}</p>
                {profile.bio && <p className="text-sm text-gray-600 mt-2 max-w-md">{profile.bio}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Navigation */}
        {isEditing && (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveSection(section.id)}
                      className={`flex items-center gap-2 ${
                        activeSection === section.id ? "bg-gray-900 text-white hover:bg-gray-800" : "hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {section.label}
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Basic Information */}
        {(!isEditing || activeSection === "basic") && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="flex items-center gap-1">
                    Full Name
                    <span className="text-red-500">*</span>
                    {isEditing && !profile.name.trim() && <span className="text-xs text-red-500">(Required)</span>}
                  </Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Enter your full name"
                    className={isEditing && !profile.name.trim() ? "border-red-300 focus:border-red-500" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="flex items-center gap-1">
                    Email
                    <span className="text-red-500">*</span>
                    {isEditing && !profile.email.trim() && <span className="text-xs text-red-500">(Required)</span>}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    disabled={!isEditing}
                    placeholder="your.email@example.com"
                    className={isEditing && !profile.email.trim() ? "border-red-300 focus:border-red-500" : ""}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Phone Number *</Label>
                  <EnhancedPhoneInput
                    value={profile.phone}
                    onChange={(value) => setProfile({ ...profile, phone: value })}
                    placeholder="Phone number"
                    className="mt-1"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  {isEditing ? (
                    <Select value={profile.gender} onValueChange={(value) => setProfile({ ...profile, gender: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={profile.gender || "Not specified"} disabled />
                  )}
                </div>
                <div>
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    value={profile.employeeId}
                    onChange={(e) => setProfile({ ...profile, employeeId: e.target.value })}
                    disabled={!isEditing}
                    placeholder="EMP123456"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>

              {/* Address Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      disabled={!isEditing}
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profile.city}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Mumbai"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={profile.state}
                      onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Maharashtra"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={profile.country}
                      onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                      disabled={!isEditing}
                      placeholder="India"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={profile.zipCode}
                      onChange={(e) => setProfile({ ...profile, zipCode: e.target.value })}
                      disabled={!isEditing}
                      placeholder="400001"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Professional Information */}
        {(!isEditing || activeSection === "professional") && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profile.company}
                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Your Company Name"
                  />
                </div>
                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={profile.jobTitle}
                    onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Software Engineer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={profile.department}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Engineering"
                  />
                </div>
                <div>
                  <Label htmlFor="workLocation">Work Location</Label>
                  <Input
                    id="workLocation"
                    value={profile.workLocation}
                    onChange={(e) => setProfile({ ...profile, workLocation: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Mumbai, India"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  disabled={!isEditing}
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div>
                <Label htmlFor="education">Education</Label>
                <Textarea
                  id="education"
                  value={profile.education}
                  onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Bachelor's in Computer Science, XYZ University"
                  rows={2}
                />
              </div>

              {/* Skills Section */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Skills
                </Label>
                <div className="flex flex-wrap gap-2">
                  {(profile.skills || []).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      {isEditing && (
                        <button onClick={() => removeSkill(skill)} className="ml-1 text-red-500 hover:text-red-700">
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                      onKeyPress={(e) => e.key === "Enter" && addSkill()}
                    />
                    <Button onClick={addSkill} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Work Experience */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Work Experience
                  </Label>
                  {isEditing && (
                    <Button onClick={addWorkExperience} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Experience
                    </Button>
                  )}
                </div>
                {(profile.workExperience || []).map((exp, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Experience {index + 1}</h4>
                        {isEditing && (
                          <Button
                            onClick={() => removeWorkExperience(index)}
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          value={exp.company}
                          onChange={(e) => updateWorkExperience(index, "company", e.target.value)}
                          disabled={!isEditing}
                          placeholder="Company Name"
                        />
                        <Input
                          value={exp.position}
                          onChange={(e) => updateWorkExperience(index, "position", e.target.value)}
                          disabled={!isEditing}
                          placeholder="Position"
                        />
                      </div>
                      <Input
                        value={exp.duration}
                        onChange={(e) => updateWorkExperience(index, "duration", e.target.value)}
                        disabled={!isEditing}
                        placeholder="Duration (e.g., Jan 2020 - Dec 2022)"
                      />
                      <Textarea
                        value={exp.description}
                        onChange={(e) => updateWorkExperience(index, "description", e.target.value)}
                        disabled={!isEditing}
                        placeholder="Job description and achievements"
                        rows={2}
                      />
                    </div>
                  </Card>
                ))}
              </div>

              {/* Certifications */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Certifications
                </Label>
                <div className="flex flex-wrap gap-2">
                  {(profile.certifications || []).map((cert, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {cert}
                      {isEditing && (
                        <button
                          onClick={() => removeCertification(cert)}
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      placeholder="Add a certification"
                      onKeyPress={(e) => e.key === "Enter" && addCertification()}
                    />
                    <Button onClick={addCertification} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personal Information */}
        {(!isEditing || activeSection === "personal") && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Emergency Contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="emergencyName">Name</Label>
                    <Input
                      id="emergencyName"
                      value={profile.emergencyContact.name}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          emergencyContact: { ...profile.emergencyContact, name: e.target.value },
                        })
                      }
                      disabled={!isEditing}
                      placeholder="Emergency contact name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyPhone">Phone</Label>
                    <Input
                      id="emergencyPhone"
                      value={profile.emergencyContact.phone}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          emergencyContact: { ...profile.emergencyContact, phone: e.target.value },
                        })
                      }
                      disabled={!isEditing}
                      placeholder="+91 883 907 3733"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyRelationship">Relationship</Label>
                    <Input
                      id="emergencyRelationship"
                      value={profile.emergencyContact.relationship}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          emergencyContact: { ...profile.emergencyContact, relationship: e.target.value },
                        })
                      }
                      disabled={!isEditing}
                      placeholder="Father, Mother, Spouse, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Languages */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Languages
                </Label>
                <div className="flex flex-wrap gap-2">
                  {(profile.languages || []).map((language, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {language}
                      {isEditing && (
                        <button
                          onClick={() => removeLanguage(language)}
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      placeholder="Add a language"
                      onKeyPress={(e) => e.key === "Enter" && addLanguage()}
                    />
                    <Button onClick={addLanguage} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Personal Interests */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4" />
                  Personal Interests
                </Label>
                <div className="flex flex-wrap gap-2">
                  {(profile.personalInterests || []).map((interest, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {interest}
                      {isEditing && (
                        <button
                          onClick={() => removePersonalInterest(interest)}
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      value={newPersonalInterest}
                      onChange={(e) => setNewPersonalInterest(e.target.value)}
                      placeholder="Add a personal interest"
                      onKeyPress={(e) => e.key === "Enter" && addPersonalInterest()}
                    />
                    <Button onClick={addPersonalInterest} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Favorite Quotes */}
              <div className="space-y-3">
                <Label>Favorite Quotes</Label>
                <div className="space-y-2">
                  {(profile.favoriteQuotes || []).map((quote, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 italic">"{quote}"</span>
                      {isEditing && (
                        <button
                          onClick={() => removeQuote(quote)}
                          className="text-red-500 hover:text-red-700 flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      value={newQuote}
                      onChange={(e) => setNewQuote(e.target.value)}
                      placeholder="Add a favorite quote"
                      onKeyPress={(e) => e.key === "Enter" && addQuote()}
                    />
                    <Button onClick={addQuote} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Information */}
        {(!isEditing || activeSection === "additional") && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Professional Interests */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Professional Interests
                </Label>
                <div className="flex flex-wrap gap-2">
                  {(profile.interests || []).map((interest, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {interest}
                      {isEditing && (
                        <button
                          onClick={() => removeInterest(interest)}
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      placeholder="Add a professional interest"
                      onKeyPress={(e) => e.key === "Enter" && addInterest()}
                    />
                    <Button onClick={addInterest} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Achievements */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Achievements
                </Label>
                <div className="space-y-2">
                  {(profile.achievements || []).map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400"
                    >
                      <span className="text-gray-700">{achievement}</span>
                      {isEditing && (
                        <button
                          onClick={() => removeAchievement(achievement)}
                          className="text-red-500 hover:text-red-700 flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      value={newAchievement}
                      onChange={(e) => setNewAchievement(e.target.value)}
                      placeholder="Add an achievement"
                      onKeyPress={(e) => e.key === "Enter" && addAchievement()}
                    />
                    <Button onClick={addAchievement} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Social Media */}
        {(!isEditing || activeSection === "social") && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Social Media
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={profile.socialMedia.linkedin || ""}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        socialMedia: { ...profile.socialMedia, linkedin: e.target.value },
                      })
                    }
                    disabled={!isEditing}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={profile.socialMedia.twitter || ""}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        socialMedia: { ...profile.socialMedia, twitter: e.target.value },
                      })
                    }
                    disabled={!isEditing}
                    placeholder="https://twitter.com/yourusername"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={profile.socialMedia.instagram || ""}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        socialMedia: { ...profile.socialMedia, instagram: e.target.value },
                      })
                    }
                    disabled={!isEditing}
                    placeholder="https://instagram.com/yourusername"
                  />
                </div>
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={profile.socialMedia.facebook || ""}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        socialMedia: { ...profile.socialMedia, facebook: e.target.value },
                      })
                    }
                    disabled={!isEditing}
                    placeholder="https://facebook.com/yourprofile"
                  />
                </div>
                <div>
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    value={profile.socialMedia.github || ""}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        socialMedia: { ...profile.socialMedia, github: e.target.value },
                      })
                    }
                    disabled={!isEditing}
                    placeholder="https://github.com/yourusername"
                  />
                </div>
                <div>
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    value={profile.socialMedia.youtube || ""}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        socialMedia: { ...profile.socialMedia, youtube: e.target.value },
                      })
                    }
                    disabled={!isEditing}
                    placeholder="https://youtube.com/@yourchannel"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Privacy Settings */}
        {(!isEditing || activeSection === "privacy") && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Public Profile</Label>
                    <p className="text-sm text-gray-600">Make your profile visible to others</p>
                  </div>
                  <Switch
                    checked={profile.isPublic}
                    onCheckedChange={(checked) => setProfile({ ...profile, isPublic: checked })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Email</Label>
                    <p className="text-sm text-gray-600">Display email address on profile</p>
                  </div>
                  <Switch
                    checked={profile.showEmail}
                    onCheckedChange={(checked) => setProfile({ ...profile, showEmail: checked })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Phone</Label>
                    <p className="text-sm text-gray-600">Display phone number on profile</p>
                  </div>
                  <Switch
                    checked={profile.showPhone}
                    onCheckedChange={(checked) => setProfile({ ...profile, showPhone: checked })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Address</Label>
                    <p className="text-sm text-gray-600">Display address information on profile</p>
                  </div>
                  <Switch
                    checked={profile.showAddress}
                    onCheckedChange={(checked) => setProfile({ ...profile, showAddress: checked })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Social Media</Label>
                    <p className="text-sm text-gray-600">Display social media links on profile</p>
                  </div>
                  <Switch
                    checked={profile.showSocialMedia}
                    onCheckedChange={(checked) => setProfile({ ...profile, showSocialMedia: checked })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-4 sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border">
            <Button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button variant="outline" onClick={handleCancel} className="flex-1 bg-transparent">
              Cancel
            </Button>
          </div>
        )}

        {/* Floating Edit Button for Mobile */}
        {!isEditing && (
          <Button
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 shadow-lg z-40"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-6 w-6" />
          </Button>
        )}
      </div>
    </div>
  )
}
