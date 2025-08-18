import React from 'react';
import { SimpleThemeChanger } from '../SimpleThemeChanger';
import { SimpleThemeProvider } from '../../contexts/SimpleThemeContext';
import { SimpleThemeDemo } from './SimpleThemeDemo';

export function ThemeChangerDemo() {
  return (
    <SimpleThemeProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header with Theme Changer */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              Theme Changer Demo
            </h1>
            <SimpleThemeChanger />
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-8 px-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Theme Changer Component
            </h2>
            <p className="text-gray-600 mb-4">
              This component allows users to switch between 5 predefined themes.
              The current theme is displayed as a colored circle, and clicking
              opens a dropdown with all available options.
            </p>

            <div className="flex justify-center">
              <SimpleThemeChanger />
            </div>
          </div>

          {/* Theme Demo */}
          <SimpleThemeDemo />
        </main>
      </div>
    </SimpleThemeProvider>
  );
}
