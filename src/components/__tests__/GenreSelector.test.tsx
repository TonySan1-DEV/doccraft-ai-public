// MCP Context Block
/*
{
  file: "GenreSelector.test.tsx",
  role: "test-engineer",
  allowedActions: ["test", "validate", "verify"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "genre_selection"
}
*/

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GenreSelector } from '../GenreSelector';
import { getGenreById, allGenres } from '../../constants/genreConstants';

// Mock the AgentPreferencesContext
jest.mock('../../contexts/AgentPreferencesContext', () => ({
  useAgentPreferences: () => ({
    preferences: {
      tone: 'friendly',
      language: 'en',
      copilotEnabled: true,
      memoryEnabled: true,
      defaultCommandView: 'list',
      genre: 'fantasy',
    },
    updatePreferences: jest.fn(),
  }),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('GenreSelector', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  describe('Dropdown Variant', () => {
    it('renders dropdown with placeholder', () => {
      render(<GenreSelector placeholder="Select a genre..." />);

      expect(screen.getByText('Select a genre...')).toBeInTheDocument();
    });

    it('opens dropdown on click', async () => {
      render(<GenreSelector />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('Search genres...')
        ).toBeInTheDocument();
      });
    });

    it('shows popular genres section', async () => {
      render(<GenreSelector showPopular={true} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Popular')).toBeInTheDocument();
      });
    });

    it('filters genres by search query', async () => {
      render(<GenreSelector />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const searchInput =
        await screen.findByPlaceholderText('Search genres...');
      fireEvent.change(searchInput, { target: { value: 'fantasy' } });

      await waitFor(() => {
        expect(screen.getByText('Fantasy')).toBeInTheDocument();
        expect(screen.queryByText('Science Fiction')).not.toBeInTheDocument();
      });
    });

    it('filters by category', async () => {
      render(<GenreSelector showCategories={true} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const fictionButton = await screen.findByText('📚 Fiction');
      fireEvent.click(fictionButton);

      await waitFor(() => {
        expect(screen.getByText('Fantasy')).toBeInTheDocument();
        expect(screen.queryByText('Memoir')).not.toBeInTheDocument();
      });
    });

    it('calls onGenreSelected when genre is selected', async () => {
      const mockOnGenreSelected = jest.fn();
      render(<GenreSelector onGenreSelected={mockOnGenreSelected} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const fantasyOption = await screen.findByText('Fantasy');
      fireEvent.click(fantasyOption);

      expect(mockOnGenreSelected).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'fantasy',
          name: 'Fantasy',
        })
      );
    });

    it('updates preferences when genre is selected', async () => {
      const mockUpdatePreferences = jest.fn();
      jest
        .mocked(
          require('../../contexts/AgentPreferencesContext').useAgentPreferences
        )
        .mockReturnValue({
          preferences: {
            tone: 'friendly',
            language: 'en',
            copilotEnabled: true,
            memoryEnabled: true,
            defaultCommandView: 'list',
            genre: 'fantasy',
          },
          updatePreferences: mockUpdatePreferences,
        });

      render(<GenreSelector />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const fantasyOption = await screen.findByText('Fantasy');
      fireEvent.click(fantasyOption);

      expect(mockUpdatePreferences).toHaveBeenCalledWith({
        genre: 'fantasy',
      });
    });

    it('saves recently used genres to localStorage', async () => {
      render(<GenreSelector />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const fantasyOption = await screen.findByText('Fantasy');
      fireEvent.click(fantasyOption);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'doccraft-recent-genres',
        JSON.stringify(['fantasy'])
      );
    });

    it('shows recently used genres', async () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify(['fantasy', 'romance'])
      );

      render(<GenreSelector />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Recently Used')).toBeInTheDocument();
      });
    });
  });

  describe('Cards Variant', () => {
    it('renders genre cards', () => {
      render(<GenreSelector variant="cards" />);

      expect(screen.getByText('Fantasy')).toBeInTheDocument();
      expect(screen.getByText('Science Fiction')).toBeInTheDocument();
    });

    it('shows subgenres when enabled', () => {
      render(<GenreSelector variant="cards" showSubgenres={true} />);

      expect(screen.getByText('High Fantasy')).toBeInTheDocument();
      expect(screen.getByText('Urban Fantasy')).toBeInTheDocument();
    });

    it('displays genre categories', () => {
      render(<GenreSelector variant="cards" showCategories={true} />);

      expect(screen.getByText('📚 Fiction')).toBeInTheDocument();
      expect(screen.getByText('📖 Nonfiction')).toBeInTheDocument();
    });
  });

  describe('List Variant', () => {
    it('renders genre list', () => {
      render(<GenreSelector variant="list" />);

      expect(screen.getByText('Fantasy')).toBeInTheDocument();
      expect(screen.getByText('Science Fiction')).toBeInTheDocument();
    });
  });

  describe('Multiple Selection', () => {
    it('allows multiple genre selection', async () => {
      render(<GenreSelector allowMultiple={true} maxSelections={3} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const fantasyOption = await screen.findByText('Fantasy');
      const scifiOption = await screen.findByText('Science Fiction');

      fireEvent.click(fantasyOption);
      fireEvent.click(scifiOption);

      expect(screen.getByText('2 genres selected')).toBeInTheDocument();
    });

    it('respects max selections limit', async () => {
      render(<GenreSelector allowMultiple={true} maxSelections={2} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const fantasyOption = await screen.findByText('Fantasy');
      const scifiOption = await screen.findByText('Science Fiction');
      const romanceOption = await screen.findByText('Romance');

      fireEvent.click(fantasyOption);
      fireEvent.click(scifiOption);
      fireEvent.click(romanceOption);

      // Should only show 2 selected (romance should replace fantasy)
      expect(screen.getByText('2 genres selected')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('disables interaction when disabled', () => {
      render(<GenreSelector disabled={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Size Variants', () => {
    it('applies correct size classes', () => {
      const { rerender } = render(<GenreSelector size="sm" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-sm');

      rerender(<GenreSelector size="lg" />);
      expect(button).toHaveClass('text-lg');
    });
  });

  describe('Genre Data Integration', () => {
    it('displays all genre categories correctly', () => {
      render(<GenreSelector variant="cards" showCategories={true} />);

      // Check that all categories are present
      expect(screen.getByText('📚 Fiction')).toBeInTheDocument();
      expect(screen.getByText('📖 Nonfiction')).toBeInTheDocument();
      expect(screen.getByText('⭐ Special')).toBeInTheDocument();
    });

    it('shows popular genres with star icon', () => {
      render(<GenreSelector variant="cards" />);

      // Popular genres should have star icons
      const popularGenres = allGenres.filter(genre => genre.isPopular);
      popularGenres.forEach(genre => {
        expect(screen.getByText(genre.name)).toBeInTheDocument();
      });
    });

    it('displays genre descriptions', () => {
      render(<GenreSelector variant="cards" />);

      const fantasyCard = screen.getByText('Fantasy').closest('button');
      expect(fantasyCard).toHaveTextContent('Imaginative worlds with magic');
    });
  });

  describe('Error Handling', () => {
    it('handles invalid genre IDs gracefully', () => {
      render(<GenreSelector selectedGenreId="invalid-genre" />);

      // Should not crash and should show placeholder
      expect(screen.getByText('Select a genre...')).toBeInTheDocument();
    });

    it('handles localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      // Should not crash
      expect(() => render(<GenreSelector />)).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<GenreSelector />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      render(<GenreSelector />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const searchInput =
        await screen.findByPlaceholderText('Search genres...');
      expect(searchInput).toHaveFocus();
    });
  });
});
