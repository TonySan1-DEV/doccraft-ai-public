// MCP Context Block
/*
{
  file: "EmotionalArcModule.tsx",
  role: "developer",
  allowedActions: ["analyze", "simulate", "visualize", "suggest"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "writing_suite"
}
*/

import { useState, useEffect, useCallback } from "react";
import { EmotionalArc, ReaderSimResult } from "../types/EmotionalArc";
import {
  analyzeStoryEmotions,
  SceneEmotionData,
} from "../services/emotionAnalyzer";
import {
  generateArcSimulation,
  generateArcSegments,
  simulateReaderResponse,
  ArcSimulationResult,
} from "../services/arcSimulator";
import { generateOptimizationSuggestions, StoryOptimizationPlan } from "../services/suggestionEngine";

// UI Components
import EmotionTimelineChart from "./EmotionTimelineChart";
import TensionCurveViewer from "./TensionCurveViewer";
import SceneSentimentPanel from "./SceneSentimentPanel";
import OptimizationSuggestions from "./OptimizationSuggestions";
import CharacterArcSwitch from "./CharacterArcSwitch";

export interface EmotionalArcModuleProps {
  storyText?: string;
  characterIds?: string[];
  onArcUpdate?: (arc: EmotionalArc) => void;
  readerProfile?: {
    empathyLevel: number;
    tensionTolerance: number;
  };
}

export default function EmotionalArcModule({
  storyText = "",
  characterIds = [],
  onArcUpdate,
  readerProfile,
}: EmotionalArcModuleProps) {
  // MCP context for role-based permissions

  const [emotionalArc, setEmotionalArc] = useState<EmotionalArc | null>(null);
  const [sceneData, setSceneData] = useState<SceneEmotionData[]>([]);
  const [simulation, setSimulation] = useState<ArcSimulationResult | null>(
    null
  );
  const [readerSimulation, setReaderSimulation] =
    useState<ReaderSimResult | null>(null);
  const [optimizationPlan, setOptimizationPlan] = useState<StoryOptimizationPlan | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<string>("all");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "timeline" | "tension" | "sentiment" | "suggestions"
  >("timeline");

  // Analyze story emotions when text changes
  useEffect(() => {
    if (storyText && characterIds.length > 0) {
      analyzeStory();
    }
  }, [storyText, characterIds]);

  const analyzeStory = useCallback(async () => {
    setIsAnalyzing(true);

    try {
      // Split story into scenes (simplified - in real app would use more sophisticated parsing)
      const scenes = splitStoryIntoScenes(storyText);

      // Analyze emotions for each scene
      const analyzedScenes = await analyzeStoryEmotions(scenes);
      setSceneData(analyzedScenes);

      // Generate arc simulation
      const arcSimulation = generateArcSimulation(analyzedScenes);
      setSimulation(arcSimulation);

      // Create emotional arc
      const tempArc: EmotionalArc = {
        id: `arc-${Date.now()}`,
        title: "Story Emotional Arc",
        beats: analyzedScenes.flatMap((scene) => scene.emotionalBeats),
        segments: generateArcSegments(
          arcSimulation.tensionCurve,
          analyzedScenes
        ),
        readerSimulation: {
          empathyScore: 0,
          predictedEngagementDrop: false,
          notes: [],
          emotionalPeaks: [],
          tensionCurve: [],
        },
        overallTension: calculateOverallTension(arcSimulation.tensionCurve),
        emotionalComplexity: arcSimulation.readerEngagement.emotionalComplexity,
        pacingScore: calculatePacingScore(arcSimulation.pacingAnalysis),
      };

      const readerSimResult = simulateReaderResponse(tempArc, readerProfile);

      const arc: EmotionalArc = {
        ...tempArc,
        readerSimulation: readerSimResult,
      };

      setEmotionalArc(arc);
      setReaderSimulation(arc.readerSimulation);

      // Generate optimization suggestions
      const suggestions = generateOptimizationSuggestions(arc, arcSimulation);
      setOptimizationPlan(suggestions);

      onArcUpdate?.(arc);
    } catch (error) {
      console.error("Error analyzing story emotions:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [storyText, characterIds, readerProfile, onArcUpdate]);

  const splitStoryIntoScenes = (
    text: string
  ): Array<{ sceneId: string; text: string; characterIds: string[] }> => {
    // Simple scene splitting - in real app would use more sophisticated parsing
    const paragraphs = text.split("\n\n").filter((p) => p.trim().length > 0);

    return paragraphs.map((paragraph, index) => ({
      sceneId: `scene-${index}`,
      text: paragraph,
      characterIds: characterIds,
    }));
  };

  const calculateOverallTension = (
    tensionCurve: Array<{ tension: number }>
  ): number => {
    if (tensionCurve.length === 0) return 0;
    const totalTension = tensionCurve.reduce(
      (sum, curve) => sum + curve.tension,
      0
    );
    return Math.round(totalTension / tensionCurve.length);
  };

  const calculatePacingScore = (pacingAnalysis: {
    slowSections: unknown[];
    fastSections: unknown[];
    optimalPacing: unknown[];
  }): number => {
    const { slowSections, fastSections, optimalPacing } = pacingAnalysis;
    const totalSections =
      slowSections.length + fastSections.length + optimalPacing.length;

    if (totalSections === 0) return 50;

    const optimalRatio = optimalPacing.length / totalSections;
    return Math.round(optimalRatio * 100);
  };

  const handleCharacterSwitch = (characterId: string) => {
    setSelectedCharacter(characterId);
  };

  const handleOptimizationApply = (suggestionTitle: string) => {
    // In a real implementation, this would apply the suggestion to the story
    console.log("Applying optimization:", suggestionTitle);
  };

  if (!emotionalArc) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isAnalyzing
              ? "Analyzing emotional arc..."
              : "No story data available"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Emotional Arc Analysis
          </h2>
          <p className="text-gray-600">
            Story engagement and pacing optimization
          </p>
        </div>

        <CharacterArcSwitch
          characterIds={characterIds}
          selectedCharacter={selectedCharacter}
          onCharacterSwitch={handleCharacterSwitch}
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-blue-600">
            Overall Tension
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {emotionalArc.overallTension}%
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-green-600">
            Empathy Score
          </div>
          <div className="text-2xl font-bold text-green-900">
            {readerSimulation?.empathyScore || 0}%
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-purple-600">
            Emotional Complexity
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {emotionalArc.emotionalComplexity}%
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-orange-600">
            Pacing Score
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {emotionalArc.pacingScore}%
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "timeline", label: "Timeline", icon: "📊" },
            { id: "tension", label: "Tension Curve", icon: "📈" },
            { id: "sentiment", label: "Scene Analysis", icon: "🎭" },
            { id: "suggestions", label: "Optimizations", icon: "💡" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(
                  tab.id as "timeline" | "tension" | "sentiment" | "suggestions"
                )
              }
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === "timeline" && emotionalArc && (
          <EmotionTimelineChart
            emotionalBeats={emotionalArc.beats}
            selectedCharacter={selectedCharacter}
            simulation={simulation || undefined}
          />
        )}

        {activeTab === "tension" && simulation && (
          <TensionCurveViewer
            tensionCurve={simulation.tensionCurve || []}
            emotionalPeaks={simulation.emotionalPeaks || []}
            readerEngagement={simulation.readerEngagement}
          />
        )}

        {activeTab === "sentiment" && (
          <SceneSentimentPanel
            sceneData={sceneData}
            selectedCharacter={selectedCharacter}
            onSceneSelect={(sceneId) => {
              // Handle scene selection
              console.log("Selected scene:", sceneId);
            }}
          />
        )}

        {activeTab === "suggestions" && (
          <OptimizationSuggestions
            optimizationPlan={optimizationPlan || undefined}
            onApplySuggestion={handleOptimizationApply}
          />
        )}
      </div>

      {/* Reader Simulation Warning */}
      {readerSimulation?.predictedEngagementDrop && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Reader Engagement Risk Detected
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Low tension sections may cause reader disengagement. Consider
                  adding conflict or stakes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
