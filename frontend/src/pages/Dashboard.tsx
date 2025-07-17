import React from 'react'
import { 
  Package, 
  ClipboardList, 
  AlertTriangle, 
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react'

const Dashboard: React.FC = () => {
  // Mock data - will be replaced with actual API calls
  const stats = [
    {
      name: 'Total Items',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: Package,
    },
    {
      name: 'Pending Counts',
      value: '23',
      change: '+5',
      changeType: 'negative',
      icon: ClipboardList,
    },
    {
      name: 'Low Stock Items',
      value: '8',
      change: '-2',
      changeType: 'positive',
      icon: AlertTriangle,
    },
    {
      name: 'This Month Usage',
      value: '$12,345',
      change: '+8.2%',
      changeType: 'positive',
      icon: TrendingUp,
    },
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'count',
      message: 'Daily count completed for Location #1',
      time: '2 hours ago',
      user: 'John Doe',
    },
    {
      id: 2,
      type: 'inventory',
      message: 'New item "Hot Sauce" added to inventory',
      time: '4 hours ago',
      user: 'Jane Smith',
    },
    {
      id: 3,
      type: 'alert',
      message: 'Low stock alert: Chicken Wings',
      time: '6 hours ago',
      user: 'System',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your inventory.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.name}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        <div
                          className={`ml-2 flex items-baseline text-sm font-semibold ${
                            stat.changeType === 'positive'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Activity
          </h3>
          <div className="mt-5 flow-root">
            <ul className="-mb-8">
              {recentActivity.map((activity, activityIdx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== recentActivity.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                          <ClipboardList className="h-5 w-5 text-white" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            {activity.message}
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime={activity.time}>{activity.time}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 