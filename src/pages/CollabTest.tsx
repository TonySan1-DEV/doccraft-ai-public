import { useState } from 'react'
import { EditorPanel } from '../components/EditorPanel'
import { Users, Globe, Zap } from 'lucide-react'

export default function CollabTest() {
  const [docId] = useState('test-doc-' + Date.now())
  const [userId] = useState('user-' + Math.floor(Math.random() * 1000000))
  const [userName] = useState('User ' + Math.floor(Math.random() * 100))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🚀 Real-time Collaboration Test
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Open multiple browser tabs to test real-time collaboration!
          </p>
          
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900 dark:text-white">Your Session</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                User: {userName}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ID: {userId.slice(-6)}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <Globe className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900 dark:text-white">Document</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Room: {docId.slice(-8)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Status: Connected
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900 dark:text-white">Features</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Real-time editing
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cursor tracking
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            🧪 How to Test Collaboration
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-200">
            <li>Start the collaboration server: <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">npm run collab</code></li>
            <li>Open this page in multiple browser tabs</li>
            <li>Start typing in one tab and watch changes appear in others</li>
            <li>See other users' cursors in real-time</li>
            <li>Try selecting text and formatting - changes sync instantly!</li>
          </ol>
        </div>

        {/* Editor */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="h-[600px]">
            <EditorPanel 
              docId={docId}
              userId={userId}
              userName={userName}
              enableCollaboration={true}
              placeholder="Start typing here... Your changes will appear in real-time across all connected tabs!"
              className="h-full"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            💡 Tip: Each browser tab represents a different user in the collaboration
          </p>
        </div>
      </div>
    </div>
  )
} 