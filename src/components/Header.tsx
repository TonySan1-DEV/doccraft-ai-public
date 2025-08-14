import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, User, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMCP } from '../useMCP';
import { AuthModal } from './AuthModal';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const ctx = useMCP('Header.tsx');
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <header className="bg-white/95 backdrop-blur-sm shadow-xl border-b border-gray-200 dark:bg-gray-800/95 dark:border-gray-700 relative z-[9999] sticky top-0">
        {/* Viewer Warning Banner */}
        {ctx.role === 'viewer' && (
          <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded border border-yellow-300 text-center">
            ⚠️ View-Only Mode — Navigation Locked
          </div>
        )}

        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl font-bold text-gray-800 dark:text-white hover:text-blue-600 transition-colors group"
              onClick={
                ctx.role === 'viewer' ? e => e.preventDefault() : undefined
              }
            >
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 group-hover:scale-110 transition-transform duration-200 animate-logoFloat animate-logoGlow" />
              <div className="flex flex-col">
                <span className="text-gradient-primary group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300 font-bold">
                  DocCraft-AI
                </span>
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-normal -mt-1 group-hover:text-blue-600 transition-colors duration-300 animate-pulse hidden sm:block">
                  AI-Powered Writing Assistant
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-4 sm:gap-6 lg:gap-8">
              {/* Theme Toggle */}
              <ThemeToggle />

              {user ? (
                <>
                  {ctx.role === 'viewer' ? (
                    <span className="text-sm text-gray-500 italic">
                      View Only
                    </span>
                  ) : (
                    <Link
                      to="/process"
                      className="hidden sm:inline-flex px-4 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white border-none transition-all duration-300"
                    >
                      New Document
                    </Link>
                  )}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                      {user.email}
                    </span>

                    {/* Role Badge - only show on authenticated user pages */}
                    <span className="text-xs text-blue-600 font-bold bg-blue-100 px-2 py-1 rounded hidden sm:inline-block">
                      Role: {ctx.role}
                    </span>

                    {ctx.role === 'viewer' ? (
                      <span className="text-sm text-gray-500 italic">
                        View Only
                      </span>
                    ) : (
                      <button
                        onClick={handleSignOut}
                        className="btn btn-secondary"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline ml-1">Sign Out</span>
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {ctx.role === 'viewer' ? (
                    <span className="text-sm text-gray-500 italic">
                      View Only
                    </span>
                  ) : (
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium shadow-md transform hover:-translate-y-1 transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white border-none"
                    >
                      <LogIn className="w-4 h-4" />
                      <span className="hidden sm:inline">Sign In</span>
                      <span className="sm:hidden">Login</span>
                    </button>
                  )}
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </>
  );
}
