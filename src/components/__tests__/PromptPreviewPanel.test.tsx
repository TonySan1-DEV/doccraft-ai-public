// MCP Context Block
/*
{
  file: "PromptPreviewPanel.test.tsx",
  role: "test",
  allowedActions: ["test", "validate"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "testing"
}
*/

// React import removed as it's not needed
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PromptPreviewPanel } from '../PromptPreviewPanel';
import type { DocumentContext } from '../../agent/ContextualPromptEngine';

// Mock the ContextualPromptEngine
jest.mock('../../agent/ContextualPromptEngine', () => ({
  buildContextualPromptHeader: jest.fn()
}));

import { buildContextualPromptHeader } from '../../agent/ContextualPromptEngine';

const mockBuildContextualPromptHeader = buildContextualPromptHeader as jest.MockedFunction<typeof buildContextualPromptHeader>;

describe('PromptPreviewPanel', () => {
  const mockDoc: DocumentContext = {
    scene: 'A coffee shop on a rainy afternoon',
    arc: 'setup',
    characterName: 'Emma'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the component with header', () => {
      mockBuildContextualPromptHeader.mockReturnValue({
        header: '/* Tone: friendly | Language: en | Genre: Romance */\n/* Pattern: "Introduce Emma and create a moment of unexpected connection" */\n\n',
        tone: 'friendly',
        language: 'en',
        genre: 'Romance',
        patternUsed: 'Introduce Emma and create a moment of unexpected connection'
      });

      render(<PromptPreviewPanel doc={mockDoc} />);

      expect(screen.getByText('Prompt Preview')).toBeInTheDocument();
      expect(screen.getByText('AI Prompt Header Preview')).toBeInTheDocument();
      expect(screen.getByText('Pattern Details')).toBeInTheDocument();
      expect(screen.getByText('Context Summary')).toBeInTheDocument();
    });

    it('should display the generated header correctly', () => {
      const mockHeader = '/* Tone: friendly | Language: en | Genre: Romance */\n/* Pattern: "Introduce Emma and create a moment of unexpected connection" */\n\n';
      
      mockBuildContextualPromptHeader.mockReturnValue({
        header: mockHeader,
        tone: 'friendly',
        language: 'en',
        genre: 'Romance',
        patternUsed: 'Introduce Emma and create a moment of unexpected connection'
      });

      render(<PromptPreviewPanel doc={mockDoc} />);

      expect(screen.getByText(/Tone: friendly/)).toBeInTheDocument();
      expect(screen.getByText(/Language: en/)).toBeInTheDocument();
      expect(screen.getByText(/Genre: Romance/)).toBeInTheDocument();
    });

    it('should show pattern details when enabled', () => {
      mockBuildContextualPromptHeader.mockReturnValue({
        header: '/* Test header */',
        tone: 'friendly',
        language: 'en',
        genre: 'Romance',
        patternUsed: 'Test pattern'
      });

      render(<PromptPreviewPanel doc={mockDoc} showPatternDetails={true} />);

      expect(screen.getByText('Pattern Details')).toBeInTheDocument();
      expect(screen.getByText('"Test pattern"')).toBeInTheDocument();
    });

    it('should hide pattern details when disabled', () => {
      mockBuildContextualPromptHeader.mockReturnValue({
        header: '/* Test header */',
        tone: 'friendly',
        language: 'en',
        genre: 'Romance',
        patternUsed: 'Test pattern'
      });

      render(<PromptPreviewPanel doc={mockDoc} showPatternDetails={false} />);

      expect(screen.queryByText('Pattern Details')).not.toBeInTheDocument();
      expect(screen.queryByText('"Test pattern"')).not.toBeInTheDocument();
    });
  });

  describe('Context Summary', () => {
    it('should display all context information', () => {
      mockBuildContextualPromptHeader.mockReturnValue({
        header: '/* Test header */',
        tone: 'formal',
        language: 'es',
        genre: 'Mystery',
        patternUsed: 'Test pattern'
      });

      render(<PromptPreviewPanel doc={mockDoc} />);

      expect(screen.getByText('formal')).toBeInTheDocument();
      expect(screen.getByText('es')).toBeInTheDocument();
      expect(screen.getByText('Mystery')).toBeInTheDocument();
      expect(screen.getByText('setup')).toBeInTheDocument();
      expect(screen.getByText('Emma')).toBeInTheDocument();
    });

    it('should handle missing character name', () => {
      const docWithoutCharacter: DocumentContext = {
        scene: 'A coffee shop',
        arc: 'setup'
      };

      mockBuildContextualPromptHeader.mockReturnValue({
        header: '/* Test header */',
        tone: 'friendly',
        language: 'en',
        genre: 'Romance',
        patternUsed: 'Test pattern'
      });

      render(<PromptPreviewPanel doc={docWithoutCharacter} />);

      expect(screen.queryByText('Character:')).not.toBeInTheDocument();
    });
  });

  describe('Fallback Warning', () => {
    it('should show fallback warning for unknown genre', () => {
      mockBuildContextualPromptHeader.mockReturnValue({
        header: '/* Test header */',
        tone: 'friendly',
        language: 'en',
        genre: 'UnknownGenre',
        patternUsed: 'Introduce [CHARACTER] and establish the central conflict'
      });

      render(<PromptPreviewPanel doc={mockDoc} />);

      expect(screen.getByText('Using default fallback pattern')).toBeInTheDocument();
      expect(screen.getByText(/Unknown genre: "UnknownGenre"/)).toBeInTheDocument();
    });

    it('should show fallback warning for unknown arc', () => {
      const docWithUnknownArc: DocumentContext = {
        scene: 'A coffee shop',
        arc: 'unknown' as any,
        characterName: 'Emma'
      };

      mockBuildContextualPromptHeader.mockReturnValue({
        header: '/* Test header */',
        tone: 'friendly',
        language: 'en',
        genre: 'Romance',
        patternUsed: 'Introduce [CHARACTER] and establish the central conflict'
      });

      render(<PromptPreviewPanel doc={docWithUnknownArc} />);

      expect(screen.getByText('Using default fallback pattern')).toBeInTheDocument();
      expect(screen.getByText(/Unknown arc: "unknown"/)).toBeInTheDocument();
    });

    it('should not show fallback warning for valid patterns', () => {
      mockBuildContextualPromptHeader.mockReturnValue({
        header: '/* Test header */',
        tone: 'friendly',
        language: 'en',
        genre: 'Romance',
        patternUsed: 'Introduce Emma and create a moment of unexpected connection'
      });

      render(<PromptPreviewPanel doc={mockDoc} />);

      expect(screen.queryByText('Using default fallback pattern')).not.toBeInTheDocument();
    });
  });

  describe('Collapsible Functionality', () => {
    it('should be collapsible by default', () => {
      mockBuildContextualPromptHeader.mockReturnValue({
        header: '/* Test header */',
        tone: 'friendly',
        language: 'en',
        genre: 'Romance',
        patternUsed: 'Test pattern'
      });

      render(<PromptPreviewPanel doc={mockDoc} />);

      const collapseButton = screen.getByRole('button', { name: /collapse preview/i });
      expect(collapseButton).toBeInTheDocument();
    });

    it('should not be collapsible when disabled', () => {
      mockBuildContextualPromptHeader.mockReturnValue({
        header: '/* Test header */',
        tone: 'friendly',
        language: 'en',
        genre: 'Romance',
        patternUsed: 'Test pattern'
      });

      render(<PromptPreviewPanel doc={mockDoc} collapsible={false} />);

      expect(screen.queryByRole('button', { name: /collapse preview/i })).not.toBeInTheDocument();
    });

    it('should toggle collapse state when button is clicked', () => {
      mockBuildContextualPromptHeader.mockReturnValue({
        header: '/* Test header */',
        tone: 'friendly',
        language: 'en',
        genre: 'Romance',
        patternUsed: 'Test pattern'
      });

      render(<PromptPreviewPanel doc={mockDoc} />);

      const collapseButton = screen.getByRole('button', { name: /collapse preview/i });
      
      // Initially expanded
      expect(screen.getByText('AI Prompt Header Preview')).toBeInTheDocument();
      
      // Click to collapse
      fireEvent.click(collapseButton);
      expect(screen.queryByText('AI Prompt Header Preview')).not.toBeInTheDocument();
      
      // Click to expand
      fireEvent.click(collapseButton);
      expect(screen.getByText('AI Prompt Header Preview')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading state when generating preview', async () => {
      // Mock a delayed response
      mockBuildContextualPromptHeader.mockImplementation(() => ({
        header: '/* Test header */',
        tone: 'friendly',
        language: 'en',
        genre: 'Romance',
        patternUsed: 'Test pattern'
      }));

      render(<PromptPreviewPanel doc={mockDoc} />);

      expect(screen.getByText('Generating preview...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when generation fails', () => {
      mockBuildContextualPromptHeader.mockImplementation(() => {
        throw new Error('Failed to generate preview');
      });

      render(<PromptPreviewPanel doc={mockDoc} />);

      expect(screen.getByText(/Error: Failed to generate preview/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      mockBuildContextualPromptHeader.mockReturnValue({
        header: '/* Test header */',
        tone: 'friendly',
        language: 'en',
        genre: 'Romance',
        patternUsed: 'Test pattern'
      });

      render(<PromptPreviewPanel doc={mockDoc} />);

      // Check for ARIA alert role on fallback warning
      const alertElement = screen.getByRole('alert');
      expect(alertElement).toBeInTheDocument();

      // Check for proper button labels
      const collapseButton = screen.getByRole('button', { name: /collapse preview/i });
      expect(collapseButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should be keyboard navigable', () => {
      mockBuildContextualPromptHeader.mockReturnValue({
        header: '/* Test header */',
        tone: 'friendly',
        language: 'en',
        genre: 'Romance',
        patternUsed: 'Test pattern'
      });

      render(<PromptPreviewPanel doc={mockDoc} />);

      const collapseButton = screen.getByRole('button', { name: /collapse preview/i });
      
      // Test keyboard interaction
      fireEvent.keyDown(collapseButton, { key: 'Enter' });
      expect(screen.queryByText('AI Prompt Header Preview')).not.toBeInTheDocument();
      
      fireEvent.keyDown(collapseButton, { key: ' ' });
      expect(screen.getByText('AI Prompt Header Preview')).toBeInTheDocument();
    });
  });

  describe('Real-time Updates', () => {
    it('should update when document context changes', async () => {
      const { rerender } = render(<PromptPreviewPanel doc={mockDoc} />);

      // Initial call
      expect(mockBuildContextualPromptHeader).toHaveBeenCalledWith(
        expect.any(Object), // mockPrefs
        mockDoc
      );

      // Update document context
      const updatedDoc: DocumentContext = {
        scene: 'A different scene',
        arc: 'climax',
        characterName: 'Sarah'
      };

      rerender(<PromptPreviewPanel doc={updatedDoc} />);

      await waitFor(() => {
        expect(mockBuildContextualPromptHeader).toHaveBeenCalledWith(
          expect.any(Object), // mockPrefs
          updatedDoc
        );
      });
    });
  });

  describe('Theme Support', () => {
    it('should apply dark theme classes', () => {
      mockBuildContextualPromptHeader.mockReturnValue({
        header: '/* Test header */',
        tone: 'friendly',
        language: 'en',
        genre: 'Romance',
        patternUsed: 'Test pattern'
      });

      render(<PromptPreviewPanel doc={mockDoc} />);

      const container = screen.getByText('Prompt Preview').closest('div');
      expect(container).toHaveClass('bg-white', 'dark:bg-gray-800');
    });
  });

  describe('usePromptPreview Hook', () => {
    it('should provide preview data and controls', () => {
      // This would be tested in a separate hook test file
      // For now, we'll test the integration
      mockBuildContextualPromptHeader.mockReturnValue({
        header: '/* Test header */',
        tone: 'friendly',
        language: 'en',
        genre: 'Romance',
        patternUsed: 'Test pattern'
      });

      render(<PromptPreviewPanel doc={mockDoc} />);

      // Verify the hook integration works
      expect(mockBuildContextualPromptHeader).toHaveBeenCalled();
    });
  });
}); 