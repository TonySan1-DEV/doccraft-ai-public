import { useState } from 'react'
import { X, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { useMCP } from '../useMCP'

interface ForgotPasswordModalProps {
  onClose: () => void
  onBackToAuth: () => void
}

export default function ForgotPasswordModal({ onClose, onBackToAuth }: ForgotPasswordModalProps) {
  const ctx = useMCP("ForgotPasswordModal.tsx")
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent submission in viewer mode
    if (ctx.role === "viewer") {
      toast.error('View only mode - password reset disabled')
      return
    }
    
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      
      if (error) throw error
      
      setEmailSent(true)
      toast.success('Password reset email sent!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl w-full max-w-md">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl"></div>
        
        <div className="relative p-8">
          {/* Viewer Warning Banner */}
          {ctx.role === "viewer" && (
            <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded border border-yellow-300 mb-4">
              ⚠️ View-Only Mode Active — Interaction Disabled
            </div>
          )}
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBackToAuth}
                disabled={ctx.role === "viewer"}
                className={`p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 ${
                  ctx.role === "viewer" ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </button>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                  Reset Password
                </h2>
                <p className="text-sm text-gray-600">
                  We'll send you a reset link
                </p>
                
                {/* Role Badge */}
                <span className="text-xs text-blue-600 font-bold">Role: {ctx.role}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={ctx.role === "viewer"}
              className={`p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 ${
                ctx.role === "viewer" ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {emailSent ? (
            /* Success State */
            <div className="text-center py-8">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Sent!</h3>
              <p className="text-gray-600 mb-6">
                Check your email for a password reset link. It may take a few minutes to arrive.
              </p>
              {ctx.role === "viewer" ? (
                <div className="w-full py-3 px-4 bg-gray-100 text-gray-500 font-semibold rounded-xl text-center">
                  <span className="text-sm text-gray-500 italic">View Only</span>
                </div>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:-translate-y-0.5"
                >
                  Done
                </button>
              )}
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={ctx.role === "viewer"}
                    className={`w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      ctx.role === "viewer" ? 'bg-gray-50 cursor-not-allowed' : ''
                    }`}
                    placeholder={ctx.role === "viewer" ? "View only mode" : "Enter your email address"}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enter the email address associated with your account
                </p>
              </div>

              {ctx.role === "viewer" ? (
                <div className="w-full py-3 px-4 bg-gray-100 text-gray-500 font-semibold rounded-xl text-center">
                  <span className="text-sm text-gray-500 italic">View Only</span>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sending Reset Link...</span>
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              )}

              <div className="text-center">
                {ctx.role === "viewer" ? (
                  <span className="text-sm text-gray-500 italic">View Only</span>
                ) : (
                  <button
                    type="button"
                    onClick={onBackToAuth}
                    className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
                  >
                    Back to Sign In
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
