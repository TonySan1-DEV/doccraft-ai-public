import React, { useState } from 'react'
import { FileText, Image, Settings, Upload, Wand2, Sun, Moon, Shield } from 'lucide-react'
import DocumentUpload from '../components/DocumentUpload'
import DocumentEditor from '../components/DocumentEditor'
import { ImageSuggestions } from '../components/ImageSuggestions'
import EnhancementSettings from '../components/EnhancementSettings'
import { LoginModal } from '../components/LoginModal'
import { Sidebar } from '../components/Sidebar'
import { ImagingModeProvider } from '../state/imagingMode'
import { useTheme } from '../contexts/ThemeContext'
import { useMCP } from '../useMCP'

type Tab = 'upload' | 'editor' | 'images' | 'settings'

// Layout wrapper component to handle dynamic sidebar margins
const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(true)
  
  // Listen for sidebar state changes
  React.useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setIsSidebarCollapsed(event.detail.isCollapsed)
    }

    // Listen for custom events from sidebar
    window.addEventListener('sidebar-toggle', handleSidebarToggle as EventListener)
    return () => window.removeEventListener('sidebar-toggle', handleSidebarToggle as EventListener)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Sidebar />
      <div className={`lg:ml-16 pt-16 transition-all duration-300 ${!isSidebarCollapsed ? 'lg:ml-64' : ''}`}>
        {children}
      </div>
    </div>
  )
}

export const DocumentProcessorApp: React.FC = () => {
  const mcpContext = useMCP("DocumentProcessorApp.tsx")
  const [activeTab, setActiveTab] = useState<Tab>('upload')
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const [document, setDocument] = useState<{
    id: string
    title: string
    content: string
    sections: Array<{
      id: string
      content: string
      topicTags: string[]
      tone: string
      intent: string
    }>
  } | null>(null)

  // Check if user has edit permissions
  const isViewer = mcpContext.role === "viewer"

  const tabs = [
    { id: 'upload' as Tab, label: 'Upload', icon: Upload, description: 'Import your document' },
    { id: 'editor' as Tab, label: 'Editor', icon: FileText, description: 'Edit and refine content' },
    { id: 'images' as Tab, label: 'Images', icon: Image, description: 'AI visual suggestions' },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings, description: 'Configure enhancement' },
  ]

  const handleDocumentProcessed = (processedDoc: any) => {
    setDocument(processedDoc)
    setActiveTab('editor')
  }

  return (
    <ImagingModeProvider initialMode="hybrid">
      <LayoutWrapper>
        {/* Top Header */}
        <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/20 shadow-lg shadow-black/5">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-20"></div>
                    <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                      <Wand2 className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                      DocCraft-AI
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Intelligent Document Enhancement</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleTheme}
                  disabled={isViewer}
                  className={`p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 ${
                    isViewer ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                >
                  {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  disabled={isViewer}
                  className={`flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg ${
                    isViewer ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span>{isViewer ? 'View Only' : 'Login / Sign Up'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

          {/* Tab Navigation */}
          <div className="bg-white/50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      disabled={isViewer && (tab.id === 'upload' || tab.id === 'settings')}
                      className={`
                        flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                        ${isActive
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }
                        ${isViewer && (tab.id === 'upload' || tab.id === 'settings') ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
            <div className="relative">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 dark:from-blue-400/10 dark:via-purple-400/10 dark:to-indigo-400/10 rounded-3xl"></div>
              
              <div className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/20 shadow-xl shadow-black/5 overflow-hidden">
                {activeTab === 'upload' && (
                  <div className="p-8">
                    {isViewer ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Shield className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Upload Restricted</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">Viewer role cannot upload documents</p>
                      </div>
                    ) : (
                      <DocumentUpload onDocumentUpload={file => {
                        // Simulate processing and set document
                        const processedDoc = {
                          id: `doc-${Date.now()}`,
                          title: file.name,
                          content: '',
                          sections: []
                        }
                        handleDocumentProcessed(processedDoc)
                      }} />
                    )}
                  </div>
                )}
                
                {activeTab === 'editor' && (
                  <div className="p-8">
                    {document ? (
                      <DocumentEditor content={document.content} onChange={content => setDocument({ ...document, content })} />
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Document Available</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">Upload a document first to start editing</p>
                        <button
                          onClick={() => setActiveTab('upload')}
                          disabled={isViewer}
                          className={`px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 ${
                            isViewer ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {isViewer ? 'View Only' : 'Upload Document'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'images' && (
                  <div className="p-8">
                    {document ? (
                      <ImageSuggestions document={document} />
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Image className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Document Available</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">Upload a document first to get AI image suggestions</p>
                        <button
                          onClick={() => setActiveTab('upload')}
                          disabled={isViewer}
                          className={`px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 ${
                            isViewer ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {isViewer ? 'View Only' : 'Upload Document'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'settings' && (
                  <div className="p-8">
                    {isViewer ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Shield className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Settings Restricted</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">Viewer role cannot access settings</p>
                      </div>
                    ) : (
                      <EnhancementSettings
                        settings={{ aiEnhancement: true, imageSuggestions: true, toneAnalysis: true }}
                        onSettingsChange={() => {}}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </main>
        </LayoutWrapper>

        {/* Auth Modal */}
        <LoginModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
      </ImagingModeProvider>
    )
  } 