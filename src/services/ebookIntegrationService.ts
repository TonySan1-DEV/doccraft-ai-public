// Ebook Integration Service
// MCP: { role: "integrator", allowedActions: ["coordinate", "optimize", "validate"], theme: "system_integration", contentSensitivity: "medium", tier: "Pro" }

import {
  SemanticImageMatcher,
  ContentAnalysis,
  ImageMatch,
} from "./semanticImageMatcher";
import {
  AdvancedImagePlacer,
  PlacementStrategy,
} from "../utils/advancedImagePlacer";
import {
  EbookTemplateService,
  EbookTemplate,
  FormattedContent,
  TemplateCustomization,
} from "./ebookTemplateService";
import {
  longFormContentGenerator,
  GeneratedContent,
} from "./longFormContentGenerator";
import {
  contentQualityValidator,
  QualityValidationResult,
} from "./contentQualityValidator";

export interface EbookIntegrationConfig {
  enableSemanticImages: boolean;
  enableAdvancedPlacement: boolean;
  enableTemplateCustomization: boolean;
  enableQualityValidation: boolean;
  enableExportOptimization: boolean;
}

export interface IntegratedEbookResult {
  content: GeneratedContent;
  template: EbookTemplate;
  customizations: TemplateCustomization;
  images: ImageMatch[];
  placements: PlacementStrategy[];
  formattedContent: FormattedContent;
  qualityResults: QualityValidationResult;
  exportOptions: {
    pdf: boolean;
    epub: boolean;
    docx: boolean;
    html: boolean;
  };
}

export interface EbookCreationWorkflow {
  step:
    | "setup"
    | "outline"
    | "generation"
    | "validation"
    | "template"
    | "integration"
    | "complete";
  progress: number;
  status: "idle" | "processing" | "success" | "error";
  message: string;
}

export class EbookIntegrationService {
  private imageMatcher: SemanticImageMatcher;
  private imagePlacer: AdvancedImagePlacer;
  private templateService: EbookTemplateService;

  constructor() {
    this.imageMatcher = new SemanticImageMatcher();
    this.imagePlacer = new AdvancedImagePlacer();
    this.templateService = new EbookTemplateService();
  }

  /**
   * Complete ebook creation workflow with all integrations
   */
  async createIntegratedEbook(
    config: any,
    templateId: string,
    customizations?: TemplateCustomization,
    integrationConfig?: Partial<EbookIntegrationConfig>
  ): Promise<IntegratedEbookResult> {
    const integrationSettings = {
      enableSemanticImages: true,
      enableAdvancedPlacement: true,
      enableTemplateCustomization: true,
      enableQualityValidation: true,
      enableExportOptimization: true,
      ...integrationConfig,
    };

    try {
      // Step 1: Generate content
      const content = await longFormContentGenerator.generateLongFormContent(
        config
      );

      // Step 2: Quality validation
      let qualityResults: QualityValidationResult;
      if (integrationSettings.enableQualityValidation) {
        qualityResults = await contentQualityValidator.validateContent(
          content.chapters.map((c) => c.content).join("\n\n"),
          config.genre,
          {
            researchSources: config.researchSources,
            factCheckRequired: config.enableFactChecking,
            targetAudience: config.audience,
          }
        );
      } else {
        qualityResults = {
          isValid: true,
          confidence: 0.8,
          issues: [],
          suggestions: [],
          factCheckResults: [],
          hallucinationScore: 0.1,
          overallScore: 0.8,
        };
      }

      // Step 3: Semantic image matching
      let images: ImageMatch[] = [];
      if (integrationSettings.enableSemanticImages) {
        const contentAnalysis = await this.imageMatcher.analyzeContent(
          content.chapters.map((c) => c.content).join("\n\n")
        );
        images = await this.imageMatcher.findMatchingImages(contentAnalysis);
      }

      // Step 4: Advanced image placement
      let placements: PlacementStrategy[] = [];
      if (integrationSettings.enableAdvancedPlacement && images.length > 0) {
        placements = images.map((image) =>
          this.imagePlacer.calculateOptimalPlacement(
            content.chapters.map((c) => c.content).join("\n\n"),
            image
          )
        );
      }

      // Step 5: Template application
      const template = await this.templateService.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      // Step 6: Apply customizations
      let finalTemplate = template;
      if (integrationSettings.enableTemplateCustomization && customizations) {
        finalTemplate = await this.templateService.customizeTemplate(
          template,
          customizations
        );
      }

      // Step 7: Format content with template
      const formattedContent = await this.templateService.applyTemplate(
        templateId,
        {
          ...content,
          images,
          placements,
        }
      );

      // Step 8: Optimize for export
      const exportOptions = this.optimizeForExport(formattedContent, template);

      return {
        content,
        template: finalTemplate,
        customizations: customizations || {},
        images,
        placements,
        formattedContent,
        qualityResults,
        exportOptions,
      };
    } catch (error) {
      console.error("Ebook integration error:", error);
      throw new Error(`Failed to create integrated ebook: ${error.message}`);
    }
  }

  /**
   * Generate semantic images for specific content sections
   */
  async generateSectionImages(
    content: string,
    sectionType: "introduction" | "chapter" | "conclusion" | "sidebar"
  ): Promise<ImageMatch[]> {
    try {
      const analysis = await this.imageMatcher.analyzeContent(content);
      const images = await this.imageMatcher.findMatchingImages(analysis);

      // Filter and prioritize images based on section type
      return images
        .filter((image) => {
          const relevance = image.semanticMatch.relevanceScore;
          const contextMatch = image.semanticMatch.contextMatch;

          switch (sectionType) {
            case "introduction":
              return relevance > 0.7 && contextMatch.tone === "professional";
            case "chapter":
              return relevance > 0.6;
            case "conclusion":
              return (
                relevance > 0.7 &&
                contextMatch.emotions.includes("inspirational")
              );
            case "sidebar":
              return (
                relevance > 0.5 &&
                image.semanticMatch.visualStyle.style === "illustrative"
              );
            default:
              return relevance > 0.5;
          }
        })
        .slice(0, 3); // Limit to 3 images per section
    } catch (error) {
      console.error("Section image generation error:", error);
      return [];
    }
  }

  /**
   * Optimize template for specific content type
   */
  async optimizeTemplateForContent(
    template: EbookTemplate,
    content: GeneratedContent,
    customizations?: TemplateCustomization
  ): Promise<EbookTemplate> {
    try {
      const contentAnalysis = await this.imageMatcher.analyzeContent(
        content.chapters.map((c) => c.content).join("\n\n")
      );

      // Adjust typography based on content complexity
      const typographyAdjustments: Partial<
        TemplateCustomization["typography"]
      > = {};
      if (contentAnalysis.complexity === "complex") {
        typographyAdjustments.fontSize = {
          base: 18,
          h1: 36,
          h2: 32,
          h3: 28,
          h4: 24,
          h5: 20,
          h6: 18,
        };
        typographyAdjustments.lineHeight = 1.8;
      } else if (contentAnalysis.complexity === "simple") {
        typographyAdjustments.fontSize = {
          base: 14,
          h1: 28,
          h2: 24,
          h3: 20,
          h4: 18,
          h5: 16,
          h6: 14,
        };
        typographyAdjustments.lineHeight = 1.5;
      }

      // Adjust colors based on tone
      const colorAdjustments: Partial<TemplateCustomization["colors"]> = {};
      if (contentAnalysis.tone === "professional") {
        colorAdjustments.primary = "#1E40AF";
        colorAdjustments.secondary = "#3B82F6";
      } else if (contentAnalysis.tone === "creative") {
        colorAdjustments.primary = "#7C3AED";
        colorAdjustments.secondary = "#A855F7";
      }

      // Adjust layout based on audience
      const layoutAdjustments: Partial<TemplateCustomization["layout"]> = {};
      if (contentAnalysis.audience === "academic") {
        layoutAdjustments.margins = {
          top: 72,
          bottom: 72,
          left: 72,
          right: 72,
        };
        layoutAdjustments.spacing = { paragraph: 12, section: 24, chapter: 36 };
      } else if (contentAnalysis.audience === "general") {
        layoutAdjustments.margins = {
          top: 40,
          bottom: 40,
          left: 40,
          right: 40,
        };
        layoutAdjustments.spacing = { paragraph: 20, section: 32, chapter: 48 };
      }

      const optimizedCustomizations: TemplateCustomization = {
        ...customizations,
        typography: { ...customizations?.typography, ...typographyAdjustments },
        colors: { ...customizations?.colors, ...colorAdjustments },
        layout: { ...customizations?.layout, ...layoutAdjustments },
      };

      return await this.templateService.customizeTemplate(
        template,
        optimizedCustomizations
      );
    } catch (error) {
      console.error("Template optimization error:", error);
      return template;
    }
  }

  /**
   * Validate integration quality
   */
  async validateIntegration(result: IntegratedEbookResult): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
    score: number;
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 1.0;

    // Check content quality
    if (!result.qualityResults.isValid) {
      issues.push("Content quality validation failed");
      score -= 0.2;
    }

    // Check image relevance
    const avgImageRelevance =
      result.images.reduce(
        (sum, img) => sum + img.semanticMatch.relevanceScore,
        0
      ) / Math.max(result.images.length, 1);

    if (avgImageRelevance < 0.6) {
      issues.push("Low image relevance scores");
      score -= 0.1;
    }

    // Check template compatibility
    if (
      result.template.category === "academic" &&
      result.content.chapters.length < 5
    ) {
      issues.push("Academic template may not be suitable for short content");
      recommendations.push("Consider using a different template category");
    }

    // Check export compatibility
    const supportedFormats = Object.values(result.exportOptions).filter(
      Boolean
    ).length;
    if (supportedFormats < 2) {
      issues.push("Limited export format support");
      recommendations.push("Consider template with better export options");
    }

    // Generate recommendations
    if (result.images.length === 0) {
      recommendations.push(
        "Consider adding relevant images to enhance visual appeal"
      );
    }

    if (result.qualityResults.overallScore < 0.8) {
      recommendations.push(
        "Review and improve content quality before finalizing"
      );
    }

    return {
      isValid: score >= 0.7,
      issues,
      recommendations,
      score,
    };
  }

  /**
   * Optimize export settings based on template and content
   */
  private optimizeForExport(
    formattedContent: FormattedContent,
    template: EbookTemplate
  ): IntegratedEbookResult["exportOptions"] {
    const supportedFormats = template.exportFormats.map((f) => f.id);

    return {
      pdf: supportedFormats.includes("pdf"),
      epub: supportedFormats.includes("epub"),
      docx: supportedFormats.includes("docx"),
      html: true, // Always supported for web preview
    };
  }

  /**
   * Get workflow status for progress tracking
   */
  getWorkflowStatus(
    step: EbookCreationWorkflow["step"]
  ): EbookCreationWorkflow {
    const stepProgress = {
      setup: 10,
      outline: 25,
      generation: 50,
      validation: 70,
      template: 85,
      integration: 95,
      complete: 100,
    };

    const stepMessages = {
      setup: "Configuring ebook creation parameters",
      outline: "Generating chapter structure and outline",
      generation: "Creating high-quality content with AI",
      validation: "Running quality checks and fact verification",
      template: "Applying professional formatting template",
      integration: "Integrating images and finalizing layout",
      complete: "Ebook creation completed successfully",
    };

    return {
      step,
      progress: stepProgress[step],
      status: step === "complete" ? "success" : "processing",
      message: stepMessages[step],
    };
  }
}

// Export singleton instance
export const ebookIntegrationService = new EbookIntegrationService();
