import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.tsx';

import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { reportClientError } from './utils/reportClientError';
import './index.css';

try {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <ErrorBoundary onReportError={(e, info) => reportClientError(e, info)}>
        <AuthProvider>
          <BrowserRouter>
            <App />
            <Toaster position="top-right" />
          </BrowserRouter>
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );

  // Lazy boot performance monitoring after app is mounted (non-blocking)
  const MONITORING_ENABLED =
    (import.meta as any).env?.VITE_MONITORING_ENABLED === 'true' || false;

  const supabase = (window as any).__supabase ?? undefined;
  const alertService = (window as any).__alertService ?? undefined;

  import('./monitoring/bootPerformanceMonitor')
    .then(({ bootPerformanceMonitor }) =>
      bootPerformanceMonitor({
        enabled: MONITORING_ENABLED,
        supabase,
        alertService,
      })
    )
    .catch(() => {
      // never block app boot on monitor failure
    });
} catch (error) {
  console.error('❌ Error in main.tsx:', error);

  // Fallback error display
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif; background-color: #fef2f2; min-height: 100vh; display: flex; align-items: center; justify-center;">
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
