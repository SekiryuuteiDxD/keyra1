"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Menu,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Plus,
  Search,
  Home,
  Film,
  User,
  Camera,
  ImageIcon,
  MapPin,
  Star,
  Sparkles,
  Flame,
  Award,
  Settings,
  Edit,
  Save,
  X,
  Bell,
  Shield,
  Palette,
  Users,
  Mail,
  Globe,
  Lock,
  Eye,
  Briefcase,
  GraduationCap,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface Post {
  id: string
  user: {
    name: string
    username: string
    avatar: string
    verified?: boolean
    level?: number
    badge?: string
  }
  image: string
  isVideo?: boolean
  caption: string
  likes: number
  comments: Comment[]
  shares: number
  timestamp: string
  location?: string
  isLiked: boolean
  isBookmarked: boolean
  category: string
  mood?: string
}

interface Comment {
  id: string
  user: {
    name: string
    username: string
    avatar: string
  }
  text: string
  timestamp: string
  likes: number
  isLiked: boolean
}

interface Story {
  id: string
  user: {
    name: string
    username: string
    avatar: string
  }
  image: string
  video?: string
  text?: string
  timestamp: string
  viewed: boolean
  gradient: string
  duration: number
}

interface UserProfile {
  name: string
  username: string
  email: string
  phone: string
  bio: string
  website: string
  location: string
  avatar: string
  isPrivate: boolean
  level: number
  badge: string
  posts: number
  followers: number
  following: number
}

interface Notification {
  id: number
  type: string
  user: string
  message: string
  time: string
  read: boolean
}

export default function SocialPage() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [userSession, setUserSession] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("home")
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showStoryViewer, setShowStoryViewer] = useState(false)
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [storyProgress, setStoryProgress] = useState(0)
  const [showComments, setShowComments] = useState<string | null>(null)
  const [newComment, setNewComment] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [ads, setAds] = useState([])

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Your Amazing Name",
    username: "your_username",
    email: "you@keyra.com",
    phone: "+91 9876543210",
    bio: "📱 QR Code enthusiast\n🚀 Building the future with Keyra\n📍 Mumbai, India",
    website: "https://keyra.com",
    location: "Mumbai, India",
    avatar: "/placeholder.svg?height=96&width=96",
    isPrivate: false,
    level: 1,
    badge: "Newbie",
    posts: 0,
    followers: 1234,
    following: 567,
  })

  const [posts, setPosts] = useState<Post[]>([])

  const [stories, setStories] = useState<Story[]>([
    {
      id: "1",
      user: {
        name: "Your Story",
        username: "you",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      image: "",
      timestamp: "",
      viewed: false,
      gradient: "from-purple-400 via-pink-500 to-red-500",
      duration: 5000,
    },
  ])

  const [newPost, setNewPost] = useState({
    caption: "",
    image: "",
    location: "",
    category: "General",
    mood: "happy",
    isVideo: false,
  })

  const [newStory, setNewStory] = useState({
    image: "",
    video: "",
    text: "",
    type: "image" as "image" | "video" | "text",
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const storyFileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const storyProgressRef = useRef<NodeJS.Timeout | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  // Function to load and sync profile data
  const loadUserProfileData = (userId: string) => {
    try {
      const savedProfile = localStorage.getItem(`keyra-profile-${userId}`)
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile)

        // Update user profile with the latest data from profile page
        const updatedProfile = {
          name: profileData.name || userSession?.name || "Your Amazing Name",
          username: profileData.name?.toLowerCase().replace(/\s+/g, "_") || "your_username",
          email: profileData.email || userSession?.email || "you@keyra.com",
          phone: profileData.phone || userSession?.phone || "+91 9876543210",
          bio: profileData.bio || "📱 QR Code enthusiast\n🚀 Building the future with Keyra\n📍 Mumbai, India",
          website: profileData.website || "https://keyra.com",
          location: profileData.address || profileData.city || "Mumbai, India",
          avatar: profileData.avatar || "/placeholder.svg?height=96&width=96",
          isPrivate: profileData.isPrivate || false,
          level: 1,
          badge: "Newbie",
          posts: userProfile.posts,
          followers: 1234,
          following: 567,
        }

        // Only update if there are actual changes
        setUserProfile((prev) => {
          const hasChanges =
            prev.name !== updatedProfile.name ||
            prev.username !== updatedProfile.username ||
            prev.avatar !== updatedProfile.avatar ||
            prev.email !== updatedProfile.email ||
            prev.phone !== updatedProfile.phone ||
            prev.bio !== updatedProfile.bio ||
            prev.website !== updatedProfile.website ||
            prev.location !== updatedProfile.location

          if (hasChanges) {
            // Update the "Your Story" entry with new profile data
            setStories((prevStories) =>
              prevStories.map((story) =>
                story.id === "1"
                  ? {
                      ...story,
                      user: {
                        name: updatedProfile.name,
                        username: updatedProfile.username,
                        avatar: updatedProfile.avatar,
                      },
                    }
                  : story,
              ),
            )
            return updatedProfile
          }
          return prev
        })

        return updatedProfile
      }
    } catch (error) {
      console.error("Error loading profile data:", error)
    }
    return null
  }

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const sessionData = localStorage.getItem("keyra-user-session")
        if (sessionData) {
          const session = JSON.parse(sessionData)
          if (session.isLoggedIn) {
            setUserSession(session)

            // Load and sync profile data immediately
            const profileData = loadUserProfileData(session.id)

            if (!profileData) {
              // Initialize with session data if no saved profile
              const initialProfile: UserProfile = {
                name: session.name || "Your Amazing Name",
                username: session.name?.toLowerCase().replace(/\s+/g, "_") || "your_username",
                email: session.email || "you@keyra.com",
                phone: session.phone || "+91 9876543210",
                bio: "📱 QR Code enthusiast\n🚀 Building the future with Keyra\n📍 Mumbai, India",
                website: "https://keyra.com",
                location: "Mumbai, India",
                avatar: "/placeholder.svg?height=96&width=96",
                isPrivate: false,
                level: 1,
                badge: "Newbie",
                posts: 0,
                followers: 1234,
                following: 567,
              }
              setUserProfile(initialProfile)

              // Update stories with initial profile
              setStories((prev) =>
                prev.map((story) =>
                  story.id === "1"
                    ? {
                        ...story,
                        user: {
                          name: initialProfile.name,
                          username: initialProfile.username,
                          avatar: initialProfile.avatar,
                        },
                      }
                    : story,
                ),
              )
            }
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

    checkAuth()
  }, [router])

  // Listen for profile changes - simplified version
  useEffect(() => {
    if (userSession) {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === `keyra-profile-${userSession.id}`) {
          loadUserProfileData(userSession.id)
        }
      }

      // Listen for storage changes (when profile is updated)
      window.addEventListener("storage", handleStorageChange)

      return () => {
        window.removeEventListener("storage", handleStorageChange)
      }
    }
  }, [userSession])

  // Load data from localStorage on mount - simplified
  useEffect(() => {
    if (userSession) {
      try {
        const savedPosts = localStorage.getItem("keyra-social-posts")
        const savedStories = localStorage.getItem("keyra-social-stories")

        if (savedPosts) {
          setPosts(JSON.parse(savedPosts))
        }

        if (savedStories) {
          const loadedStories = JSON.parse(savedStories)
          setStories(loadedStories)
        }
      } catch (e) {
        console.error("Error loading data from localStorage:", e)
      }
    }
  }, [userSession?.id])

  // Save data to localStorage when state changes
  useEffect(() => {
    if (userSession) {
      try {
        // Store posts WITH image data (don't strip base64 images)
        localStorage.setItem("keyra-social-posts", JSON.stringify(posts))

        // Store stories WITH image/video data
        localStorage.setItem("keyra-social-stories", JSON.stringify(stories))

        // Store profile
        localStorage.setItem("keyra-social-profile", JSON.stringify(userProfile))
      } catch (e) {
        console.error("Error saving to localStorage:", e)
        // If localStorage is full, try to save without images
        try {
          const postsToStore = posts.map((post) => ({
            ...post,
            image: post.image.startsWith("data:") ? "stored-image" : post.image,
          }))
          localStorage.setItem("keyra-social-posts", JSON.stringify(postsToStore))
        } catch (e2) {
          console.error("Failed to save even without images:", e2)
        }
      }
    }
  }, [posts, stories, userProfile, userSession])

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = [
        ...posts.filter(
          (post) =>
            post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.user.username.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
        // Add mock user results
        ...(searchQuery.length > 2
          ? [
              {
                type: "user",
                name: "John Doe",
                username: "johndoe",
                avatar: "/placeholder.svg?height=40&width=40",
                followers: "1.2k",
              },
              {
                type: "user",
                name: "Jane Smith",
                username: "janesmith",
                avatar: "/placeholder.svg?height=40&width=40",
                followers: "856",
              },
            ]
          : []),
      ]
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [searchQuery, posts])

  useEffect(() => {
    const savedAds = localStorage.getItem("keyra-ads")
    if (savedAds) {
      setAds(JSON.parse(savedAds))
    }
  }, [])

  const moodColors = {
    happy: "bg-gradient-to-r from-yellow-400 to-orange-500",
    excited: "bg-gradient-to-r from-pink-500 to-red-500",
    peaceful: "bg-gradient-to-r from-blue-400 to-purple-500",
    creative: "bg-gradient-to-r from-purple-500 to-pink-500",
    motivated: "bg-gradient-to-r from-green-400 to-blue-500",
  }

  const categoryColors = {
    Technology: "bg-gradient-to-r from-blue-500 to-cyan-500",
    Lifestyle: "bg-gradient-to-r from-pink-500 to-rose-500",
    Announcement: "bg-gradient-to-r from-purple-500 to-indigo-500",
    General: "bg-gradient-to-r from-gray-500 to-gray-600",
  }

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    )

    // Add notification for like
    if (!posts.find((p) => p.id === postId)?.isLiked) {
      const post = posts.find((p) => p.id === postId)
      if (post) {
        setNotifications((prev) => [
          {
            id: Date.now(),
            type: "like",
            user: userProfile.username,
            message: `liked ${post.user.username}'s post`,
            time: "now",
            read: false,
          },
          ...prev,
        ])
      }
    }
  }

  const handleBookmark = (postId: string) => {
    setPosts(posts.map((post) => (post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post)))
  }

  const handleComment = (postId: string) => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      user: {
        name: userProfile.name,
        username: userProfile.username,
        avatar: userProfile.avatar,
      },
      text: newComment,
      timestamp: "now",
      likes: 0,
      isLiked: false,
    }

    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [...post.comments, comment],
            }
          : post,
      ),
    )

    setNewComment("")

    // Add notification for comment
    const post = posts.find((p) => p.id === postId)
    if (post) {
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: "comment",
          user: userProfile.username,
          message: `commented on ${post.user.username}'s post`,
          time: "now",
          read: false,
        },
        ...prev,
      ])
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setNewPost({ ...newPost, image: e.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (limit to 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert("Video file is too large. Please choose a video under 50MB.")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setNewPost({ ...newPost, image: e.target?.result as string, isVideo: true })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleStoryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (file.type.startsWith("image/")) {
          setNewStory({ ...newStory, image: result, type: "image" })
        } else if (file.type.startsWith("video/")) {
          setNewStory({ ...newStory, video: result, type: "video" })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreatePost = () => {
    if (!newPost.image || !newPost.caption) {
      alert("Please add media and caption")
      return
    }

    const postId = Date.now().toString()

    // Keep the original uploaded image/video instead of replacing with placeholder
    const imageUrl = newPost.image

    const post: Post = {
      id: postId,
      user: {
        name: userProfile.name,
        username: userProfile.username,
        avatar: userProfile.avatar,
        level: userProfile.level,
        badge: userProfile.badge,
      },
      image: imageUrl, // Use the actual uploaded image
      isVideo: newPost.isVideo,
      caption: newPost.caption,
      likes: 0,
      comments: [],
      shares: 0,
      timestamp: "now",
      location: newPost.location,
      isLiked: false,
      isBookmarked: false,
      category: newPost.category,
      mood: newPost.mood,
    }

    setPosts([post, ...posts])
    setNewPost({ caption: "", image: "", location: "", category: "General", mood: "happy", isVideo: false })
    setActiveTab("home")
    setUserProfile((prev) => ({ ...prev, posts: prev.posts + 1 }))

    const mediaType = newPost.isVideo ? "video" : "post"
    alert(`${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} created successfully! 🎉`)
  }

  const handleCreateStory = () => {
    if (!newStory.image && !newStory.video && !newStory.text) {
      alert("Please add content to your story")
      return
    }

    // Create a unique ID for the story
    const storyId = Date.now().toString()

    // Keep the actual uploaded content for stories too
    const story: Story = {
      id: storyId,
      user: {
        name: userProfile.name,
        username: userProfile.username,
        avatar: userProfile.avatar,
      },
      image: newStory.image,
      video: newStory.video,
      text: newStory.text,
      timestamp: "now",
      viewed: false,
      gradient: "from-purple-400 via-pink-500 to-red-500",
      duration: 5000,
    }

    // Replace user's existing story or add new one
    setStories((prev) => {
      const filtered = prev.filter((s) => s.user.username !== userProfile.username || s.id === "1")
      return [filtered[0], story, ...filtered.slice(1)]
    })

    setNewStory({ image: "", video: "", text: "", type: "image" })
    alert("Story created successfully! ✨")
  }

  const handleSaveProfile = () => {
    // Trigger a manual sync after saving
    if (userSession) {
      setTimeout(() => {
        loadUserProfileData(userSession.id)
      }, 100)
    }
    setShowEditProfile(false)
    alert("Profile updated successfully! ✨")
  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const avatarUrl = e.target?.result as string
        setUserProfile({ ...userProfile, avatar: avatarUrl })

        // Save to localStorage profile
        if (userSession) {
          const currentProfile = localStorage.getItem(`keyra-profile-${userSession.id}`)
          if (currentProfile) {
            const profileData = JSON.parse(currentProfile)
            profileData.avatar = avatarUrl
            localStorage.setItem(`keyra-profile-${userSession.id}`, JSON.stringify(profileData))
          }
        }

        // Update stories immediately
        setStories((prev) =>
          prev.map((story) =>
            story.id === "1"
              ? {
                  ...story,
                  user: {
                    ...story.user,
                    avatar: avatarUrl,
                  },
                }
              : story,
          ),
        )
      }
      reader.readAsDataURL(file)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Camera access denied. Please allow camera permissions.")
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      if (context) {
        context.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL("image/png")
        setNewStory({ ...newStory, image: imageData, type: "image" })

        // Stop camera
        const stream = video.srcObject as MediaStream
        stream?.getTracks().forEach((track) => track.stop())
      }
    }
  }

  const startRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)

    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)

    // In a real app, you'd start actual video recording here
    setTimeout(() => {
      stopRecording()
    }, 15000) // Auto-stop after 15 seconds
  }

  const stopRecording = () => {
    setIsRecording(false)
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
    }

    // In a real app, you'd save the recorded video here
    setNewStory({ ...newStory, video: "/placeholder.svg?height=400&width=400", type: "video" })
    alert("Video recorded! (This is a demo)")
  }

  const viewStory = (index: number) => {
    setCurrentStoryIndex(index)
    setShowStoryViewer(true)
    setStoryProgress(0)

    // Mark story as viewed
    setStories((prev) => prev.map((story, i) => (i === index ? { ...story, viewed: true } : story)))

    // Start progress timer
    const duration = stories[index]?.duration || 5000
    storyProgressRef.current = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          nextStory()
          return 0
        }
        return prev + 100 / (duration / 100)
      })
    }, 100)
  }

  const nextStory = () => {
    if (storyProgressRef.current) {
      clearInterval(storyProgressRef.current)
    }

    if (currentStoryIndex < stories.length - 1) {
      viewStory(currentStoryIndex + 1)
    } else {
      setShowStoryViewer(false)
    }
  }

  const prevStory = () => {
    if (storyProgressRef.current) {
      clearInterval(storyProgressRef.current)
    }

    if (currentStoryIndex > 0) {
      viewStory(currentStoryIndex - 1)
    }
  }

  const closeStoryViewer = () => {
    setShowStoryViewer(false)
    if (storyProgressRef.current) {
      clearInterval(storyProgressRef.current)
    }
  }

  const markNotificationAsRead = (id: number) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const handleAdClick = (adId) => {
    const updatedAds = ads.map((ad) => (ad.id === adId ? { ...ad, clicks: ad.clicks + 1 } : ad))
    setAds(updatedAds)
    localStorage.setItem("keyra-ads", JSON.stringify(updatedAds))
  }

  const renderStoryViewer = () => {
    if (!showStoryViewer || !stories[currentStoryIndex]) return null

    const story = stories[currentStoryIndex]

    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Progress bars */}
        <div className="flex gap-1 p-4">
          {stories.map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100"
                style={{
                  width: index < currentStoryIndex ? "100%" : index === currentStoryIndex ? `${storyProgress}%` : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Story header */}
        <div className="flex items-center justify-between p-4 text-white">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 border-2 border-white">
              <AvatarImage src={story.user.avatar || "/placeholder.svg"} />
              <AvatarFallback>{story.user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{story.user.username}</p>
              <p className="text-sm opacity-70">{story.timestamp}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={closeStoryViewer} className="text-white">
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Story content */}
        <div className="flex-1 relative flex items-center justify-center">
          {story.image && (
            <img src={story.image || "/placeholder.svg"} alt="Story" className="max-w-full max-h-full object-contain" />
          )}
          {story.video && (
            <video
              src={story.video || "/placeholder.svg"}
              className="max-w-full max-h-full object-contain"
              autoPlay
              muted
              loop
            />
          )}
          {story.text && (
            <div className="text-center p-8">
              <p className="text-white text-2xl font-bold">{story.text}</p>
            </div>
          )}

          {/* Navigation areas */}
          <button
            onClick={prevStory}
            className="absolute left-0 top-0 w-1/3 h-full"
            disabled={currentStoryIndex === 0}
          />
          <button onClick={nextStory} className="absolute right-0 top-0 w-1/3 h-full" />
        </div>

        {/* Story actions */}
        <div className="p-4 flex items-center space-x-4">
          <Input
            placeholder="Reply to story..."
            className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-white/70"
          />
          <Button size="icon" className="bg-white/20 hover:bg-white/30">
            <Heart className="w-5 h-5 text-white" />
          </Button>
          <Button size="icon" className="bg-white/20 hover:bg-white/30">
            <Send className="w-5 h-5 text-white" />
          </Button>
        </div>
      </div>
    )
  }

  const renderEditProfile = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Edit Profile</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEditProfile(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Avatar Upload */}
          <div className="text-center">
            <div className="relative inline-block">
              <Avatar className="w-24 h-24 border-4 border-purple-200">
                <AvatarImage src={userProfile.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white text-2xl">
                  {userProfile.name[0]}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                onClick={() => document.getElementById("avatar-upload")?.click()}
                className="absolute -bottom-2 -right-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-bold text-purple-600">Name</Label>
              <Input
                value={userProfile.name}
                onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                className="mt-1 rounded-xl border-purple-200 focus:border-purple-500"
              />
            </div>

            <div>
              <Label className="text-sm font-bold text-purple-600">Username</Label>
              <Input
                value={userProfile.username}
                onChange={(e) => setUserProfile({ ...userProfile, username: e.target.value })}
                className="mt-1 rounded-xl border-purple-200 focus:border-purple-500"
              />
            </div>

            <div>
              <Label className="text-sm font-bold text-purple-600">Email</Label>
              <Input
                type="email"
                value={userProfile.email}
                onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                className="mt-1 rounded-xl border-purple-200 focus:border-purple-500"
              />
            </div>

            <div>
              <Label className="text-sm font-bold text-purple-600">Phone</Label>
              <Input
                value={userProfile.phone}
                onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                className="mt-1 rounded-xl border-purple-200 focus:border-purple-500"
              />
            </div>

            <div>
              <Label className="text-sm font-bold text-purple-600">Bio</Label>
              <Textarea
                value={userProfile.bio}
                onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
                className="mt-1 rounded-xl border-purple-200 focus:border-purple-500 min-h-[80px]"
              />
            </div>

            <div>
              <Label className="text-sm font-bold text-purple-600">Website</Label>
              <Input
                value={userProfile.website}
                onChange={(e) => setUserProfile({ ...userProfile, website: e.target.value })}
                className="mt-1 rounded-xl border-purple-200 focus:border-purple-500"
              />
            </div>

            <div>
              <Label className="text-sm font-bold text-purple-600">Location</Label>
              <Input
                value={userProfile.location}
                onChange={(e) => setUserProfile({ ...userProfile, location: e.target.value })}
                className="mt-1 rounded-xl border-purple-200 focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
              <div>
                <Label className="text-sm font-bold text-purple-600">Private Account</Label>
                <p className="text-xs text-gray-600">Only followers can see your posts</p>
              </div>
              <Switch
                checked={userProfile.isPrivate}
                onCheckedChange={(checked) => setUserProfile({ ...userProfile, isPrivate: checked })}
              />
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSaveProfile}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl py-3"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Settings</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Account Settings */}
          <div>
            <h3 className="font-bold text-lg mb-3 text-purple-600">Account</h3>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start p-3 rounded-xl hover:bg-purple-50"
                onClick={() => {
                  setShowSettings(false)
                  setShowEditProfile(true)
                }}
              >
                <Edit className="w-5 h-5 mr-3 text-purple-500" />
                Edit Profile
              </Button>
              <Button variant="ghost" className="w-full justify-start p-3 rounded-xl hover:bg-purple-50">
                <Lock className="w-5 h-5 mr-3 text-purple-500" />
                Privacy & Security
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start p-3 rounded-xl hover:bg-purple-50"
                onClick={() => {
                  setShowSettings(false)
                  setShowNotifications(true)
                }}
              >
                <Bell className="w-5 h-5 mr-3 text-purple-500" />
                Notifications
              </Button>
            </div>
          </div>

          {/* Appearance */}
          <div>
            <h3 className="font-bold text-lg mb-3 text-purple-600">Appearance</h3>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start p-3 rounded-xl hover:bg-purple-50">
                <Palette className="w-5 h-5 mr-3 text-purple-500" />
                Theme Settings
              </Button>
              <Button variant="ghost" className="w-full justify-start p-3 rounded-xl hover:bg-purple-50">
                <Eye className="w-5 h-5 mr-3 text-purple-500" />
                Display Options
              </Button>
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-bold text-lg mb-3 text-purple-600">Social</h3>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start p-3 rounded-xl hover:bg-purple-50">
                <Users className="w-5 h-5 mr-3 text-purple-500" />
                Friends & Followers
              </Button>
              <Button variant="ghost" className="w-full justify-start p-3 rounded-xl hover:bg-purple-50">
                <MessageCircle className="w-5 h-5 mr-3 text-purple-500" />
                Messages
              </Button>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-lg mb-3 text-purple-600">Support</h3>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start p-3 rounded-xl hover:bg-purple-50">
                <Mail className="w-5 h-5 mr-3 text-purple-500" />
                Help & Support
              </Button>
              <Button variant="ghost" className="w-full justify-start p-3 rounded-xl hover:bg-purple-50">
                <Shield className="w-5 h-5 mr-3 text-purple-500" />
                Report a Problem
              </Button>
            </div>
          </div>

          {/* Logout */}
          <Button
            variant="outline"
            className="w-full mt-6 border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
            onClick={() => {
              if (confirm("Are you sure you want to logout?")) {
                localStorage.removeItem("keyra-user-session")
                router.push("/auth")
              }
            }}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  )

  const renderNotifications = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-red-600 p-4 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Notifications</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="bg-gradient-to-r from-gray-200 to-gray-300 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-600 mb-2">No notifications yet</h3>
                <p className="text-gray-500 text-sm">When you get notifications, they'll show up here</p>
              </div>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                  notification.read ? "bg-gray-50 border-gray-200" : "bg-blue-50 border-blue-200"
                }`}
                onClick={() => markNotificationAsRead(notification.id)}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      notification.type === "like"
                        ? "bg-red-500"
                        : notification.type === "comment"
                          ? "bg-blue-500"
                          : notification.type === "follow"
                            ? "bg-green-500"
                            : "bg-purple-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-bold">{notification.user}</span> {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">{notification.time}</p>
                  </div>
                  {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )

  const renderComments = (postId: string) => {
    const post = posts.find((p) => p.id === postId)
    if (!post || showComments !== postId) return null

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
        <div className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-bold text-lg">Comments</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowComments(null)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Comments List */}
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {post.comments.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <div className="bg-gradient-to-r from-gray-200 to-gray-300 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <MessageCircle className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-600 mb-2">No comments yet</h3>
                  <p className="text-gray-500 text-sm">Be the first to comment on this post!</p>
                </div>
              </div>
            ) : (
              post.comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.user.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-2xl p-3">
                      <p className="font-semibold text-sm">{comment.user.username}</p>
                      <p className="text-sm">{comment.text}</p>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span>{comment.timestamp}</span>
                      <button className="hover:text-red-500">
                        <Heart className="w-3 h-3 inline mr-1" />
                        {comment.likes}
                      </button>
                      <button>Reply</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment Input */}
          <div className="p-4 border-t flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={userProfile.avatar || "/placeholder.svg"} />
              <AvatarFallback>{userProfile.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex items-center space-x-2">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 rounded-full"
                onKeyPress={(e) => e.key === "Enter" && handleComment(postId)}
              />
              <Button
                size="icon"
                onClick={() => handleComment(postId)}
                disabled={!newComment.trim()}
                className="rounded-full"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderHomeTab = () => (
    <div className="space-y-6">
      {/* Enhanced Stories Section */}
      <div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-1 rounded-2xl">
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ✨ Stories
            </h3>
            <Sparkles className="w-5 h-5 text-purple-500" />
          </div>
          <div className="flex space-x-4 overflow-x-auto">
            {stories.map((story, index) => (
              <div key={story.id} className="flex flex-col items-center space-y-2 min-w-[80px]">
                <div
                  className={`relative bg-gradient-to-r ${story.gradient} p-1 rounded-full cursor-pointer ${
                    story.viewed ? "opacity-50" : ""
                  }`}
                  onClick={() => (story.id === "1" ? storyFileInputRef.current?.click() : viewStory(index))}
                >
                  <div className="bg-white p-1 rounded-full">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={story.user.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                        {story.user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {story.id === "1" && (
                    <button className="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <span className="text-xs text-center max-w-[80px] truncate font-medium">{story.user.name}</span>
              </div>
            ))}
          </div>
          <input
            ref={storyFileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleStoryUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Empty State or Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-16 space-y-6">
          <div className="bg-gradient-to-r from-purple-400 to-pink-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
            <Camera className="w-12 h-12 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome to Keyra Social! 🎉
            </h3>
            <p className="text-gray-600 text-lg mb-6">Start sharing your amazing moments with the world</p>
            <Button
              onClick={() => setActiveTab("create")}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl px-8 py-3 text-lg font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Post
            </Button>
          </div>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 max-w-md mx-auto">
            <h4 className="font-bold text-blue-800 mb-2">✨ Get Started:</h4>
            <div className="text-sm text-blue-700 space-y-2 text-left">
              <p>• Click "Create" to share your first post</p>
              <p>• Add a story by clicking the "+" button</p>
              <p>• Customize your profile in the Profile tab</p>
              <p>• Discover content in the Search tab</p>
            </div>
          </div>
        </div>
      ) : (
        // Posts rendering
        posts.map((post) => (
          <Card key={post.id} className="bg-white shadow-lg rounded-3xl overflow-hidden border-0">
            <CardContent className="p-0">
              {/* Post Header */}
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12 border-2 border-white">
                        <AvatarImage src={post.user.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-white text-purple-600 font-bold">
                          {post.user.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      {post.user.level && (
                        <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {post.user.level}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">{post.user.username}</span>
                        {post.user.verified && (
                          <div className="bg-blue-400 rounded-full p-1">
                            <Star className="w-3 h-3 text-white fill-current" />
                          </div>
                        )}
                        {post.user.badge && (
                          <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold">
                            {post.user.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-white/80 text-sm">
                        <span>{post.timestamp}</span>
                        {post.location && (
                          <>
                            <span>•</span>
                            <MapPin className="w-3 h-3" />
                            <span>{post.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Category and Mood Tags */}
              <div className="px-4 py-2 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-white text-xs font-bold ${
                      categoryColors[post.category as keyof typeof categoryColors]
                    }`}
                  >
                    {post.category}
                  </span>
                  {post.mood && (
                    <span
                      className={`px-3 py-1 rounded-full text-white text-xs font-bold ${
                        moodColors[post.mood as keyof typeof moodColors]
                      }`}
                    >
                      {post.mood} 😊
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1 text-gray-500 text-sm">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="font-bold">{post.likes + post.comments.length + post.shares}</span>
                </div>
              </div>

              {/* Post Image/Video */}
              <div className="relative p-2 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                <div className="rounded-2xl overflow-hidden">
                  {post.isVideo ? (
                    <video
                      src={post.image}
                      controls
                      className="w-full aspect-square object-cover"
                      poster="/placeholder.svg?height=400&width=400"
                    />
                  ) : (
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt="Post"
                      className="w-full aspect-square object-cover"
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.src = "/placeholder.svg?height=400&width=400"
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Post Actions */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleLike(post.id)}
                      className={`rounded-full ${
                        post.isLiked
                          ? "bg-gradient-to-r from-pink-500 to-red-500 text-white"
                          : "bg-gray-100 hover:bg-gradient-to-r hover:from-pink-500 hover:to-red-500 hover:text-white"
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowComments(post.id)}
                      className="rounded-full bg-gray-100 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full bg-gray-100 hover:bg-gradient-to-r hover:from-green-500 hover:to-blue-500 hover:text-white"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleBookmark(post.id)}
                    className={`rounded-full ${
                      post.isBookmarked
                        ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                        : "bg-gray-100 hover:bg-gradient-to-r hover:from-yellow-500 hover:to-orange-500 hover:text-white"
                    }`}
                  >
                    <Bookmark className={`w-5 h-5 ${post.isBookmarked ? "fill-current" : ""}`} />
                  </Button>
                </div>

                {/* Enhanced Stats */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4 text-red-500 fill-current" />
                      <span className="font-bold">{post.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <span className="font-bold">{post.comments.length}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Send className="w-4 h-4 text-green-500" />
                      <span className="font-bold">{post.shares}</span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {post.user.username}
                    </span>{" "}
                    <span className="text-gray-700">{post.caption}</span>
                  </div>
                  {post.comments.length > 0 && (
                    <button
                      onClick={() => setShowComments(post.id)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      View all {post.comments.length} comments
                    </button>
                  )}
                </div>

                {/* Quick Comment */}
                <div className="flex items-center space-x-3 mt-4 p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={userProfile.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">{userProfile.name[0]}</AvatarFallback>
                  </Avatar>
                  <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="border-none bg-transparent p-0 focus-visible:ring-0 placeholder:text-purple-400"
                    onKeyPress={(e) => e.key === "Enter" && handleComment(post.id)}
                  />
                  <Button
                    onClick={() => handleComment(post.id)}
                    disabled={!newComment.trim()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full px-4"
                  >
                    Post
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Render Comments Modal */}
      {showComments && renderComments(showComments)}
    </div>
  )

  const renderSearchTab = () => (
    <div className="p-4 space-y-6">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 p-6 rounded-3xl text-white">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <Search className="w-6 h-6 mr-2" />
          Discover Amazing Content
        </h2>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 h-5 w-5" />
          <Input
            placeholder="Search users, hashtags, moods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-white/20 border-white/30 text-white placeholder:text-white/70 rounded-2xl backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Search Results */}
      {searchQuery.trim() && searchResults.length === 0 && (
        <div className="text-center py-8">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-600 mb-2">No results found</h3>
          <p className="text-gray-500">Try searching for something else</p>
        </div>
      )}

      {searchResults.length > 0 && (
        <div>
          <h3 className="font-bold text-xl mb-4">Search Results</h3>
          <div className="space-y-3">
            {searchResults.map((result, index) => (
              <Card key={index} className="bg-white border-0 rounded-2xl">
                <CardContent className="p-4">
                  {result.type === "user" ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={result.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{result.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold">{result.username}</p>
                          <p className="text-sm text-gray-600">{result.followers} followers</p>
                        </div>
                      </div>
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                        Follow
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={result.user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{result.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-bold">{result.user.username}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{result.caption}</p>
                      </div>
                      <Image
                        src={result.image || "/placeholder.svg"}
                        alt="Post"
                        width={60}
                        height={60}
                        className="w-15 h-15 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Trending Categories */}
      <div>
        <h3 className="font-bold text-xl mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          🔥 Trending Categories
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: "Technology", icon: "💻", color: "from-blue-500 to-cyan-500", posts: "1.2k" },
            { name: "Lifestyle", icon: "🌟", color: "from-pink-500 to-rose-500", posts: "856" },
            { name: "Creative", icon: "🎨", color: "from-purple-500 to-indigo-500", posts: "2.1k" },
            { name: "Travel", icon: "✈️", color: "from-green-500 to-blue-500", posts: "934" },
          ].map((category, i) => (
            <Card key={i} className={`bg-gradient-to-r ${category.color} text-white border-0 rounded-2xl`}>
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">{category.icon}</div>
                <h4 className="font-bold">{category.name}</h4>
                <p className="text-sm opacity-90">{category.posts} posts</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Sponsored Ads - Only show to customers (non-admin users) */}
      {userSession?.userType !== "admin" && ads.length > 0 && (
        <div>
          <h3 className="font-bold text-xl mb-4 bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
            📢 Sponsored
          </h3>
          <div className="space-y-4">
            {ads.slice(0, 2).map((ad) => (
              <Card
                key={ad.id}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-orange-200 rounded-2xl overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="flex items-center">
                    {ad.image && (
                      <div className="w-24 h-24 flex-shrink-0">
                        <Image
                          src={ad.image || "/placeholder.svg"}
                          alt={ad.title}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-bold text-lg text-gray-800">{ad.title}</h4>
                            <span className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                              AD
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{ad.description}</p>
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                            {ad.category}
                          </span>
                        </div>
                        <Button
                          onClick={() => {
                            handleAdClick(ad.id)
                            if (ad.link) {
                              window.open(ad.link, "_blank")
                            }
                          }}
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl px-4 py-2 text-sm font-bold"
                        >
                          {ad.buttonText}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Trending Grid */}
      <div>
        <h3 className="font-bold text-xl mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          🌈 Trending Posts
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {Array(9)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="relative aspect-square bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl p-1"
              >
                <Image
                  src="/placeholder.svg?height=120&width=120"
                  alt="Trending post"
                  width={120}
                  height={120}
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute top-2 right-2 bg-white/90 rounded-full p-1">
                  <Flame className="w-3 h-3 text-orange-500" />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )

  const renderCreateTab = () => (
    <div className="p-4 space-y-6">
      {/* Create Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 p-6 rounded-3xl text-white">
        <h2 className="text-2xl font-bold mb-2 flex items-center">
          <Sparkles className="w-6 h-6 mr-2" />
          Create Something Amazing
        </h2>
        <p className="opacity-90">Share your colorful moments with the world!</p>
      </div>

      {/* Create Options */}
      <div className="grid grid-cols-3 gap-3">
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl p-4 h-auto flex flex-col items-center space-y-2"
        >
          <ImageIcon className="w-6 h-6" />
          <span className="font-bold text-sm">Gallery</span>
        </Button>

        <Button
          onClick={() => document.getElementById("video-upload")?.click()}
          className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl p-4 h-auto flex flex-col items-center space-y-2"
        >
          <Film className="w-6 h-6" />
          <span className="font-bold text-sm">Video</span>
        </Button>

        <Button
          onClick={startCamera}
          className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl p-4 h-auto flex flex-col items-center space-y-2"
        >
          <Camera className="w-6 h-6" />
          <span className="font-bold text-sm">Camera</span>
        </Button>
      </div>

      {/* Add video input */}
      <input id="video-upload" type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />

      {/* Story Creation */}
      {(newStory.image || newStory.video || newStory.text) && (
        <Card className="border-0 rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4">Create Your Story</h3>

            {newStory.image && (
              <div className="relative mb-4">
                <Image
                  src={newStory.image || "/placeholder.svg"}
                  alt="Story preview"
                  width={300}
                  height={400}
                  className="w-full max-w-sm mx-auto rounded-xl"
                />
                <Button
                  onClick={() => setNewStory({ ...newStory, image: "" })}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 rounded-full w-8 h-8 p-0"
                >
                  ×
                </Button>
              </div>
            )}

            {newStory.video && (
              <div className="relative mb-4">
                <video
                  src={newStory.video || "/placeholder.svg"}
                  className="w-full max-w-sm mx-auto rounded-xl"
                  controls
                />
                <Button
                  onClick={() => setNewStory({ ...newStory, video: "" })}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 rounded-full w-8 h-8 p-0"
                >
                  ×
                </Button>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-bold">Add Text (optional)</Label>
                <Input
                  placeholder="What's on your mind?"
                  value={newStory.text}
                  onChange={(e) => setNewStory({ ...newStory, text: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleCreateStory}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl"
                >
                  Share Story
                </Button>
                <Button
                  onClick={() => setNewStory({ image: "", video: "", text: "", type: "image" })}
                  variant="outline"
                  className="rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Image Upload */}
      <Card className="border-0 rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-1">
            <div className="bg-white rounded-3xl p-6">
              {newPost.image ? (
                <div className="relative">
                  <div className="bg-gradient-to-r from-purple-400 to-pink-500 p-2 rounded-2xl">
                    {newPost.isVideo ? (
                      <video
                        src={newPost.image || "/placeholder.svg"}
                        controls
                        className="w-full max-w-sm mx-auto rounded-xl"
                        style={{ maxHeight: "300px" }}
                      />
                    ) : (
                      <Image
                        src={newPost.image || "/placeholder.svg"}
                        alt="Preview"
                        width={300}
                        height={300}
                        className="w-full max-w-sm mx-auto rounded-xl"
                      />
                    )}
                  </div>
                  <Button
                    onClick={() => setNewPost({ ...newPost, image: "", isVideo: false })}
                    className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 rounded-full w-10 h-10 p-0"
                  >
                    ×
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="bg-gradient-to-r from-purple-400 to-pink-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                    <Camera className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Share Your Moment
                    </h3>
                    <p className="text-gray-600">Choose from gallery or capture new memories</p>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Gallery
                    </Button>
                    <Button
                      onClick={startCamera}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-2xl"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Camera
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

      {/* Camera View */}
      <video ref={videoRef} className="hidden w-full rounded-xl" autoPlay playsInline />
      <canvas ref={canvasRef} className="hidden" />

      {/* Enhanced Form Fields */}
      <div className="space-y-4">
        {/* Caption */}
        <Card className="border-0 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-4">
            <label className="block text-sm font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ✨ Caption
            </label>
            <Textarea
              placeholder="Write something amazing..."
              value={newPost.caption}
              onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
              className="min-h-[100px] border-0 bg-white/70 rounded-xl"
            />
          </CardContent>
        </Card>

        {/* Category and Mood */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-0 rounded-2xl bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-4">
              <label className="block text-sm font-bold mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                📂 Category
              </label>
              <select
                value={newPost.category}
                onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                className="w-full p-2 border-0 bg-white/70 rounded-xl"
              >
                <option value="General">General</option>
                <option value="Technology">Technology</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Creative">Creative</option>
              </select>
            </CardContent>
          </Card>

          <Card className="border-0 rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardContent className="p-4">
              <label className="block text-sm font-bold mb-2 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                😊 Mood
              </label>
              <select
                value={newPost.mood}
                onChange={(e) => setNewPost({ ...newPost, mood: e.target.value })}
                className="w-full p-2 border-0 bg-white/70 rounded-xl"
              >
                <option value="happy">Happy 😊</option>
                <option value="excited">Excited 🚀</option>
                <option value="peaceful">Peaceful 🌅</option>
                <option value="creative">Creative 🎨</option>
                <option value="motivated">Motivated 💪</option>
              </select>
            </CardContent>
          </Card>
        </div>

        {/* Location */}
        <Card className="border-0 rounded-2xl bg-gradient-to-r from-pink-50 to-red-50">
          <CardContent className="p-4">
            <label className="block text-sm font-bold mb-2 bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
              📍 Location (optional)
            </label>
            <Input
              placeholder="Add location..."
              value={newPost.location}
              onChange={(e) => setNewPost({ ...newPost, location: e.target.value })}
              className="border-0 bg-white/70 rounded-xl"
            />
          </CardContent>
        </Card>

        {/* Create Button */}
        <Button
          onClick={handleCreatePost}
          disabled={!newPost.image || !newPost.caption}
          className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white py-4 rounded-2xl text-lg font-bold disabled:from-gray-300 disabled:to-gray-400"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Share Your Amazing Post
        </Button>
      </div>
    </div>
  )

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1 rounded-3xl">
        <div className="bg-white rounded-3xl p-6">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarImage src={userProfile.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white text-2xl font-bold">
                  {userProfile.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-black rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                {userProfile.level}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {userProfile.username}
              </h2>
              <p className="text-gray-600">{userProfile.name}</p>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {userProfile.badge}
                </span>
                <Award className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl">
              <p className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {userProfile.posts}
              </p>
              <p className="text-gray-600 text-sm font-medium">Posts</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-r from-pink-100 to-red-100 rounded-2xl">
              <p className="font-bold text-2xl bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                {userProfile.followers}
              </p>
              <p className="text-gray-600 text-sm font-medium">Followers</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl">
              <p className="font-bold text-2xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {userProfile.following}
              </p>
              <p className="text-gray-600 text-sm font-medium">Following</p>
            </div>
          </div>

          {/* Enhanced Bio with more profile info */}
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl">
            <div className="space-y-2 text-sm">
              <div className="whitespace-pre-line">{userProfile.bio}</div>

              {/* Show additional profile information if available */}
              {userSession &&
                (() => {
                  const savedProfile = localStorage.getItem(`keyra-profile-${userSession.id}`)
                  if (savedProfile) {
                    const profileData = JSON.parse(savedProfile)
                    return (
                      <div className="space-y-1 pt-2 border-t border-orange-200">
                        {profileData.jobTitle && (
                          <p className="flex items-center text-gray-600">
                            <Briefcase className="w-4 h-4 mr-2" />
                            {profileData.jobTitle} {profileData.company && `at ${profileData.company}`}
                          </p>
                        )}
                        {profileData.city && (
                          <p className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            {profileData.city}
                            {profileData.state && `, ${profileData.state}`}
                          </p>
                        )}
                        {profileData.education && (
                          <p className="flex items-center text-gray-600">
                            <GraduationCap className="w-4 h-4 mr-2" />
                            {profileData.education}
                          </p>
                        )}
                      </div>
                    )
                  }
                  return null
                })()}

              {userProfile.website && (
                <div className="mt-2">
                  <a
                    href={userProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    <Globe className="w-4 h-4 mr-1" />
                    {userProfile.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => setShowEditProfile(true)}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button
              onClick={() => setShowSettings(true)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="bg-white rounded-3xl p-4">
        <h3 className="font-bold text-lg mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          🎨 Your Posts
        </h3>
        {posts.filter((post) => post.user.username === userProfile.username).length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="bg-gradient-to-r from-gray-200 to-gray-300 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <Camera className="w-10 h-10 text-gray-400" />
            </div>
            <div>
              <h4 className="font-bold text-gray-600 mb-2">No posts yet</h4>
              <p className="text-gray-500 text-sm mb-4">Share your first moment with the world!</p>
              <Button
                onClick={() => setActiveTab("create")}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl px-6 py-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {posts
              .filter((post) => post.user.username === userProfile.username)
              .map((post) => (
                <div
                  key={post.id}
                  className="aspect-square bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl p-1"
                >
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt="Your post"
                    width={120}
                    height={120}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading social...</p>
        </div>
      </div>
    )
  }

  const content = (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 shadow-lg p-4 flex items-center justify-between sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="text-white hover:bg-white/20">
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold text-white flex items-center">
          <Sparkles className="w-6 h-6 mr-2" />
          Keyra Social
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowNotifications(true)}
          className="text-white hover:bg-white/20 relative"
        >
          <Bell className="h-6 w-6" />
          {notifications.filter((n) => !n.read).length > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {notifications.filter((n) => !n.read).length}
            </div>
          )}
        </Button>
      </header>

      {/* Content */}
      <div className="pb-24 px-4 pt-4">
        {activeTab === "home" && renderHomeTab()}
        {activeTab === "search" && renderSearchTab()}
        {activeTab === "create" && renderCreateTab()}
        {activeTab === "reels" && (
          <div className="text-center py-12">
            <div className="bg-gradient-to-r from-purple-400 to-pink-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Film className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Colorful Reels Coming Soon
            </h3>
            <p className="text-gray-600">Amazing short videos with filters and effects!</p>
          </div>
        )}
        {activeTab === "profile" && renderProfileTab()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-purple-200 px-4 py-3">
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-1 rounded-3xl">
          <div className="bg-white rounded-3xl px-4 py-2">
            <div className="flex justify-around">
              {[
                { tab: "home", icon: Home, label: "Home" },
                { tab: "search", icon: Search, label: "Discover" },
                { tab: "create", icon: Plus, label: "Create" },
                { tab: "reels", icon: Film, label: "Reels" },
                { tab: "profile", icon: User, label: "Profile" },
              ].map(({ tab, icon: Icon, label }) => (
                <Button
                  key={tab}
                  variant="ghost"
                  size="icon"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-2xl ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      : "text-gray-400 hover:text-purple-500"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEditProfile && renderEditProfile()}
      {showSettings && renderSettings()}
      {showNotifications && renderNotifications()}
      {showStoryViewer && renderStoryViewer()}
    </div>
  )

  return <>{content}</>
}
