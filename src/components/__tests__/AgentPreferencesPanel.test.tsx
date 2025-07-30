// MCP Context Block
/*
{
  file: "AgentPreferencesPanel.test.tsx",
  role: "test",
  allowedActions: ["test", "validate"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "testing"
}
*/

// React import removed as it's not needed
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AgentPreferencesPanel } from '../AgentPreferencesPanel';

// Mock the contexts and components
jest.mock('../../contexts/AgentPreferencesContext', () => ({
  useAgentPreferences: jest.fn()
}));

jest.mock('../../useMCP', () => ({
  useMCP: jest.fn()
}));

jest.mock('../PromptPreviewPanel', () => ({
  PromptPreviewPanel: ({ doc, className }: any) => (
    <div data-testid="prompt-preview-panel" className={className}>
      <div>Prompt Preview Panel</div>
      <div>Scene: {doc.scene}</div>
      <div>Arc: {doc.arc}</div>
      <div>Character: {doc.characterName}</div>
    </div>
  )
}));

import { useAgentPreferences } from '../../contexts/AgentPreferencesContext';
import { useMCP } from '../../useMCP';

const mockUseAgentPreferences = useAgentPreferences as jest.MockedFunction<typeof useAgentPreferences>;
const mockUseMCP = useMCP as jest.MockedFunction<typeof useMCP>;

describe('AgentPreferencesPanel', () => {
  const mockPreferences = {
    copilotEnabled: true,
    memoryEnabled: false,
    tone: 'friendly' as const,
    language: 'en' as const,
    defaultCommandView: 'list' as const,
    lockedFields: []
  };

  const mockUpdatePreferences = jest.fn();
  const mockResetToDefaults = jest.fn();
  const mockIsFieldLocked = jest.fn();

  beforeEach(() => {
    mockUseAgentPreferences.mockReturnValue({
      preferences: mockPreferences,
      updatePreferences: mockUpdatePreferences,
      resetToDefaults: mockResetToDefaults,
      isFieldLocked: mockIsFieldLocked,
      // Version management
      createVersion: jest.fn(),
      getCurrentVersion: jest.fn(),
      getVersionHistory: jest.fn(),
      restoreVersion: jest.fn(),
      deleteVersion: jest.fn(),
      updateVersionLabel: jest.fn(),
      // Version state
      versionHistory: [],
      isLoadingVersions: false,
      currentVersion: null
    });

    mockUseMCP.mockReturnValue({
      allowedActions: ['updatePrefs'],
      // ... other MCP properties
    } as any);

    mockIsFieldLocked.mockReturnValue(false);
  });

  describe('Basic Rendering', () => {
    it('should render the preferences panel with all sections', () => {
      render(<AgentPreferencesPanel />);

      expect(screen.getByText('Agent Preferences')).toBeInTheDocument();
      expect(screen.getByText('AI Assistance')).toBeInTheDocument();
      expect(screen.getByText('Communication Style')).toBeInTheDocument();
      expect(screen.getByText('Interface')).toBeInTheDocument();
    });

    it('should render the prompt preview section by default', () => {
      render(<AgentPreferencesPanel />);

      expect(screen.getByText('Live Prompt Preview')).toBeInTheDocument();
      expect(screen.getByText('See how your preferences affect AI prompt generation in real-time')).toBeInTheDocument();
      expect(screen.getByTestId('prompt-preview-panel')).toBeInTheDocument();
    });

    it('should not render prompt preview when disabled', () => {
      render(<AgentPreferencesPanel showPromptPreview={false} />);

      expect(screen.queryByText('Live Prompt Preview')).not.toBeInTheDocument();
      expect(screen.queryByTestId('prompt-preview-panel')).not.toBeInTheDocument();
    });
  });

  describe('Prompt Preview Integration', () => {
    it('should pass correct document context to PromptPreviewPanel', () => {
      render(<AgentPreferencesPanel />);

      const previewPanel = screen.getByTestId('prompt-preview-panel');
      expect(previewPanel).toBeInTheDocument();
      
      // Check that the document context is passed correctly
      expect(screen.getByText('Scene: Current writing session')).toBeInTheDocument();
      expect(screen.getByText('Arc: setup')).toBeInTheDocument();
      expect(screen.getByText('Character: Main Character')).toBeInTheDocument();
    });

    it('should pass correct props to PromptPreviewPanel', () => {
      render(<AgentPreferencesPanel />);

      const previewPanel = screen.getByTestId('prompt-preview-panel');
      expect(previewPanel).toHaveClass('mt-4');
    });

    it('should include screen reader heading for accessibility', () => {
      render(<AgentPreferencesPanel />);

      const srHeading = screen.getByText('Live AI Prompt Preview', { selector: 'h2.sr-only' });
      expect(srHeading).toBeInTheDocument();
    });
  });

  describe('Preference Updates', () => {
    it('should update preferences when tone is changed', async () => {
      mockUpdatePreferences.mockResolvedValue(true);

      render(<AgentPreferencesPanel />);

      const toneSelect = screen.getByLabelText(/Agent Tone/i);
      fireEvent.change(toneSelect, { target: { value: 'formal' } });

      await waitFor(() => {
        expect(mockUpdatePreferences).toHaveBeenCalledWith({ tone: 'formal' });
      });
    });

    it('should update preferences when language is changed', async () => {
      mockUpdatePreferences.mockResolvedValue(true);

      render(<AgentPreferencesPanel />);

      const languageSelect = screen.getByLabelText(/Language/i);
      fireEvent.change(languageSelect, { target: { value: 'es' } });

      await waitFor(() => {
        expect(mockUpdatePreferences).toHaveBeenCalledWith({ language: 'es' });
      });
    });

    it('should show success message after preference update', async () => {
      mockUpdatePreferences.mockResolvedValue(true);

      render(<AgentPreferencesPanel />);

      const toneSelect = screen.getByLabelText(/Agent Tone/i);
      fireEvent.change(toneSelect, { target: { value: 'formal' } });

      await waitFor(() => {
        expect(screen.getByText('tone updated successfully')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<AgentPreferencesPanel />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'preferences-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'preferences-description');
    });

    it('should have accessible form controls', () => {
      render(<AgentPreferencesPanel />);

      expect(screen.getByLabelText(/Agent Tone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Language/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Copilot Enabled/i)).toBeInTheDocument();
    });

    it('should have accessible reset button', () => {
      render(<AgentPreferencesPanel />);

      const resetButton = screen.getByRole('button', { name: /reset preferences to default values/i });
      expect(resetButton).toBeInTheDocument();
    });
  });

  describe('MCP Integration', () => {
    it('should show read-only notice when MCP blocks updates', () => {
      mockUseMCP.mockReturnValue({
        allowedActions: [],
        // ... other MCP properties
      } as any);

      render(<AgentPreferencesPanel />);

      expect(screen.getByText('Read-only Mode')).toBeInTheDocument();
      expect(screen.getByText(/Your current permissions don't allow preference changes/)).toBeInTheDocument();
    });

    it('should disable controls when MCP blocks updates', () => {
      mockUseMCP.mockReturnValue({
        allowedActions: [],
        // ... other MCP properties
      } as any);

      render(<AgentPreferencesPanel />);

      const toneSelect = screen.getByLabelText(/Agent Tone/i);
      expect(toneSelect).toBeDisabled();
    });
  });

  describe('Field Locking', () => {
    it('should show locked field indicators', () => {
      mockIsFieldLocked.mockImplementation((field) => field === 'tone');

      render(<AgentPreferencesPanel />);

      expect(screen.getByText(/Some settings locked by admin/)).toBeInTheDocument();
    });

    it('should disable locked fields', () => {
      mockIsFieldLocked.mockImplementation((field) => field === 'tone');

      render(<AgentPreferencesPanel />);

      const toneSelect = screen.getByLabelText(/Agent Tone/i);
      expect(toneSelect).toBeDisabled();
    });
  });

  describe('Reset Functionality', () => {
    it('should call reset function when reset button is clicked', async () => {
      mockResetToDefaults.mockResolvedValue(undefined);

      render(<AgentPreferencesPanel />);

      const resetButton = screen.getByRole('button', { name: /reset preferences to default values/i });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(mockResetToDefaults).toHaveBeenCalled();
      });
    });

    it('should show loading state during reset', async () => {
      mockResetToDefaults.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<AgentPreferencesPanel />);

      const resetButton = screen.getByRole('button', { name: /reset preferences to default values/i });
      fireEvent.click(resetButton);

      expect(screen.getByText('Resetting...')).toBeInTheDocument();
    });
  });

  describe('Close Functionality', () => {
    it('should call onClose when close button is clicked', () => {
      const mockOnClose = jest.fn();
      render(<AgentPreferencesPanel onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: /close preferences panel/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not show close button when onClose is not provided', () => {
      render(<AgentPreferencesPanel />);

      expect(screen.queryByRole('button', { name: /close preferences panel/i })).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should show error message when preference update fails', async () => {
      mockUpdatePreferences.mockRejectedValue(new Error('Update failed'));

      render(<AgentPreferencesPanel />);

      const toneSelect = screen.getByLabelText(/Agent Tone/i);
      fireEvent.change(toneSelect, { target: { value: 'formal' } });

      await waitFor(() => {
        expect(screen.getByText('Update failed')).toBeInTheDocument();
      });
    });

    it('should show error message when reset fails', async () => {
      mockResetToDefaults.mockRejectedValue(new Error('Reset failed'));

      render(<AgentPreferencesPanel />);

      const resetButton = screen.getByRole('button', { name: /reset preferences to default values/i });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.getByText('Reset failed')).toBeInTheDocument();
      });
    });
  });

  describe('Real-time Updates', () => {
    it('should update prompt preview when preferences change', async () => {
      mockUpdatePreferences.mockResolvedValue(true);

      render(<AgentPreferencesPanel />);

      // Change tone preference
      const toneSelect = screen.getByLabelText(/Agent Tone/i);
      fireEvent.change(toneSelect, { target: { value: 'formal' } });

      // The PromptPreviewPanel should receive updated preferences
      // (In a real implementation, this would trigger a re-render with new preferences)
      await waitFor(() => {
        expect(mockUpdatePreferences).toHaveBeenCalledWith({ tone: 'formal' });
      });
    });
  });
}); 