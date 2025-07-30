import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { Moon, Sun, Palette } from 'lucide-react'
import ThemeSelector from './ThemeSelector'

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false)

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Theme Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Sun className="w-5 h-5 text-gray-300" />
          )}
        </button>

        {/* Color Theme Selector */}
        <button
          onClick={() => setIsThemeSelectorOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          title="Change color theme"
        >
          <Palette className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      <ThemeSelector 
        isOpen={isThemeSelectorOpen} 
        onClose={() => setIsThemeSelectorOpen(false)} 
      />
    </>
  )
}

export default ThemeToggle 