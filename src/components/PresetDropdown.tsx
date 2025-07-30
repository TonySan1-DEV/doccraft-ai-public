// MCP Context Block
/*
{
  file: "PresetDropdown.tsx",
  role: "frontend-developer",
  allowedActions: ["ui", "presets", "preferences"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "preset_dropdown"
}
*/

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAgentPreferences } from '../contexts/AgentPreferencesContext';
import { presetService } from '../services/presetService';
import { WriterPreset, CustomPreset, popularPresets } from '../constants/writerPresets';
import { validatePresetName, sanitizePresetInput, checkPresetMatch } from '../utils/presetValidation';

interface PresetDropdownProps {
  className?: string;
  showCustomSave?: boolean;
  showActiveIndicator?: boolean;
  onPresetApplied?: (preset: WriterPreset | CustomPreset) => void;
}

export function PresetDropdown({ 
  className = '',
  showCustomSave = true,
  showActiveIndicator = true,
  onPresetApplied 
}: PresetDropdownProps) {
  const { preferences, updatePreferences } = useAgentPreferences();
  const [isOpen, setIsOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [savePresetName, setSavePresetName] = useState('');
  const [currentActivePreset, setCurrentActivePreset] = useState<WriterPreset | CustomPreset | null>(null);
  const [isCustomState, setIsCustomState] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if current preferences match any preset exactly
  useEffect(() => {
    const checkActivePreset = () => {
      const allPresets = presetService.getAllPresets();
      const exactMatch = allPresets.find(preset => 
        preset.preferences.tone === preferences.tone &&
        preset.preferences.language === preferences.language &&
        preset.preferences.copilotEnabled === preferences.copilotEnabled &&
        preset.preferences.memoryEnabled === preferences.memoryEnabled &&
        preset.preferences.defaultCommandView === preferences.defaultCommandView
      );

      setCurrentActivePreset(exactMatch || null);
      setIsCustomState(!exactMatch);
    };

    checkActivePreset();
  }, [preferences]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Apply preset immediately
  const handlePresetSelect = useCallback(async (preset: WriterPreset | CustomPreset) => {
    setIsApplying(true);
    try {
      const result = await presetService.applyPreset(preset.name, preferences, {
        createVersion: true,
        versionLabel: `Applied preset: ${preset.name}`,
        mergeMode: 'replace'
      });

      if (result.success) {
        await updatePreferences(result.appliedPreferences);
        presetService.addToRecentlyUsed(preset.name);
        presetService.incrementPresetUsage(preset.name);
        
        onPresetApplied?.(preset);
        setIsOpen(false);
      } else {
        console.error('Failed to apply preset:', result.error);
      }
    } catch (error) {
      console.error('Error applying preset:', error);
    } finally {
      setIsApplying(false);
    }
  }, [preferences, updatePreferences, onPresetApplied]);

  // Save current config as custom preset
  const handleSaveCustomPreset = useCallback(async () => {
    if (!savePresetName.trim()) return;

    // Validate preset name
    const nameValidation = validatePresetName(savePresetName);
    if (!nameValidation.isValid) {
      console.error('Invalid preset name:', nameValidation.errors);
      return;
    }

    try {
      const sanitizedInput = sanitizePresetInput({
        name: nameValidation.sanitizedName,
        description: `Custom preset saved on ${new Date().toLocaleDateString()}`,
        category: 'writing',
        tags: ['custom', 'saved']
      });

      const customPreset = await presetService.createCustomPreset({
        name: sanitizedInput.name,
        description: sanitizedInput.description,
        category: sanitizedInput.category as 'writing' | 'editing' | 'publishing' | 'specialized',
        preferences: {
          tone: preferences.tone,
          language: preferences.language,
          copilotEnabled: preferences.copilotEnabled,
          memoryEnabled: preferences.memoryEnabled,
          defaultCommandView: preferences.defaultCommandView
        },
        tags: sanitizedInput.tags
      }, 'current-user-id'); // TODO: Get actual user ID

      if (customPreset) {
        setShowSaveDialog(false);
        setSavePresetName('');
        // Refresh active preset check
        const allPresets = presetService.getAllPresets();
        const exactMatch = allPresets.find(preset => 
          checkPresetMatch(preferences, preset.preferences)
        );
        setCurrentActivePreset(exactMatch || null);
        setIsCustomState(false);
      }
    } catch (error) {
      console.error('Error saving custom preset:', error);
    }
  }, [savePresetName, preferences]);

  // Sanitize preset name
  const sanitizePresetName = (name: string): string => {
    return name
      .trim()
      .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
      .substring(0, 50); // Limit length
  };

  // Get preset display name


  // Get category display name
  const getCategoryDisplayName = (category: string): string => {
    const categoryMap: Record<string, string> = {
      'writing': '✍️ Writing',
      'editing': '✏️ Editing', 
      'publishing': '📖 Publishing',
      'specialized': '🎯 Specialized'
    };
    return categoryMap[category] || category;
  };

  // Group presets by category
  const getPresetsByCategory = () => {
    const allPresets = presetService.getAllPresets();
    const grouped: Record<string, (WriterPreset | CustomPreset)[]> = {};
    
    allPresets.forEach(preset => {
      if (!grouped[preset.category]) {
        grouped[preset.category] = [];
      }
      grouped[preset.category].push(preset);
    });
    
    return grouped;
  };

  const groupedPresets = getPresetsByCategory();

  return (
    <div className={`preset-dropdown ${className}`} ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isApplying}
        className="w-full px-4 py-2 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {currentActivePreset ? (
              <>
                <span className="text-lg">{currentActivePreset.icon}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {currentActivePreset.name}
                </span>
                {showActiveIndicator && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Active
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="text-lg">⚙️</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {isCustomState ? 'Custom Settings' : 'Select Preset'}
                </span>
                {isCustomState && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Custom
                  </span>
                )}
              </>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-96 overflow-y-auto">
          {/* Popular Presets Section */}
          {popularPresets.length > 0 && (
            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Popular Presets
              </div>
              {popularPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetSelect(preset)}
                  disabled={isApplying}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700 disabled:opacity-50 ${
                    currentActivePreset?.name === preset.name 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{preset.icon}</span>
                    <span className="font-medium">{preset.name}</span>
                    {currentActivePreset?.name === preset.name && (
                      <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 ml-6 mt-1">
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* All Presets by Category */}
          {Object.entries(groupedPresets).map(([category, presets]) => (
            <div key={category} className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                {getCategoryDisplayName(category)}
              </div>
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetSelect(preset)}
                  disabled={isApplying}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700 disabled:opacity-50 ${
                    currentActivePreset?.name === preset.name 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{preset.icon}</span>
                    <span className="font-medium">{preset.name}</span>
                    {'isCustom' in preset && preset.isCustom && (
                      <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-1.5 py-0.5 rounded">
                        Custom
                      </span>
                    )}
                    {currentActivePreset?.name === preset.name && (
                      <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 ml-6 mt-1">
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
          ))}

          {/* Save Current as Custom Preset */}
          {showCustomSave && isCustomState && (
            <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowSaveDialog(true)}
                className="w-full text-left px-3 py-2 rounded-md text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:bg-blue-50 dark:focus:bg-blue-900/20"
              >
                💾 Save Current Settings as Preset
              </button>
            </div>
          )}
        </div>
      )}

      {/* Save Custom Preset Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Save Current Settings
            </h3>
            
            <div className="mb-4">
              <label htmlFor="preset-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preset Name
              </label>
              <input
                type="text"
                id="preset-name"
                value={savePresetName}
                onChange={(e) => setSavePresetName(sanitizePresetName(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter preset name..."
                autoFocus
                maxLength={50}
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Current settings: {preferences.tone} tone, {preferences.copilotEnabled ? 'copilot on' : 'copilot off'}, {preferences.memoryEnabled ? 'memory on' : 'memory off'}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSavePresetName('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomPreset}
                disabled={!savePresetName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Save Preset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 