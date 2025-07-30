import React from 'react'
import { Lock, Crown } from 'lucide-react'

interface AccessWarningProps {
  tier: 'Pro' | 'Admin'
  feature?: string
}

export const AccessWarning: React.FC<AccessWarningProps> = ({ tier, feature = 'this feature' }) => {
  const getTierInfo = (tier: 'Pro' | 'Admin') => {
    switch (tier) {
      case 'Pro':
        return {
          icon: Crown,
          color: 'from-blue-500 to-purple-600',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-700 dark:text-blue-300'
        }
      case 'Admin':
        return {
          icon: Crown, // Changed from Shield to Crown for consistency with Pro tier
          color: 'from-purple-500 to-indigo-600',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          borderColor: 'border-purple-200 dark:border-purple-800',
          textColor: 'text-purple-700 dark:text-purple-300'
        }
    }
  }

  const tierInfo = getTierInfo(tier)
  const IconComponent = tierInfo.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-4xl mx-auto py-20 px-4">
        <div className={`rounded-2xl border ${tierInfo.borderColor} ${tierInfo.bgColor} p-8 text-center`}>
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="h-10 w-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Access Restricted
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            {feature} is available on the <span className={`font-semibold ${tierInfo.textColor}`}>{tier}</span> plan and above.
          </p>
          
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className={`w-12 h-12 bg-gradient-to-br ${tierInfo.color} rounded-full flex items-center justify-center`}>
              <IconComponent className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white">{tier} Features</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Unlock advanced capabilities and enhanced functionality
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg">
              Upgrade to {tier}
            </button>
            <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
              Contact Admin
            </button>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            Need help? Contact your administrator to upgrade your account.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AccessWarning 