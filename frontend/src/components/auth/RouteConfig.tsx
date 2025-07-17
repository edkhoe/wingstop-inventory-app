import React from 'react'
import { Route } from 'react-router-dom'
import RouteGuard from './RouteGuard'

export interface RouteConfig {
  path: string
  element: React.ReactNode
  requireAuth?: boolean
  requiredPermissions?: string[]
  requireAnyPermission?: boolean
  requiredRoles?: string[]
  requireAnyRole?: boolean
  fallback?: React.ReactNode
  redirectTo?: string
  showLoading?: boolean
  loadingComponent?: React.ReactNode
}

export interface RouteGroupConfig {
  path: string
  element: React.ReactNode
  children: RouteConfig[]
  requireAuth?: boolean
  requiredPermissions?: string[]
  requireAnyPermission?: boolean
  requiredRoles?: string[]
  requireAnyRole?: boolean
  fallback?: React.ReactNode
  redirectTo?: string
  showLoading?: boolean
  loadingComponent?: React.ReactNode
}

// Create a protected route element
export const createProtectedRoute = (config: RouteConfig): React.ReactElement => {
  return (
    <Route
      key={config.path}
      path={config.path}
      element={
        <RouteGuard
          requireAuth={config.requireAuth}
          requiredPermissions={config.requiredPermissions}
          requireAnyPermission={config.requireAnyPermission}
          requiredRoles={config.requiredRoles}
          requireAnyRole={config.requireAnyRole}
          fallback={config.fallback}
          redirectTo={config.redirectTo}
          showLoading={config.showLoading}
          loadingComponent={config.loadingComponent}
        >
          {config.element}
        </RouteGuard>
      }
    />
  )
}

// Create a route group with nested protected routes
export const createRouteGroup = (config: RouteGroupConfig): React.ReactElement => {
  return (
    <Route
      key={config.path}
      path={config.path}
      element={
        <RouteGuard
          requireAuth={config.requireAuth}
          requiredPermissions={config.requiredPermissions}
          requireAnyPermission={config.requireAnyPermission}
          requiredRoles={config.requiredRoles}
          requireAnyRole={config.requireAnyRole}
          fallback={config.fallback}
          redirectTo={config.redirectTo}
          showLoading={config.showLoading}
          loadingComponent={config.loadingComponent}
        >
          {config.element}
        </RouteGuard>
      }
    >
      {config.children.map(childConfig => createProtectedRoute(childConfig))}
    </Route>
  )
}

// Predefined route configurations
export const routeConfigs = {
  // Public routes
  public: {
    login: { path: '/login', element: <div>Login Page</div>, requireAuth: false },
    register: { path: '/register', element: <div>Register Page</div>, requireAuth: false },
  },

  // Basic authenticated routes
  authenticated: {
    dashboard: { 
      path: '/dashboard', 
      element: <div>Dashboard</div>, 
      requireAuth: true 
    },
    profile: { 
      path: '/profile', 
      element: <div>Profile</div>, 
      requireAuth: true 
    },
  },

  // Admin routes
  admin: {
    systemSettings: { 
      path: '/system-settings', 
      element: <div>System Settings</div>, 
      requireAuth: true,
      requiredRoles: ['admin'],
      fallback: <div>Admin access required</div>
    },
    userManagement: { 
      path: '/user-management', 
      element: <div>User Management</div>, 
      requireAuth: true,
      requiredPermissions: ['users:read'],
    },
  },

  // Manager routes
  manager: {
    reports: { 
      path: '/reports', 
      element: <div>Reports</div>, 
      requireAuth: true,
      requiredRoles: ['admin', 'manager'],
      requireAnyRole: true,
    },
    settings: { 
      path: '/settings', 
      element: <div>Settings</div>, 
      requireAuth: true,
      requiredRoles: ['admin', 'manager'],
      requireAnyRole: true,
    },
  },

  // Inventory routes
  inventory: {
    list: { 
      path: '/inventory', 
      element: <div>Inventory List</div>, 
      requireAuth: true,
      requiredPermissions: ['inventory:read'],
    },
    create: { 
      path: '/inventory/create', 
      element: <div>Create Inventory Item</div>, 
      requireAuth: true,
      requiredPermissions: ['inventory:read', 'inventory:create'],
    },
    edit: { 
      path: '/inventory/:id/edit', 
      element: <div>Edit Inventory Item</div>, 
      requireAuth: true,
      requiredPermissions: ['inventory:read', 'inventory:update'],
    },
  },

  // Count routes
  counts: {
    list: { 
      path: '/counts', 
      element: <div>Counts List</div>, 
      requireAuth: true,
      requiredPermissions: ['counts:read'],
    },
    create: { 
      path: '/counts/create', 
      element: <div>Create Count</div>, 
      requireAuth: true,
      requiredPermissions: ['counts:read', 'counts:create'],
    },
    approve: { 
      path: '/counts/approve', 
      element: <div>Approve Counts</div>, 
      requireAuth: true,
      requiredPermissions: ['counts:read', 'counts:approve'],
    },
  },
}

// Route group configurations
export const routeGroupConfigs = {
  // Main app layout with protected routes
  mainApp: {
    path: '/',
    element: <div>Main Layout</div>,
    requireAuth: true,
    children: [
      { path: '', element: <div>Home</div>, requireAuth: true },
      { path: 'dashboard', element: <div>Dashboard</div>, requireAuth: true },
      { path: 'inventory', element: <div>Inventory</div>, requireAuth: true, requiredPermissions: ['inventory:read'] },
      { path: 'counts', element: <div>Counts</div>, requireAuth: true, requiredPermissions: ['counts:read'] },
      { path: 'reports', element: <div>Reports</div>, requireAuth: true, requiredPermissions: ['reports:read'] },
      { path: 'settings', element: <div>Settings</div>, requireAuth: true, requiredRoles: ['admin', 'manager'], requireAnyRole: true },
    ]
  },

  // Admin section
  admin: {
    path: '/admin',
    element: <div>Admin Layout</div>,
    requireAuth: true,
    requiredRoles: ['admin'],
    children: [
      { path: 'users', element: <div>User Management</div>, requireAuth: true, requiredPermissions: ['users:read'] },
      { path: 'system', element: <div>System Settings</div>, requireAuth: true, requiredPermissions: ['system:config'] },
      { path: 'roles', element: <div>Role Management</div>, requireAuth: true, requiredPermissions: ['users:read'] },
    ]
  },
}

// Utility function to create routes from configuration
export const createRoutesFromConfig = (configs: RouteConfig[]): React.ReactElement[] => {
  return configs.map(config => createProtectedRoute(config))
}

// Utility function to create route groups from configuration
export const createRouteGroupsFromConfig = (configs: RouteGroupConfig[]): React.ReactElement[] => {
  return configs.map(config => createRouteGroup(config))
} 