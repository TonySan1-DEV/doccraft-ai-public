import { BarChart3, TrendingUp, FileText, Image, BookOpen, Plus, Clock, Zap, Star, HelpCircle } from 'lucide-react'
import { useMCP } from '../useMCP'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Dashboard() {
  const ctx = useMCP("Dashboard.tsx")
  const { user } = useAuth()
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 relative">
      {/* Click-based Tooltip Component */}
      {activeTooltip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Help</h3>
              <button
                onClick={() => setActiveTooltip(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300">{activeTooltip}</p>
          </div>
        </div>
      )}
      
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user?.email?.split('@')[0] || 'User'}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Here's what's happening with your documents today.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <Star className="w-3 h-3 mr-1" />
                {ctx.role} Role
              </span>
              <button
                onClick={() => setActiveTooltip(`Your current role: ${ctx.role}. This determines your access level and available features.`)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <Link
              to="/processor"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Document
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Documents Processed</p>
                <button
                  onClick={() => setActiveTooltip("Total number of documents you've processed with AI enhancement and analysis")}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <HelpCircle className="w-3 h-3" />
                </button>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1,234</p>
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% this week
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Images Generated</p>
                <button
                  onClick={() => setActiveTooltip("AI-generated images created to enhance your documents and content")}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <HelpCircle className="w-3 h-3" />
                </button>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">567</p>
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8% this week
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
              <Image className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Analyses Completed</p>
                <button
                  onClick={() => setActiveTooltip("Deep content analysis and insights generated for your documents")}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <HelpCircle className="w-3 h-3" />
                </button>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">89</p>
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +15% this week
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Processing Time</p>
                <button
                  onClick={() => setActiveTooltip("Average time to process documents with AI enhancement and analysis")}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <HelpCircle className="w-3 h-3" />
                </button>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">2.3s</p>
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
                <Zap className="w-3 h-3 mr-1" />
                -0.5s avg
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Processing Activity</h3>
              <button
                onClick={() => setActiveTooltip("Visual representation of your document processing activity over the last 7 days")}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Last 7 days</span>
          </div>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center border border-gray-200 dark:border-slate-600">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-blue-500 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">Activity Chart</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">Processing data visualization</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Usage Trends</h3>
              <button
                onClick={() => setActiveTooltip("Monthly usage patterns and trends for document processing and AI features")}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Monthly</span>
          </div>
          <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center border border-gray-200 dark:border-slate-600">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">Trend Chart</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">Usage pattern analysis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6 hover:shadow-lg transition-all duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700/50 dark:to-slate-800/50 rounded-lg border border-blue-100 dark:border-slate-600">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Document processed successfully</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">"Business_Proposal.pdf" - 2 minutes ago</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">Complete</span>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-700/50 dark:to-slate-800/50 rounded-lg border border-green-100 dark:border-slate-600">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <Image className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">AI images generated</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">5 images for "Marketing_Campaign" - 15 minutes ago</p>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full">AI Generated</span>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-slate-700/50 dark:to-slate-800/50 rounded-lg border border-orange-100 dark:border-slate-600">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Content analysis completed</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">"Technical_Manual.docx" - 1 hour ago</p>
              </div>
              <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-1 rounded-full">Analyzed</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6 hover:shadow-lg transition-all duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/processor"
              className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700/50 dark:to-slate-800/50 rounded-lg border border-blue-100 dark:border-slate-600 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">Process Document</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Upload & analyze</p>
              </div>
            </Link>

            <Link
              to="/builder"
              className="flex items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-700/50 dark:to-slate-800/50 rounded-lg border border-green-100 dark:border-slate-600 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                <Image className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400">Generate Images</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">AI-powered visuals</p>
              </div>
            </Link>

            <Link
              to="/analyzer"
              className="flex items-center p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-slate-700/50 dark:to-slate-800/50 rounded-lg border border-orange-100 dark:border-slate-600 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400">Content Analysis</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Deep insights</p>
              </div>
            </Link>
            <Link
              to="/outliner"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold shadow mt-4"
            >
              <BookOpen className="w-5 h-5" /> AI Book Outliner
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
