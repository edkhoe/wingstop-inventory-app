import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { registerSchema, RegisterFormData } from '../utils/validation'
import { Form } from '../components/forms/Form'
import { FormField, SelectField, FormFieldRow } from '../components/forms/FormField'
import { useRegister } from '../hooks/useAuth'
import { apiService } from '../services/api'
import { Role, Location } from '../types/index'

const Register: React.FC = () => {
  const navigate = useNavigate()
  const { register, isLoading, error } = useRegister()

  const [roles, setRoles] = useState<Role[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch roles and locations for select fields
    const fetchData = async () => {
      try {
        const rolesData = await apiService.get<Role[]>('/roles')
        setRoles(rolesData)
        const locationsData = await apiService.get<Location[]>('/locations')
        setLocations(locationsData)
      } catch (err: any) {
        setFetchError(err.message || 'Failed to load roles/locations')
      }
    }
    fetchData()
  }, [])

  const form = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      roleId: undefined,
      locationId: undefined,
    },
    mode: 'onTouched',
  })

  const onSubmit = async (data: RegisterFormData) => {
    const result = await register(data)
    if (result?.success) {
      navigate('/login', { state: { message: 'Registration successful! Please sign in.' } })
    }
    // error is handled by the hook
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join Wingstop Inventory Management
          </p>
        </div>
        <Form
          form={form}
          onSubmit={onSubmit}
          submitText={isLoading ? 'Creating account...' : 'Create account'}
          loading={isLoading}
          error={error || fetchError || undefined}
        >
          <FormField name="username" label="Username" placeholder="Enter a username" required />
          <FormFieldRow>
            <FormField name="firstName" label="First Name" placeholder="Enter your first name" required />
            <FormField name="lastName" label="Last Name" placeholder="Enter your last name" required />
          </FormFieldRow>
          <FormField name="email" label="Email address" type="email" placeholder="Enter your email" required />
          <FormField name="password" label="Password" type="password" placeholder="Enter your password" required />
          <FormField name="confirmPassword" label="Confirm Password" type="password" placeholder="Confirm your password" required />
          <SelectField
            name="roleId"
            label="Role"
            options={roles.map(role => ({ value: String(role.id), label: role.name }))}
            placeholder="Select a role"
            required
          />
          <SelectField
            name="locationId"
            label="Location"
            options={locations.map(loc => ({ value: String(loc.id), label: loc.name }))}
            placeholder="Select a location"
            required
          />
          <div className="text-center">
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default Register 