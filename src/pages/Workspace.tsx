import { Folder, FileText, Image, Clock, Star, Search, Filter, Plus } from 'lucide-react'
import { useMCP } from '../useMCP'

export default function Workspace() {
  const ctx = useMCP("Workspace.tsx")
  
  // Workspace is available for Free tier
  if (ctx.tier === "Free") {
    // Show limited workspace for free users
    return (
      <div className="max-w-7xl mx-auto py-10 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            📁 Workspace
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your documents and files. Upgrade to Pro for unlimited storage and advanced features.
          </p>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Folder className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Limited Storage
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You're currently on the Free plan with limited storage. Upgrade to Pro for unlimited workspace.
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg">
            Upgrade to Pro
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📁 Workspace
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage and organize your documents, images, and project files with advanced collaboration tools.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <Filter className="h-5 w-5" />
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>New File</span>
            </button>
          </div>
        </div>
      </div>

      {/* File Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {/* Document Files */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <Star className="h-5 w-5 text-yellow-500" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Business Report</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">PDF • 2.3 MB</p>
          <div className="flex items-center text-xs text-gray-400">
            <Clock className="h-4 w-4 mr-1" />
            <span>Updated 2 hours ago</span>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="w-5 h-5"></div>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Technical Specs</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">DOCX • 1.8 MB</p>
          <div className="flex items-center text-xs text-gray-400">
            <Clock className="h-4 w-4 mr-1" />
            <span>Updated 1 day ago</span>
          </div>
        </div>

        {/* Image Files */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <Image className="h-6 w-6 text-white" />
            </div>
            <div className="w-5 h-5"></div>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Product Images</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">PNG • 4.2 MB</p>
          <div className="flex items-center text-xs text-gray-400">
            <Clock className="h-4 w-4 mr-1" />
            <span>Updated 3 days ago</span>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Image className="h-6 w-6 text-white" />
            </div>
            <div className="w-5 h-5"></div>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Marketing Assets</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">JPG • 8.7 MB</p>
          <div className="flex items-center text-xs text-gray-400">
            <Clock className="h-4 w-4 mr-1" />
            <span>Updated 1 week ago</span>
          </div>
        </div>
      </div>

      {/* Storage Stats */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Storage Usage</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Used Space</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">17.2 GB of 100 GB</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: '17.2%' }}></div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Documents:</span>
              <span className="ml-2 text-gray-700 dark:text-gray-300">8.5 GB</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Images:</span>
              <span className="ml-2 text-gray-700 dark:text-gray-300">6.2 GB</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Other:</span>
              <span className="ml-2 text-gray-700 dark:text-gray-300">2.5 GB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 