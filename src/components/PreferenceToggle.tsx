// MCP Context Block
/*
{
  file: "PreferenceToggle.tsx",
  role: "frontend-developer",
  allowedActions: ["ui", "accessibility", "toggle"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "agent_preferences"
}
*/

import React from 'react';

interface PreferenceToggleProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  locked?: boolean;
  lockedReason?: string;
}

export function PreferenceToggle({
  id,
  label,
  description,
  checked,
  disabled = false,
  onChange,
  locked = false,
  lockedReason
}: PreferenceToggleProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled && !locked) {
      onChange(event.target.checked);
    }
  };

  const isDisabled = disabled || locked;

  return (
    <div className="flex items-start space-x-3">
      <div className="flex items-center h-5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={isDisabled}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          aria-describedby={`${id}-description`}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <label 
          htmlFor={id}
          className={`text-sm font-medium ${
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
        
        <p 
          id={`${id}-description`}
          className={`text-xs mt-1 ${
            isDisabled 
              ? 'text-gray-400 dark:text-gray-500' 
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          {description}
          {locked && lockedReason && (
            <span className="block mt-1 text-orange-600 dark:text-orange-400">
              {lockedReason}
            </span>
          )}
        </p>
      </div>
    </div>
  );
} 