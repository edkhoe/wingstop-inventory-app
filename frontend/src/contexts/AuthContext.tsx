import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react'
import { authService } from '../services/auth'
import { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth'
import { User } from '../types/index'
import { tokenStorage, setTokenRefreshCallback, clearTokenRefreshCallback } from '../utils/tokenStorage'

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
  
  // Ref to track if a refresh is in progress (prevents race conditions)
  const refreshInProgress = useRef(false)

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
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Set up token refresh callback for API client
  useEffect(() => {
    setTokenRefreshCallback(refreshToken)
    return () => {
      clearTokenRefreshCallback()
    }
  }, [])

  // Login function
  const login = async (credentials: LoginRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      setIsLoading(true)
      
      const response = await authService.login(credentials)
      
      // Store tokens and user using shared utility
      tokenStorage.setTokensWithUser(response.access_token, response.refresh_token, response.user)
      
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
      
      // Store tokens and user using shared utility
      tokenStorage.setTokensWithUser(response.access_token, response.refresh_token, response.user)
      
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
    }
  }

  // Refresh token function - robust with race condition prevention
  const refreshToken = async (): Promise<boolean> => {
    // Prevent multiple simultaneous refresh attempts
    if (refreshInProgress.current) {
      // Wait for the current refresh to complete
      while (refreshInProgress.current) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      return tokenStorage.isAuthenticated()
    }

    try {
      refreshInProgress.current = true
      
      const refreshTokenValue = tokenStorage.getRefreshToken()
      if (!refreshTokenValue) {
        return false
      }

      const response = await authService.refreshToken(refreshTokenValue)
      
      // Update tokens and user info
      tokenStorage.setTokensWithUser(response.access_token, response.refresh_token, response.user)
      
      // Update state
      setUser(response.user)
      setIsAuthenticated(true)
      
      return true
    } catch (error) {
      // Refresh failed, logout user
      await logout()
      return false
    } finally {
      refreshInProgress.current = false
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
    setTokens,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 