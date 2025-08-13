import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.tsx';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

console.log('🚀 main.tsx loading...');
console.log('🔍 Environment check:', {
  NODE_ENV: import.meta.env.NODE_ENV,
  VITE_DEV_MODE: import.meta.env.VITE_DEV_MODE,
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not set',
});

try {
  const rootElement = document.getElementById('root');
  console.log('🔍 Root element found:', rootElement);

  if (!rootElement) {
    throw new Error('Root element not found');
  }

  console.log('🔍 Creating React root...');
  const root = ReactDOM.createRoot(rootElement);
  console.log('✅ React root created');

  console.log('🔍 Rendering app...');
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <BrowserRouter>
              <App />
              <Toaster position="top-right" />
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );

  console.log('✅ App rendered successfully');
} catch (error) {
  console.error('❌ Error in main.tsx:', error);

  // Fallback error display
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif; background-color: #fef2f2; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
        <div style="text-align: center;">
          <h1 style="color: #dc2626; margin-bottom: 16px;">Application Error</h1>
          <p style="color: #dc2626; margin-bottom: 16px;">Failed to load the application</p>
          <pre style="font-size: 12px; color: #991b1b; background-color: #fecaca; padding: 16px; border-radius: 4px; overflow: auto;">
            ${error instanceof Error ? error.message : String(error)}
          </pre>
          <div style="margin-top: 16px;">
            <button onclick="window.location.reload()" style="padding: 8px 16px; background-color: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Reload Page
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
