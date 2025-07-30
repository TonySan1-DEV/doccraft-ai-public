import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, UserPlus, ArrowRight } from 'lucide-react'
import { LoginModal } from './LoginModal'
import { useAuth } from '../contexts/AuthContext'

export const AuthCTA: React.FC = () => {
  const { user, signOut } = useAuth()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const navigate = useNavigate()

  if (user) {
    return (
      <div className="text-center">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user.email?.split('@')[0]}!
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Ready to continue creating amazing content?
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate('/app')}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
          
          <button
            onClick={() => signOut()}
            className="inline-flex items-center px-8 py-4 bg-white/90 dark:bg-slate-800/90 text-gray-900 dark:text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 border border-gray-200 dark:border-slate-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="mb-8">
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Ready to Get Started?
        </h3>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Join thousands of creators who are already using DocCraft AI to transform their documents and create engaging content.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
        >
          <LogIn className="w-5 h-5 mr-2" />
          Sign In
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </button>
        
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="inline-flex items-center px-8 py-4 bg-white/90 dark:bg-slate-800/90 text-gray-900 dark:text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 border border-gray-200 dark:border-slate-700"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Create Account
        </button>
      </div>

      {/* Additional info */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        <p>Free to start • No credit card required • 14-day free trial</p>
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </div>
  )
} 