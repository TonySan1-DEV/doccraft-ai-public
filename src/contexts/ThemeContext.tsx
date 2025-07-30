import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ColorTheme, ThemeMode, COLOR_THEMES, getThemeCSSVariables } from '../configs/colorThemes'

interface ThemeContextType {
  theme: ThemeMode
  colorTheme: ColorTheme
  toggleTheme: () => void
  setColorTheme: (colorTheme: ColorTheme) => void
  getCurrentThemeColors: () => ReturnType<typeof getThemeCSSVariables>
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme') as ThemeMode
    if (savedTheme) {
      return savedTheme
    }
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  })

  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    // Check localStorage for saved color theme preference
    const savedColorTheme = localStorage.getItem('colorTheme') as ColorTheme
    if (savedColorTheme && savedColorTheme in COLOR_THEMES) {
      return savedColorTheme
    }
    return 'blue' // Default color theme
  })

  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem('theme', theme)
    localStorage.setItem('colorTheme', colorTheme)
    
    // Apply theme to document
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    
    // Apply color theme CSS variables
    const cssVariables = getThemeCSSVariables(colorTheme, theme)
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })
  }, [theme, colorTheme])

  const toggleTheme = () => {
    setTheme((prev: ThemeMode) => prev === 'light' ? 'dark' : 'light')
  }

  const handleSetColorTheme = (newColorTheme: ColorTheme) => {
    setColorTheme(newColorTheme)
  }

  const getCurrentThemeColors = () => {
    return getThemeCSSVariables(colorTheme, theme)
  }

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      colorTheme, 
      toggleTheme, 
      setColorTheme: handleSetColorTheme,
      getCurrentThemeColors 
    }}>
      {children}
    </ThemeContext.Provider>
  )
} 