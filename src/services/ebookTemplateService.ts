// Ebook Template Service
// MCP: { role: "template", allowedActions: ["apply", "customize", "preview"], theme: "document_formatting", contentSensitivity: "low", tier: "Pro" }

export interface TypographyConfig {
  fontFamily: string;
  fontSize: {
    base: number;
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5: number;
    h6: number;
  };
  lineHeight: number;
  letterSpacing: number;
  fontWeight: {
    normal: number;
    medium: number;
    bold: number;
  };
}

export interface LayoutConfig {
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  columns: number;
  gutters: number;
  pageSize: 'A4' | 'Letter' | 'Custom';
  maxWidth: number;
  spacing: {
    paragraph: number;
    section: number;
    chapter: number;
  };
}

export interface ColorConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  border: string;
}

export interface SpacingConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface PlacementConfig {
  defaultPosition: 'top' | 'inline' | 'end' | 'full-width' | 'sidebar';
  imageSpacing: number;
  captionStyle: 'minimal' | 'detailed' | 'none';
  borderStyle: 'none' | 'thin' | 'thick' | 'rounded';
}

export interface SizingConfig {
  defaultSize: 'small' | 'medium' | 'large' | 'hero';
  maxWidth: number;
  aspectRatio: 'auto' | 'square' | 'landscape' | 'portrait';
  responsive: boolean;
}

export interface CaptionConfig {
  enabled: boolean;
  position: 'above' | 'below' | 'overlay';
  style: 'minimal' | 'detailed' | 'academic';
  fontSize: number;
  color: string;
}

export interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  supported: boolean;
}

export interface EbookTemplate {
  id: string;
  name: string;
  category:
    | 'business'
    | 'academic'
    | 'creative'
    | 'technical'
    | 'narrative'
    | 'educational'
    | 'marketing'
    | 'personal'
    | 'scientific'
    | 'minimalist';
  description: string;
  preview: string;
  styles: {
    typography: TypographyConfig;
    layout: LayoutConfig;
    colors: ColorConfig;
    spacing: SpacingConfig;
  };
  imageSettings: {
    placement: PlacementConfig;
    sizing: SizingConfig;
    captions: CaptionConfig;
  };
  exportFormats: ExportFormat[];
  features: string[];
  bestFor: string[];
}

export interface TemplateCustomization {
  typography?: Partial<TypographyConfig>;
  layout?: Partial<LayoutConfig>;
  colors?: Partial<ColorConfig>;
  spacing?: Partial<SpacingConfig>;
  imageSettings?: {
    placement?: Partial<PlacementConfig>;
    sizing?: Partial<SizingConfig>;
    captions?: Partial<CaptionConfig>;
  };
}

export interface FormattedContent {
  html: string;
  css: string;
  metadata: {
    title: string;
    author: string;
    description: string;
    keywords: string[];
    language: string;
  };
  structure: {
    chapters: Array<{ title: string; content: string; id?: string }>;
    sections: Array<{ title: string; content: string; id?: string }>;
    images: Array<{ src: string; alt: string; caption?: string }>;
  };
}

export class EbookTemplateService {
  private readonly TEMPLATES: Record<string, EbookTemplate> = {
    business_professional: {
      id: 'business_professional',
      name: 'Business Professional',
      category: 'business',
      description:
        'Clean, corporate aesthetic perfect for business documents, reports, and professional publications.',
      preview:
        'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop',
      styles: {
        typography: {
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: {
            base: 16,
            h1: 32,
            h2: 28,
            h3: 24,
            h4: 20,
            h5: 18,
            h6: 16,
          },
          lineHeight: 1.6,
          letterSpacing: 0.01,
          fontWeight: { normal: 400, medium: 500, bold: 700 },
        },
        layout: {
          margins: { top: 60, bottom: 60, left: 50, right: 50 },
          columns: 1,
          gutters: 20,
          pageSize: 'A4',
          maxWidth: 800,
          spacing: { paragraph: 24, section: 40, chapter: 60 },
        },
        colors: {
          primary: '#3B82F6',
          secondary: '#1E40AF',
          accent: '#DBEAFE',
          background: '#FFFFFF',
          surface: '#F8FAFC',
          text: { primary: '#1E293B', secondary: '#475569', muted: '#64748B' },
          border: '#E2E8F0',
        },
        spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
      },
      imageSettings: {
        placement: {
          defaultPosition: 'inline',
          imageSpacing: 24,
          captionStyle: 'minimal',
          borderStyle: 'thin',
        },
        sizing: {
          defaultSize: 'medium',
          maxWidth: 600,
          aspectRatio: 'landscape',
          responsive: true,
        },
        captions: {
          enabled: true,
          position: 'below',
          style: 'minimal',
          fontSize: 14,
          color: '#64748B',
        },
      },
      exportFormats: [
        { id: 'pdf', name: 'PDF', extension: '.pdf', supported: true },
        { id: 'epub', name: 'EPUB', extension: '.epub', supported: true },
        { id: 'docx', name: 'Word', extension: '.docx', supported: true },
      ],
      features: [
        'Professional typography',
        'Clean layout',
        'Corporate color scheme',
        'Image optimization',
      ],
      bestFor: [
        'Business reports',
        'Corporate documents',
        'Professional presentations',
        'Executive summaries',
      ],
    },

    academic_research: {
      id: 'academic_research',
      name: 'Academic Research',
      category: 'academic',
      description:
        'Formal typography and structured layout ideal for research papers, theses, and scholarly publications.',
      preview:
        'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop',
      styles: {
        typography: {
          fontFamily: 'Times New Roman, serif',
          fontSize: {
            base: 12,
            h1: 18,
            h2: 16,
            h3: 14,
            h4: 13,
            h5: 12,
            h6: 12,
          },
          lineHeight: 2.0,
          letterSpacing: 0.02,
          fontWeight: { normal: 400, medium: 500, bold: 700 },
        },
        layout: {
          margins: { top: 72, bottom: 72, left: 72, right: 72 },
          columns: 1,
          gutters: 0,
          pageSize: 'Letter',
          maxWidth: 612,
          spacing: { paragraph: 12, section: 24, chapter: 36 },
        },
        colors: {
          primary: '#374151',
          secondary: '#6B7280',
          accent: '#F3F4F6',
          background: '#FFFFFF',
          surface: '#FFFFFF',
          text: { primary: '#000000', secondary: '#374151', muted: '#6B7280' },
          border: '#D1D5DB',
        },
        spacing: { xs: 6, sm: 12, md: 18, lg: 24, xl: 30, xxl: 36 },
      },
      imageSettings: {
        placement: {
          defaultPosition: 'inline',
          imageSpacing: 18,
          captionStyle: 'detailed',
          borderStyle: 'none',
        },
        sizing: {
          defaultSize: 'medium',
          maxWidth: 500,
          aspectRatio: 'auto',
          responsive: false,
        },
        captions: {
          enabled: true,
          position: 'below',
          style: 'academic',
          fontSize: 10,
          color: '#6B7280',
        },
      },
      exportFormats: [
        { id: 'pdf', name: 'PDF', extension: '.pdf', supported: true },
        { id: 'docx', name: 'Word', extension: '.docx', supported: true },
        { id: 'latex', name: 'LaTeX', extension: '.tex', supported: false },
      ],
      features: [
        'Academic typography',
        'Citation support',
        'Structured layout',
        'Research formatting',
      ],
      bestFor: [
        'Research papers',
        'Academic theses',
        'Scholarly articles',
        'Conference papers',
      ],
    },

    creative_writing: {
      id: 'creative_writing',
      name: 'Creative Writing',
      category: 'creative',
      description:
        'Artistic typography and dynamic layouts perfect for novels, poetry, and creative content.',
      preview:
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
      styles: {
        typography: {
          fontFamily: 'Georgia, serif',
          fontSize: {
            base: 18,
            h1: 36,
            h2: 32,
            h3: 28,
            h4: 24,
            h5: 20,
            h6: 18,
          },
          lineHeight: 1.8,
          letterSpacing: 0.03,
          fontWeight: { normal: 400, medium: 500, bold: 700 },
        },
        layout: {
          margins: { top: 80, bottom: 80, left: 60, right: 60 },
          columns: 1,
          gutters: 30,
          pageSize: 'A4',
          maxWidth: 700,
          spacing: { paragraph: 28, section: 50, chapter: 80 },
        },
        colors: {
          primary: '#8B5CF6',
          secondary: '#EC4899',
          accent: '#F3E8FF',
          background: '#FFFFFF',
          surface: '#FAF5FF',
          text: { primary: '#1E1B2E', secondary: '#4C1D95', muted: '#7C3AED' },
          border: '#E9D5FF',
        },
        spacing: { xs: 8, sm: 16, md: 24, lg: 32, xl: 40, xxl: 56 },
      },
      imageSettings: {
        placement: {
          defaultPosition: 'full-width',
          imageSpacing: 40,
          captionStyle: 'detailed',
          borderStyle: 'rounded',
        },
        sizing: {
          defaultSize: 'large',
          maxWidth: 800,
          aspectRatio: 'landscape',
          responsive: true,
        },
        captions: {
          enabled: true,
          position: 'below',
          style: 'detailed',
          fontSize: 16,
          color: '#4C1D95',
        },
      },
      exportFormats: [
        { id: 'epub', name: 'EPUB', extension: '.epub', supported: true },
        { id: 'pdf', name: 'PDF', extension: '.pdf', supported: true },
        { id: 'mobi', name: 'Kindle', extension: '.mobi', supported: false },
      ],
      features: [
        'Artistic typography',
        'Dynamic layouts',
        'Rich imagery',
        'Emotional design',
      ],
      bestFor: [
        'Novels',
        'Poetry collections',
        'Creative stories',
        'Art books',
      ],
    },

    technical_documentation: {
      id: 'technical_documentation',
      name: 'Technical Documentation',
      category: 'technical',
      description:
        'Monospace fonts and structured information hierarchy ideal for technical manuals and documentation.',
      preview:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      styles: {
        typography: {
          fontFamily: 'JetBrains Mono, Consolas, monospace',
          fontSize: {
            base: 14,
            h1: 24,
            h2: 20,
            h3: 18,
            h4: 16,
            h5: 14,
            h6: 14,
          },
          lineHeight: 1.5,
          letterSpacing: 0.01,
          fontWeight: { normal: 400, medium: 500, bold: 600 },
        },
        layout: {
          margins: { top: 50, bottom: 50, left: 60, right: 60 },
          columns: 1,
          gutters: 20,
          pageSize: 'A4',
          maxWidth: 900,
          spacing: { paragraph: 16, section: 24, chapter: 32 },
        },
        colors: {
          primary: '#6366F1',
          secondary: '#4F46E5',
          accent: '#EEF2FF',
          background: '#FFFFFF',
          surface: '#F8FAFF',
          text: { primary: '#1A1A2E', secondary: '#4338CA', muted: '#6366F1' },
          border: '#C7D2FE',
        },
        spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
      },
      imageSettings: {
        placement: {
          defaultPosition: 'inline',
          imageSpacing: 16,
          captionStyle: 'detailed',
          borderStyle: 'thin',
        },
        sizing: {
          defaultSize: 'medium',
          maxWidth: 700,
          aspectRatio: 'auto',
          responsive: true,
        },
        captions: {
          enabled: true,
          position: 'below',
          style: 'detailed',
          fontSize: 12,
          color: '#4338CA',
        },
      },
      exportFormats: [
        { id: 'pdf', name: 'PDF', extension: '.pdf', supported: true },
        { id: 'html', name: 'HTML', extension: '.html', supported: true },
        { id: 'md', name: 'Markdown', extension: '.md', supported: true },
      ],
      features: [
        'Monospace fonts',
        'Code highlighting',
        'Structured navigation',
        'Screenshot support',
      ],
      bestFor: [
        'Technical manuals',
        'API documentation',
        'User guides',
        'Developer docs',
      ],
    },

    educational_content: {
      id: 'educational_content',
      name: 'Educational Content',
      category: 'educational',
      description:
        'Readable fonts and interactive elements perfect for textbooks, courses, and learning materials.',
      preview:
        'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=300&fit=crop',
      styles: {
        typography: {
          fontFamily:
            'Open Sans, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: {
            base: 16,
            h1: 28,
            h2: 24,
            h3: 20,
            h4: 18,
            h5: 16,
            h6: 16,
          },
          lineHeight: 1.7,
          letterSpacing: 0.02,
          fontWeight: { normal: 400, medium: 500, bold: 600 },
        },
        layout: {
          margins: { top: 60, bottom: 60, left: 50, right: 50 },
          columns: 1,
          gutters: 25,
          pageSize: 'A4',
          maxWidth: 750,
          spacing: { paragraph: 20, section: 32, chapter: 48 },
        },
        colors: {
          primary: '#14B8A6',
          secondary: '#0D9488',
          accent: '#CCFBF1',
          background: '#FFFFFF',
          surface: '#F0FDFA',
          text: { primary: '#1A2A2A', secondary: '#0F766E', muted: '#14B8A6' },
          border: '#99F6E4',
        },
        spacing: { xs: 6, sm: 12, md: 18, lg: 24, xl: 30, xxl: 36 },
      },
      imageSettings: {
        placement: {
          defaultPosition: 'inline',
          imageSpacing: 20,
          captionStyle: 'detailed',
          borderStyle: 'rounded',
        },
        sizing: {
          defaultSize: 'medium',
          maxWidth: 600,
          aspectRatio: 'landscape',
          responsive: true,
        },
        captions: {
          enabled: true,
          position: 'below',
          style: 'detailed',
          fontSize: 14,
          color: '#0F766E',
        },
      },
      exportFormats: [
        { id: 'pdf', name: 'PDF', extension: '.pdf', supported: true },
        { id: 'epub', name: 'EPUB', extension: '.epub', supported: true },
        {
          id: 'interactive',
          name: 'Interactive',
          extension: '.html',
          supported: true,
        },
      ],
      features: [
        'Readable typography',
        'Interactive elements',
        'Visual learning aids',
        'Progress indicators',
      ],
      bestFor: [
        'Textbooks',
        'Online courses',
        'Training materials',
        'Educational guides',
      ],
    },

    marketing_sales: {
      id: 'marketing_sales',
      name: 'Marketing & Sales',
      category: 'marketing',
      description:
        'Persuasive layouts and call-to-action placement optimized for marketing materials and sales content.',
      preview:
        'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop',
      styles: {
        typography: {
          fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: {
            base: 16,
            h1: 36,
            h2: 32,
            h3: 28,
            h4: 24,
            h5: 20,
            h6: 18,
          },
          lineHeight: 1.6,
          letterSpacing: 0.02,
          fontWeight: { normal: 400, medium: 500, bold: 700 },
        },
        layout: {
          margins: { top: 40, bottom: 40, left: 40, right: 40 },
          columns: 1,
          gutters: 20,
          pageSize: 'A4',
          maxWidth: 800,
          spacing: { paragraph: 16, section: 24, chapter: 32 },
        },
        colors: {
          primary: '#F43F5E',
          secondary: '#E11D48',
          accent: '#FFE4E6',
          background: '#FFFFFF',
          surface: '#FFF1F2',
          text: { primary: '#2A1A1A', secondary: '#9F1239', muted: '#F43F5E' },
          border: '#FECDD3',
        },
        spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
      },
      imageSettings: {
        placement: {
          defaultPosition: 'top',
          imageSpacing: 16,
          captionStyle: 'minimal',
          borderStyle: 'none',
        },
        sizing: {
          defaultSize: 'hero',
          maxWidth: 800,
          aspectRatio: 'landscape',
          responsive: true,
        },
        captions: {
          enabled: false,
          position: 'below',
          style: 'minimal',
          fontSize: 14,
          color: '#9F1239',
        },
      },
      exportFormats: [
        { id: 'pdf', name: 'PDF', extension: '.pdf', supported: true },
        { id: 'html', name: 'Web', extension: '.html', supported: true },
        {
          id: 'pptx',
          name: 'PowerPoint',
          extension: '.pptx',
          supported: false,
        },
      ],
      features: [
        'Persuasive layouts',
        'Call-to-action placement',
        'Brand integration',
        'Conversion optimization',
      ],
      bestFor: [
        'Sales presentations',
        'Marketing materials',
        'Product catalogs',
        'Promotional content',
      ],
    },

    personal_development: {
      id: 'personal_development',
      name: 'Personal Development',
      category: 'personal',
      description:
        'Inspirational design with quote highlighting and action step formatting for self-help content.',
      preview:
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
      styles: {
        typography: {
          fontFamily: 'Playfair Display, Georgia, serif',
          fontSize: {
            base: 18,
            h1: 40,
            h2: 36,
            h3: 32,
            h4: 28,
            h5: 24,
            h6: 20,
          },
          lineHeight: 1.8,
          letterSpacing: 0.03,
          fontWeight: { normal: 400, medium: 500, bold: 700 },
        },
        layout: {
          margins: { top: 80, bottom: 80, left: 60, right: 60 },
          columns: 1,
          gutters: 30,
          pageSize: 'A4',
          maxWidth: 700,
          spacing: { paragraph: 24, section: 40, chapter: 60 },
        },
        colors: {
          primary: '#F59E0B',
          secondary: '#D97706',
          accent: '#FEF3C7',
          background: '#FFFFFF',
          surface: '#FFFBEB',
          text: { primary: '#2A1F1A', secondary: '#92400E', muted: '#F59E0B' },
          border: '#FDE68A',
        },
        spacing: { xs: 8, sm: 16, md: 24, lg: 32, xl: 40, xxl: 48 },
      },
      imageSettings: {
        placement: {
          defaultPosition: 'full-width',
          imageSpacing: 32,
          captionStyle: 'detailed',
          borderStyle: 'rounded',
        },
        sizing: {
          defaultSize: 'large',
          maxWidth: 700,
          aspectRatio: 'landscape',
          responsive: true,
        },
        captions: {
          enabled: true,
          position: 'below',
          style: 'detailed',
          fontSize: 16,
          color: '#92400E',
        },
      },
      exportFormats: [
        { id: 'epub', name: 'EPUB', extension: '.epub', supported: true },
        { id: 'pdf', name: 'PDF', extension: '.pdf', supported: true },
        { id: 'mobi', name: 'Kindle', extension: '.mobi', supported: false },
      ],
      features: [
        'Inspirational design',
        'Quote highlighting',
        'Action step formatting',
        'Motivational imagery',
      ],
      bestFor: [
        'Self-help books',
        'Motivational content',
        'Life coaching',
        'Personal growth',
      ],
    },

    fiction_narrative: {
      id: 'fiction_narrative',
      name: 'Fiction & Narrative',
      category: 'narrative',
      description:
        'Immersive layouts with character development sections and scene-setting imagery for storytelling.',
      preview:
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
      styles: {
        typography: {
          fontFamily: 'Crimson Text, Georgia, serif',
          fontSize: {
            base: 18,
            h1: 32,
            h2: 28,
            h3: 24,
            h4: 20,
            h5: 18,
            h6: 18,
          },
          lineHeight: 1.9,
          letterSpacing: 0.02,
          fontWeight: { normal: 400, medium: 500, bold: 600 },
        },
        layout: {
          margins: { top: 70, bottom: 70, left: 60, right: 60 },
          columns: 1,
          gutters: 25,
          pageSize: 'A4',
          maxWidth: 650,
          spacing: { paragraph: 22, section: 36, chapter: 54 },
        },
        colors: {
          primary: '#8B5CF6',
          secondary: '#7C3AED',
          accent: '#F3E8FF',
          background: '#FFFFFF',
          surface: '#FAF5FF',
          text: { primary: '#1E1B2E', secondary: '#4C1D95', muted: '#7C3AED' },
          border: '#E9D5FF',
        },
        spacing: { xs: 6, sm: 12, md: 18, lg: 24, xl: 30, xxl: 36 },
      },
      imageSettings: {
        placement: {
          defaultPosition: 'inline',
          imageSpacing: 28,
          captionStyle: 'detailed',
          borderStyle: 'rounded',
        },
        sizing: {
          defaultSize: 'medium',
          maxWidth: 600,
          aspectRatio: 'landscape',
          responsive: true,
        },
        captions: {
          enabled: true,
          position: 'below',
          style: 'detailed',
          fontSize: 14,
          color: '#4C1D95',
        },
      },
      exportFormats: [
        { id: 'epub', name: 'EPUB', extension: '.epub', supported: true },
        { id: 'pdf', name: 'PDF', extension: '.pdf', supported: true },
        { id: 'mobi', name: 'Kindle', extension: '.mobi', supported: false },
      ],
      features: [
        'Immersive layouts',
        'Character development sections',
        'Scene-setting imagery',
        'Emotional pacing',
      ],
      bestFor: ['Novels', 'Short stories', 'Fiction', 'Narrative content'],
    },

    scientific_publication: {
      id: 'scientific_publication',
      name: 'Scientific Publication',
      category: 'scientific',
      description:
        'Research paper format with citation management and data presentation for academic publications.',
      preview:
        'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop',
      styles: {
        typography: {
          fontFamily: 'Times New Roman, serif',
          fontSize: {
            base: 12,
            h1: 16,
            h2: 14,
            h3: 13,
            h4: 12,
            h5: 12,
            h6: 12,
          },
          lineHeight: 2.0,
          letterSpacing: 0.02,
          fontWeight: { normal: 400, medium: 500, bold: 700 },
        },
        layout: {
          margins: { top: 72, bottom: 72, left: 72, right: 72 },
          columns: 1,
          gutters: 0,
          pageSize: 'Letter',
          maxWidth: 612,
          spacing: { paragraph: 12, section: 18, chapter: 24 },
        },
        colors: {
          primary: '#374151',
          secondary: '#6B7280',
          accent: '#F3F4F6',
          background: '#FFFFFF',
          surface: '#FFFFFF',
          text: { primary: '#000000', secondary: '#374151', muted: '#6B7280' },
          border: '#D1D5DB',
        },
        spacing: { xs: 6, sm: 12, md: 18, lg: 24, xl: 30, xxl: 36 },
      },
      imageSettings: {
        placement: {
          defaultPosition: 'inline',
          imageSpacing: 18,
          captionStyle: 'detailed',
          borderStyle: 'none',
        },
        sizing: {
          defaultSize: 'medium',
          maxWidth: 500,
          aspectRatio: 'auto',
          responsive: false,
        },
        captions: {
          enabled: true,
          position: 'below',
          style: 'academic',
          fontSize: 10,
          color: '#6B7280',
        },
      },
      exportFormats: [
        { id: 'pdf', name: 'PDF', extension: '.pdf', supported: true },
        { id: 'docx', name: 'Word', extension: '.docx', supported: true },
        { id: 'latex', name: 'LaTeX', extension: '.tex', supported: false },
      ],
      features: [
        'Research paper format',
        'Citation management',
        'Data presentation',
        'Peer review ready',
      ],
      bestFor: [
        'Scientific papers',
        'Research publications',
        'Journal articles',
        'Conference proceedings',
      ],
    },

    minimalist_modern: {
      id: 'minimalist_modern',
      name: 'Minimalist Modern',
      category: 'minimalist',
      description:
        'Clean, uncluttered design with white space emphasis and typography-focused layout.',
      preview:
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
      styles: {
        typography: {
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: {
            base: 16,
            h1: 28,
            h2: 24,
            h3: 20,
            h4: 18,
            h5: 16,
            h6: 16,
          },
          lineHeight: 1.7,
          letterSpacing: 0.01,
          fontWeight: { normal: 400, medium: 500, bold: 600 },
        },
        layout: {
          margins: { top: 80, bottom: 80, left: 80, right: 80 },
          columns: 1,
          gutters: 40,
          pageSize: 'A4',
          maxWidth: 600,
          spacing: { paragraph: 32, section: 48, chapter: 64 },
        },
        colors: {
          primary: '#6B7280',
          secondary: '#9CA3AF',
          accent: '#F9FAFB',
          background: '#FFFFFF',
          surface: '#FFFFFF',
          text: { primary: '#111827', secondary: '#374151', muted: '#6B7280' },
          border: '#E5E7EB',
        },
        spacing: { xs: 8, sm: 16, md: 24, lg: 32, xl: 40, xxl: 48 },
      },
      imageSettings: {
        placement: {
          defaultPosition: 'inline',
          imageSpacing: 32,
          captionStyle: 'minimal',
          borderStyle: 'none',
        },
        sizing: {
          defaultSize: 'medium',
          maxWidth: 500,
          aspectRatio: 'landscape',
          responsive: true,
        },
        captions: {
          enabled: true,
          position: 'below',
          style: 'minimal',
          fontSize: 14,
          color: '#6B7280',
        },
      },
      exportFormats: [
        { id: 'pdf', name: 'PDF', extension: '.pdf', supported: true },
        { id: 'epub', name: 'EPUB', extension: '.epub', supported: true },
        { id: 'html', name: 'Web', extension: '.html', supported: true },
      ],
      features: [
        'Clean design',
        'White space emphasis',
        'Typography-focused',
        'Subtle imagery',
      ],
      bestFor: [
        'Modern content',
        'Clean presentations',
        'Minimalist design',
        'Contemporary publications',
      ],
    },
  };

  /**
   * Gets all available templates
   */
  async getTemplates(category?: string): Promise<EbookTemplate[]> {
    const templates = Object.values(this.TEMPLATES);

    if (category) {
      return templates.filter(template => template.category === category);
    }

    return templates;
  }

  /**
   * Gets a specific template by ID
   */
  async getTemplate(templateId: string): Promise<EbookTemplate | null> {
    const template = this.TEMPLATES[templateId];
    return template || null;
  }

  /**
   * Applies a template to content
   */
  async applyTemplate(
    templateId: string,
    content: Record<string, unknown>
  ): Promise<FormattedContent> {
    const template = this.TEMPLATES[templateId];
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Generate HTML with template styles
    const html = this.generateHTML(content, template);
    const css = this.generateCSS(template);
    const metadata = this.generateMetadata(content, template);
    const structure = this.analyzeStructure(content);

    return {
      html,
      css,
      metadata,
      structure,
    };
  }

  /**
   * Customizes a template with user preferences
   */
  async customizeTemplate(
    template: EbookTemplate,
    customizations: TemplateCustomization
  ): Promise<EbookTemplate> {
    return {
      ...template,
      styles: {
        typography: {
          ...template.styles.typography,
          ...customizations.typography,
        },
        layout: { ...template.styles.layout, ...customizations.layout },
        colors: { ...template.styles.colors, ...customizations.colors },
        spacing: { ...template.styles.spacing, ...customizations.spacing },
      },
      imageSettings: {
        placement: {
          ...template.imageSettings.placement,
          ...customizations.imageSettings?.placement,
        },
        sizing: {
          ...template.imageSettings.sizing,
          ...customizations.imageSettings?.sizing,
        },
        captions: {
          ...template.imageSettings.captions,
          ...customizations.imageSettings?.captions,
        },
      },
    };
  }

  /**
   * Generates HTML content with template styling
   */
  private generateHTML(
    content: Record<string, unknown>,
    template: EbookTemplate
  ): string {
    // This would generate actual HTML based on content structure
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${content.title || 'Document'}</title>
        <link href="https://fonts.googleapis.com/css2?family=${template.styles.typography.fontFamily.replace(
          /\s+/g,
          '+'
        )}:wght@400;500;600;700&display=swap" rel="stylesheet">
      </head>
      <body>
        <div class="ebook-container">
          ${this.renderContent(content, template)}
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generates CSS styles for the template
   */
  private generateCSS(template: EbookTemplate): string {
    const { typography, layout, colors, spacing } = template.styles;

    return `
      .ebook-container {
        max-width: ${layout.maxWidth}px;
        margin: 0 auto;
        padding: ${layout.margins.top}px ${layout.margins.right}px ${
          layout.margins.bottom
        }px ${layout.margins.left}px;
        background-color: ${colors.background};
        color: ${colors.text.primary};
        font-family: ${typography.fontFamily};
        font-size: ${typography.fontSize.base}px;
        line-height: ${typography.lineHeight};
        letter-spacing: ${typography.letterSpacing}em;
      }

      h1, h2, h3, h4, h5, h6 {
        color: ${colors.text.primary};
        font-weight: ${typography.fontWeight.bold};
        margin-bottom: ${spacing.md}px;
      }

      h1 { font-size: ${typography.fontSize.h1}px; }
      h2 { font-size: ${typography.fontSize.h2}px; }
      h3 { font-size: ${typography.fontSize.h3}px; }
      h4 { font-size: ${typography.fontSize.h4}px; }
      h5 { font-size: ${typography.fontSize.h5}px; }
      h6 { font-size: ${typography.fontSize.h6}px; }

      p {
        margin-bottom: ${spacing.md}px;
        color: ${colors.text.secondary};
      }

      img {
        max-width: ${template.imageSettings.sizing.maxWidth}px;
        height: auto;
        border-radius: ${
          template.imageSettings.placement.borderStyle === 'rounded'
            ? '8px'
            : '0'
        };
        margin: ${template.imageSettings.placement.imageSpacing}px 0;
      }

      .caption {
        font-size: ${template.imageSettings.captions.fontSize}px;
        color: ${template.imageSettings.captions.color};
        text-align: center;
        margin-top: ${spacing.sm}px;
      }
    `;
  }

  /**
   * Generates metadata for the document
   */
  private generateMetadata(
    content: Record<string, unknown>,
    template: EbookTemplate
  ): FormattedContent['metadata'] {
    return {
      title: (content.title as string) || 'Untitled Document',
      author: (content.author as string) || 'Unknown Author',
      description:
        (content.description as string) ||
        `Generated using ${template.name} template`,
      keywords: (content.keywords as string[]) || [
        template.category,
        'ebook',
        'document',
      ],
      language: 'en',
    };
  }

  /**
   * Analyzes content structure
   */
  private analyzeStructure(
    content: Record<string, unknown>
  ): FormattedContent['structure'] {
    return {
      chapters:
        (content.chapters as Array<{
          title: string;
          content: string;
          id?: string;
        }>) || [],
      sections:
        (content.sections as Array<{
          title: string;
          content: string;
          id?: string;
        }>) || [],
      images:
        (content.images as Array<{
          src: string;
          alt: string;
          caption?: string;
        }>) || [],
    };
  }

  /**
   * Renders content with template styling
   */
  private renderContent(
    content: Record<string, unknown>,
    _template: EbookTemplate
  ): string {
    // This would render the actual content with proper HTML structure
    return `
      <h1>${content.title || 'Document Title'}</h1>
      <p>${content.description || 'Document content goes here...'}</p>
    `;
  }
}

// Export singleton instance
export const ebookTemplateService = new EbookTemplateService();
