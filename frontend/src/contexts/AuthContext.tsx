import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authService } from '../services/auth'
import { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth'
import { User } from '../types/index'

// Authentication context interface
interface AuthContextType {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Methods
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>
  register: (userData: RegisterRequest) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
  clearError: () => void
  
  // User management
  updateProfile: (userData: Partial<User>) => Promise<{ success: boolean; error?: string }>
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
  
  // Token management
  getAccessToken: () => string | null
  getRefreshToken: () => string | null
  setTokens: (tokens: { access_token: string; refresh_token: string }) => void
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user'

// Token storage utilities
const tokenStorage = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },
  
  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },
  
  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },
  
  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
  
  getUser: (): User | null => {
    const userStr = localStorage.getItem(USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  },
  
  setUser: (user: User): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  
  clearUser: (): void => {
    localStorage.removeItem(USER_KEY)
  }
}

// Auth provider props
interface AuthProviderProps {
  children: ReactNode
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize authentication state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = tokenStorage.getAccessToken()
        const refreshToken = tokenStorage.getRefreshToken()
        
        if (accessToken && refreshToken) {
          // Try to get current user
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
          setIsAuthenticated(true)
        }
      } catch (error) {
        // Token is invalid, clear storage
        tokenStorage.clearTokens()
        tokenStorage.clearUser()
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Login function
  const login = async (credentials: LoginRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      setIsLoading(true)
      
      const response = await authService.login(credentials)
      
      // Store tokens and user
      tokenStorage.setTokens(response.access_token, response.refresh_token)
      tokenStorage.setUser(response.user)
      
      setUser(response.user)
      setIsAuthenticated(true)
      
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Login failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (userData: RegisterRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      setIsLoading(true)
      
      const response = await authService.register(userData)
      
      // Store tokens and user
      tokenStorage.setTokens(response.access_token, response.refresh_token)
      tokenStorage.setUser(response.user)
      
      setUser(response.user)
      setIsAuthenticated(true)
      
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Registration failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Call logout endpoint
      await authService.logout()
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error)
    } finally {
      // Clear local state and storage
      setUser(null)
      setIsAuthenticated(false)
      setError(null)
      tokenStorage.clearTokens()
      tokenStorage.clearUser()
    }
  }

  // Refresh token function
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenValue = tokenStorage.getRefreshToken()
      if (!refreshTokenValue) {
        return false
      }

      const response = await authService.refreshToken(refreshTokenValue)
      
      // Update tokens
      tokenStorage.setTokens(response.access_token, response.refresh_token)
      
      return true
    } catch (error) {
      // Refresh failed, logout user
      await logout()
      return false
    }
  }

  // Update profile function
  const updateProfile = async (userData: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      setIsLoading(true)
      
      const updatedUser = await authService.updateProfile(userData)
      
      // Update user in state and storage
      setUser(updatedUser)
      tokenStorage.setUser(updatedUser)
      
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Profile update failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Change password function
  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      setIsLoading(true)
      
      await authService.changePassword(currentPassword, newPassword)
      
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Password change failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Clear error function
  const clearError = (): void => {
    setError(null)
  }

  // Token getters
  const getAccessToken = (): string | null => {
    return tokenStorage.getAccessToken()
  }

  const getRefreshToken = (): string | null => {
    return tokenStorage.getRefreshToken()
  }

  const setTokens = (tokens: { access_token: string; refresh_token: string }): void => {
    tokenStorage.setTokens(tokens.access_token, tokens.refresh_token)
  }

  // Context value
  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshToken,
    clearError,
    updateProfile,
    changePassword,
    getAccessToken,
    getRefreshToken,
    setTokens
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 