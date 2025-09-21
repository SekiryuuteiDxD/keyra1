"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Menu,
  Settings,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  Users,
  AtSign,
  Plus,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function MediaPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const router = useRouter()

  const slides = Array(12)
    .fill(0)
    .map((_, i) => ({
      id: i,
      image: "/placeholder.svg?height=300&width=600",
    }))

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold text-orange-500">Keyra</h1>
        <Button variant="ghost" size="icon">
          <Settings className="h-6 w-6" />
        </Button>
      </header>

      <div className="p-4 space-y-6">
        {/* Video Section */}
        <div>
          <h2 className="text-xl font-bold mb-4">Video</h2>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                <Image
                  src="/placeholder.svg?height=300&width=600"
                  alt="Video thumbnail"
                  width={600}
                  height={300}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[12px] border-l-black border-y-[8px] border-y-transparent ml-1"></div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-center py-4 space-x-2">
                <Button variant="ghost" size="icon" onClick={prevSlide} className="rounded-full">
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                <div className="flex space-x-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentSlide ? "bg-black" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>

                <Button variant="ghost" size="icon" onClick={nextSlide} className="rounded-full">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Image Section */}
        <div>
          <h2 className="text-xl font-bold mb-4">Image</h2>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <Image
                src="/placeholder.svg?height=300&width=600"
                alt="Post image"
                width={600}
                height={300}
                className="w-full h-48 object-cover"
              />

              {/* Action Buttons */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex space-x-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsLiked(!isLiked)
                      if (!isLiked) {
                        alert("Liked! ❤️")
                      }
                    }}
                    className={isLiked ? "text-red-500" : ""}
                  >
                    <Heart className={`h-6 w-6 ${isLiked ? "fill-current" : ""}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => alert("Comment functionality would open a comment dialog")}
                  >
                    <MessageCircle className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: "Keyra Media",
                          text: "Check out this post on Keyra!",
                          url: window.location.href,
                        })
                      } else {
                        alert("Shared! 📤")
                      }
                    }}
                  >
                    <Share className="h-6 w-6" />
                  </Button>
                </div>
                <Button variant="ghost" size="icon" onClick={() => alert("Saved to bookmarks! 🔖")}>
                  <Bookmark className="h-6 w-6" />
                </Button>
              </div>

              {/* User Info */}
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="/placeholder.svg?height=48&width=48" />
                    <AvatarFallback>AS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold">Aditya Srivastava</h3>
                      <span className="text-sm text-gray-500">IDI Qr Generated</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                      <p>
                        • Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown
                        printer took a galley of type and scrambled it to make a type specimen book.
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 mt-3">
                      <Button variant="ghost" size="icon">
                        <Users className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MessageCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
          <Card className="bg-gray-200 shadow-lg">
            <CardContent className="p-2">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-blue-400 text-white"
                  onClick={() => router.push("/")}
                >
                  <div className="w-4 h-4 bg-current rounded-full" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-blue-300 text-white"
                  onClick={() => router.push("/profile")}
                >
                  <div className="w-4 h-4 bg-current rounded-full" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-gray-400 text-white"
                  onClick={() => alert("Create new post functionality")}
                >
                  <Plus className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-gray-400 text-white"
                  onClick={() => alert("Mentions and notifications")}
                >
                  <AtSign className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-gray-400 text-white"
                  onClick={() => alert("Friends and contacts")}
                >
                  <Users className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
