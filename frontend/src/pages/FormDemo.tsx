import React, { useState } from 'react'
import {
  Form,
  FormSection,
  FormField,
  SelectField,
  CheckboxField,
  FormFieldGroup,
  FormFieldRow,
  useLoginForm,
  useRegisterForm,
  useInventoryItemForm,
  useCategoryForm,
  useCountEntryForm,
  useLocationForm,
  useSearchForm
} from '../components/forms'
import {
  ResponsiveContainer,
  ResponsiveCard,
  ResponsiveText,
  Button,
  Modal,
  Alert
} from '../components/ui'
import { Search, Package, Users, MapPin, Plus } from 'lucide-react'

const FormDemo: React.FC = () => {
  const [activeForm, setActiveForm] = useState<string>('login')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formError, setFormError] = useState<string>('')
  const [formSuccess, setFormSuccess] = useState<string>('')

  // Form hooks
  const loginForm = useLoginForm()
  const registerForm = useRegisterForm()
  const inventoryForm = useInventoryItemForm()
  const categoryForm = useCategoryForm()
  const countForm = useCountEntryForm()
  const locationForm = useLocationForm()
  const searchForm = useSearchForm()

  // Mock data for selects
  const categoryOptions = [
    { value: '1', label: 'Proteins' },
    { value: '2', label: 'Sauces' },
    { value: '3', label: 'Sides' },
    { value: '4', label: 'Beverages' }
  ]

  const locationOptions = [
    { value: '1', label: 'Downtown Store' },
    { value: '2', label: 'Mall Location' },
    { value: '3', label: 'Airport Store' }
  ]

  const roleOptions = [
    { value: '1', label: 'Manager' },
    { value: '2', label: 'Supervisor' },
    { value: '3', label: 'Employee' }
  ]

  const itemOptions = [
    { value: '1', label: 'Chicken Wings' },
    { value: '2', label: 'Ranch Sauce' },
    { value: '3', label: 'French Fries' }
  ]

  // Form submission handlers
  const handleLoginSubmit = async (data: any) => {
    console.log('Login form data:', data)
    setFormSuccess('Login form submitted successfully!')
    setFormError('')
  }

  const handleRegisterSubmit = async (data: any) => {
    console.log('Register form data:', data)
    setFormSuccess('Registration form submitted successfully!')
    setFormError('')
  }

  const handleInventorySubmit = async (data: any) => {
    console.log('Inventory form data:', data)
    setFormSuccess('Inventory item created successfully!')
    setFormError('')
  }

  const handleCategorySubmit = async (data: any) => {
    console.log('Category form data:', data)
    setFormSuccess('Category created successfully!')
    setFormError('')
  }

  const handleCountSubmit = async (data: any) => {
    console.log('Count form data:', data)
    setFormSuccess('Count entry submitted successfully!')
    setFormError('')
  }

  const handleLocationSubmit = async (data: any) => {
    console.log('Location form data:', data)
    setFormSuccess('Location created successfully!')
    setFormError('')
  }

  const handleSearchSubmit = async (data: any) => {
    console.log('Search form data:', data)
    setFormSuccess('Search applied successfully!')
    setFormError('')
  }

  const renderForm = () => {
    switch (activeForm) {
      case 'login':
        return (
          <Form
            form={loginForm}
            onSubmit={handleLoginSubmit}
            submitText="Sign In"
            error={formError}
            success={formSuccess}
          >
            <FormField
              name="email"
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              leftIcon={<Search className="h-4 w-4" />}
              required
            />
            <FormField
              name="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              required
            />
          </Form>
        )

      case 'register':
        return (
          <Form
            form={registerForm}
            onSubmit={handleRegisterSubmit}
            submitText="Create Account"
            error={formError}
            success={formSuccess}
          >
            <FormSection title="Personal Information">
              <FormFieldRow>
                <FormField
                  name="firstName"
                  label="First Name"
                  placeholder="Enter first name"
                  required
                />
                <FormField
                  name="lastName"
                  label="Last Name"
                  placeholder="Enter last name"
                  required
                />
              </FormFieldRow>
              <FormField
                name="username"
                label="Username"
                placeholder="Choose a username"
                required
              />
              <FormField
                name="email"
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                required
              />
            </FormSection>

            <FormSection title="Security">
              <FormField
                name="password"
                label="Password"
                type="password"
                placeholder="Create a password"
                required
              />
              <FormField
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                required
              />
            </FormSection>

            <FormSection title="Role & Location">
              <SelectField
                name="roleId"
                label="Role"
                options={roleOptions}
                placeholder="Select your role"
                required
              />
              <SelectField
                name="locationId"
                label="Location"
                options={locationOptions}
                placeholder="Select your location"
                required
              />
            </FormSection>
          </Form>
        )

      case 'inventory':
        return (
          <Form
            form={inventoryForm}
            onSubmit={handleInventorySubmit}
            submitText="Create Item"
            error={formError}
            success={formSuccess}
          >
            <FormSection title="Basic Information">
              <FormField
                name="name"
                label="Item Name"
                placeholder="Enter item name"
                required
              />
              <SelectField
                name="categoryId"
                label="Category"
                options={categoryOptions}
                placeholder="Select category"
                required
              />
              <FormField
                name="unit"
                label="Unit"
                placeholder="e.g., lbs, pieces, gallons"
                required
              />
            </FormSection>

            <FormSection title="Inventory Levels">
              <FormFieldRow>
                <FormField
                  name="parLevel"
                  label="Par Level"
                  type="number"
                  placeholder="0"
                  required
                />
                <FormField
                  name="reorderIncrement"
                  label="Reorder Increment"
                  type="number"
                  placeholder="0"
                  required
                />
              </FormFieldRow>
            </FormSection>

            <FormSection title="Vendor Information">
              <FormField
                name="vendor"
                label="Vendor"
                placeholder="Enter vendor name"
              />
              <FormField
                name="sku"
                label="SKU"
                placeholder="Enter SKU"
              />
            </FormSection>
          </Form>
        )

      case 'category':
        return (
          <Form
            form={categoryForm}
            onSubmit={handleCategorySubmit}
            submitText="Create Category"
            error={formError}
            success={formSuccess}
          >
            <FormField
              name="name"
              label="Category Name"
              placeholder="Enter category name"
              required
            />
            <FormField
              name="color"
              label="Color"
              placeholder="#E31837"
              helperText="Enter a hex color code"
              required
            />
          </Form>
        )

      case 'count':
        return (
          <Form
            form={countForm}
            onSubmit={handleCountSubmit}
            submitText="Submit Count"
            error={formError}
            success={formSuccess}
          >
            <SelectField
              name="itemId"
              label="Item"
              options={itemOptions}
              placeholder="Select item to count"
              required
            />
            <FormField
              name="quantity"
              label="Quantity"
              type="number"
              placeholder="0"
              required
            />
            <SelectField
              name="locationId"
              label="Location"
              options={locationOptions}
              placeholder="Select location"
              required
            />
            <FormField
              name="notes"
              label="Notes"
              placeholder="Add any notes about this count"
            />
          </Form>
        )

      case 'location':
        return (
          <Form
            form={locationForm}
            onSubmit={handleLocationSubmit}
            submitText="Create Location"
            error={formError}
            success={formSuccess}
          >
            <FormField
              name="name"
              label="Location Name"
              placeholder="Enter location name"
              required
            />
            <FormField
              name="address"
              label="Address"
              placeholder="Enter full address"
            />
            <FormField
              name="phone"
              label="Phone"
              type="tel"
              placeholder="Enter phone number"
            />
            <FormField
              name="email"
              label="Email"
              type="email"
              placeholder="Enter contact email"
            />
          </Form>
        )

      case 'search':
        return (
          <Form
            form={searchForm}
            onSubmit={handleSearchSubmit}
            submitText="Search"
            error={formError}
            success={formSuccess}
            showActions={false}
          >
            <FormFieldRow>
              <FormField
                name="query"
                label="Search Query"
                placeholder="Search items..."
                leftIcon={<Search className="h-4 w-4" />}
              />
              <SelectField
                name="category"
                label="Category"
                options={categoryOptions}
                placeholder="All categories"
              />
            </FormFieldRow>
            <FormFieldRow>
              <SelectField
                name="location"
                label="Location"
                options={locationOptions}
                placeholder="All locations"
              />
              <SelectField
                name="sortBy"
                label="Sort By"
                options={[
                  { value: 'name', label: 'Name' },
                  { value: 'category', label: 'Category' },
                  { value: 'parLevel', label: 'Par Level' },
                  { value: 'lastCount', label: 'Last Count' }
                ]}
                placeholder="Sort by..."
              />
            </FormFieldRow>
            <div className="flex justify-end">
              <Button type="submit" size="sm">
                Search
              </Button>
            </div>
          </Form>
        )

      default:
        return null
    }
  }

  const formTabs = [
    { id: 'login', label: 'Login', icon: Users },
    { id: 'register', label: 'Register', icon: Users },
    { id: 'inventory', label: 'Inventory Item', icon: Package },
    { id: 'category', label: 'Category', icon: Plus },
    { id: 'count', label: 'Count Entry', icon: Package },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'search', label: 'Search', icon: Search }
  ]

  return (
    <ResponsiveContainer maxWidth="full" padding="lg">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <ResponsiveText
            as="h1"
            size={{ xs: '2xl', sm: '3xl', md: '4xl', lg: '5xl' }}
            weight="bold"
            className="text-gray-900 mb-4"
          >
            Form Handling Demo
          </ResponsiveText>
          <ResponsiveText
            size={{ xs: 'sm', sm: 'base', md: 'lg' }}
            color="muted"
            className="max-w-2xl mx-auto"
          >
            This page demonstrates React Hook Form integration with Yup validation and our UI components.
          </ResponsiveText>
        </div>

        {/* Form Tabs */}
        <ResponsiveCard variant="default" padding="md">
          <div className="flex flex-wrap gap-2">
            {formTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  variant={activeForm === tab.id ? 'primary' : 'outline'}
                  size="sm"
                  leftIcon={<Icon className="h-4 w-4" />}
                  onClick={() => {
                    setActiveForm(tab.id)
                    setFormError('')
                    setFormSuccess('')
                  }}
                >
                  {tab.label}
                </Button>
              )
            })}
          </div>
        </ResponsiveCard>

        {/* Form Display */}
        <ResponsiveCard variant="default" padding="lg">
          <ResponsiveText
            as="h2"
            size={{ xs: 'lg', sm: 'xl', md: '2xl' }}
            weight="semibold"
            className="mb-6"
          >
            {formTabs.find(tab => tab.id === activeForm)?.label} Form
          </ResponsiveText>
          
          {renderForm()}
        </ResponsiveCard>

        {/* Modal Form Example */}
        <ResponsiveCard variant="default" padding="lg">
          <ResponsiveText
            as="h2"
            size={{ xs: 'lg', sm: 'xl', md: '2xl' }}
            weight="semibold"
            className="mb-6"
          >
            Modal Form Example
          </ResponsiveText>
          
          <Button onClick={() => setIsModalOpen(true)}>
            Open Modal Form
          </Button>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Quick Add Category"
            size="md"
          >
            <Form
              form={categoryForm}
              onSubmit={handleCategorySubmit}
              submitText="Add Category"
              onCancel={() => setIsModalOpen(false)}
              error={formError}
              success={formSuccess}
            >
              <FormField
                name="name"
                label="Category Name"
                placeholder="Enter category name"
                required
              />
              <FormField
                name="color"
                label="Color"
                placeholder="#E31837"
                helperText="Enter a hex color code"
                required
              />
            </Form>
          </Modal>
        </ResponsiveCard>
      </div>
    </ResponsiveContainer>
  )
}

export default FormDemo 