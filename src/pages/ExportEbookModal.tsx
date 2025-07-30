import React, { useState } from 'react'
import { Loader2, Download, X } from 'lucide-react'

export interface Section {
  id: string
  title: string
  content: string
}

interface ExportEbookModalProps {
  open: boolean
  onClose: () => void
  docId: string
  content: Section[]
}

const formatOptions = [
  { label: 'Standard EPUB', value: 'epub' },
  { label: 'PDF', value: 'pdf' },
  { label: 'Interactive EPUB', value: 'interactive' },
]

type ExportFormat = 'epub' | 'pdf' | 'interactive'

const ExportEbookModal: React.FC<ExportEbookModalProps> = ({ open, onClose, docId, content }) => {
  const [format, setFormat] = useState<ExportFormat>('epub')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const handleExport = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId, format, content }),
      })
      if (!res.ok) throw new Error('Export failed')
      const data = await res.json()
      if (!data.downloadUrl) throw new Error('No download URL returned')
      // Trigger file download
      window.open(data.downloadUrl, '_blank')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button
          className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          onClick={onClose}
          aria-label="Close"
        >
          <X />
        </button>
        <h2 className="text-2xl font-bold mb-4">Export eBook</h2>
        <div className="mb-6">
          <div className="font-medium mb-2">Choose format:</div>
          <div className="space-y-2">
            {formatOptions.map(opt => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="export-format"
                  value={opt.value}
                  checked={format === opt.value}
                  onChange={() => setFormat(opt.value as ExportFormat)}
                  className="accent-blue-600"
                  disabled={loading}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <button
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded disabled:opacity-60"
          onClick={handleExport}
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Download className="w-5 h-5" />} Export
        </button>
      </div>
    </div>
  )
}

export default ExportEbookModal 