import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useMCP } from '../useMCP'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Footer } from '../components/Footer'

type AuthMode = 'login' | 'signup' | 'forgot'

interface FormData {
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

export const Login: React.FC = () => {
  const mcpContext = useMCP("Login.tsx")
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    // Confirm password validation for signup
    if (mode === 'signup') {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (mode !== 'forgot' && !validateForm()) return

    setIsLoading(true)
    
    try {
      if (mode === 'login') {
        await signIn(formData.email, formData.password)
      } else if (mode === 'signup') {
        await signUp(formData.email, formData.password)
      } else if (mode === 'forgot') {
        await handleForgotPassword()
      }
      
      // Reset form on success
      setFormData({ email: '', password: '', confirmPassword: '' })
      setErrors({})
    } catch (error: any) {
      setErrors({ general: error.message || 'An error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      
      if (error) throw error
      
      toast.success('Password reset email sent! Check your inbox.')
      setMode('login')
    } catch (err: any) {
      throw new Error(err.message || 'Failed to send reset email')
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col">
      {/* MCP Role Badge */}
      {mcpContext.role !== "viewer" && (
        <div className="fixed top-4 right-4 z-50 px-3 py-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-full border border-white/20 dark:border-slate-700/20 shadow-lg">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 capitalize">
            Role: {mcpContext.role}
          </span>
        </div>
      )}
      
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
        {/* Back to Home */}
        <div className="text-center mb-8">
          <a 
            href="/"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </a>
        </div>

        {/* Auth Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20 dark:border-slate-700/20">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'forgot' && 'Reset Password'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {mode === 'login' && 'Sign in to your DocCraft AI account'}
              {mode === 'signup' && 'Join thousands of creators using DocCraft AI'}
              {mode === 'forgot' && 'Enter your email to receive a password reset link'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.email 
                      ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            {mode !== 'forgot' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.password 
                        ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                )}
              </div>
            )}

            {/* Confirm Password Field (Signup only) */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.confirmPassword 
                        ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : mode === 'login' ? (
                <LogIn className="w-5 h-5 mr-2" />
              ) : mode === 'signup' ? (
                <UserPlus className="w-5 h-5 mr-2" />
              ) : (
                <Mail className="w-5 h-5 mr-2" />
              )}
              {isLoading ? 'Processing...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Email'}
            </button>
          </form>

          {/* Mode Toggle */}
          <div className="mt-6 text-center space-y-2">
            {mode === 'login' && (
              <>
                <p className="text-gray-600 dark:text-gray-300">
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <button
                    onClick={() => {
                      setMode('forgot')
                      setErrors({})
                      setFormData({ email: '', password: '', confirmPassword: '' })
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    Forgot your password?
                  </button>
                </p>
              </>
            )}

            {mode === 'signup' && (
              <p className="text-gray-600 dark:text-gray-300">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            )}

            {mode === 'forgot' && (
              <>
                <p className="text-gray-600 dark:text-gray-300">
                  Remember your password?{' '}
                  <button
                    onClick={() => {
                      setMode('login')
                      setErrors({})
                      setFormData({ email: '', password: '', confirmPassword: '' })
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    Sign in
                  </button>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  We'll send you a link to reset your password
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
} 