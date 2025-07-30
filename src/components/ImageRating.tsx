import { useState } from 'react'
import { Heart, ThumbsDown, SkipForward } from 'lucide-react'

interface ImageRatingProps {
  imageId: string
  sectionId: string
  onFeedback: (imageId: string, sectionId: string, feedback: 'like' | 'dislike' | 'skip') => void
}

export default function ImageRating({ imageId, sectionId, onFeedback }: ImageRatingProps) {
  const [feedback, setFeedback] = useState<'like' | 'dislike' | 'skip' | null>(null)

  const handleFeedback = (type: 'like' | 'dislike' | 'skip') => {
    setFeedback(type)
    onFeedback(imageId, sectionId, type)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleFeedback('like')}
        className={`p-2 rounded-lg transition-colors ${
          feedback === 'like'
            ? 'bg-green-100 text-green-600'
            : 'hover:bg-gray-100 text-gray-500'
        }`}
        title="Like this image"
      >
        <Heart className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => handleFeedback('dislike')}
        className={`p-2 rounded-lg transition-colors ${
          feedback === 'dislike'
            ? 'bg-red-100 text-red-600'
            : 'hover:bg-gray-100 text-gray-500'
        }`}
        title="Dislike this image"
      >
        <ThumbsDown className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => handleFeedback('skip')}
        className={`p-2 rounded-lg transition-colors ${
          feedback === 'skip'
            ? 'bg-yellow-100 text-yellow-600'
            : 'hover:bg-gray-100 text-gray-500'
        }`}
        title="Skip this image"
      >
        <SkipForward className="w-4 h-4" />
      </button>
    </div>
  )
}
