/*
role: ui-engineer,
tier: Pro,
file: "src/utils/exportUtils.ts",
allowedActions: ["export", "format", "watermark"],
theme: "document_export"
*/

import { logTelemetryEvent } from './telemetryLogger';

export interface ExportOptions {
  format: 'pdf' | 'md';
  includeWatermark: boolean;
  userTier: 'Free' | 'Pro' | 'Enterprise' | undefined;
  fileName?: string;
  metadata?: {
    title?: string;
    author?: string;
    date?: string;
    wordCount?: number;
  };
}

export interface ExportResult {
  success: boolean;
  downloadUrl?: string;
  fileSize?: string;
  error?: string;
  metadata?: {
    pages?: number;
    wordCount?: number;
    format: string;
  };
}

/**
 * Generate Markdown content from script text
 */
export function generateMarkdownContent(
  script: string,
  options: ExportOptions
): string {
  const { metadata, includeWatermark, userTier } = options;

  let content = '';

  // Add title
  if (metadata?.title) {
    content += `# ${metadata.title}\n\n`;
  }

  // Add metadata header
  if (metadata?.author || metadata?.date) {
    content += '---\n';
    if (metadata.author) content += `Author: ${metadata.author}\n`;
    if (metadata.date) content += `Date: ${metadata.date}\n`;
    if (metadata.wordCount) content += `Word Count: ${metadata.wordCount}\n`;
    content += '---\n\n';
  }

  // Add script content
  content += script;

  // Add watermark for Free tier
  if (includeWatermark && userTier === 'Free') {
    content += '\n\n---\n';
    content += '*Generated with DocCraft-AI Free Plan*\n';
    content += '*Upgrade to Pro for unlimited exports and advanced features*\n';
  }

  return content;
}

/**
 * Generate PDF content using browser APIs
 */
export async function generatePDFContent(
  script: string,
  options: ExportOptions
): Promise<Blob> {
  const { metadata, includeWatermark, userTier } = options;

  // Create a temporary document for PDF generation
  const doc = document.implementation.createHTMLDocument();
  const style = doc.createElement('style');
  style.textContent = `
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      margin: 2cm;
      color: #333;
    }
    h1 {
      color: #2563eb;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 0.5rem;
    }
    .metadata {
      background: #f8fafc;
      padding: 1rem;
      border-left: 4px solid #2563eb;
      margin: 1rem 0;
      font-size: 0.9rem;
    }
    .watermark {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
      font-size: 0.8rem;
      color: #6b7280;
      text-align: center;
    }
  `;
  doc.head.appendChild(style);

  // Build HTML content
  let html = '';

  if (metadata?.title) {
    html += `<h1>${metadata.title}</h1>`;
  }

  if (metadata?.author || metadata?.date || metadata?.wordCount) {
    html += '<div class="metadata">';
    if (metadata.author)
      html += `<strong>Author:</strong> ${metadata.author}<br>`;
    if (metadata.date) html += `<strong>Date:</strong> ${metadata.date}<br>`;
    if (metadata.wordCount)
      html += `<strong>Word Count:</strong> ${metadata.wordCount}`;
    html += '</div>';
  }

  // Convert script to HTML paragraphs
  const paragraphs = script.split('\n\n').filter(p => p.trim());
  html += paragraphs.map(p => `<p>${p.trim()}</p>`).join('');

  // Add watermark for Free tier
  if (includeWatermark && userTier === 'Free') {
    html += `
      <div class="watermark">
        <p><em>Generated with DocCraft-AI Free Plan</em></p>
        <p><em>Upgrade to Pro for unlimited exports and advanced features</em></p>
      </div>
    `;
  }

  doc.body.innerHTML = html;

  // Use browser's print API to generate PDF
  return new Promise((resolve, reject) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      reject(new Error('Failed to open print window'));
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${metadata?.title || 'DocCraft Export'}</title>
          ${style.outerHTML}
        </head>
        <body>${html}</body>
      </html>
    `);
    printWindow.document.close();

    // Wait for content to load
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();

      // For now, we'll create a simple text-based PDF
      // In a real implementation, you'd use a library like jsPDF or html2pdf
      const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 100
>>
stream
BT
/F1 12 Tf
72 720 Td
(${script.substring(0, 50)}...) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
400
%%EOF`;

      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      resolve(blob);
    };
  });
}

/**
 * Export script content to file
 */
export async function exportScript(
  script: string,
  options: ExportOptions
): Promise<ExportResult> {
  try {
    const { format, fileName = 'script', userTier } = options;

    let blob: Blob;

    if (format === 'md') {
      const content = generateMarkdownContent(script, options);
      blob = new Blob([content], { type: 'text/markdown' });
    } else if (format === 'pdf') {
      blob = await generatePDFContent(script, options);
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }

    // Create download URL
    const downloadUrl = URL.createObjectURL(blob);

    // Calculate file size
    const fileSize = formatFileSize(blob.size);

    // Log export event
    await logTelemetryEvent('script_export', {
      format,
      userTier,
      fileSize: blob.size,
      wordCount: script.split(' ').length,
      fileName,
    });

    return {
      success: true,
      downloadUrl,
      fileSize,
      metadata: {
        wordCount: script.split(' ').length,
        format,
      },
    };
  } catch (error) {
    console.error('Export error:', error);

    // Log export error
    await logTelemetryEvent('script_export_error', {
      format: options.format,
      userTier: options.userTier,
      error: {
        type: 'export_error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Export failed',
    };
  }
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if user can export based on tier
 */
export function canExport(userTier: string, format: 'pdf' | 'md'): boolean {
  if (userTier === 'Free') {
    // Free users can only export Markdown
    return format === 'md';
  }

  // Pro and above can export all formats
  return ['Pro', 'Premium', 'Admin'].includes(userTier);
}

/**
 * Get upgrade message for export restrictions
 */
export function getUpgradeMessage(format: 'pdf' | 'md'): string {
  if (format === 'pdf') {
    return 'Upgrade to Pro to export PDF files and unlock unlimited exports!';
  }
  return 'Upgrade to Pro for unlimited exports and advanced features!';
}
