import { apiService } from './api'

// Types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  roleId: number
  locationId: number
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: User
}

import { User, Role, Location } from '../types/index'

export interface RefreshTokenRequest {
  refresh_token: string
}

// Auth API Service
export class AuthService {
  // Login
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/auth/login', credentials)
  }

  // Register
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/auth/register', userData)
  }

  // Refresh token
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/auth/refresh', { refresh_token: refreshToken })
  }

  // Logout
  async logout(): Promise<void> {
    return apiService.post<void>('/auth/logout')
  }

  // Get current user
  async getCurrentUser(): Promise<User> {
    return apiService.get<User>('/auth/me')
  }

  // Update profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    return apiService.put<User>('/auth/profile', userData)
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return apiService.post<void>('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    })
  }

  // Forgot password
  async forgotPassword(email: string): Promise<void> {
    return apiService.post<void>('/auth/forgot-password', { email })
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    return apiService.post<void>('/auth/reset-password', {
      token,
      new_password: newPassword
    })
  }

  // Verify email
  async verifyEmail(token: string): Promise<void> {
    return apiService.post<void>('/auth/verify-email', { token })
  }

  // Resend verification email
  async resendVerificationEmail(email: string): Promise<void> {
    return apiService.post<void>('/auth/resend-verification', { email })
  }
}

// Create auth service instance
export const authService = new AuthService() 