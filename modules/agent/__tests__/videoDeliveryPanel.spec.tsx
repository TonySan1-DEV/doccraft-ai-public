/*
role: test-engineer,
tier: Pro,
file: "modules/agent/__tests__/videoDeliveryPanel.spec.tsx",
allowedActions: ["test", "validate"],
theme: "component_testing"
*/

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VideoDeliveryPanel } from '../components/videoDeliveryPanel';
import { supabase } from '../services/supabaseStorage';

// Mock Supabase
jest.mock('../services/supabaseStorage', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
    storage: {
      from: jest.fn(() => ({
        createSignedUrl: jest.fn(),
      })),
    },
  },
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock document.createElement and appendChild/removeChild
const mockAnchorElement = {
  href: '',
  download: '',
  target: '',
  click: jest.fn(),
};
document.createElement = jest.fn(() => mockAnchorElement);
document.body.appendChild = jest.fn();
document.body.removeChild = jest.fn();

describe('VideoDeliveryPanel', () => {
  const mockPipeline = {
    id: 'pipeline-123',
    status: 'success' as const,
    mode: 'auto' as const,
    features: ['slides', 'script', 'voiceover'],
    progress: 100,
    tier: 'Pro',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    slideDeckId: 'slide-deck-123',
    narratedDeckId: 'narrated-deck-123',
    ttsNarrationId: 'tts-narration-123',
    slideDeckTitle: 'Test Presentation',
    narratedDeckTitle: 'Test Script',
  };

  const mockSlideDeck = {
    id: 'slide-deck-123',
    title: 'Test Presentation',
    file_path: 'user-123/presentation.pptx',
    file_size: 1024000, // 1MB
  };

  const mockNarratedDeck = {
    id: 'narrated-deck-123',
    title: 'Test Script',
    slides: [
      { narration: 'This is slide 1 narration.' },
      { narration: 'This is slide 2 narration with more content.' },
    ],
    total_duration: 120, // 2 minutes
  };

  const mockTTSNarration = {
    id: 'tts-narration-123',
    title: 'Test Narration',
    audio_file_url: 'https://example.com/audio.mp3',
    duration: 120,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render loading state initially', () => {
      render(<VideoDeliveryPanel pipeline={mockPipeline} />);

      expect(
        screen.getByText('Loading pipeline results...')
      ).toBeInTheDocument();
    });

    it('should render success banner when pipeline is successful', async () => {
      // Mock successful data fetching
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockSlideDeck }),
      });

      (supabase.storage.from as jest.Mock).mockReturnValue({
        createSignedUrl: jest.fn().mockResolvedValue({
          data: { signedUrl: 'https://example.com/signed-url' },
        }),
      });

      render(<VideoDeliveryPanel pipeline={mockPipeline} />);

      await waitFor(() => {
        expect(
          screen.getByText('Pipeline completed successfully!')
        ).toBeInTheDocument();
      });
    });

    it('should render error state when data fetching fails', async () => {
      // Mock failed data fetching
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      render(<VideoDeliveryPanel pipeline={mockPipeline} />);

      await waitFor(() => {
        expect(
          screen.getByText('Failed to load pipeline results')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Summary View', () => {
    beforeEach(async () => {
      // Mock successful data fetching
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockSlideDeck }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockNarratedDeck }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockTTSNarration }),
        });

      (supabase.storage.from as jest.Mock).mockReturnValue({
        createSignedUrl: jest.fn().mockResolvedValue({
          data: { signedUrl: 'https://example.com/signed-url' },
        }),
      });
    });

    it('should display summary statistics', async () => {
      render(<VideoDeliveryPanel pipeline={mockPipeline} userTier="Pro" />);

      await waitFor(() => {
        expect(
          screen.getByText('Generated Content Summary')
        ).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument(); // 1 slide deck
        expect(screen.getByText('8')).toBeInTheDocument(); // 8 words in script
        expect(screen.getByText('2:00')).toBeInTheDocument(); // 2 minutes duration
      });
    });

    it('should show correct asset counts', async () => {
      render(<VideoDeliveryPanel pipeline={mockPipeline} userTier="Pro" />);

      await waitFor(() => {
        expect(screen.getByText('Slides')).toBeInTheDocument();
        expect(screen.getByText('Words')).toBeInTheDocument();
        expect(screen.getByText('Duration')).toBeInTheDocument();
      });
    });
  });

  describe('Download Functionality', () => {
    beforeEach(async () => {
      // Mock successful data fetching
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockSlideDeck }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockNarratedDeck }),
        });

      (supabase.storage.from as jest.Mock).mockReturnValue({
        createSignedUrl: jest.fn().mockResolvedValue({
          data: { signedUrl: 'https://example.com/signed-url' },
        }),
      });
    });

    it('should render download buttons for available assets', async () => {
      render(<VideoDeliveryPanel pipeline={mockPipeline} />);

      await waitFor(() => {
        expect(screen.getAllByText('Download')).toHaveLength(2); // PPTX and Script
      });
    });

    it('should handle PPTX download', async () => {
      render(<VideoDeliveryPanel pipeline={mockPipeline} />);

      await waitFor(() => {
        const downloadButtons = screen.getAllByText('Download');
        fireEvent.click(downloadButtons[0]); // First download button (PPTX)
      });

      expect(mockAnchorElement.click).toHaveBeenCalled();
      expect(mockAnchorElement.download).toBe('Test Presentation.pptx');
    });

    it('should handle script download', async () => {
      render(<VideoDeliveryPanel pipeline={mockPipeline} />);

      await waitFor(() => {
        const downloadButtons = screen.getAllByText('Download');
        fireEvent.click(downloadButtons[1]); // Second download button (Script)
      });

      expect(mockAnchorElement.click).toHaveBeenCalled();
      expect(mockAnchorElement.download).toBe('Test Script.txt');
    });

    it('should show loading state during download', async () => {
      render(<VideoDeliveryPanel pipeline={mockPipeline} />);

      await waitFor(() => {
        const downloadButtons = screen.getAllByText('Download');
        fireEvent.click(downloadButtons[0]);
      });

      // Should show loading spinner
      expect(screen.getByRole('button', { name: /download/i })).toBeDisabled();
    });
  });

  describe('Share Functionality', () => {
    beforeEach(async () => {
      // Mock minimal data to avoid loading state
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null }),
      });
    });

    it('should render share button', async () => {
      render(<VideoDeliveryPanel pipeline={mockPipeline} />);

      await waitFor(() => {
        expect(screen.getByText('Share via Link')).toBeInTheDocument();
      });
    });

    it('should handle share link creation', async () => {
      render(<VideoDeliveryPanel pipeline={mockPipeline} />);

      await waitFor(() => {
        const shareButton = screen.getByText('Share via Link');
        fireEvent.click(shareButton);
      });

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('/pipeline/pipeline-123')
        );
      });
    });

    it('should show share link input after creation', async () => {
      render(<VideoDeliveryPanel pipeline={mockPipeline} />);

      await waitFor(() => {
        const shareButton = screen.getByText('Share via Link');
        fireEvent.click(shareButton);
      });

      await waitFor(() => {
        expect(
          screen.getByDisplayValue(
            expect.stringContaining('/pipeline/pipeline-123')
          )
        ).toBeInTheDocument();
        expect(screen.getByText('Copy Link')).toBeInTheDocument();
      });
    });

    it('should allow copying share link', async () => {
      render(<VideoDeliveryPanel pipeline={mockPipeline} />);

      await waitFor(() => {
        const shareButton = screen.getByText('Share via Link');
        fireEvent.click(shareButton);
      });

      await waitFor(() => {
        const copyButton = screen.getByTitle('Copy to clipboard');
        fireEvent.click(copyButton);
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
      });
    });
  });

  describe('Tier Restrictions', () => {
    beforeEach(async () => {
      // Mock data including TTS narration
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockSlideDeck }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockNarratedDeck }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockTTSNarration }),
        });

      (supabase.storage.from as jest.Mock).mockReturnValue({
        createSignedUrl: jest.fn().mockResolvedValue({
          data: { signedUrl: 'https://example.com/signed-url' },
        }),
      });
    });

    it('should show audio download for Pro users', async () => {
      render(<VideoDeliveryPanel pipeline={mockPipeline} userTier="Pro" />);

      await waitFor(() => {
        expect(screen.getByText('Test Narration')).toBeInTheDocument();
        expect(screen.getAllByText('Download')).toHaveLength(3); // PPTX, Script, Audio
      });
    });

    it('should hide audio download for Free users', async () => {
      render(<VideoDeliveryPanel pipeline={mockPipeline} userTier="Free" />);

      await waitFor(() => {
        expect(screen.queryByText('Test Narration')).not.toBeInTheDocument();
        expect(screen.getAllByText('Download')).toHaveLength(2); // Only PPTX and Script
      });
    });

    it('should show tier restriction notice for Free users', async () => {
      render(<VideoDeliveryPanel pipeline={mockPipeline} userTier="Free" />);

      await waitFor(() => {
        expect(
          screen.getByText(
            'Audio narration download requires Pro tier or higher'
          )
        ).toBeInTheDocument();
      });
    });

    it('should not show tier restriction notice for Pro users', async () => {
      render(<VideoDeliveryPanel pipeline={mockPipeline} userTier="Pro" />);

      await waitFor(() => {
        expect(
          screen.queryByText(
            'Audio narration download requires Pro tier or higher'
          )
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockRejectedValue(new Error('Database connection failed')),
      });

      render(<VideoDeliveryPanel pipeline={mockPipeline} />);

      await waitFor(() => {
        expect(
          screen.getByText('Failed to load pipeline results')
        ).toBeInTheDocument();
      });
    });

    it('should handle download errors gracefully', async () => {
      // Mock successful data fetching but failed download
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockSlideDeck }),
      });

      (supabase.storage.from as jest.Mock).mockReturnValue({
        createSignedUrl: jest
          .fn()
          .mockRejectedValue(new Error('Download failed')),
      });

      render(<VideoDeliveryPanel pipeline={mockPipeline} />);

      await waitFor(() => {
        const downloadButton = screen.getByText('Download');
        fireEvent.click(downloadButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Failed to download file')).toBeInTheDocument();
      });
    });

    it('should handle share link creation errors', async () => {
      // Mock clipboard API failure
      (navigator.clipboard.writeText as jest.Mock).mockRejectedValue(
        new Error('Clipboard access denied')
      );

      render(<VideoDeliveryPanel pipeline={mockPipeline} />);

      await waitFor(() => {
        const shareButton = screen.getByText('Share via Link');
        fireEvent.click(shareButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText('Failed to create share link')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle pipeline with no assets', async () => {
      const emptyPipeline = {
        ...mockPipeline,
        slideDeckId: undefined,
        narratedDeckId: undefined,
        ttsNarrationId: undefined,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null }),
      });

      render(<VideoDeliveryPanel pipeline={emptyPipeline} />);

      await waitFor(() => {
        expect(
          screen.getByText('No assets available for download')
        ).toBeInTheDocument();
      });
    });

    it('should handle missing file metadata', async () => {
      const incompleteSlideDeck = { ...mockSlideDeck, file_size: undefined };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: incompleteSlideDeck }),
      });

      (supabase.storage.from as jest.Mock).mockReturnValue({
        createSignedUrl: jest.fn().mockResolvedValue({
          data: { signedUrl: 'https://example.com/signed-url' },
        }),
      });

      render(<VideoDeliveryPanel pipeline={mockPipeline} />);

      await waitFor(() => {
        expect(screen.getByText('Test Presentation')).toBeInTheDocument();
        // Should not crash when file_size is undefined
      });
    });

    it('should handle zero duration values', async () => {
      const zeroDurationDeck = { ...mockNarratedDeck, total_duration: 0 };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: zeroDurationDeck }),
      });

      render(<VideoDeliveryPanel pipeline={mockPipeline} />);

      await waitFor(() => {
        expect(screen.getByText('0:00')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null }),
      });
    });

    it('should have proper ARIA labels', async () => {
      render(<VideoDeliveryPanel pipeline={mockPipeline} />);

      await waitFor(() => {
        expect(screen.getByText('Share via Link')).toBeInTheDocument();
      });

      const shareButton = screen.getByText('Share via Link');
      expect(shareButton).toBeInTheDocument();
    });

    it('should have proper button states', async () => {
      render(<VideoDeliveryPanel pipeline={mockPipeline} />);

      await waitFor(() => {
        const shareButton = screen.getByText('Share via Link');
        expect(shareButton).not.toBeDisabled();
      });
    });
  });
});

// TODO: Add Jest tests for download/share edge cases
// - Test with very large files
// - Test with special characters in filenames
// - Test with network timeouts
// - Test with invalid file URLs
// - Test with expired signed URLs
// - Test concurrent downloads
// - Test clipboard API failures
// - Test file system permission errors
// - Test browser download restrictions
// - Test mobile device compatibility
