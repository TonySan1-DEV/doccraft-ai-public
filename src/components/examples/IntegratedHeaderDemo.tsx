import React from 'react';
import Header from '../Header';

export function IntegratedHeaderDemo() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with integrated theme selector and dark mode toggle */}
      <Header />

      {/* Demo content */}
      <main className="max-w-7xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Integrated Header Demo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            This page demonstrates the Header component with both the theme
            selector and dark mode toggle working together. Try switching themes
            and toggling dark mode to see them work independently.
          </p>
        </div>

        {/* Feature showcase */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              🎨 Theme Selector
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              The theme selector allows users to choose from 5 predefined color
              schemes:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <li>
                • <strong>Ocean Blue</strong> - Professional and calming
              </li>
              <li>
                • <strong>Forest Green</strong> - Natural and fresh
              </li>
              <li>
                • <strong>Royal Purple</strong> - Elegant and creative
              </li>
              <li>
                • <strong>Ruby Red</strong> - Bold and energetic
              </li>
              <li>
                • <strong>Sunset Orange</strong> - Warm and inviting
              </li>
            </ul>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Look for the palette icon with a colored circle in the header!
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              🌙 Dark Mode Toggle
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              The dark mode toggle switches between light and dark themes:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <li>
                • <strong>Light Mode</strong> - Clean, bright interface
              </li>
              <li>
                • <strong>Dark Mode</strong> - Easy on the eyes, modern look
              </li>
            </ul>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Look for the moon/sun icon in the header!
            </p>
          </div>
        </div>

        {/* CSS Variables Demo */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            CSS Variables Demo
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            The theme selector automatically sets CSS variables that you can use
            in your components:
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div
              className="p-4 rounded-lg text-center text-white font-medium"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              --theme-primary
            </div>
            <div
              className="p-4 rounded-lg text-center text-white font-medium"
              style={{ backgroundColor: 'var(--theme-secondary)' }}
            >
              --theme-secondary
            </div>
            <div
              className="p-4 rounded-lg text-center text-white font-medium"
              style={{ backgroundColor: 'var(--theme-accent)' }}
            >
              --theme-accent
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Try switching themes above to see these colors change in real-time!
          </p>
        </div>

        {/* Instructions */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            How to Test
          </h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-2xl mx-auto">
            <ol className="text-left text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <li>
                1. <strong>Theme Switching:</strong> Click the palette icon in
                the header to open the theme dropdown
              </li>
              <li>
                2. <strong>Dark Mode:</strong> Click the moon/sun icon to toggle
                between light and dark themes
              </li>
              <li>
                3. <strong>Independent Operation:</strong> Both controls work
                completely independently
              </li>
              <li>
                4. <strong>Persistence:</strong> Your theme and dark mode
                preferences are saved automatically
              </li>
              <li>
                5. <strong>Mobile:</strong> Test on mobile to see both controls
                in the mobile menu
              </li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
