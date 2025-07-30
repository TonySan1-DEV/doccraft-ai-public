import { useState, useRef, useEffect } from 'react'
import { useMCP } from '../useMCP'

interface DocumentEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
  minHeight?: string
}

export default function DocumentEditor({ 
  content, 
  onChange, 
  placeholder = "Start writing your document...",
  className = "",
  autoFocus = false,
  minHeight = "400px"
}: DocumentEditorProps) {
  const ctx = useMCP("DocumentEditor.tsx")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)

  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          style={{ minHeight }}
          className={`
            w-full p-4 border rounded-lg resize-none focus:outline-none transition-all duration-200
            ${isFocused 
              ? 'border-blue-500 ring-2 ring-blue-500/20 bg-white dark:bg-gray-800' 
              : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900'
            }
            dark:text-white text-gray-900
            placeholder-gray-500 dark:placeholder-gray-400
            font-mono text-sm leading-relaxed
          `}
        />
        
        {/* Character count */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500">
          {content.length} characters
        </div>
        
        {/* Role indicator */}
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
            {ctx.role}
          </span>
        </div>
      </div>
    </div>
  )
}
