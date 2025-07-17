import React, { useState } from 'react'
import {
  ResponsiveContainer,
  ResponsiveCard,
  ResponsiveText,
  Button,
  Badge
} from '../components/ui'
import {
  User,
  Role,
  Location,
  Category,
  InventoryItem,
  CountEntry,
  Transfer,
  Schedule,
  Notification,
  Report,
  DashboardMetrics,
  PaginatedResponse,
  ApiResponse,
  ApiError
} from '../types'
import { 
  Users, 
  Package, 
  ClipboardList, 
  BarChart3, 
  Settings,
  Calendar,
  Bell,
  FileText,
  Database
} from 'lucide-react'

const TypesDemo: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('overview')

  // Example data using our types
  const exampleUser: User = {
    id: 1,
    username: 'john.doe',
    email: 'john.doe@wingstop.com',
    firstName: 'John',
    lastName: 'Doe',
    role: {
      id: 1,
      name: 'Manager',
      description: 'Store Manager',
      permissions: ['read', 'write', 'approve'],
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    location: {
      id: 1,
      name: 'Downtown Store',
      address: '123 Main St',
      phone: '555-0123',
      email: 'downtown@wingstop.com',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }

  const exampleCategory: Category = {
    id: 1,
    name: 'Proteins',
    color: '#E31837',
    description: 'Chicken and other proteins',
    itemCount: 15,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }

  const exampleInventoryItem: InventoryItem = {
    id: 1,
    name: 'Chicken Wings',
    categoryId: 1,
    category: exampleCategory,
    unit: 'lbs',
    parLevel: 50,
    reorderIncrement: 25,
    vendor: 'Wingstop Supplier',
    sku: 'CHK-WING-001',
    currentStock: 45,
    lastCountDate: '2024-01-15T10:00:00Z',
    lastCountQuantity: 48,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  }

  const exampleCountEntry: CountEntry = {
    id: 1,
    itemId: 1,
    item: {
      id: 1,
      name: 'Chicken Wings',
      unit: 'lbs',
      category: {
        id: 1,
        name: 'Proteins',
        color: '#E31837'
      }
    },
    locationId: 1,
    location: {
      id: 1,
      name: 'Downtown Store'
    },
    quantity: 45,
    notes: 'Counted by John Doe',
    variance: -3,
    variancePercentage: -6.25,
    status: 'approved',
    submittedBy: exampleUser,
    approvedBy: exampleUser,
    submittedAt: '2024-01-15T10:00:00Z',
    approvedAt: '2024-01-15T11:00:00Z',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z'
  }

  const examplePaginatedResponse: PaginatedResponse<InventoryItem> = {
    items: [exampleInventoryItem],
    total: 1,
    page: 1,
    size: 10,
    pages: 1
  }

  const exampleApiResponse: ApiResponse<InventoryItem> = {
    data: exampleInventoryItem,
    message: 'Item retrieved successfully',
    success: true
  }

  const exampleApiError: ApiError = {
    message: 'Item not found',
    code: '404',
    details: { itemId: 999 }
  }

  const sections = [
    { id: 'overview', label: 'Overview', icon: Database },
    { id: 'auth', label: 'Authentication', icon: Users },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'counts', label: 'Counts', icon: ClipboardList },
    { id: 'transfers', label: 'Transfers', icon: BarChart3 },
    { id: 'schedules', label: 'Schedules', icon: Calendar },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'reports', label: 'Reports', icon: FileText }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      <ResponsiveCard variant="default" padding="lg">
        <h3 className="text-lg font-semibold mb-4">TypeScript Interfaces Overview</h3>
        <div className="space-y-4">
          <p className="text-gray-600">
            This demo showcases all the TypeScript interfaces used in the Wingstop Inventory App.
            Each interface is designed to match our backend models and API responses.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900">Base Types</h4>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• BaseEntity - Common fields for all entities</li>
                <li>• PaginatedResponse - Pagination wrapper</li>
                <li>• ApiResponse - API response wrapper</li>
                <li>• ApiError - Error response structure</li>
              </ul>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900">Entity Types</h4>
              <ul className="text-sm text-green-700 mt-2 space-y-1">
                <li>• User, Role, Location - Authentication</li>
                <li>• Category, InventoryItem - Inventory</li>
                <li>• CountEntry, CountTemplate - Counts</li>
                <li>• Transfer, Schedule - Operations</li>
              </ul>
            </div>
          </div>
        </div>
      </ResponsiveCard>

      <ResponsiveCard variant="default" padding="lg">
        <h3 className="text-lg font-semibold mb-4">Example Data</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">User Example:</h4>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              {JSON.stringify(exampleUser, null, 2)}
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Paginated Response Example:</h4>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              {JSON.stringify(examplePaginatedResponse, null, 2)}
            </pre>
          </div>
        </div>
      </ResponsiveCard>
    </div>
  )

  const renderAuth = () => (
    <div className="space-y-6">
      <ResponsiveCard variant="default" padding="lg">
        <h3 className="text-lg font-semibold mb-4">Authentication Types</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">User Interface:</h4>
              <div className="bg-gray-50 p-3 rounded">
                <p><strong>ID:</strong> {exampleUser.id}</p>
                <p><strong>Name:</strong> {exampleUser.firstName} {exampleUser.lastName}</p>
                <p><strong>Email:</strong> {exampleUser.email}</p>
                <p><strong>Role:</strong> {exampleUser.role.name}</p>
                <p><strong>Location:</strong> {exampleUser.location.name}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Role Interface:</h4>
              <div className="bg-gray-50 p-3 rounded">
                <p><strong>Name:</strong> {exampleUser.role.name}</p>
                <p><strong>Description:</strong> {exampleUser.role.description}</p>
                <p><strong>Permissions:</strong> {exampleUser.role.permissions.join(', ')}</p>
                <p><strong>Active:</strong> {exampleUser.role.isActive ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </div>
      </ResponsiveCard>
    </div>
  )

  const renderInventory = () => (
    <div className="space-y-6">
      <ResponsiveCard variant="default" padding="lg">
        <h3 className="text-lg font-semibold mb-4">Inventory Types</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Category Interface:</h4>
              <div className="bg-gray-50 p-3 rounded">
                <p><strong>Name:</strong> {exampleCategory.name}</p>
                <p><strong>Color:</strong> 
                  <span 
                    className="inline-block w-4 h-4 rounded ml-2"
                    style={{ backgroundColor: exampleCategory.color }}
                  />
                  {exampleCategory.color}
                </p>
                <p><strong>Item Count:</strong> {exampleCategory.itemCount}</p>
                <p><strong>Description:</strong> {exampleCategory.description}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Inventory Item Interface:</h4>
              <div className="bg-gray-50 p-3 rounded">
                <p><strong>Name:</strong> {exampleInventoryItem.name}</p>
                <p><strong>Category:</strong> {exampleInventoryItem.category.name}</p>
                <p><strong>Unit:</strong> {exampleInventoryItem.unit}</p>
                <p><strong>Par Level:</strong> {exampleInventoryItem.parLevel}</p>
                <p><strong>Current Stock:</strong> {exampleInventoryItem.currentStock}</p>
                <p><strong>Vendor:</strong> {exampleInventoryItem.vendor}</p>
              </div>
            </div>
          </div>
        </div>
      </ResponsiveCard>
    </div>
  )

  const renderCounts = () => (
    <div className="space-y-6">
      <ResponsiveCard variant="default" padding="lg">
        <h3 className="text-lg font-semibold mb-4">Count Entry Types</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Count Entry Interface:</h4>
            <div className="bg-gray-50 p-3 rounded">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Item:</strong> {exampleCountEntry.item.name}</p>
                  <p><strong>Location:</strong> {exampleCountEntry.location.name}</p>
                  <p><strong>Quantity:</strong> {exampleCountEntry.quantity}</p>
                  <p><strong>Variance:</strong> {exampleCountEntry.variance}</p>
                </div>
                <div>
                  <p><strong>Status:</strong> 
                    <Badge variant={exampleCountEntry.status === 'approved' ? 'success' : 'warning'} className="ml-2">
                      {exampleCountEntry.status}
                    </Badge>
                  </p>
                  <p><strong>Submitted By:</strong> {exampleCountEntry.submittedBy.firstName} {exampleCountEntry.submittedBy.lastName}</p>
                  <p><strong>Submitted At:</strong> {new Date(exampleCountEntry.submittedAt).toLocaleDateString()}</p>
                  <p><strong>Notes:</strong> {exampleCountEntry.notes}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ResponsiveCard>
    </div>
  )

  const renderTransfers = () => (
    <div className="space-y-6">
      <ResponsiveCard variant="default" padding="lg">
        <h3 className="text-lg font-semibold mb-4">Transfer Types</h3>
        <div className="space-y-4">
          <p className="text-gray-600">
            Transfer interfaces handle inventory transfers between locations, including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li><strong>Transfer</strong> - Complete transfer record with status tracking</li>
            <li><strong>CreateTransferRequest</strong> - Data for creating new transfers</li>
            <li><strong>TransferFilters</strong> - Filtering and pagination options</li>
          </ul>
        </div>
      </ResponsiveCard>
    </div>
  )

  const renderSchedules = () => (
    <div className="space-y-6">
      <ResponsiveCard variant="default" padding="lg">
        <h3 className="text-lg font-semibold mb-4">Schedule Types</h3>
        <div className="space-y-4">
          <p className="text-gray-600">
            Schedule interfaces handle recurring count schedules and notifications:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li><strong>Schedule</strong> - Recurring count schedule with frequency configuration</li>
            <li><strong>CreateScheduleRequest</strong> - Data for creating new schedules</li>
            <li><strong>ScheduleFilters</strong> - Filtering and pagination options</li>
          </ul>
        </div>
      </ResponsiveCard>
    </div>
  )

  const renderNotifications = () => (
    <div className="space-y-6">
      <ResponsiveCard variant="default" padding="lg">
        <h3 className="text-lg font-semibold mb-4">Notification Types</h3>
        <div className="space-y-4">
          <p className="text-gray-600">
            Notification interfaces handle various types of notifications:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li><strong>Notification</strong> - Email, SMS, and in-app notifications</li>
            <li><strong>CreateNotificationRequest</strong> - Data for creating notifications</li>
            <li><strong>Status tracking</strong> - pending, sent, failed states</li>
          </ul>
        </div>
      </ResponsiveCard>
    </div>
  )

  const renderReports = () => (
    <div className="space-y-6">
      <ResponsiveCard variant="default" padding="lg">
        <h3 className="text-lg font-semibold mb-4">Report Types</h3>
        <div className="space-y-4">
          <p className="text-gray-600">
            Report interfaces handle report generation and scheduling:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li><strong>Report</strong> - Generated reports with status tracking</li>
            <li><strong>CreateReportRequest</strong> - Data for creating new reports</li>
            <li><strong>ReportFilters</strong> - Filtering and pagination options</li>
            <li><strong>Multiple formats</strong> - PDF, Excel, CSV export options</li>
          </ul>
        </div>
      </ResponsiveCard>
    </div>
  )

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview()
      case 'auth':
        return renderAuth()
      case 'inventory':
        return renderInventory()
      case 'counts':
        return renderCounts()
      case 'transfers':
        return renderTransfers()
      case 'schedules':
        return renderSchedules()
      case 'notifications':
        return renderNotifications()
      case 'reports':
        return renderReports()
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
            TypeScript Interfaces Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            This page showcases all the TypeScript interfaces used in the Wingstop Inventory App.
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

export default TypesDemo 