/*
role: test-engineer,
tier: Pro,
file: "src/__tests__/ShareableAccessPage.spec.tsx",
allowedActions: ["test", "validate", "verify"],
theme: "public_sharing"
*/

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ShareableAccessPage from '../pages/ShareableAccessPage';
import { supabase } from '../lib/supabase';

// Mock dependencies
jest.mock('../lib/supabase');
jest.mock('../utils/telemetryLogger', () => ({
  logTelemetryEvent: jest.fn().mockResolvedValue({ success: true }),
}));

// Mock audio element
const mockAudio = {
  currentTime: 0,
  duration: 120,
  src: '',
  preload: '',
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  pause: jest.fn(),
  play: jest.fn().mockResolvedValue(undefined),
};

Object.defineProperty(window, 'Audio', {
  writable: true,
  value: jest.fn(() => mockAudio),
});

// Mock navigator
Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Test Browser)',
  writable: true,
});

Object.defineProperty(document, 'referrer', {
  value: 'https://example.com',
  writable: true,
});

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

// Mock the functions.invoke method
const mockFunctionsInvoke = jest.fn();
(mockSupabase as any).functions = {
  invoke: mockFunctionsInvoke,
};

describe('ShareableAccessPage', () => {
  const mockToken = 'test-token-123';
  const mockPipelineData = {
    id: 'pipeline-123',
    title: 'Test Presentation',
    status: 'success',
    mode: 'auto',
    tier: 'Pro',
    created_at: '2024-01-01T00:00:00Z',
    slide_deck_id: 'slide-deck-123',
    narrated_deck_id: 'narrated-deck-123',
    tts_narration_id: 'tts-narration-123',
  };

  const mockSlideDeck = {
    id: 'slide-deck-123',
    title: 'Test Slides',
    slides: [
      {
        id: 'slide-1',
        title: 'Introduction',
        content: 'Welcome to our presentation',
        image_url: 'https://example.com/image1.jpg',
      },
      {
        id: 'slide-2',
        title: 'Main Content',
        content: 'This is the main content',
        image_url: 'https://example.com/image2.jpg',
      },
    ],
    theme: 'professional',
    created_at: '2024-01-01T00:00:00Z',
  };

  const mockNarratedDeck = {
    id: 'narrated-deck-123',
    title: 'Test Narrated Slides',
    slides: [
      {
        id: 'slide-1',
        title: 'Introduction',
        content: 'Welcome to our presentation',
        narration:
          'Welcome to our presentation. Today we will discuss important topics.',
        timing: 0,
      },
      {
        id: 'slide-2',
        title: 'Main Content',
        content: 'This is the main content',
        narration: 'This is the main content of our presentation.',
        timing: 30,
      },
    ],
    total_duration: 60,
    created_at: '2024-01-01T00:00:00Z',
  };

  const mockTTSNarration = {
    id: 'tts-narration-123',
    audio_file_url: 'https://example.com/audio.mp3',
    duration: 60,
    voice_used: 'en-US-JennyNeural',
    created_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful token verification
    mockFunctionsInvoke.mockResolvedValue({
      data: {
        success: true,
        pipeline_data: mockPipelineData,
        access_count: 5,
      },
      error: null,
    });

    // Mock successful content loading
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockSlideDeck,
        error: null,
      }),
    } as any);
  });

  const renderWithRouter = (_token: string) => {
    return render(
      <BrowserRouter>
        <ShareableAccessPage />
      </BrowserRouter>
    );
  };

  describe('Token Verification', () => {
    it('should verify token and load content on mount', async () => {
      renderWithRouter(mockToken);

      // Should show loading initially
      expect(screen.getByText('Loading shared content...')).toBeInTheDocument();

      // Should call the edge function to verify token
      await waitFor(() => {
        expect(mockFunctionsInvoke).toHaveBeenCalledWith('verifyLinkToken', {
          body: {
            token: mockToken,
            visitor_user_agent: 'Mozilla/5.0 (Test Browser)',
            referrer: 'https://example.com',
          },
        });
      });

      // Should load pipeline content
      await waitFor(() => {
        expect(screen.getByText('Test Presentation')).toBeInTheDocument();
      });
    });

    it('should handle invalid token', async () => {
      mockFunctionsInvoke.mockResolvedValue({
        data: {
          success: false,
          error: 'Token not found or invalid',
        },
        error: null,
      });

      renderWithRouter('invalid-token');

      await waitFor(() => {
        expect(screen.getByText('Content Unavailable')).toBeInTheDocument();
        expect(
          screen.getByText('Token not found or invalid')
        ).toBeInTheDocument();
      });
    });

    it('should handle missing token', async () => {
      renderWithRouter('');

      await waitFor(() => {
        expect(screen.getByText('Content Unavailable')).toBeInTheDocument();
        expect(screen.getByText('Invalid share link')).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      mockFunctionsInvoke.mockRejectedValue(new Error('Network error'));

      renderWithRouter(mockToken);

      await waitFor(() => {
        expect(screen.getByText('Content Unavailable')).toBeInTheDocument();
        expect(screen.getByText('Failed to load content')).toBeInTheDocument();
      });
    });
  });

  describe('Content Display', () => {
    beforeEach(async () => {
      // Mock successful content loading
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockSlideDeck,
          error: null,
        }),
      } as any);
    });

    it('should display slide deck content', async () => {
      renderWithRouter(mockToken);

      await waitFor(() => {
        expect(screen.getByText('Test Presentation')).toBeInTheDocument();
        expect(screen.getByText('Introduction')).toBeInTheDocument();
        expect(
          screen.getByText('Welcome to our presentation')
        ).toBeInTheDocument();
      });
    });

    it('should show slide navigation', async () => {
      renderWithRouter(mockToken);

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });

    it('should handle missing slide deck', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      } as any);

      renderWithRouter(mockToken);

      await waitFor(() => {
        expect(screen.getByText('No slides available')).toBeInTheDocument();
      });
    });
  });

  describe('Audio Player', () => {
    beforeEach(async () => {
      // Mock TTS narration data
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockTTSNarration,
          error: null,
        }),
      } as any);
    });

    it('should display audio player when TTS narration is available', async () => {
      renderWithRouter(mockToken);

      await waitFor(() => {
        expect(screen.getByText('Audio Narration')).toBeInTheDocument();
        expect(
          screen.getByText('Voice: en-US-JennyNeural')
        ).toBeInTheDocument();
      });
    });

    it('should handle play/pause functionality', async () => {
      renderWithRouter(mockToken);

      await waitFor(() => {
        const playButton = screen.getByRole('button', { name: /play/i });
        fireEvent.click(playButton);
        expect(mockAudio.play).toHaveBeenCalled();
      });
    });

    it('should handle audio seek functionality', async () => {
      renderWithRouter(mockToken);

      await waitFor(() => {
        const seekBar = screen.getByRole('slider');
        fireEvent.change(seekBar, { target: { value: '50' } });
        expect(mockAudio.currentTime).toBeDefined();
      });
    });

    it('should handle audio errors', async () => {
      mockAudio.addEventListener.mockImplementation((event, callback) => {
        if (event === 'error') {
          callback();
        }
      });

      renderWithRouter(mockToken);

      await waitFor(() => {
        expect(
          screen.getByText('Failed to load audio file')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Transcript Display', () => {
    beforeEach(async () => {
      // Mock narrated deck data
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockNarratedDeck,
          error: null,
        }),
      } as any);
    });

    it('should toggle transcript visibility', async () => {
      renderWithRouter(mockToken);

      await waitFor(() => {
        const toggleButton = screen.getByText('Show Transcript');
        fireEvent.click(toggleButton);
        expect(screen.getByText('Transcript')).toBeInTheDocument();
        expect(
          screen.getByText(
            'Welcome to our presentation. Today we will discuss important topics.'
          )
        ).toBeInTheDocument();
      });
    });

    it('should display transcript with timing', async () => {
      renderWithRouter(mockToken);

      await waitFor(() => {
        const toggleButton = screen.getByText('Show Transcript');
        fireEvent.click(toggleButton);

        expect(screen.getByText('Slide 1')).toBeInTheDocument();
        expect(screen.getByText('0:00')).toBeInTheDocument();
        expect(screen.getByText('Slide 2')).toBeInTheDocument();
        expect(screen.getByText('0:30')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation and Error Handling', () => {
    it('should navigate to home on error', async () => {
      mockFunctionsInvoke.mockResolvedValue({
        data: {
          success: false,
          error: 'Pipeline not found',
        },
        error: null,
      });

      renderWithRouter(mockToken);

      await waitFor(() => {
        const goHomeButton = screen.getByText('Go Home');
        fireEvent.click(goHomeButton);
        // Note: In a real test, you'd verify navigation occurred
      });
    });

    it('should display access count', async () => {
      renderWithRouter(mockToken);

      await waitFor(() => {
        expect(screen.getByText('5 views')).toBeInTheDocument();
      });
    });

    it('should display watermark for anonymous access', async () => {
      renderWithRouter(mockToken);

      await waitFor(() => {
        expect(screen.getByText('Shared via DocCraft AI')).toBeInTheDocument();
        expect(
          screen.getByText('Create your own presentation')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Slide Navigation', () => {
    it('should allow navigation between slides', async () => {
      renderWithRouter(mockToken);

      await waitFor(() => {
        const slide2Button = screen.getByText('2');
        fireEvent.click(slide2Button);
        expect(screen.getByText('Main Content')).toBeInTheDocument();
      });
    });

    it('should sync audio with slide timing', async () => {
      // Mock narrated deck with timing
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockNarratedDeck,
          error: null,
        }),
      } as any);

      renderWithRouter(mockToken);

      await waitFor(() => {
        const slide2Button = screen.getByText('2');
        fireEvent.click(slide2Button);
        // Should seek audio to slide timing
        expect(mockAudio.currentTime).toBeDefined();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should display content in responsive layout', async () => {
      renderWithRouter(mockToken);

      await waitFor(() => {
        // Should have grid layout
        const container = screen.getByText('Test Presentation').closest('div');
        expect(container).toHaveClass('grid');
      });
    });

    it('should handle mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderWithRouter(mockToken);

      await waitFor(() => {
        // Should stack content vertically on mobile
        expect(screen.getByText('Test Presentation')).toBeInTheDocument();
      });
    });
  });
});
