import { AuditLogPanel } from '../components/audit/AuditLogPanel'
import { useMCP } from '../useMCP'
import { Shield, Activity, BarChart3 } from 'lucide-react'

export default function AuditLogs() {
  const ctx = useMCP("pages/AuditLogs.tsx")

  // Check if user has access to audit logs
  if (!ctx.allowedActions.includes('view_audit_logs') && ctx.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You don't have permission to view audit logs. This feature is only available to administrators.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Current Tier: {ctx.tier}
                </span>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                Upgrade to Admin tier to access audit logs and system monitoring.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Audit Logs
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {ctx.role === 'admin' 
                  ? 'Monitor all system activity and user actions' 
                  : 'View your activity history and system events'
                }
              </p>
            </div>
          </div>

          {/* Access Level Indicator */}
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              ctx.role === 'admin' 
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
            }`}>
              {ctx.role === 'admin' ? 'Administrator Access' : 'User Access'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Tier: {ctx.tier} • Role: {ctx.role}
            </div>
          </div>
        </div>

        {/* Audit Log Panel */}
        <AuditLogPanel />
      </div>
    </div>
  )
} 