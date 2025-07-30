/**
 * Image Placement Utility
 * Determines optimal image placement based on text content analysis
 * MCP Actions: generate, rank, insert
 */

export type ImagePlacement = 'top' | 'inline' | 'end';

interface PlacementHeuristics {
  wordCount: number;
  hasHeadings: boolean;
  hasLists: boolean;
  paragraphCount: number;
  averageParagraphLength: number;
}

/**
 * Analyzes text content to determine optimal image placement
 * @param section - The text section to analyze
 * @returns Placement recommendation: 'top', 'inline', or 'end'
 */
export function decideImagePlacement(section: string): ImagePlacement {
  if (!section || section.trim().length === 0) {
    return 'top'; // Default for empty content
  }

  const heuristics = analyzeTextContent(section);
  
  // Short content (under 100 words) → top placement
  if (heuristics.wordCount < 100) {
    return 'top';
  }
  
  // Content with headings → inline placement for better flow
  if (heuristics.hasHeadings) {
    return 'inline';
  }
  
  // Long content with many paragraphs → inline for visual breaks
  if (heuristics.paragraphCount > 3 && heuristics.averageParagraphLength > 50) {
    return 'inline';
  }
  
  // Content with lists → inline to break up list monotony
  if (heuristics.hasLists) {
    return 'inline';
  }
  
  // Very long content (over 500 words) → end placement
  if (heuristics.wordCount > 500) {
    return 'end';
  }
  
  // Medium content → inline for better engagement
  if (heuristics.wordCount >= 100 && heuristics.wordCount <= 500) {
    return 'inline';
  }
  
  // Default fallback
  return 'top';
}

/**
 * Analyzes text content to extract placement heuristics
 * @param text - The text to analyze
 * @returns Object with various text metrics
 */
function analyzeTextContent(text: string): PlacementHeuristics {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const lines = text.split('\n');
  
  // Check for headings (lines that might be headings)
  const hasHeadings = lines.some(line => {
    const trimmed = line.trim();
    return trimmed.length > 0 && 
           (trimmed.startsWith('#') || 
            trimmed.length < 100 && 
            trimmed.endsWith(':') ||
            /^[A-Z][A-Z\s]+$/.test(trimmed));
  });
  
  // Check for lists
  const hasLists = text.includes('•') || 
                   text.includes('- ') || 
                   text.includes('1. ') ||
                   text.includes('* ');
  
  // Calculate average paragraph length
  const totalParagraphLength = paragraphs.reduce((sum, p) => sum + p.length, 0);
  const averageParagraphLength = paragraphs.length > 0 ? totalParagraphLength / paragraphs.length : 0;
  
  return {
    wordCount: words.length,
    hasHeadings,
    hasLists,
    paragraphCount: paragraphs.length,
    averageParagraphLength
  };
}

/**
 * Gets a human-readable explanation for the placement decision
 * @param section - The text section
 * @returns Explanation string
 */
export function getPlacementExplanation(section: string): string {
  const placement = decideImagePlacement(section);
  const heuristics = analyzeTextContent(section);
  
  switch (placement) {
    case 'top':
      return heuristics.wordCount < 100 
        ? 'Short content - image placed at top for immediate visual impact'
        : 'Content structure suggests top placement for best visual hierarchy';
        
    case 'inline':
      return heuristics.hasHeadings 
        ? 'Content has headings - inline placement maintains flow'
        : heuristics.hasLists
        ? 'Content has lists - inline placement breaks up monotony'
        : heuristics.paragraphCount > 3
        ? 'Multiple paragraphs - inline placement provides visual breaks'
        : 'Medium-length content - inline placement optimizes engagement';
        
    case 'end':
      return heuristics.wordCount > 500
        ? 'Long content - image placed at end as visual conclusion'
        : 'Content structure suggests end placement for natural flow';
        
    default:
      return 'Default placement applied';
  }
} 