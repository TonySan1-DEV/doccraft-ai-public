// MCP Context Block
/*
{
  file: "modules/emotionArc/components/CharacterArcSwitch.tsx",
  role: "frontend-developer",
  allowedActions: ["scaffold", "visualize", "simulate", "accessibility"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "emotional_modeling"
}
*/

import React, { useState, useCallback, useRef, useEffect } from 'react';

interface CharacterArcSwitchProps {
  characterIds: string[];
  selectedCharacter: string;
  onCharacterSwitch: (characterId: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

export default function CharacterArcSwitch({
  characterIds,
  selectedCharacter,
  onCharacterSwitch,
  isLoading = false,
  disabled = false,
  className = '',
  'aria-label': ariaLabel = 'Character Arc Switch'
}: CharacterArcSwitchProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAllCharactersClick = useCallback(() => {
    if (!disabled && !isLoading) {
      onCharacterSwitch('all');
      setIsDropdownOpen(false);
    }
  }, [onCharacterSwitch, disabled, isLoading]);

  const handleCharacterSelect = useCallback((characterId: string) => {
    if (!disabled && !isLoading) {
      onCharacterSwitch(characterId);
      setIsDropdownOpen(false);
    }
  }, [onCharacterSwitch, disabled, isLoading]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent, characterId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCharacterSelect(characterId);
    }
  }, [handleCharacterSelect]);

  const handleDropdownToggle = useCallback(() => {
    if (!disabled && !isLoading) {
      setIsDropdownOpen(!isDropdownOpen);
    }
  }, [disabled, isLoading, isDropdownOpen]);

  const getSelectedCharacterName = () => {
    if (selectedCharacter === 'all') {
      return 'All Characters';
    }
    return selectedCharacter;
  };

  return (
    <div 
      className={`flex items-center space-x-2 ${className}`}
      role="region"
      aria-label={ariaLabel}
    >
      <span className="text-sm text-gray-600">View:</span>

      <div className="flex bg-gray-100 rounded-lg p-1">
        {/* All Characters Button */}
        <button
          onClick={handleAllCharactersClick}
          disabled={disabled || isLoading}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
            selectedCharacter === 'all'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          } ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-pressed={selectedCharacter === 'all'}
          aria-label="View all characters"
        >
          {isLoading ? (
            <div className="flex items-center space-x-1">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-600"></div>
              <span>Loading...</span>
            </div>
          ) : (
            'All Characters'
          )}
        </button>

        {/* Individual Character Dropdown */}
        {characterIds.length > 0 && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleDropdownToggle}
              disabled={disabled || isLoading}
              className={`px-3 py-1 text-xs font-medium text-gray-600 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded ${
                selectedCharacter !== 'all' ? 'text-gray-900 bg-white shadow-sm' : ''
              } ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-expanded={isDropdownOpen}
              aria-haspopup="listbox"
              aria-label="Select individual character"
            >
              <div className="flex items-center space-x-1">
                <span>Individual</span>
                <svg 
                  className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div 
                className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                role="listbox"
                aria-label="Character selection"
              >
                <div className="py-1">
                  {characterIds.map((characterId) => (
                    <button
                      key={characterId}
                      onClick={() => handleCharacterSelect(characterId)}
                      onKeyDown={(e) => handleKeyDown(e, characterId)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                        selectedCharacter === characterId ? 'bg-blue-50 text-blue-900' : 'text-gray-700'
                      }`}
                      role="option"
                      aria-selected={selectedCharacter === characterId}
                      tabIndex={0}
                    >
                      <div className="flex items-center justify-between">
                        <span>{characterId}</span>
                        {selectedCharacter === characterId && (
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reset Button */}
      {selectedCharacter !== 'all' && (
        <button
          onClick={handleAllCharactersClick}
          disabled={disabled || isLoading}
          className="text-xs text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded ${
            disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }"
          aria-label="Reset to all characters view"
        >
          Reset
        </button>
      )}

      {/* Character Count Badge */}
      {characterIds.length > 0 && (
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-500">({characterIds.length} characters)</span>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center space-x-1">
          <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
          <span className="text-xs text-gray-500">Analyzing...</span>
        </div>
      )}

      {/* Current Selection Display */}
      <div className="flex items-center space-x-2">
        <span className="text-xs text-gray-500">Current:</span>
        <span className="text-xs font-medium text-gray-900">
          {getSelectedCharacterName()}
        </span>
      </div>
    </div>
  );
} 