import { supabase } from '../lib/supabase'

export interface Chapter {
  title: string
  summary: string
}

export interface BookOutline {
  id: string
  user_id: string
  title: string
  genre: string
  tone: string
  outline: Chapter[]
  created_at: string
  matchScore?: number
  misalignments?: string[]
}

/**
 * Sanitizes input strings to prevent injection vulnerabilities
 * @param input - The string to sanitize
 * @returns Sanitized string
 */
function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}

/**
 * Validates outline data before saving
 * @param outline - Array of chapters to validate
 * @returns True if valid, false otherwise
 */
function validateOutline(outline: Chapter[]): boolean {
  if (!Array.isArray(outline) || outline.length === 0) {
    return false
  }
  
  return outline.every(chapter => 
    typeof chapter.title === 'string' && 
    chapter.title.trim().length > 0 &&
    typeof chapter.summary === 'string' && 
    chapter.summary.trim().length > 0
  )
}

/**
 * Saves a book outline to Supabase
 * @param userId - The user's ID
 * @param title - Book title
 * @param genre - Book genre
 * @param tone - Book tone
 * @param outline - Array of chapters
 * @param matchScore - Market trend match score (optional)
 * @param misalignments - Array of top misalignments (optional)
 * @returns Promise<void>
 */
export async function saveOutlineToSupabase(
  userId: string,
  title: string,
  genre: string,
  tone: string,
  outline: Chapter[],
  matchScore?: number,
  misalignments?: string[]
): Promise<void> {
  try {
    // Input validation
    if (!userId || !title || !genre || !tone) {
      throw new Error('Missing required fields')
    }

    if (!validateOutline(outline)) {
      throw new Error('Invalid outline data')
    }

    // Sanitize inputs
    const sanitizedTitle = sanitizeInput(title)
    const sanitizedGenre = sanitizeInput(genre)
    const sanitizedTone = sanitizeInput(tone)

    // Prepare data for insertion
    const outlineData: any = {
      user_id: userId,
      title: sanitizedTitle,
      genre: sanitizedGenre,
      tone: sanitizedTone,
      outline: outline // JSONB will be automatically handled by Supabase
    }
    if (typeof matchScore === 'number') outlineData.matchScore = matchScore
    if (Array.isArray(misalignments)) outlineData.misalignments = misalignments

    console.log('Saving outline to Supabase:', {
      userId,
      title: sanitizedTitle,
      genre: sanitizedGenre,
      tone: sanitizedTone,
      chapterCount: outline.length,
      matchScore,
      misalignments
    })

    // Insert into Supabase
    const { data, error } = await supabase
      .from('book_outlines')
      .insert(outlineData)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw new Error(`Failed to save outline: ${error.message}`)
    }

    console.log('Outline saved successfully:', {
      outlineId: data.id,
      userId: data.user_id,
      title: data.title,
      createdAt: data.created_at
    })

  } catch (error: any) {
    console.error('Error saving outline:', error)
    throw new Error(`Failed to save outline: ${error.message}`)
  }
}

/**
 * Retrieves all book outlines for a user
 * @param userId - The user's ID
 * @returns Promise<BookOutline[]>
 */
export async function getUserOutlines(userId: string): Promise<BookOutline[]> {
  try {
    const { data, error } = await supabase
      .from('book_outlines')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching outlines:', error)
      throw new Error(`Failed to fetch outlines: ${error.message}`)
    }

    return data || []
  } catch (error: any) {
    console.error('Error in getUserOutlines:', error)
    throw new Error(`Failed to fetch outlines: ${error.message}`)
  }
}

/**
 * Deletes a book outline
 * @param outlineId - The outline ID to delete
 * @param userId - The user's ID (for security)
 * @returns Promise<void>
 */
export async function deleteOutline(outlineId: string, userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('book_outlines')
      .delete()
      .eq('id', outlineId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting outline:', error)
      throw new Error(`Failed to delete outline: ${error.message}`)
    }

    console.log('Outline deleted successfully:', outlineId)
  } catch (error: any) {
    console.error('Error in deleteOutline:', error)
    throw new Error(`Failed to delete outline: ${error.message}`)
  }
} 