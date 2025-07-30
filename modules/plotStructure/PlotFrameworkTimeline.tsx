// MCP Context Block
/*
{
  file: "modules/plotStructure/PlotFrameworkTimeline.tsx",
  role: "frontend-developer",
  allowedActions: ["optimize", "accessibility", "memoize"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "performance_a11y"
}
*/

import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import type { PlotFramework, PlotBeat } from './initPlotEngine';
import { useNarrativeSync } from '../../shared/state/useNarrativeSyncContext';

// Debounce utility for performance
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

interface PlotFrameworkTimelineProps {
  framework: PlotFramework;
  beats: PlotBeat[];
  currentSceneId?: string;
  onBeatClick?: (beat: PlotBeat) => void;
  className?: string;
  'aria-label'?: string;
}

// Memoized beat component for performance
const BeatButton = React.memo<{
  beat: PlotBeat;
  isSelected: boolean;
  isFocused: boolean;
  onClick: (beat: PlotBeat) => void;
  onKeyDown: (event: React.KeyboardEvent, beat: PlotBeat) => void;
}>(({ beat, isSelected, isFocused, onClick, onKeyDown }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Focus management
  useEffect(() => {
    if (isFocused && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [isFocused]);

  return (
    <button
      ref={buttonRef}
      onClick={() => onClick(beat)}
      onKeyDown={(e) => onKeyDown(e, beat)}
      className={`flex flex-col items-center px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
        beat.isStructural ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'
      } ${isSelected ? 'ring-2 ring-blue-600' : ''} ${
        isFocused ? 'ring-2 ring-blue-400' : ''
      }`}
      aria-pressed={isSelected}
      aria-label={`${beat.label} beat at ${Math.round(beat.position * 100)}% of story`}
      tabIndex={isFocused ? 0 : -1}
    >
      <span className="text-xs font-medium text-gray-700 mb-1">{beat.label}</span>
      <span 
        className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-white" 
        style={{ background: beat.isStructural ? '#2563EB' : '#6B7280' }}
        aria-hidden="true"
      >
        {beat.act}
      </span>
      <span className="text-[10px] text-gray-400 mt-1">{Math.round(beat.position * 100)}%</span>
    </button>
  );
});

BeatButton.displayName = 'BeatButton';

function PlotFrameworkTimeline({
  framework,
  beats,
  currentSceneId: propCurrentSceneId,
  onBeatClick,
  className = '',
  'aria-label': ariaLabel = 'Plot Framework Timeline'
}: PlotFrameworkTimelineProps) {
  // --- Shared Narrative State ---
  let narrativeSync;
  try {
    narrativeSync = useNarrativeSync();
  } catch (e) {
    narrativeSync = null;
  }
  const contextScene = narrativeSync?.state.currentSceneId;
  const contextFramework = narrativeSync?.state.activePlotFramework;

  // Prefer context over prop if available
  const currentSceneId = contextScene || propCurrentSceneId;
  const activeFramework = contextFramework || framework;

  // Debounce prop updates for performance
  const debouncedBeats = useDebounce(beats, 200);
  const debouncedCurrentSceneId = useDebounce(currentSceneId, 150);

  // Memoize sorted beats
  const sortedBeats = useMemo(() => {
    return [...debouncedBeats].sort((a, b) => a.position - b.position);
  }, [debouncedBeats]);

  // State for keyboard navigation
  const [focusedBeatIndex, setFocusedBeatIndex] = useState<number>(-1);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent, beat: PlotBeat) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onBeatClick?.(beat);
      // Announce selection for screen readers
      if (narrativeSync?.setScene) {
        narrativeSync.setScene(beat.id);
      }
    }
  }, [onBeatClick, narrativeSync]);

  const handleTimelineKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!sortedBeats.length) return;
    
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        setFocusedBeatIndex(prev => Math.max(0, prev - 1));
        break;
      case 'ArrowRight':
        event.preventDefault();
        setFocusedBeatIndex(prev => Math.min(sortedBeats.length - 1, prev + 1));
        break;
      case 'Home':
        event.preventDefault();
        setFocusedBeatIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setFocusedBeatIndex(sortedBeats.length - 1);
        break;
      case 'Tab':
        // Allow default tab behavior
        break;
      default:
        return;
    }
  }, [sortedBeats.length]);

  // Touch handling for mobile
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0];
    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = touch.clientX - rect.left;
    const beatWidth = rect.width / sortedBeats.length;
    const beatIndex = Math.floor(x / beatWidth);
    
    if (beatIndex >= 0 && beatIndex < sortedBeats.length) {
      setFocusedBeatIndex(beatIndex);
      const beat = sortedBeats[beatIndex];
      onBeatClick?.(beat);
    }
  }, [sortedBeats, onBeatClick]);

  // Dev logging for context-driven prop changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('[PlotFrameworkTimeline] context-driven props:', { currentSceneId, activeFramework });
    }
  }, [currentSceneId, activeFramework]);

  return (
    <div
      className={`w-full p-4 bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
      role="region"
      aria-label={ariaLabel}
    >
      <h3 className="text-lg font-semibold mb-2">{activeFramework} Structure</h3>
      
      <div 
        ref={timelineRef}
        className="flex flex-row items-end space-x-2 overflow-x-auto" 
        style={{ minHeight: 120 }}
        role="list"
        aria-label="Plot beats timeline"
        tabIndex={0}
        onKeyDown={handleTimelineKeyDown}
        onTouchStart={handleTouchStart}
      >
        {sortedBeats.map((beat, idx) => {
          const isSelected = debouncedCurrentSceneId === beat.id;
          const isFocused = focusedBeatIndex === idx;
          
          return (
            <BeatButton
              key={beat.id}
              beat={beat}
              isSelected={isSelected}
              isFocused={isFocused}
              onClick={onBeatClick || (() => {})}
              onKeyDown={handleKeyDown}
            />
          );
        })}
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        Click a beat for details. Acts and structural beats are highlighted.
      </div>

      {/* Live region for announcements */}
      <div aria-live="polite" className="sr-only">
        {currentSceneId && `Beat ${currentSceneId} selected`}
      </div>
    </div>
  );
}

export default React.memo(PlotFrameworkTimeline); 