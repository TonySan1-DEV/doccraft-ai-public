// MCP Context Block
/*
{
  file: "EmotionTimelineChart.tsx",
  role: "developer",
  allowedActions: ["analyze", "simulate", "visualize", "suggest"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "writing_suite"
}
*/

import { useMemo } from 'react';
import { EmotionalBeat } from '../types/EmotionalArc';

interface EmotionTimelineChartProps {
  emotionalBeats: EmotionalBeat[];
  selectedCharacter: string;
  simulation?: any;
}

const EMOTION_COLORS = {
  joy: '#10B981',
  fear: '#EF4444',
  anger: '#F59E0B',
  sadness: '#3B82F6',
  surprise: '#8B5CF6',
  disgust: '#6B7280',
  love: '#EC4899',
  conflict: '#F97316'
};

export default function EmotionTimelineChart({
  emotionalBeats,
  selectedCharacter,
  simulation
}: EmotionTimelineChartProps) {
  const filteredBeats = useMemo(() => {
    if (selectedCharacter === 'all') {
      return emotionalBeats;
    }
    return emotionalBeats.filter(beat => beat.characterId === selectedCharacter);
  }, [emotionalBeats, selectedCharacter]);

  const chartData = useMemo(() => {
    const sortedBeats = [...filteredBeats].sort((a, b) => a.narrativePosition - b.narrativePosition);
    
    return sortedBeats.map(beat => ({
      x: beat.narrativePosition * 100, // Convert to percentage
      y: beat.intensity,
      emotion: beat.emotion,
      characterId: beat.characterId,
      context: beat.context,
      timestamp: beat.timestamp
    }));
  }, [filteredBeats]);

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

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
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
      <div className="relative h-64">
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
              />
              
              {/* Data points */}
              {sortedBeats.map((beat, index) => (
                <circle
                  key={index}
                  cx={beat.narrativePosition * 100}
                  cy={100 - beat.intensity}
                  r="4"
                  fill={EMOTION_COLORS[beat.emotion as keyof typeof EMOTION_COLORS] || '#6B7280'}
                  className="cursor-pointer hover:r-6 transition-all duration-200"
                />
              ))}
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
            />
          </svg>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
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

      {renderChart()}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4">
        {Object.entries(EMOTION_COLORS).map(([emotion, color]) => {
          const emotionCount = filteredBeats.filter(beat => beat.emotion === emotion).length;
          if (emotionCount === 0) return null;
          
          return (
            <div key={emotion} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from(characterBeats.entries()).map(([characterId, beats]) => {
              const avgIntensity = beats.reduce((sum, beat) => sum + beat.intensity, 0) / beats.length;
              const dominantEmotion = beats.reduce((acc, beat) => {
                acc[beat.emotion] = (acc[beat.emotion] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              const topEmotion = Object.entries(dominantEmotion)
                .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown';
              
              return (
                <div key={characterId} className="text-sm">
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
    </div>
  );
} 