"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Menu, Bell, Shield, Palette, Download, Trash2, HelpCircle, LogOut, Moon, Sun, Globe } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    sound: true,
    vibration: true,
    autoBackup: true,
    language: "en",
    qrQuality: [80],
    dataUsage: true,
  })
  const router = useRouter()

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleExportData = () => {
    alert("Data export functionality would be implemented here")
  }

  const handleClearCache = () => {
    alert("Cache cleared successfully!")
  }

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      alert("Account deletion would be processed here")
    }
  }

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      alert("Logout functionality would be implemented here")
      router.push("/")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold text-orange-500">Settings</h1>
        <div className="w-10" />
      </header>

      <div className="p-4 space-y-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Push Notifications</Label>
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={(checked) => handleSettingChange("notifications", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sound">Sound</Label>
              <Switch
                id="sound"
                checked={settings.sound}
                onCheckedChange={(checked) => handleSettingChange("sound", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="vibration">Vibration</Label>
              <Switch
                id="vibration"
                checked={settings.vibration}
                onCheckedChange={(checked) => handleSettingChange("vibration", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="darkMode" className="flex items-center gap-2">
                {settings.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                Dark Mode
              </Label>
              <Switch
                id="darkMode"
                checked={settings.darkMode}
                onCheckedChange={(checked) => handleSettingChange("darkMode", checked)}
              />
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिंदी</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              QR Code Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>QR Code Quality: {settings.qrQuality[0]}%</Label>
              <Slider
                value={settings.qrQuality}
                onValueChange={(value) => handleSettingChange("qrQuality", value)}
                max={100}
                min={50}
                step={10}
                className="w-full"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="autoBackup">Auto Backup QR Codes</Label>
              <Switch
                id="autoBackup"
                checked={settings.autoBackup}
                onCheckedChange={(checked) => handleSettingChange("autoBackup", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data & Storage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Data & Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dataUsage">Optimize Data Usage</Label>
              <Switch
                id="dataUsage"
                checked={settings.dataUsage}
                onCheckedChange={(checked) => handleSettingChange("dataUsage", checked)}
              />
            </div>
            <Button variant="outline" onClick={handleExportData} className="w-full bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Export My Data
            </Button>
            <Button variant="outline" onClick={handleClearCache} className="w-full bg-transparent">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cache
            </Button>
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" onClick={() => router.push("/about")} className="w-full justify-start">
              <HelpCircle className="h-4 w-4 mr-2" />
              Help & FAQ
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "mailto:keyraqrapp@gmail.com")}
              className="w-full justify-start"
            >
              <Globe className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
            <Button variant="outline" onClick={() => window.open("tel:+918839073733")} className="w-full justify-start">
              <Globe className="h-4 w-4 mr-2" />
              Call Support: +91 8839073733
            </Button>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Button variant="outline" onClick={handleLogout} className="w-full bg-transparent">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-500 space-y-1">
              <p>Keyra v2.1.0</p>
              <p>Build 2024.12.01</p>
              <p>© 2024 Keyra Technologies</p>
              <p>Support: +91 8839073733</p>
              <p>Email: keyraqrapp@gmail.com</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
