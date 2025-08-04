// Export API Route Handler
// MCP: { role: "api_handler", allowedActions: ["route", "validate", "process"], theme: "export_api_route", contentSensitivity: "medium", tier: "Pro" }

import { NextRequest, NextResponse } from "next/server";
import ExportAPI, { ExportRequest } from "../export";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    if (!body.docId || !body.format || !body.content) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: docId, format, content",
        },
        { status: 400 }
      );
    }

    // Prepare export request
    const exportRequest: ExportRequest = {
      docId: body.docId,
      format: body.format,
      content: body.content,
      templateId: body.templateId,
      options: body.options,
      pdfConfig: body.pdfConfig,
      epubConfig: body.epubConfig,
      pptxConfig: body.pptxConfig,
    };

    // Process export
    const result = await ExportAPI.handleExport(exportRequest);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Export failed",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Export API route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Export API error: ${error.message}`,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Return supported export formats
  return NextResponse.json({
    success: true,
    formats: [
      {
        id: "pdf",
        name: "PDF Document",
        description: "Professional PDF with proper formatting and layout",
        supported: true,
        features: [
          "High quality formatting",
          "Page numbers",
          "Bookmarks",
          "Professional layout",
        ],
      },
      {
        id: "epub",
        name: "EPUB Ebook",
        description: "Ebook format compatible with most e-readers",
        supported: true,
        features: [
          "E-reader compatible",
          "Responsive layout",
          "Table of contents",
          "Metadata support",
        ],
      },
      {
        id: "pptx",
        name: "PowerPoint Slides",
        description: "PowerPoint presentation with slides for each chapter",
        supported: true,
        features: [
          "Chapter-based slides",
          "Professional themes",
          "Speaker notes",
          "Animations",
        ],
      },
      {
        id: "docx",
        name: "Word Document",
        description: "Editable Word document for further customization",
        supported: true,
        features: [
          "Editable content",
          "Word processing",
          "Track changes",
          "Collaboration ready",
        ],
      },
    ],
  });
}
