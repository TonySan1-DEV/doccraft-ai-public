/**
 * @fileoverview Slide Generator Service
 * @module modules/agent/services/slideGenerator
 *
 * MCP Context Block:
 * - role: "ai-engineer"
 * - tier: "Pro"
 * - file: "modules/agent/services/slideGenerator.ts"
 * - allowedActions: ["generate", "slides", "visuals"]
 * - theme: "doc2video_slides"
 */

/**
 * Slide Deck structure for PowerPoint presentations
 */
export type SlideDeck = {
  title: string;
  slides: {
    id: string;
    title: string;
    bullets: string[];
    suggestedImagePrompt?: string;
    speakerNotes?: string;
  }[];
  theme?: string;
};

/**
 * Generate slides from document text
 * @param documentText - Input document content
 * @param options - Generation options
 * @returns Promise<SlideDeck>
 */
export async function generateSlides(
  documentText: string,
  options?: {
    maxSlides?: number;
    style?: string;
    audience?: string;
    genre?: string;
    genreContext?: {
      category: 'fiction' | 'nonfiction' | 'special';
      subgenre?: string;
      targetAudience?: string[];
    };
  }
): Promise<SlideDeck> {
  try {
    // Input validation: trim and sanitize documentText
    const sanitizedText = documentText.trim();
    if (!sanitizedText) {
      throw new Error('Document text is required for slide generation');
    }

    console.log('📊 Generating slides from document...');

    // Break the document into logical sections
    const sections = splitDocumentIntoSections(sanitizedText);

    // Generate slides respecting maxSlides limit
    const maxSlides = options?.maxSlides || 10;
    const slides = createSlidesFromSections(sections, maxSlides);

    // Generate title from first section or document
    const title = sections[0]?.title || 'Document Presentation';

    // Create slide deck
    const slideDeck: SlideDeck = {
      title,
      slides,
      theme: options?.style || 'business',
    };

    console.log(`✅ Generated ${slides.length} slides`);
    return slideDeck;
  } catch (error) {
    console.error('Slide generation error:', error);
    throw new Error(
      `Failed to generate slides: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Split document into logical sections
 * @param documentText - Document content
 * @returns Array of sections
 */
function splitDocumentIntoSections(documentText: string): Array<{
  title: string;
  content: string;
  keyPoints: string[];
}> {
  // TODO: Integrate with LLM for intelligent document analysis
  // For now, use basic paragraph splitting

  const paragraphs = documentText.split('\n\n').filter(p => p.trim());
  const sections: Array<{
    title: string;
    content: string;
    keyPoints: string[];
  }> = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();
    if (!paragraph) continue;

    // Extract title from first sentence or use default
    const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim());
    const title = sentences[0]?.trim() || `Section ${i + 1}`;

    // Extract key points (first 3-5 sentences)
    const keyPoints = sentences
      .slice(1, 5)
      .map(s => s.trim())
      .filter(s => s.length > 10);

    sections.push({
      title,
      content: paragraph,
      keyPoints,
    });
  }

  return sections;
}

/**
 * Create slides from document sections
 * @param sections - Document sections
 * @param maxSlides - Maximum number of slides
 * @returns Array of slides
 */
function createSlidesFromSections(
  sections: Array<{ title: string; content: string; keyPoints: string[] }>,
  maxSlides: number
): SlideDeck['slides'] {
  const slides: SlideDeck['slides'] = [];
  let slideIndex = 1;

  // Title slide
  if (sections.length > 0 && slideIndex <= maxSlides) {
    slides.push({
      id: `slide-${slideIndex}`,
      title: sections[0].title,
      bullets: [
        'Welcome to the presentation',
        `Based on ${sections.length} sections of content`,
        'Key insights and takeaways',
      ],
      suggestedImagePrompt: `A professional presentation title slide for "${sections[0].title}"`,
      speakerNotes: 'Introduction and overview of the presentation',
    });
    slideIndex++;
  }

  // Content slides (1-2 slides per section)
  for (const section of sections) {
    if (slideIndex > maxSlides) break;

    // Create slide for this section
    const bullets =
      section.keyPoints.length > 0
        ? section.keyPoints.slice(0, 5) // Max 5 bullets
        : [section.content.substring(0, 100) + '...'];

    slides.push({
      id: `slide-${slideIndex}`,
      title: section.title,
      bullets,
      suggestedImagePrompt: `An illustrative diagram for "${section.title}"`,
      speakerNotes: `Detailed explanation of ${section.title}`,
    });
    slideIndex++;

    // Create second slide if section has more content and we have space
    if (section.content.length > 200 && slideIndex <= maxSlides) {
      const remainingContent = section.content.substring(200);
      const additionalBullets = remainingContent
        .split(/[.!?]+/)
        .slice(0, 3)
        .map(s => s.trim())
        .filter(s => s.length > 10);

      if (additionalBullets.length > 0) {
        slides.push({
          id: `slide-${slideIndex}`,
          title: `${section.title} (Continued)`,
          bullets: additionalBullets,
          suggestedImagePrompt: `A continuation slide for "${section.title}" with supporting visuals`,
          speakerNotes: `Additional details and examples for ${section.title}`,
        });
        slideIndex++;
      }
    }
  }

  // Summary slide
  if (slideIndex <= maxSlides) {
    slides.push({
      id: `slide-${slideIndex}`,
      title: 'Summary & Next Steps',
      bullets: [
        'Key takeaways from this presentation',
        'Questions and discussion',
        'Thank you for your attention',
      ],
      suggestedImagePrompt:
        'A summary slide with key points and call-to-action elements',
      speakerNotes: 'Wrap up and encourage audience engagement',
    });
  }

  return slides;
}

/**
 * Generate mock slide deck for testing
 * @returns SlideDeck
 */
/** TEMP STUB — replace with real implementation */
export const slideGenerator = {
  generate: generateSlides,
  generateMock: generateMockSlideDeck,
};

export function generateMockSlideDeck(): SlideDeck {
  return {
    title: 'Introduction to DocCraft-AI',
    theme: 'business',
    slides: [
      {
        id: 'slide-1',
        title: 'Introduction to DocCraft-AI',
        bullets: [
          'Welcome to our presentation',
          'Exploring AI-powered content creation',
          'Transforming document workflows',
        ],
        suggestedImagePrompt:
          'A professional presentation slide showing AI-powered content creation tools with a modern interface',
        speakerNotes: 'Introduction and overview of DocCraft-AI platform',
      },
      {
        id: 'slide-2',
        title: 'Key Features',
        bullets: [
          'Document analysis and enhancement',
          'AI-powered writing assistance',
          'Real-time collaboration tools',
          'Advanced analytics and insights',
        ],
        suggestedImagePrompt:
          'Design a slide showing key features with icons and brief descriptions in a clean layout',
        speakerNotes:
          'Detailed explanation of each key feature and its benefits',
      },
      {
        id: 'slide-3',
        title: 'Benefits & ROI',
        bullets: [
          '50% faster content creation',
          'Improved content quality',
          'Reduced revision cycles',
          'Enhanced team productivity',
        ],
        suggestedImagePrompt:
          'Create a slide showing benefits with charts and metrics in a business presentation style',
        speakerNotes:
          'Quantify the benefits and return on investment for stakeholders',
      },
      {
        id: 'slide-4',
        title: 'Next Steps',
        bullets: [
          'Schedule a demo',
          'Start your free trial',
          'Contact our team',
          'Join our community',
        ],
        suggestedImagePrompt:
          'Design a call-to-action slide with clear next steps and contact information',
        speakerNotes:
          'Clear next steps and contact information for interested parties',
      },
    ],
  };
}

// TODO: Semantic chunking with embeddings (Supabase vector search)
// TODO: AI-driven slide formatting styles (business, academic, creative)
// TODO: Integrate with LLM for intelligent document analysis
// TODO: Use MCP metadata to attach tier/role to generated slides
