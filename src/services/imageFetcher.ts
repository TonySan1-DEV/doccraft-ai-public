/**
 * Image Fetcher Service
 * Uses Unsplash API to fetch relevant images based on query strings
 * MCP Actions: generate, rank, insert
 */

/// <reference types="vite/client" />

export interface ImageResult {
  id: string;
  url: string;
  alt: string;
  author: string;
  width: number;
  height: number;
  description?: string;
}

interface UnsplashPhoto {
  id: string;
  urls: {
    regular: string;
  };
  alt_description: string;
  user: {
    name: string;
  };
  width: number;
  height: number;
  description: string | null;
}

interface UnsplashResponse {
  results: UnsplashPhoto[];
}

export async function fetchRelevantImages(query: string): Promise<ImageResult[]> {
  const apiKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  
  if (!apiKey) {
    throw new Error('Unsplash API key not found. Please set VITE_UNSPLASH_ACCESS_KEY');
  }

  try {
    // Clean and encode the query
    const cleanedQuery = query.trim().replace(/\s+/g, ' ');
    const encodedQuery = encodeURIComponent(cleanedQuery);
    
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodedQuery}&per_page=5&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${apiKey}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
    }

    const data: UnsplashResponse = await response.json();
    
    // Transform Unsplash data to our ImageResult format
    const images: ImageResult[] = data.results.map(photo => ({
      id: photo.id,
      url: photo.urls.regular,
      alt: photo.alt_description || `Image for ${cleanedQuery}`,
      author: photo.user.name,
      width: photo.width,
      height: photo.height,
      description: photo.description || undefined
    }));

    return images;
  } catch (error) {
    console.error('Error fetching images:', error);
    throw new Error(`Failed to fetch images: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 