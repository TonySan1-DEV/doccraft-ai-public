import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, CheckCircle } from 'lucide-react'

interface DocumentUploadProps {
  onDocumentUpload: (file: File) => void
  acceptedFileTypes?: string[]
  maxFileSize?: number
}

export default function DocumentUpload({ 
  onDocumentUpload, 
  acceptedFileTypes = ['.docx', '.pdf', '.txt'], 
  maxFileSize = 10 * 1024 * 1024 // 10MB
}: DocumentUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setUploadedFile(file)
      setIsUploading(true)
      
      // Simulate upload process
      setTimeout(() => {
        onDocumentUpload(file)
        setIsUploading(false)
        setUploadStatus('success')
      }, 2000)
    }
  }, [onDocumentUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    maxSize: maxFileSize,
    multiple: false
  })

  const removeFile = () => {
    setUploadedFile(null)
    setUploadStatus('idle')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <input {...getInputProps()} />
        
        {uploadedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <File className="h-8 w-8 text-green-600" />
              <span className="text-lg font-medium text-gray-900 dark:text-white">
                {uploadedFile.name}
              </span>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {formatFileSize(uploadedFile.size)}
            </div>
            
            {isUploading && (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Processing document...
                </span>
              </div>
            )}
            
            {uploadStatus === 'success' && (
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Document processed successfully!</span>
              </div>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeFile()
              }}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Remove file
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {isDragActive ? 'Drop the file here' : 'Upload your document'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Drag and drop a file here, or click to select
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Supported formats: {acceptedFileTypes.join(', ')} (max {formatFileSize(maxFileSize)})
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
