// Token storage utility for centralized token management
import { User } from '../types/index'

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user'

// Token storage interface
export interface TokenData {
  access_token: string
  refresh_token: string
  user?: User
}

// Token storage utilities
export const tokenStorage = {
  // Get access token
  getAccessToken: (): string | null => {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY)
    } catch (error) {
      console.error('Error getting access token:', error)
      return null
    }
  },
  
  // Get refresh token
  getRefreshToken: (): string | null => {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY)
    } catch (error) {
      console.error('Error getting refresh token:', error)
      return null
    }
  },
  
  // Set tokens
  setTokens: (accessToken: string, refreshToken: string): void => {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    } catch (error) {
      console.error('Error setting tokens:', error)
    }
  },
  
  // Set tokens with user data
  setTokensWithUser: (accessToken: string, refreshToken: string, user: User): void => {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } catch (error) {
      console.error('Error setting tokens with user:', error)
    }
  },
  
  // Clear all tokens and user data
  clearTokens: (): void => {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    } catch (error) {
      console.error('Error clearing tokens:', error)
    }
  },
  
  // Get user data
  getUser: (): User | null => {
    try {
      const userStr = localStorage.getItem(USER_KEY)
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error('Error getting user:', error)
      return null
    }
  },
  
  // Set user data
  setUser: (user: User): void => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } catch (error) {
      console.error('Error setting user:', error)
    }
  },
  
  // Clear user data
  clearUser: (): void => {
    try {
      localStorage.removeItem(USER_KEY)
    } catch (error) {
      console.error('Error clearing user:', error)
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    try {
      return !!(localStorage.getItem(ACCESS_TOKEN_KEY) && localStorage.getItem(REFRESH_TOKEN_KEY))
    } catch (error) {
      console.error('Error checking authentication:', error)
      return false
    }
  }
}

// Token refresh callback type
export type TokenRefreshCallback = () => Promise<boolean>

// Global token refresh callback (set by AuthContext)
let tokenRefreshCallback: TokenRefreshCallback | null = null

// Set the token refresh callback
export const setTokenRefreshCallback = (callback: TokenRefreshCallback): void => {
  tokenRefreshCallback = callback
}

// Get the token refresh callback
export const getTokenRefreshCallback = (): TokenRefreshCallback | null => {
  return tokenRefreshCallback
}

// Clear the token refresh callback
export const clearTokenRefreshCallback = (): void => {
  tokenRefreshCallback = null
} 