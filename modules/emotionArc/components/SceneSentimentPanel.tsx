// MCP Context Block
/*
{
  file: "modules/emotionArc/components/SceneSentimentPanel.tsx",
  role: "frontend-developer",
  allowedActions: ["scaffold", "visualize", "simulate", "accessibility"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "emotional_modeling"
}
*/

import React, { useState, useMemo, useCallback } from 'react';
import { SceneEmotionData } from '../types/emotionTypes';
import { EMOTION_COLORS } from '../constants/emotions';

interface SceneSentimentPanelProps {
  sceneData: SceneEmotionData[];
  selectedSceneId?: string;
  isLoading?: boolean;
  error?: string | null;
  onSceneSelect?: (sceneId: string) => void;
  onCharacterClick?: (characterId: string) => void;
  className?: string;
  'aria-label'?: string;
}

interface SceneCardProps {
  scene: SceneEmotionData;
  isSelected: boolean;
  onSelect: (sceneId: string) => void;
  onCharacterClick: (characterId: string) => void;
}

const SceneCard: React.FC<SceneCardProps> = ({
  scene,
  isSelected,
  onSelect,
  onCharacterClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
      case 'joy':
      case 'love':
        return 'text-green-600 bg-green-50';
      case 'negative':
      case 'fear':
      case 'anger':
      case 'sadness':
      case 'disgust':
        return 'text-red-600 bg-red-50';
      case 'neutral':
      case 'surprise':
      case 'conflict':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTensionColor = (tension: number) => {
    if (tension > 70) return 'text-red-600';
    if (tension > 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const characterEmotions = Array.from(scene.characterEmotions.entries());

  return (
    <div
      className={`border rounded-lg transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
      role="article"
      aria-labelledby={`scene-title-${scene.sceneId}`}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <button
              id={`scene-title-${scene.sceneId}`}
              className="text-sm font-semibold text-gray-900 cursor-pointer hover:text-blue-600 text-left w-full"
              onClick={() => onSelect(scene.sceneId)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(scene.sceneId);
                }
              }}
              aria-pressed={isSelected}
            >
              Scene {scene.sceneId}
            </button>
            <p className="text-xs text-gray-500 mt-1">
              {scene.processingMetadata.wordCount} words •{' '}
              {scene.processingMetadata.characterCount} characters
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${getSentimentColor(scene.overallSentiment)}`}
            >
              {scene.overallSentiment}
            </span>
            <span
              className={`text-xs font-medium ${getTensionColor(scene.tensionLevel)}`}
            >
              {Math.round(scene.tensionLevel)}% tension
            </span>
          </div>
        </div>

        {/* Character Emotions Summary */}
        <div className="mt-3">
          <h5 className="text-xs font-medium text-gray-700 mb-2">
            Character Emotions
          </h5>
          <div className="flex flex-wrap gap-2">
            {characterEmotions.map(([characterId, emotion]) => (
              <button
                key={characterId}
                onClick={() => onCharacterClick(characterId)}
                className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                aria-label={`View ${characterId}'s emotions: ${emotion.dominantEmotion} (${Math.round(emotion.intensity)}%)`}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      EMOTION_COLORS[
                        emotion.dominantEmotion as keyof typeof EMOTION_COLORS
                      ] || '#6B7280',
                  }}
                />
                <span className="font-medium">{characterId}</span>
                <span className="text-gray-600">
                  {emotion.dominantEmotion} ({Math.round(emotion.intensity)}%)
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Expandable Details */}
      <div className="border-t border-gray-100">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-3 text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          aria-expanded={isExpanded}
          aria-controls={`scene-details-${scene.sceneId}`}
        >
          <div className="flex items-center justify-between">
            <span>View detailed analysis</span>
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
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

        {isExpanded && (
          <div
            id={`scene-details-${scene.sceneId}`}
            className="p-4 bg-gray-50 space-y-4"
            role="region"
            aria-label="Scene detailed analysis"
          >
            {/* Scene Text Preview */}
            <div>
              <h6 className="text-xs font-medium text-gray-700 mb-2">
                Scene Preview
              </h6>
              <div className="text-sm text-gray-600 bg-white p-3 rounded border max-h-32 overflow-y-auto">
                {scene.sceneText.length > 200
                  ? `${scene.sceneText.substring(0, 200)}...`
                  : scene.sceneText}
              </div>
            </div>

            {/* Detailed Character Analysis */}
            <div>
              <h6 className="text-xs font-medium text-gray-700 mb-2">
                Character Analysis
              </h6>
              <div className="space-y-3">
                {characterEmotions.map(([characterId, emotion]) => (
                  <div
                    key={characterId}
                    className="bg-white p-3 rounded border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-gray-900">
                        {characterId}
                      </div>
                      <span className="text-xs text-gray-500">
                        Confidence: {Math.round(emotion.confidence)}%
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">
                          Primary Emotion
                        </span>
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor:
                                EMOTION_COLORS[
                                  emotion.dominantEmotion as keyof typeof EMOTION_COLORS
                                ] || '#6B7280',
                            }}
                          />
                          <span className="text-sm font-medium capitalize">
                            {emotion.dominantEmotion} (
                            {Math.round(emotion.intensity)}%)
                          </span>
                        </div>
                      </div>

                      {emotion.secondaryEmotions.length > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">
                            Secondary Emotions
                          </span>
                          <div className="flex items-center space-x-1">
                            {emotion.secondaryEmotions.map(
                              (secondary, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-gray-100 px-2 py-1 rounded"
                                >
                                  {secondary}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">
                          Complexity
                        </span>
                        <span className="text-sm font-medium">
                          {Math.round(emotion.emotionalComplexity || 0)}%
                        </span>
                      </div>

                      {emotion.contextClues && emotion.contextClues.length > 0 && (
                        <div>
                          <span className="text-xs text-gray-600">
                            Context Clues
                          </span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {emotion.contextClues
                              .slice(0, 3)
                              .map((clue, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                                >
                                  {clue}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emotional Beats Timeline */}
            {scene.emotionalBeats.length > 0 && (
              <div>
                <h6 className="text-xs font-medium text-gray-700 mb-2">
                  Emotional Beats
                </h6>
                <div className="space-y-2">
                  {scene.emotionalBeats.map((beat, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white p-2 rounded border"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              EMOTION_COLORS[
                                beat.emotion as keyof typeof EMOTION_COLORS
                              ] || '#6B7280',
                          }}
                        />
                        <span className="text-sm font-medium">
                          {beat.characterId}
                        </span>
                        <span className="text-sm text-gray-600 capitalize">
                          {beat.emotion}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {beat.narrativePosition ? Math.round(beat.narrativePosition * 100) : 'N/A'}% position
                        </span>
                        <span className="text-xs font-medium">
                          {Math.round(beat.intensity)}% intensity
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Processing Metadata */}
            <div className="bg-gray-100 p-3 rounded">
              <h6 className="text-xs font-medium text-gray-700 mb-2">
                Analysis Info
              </h6>
              <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                <div>
                  <span className="block font-medium">Processing Time</span>
                  <span>{scene.processingMetadata.analysisTime}ms</span>
                </div>
                <div>
                  <span className="block font-medium">Word Count</span>
                  <span>{scene.processingMetadata.wordCount}</span>
                </div>
                <div>
                  <span className="block font-medium">Characters</span>
                  <span>{scene.processingMetadata.characterCount}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function SceneSentimentPanel({
  sceneData,
  selectedSceneId,
  isLoading = false,
  error = null,
  onSceneSelect,
  onCharacterClick,
  className = '',
  'aria-label': ariaLabel = 'Scene Sentiment Panel',
}: SceneSentimentPanelProps) {
  const [filter, setFilter] = useState<
    'all' | 'high-tension' | 'low-tension' | 'positive' | 'negative'
  >('all');
  const [sortBy, setSortBy] = useState<'position' | 'tension' | 'sentiment'>(
    'position'
  );

  const filteredScenes = useMemo(() => {
    let scenes = sceneData;

    switch (filter) {
      case 'high-tension':
        scenes = scenes.filter(scene => scene.tensionLevel > 70);
        break;
      case 'low-tension':
        scenes = scenes.filter(scene => scene.tensionLevel < 30);
        break;
      case 'positive':
        scenes = scenes.filter(scene =>
          ['positive', 'joy', 'love'].includes(
            scene.overallSentiment.toLowerCase()
          )
        );
        break;
      case 'negative':
        scenes = scenes.filter(scene =>
          ['negative', 'fear', 'anger', 'sadness', 'disgust'].includes(
            scene.overallSentiment.toLowerCase()
          )
        );
        break;
    }

    switch (sortBy) {
      case 'position':
        scenes.sort((a, b) => a.sceneId.localeCompare(b.sceneId));
        break;
      case 'tension':
        scenes.sort((a, b) => b.tensionLevel - a.tensionLevel);
        break;
      case 'sentiment':
        scenes.sort((a, b) =>
          a.overallSentiment.localeCompare(b.overallSentiment)
        );
        break;
    }

    return scenes;
  }, [sceneData, filter, sortBy]);

  const handleSceneSelect = useCallback(
    (sceneId: string) => {
      onSceneSelect?.(sceneId);
    },
    [onSceneSelect]
  );

  const handleCharacterClick = useCallback(
    (characterId: string) => {
      onCharacterClick?.(characterId);
    },
    [onCharacterClick]
  );

  // Error state
  if (error) {
    return (
      <div
        className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-red-400 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-red-800 font-medium">
            Error loading scene data
          </span>
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
          <p className="text-gray-600">Analyzing scene emotions...</p>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Scene Sentiment Analysis
          </h3>
          <p className="text-sm text-gray-600">
            {sceneData.length} scenes analyzed
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Filter:</span>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
              aria-label="Filter scenes"
            >
              <option value="all">All Scenes</option>
              <option value="high-tension">High Tension</option>
              <option value="low-tension">Low Tension</option>
              <option value="positive">Positive Sentiment</option>
              <option value="negative">Negative Sentiment</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
              aria-label="Sort scenes"
            >
              <option value="position">By Position</option>
              <option value="tension">By Tension</option>
              <option value="sentiment">By Sentiment</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-blue-600">Avg Tension</div>
          <div className="text-xl font-bold text-blue-900">
            {Math.round(
              sceneData.reduce((sum, scene) => sum + scene.tensionLevel, 0) /
                sceneData.length
            )}
            %
          </div>
        </div>

        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-green-600">
            Positive Scenes
          </div>
          <div className="text-xl font-bold text-green-900">
            {
              sceneData.filter(scene =>
                ['positive', 'joy', 'love'].includes(
                  scene.overallSentiment.toLowerCase()
                )
              ).length
            }
          </div>
        </div>

        <div className="bg-red-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-red-600">
            Negative Scenes
          </div>
          <div className="text-xl font-bold text-red-900">
            {
              sceneData.filter(scene =>
                ['negative', 'fear', 'anger', 'sadness', 'disgust'].includes(
                  scene.overallSentiment.toLowerCase()
                )
              ).length
            }
          </div>
        </div>

        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-purple-600">
            Total Characters
          </div>
          <div className="text-xl font-bold text-purple-900">
            {
              new Set(
                sceneData.flatMap(scene =>
                  Array.from(scene.characterEmotions.keys())
                )
              ).size
            }
          </div>
        </div>
      </div>

      {/* Scene Cards */}
      <div className="space-y-3">
        {filteredScenes.map(scene => (
          <SceneCard
            key={scene.sceneId}
            scene={scene}
            isSelected={scene.sceneId === selectedSceneId}
            onSelect={handleSceneSelect}
            onCharacterClick={handleCharacterClick}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredScenes.length === 0 && (
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="mt-2 text-gray-500">
            No scenes match the current filter
          </p>
        </div>
      )}
    </div>
  );
}
