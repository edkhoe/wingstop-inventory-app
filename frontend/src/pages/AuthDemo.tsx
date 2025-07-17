import React, { useState } from 'react'
import { useAuth, useLogin, useRegister, useLogout, useProfile } from '../hooks/useAuth'
import { usePermissions, useUserPermissions, useInventoryPermissions, useCountPermissions } from '../hooks/usePermissions'
import { useAuthState, useAuthError, useAuthStatus } from '../hooks/useAuthState'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Alert from '../components/ui/Alert'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import ResponsiveCard from '../components/ui/ResponsiveCard'
import ResponsiveContainer from '../components/ui/ResponsiveContainer'
import ResponsiveGrid from '../components/ui/ResponsiveGrid'
import ResponsiveText from '../components/ui/ResponsiveText'
import { LoginRequest, RegisterRequest } from '../types/auth'

const AuthDemo: React.FC = () => {
  // Auth hooks
  const { user, isAuthenticated, isLoading, error, clearError } = useAuth()
  const { login, isLoading: loginLoading, error: loginError } = useLogin()
  const { register, isLoading: registerLoading, error: registerError } = useRegister()
  const { logout, isLoading: logoutLoading } = useLogout()
  const { updateProfile, changePassword, isLoading: profileLoading, error: profileError } = useProfile()
  
  // Permission hooks
  const { permissions, hasPermission, hasRole, userRole } = usePermissions()
  const userPermissions = useUserPermissions()
  const inventoryPermissions = useInventoryPermissions()
  const countPermissions = useCountPermissions()
  
  // Auth state hooks
  const { isTokenValid } = useAuthState()
  const { handleAuthError } = useAuthError()
  const { isLoggedIn, isLoggedOut, userRole: statusUserRole, userLocation } = useAuthStatus()

  // Form states
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  // Login form
  const [loginForm, setLoginForm] = useState<LoginRequest>({
    email: '',
    password: ''
  })

  // Register form
  const [registerForm, setRegisterForm] = useState<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    roleId: 2, // Default to clerk role
    locationId: 1 // Default to first location
  })

  // Profile form
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || ''
  })

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Handle login
  const handleLogin = async () => {
    const result = await login(loginForm)
    if (result.success) {
      setShowLoginModal(false)
      setLoginForm({ email: '', password: '' })
    }
  }

  // Handle register
  const handleRegister = async () => {
    if (registerForm.password !== registerForm.confirmPassword) {
      alert('Passwords do not match')
      return
    }
    
    const result = await register(registerForm)
    if (result.success) {
      setShowRegisterModal(false)
      setRegisterForm({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        roleId: 2,
        locationId: 1
      })
    }
  }

  // Handle profile update
  const handleProfileUpdate = async () => {
    const result = await updateProfile(profileForm)
    if (result.success) {
      setShowProfileModal(false)
    }
  }

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match')
      return
    }
    
    const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword)
    if (result.success) {
      setShowPasswordModal(false)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    }
  }

  // Test permission function
  const testPermission = (permission: string) => {
    return hasPermission(permission) ? '✅' : '❌'
  }

  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        <ResponsiveText as="h1" size={{ xs: '2xl', sm: '3xl', md: '4xl' }} weight="bold" className="text-center">
          Authentication Demo
        </ResponsiveText>

        {/* Authentication Status */}
        <ResponsiveCard>
          <ResponsiveText as="h2" size={{ xs: 'xl', sm: '2xl' }} weight="semibold">Authentication Status</ResponsiveText>
          <ResponsiveGrid cols={{ xs: 1, sm: 2 }} className="gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span>Logged In:</span>
                <Badge variant={isLoggedIn ? 'success' : 'danger'}>
                  {isLoggedIn ? 'Yes' : 'No'}
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
                <Badge variant="info">{statusUserRole || 'None'}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Location:</span>
                <Badge variant="info">{userLocation || 'None'}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>User ID:</span>
                <Badge variant="info">{user?.id || 'None'}</Badge>
              </div>
            </div>
          </ResponsiveGrid>
        </ResponsiveCard>

        {/* User Information */}
        {user && (
          <ResponsiveCard>
            <ResponsiveText as="h2" size={{ xs: 'xl', sm: '2xl' }} weight="semibold">User Information</ResponsiveText>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong>Name:</strong> {user.firstName} {user.lastName}
                </div>
                <div>
                  <strong>Email:</strong> {user.email}
                </div>
                <div>
                  <strong>Username:</strong> {user.username}
                </div>
                <div>
                  <strong>Role:</strong> {user.role.name}
                </div>
                <div>
                  <strong>Location:</strong> {user.location.name}
                </div>
                <div>
                  <strong>Active:</strong> {user.isActive ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          </ResponsiveCard>
        )}

        {/* Permissions */}
        {user && (
          <ResponsiveCard>
            <ResponsiveText as="h2" size={{ xs: 'xl', sm: '2xl' }} weight="semibold">Permissions</ResponsiveText>
            <div className="space-y-4">
              <div>
                <ResponsiveText as="h3" size={{ xs: 'lg', sm: 'xl' }} weight="medium">All Permissions</ResponsiveText>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {permissions.map((permission) => (
                    <Badge key={permission} variant="info" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <ResponsiveText as="h3" size={{ xs: 'lg', sm: 'xl' }} weight="medium">User Management Permissions</ResponsiveText>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  <div>Read Users: {testPermission('users:read')}</div>
                  <div>Create Users: {testPermission('users:create')}</div>
                  <div>Update Users: {testPermission('users:update')}</div>
                  <div>Delete Users: {testPermission('users:delete')}</div>
                </div>
              </div>

              <div>
                <ResponsiveText as="h3" size={{ xs: 'lg', sm: 'xl' }} weight="medium">Inventory Permissions</ResponsiveText>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  <div>Read Inventory: {testPermission('inventory:read')}</div>
                  <div>Create Inventory: {testPermission('inventory:create')}</div>
                  <div>Update Inventory: {testPermission('inventory:update')}</div>
                  <div>Delete Inventory: {testPermission('inventory:delete')}</div>
                  <div>Export Inventory: {testPermission('inventory:export')}</div>
                </div>
              </div>

              <div>
                <ResponsiveText as="h3" size={{ xs: 'lg', sm: 'xl' }} weight="medium">Count Permissions</ResponsiveText>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  <div>Read Counts: {testPermission('counts:read')}</div>
                  <div>Create Counts: {testPermission('counts:create')}</div>
                  <div>Update Counts: {testPermission('counts:update')}</div>
                  <div>Delete Counts: {testPermission('counts:delete')}</div>
                  <div>Approve Counts: {testPermission('counts:approve')}</div>
                </div>
              </div>
            </div>
          </ResponsiveCard>
        )}

        {/* Authentication Actions */}
        <ResponsiveCard>
          <ResponsiveText as="h2" size={{ xs: 'xl', sm: '2xl' }} weight="semibold">Authentication Actions</ResponsiveText>
          <div className="flex flex-wrap gap-4">
            {!isAuthenticated ? (
              <>
                <Button onClick={() => setShowLoginModal(true)}>
                  Login
                </Button>
                <Button onClick={() => setShowRegisterModal(true)} variant="outline">
                  Register
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setShowProfileModal(true)}>
                  Update Profile
                </Button>
                <Button onClick={() => setShowPasswordModal(true)} variant="outline">
                  Change Password
                </Button>
                <Button onClick={logout} variant="danger" disabled={logoutLoading}>
                  {logoutLoading ? 'Logging out...' : 'Logout'}
                </Button>
              </>
            )}
          </div>
        </ResponsiveCard>

        {/* Error Display */}
        {(error || loginError || registerError || profileError) && (
          <Alert type="error" dismissible onDismiss={clearError}>
            {error || loginError || registerError || profileError}
          </Alert>
        )}

        {/* Login Modal */}
        <Modal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          title="Login"
        >
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
            />
            <Input
              label="Password"
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            />
            <div className="flex gap-2">
              <Button onClick={handleLogin} disabled={loginLoading}>
                {loginLoading ? 'Logging in...' : 'Login'}
              </Button>
              <Button onClick={() => setShowLoginModal(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Register Modal */}
        <Modal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          title="Register"
        >
          <div className="space-y-4">
            <Input
              label="Username"
              value={registerForm.username}
              onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
            />
            <Input
              label="First Name"
              value={registerForm.firstName}
              onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
            />
            <Input
              label="Last Name"
              value={registerForm.lastName}
              onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
            />
            <Input
              label="Password"
              type="password"
              value={registerForm.password}
              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
            />
            <Input
              label="Confirm Password"
              type="password"
              value={registerForm.confirmPassword}
              onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
            />
            <div className="flex gap-2">
              <Button onClick={handleRegister} disabled={registerLoading}>
                {registerLoading ? 'Registering...' : 'Register'}
              </Button>
              <Button onClick={() => setShowRegisterModal(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Profile Modal */}
        <Modal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          title="Update Profile"
        >
          <div className="space-y-4">
            <Input
              label="First Name"
              value={profileForm.firstName}
              onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
            />
            <Input
              label="Last Name"
              value={profileForm.lastName}
              onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
            />
            <div className="flex gap-2">
              <Button onClick={handleProfileUpdate} disabled={profileLoading}>
                {profileLoading ? 'Updating...' : 'Update Profile'}
              </Button>
              <Button onClick={() => setShowProfileModal(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Password Change Modal */}
        <Modal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          title="Change Password"
        >
          <div className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            />
            <Input
              label="New Password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            />
            <div className="flex gap-2">
              <Button onClick={handlePasswordChange} disabled={profileLoading}>
                {profileLoading ? 'Changing...' : 'Change Password'}
              </Button>
              <Button onClick={() => setShowPasswordModal(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ResponsiveContainer>
  )
}

export default AuthDemo 