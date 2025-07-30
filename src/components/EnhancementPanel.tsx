import { useState } from 'react'
import { Search, Plus, Wand2 } from 'lucide-react'
import ImageRating from './ImageRating'
import ManualImageSelector from './ManualImageSelector'
import { generateImageSuggestions } from '../services/imageService'
import toast from 'react-hot-toast'

interface EnhancementPanelProps {
  sections: Array<{
    id: string
    content: string
    topic_tags: string[]
    tone: string
    intent: string
    section_order: number
  }>
  images: Array<{
    id: string
    section_id: string
    source: 'ai' | 'stock' | 'upload'
    source_metadata: any
    caption: string
    relevance_score: number
    image_url: string
  }>
  onImagesUpdate: (images: any[]) => void
}

export default function EnhancementPanel({
  sections,
  images,
  onImagesUpdate,
}: EnhancementPanelProps) {
  // const ctx = useMCP("EnhancementPanel.tsx")
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [showImageSelector, setShowImageSelector] = useState(false)
  const [generatingImages, setGeneratingImages] = useState<string | null>(null)

  const getImagesForSection = (sectionId: string) => {
    return images
      .filter(img => img.section_id === sectionId)
      .sort((a, b) => b.relevance_score - a.relevance_score)
  }

  const handleGenerateImages = async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return

    setGeneratingImages(sectionId)
    try {
      const newImages = await generateImageSuggestions({
        id: section.id,
        content: section.content,
        topicTags: section.topic_tags,
        tone: section.tone,
        intent: section.intent
      })

      onImagesUpdate([...images, ...newImages])
      toast.success('New images generated!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate images')
    } finally {
      setGeneratingImages(null)
    }
  }

  const handleImageFeedback = async () => {
    try {
      toast.success('Feedback saved!')
    } catch (error) {
      toast.error('Failed to save feedback')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Image Enhancement</h2>
        <button
          onClick={() => {
            if (sections.length > 0) {
              setSelectedSection(sections[0].id)
              setShowImageSelector(true)
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Images
        </button>
      </div>

      <div className="space-y-6">
        {sections.map((section) => {
          const sectionImages = getImagesForSection(section.id)
          const isGenerating = generatingImages === section.id

          return (
            <div key={section.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Section {section.section_order}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {section.content.substring(0, 100)}...
                  </p>
                </div>
                <button
                  onClick={() => handleGenerateImages(section.id)}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <Wand2 className="w-4 h-4" />
                  {isGenerating ? 'Generating...' : 'Generate Images'}
                </button>
              </div>

              {sectionImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {sectionImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.image_url}
                        alt={image.caption}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                        <ImageRating
                          imageId={image.id}
                          sectionId={section.id}
                          onFeedback={(_imageId, _sectionId, _feedback) => handleImageFeedback()}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {sectionImages.length === 0 && !isGenerating && (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No images for this section yet</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showImageSelector && selectedSection && (
        <ManualImageSelector
          section={sections.find(s => s.id === selectedSection)!}
          onClose={() => setShowImageSelector(false)}
          onImageSelect={(selectedImage) => {
            onImagesUpdate([...images, selectedImage])
            setShowImageSelector(false)
          }}
        />
      )}
    </div>
  )
}
