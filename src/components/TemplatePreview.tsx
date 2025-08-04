// Template Preview Component
// MCP: { role: "preview", allowedActions: ["preview", "test", "export"], theme: "template_preview", contentSensitivity: "low", tier: "Pro" }

import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Printer, 
  Download, 
  Eye, 
  EyeOff,
  Maximize2,
  Minimize2,
  RotateCw,
  Settings,
  FileText,
  BookOpen,
  Globe
} from 'lucide-react';
import { EbookTemplate, FormattedContent } from '../services/ebookTemplateService';

interface TemplatePreviewProps {
  template: EbookTemplate;
  content?: any;
  customizations?: any;
  onExport?: (format: string) => void;
  className?: string;
}

type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'print';
type ViewMode = 'preview' | 'code' | 'export';

export function TemplatePreview({ 
  template, 
  content, 
  customizations,
  onExport,
  className = '' 
}: TemplatePreviewProps) {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewContent, setPreviewContent] = useState<FormattedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Device configurations
  const deviceConfigs = {
    mobile: { width: 375, height: 667, name: 'Mobile' },
    tablet: { width: 768, height: 1024, name: 'Tablet' },
    desktop: { width: 1200, height: 800, name: 'Desktop' },
    print: { width: 612, height: 792, name: 'Print (Letter)' }
  };

  // Generate preview content when template or content changes
  useEffect(() => {
    if (template && content) {
      generatePreview();
    }
  }, [template, content, customizations]);

  const generatePreview = async () => {
    setIsLoading(true);
    try {
      // Simulate template application
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockFormattedContent: FormattedContent = {
        html: generateMockHTML(),
        css: generateMockCSS(),
        metadata: {
          title: content?.title || 'Sample Document',
          author: content?.author || 'Author Name',
          description: `Preview of ${template.name} template`,
          keywords: [template.category, 'preview', 'template'],
          language: 'en'
        },
        structure: {
          chapters: content?.chapters || [],
          sections: content?.sections || [],
          images: content?.images || []
        }
      };
      
      setPreviewContent(mockFormattedContent);
    } catch (error) {
      console.error('Error generating preview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockHTML = () => {
    return `
      <div class="ebook-container" style="font-family: ${template.styles.typography.fontFamily}; color: ${template.styles.colors.text.primary};">
        <h1 style="font-size: ${template.styles.typography.fontSize.h1}px; color: ${template.styles.colors.primary};">
          Sample Document Title
        </h1>
        
        <h2 style="font-size: ${template.styles.typography.fontSize.h2}px; color: ${template.styles.colors.secondary};">
          Chapter 1: Introduction
        </h2>
        
        <p style="font-size: ${template.styles.typography.fontSize.base}px; line-height: ${template.styles.typography.lineHeight}; margin-bottom: ${template.styles.spacing.md}px;">
          This is a sample paragraph demonstrating the typography and layout of the ${template.name} template. 
          The text flows naturally with appropriate spacing and styling that matches the template's design principles.
        </p>
        
        <p style="font-size: ${template.styles.typography.fontSize.base}px; line-height: ${template.styles.typography.lineHeight}; margin-bottom: ${template.styles.spacing.md}px;">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
        
        <h3 style="font-size: ${template.styles.typography.fontSize.h3}px; color: ${template.styles.colors.secondary};">
          Subsection 1.1
        </h3>
        
        <p style="font-size: ${template.styles.typography.fontSize.base}px; line-height: ${template.styles.typography.lineHeight}; margin-bottom: ${template.styles.spacing.md}px;">
          This subsection demonstrates how the template handles different heading levels and maintains visual hierarchy 
          throughout the document. The spacing and typography create a professional and readable layout.
        </p>
        
        <div style="text-align: center; margin: ${template.styles.spacing.lg}px 0;">
          <img src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop" 
               alt="Sample image" 
               style="max-width: ${template.imageSettings.sizing.maxWidth}px; height: auto; border-radius: 8px;" />
          ${template.imageSettings.captions.enabled ? 
            `<p style="font-size: ${template.imageSettings.captions.fontSize}px; color: ${template.imageSettings.captions.color}; margin-top: 8px;">
              Sample image with caption
            </p>` : ''
          }
        </div>
        
        <h2 style="font-size: ${template.styles.typography.fontSize.h2}px; color: ${template.styles.colors.secondary};">
          Chapter 2: Advanced Features
        </h2>
        
        <p style="font-size: ${template.styles.typography.fontSize.base}px; line-height: ${template.styles.typography.lineHeight}; margin-bottom: ${template.styles.spacing.md}px;">
          This chapter demonstrates more advanced features of the template, including different content types, 
          formatting options, and layout considerations for various types of content.
        </p>
      </div>
    `;
  };

  const generateMockCSS = () => {
    return `
      .ebook-container {
        max-width: ${template.styles.layout.maxWidth}px;
        margin: 0 auto;
        padding: ${template.styles.layout.margins.top}px ${template.styles.layout.margins.right}px ${template.styles.layout.margins.bottom}px ${template.styles.layout.margins.left}px;
        background-color: ${template.styles.colors.background};
        color: ${template.styles.colors.text.primary};
        font-family: ${template.styles.typography.fontFamily};
        font-size: ${template.styles.typography.fontSize.base}px;
        line-height: ${template.styles.typography.lineHeight};
        letter-spacing: ${template.styles.typography.letterSpacing}em;
      }
      
      h1, h2, h3, h4, h5, h6 {
        color: ${template.styles.colors.text.primary};
        font-weight: ${template.styles.typography.fontWeight.bold};
        margin-bottom: ${template.styles.spacing.md}px;
      }
      
      p {
        margin-bottom: ${template.styles.spacing.md}px;
        color: ${template.styles.colors.text.secondary};
      }
      
      img {
        max-width: ${template.imageSettings.sizing.maxWidth}px;
        height: auto;
        border-radius: ${template.imageSettings.placement.borderStyle === 'rounded' ? '8px' : '0'};
        margin: ${template.imageSettings.placement.imageSpacing}px 0;
      }
    `;
  };

  const handleExport = (format: string) => {
    onExport?.(format);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const devices = [
    { type: 'mobile' as DeviceType, icon: Smartphone, label: 'Mobile' },
    { type: 'tablet' as DeviceType, icon: Tablet, label: 'Tablet' },
    { type: 'desktop' as DeviceType, icon: Monitor, label: 'Desktop' },
    { type: 'print' as DeviceType, icon: Printer, label: 'Print' }
  ];

  const viewModes = [
    { mode: 'preview' as ViewMode, icon: Eye, label: 'Preview' },
    { mode: 'code' as ViewMode, icon: FileText, label: 'Code' },
    { mode: 'export' as ViewMode, icon: Download, label: 'Export' }
  ];

  const exportFormats = [
    { id: 'pdf', name: 'PDF', icon: FileText },
    { id: 'epub', name: 'EPUB', icon: BookOpen },
    { id: 'html', name: 'HTML', icon: Globe },
    { id: 'docx', name: 'Word', icon: FileText }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-lg border ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Template Preview</h3>
            <p className="text-sm text-gray-600">{template.name} - {deviceConfigs[deviceType].name}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Device Selector */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-md p-1">
              {devices.map((device) => {
                const Icon = device.icon;
                return (
                  <button
                    key={device.type}
                    onClick={() => setDeviceType(device.type)}
                    className={`p-2 rounded-md text-sm font-medium transition-colors ${
                      deviceType === device.type
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title={device.label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            {/* View Mode Selector */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-md p-1">
              {viewModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.mode}
                    onClick={() => setViewMode(mode.mode)}
                    className={`p-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === mode.mode
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title={mode.label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'preview' && (
          <div className="p-6">
            {/* Device Frame */}
            <div className="flex justify-center">
              <div 
                className="bg-gray-100 rounded-lg shadow-lg overflow-hidden"
                style={{
                  width: deviceConfigs[deviceType].width,
                  height: deviceConfigs[deviceType].height,
                  maxWidth: '100%',
                  maxHeight: '80vh'
                }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-gray-600">Generating preview...</span>
                    </div>
                  </div>
                ) : previewContent ? (
                  <div 
                    className="h-full overflow-auto bg-white"
                    dangerouslySetInnerHTML={{ __html: previewContent.html }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <Eye className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No preview available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'code' && (
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">HTML</h4>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-auto text-xs">
                  <code>{previewContent?.html || 'No HTML available'}</code>
                </pre>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">CSS</h4>
                <pre className="bg-gray-900 text-blue-400 p-4 rounded-md overflow-auto text-xs">
                  <code>{previewContent?.css || 'No CSS available'}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'export' && (
          <div className="p-6">
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Export Options</h4>
              <div className="grid grid-cols-2 gap-4">
                {exportFormats.map((format) => {
                  const Icon = format.icon;
                  return (
                    <button
                      key={format.id}
                      onClick={() => handleExport(format.id)}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <Icon className="w-5 h-5 mr-3 text-gray-600" />
                      <div className="text-left">
                        <div className="font-medium text-gray-900">{format.name}</div>
                        <div className="text-xs text-gray-500">Export as {format.name}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Template Information</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {template.name}
                </div>
                <div>
                  <span className="font-medium">Category:</span> {template.category}
                </div>
                <div>
                  <span className="font-medium">Font Family:</span> {template.styles.typography.fontFamily}
                </div>
                <div>
                  <span className="font-medium">Max Width:</span> {template.styles.layout.maxWidth}px
                </div>
                <div>
                  <span className="font-medium">Primary Color:</span> {template.styles.colors.primary}
                </div>
                <div>
                  <span className="font-medium">Image Size:</span> {template.imageSettings.sizing.defaultSize}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            <span className="font-medium">Device:</span> {deviceConfigs[deviceType].name} 
            ({deviceConfigs[deviceType].width}×{deviceConfigs[deviceType].height})
          </div>
          <div>
            <span className="font-medium">Template:</span> {template.name}
          </div>
        </div>
      </div>
    </div>
  );
} 