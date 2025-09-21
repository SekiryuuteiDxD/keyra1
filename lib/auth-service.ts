import { supabase } from './supabase'
import bcrypt from 'bcryptjs'

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  userType: 'customer' | 'admin'
  isActive: boolean
  lastLogin?: string
  createdAt: string
}

export interface UserProfile {
  id: string
  userId: string
  address?: string
  employeeCode?: string
  planType: string
  profileImageUrl?: string
  bio?: string
  socialLinks: Record<string, string>
  preferences: Record<string, any>
}

export interface UserSession {
  id: string
  userId: string
  sessionToken: string
  expiresAt: string
  deviceInfo: Record<string, any>
  ipAddress?: string
}

// Generate session token
const generateSessionToken = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Hash password
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Verify password
const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash)
}

// Register new user
export const registerUser = async (userData: {
  name: string
  email: string
  phone?: string
  password: string
  userType?: 'customer' | 'admin'
}): Promise<{ user: User | null, error: string | null }> => {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', userData.email)
      .single()

    if (existingUser) {
      return { user: null, error: 'User already exists' }
    }

    // Hash password
    const passwordHash = await hashPassword(userData.password)

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([{
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password_hash: passwordHash,
        user_type: userData.userType || 'customer'
      }])
      .select()
      .single()

    if (userError) throw userError

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert([{
        user_id: user.id,
        plan_type: 'single'
      }])

    if (profileError) throw profileError

    const mappedUser: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      userType: user.user_type,
      isActive: user.is_active,
      createdAt: user.created_at
    }

    return { user: mappedUser, error: null }
  } catch (error: any) {
    console.error('Registration error:', error)
    return { user: null, error: error.message || 'Registration failed' }
  }
}

// Login user
export const loginUser = async (
  emailOrPhone: string,
  password: string
): Promise<{ user: User | null, sessionToken: string | null, error: string | null }> => {
  try {
    // Find user by email or phone
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${emailOrPhone},phone.eq.${emailOrPhone}`)
      .eq('is_active', true)
      .single()

    if (userError || !user) {
      return { user: null, sessionToken: null, error: 'Invalid credentials' }
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      return { user: null, sessionToken: null, error: 'Invalid credentials' }
    }

    // Generate session token
    const sessionToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    // Create session
    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert([{
        user_id: user.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        device_info: {
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
          timestamp: new Date().toISOString()
        }
      }])

    if (sessionError) throw sessionError

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    const mappedUser: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      userType: user.user_type,
      isActive: user.is_active,
      lastLogin: new Date().toISOString(),
      createdAt: user.created_at
    }

    return { user: mappedUser, sessionToken, error: null }
  } catch (error: any) {
    console.error('Login error:', error)
    return { user: null, sessionToken: null, error: error.message || 'Login failed' }
  }
}

// Verify session and get user
export const verifySession = async (
  sessionToken: string
): Promise<{ user: User | null, profile: UserProfile | null, error: string | null }> => {
  try {
    // Verify session token
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select(`
        *,
        users (
          id,
          email,
          name,
          phone,
          user_type,
          is_active,
          last_login,
          created_at
        )
      `)
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (sessionError || !session) {
      return { user: null, profile: null, error: 'Invalid or expired session' }
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', session.user_id)
      .single()

    const mappedUser: User = {
      id: session.users.id,
      email: session.users.email,
      name: session.users.name,
      phone: session.users.phone,
      userType: session.users.user_type,
      isActive: session.users.is_active,
      lastLogin: session.users.last_login,
      createdAt: session.users.created_at
    }

    const mappedProfile: UserProfile | null = profile ? {
      id: profile.id,
      userId: profile.user_id,
      address: profile.address,
      employeeCode: profile.employee_code,
      planType: profile.plan_type,
      profileImageUrl: profile.profile_image_url,
      bio: profile.bio,
      socialLinks: profile.social_links || {},
      preferences: profile.preferences || {}
    } : null

    return { user: mappedUser, profile: mappedProfile, error: null }
  } catch (error: any) {
    console.error('Session verification error:', error)
    return { user: null, profile: null, error: error.message || 'Session verification failed' }
  }
}

// Update user profile
export const updateUserProfile = async (
  userId: string,
  profileData: Partial<UserProfile>
): Promise<{ profile: UserProfile | null, error: string | null }> => {
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .update({
        address: profileData.address,
        employee_code: profileData.employeeCode,
        plan_type: profileData.planType,
        profile_image_url: profileData.profileImageUrl,
        bio: profileData.bio,
        social_links: profileData.socialLinks,
        preferences: profileData.preferences
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    const mappedProfile: UserProfile = {
      id: profile.id,
      userId: profile.user_id,
      address: profile.address,
      employeeCode: profile.employee_code,
      planType: profile.plan_type,
      profileImageUrl: profile.profile_image_url,
      bio: profile.bio,
      socialLinks: profile.social_links || {},
      preferences: profile.preferences || {}
    }

    return { profile: mappedProfile, error: null }
  } catch (error: any) {
    console.error('Profile update error:', error)
    return { profile: null, error: error.message || 'Profile update failed' }
  }
}

// Save QR code to database
export const saveUserQRCode = async (
  userId: string,
  qrData: {
    qrCodeId: string
    qrData: string
    qrType: string
    qrImageUrl?: string
    metadata?: Record<string, any>
  }
): Promise<{ qrCode: any | null, error: string | null }> => {
  try {
    const { data: qrCode, error } = await supabase
      .from('user_qr_codes')
      .insert([{
        user_id: userId,
        qr_code_id: qrData.qrCodeId,
        qr_data: qrData.qrData,
        qr_type: qrData.qrType,
        qr_image_url: qrData.qrImageUrl,
        metadata: qrData.metadata || {}
      }])
      .select()
      .single()

    if (error) throw error

    return { qrCode, error: null }
  } catch (error: any) {
    console.error('QR code save error:', error)
    return { qrCode: null, error: error.message || 'Failed to save QR code' }
  }
}

// Get user's QR codes
export const getUserQRCodes = async (
  userId: string
): Promise<{ qrCodes: any[], error: string | null }> => {
  try {
    const { data: qrCodes, error } = await supabase
      .from('user_qr_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { qrCodes: qrCodes || [], error: null }
  } catch (error: any) {
    console.error('Get QR codes error:', error)
    return { qrCodes: [], error: error.message || 'Failed to get QR codes' }
  }
}

// Logout user
export const logoutUser = async (sessionToken: string): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('session_token', sessionToken)

    if (error) throw error

    return { error: null }
  } catch (error: any) {
    console.error('Logout error:', error)
    return { error: error.message || 'Logout failed' }
  }
}

// Clean expired sessions
export const cleanExpiredSessions = async (): Promise<void> => {
  try {
    await supabase
      .from('user_sessions')
      .delete()
      .lt('expires_at', new Date().toISOString())
  } catch (error) {
    console.error('Clean expired sessions error:', error)
  }
}
