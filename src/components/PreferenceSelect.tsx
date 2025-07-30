// MCP Context Block
/*
{
  file: "PreferenceSelect.tsx",
  role: "frontend-developer",
  allowedActions: ["ui", "accessibility", "select"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "agent_preferences"
}
*/

import React from 'react';

interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface PreferenceSelectProps {
  id: string;
  label: string;
  description: string;
  value: string;
  options: readonly SelectOption[];
  disabled?: boolean;
  onChange: (value: string) => void;
  locked?: boolean;
  lockedReason?: string;
  className?: string;
}

export function PreferenceSelect({
  id,
  label,
  description,
  value,
  options,
  disabled = false,
  onChange,
  locked = false,
  lockedReason
}: PreferenceSelectProps) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!disabled && !locked) {
      onChange(event.target.value);
    }
  };

  const isDisabled = disabled || locked;
  const selectedOption = options.find(option => option.value === value);

  return (
    <div className="space-y-2">
      <label 
        htmlFor={id}
        className={`block text-sm font-medium ${
          isDisabled 
            ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
            : 'text-gray-900 dark:text-white cursor-pointer'
        }`}
      >
        <div className="flex items-center">
          {label}
          {locked && (
            <svg 
              className="w-4 h-4 ml-1 text-gray-400" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-label="Locked by admin policy"
            >
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </label>
      
      <div className="relative">
        <select
          id={id}
          value={value}
          disabled={isDisabled}
          onChange={handleChange}
          className={`block w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
            isDisabled
              ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
          }`}
          aria-describedby={`${id}-description`}
        >
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              className="py-1"
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg 
            className={`w-4 h-4 ${
              isDisabled 
                ? 'text-gray-400 dark:text-gray-500' 
                : 'text-gray-500 dark:text-gray-400'
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      <div className="space-y-1">
        <p 
          id={`${id}-description`}
          className={`text-xs ${
            isDisabled 
              ? 'text-gray-400 dark:text-gray-500' 
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          {description}
        </p>
        
        {/* Selected option description */}
        {selectedOption?.description && (
          <p className={`text-xs italic ${
            isDisabled 
              ? 'text-gray-400 dark:text-gray-500' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {selectedOption.description}
          </p>
        )}
        
        {/* Locked reason */}
        {locked && lockedReason && (
          <p className="text-xs text-orange-600 dark:text-orange-400">
            {lockedReason}
          </p>
        )}
      </div>
    </div>
  );
} 