import { BarChart3, TrendingUp, Users, Activity, PieChart, Target, Calendar } from 'lucide-react'
import { useMCP } from '../useMCP'
import { AccessWarning } from '../components/AccessWarning'

export default function Analytics() {
  const ctx = useMCP("Analytics.tsx")
  
  if (ctx.tier !== "Admin") {
    return <AccessWarning tier="Admin" feature="User analytics and statistics" />
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📈 User Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Comprehensive analytics and insights about user activity, document processing, and system performance.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1,247</p>
              <p className="text-sm text-green-600 dark:text-green-400">+12% from last month</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">342</p>
              <p className="text-sm text-green-600 dark:text-green-400">+8% from last hour</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Documents Processed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">15,892</p>
              <p className="text-sm text-green-600 dark:text-green-400">+23% from last week</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Uptime</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">99.9%</p>
              <p className="text-sm text-green-600 dark:text-green-400">Last 30 days</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Activity</h3>
          <div className="h-64 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">Activity chart</p>
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Feature Usage</h3>
          <div className="h-64 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">Usage distribution</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Demographics */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Demographics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Plan Distribution</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Free</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">45%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Pro</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">38%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Admin</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">17%</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Geographic Distribution</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">North America</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">52%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Europe</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">28%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Asia Pacific</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">20%</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Device Usage</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Desktop</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">68%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Mobile</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">24%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Tablet</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">8%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent System Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">New user registration</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">john.doe@example.com joined 5 minutes ago</p>
            </div>
            <Calendar className="h-4 w-4 text-gray-400" />
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">Document processed</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Large document batch completed 15 minutes ago</p>
            </div>
            <Calendar className="h-4 w-4 text-gray-400" />
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">System maintenance</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Scheduled maintenance completed 1 hour ago</p>
            </div>
            <Calendar className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  )
} 