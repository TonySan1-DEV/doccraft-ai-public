import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, User, LogOut, LogIn } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { AuthModal } from './AuthModal'
import { useMCP } from '../useMCP'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  const ctx = useMCP("Header.tsx")
  const { user, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <>
      <header className="bg-white shadow-sm border-b">
        {/* Viewer Warning Banner */}
        {ctx.role === "viewer" && (
          <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded border border-yellow-300 text-center">
            ⚠️ View-Only Mode — Navigation Locked
          </div>
        )}
        
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-xl font-bold text-gray-800"
              onClick={ctx.role === "viewer" ? (e) => e.preventDefault() : undefined}
            >
              <FileText className="w-8 h-8 text-blue-600" />
              DocCraft-AI
            </Link>
            
            <nav className="flex items-center gap-4">
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {user ? (
                <>
                  {ctx.role === "viewer" ? (
                    <span className="text-sm text-gray-500 italic">View Only</span>
                  ) : (
                    <Link to="/process" className="btn btn-primary">
                      New Document
                    </Link>
                  )}
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-600">{user.email}</span>
                    
                    {/* Role Badge */}
                    <span className="text-xs text-blue-600 font-bold">Role: {ctx.role}</span>
                    
                    {ctx.role === "viewer" ? (
                      <span className="text-sm text-gray-500 italic">View Only</span>
                    ) : (
                      <button
                        onClick={handleSignOut}
                        className="btn btn-secondary"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {ctx.role === "viewer" ? (
                    <span className="text-sm text-gray-500 italic">View Only</span>
                  ) : (
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="btn btn-primary"
                    >
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </button>
                  )}
                  
                  {/* Role Badge for non-authenticated users */}
                  <span className="text-xs text-blue-600 font-bold">Role: {ctx.role}</span>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {showAuthModal && (
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      )}
    </>
  )
}
