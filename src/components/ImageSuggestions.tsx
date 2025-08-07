import { useState, useEffect } from "react";
import {
  Heart,
  X,
  RefreshCw,
  Download,
  ExternalLink,
  Sparkles,
  Camera,
  Upload,
} from "lucide-react";
import { generateImageSuggestions } from "../services/imageService";
import toast from "react-hot-toast";
import { useMCP } from "../useMCP";

interface ImageSuggestionsProps {
  document: {
    id: string;
    title: string;
    content: string;
    sections: Array<{
      id: string;
      content: string;
      topicTags: string[];
      tone: string;
      intent: string;
    }>;
  };
}

interface ImageSuggestion {
  id: string;
  url: string;
  caption: string;
  source: "ai" | "stock" | "upload";
  relevanceScore: number;
  sourceMetadata: {
    author?: string;
    platform?: string;
    prompt?: string;
  };
}

export function ImageSuggestions({ document }: ImageSuggestionsProps) {
  const ctx = useMCP("components/ImageSuggestions.tsx");
  const [suggestions, setSuggestions] = useState<
    Record<string, ImageSuggestion[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>(
    document.sections[0]?.id || ""
  );
  const [feedback, setFeedback] = useState<
    Record<string, "like" | "dislike" | null>
  >({});

  useEffect(() => {
    if (document.sections.length > 0) {
      loadSuggestions();
    }
  }, [document]);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const allSuggestions: Record<string, ImageSuggestion[]> = {};

      for (const section of document.sections) {
        const sectionSuggestions = await generateImageSuggestions(section);
        allSuggestions[section.id] = sectionSuggestions;
      }

      setSuggestions(allSuggestions);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate image suggestions";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (imageId: string, type: "like" | "dislike") => {
    setFeedback((prev) => ({
      ...prev,
      [imageId]: prev[imageId] === type ? null : type,
    }));

    // In a real app, this would send feedback to the backend
    toast.success(
      `Feedback recorded: ${type === "like" ? "Liked" : "Disliked"}`
    );
  };

  const handleRefresh = async () => {
    if (!selectedSection) return;

    setLoading(true);
    try {
      const section = document.sections.find((s) => s.id === selectedSection);
      if (section) {
        const newSuggestions = await generateImageSuggestions(section);
        setSuggestions((prev) => ({
          ...prev,
          [selectedSection]: newSuggestions,
        }));
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to refresh suggestions";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "ai":
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case "stock":
        return <Camera className="w-4 h-4 text-blue-500" />;
      case "upload":
        return <Upload className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "ai":
        return "AI Generated";
      case "stock":
        return "Stock Photo";
      case "upload":
        return "User Upload";
      default:
        return source;
    }
  };

  const currentSuggestions = selectedSection
    ? suggestions[selectedSection] || []
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Image Suggestions
          </h2>
          <p className="text-gray-600">
            AI-powered visual recommendations for your document
          </p>

          {/* Role Badge */}
          <span className="text-xs text-blue-600 font-bold">
            Role: {ctx.role}
          </span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading || !selectedSection || ctx.role === "viewer"}
          className={`btn btn-secondary ${
            ctx.role === "viewer" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          {ctx.role === "viewer" ? "View Only" : "Refresh"}
        </button>
      </div>

      {/* Viewer Warning Banner */}
      {ctx.role === "viewer" && (
        <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded border border-yellow-300">
          ⚠️ View-Only Mode Active — Editing Disabled
        </div>
      )}

      {/* Section Selector */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Select Section</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {document.sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => setSelectedSection(section.id)}
              disabled={ctx.role === "viewer"}
              className={`p-3 text-left rounded-lg border transition-colors ${
                selectedSection === section.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              } ${
                ctx.role === "viewer" ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <div className="font-medium text-sm text-gray-900 mb-1">
                Section {index + 1}
              </div>
              <div className="text-xs text-gray-600 line-clamp-2">
                {section.content.substring(0, 100)}...
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {section.topicTags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Image Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Generating image suggestions...</p>
          </div>
        </div>
      ) : currentSuggestions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="bg-white rounded-lg border overflow-hidden"
            >
              {/* Image */}
              <div className="aspect-video bg-gray-100 relative">
                <img
                  src={suggestion.url}
                  alt={suggestion.caption}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop";
                  }}
                />

                {/* Source Badge */}
                <div className="absolute top-2 left-2">
                  <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                    {getSourceIcon(suggestion.source)}
                    <span className="text-xs font-medium">
                      {getSourceLabel(suggestion.source)}
                    </span>
                  </div>
                </div>

                {/* Relevance Score */}
                <div className="absolute top-2 right-2">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                    <span className="text-xs font-medium text-gray-700">
                      {Math.round(suggestion.relevanceScore * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-sm text-gray-800 mb-3 line-clamp-2">
                  {suggestion.caption}
                </p>

                {/* Metadata */}
                {suggestion.sourceMetadata.author && (
                  <p className="text-xs text-gray-500 mb-3">
                    by {suggestion.sourceMetadata.author}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleFeedback(suggestion.id, "like")}
                      disabled={ctx.role === "viewer"}
                      className={`p-2 rounded-full transition-colors ${
                        feedback[suggestion.id] === "like"
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600"
                      } ${
                        ctx.role === "viewer"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleFeedback(suggestion.id, "dislike")}
                      disabled={ctx.role === "viewer"}
                      className={`p-2 rounded-full transition-colors ${
                        feedback[suggestion.id] === "dislike"
                          ? "bg-gray-200 text-gray-800"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      } ${
                        ctx.role === "viewer"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => window.open(suggestion.url, "_blank")}
                      disabled={ctx.role === "viewer"}
                      className={`p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                        ctx.role === "viewer"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        // In a real app, this would download the image
                        toast.success("Download started");
                      }}
                      disabled={ctx.role === "viewer"}
                      className={`p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors ${
                        ctx.role === "viewer"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : selectedSection ? (
        <div className="text-center py-12">
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No suggestions yet
          </h3>
          <p className="text-gray-600 mb-4">
            Click &quot;Refresh&quot; to generate image suggestions for this
            section
          </p>
          {ctx.role === "viewer" ? (
            <span className="text-sm text-gray-500 italic">View Only</span>
          ) : (
            <button onClick={handleRefresh} className="btn btn-primary">
              Generate Suggestions
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a section
          </h3>
          <p className="text-gray-600">
            Choose a document section to view image suggestions
          </p>
        </div>
      )}
    </div>
  );
}
