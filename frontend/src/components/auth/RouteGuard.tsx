import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { usePermissions } from '../../hooks/usePermissions'
import { Spinner } from '../ui/Loading'

export interface RouteGuardProps {
  children: React.ReactNode
  // Authentication requirements
  requireAuth?: boolean
  // Permission requirements
  requiredPermissions?: string[]
  requireAnyPermission?: boolean // If true, user needs ANY of the permissions. If false, user needs ALL permissions
  // Role requirements
  requiredRoles?: string[]
  requireAnyRole?: boolean // If true, user needs ANY of the roles. If false, user needs ALL roles
  // Custom fallback
  fallback?: React.ReactNode
  // Redirect options
  redirectTo?: string
  // Loading options
  showLoading?: boolean
  loadingComponent?: React.ReactNode
}

const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requireAuth = true,
  requiredPermissions = [],
  requireAnyPermission = false,
  requiredRoles = [],
  requireAnyRole = false,
  fallback,
  redirectTo = '/login',
  showLoading = true,
  loadingComponent
}) => {
  const { isAuthenticated, isLoading } = useAuth()
  const { hasPermission, hasRole } = usePermissions()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (isLoading && showLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {loadingComponent || <Spinner size="lg" />}
      </div>
    )
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Check permission requirements
  if (requiredPermissions.length > 0) {
    let hasRequiredPermissions = false

    if (requireAnyPermission) {
      // User needs ANY of the required permissions
      hasRequiredPermissions = requiredPermissions.some(permission => hasPermission(permission))
    } else {
      // User needs ALL of the required permissions
      hasRequiredPermissions = requiredPermissions.every(permission => hasPermission(permission))
    }

    if (!hasRequiredPermissions) {
      return fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have the required permissions to access this page.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Required permissions: {requiredPermissions.join(', ')}
            </p>
            <p className="text-xs text-gray-400">
              {requireAnyPermission ? 'You need at least one of these permissions.' : 'You need all of these permissions.'}
            </p>
          </div>
        </div>
      )
    }
  }

  // Check role requirements
  if (requiredRoles.length > 0) {
    let hasRequiredRoles = false

    if (requireAnyRole) {
      // User needs ANY of the required roles
      hasRequiredRoles = requiredRoles.some(role => hasRole(role))
    } else {
      // User needs ALL of the required roles
      hasRequiredRoles = requiredRoles.every(role => hasRole(role))
    }

    if (!hasRequiredRoles) {
      return fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have the required role to access this page.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Required roles: {requiredRoles.join(', ')}
            </p>
            <p className="text-xs text-gray-400">
              {requireAnyRole ? 'You need at least one of these roles.' : 'You need all of these roles.'}
            </p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}

export default RouteGuard 