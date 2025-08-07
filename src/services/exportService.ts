// Export Service
// MCP: { role: "exporter", allowedActions: ["generate", "format", "optimize"], theme: "document_export", contentSensitivity: "medium", tier: "Pro" }

import { EbookTemplate, FormattedContent } from './ebookTemplateService';
import { IntegratedEbookResult } from './ebookIntegrationService';

export interface ExportOptions {
  format: 'pdf' | 'epub' | 'pptx' | 'docx';
  quality: 'standard' | 'high' | 'premium';
  includeImages: boolean;
  includeMetadata: boolean;
  includeTableOfContents: boolean;
  watermark?: string;
  password?: string;
}

export interface ExportResult {
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

export interface PDFExportConfig {
  pageSize: 'A4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  headerFooter: boolean;
  pageNumbers: boolean;
  bookmarks: boolean;
}

export interface EPUBExportConfig {
  version: '2.0' | '3.0';
  includeNCX: boolean;
  includeCover: boolean;
  includeSpine: boolean;
  includeManifest: boolean;
  compression: 'none' | 'standard' | 'high';
}

export interface PPTXExportConfig {
  slideSize: '4:3' | '16:9' | '16:10';
  includeNotes: boolean;
  includeAnimations: boolean;
  includeTransitions: boolean;
  maxSlidesPerChapter: number;
}

export class ExportService {
  /**
   * Export ebook to PDF format
   */
  async exportToPDF(
    content: FormattedContent,
    template: EbookTemplate,
    _options: ExportOptions,
    config?: Partial<PDFExportConfig>
  ): Promise<ExportResult> {
    try {
      const pdfConfig: PDFExportConfig = {
        pageSize: 'A4',
        orientation: 'portrait',
        margins: { top: 72, bottom: 72, left: 72, right: 72 },
        headerFooter: true,
        pageNumbers: true,
        bookmarks: true,
        ...config,
      };

      // Generate PDF content
      const pdfContent = await this.generatePDFContent(
        content,
        template,
        pdfConfig
      );

      // Create PDF document
      const pdfBlob = await this.createPDFDocument(pdfContent, pdfConfig);

      // Generate download URL
      const downloadUrl = URL.createObjectURL(pdfBlob);

      // Calculate metadata
      const metadata = await this.calculatePDFMetadata(pdfContent);

      return {
        success: true,
        downloadUrl,
        fileSize: this.formatFileSize(pdfBlob.size),
        metadata,
      };
    } catch (error) {
      console.error('PDF export error:', error);
      return {
        success: false,
        error: `PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Export ebook to EPUB format
   */
  async exportToEPUB(
    content: FormattedContent,
    template: EbookTemplate,
    _options: ExportOptions,
    config?: Partial<EPUBExportConfig>
  ): Promise<ExportResult> {
    try {
      const epubConfig: EPUBExportConfig = {
        version: '3.0',
        includeNCX: true,
        includeCover: true,
        includeSpine: true,
        includeManifest: true,
        compression: 'standard',
        ...config,
      };

      // Generate EPUB content
      const epubContent = await this.generateEPUBContent(
        content,
        template,
        epubConfig
      );

      // Create EPUB document
      const epubBlob = await this.createEPUBDocument(epubContent, epubConfig);

      // Generate download URL
      const downloadUrl = URL.createObjectURL(epubBlob);

      // Calculate metadata
      const metadata = await this.calculateEPUBMetadata(epubContent);

      return {
        success: true,
        downloadUrl,
        fileSize: this.formatFileSize(epubBlob.size),
        metadata,
      };
    } catch (error) {
      console.error('EPUB export error:', error);
      return {
        success: false,
        error: `EPUB export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Export ebook to PPTX format (slides)
   */
  async exportToPPTX(
    content: FormattedContent,
    template: EbookTemplate,
    _options: ExportOptions,
    config?: Partial<PPTXExportConfig>
  ): Promise<ExportResult> {
    try {
      const pptxConfig: PPTXExportConfig = {
        slideSize: '16:9',
        includeNotes: true,
        includeAnimations: false,
        includeTransitions: true,
        maxSlidesPerChapter: 5,
        ...config,
      };

      // Generate PPTX content
      const pptxContent = await this.generatePPTXContent(
        content,
        template,
        pptxConfig
      );

      // Create PPTX document
      const pptxBlob = await this.createPPTXDocument(pptxContent, pptxConfig);

      // Generate download URL
      const downloadUrl = URL.createObjectURL(pptxBlob);

      // Calculate metadata
      const metadata = await this.calculatePPTXMetadata(pptxContent);

      return {
        success: true,
        downloadUrl,
        fileSize: this.formatFileSize(pptxBlob.size),
        metadata,
      };
    } catch (error) {
      console.error('PPTX export error:', error);
      return {
        success: false,
        error: `PPTX export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Generate PDF content with professional formatting
   */
  private async generatePDFContent(
    content: FormattedContent,
    template: EbookTemplate,
    _config: PDFExportConfig
  ): Promise<Record<string, unknown>> {
    const chapters = content.structure.chapters || [];
    const images = content.structure.images || [];

    return {
      title: content.metadata.title,
      author: content.metadata.author,
      chapters: chapters.map((chapter, index) => ({
        title: chapter.title,
        content: this.formatContentForPDF(chapter.content, template),
        level: 1,
        pageBreak: index > 0,
        images: images.filter(img => img.caption?.includes(chapter.title)),
      })),
      metadata: {
        title: content.metadata.title,
        author: content.metadata.author,
        subject: content.metadata.description,
        keywords: content.metadata.keywords,
        creator: 'DocCraft AI',
        producer: 'DocCraft AI Export Service',
        creationDate: new Date().toISOString(),
      },
      styling: {
        fontFamily: template.styles.typography.fontFamily,
        fontSize: template.styles.typography.fontSize.base,
        lineHeight: template.styles.typography.lineHeight,
        colors: template.styles.colors,
        margins: _config.margins,
        pageSize: _config.pageSize,
        orientation: _config.orientation,
      },
    };
  }

  /**
   * Generate EPUB content with proper structure
   */
  private async generateEPUBContent(
    content: FormattedContent,
    template: EbookTemplate,
    _config: EPUBExportConfig
  ): Promise<Record<string, unknown>> {
    const chapters = content.structure.chapters || [];
    const images = content.structure.images || [];

    return {
      title: content.metadata.title,
      author: content.metadata.author,
      language: 'en',
      chapters: chapters.map((chapter, index) => ({
        id: `chapter-${index + 1}`,
        title: chapter.title,
        content: this.formatContentForEPUB(chapter.content, template),
        level: 1,
        images: images.filter(img => img.caption?.includes(chapter.title)),
      })),
      metadata: {
        title: content.metadata.title,
        author: content.metadata.author,
        language: 'en',
        identifier: `doccraft-${Date.now()}`,
        publisher: 'DocCraft AI',
        rights: 'All rights reserved',
        description: content.metadata.description,
        subjects: content.metadata.keywords,
      },
      styling: {
        css: this.generateEPUBCSS(template),
        fonts: template.styles.typography.fontFamily,
      },
    };
  }

  /**
   * Generate PPTX content for slides
   */
  private async generatePPTXContent(
    content: FormattedContent,
    template: EbookTemplate,
    _config: PPTXExportConfig
  ): Promise<Record<string, unknown>> {
    const chapters = content.structure.chapters || [];
    const images = content.structure.images || [];

    return {
      title: content.metadata.title,
      author: content.metadata.author,
      slides: chapters.flatMap((chapter, chapterIndex) => {
        const chapterSlides: Array<Record<string, unknown>> = [];

        // Title slide for chapter
        chapterSlides.push({
          type: 'title',
          title: chapter.title,
          subtitle: `Chapter ${chapterIndex + 1}`,
          layout: 'title',
        });

        // Content slides
        const contentSlides = this.splitContentIntoSlides(
          chapter.content,
          _config.maxSlidesPerChapter
        );

        contentSlides.forEach((slideContent, slideIndex) => {
          chapterSlides.push({
            type: 'content',
            title:
              slideIndex === 0 ? chapter.title : `${chapter.title} (continued)`,
            content: slideContent,
            layout: 'content',
            images: images.filter(img => img.caption?.includes(chapter.title)),
          });
        });

        return chapterSlides;
      }),
      styling: {
        theme: template.styles.colors,
        fonts: template.styles.typography,
        slideSize: _config.slideSize,
      },
    };
  }

  /**
   * Create PDF document using jsPDF
   */
  private async createPDFDocument(
    content: Record<string, unknown>,
    _config: PDFExportConfig
  ): Promise<Blob> {
    // Mock implementation - in real implementation, use jsPDF library
    const pdfContent = this.generatePDFText(content);
    // Use config to determine PDF settings
    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  /**
   * Create EPUB document using epub-gen
   */
  private async createEPUBDocument(
    content: Record<string, unknown>,
    _config: EPUBExportConfig
  ): Promise<Blob> {
    // Mock implementation - in real implementation, use epub-gen library
    const epubContent = this.generateEPUBText(content);
    // Use config to determine EPUB settings
    return new Blob([epubContent], { type: 'application/epub+zip' });
  }

  /**
   * Create PPTX document using pptxgenjs
   */
  private async createPPTXDocument(
    content: Record<string, unknown>,
    _config: PPTXExportConfig
  ): Promise<Blob> {
    // Mock implementation - in real implementation, use pptxgenjs library
    const pptxContent = this.generatePPTXText(content);
    // Use config to determine PPTX settings
    return new Blob([pptxContent], {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    });
  }

  /**
   * Format content for PDF export
   */
  private formatContentForPDF(
    content: string,
    _template: EbookTemplate
  ): string {
    // Apply template styling and formatting
    return content
      .replace(/\n\n/g, '\n\n')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>');
  }

  /**
   * Format content for EPUB export
   */
  private formatContentForEPUB(
    content: string,
    _template: EbookTemplate
  ): string {
    // Apply EPUB-specific formatting
    return content
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/gm, '<p>$1</p>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }

  /**
   * Generate EPUB CSS styles
   */
  private generateEPUBCSS(_template: EbookTemplate): string {
    return `
      body {
        font-family: ${_template.styles.typography.fontFamily};
        font-size: ${_template.styles.typography.fontSize.base}px;
        line-height: ${_template.styles.typography.lineHeight};
        color: ${_template.styles.colors.text.primary};
        background-color: ${_template.styles.colors.background};
        margin: 2em;
      }
      h1, h2, h3, h4, h5, h6 {
        color: ${_template.styles.colors.primary};
        margin-top: 1.5em;
        margin-bottom: 0.5em;
      }
      h1 { font-size: ${_template.styles.typography.fontSize.h1}px; }
      h2 { font-size: ${_template.styles.typography.fontSize.h2}px; }
      h3 { font-size: ${_template.styles.typography.fontSize.h3}px; }
      p { margin-bottom: 1em; }
      img { max-width: 100%; height: auto; }
    `;
  }

  /**
   * Split content into slides for PPTX
   */
  private splitContentIntoSlides(content: string, maxSlides: number): string[] {
    const paragraphs = content.split('\n\n');
    const slides: string[] = [];
    let currentSlide = '';

    for (const paragraph of paragraphs) {
      if (
        currentSlide.length + paragraph.length > 500 &&
        currentSlide.length > 0
      ) {
        slides.push(currentSlide.trim());
        currentSlide = paragraph;
      } else {
        currentSlide += (currentSlide ? '\n\n' : '') + paragraph;
      }
    }

    if (currentSlide.trim()) {
      slides.push(currentSlide.trim());
    }

    return slides.slice(0, maxSlides);
  }

  /**
   * Generate PDF text content (mock)
   */
  private generatePDFText(content: Record<string, unknown>): string {
    let pdfText = `%PDF-1.4\n`;
    pdfText += `1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n`;
    pdfText += `2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n`;
    pdfText += `3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n`;
    pdfText += `4 0 obj\n<<\n/Length ${
      (content.title as string)?.length + 100 || 100
    }\n>>\nstream\n`;
    pdfText += `BT\n/F1 12 Tf\n72 720 Td\n(${content.title}) Tj\nET\n`;
    pdfText += `endstream\nendobj\n`;
    pdfText += `xref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \n`;
    pdfText += `trailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n${
      pdfText.length - 100
    }\n%%EOF\n`;

    return pdfText;
  }

  /**
   * Generate EPUB text content (mock)
   */
  private generateEPUBText(content: Record<string, unknown>): string {
    let epubText = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    epubText += `<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml">\n<head>\n`;
    epubText += `<title>${content.title}</title>\n`;
    epubText += `<link rel="stylesheet" type="text/css" href="style.css" />\n`;
    epubText += `</head>\n<body>\n`;
    epubText += `<h1>${content.title}</h1>\n`;
    epubText += `<p>By ${content.author}</p>\n`;

    (content.chapters as Array<{ title: string; content: string }>).forEach(
      chapter => {
        epubText += `<h2>${chapter.title}</h2>\n`;
        epubText += chapter.content + '\n';
      }
    );

    epubText += `</body>\n</html>`;

    return epubText;
  }

  /**
   * Generate PPTX text content (mock)
   */
  private generatePPTXText(content: Record<string, unknown>): string {
    let pptxText = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    pptxText += `<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">\n`;
    pptxText += `<p:sldIdLst>\n`;

    (
      content.slides as Array<{ type: string; title: string; content: string }>
    ).forEach((_slide, index) => {
      pptxText += `<p:sldId id="${index + 256}" r:id="rId${index + 1}" />\n`;
    });

    pptxText += `</p:sldIdLst>\n`;
    pptxText += `</p:presentation>`;

    return pptxText;
  }

  /**
   * Calculate PDF metadata
   */
  private async calculatePDFMetadata(
    content: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const wordCount = (content.chapters as Array<{ content: string }>).reduce(
      (total: number, chapter) => {
        return total + chapter.content.split(' ').length;
      },
      0
    );

    return {
      pages: Math.ceil(wordCount / 300), // Rough estimate
      wordCount,
      chapters: (content.chapters as any[])?.length || 0,
      imageCount: (
        content.chapters as Array<{ images?: Array<unknown> }>
      ).reduce((total: number, chapter) => {
        return total + (chapter.images?.length || 0);
      }, 0),
    };
  }

  /**
   * Calculate EPUB metadata
   */
  private async calculateEPUBMetadata(
    content: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const wordCount = (content.chapters as Array<{ content: string }>).reduce(
      (total: number, chapter) => {
        return total + chapter.content.split(' ').length;
      },
      0
    );

    return {
      wordCount,
      chapters: (content.chapters as any[])?.length || 0,
      imageCount: (
        content.chapters as Array<{ images?: Array<unknown> }>
      ).reduce((total: number, chapter) => {
        return total + (chapter.images?.length || 0);
      }, 0),
    };
  }

  /**
   * Calculate PPTX metadata
   */
  private async calculatePPTXMetadata(
    content: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    return {
      slides: (content.slides as any[])?.length || 0,
      wordCount: (content.slides as Array<{ content?: string }>).reduce(
        (total: number, slide) => {
          return total + (slide.content?.split(' ').length || 0);
        },
        0
      ),
      chapters: (content.slides as Array<{ type: string }>).filter(
        slide => slide.type === 'title'
      ).length,
    };
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Export integrated ebook with all formats
   */
  async exportIntegratedEbook(
    result: IntegratedEbookResult,
    options: ExportOptions
  ): Promise<{
    pdf?: ExportResult;
    epub?: ExportResult;
    pptx?: ExportResult;
  }> {
    const exports: Record<string, ExportResult> = {};

    if (result.exportOptions.pdf) {
      exports.pdf = await this.exportToPDF(
        result.formattedContent,
        result.template,
        options
      );
    }

    if (result.exportOptions.epub) {
      exports.epub = await this.exportToEPUB(
        result.formattedContent,
        result.template,
        options
      );
    }

    if ((result.exportOptions as any).pptx) {
      exports.pptx = await this.exportToPPTX(
        result.formattedContent,
        result.template,
        options
      );
    }

    return exports;
  }


}

// Export singleton instance
export const exportService = new ExportService();
