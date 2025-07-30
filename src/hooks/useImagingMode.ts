/**
 * Imaging Mode Hook
 * Provides a clean interface for accessing and updating imaging mode state
 * MCP Actions: adjust, configure
 */

import { useImagingModeContext } from '../state/imagingMode';

/**
 * Hook to access and update imaging mode state
 * @returns Object containing current mode and setter function
 * @throws Error if used outside of ImagingModeProvider
 */
export function useImagingMode() {
  const { mode, setMode } = useImagingModeContext();
  
  return {
    mode,
    setMode
  };
}

/**
 * Hook to check if current mode is automatic
 * @returns True if mode is "auto" or "ai-generated"
 */
export function useIsAutoMode(): boolean {
  const { mode } = useImagingModeContext();
  return mode === "auto" || mode === "ai-generated";
}

/**
 * Hook to check if current mode requires manual intervention
 * @returns True if mode is "manual" or "hybrid"
 */
export function useRequiresManualInput(): boolean {
  const { mode } = useImagingModeContext();
  return mode === "manual" || mode === "hybrid";
}

/**
 * Hook to get mode-specific configuration options
 * @returns Configuration object based on current mode
 */
export function useModeConfig() {
  const { mode } = useImagingModeContext();
  
  switch (mode) {
    case "manual":
      return {
        showImageSelector: true,
        showPlacementControls: true,
        autoSuggestions: false,
        requireApproval: true
      };
    case "hybrid":
      return {
        showImageSelector: true,
        showPlacementControls: true,
        autoSuggestions: true,
        requireApproval: true
      };
    case "auto":
      return {
        showImageSelector: false,
        showPlacementControls: false,
        autoSuggestions: true,
        requireApproval: false
      };
    case "ai-generated":
      return {
        showImageSelector: false,
        showPlacementControls: false,
        autoSuggestions: true,
        requireApproval: false
      };
    default:
      return {
        showImageSelector: true,
        showPlacementControls: true,
        autoSuggestions: false,
        requireApproval: true
      };
  }
} 