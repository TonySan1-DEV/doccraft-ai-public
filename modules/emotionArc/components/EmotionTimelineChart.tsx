// MCP Context Block
/*
{
  file: "modules/emotionArc/components/EmotionTimelineChart.tsx",
  role: "frontend-developer",
  allowedActions: ["optimize", "accessibility", "memoize"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "performance_a11y"
}
*/

import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { EmotionalBeat } from '../types/emotionTypes';
import { EMOTION_COLORS } from '../constants/emotions';
import { useNarrativeSync } from '../../shared/state/useNarrativeSyncContext';

// Debounce utility for performance
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

interface EmotionTimelineChartProps {
  emotionalBeats: EmotionalBeat[];
  selectedCharacter: string;
  simulation?: any;
  isLoading?: boolean;
  error?: string | null;
  onCharacterSelect?: (characterId: string) => void;
  onBeatClick?: (beat: EmotionalBeat) => void;
  className?: string;
  'aria-label'?: string;
}

interface ChartPoint {
  x: number;
  y: number;
  emotion: string;
  characterId: string;
  context: string;
  timestamp: number;
  intensity: number;
  sceneId: string;
}

// Memoized chart component for performance
const ChartPoint = React.memo<{
  point: ChartPoint;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (point: ChartPoint | null) => void;
  onClick: (point: ChartPoint) => void;
  onKeyDown: (event: React.KeyboardEvent, point: ChartPoint) => void;
  getAccessibleDescription: (point: ChartPoint) => string;
}>(({ point, isSelected, isHovered, onHover, onClick, onKeyDown, getAccessibleDescription }) => {
  const radius = isSelected ? 7 : isHovered ? 6 : 4;
  const color = EMOTION_COLORS[point.emotion as keyof typeof EMOTION_COLORS] || '#6B7280';
  
  return (
    <circle
      cx={point.x}
      cy={100 - point.intensity}
      r={radius}
      fill={color}
      className={`cursor-pointer transition-all duration-200 hover:r-5 ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onMouseEnter={() => onHover(point)}
      onMouseLeave={() => onHover(null)}
      onTouchStart={() => onHover(point)}
      onTouchEnd={() => onHover(null)}
      onClick={() => onClick(point)}
      onKeyDown={(e) => onKeyDown(e, point)}
      tabIndex={0}
      role="button"
      aria-label={getAccessibleDescription(point)}
      aria-pressed={isSelected}
      aria-describedby={`tooltip-${point.characterId}-${point.timestamp}`}
    />
  );
});

ChartPoint.displayName = 'ChartPoint';

function EmotionTimelineChart({
  emotionalBeats,
  selectedCharacter: propSelectedCharacter,
  simulation,
  isLoading = false,
  error = null,
  onCharacterSelect,
  onBeatClick,
  className = '',
  'aria-label': ariaLabel = 'Emotional Timeline Chart'
}: EmotionTimelineChartProps) {
  // --- Shared Narrative State ---
  let narrativeSync;
  try {
    narrativeSync = useNarrativeSync();
  } catch (e) {
    narrativeSync = null;
  }
  const contextCharacter = narrativeSync?.state.characterFocusId;
  const contextScene = narrativeSync?.state.currentSceneId;

  // Prefer context over prop if available
  const selectedCharacter = contextCharacter || propSelectedCharacter || 'all';
  
  // Debounce prop updates for performance
  const debouncedBeats = useDebounce(emotionalBeats, 300);
  const debouncedCharacter = useDebounce(selectedCharacter, 200);
  
  // Memoize filtered beats by character and scene
  const filteredBeats = useMemo(() => {
    let beats = debouncedBeats;
    if (debouncedCharacter !== 'all') {
      beats = beats.filter(beat => beat.characterId === debouncedCharacter);
    }
    if (contextScene) {
      beats = beats.filter(beat => beat.sceneId === contextScene);
    }
    return beats;
  }, [debouncedBeats, debouncedCharacter, contextScene]);

  // Memoize chart data
  const chartData = useMemo(() => {
    const sortedBeats = [...filteredBeats].sort((a, b) => a.narrativePosition - b.narrativePosition);
    
    return sortedBeats.map(beat => ({
      x: beat.narrativePosition * 100,
      y: beat.intensity,
      emotion: beat.emotion,
      characterId: beat.characterId,
      context: beat.context || '',
      timestamp: beat.timestamp,
      intensity: beat.intensity,
      sceneId: beat.sceneId
    }));
  }, [filteredBeats]);

  // Memoize character beats map
  const characterBeats = useMemo(() => {
    const characterMap = new Map<string, EmotionalBeat[]>();
    
    filteredBeats.forEach(beat => {
      if (!characterMap.has(beat.characterId)) {
        characterMap.set(beat.characterId, []);
      }
      characterMap.get(beat.characterId)!.push(beat);
    });
    
    return characterMap;
  }, [filteredBeats]);

  // State for interactions
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);
  const [focusedPointIndex, setFocusedPointIndex] = useState<number>(-1);
  const chartRef = useRef<HTMLDivElement>(null);

  // Accessibility helpers
  const getAccessibleDescription = useCallback((point: ChartPoint) => {
    return `${point.characterId} experiences ${point.emotion} at ${Math.round(point.x)}% of the story with ${point.intensity}% intensity`;
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent, point: ChartPoint) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handlePointClick(point);
    }
  }, []);

  const handleChartKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!chartData.length) return;
    
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        setFocusedPointIndex(prev => Math.max(0, prev - 1));
        break;
      case 'ArrowRight':
        event.preventDefault();
        setFocusedPointIndex(prev => Math.min(chartData.length - 1, prev + 1));
        break;
      case 'Home':
        event.preventDefault();
        setFocusedPointIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setFocusedPointIndex(chartData.length - 1);
        break;
    }
  }, [chartData.length]);

  const handlePointClick = useCallback((point: ChartPoint) => {
    const beat = filteredBeats.find(b => 
      b.narrativePosition === point.x / 100 && 
      b.characterId === point.characterId &&
      b.intensity === point.intensity
    );
    if (beat && onBeatClick) {
      onBeatClick(beat);
      // Announce selection for screen readers
      if (narrativeSync?.setScene) {
        narrativeSync.setScene(point.sceneId);
      }
    }
  }, [filteredBeats, onBeatClick, narrativeSync]);

  // Touch handling for mobile
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0];
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    
    // Find closest point
    const closestPoint = chartData.reduce((closest, point) => {
      const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
      return distance < closest.distance ? { point, distance } : closest;
    }, { point: null, distance: Infinity });
    
    if (closestPoint.point && closestPoint.distance < 20) {
      setHoveredPoint(closestPoint.point);
    }
  }, [chartData]);

  // Dev logging for context-driven prop changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('[EmotionTimelineChart] context-driven props:', { selectedCharacter, contextScene });
    }
  }, [selectedCharacter, contextScene]);

  // Error state
  if (error) {
    return (
      <div 
        className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-red-800 font-medium">Error loading emotional data</span>
        </div>
        <p className="text-red-700 mt-1 text-sm">{error}</p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center h-64 bg-gray-50 rounded-lg ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading emotional timeline...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (chartData.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center h-64 text-gray-500 ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="mt-2">No emotional data available</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`space-y-4 ${className}`}
      role="region"
      aria-label={ariaLabel}
    >
      {/* Header with accessibility info */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Emotional Timeline</h3>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {filteredBeats.length} emotional beats
          </div>
          {simulation && (
            <div className="text-sm text-purple-600">
              Tension overlay enabled
            </div>
          )}
        </div>
      </div>

      {/* Chart Container */}
      <div 
        ref={chartRef}
        className="relative h-64 bg-white border border-gray-200 rounded-lg"
        role="img"
        aria-label="Emotional timeline chart with data points"
        tabIndex={0}
        onKeyDown={handleChartKeyDown}
        onTouchStart={handleTouchStart}
      >
        {/* Chart Grid */}
        <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="border-r border-gray-200 last:border-r-0" />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="border-b border-gray-200 last:border-b-0" />
          ))}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>

        {/* X-axis labels */}
        <div className="absolute left-0 right-0 bottom-0 flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>

        {/* Emotion Lines */}
        {Array.from(characterBeats.entries()).map(([characterId, beats]) => {
          const sortedBeats = beats.sort((a, b) => a.narrativePosition - b.narrativePosition);
          
          return (
            <svg key={characterId} className="absolute inset-0 w-full h-full">
              {/* Line connecting points */}
              <polyline
                points={sortedBeats.map(beat => 
                  `${beat.narrativePosition * 100},${100 - beat.intensity}`
                ).join(' ')}
                fill="none"
                stroke={EMOTION_COLORS[sortedBeats[0]?.emotion as keyof typeof EMOTION_COLORS] || '#6B7280'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              />
              
              {/* Data points */}
              {sortedBeats.map((beat, index) => {
                const point: ChartPoint = {
                  x: beat.narrativePosition * 100,
                  y: beat.intensity,
                  emotion: beat.emotion,
                  characterId: beat.characterId,
                  context: beat.context || '',
                  timestamp: beat.timestamp,
                  intensity: beat.intensity,
                  sceneId: beat.sceneId
                };

                const isSelected = beat.sceneId === contextScene;
                const isHovered = hoveredPoint === point;
                const isFocused = focusedPointIndex === index;

                return (
                  <ChartPoint
                    key={index}
                    point={point}
                    isSelected={isSelected}
                    isHovered={isHovered}
                    onHover={setHoveredPoint}
                    onClick={handlePointClick}
                    onKeyDown={handleKeyDown}
                    getAccessibleDescription={getAccessibleDescription}
                  />
                );
              })}
            </svg>
          );
        })}

        {/* Simulation overlay if available */}
        {simulation?.tensionCurve && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <polyline
              points={simulation.tensionCurve.map((curve: any) => 
                `${curve.position * 100},${100 - curve.tension}`
              ).join(' ')}
              fill="none"
              stroke="#8B5CF6"
              strokeWidth="1"
              strokeDasharray="5,5"
              opacity="0.6"
              aria-hidden="true"
            />
          </svg>
        )}

        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-10 px-3 py-2 text-sm bg-gray-900 text-white rounded shadow-lg pointer-events-none"
            style={{
              left: `${hoveredPoint.x}%`,
              top: `${100 - hoveredPoint.intensity}%`,
              transform: 'translate(-50%, -100%) translateY(-8px)'
            }}
            role="tooltip"
            id={`tooltip-${hoveredPoint.characterId}-${hoveredPoint.timestamp}`}
          >
            <div className="font-medium">{hoveredPoint.characterId}</div>
            <div className="text-gray-300">
              {hoveredPoint.emotion} ({hoveredPoint.intensity}%)
            </div>
            {hoveredPoint.context && (
              <div className="text-xs text-gray-400 mt-1">
                {hoveredPoint.context}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4" role="list" aria-label="Emotion legend">
        {Object.entries(EMOTION_COLORS).map(([emotion, color]) => {
          const emotionCount = filteredBeats.filter(beat => beat.emotion === emotion).length;
          if (emotionCount === 0) return null;
          
          return (
            <div key={emotion} className="flex items-center space-x-2" role="listitem">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              <span className="text-sm text-gray-700 capitalize">
                {emotion} ({emotionCount})
              </span>
            </div>
          );
        })}
      </div>

      {/* Character Summary */}
      {selectedCharacter === 'all' && characterBeats.size > 1 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Character Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4" role="list" aria-label="Character summary">
            {Array.from(characterBeats.entries()).map(([characterId, beats]) => {
              const avgIntensity = beats.reduce((sum, beat) => sum + beat.intensity, 0) / beats.length;
              const dominantEmotion = beats.reduce((acc, beat) => {
                acc[beat.emotion] = (acc[beat.emotion] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              const topEmotion = Object.entries(dominantEmotion)
                .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown';
              
              return (
                <div key={characterId} className="text-sm" role="listitem">
                  <div className="font-medium text-gray-900">{characterId}</div>
                  <div className="text-gray-600">
                    Avg: {Math.round(avgIntensity)}% | {topEmotion}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Live region for announcements */}
      <div aria-live="polite" className="sr-only">
        {contextScene && `Scene ${contextScene} selected`}
      </div>
    </div>
  );
}

export default React.memo(EmotionTimelineChart); 