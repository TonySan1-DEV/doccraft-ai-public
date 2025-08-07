import { useState } from "react";
import { X, Upload, Search, Wand2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { searchStockImages, generateAIImage, type ImageResult } from "../services/imageService";
import toast from "react-hot-toast";

interface ManualImageSelectorProps {
  section: {
    id: string;
    content: string;
    topic_tags: string[];
    tone: string;
    intent: string;
  };
  onClose: () => void;
  onImageSelect: (image: {
    id: string;
    section_id: string;
    source: 'ai' | 'stock' | 'upload';
    source_metadata: Record<string, unknown>;
    caption: string;
    relevance_score: number;
    image_url: string;
  }) => void;
}

export default function ManualImageSelector({
  section,
  onClose,
  onImageSelect,
}: ManualImageSelectorProps) {
  const [activeTab, setActiveTab] = useState<"search" | "ai" | "upload">(
    "search"
  );
  const [searchQuery, setSearchQuery] = useState(section.topic_tags.join(" "));
  const [searchResults, setSearchResults] = useState<ImageResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      // In a real app, you'd upload this to your storage service
      const imageUrl = URL.createObjectURL(file);

      const image = {
        id: `upload-${Date.now()}`,
        section_id: section.id,
        source: "upload" as const,
        source_metadata: { filename: file.name, size: file.size },
        caption: `Uploaded image: ${file.name}`,
        relevance_score: 1.0,
        image_url: imageUrl,
      };

      onImageSelect(image);
    },
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await searchStockImages(searchQuery);
      setSearchResults(results);
    } catch (error: unknown) {
      toast.error((error as Error).message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;

    setLoading(true);
    try {
      const result = await generateAIImage({ prompt: aiPrompt });
      const image = {
        id: `ai-${Date.now()}`,
        section_id: section.id,
        source: "ai" as const,
        source_metadata: { prompt: aiPrompt },
        caption: `AI generated: ${aiPrompt}`,
        relevance_score: 0.9,
        image_url: result.url,
      };
      onImageSelect(image);
    } catch (error: unknown) {
      toast.error((error as Error).message || "AI generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectImage = (image: ImageResult) => {
    const selectedImage = {
      id: `stock-${Date.now()}`,
      section_id: section.id,
      source: "stock" as const,
      source_metadata: { title: image.title, description: image.description, tags: image.tags },
      caption: image.title,
      relevance_score: 0.8,
      image_url: image.url,
    };
    onImageSelect(selectedImage);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Add Image to Section</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("search")}
            className={`px-6 py-3 font-medium ${
              activeTab === "search"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Search className="w-4 h-4 inline mr-2" />
            Search Stock
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-6 py-3 font-medium ${
              activeTab === "ai"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Wand2 className="w-4 h-4 inline mr-2" />
            AI Generate
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-6 py-3 font-medium ${
              activeTab === "upload"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Upload
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === "search" && (
            <div>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for images..."
                  className="input flex-1"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {searchResults.map((image, index) => (
                    <div
                      key={index}
                      className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleSelectImage(image)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSelectImage(image)
                      }
                      role="button"
                      tabIndex={0}
                    >
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-2">
                        <p className="text-xs text-gray-600 truncate">
                          {image.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "ai" && (
            <div>
              <div className="mb-4">
                <label
                  htmlFor="ai-prompt"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  AI Image Prompt
                </label>
                <textarea
                  id="ai-prompt"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe the image you want to generate..."
                  className="textarea"
                  rows={3}
                />
              </div>
              <button
                onClick={handleGenerateAI}
                disabled={loading || !aiPrompt.trim()}
                className="btn btn-primary"
              >
                {loading ? "Generating..." : "Generate Image"}
              </button>
            </div>
          )}

          {activeTab === "upload" && (
            <div>
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Upload an Image
                </h3>
                <p className="text-gray-600">
                  Drag and drop your image here, or click to browse
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Supports PNG, JPG, JPEG, GIF, WebP (max 5MB)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
