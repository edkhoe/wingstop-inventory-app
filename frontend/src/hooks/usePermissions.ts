import { useMemo } from 'react'
import { useAuth } from './useAuth'
import { User } from '../types/index'

// Permission checking hook
export const usePermissions = () => {
  const { user } = useAuth()

  const permissions = useMemo(() => {
    if (!user?.role?.permissions) {
      return []
    }
    return user.role.permissions
  }, [user])

  const hasPermission = useMemo(() => {
    return (permission: string): boolean => {
      return permissions.includes(permission)
    }
  }, [permissions])

  const hasAnyPermission = useMemo(() => {
    return (requiredPermissions: string[]): boolean => {
      return requiredPermissions.some(permission => permissions.includes(permission))
    }
  }, [permissions])

  const hasAllPermissions = useMemo(() => {
    return (requiredPermissions: string[]): boolean => {
      return requiredPermissions.every(permission => permissions.includes(permission))
    }
  }, [permissions])

  const hasRole = useMemo(() => {
    return (roleName: string): boolean => {
      return user?.role?.name === roleName
    }
  }, [user])

  const hasAnyRole = useMemo(() => {
    return (roleNames: string[]): boolean => {
      return roleNames.includes(user?.role?.name || '')
    }
  }, [user])

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    userRole: user?.role?.name || null
  }
}

// Specific permission hooks
export const useUserPermissions = () => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions()

  return {
    canReadUsers: hasPermission('users:read'),
    canCreateUsers: hasPermission('users:create'),
    canUpdateUsers: hasPermission('users:update'),
    canDeleteUsers: hasPermission('users:delete'),
    canManageUsers: hasAnyPermission(['users:create', 'users:update', 'users:delete'])
  }
}

export const useInventoryPermissions = () => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions()

  return {
    canReadInventory: hasPermission('inventory:read'),
    canCreateInventory: hasPermission('inventory:create'),
    canUpdateInventory: hasPermission('inventory:update'),
    canDeleteInventory: hasPermission('inventory:delete'),
    canExportInventory: hasPermission('inventory:export'),
    canManageInventory: hasAnyPermission(['inventory:create', 'inventory:update', 'inventory:delete'])
  }
}

export const useCountPermissions = () => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions()

  return {
    canReadCounts: hasPermission('counts:read'),
    canCreateCounts: hasPermission('counts:create'),
    canUpdateCounts: hasPermission('counts:update'),
    canDeleteCounts: hasPermission('counts:delete'),
    canApproveCounts: hasPermission('counts:approve'),
    canManageCounts: hasAnyPermission(['counts:create', 'counts:update', 'counts:delete', 'counts:approve'])
  }
}

export const useReportPermissions = () => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions()

  return {
    canReadReports: hasPermission('reports:read'),
    canCreateReports: hasPermission('reports:create'),
    canExportReports: hasPermission('reports:export'),
    canManageReports: hasAnyPermission(['reports:create', 'reports:export'])
  }
}

export const useSystemPermissions = () => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions()

  return {
    isAdmin: hasPermission('system:admin'),
    canConfigureSystem: hasPermission('system:config'),
    hasAdminAccess: hasAnyPermission(['system:admin', 'system:config'])
  }
}

import React from 'react'

// Role-based component wrapper
export const withPermission = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: string
): React.ComponentType<P> => {
  return (props: P) => {
    const { hasPermission } = usePermissions()
    
    if (!hasPermission(requiredPermission)) {
      return null // or a fallback component
    }
    
    return React.createElement(Component, props)
  }
}

export const withAnyPermission = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions: string[]
): React.ComponentType<P> => {
  return (props: P) => {
    const { hasAnyPermission } = usePermissions()
    
    if (!hasAnyPermission(requiredPermissions)) {
      return null // or a fallback component
    }
    
    return React.createElement(Component, props)
  }
}

export const withRole = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole: string
): React.ComponentType<P> => {
  return (props: P) => {
    const { hasRole } = usePermissions()
    
    if (!hasRole(requiredRole)) {
      return null // or a fallback component
    }
    
    return React.createElement(Component, props)
  }
} 