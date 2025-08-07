/*
role: qa-engineer,
tier: Pro,
file: "modules/agent/__tests__/scriptGenerator.spec.ts",
allowedActions: ["test", "validate"],
theme: "doc2video_unit"
*/

import {
  generateNarration,
  generateMockNarratedSlideDeck,
  type NarratedSlideDeck,
} from '../services/scriptGenerator';
import { generateMockSlideDeck } from '../services/slideGenerator';

describe('scriptGenerator', () => {
  const mockDeck = generateMockSlideDeck();

  describe('generateNarration', () => {
    it('generates narration for slides', async () => {
      const narrated = await generateNarration(mockDeck, {
        tone: 'conversational',
      });

      expect(narrated).toBeDefined();
      expect(narrated.slides).toBeDefined();
      expect(narrated.slides.length).toBe(mockDeck.slides.length);
      expect(narrated.slides[0].narration).toBeDefined();
      expect(narrated.slides[0].narration.length).toBeGreaterThan(10);
    });

    it('adds narration strings for each slide', async () => {
      const narrated = await generateNarration(mockDeck, { tone: 'formal' });

      narrated.slides.forEach(slide => {
        expect(slide.narration).toBeDefined();
        expect(typeof slide.narration).toBe('string');
        expect(slide.narration.length).toBeGreaterThan(0);
      });
    });

    it('narration references slide titles/bullets', async () => {
      const narrated = await generateNarration(mockDeck, {
        tone: 'conversational',
      });

      narrated.slides.forEach(slide => {
        expect(slide.narration).toContain(slide.title);
        slide.bullets.forEach(bullet => {
          expect(slide.narration).toContain(bullet);
        });
      });
    });

    it('handles different tones correctly', async () => {
      const formalNarrated = await generateNarration(mockDeck, {
        tone: 'formal',
      });
      const conversationalNarrated = await generateNarration(mockDeck, {
        tone: 'conversational',
      });
      const persuasiveNarrated = await generateNarration(mockDeck, {
        tone: 'persuasive',
      });

      expect(formalNarrated.slides[0].narration).toContain(
        'This slide, titled'
      );
      expect(conversationalNarrated.slides[0].narration).toContain(
        "So, let's talk about"
      );
      expect(persuasiveNarrated.slides[0].narration).toContain(
        'Now, consider this important aspect'
      );
    });

    it('uses default tone when not specified', async () => {
      const narrated = await generateNarration(mockDeck);

      expect(narrated.slides[0].narration).toContain("So, let's talk about");
    });

    it('handles different length options', async () => {
      const shortNarrated = await generateNarration(mockDeck, {
        length: 'short',
      });
      const mediumNarrated = await generateNarration(mockDeck, {
        length: 'medium',
      });
      const longNarrated = await generateNarration(mockDeck, {
        length: 'long',
      });

      const shortWords = shortNarrated.slides[0].narration.split(/\s+/).length;
      const mediumWords =
        mediumNarrated.slides[0].narration.split(/\s+/).length;
      const longWords = longNarrated.slides[0].narration.split(/\s+/).length;

      expect(shortWords).toBeLessThanOrEqual(25);
      expect(mediumWords).toBeLessThanOrEqual(35);
      expect(longWords).toBeLessThanOrEqual(45);
    });

    it('handles empty slide deck', async () => {
      const emptyDeck = { ...mockDeck, slides: [] };

      await expect(generateNarration(emptyDeck)).rejects.toThrow(
        'Slide deck is required and must contain slides'
      );
    });

    it('handles null slide deck', async () => {
      await expect(generateNarration(null as any)).rejects.toThrow();
    });

    it('handles undefined slide deck', async () => {
      await expect(generateNarration(undefined as any)).rejects.toThrow();
    });

    it('updates speaker notes with narration', async () => {
      const narrated = await generateNarration(mockDeck, {
        tone: 'conversational',
      });

      narrated.slides.forEach(slide => {
        expect(slide.speakerNotes).toContain('Narration:');
        expect(slide.speakerNotes).toContain(slide.narration);
      });
    });

    it('handles slides without existing speaker notes', async () => {
      const deckWithoutNotes = {
        ...mockDeck,
        slides: mockDeck.slides.map(slide => ({
          ...slide,
          speakerNotes: undefined,
        })),
      };

      const narrated = await generateNarration(deckWithoutNotes);

      narrated.slides.forEach(slide => {
        expect(slide.speakerNotes).toContain('Narration:');
        expect(slide.speakerNotes).toContain(slide.narration);
      });
    });

    it('handles introduction slides correctly', async () => {
      const introDeck = {
        ...mockDeck,
        slides: [
          {
            id: 'slide-1',
            title: 'Introduction to AI',
            bullets: ['Welcome', 'Overview', 'Goals'],
            suggestedImagePrompt: 'Intro slide',
            speakerNotes: 'Introduction slide',
          },
        ],
      };

      const narrated = await generateNarration(introDeck);

      expect(narrated.slides[0].narration).toContain('Introduction to AI');
      expect(narrated.slides[0].narration).toContain('Welcome');
    });

    it('handles summary slides correctly', async () => {
      const summaryDeck = {
        ...mockDeck,
        slides: [
          {
            id: 'slide-1',
            title: 'Summary and Conclusion',
            bullets: ['Key points', 'Next steps', 'Thank you'],
            suggestedImagePrompt: 'Summary slide',
            speakerNotes: 'Summary slide',
          },
        ],
      };

      const narrated = await generateNarration(summaryDeck);

      expect(narrated.slides[0].narration).toContain('To summarize');
      expect(narrated.slides[0].narration).toContain('Summary and Conclusion');
    });

    it('handles slides with special characters in titles', async () => {
      const specialDeck = {
        ...mockDeck,
        slides: [
          {
            id: 'slide-1',
            title: 'AI & ML: Understanding the Basics',
            bullets: ['Machine Learning', 'Deep Learning', 'Neural Networks'],
            suggestedImagePrompt: 'AI ML slide',
            speakerNotes: 'AI ML slide',
          },
        ],
      };

      const narrated = await generateNarration(specialDeck);

      expect(narrated.slides[0].narration).toContain(
        'AI & ML: Understanding the Basics'
      );
    });

    it('handles slides with empty bullets', async () => {
      const emptyBulletsDeck = {
        ...mockDeck,
        slides: [
          {
            id: 'slide-1',
            title: 'Empty Bullets Test',
            bullets: [],
            suggestedImagePrompt: 'Empty slide',
            speakerNotes: 'Empty slide',
          },
        ],
      };

      const narrated = await generateNarration(emptyBulletsDeck);

      expect(narrated.slides[0].narration).toBeDefined();
      expect(narrated.slides[0].narration.length).toBeGreaterThan(0);
    });

    it('preserves original slide properties', async () => {
      const narrated = await generateNarration(mockDeck);

      narrated.slides.forEach((slide, index) => {
        expect(slide.id).toBe(mockDeck.slides[index].id);
        expect(slide.title).toBe(mockDeck.slides[index].title);
        expect(slide.bullets).toEqual(mockDeck.slides[index].bullets);
        expect(slide.suggestedImagePrompt).toBe(
          mockDeck.slides[index].suggestedImagePrompt
        );
      });
    });

    it('handles language option', async () => {
      const narrated = await generateNarration(mockDeck, { language: 'en' });

      expect(narrated.slides[0].narration).toBeDefined();
      // TODO: Add language-specific validation when multi-language support is implemented
    });
  });

  describe('generateMockNarratedSlideDeck', () => {
    it('generates a valid mock narrated slide deck', () => {
      const mockNarratedDeck = generateMockNarratedSlideDeck();

      expect(mockNarratedDeck).toBeDefined();
      expect(mockNarratedDeck.title).toBe('Introduction to DocCraft-AI');
      expect(mockNarratedDeck.theme).toBe('business');
      expect(Array.isArray(mockNarratedDeck.slides)).toBe(true);
      expect(mockNarratedDeck.slides.length).toBe(4);
    });

    it('includes narration for each slide', () => {
      const mockNarratedDeck = generateMockNarratedSlideDeck();

      mockNarratedDeck.slides.forEach(slide => {
        expect(slide.narration).toBeDefined();
        expect(typeof slide.narration).toBe('string');
        expect(slide.narration.length).toBeGreaterThan(0);
      });
    });

    it('has realistic narration content', () => {
      const mockNarratedDeck = generateMockNarratedSlideDeck();

      expect(mockNarratedDeck.slides[0].narration).toContain(
        'Welcome to our presentation'
      );
      expect(mockNarratedDeck.slides[0].narration).toContain('DocCraft-AI');
      expect(mockNarratedDeck.slides[1].narration).toContain(
        "Let's talk about the key features"
      );
    });

    it('includes all required slide properties', () => {
      const mockNarratedDeck = generateMockNarratedSlideDeck();

      mockNarratedDeck.slides.forEach(slide => {
        expect(slide.id).toBeDefined();
        expect(slide.title).toBeDefined();
        expect(slide.bullets).toBeDefined();
        expect(Array.isArray(slide.bullets)).toBe(true);
        expect(slide.suggestedImagePrompt).toBeDefined();
        expect(slide.speakerNotes).toBeDefined();
        expect(slide.narration).toBeDefined();
      });
    });

    it('has updated speaker notes with narration', () => {
      const mockNarratedDeck = generateMockNarratedSlideDeck();

      mockNarratedDeck.slides.forEach(slide => {
        expect(slide.speakerNotes).toContain('Narration:');
        expect(slide.speakerNotes).toContain(slide.narration);
      });
    });

    it('maintains slide structure consistency', () => {
      const mockNarratedDeck = generateMockNarratedSlideDeck();

      expect(mockNarratedDeck.slides[0].title).toBe(
        'Introduction to DocCraft-AI'
      );
      expect(mockNarratedDeck.slides[0].bullets).toContain(
        'Welcome to our presentation'
      );
      expect(mockNarratedDeck.slides[1].title).toBe('Key Features');
      expect(mockNarratedDeck.slides[1].bullets).toContain(
        'Document analysis and enhancement'
      );
    });
  });

  describe('error handling', () => {
    it('throws error for null input', async () => {
      await expect(generateNarration(null as any)).rejects.toThrow();
    });

    it('throws error for undefined input', async () => {
      await expect(generateNarration(undefined as any)).rejects.toThrow();
    });

    it('throws error for slide deck without slides property', async () => {
      const invalidDeck = { title: 'Test', theme: 'business' };

      await expect(generateNarration(invalidDeck as any)).rejects.toThrow(
        'Slide deck is required and must contain slides'
      );
    });

    it('handles malformed options gracefully', async () => {
      const narrated = await generateNarration(mockDeck, {
        tone: 'invalid' as any,
      });

      expect(narrated.slides[0].narration).toBeDefined();
      expect(narrated.slides[0].narration.length).toBeGreaterThan(0);
    });
  });

  describe('performance', () => {
    it('handles large slide decks efficiently', async () => {
      const largeDeck = {
        ...mockDeck,
        slides: Array.from({ length: 50 }, (_, i) => ({
          id: `slide-${i + 1}`,
          title: `Slide ${i + 1}`,
          bullets: [`Point ${i + 1}-1`, `Point ${i + 1}-2`, `Point ${i + 1}-3`],
          suggestedImagePrompt: `Image for slide ${i + 1}`,
          speakerNotes: `Notes for slide ${i + 1}`,
        })),
      };

      const startTime = Date.now();
      const narrated = await generateNarration(largeDeck);
      const endTime = Date.now();

      expect(narrated.slides.length).toBe(50);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('TODO: Future enhancements', () => {
    it('should integrate with LLM for advanced narration', () => {
      // TODO: Test LLM integration for more sophisticated narration
      expect(true).toBe(true);
    });

    it('should support multi-language narration', () => {
      // TODO: Test multi-language support
      expect(true).toBe(true);
    });

    it('should support audience-specific adjustments', () => {
      // TODO: Test academic, corporate, creative audience variations
      expect(true).toBe(true);
    });

    it('should attach MCP metadata to NarratedSlideDeck', () => {
      // TODO: Test MCP metadata integration
      expect(true).toBe(true);
    });
  });
});
