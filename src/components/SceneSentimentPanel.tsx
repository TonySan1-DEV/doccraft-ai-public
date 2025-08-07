// MCP Context Block
/*
{
  file: "SceneSentimentPanel.tsx",
  role: "developer",
  allowedActions: ["analyze", "simulate", "visualize", "suggest"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "writing_suite"
}
*/

import { useState } from "react";
import { SceneEmotionData } from "../services/emotionAnalyzer";

interface SceneSentimentPanelProps {
  sceneData: SceneEmotionData[];
  selectedCharacter: string;
  onSceneSelect?: (sceneId: string) => void;
}

export default function SceneSentimentPanel({
  sceneData,
  selectedCharacter,
  onSceneSelect,
}: SceneSentimentPanelProps) {
  const [selectedScene, setSelectedScene] = useState<string | null>(null);

  const handleSceneClick = (sceneId: string) => {
    setSelectedScene(sceneId);
    onSceneSelect?.(sceneId);
  };

  const getSentimentColor = (sentiment: string) => {
    const colors = {
      joy: "bg-green-100 text-green-800",
      fear: "bg-red-100 text-red-800",
      anger: "bg-orange-100 text-orange-800",
      sadness: "bg-blue-100 text-blue-800",
      surprise: "bg-purple-100 text-purple-800",
      disgust: "bg-gray-100 text-gray-800",
      love: "bg-pink-100 text-pink-800",
      conflict: "bg-yellow-100 text-yellow-800",
    };
    return (
      colors[sentiment as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  const getTensionLevel = (tension: number) => {
    if (tension > 80) return { level: "High", color: "bg-red-500" };
    if (tension > 50) return { level: "Medium", color: "bg-yellow-500" };
    return { level: "Low", color: "bg-green-500" };
  };

  const filteredSceneData =
    selectedCharacter === "all"
      ? sceneData
      : sceneData.filter((scene) =>
          Array.from(scene.characterEmotions.keys()).includes(selectedCharacter)
        );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Scene Sentiment Analysis
        </h3>
        <div className="text-sm text-gray-600">
          {filteredSceneData.length} scenes analyzed
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scene List */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Scenes</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredSceneData.map((scene, index) => {
              const tensionInfo = getTensionLevel(scene.tensionLevel);
              const characterCount = scene.characterEmotions.size;

              return (
                <div
                  key={scene.sceneId}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedScene === scene.sceneId
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleSceneClick(scene.sceneId)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSceneClick(scene.sceneId)
                  }
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">
                      Scene {index + 1}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(
                          scene.overallSentiment
                        )}`}
                      >
                        {scene.overallSentiment}
                      </span>
                      <div
                        className={`w-2 h-2 rounded-full ${tensionInfo.color}`}
                      ></div>
                      <span className="text-xs text-gray-600">
                        {tensionInfo.level}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    {scene.sceneText.substring(0, 100)}...
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{characterCount} characters</span>
                    <span>{Math.round(scene.tensionLevel)}% tension</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scene Detail */}
        {selectedScene && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Scene Details</h4>

            {(() => {
              const scene = sceneData.find((s) => s.sceneId === selectedScene);
              if (!scene) return null;

              return (
                <div className="space-y-4">
                  {/* Scene Overview */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-900">Overview</h5>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(
                          scene.overallSentiment
                        )}`}
                      >
                        {scene.overallSentiment}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Tension Level:</span>
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              getTensionLevel(scene.tensionLevel).color
                            }`}
                          ></div>
                          <span>
                            {getTensionLevel(scene.tensionLevel).level}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Characters:</span>
                        <span className="font-medium">
                          {scene.characterEmotions.size}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Character Emotions */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-900">
                      Character Emotions
                    </h5>
                    <div className="space-y-2">
                      {Array.from(scene.characterEmotions.entries()).map(
                        ([characterId, emotion]) => (
                          <div
                            key={characterId}
                            className="p-3 bg-white border border-gray-200 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">
                                {characterId}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(
                                  emotion.primaryEmotion
                                )}`}
                              >
                                {emotion.primaryEmotion}
                              </span>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">
                                  Intensity:
                                </span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{ width: `${emotion.intensity}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-medium">
                                    {emotion.intensity}%
                                  </span>
                                </div>
                              </div>

                              {emotion.secondaryEmotions.length > 0 && (
                                <div className="text-sm">
                                  <span className="text-gray-600">
                                    Secondary:
                                  </span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {emotion.secondaryEmotions.map(
                                      (secondary) => (
                                        <span
                                          key={secondary}
                                          className={`px-2 py-1 rounded-full text-xs ${getSentimentColor(
                                            secondary
                                          )}`}
                                        >
                                          {secondary}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                              {emotion.contextClues.length > 0 && (
                                <div className="text-sm">
                                  <span className="text-gray-600">
                                    Context clues:
                                  </span>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {emotion.contextClues
                                      .slice(0, 3)
                                      .join(", ")}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Emotional Beats */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-900">
                      Emotional Beats
                    </h5>
                    <div className="space-y-2">
                      {scene.emotionalBeats.map((beat, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-2 bg-gray-50 rounded"
                        >
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(
                              beat.emotion
                            )}`}
                          >
                            {beat.emotion}
                          </span>
                          <span className="text-sm text-gray-600">
                            {beat.characterId}
                          </span>
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div
                                className="bg-blue-600 h-1 rounded-full"
                                style={{ width: `${beat.intensity}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {beat.intensity}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
