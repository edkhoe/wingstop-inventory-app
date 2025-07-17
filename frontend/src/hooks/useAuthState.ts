import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from './useAuth'

// Token refresh configuration
const REFRESH_THRESHOLD = 5 * 60 * 1000 // 5 minutes before expiry
const REFRESH_INTERVAL = 60 * 1000 // Check every minute

export const useAuthState = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    error, 
    refreshToken, 
    getAccessToken,
    logout 
  } = useAuth()
  
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
      refreshTimeoutRef.current = null
    }
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
      refreshIntervalRef.current = null
    }
  }, [])

  // Schedule token refresh
  const scheduleTokenRefresh = useCallback(async () => {
    if (!isAuthenticated) {
      clearTimers()
      return
    }

    try {
      const token = getAccessToken()
      if (!token) {
        await logout()
        return
      }

      // Decode JWT to get expiry (basic implementation)
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expiryTime = payload.exp * 1000 // Convert to milliseconds
      const currentTime = Date.now()
      const timeUntilExpiry = expiryTime - currentTime

      // If token expires soon, refresh it
      if (timeUntilExpiry <= REFRESH_THRESHOLD) {
        const success = await refreshToken()
        if (!success) {
          await logout()
          return
        }
      }

      // Schedule next refresh
      const nextRefreshTime = Math.max(timeUntilExpiry - REFRESH_THRESHOLD, 1000)
      refreshTimeoutRef.current = setTimeout(scheduleTokenRefresh, nextRefreshTime)

    } catch (error) {
      console.error('Token refresh error:', error)
      await logout()
    }
  }, [isAuthenticated, getAccessToken, logout, refreshToken, clearTimers])

  // Set up periodic token refresh check
  const setupPeriodicRefresh = useCallback(() => {
    if (!isAuthenticated) {
      clearTimers()
      return
    }

    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
    }

    // Set up new interval
    refreshIntervalRef.current = setInterval(scheduleTokenRefresh, REFRESH_INTERVAL)
  }, [isAuthenticated, scheduleTokenRefresh, clearTimers])

  // Initialize auth state management
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      scheduleTokenRefresh()
      setupPeriodicRefresh()
    } else {
      clearTimers()
    }

    return () => {
      clearTimers()
    }
  }, [isAuthenticated, isLoading, scheduleTokenRefresh, setupPeriodicRefresh, clearTimers])

  // Handle authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      // User just logged in, set up refresh
      scheduleTokenRefresh()
      setupPeriodicRefresh()
    } else {
      // User logged out, clear timers
      clearTimers()
    }
  }, [isAuthenticated, scheduleTokenRefresh, setupPeriodicRefresh, clearTimers])

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    isTokenValid: !!getAccessToken()
  }
}

// Hook for handling authentication errors
export const useAuthError = () => {
  const { error, clearError } = useAuth()

  const handleAuthError = useCallback((error: any) => {
    console.error('Authentication error:', error)
    
    // Handle specific error types
    if (error?.response?.status === 401) {
      // Unauthorized - token expired or invalid
      return { type: 'unauthorized', message: 'Session expired. Please log in again.' }
    } else if (error?.response?.status === 403) {
      // Forbidden - insufficient permissions
      return { type: 'forbidden', message: 'You do not have permission to perform this action.' }
    } else if (error?.response?.status === 422) {
      // Validation error
      return { type: 'validation', message: error.response.data.detail || 'Invalid input data.' }
    } else if (error?.response?.status >= 500) {
      // Server error
      return { type: 'server', message: 'Server error. Please try again later.' }
    } else {
      // Generic error
      return { type: 'generic', message: error?.message || 'An error occurred.' }
    }
  }, [])

  return {
    error,
    clearError,
    handleAuthError
  }
}

// Hook for authentication status
export const useAuthStatus = () => {
  const { isAuthenticated, isLoading, user } = useAuth()

  const authStatus = {
    isLoggedIn: isAuthenticated,
    isLoggedOut: !isAuthenticated && !isLoading,
    isLoading,
    hasUser: !!user,
    userRole: user?.role?.name || null,
    userLocation: user?.location?.name || null
  }

  return authStatus
} 