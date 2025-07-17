import { useCallback } from 'react'
import { useAuth as useAuthContext } from '../contexts/AuthContext'
import { LoginRequest, RegisterRequest } from '../types/auth'
import { User } from '../types/index'

// Re-export the main auth hook
export { useAuth as useAuth } from '../contexts/AuthContext'

// Additional specialized hooks
export const useLogin = () => {
  const { login, isLoading, error, clearError } = useAuthContext()

  const handleLogin = useCallback(async (credentials: LoginRequest) => {
    clearError()
    return await login(credentials)
  }, [login, clearError])

  return {
    login: handleLogin,
    isLoading,
    error
  }
}

export const useRegister = () => {
  const { register, isLoading, error, clearError } = useAuthContext()

  const handleRegister = useCallback(async (userData: RegisterRequest) => {
    clearError()
    return await register(userData)
  }, [register, clearError])

  return {
    register: handleRegister,
    isLoading,
    error
  }
}

export const useLogout = () => {
  const { logout, isLoading } = useAuthContext()

  const handleLogout = useCallback(async () => {
    await logout()
  }, [logout])

  return {
    logout: handleLogout,
    isLoading
  }
}

export const useProfile = () => {
  const { updateProfile, changePassword, isLoading, error, clearError } = useAuthContext()

  const handleUpdateProfile = useCallback(async (userData: Partial<User>) => {
    clearError()
    return await updateProfile(userData)
  }, [updateProfile, clearError])

  const handleChangePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    clearError()
    return await changePassword(currentPassword, newPassword)
  }, [changePassword, clearError])

  return {
    updateProfile: handleUpdateProfile,
    changePassword: handleChangePassword,
    isLoading,
    error
  }
}

export const useTokenRefresh = () => {
  const { refreshToken, isLoading } = useAuthContext()

  const handleRefreshToken = useCallback(async () => {
    return await refreshToken()
  }, [refreshToken])

  return {
    refreshToken: handleRefreshToken,
    isLoading
  }
} 