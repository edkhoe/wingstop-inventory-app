import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { usePermissions } from '../hooks/usePermissions'
import { useAuthState } from '../hooks/useAuthState'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import ResponsiveCard from '../components/ui/ResponsiveCard'
import ResponsiveContainer from '../components/ui/ResponsiveContainer'
import ResponsiveText from '../components/ui/ResponsiveText'
import ResponsiveGrid from '../components/ui/ResponsiveGrid'
import Alert from '../components/ui/Alert'
import { 
  PublicRoute, 
  AuthenticatedRoute, 
  AdminRoute, 
  ManagerRoute, 
  InventoryRoute, 
  CountRoute, 
  ReportRoute, 
  SettingsRoute,
  SystemConfigRoute 
} from '../components/auth/guards'

const RouteGuardDemo: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { permissions, hasPermission, hasRole, userRole } = usePermissions()
  const { isTokenValid } = useAuthState()

  // Test components for different route guards
  const TestComponent = ({ title, description }: { title: string; description: string }) => (
    <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
      <h3 className="font-semibold text-green-800">{title}</h3>
      <p className="text-green-700">{description}</p>
    </div>
  )

  const AccessDeniedComponent = ({ title, description }: { title: string; description: string }) => (
    <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
      <h3 className="font-semibold text-red-800">{title}</h3>
      <p className="text-red-700">{description}</p>
    </div>
  )

  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        <ResponsiveText as="h1" size={{ xs: '2xl', sm: '3xl', md: '4xl' }} weight="bold" className="text-center">
          Route Guard Demo
        </ResponsiveText>

        {/* Authentication Status */}
        <ResponsiveCard>
          <ResponsiveText as="h2" size={{ xs: 'xl', sm: '2xl' }} weight="semibold">Authentication Status</ResponsiveText>
          <ResponsiveGrid cols={{ xs: 1, sm: 2 }} className="gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span>Authenticated:</span>
                <Badge variant={isAuthenticated ? 'success' : 'danger'}>
                  {isAuthenticated ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Token Valid:</span>
                <Badge variant={isTokenValid ? 'success' : 'danger'}>
                  {isTokenValid ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Loading:</span>
                <Badge variant={isLoading ? 'warning' : 'success'}>
                  {isLoading ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span>User Role:</span>
                <Badge variant="info">{userRole || 'None'}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>User ID:</span>
                <Badge variant="info">{user?.id || 'None'}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Permissions:</span>
                <Badge variant="info">{permissions.length}</Badge>
              </div>
            </div>
          </ResponsiveGrid>
        </ResponsiveCard>

        {/* Route Guard Tests */}
        <ResponsiveCard>
          <ResponsiveText as="h2" size={{ xs: 'xl', sm: '2xl' }} weight="semibold">Route Guard Tests</ResponsiveText>
          <div className="space-y-4">
            
            {/* Public Route */}
            <div className="border rounded-lg p-4">
              <ResponsiveText as="h3" size={{ xs: 'lg', sm: 'xl' }} weight="medium">Public Route</ResponsiveText>
              <p className="text-gray-600 mb-2">No authentication required</p>
              <PublicRoute>
                <TestComponent 
                  title="✅ Public Route Access Granted" 
                  description="This route is accessible to everyone, even without authentication."
                />
              </PublicRoute>
            </div>

            {/* Authenticated Route */}
            <div className="border rounded-lg p-4">
              <ResponsiveText as="h3" size={{ xs: 'lg', sm: 'xl' }} weight="medium">Authenticated Route</ResponsiveText>
              <p className="text-gray-600 mb-2">Requires user to be logged in</p>
              <AuthenticatedRoute>
                <TestComponent 
                  title="✅ Authenticated Route Access Granted" 
                  description="This route is accessible to any authenticated user."
                />
              </AuthenticatedRoute>
            </div>

            {/* Admin Route */}
            <div className="border rounded-lg p-4">
              <ResponsiveText as="h3" size={{ xs: 'lg', sm: 'xl' }} weight="medium">Admin Route</ResponsiveText>
              <p className="text-gray-600 mb-2">Requires admin role</p>
              <AdminRoute>
                <TestComponent 
                  title="✅ Admin Route Access Granted" 
                  description="This route is accessible only to administrators."
                />
              </AdminRoute>
            </div>

            {/* Manager Route */}
            <div className="border rounded-lg p-4">
              <ResponsiveText as="h3" size={{ xs: 'lg', sm: 'xl' }} weight="medium">Manager Route</ResponsiveText>
              <p className="text-gray-600 mb-2">Requires manager or admin role</p>
              <ManagerRoute>
                <TestComponent 
                  title="✅ Manager Route Access Granted" 
                  description="This route is accessible to managers and administrators."
                />
              </ManagerRoute>
            </div>

            {/* Inventory Route */}
            <div className="border rounded-lg p-4">
              <ResponsiveText as="h3" size={{ xs: 'lg', sm: 'xl' }} weight="medium">Inventory Route</ResponsiveText>
              <p className="text-gray-600 mb-2">Requires inventory:read permission</p>
              <InventoryRoute>
                <TestComponent 
                  title="✅ Inventory Route Access Granted" 
                  description="This route is accessible to users with inventory read permissions."
                />
              </InventoryRoute>
            </div>

            {/* Count Route */}
            <div className="border rounded-lg p-4">
              <ResponsiveText as="h3" size={{ xs: 'lg', sm: 'xl' }} weight="medium">Count Route</ResponsiveText>
              <p className="text-gray-600 mb-2">Requires counts:read permission</p>
              <CountRoute>
                <TestComponent 
                  title="✅ Count Route Access Granted" 
                  description="This route is accessible to users with count read permissions."
                />
              </CountRoute>
            </div>

            {/* Report Route */}
            <div className="border rounded-lg p-4">
              <ResponsiveText as="h3" size={{ xs: 'lg', sm: 'xl' }} weight="medium">Report Route</ResponsiveText>
              <p className="text-gray-600 mb-2">Requires reports:read permission</p>
              <ReportRoute>
                <TestComponent 
                  title="✅ Report Route Access Granted" 
                  description="This route is accessible to users with report read permissions."
                />
              </ReportRoute>
            </div>

            {/* Settings Route */}
            <div className="border rounded-lg p-4">
              <ResponsiveText as="h3" size={{ xs: 'lg', sm: 'xl' }} weight="medium">Settings Route</ResponsiveText>
              <p className="text-gray-600 mb-2">Requires admin or manager role</p>
              <SettingsRoute>
                <TestComponent 
                  title="✅ Settings Route Access Granted" 
                  description="This route is accessible to administrators and managers."
                />
              </SettingsRoute>
            </div>

            {/* System Config Route */}
            <div className="border rounded-lg p-4">
              <ResponsiveText as="h3" size={{ xs: 'lg', sm: 'xl' }} weight="medium">System Config Route</ResponsiveText>
              <p className="text-gray-600 mb-2">Requires system:config permission</p>
              <SystemConfigRoute>
                <TestComponent 
                  title="✅ System Config Route Access Granted" 
                  description="This route is accessible to users with system configuration permissions."
                />
              </SystemConfigRoute>
            </div>

          </div>
        </ResponsiveCard>

        {/* Permission Testing */}
        <ResponsiveCard>
          <ResponsiveText as="h2" size={{ xs: 'xl', sm: '2xl' }} weight="semibold">Permission Testing</ResponsiveText>
          <div className="space-y-4">
            <ResponsiveGrid cols={{ xs: 1, sm: 2, md: 3 }} className="gap-4">
              {[
                { permission: 'users:read', label: 'Read Users' },
                { permission: 'users:create', label: 'Create Users' },
                { permission: 'users:update', label: 'Update Users' },
                { permission: 'users:delete', label: 'Delete Users' },
                { permission: 'inventory:read', label: 'Read Inventory' },
                { permission: 'inventory:create', label: 'Create Inventory' },
                { permission: 'inventory:update', label: 'Update Inventory' },
                { permission: 'inventory:delete', label: 'Delete Inventory' },
                { permission: 'counts:read', label: 'Read Counts' },
                { permission: 'counts:create', label: 'Create Counts' },
                { permission: 'counts:update', label: 'Update Counts' },
                { permission: 'counts:approve', label: 'Approve Counts' },
                { permission: 'reports:read', label: 'Read Reports' },
                { permission: 'reports:create', label: 'Create Reports' },
                { permission: 'reports:export', label: 'Export Reports' },
                { permission: 'system:admin', label: 'System Admin' },
                { permission: 'system:config', label: 'System Config' },
              ].map(({ permission, label }) => (
                <div key={permission} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">{label}</span>
                  <Badge variant={hasPermission(permission) ? 'success' : 'danger'}>
                    {hasPermission(permission) ? '✅' : '❌'}
                  </Badge>
                </div>
              ))}
            </ResponsiveGrid>
          </div>
        </ResponsiveCard>

        {/* Role Testing */}
        <ResponsiveCard>
          <ResponsiveText as="h2" size={{ xs: 'xl', sm: '2xl' }} weight="semibold">Role Testing</ResponsiveText>
          <div className="space-y-4">
            <ResponsiveGrid cols={{ xs: 1, sm: 2, md: 4 }} className="gap-4">
              {['admin', 'manager', 'clerk', 'viewer'].map((role) => (
                <div key={role} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium capitalize">{role}</span>
                  <Badge variant={hasRole(role) ? 'success' : 'danger'}>
                    {hasRole(role) ? '✅' : '❌'}
                  </Badge>
                </div>
              ))}
            </ResponsiveGrid>
          </div>
        </ResponsiveCard>

        {/* Instructions */}
        <ResponsiveCard>
          <ResponsiveText as="h2" size={{ xs: 'xl', sm: '2xl' }} weight="semibold">How to Use Route Guards</ResponsiveText>
          <div className="space-y-4">
            <Alert type="info" dismissible>
              <strong>Route Guards:</strong> Use these components to protect routes based on authentication, permissions, and roles.
            </Alert>
            
            <div className="space-y-2">
              <h3 className="font-semibold">Available Route Guards:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><code>PublicRoute</code> - No authentication required</li>
                <li><code>AuthenticatedRoute</code> - Requires user to be logged in</li>
                <li><code>AdminRoute</code> - Requires admin role</li>
                <li><code>ManagerRoute</code> - Requires manager or admin role</li>
                <li><code>InventoryRoute</code> - Requires inventory:read permission</li>
                <li><code>CountRoute</code> - Requires counts:read permission</li>
                <li><code>ReportRoute</code> - Requires reports:read permission</li>
                <li><code>SettingsRoute</code> - Requires admin or manager role</li>
                <li><code>SystemConfigRoute</code> - Requires system:config permission</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Usage Example:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<Route path="/inventory" element={
  <InventoryRoute>
    <Inventory />
  </InventoryRoute>
} />`}
              </pre>
            </div>
          </div>
        </ResponsiveCard>
      </div>
    </ResponsiveContainer>
  )
}

export default RouteGuardDemo 