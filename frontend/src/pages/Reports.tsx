import React from 'react'
import { BarChart3, Download, Calendar, TrendingUp } from 'lucide-react'

const Reports: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Generate and view inventory reports and analytics.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <BarChart3 className="h-8 w-8 text-blue-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Usage Reports</h3>
          <p className="text-gray-600 text-sm mb-4">
            Historical usage data and trends for inventory items.
          </p>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Generate Report →
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <TrendingUp className="h-8 w-8 text-green-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Variance Analysis</h3>
          <p className="text-gray-600 text-sm mb-4">
            Compare expected vs actual inventory levels.
          </p>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Generate Report →
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <Calendar className="h-8 w-8 text-purple-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Forecasting</h3>
          <p className="text-gray-600 text-sm mb-4">
            Predict future inventory needs and order suggestions.
          </p>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Generate Report →
          </button>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Reporting Dashboard</h3>
        <p className="text-gray-600 mb-4">
          This page will contain comprehensive reporting features:
        </p>
        <ul className="text-sm text-gray-500 space-y-1">
          <li>• Historical usage reports and trends</li>
          <li>• Variance analysis and alerts</li>
          <li>• CSV and Excel export functionality</li>
          <li>• Report scheduling and delivery</li>
          <li>• Custom report builder</li>
          <li>• Data visualization components</li>
        </ul>
      </div>
    </div>
  )
}

export default Reports 