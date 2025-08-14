import { supabase } from '../lib/supabase'

export interface ImageResult {
  id: string
  url: string
  title: string
  description?: string
  tags?: string[]
}

export interface ImageSuggestion {
  id: string
  url: string
  caption: string
  source: 'ai' | 'stock' | 'upload'
  relevanceScore: number
  sourceMetadata: {
    author?: string
    platform?: string
    prompt?: string
  }
}

export interface AIImageRequest {
  prompt: string
  style?: string
  size?: 'small' | 'medium' | 'large'
}

export interface DocumentSection {
  id: string
  content: string
  topicTags: string[]
  tone: string
  intent: string
}

export async function generateImageSuggestions(section: DocumentSection): Promise<ImageSuggestion[]> {
  await new Promise(resolve => setTimeout(resolve, 1500))

  const suggestions: ImageSuggestion[] = []
  const stockSuggestions = await generateStockSuggestions(section)
  suggestions.push(...stockSuggestions)
  const aiSuggestions = await generateAISuggestions(section)
  suggestions.push(...aiSuggestions)

  return suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore)
}

async function generateStockSuggestions(section: DocumentSection): Promise<ImageSuggestion[]> {
  const stockImages = [
    {
      id: 'stock-1',
      url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop',
      author: 'Unsplash Contributor',
      keywords: ['business', 'technology', 'office']
    },
    {
      id: 'stock-2',
      url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop',
      author: 'Unsplash Contributor',
      keywords: ['data', 'analysis', 'charts']
    },
    {
      id: 'stock-3',
      url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      author: 'Unsplash Contributor',
      keywords: ['strategy', 'planning', 'business']
    },
    {
      id: 'stock-4',
      url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=300&fit=crop',
      author: 'Unsplash Contributor',
      keywords: ['innovation', 'technology', 'development']
    }
  ]

  return stockImages.map(image => ({
    id: `${section.id}-${image.id}`,
    url: image.url,
    caption: generateCaption(section, image.keywords),
    source: 'stock',
    relevanceScore: calculateRelevance(section, image.keywords),
    sourceMetadata: {
      author: image.author,
      platform: 'Unsplash'
    }
  }))
}

async function generateAISuggestions(section: DocumentSection): Promise<ImageSuggestion[]> {
  const aiImages = [
    {
      id: 'ai-1',
      url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
      prompt: `Professional ${section.tone} illustration about ${section.topicTags.join(', ')}`
    },
    {
      id: 'ai-2',
      url: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=300&fit=crop',
      prompt: `Modern ${section.intent} visualization for ${section.topicTags[0] || 'business'}`
    }
  ]

  return aiImages.map(image => ({
    id: `${section.id}-${image.id}`,
    url: image.url,
    caption: `AI-generated image: ${image.prompt}`,
    source: 'ai',
    relevanceScore: 0.85 + Math.random() * 0.1,
    sourceMetadata: {
      prompt: image.prompt,
      platform: 'AI Generator'
    }
  }))
}

function generateCaption(section: DocumentSection, keywords: string[]): string {
  const relevantKeywords = keywords.filter(keyword =>
    section.topicTags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase())) ||
    section.content.toLowerCase().includes(keyword.toLowerCase())
  )

  if (relevantKeywords.length > 0) {
    return `Professional image showcasing ${relevantKeywords.join(' and ')} concepts`
  }

  return `Visual representation supporting the ${section.intent} content`
}

function calculateRelevance(section: DocumentSection, keywords: string[]): number {
  let score = 0.3

  keywords.forEach(keyword => {
    if (section.topicTags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))) {
      score += 0.2
    }
  })

  keywords.forEach(keyword => {
    if (section.content.toLowerCase().includes(keyword.toLowerCase())) {
      score += 0.1
    }
  })

  score += (Math.random() - 0.5) * 0.2

  return Math.min(Math.max(score, 0.1), 0.95)
}

export async function searchStockImages(query: string, limit: number = 10): Promise<ImageResult[]> {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const mockResults: ImageResult[] = [
      {
        id: '1',
        url: 'https://picsum.photos/300/200?random=1',
        title: `${query} - Image 1`,
        description: `Beautiful ${query} image`,
        tags: [query, 'stock', 'photo']
      },
      {
        id: '2',
        url: 'https://picsum.photos/300/200?random=2',
        title: `${query} - Image 2`,
        description: `Professional ${query} photography`,
        tags: [query, 'professional', 'high-quality']
      },
      {
        id: '3',
        url: 'https://picsum.photos/300/200?random=3',
        title: `${query} - Image 3`,
        description: `Creative ${query} artwork`,
        tags: [query, 'creative', 'art']
      }
    ]

    return mockResults.slice(0, limit)
  } catch (error) {
    console.error('Error searching stock images:', error)
    return []
  }
}

export async function generateAIImage(request: AIImageRequest): Promise<ImageResult> {
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))

    const mockImage: ImageResult = {
      id: `ai-${Date.now()}`,
      url: `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`,
      title: `AI Generated: ${request.prompt}`,
      description: `AI-generated image based on: "${request.prompt}"`,
      tags: ['ai-generated', request.prompt.toLowerCase(), request.style || 'realistic']
    }

    return mockImage
  } catch (error) {
    console.error('Error generating AI image:', error)
    throw new Error('Failed to generate AI image')
  }
}

export async function saveImageToStorage(imageFile: File, path: string): Promise<string> {
  try {
    const { error } = await supabase.storage
      .from('images')
      .upload(path, imageFile)

    if (error) {
      throw error
    }

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(path)

    return publicUrl
  } catch (error) {
    console.error('Error saving image to storage:', error)
    throw error
  }
}

export async function getImagesFromStorage(folder: string = ''): Promise<string[]> {
  try {
    const { data, error } = await supabase.storage
      .from('images')
      .list(folder)

    if (error) {
      throw error
    }

    return data.map((file: any) => {
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(`${folder}/${file.name}`)
      return publicUrl
    })
  } catch (error) {
    console.error('Error getting images from storage:', error)
    return []
  }
}
