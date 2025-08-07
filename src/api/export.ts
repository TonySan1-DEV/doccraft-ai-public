// Export API Endpoint
// MCP: { role: "api", allowedActions: ["export", "validate", "process"], theme: "export_api", contentSensitivity: "medium", tier: "Pro" }

import {
  exportService,
  ExportOptions,
  PDFExportConfig,
  EPUBExportConfig,
  PPTXExportConfig,
} from "../services/exportService";
import { IntegratedEbookResult } from "../services/ebookIntegrationService";
import { ebookTemplateService, EbookTemplate, FormattedContent } from "../services/ebookTemplateService";

export interface ExportRequest {
  docId: string;
  format: "pdf" | "epub" | "pptx" | "docx";
  content: Record<string, unknown>;
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
        error: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Handle PDF export
   */
  private static async handlePDFExport(
    request: ExportRequest,
    template: EbookTemplate | null,
    options: ExportOptions
  ): Promise<ExportResponse> {
    try {
      const formattedContent = this.convertToFormattedContent(request.content);
      
      if (!template) {
        return {
          success: false,
          error: "Template is required for PDF export",
        };
      }

      const result = await exportService.exportToPDF(
        formattedContent,
        template,
        options,
        request.pdfConfig
      );

      return result;
    } catch (error) {
      console.error("PDF export error:", error);
      return {
        success: false,
        error: `PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Handle EPUB export
   */
  private static async handleEPUBExport(
    request: ExportRequest,
    template: EbookTemplate | null,
    options: ExportOptions
  ): Promise<ExportResponse> {
    try {
      const formattedContent = this.convertToFormattedContent(request.content);
      
      if (!template) {
        return {
          success: false,
          error: "Template is required for EPUB export",
        };
      }

      const result = await exportService.exportToEPUB(
        formattedContent,
        template,
        options,
        request.epubConfig
      );

      return result;
    } catch (error) {
      console.error("EPUB export error:", error);
      return {
        success: false,
        error: `EPUB export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Handle PPTX export
   */
  private static async handlePPTXExport(
    request: ExportRequest,
    template: EbookTemplate | null,
    options: ExportOptions
  ): Promise<ExportResponse> {
    try {
      const formattedContent = this.convertToFormattedContent(request.content);
      
      if (!template) {
        return {
          success: false,
          error: "Template is required for PPTX export",
        };
      }

      const result = await exportService.exportToPPTX(
        formattedContent,
        template,
        options,
        request.pptxConfig
      );

      return result;
    } catch (error) {
      console.error("PPTX export error:", error);
      return {
        success: false,
        error: `PPTX export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Handle DOCX export
   */
  private static async handleDOCXExport(
    _request: ExportRequest,
    _template: EbookTemplate | null,
    _options: ExportOptions
  ): Promise<ExportResponse> {
    // DOCX export not yet implemented
    return {
      success: false,
      error: "DOCX export not yet implemented",
    };
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
  private static convertToFormattedContent(content: Record<string, unknown>): FormattedContent {
    // Convert raw content to FormattedContent structure
    return {
      html: (content.html as string) || "",
      css: (content.css as string) || "",
      metadata: {
        title: (content.title as string) || "Untitled Document",
        author: (content.author as string) || "Unknown Author",
        description: (content.description as string) || "",
        keywords: (content.keywords as string[]) || [],
        language: (content.language as string) || "en",
      },
      structure: {
        chapters: (content.chapters as Array<{ title: string; content: string; id?: string }>) || [],
        sections: (content.sections as Array<{ title: string; content: string; id?: string }>) || [],
        images: (content.images as Array<{ src: string; alt: string; caption?: string }>) || [],
      },
    };
  }

  // TODO: Implement formatFileSize if needed for file size display

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
