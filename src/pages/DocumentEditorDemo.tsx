import { useState } from 'react'
import DocumentEditor from '../components/DocumentEditor'
import { ImageSuggestions } from '../components/ImageSuggestions'
import { useMCP } from '../useMCP'

export default function DocumentEditorDemo() {
  const ctx = useMCP("DocumentEditorDemo.tsx")
  const [content, setContent] = useState('')
  const [document, setDocument] = useState({
    id: 'demo-doc-1',
    title: 'Demo Document',
    content: '',
    sections: [
      {
        id: 'section-1',
        content: 'This is a demo section for testing image suggestions.',
        topicTags: ['demo', 'testing', 'documentation'],
        tone: 'professional',
        intent: 'informative'
      }
    ]
  })

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    setDocument(prev => ({
      ...prev,
      content: newContent,
      sections: [
        {
          ...prev.sections[0],
          content: newContent
        }
      ]
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Document Editor Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Testing the enhanced DocumentEditor with AI-powered image suggestions
          </p>
          <div className="mt-4 flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              {ctx.role} Role
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Tier: {ctx.tier}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Document Editor */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Document Editor
              </h2>
              <DocumentEditor
                content={content}
                onChange={handleContentChange}
                placeholder="Start writing your document here... The AI will suggest relevant images based on your content."
                autoFocus={true}
                minHeight="300px"
              />
            </div>
          </div>

          {/* Image Suggestions */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                AI Image Suggestions
              </h2>
              <ImageSuggestions document={document} />
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Features Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-white">Document Editor</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Real-time character count</li>
                <li>• Role-based access control</li>
                <li>• Dark mode support</li>
                <li>• Auto-focus capability</li>
                <li>• Responsive design</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-white">Image Suggestions</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• AI-powered image generation</li>
                <li>• Stock photo integration</li>
                <li>• Relevance scoring</li>
                <li>• User feedback system</li>
                <li>• Multiple image sources</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-white">MCP Integration</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Context-aware permissions</li>
                <li>• Role-based UI elements</li>
                <li>• Tier-based features</li>
                <li>• Security compliance</li>
                <li>• Audit trail support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 