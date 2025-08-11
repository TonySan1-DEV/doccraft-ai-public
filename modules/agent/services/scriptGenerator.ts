/**
 * @fileoverview Script Generator Service
 * @module modules/agent/services/scriptGenerator
 *
 * MCP Context Block:
 * - role: "ai-engineer"
 * - tier: "Pro"
 * - file: "modules/agent/services/scriptGenerator.ts"
 * - allowedActions: ["generate", "narration", "script"]
 * - theme: "doc2video_script"
 */

import { SlideDeck } from './slideGenerator';

/**
 * Extended slide type with narration
 */
type Slide = {
  id: string;
  title: string;
  bullets: string[];
  suggestedImagePrompt?: string;
  speakerNotes?: string;
  narration?: string; // Optional narration property
};

/**
 * Narrated slide deck with narration for each slide
 */
export type NarratedSlideDeck = SlideDeck & {
  slides: (Slide & { narration: string })[];
};

/**
 * Generate narration for slide deck
 * @param slideDeck - Input slide deck
 * @param options - Generation options
 * @returns Promise<NarratedSlideDeck>
 */
export async function generateNarration(
  slideDeck: SlideDeck,
  options?: {
    tone?: 'formal' | 'conversational' | 'persuasive';
    length?: 'short' | 'medium' | 'long';
    language?: string;
    genre?: string;
    genreContext?: {
      category: 'fiction' | 'nonfiction' | 'special';
      subgenre?: string;
      targetAudience?: string[];
    };
  }
): Promise<NarratedSlideDeck> {
  try {
    // Input validation: ensure slideDeck is not empty
    if (!slideDeck || !slideDeck.slides || slideDeck.slides.length === 0) {
      throw new Error('Slide deck is required and must contain slides');
    }

    console.log('📝 Generating narration for slide deck...');

    // Generate narration for each slide
    const narratedSlides = slideDeck.slides.map(slide => {
      const narration = generateSlideNarration(slide, options);

      // Append narration to speakerNotes for PowerPoint compatibility
      const updatedSpeakerNotes = slide.speakerNotes
        ? `${slide.speakerNotes}\n\nNarration: ${narration}`
        : `Narration: ${narration}`;

      return {
        ...slide,
        narration,
        speakerNotes: updatedSpeakerNotes,
      };
    });

    // Create narrated slide deck
    const narratedSlideDeck: NarratedSlideDeck = {
      ...slideDeck,
      slides: narratedSlides,
    };

    console.log(`✅ Generated narration for ${narratedSlides.length} slides`);
    return narratedSlideDeck;
  } catch (error) {
    console.error('Narration generation error:', error);
    throw new Error(
      `Failed to generate narration: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Generate narration for a single slide
 * @param slide - Slide data
 * @param options - Generation options
 * @returns string
 */
function generateSlideNarration(
  slide: Slide,
  options?: {
    tone?: 'formal' | 'conversational' | 'persuasive';
    length?: 'short' | 'medium' | 'long';
    language?: string;
    genre?: string;
    genreContext?: {
      category: 'fiction' | 'nonfiction' | 'special';
      subgenre?: string;
      targetAudience?: string[];
    };
  }
): string {
  const tone = options?.tone || 'conversational';
  const length = options?.length || 'medium';
  // const _language = options?.language || 'en'; // TODO: Implement multi-language support

  // TODO: Advanced narration with LLM (OpenAI/Claude integration)
  // TODO: Multi-language support
  // TODO: Audience-specific adjustments (academic, corporate, creative)

  // Stub implementation: Create basic narration
  const baseNarration = createBaseNarration(
    slide,
    tone,
    options?.genre,
    options?.genreContext
  );
  const adjustedNarration = adjustNarrationLength(baseNarration, length);

  return adjustedNarration;
}

/**
 * Create base narration text
 * @param slide - Slide data
 * @param tone - Narration tone
 * @returns string
 */
function createBaseNarration(
  slide: Slide,
  tone: string,
  genre?: string,
  genreContext?: {
    category: 'fiction' | 'nonfiction' | 'special';
    subgenre?: string;
    targetAudience?: string[];
  }
): string {
  const { title, bullets } = slide;

  // Different tone templates
  const toneTemplates = {
    formal: {
      intro: `This slide, titled "${title}", highlights:`,
      content: bullets.join(', '),
      outro: `These points provide a comprehensive overview of ${title}.`,
    },
    conversational: {
      intro: `So, let's talk about ${title}.`,
      content: bullets.join(', and '),
      outro: `That covers the main points about ${title}.`,
    },
    persuasive: {
      intro: `Now, consider this important aspect: ${title}.`,
      content: bullets.join(' - which means '),
      outro: `These compelling points demonstrate the value of ${title}.`,
    },
  };

  const template =
    toneTemplates[tone as keyof typeof toneTemplates] ||
    toneTemplates.conversational;

  // Genre-specific adjustments
  if (genre && genreContext) {
    const { category, subgenre } = genreContext;

    if (category === 'fiction') {
      // Fiction-specific narration style
      template.intro = `In this ${subgenre || 'story'}, we explore ${title}.`;
      template.content = bullets.join(' - each revealing ');
      template.outro = `These elements weave together to create a compelling ${subgenre || 'narrative'}.`;
    } else if (category === 'nonfiction') {
      // Nonfiction-specific narration style
      template.intro = `Let's examine ${title} from a ${subgenre || 'professional'} perspective.`;
      template.content = bullets.join(' - demonstrating ');
      template.outro = `These insights provide valuable ${subgenre || 'knowledge'} for our audience.`;
    }
  }

  // Handle different slide types
  if (
    title.toLowerCase().includes('introduction') ||
    title.toLowerCase().includes('welcome')
  ) {
    return `${template.intro} ${template.content}. ${template.outro}`;
  } else if (
    title.toLowerCase().includes('summary') ||
    title.toLowerCase().includes('conclusion')
  ) {
    return `To summarize, ${template.content}. ${template.outro}`;
  } else {
    return `${template.intro} ${template.content}. ${template.outro}`;
  }
}

/**
 * Adjust narration length based on option
 * @param narration - Base narration text
 * @param length - Desired length
 * @returns string
 */
function adjustNarrationLength(narration: string, length: string): string {
  const words = narration.split(/\s+/);

  switch (length) {
    case 'short':
      // ~20 words
      return words.slice(0, 20).join(' ') + (words.length > 20 ? '...' : '');
    case 'medium':
      // ~30 words (default)
      return words.slice(0, 30).join(' ') + (words.length > 30 ? '...' : '');
    case 'long':
      // ~40 words
      return words.slice(0, 40).join(' ') + (words.length > 40 ? '...' : '');
    default:
      return narration;
  }
}

/**
 * Generate mock narrated slide deck for testing
 * @returns NarratedSlideDeck
 */
/** TEMP STUB — replace with real implementation */
export const scriptGenerator = {
  generate: generateNarration,
  generateMock: generateMockNarratedSlideDeck,
};

export function generateMockNarratedSlideDeck(): NarratedSlideDeck {
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
        narration:
          "Welcome to our presentation on DocCraft-AI. Today we'll explore AI-powered content creation and how it's transforming document workflows.",
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
        narration:
          "Let's talk about the key features. DocCraft-AI offers document analysis and enhancement, AI-powered writing assistance, real-time collaboration tools, and advanced analytics and insights.",
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
        narration:
          'Now, consider this important aspect: Benefits and ROI. We see 50% faster content creation, improved content quality, reduced revision cycles, and enhanced team productivity.',
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
        narration:
          'To summarize, here are your next steps: schedule a demo, start your free trial, contact our team, and join our community. These compelling points demonstrate the value of taking action.',
      },
    ],
  };
}

// TODO: Advanced narration with LLM (OpenAI/Claude integration)
// TODO: Multi-language support
// TODO: Audience-specific adjustments (academic, corporate, creative)
// TODO: Attach MCP metadata (role, tier, theme) to NarratedSlideDeck
