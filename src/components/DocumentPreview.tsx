import { Calendar, Tag, Palette, Target } from "lucide-react";
import { useMCP } from "../useMCP";

interface DocumentPreviewProps {
  document: {
    id: string;
    title: string;
    content: string;
    created_at: string;
  };
  sections: Array<{
    id: string;
    content: string;
    topic_tags: string[];
    tone: string;
    intent: string;
    section_order: number;
  }>;
  images: Array<{
    id: string;
    section_id: string;
    source: "ai" | "stock" | "upload";
    source_metadata: Record<string, unknown>;
    caption: string;
    relevance_score: number;
    image_url: string;
  }>;
}

export default function DocumentPreview({
  document,
  sections,
  images,
}: DocumentPreviewProps) {
  const ctx = useMCP("DocumentPreview.tsx");
  const getImagesForSection = (sectionId: string) => {
    return images
      .filter((img) => img.section_id === sectionId)
      .sort((a, b) => b.relevance_score - a.relevance_score);
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "ai":
        return "🤖";
      case "stock":
        return "📸";
      case "upload":
        return "📁";
      default:
        return "🖼️";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Viewer Warning Banner */}
      {ctx.role === "viewer" && (
        <div className="lg:col-span-3 bg-yellow-100 text-yellow-800 px-3 py-2 rounded border border-yellow-300 mb-4">
          ⚠️ View-Only Mode Active — Interaction Disabled
        </div>
      )}

      {/* Document Content */}
      <div className="lg:col-span-2">
        <div className="card">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-800">
                {document.title}
              </h1>
              {/* Role Badge */}
              <span className="text-xs text-blue-600 font-bold">
                Role: {ctx.role}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(document.created_at).toLocaleDateString()}
            </div>
          </div>

          <div className="prose max-w-none">
            {sections.length > 0 ? (
              sections.map((section, index) => {
                const sectionImages = getImagesForSection(section.id);
                const bestImage = sectionImages[0];

                return (
                  <div key={section.id} className="mb-8">
                    {/* Section Content */}
                    <div className="mb-4">
                      {section.content.split("\n").map((paragraph, pIndex) => (
                        <p
                          key={pIndex}
                          className="mb-3 text-gray-700 leading-relaxed"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    {/* Section Image */}
                    {bestImage && (
                      <div className="mb-4">
                        <img
                          src={bestImage.image_url}
                          alt={bestImage.caption}
                          className="w-full h-64 object-cover rounded-lg shadow-sm"
                        />
                        <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                          <span>{bestImage.caption}</span>
                          <div className="flex items-center gap-2">
                            <span>{getSourceIcon(bestImage.source)}</span>
                            <span>
                              {Math.round(bestImage.relevance_score * 100)}%
                              match
                            </span>
                          </div>
                        </div>
                        {/* Interactive Image Controls */}
                        <div className="mt-2 flex items-center space-x-2">
                          {ctx.role === "viewer" ? (
                            <span className="text-sm text-gray-500 italic">
                              View Only
                            </span>
                          ) : (
                            <>
                              <button
                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                                disabled={ctx.role === "viewer"}
                              >
                                Replace Image
                              </button>
                              <button
                                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                                disabled={ctx.role === "viewer"}
                              >
                                Download
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Section Metadata */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="flex items-center text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        <Palette className="w-3 h-3 mr-1" />
                        {section.tone}
                      </div>
                      <div className="flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        <Target className="w-3 h-3 mr-1" />
                        {section.intent}
                      </div>
                      {section.topic_tags.map((tag, tagIndex) => (
                        <div
                          key={tagIndex}
                          className="flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </div>
                      ))}
                    </div>

                    {index < sections.length - 1 && <hr className="my-6" />}
                  </div>
                );
              })
            ) : (
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {document.content}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Document Stats */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Document Stats</h3>
            {ctx.role === "viewer" ? (
              <span className="text-xs text-gray-500 italic">View Only</span>
            ) : (
              <button
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                disabled={ctx.role === "viewer"}
              >
                Export Stats
              </button>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Sections</span>
              <span className="font-medium">{sections.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Images</span>
              <span className="font-medium">{images.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Words</span>
              <span className="font-medium">
                {
                  document.content
                    .split(/\s+/)
                    .filter((word) => word.length > 0).length
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Characters</span>
              <span className="font-medium">{document.content.length}</span>
            </div>
          </div>
        </div>

        {/* Image Sources */}
        {images.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">Image Sources</h3>
            <div className="space-y-2">
              {["ai", "stock", "upload"].map((source) => {
                const count = images.filter(
                  (img) => img.source === source
                ).length;
                if (count === 0) return null;

                return (
                  <div
                    key={source}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <span className="mr-2">{getSourceIcon(source)}</span>
                      <span className="text-gray-600 capitalize">{source}</span>
                    </div>
                    <span className="font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top Topics */}
        {sections.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Top Topics</h3>
              {ctx.role === "viewer" ? (
                <span className="text-xs text-gray-500 italic">View Only</span>
              ) : (
                <button
                  className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                  disabled={ctx.role === "viewer"}
                >
                  Edit Tags
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(sections.flatMap((s) => s.topic_tags)))
                .slice(0, 10)
                .map((tag, index) => (
                  <span
                    key={index}
                    className={`text-xs px-2 py-1 rounded ${
                      ctx.role === "viewer"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
