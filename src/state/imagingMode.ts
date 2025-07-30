/**
 * Imaging Mode State Management
 * Provides global state management for image enhancement modes
 * MCP Actions: adjust, configure
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

/**
 * Available imaging enhancement modes
 */
export type ImagingMode = "manual" | "hybrid" | "auto" | "ai-generated";

/**
 * Context interface for imaging mode state
 */
interface ImagingModeContextType {
  mode: ImagingMode;
  setMode: (mode: ImagingMode) => void;
}

/**
 * React context for imaging mode state
 */
const ImagingModeContext = createContext<ImagingModeContextType | undefined>(undefined);

/**
 * Props for the ImagingModeProvider component
 */
interface ImagingModeProviderProps {
  children: ReactNode;
  initialMode?: ImagingMode;
}

/**
 * Provider component that wraps the app and provides imaging mode state
 */
export function ImagingModeProvider(props: ImagingModeProviderProps) {
  const { children, initialMode = "hybrid" } = props;
  const [mode, setMode] = useState<ImagingMode>(initialMode);

  const value: ImagingModeContextType = {
    mode,
    setMode
  };

  return React.createElement(ImagingModeContext.Provider, { value }, children);
}

/**
 * Hook to access imaging mode context
 * @returns ImagingModeContextType with current mode and setter
 * @throws Error if used outside of ImagingModeProvider
 */
export function useImagingModeContext(): ImagingModeContextType {
  const context = useContext(ImagingModeContext);
  
  if (context === undefined) {
    throw new Error('useImagingModeContext must be used within an ImagingModeProvider');
  }
  
  return context;
}

/**
 * Converts imaging mode enum to user-friendly display label
 * @param mode - The imaging mode to convert
 * @returns Human-readable label for the mode
 */
export function getModeLabel(mode: ImagingMode): string {
  switch (mode) {
    case "manual":
      return "Manual Selection";
    case "hybrid":
      return "Hybrid (AI + Manual)";
    case "auto":
      return "Automatic";
    case "ai-generated":
      return "AI Generated";
    default:
      return "Unknown Mode";
  }
}

/**
 * Gets a description of what each mode does
 * @param mode - The imaging mode to describe
 * @returns Detailed description of the mode's functionality
 */
export function getModeDescription(mode: ImagingMode): string {
  switch (mode) {
    case "manual":
      return "Full manual control - you select all images and placements";
    case "hybrid":
      return "AI suggests images and placements, you have final approval";
    case "auto":
      return "Fully automatic - AI handles everything with minimal input";
    case "ai-generated":
      return "AI creates and places images automatically with no manual intervention";
    default:
      return "Unknown mode functionality";
  }
}

/**
 * Validates if a string is a valid imaging mode
 * @param mode - String to validate
 * @returns True if the string is a valid ImagingMode
 */
export function isValidImagingMode(mode: string): mode is ImagingMode {
  return ["manual", "hybrid", "auto", "ai-generated"].includes(mode);
} 