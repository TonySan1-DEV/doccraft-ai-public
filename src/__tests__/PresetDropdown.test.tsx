// MCP Context Block
/*
{
  file: "PresetDropdown.test.tsx",
  role: "test-developer",
  allowedActions: ["test", "validate"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "preset_dropdown"
}
*/

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PresetDropdown } from '../components/PresetDropdown';
import { presetService } from '../services/presetService';
import { useAgentPreferences } from '../contexts/AgentPreferencesContext';

// Mock the dependencies
jest.mock('../contexts/AgentPreferencesContext');
jest.mock('../services/presetService');

const mockUseAgentPreferences = useAgentPreferences as jest.MockedFunction<typeof useAgentPreferences>;
const mockPresetService = presetService as jest.Mocked<typeof presetService>;

describe('PresetDropdown', () => {
  const mockPreferences = {
    tone: 'friendly' as const,
    language: 'en' as const,
    copilotEnabled: true,
    memoryEnabled: true,
    defaultCommandView: 'list' as const,
    lockedFields: []
  };

  const mockUpdatePreferences = jest.fn();
  const mockOnPresetApplied = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAgentPreferences.mockReturnValue({
      preferences: mockPreferences,
      updatePreferences: mockUpdatePreferences,
      resetToDefaults: jest.fn(),
      isFieldLocked: jest.fn(),
      onPreferencesChange: jest.fn(),
      createVersion: jest.fn(),
      getCurrentVersion: jest.fn(),
      getVersionHistory: jest.fn(),
      restoreVersion: jest.fn(),
      deleteVersion: jest.fn(),
      updateVersionLabel: jest.fn(),
      versionHistory: [],
      isLoadingVersions: false,
      currentVersion: null
    });

    mockPresetService.getAllPresets.mockReturnValue([
      {
        name: 'Fast Draft',
        description: 'Optimized for rapid content creation',
        icon: '⚡',
        category: 'writing',
        preferences: {
          tone: 'friendly' as const,
          copilotEnabled: true,
          memoryEnabled: true
        },
        tags: ['quick', 'draft'],
        isPopular: true
      },
      {
        name: 'Editor Mode',
        description: 'Focused editing with minimal distractions',
        icon: '✏️',
        category: 'editing',
        preferences: {
          tone: 'concise' as const,
          copilotEnabled: false,
          memoryEnabled: false
        },
        tags: ['editing', 'focused']
      }
    ]);

    mockPresetService.applyPreset.mockResolvedValue({
      success: true,
      appliedPreferences: {
        ...mockPreferences,
        tone: 'concise' as const,
        copilotEnabled: false
      }
    });

    mockPresetService.addToRecentlyUsed.mockImplementation(() => {});
    mockPresetService.incrementPresetUsage.mockImplementation(() => {});
  });

  describe('Rendering', () => {
    it('should render the dropdown trigger button', () => {
      render(<PresetDropdown />);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Select Preset')).toBeInTheDocument();
    });

    it('should show current active preset when preferences match', () => {
      mockPresetService.getAllPresets.mockReturnValue([
        {
          name: 'Fast Draft',
          description: 'Optimized for rapid content creation',
          icon: '⚡',
          category: 'writing',
          preferences: mockPreferences,
          tags: ['quick', 'draft'],
          isPopular: true
        }
      ]);

      render(<PresetDropdown />);
      
      expect(screen.getByText('⚡ Fast Draft')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should show custom state when no exact match found', () => {
      mockPresetService.getAllPresets.mockReturnValue([
        {
          name: 'Fast Draft',
          description: 'Optimized for rapid content creation',
          icon: '⚡',
          category: 'writing',
          preferences: {
            ...mockPreferences,
            tone: 'formal' as const // Different from current preferences
          },
          tags: ['quick', 'draft'],
          isPopular: true
        }
      ]);

      render(<PresetDropdown />);
      
      expect(screen.getByText('Custom Settings')).toBeInTheDocument();
      expect(screen.getByText('Custom')).toBeInTheDocument();
    });
  });

  describe('Dropdown Interaction', () => {
    it('should open dropdown when clicked', () => {
      render(<PresetDropdown />);
      
      const triggerButton = screen.getByRole('button');
      fireEvent.click(triggerButton);
      
      expect(screen.getByText('Popular Presets')).toBeInTheDocument();
      expect(screen.getByText('⚡ Fast Draft')).toBeInTheDocument();
    });

    it('should close dropdown when clicking outside', async () => {
      render(<PresetDropdown />);
      
      const triggerButton = screen.getByRole('button');
      fireEvent.click(triggerButton);
      
      expect(screen.getByText('Popular Presets')).toBeInTheDocument();
      
      // Click outside
      fireEvent.mouseDown(document.body);
      
      await waitFor(() => {
        expect(screen.queryByText('Popular Presets')).not.toBeInTheDocument();
      });
    });

    it('should close dropdown when applying a preset', async () => {
      render(<PresetDropdown onPresetApplied={mockOnPresetApplied} />);
      
      const triggerButton = screen.getByRole('button');
      fireEvent.click(triggerButton);
      
      const presetButton = screen.getByText('⚡ Fast Draft');
      fireEvent.click(presetButton);
      
      await waitFor(() => {
        expect(mockUpdatePreferences).toHaveBeenCalled();
        expect(mockOnPresetApplied).toHaveBeenCalled();
        expect(screen.queryByText('Popular Presets')).not.toBeInTheDocument();
      });
    });
  });

  describe('Preset Application', () => {
    it('should apply preset and update preferences', async () => {
      render(<PresetDropdown onPresetApplied={mockOnPresetApplied} />);
      
      const triggerButton = screen.getByRole('button');
      fireEvent.click(triggerButton);
      
      const presetButton = screen.getByText('⚡ Fast Draft');
      fireEvent.click(presetButton);
      
      await waitFor(() => {
        expect(mockPresetService.applyPreset).toHaveBeenCalledWith(
          'Fast Draft',
          mockPreferences,
          expect.objectContaining({
            createVersion: true,
            versionLabel: 'Applied preset: Fast Draft',
            mergeMode: 'replace'
          })
        );
        
        expect(mockUpdatePreferences).toHaveBeenCalledWith(
          expect.objectContaining({
            tone: 'concise',
            copilotEnabled: false
          })
        );
        
        expect(mockOnPresetApplied).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Fast Draft'
          })
        );
      });
    });

    it('should handle preset application errors', async () => {
      mockPresetService.applyPreset.mockResolvedValue({
        success: false,
        appliedPreferences: mockPreferences,
        error: 'Failed to apply preset'
      });

      render(<PresetDropdown />);
      
      const triggerButton = screen.getByRole('button');
      fireEvent.click(triggerButton);
      
      const presetButton = screen.getByText('⚡ Fast Draft');
      fireEvent.click(presetButton);
      
      await waitFor(() => {
        expect(mockUpdatePreferences).not.toHaveBeenCalled();
      });
    });

    it('should track usage when preset is applied', async () => {
      render(<PresetDropdown />);
      
      const triggerButton = screen.getByRole('button');
      fireEvent.click(triggerButton);
      
      const presetButton = screen.getByText('⚡ Fast Draft');
      fireEvent.click(presetButton);
      
      await waitFor(() => {
        expect(mockPresetService.addToRecentlyUsed).toHaveBeenCalledWith('Fast Draft');
        expect(mockPresetService.incrementPresetUsage).toHaveBeenCalledWith('Fast Draft');
      });
    });
  });

  describe('Custom Preset Saving', () => {
    it('should show save dialog when custom state and save option enabled', () => {
      // Mock custom state (no exact match)
      mockPresetService.getAllPresets.mockReturnValue([
        {
          name: 'Fast Draft',
          description: 'Optimized for rapid content creation',
          icon: '⚡',
          category: 'writing',
          preferences: {
            ...mockPreferences,
            tone: 'formal' as const // Different from current preferences
          },
          tags: ['quick', 'draft'],
          isPopular: true
        }
      ]);

      render(<PresetDropdown showCustomSave={true} />);
      
      const triggerButton = screen.getByRole('button');
      fireEvent.click(triggerButton);
      
      expect(screen.getByText('💾 Save Current Settings as Preset')).toBeInTheDocument();
    });

    it('should not show save dialog when showCustomSave is false', () => {
      render(<PresetDropdown showCustomSave={false} />);
      
      const triggerButton = screen.getByRole('button');
      fireEvent.click(triggerButton);
      
      expect(screen.queryByText('💾 Save Current Settings as Preset')).not.toBeInTheDocument();
    });

    it('should open save dialog when save button is clicked', () => {
      render(<PresetDropdown showCustomSave={true} />);
      
      const triggerButton = screen.getByRole('button');
      fireEvent.click(triggerButton);
      
      const saveButton = screen.getByText('💾 Save Current Settings as Preset');
      fireEvent.click(saveButton);
      
      expect(screen.getByText('Save Current Settings')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter preset name...')).toBeInTheDocument();
    });

    it('should create custom preset when save dialog is submitted', async () => {
      mockPresetService.createCustomPreset.mockResolvedValue({
        name: 'My Custom Preset',
        description: 'Custom preset saved on 1/1/2024',
        icon: '💾',
        category: 'writing',
        preferences: mockPreferences,
        tags: ['custom', 'saved'],
        id: 'custom-1',
        userId: 'user-1',
        createdAt: '2024-01-01T00:00:00Z',
        isCustom: true
      });

      render(<PresetDropdown showCustomSave={true} />);
      
      const triggerButton = screen.getByRole('button');
      fireEvent.click(triggerButton);
      
      const saveButton = screen.getByText('💾 Save Current Settings as Preset');
      fireEvent.click(saveButton);
      
      const nameInput = screen.getByPlaceholderText('Enter preset name...');
      fireEvent.change(nameInput, { target: { value: 'My Custom Preset' } });
      
      const submitButton = screen.getByText('Save Preset');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockPresetService.createCustomPreset).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'My Custom Preset',
            preferences: mockPreferences
          }),
          'current-user-id'
        );
      });
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize preset names', () => {
      render(<PresetDropdown showCustomSave={true} />);
      
      const triggerButton = screen.getByRole('button');
      fireEvent.click(triggerButton);
      
      const saveButton = screen.getByText('💾 Save Current Settings as Preset');
      fireEvent.click(saveButton);
      
      const nameInput = screen.getByPlaceholderText('Enter preset name...');
      
      // Test invalid characters
      fireEvent.change(nameInput, { target: { value: 'Invalid<>:"/\\|?*Name' } });
      expect(nameInput).toHaveValue('InvalidName');
      
      // Test length limit
      const longName = 'A'.repeat(60);
      fireEvent.change(nameInput, { target: { value: longName } });
      expect(nameInput).toHaveValue(longName.substring(0, 50));
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<PresetDropdown />);
      
      const triggerButton = screen.getByRole('button');
      expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
      
      fireEvent.click(triggerButton);
      expect(triggerButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should handle keyboard navigation', () => {
      render(<PresetDropdown />);
      
      const triggerButton = screen.getByRole('button');
      triggerButton.focus();
      
      // Test Enter key
      fireEvent.keyDown(triggerButton, { key: 'Enter' });
      expect(screen.getByText('Popular Presets')).toBeInTheDocument();
      
      // Test Escape key
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByText('Popular Presets')).not.toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading state when applying preset', async () => {
      // Mock slow preset application
      mockPresetService.applyPreset.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          appliedPreferences: mockPreferences
        }), 100))
      );

      render(<PresetDropdown />);
      
      const triggerButton = screen.getByRole('button');
      fireEvent.click(triggerButton);
      
      const presetButton = screen.getByText('⚡ Fast Draft');
      fireEvent.click(presetButton);
      
      // Should be disabled during loading
      expect(triggerButton).toBeDisabled();
      
      await waitFor(() => {
        expect(triggerButton).not.toBeDisabled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      mockPresetService.applyPreset.mockRejectedValue(new Error('Service error'));

      render(<PresetDropdown />);
      
      const triggerButton = screen.getByRole('button');
      fireEvent.click(triggerButton);
      
      const presetButton = screen.getByText('⚡ Fast Draft');
      fireEvent.click(presetButton);
      
      await waitFor(() => {
        expect(mockUpdatePreferences).not.toHaveBeenCalled();
      });
    });

    it('should handle invalid preset data', () => {
      mockPresetService.getAllPresets.mockReturnValue([
        {
          name: 'Invalid Preset',
          description: 'Invalid preset',
          icon: '❌',
          category: 'writing',
          preferences: {
            tone: 'invalid-tone' as any, // Invalid preference
            copilotEnabled: true
          },
          tags: ['invalid']
        }
      ]);

      render(<PresetDropdown />);
      
      // Should not crash and should still render
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
}); 