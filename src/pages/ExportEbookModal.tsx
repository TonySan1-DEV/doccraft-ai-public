import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  exportService,
  ExportOptions,
  ExportResult,
} from '../services/exportService';
import {
  ebookTemplateService,
  EbookTemplate,
} from '../services/ebookTemplateService';
import { FileText, Download, X, Loader2 } from 'lucide-react';

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
    label: 'PDF Document',
    value: 'pdf',
    icon: FileText,
    description: 'Professional PDF with formatting',
  },
  {
    label: 'EPUB Ebook',
    value: 'epub',
    icon: FileText,
    description: 'Ebook format for readers',
  },
  {
    label: 'PowerPoint Slides',
    value: 'pptx',
    icon: FileText,
    description: 'Presentation slides',
  },
  {
    label: 'Word Document',
    value: 'docx',
    icon: FileText,
    description: 'Editable Word document',
  },
];

type ExportFormat = 'pdf' | 'epub' | 'pptx' | 'docx';

const ExportEbookModal: React.FC<ExportEbookModalProps> = ({
  open,
  onClose,
  content,
  templateId,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [isExporting, setIsExporting] = useState(false);

  if (!open) return null;

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Get template
      let template: EbookTemplate | null = null;
      if (templateId) {
        const templates = await ebookTemplateService.getTemplates();
        template = templates.find(t => t.id === templateId) || null;
      }
      if (!template) {
        const templates =
          await ebookTemplateService.getTemplates('professional');
        template = templates[0] || null;
      }

      if (!template) {
        throw new Error('No template available for export');
      }

      // Prepare export options
      const exportOptions: ExportOptions = {
        format: selectedFormat,
        quality: 'high',
        includeImages: true,
        includeMetadata: true,
        includeTableOfContents: true,
      };

      let result: ExportResult | null = null;

      // Convert content to FormattedContent format
      const formattedContent = {
        title: 'Exported Document',
        author: 'DocCraft AI',
        chapters: content.map(section => ({
          title: section.title,
          content: section.content,
          id: section.id,
        })),
        sections: [],
        images: [],
        html: '',
        css: '',
        metadata: {
          title: 'Exported Document',
          author: 'DocCraft AI',
          description: 'Document exported from DocCraft AI',
          keywords: ['exported', 'document'],
          language: 'en',
        },
        structure: {
          chapters: content.map(section => ({
            title: section.title,
            content: section.content,
            id: section.id,
          })),
          sections: [],
          images: [],
        },
      };

      // Export based on format
      if (selectedFormat === 'pdf') {
        result = await exportService.exportToPDF(
          formattedContent,
          template,
          exportOptions
        );
      } else if (selectedFormat === 'epub') {
        result = await exportService.exportToEPUB(
          formattedContent,
          template,
          exportOptions
        );
      } else if (selectedFormat === 'pptx') {
        result = await exportService.exportToPPTX(
          formattedContent,
          template,
          exportOptions
        );
      } else {
        // Fallback to PDF for unsupported formats
        result = await exportService.exportToPDF(
          formattedContent,
          template,
          exportOptions
        );
      }

      if (result && result.success) {
        // Trigger download
        if (result.downloadUrl) {
          const link = document.createElement('a');
          link.href = result.downloadUrl;
          link.download = `exported-document-${selectedFormat}.${selectedFormat}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        toast.success(`${selectedFormat.toUpperCase()} export successful!`);
        onClose();
      } else {
        throw new Error(
          result?.error || `Failed to export ${selectedFormat.toUpperCase()}`
        );
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(
        `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsExporting(false);
    }
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
            {formatOptions.map(opt => {
              const IconComponent = opt.icon;
              return (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedFormat === opt.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="export-format"
                    value={opt.value}
                    checked={selectedFormat === opt.value}
                    onChange={() =>
                      setSelectedFormat(opt.value as ExportFormat)
                    }
                    className="sr-only"
                    disabled={isExporting}
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

        {/* Export Button */}
        <button
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-60 transition-colors"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" />
              <span>Generating {selectedFormat.toUpperCase()}...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Export {selectedFormat.toUpperCase()}</span>
            </>
          )}
        </button>

        {/* Additional Info */}
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          {selectedFormat === 'pdf' &&
            'Professional PDF with proper formatting and layout'}
          {selectedFormat === 'epub' &&
            'Ebook format compatible with most e-readers'}
          {selectedFormat === 'pptx' &&
            'PowerPoint presentation with slides for each chapter'}
          {selectedFormat === 'docx' &&
            'Editable Word document for further customization'}
        </div>
      </div>
    </div>
  );
};

export default ExportEbookModal;
