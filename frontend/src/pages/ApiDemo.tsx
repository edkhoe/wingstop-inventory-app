import React, { useState } from 'react'
import {
  ResponsiveContainer,
  ResponsiveCard,
  ResponsiveText,
  Button,
  Alert,
  Badge
} from '../components/ui'
import {
  useCurrentUser,
  useLogin,
  useLogout,
  useInventoryItems,
  useCategories,
  useCreateCategory,
  useCounts,
  useTodayCounts,
  useInventoryAnalytics,
  useCountAnalytics
} from '../hooks/useApi'
import { authService } from '../services/auth'
import { inventoryService } from '../services/inventory'
import { countsService } from '../services/counts'
import { Package, Users, ClipboardList, BarChart3, RefreshCw } from 'lucide-react'

const ApiDemo: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('auth')
  const [testEmail, setTestEmail] = useState('test@wingstop.com')
  const [testPassword, setTestPassword] = useState('TestPassword123!')

  // Auth hooks
  const { data: currentUser, isLoading: userLoading, error: userError } = useCurrentUser()
  const loginMutation = useLogin()
  const logoutMutation = useLogout()

  // Inventory hooks
  const { data: inventoryData, isLoading: inventoryLoading, error: inventoryError } = useInventoryItems({
    page: 1,
    size: 10
  })
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const createCategoryMutation = useCreateCategory()

  // Counts hooks
  const { data: countsData, isLoading: countsLoading, error: countsError } = useCounts({
    page: 1,
    size: 10
  })
  const { data: todayCounts, isLoading: todayCountsLoading } = useTodayCounts()

  // Analytics hooks
  const { data: inventoryAnalytics, isLoading: inventoryAnalyticsLoading } = useInventoryAnalytics()
  const { data: countAnalytics, isLoading: countAnalyticsLoading } = useCountAnalytics()

  // Test functions
  const handleLogin = async () => {
    try {
      await loginMutation.mutateAsync({
        email: testEmail,
        password: testPassword
      })
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleCreateCategory = async () => {
    try {
      await createCategoryMutation.mutateAsync({
        name: `Test Category ${Date.now()}`,
        color: '#E31837'
      })
    } catch (error) {
      console.error('Create category failed:', error)
    }
  }

  const handleTestApiCall = async () => {
    try {
      // Test direct API service calls
      const categories = await inventoryService.getCategories()
      console.log('Categories:', categories)
      
      const analytics = await inventoryService.getInventoryAnalytics()
      console.log('Analytics:', analytics)
      
      const todayCounts = await countsService.getTodayCounts()
      console.log('Today Counts:', todayCounts)
    } catch (error) {
      console.error('API test failed:', error)
    }
  }

  const sections = [
    { id: 'auth', label: 'Authentication', icon: Users },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'counts', label: 'Counts', icon: ClipboardList },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'testing', label: 'API Testing', icon: RefreshCw }
  ]

  const renderAuthSection = () => (
    <div className="space-y-6">
      <ResponsiveCard variant="default" padding="lg">
        <h3 className="text-lg font-semibold mb-4">Current User</h3>
        
        {userLoading && <div className="text-center py-4">Loading...</div>}
        {userError && (
          <Alert type="error" title="Error loading user">
            {userError.message}
          </Alert>
        )}
        {currentUser && (
          <div className="space-y-2">
            <p><strong>Name:</strong> {currentUser.firstName} {currentUser.lastName}</p>
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>Role:</strong> {currentUser.role.name}</p>
            <p><strong>Location:</strong> {currentUser.location.name}</p>
          </div>
        )}
      </ResponsiveCard>

      <ResponsiveCard variant="default" padding="lg">
        <h3 className="text-lg font-semibold mb-4">Login Test</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleLogin}
              loading={loginMutation.isPending}
              disabled={loginMutation.isPending}
            >
              Test Login
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              loading={logoutMutation.isPending}
              disabled={logoutMutation.isPending}
            >
              Logout
            </Button>
          </div>
        </div>
      </ResponsiveCard>
    </div>
  )

  const renderInventorySection = () => (
    <div className="space-y-6">
      <ResponsiveCard variant="default" padding="lg">
        <h3 className="text-lg font-semibold mb-4">Inventory Items</h3>
        
        {inventoryLoading && <div className="text-center py-4">Loading...</div>}
        {inventoryError && (
          <Alert type="error" title="Error loading inventory">
            {inventoryError.message}
          </Alert>
        )}
        {inventoryData && (
          <div className="space-y-2">
            <p><strong>Total Items:</strong> {inventoryData.total}</p>
            <p><strong>Page:</strong> {inventoryData.page} of {inventoryData.pages}</p>
            <div className="space-y-1">
              {inventoryData.items.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>{item.name}</span>
                  <Badge variant="default">{item.category.name}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </ResponsiveCard>

      <ResponsiveCard variant="default" padding="lg">
        <h3 className="text-lg font-semibold mb-4">Categories</h3>
        
        {categoriesLoading && <div className="text-center py-4">Loading...</div>}
        {categories && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span><strong>Total Categories:</strong> {categories.length}</span>
              <Button
                onClick={handleCreateCategory}
                loading={createCategoryMutation.isPending}
                disabled={createCategoryMutation.isPending}
                size="sm"
              >
                Add Test Category
              </Button>
            </div>
            <div className="space-y-1">
              {categories.slice(0, 5).map((category) => (
                <div key={category.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>{category.name}</span>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm text-gray-500">{category.itemCount} items</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </ResponsiveCard>
    </div>
  )

  const renderCountsSection = () => (
    <div className="space-y-6">
      <ResponsiveCard variant="default" padding="lg">
        <h3 className="text-lg font-semibold mb-4">Count Entries</h3>
        
        {countsLoading && <div className="text-center py-4">Loading...</div>}
        {countsError && (
          <Alert type="error" title="Error loading counts">
            {countsError.message}
          </Alert>
        )}
        {countsData && (
          <div className="space-y-2">
            <p><strong>Total Counts:</strong> {countsData.total}</p>
            <p><strong>Page:</strong> {countsData.page} of {countsData.pages}</p>
            <div className="space-y-1">
              {countsData.items.slice(0, 5).map((count) => (
                <div key={count.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{count.item.name}</span>
                    <span className="text-sm text-gray-500 ml-2">Qty: {count.quantity}</span>
                  </div>
                  <Badge variant={count.status === 'approved' ? 'success' : count.status === 'rejected' ? 'danger' : 'warning'}>
                    {count.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </ResponsiveCard>

      <ResponsiveCard variant="default" padding="lg">
        <h3 className="text-lg font-semibold mb-4">Today's Counts</h3>
        
        {todayCountsLoading && <div className="text-center py-4">Loading...</div>}
        {todayCounts && (
          <div className="space-y-2">
            <p><strong>Today's Counts:</strong> {todayCounts.length}</p>
            <div className="space-y-1">
              {todayCounts.slice(0, 5).map((count) => (
                <div key={count.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>{count.item.name}</span>
                  <span className="text-sm text-gray-500">Qty: {count.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </ResponsiveCard>
    </div>
  )

  const renderAnalyticsSection = () => (
    <div className="space-y-6">
      <ResponsiveCard variant="default" padding="lg">
        <h3 className="text-lg font-semibold mb-4">Inventory Analytics</h3>
        
        {inventoryAnalyticsLoading && <div className="text-center py-4">Loading...</div>}
        {inventoryAnalytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Total Items</p>
              <p className="text-2xl font-bold text-blue-900">{inventoryAnalytics.totalItems}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-yellow-900">{inventoryAnalytics.lowStockItems}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-900">{inventoryAnalytics.outOfStockItems}</p>
            </div>
          </div>
        )}
      </ResponsiveCard>

      <ResponsiveCard variant="default" padding="lg">
        <h3 className="text-lg font-semibold mb-4">Count Analytics</h3>
        
        {countAnalyticsLoading && <div className="text-center py-4">Loading...</div>}
        {countAnalytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Total Counts</p>
              <p className="text-2xl font-bold text-green-900">{countAnalytics.totalCounts}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{countAnalytics.pendingCounts}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Approved</p>
              <p className="text-2xl font-bold text-blue-900">{countAnalytics.approvedCounts}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">Rejected</p>
              <p className="text-2xl font-bold text-red-900">{countAnalytics.rejectedCounts}</p>
            </div>
          </div>
        )}
      </ResponsiveCard>
    </div>
  )

  const renderTestingSection = () => (
    <div className="space-y-6">
      <ResponsiveCard variant="default" padding="lg">
        <h3 className="text-lg font-semibold mb-4">API Testing</h3>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Test direct API service calls and see the results in the browser console.
          </p>
          
          <Button
            onClick={handleTestApiCall}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Test API Calls
          </Button>
          
          <Alert type="info" title="Instructions">
            Open the browser console (F12) to see the API call results and any errors.
          </Alert>
        </div>
      </ResponsiveCard>

      <ResponsiveCard variant="default" padding="lg">
        <h3 className="text-lg font-semibold mb-4">Query Status</h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>User Query:</span>
            <Badge variant={userLoading ? 'warning' : userError ? 'danger' : 'success'}>
              {userLoading ? 'Loading' : userError ? 'Error' : 'Success'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Inventory Query:</span>
            <Badge variant={inventoryLoading ? 'warning' : inventoryError ? 'danger' : 'success'}>
              {inventoryLoading ? 'Loading' : inventoryError ? 'Error' : 'Success'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Counts Query:</span>
            <Badge variant={countsLoading ? 'warning' : countsError ? 'danger' : 'success'}>
              {countsLoading ? 'Loading' : countsError ? 'Error' : 'Success'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Categories Query:</span>
            <Badge variant={categoriesLoading ? 'warning' : 'success'}>
              {categoriesLoading ? 'Loading' : 'Success'}
            </Badge>
          </div>
        </div>
      </ResponsiveCard>
    </div>
  )

  const renderSection = () => {
    switch (activeSection) {
      case 'auth':
        return renderAuthSection()
      case 'inventory':
        return renderInventorySection()
      case 'counts':
        return renderCountsSection()
      case 'analytics':
        return renderAnalyticsSection()
      case 'testing':
        return renderTestingSection()
      default:
        return null
    }
  }

  return (
    <ResponsiveContainer maxWidth="full" padding="lg">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            API Client Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            This page demonstrates Axios API client with TanStack Query for caching, state management, and real-time updates.
          </p>
        </div>

        {/* Section Tabs */}
        <ResponsiveCard variant="default" padding="md">
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? 'primary' : 'outline'}
                  size="sm"
                  leftIcon={<Icon className="h-4 w-4" />}
                  onClick={() => setActiveSection(section.id)}
                >
                  {section.label}
                </Button>
              )
            })}
          </div>
        </ResponsiveCard>

        {/* Section Content */}
        {renderSection()}
      </div>
    </ResponsiveContainer>
  )
}

export default ApiDemo 