import React from 'react'
import { Settings as SettingsIcon, User, Bell, Shield, Database } from 'lucide-react'

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and application preferences.</p>
      </div>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <User className="h-6 w-6 text-blue-500 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Profile</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Update your personal information and account details.
          </p>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Edit Profile →
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <Bell className="h-6 w-6 text-green-500 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Configure email and in-app notification preferences.
          </p>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Manage Notifications →
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-red-500 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Security</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Manage password, two-factor authentication, and security settings.
          </p>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Security Settings →
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <Database className="h-6 w-6 text-purple-500 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Data & Backup</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Export your data and manage backup preferences.
          </p>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Data Management →
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <SettingsIcon className="h-6 w-6 text-orange-500 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Preferences</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Customize application settings and display options.
          </p>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            App Preferences →
          </button>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <SettingsIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Application Settings</h3>
        <p className="text-gray-600 mb-4">
          This page will contain comprehensive settings management:
        </p>
        <ul className="text-sm text-gray-500 space-y-1">
          <li>• User profile and account management</li>
          <li>• Notification preferences</li>
          <li>• Security and authentication settings</li>
          <li>• Data export and backup options</li>
          <li>• Application preferences and themes</li>
          <li>• Location and role management</li>
        </ul>
      </div>
    </div>
  )
}

export default Settings 