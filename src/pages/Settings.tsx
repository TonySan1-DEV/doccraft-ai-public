import { Shield, Database, Bell, Palette, Key, Users, UserX, Pause, AlertTriangle, Trash2 } from 'lucide-react'
import { useMCP } from '../useMCP'
import { AccessWarning } from '../components/AccessWarning'
import ThemeSelector from '../components/ThemeSelector'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Settings() {
  const ctx = useMCP("Settings.tsx")
  const { user, signOut } = useAuth()
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false)
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)
  const [pauseDuration, setPauseDuration] = useState('30')
  const [isLoading, setIsLoading] = useState(false)
  
  if (ctx.tier !== "Admin") {
    return <AccessWarning tier="Admin" feature="System configuration" />
  }

  const handlePauseAccount = async () => {
    setIsLoading(true)
    try {
      const pauseEndDate = new Date()
      pauseEndDate.setDate(pauseEndDate.getDate() + parseInt(pauseDuration))
      
      const { error } = await supabase
        .from('writer_profiles')
        .update({
          account_status: 'paused',
          pause_start_date: new Date().toISOString(),
          pause_end_date: pauseEndDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id)

      if (error) throw error

      toast.success(`Account paused for ${pauseDuration} days`)
      setIsPauseModalOpen(false)
      // Optionally sign out the user
      await signOut()
    } catch (error: any) {
      toast.error(error.message || 'Failed to pause account')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseAccount = async () => {
    setIsLoading(true)
    try {
      // First, update the profile to mark as closed
      const { error: profileError } = await supabase
        .from('writer_profiles')
        .update({
          account_status: 'closed',
          closed_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id)

      if (profileError) throw profileError

      // Then delete the user account from Supabase Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(user?.id || '')

      if (authError) throw authError

      toast.success('Account closed successfully')
      setIsCloseModalOpen(false)
      await signOut()
    } catch (error: any) {
      toast.error(error.message || 'Failed to close account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          ⚙️ Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Configure system settings, security policies, and application preferences.
        </p>
      </div>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Security Settings
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            Configure authentication, permissions, and security policies.
          </p>
          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
            Configure →
          </button>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
            <Database className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Storage & Backup
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            Manage storage quotas, backup schedules, and data retention.
          </p>
          <button className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium">
            Configure →
          </button>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Notifications
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            Configure email alerts, system notifications, and user communications.
          </p>
          <button className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm font-medium">
            Configure →
          </button>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-4">
            <Palette className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Appearance
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            Customize themes, branding, and user interface preferences.
          </p>
          <button 
            onClick={() => setIsThemeSelectorOpen(true)}
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium"
          >
            Configure →
          </button>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
            <Key className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            API Keys
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            Manage API keys, webhooks, and third-party integrations.
          </p>
          <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium">
            Configure →
          </button>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            User Management
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            Manage user accounts, roles, permissions, and access controls.
          </p>
          <button className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 text-sm font-medium">
            Configure →
          </button>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
            <UserX className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Account Management
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            Pause or close your account, manage billing, and account status.
          </p>
          <button 
            onClick={() => setIsAccountModalOpen(true)}
            className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm font-medium"
          >
            Manage Account →
          </button>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Application</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Version:</span>
                <span className="text-gray-900 dark:text-white">2.1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Build:</span>
                <span className="text-gray-900 dark:text-white">2024.01.15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Environment:</span>
                <span className="text-gray-900 dark:text-white">Production</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Performance</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">CPU Usage:</span>
                <span className="text-gray-900 dark:text-white">23%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Memory:</span>
                <span className="text-gray-900 dark:text-white">4.2 GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Uptime:</span>
                <span className="text-gray-900 dark:text-white">15 days</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Database</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className="text-green-600 dark:text-green-400">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Size:</span>
                <span className="text-gray-900 dark:text-white">2.8 GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Last Backup:</span>
                <span className="text-gray-900 dark:text-white">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
            Backup System
          </button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
            Clear Cache
          </button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
            Update System
          </button>
          <button className="px-4 py-2 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200">
            Emergency Mode
          </button>
        </div>
      </div>

      {/* Theme Selector Modal */}
      <ThemeSelector 
        isOpen={isThemeSelectorOpen} 
        onClose={() => setIsThemeSelectorOpen(false)} 
      />

      {/* Account Management Modal */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Account Management
              </h3>
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Pause Account Section */}
              <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Pause className="w-5 h-5 text-orange-500 mr-2" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Pause Account</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Temporarily suspend your account. You can reactivate it anytime.
                </p>
                <div className="flex items-center space-x-3 mb-4">
                  <select
                    value={pauseDuration}
                    onChange={(e) => setPauseDuration(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  >
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                    <option value="90">90 days</option>
                  </select>
                  <button
                    onClick={() => setIsPauseModalOpen(true)}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Pause
                  </button>
                </div>
              </div>

              {/* Close Account Section */}
              <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Trash2 className="w-5 h-5 text-red-500 mr-2" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Close Account</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <button
                  onClick={() => setIsCloseModalOpen(true)}
                  className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                >
                  Close Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pause Account Confirmation Modal */}
      {isPauseModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-500 mr-3" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Pause Account
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to pause your account for {pauseDuration} days? 
              You will be signed out and won't be able to access the platform until the pause period ends.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsPauseModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePauseAccount}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Pausing...' : 'Pause Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Account Confirmation Modal */}
      {isCloseModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Close Account
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              <strong>Warning:</strong> This action will permanently delete your account and all associated data. 
              This includes your documents, settings, and account information. This action cannot be undone.
            </p>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700 dark:text-red-300">
                Please type "DELETE" to confirm you want to close your account permanently.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsCloseModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseAccount}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Closing...' : 'Close Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 