/**
 * Imaging Mode Selector Component
 * Provides a dropdown interface for switching between imaging enhancement modes
 * MCP Actions: adjust, configure
 */

import React, { useState } from 'react';
import { useImagingMode } from '../hooks/useImagingMode';
import { ImagingMode } from '../state/imagingMode';

interface ModeOption {
  value: ImagingMode;
  label: string;
  description: string;
  icon: string;
}

const modeOptions: ModeOption[] = [
  {
    value: "manual",
    label: "Manual Selection",
    description: "Full manual control - you select all images and placements",
    icon: "🎯"
  },
  {
    value: "hybrid",
    label: "Hybrid (AI + Manual)",
    description: "AI suggests images and placements, you have final approval",
    icon: "🤝"
  },
  {
    value: "auto",
    label: "Automatic",
    description: "Fully automatic - AI handles everything with minimal input",
    icon: "⚡"
  },
  {
    value: "ai-generated",
    label: "AI Generated",
    description: "AI creates and places images automatically with no manual intervention",
    icon: "🤖"
  }
];

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

function Tooltip({ children, content, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap ${positionClasses[position]}`}>
          {content}
          <div className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
            position === 'top' ? 'top-full left-1/2 -translate-x-1/2' :
            position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2' :
            position === 'left' ? 'left-full top-1/2 -translate-y-1/2' :
            'right-full top-1/2 -translate-y-1/2'
          }`} />
        </div>
      )}
    </div>
  );
}

export function ImagingModeSelector() {
  try {
    const { mode, setMode } = useImagingMode();
    const [isOpen, setIsOpen] = useState(false);

    const currentOption = modeOptions.find(option => option.value === mode);

  const handleModeChange = (newMode: ImagingMode) => {
    setMode(newMode);
    setIsOpen(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Current Mode Badge */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            Current Mode:
          </span>
          <span className="text-sm font-semibold text-blue-700">
            {currentOption?.icon} {currentOption?.label}
          </span>
        </div>
      </div>

      {/* Mode Selector Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-lg">{currentOption?.icon}</span>
              <div>
                <div className="font-medium text-gray-900">
                  {currentOption?.label}
                </div>
                <div className="text-sm text-gray-500">
                  {currentOption?.description}
                </div>
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'transform rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            <div className="py-1" role="listbox">
              {modeOptions.map((option) => (
                <Tooltip
                  key={option.value}
                  content={option.description}
                  position="right"
                >
                  <button
                    onClick={() => handleModeChange(option.value)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-150 ${
                      option.value === mode
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : ''
                    }`}
                    role="option"
                    aria-selected={option.value === mode}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{option.icon}</span>
                      <div className="flex-1">
                        <div className={`font-medium ${
                          option.value === mode ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {option.label}
                        </div>
                        <div className="text-sm text-gray-500">
                          {option.description}
                        </div>
                      </div>
                      {option.value === mode && (
                        <svg
                          className="w-5 h-5 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        <Tooltip content="Click the dropdown to change your imaging enhancement mode">
          <span className="cursor-help underline decoration-dotted">
            Need help choosing a mode?
          </span>
        </Tooltip>
      </div>
    </div>
  );
  } catch (error) {
    console.error('Error in ImagingModeSelector:', error);
    return (
      <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-700">Imaging mode selector unavailable</p>
      </div>
    );
  }
}

export default ImagingModeSelector; 