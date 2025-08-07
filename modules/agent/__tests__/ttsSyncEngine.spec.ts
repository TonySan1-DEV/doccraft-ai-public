/*
role: qa-engineer,
tier: Pro,
file: "modules/agent/__tests__/ttsSyncEngine.spec.ts",
allowedActions: ["test", "validate"],
theme: "doc2video_unit"
*/

import {
  generateTTSNarration,
  generateMockTTSNarration,
  type TTSNarration,
} from '../services/ttsSyncEngine';
import { generateMockNarratedSlideDeck } from '../services/scriptGenerator';

describe('ttsSyncEngine', () => {
  const mockNarratedDeck = generateMockNarratedSlideDeck();

  describe('generateTTSNarration', () => {
    it('generates TTS narration timeline', async () => {
      const tts = await generateTTSNarration(mockNarratedDeck, {
        voice: 'default',
      });

      expect(tts).toBeDefined();
      expect(tts.timeline).toBeDefined();
      expect(Array.isArray(tts.timeline)).toBe(true);
      expect(tts.timeline.length).toBe(mockNarratedDeck.slides.length);
      expect(tts.timeline[0].slideId).toBe('slide-1');
      expect(tts.audioFileUrl).toContain('.mp3');
    });

    it('contains timeline entries for each slide', async () => {
      const tts = await generateTTSNarration(mockNarratedDeck);

      expect(tts.timeline.length).toBe(mockNarratedDeck.slides.length);

      tts.timeline.forEach((entry, index) => {
        expect(entry.slideId).toBe(mockNarratedDeck.slides[index].id);
        expect(entry.narration).toBe(mockNarratedDeck.slides[index].narration);
        expect(entry.startTime).toBeDefined();
        expect(entry.endTime).toBeDefined();
        expect(entry.endTime).toBeGreaterThan(entry.startTime);
      });
    });

    it('generates audio file URLs', async () => {
      const tts = await generateTTSNarration(mockNarratedDeck);

      expect(tts.audioFileUrl).toBeDefined();
      expect(typeof tts.audioFileUrl).toBe('string');
      expect(tts.audioFileUrl).toContain('/mock/audio/');
      expect(tts.audioFileUrl).toContain('.mp3');
    });

    it('handles different voice options', async () => {
      const tts1 = await generateTTSNarration(mockNarratedDeck, {
        voice: 'en-US-JennyNeural',
      });
      const tts2 = await generateTTSNarration(mockNarratedDeck, {
        voice: 'en-US-GuyNeural',
      });

      expect(tts1.audioFileUrl).toContain('voice=en-US-JennyNeural');
      expect(tts2.audioFileUrl).toContain('voice=en-US-GuyNeural');
      expect(tts1.modelUsed).toBe('en-US-JennyNeural');
      expect(tts2.modelUsed).toBe('en-US-GuyNeural');
    });

    it('handles different speed options', async () => {
      const tts1 = await generateTTSNarration(mockNarratedDeck, { speed: 0.8 });
      const tts2 = await generateTTSNarration(mockNarratedDeck, { speed: 1.2 });

      expect(tts1.audioFileUrl).toContain('speed=0.8');
      expect(tts2.audioFileUrl).toContain('speed=1.2');

      // Faster speed should result in shorter durations
      const totalDuration1 = tts1.timeline[tts1.timeline.length - 1].endTime;
      const totalDuration2 = tts2.timeline[tts2.timeline.length - 1].endTime;
      expect(totalDuration1).toBeGreaterThan(totalDuration2);
    });

    it('handles different language options', async () => {
      const tts = await generateTTSNarration(mockNarratedDeck, {
        language: 'es',
      });

      expect(tts.audioFileUrl).toContain('language=es');
    });

    it('calculates duration based on word count', async () => {
      const tts = await generateTTSNarration(mockNarratedDeck);

      tts.timeline.forEach(entry => {
        const wordCount = entry.narration.split(/\s+/).length;
        const duration = entry.endTime - entry.startTime;

        // Minimum 2 seconds per slide
        expect(duration).toBeGreaterThanOrEqual(2);

        // Rough calculation: 150 words per minute
        const expectedDuration = Math.max(2, (wordCount / 150) * 60);
        expect(duration).toBeCloseTo(expectedDuration, 0);
      });
    });

    it('ensures timeline continuity', async () => {
      const tts = await generateTTSNarration(mockNarratedDeck);

      for (let i = 0; i < tts.timeline.length - 1; i++) {
        const currentEntry = tts.timeline[i];
        const nextEntry = tts.timeline[i + 1];

        expect(nextEntry.startTime).toBe(currentEntry.endTime);
      }
    });

    it('handles empty narrated deck', async () => {
      const emptyDeck = { ...mockNarratedDeck, slides: [] };

      await expect(generateTTSNarration(emptyDeck)).rejects.toThrow(
        'Narrated slide deck is required and must contain slides'
      );
    });

    it('handles null narrated deck', async () => {
      await expect(generateTTSNarration(null as any)).rejects.toThrow();
    });

    it('handles undefined narrated deck', async () => {
      await expect(generateTTSNarration(undefined as any)).rejects.toThrow();
    });

    it('handles slides without narration', async () => {
      const deckWithoutNarration = {
        ...mockNarratedDeck,
        slides: mockNarratedDeck.slides.map(slide => ({
          ...slide,
          narration: undefined,
        })),
      };

      const tts = await generateTTSNarration(deckWithoutNarration);

      // Should skip slides without narration
      const slidesWithNarration = mockNarratedDeck.slides.filter(
        slide => slide.narration
      );
      expect(tts.timeline.length).toBe(slidesWithNarration.length);
    });

    it('handles empty narration strings', async () => {
      const deckWithEmptyNarration = {
        ...mockNarratedDeck,
        slides: mockNarratedDeck.slides.map(slide => ({
          ...slide,
          narration: '',
        })),
      };

      const tts = await generateTTSNarration(deckWithEmptyNarration);

      // Should skip slides with empty narration
      expect(tts.timeline.length).toBe(0);
    });

    it('uses default voice when not specified', async () => {
      const tts = await generateTTSNarration(mockNarratedDeck);

      expect(tts.modelUsed).toBe('en-US-JennyNeural');
      expect(tts.audioFileUrl).toContain('voice=en-US-JennyNeural');
    });

    it('uses default speed when not specified', async () => {
      const tts = await generateTTSNarration(mockNarratedDeck);

      expect(tts.audioFileUrl).toContain('speed=1.0');
    });

    it('uses default language when not specified', async () => {
      const tts = await generateTTSNarration(mockNarratedDeck);

      expect(tts.audioFileUrl).toContain('language=en');
    });

    it('generates unique timestamps for audio file URLs', async () => {
      const tts1 = await generateTTSNarration(mockNarratedDeck);
      const tts2 = await generateTTSNarration(mockNarratedDeck);

      expect(tts1.audioFileUrl).not.toBe(tts2.audioFileUrl);
    });

    it('handles special characters in narration', async () => {
      const specialDeck = {
        ...mockNarratedDeck,
        slides: [
          {
            id: 'slide-1',
            title: 'Special Characters Test',
            bullets: ['Test'],
            suggestedImagePrompt: 'Test',
            speakerNotes: 'Test',
            narration:
              'This narration contains special characters: &, <, >, ", \'. It should be handled properly.',
          },
        ],
      };

      const tts = await generateTTSNarration(specialDeck);

      expect(tts.timeline.length).toBe(1);
      expect(tts.timeline[0].narration).toContain('special characters');
    });

    it('handles very long narration', async () => {
      const longNarration =
        'This is a very long narration that contains many words and should result in a longer duration. '.repeat(
          10
        );
      const longDeck = {
        ...mockNarratedDeck,
        slides: [
          {
            id: 'slide-1',
            title: 'Long Narration Test',
            bullets: ['Test'],
            suggestedImagePrompt: 'Test',
            speakerNotes: 'Test',
            narration: longNarration,
          },
        ],
      };

      const tts = await generateTTSNarration(longDeck);

      expect(tts.timeline.length).toBe(1);
      const duration = tts.timeline[0].endTime - tts.timeline[0].startTime;
      expect(duration).toBeGreaterThan(10); // Should be longer due to more words
    });

    it('handles very short narration', async () => {
      const shortDeck = {
        ...mockNarratedDeck,
        slides: [
          {
            id: 'slide-1',
            title: 'Short Narration Test',
            bullets: ['Test'],
            suggestedImagePrompt: 'Test',
            speakerNotes: 'Test',
            narration: 'Short.',
          },
        ],
      };

      const tts = await generateTTSNarration(shortDeck);

      expect(tts.timeline.length).toBe(1);
      const duration = tts.timeline[0].endTime - tts.timeline[0].startTime;
      expect(duration).toBeGreaterThanOrEqual(2); // Minimum 2 seconds
    });
  });

  describe('generateMockTTSNarration', () => {
    it('generates a valid mock TTS narration', () => {
      const mockTTS = generateMockTTSNarration();

      expect(mockTTS).toBeDefined();
      expect(mockTTS.audioFileUrl).toBeDefined();
      expect(mockTTS.audioFileUrl).toContain('/mock/audio/');
      expect(mockTTS.audioFileUrl).toContain('.mp3');
      expect(mockTTS.modelUsed).toBe('en-US-JennyNeural');
      expect(Array.isArray(mockTTS.timeline)).toBe(true);
      expect(mockTTS.timeline.length).toBe(4);
    });

    it('includes timeline entries for each slide', () => {
      const mockTTS = generateMockTTSNarration();

      mockTTS.timeline.forEach((entry, index) => {
        expect(entry.slideId).toBe(`slide-${index + 1}`);
        expect(entry.narration).toBeDefined();
        expect(entry.narration.length).toBeGreaterThan(0);
        expect(entry.startTime).toBeDefined();
        expect(entry.endTime).toBeDefined();
        expect(entry.endTime).toBeGreaterThan(entry.startTime);
      });
    });

    it('has realistic timeline durations', () => {
      const mockTTS = generateMockTTSNarration();

      mockTTS.timeline.forEach(entry => {
        const duration = entry.endTime - entry.startTime;
        expect(duration).toBeGreaterThanOrEqual(2); // Minimum 2 seconds
        expect(duration).toBeLessThanOrEqual(30); // Reasonable maximum
      });
    });

    it('has continuous timeline', () => {
      const mockTTS = generateMockTTSNarration();

      for (let i = 0; i < mockTTS.timeline.length - 1; i++) {
        const currentEntry = mockTTS.timeline[i];
        const nextEntry = mockTTS.timeline[i + 1];

        expect(nextEntry.startTime).toBe(currentEntry.endTime);
      }
    });

    it('has realistic narration content', () => {
      const mockTTS = generateMockTTSNarration();

      expect(mockTTS.timeline[0].narration).toContain(
        'Welcome to our presentation'
      );
      expect(mockTTS.timeline[0].narration).toContain('DocCraft-AI');
      expect(mockTTS.timeline[1].narration).toContain(
        "Let's talk about the key features"
      );
    });

    it('includes proper audio file URL parameters', () => {
      const mockTTS = generateMockTTSNarration();

      expect(mockTTS.audioFileUrl).toContain('voice=en-US-JennyNeural');
      expect(mockTTS.audioFileUrl).toContain('language=en');
      expect(mockTTS.audioFileUrl).toContain('speed=1.0');
    });
  });

  describe('error handling', () => {
    it('throws error for null input', async () => {
      await expect(generateTTSNarration(null as any)).rejects.toThrow();
    });

    it('throws error for undefined input', async () => {
      await expect(generateTTSNarration(undefined as any)).rejects.toThrow();
    });

    it('throws error for narrated deck without slides property', async () => {
      const invalidDeck = { title: 'Test', theme: 'business' };

      await expect(generateTTSNarration(invalidDeck as any)).rejects.toThrow(
        'Narrated slide deck is required and must contain slides'
      );
    });

    it('handles malformed options gracefully', async () => {
      const tts = await generateTTSNarration(mockNarratedDeck, {
        voice: 'invalid' as any,
      });

      expect(tts.timeline.length).toBeGreaterThan(0);
      expect(tts.audioFileUrl).toBeDefined();
    });

    it('handles negative speed values', async () => {
      const tts = await generateTTSNarration(mockNarratedDeck, { speed: -1 });

      expect(tts.timeline.length).toBeGreaterThan(0);
      // Should use minimum duration despite negative speed
      tts.timeline.forEach(entry => {
        const duration = entry.endTime - entry.startTime;
        expect(duration).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('performance', () => {
    it('handles large narrated decks efficiently', async () => {
      const largeDeck = {
        ...mockNarratedDeck,
        slides: Array.from({ length: 50 }, (_, i) => ({
          id: `slide-${i + 1}`,
          title: `Slide ${i + 1}`,
          bullets: [`Point ${i + 1}`],
          suggestedImagePrompt: `Image for slide ${i + 1}`,
          speakerNotes: `Notes for slide ${i + 1}`,
          narration: `This is narration for slide ${i + 1} with some additional content to make it longer.`,
        })),
      };

      const startTime = Date.now();
      const tts = await generateTTSNarration(largeDeck);
      const endTime = Date.now();

      expect(tts.timeline.length).toBe(50);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('TODO: Future enhancements', () => {
    it('should integrate with real TTS API', () => {
      // TODO: Test OpenAI TTS, Azure, ElevenLabs integration
      expect(true).toBe(true);
    });

    it('should add caching for audio files', () => {
      // TODO: Test audio file caching mechanism
      expect(true).toBe(true);
    });

    it('should support multi-language/voice customization', () => {
      // TODO: Test multi-language and voice customization
      expect(true).toBe(true);
    });

    it('should attach MCP metadata for governance', () => {
      // TODO: Test MCP metadata integration
      expect(true).toBe(true);
    });
  });
});
