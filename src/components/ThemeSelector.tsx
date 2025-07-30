import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { COLOR_THEMES, ColorTheme } from '../configs/colorThemes'
import { Palette, Moon, Sun, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface ThemeSelectorProps {
  isOpen: boolean
  onClose: () => void
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ isOpen, onClose }) => {
  const { theme, colorTheme, toggleTheme, setColorTheme } = useTheme()
  const [selectedColorTheme, setSelectedColorTheme] = useState<ColorTheme>(colorTheme)

  const handleColorThemeChange = (newColorTheme: ColorTheme) => {
    setSelectedColorTheme(newColorTheme)
    setColorTheme(newColorTheme)
    toast.success(`Theme changed to ${COLOR_THEMES[newColorTheme].name}`)
  }

  const handleThemeModeToggle = () => {
    toggleTheme()
    toast.success(`Switched to ${theme === 'light' ? 'dark' : 'light'} mode`)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Palette className="w-6 h-6" />
            Theme Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Theme Mode Toggle */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Theme Mode
            </h3>
            <div className="flex items-center gap-4">
              <button
                onClick={handleThemeModeToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                  theme === 'light'
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                    : 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                }`}
              >
                {theme === 'light' ? (
                  <>
                    <Sun className="w-4 h-4" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" />
                    Dark Mode
                  </>
                )}
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Currently using {theme} mode
              </span>
            </div>
          </div>

          {/* Color Theme Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Color Theme
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(COLOR_THEMES).map(([key, themeConfig]) => {
                const isSelected = selectedColorTheme === key
                const colors = themeConfig.primary[theme]
                
                return (
                  <button
                    key={key}
                    onClick={() => handleColorThemeChange(key as ColorTheme)}
                    className={`relative p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
                        style={{ backgroundColor: colors }}
                      />
                      <div className="text-left">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {themeConfig.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {themeConfig.description}
                        </p>
                      </div>
                    </div>

                    {/* Color Preview */}
                    <div className="flex gap-1">
                      <div 
                        className="w-4 h-4 rounded border border-white dark:border-gray-800"
                        style={{ backgroundColor: themeConfig.primary[theme] }}
                      />
                      <div 
                        className="w-4 h-4 rounded border border-white dark:border-gray-800"
                        style={{ backgroundColor: themeConfig.secondary[theme] }}
                      />
                      <div 
                        className="w-4 h-4 rounded border border-white dark:border-gray-800"
                        style={{ backgroundColor: themeConfig.accent[theme] }}
                      />
                      <div 
                        className="w-4 h-4 rounded border border-white dark:border-gray-800"
                        style={{ backgroundColor: themeConfig.surface[theme] }}
                      />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Preview Section */}
          <div className="mt-8 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Preview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Button Preview */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Buttons
                </h4>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-lg text-white font-medium transition-colors duration-200"
                    style={{ backgroundColor: COLOR_THEMES[selectedColorTheme].primary[theme] }}>
                    Primary
                  </button>
                  <button className="px-4 py-2 rounded-lg border font-medium transition-colors duration-200"
                    style={{ 
                      borderColor: COLOR_THEMES[selectedColorTheme].border[theme],
                      color: COLOR_THEMES[selectedColorTheme].text[theme]
                    }}>
                    Secondary
                  </button>
                </div>
              </div>

              {/* Card Preview */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cards
                </h4>
                <div className="p-3 rounded-lg border transition-colors duration-200"
                  style={{ 
                    backgroundColor: COLOR_THEMES[selectedColorTheme].surface[theme],
                    borderColor: COLOR_THEMES[selectedColorTheme].border[theme],
                    color: COLOR_THEMES[selectedColorTheme].text[theme]
                  }}>
                  <div className="text-sm">Sample card content</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ThemeSelector 