import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import PaymentService, { Subscription, PaymentIntent, BillingInfo } from '../services/paymentService'
import { CreditCard, Calendar, Download, AlertCircle, CheckCircle, XCircle, Loader2, Plus, Edit } from 'lucide-react'
import toast from 'react-hot-toast'

export const Billing: React.FC = () => {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<PaymentIntent[]>([])
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (user) {
      loadBillingData()
    }
  }, [user])

  const loadBillingData = async () => {
    try {
      const paymentService = PaymentService.getInstance()
      
      const [sub, history, billing] = await Promise.all([
        paymentService.getUserSubscription(user?.id || ''),
        paymentService.getPaymentHistory(user?.id || ''),
        paymentService.getBillingInfo(user?.id || '')
      ])

      setSubscription(sub)
      setPaymentHistory(history)
      setBillingInfo(billing)
    } catch (error) {
      console.error('Error loading billing data:', error)
      toast.error('Failed to load billing information')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscription) return

    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.')) {
      return
    }

    setIsUpdating(true)
    try {
      const paymentService = PaymentService.getInstance()
      await paymentService.cancelSubscription(subscription.id)
      
      toast.success('Subscription canceled successfully')
      loadBillingData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel subscription')
    } finally {
      setIsUpdating(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100) // Convert from cents
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading billing information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          💳 Billing & Subscription
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your subscription, payment methods, and billing information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Subscription */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Current Subscription
              </h2>
              {subscription && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  subscription.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {subscription.status}
                </span>
              )}
            </div>

            {subscription ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {subscription.tier} Plan
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {subscription.payment_method}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Billing Period
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                    </p>
                  </div>
                </div>

                {subscription.cancel_at_period_end && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                      <p className="text-yellow-800 dark:text-yellow-200">
                        Your subscription will be canceled at the end of the current billing period.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    Upgrade Plan
                  </button>
                  {!subscription.cancel_at_period_end && (
                    <button
                      onClick={handleCancelSubscription}
                      disabled={isUpdating}
                      className="px-4 py-2 border border-red-300 text-red-700 dark:text-red-300 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                    >
                      {isUpdating ? 'Canceling...' : 'Cancel Subscription'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Active Subscription
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  You're currently on the Free plan. Upgrade to unlock premium features.
                </p>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                  Upgrade Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Billing Information */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Billing Information
            </h2>

            {billingInfo ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <p className="text-gray-900 dark:text-white">{billingInfo.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-white">{billingInfo.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {billingInfo.address.line1}<br />
                    {billingInfo.address.city}, {billingInfo.address.state} {billingInfo.address.postal_code}
                  </p>
                </div>
                {billingInfo.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone
                    </label>
                    <p className="text-gray-900 dark:text-white">{billingInfo.phone}</p>
                  </div>
                )}
                <button className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <Edit className="w-4 h-4 inline mr-2" />
                  Update Billing Info
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  No billing information on file.
                </p>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Billing Info
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="mt-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Payment History
            </h2>
            <button className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
              <Download className="w-4 h-4 inline mr-2" />
              Export
            </button>
          </div>

          {paymentHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Method</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-100 dark:border-slate-700">
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {formatDate(payment.created_at)}
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                        {payment.payment_method}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {getStatusIcon(payment.status)}
                          <span className="ml-2 text-sm capitalize">{payment.status}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Payment History
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your payment history will appear here once you make your first payment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Billing 