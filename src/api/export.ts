// Export API Endpoint
// MCP: { role: "api", allowedActions: ["export", "validate", "process"], theme: "export_api", contentSensitivity: "medium", tier: "Pro" }

import {
  exportService,
  ExportOptions,
  PDFExportConfig,
  EPUBExportConfig,
  PPTXExportConfig,
} from "../services/exportService";
import {
  ebookIntegrationService,
  IntegratedEbookResult,
} from "../services/ebookIntegrationService";
import { ebookTemplateService } from "../services/ebookTemplateService";

export interface ExportRequest {
  docId: string;
  format: "pdf" | "epub" | "pptx" | "docx";
  content: any;
  templateId?: string;
  options?: Partial<ExportOptions>;
  pdfConfig?: Partial<PDFExportConfig>;
  epubConfig?: Partial<EPUBExportConfig>;
  pptxConfig?: Partial<PPTXExportConfig>;
}

export interface ExportResponse {
  success: boolean;
  downloadUrl?: string;
  fileSize?: string;
  error?: string;
  metadata?: {
    pages?: number;
    wordCount?: number;
    imageCount?: number;
    chapters?: number;
  };
}

export class ExportAPI {
  /**
   * Handle export request
   */
  static async handleExport(request: ExportRequest): Promise<ExportResponse> {
    try {
      // Validate request
      const validation = this.validateExportRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Get template if specified
      let template = null;
      if (request.templateId) {
        template = await ebookTemplateService.getTemplate(request.templateId);
        if (!template) {
          return {
            success: false,
            error: `Template ${request.templateId} not found`,
          };
        }
      }

      // Prepare export options
      const exportOptions: ExportOptions = {
        format: request.format,
        quality: "standard",
        includeImages: true,
        includeMetadata: true,
        includeTableOfContents: true,
        ...request.options,
      };

      // Process export based on format
      switch (request.format) {
        case "pdf":
          return await this.handlePDFExport(request, template, exportOptions);
        case "epub":
          return await this.handleEPUBExport(request, template, exportOptions);
        case "pptx":
          return await this.handlePPTXExport(request, template, exportOptions);
        case "docx":
          return await this.handleDOCXExport(request, template, exportOptions);
        default:
          return {
            success: false,
            error: `Unsupported format: ${request.format}`,
          };
      }
    } catch (error) {
      console.error("Export API error:", error);
      return {
        success: false,
        error: `Export failed: ${error.message}`,
      };
    }
  }

  /**
   * Handle PDF export
   */
  private static async handlePDFExport(
    request: ExportRequest,
    template: any,
    options: ExportOptions
  ): Promise<ExportResponse> {
    try {
      // Convert content to FormattedContent format
      const formattedContent = this.convertToFormattedContent(request.content);

      // Use default template if none specified
      const finalTemplate =
        template || (await ebookTemplateService.getTemplate("professional"));

      const result = await exportService.exportToPDF(
        formattedContent,
        finalTemplate,
        options,
        request.pdfConfig
      );

      return result;
    } catch (error) {
      console.error("PDF export error:", error);
      return {
        success: false,
        error: `PDF export failed: ${error.message}`,
      };
    }
  }

  /**
   * Handle EPUB export
   */
  private static async handleEPUBExport(
    request: ExportRequest,
    template: any,
    options: ExportOptions
  ): Promise<ExportResponse> {
    try {
      // Convert content to FormattedContent format
      const formattedContent = this.convertToFormattedContent(request.content);

      // Use default template if none specified
      const finalTemplate =
        template || (await ebookTemplateService.getTemplate("professional"));

      const result = await exportService.exportToEPUB(
        formattedContent,
        finalTemplate,
        options,
        request.epubConfig
      );

      return result;
    } catch (error) {
      console.error("EPUB export error:", error);
      return {
        success: false,
        error: `EPUB export failed: ${error.message}`,
      };
    }
  }

  /**
   * Handle PPTX export
   */
  private static async handlePPTXExport(
    request: ExportRequest,
    template: any,
    options: ExportOptions
  ): Promise<ExportResponse> {
    try {
      // Convert content to FormattedContent format
      const formattedContent = this.convertToFormattedContent(request.content);

      // Use default template if none specified
      const finalTemplate =
        template || (await ebookTemplateService.getTemplate("professional"));

      const result = await exportService.exportToPPTX(
        formattedContent,
        finalTemplate,
        options,
        request.pptxConfig
      );

      return result;
    } catch (error) {
      console.error("PPTX export error:", error);
      return {
        success: false,
        error: `PPTX export failed: ${error.message}`,
      };
    }
  }

  /**
   * Handle DOCX export (placeholder for future implementation)
   */
  private static async handleDOCXExport(
    request: ExportRequest,
    template: any,
    options: ExportOptions
  ): Promise<ExportResponse> {
    try {
      // Convert content to FormattedContent format
      const formattedContent = this.convertToFormattedContent(request.content);

      // Use default template if none specified
      const finalTemplate =
        template || (await ebookTemplateService.getTemplate("professional"));

      // Mock DOCX export for now
      const docxBlob = new Blob(
        [
          `DOCX Export\nTitle: ${formattedContent.title}\nAuthor: ${
            formattedContent.author
          }\nContent: ${formattedContent.chapters
            ?.map((c) => c.title)
            .join(", ")}`,
        ],
        {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }
      );

      const downloadUrl = URL.createObjectURL(docxBlob);

      return {
        success: true,
        downloadUrl,
        fileSize: this.formatFileSize(docxBlob.size),
        metadata: {
          wordCount:
            formattedContent.chapters?.reduce(
              (total, chapter) => total + chapter.content.split(" ").length,
              0
            ) || 0,
          chapters: formattedContent.chapters?.length || 0,
        },
      };
    } catch (error) {
      console.error("DOCX export error:", error);
      return {
        success: false,
        error: `DOCX export failed: ${error.message}`,
      };
    }
  }

  /**
   * Validate export request
   */
  private static validateExportRequest(request: ExportRequest): {
    isValid: boolean;
    error?: string;
  } {
    if (!request.docId) {
      return { isValid: false, error: "Document ID is required" };
    }

    if (!request.format) {
      return { isValid: false, error: "Export format is required" };
    }

    if (!request.content) {
      return { isValid: false, error: "Content is required" };
    }

    const validFormats = ["pdf", "epub", "pptx", "docx"];
    if (!validFormats.includes(request.format)) {
      return {
        isValid: false,
        error: `Invalid format. Supported formats: ${validFormats.join(", ")}`,
      };
    }

    return { isValid: true };
  }

  /**
   * Convert content to FormattedContent format
   */
  private static convertToFormattedContent(content: any): any {
    // Handle different content formats
    if (Array.isArray(content)) {
      // Array of sections
      return {
        title: "Generated Ebook",
        author: "DocCraft AI",
        chapters: content.map((section, index) => ({
          id: section.id || `chapter-${index + 1}`,
          title: section.title || `Chapter ${index + 1}`,
          content: section.content || "",
          level: 1,
        })),
        images: [],
      };
    } else if (content.chapters) {
      // Already in FormattedContent format
      return content;
    } else {
      // Single content string
      return {
        title: content.title || "Generated Ebook",
        author: content.author || "DocCraft AI",
        chapters: [
          {
            id: "chapter-1",
            title: "Main Content",
            content: content.content || content,
            level: 1,
          },
        ],
        images: content.images || [],
      };
    }
  }

  /**
   * Format file size for display
   */
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Export integrated ebook with all available formats
   */
  static async exportIntegratedEbook(
    integratedResult: IntegratedEbookResult,
    options: ExportOptions
  ): Promise<{
    pdf?: ExportResponse;
    epub?: ExportResponse;
    pptx?: ExportResponse;
  }> {
    try {
      const exports = await exportService.exportIntegratedEbook(
        integratedResult,
        options
      );

      return {
        pdf: exports.pdf,
        epub: exports.epub,
        pptx: exports.pptx,
      };
    } catch (error) {
      console.error("Integrated export error:", error);
      return {};
    }
  }
}

// Export for use in API routes
export default ExportAPI;
