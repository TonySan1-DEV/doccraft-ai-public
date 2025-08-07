// MCP Context Block
/*
{
  file: "PresetSelector.tsx",
  role: "frontend-developer",
  allowedActions: ["ui", "presets", "preferences"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "writer_presets"
}
*/

import { useState, useCallback, useEffect } from "react";
import { useAgentPreferences } from "../contexts/AgentPreferencesContext";
import { presetService, CustomPreset } from "../services/presetService";
import {
  WriterPreset,
  presetCategories,
  getPresetsByCategory,
} from "../constants/writerPresets";

interface PresetSelectorProps {
  className?: string;
  onPresetApplied?: (preset: WriterPreset | CustomPreset) => void;
  showCreateCustom?: boolean;
  showRecentlyUsed?: boolean;
  showRecommendations?: boolean;
}

export function PresetSelector({
  className = "",
  onPresetApplied,
  showCreateCustom = true,
  showRecentlyUsed = true,
  showRecommendations = true,
}: PresetSelectorProps) {
  const { preferences, updatePreferences } = useAgentPreferences();
  const [activeCategory, setActiveCategory] =
    useState<keyof typeof presetCategories>("writing");
  const [searchQuery, setSearchQuery] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [lastApplied, setLastApplied] = useState<string | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<
    (WriterPreset | CustomPreset)[]
  >([]);

  // Load recently used presets
  useEffect(() => {
    setRecentlyUsed(presetService.getRecentlyUsedPresets());
  }, []);

  // Load recommendations
  useEffect(() => {
    setRecommendations(presetService.getPresetRecommendations(preferences));
  }, [preferences]);

  // Handle preset application
  const handleApplyPreset = useCallback(
    async (preset: WriterPreset | CustomPreset) => {
      setIsApplying(true);
      try {
        const result = await presetService.applyPreset(
          preset.name,
          preferences,
          {
            createVersion: true,
            versionLabel: `Applied preset: ${preset.name}`,
            mergeMode: "replace",
          }
        );

        if (result.success) {
          await updatePreferences(result.appliedPreferences);
          presetService.addToRecentlyUsed(preset.name);
          presetService.incrementPresetUsage(preset.name);

          setLastApplied(preset.name);
          setTimeout(() => setLastApplied(null), 3000);

          onPresetApplied?.(preset);
        } else {
          console.error("Failed to apply preset:", result.error);
        }
      } catch (error) {
        console.error("Error applying preset:", error);
      } finally {
        setIsApplying(false);
      }
    },
    [preferences, updatePreferences, onPresetApplied]
  );

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Get filtered presets
  const getFilteredPresets = useCallback(() => {
    if (searchQuery) {
      return presetService.searchPresets(searchQuery);
    }
    return getPresetsByCategory(activeCategory);
  }, [searchQuery, activeCategory]);

  // Custom preset form state
  const [customPreset, setCustomPreset] = useState({
    name: "",
    description: "",
    category: "writing" as keyof typeof presetCategories,
    tone: "friendly" as "friendly" | "formal" | "concise",
    copilotEnabled: true,
    memoryEnabled: true,
    defaultCommandView: "list" as "list" | "grid",
    tags: [] as string[],
  });

  // Handle custom preset creation
  const handleCreateCustomPreset = useCallback(async () => {
    try {
      const newPreset = await presetService.createCustomPreset(
        {
          name: customPreset.name,
          description: customPreset.description,
          category: customPreset.category,
          preferences: {
            tone: customPreset.tone,
            copilotEnabled: customPreset.copilotEnabled,
            memoryEnabled: customPreset.memoryEnabled,
            defaultCommandView: customPreset.defaultCommandView,
          },
          tags: customPreset.tags,
        },
        "current-user-id"
      ); // TODO: Get actual user ID

      if (newPreset) {
        setShowCustomForm(false);
        setCustomPreset({
          name: "",
          description: "",
          category: "writing",
          tone: "friendly",
          copilotEnabled: true,
          memoryEnabled: true,
          defaultCommandView: "list",
          tags: [],
        });
      }
    } catch (error) {
      console.error("Error creating custom preset:", error);
    }
  }, [customPreset]);

  return (
    <div className={`preset-selector ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Writing Presets
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Quickly switch between predefined creative modes
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search presets..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Category Tabs */}
      {!searchQuery && (
        <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {Object.entries(presetCategories).map(([key, category]) => (
              <button
                key={key}
                onClick={() =>
                  setActiveCategory(key as keyof typeof presetCategories)
                }
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeCategory === key
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Recently Used */}
      {showRecentlyUsed && recentlyUsed.length > 0 && !searchQuery && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Recently Used
          </h4>
          <div className="flex flex-wrap gap-2">
            {recentlyUsed.slice(0, 5).map((presetName) => {
              const preset = presetService.getPresetByName(presetName);
              if (!preset) return null;

              return (
                <button
                  key={presetName}
                  onClick={() => handleApplyPreset(preset)}
                  disabled={isApplying}
                  className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <span className="mr-1">{preset.icon}</span>
                  {preset.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {showRecommendations && recommendations.length > 0 && !searchQuery && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Recommended for You
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.slice(0, 4).map((preset) => (
              <PresetCard
                key={preset.name}
                preset={preset}
                onApply={handleApplyPreset}
                isApplying={isApplying}
                isApplied={lastApplied === preset.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Preset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getFilteredPresets().map((preset) => (
          <PresetCard
            key={preset.name}
            preset={preset}
            onApply={handleApplyPreset}
            isApplying={isApplying}
            isApplied={lastApplied === preset.name}
          />
        ))}
      </div>

      {/* Create Custom Preset Button */}
      {showCreateCustom && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowCustomForm(true)}
            className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + Create Custom Preset
          </button>
        </div>
      )}

      {/* Custom Preset Form Modal */}
      {showCustomForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create Custom Preset
            </h3>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="preset-name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Preset Name
                </label>
                <input
                  id="preset-name"
                  type="text"
                  value={customPreset.name}
                  onChange={(e) =>
                    setCustomPreset((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter preset name..."
                />
              </div>

              <div>
                <label
                  htmlFor="preset-description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="preset-description"
                  value={customPreset.description}
                  onChange={(e) =>
                    setCustomPreset((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Describe this preset..."
                />
              </div>

              <div>
                <label
                  htmlFor="preset-category"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Category
                </label>
                <select
                  id="preset-category"
                  value={customPreset.category}
                  onChange={(e) =>
                    setCustomPreset((prev) => ({
                      ...prev,
                      category: e.target.value as keyof typeof presetCategories,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  {Object.entries(presetCategories).map(([key, category]) => (
                    <option key={key} value={key}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="preset-tone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Tone
                  </label>
                  <select
                    id="preset-tone"
                    value={customPreset.tone}
                    onChange={(e) =>
                      setCustomPreset((prev) => ({
                        ...prev,
                        tone: e.target.value as
                          | "friendly"
                          | "formal"
                          | "concise",
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="friendly">Friendly</option>
                    <option value="formal">Formal</option>
                    <option value="concise">Concise</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="preset-command-view"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Command View
                  </label>
                  <select
                    id="preset-command-view"
                    value={customPreset.defaultCommandView}
                    onChange={(e) =>
                      setCustomPreset((prev) => ({
                        ...prev,
                        defaultCommandView: e.target.value as "list" | "grid",
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="list">List</option>
                    <option value="grid">Grid</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={customPreset.copilotEnabled}
                    onChange={(e) =>
                      setCustomPreset((prev) => ({
                        ...prev,
                        copilotEnabled: e.target.checked,
                      }))
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Enable AI Copilot
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={customPreset.memoryEnabled}
                    onChange={(e) =>
                      setCustomPreset((prev) => ({
                        ...prev,
                        memoryEnabled: e.target.checked,
                      }))
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Enable Session Memory
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCustomForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomPreset}
                disabled={!customPreset.name.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Create Preset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Preset Card Component
interface PresetCardProps {
  preset: WriterPreset | CustomPreset;
  onApply: (preset: WriterPreset | CustomPreset) => void;
  isApplying: boolean;
  isApplied: boolean;
}

function PresetCard({
  preset,
  onApply,
  isApplying,
  isApplied,
}: PresetCardProps) {
  const isCustom = "isCustom" in preset && preset.isCustom;

  return (
    <div
      className={`p-4 border rounded-lg transition-all ${
        isApplied
          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
          : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{preset.icon}</span>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {preset.name}
              {isCustom && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  Custom
                </span>
              )}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {preset.description}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex flex-wrap gap-1">
          {preset.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
            >
              {tag}
            </span>
          ))}
          {preset.tags.length > 3 && (
            <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
              +{preset.tags.length - 3}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {preset.preferences.tone} •{" "}
          {preset.preferences.copilotEnabled ? "Copilot" : "No Copilot"} •{" "}
          {preset.preferences.memoryEnabled ? "Memory" : "No Memory"}
        </div>
        <button
          onClick={() => onApply(preset)}
          disabled={isApplying}
          className={`px-3 py-1 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isApplied
              ? "bg-green-600 text-white"
              : "bg-blue-600 text-white hover:bg-blue-700"
          } disabled:opacity-50`}
        >
          {isApplied ? "Applied" : isApplying ? "Applying..." : "Apply"}
        </button>
      </div>
    </div>
  );
}
