import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  BarChart3, 
  Settings,
  ChevronDown,
  ChevronRight,
  Home,
  Users,
  Calendar,
  AlertTriangle,
  Smartphone,
  RefreshCw
} from 'lucide-react'

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard,
    badge: null
  },
  { 
    name: 'Inventory', 
    href: '/inventory', 
    icon: Package,
    badge: '12',
    subItems: [
      { name: 'All Items', href: '/inventory/items' },
      { name: 'Categories', href: '/inventory/categories' },
      { name: 'Low Stock', href: '/inventory/low-stock' },
      { name: 'Add Item', href: '/inventory/add' }
    ]
  },
  { 
    name: 'Counts', 
    href: '/counts', 
    icon: ClipboardList,
    badge: '5',
    subItems: [
      { name: 'Today\'s Counts', href: '/counts/today' },
      { name: 'History', href: '/counts/history' },
      { name: 'New Count', href: '/counts/new' },
      { name: 'Pending Approval', href: '/counts/pending' }
    ]
  },
  { 
    name: 'Reports', 
    href: '/reports', 
    icon: BarChart3,
    badge: null,
    subItems: [
      { name: 'Usage Reports', href: '/reports/usage' },
      { name: 'Variance Analysis', href: '/reports/variance' },
      { name: 'Forecasting', href: '/reports/forecasting' },
      { name: 'Export Data', href: '/reports/export' }
    ]
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: Settings,
    badge: null,
    subItems: [
      { name: 'Profile', href: '/settings/profile' },
      { name: 'Notifications', href: '/settings/notifications' },
      { name: 'Security', href: '/settings/security' },
      { name: 'Preferences', href: '/settings/preferences' }
    ]
  },
  { 
    name: 'Responsive Demo', 
    href: '/responsive-demo', 
    icon: Smartphone,
    badge: 'NEW',
    subItems: []
  },
  { 
    name: 'Form Demo', 
    href: '/form-demo', 
    icon: ClipboardList,
    badge: 'NEW',
    subItems: []
  },
  { 
    name: 'API Demo', 
    href: '/api-demo', 
    icon: RefreshCw,
    badge: 'NEW',
    subItems: []
  }
]

const Sidebar: React.FC = () => {
  const location = useLocation()
  const [expandedItems, setExpandedItems] = useState<string[]>(['inventory'])

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  const isExpanded = (itemName: string) => {
    return expandedItems.includes(itemName)
  }

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16 lg:pb-0 lg:bg-white lg:border-r lg:border-gray-200">
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const hasSubItems = item.subItems && item.subItems.length > 0
            const isItemActive = isActive(item.href)
            const isItemExpanded = isExpanded(item.name.toLowerCase())

            return (
              <div key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                  onClick={() => {
                    if (hasSubItems) {
                      toggleExpanded(item.name.toLowerCase())
                    }
                  }}
                >
                  <div className="flex items-center">
                    <Icon
                      className="mr-3 flex-shrink-0 h-5 w-5"
                      aria-hidden="true"
                    />
                    {item.name}
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.badge && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {item.badge}
                      </span>
                    )}
                    {hasSubItems && (
                      <div className="flex-shrink-0">
                        {isItemExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </div>
                </NavLink>

                {/* Sub-items */}
                {hasSubItems && isItemExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.subItems!.map((subItem) => (
                      <NavLink
                        key={subItem.name}
                        to={subItem.href}
                        className={({ isActive }) =>
                          `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                            isActive
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                          }`
                        }
                      >
                        <div className="w-2 h-2 bg-gray-300 rounded-full mr-3" />
                        {subItem.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Quick Actions Section */}
        <div className="px-4 py-4 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-1">
            <button className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors">
              <AlertTriangle className="mr-3 h-4 w-4 text-yellow-500" />
              Low Stock Alerts
            </button>
            <button className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors">
              <Calendar className="mr-3 h-4 w-4 text-blue-500" />
              Today's Counts
            </button>
            <button className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors">
              <Users className="mr-3 h-4 w-4 text-green-500" />
              Team Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar 