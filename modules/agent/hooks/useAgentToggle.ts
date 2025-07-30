// MCP Context Block
/*
role: frontend-engineer,
tier: Pro,
file: "modules/agent/hooks/useAgentToggle.ts",
allowedActions: ["integrate", "toggle", "wire"],
theme: "agent_ui"
*/

import { useState, useEffect, useCallback } from 'react';

const AGENT_VISIBILITY_KEY = 'doccraft-agent-visible';

interface UseAgentToggleReturn {
  isAgentVisible: boolean;
  showAgent: () => void;
  hideAgent: () => void;
  toggleAgent: () => void;
}

export function useAgentToggle(): UseAgentToggleReturn {
  // Initialize state from localStorage or default to false
  const [isAgentVisible, setIsAgentVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    
    try {
      const stored = localStorage.getItem(AGENT_VISIBILITY_KEY);
      return stored ? JSON.parse(stored) : false;
    } catch (error) {
      console.warn('Failed to parse agent visibility from localStorage:', error);
      return false;
    }
  });

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(AGENT_VISIBILITY_KEY, JSON.stringify(isAgentVisible));
    } catch (error) {
      console.warn('Failed to save agent visibility to localStorage:', error);
    }
  }, [isAgentVisible]);

  // Show agent with accessibility feedback
  const showAgent = useCallback(() => {
    setIsAgentVisible(true);
    
    // Provide accessibility feedback
    if (typeof window !== 'undefined') {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-label', 'Agent chat opened');
      announcement.className = 'sr-only';
      announcement.textContent = 'DocCraft Assistant opened';
      document.body.appendChild(announcement);
      
      // Remove after announcement
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  }, []);

  // Hide agent with accessibility feedback
  const hideAgent = useCallback(() => {
    setIsAgentVisible(false);
    
    // Provide accessibility feedback
    if (typeof window !== 'undefined') {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-label', 'Agent chat closed');
      announcement.className = 'sr-only';
      announcement.textContent = 'DocCraft Assistant closed';
      document.body.appendChild(announcement);
      
      // Remove after announcement
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  }, []);

  // Toggle agent visibility
  const toggleAgent = useCallback(() => {
    if (isAgentVisible) {
      hideAgent();
    } else {
      showAgent();
    }
  }, [isAgentVisible, showAgent, hideAgent]);

  return {
    isAgentVisible,
    showAgent,
    hideAgent,
    toggleAgent
  };
} 