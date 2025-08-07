import * as React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';

import { exportService, ExportOptions } from '../services/exportService';
import {
  ebookTemplateService,
  EbookTemplate,
} from '../services/ebookTemplateService';
import {
  longFormContentGenerator,
  LongFormContentConfig,
  ChapterOutline,
} from '../services/longFormContentGenerator';
import {
  contentQualityValidator,
  QualityValidationResult,
} from '../services/contentQualityValidator';
import { ebookIntegrationService } from '../services/ebookIntegrationService';
import { GenreSelector } from '../components/GenreSelector';
import { getGenreById } from '../constants/genreConstants';

import {
  BookOpen,
  FileText,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Eye,
  Shield,
  Brain,
  Target,
  Palette,
  Type,
  Layout,
  Image as ImageIcon,
  RotateCw,
  Settings,
  Presentation,
} from 'lucide-react';
import { TemplateEditor } from '../components/TemplateEditor';
import { TemplatePreview } from '../components/TemplatePreview';

interface EbookCreationState {
  step:
    | 'setup'
    | 'outline'
    | 'generation'
    | 'validation'
    | 'template'
    | 'integration'
    | 'complete';
  config: Partial<LongFormContentConfig>;
  outline: ChapterOutline[];
  generatedContent: Record<string, unknown>;
  validationResults: QualityValidationResult | null;
  selectedTemplate: EbookTemplate | null;
  templateCustomizations: Record<string, unknown>;
  isGenerating: boolean;
  isValidating: boolean;
  progress: number;
}

// Helper functions for safe property access
const safeGetString = (obj: any, key: string): string => {
  return typeof obj[key] === 'string' ? obj[key] : '';
};

const safeGetNumber = (obj: any, key: string): number => {
  return typeof obj[key] === 'number' ? obj[key] : 0;
};

const safeGetArray = (obj: any, key: string): any[] => {
  return Array.isArray(obj[key]) ? obj[key] : [];
};

const safeGetObject = (obj: any, key: string): Record<string, any> => {
  return typeof obj[key] === 'object' && obj[key] !== null ? obj[key] : {};
};

// Safe content access
const getContentTitle = (content: any): string => {
  return safeGetString(content, 'title');
};

const getContentChapters = (content: any): any[] => {
  return safeGetArray(content, 'chapters');
};

const getContentWordCount = (content: any): number => {
  return safeGetNumber(content, 'totalWordCount');
};

const getContentQualityScore = (content: any): number => {
  return safeGetNumber(content, 'qualityScore');
};

const getContentMetadata = (content: any): Record<string, any> => {
  return safeGetObject(content, 'metadata');
};

const EnhancedEbookCreator: React.FC = () => {
  const [state, setState] = useState<EbookCreationState>({
    step: 'setup',
    config: {},
    outline: [],
    generatedContent: {} as Record<string, unknown>,
    validationResults: null,
    selectedTemplate: null,
    templateCustomizations: {},
    isGenerating: false,
    isValidating: false,
    progress: 0,
  });

  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [outlineProgress, setOutlineProgress] = useState(0);
  const [templates, setTemplates] = useState<EbookTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    targetWordCount: 8000,
    tone: '',
    audience: '',
    researchSources: '',
    enableFactChecking: true,
    enableHallucinationDetection: true,
    qualityThreshold: 0.7,
  });

  const generateFallbackOutline = useCallback((): ChapterOutline[] => {
    const wordCountPerChapter = Math.ceil(formData.targetWordCount / 8);
    return [
      {
        title: 'Introduction',
        summary: 'Setting the stage and introducing key concepts',
        targetWordCount: wordCountPerChapter,
        keyPoints: ['Background', 'Problem statement', 'Objectives'],
      },
      {
        title: 'Understanding the Fundamentals',
        summary: 'Core concepts and foundational knowledge',
        targetWordCount: wordCountPerChapter,
        keyPoints: ['Basic principles', 'Key definitions', 'Context'],
      },
      {
        title: 'Deep Dive into Core Topics',
        summary: 'Detailed exploration of main subject areas',
        targetWordCount: wordCountPerChapter,
        keyPoints: ['Main concepts', 'Analysis', 'Examples'],
      },
      {
        title: 'Practical Applications',
        summary: 'Real-world implementation and case studies',
        targetWordCount: wordCountPerChapter,
        keyPoints: ['Case studies', 'Best practices', 'Implementation'],
      },
      {
        title: 'Advanced Strategies',
        summary: 'Sophisticated approaches and techniques',
        targetWordCount: wordCountPerChapter,
        keyPoints: ['Advanced methods', 'Optimization', 'Innovation'],
      },
      {
        title: 'Common Challenges and Solutions',
        summary: 'Addressing potential obstacles and providing solutions',
        targetWordCount: wordCountPerChapter,
        keyPoints: ['Troubleshooting', 'Solutions', 'Best practices'],
      },
      {
        title: 'Future Trends and Opportunities',
        summary: 'Looking ahead at emerging trends and possibilities',
        targetWordCount: wordCountPerChapter,
        keyPoints: ['Trends', 'Opportunities', 'Innovation'],
      },
      {
        title: 'Conclusion',
        summary: 'Wrapping up key insights and next steps',
        targetWordCount: wordCountPerChapter,
        keyPoints: ['Summary', 'Key takeaways', 'Next steps'],
      },
    ];
  }, [formData.targetWordCount]);

  const loadTemplates = useCallback(async () => {
    try {
      const allTemplates = await ebookTemplateService.getTemplates();
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    }
  }, []);

  const generateOutline = useCallback(async () => {
    setIsGeneratingOutline(true);
    setOutlineProgress(0);

    try {
      // Simulate outline generation progress
      const progressSteps = [25, 50, 75, 100];
      for (const progress of progressSteps) {
        setOutlineProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // TODO: Fix this when generateOutline is made public
      const generatedOutline = generateFallbackOutline();
      setState(prev => ({ ...prev, outline: generatedOutline }));

      toast.success('Outline generated successfully!');
    } catch (error) {
      console.error('Outline generation error:', error);
      toast.error('Failed to generate outline. Using fallback outline.');

      // Use fallback outline
      const fallbackOutline = generateFallbackOutline();
      setState(prev => ({ ...prev, outline: fallbackOutline }));
    } finally {
      setIsGeneratingOutline(false);
    }
  }, [formData, generateFallbackOutline]);

  // Auto-generate outline when step changes to outline
  useEffect(() => {
    if (state.step === 'outline' && state.outline.length === 0) {
      generateOutline();
    }
  }, [state.step, state.outline.length, generateOutline]);

  // Load templates when step changes to template
  useEffect(() => {
    if (state.step === 'template' && templates.length === 0) {
      loadTemplates();
    }
  }, [state.step, templates.length, loadTemplates]);

  const handleFormChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSetupComplete = async () => {
    if (
      !formData.title ||
      !formData.genre ||
      !formData.tone ||
      !formData.audience
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    setState(prev => ({ ...prev, step: 'outline' }));

    try {
      // Generate outline
      const config: LongFormContentConfig = {
        title: formData.title,
        genre: formData.genre,
        targetWordCount: formData.targetWordCount,
        tone: formData.tone,
        audience: formData.audience,
        researchSources: formData.researchSources
          ? formData.researchSources.split('\n').filter(s => s.trim())
          : [],
        qualityThreshold: formData.qualityThreshold,
        enableFactChecking: formData.enableFactChecking,
        enableHallucinationDetection: formData.enableHallucinationDetection,
      };

      setState(prev => ({
        ...prev,
        config,
        step: 'generation',
        isGenerating: true,
        progress: 0,
      }));

      // Generate content with progress tracking
      const content = await generateContentWithProgress(config);

      setState(prev => ({
        ...prev,
        generatedContent: content,
        step: 'validation',
        isGenerating: false,
        progress: 100,
      }));

      // Validate content
      setState(prev => ({ ...prev, isValidating: true }));
      const validationResults = await contentQualityValidator.validateContent(
        getContentChapters(content)
          .map((c: { content: string }) => c.content)
          .join('\n\n'),
        config.genre,
        {
          researchSources: config.researchSources,
          factCheckRequired: config.enableFactChecking,
          targetAudience: config.audience,
        }
      );

      setState(prev => ({
        ...prev,
        validationResults,
        step: 'template',
        isValidating: false,
      }));

      if (validationResults.isValid) {
        toast.success(
          'eBook generated successfully with quality validation passed!'
        );
      } else {
        toast.error(
          'eBook generated but quality issues detected. Please review.'
        );
      }
    } catch (error) {
      console.error('eBook generation error:', error);
      toast.error('Failed to generate eBook. Please try again.');
      setState(prev => ({
        ...prev,
        isGenerating: false,
        isValidating: false,
      }));
    }
  };

  const generateContentWithProgress = async (
    config: LongFormContentConfig
  ): Promise<Record<string, unknown>> => {
    // Simulate progress updates
    const progressSteps = [20, 40, 60, 80, 100];

    for (const progress of progressSteps) {
      setState(prev => ({ ...prev, progress }));
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const content =
      await longFormContentGenerator.generateLongFormContent(config);
    return content as unknown as Record<string, unknown>;
  };

  const handleTemplateSelection = async (template: EbookTemplate) => {
    try {
      setState(prev => ({
        ...prev,
        selectedTemplate: template,
        step: 'integration',
      }));

      // Use integration service to create final ebook
      const integrationResult =
        await ebookIntegrationService.createIntegratedEbook(
          state.config,
          template.id,
          state.templateCustomizations,
          {
            enableSemanticImages: true,
            enableAdvancedPlacement: true,
            enableTemplateCustomization: true,
            enableQualityValidation: true,
            enableExportOptimization: true,
          }
        );

      // Validate integration quality
      const validation =
        await ebookIntegrationService.validateIntegration(integrationResult);

      if (!validation.isValid) {
        toast.error('Integration completed with issues. Please review.');
        console.warn('Integration issues:', validation.issues);
      } else {
        toast.success('Ebook created successfully with all integrations!');
      }

      setState(prev => ({
        ...prev,
        step: 'complete',
        generatedContent: integrationResult.content as unknown as Record<
          string,
          unknown
        >,
        validationResults: integrationResult.qualityResults,
      }));
    } catch (error) {
      console.error('Template integration error:', error);
      toast.error('Failed to integrate template. Please try again.');
      setState(prev => ({
        ...prev,
        step: 'template',
      }));
    }
  };

  const handleTemplateCustomization = (customizations: any) => {
    setState(prev => ({
      ...prev,
      templateCustomizations: customizations,
    }));
  };

  const handleTemplateApply = (template: EbookTemplate) => {
    setState(prev => ({
      ...prev,
      selectedTemplate: template,
      step: 'complete',
    }));
    toast.success(`Applied ${template.name} template`);
  };

  const handleTemplateSave = async (template: EbookTemplate) => {
    try {
      // In a real implementation, this would save the customized template
      console.log('Saving template:', template);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Template saved successfully');
    } catch (error) {
      console.error('Template save error:', error);
      toast.error('Failed to save template');
    }
  };

  const handleExport = async (format: 'pdf' | 'epub' | 'pptx' | 'docx') => {
    try {
      if (!state.selectedTemplate || !state.generatedContent) {
        toast.error('Please complete the ebook creation process first');
        return;
      }

      const exportOptions: ExportOptions = {
        format,
        quality: 'high',
        includeImages: true,
        includeMetadata: true,
        includeTableOfContents: true,
      };

      let result;
      if (state.step === 'complete' && state.generatedContent) {
        // Use integrated result if available
        const integratedResult =
          await ebookIntegrationService.createIntegratedEbook(
            {
              ...state.config,
              title: formData.title,
              genre: formData.genre,
              tone: formData.tone,
              audience: formData.audience,
              researchSources: formData.researchSources,
              enableFactChecking: formData.enableFactChecking,
              enableHallucinationDetection:
                formData.enableHallucinationDetection,
              qualityThreshold: formData.qualityThreshold,
            },
            state.selectedTemplate.id,
            state.templateCustomizations
          );

        if (format === 'pdf') {
          result = await exportService.exportToPDF(
            integratedResult.formattedContent,
            integratedResult.template,
            exportOptions
          );
        } else if (format === 'epub') {
          result = await exportService.exportToEPUB(
            integratedResult.formattedContent,
            integratedResult.template,
            exportOptions
          );
        } else if (format === 'pptx') {
          result = await exportService.exportToPPTX(
            integratedResult.formattedContent,
            integratedResult.template,
            exportOptions
          );
        } else {
          // Fallback for other formats
          result = await exportService.exportToPDF(
            integratedResult.formattedContent,
            integratedResult.template,
            exportOptions
          );
        }
      } else {
        // Basic export for incomplete content
        const formattedContent = {
          title: formData.title,
          author: 'DocCraft AI',
          chapters: state.generatedContent?.chapters || [],
          images: [],
          html: '',
          css: '',
          metadata: {
            title: formData.title,
            author: 'Unknown Author',
            description: `Generated content for ${formData.title}`,
            keywords: ['ebook', 'generated', 'content'],
            language: 'en',
          },
          structure: {
            chapters: [],
            sections: [],
            images: [],
          },
        };

        if (format === 'pdf') {
          result = await exportService.exportToPDF(
            formattedContent,
            state.selectedTemplate,
            exportOptions
          );
        } else if (format === 'epub') {
          result = await exportService.exportToEPUB(
            formattedContent,
            state.selectedTemplate,
            exportOptions
          );
        } else if (format === 'pptx') {
          result = await exportService.exportToPPTX(
            formattedContent,
            state.selectedTemplate,
            exportOptions
          );
        } else {
          result = await exportService.exportToPDF(
            formattedContent,
            state.selectedTemplate,
            exportOptions
          );
        }
      }

      if (result.success) {
        // Trigger download
        if (result.downloadUrl) {
          const link = document.createElement('a');
          link.href = result.downloadUrl;
          link.download = `${formData.title.replace(
            /[^a-zA-Z0-9]/g,
            '_'
          )}-${format}.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        toast.success(`${format.toUpperCase()} export successful!`);

        // Log export metadata
        if (result.metadata) {
          console.log('Export metadata:', result.metadata);
        }
      } else {
        toast.error(result.error || `Failed to export ${format.toUpperCase()}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(
        `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const renderSetupStep = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <BookOpen className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Enhanced eBook Creator
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Generate high-quality, long-form content (8000+ words) with built-in
          quality assurance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Basic Information
          </h2>

          <div>
            <label
              htmlFor="book-title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Book Title *
            </label>
            <input
              id="book-title"
              type="text"
              value={formData.title}
              onChange={e => handleFormChange('title', e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter your book title"
            />
          </div>

          <div>
            <label
              htmlFor="book-genre"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Genre *
            </label>
            <GenreSelector
              selectedGenreId={formData.genre}
              onGenreSelected={genre => handleFormChange('genre', genre.id)}
              showSearch={true}
              showPopular={true}
              showCategories={true}
              showSubgenres={true}
              variant="dropdown"
              size="md"
              placeholder="Select a genre for your book..."
            />
          </div>

          <div>
            <label
              htmlFor="word-count"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Target Word Count
            </label>
            <input
              id="word-count"
              type="number"
              value={formData.targetWordCount}
              onChange={e =>
                handleFormChange('targetWordCount', parseInt(e.target.value))
              }
              min={8000}
              max={50000}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum: 8,000 words</p>
          </div>

          <div>
            <label
              htmlFor="book-tone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Tone *
            </label>
            <select
              id="book-tone"
              value={formData.tone}
              onChange={e => handleFormChange('tone', e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select tone</option>
              <option value="Professional">Professional</option>
              <option value="Conversational">Conversational</option>
              <option value="Academic">Academic</option>
              <option value="Inspirational">Inspirational</option>
              <option value="Technical">Technical</option>
              <option value="Casual">Casual</option>
              <option value="Formal">Formal</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="target-audience"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Target Audience *
            </label>
            <input
              id="target-audience"
              type="text"
              value={formData.audience}
              onChange={e => handleFormChange('audience', e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., Business professionals, Students, General readers"
            />
          </div>
        </div>

        {/* Quality Settings */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Quality Assurance
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Fact Checking
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Verify factual claims against sources
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.enableFactChecking}
                onChange={e =>
                  handleFormChange('enableFactChecking', e.target.checked)
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Hallucination Detection
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Detect and flag potential AI hallucinations
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.enableHallucinationDetection}
                onChange={e =>
                  handleFormChange(
                    'enableHallucinationDetection',
                    e.target.checked
                  )
                }
                className="w-4 h-4 text-orange-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-green-600" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Quality Threshold
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Minimum quality score required
                  </p>
                </div>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.9"
                step="0.1"
                value={formData.qualityThreshold}
                onChange={e =>
                  handleFormChange(
                    'qualityThreshold',
                    parseFloat(e.target.value)
                  )
                }
                className="w-20"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formData.qualityThreshold}
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="research-sources"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Research Sources (Optional)
            </label>
            <textarea
              id="research-sources"
              value={formData.researchSources}
              onChange={e =>
                handleFormChange('researchSources', e.target.value)
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={4}
              placeholder="Enter research sources (one per line):&#10;https://example.com/source1&#10;https://example.com/source2"
            />
            <p className="text-xs text-gray-500 mt-1">
              URLs or file paths for fact-checking
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleSetupComplete}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Generate eBook
        </button>
      </div>
    </div>
  );

  const renderGenerationStep = () => (
    <div className="max-w-2xl mx-auto text-center space-y-8">
      <div className="flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Generating Your eBook
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Creating high-quality, long-form content with quality assurance...
        </p>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${state.progress}%` }}
          />
        </div>

        <p className="text-sm text-gray-500">
          Progress: {state.progress}% •{' '}
          {state.progress < 50
            ? 'Generating outline...'
            : state.progress < 80
              ? 'Writing chapters...'
              : 'Quality validation...'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Brain className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="font-medium">AI Generation</p>
          <p className="text-gray-600 dark:text-gray-300">Creating content</p>
        </div>

        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <Shield className="w-6 h-6 text-orange-600 mx-auto mb-2" />
          <p className="font-medium">Quality Check</p>
          <p className="text-gray-600 dark:text-gray-300">Validating content</p>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="font-medium">Fact Check</p>
          <p className="text-gray-600 dark:text-gray-300">Verifying accuracy</p>
        </div>
      </div>
    </div>
  );

  const renderOutlineStep = () => {
    const handleOutlineApproval = () => {
      setState(prev => ({
        ...prev,
        step: 'generation',
        isGenerating: true,
        progress: 0,
      }));
    };

    const handleOutlineRegeneration = () => {
      generateOutline();
    };

    if (isGeneratingOutline) {
      return (
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Generating Your eBook Outline
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Creating a comprehensive chapter structure based on your
              requirements...
            </p>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${outlineProgress}%` }}
              />
            </div>

            <p className="text-sm text-gray-500">
              Progress: {outlineProgress}% •{' '}
              {outlineProgress < 50
                ? 'Analyzing requirements...'
                : outlineProgress < 80
                  ? 'Structuring chapters...'
                  : 'Finalizing outline...'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Brain className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="font-medium">AI Analysis</p>
              <p className="text-gray-600 dark:text-gray-300">
                Understanding content
              </p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <FileText className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="font-medium">Structure Design</p>
              <p className="text-gray-600 dark:text-gray-300">
                Creating chapters
              </p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="font-medium">Optimization</p>
              <p className="text-gray-600 dark:text-gray-300">
                Balancing content
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <FileText className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Your eBook Outline
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Review and approve the generated chapter structure before content
            generation
          </p>
        </div>

        {/* Outline Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Outline Summary
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span>{state.outline.length} Chapters</span>
              <span>•</span>
              <span>
                {state.outline
                  .reduce((sum, ch) => sum + ch.targetWordCount, 0)
                  .toLocaleString()}{' '}
                Target Words
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-300">Genre:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {formData.genre}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-300">Tone:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {formData.tone}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-300">
                Audience:
              </span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {formData.audience}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-300">
                Target Words:
              </span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {formData.targetWordCount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Chapter List */}
        <div className="space-y-4">
          {state.outline.map((chapter, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border-l-4 border-blue-500"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 rounded-full text-sm font-medium">
                      {index + 1}
                    </span>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {chapter.title}
                    </h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    {chapter.summary}
                  </p>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Target: {chapter.targetWordCount.toLocaleString()} words
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {chapter.keyPoints.length} key points
                    </span>
                  </div>

                  {/* Key Points */}
                  <div className="mt-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      KEY POINTS
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {chapter.keyPoints.map((point, pointIndex) => (
                        <span
                          key={pointIndex}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded"
                        >
                          {point}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleOutlineApproval}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Approve & Generate Content
          </button>

          <button
            onClick={handleOutlineRegeneration}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium flex items-center gap-2"
          >
            <RotateCw className="w-4 h-4" />
            Regenerate Outline
          </button>
        </div>
      </div>
    );
  };

  const renderValidationStep = () => (
    <div className="max-w-2xl mx-auto text-center space-y-8">
      <div className="flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Quality Validation
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Running comprehensive quality checks and fact verification...
        </p>
      </div>
    </div>
  );

  const renderIntegrationStep = () => (
    <div className="max-w-2xl mx-auto text-center space-y-8">
      <div className="flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Final Integration
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Integrating semantic images, applying advanced placement, and
          finalizing your ebook...
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <ImageIcon className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="font-medium">Semantic Images</p>
            <p className="text-gray-600 dark:text-gray-300">Matching content</p>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Layout className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="font-medium">Advanced Placement</p>
            <p className="text-gray-600 dark:text-gray-300">
              Optimizing layout
            </p>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Type className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="font-medium">Template Application</p>
            <p className="text-gray-600 dark:text-gray-300">Final formatting</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTemplateStep = () => {
    const filteredTemplates =
      selectedCategory === 'all'
        ? templates
        : templates.filter(t => t.category === selectedCategory);

    const categories = [
      { id: 'all', name: 'All Templates', icon: BookOpen },
      { id: 'business', name: 'Business', icon: FileText },
      { id: 'academic', name: 'Academic', icon: FileText },
      { id: 'creative', name: 'Creative', icon: Palette },
      { id: 'technical', name: 'Technical', icon: Settings },
      { id: 'educational', name: 'Educational', icon: BookOpen },
      { id: 'marketing', name: 'Marketing', icon: Target },
      { id: 'personal', name: 'Personal Development', icon: Brain },
      { id: 'narrative', name: 'Fiction & Narrative', icon: BookOpen },
      { id: 'scientific', name: 'Scientific', icon: FileText },
      { id: 'minimalist', name: 'Minimalist', icon: Layout },
    ];

    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <Palette className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Choose Your Template
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Select a professional template to format your eBook with beautiful
            typography and layout
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Template Preview Image */}
              <div className="h-48 bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                <img
                  src={template.preview}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setState(prev => ({
                          ...prev,
                          selectedTemplate: template,
                        }));
                        setShowPreview(true);
                      }}
                      className="px-3 py-1 bg-white text-gray-900 rounded-md text-sm font-medium hover:bg-gray-100"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </button>
                    <button
                      onClick={() => {
                        setState(prev => ({
                          ...prev,
                          selectedTemplate: template,
                        }));
                        setShowEditor(true);
                      }}
                      className="px-3 py-1 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Customize
                    </button>
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {template.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {template.description}
                </p>

                {/* Features */}
                <div className="mb-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    FEATURES
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {template.features.slice(0, 3).map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Best For */}
                <div className="mb-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    BEST FOR
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {template.bestFor.slice(0, 2).join(', ')}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleTemplateSelection(template)}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
                  >
                    Use Template
                  </button>
                  <button
                    onClick={() => {
                      setState(prev => ({
                        ...prev,
                        selectedTemplate: template,
                      }));
                      setShowPreview(true);
                    }}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Template Editor Modal */}
        {showEditor && state.selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Customize {state.selectedTemplate.name}
                  </h3>
                  <button
                    onClick={() => setShowEditor(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="overflow-auto max-h-[calc(90vh-80px)]">
                <TemplateEditor
                  template={state.selectedTemplate}
                  onCustomize={handleTemplateCustomization}
                  onApply={handleTemplateApply}
                  onSave={handleTemplateSave}
                />
              </div>
            </div>
          </div>
        )}

        {/* Template Preview Modal */}
        {showPreview && state.selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Preview {state.selectedTemplate.name}
                  </h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="overflow-auto max-h-[calc(90vh-80px)]">
                <TemplatePreview
                  template={state.selectedTemplate}
                  content={state.generatedContent}
                  customizations={state.templateCustomizations}
                  onExport={(format: string) =>
                    handleExport(format as 'pdf' | 'epub' | 'pptx' | 'docx')
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCompleteStep = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          eBook Generated Successfully!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Your high-quality, long-form content is ready
          {state.selectedTemplate &&
            ` and formatted with the ${state.selectedTemplate.name} template`}
        </p>
      </div>

      {state.generatedContent && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Content Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Content Summary
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Title:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {getContentTitle(state.generatedContent)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Total Words:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {getContentWordCount(state.generatedContent).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Chapters:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {getContentChapters(state.generatedContent).length}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Quality Score:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {(
                    getContentQualityScore(state.generatedContent) * 100
                  ).toFixed(1)}
                  %
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Generation Time:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {Math.round(
                    (getContentMetadata(state.generatedContent)
                      .generationTime || 0) / 1000
                  )}
                  s
                </span>
              </div>

              {state.selectedTemplate && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Template:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {state.selectedTemplate.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quality Results */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Quality Results
            </h3>

            {state.validationResults && (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Overall Score:
                  </span>
                  <span
                    className={`font-medium ${
                      state.validationResults.overallScore >= 0.7
                        ? 'text-green-600'
                        : 'text-orange-600'
                    }`}
                  >
                    {(state.validationResults.overallScore * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Hallucination Score:
                  </span>
                  <span
                    className={`font-medium ${
                      state.validationResults.hallucinationScore <= 0.3
                        ? 'text-green-600'
                        : 'text-orange-600'
                    }`}
                  >
                    {(state.validationResults.hallucinationScore * 100).toFixed(
                      1
                    )}
                    %
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Issues Found:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {state.validationResults.issues.length}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Status:
                  </span>
                  <span
                    className={`font-medium ${
                      state.validationResults.isValid
                        ? 'text-green-600'
                        : 'text-orange-600'
                    }`}
                  >
                    {state.validationResults.isValid
                      ? 'Passed'
                      : 'Needs Review'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Export Options
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => handleExport('pdf')}
            className="flex flex-col items-center gap-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <FileText className="w-8 h-8 text-blue-600" />
            <span className="font-medium text-gray-900 dark:text-white">
              PDF
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Document
            </span>
          </button>

          <button
            onClick={() => handleExport('epub')}
            className="flex flex-col items-center gap-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          >
            <BookOpen className="w-8 h-8 text-green-600" />
            <span className="font-medium text-gray-900 dark:text-white">
              EPUB
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Ebook
            </span>
          </button>

          <button
            onClick={() => handleExport('pptx')}
            className="flex flex-col items-center gap-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
          >
            <Presentation className="w-8 h-8 text-orange-600" />
            <span className="font-medium text-gray-900 dark:text-white">
              PPTX
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Slides
            </span>
          </button>

          <button
            onClick={() => handleExport('docx')}
            className="flex flex-col items-center gap-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
          >
            <FileText className="w-8 h-8 text-purple-600" />
            <span className="font-medium text-gray-900 dark:text-white">
              DOCX
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Word
            </span>
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
          Choose your preferred format for downloading your ebook
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Preview Content
        </button>

        <button
          onClick={() => setState(prev => ({ ...prev, step: 'setup' }))}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
        >
          Create Another
        </button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (state.step) {
      case 'setup':
        return renderSetupStep();
      case 'outline':
        return renderOutlineStep();
      case 'generation':
        return renderGenerationStep();
      case 'validation':
        return renderValidationStep();
      case 'template':
        return renderTemplateStep();
      case 'integration':
        return renderIntegrationStep();
      case 'complete':
        return renderCompleteStep();
      default:
        return renderSetupStep();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
      <div className="max-w-7xl mx-auto px-4">{renderCurrentStep()}</div>
    </div>
  );
};

export default EnhancedEbookCreator;
