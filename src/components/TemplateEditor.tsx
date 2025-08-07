// Template Editor Component
// MCP: { role: "editor", allowedActions: ["customize", "preview", "apply"], theme: "template_customization", contentSensitivity: "low", tier: "Pro" }

import { useState, useEffect } from 'react';
import {
  Palette,
  Type,
  Layout,
  Image as ImageIcon,
  Eye,
  RotateCcw,
  Save,
  CheckCircle,
} from 'lucide-react';
import {
  EbookTemplate,
  TemplateCustomization,
} from '../services/ebookTemplateService';

interface TemplateEditorProps {
  template: EbookTemplate;
  onCustomize: (customizations: TemplateCustomization) => void;
  onApply: (template: EbookTemplate) => void;
  onSave: (template: EbookTemplate) => void;
  className?: string;
}

export function TemplateEditor({
  template,
  onCustomize,
  onApply,
  onSave,
  className = '',
}: TemplateEditorProps) {
  const [customizations, setCustomizations] = useState<TemplateCustomization>(
    {}
  );
  const [activeTab, setActiveTab] = useState<
    'typography' | 'layout' | 'colors' | 'images'
  >('typography');
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Apply customizations when they change
  useEffect(() => {
    if (Object.keys(customizations).length > 0) {
      onCustomize(customizations);
    }
  }, [customizations, onCustomize]);

  const handleTypographyChange = (field: string, value: string | number) => {
    setCustomizations(prev => ({
      ...prev,
      typography: {
        ...prev.typography,
        [field]: value,
      },
    }));
  };

  const handleLayoutChange = (field: string, value: string | number) => {
    setCustomizations(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        [field]: value,
      },
    }));
  };

  const handleColorsChange = (field: string, value: string) => {
    setCustomizations(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [field]: value,
      },
    }));
  };

  const handleImageSettingsChange = (
    section: string,
    field: string,
    value: string | number | boolean
  ) => {
    setCustomizations(prev => ({
      ...prev,
      imageSettings: {
        ...prev.imageSettings,
        [section]: {
          ...(prev.imageSettings?.[section as keyof typeof prev.imageSettings] || {}),
          [field]: value,
        },
      },
    }));
  };

  const handleReset = () => {
    setCustomizations({});
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(template);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'images', label: 'Images', icon: ImageIcon },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-lg border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Template Editor
            </h3>
            <p className="text-sm text-gray-600">
              Customize your {template.name} template
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </button>
            <button
              onClick={handleReset}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setActiveTab(
                        tab.id as 'typography' | 'layout' | 'colors' | 'images'
                      )
                    }
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'typography' && (
              <TypographyEditor
                template={template}
                customizations={customizations}
                onChange={handleTypographyChange}
              />
            )}
            {activeTab === 'layout' && (
              <LayoutEditor
                template={template}
                customizations={customizations}
                onChange={handleLayoutChange}
              />
            )}
            {activeTab === 'colors' && (
              <ColorsEditor
                template={template}
                customizations={customizations}
                onChange={handleColorsChange}
              />
            )}
            {activeTab === 'images' && (
              <ImagesEditor
                template={template}
                customizations={customizations}
                onChange={handleImageSettingsChange}
              />
            )}
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1">
          {showPreview ? (
            <div className="p-6">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Template Preview
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Template:</strong> {template.name}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Category:</strong> {template.category}
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    <strong>Description:</strong> {template.description}
                  </div>

                  {/* Preview of key settings */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <strong>Font Family:</strong>{' '}
                      {customizations.typography?.fontFamily ||
                        template.styles.typography.fontFamily}
                    </div>
                    <div>
                      <strong>Primary Color:</strong>{' '}
                      {customizations.colors?.primary ||
                        template.styles.colors.primary}
                    </div>
                    <div>
                      <strong>Max Width:</strong>{' '}
                      {customizations.layout?.maxWidth ||
                        template.styles.layout.maxWidth}
                      px
                    </div>
                    <div>
                      <strong>Image Size:</strong>{' '}
                      {customizations.imageSettings?.sizing?.defaultSize ||
                        template.imageSettings.sizing.defaultSize}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onApply(template)}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Apply Template
              </button>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Click &quot;Preview&quot; to see template customizations</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Typography Editor Component
function TypographyEditor({
  template,
  customizations,
  onChange,
}: {
  template: EbookTemplate;
  customizations: TemplateCustomization;
  onChange: (field: string, value: string | number) => void;
}) {
  const currentTypography = {
    ...template.styles.typography,
    ...customizations.typography,
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="font-family"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Font Family
        </label>
        <select
          id="font-family"
          value={currentTypography.fontFamily}
          onChange={e => onChange('fontFamily', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Inter, -apple-system, BlinkMacSystemFont, sans-serif">
            Inter (Sans-serif)
          </option>
          <option value="Times New Roman, serif">
            Times New Roman (Serif)
          </option>
          <option value="Georgia, serif">Georgia (Serif)</option>
          <option value="JetBrains Mono, Consolas, monospace">
            JetBrains Mono (Monospace)
          </option>
          <option value="Open Sans, -apple-system, BlinkMacSystemFont, sans-serif">
            Open Sans (Sans-serif)
          </option>
          <option value="Poppins, -apple-system, BlinkMacSystemFont, sans-serif">
            Poppins (Sans-serif)
          </option>
          <option value="Playfair Display, Georgia, serif">
            Playfair Display (Serif)
          </option>
          <option value="Crimson Text, Georgia, serif">
            Crimson Text (Serif)
          </option>
        </select>
      </div>

      <div>
        <label
          htmlFor="base-font-size"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Base Font Size (px)
        </label>
        <input
          id="base-font-size"
          type="number"
          value={currentTypography.fontSize.base}
          onChange={e =>
            onChange('fontSize', {
              ...currentTypography.fontSize,
              base: parseInt(e.target.value),
            } as any)
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="10"
          max="24"
        />
      </div>

      <div>
        <label
          htmlFor="line-height"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Line Height
        </label>
        <input
          id="line-height"
          type="number"
          step="0.1"
          value={currentTypography.lineHeight}
          onChange={e => onChange('lineHeight', parseFloat(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="1.0"
          max="2.5"
        />
      </div>

      <div>
        <label
          htmlFor="letter-spacing"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Letter Spacing (em)
        </label>
        <input
          id="letter-spacing"
          type="number"
          step="0.01"
          value={currentTypography.letterSpacing}
          onChange={e => onChange('letterSpacing', parseFloat(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          max="0.1"
        />
      </div>
    </div>
  );
}

// Layout Editor Component
function LayoutEditor({
  template,
  customizations,
  onChange,
}: {
  template: EbookTemplate;
  customizations: TemplateCustomization;
  onChange: (field: string, value: string | number) => void;
}) {
  const currentLayout = {
    ...template.styles.layout,
    ...customizations.layout,
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="max-width"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Max Width (px)
        </label>
        <input
          id="max-width"
          type="number"
          value={currentLayout.maxWidth}
          onChange={e => onChange('maxWidth', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="400"
          max="1200"
        />
      </div>

      <div>
        <label
          htmlFor="page-size"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Page Size
        </label>
        <select
          id="page-size"
          value={currentLayout.pageSize}
          onChange={e => onChange('pageSize', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="A4">A4</option>
          <option value="Letter">Letter</option>
          <option value="Custom">Custom</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="columns"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Columns
        </label>
        <input
          id="columns"
          type="number"
          value={currentLayout.columns}
          onChange={e => onChange('columns', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="1"
          max="3"
        />
      </div>

      <div>
        <label
          htmlFor="paragraph-spacing"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Paragraph Spacing (px)
        </label>
        <input
          id="paragraph-spacing"
          type="number"
          value={currentLayout.spacing.paragraph}
          onChange={e =>
            onChange('spacing', {
              ...currentLayout.spacing,
              paragraph: parseInt(e.target.value),
            } as any)
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="8"
          max="48"
        />
      </div>
    </div>
  );
}

// Colors Editor Component
function ColorsEditor({
  template,
  customizations,
  onChange,
}: {
  template: EbookTemplate;
  customizations: TemplateCustomization;
  onChange: (field: string, value: string) => void;
}) {
  const currentColors = {
    ...template.styles.colors,
    ...customizations.colors,
  };

  const colorFields = [
    { key: 'primary', label: 'Primary Color' },
    { key: 'secondary', label: 'Secondary Color' },
    { key: 'accent', label: 'Accent Color' },
    { key: 'background', label: 'Background Color' },
    { key: 'text.primary', label: 'Primary Text Color' },
    { key: 'text.secondary', label: 'Secondary Text Color' },
  ];

  return (
    <div className="space-y-4">
      {colorFields.map(field => (
        <div key={field.key}>
          <label
            htmlFor={`color-${field.key}`}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {field.label}
          </label>
          <div className="flex items-center space-x-2">
            <input
              id={`color-${field.key}`}
              type="color"
              value={
                field.key.includes('.')
                  ? (currentColors.text as any)?.[field.key.split('.')[1]] ||
                    '#000000'
                  : (currentColors as any)[field.key] || '#000000'
              }
              onChange={e => {
                if (field.key.includes('.')) {
                  const [parent, child] = field.key.split('.');
                  onChange(parent, {
                    ...(currentColors as any)[parent],
                    [child]: e.target.value,
                  });
                } else {
                  onChange(field.key, e.target.value);
                }
              }}
              className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
            />
            <input
              id={`color-text-${field.key}`}
              type="text"
              value={
                field.key.includes('.')
                  ? (currentColors.text as any)?.[field.key.split('.')[1]] ||
                    '#000000'
                  : (currentColors as any)[field.key] || '#000000'
              }
              onChange={e => {
                if (field.key.includes('.')) {
                  const [parent, child] = field.key.split('.');
                  onChange(parent, {
                    ...(currentColors as any)[parent],
                    [child]: e.target.value,
                  });
                } else {
                  onChange(field.key, e.target.value);
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="#000000"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Images Editor Component
function ImagesEditor({
  template,
  customizations,
  onChange,
}: {
  template: EbookTemplate;
  customizations: TemplateCustomization;
  onChange: (
    section: string,
    field: string,
    value: string | number | boolean
  ) => void;
}) {
  const currentImageSettings = {
    ...template.imageSettings,
    ...customizations.imageSettings,
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="default-image-size"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Default Image Size
        </label>
        <select
          id="default-image-size"
          value={currentImageSettings.sizing.defaultSize}
          onChange={e => onChange('sizing', 'defaultSize', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
          <option value="hero">Hero</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="max-image-width"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Max Image Width (px)
        </label>
        <input
          id="max-image-width"
          type="number"
          value={currentImageSettings.sizing.maxWidth}
          onChange={e =>
            onChange('sizing', 'maxWidth', parseInt(e.target.value))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="200"
          max="1200"
        />
      </div>

      <div>
        <label
          htmlFor="default-position"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Default Position
        </label>
        <select
          id="default-position"
          value={currentImageSettings.placement.defaultPosition}
          onChange={e =>
            onChange('placement', 'defaultPosition', e.target.value)
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="top">Top</option>
          <option value="inline">Inline</option>
          <option value="end">End</option>
          <option value="full-width">Full Width</option>
          <option value="sidebar">Sidebar</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="caption-style"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Caption Style
        </label>
        <select
          id="caption-style"
          value={currentImageSettings.captions.style}
          onChange={e => onChange('captions', 'style', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="minimal">Minimal</option>
          <option value="detailed">Detailed</option>
          <option value="academic">Academic</option>
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="captions-enabled"
          checked={currentImageSettings.captions.enabled}
          onChange={e => onChange('captions', 'enabled', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label
          htmlFor="captions-enabled"
          className="ml-2 block text-sm text-gray-900"
        >
          Enable Image Captions
        </label>
      </div>
    </div>
  );
}
