import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getUserOutlines, deleteOutline, BookOutline } from '../services/saveOutline'
import { ChevronDown, ChevronUp, Loader2, Trash2, Edit3, Calendar, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'

interface SavedOutlinesProps {
  onLoadOutline?: (outline: BookOutline) => void
}

const SavedOutlines: React.FC<SavedOutlinesProps> = ({ onLoadOutline }) => {
  const { user } = useAuth()
  const [outlines, setOutlines] = useState<BookOutline[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchOutlines()
    }
  }, [user?.id])

  const fetchOutlines = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      setError(null)
      const userOutlines = await getUserOutlines(user.id)
      setOutlines(userOutlines)
    } catch (err: any) {
      console.error('Failed to fetch outlines:', err)
      setError('Failed to load saved outlines')
      toast.error('Failed to load saved outlines')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (outlineId: string) => {
    if (!user?.id) {
      toast.error('You must be logged in to delete outlines')
      return
    }
    
    if (!confirm('Are you sure you want to delete this outline? This action cannot be undone.')) {
      return
    }

    try {
      setDeleting(outlineId)
      await deleteOutline(outlineId, user.id)
      setOutlines(prev => prev.filter(outline => outline.id !== outlineId))
      toast.success('Outline deleted successfully')
    } catch (err: any) {
      console.error('Failed to delete outline:', err)
      toast.error('Failed to delete outline')
    } finally {
      setDeleting(null)
    }
  }

  const handleLoadOutline = (outline: BookOutline) => {
    if (onLoadOutline) {
      onLoadOutline(outline)
      toast.success('Outline loaded successfully')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
        <span className="ml-2 text-gray-600 dark:text-gray-300">Loading saved outlines...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-2">{error}</div>
        <button
          onClick={fetchOutlines}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (outlines.length === 0) {
    return (
      <div className="text-center p-8">
        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Saved Outlines
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Generate your first outline to see it here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Saved Outlines ({outlines.length})
        </h3>
        <button
          onClick={fetchOutlines}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {outlines.map((outline) => (
          <div
            key={outline.id}
            className="border rounded-lg bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {outline.title}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {outline.genre}
                    </span>
                    <span>•</span>
                    <span>{outline.tone}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(outline.created_at)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {outline.outline.length} chapters
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleLoadOutline(outline)}
                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                    title="Load to editor"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(outline.id)}
                    disabled={deleting === outline.id}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                    title="Delete outline"
                  >
                    {deleting === outline.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setExpanded(expanded === outline.id ? null : outline.id)}
                className="w-full flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <span>View chapters</span>
                {expanded === outline.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {expanded === outline.id && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="space-y-2">
                    {outline.outline.map((chapter, idx) => (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                        <div className="font-medium text-gray-900 dark:text-white mb-1">
                          Chapter {idx + 1}: {chapter.title}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {chapter.summary}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SavedOutlines 