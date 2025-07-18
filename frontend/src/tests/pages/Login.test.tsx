import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import Login from '../../pages/Login'

// Mock the auth service to not interfere with validation tests
vi.mock('../../services/auth', () => ({
  authService: {
    login: vi.fn().mockResolvedValue({
      access_token: 'test-token',
      refresh_token: 'test-refresh',
      token_type: 'bearer',
      expires_in: 3600,
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: { 
          id: 1, 
          name: 'Manager', 
          permissions: ['read', 'write'], 
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z'
        },
        location: { 
          id: 1, 
          name: 'Test Location', 
          isActive: true,
          address: '123 Test St',
          phone: '555-1234',
          email: 'test@location.com',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z'
        },
        isActive: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      }
    }),
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

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      state: { from: { pathname: '/dashboard' } }
    })
  }
})

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  )
}

// Helper function to get password input specifically
const getPasswordInput = () => {
  return screen.getByPlaceholderText('Enter your password') as HTMLInputElement
}

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Form Rendering', () => {
    it('renders login form with all fields', () => {
      renderLogin()

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument() // password input
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
    })

    it('renders form with proper accessibility attributes', () => {
      renderLogin()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = getPasswordInput()

      expect(emailInput).toHaveAttribute('type', 'email')
      expect(passwordInput).toHaveAttribute('type', 'password')
      // The inputs don't have required attribute in the actual implementation
      // but they are required through validation
      expect(emailInput).toHaveAttribute('placeholder', 'Enter your email')
      expect(passwordInput).toHaveAttribute('placeholder', 'Enter your password')
    })
  })

  describe('Form Validation', () => {
    it('shows validation errors for empty fields', async () => {
      renderLogin()

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      })
    })

    it('shows validation error for invalid email format', async () => {
      renderLogin()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = getPasswordInput()
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.change(passwordInput, { target: { value: 'password' } })
      
      // Trigger validation by blurring the email input
      fireEvent.blur(emailInput)
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      })
    })

    it('shows validation error for empty password when email is valid', async () => {
      renderLogin()

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      })
    })

    it('clears validation errors when user starts typing', async () => {
      renderLogin()

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      // Submit empty form to show errors
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      })

      // Start typing to clear error
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

      await waitFor(() => {
        expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const { authService } = await import('../../services/auth')

      renderLogin()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = getPasswordInput()
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'Password123!'
        })
      })

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
      })
    })

    it('handles login error', async () => {
      const errorMessage = 'Invalid credentials'
      const { authService } = await import('../../services/auth')
      vi.mocked(authService.login).mockRejectedValueOnce(new Error(errorMessage))

      renderLogin()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = getPasswordInput()
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it('handles network error', async () => {
      const { authService } = await import('../../services/auth')
      vi.mocked(authService.login).mockRejectedValueOnce(new Error('Network error'))

      renderLogin()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = getPasswordInput()
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })
    })
  })

  describe('Navigation', () => {
    it('navigates to register page when link is clicked', () => {
      renderLogin()

      const registerLink = screen.getByText(/don't have an account/i)
      fireEvent.click(registerLink)

      // Since we're using Link component, we need to check if the href is correct
      expect(registerLink).toHaveAttribute('href', '/register')
    })

    it('navigates to dashboard on successful login', async () => {
      const { authService } = await import('../../services/auth')

      renderLogin()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = getPasswordInput()
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
      })
    })
  })

  describe('User Experience', () => {
    it('shows password toggle functionality', () => {
      renderLogin()

      const passwordInput = getPasswordInput()
      const toggleButton = screen.getByRole('button', { name: /show password/i })

      expect(passwordInput).toHaveAttribute('type', 'password')

      fireEvent.click(toggleButton)

      expect(passwordInput).toHaveAttribute('type', 'text')

      fireEvent.click(toggleButton)

      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })
}) 