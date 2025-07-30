import { useState, useEffect } from 'react'
import { AuditLogger, AuditLog } from '../../lib/audit/auditLogger'
import { useMCP } from '../../useMCP'
import { 
  Activity, 
  Filter, 
  Download, 
  Clock,
  RefreshCw,
  BarChart3,
  FileText,
  Users,
  Settings
} from 'lucide-react'

interface AuditLogPanelProps {
  className?: string
}

export function AuditLogPanel({ className = '' }: AuditLogPanelProps) {
  const ctx = useMCP("components/audit/AuditLogPanel.tsx")
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEvents: 0,
    eventsByAction: {} as Record<string, number>,
    eventsByResource: {} as Record<string, number>,
    recentActivity: [] as AuditLog[]
  })

  // Filters
  const [filters, setFilters] = useState({
    action: '',
    resource: '',
    startDate: '',
    endDate: '',
    limit: 50
  })

  // Get current user
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await import('../../lib/supabase').then(m => m.supabase.auth.getUser())
      if (user) {
        setCurrentUser({ id: user.id, name: user.email || 'Unknown' })
      }
    }
    getCurrentUser()
  }, [])

  useEffect(() => {
    loadAuditLogs()
    loadAuditStats()
  }, [filters, currentUser])

  const loadAuditLogs = async () => {
    if (!currentUser) return

    setLoading(true)
    try {
      const userLogs = await AuditLogger.getUserAuditLogs(
        currentUser.id,
        { tier: ctx.tier ?? 'Free', role: ctx.role ?? 'user' },
        filters
      )
      setLogs(userLogs)
    } catch (error) {
      console.error('Error loading audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAuditStats = async () => {
    if (!currentUser) return

    try {
      const auditStats = await AuditLogger.getAuditStats({
        tier: ctx.tier ?? 'Free',
        role: ctx.role ?? 'user'
      })
      setStats(auditStats)
    } catch (error) {
      console.error('Error loading audit stats:', error)
    }
  }

  const exportLogs = async () => {
    if (ctx.role !== 'admin') {
      alert('Only admins can export audit logs')
      return
    }

    try {
      const startDate = filters.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const endDate = filters.endDate || new Date().toISOString()
      
      const exportData = await AuditLogger.exportAuditLogs(startDate, endDate, {
        tier: ctx.tier ?? 'Free',
        role: ctx.role ?? 'user'
      })

      // Create CSV download
      const csvContent = [
        'Timestamp,User ID,Action,Resource,Tier,Role,Details',
        ...exportData.map(log => 
          `"${log.timestamp}","${log.user_id}","${log.action}","${log.resource}","${log.tier}","${log.role}","${JSON.stringify(log.details)}"`
        )
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting logs:', error)
      alert('Failed to export logs')
    }
  }

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return <FileText className="h-4 w-4" />
      case 'update': return <Settings className="h-4 w-4" />
      case 'delete': return <Users className="h-4 w-4" />
      case 'share': return <Users className="h-4 w-4" />
      case 'ai_rewrite': return <Activity className="h-4 w-4" />
      case 'ai_summarize': return <BarChart3 className="h-4 w-4" />
      case 'collaboration_join': return <Users className="h-4 w-4" />
      case 'collaboration_leave': return <Users className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Admin': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'Pro': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'Free': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Audit Logs
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {ctx.role === 'admin' ? 'All system activity' : 'Your activity history'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={loadAuditLogs}
              disabled={loading}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            {ctx.role === 'admin' && (
              <button
                onClick={exportLogs}
                className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                <span className="text-sm">Export</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Events</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {stats.totalEvents}
            </p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Actions</span>
            </div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              {Object.keys(stats.eventsByAction).length}
            </p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Resources</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {Object.keys(stats.eventsByResource).length}
            </p>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Recent</span>
            </div>
            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {stats.recentActivity.length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
          </div>
          
          <select
            value={filters.action}
            onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="share">Share</option>
            <option value="ai_rewrite">AI Rewrite</option>
            <option value="ai_summarize">AI Summarize</option>
            <option value="collaboration_join">Join Collaboration</option>
            <option value="collaboration_leave">Leave Collaboration</option>
          </select>
          
          <select
            value={filters.resource}
            onChange={(e) => setFilters(prev => ({ ...prev, resource: e.target.value }))}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
          >
            <option value="">All Resources</option>
            <option value="document">Document</option>
            <option value="collaboration">Collaboration</option>
            <option value="ai_helper">AI Helper</option>
            <option value="user_profile">User Profile</option>
          </select>
          
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
          />
          
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading audit logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No audit logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Action</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Resource</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Tier</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Timestamp</th>
                  {ctx.role === 'admin' && (
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">User</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getActionIcon(log.action)}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {log.resource}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(log.tier)}`}>
                        {log.tier}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    {ctx.role === 'admin' && (
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {log.user_id.slice(0, 8)}...
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
} 