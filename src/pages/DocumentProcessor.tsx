import { useNavigate } from 'react-router-dom'
import { Upload, Type, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import DocumentUpload from '../components/DocumentUpload'
import DocumentEditor from '../components/DocumentEditor'
import EnhancementSettings from '../components/EnhancementSettings'
import { processDocument } from '../services/documentService'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function DocumentProcessor() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<'upload' | 'edit' | 'settings'>('upload')
  const [document, setDocument] = useState<{
    title: string
    content: string
    file?: File
  } | null>(null)

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">Please sign in to process documents.</p>
      </div>
    )
  }

  const handleDocumentUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setDocument({ title: file.name, content, file })
      setStep('edit')
    }
    reader.readAsText(file)
  }

  const handleDocumentEdit = (content: string) => {
    if (document) {
      setDocument({ ...document, content })
      setStep('settings')
    }
  }

  const handleProcess = async () => {
    if (!document) return

    try {
      const documentId = await processDocument(document.title, document.content)
      toast.success('Document processed successfully!')
      navigate(`/document/${documentId}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to process document')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Process Document
        </h1>
        <p className="text-gray-600">
          Upload or create a document and enhance it with AI-powered visuals
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center ${step === 'upload' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              <Upload className="w-4 h-4" />
            </div>
            <span className="ml-2 font-medium">Upload</span>
          </div>

          <div className="w-8 h-0.5 bg-gray-300"></div>

          <div className={`flex items-center ${step === 'edit' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'edit' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              <Type className="w-4 h-4" />
            </div>
            <span className="ml-2 font-medium">Edit</span>
          </div>

          <div className="w-8 h-0.5 bg-gray-300"></div>

          <div className={`flex items-center ${step === 'settings' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'settings' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              <Settings className="w-4 h-4" />
            </div>
            <span className="ml-2 font-medium">Settings</span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="card">
        {step === 'upload' && (
          <DocumentUpload onDocumentUpload={handleDocumentUpload} />
        )}

        {step === 'edit' && document && (
          <DocumentEditor content={document.content} onChange={handleDocumentEdit} />
        )}

        {step === 'settings' && (
          <EnhancementSettings settings={{ aiEnhancement: true, imageSuggestions: true, toneAnalysis: true }} onSettingsChange={() => {}} />
        )}

        {step === 'settings' && (
          <button
            onClick={handleProcess}
            className="btn btn-primary mt-4"
          >
            Process Document
          </button>
        )}
      </div>
    </div>
  )
}
