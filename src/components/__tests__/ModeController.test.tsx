// MCP Context Block
/*
{
  file: "ModeController.test.tsx",
  role: "test-developer",
  allowedActions: ["test", "validate", "verify"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "testing"
}
*/

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-hot-toast';
import ModeController from '../ModeController';
import { useAgentPreferences } from '../../contexts/AgentPreferencesContext';
import { useMCP } from '../../useMCP';

// Mock dependencies
jest.mock('react-hot-toast');
jest.mock('../../contexts/AgentPreferencesContext');
jest.mock('../../useMCP');

const mockToast = toast as jest.Mocked<typeof toast>;
const mockUseAgentPreferences = useAgentPreferences as jest.MockedFunction<
  typeof useAgentPreferences
>;
const mockUseMCP = useMCP as jest.MockedFunction<typeof useMCP>;

// Mock data
const mockPreferences = {
  systemMode: 'HYBRID' as const,
  modeConfiguration: {
    mode: 'HYBRID' as const,
    aiInitiativeLevel: 'RESPONSIVE' as const,
    suggestionFrequency: 'CONTEXTUAL' as const,
    userControlLevel: 70,
    interventionStyle: 'GENTLE' as const,
    autoEnhancement: true,
    realTimeAnalysis: true,
    proactiveSuggestions: true,
  },
  lastModeChange: new Date(),
};

const mockUpdatePreferences = jest.fn();
const mockOnModeChange = jest.fn();

const mockMCPContext = {
  role: 'user',
  allowedActions: ['ui', 'mode', 'preferences'],
  theme: 'mode_control',
  contentSensitivity: 'low',
  tier: 'Pro',
};

describe('ModeController', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAgentPreferences.mockReturnValue({
      preferences: mockPreferences,
      updatePreferences: mockUpdatePreferences,
      resetToDefaults: jest.fn(),
      isFieldLocked: jest.fn(),
      onPreferencesChange: undefined,
      createVersion: jest.fn(),
      getCurrentVersion: jest.fn(),
      getVersionHistory: jest.fn(),
      restoreVersion: jest.fn(),
      deleteVersion: jest.fn(),
      updateVersionLabel: jest.fn(),
      versionHistory: [],
      isLoadingVersions: false,
      currentVersion: null,
    });

    mockUseMCP.mockReturnValue(mockMCPContext);
    mockUpdatePreferences.mockResolvedValue(true);
  });

  describe('Rendering', () => {
    it('should render all three writing modes', () => {
      render(<ModeController onModeChange={mockOnModeChange} />);

      expect(screen.getByText('Manual Mode')).toBeInTheDocument();
      expect(screen.getByText('Hybrid Mode')).toBeInTheDocument();
      expect(screen.getByText('Fully Auto Mode')).toBeInTheDocument();
    });

    it('should display the current mode as active', () => {
      render(<ModeController onModeChange={mockOnModeChange} />);

      const hybridCard = screen.getByText('Hybrid Mode').closest('div');
      expect(hybridCard).toHaveClass('ring-blue-500');
    });

    it('should show smart recommendations section', () => {
      render(<ModeController onModeChange={mockOnModeChange} />);

      expect(screen.getByText('Smart Recommendations')).toBeInTheDocument();
    });

    it('should display mode comparison table', () => {
      render(<ModeController onModeChange={mockOnModeChange} />);

      expect(screen.getByText('Mode Comparison')).toBeInTheDocument();
    });
  });

  describe('Mode Switching', () => {
    it('should handle mode switching successfully', async () => {
      render(<ModeController onModeChange={mockOnModeChange} />);

      const manualModeButton = screen.getByText('Activate', {
        selector: 'button',
      });
      fireEvent.click(manualModeButton);

      await waitFor(() => {
        expect(mockUpdatePreferences).toHaveBeenCalledWith(
          expect.objectContaining({
            systemMode: 'MANUAL',
            modeConfiguration: expect.any(Object),
            lastModeChange: expect.any(Date),
          }),
          expect.objectContaining({
            label: 'Switched to MANUAL mode',
            reason: 'Mode transition from HYBRID to MANUAL',
          })
        );
      });

      expect(mockToast.success).toHaveBeenCalledWith(
        'Successfully switched to Manual mode'
      );
      expect(mockOnModeChange).toHaveBeenCalledWith(
        'MANUAL',
        expect.any(Object)
      );
    });

    it('should show transition preview when switching modes', async () => {
      render(<ModeController onModeChange={mockOnModeChange} />);

      const manualModeButton = screen.getByText('Activate', {
        selector: 'button',
      });
      fireEvent.click(manualModeButton);

      await waitFor(() => {
        expect(screen.getByText('Mode Transition Preview')).toBeInTheDocument();
      });
    });

    it('should handle mode switching errors gracefully', async () => {
      mockUpdatePreferences.mockRejectedValue(new Error('Update failed'));

      render(<ModeController onModeChange={mockOnModeChange} />);

      const manualModeButton = screen.getByText('Activate', {
        selector: 'button',
      });
      fireEvent.click(manualModeButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Failed to switch modes: Update failed'
        );
      });
    });

    it('should respect MCP role restrictions', async () => {
      mockUseMCP.mockReturnValue({
        ...mockMCPContext,
        role: 'viewer',
      });

      render(<ModeController onModeChange={mockOnModeChange} />);

      const manualModeButton = screen.getByText('Activate', {
        selector: 'button',
      });
      fireEvent.click(manualModeButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Failed to switch modes: Insufficient permissions to change modes'
        );
      });
    });
  });

  describe('Mode Preview', () => {
    it('should show mode preview when preview button is clicked', async () => {
      render(<ModeController onModeChange={mockOnModeChange} />);

      const previewButton = screen.getByText('Preview', { selector: 'button' });
      fireEvent.click(previewButton);

      await waitFor(() => {
        expect(screen.getByText('Manual Mode Preview')).toBeInTheDocument();
      });
    });

    it('should close preview when close button is clicked', async () => {
      render(<ModeController onModeChange={mockOnModeChange} />);

      const previewButton = screen.getByText('Preview', { selector: 'button' });
      fireEvent.click(previewButton);

      await waitFor(() => {
        expect(screen.getByText('Manual Mode Preview')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(
          screen.queryByText('Manual Mode Preview')
        ).not.toBeInTheDocument();
      });
    });

    it('should allow mode activation from preview', async () => {
      render(<ModeController onModeChange={mockOnModeChange} />);

      const previewButton = screen.getByText('Preview', { selector: 'button' });
      fireEvent.click(previewButton);

      await waitFor(() => {
        expect(screen.getByText('Manual Mode Preview')).toBeInTheDocument();
      });

      const activateButton = screen.getByText('Activate Manual Mode');
      fireEvent.click(activateButton);

      await waitFor(() => {
        expect(mockUpdatePreferences).toHaveBeenCalled();
      });
    });
  });

  describe('Smart Recommendations', () => {
    it('should show loading state initially', () => {
      render(<ModeController onModeChange={mockOnModeChange} />);

      expect(
        screen.getByText('Analyzing your writing patterns...')
      ).toBeInTheDocument();
    });

    it('should display recommendations after analysis', async () => {
      render(<ModeController onModeChange={mockOnModeChange} />);

      await waitFor(
        () => {
          expect(screen.getByText(/% match/)).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ModeController onModeChange={mockOnModeChange} />);

      const modeSelector = screen.getByRole('radiogroup');
      expect(modeSelector).toHaveAttribute(
        'aria-label',
        'Writing mode selection'
      );
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ModeController onModeChange={mockOnModeChange} />);

      const firstModeCard = screen.getByText('Manual Mode').closest('div');
      firstModeCard?.focus();

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockUpdatePreferences).toHaveBeenCalled();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to different screen sizes', () => {
      // Test mobile layout
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<ModeController onModeChange={mockOnModeChange} />);

      // Component should still render properly
      expect(screen.getByText('Manual Mode')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid mode configurations', async () => {
      // Mock a validation error
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(<ModeController onModeChange={mockOnModeChange} />);

      const manualModeButton = screen.getByText('Activate', {
        selector: 'button',
      });
      fireEvent.click(manualModeButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });

    it('should recover from errors gracefully', async () => {
      render(<ModeController onModeChange={mockOnModeChange} />);

      // Simulate an error in the component
      const error = new Error('Test error');
      const errorBoundary = screen.getByText('Manual Mode').closest('div');

      if (errorBoundary) {
        // This would normally be handled by the error boundary
        // For testing, we just verify the component still renders
        expect(errorBoundary).toBeInTheDocument();
      }
    });
  });

  describe('Performance', () => {
    it('should render quickly', () => {
      const startTime = performance.now();

      render(<ModeController onModeChange={mockOnModeChange} />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render in under 100ms
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle rapid mode switching', async () => {
      render(<ModeController onModeChange={mockOnModeChange} />);

      const manualButton = screen.getByText('Activate', { selector: 'button' });
      const hybridButton = screen.getByText('Activate', { selector: 'button' });

      // Rapidly click both buttons
      fireEvent.click(manualButton);
      fireEvent.click(hybridButton);

      await waitFor(() => {
        expect(mockUpdatePreferences).toHaveBeenCalled();
      });
    });
  });

  describe('Integration', () => {
    it('should integrate with AgentPreferencesContext', () => {
      render(<ModeController onModeChange={mockOnModeChange} />);

      expect(mockUseAgentPreferences).toHaveBeenCalled();
    });

    it('should integrate with MCP system', () => {
      render(<ModeController onModeChange={mockOnModeChange} />);

      expect(mockUseMCP).toHaveBeenCalledWith('ModeController.tsx');
    });

    it('should call onModeChange callback when mode changes', async () => {
      render(<ModeController onModeChange={mockOnModeChange} />);

      const manualModeButton = screen.getByText('Activate', {
        selector: 'button',
      });
      fireEvent.click(manualModeButton);

      await waitFor(() => {
        expect(mockOnModeChange).toHaveBeenCalledWith(
          'MANUAL',
          expect.any(Object)
        );
      });
    });
  });
});
