import React, { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

export interface ImageMeta {
  url: string
  sectionId: string
  altText?: string
}

interface AltTextEnhancerProps {
  image: ImageMeta
  sectionContent: string
}

// Simple in-memory cache for alt text
const altTextCache: Record<string, string> = {}

export async function generateAltText(image: ImageMeta, context: string): Promise<string> {
  const cacheKey = `${image.url}|${context}`
  if (altTextCache[cacheKey]) return altTextCache[cacheKey]
  const res = await fetch('/api/alt-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: image.url, context })
  })
  if (!res.ok) throw new Error('Failed to generate alt text')
  const data = await res.json()
  altTextCache[cacheKey] = data.alt
  return data.alt
}

const AltTextEnhancer: React.FC<AltTextEnhancerProps> = ({ image, sectionContent }) => {
  const [altText, setAltText] = useState<string | undefined>(image.altText)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    if (!image.altText && image.url) {
      const cacheKey = `${image.url}|${sectionContent}`
      if (altTextCache[cacheKey]) {
        setAltText(altTextCache[cacheKey])
        return
      }
      setLoading(true)
      setError(null)
      generateAltText(image, sectionContent)
        .then(alt => {
          if (isMounted) setAltText(alt)
        })
        .catch(_err => {
          if (isMounted) setError('Could not generate alt text')
        })
        .finally(() => {
          if (isMounted) setLoading(false)
        })
    } else if (image.altText) {
      setAltText(image.altText)
    }
    return () => { isMounted = false }
  }, [image.url, image.altText, sectionContent])

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <img
          src={image.url}
          alt={altText || ''}
          className="rounded shadow max-w-full max-h-64"
        />
        {loading && (
          <span className="absolute top-2 right-2 bg-white/80 dark:bg-zinc-900/80 rounded-full p-1">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          </span>
        )}
      </div>
      <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 text-center min-h-[1.5em]">
        {error ? (
          <span className="text-red-500">{error}</span>
        ) : altText ? (
          <span>{altText}</span>
        ) : loading ? (
          <span className="text-zinc-400">Generating alt text...</span>
        ) : null}
      </div>
    </div>
  )
}

export default AltTextEnhancer 