/**
 * Section Analyzer Component
 * Provides a UI for users to input text sections and view AI-powered analysis results
 * including title suggestions, summaries, topics, keywords, sentiment, and reading level.
 * MCP Actions: summarize, tag, label
 */

import { useState } from "react";
import { analyzeSection, SectionAnalysis } from "../services/ebookAnalyzer";
import { useMCP } from "../useMCP";

interface AnalysisState {
  isLoading: boolean;
  result: SectionAnalysis | null;
  error: string | null;
}

export function SectionAnalyzer() {
  const ctx = useMCP("SectionAnalyzer.tsx");
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisState>({
    isLoading: false,
    result: null,
    error: null,
  });

  const canAnalyze = ctx.allowedActions.includes("summarize");

  const handleAnalyze = async () => {
    if (!text.trim() || !canAnalyze) return;

    setAnalysis({
      isLoading: true,
      result: null,
      error: null,
    });

    try {
      const result = await analyzeSection(text);
      setAnalysis({
        isLoading: false,
        result,
        error: null,
      });
    } catch (error) {
      setAnalysis({
        isLoading: false,
        result: null,
        error: error instanceof Error ? error.message : "Analysis failed",
      });
    }
  };

  const handleRetry = () => {
    handleAnalyze();
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200";
      case "negative":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getReadingLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "advanced":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section Analyzer
        </h2>
        <p className="text-gray-600">
          Analyze text sections to extract metadata, summaries, and insights
        </p>
      </div>

      {/* Permission Check */}
      {!canAnalyze && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-yellow-400 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-yellow-800 font-medium">
              You don&apos;t have permission to analyze sections
            </span>
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <label
          htmlFor="section-text"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Text Section
        </label>
        <textarea
          id="section-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your section here..."
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          disabled={!canAnalyze}
        />

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {text.length} characters
          </span>

          <button
            onClick={handleAnalyze}
            disabled={!text.trim() || !canAnalyze || analysis.isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {analysis.isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Analyzing...
              </>
            ) : (
              "Analyze Section"
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {analysis.result && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Analysis Results
          </h3>

          <div className="space-y-6">
            {/* Title Suggestion */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Title Suggestion
              </h4>
              <p className="text-lg font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                {analysis.result.titleSuggestion}
              </p>
            </div>

            {/* Summary */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Summary
              </h4>
              <p className="text-gray-700 bg-gray-50 px-3 py-2 rounded-md">
                {analysis.result.summary}
              </p>
            </div>

            {/* Topics and Keywords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Topics
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.result.topics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md border border-blue-200"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.result.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-md border border-green-200"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sentiment and Reading Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Sentiment
                </h4>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getSentimentColor(
                    analysis.result.sentiment
                  )}`}
                >
                  {analysis.result.sentiment.charAt(0).toUpperCase() +
                    analysis.result.sentiment.slice(1)}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Reading Level
                </h4>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getReadingLevelColor(
                    analysis.result.readingLevel
                  )}`}
                >
                  {analysis.result.readingLevel.charAt(0).toUpperCase() +
                    analysis.result.readingLevel.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {analysis.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
          <div className="flex items-center justify-between">
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
              <span className="text-red-800 font-medium">Analysis failed</span>
            </div>
            <button
              onClick={handleRetry}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Retry
            </button>
          </div>
          <p className="text-red-700 mt-2 text-sm">{analysis.error}</p>
        </div>
      )}
    </div>
  );
}

export default SectionAnalyzer;
