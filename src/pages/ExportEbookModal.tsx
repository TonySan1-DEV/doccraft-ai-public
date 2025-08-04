import React, { useState } from "react";
import {
  Loader2,
  Download,
  X,
  FileText,
  BookOpen,
  Presentation,
  FileDown,
} from "lucide-react";
import { exportService, ExportOptions } from "../services/exportService";
import { ebookTemplateService } from "../services/ebookTemplateService";

export interface Section {
  id: string;
  title: string;
  content: string;
}

interface ExportEbookModalProps {
  open: boolean;
  onClose: () => void;
  docId: string;
  content: Section[];
  templateId?: string;
  integratedResult?: any;
}

const formatOptions = [
  {
    label: "PDF Document",
    value: "pdf",
    icon: FileText,
    description: "Professional PDF with formatting",
  },
  {
    label: "EPUB Ebook",
    value: "epub",
    icon: BookOpen,
    description: "Ebook format for readers",
  },
  {
    label: "PowerPoint Slides",
    value: "pptx",
    icon: Presentation,
    description: "Presentation slides",
  },
  {
    label: "Word Document",
    value: "docx",
    icon: FileDown,
    description: "Editable Word document",
  },
];

type ExportFormat = "pdf" | "epub" | "pptx" | "docx";

const ExportEbookModal: React.FC<ExportEbookModalProps> = ({
  open,
  onClose,
  docId,
  content,
  templateId,
  integratedResult,
}) => {
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportResult, setExportResult] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  if (!open) return null;

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    setExportResult(null);

    try {
      // Get template
      let template = null;
      if (templateId) {
        template = await ebookTemplateService.getTemplate(templateId);
      } else if (integratedResult?.template) {
        template = integratedResult.template;
      } else {
        template = await ebookTemplateService.getTemplate("professional");
      }
      setSelectedTemplate(template);

      // Prepare export options
      const exportOptions: ExportOptions = {
        format,
        quality: "high",
        includeImages: true,
        includeMetadata: true,
        includeTableOfContents: true,
      };

      let result;
      if (integratedResult) {
        // Use integrated result for better formatting
        if (format === "pdf") {
          result = await exportService.exportToPDF(
            integratedResult.formattedContent,
            template,
            exportOptions
          );
        } else if (format === "epub") {
          result = await exportService.exportToEPUB(
            integratedResult.formattedContent,
            template,
            exportOptions
          );
        } else if (format === "pptx") {
          result = await exportService.exportToPPTX(
            integratedResult.formattedContent,
            template,
            exportOptions
          );
        } else {
          // Fallback to API for other formats
          result = await this.callExportAPI(
            docId,
            format,
            content,
            templateId,
            exportOptions
          );
        }
      } else {
        // Use API for basic content
        result = await this.callExportAPI(
          docId,
          format,
          content,
          templateId,
          exportOptions
        );
      }

      if (result.success) {
        setExportResult(result);
        // Trigger download
        if (result.downloadUrl) {
          const link = document.createElement("a");
          link.href = result.downloadUrl;
          link.download = `${docId}-${format}.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        setError(result.error || "Export failed");
      }
    } catch (err: any) {
      setError(err.message || "Export failed");
    } finally {
      setLoading(false);
    }
  };

  const callExportAPI = async (
    docId: string,
    format: ExportFormat,
    content: Section[],
    templateId?: string,
    options?: ExportOptions
  ) => {
    const res = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docId, format, content, templateId, options }),
    });

    if (!res.ok) throw new Error("Export API failed");
    return await res.json();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-lg p-6 relative">
        <button
          className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          onClick={onClose}
          aria-label="Close"
        >
          <X />
        </button>

        <h2 className="text-2xl font-bold mb-4">Export Ebook</h2>

        {/* Format Selection */}
        <div className="mb-6">
          <div className="font-medium mb-3">Choose export format:</div>
          <div className="grid grid-cols-2 gap-3">
            {formatOptions.map((opt) => {
              const IconComponent = opt.icon;
              return (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    format === opt.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="export-format"
                    value={opt.value}
                    checked={format === opt.value}
                    onChange={() => setFormat(opt.value as ExportFormat)}
                    className="sr-only"
                    disabled={loading}
                  />
                  <IconComponent className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <div className="font-medium">{opt.label}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {opt.description}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Template Info */}
        {selectedTemplate && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Template: {selectedTemplate.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {selectedTemplate.description}
            </div>
          </div>
        )}

        {/* Export Result */}
        {exportResult && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Download className="w-4 h-4" />
              <span className="font-medium">Export successful!</span>
            </div>
            {exportResult.metadata && (
              <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                {exportResult.metadata.wordCount && (
                  <div>
                    Words: {exportResult.metadata.wordCount.toLocaleString()}
                  </div>
                )}
                {exportResult.metadata.chapters && (
                  <div>Chapters: {exportResult.metadata.chapters}</div>
                )}
                {exportResult.metadata.pages && (
                  <div>Pages: {exportResult.metadata.pages}</div>
                )}
                {exportResult.fileSize && (
                  <div>Size: {exportResult.fileSize}</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="text-red-700 dark:text-red-300">{error}</div>
          </div>
        )}

        {/* Export Button */}
        <button
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-60 transition-colors"
          onClick={handleExport}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" />
              <span>Generating {format.toUpperCase()}...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Export {format.toUpperCase()}</span>
            </>
          )}
        </button>

        {/* Additional Info */}
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          {format === "pdf" &&
            "Professional PDF with proper formatting and layout"}
          {format === "epub" && "Ebook format compatible with most e-readers"}
          {format === "pptx" &&
            "PowerPoint presentation with slides for each chapter"}
          {format === "docx" &&
            "Editable Word document for further customization"}
        </div>
      </div>
    </div>
  );
};

export default ExportEbookModal;
