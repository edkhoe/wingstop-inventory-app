import React from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { loginSchema, LoginFormData } from '../utils/validation'
import { Form } from '../components/forms/Form'
import { FormField } from '../components/forms/FormField'
import { Mail, Lock } from 'lucide-react'
import { useLogin } from '../hooks/useAuth'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading, error } = useLogin()

  const fromRaw = location.state?.from?.pathname;
  const from = typeof fromRaw === 'string' && fromRaw ? fromRaw : '/dashboard';

  const form = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
  })

  const onSubmit = async (data: LoginFormData) => {
    const result = await login(data)
    if (result?.success) {
      navigate(from, { replace: true })
    }
    // error is handled by the hook
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Welcome back to Wingstop Inventory Management
          </p>
        </div>
        <Form
          form={form}
          onSubmit={onSubmit}
          submitText={isLoading ? 'Signing in...' : 'Sign in'}
          loading={isLoading}
          error={error}
        >
          <FormField
            name="email"
            label="Email address"
            type="email"
            placeholder="Enter your email"
            leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
            required
          />
          <FormField
            name="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
            required
          />
          <div className="text-center">
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default Login 