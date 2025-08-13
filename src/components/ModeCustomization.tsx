// MCP Context Block
/*
{
  file: "ModeCustomization.tsx",
  role: "frontend-developer",
  allowedActions: ["ui", "customization", "preferences"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "mode_customization"
}
*/

import React, { useState } from 'react';
import { SystemMode, ModeConfiguration } from '../types/systemModes';

interface ModeCustomizationProps {
  currentMode: SystemMode;
  modeConfig: ModeConfiguration;
  onConfigUpdate: (updates: Partial<ModeConfiguration>) => void;
}

/**
 * Mode Customization Component
 *
 * @description Allows users to fine-tune the settings for their current mode
 */
export const ModeCustomization: React.FC<ModeCustomizationProps> = ({
  currentMode,
  modeConfig,
  onConfigUpdate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localConfig, setLocalConfig] = useState<ModeConfiguration>(modeConfig);

  /**
   * Handle configuration change
   */
  const handleConfigChange = (field: keyof ModeConfiguration, value: any) => {
    const updatedConfig = { ...localConfig, [field]: value };
    setLocalConfig(updatedConfig);
    onConfigUpdate(updatedConfig);
  };

  /**
   * Reset to default configuration
   */
  const handleReset = () => {
    const defaultConfig = getDefaultConfig(currentMode);
    setLocalConfig(defaultConfig);
    onConfigUpdate(defaultConfig);
  };

  /**
   * Get default configuration for a mode
   */
  const getDefaultConfig = (mode: SystemMode): ModeConfiguration => {
    const defaults = {
      MANUAL: {
        mode: 'MANUAL',
        aiInitiativeLevel: 'MINIMAL',
        suggestionFrequency: 'ON_REQUEST',
        userControlLevel: 100,
        interventionStyle: 'SILENT',
        autoEnhancement: false,
        realTimeAnalysis: false,
        proactiveSuggestions: false,
      },
      HYBRID: {
        mode: 'HYBRID',
        aiInitiativeLevel: 'RESPONSIVE',
        suggestionFrequency: 'CONTEXTUAL',
        userControlLevel: 70,
        interventionStyle: 'GENTLE',
        autoEnhancement: true,
        realTimeAnalysis: true,
        proactiveSuggestions: true,
      },
      FULLY_AUTO: {
        mode: 'FULLY_AUTO',
        aiInitiativeLevel: 'PROACTIVE',
        suggestionFrequency: 'CONTINUOUS',
        userControlLevel: 30,
        interventionStyle: 'COMPREHENSIVE',
        autoEnhancement: true,
        realTimeAnalysis: true,
        proactiveSuggestions: true,
      },
    };

    return defaults[mode];
  };

  return (
    <div className="mode-customization">
      <div className="mode-customization__header">
        <button
          className="mode-customization__toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          <span>Customize {currentMode} Mode</span>
          <span className="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
        </button>

        <button
          className="mode-customization__reset"
          onClick={handleReset}
          title="Reset to default settings"
        >
          Reset
        </button>
      </div>

      {isExpanded && (
        <div className="mode-customization__content">
          {/* AI Initiative Level */}
          <div className="config-group">
            <label className="config-label">
              AI Initiative Level
              <span className="config-description">
                How proactive the AI should be in offering assistance
              </span>
            </label>
            <select
              value={localConfig.aiInitiativeLevel}
              onChange={e =>
                handleConfigChange('aiInitiativeLevel', e.target.value)
              }
              className="config-select"
            >
              <option value="MINIMAL">Minimal - Only when asked</option>
              <option value="RESPONSIVE">
                Responsive - When context suggests help
              </option>
              <option value="PROACTIVE">
                Proactive - Actively suggest improvements
              </option>
            </select>
          </div>

          {/* Suggestion Frequency */}
          <div className="config-group">
            <label className="config-label">
              Suggestion Frequency
              <span className="config-description">
                How often the AI provides suggestions and insights
              </span>
            </label>
            <select
              value={localConfig.suggestionFrequency}
              onChange={e =>
                handleConfigChange('suggestionFrequency', e.target.value)
              }
              className="config-select"
            >
              <option value="NONE">None - No automatic suggestions</option>
              <option value="ON_REQUEST">On Request - Only when you ask</option>
              <option value="CONTEXTUAL">
                Contextual - When it would be helpful
              </option>
              <option value="CONTINUOUS">
                Continuous - Real-time analysis
              </option>
            </select>
          </div>

          {/* User Control Level */}
          <div className="config-group">
            <label className="config-label">
              User Control Level
              <span className="config-description">
                How much control you maintain over AI actions (0-100%)
              </span>
            </label>
            <div className="slider-container">
              <input
                type="range"
                min="0"
                max="100"
                value={localConfig.userControlLevel}
                onChange={e =>
                  handleConfigChange(
                    'userControlLevel',
                    parseInt(e.target.value)
                  )
                }
                className="config-slider"
              />
              <span className="slider-value">
                {localConfig.userControlLevel}%
              </span>
            </div>
          </div>

          {/* Intervention Style */}
          <div className="config-group">
            <label className="config-label">
              Intervention Style
              <span className="config-description">
                How AI suggestions and interventions are presented
              </span>
            </label>
            <select
              value={localConfig.interventionStyle}
              onChange={e =>
                handleConfigChange('interventionStyle', e.target.value)
              }
              className="config-select"
            >
              <option value="SILENT">Silent - Background analysis</option>
              <option value="GENTLE">Gentle - Subtle, non-intrusive</option>
              <option value="ACTIVE">Active - Visible, engaging</option>
              <option value="COMPREHENSIVE">
                Comprehensive - Full-featured guidance
              </option>
            </select>
          </div>

          {/* Boolean Settings */}
          <div className="config-group">
            <label className="config-label">Feature Toggles</label>
            <div className="toggle-group">
              <label className="toggle-item">
                <input
                  type="checkbox"
                  checked={localConfig.autoEnhancement}
                  onChange={e =>
                    handleConfigChange('autoEnhancement', e.target.checked)
                  }
                  className="config-checkbox"
                />
                <span className="toggle-label">Automatic Enhancements</span>
                <span className="toggle-description">
                  AI automatically improves your writing
                </span>
              </label>

              <label className="toggle-item">
                <input
                  type="checkbox"
                  checked={localConfig.realTimeAnalysis}
                  onChange={e =>
                    handleConfigChange('realTimeAnalysis', e.target.checked)
                  }
                  className="config-checkbox"
                />
                <span className="toggle-label">Real-time Analysis</span>
                <span className="toggle-description">
                  Continuous analysis as you write
                </span>
              </label>

              <label className="toggle-item">
                <input
                  type="checkbox"
                  checked={localConfig.proactiveSuggestions}
                  onChange={e =>
                    handleConfigChange('proactiveSuggestions', e.target.checked)
                  }
                  className="config-checkbox"
                />
                <span className="toggle-label">Proactive Suggestions</span>
                <span className="toggle-description">
                  AI suggests improvements before you ask
                </span>
              </label>
            </div>
          </div>

          {/* Mode-specific Tips */}
          <div className="mode-tips">
            <h4>Tips for {currentMode} Mode</h4>
            {currentMode === 'MANUAL' && (
              <ul>
                <li>Use the "Ask AI" button when you need assistance</li>
                <li>All suggestions require your approval</li>
                <li>Perfect for writers who prefer full control</li>
              </ul>
            )}
            {currentMode === 'HYBRID' && (
              <ul>
                <li>Review suggestions before applying them</li>
                <li>AI will offer help when context suggests it's needed</li>
                <li>Balanced approach for collaborative writing</li>
              </ul>
            )}
            {currentMode === 'FULLY_AUTO' && (
              <ul>
                <li>AI will continuously enhance your writing</li>
                <li>You can always override automatic changes</li>
                <li>Best for rapid iteration and improvement</li>
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeCustomization;
