import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../contexts/AuthContext'
import { authService } from '../../services/auth'
import { tokenStorage } from '../../utils/tokenStorage'

// Mock the auth service
vi.mock('../../services/auth', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    refreshToken: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn()
  }
}))

// Mock the token storage
vi.mock('../../utils/tokenStorage', () => ({
  tokenStorage: {
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn(),
    getUser: vi.fn(),
    setTokensWithUser: vi.fn(),
    clearTokens: vi.fn(),
    isAuthenticated: vi.fn()
  },
  setTokenRefreshCallback: vi.fn(),
  getTokenRefreshCallback: vi.fn(),
  clearTokenRefreshCallback: vi.fn()
}))

// Mock the API service
vi.mock('../../services/api', () => ({
  apiService: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: {
    id: 1,
    name: 'Manager',
    description: 'Store Manager',
    permissions: ['read', 'write'],
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  location: {
    id: 1,
    name: 'Test Location',
    address: '123 Test St',
    phone: '555-1234',
    email: 'test@location.com',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  isActive: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z'
}

const mockAuthResponse = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  token_type: 'bearer',
  expires_in: 3600,
  user: mockUser
}

// Test component to access context
const TestComponent = () => {
  const auth = useAuth()
  return (
    <div>
      <div data-testid="is-authenticated">{auth.isAuthenticated.toString()}</div>
      <div data-testid="user">{auth.user ? auth.user.username : 'no-user'}</div>
      <div data-testid="loading">{auth.isLoading.toString()}</div>
      <div data-testid="error">{auth.error || 'no-error'}</div>
      <button onClick={() => auth.login({ email: 'test@example.com', password: 'password' })}>
        Login
      </button>
      <button onClick={() => auth.logout()}>Logout</button>
      <button onClick={() => auth.refreshToken()}>Refresh</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('initializes with default state', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false')
      expect(screen.getByTestId('user')).toHaveTextContent('no-user')
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
      expect(screen.getByTestId('error')).toHaveTextContent('no-error')
    })

    it('initializes with existing tokens', async () => {
      vi.mocked(tokenStorage.getAccessToken).mockReturnValue('existing-token')
      vi.mocked(tokenStorage.getRefreshToken).mockReturnValue('existing-refresh-token')
      vi.mocked(tokenStorage.getUser).mockReturnValue(mockUser)
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true')
        expect(screen.getByTestId('user')).toHaveTextContent('testuser')
      })
    })
  })

  describe('Login', () => {
    it('handles successful login', async () => {
      vi.mocked(authService.login).mockResolvedValue(mockAuthResponse)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const loginButton = screen.getByText('Login')
      fireEvent.click(loginButton)

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password'
        })
        expect(tokenStorage.setTokensWithUser).toHaveBeenCalledWith(
          'test-access-token',
          'test-refresh-token',
          mockUser
        )
      })
    })

    it('handles login error', async () => {
      const errorMessage = 'Invalid credentials'
      vi.mocked(authService.login).mockRejectedValue(new Error(errorMessage))

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const loginButton = screen.getByText('Login')
      fireEvent.click(loginButton)

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(errorMessage)
      })
    })
  })

  describe('Logout', () => {
    it('handles logout correctly', async () => {
      vi.mocked(authService.logout).mockResolvedValue()

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const logoutButton = screen.getByText('Logout')
      fireEvent.click(logoutButton)

      await waitFor(() => {
        expect(authService.logout).toHaveBeenCalled()
        expect(tokenStorage.clearTokens).toHaveBeenCalled()
      })
    })

    it('handles logout error', async () => {
      const errorMessage = 'Logout failed'
      vi.mocked(authService.logout).mockRejectedValue(new Error(errorMessage))

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const logoutButton = screen.getByText('Logout')
      fireEvent.click(logoutButton)

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(errorMessage)
      })
    })
  })

  describe('Token Refresh', () => {
    it('handles successful token refresh', async () => {
      vi.mocked(tokenStorage.getRefreshToken).mockReturnValue('refresh-token')
      vi.mocked(authService.refreshToken).mockResolvedValue(mockAuthResponse)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const refreshButton = screen.getByText('Refresh')
      fireEvent.click(refreshButton)

      await waitFor(() => {
        expect(authService.refreshToken).toHaveBeenCalledWith('refresh-token')
        expect(tokenStorage.setTokensWithUser).toHaveBeenCalledWith(
          'test-access-token',
          'test-refresh-token',
          mockUser
        )
      })
    })

    it('handles token refresh error', async () => {
      const errorMessage = 'Token refresh failed'
      vi.mocked(tokenStorage.getRefreshToken).mockReturnValue('refresh-token')
      vi.mocked(authService.refreshToken).mockRejectedValue(new Error(errorMessage))

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const refreshButton = screen.getByText('Refresh')
      fireEvent.click(refreshButton)

      await waitFor(() => {
        expect(tokenStorage.clearTokens).toHaveBeenCalled()
      })
    })

    it('handles token refresh when no refresh token exists', async () => {
      vi.mocked(tokenStorage.getRefreshToken).mockReturnValue(null)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const refreshButton = screen.getByText('Refresh')
      fireEvent.click(refreshButton)

      await waitFor(() => {
        expect(authService.refreshToken).not.toHaveBeenCalled()
        expect(tokenStorage.clearTokens).toHaveBeenCalled()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles race conditions in token refresh', async () => {
      vi.mocked(tokenStorage.getRefreshToken).mockReturnValue('refresh-token')
      vi.mocked(authService.refreshToken).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockAuthResponse), 100))
      )

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const refreshButton = screen.getByText('Refresh')
      
      // Start multiple refresh attempts
      fireEvent.click(refreshButton)
      fireEvent.click(refreshButton)
      fireEvent.click(refreshButton)

      await waitFor(() => {
        // Should only call refresh once due to race condition prevention
        expect(authService.refreshToken).toHaveBeenCalledTimes(1)
      })
    })
  })
}) 