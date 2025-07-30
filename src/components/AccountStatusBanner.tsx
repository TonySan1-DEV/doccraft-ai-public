import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { AlertTriangle, Clock, UserX, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface AccountStatus {
  account_status: string
  pause_start_date?: string
  pause_end_date?: string
  closed_date?: string
}

export const AccountStatusBanner: React.FC = () => {
  const { user } = useAuth()
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchAccountStatus()
    }
  }, [user])

  const fetchAccountStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('writer_profiles')
        .select('account_status, pause_start_date, pause_end_date, closed_date')
        .eq('user_id', user?.id)
        .single()

      if (error) throw error
      setAccountStatus(data)
    } catch (error) {
      console.error('Error fetching account status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReactivate = async () => {
    try {
      const { error } = await supabase
        .from('writer_profiles')
        .update({
          account_status: 'active',
          pause_start_date: null,
          pause_end_date: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id)

      if (error) throw error

      toast.success('Account reactivated successfully!')
      fetchAccountStatus()
    } catch (error: any) {
      toast.error(error.message || 'Failed to reactivate account')
    }
  }

  if (isLoading) return null

  if (!accountStatus || accountStatus.account_status === 'active') {
    return null
  }

  const getStatusInfo = () => {
    switch (accountStatus.account_status) {
      case 'paused':
        const pauseEndDate = accountStatus.pause_end_date ? new Date(accountStatus.pause_end_date) : null
        const isExpired = pauseEndDate && pauseEndDate <= new Date()
        
        return {
          icon: isExpired ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />,
          title: isExpired ? 'Account Pause Expired' : 'Account Paused',
          message: isExpired 
            ? 'Your account pause period has ended. You can now reactivate your account.'
            : `Your account is paused until ${pauseEndDate?.toLocaleDateString()}.`,
          color: isExpired ? 'bg-green-500' : 'bg-orange-500',
          action: isExpired ? (
            <button
              onClick={handleReactivate}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Reactivate Account
            </button>
          ) : null
        }
      
      case 'closed':
        return {
          icon: <UserX className="w-5 h-5" />,
          title: 'Account Closed',
          message: 'Your account has been permanently closed. Please contact support if you need assistance.',
          color: 'bg-red-500',
          action: null
        }
      
      case 'suspended':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          title: 'Account Suspended',
          message: 'Your account has been suspended. Please contact support for more information.',
          color: 'bg-red-500',
          action: null
        }
      
      default:
        return null
    }
  }

  const statusInfo = getStatusInfo()
  if (!statusInfo) return null

  return (
    <div className={`${statusInfo.color} text-white p-4 mb-4 rounded-lg shadow-lg`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {statusInfo.icon}
          <div>
            <h3 className="font-semibold">{statusInfo.title}</h3>
            <p className="text-sm opacity-90">{statusInfo.message}</p>
          </div>
        </div>
        {statusInfo.action && (
          <div className="flex items-center space-x-3">
            {statusInfo.action}
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountStatusBanner 