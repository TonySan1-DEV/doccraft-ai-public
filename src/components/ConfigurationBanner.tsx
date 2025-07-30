import { useState } from 'react'
import { AlertTriangle, X, ExternalLink, Settings } from 'lucide-react'
import { useMCP } from '../useMCP'

export function ConfigurationBanner() {
  const ctx = useMCP("ConfigurationBanner.tsx")
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-lg">
      {/* Viewer Warning Banner */}
      {ctx.role === "viewer" && (
        <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded border border-yellow-300 mb-4">
          ⚠️ View-Only Mode Active — Interaction Disabled
        </div>
      )}
      
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-amber-900">
                Connect to Supabase for Full Functionality
              </h3>
              {/* Role Badge */}
              <span className="text-xs text-blue-600 font-bold">Role: {ctx.role}</span>
            </div>
            <p className="text-amber-800 mb-4">
              To save documents and access advanced features, please connect to Supabase in the chat box. 
              The app currently runs with simulated AI features for demonstration.
            </p>
            <div className="flex items-center space-x-4">
              {ctx.role === "viewer" ? (
                <span className="text-sm text-gray-500 italic">View Only</span>
              ) : (
                <button 
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                  disabled={ctx.role === "viewer"}
                >
                  <Settings className="w-4 h-4" />
                  <span>Configure APIs</span>
                </button>
              )}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center space-x-2 text-amber-700 hover:text-amber-800 font-medium ${
                  ctx.role === "viewer" ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={ctx.role === "viewer" ? (e) => e.preventDefault() : undefined}
              >
                <span>Learn about Supabase</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          disabled={ctx.role === "viewer"}
          className={`flex-shrink-0 p-1 text-amber-600 hover:text-amber-800 transition-colors ${
            ctx.role === "viewer" ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
