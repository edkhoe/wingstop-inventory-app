import { User, Role, Location } from './index'

// Authentication types
export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: User
}

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

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  new_password: string
}

export interface VerifyEmailRequest {
  token: string
}

export interface ResendVerificationRequest {
  email: string
}

// User management types
export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  firstName?: string
  lastName?: string
  roleId?: number
  locationId?: number
  isActive?: boolean
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  roleId: number
  locationId: number
}

// Role management types
export interface CreateRoleRequest {
  name: string
  description?: string
  permissions: string[]
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
  permissions?: string[]
  isActive?: boolean
}

// Location management types
export interface CreateLocationRequest {
  name: string
  address?: string
  phone?: string
  email?: string
}

export interface UpdateLocationRequest {
  name?: string
  address?: string
  phone?: string
  email?: string
  isActive?: boolean
} 