import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  User,
  LogOut,
  LogIn,
  Menu,
  X,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMCP } from '../useMCP';
import { AuthModal } from './AuthModal';
import { SimpleThemeChanger } from './SimpleThemeChanger';

export default function Header() {
  const ctx = useMCP('Header.tsx');
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('dark-mode') === 'true';
  });
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('dark-mode', newDark.toString());

    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Apply dark mode on mount
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

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
                <span className="text-gradient-primary group-hover:from-blue-600 group-hover:to-blue-800 transition-all duration-300 font-bold">
                  DocCraft-AI
                </span>
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-normal -mt-1 group-hover:text-blue-600 transition-colors duration-300 animate-pulse hidden sm:block">
                  AI-Powered Writing Assistant
                </span>
              </div>
            </Link>

            {/* Main Navigation Menu */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              <Link
                to="/"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-600 font-medium transition-colors duration-200"
                onClick={
                  ctx.role === 'viewer' ? e => e.preventDefault() : undefined
                }
              >
                Home
              </Link>
              <Link
                to="/demo"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-600 font-medium transition-colors duration-200"
                onClick={
                  ctx.role === 'viewer' ? e => e.preventDefault() : undefined
                }
              >
                Demo
              </Link>

              <Link
                to="/pricing"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-600 font-medium transition-colors duration-200"
                onClick={
                  ctx.role === 'viewer' ? e => e.preventDefault() : undefined
                }
              >
                Pricing
              </Link>
              <Link
                to="/about"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-600 font-medium transition-colors duration-200"
                onClick={
                  ctx.role === 'viewer' ? e => e.preventDefault() : undefined
                }
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-600 font-medium transition-colors duration-200"
                onClick={
                  ctx.role === 'viewer' ? e => e.preventDefault() : undefined
                }
              >
                Contact
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <nav className="flex items-center gap-4 sm:gap-6 lg:gap-8">
              {/* Theme Selector */}
              <SimpleThemeChanger />

              {/* Dark/Light Mode Toggle */}
              <button
                onClick={toggleDark}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Toggle dark mode"
                title="Toggle dark/light mode"
              >
                {isDark ? (
                  <Sun className="w-6 h-6" />
                ) : (
                  <Moon className="w-6 h-6" />
                )}
              </button>

              {user ? (
                <>
                  {ctx.role === 'viewer' ? (
                    <span className="text-sm text-gray-500 italic">
                      View Only
                    </span>
                  ) : (
                    <Link
                      to="/process"
                      className="hidden sm:inline-flex px-4 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-800 text-white border-none transition-all duration-300"
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
                    <span className="text-xs text-blue-600 font-bold bg-blue-600/10 px-2 py-1 rounded hidden sm:inline-block">
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
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium shadow-md transform hover:-translate-y-1 transition-all duration-300 bg-blue-600 hover:bg-blue-800 text-white border-none"
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

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[9998] bg-black bg-opacity-50">
          <div
            ref={mobileMenuRef}
            className="fixed inset-y-0 right-0 w-64 bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out"
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Menu
              </h2>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Close mobile menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Navigation Links */}
            <nav className="p-4 space-y-2">
              <Link
                to="/"
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors duration-200"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              <Link
                to="/demo"
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors duration-200"
                onClick={closeMobileMenu}
              >
                Demo
              </Link>
              <Link
                to="/pricing"
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors duration-200"
                onClick={closeMobileMenu}
              >
                Pricing
              </Link>
              <Link
                to="/about"
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors duration-200"
                onClick={closeMobileMenu}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-600 hover:bg-gray-300 hover:bg-gray-700 rounded-lg font-medium transition-colors duration-200"
                onClick={closeMobileMenu}
              >
                Contact
              </Link>
            </nav>

            {/* Mobile User Section */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              {/* Theme and Dark Mode Toggles for Mobile */}
              <div className="space-y-3 mb-4">
                {/* Theme Selector for Mobile */}
                <div className="flex justify-center">
                  <SimpleThemeChanger />
                </div>

                {/* Dark Mode Toggle for Mobile */}
                <div className="flex items-center justify-center">
                  <button
                    onClick={toggleDark}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {isDark ? (
                      <Sun className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                    <span className="text-sm font-medium">
                      {isDark ? 'Light Mode' : 'Dark Mode'}
                    </span>
                  </button>
                </div>
              </div>

              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {user.email}
                    </span>
                  </div>
                  {ctx.role !== 'viewer' && (
                    <Link
                      to="/process"
                      className="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-800 text-white font-medium rounded-lg text-center transition-colors"
                      onClick={closeMobileMenu}
                    >
                      New Document
                    </Link>
                  )}
                  {ctx.role !== 'viewer' && (
                    <button
                      onClick={() => {
                        closeMobileMenu();
                        handleSignOut();
                      }}
                      className="w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium rounded-lg text-center transition-colors border border-gray-300 dark:border-gray-600"
                    >
                      Sign Out
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      setShowAuthModal(true);
                    }}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </>
  );
}
