// MCP Context Block
/*
{
  file: "PromptPatternEditor.tsx",
  role: "ui-engineer",
  allowedActions: ["create", "validate", "manage"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "writing_assistant"
}
*/

import React, { useState, useEffect } from "react";
import {
  getAvailableGenres,
  getAvailableArcs,
  getAvailableTones,
  registerUserPromptPatterns,
  listAllPatterns,
  PromptPattern,
} from "../engines/PromptPatternLibrary";
import { useMCP } from "../useMCP";

interface PromptPatternFormData {
  genre: string;
  arc: PromptPattern["arc"];
  tone?: PromptPattern["tone"];
  pattern: string;
  tags: string[];
}

interface PromptPatternEditorProps {
  onPatternSaved?: (pattern: PromptPattern) => void;
  showPreview?: boolean;
  isAdmin?: boolean;
}

const PromptPatternEditor: React.FC<PromptPatternEditorProps> = ({
  onPatternSaved,
  showPreview = true,
  isAdmin = false,
}) => {
  const mcp = useMCP("PromptPatternEditor");
  const [formData, setFormData] = useState<PromptPatternFormData>({
    genre: "",
    arc: "setup",
    tone: undefined,
    pattern: "",
    tags: [],
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userPatterns, setUserPatterns] = useState<PromptPattern[]>([]);
  const [availableGenres] = useState(getAvailableGenres());
  const [availableArcs] = useState(getAvailableArcs());
  const [availableTones] = useState(getAvailableTones());

  // Check if user has Pro or Admin tier
  const hasProAccess = mcp.tier === "Pro" || mcp.tier === "Admin";

  // Load user patterns on mount
  useEffect(() => {
    if (hasProAccess) {
      const allPatterns = listAllPatterns();
      const userPatterns = allPatterns.user.flatMap((genre) => genre.patterns);
      setUserPatterns(userPatterns);
    }
  }, [hasProAccess]);

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.genre) {
      newErrors.push("Genre is required");
    }

    if (!formData.arc) {
      newErrors.push("Narrative arc is required");
    }

    if (!formData.pattern.trim()) {
      newErrors.push("Pattern text is required");
    } else if (formData.pattern.length > 300) {
      newErrors.push("Pattern text must be 300 characters or less");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const newPattern: PromptPattern = {
        arc: formData.arc,
        pattern: formData.pattern.trim(),
        tone: formData.tone,
        tags: formData.tags,
        source: "user",
      };

      // Register the new pattern
      registerUserPromptPatterns([
        {
          genre: formData.genre,
          patterns: [newPattern],
        },
      ]);

      // Update local state
      setUserPatterns((prev) => [...prev, newPattern]);

      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Reset form
      setFormData({
        genre: "",
        arc: "setup",
        tone: undefined,
        pattern: "",
        tags: [],
      });

      // Call callback if provided
      if (onPatternSaved) {
        onPatternSaved(newPattern);
      }
    } catch (_error) {
      setErrors(["Failed to save pattern. Please try again."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (
    field: keyof PromptPatternFormData,
    value: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  // Insert example pattern
  const insertExample = () => {
    const examples = {
      Romance: {
        pattern:
          "Show [CHARACTER] experiencing a moment of unexpected vulnerability.",
        arc: "rising" as const,
        tone: "reflective" as const,
      },
      Mystery: {
        pattern:
          "Reveal a detail that contradicts [CHARACTER]'s initial assumption.",
        arc: "rising" as const,
        tone: "ironic" as const,
      },
      "Science Fiction": {
        pattern:
          "Show [CHARACTER] adapting to technology that changes their worldview.",
        arc: "setup" as const,
        tone: "dramatic" as const,
      },
    };

    const example = examples[formData.genre as keyof typeof examples];
    if (example) {
      setFormData((prev) => ({
        ...prev,
        pattern: example.pattern,
        arc: example.arc,
        tone: example.tone,
      }));
    }
  };

  // Export patterns
  const exportPatterns = () => {
    const data = {
      patterns: userPatterns,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prompt-patterns.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // If user doesn't have Pro access, show locked message
  if (!hasProAccess) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <div className="text-gray-500 mb-4">
          <svg
            className="w-12 h-12 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Pro Feature
        </h3>
        <p className="text-gray-600">
          This feature is available to Pro members.
        </p>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Upgrade to Pro
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Prompt Pattern Editor
          </h2>
          <p className="text-gray-600 mt-1">
            Create reusable writing prompt templates for your favorite genres.
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex">
              <svg
                className="w-5 h-5 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="ml-3 text-sm text-green-800">
                Prompt pattern saved successfully!
              </p>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <svg
                className="w-5 h-5 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">
                  Please fix the following errors:
                </p>
                <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Genre Selection */}
            <div>
              <label
                htmlFor="genre"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Genre *
              </label>
              <select
                id="genre"
                value={formData.genre}
                onChange={(e) => handleInputChange("genre", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a genre</option>
                {availableGenres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            {/* Narrative Arc */}
            <div>
              <label
                htmlFor="arc"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Narrative Arc *
                <span
                  className="ml-1 text-gray-500"
                  title="The stage of the story where this prompt applies"
                >
                  <svg
                    className="w-4 h-4 inline"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </label>
              <select
                id="arc"
                value={formData.arc}
                onChange={(e) =>
                  handleInputChange(
                    "arc",
                    e.target.value as PromptPattern["arc"]
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {availableArcs.map((arc) => (
                  <option key={arc} value={arc}>
                    {arc.charAt(0).toUpperCase() + arc.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Tone (Optional) */}
            <div>
              <label
                htmlFor="tone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tone (Optional)
                <span
                  className="ml-1 text-gray-500"
                  title="The emotional tone this prompt should convey"
                >
                  <svg
                    className="w-4 h-4 inline"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </label>
              <select
                id="tone"
                value={formData.tone || ""}
                onChange={(e) =>
                  handleInputChange("tone", e.target.value || "")
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">No specific tone</option>
                {availableTones.map((tone) => (
                  <option key={tone} value={tone}>
                    {tone.charAt(0).toUpperCase() + tone.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Character Count */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {formData.pattern.length}/300 characters
              </span>
              <button
                type="button"
                onClick={insertExample}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
              >
                Insert Example
              </button>
            </div>
          </div>

          {/* Pattern Text */}
          <div className="mt-6">
            <label
              htmlFor="pattern"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Pattern Text *
            </label>
            <textarea
              id="pattern"
              value={formData.pattern}
              onChange={(e) => handleInputChange("pattern", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Enter your prompt pattern here. Use [CHARACTER], [LOCATION], [CONFLICT] as placeholders."
              maxLength={300}
              required
            />
            <div className="mt-2 text-sm text-gray-500">
              <p>
                Available placeholders: [CHARACTER], [LOCATION], [CONFLICT],
                [SECRET], [EMOTION]
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-between items-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Saving..." : "Save Pattern"}
            </button>

            {userPatterns.length > 0 && (
              <button
                type="button"
                onClick={exportPatterns}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Export Patterns
              </button>
            )}
          </div>
        </form>

        {/* Pattern Preview */}
        {showPreview && userPatterns.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Your Patterns ({userPatterns.length})
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {userPatterns.map((pattern, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-md">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          {pattern.arc}
                        </span>
                        {pattern.tone && (
                          <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">
                            {pattern.tone}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{pattern.pattern}</p>
                    </div>
                    {isAdmin && (
                      <button
                        type="button"
                        className="text-xs text-green-600 hover:text-green-700 ml-2"
                        title="Mark as approved"
                      >
                        ✓
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptPatternEditor;
