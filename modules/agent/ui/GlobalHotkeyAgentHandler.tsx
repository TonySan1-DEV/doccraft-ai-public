// MCP Context Block
/*
role: frontend-engineer,
tier: Pro,
file: "modules/agent/ui/GlobalHotkeyAgentHandler.tsx",
allowedActions: ["integrate", "toggle", "wire"],
theme: "agent_ui"
*/

import React, { useEffect, useRef, useCallback } from 'react';

interface GlobalHotkeyAgentHandlerProps {
  onToggle: () => void;
  isVisible: boolean;
}

export const GlobalHotkeyAgentHandler: React.FC<GlobalHotkeyAgentHandlerProps> = ({ 
  onToggle, 
  isVisible 
}) => {
  const lastKeyPressTime = useRef<number>(0);
  const DEBOUNCE_DELAY = 300; // Prevent rapid toggling

  // Check if user is typing in an input field
  const isTypingInInput = useCallback(() => {
    const activeElement = document.activeElement;
    if (!activeElement) return false;
    
    const tagName = activeElement.tagName.toLowerCase();
    const inputTypes = ['input', 'textarea', 'select'];
    
    if (inputTypes.includes(tagName)) {
      return true;
    }
    
    // Check for contenteditable elements
    if (activeElement.getAttribute('contenteditable') === 'true') {
      return true;
    }
    
    return false;
  }, []);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger if user is typing in an input
    if (isTypingInInput()) {
      return;
    }

    // Check for Cmd+Shift+A (Mac) or Ctrl+Shift+A (Windows/Linux)
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifierKey = isMac ? event.metaKey : event.ctrlKey;
    
    if (modifierKey && event.shiftKey && event.key.toLowerCase() === 'a') {
      event.preventDefault();
      
      // Debounce to prevent rapid toggling
      const now = Date.now();
      if (now - lastKeyPressTime.current < DEBOUNCE_DELAY) {
        return;
      }
      lastKeyPressTime.current = now;
      
      onToggle();
    }

    // ESC key closes agent if visible
    if (event.key === 'Escape' && isVisible) {
      event.preventDefault();
      onToggle();
    }
  }, [isTypingInInput, onToggle, isVisible]);

  // Set up global keyboard listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Auto-focus input when agent becomes visible
  useEffect(() => {
    if (isVisible) {
      // Small delay to ensure the agent chat panel is rendered
      const timer = setTimeout(() => {
        const agentInput = document.querySelector('[data-testid="agent-chat-input"]') as HTMLInputElement;
        if (agentInput) {
          agentInput.focus();
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // This component doesn't render anything visible
  return null;
}; 