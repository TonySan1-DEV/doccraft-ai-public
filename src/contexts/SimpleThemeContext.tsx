import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  SimpleTheme,
  getDefaultTheme,
  getThemeById,
} from '../configs/simpleThemes';

interface SimpleThemeContextType {
  currentTheme: SimpleTheme;
  setTheme: (themeId: string) => void;
  getCurrentTheme: () => SimpleTheme;
}

const SimpleThemeContext = createContext<SimpleThemeContextType | null>(null);

export function useSimpleTheme() {
  const context = useContext(SimpleThemeContext);
  if (!context) {
    throw new Error('useSimpleTheme must be used within a SimpleThemeProvider');
  }
  return context;
}

export function SimpleThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentTheme, setCurrentTheme] =
    useState<SimpleTheme>(getDefaultTheme());

  // Apply CSS variables when theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', currentTheme.primary);
    root.style.setProperty('--theme-secondary', currentTheme.secondary);
    root.style.setProperty('--theme-accent', currentTheme.accent);
  }, [currentTheme]);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedThemeId = localStorage.getItem('simple-theme-id');
    if (savedThemeId) {
      const savedTheme = getThemeById(savedThemeId);
      if (savedTheme) {
        setCurrentTheme(savedTheme);
      }
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('simple-theme-id', currentTheme.id);
  }, [currentTheme.id]);

  const setTheme = (themeId: string) => {
    const theme = getThemeById(themeId);
    if (theme) {
      setCurrentTheme(theme);
    }
  };

  const getCurrentTheme = () => currentTheme;

  const value: SimpleThemeContextType = {
    currentTheme,
    setTheme,
    getCurrentTheme,
  };

  return (
    <SimpleThemeContext.Provider value={value}>
      {children}
    </SimpleThemeContext.Provider>
  );
}
