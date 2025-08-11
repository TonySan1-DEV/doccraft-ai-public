// MCP Context Block
/*
{
  file: "AgentPreferencesPanel.tsx",
  role: "frontend-developer",
  allowedActions: ["preferences", "ui", "accessibility"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "agent_preferences"
}
*/

import { useState, useCallback, useEffect } from 'react';
import { useAgentPreferences } from '../contexts/AgentPreferencesContext';
import { useMCP } from '../useMCP';
import { AgentTone } from '../types/agentPreferences';
import { PreferenceToggle } from './PreferenceToggle';
import { PreferenceSelect } from './PreferenceSelect';
import { PromptPreviewPane } from './PromptPreviewPane';
import { PreferenceVersionHistory } from './PreferenceVersionHistory';
import { PresetSelector } from './PresetSelector';
import { PresetDropdown } from './PresetDropdown';
import { AGENT_PREFERENCES_HELP } from '../constants/helpText';
import type { DocumentContext } from '../agent/ContextualPromptEngine';

// Language options with labels
const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'ja', label: '日本語' },
  { value: 'zh', label: '中文' },
  { value: 'ko', label: '한국어' },
] as const;

// Tone options with descriptions
const TONE_OPTIONS = [
  {
    value: 'friendly',
    label: 'Friendly',
    description: 'Warm and approachable',
  },
  {
    value: 'formal',
    label: 'Formal',
    description: 'Professional and structured',
  },
  { value: 'concise', label: 'Concise', description: 'Brief and direct' },
] as const;

// Genre options for onboarding
const GENRE_OPTIONS = [
  {
    value: 'Adventure',
    label: 'Adventure',
    description: 'Action-packed stories',
  },
  {
    value: 'Essay',
    label: 'Essay',
    description: 'Academic and analytical writing',
  },
  {
    value: 'Romance',
    label: 'Romance',
    description: 'Emotional and relationship-focused',
  },
  {
    value: 'Mystery',
    label: 'Mystery',
    description: 'Suspense and detective stories',
  },
  {
    value: 'SciFi',
    label: 'Science Fiction',
    description: 'Futuristic and speculative',
  },
  {
    value: 'General',
    label: 'General',
    description: 'Versatile for any content',
  },
] as const;

// Command view options
const COMMAND_VIEW_OPTIONS = [
  { value: 'list', label: 'List View', description: 'Vertical command list' },
  { value: 'grid', label: 'Grid View', description: 'Command grid layout' },
] as const;

// Onboarding step types
type OnboardingStep = 'tone' | 'genre' | 'copilot' | 'memory' | 'complete';

interface OnboardingState {
  isActive: boolean;
  currentStep: OnboardingStep;
  tempPreferences: {
    tone: AgentTone;
    genre: string;
    copilot: boolean;
    memory: boolean;
  };
}

interface AgentPreferencesPanelProps {
  className?: string;
  onClose?: () => void;
  showResetButton?: boolean;
  showPromptPreview?: boolean;
  promptPreviewProps?: {
    showFallbackDiagnostics?: boolean;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
  };
}

// Help Tooltip Component
interface HelpTooltipProps {
  helpKey: keyof typeof AGENT_PREFERENCES_HELP;
  children: React.ReactNode;
  className?: string;
}

function HelpTooltip({ helpKey, children, className = '' }: HelpTooltipProps) {
  const helpText = AGENT_PREFERENCES_HELP[helpKey];

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {children}
      <div className="relative group">
        <button
          type="button"
          className="inline-flex items-center justify-center w-4 h-4 text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
          aria-label={`Help for ${helpText.title}`}
        >
          ?
        </button>

        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none z-50 max-w-xs">
          <div className="font-medium mb-1">{helpText.title}</div>
          <div className="text-gray-300 dark:text-gray-400">
            {helpText.description}
          </div>

          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
        </div>
      </div>
    </div>
  );
}

export function AgentPreferencesPanel({
  className = '',
  onClose,
  showResetButton = true,
  showPromptPreview = true,
  promptPreviewProps = {},
}: AgentPreferencesPanelProps) {
  const {
    preferences,
    updatePreferences,
    resetToDefaults,
    isFieldLocked,
    createVersion,
  } = useAgentPreferences();
  const mcp = useMCP('AgentPreferencesPanel.tsx');
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'preferences' | 'versions' | 'presets'
  >('preferences');
  const [showVersionLabelDialog, setShowVersionLabelDialog] = useState(false);
  const [versionLabel, setVersionLabel] = useState('');

  // Onboarding state
  const [onboarding, setOnboarding] = useState<OnboardingState>({
    isActive: false,
    currentStep: 'tone',
    tempPreferences: {
      tone: 'friendly' as AgentTone,
      genre: 'General',
      copilot: false,
      memory: false,
    },
  });

  // Check if user can update preferences
  const canUpdatePrefs = mcp.allowedActions.includes('updatePrefs');

  // Create document context for prompt preview
  const documentContext: DocumentContext = {
    scene: 'Current writing session',
    arc: 'setup',
    characterName: 'Main Character',
  };

  // Detect first-time users
  useEffect(() => {
    const checkFirstTimeUser = () => {
      // Check if user has any saved preferences
      const hasPreferences =
        preferences &&
        (preferences.tone !== 'friendly' ||
          preferences.genre !== 'General' ||
          preferences.copilot !== false ||
          preferences.memory !== false);

      // Check if onboarding was previously skipped
      const onboardingSkipped =
        localStorage.getItem('onboardingSkipped') === 'true';

      // Show onboarding if no preferences and not previously skipped
      if (!hasPreferences && !onboardingSkipped) {
        setOnboarding(prev => ({
          ...prev,
          isActive: true,
          currentStep: 'tone',
        }));
      }
    };

    checkFirstTimeUser();
  }, [preferences]);

  // Handle preference updates with feedback
  const handlePreferenceUpdate = useCallback(
    async (
      field: keyof typeof preferences,
      value: string | number | boolean
    ) => {
      if (!canUpdatePrefs) {
        console.warn('Preference update blocked by MCP policy');
        return;
      }

      if (isFieldLocked(field)) {
        console.warn(`Field ${field} is locked by admin policy`);
        return;
      }

      setIsUpdating(true);
      try {
        const success = await updatePreferences({ [field]: value });
        if (success) {
          setLastUpdate(`${field} updated successfully`);
          setTimeout(() => setLastUpdate(null), 3000);
        }
      } catch (error) {
        console.error('Failed to update preference:', error);
        setLastUpdate('Update failed');
        setTimeout(() => setLastUpdate(null), 3000);
      } finally {
        setIsUpdating(false);
      }
    },
    [canUpdatePrefs, isFieldLocked, updatePreferences]
  );

  // Handle version creation
  const handleCreateVersion = useCallback(async () => {
    setShowVersionLabelDialog(true);
  }, []);

  const handleSaveVersion = useCallback(async () => {
    try {
      await createVersion({
        label: versionLabel,
        reason: 'User created version manually',
      });
      setShowVersionLabelDialog(false);
      setVersionLabel('');
      setLastUpdate('Version created successfully');
      setTimeout(() => setLastUpdate(null), 3000);
    } catch (error) {
      console.error('Failed to create version:', error);
      setLastUpdate('Version creation failed');
      setTimeout(() => setLastUpdate(null), 3000);
    }
  }, [createVersion, versionLabel]);

  // Handle reset to defaults
  const handleReset = useCallback(async () => {
    if (!canUpdatePrefs) {
      console.warn('Reset blocked by MCP policy');
      return;
    }

    setIsUpdating(true);
    try {
      await resetToDefaults();
      setLastUpdate('Preferences reset to defaults');
      setTimeout(() => setLastUpdate(null), 3000);
    } catch (error) {
      console.error('Failed to reset preferences:', error);
      setLastUpdate('Reset failed');
      setTimeout(() => setLastUpdate(null), 3000);
    } finally {
      setIsUpdating(false);
    }
  }, [canUpdatePrefs, resetToDefaults]);

  // Onboarding handlers
  const handleOnboardingStepUpdate = useCallback(
    (
      field: keyof typeof onboarding.tempPreferences,
      value: string | number | boolean
    ) => {
      setOnboarding(prev => ({
        ...prev,
        tempPreferences: {
          ...prev.tempPreferences,
          [field]: value,
        },
      }));
    },
    []
  );

  const handleOnboardingNext = useCallback(async () => {
    const steps: OnboardingStep[] = [
      'tone',
      'genre',
      'copilot',
      'memory',
      'complete',
    ];
    const currentIndex = steps.indexOf(onboarding.currentStep);

    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      setOnboarding(prev => ({
        ...prev,
        currentStep: nextStep,
      }));
    } else {
      // Complete onboarding
      try {
        setIsUpdating(true);
        const success = await updatePreferences(onboarding.tempPreferences);
        if (success) {
          setOnboarding(prev => ({
            ...prev,
            isActive: false,
          }));
          setLastUpdate('Onboarding completed successfully');
          setTimeout(() => setLastUpdate(null), 3000);
        }
      } catch (error) {
        console.error('Failed to save onboarding preferences:', error);
        setLastUpdate('Onboarding failed');
        setTimeout(() => setLastUpdate(null), 3000);
      } finally {
        setIsUpdating(false);
      }
    }
  }, [onboarding.currentStep, onboarding.tempPreferences, updatePreferences]);

  const handleOnboardingSkip = useCallback(() => {
    localStorage.setItem('onboardingSkipped', 'true');
    setOnboarding(prev => ({
      ...prev,
      isActive: false,
    }));
  }, []);

  const handleOnboardingBack = useCallback(() => {
    const steps: OnboardingStep[] = [
      'tone',
      'genre',
      'copilot',
      'memory',
      'complete',
    ];
    const currentIndex = steps.indexOf(onboarding.currentStep);

    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1];
      setOnboarding(prev => ({
        ...prev,
        currentStep: prevStep,
      }));
    }
  }, [onboarding.currentStep]);

  // Onboarding Modal Component
  const OnboardingModal = () => {
    if (!onboarding.isActive) return null;

    const getStepContent = () => {
      switch (onboarding.currentStep) {
        case 'tone':
          return (
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">
                Choose Your AI&apos;s Tone
              </h3>
              <p className="text-gray-600 mb-6">
                How should your AI assistant communicate with you?
              </p>
              <div className="grid gap-3">
                {TONE_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() =>
                      handleOnboardingStepUpdate('tone', option.value)
                    }
                    className={`p-4 rounded-lg border-2 transition-all ${
                      onboarding.tempPreferences.tone === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-gray-500">
                      {option.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );

        case 'genre':
          return (
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">
                Select Your Primary Genre
              </h3>
              <p className="text-gray-600 mb-6">
                What type of content do you create most often?
              </p>
              <div className="grid gap-3">
                {GENRE_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() =>
                      handleOnboardingStepUpdate('genre', option.value)
                    }
                    className={`p-4 rounded-lg border-2 transition-all ${
                      onboarding.tempPreferences.genre === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-gray-500">
                      {option.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );

        case 'copilot':
          return (
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Enable AI Copilot</h3>
              <p className="text-gray-600 mb-6">
                Should your AI actively suggest improvements and alternatives?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleOnboardingStepUpdate('copilot', true)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    onboarding.tempPreferences.copilot
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">Yes, enable copilot</div>
                  <div className="text-sm text-gray-500">
                    Get proactive suggestions
                  </div>
                </button>
                <button
                  onClick={() => handleOnboardingStepUpdate('copilot', false)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    !onboarding.tempPreferences.copilot
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">No, keep it simple</div>
                  <div className="text-sm text-gray-500">
                    Only respond when asked
                  </div>
                </button>
              </div>
            </div>
          );

        case 'memory':
          return (
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Enable Memory</h3>
              <p className="text-gray-600 mb-6">
                Should your AI remember context from previous conversations?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleOnboardingStepUpdate('memory', true)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    onboarding.tempPreferences.memory
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">Yes, enable memory</div>
                  <div className="text-sm text-gray-500">
                    Remember conversation context
                  </div>
                </button>
                <button
                  onClick={() => handleOnboardingStepUpdate('memory', false)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    !onboarding.tempPreferences.memory
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">No, start fresh each time</div>
                  <div className="text-sm text-gray-500">
                    Reset context each session
                  </div>
                </button>
              </div>
            </div>
          );

        case 'complete':
          return (
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Setup Complete!</h3>
              <p className="text-gray-600 mb-6">
                Your AI assistant is ready to help you create amazing content.
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <h4 className="font-medium mb-2">Your Configuration:</h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <div>
                    Tone:{' '}
                    {
                      TONE_OPTIONS.find(
                        t => t.value === onboarding.tempPreferences.tone
                      )?.label
                    }
                  </div>
                  <div>
                    Genre:{' '}
                    {
                      GENRE_OPTIONS.find(
                        g => g.value === onboarding.tempPreferences.genre
                      )?.label
                    }
                  </div>
                  <div>
                    Copilot:{' '}
                    {onboarding.tempPreferences.copilot
                      ? 'Enabled'
                      : 'Disabled'}
                  </div>
                  <div>
                    Memory:{' '}
                    {onboarding.tempPreferences.memory ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </div>
            </div>
          );

        default:
          return null;
      }
    };

    const getStepProgress = () => {
      const steps: OnboardingStep[] = [
        'tone',
        'genre',
        'copilot',
        'memory',
        'complete',
      ];
      const currentIndex = steps.indexOf(onboarding.currentStep);
      return ((currentIndex + 1) / steps.length) * 100;
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Setup Progress</span>
              <span>{Math.round(getStepProgress())}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getStepProgress()}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-6">{getStepContent()}</div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handleOnboardingSkip}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Skip Setup
            </button>

            <div className="flex gap-2">
              {onboarding.currentStep !== 'tone' && (
                <button
                  onClick={handleOnboardingBack}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  Back
                </button>
              )}

              <button
                onClick={handleOnboardingNext}
                disabled={isUpdating}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {onboarding.currentStep === 'complete' ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Onboarding Modal */}
      <OnboardingModal />

      {/* Main Preferences Panel */}
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md ${className}`}
        role="dialog"
        aria-labelledby="preferences-title"
        aria-describedby="preferences-description"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              id="preferences-title"
              className="text-xl font-semibold text-gray-900 dark:text-white"
            >
              Agent Preferences
            </h2>
            <p
              id="preferences-description"
              className="text-sm text-gray-600 dark:text-gray-400 mt-1"
            >
              Customize your AI assistant&apos;s behavior and appearance
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close preferences panel"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('preferences')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'preferences'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Preferences
            </button>
            <button
              onClick={() => setActiveTab('versions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'versions'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Version History
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'presets'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Presets
            </button>
          </nav>
        </div>

        {/* MCP Access Notice */}
        {!canUpdatePrefs && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                  Read-only Mode
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Your current permissions don&apos;t allow preference changes
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status Message */}
        {lastUpdate && (
          <div
            className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center">
              <svg
                className="w-4 h-4 text-green-600 dark:text-green-400 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-green-800 dark:text-green-200">
                {lastUpdate}
              </span>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'preferences' ? (
          <>
            {/* Preferences Form */}
            <form className="space-y-6" onSubmit={e => e.preventDefault()}>
              {/* Tone Selection */}
              <div>
                <HelpTooltip helpKey="tone">
                  <label
                    htmlFor="tone-select"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    AI Tone
                  </label>
                </HelpTooltip>
                <PreferenceSelect
                  id="tone-select"
                  label="AI Tone"
                  description="Choose how the AI assistant communicates with you"
                  value={preferences.tone}
                  onChange={value => handlePreferenceUpdate('tone', value)}
                  options={TONE_OPTIONS}
                  disabled={!canUpdatePrefs || isUpdating}
                  className="w-full"
                />
              </div>

              {/* Genre Selection */}
              <div>
                <HelpTooltip helpKey="genre">
                  <label
                    htmlFor="genre-select"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Primary Genre
                  </label>
                </HelpTooltip>
                <PreferenceSelect
                  id="genre-select"
                  label="Primary Genre"
                  description="Sets the primary content type for your writing"
                  value={preferences.genre ?? ''}
                  onChange={value => handlePreferenceUpdate('genre', value)}
                  options={GENRE_OPTIONS}
                  disabled={!canUpdatePrefs || isUpdating}
                  className="w-full"
                />
              </div>

              {/* Copilot Toggle */}
              <div>
                <HelpTooltip helpKey="copilot">
                  <PreferenceToggle
                    id="copilot-toggle"
                    label="AI Copilot"
                    description="Enable proactive suggestions and improvements"
                    checked={preferences.copilot ?? false}
                    onChange={checked =>
                      handlePreferenceUpdate('copilot', checked)
                    }
                    disabled={!canUpdatePrefs || isUpdating}
                  />
                </HelpTooltip>
              </div>

              {/* Memory Toggle */}
              <div>
                <HelpTooltip helpKey="memory">
                  <PreferenceToggle
                    id="memory-toggle"
                    label="Session Memory"
                    description="Remember conversation context across sessions"
                    checked={preferences.memory ?? false}
                    onChange={checked =>
                      handlePreferenceUpdate('memory', checked)
                    }
                    disabled={!canUpdatePrefs || isUpdating}
                  />
                </HelpTooltip>
              </div>

              {/* Language Selection */}
              <div>
                <HelpTooltip helpKey="language">
                  <label
                    htmlFor="language-select"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Interface Language
                  </label>
                </HelpTooltip>
                <PreferenceSelect
                  id="language-select"
                  label="Interface Language"
                  description="Choose your preferred language for the interface"
                  value={preferences.language}
                  onChange={value => handlePreferenceUpdate('language', value)}
                  options={LANGUAGE_OPTIONS}
                  disabled={!canUpdatePrefs || isUpdating}
                  className="w-full"
                />
              </div>

              {/* Command View Mode */}
              <div>
                <HelpTooltip helpKey="commandView">
                  <label
                    htmlFor="command-view-select"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Command Display
                  </label>
                </HelpTooltip>
                <PreferenceSelect
                  id="command-view-select"
                  label="Command Display"
                  description="Choose how commands are displayed in the interface"
                  value={preferences.defaultCommandView}
                  onChange={value =>
                    handlePreferenceUpdate('defaultCommandView', value)
                  }
                  options={COMMAND_VIEW_OPTIONS}
                  disabled={!canUpdatePrefs || isUpdating}
                  className="w-full"
                />
              </div>

              {/* Preset Dropdown */}
              <div>
                <HelpTooltip helpKey="preset">
                  <label
                    htmlFor="preset-select"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Quick Preset
                  </label>
                </HelpTooltip>
                <PresetDropdown
                  className="w-full"
                  showCustomSave={true}
                  showActiveIndicator={true}
                  onPresetApplied={preset => {
                    setLastUpdate(`Applied preset: ${preset.name}`);
                    setTimeout(() => setLastUpdate(null), 3000);
                  }}
                />
              </div>
            </form>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              {canUpdatePrefs && (
                <button
                  onClick={handleCreateVersion}
                  disabled={isUpdating}
                  className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Current Version
                </button>
              )}

              {showResetButton && canUpdatePrefs && (
                <button
                  onClick={handleReset}
                  disabled={isUpdating}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset to Defaults
                </button>
              )}
            </div>
          </>
        ) : activeTab === 'versions' ? (
          /* Version History Tab */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Version History
              </h3>
              {canUpdatePrefs && (
                <button
                  onClick={handleCreateVersion}
                  disabled={isUpdating}
                  className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Version
                </button>
              )}
            </div>

            <PreferenceVersionHistory
              onVersionRestored={version => {
                setLastUpdate(`Restored version ${version.version_number}`);
                setTimeout(() => setLastUpdate(null), 3000);
              }}
            />
          </div>
        ) : (
          /* Presets Tab */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Writing Presets
              </h3>
            </div>

            <PresetSelector
              onPresetApplied={preset => {
                setLastUpdate(`Applied preset: ${preset.name}`);
                setTimeout(() => setLastUpdate(null), 3000);
              }}
            />
          </div>
        )}

        {/* Version Label Dialog */}
        {showVersionLabelDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Save Current Version
              </h3>
              <div className="mb-4">
                <label
                  htmlFor="version-label"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Version Label (Optional)
                </label>
                <input
                  type="text"
                  id="version-label"
                  value={versionLabel}
                  onChange={e => setVersionLabel(e.target.value)}
                  placeholder="e.g., Fast Draft 1, Test V2"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  // autoFocus removed for accessibility
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowVersionLabelDialog(false);
                    setVersionLabel('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveVersion}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Save Version
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Prompt Preview */}
        {showPromptPreview && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <PromptPreviewPane
              documentContext={documentContext}
              showFallbackDiagnostics={
                promptPreviewProps.showFallbackDiagnostics ?? true
              }
              collapsible={promptPreviewProps.collapsible ?? true}
              defaultCollapsed={promptPreviewProps.defaultCollapsed ?? false}
              className="text-sm"
            />
          </div>
        )}
      </div>
    </>
  );
}
