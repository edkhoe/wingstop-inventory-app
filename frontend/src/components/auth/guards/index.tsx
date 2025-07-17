import React from 'react'
import RouteGuard from '../RouteGuard'

// Public route - no authentication required
export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteGuard requireAuth={false}>
    {children}
  </RouteGuard>
)

// Basic authenticated route - just requires login
export const AuthenticatedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteGuard requireAuth={true}>
    {children}
  </RouteGuard>
)

// Admin route - requires admin role
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteGuard 
    requireAuth={true}
    requiredRoles={['admin']}
    fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Admin Access Required</h2>
          <p className="text-gray-600">This page is only accessible to administrators.</p>
        </div>
      </div>
    }
  >
    {children}
  </RouteGuard>
)

// Manager route - requires manager or admin role
export const ManagerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteGuard 
    requireAuth={true}
    requiredRoles={['admin', 'manager']}
    requireAnyRole={true}
  >
    {children}
  </RouteGuard>
)

// Inventory management route
export const InventoryRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteGuard 
    requireAuth={true}
    requiredPermissions={['inventory:read']}
  >
    {children}
  </RouteGuard>
)

// Inventory management route with write access
export const InventoryWriteRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteGuard 
    requireAuth={true}
    requiredPermissions={['inventory:read', 'inventory:create', 'inventory:update']}
  >
    {children}
  </RouteGuard>
)

// Count management route
export const CountRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteGuard 
    requireAuth={true}
    requiredPermissions={['counts:read']}
  >
    {children}
  </RouteGuard>
)

// Count approval route
export const CountApprovalRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteGuard 
    requireAuth={true}
    requiredPermissions={['counts:read', 'counts:approve']}
  >
    {children}
  </RouteGuard>
)

// Report route
export const ReportRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteGuard 
    requireAuth={true}
    requiredPermissions={['reports:read']}
  >
    {children}
  </RouteGuard>
)

// User management route
export const UserManagementRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteGuard 
    requireAuth={true}
    requiredPermissions={['users:read']}
  >
    {children}
  </RouteGuard>
)

// Settings route - requires admin or manager
export const SettingsRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteGuard 
    requireAuth={true}
    requiredRoles={['admin', 'manager']}
    requireAnyRole={true}
  >
    {children}
  </RouteGuard>
)

// System configuration route - admin only
export const SystemConfigRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteGuard 
    requireAuth={true}
    requiredPermissions={['system:config']}
    fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">System Configuration Access</h2>
          <p className="text-gray-600">This page requires system configuration permissions.</p>
        </div>
      </div>
    }
  >
    {children}
  </RouteGuard>
)

// Custom route guard factory
export const createCustomRouteGuard = (
  permissions: string[] = [],
  roles: string[] = [],
  requireAnyPermission = false,
  requireAnyRole = false
) => {
  return ({ children }: { children: React.ReactNode }) => (
    <RouteGuard
      requireAuth={true}
      requiredPermissions={permissions}
      requireAnyPermission={requireAnyPermission}
      requiredRoles={roles}
      requireAnyRole={requireAnyRole}
    >
      {children}
    </RouteGuard>
  )
} 