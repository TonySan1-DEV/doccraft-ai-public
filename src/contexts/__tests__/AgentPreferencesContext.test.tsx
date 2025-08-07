// MCP Context Block
/*
{
  file: "AgentPreferencesContext.test.tsx",
  role: "qa-engineer",
  allowedActions: ["test", "validate", "security"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "agent_testing"
}
*/

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  AgentPreferencesProvider,
  useAgentPreferences,
} from '../AgentPreferencesContext';
import { useMCP } from '../../useMCP';

// Mock dependencies
jest.mock('../../useMCP');
jest.mock('../../utils/loadInitialPrefs');

const mockUseMCP = useMCP as jest.MockedFunction<typeof useMCP>;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockLoadInitialPrefs = require('../../utils/loadInitialPrefs')
  .loadInitialPrefs as jest.MockedFunction<any>;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock telemetry
const mockLogTelemetryEvent = jest.fn();
Object.defineProperty(window, 'logTelemetryEvent', {
  value: mockLogTelemetryEvent,
  writable: true,
});

// Test component to access context
const TestComponent = ({
  onPreferencesChange: _onPreferencesChange,
}: {
  onPreferencesChange?: () => void;
}) => {
  const { preferences, updatePreferences, resetToDefaults, isFieldLocked } =
    useAgentPreferences();

  return (
    <div>
      <div data-testid="tone">{preferences.tone}</div>
      <div data-testid="language">{preferences.language}</div>
      <div data-testid="copilot-enabled">
        {preferences.copilotEnabled.toString()}
      </div>
      <div data-testid="memory-enabled">
        {preferences.memoryEnabled.toString()}
      </div>
      <div data-testid="locked-fields">
        {preferences.lockedFields.join(',')}
      </div>
      <button
        data-testid="update-tone"
        onClick={() => updatePreferences({ tone: 'formal' })}
      >
        Update Tone
      </button>
      <button
        data-testid="update-language"
        onClick={() => updatePreferences({ language: 'es' })}
      >
        Update Language
      </button>
      <button
        data-testid="update-copilot"
        onClick={() => updatePreferences({ copilotEnabled: false })}
      >
        Toggle Copilot
      </button>
      <button data-testid="reset-defaults" onClick={() => resetToDefaults()}>
        Reset
      </button>
      <div data-testid="tone-locked">{isFieldLocked('tone').toString()}</div>
      <div data-testid="language-locked">
        {isFieldLocked('language').toString()}
      </div>
    </div>
  );
};

describe('AgentPreferencesContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    mockLogTelemetryEvent.mockImplementation(() => {});
  });

  describe('Default preferences loading', () => {
    it('should load default preferences from static fallback', async () => {
      mockLoadInitialPrefs.mockResolvedValue({
        tone: 'friendly',
        language: 'en',
        copilotEnabled: true,
        memoryEnabled: true,
        defaultCommandView: 'list',
        lockedFields: [],
      });

      mockUseMCP.mockReturnValue({
        role: 'admin',
        allowedActions: ['updatePrefs'],
        theme: 'general',
        contentSensitivity: 'low',
        tier: 'Pro',
      });

      render(
        <AgentPreferencesProvider>
          <TestComponent />
        </AgentPreferencesProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('tone')).toHaveTextContent('friendly');
        expect(screen.getByTestId('language')).toHaveTextContent('en');
        expect(screen.getByTestId('copilot-enabled')).toHaveTextContent('true');
        expect(screen.getByTestId('memory-enabled')).toHaveTextContent('true');
      });
    });

    it('should respect localStorage override', async () => {
      const storedPrefs = {
        tone: 'formal',
        language: 'es',
        copilotEnabled: false,
        memoryEnabled: false,
        defaultCommandView: 'grid',
        lockedFields: [],
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedPrefs));
      mockLoadInitialPrefs.mockResolvedValue(storedPrefs);

      mockUseMCP.mockReturnValue({
        role: 'admin',
        allowedActions: ['updatePrefs'],
        theme: 'general',
        contentSensitivity: 'low',
        tier: 'Pro',
      });

      render(
        <AgentPreferencesProvider>
          <TestComponent />
        </AgentPreferencesProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('tone')).toHaveTextContent('formal');
        expect(screen.getByTestId('language')).toHaveTextContent('es');
        expect(screen.getByTestId('copilot-enabled')).toHaveTextContent(
          'false'
        );
        expect(screen.getByTestId('memory-enabled')).toHaveTextContent('false');
      });
    });
  });

  describe('Admin policy locking', () => {
    it('should lock specified fields from admin policy', async () => {
      mockLoadInitialPrefs.mockResolvedValue({
        tone: 'friendly',
        language: 'en',
        copilotEnabled: true,
        memoryEnabled: true,
        defaultCommandView: 'list',
        lockedFields: ['tone', 'language'],
      });

      mockUseMCP.mockReturnValue({
        role: 'admin',
        allowedActions: ['updatePrefs'],
        theme: 'general',
        contentSensitivity: 'low',
        tier: 'Pro',
      });

      render(
        <AgentPreferencesProvider>
          <TestComponent />
        </AgentPreferencesProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('tone-locked')).toHaveTextContent('true');
        expect(screen.getByTestId('language-locked')).toHaveTextContent('true');
        expect(screen.getByTestId('locked-fields')).toHaveTextContent(
          'tone,language'
        );
      });
    });

    it('should prevent updates to locked fields', async () => {
      mockLoadInitialPrefs.mockResolvedValue({
        tone: 'friendly',
        language: 'en',
        copilotEnabled: true,
        memoryEnabled: true,
        defaultCommandView: 'list',
        lockedFields: ['tone'],
      });

      mockUseMCP.mockReturnValue({
        role: 'admin',
        allowedActions: ['updatePrefs'],
        theme: 'general',
        contentSensitivity: 'low',
        tier: 'Pro',
      });

      render(
        <AgentPreferencesProvider>
          <TestComponent />
        </AgentPreferencesProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('tone')).toHaveTextContent('friendly');
      });

      fireEvent.click(screen.getByTestId('update-tone'));

      await waitFor(() => {
        expect(screen.getByTestId('tone')).toHaveTextContent('friendly'); // Should not change
      });
    });
  });

  describe('Permission-based updates', () => {
    it('should allow updates when user has permission', async () => {
      mockLoadInitialPrefs.mockResolvedValue({
        tone: 'friendly',
        language: 'en',
        copilotEnabled: true,
        memoryEnabled: true,
        defaultCommandView: 'list',
        lockedFields: [],
      });

      mockUseMCP.mockReturnValue({
        role: 'admin',
        allowedActions: ['updatePrefs'],
        theme: 'general',
        contentSensitivity: 'low',
        tier: 'Pro',
      });

      render(
        <AgentPreferencesProvider>
          <TestComponent />
        </AgentPreferencesProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('tone')).toHaveTextContent('friendly');
      });

      fireEvent.click(screen.getByTestId('update-tone'));

      await waitFor(() => {
        expect(screen.getByTestId('tone')).toHaveTextContent('formal');
      });
    });

    it('should prevent updates when user lacks permission', async () => {
      mockLoadInitialPrefs.mockResolvedValue({
        tone: 'friendly',
        language: 'en',
        copilotEnabled: true,
        memoryEnabled: true,
        defaultCommandView: 'list',
        lockedFields: [],
      });

      mockUseMCP.mockReturnValue({
        role: 'viewer',
        allowedActions: ['read'],
        theme: 'general',
        contentSensitivity: 'low',
        tier: 'Basic',
      });

      render(
        <AgentPreferencesProvider>
          <TestComponent />
        </AgentPreferencesProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('tone')).toHaveTextContent('friendly');
      });

      fireEvent.click(screen.getByTestId('update-tone'));

      await waitFor(() => {
        expect(screen.getByTestId('tone')).toHaveTextContent('friendly'); // Should not change
      });
    });
  });

  describe('Preference updates', () => {
    it('should update multiple preferences at once', async () => {
      mockLoadInitialPrefs.mockResolvedValue({
        tone: 'friendly',
        language: 'en',
        copilotEnabled: true,
        memoryEnabled: true,
        defaultCommandView: 'list',
        lockedFields: [],
      });

      mockUseMCP.mockReturnValue({
        role: 'admin',
        allowedActions: ['updatePrefs'],
        theme: 'general',
        contentSensitivity: 'low',
        tier: 'Pro',
      });

      render(
        <AgentPreferencesProvider>
          <TestComponent />
        </AgentPreferencesProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('tone')).toHaveTextContent('friendly');
        expect(screen.getByTestId('language')).toHaveTextContent('en');
      });

      // Update multiple preferences
      const { updatePreferences } = useAgentPreferences();
      updatePreferences({
        tone: 'formal',
        language: 'es',
        copilotEnabled: false,
      });

      await waitFor(() => {
        expect(screen.getByTestId('tone')).toHaveTextContent('formal');
        expect(screen.getByTestId('language')).toHaveTextContent('es');
        expect(screen.getByTestId('copilot-enabled')).toHaveTextContent(
          'false'
        );
      });
    });

    it('should reset to defaults', async () => {
      mockLoadInitialPrefs.mockResolvedValue({
        tone: 'formal',
        language: 'es',
        copilotEnabled: false,
        memoryEnabled: false,
        defaultCommandView: 'grid',
        lockedFields: [],
      });

      mockUseMCP.mockReturnValue({
        role: 'admin',
        allowedActions: ['updatePrefs'],
        theme: 'general',
        contentSensitivity: 'low',
        tier: 'Pro',
      });

      render(
        <AgentPreferencesProvider>
          <TestComponent />
        </AgentPreferencesProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('tone')).toHaveTextContent('formal');
      });

      fireEvent.click(screen.getByTestId('reset-defaults'));

      await waitFor(() => {
        expect(screen.getByTestId('tone')).toHaveTextContent('friendly');
        expect(screen.getByTestId('language')).toHaveTextContent('en');
        expect(screen.getByTestId('copilot-enabled')).toHaveTextContent('true');
        expect(screen.getByTestId('memory-enabled')).toHaveTextContent('true');
      });
    });
  });

  describe('Telemetry and logging', () => {
    it('should log preference changes', async () => {
      mockLoadInitialPrefs.mockResolvedValue({
        tone: 'friendly',
        language: 'en',
        copilotEnabled: true,
        memoryEnabled: true,
        defaultCommandView: 'list',
        lockedFields: [],
      });

      mockUseMCP.mockReturnValue({
        role: 'admin',
        allowedActions: ['updatePrefs'],
        theme: 'general',
        contentSensitivity: 'low',
        tier: 'Pro',
      });

      render(
        <AgentPreferencesProvider>
          <TestComponent />
        </AgentPreferencesProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('tone')).toHaveTextContent('friendly');
      });

      fireEvent.click(screen.getByTestId('update-tone'));

      await waitFor(() => {
        expect(mockLogTelemetryEvent).toHaveBeenCalledWith(
          'preference_change',
          {
            updatedFields: ['tone'],
            timestamp: expect.any(Number),
            userTier: 'Pro',
            previousValues: { tone: 'friendly' },
          }
        );
      });
    });
  });
});
