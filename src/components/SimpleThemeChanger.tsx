import React, { useState, useRef, useEffect } from 'react';
import { Palette, ChevronDown } from 'lucide-react';
import { useSimpleTheme } from '../contexts/SimpleThemeContext';
import { simpleThemes } from '../configs/simpleThemes';

export function SimpleThemeChanger() {
  const { currentTheme, setTheme } = useSimpleTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleThemeSelect = (themeId: string) => {
    console.log('Setting theme to:', themeId); // Debug log
    setTheme(themeId);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Theme Selector Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        aria-label="Change theme"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* Palette Icon */}
        <Palette className="w-4 h-4 text-gray-500" />

        {/* Current Theme Color Circle */}
        <div
          className="w-4 h-4 rounded-full border border-gray-300"
          style={{ backgroundColor: currentTheme.primary }}
          title={`Current theme: ${currentTheme.name}`}
        />

        {/* Chevron Dropdown Arrow */}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="py-1" role="listbox">
            {simpleThemes.map(theme => (
              <button
                key={theme.id}
                onClick={() => handleThemeSelect(theme.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors ${
                  currentTheme.id === theme.id
                    ? 'bg-blue-50 border-l-4 border-l-blue-500'
                    : ''
                }`}
                role="option"
                aria-selected={currentTheme.id === theme.id}
              >
                {/* Theme Color Circle */}
                <div
                  className="w-5 h-5 rounded-full border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: theme.primary }}
                  title={`${theme.name} primary color`}
                />

                {/* Theme Name */}
                <span
                  className={`font-medium ${
                    currentTheme.id === theme.id
                      ? 'text-blue-700'
                      : 'text-gray-900'
                  }`}
                >
                  {theme.name}
                </span>

                {/* Current Theme Indicator */}
                {currentTheme.id === theme.id && (
                  <span className="ml-auto text-xs text-blue-600 font-medium">
                    Current
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
