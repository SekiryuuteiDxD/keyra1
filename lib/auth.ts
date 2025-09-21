// Simple authentication system for development
interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
}

// Mock admin user for development
const mockAdminUser: User = {
  id: 'admin-1',
  email: 'admin@keyra.com',
  name: 'Admin User',
  role: 'admin'
}

// Check if user is authenticated (simplified for development)
export const getCurrentUser = (): User | null => {
  // In development, always return admin user
  // In production, this would check actual authentication state
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('currentUser')
    if (user) {
      return JSON.parse(user)
    }
    // Auto-login as admin for development
    localStorage.setItem('currentUser', JSON.stringify(mockAdminUser))
    return mockAdminUser
  }
  return mockAdminUser
}

// Check if current user is admin
export const isAdmin = (): boolean => {
  const user = getCurrentUser()
  return user?.role === 'admin'
}

// Login function (simplified for development)
export const login = async (email: string, password: string): Promise<{ user: User | null, error: string | null }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Simple admin login for development
  if (email === 'admin@keyra.com' && password === 'admin123') {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(mockAdminUser))
    }
    return { user: mockAdminUser, error: null }
  }
  
  return { user: null, error: 'Invalid credentials' }
}

// Logout function
export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentUser')
  }
}

// Check authentication status
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null
}
