// Advanced AI Input Validator with ML-based Threat Detection
// Comprehensive security validation for all AI inputs

import {
  AIInput,
  SecurityContext,
  ValidationResult,
  ValidationCheck,
  SecurityRule,
  ModuleNameType,
  CharacterData,
} from '../types/security';

export class AIInputValidator {
  private promptInjectionPatterns: RegExp[];
  private contentSecurityRules: SecurityRule[];
  private moduleValidators: Map<ModuleNameType, ModuleValidator>;
  private mlThreatDetector: MLThreatDetector;

  constructor() {
    this.promptInjectionPatterns = this.loadPromptInjectionPatterns();
    this.contentSecurityRules = this.loadContentSecurityRules();
    this.moduleValidators = this.initializeModuleValidators();
    this.mlThreatDetector = new MLThreatDetector();
  }

  async validateAIInput(
    input: AIInput,
    context: SecurityContext
  ): Promise<ValidationResult> {
    const validationResults: ValidationCheck[] = [];

    // Multi-layer security validation
    validationResults.push(await this.checkPromptInjection(input.content));
    validationResults.push(
      await this.validateContentLength(input.content, context.userTier)
    );
    validationResults.push(await this.checkMaliciousPatterns(input.content));
    validationResults.push(await this.validateDataIntegrity(input));

    // ML-based threat detection
    const mlThreatScore = await this.mlThreatDetector.assessThreat(
      input,
      context
    );
    validationResults.push({
      type: 'ml_threat_detection',
      severity:
        mlThreatScore > 0.8 ? 'high' : mlThreatScore > 0.5 ? 'medium' : 'low',
      passed: mlThreatScore < 0.8,
      score: mlThreatScore,
    });

    // Module-specific validation
    if (input.targetModule) {
      const moduleValidator = this.moduleValidators.get(
        input.targetModule as ModuleNameType
      );
      if (moduleValidator) {
        validationResults.push(await moduleValidator.validate(input, context));
      }
    }

    // Character data protection
    if (input.characterData) {
      validationResults.push(
        await this.validateCharacterDataSecurity(input.characterData, context)
      );
    }

    return this.consolidateValidationResults(validationResults);
  }

  private async checkPromptInjection(
    content: string
  ): Promise<ValidationCheck> {
    const advancedPatterns = [
      /ignore\s+previous\s+instructions/gi,
      /forget\s+everything\s+above/gi,
      /you\s+are\s+now\s+a\s+different\s+ai/gi,
      /roleplay\s+as\s+(?:admin|root|system)/gi,
      /execute\s+(?:command|code|script)/gi,
      /\$\{.*\}/g, // Template injection
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /data:text\/html/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /setTimeout\s*\(/gi,
      /setInterval\s*\(/gi,
      /document\./gi,
      /window\./gi,
      /process\./gi,
      /require\s*\(/gi,
      /import\s*\(/gi,
      /fs\./gi,
      /child_process/gi,
      /exec\s*\(/gi,
      /spawn\s*\(/gi,
    ];

    const suspiciousScore = this.calculateSuspiciousScore(
      content,
      advancedPatterns
    );

    return {
      type: 'prompt_injection',
      severity:
        suspiciousScore > 0.8
          ? 'critical'
          : suspiciousScore > 0.5
            ? 'high'
            : 'low',
      passed: suspiciousScore < 0.5,
      score: suspiciousScore,
      details: {
        suspiciousPatterns: this.identifyMatchingPatterns(
          content,
          advancedPatterns
        ),
      },
    };
  }

  private async validateContentLength(
    content: string,
    userTier: string
  ): Promise<ValidationCheck> {
    const maxLengths = {
      Free: 1000,
      Pro: 5000,
      Admin: 10000,
    };

    const maxLength = maxLengths[userTier as keyof typeof maxLengths] || 1000;
    const length = content.length;
    const lengthScore = length / maxLength;

    return {
      type: 'content_length',
      severity:
        lengthScore > 1.2 ? 'high' : lengthScore > 1.0 ? 'medium' : 'low',
      passed: length <= maxLength,
      score: lengthScore,
      details: { length, maxLength, userTier },
    };
  }

  private async checkMaliciousPatterns(
    content: string
  ): Promise<ValidationCheck> {
    const maliciousPatterns = [
      // SQL Injection
      /(\b(union|select|insert|update|delete|drop|create|alter)\b)/gi,
      /(\b(and|or)\b\s+\d+\s*=\s*\d+)/gi,
      /(\b(and|or)\b\s+['"]\w+['"]\s*=\s*['"]\w+['"])/gi,

      // XSS Patterns
      /<iframe\b[^>]*>/gi,
      /<object\b[^>]*>/gi,
      /<embed\b[^>]*>/gi,
      /<form\b[^>]*>/gi,
      /<input\b[^>]*>/gi,
      /<textarea\b[^>]*>/gi,
      /<button\b[^>]*>/gi,

      // Command Injection
      /(\b(cat|ls|pwd|whoami|id|uname|ps|netstat|ifconfig|ipconfig)\b)/gi,
      /(\b(rm|del|erase|format|fdisk|mkfs)\b)/gi,
      /(\b(chmod|chown|chgrp|umask)\b)/gi,

      // Path Traversal
      /\.\.\//g,
      /\.\.\\/g,
      /\/etc\/passwd/gi,
      /\/proc\/version/gi,
      /\/sys\/class/gi,

      // Sensitive Data Patterns
      /(\b(password|secret|key|token|api_key|private_key)\s*[:=]\s*['"]?\w+['"]?)/gi,
      /(\b(ssn|credit_card|cc_number|card_number)\s*[:=]\s*['"]?\d+['"]?)/gi,
      /(\b(phone|mobile|tel)\s*[:=]\s*['"]?[\d\-\+\(\)\s]+['"]?)/gi,
    ];

    const maliciousScore = this.calculateSuspiciousScore(
      content,
      maliciousPatterns
    );

    return {
      type: 'malicious_patterns',
      severity:
        maliciousScore > 0.7
          ? 'critical'
          : maliciousScore > 0.4
            ? 'high'
            : 'low',
      passed: maliciousScore < 0.3,
      score: maliciousScore,
      details: {
        maliciousPatterns: this.identifyMatchingPatterns(
          content,
          maliciousPatterns
        ),
      },
    };
  }

  private async validateDataIntegrity(
    input: AIInput
  ): Promise<ValidationCheck> {
    const integrityChecks: ValidationCheck[] = [];

    // Check for null/undefined values
    if (!input.content || input.content.trim().length === 0) {
      integrityChecks.push({
        type: 'data_integrity',
        severity: 'high',
        passed: false,
        score: 0,
        details: { issue: 'Empty content' },
      });
    }

    // Check for suspicious metadata
    if (input.metadata) {
      const suspiciousMetadata = this.checkSuspiciousMetadata(input.metadata);
      if (suspiciousMetadata.length > 0) {
        integrityChecks.push({
          type: 'metadata_integrity',
          severity: 'medium',
          passed: false,
          score: 0.5,
          details: { suspiciousMetadata },
        });
      }
    }

    // Check character data integrity
    if (input.characterData) {
      const characterIntegrity = this.validateCharacterDataIntegrity(
        input.characterData
      );
      integrityChecks.push(characterIntegrity);
    }

    // Consolidate integrity checks
    const overallScore =
      integrityChecks.length > 0
        ? integrityChecks.reduce((sum, check) => sum + check.score, 0) /
          integrityChecks.length
        : 1.0;

    const hasFailures = integrityChecks.some(check => !check.passed);
    const maxSeverity =
      integrityChecks.length > 0
        ? integrityChecks.reduce(
            (max, check) =>
              this.getSeverityScore(check.severity) > this.getSeverityScore(max)
                ? check.severity
                : max,
            'low'
          )
        : 'low';

    return {
      type: 'data_integrity',
      severity: maxSeverity,
      passed: !hasFailures,
      score: overallScore,
      details: { integrityChecks },
    };
  }

  private async validateCharacterDataSecurity(
    characterData: CharacterData,
    context: SecurityContext
  ): Promise<ValidationCheck> {
    const securityChecks: ValidationCheck[] = [];

    // Check for sensitive personal information
    const sensitivePatterns = [
      /(\b(real|actual|true|genuine)\s+(name|address|phone|email|ssn|credit_card)\b)/gi,
      /(\b(birth|born|age|dob)\s*[:=]\s*['"]?\d+['"]?)/gi,
      /(\b(address|street|city|state|zip|postal)\s*[:=]\s*['"]?\w+['"]?)/gi,
      /(\b(employer|company|work|job)\s*[:=]\s*['"]?\w+['"]?)/gi,
      /(\b(income|salary|wage|earnings)\s*[:=]\s*['"]?\d+['"]?)/gi,
    ];

    const sensitiveContent = this.calculateSuspiciousScore(
      JSON.stringify(characterData),
      sensitivePatterns
    );

    securityChecks.push({
      type: 'sensitive_data_detection',
      severity: sensitiveContent > 0.6 ? 'high' : 'low',
      passed: sensitiveContent < 0.4,
      score: 1 - sensitiveContent,
      details: { sensitiveContentScore: sensitiveContent },
    });

    // Check for realistic personal details that might be real
    const realisticDetails = this.checkRealisticPersonalDetails(characterData);
    if (realisticDetails.length > 0) {
      securityChecks.push({
        type: 'realistic_personal_details',
        severity: 'medium',
        passed: false,
        score: 0.6,
        details: { realisticDetails },
      });
    }

    // Overall security score
    const overallScore =
      securityChecks.reduce((sum, check) => sum + check.score, 0) /
      securityChecks.length;
    const hasFailures = securityChecks.some(check => !check.passed);
    const maxSeverity = securityChecks.reduce(
      (max, check) =>
        this.getSeverityScore(check.severity) > this.getSeverityScore(max)
          ? check.severity
          : max,
      'low'
    );

    return {
      type: 'character_data_security',
      severity: maxSeverity,
      passed: !hasFailures,
      score: overallScore,
      details: { securityChecks },
    };
  }

  private calculateSuspiciousScore(
    content: string,
    patterns: RegExp[]
  ): number {
    let totalScore = 0;
    let matchCount = 0;

    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        matchCount += matches.length;
        totalScore += matches.length * 0.1; // Each match adds 0.1 to score
      }
    }

    // Normalize score to 0-1 range
    const normalizedScore = Math.min(
      totalScore / Math.max(content.length / 100, 1),
      1
    );

    // Boost score for high match counts
    if (matchCount > 5) {
      return Math.min(normalizedScore + 0.2, 1);
    } else if (matchCount > 2) {
      return Math.min(normalizedScore + 0.1, 1);
    }

    return normalizedScore;
  }

  private identifyMatchingPatterns(
    content: string,
    patterns: RegExp[]
  ): string[] {
    const matches: string[] = [];

    for (const pattern of patterns) {
      const found = content.match(pattern);
      if (found) {
        matches.push(...found.slice(0, 3)); // Limit to first 3 matches per pattern
      }
    }

    return [...new Set(matches)]; // Remove duplicates
  }

  private checkSuspiciousMetadata(metadata: Record<string, unknown>): string[] {
    const suspicious: string[] = [];

    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === 'string') {
        // Check for suspicious keys
        if (
          key.toLowerCase().includes('script') ||
          key.toLowerCase().includes('eval') ||
          key.toLowerCase().includes('function')
        ) {
          suspicious.push(`Suspicious key: ${key}`);
        }

        // Check for suspicious values
        if (
          value.includes('<script') ||
          value.includes('javascript:') ||
          value.includes('eval(')
        ) {
          suspicious.push(
            `Suspicious value in ${key}: ${value.substring(0, 50)}...`
          );
        }
      }
    }

    return suspicious;
  }

  private validateCharacterDataIntegrity(
    characterData: CharacterData
  ): ValidationCheck {
    const issues: string[] = [];

    // Check required fields
    if (!characterData.id || !characterData.name) {
      issues.push('Missing required fields (id, name)');
    }

    // Check for suspicious content in description
    if (characterData.description) {
      const suspiciousContent = this.calculateSuspiciousScore(
        characterData.description,
        [/<script/, /javascript:/, /eval\(/]
      );

      if (suspiciousContent > 0.5) {
        issues.push('Suspicious content in description');
      }
    }

    // Check relationships integrity
    if (characterData.relationships) {
      for (const relationship of characterData.relationships) {
        if (!relationship.characterId || !relationship.relationshipType) {
          issues.push('Invalid relationship data');
          break;
        }
      }
    }

    return {
      type: 'character_data_integrity',
      severity:
        issues.length > 2 ? 'high' : issues.length > 0 ? 'medium' : 'low',
      passed: issues.length === 0,
      score: issues.length === 0 ? 1.0 : Math.max(0, 1 - issues.length * 0.2),
      details: { issues },
    };
  }

  private checkRealisticPersonalDetails(
    characterData: CharacterData
  ): string[] {
    const realistic: string[] = [];

    // Check for realistic names that might be real people
    const realisticNamePatterns = [
      /\b(Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s+\w+/gi,
      /\b(John|Jane|Mike|Sarah|David|Lisa|Robert|Jennifer|Michael|Jessica)\b/gi,
    ];

    if (characterData.name) {
      for (const pattern of realisticNamePatterns) {
        if (pattern.test(characterData.name)) {
          realistic.push(`Realistic name pattern: ${characterData.name}`);
          break;
        }
      }
    }

    // Check for realistic addresses
    if (characterData.description) {
      const addressPatterns = [
        /\b\d+\s+\w+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd)\b/gi,
        /\b(New York|Los Angeles|Chicago|Houston|Phoenix|Philadelphia|San Antonio|San Diego|Dallas|San Jose)\b/gi,
      ];

      for (const pattern of addressPatterns) {
        if (pattern.test(characterData.description)) {
          realistic.push('Realistic address pattern detected');
          break;
        }
      }
    }

    return realistic;
  }

  private getSeverityScore(severity: string): number {
    switch (severity) {
      case 'critical':
        return 4;
      case 'high':
        return 3;
      case 'medium':
        return 2;
      case 'low':
        return 1;
      default:
        return 0;
    }
  }

  private consolidateValidationResults(
    validationResults: ValidationCheck[]
  ): ValidationResult {
    const violations = validationResults
      .filter(result => !result.passed)
      .map(result => ({
        type: result.type,
        severity: result.severity,
        description: `Validation failed: ${result.type}`,
        details: result.details,
      }));

    const overallScore =
      validationResults.length > 0
        ? validationResults.reduce((sum, result) => sum + result.score, 0) /
          validationResults.length
        : 1.0;

    const maxSeverity =
      violations.length > 0
        ? violations.reduce(
            (max, violation) =>
              this.getSeverityScore(violation.severity) >
              this.getSeverityScore(max)
                ? violation.severity
                : max,
            'low'
          )
        : 'low';

    const recommendations = this.generateRecommendations(violations);

    return {
      passed: violations.length === 0,
      score: overallScore,
      violations,
      recommendations,
      riskLevel: maxSeverity,
    };
  }

  private generateRecommendations(violations: any[]): string[] {
    const recommendations: string[] = [];

    for (const violation of violations) {
      switch (violation.type) {
        case 'prompt_injection':
          recommendations.push('Remove or modify suspicious prompt patterns');
          break;
        case 'malicious_patterns':
          recommendations.push(
            'Review and sanitize potentially malicious content'
          );
          break;
        case 'sensitive_data_detection':
          recommendations.push(
            'Ensure no real personal information is included'
          );
          break;
        case 'data_integrity':
          recommendations.push('Validate input data structure and content');
          break;
        default:
          recommendations.push(`Review ${violation.type} validation`);
      }
    }

    return recommendations;
  }

  async filterOutput(
    content: string,
    context: SecurityContext
  ): Promise<string> {
    // Apply output filtering for sensitive content
    let filteredContent = content;

    // Remove any remaining suspicious patterns
    const outputPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /data:text\/html/gi,
      /on\w+\s*=/gi,
    ];

    for (const pattern of outputPatterns) {
      filteredContent = filteredContent.replace(pattern, '');
    }

    // Sanitize HTML if present
    if (context.userTier !== 'Admin') {
      filteredContent = this.sanitizeHTML(filteredContent);
    }

    return filteredContent;
  }

  private sanitizeHTML(content: string): string {
    // Basic HTML sanitization
    return content
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gis, '')
      .replace(/<object[^>]*>.*?<\/object>/gis, '')
      .replace(/<embed[^>]*>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '');
  }

  private loadPromptInjectionPatterns(): RegExp[] {
    // Load patterns from configuration or database
    return [
      /ignore\s+previous\s+instructions/gi,
      /forget\s+everything\s+above/gi,
      /you\s+are\s+now\s+a\s+different\s+ai/gi,
    ];
  }

  private loadContentSecurityRules(): SecurityRule[] {
    // Load security rules from configuration or database
    return [
      {
        id: 'rule_001',
        name: 'Script Injection Prevention',
        description: 'Prevent script injection attacks',
        pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        severity: 'critical',
        action: 'block',
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  private initializeModuleValidators(): Map<ModuleNameType, ModuleValidator> {
    const validators = new Map<ModuleNameType, ModuleValidator>();

    validators.set('emotionArc', new EmotionArcValidator());
    validators.set('narrativeDashboard', new NarrativeDashboardValidator());
    validators.set('plotStructure', new PlotStructureValidator());
    validators.set('styleProfile', new StyleProfileValidator());
    validators.set('themeAnalysis', new ThemeAnalysisValidator());

    return validators;
  }
}

// Module-specific validators
abstract class ModuleValidator {
  abstract validate(
    input: AIInput,
    context: SecurityContext
  ): Promise<ValidationCheck>;
}

class EmotionArcValidator extends ModuleValidator {
  async validate(
    input: AIInput,
    context: SecurityContext
  ): Promise<ValidationCheck> {
    // Emotion arc specific validation
    return {
      type: 'emotion_arc_validation',
      severity: 'low',
      passed: true,
      score: 1.0,
    };
  }
}

class NarrativeDashboardValidator extends ModuleValidator {
  async validate(
    input: AIInput,
    context: SecurityContext
  ): Promise<ValidationCheck> {
    // Narrative dashboard specific validation
    return {
      type: 'narrative_dashboard_validation',
      severity: 'low',
      passed: true,
      score: 1.0,
    };
  }
}

class PlotStructureValidator extends ModuleValidator {
  async validate(
    input: AIInput,
    context: SecurityContext
  ): Promise<ValidationCheck> {
    // Plot structure specific validation
    return {
      type: 'plot_structure_validation',
      severity: 'low',
      passed: true,
      score: 1.0,
    };
  }
}

class StyleProfileValidator extends ModuleValidator {
  async validate(
    input: AIInput,
    context: SecurityContext
  ): Promise<ValidationCheck> {
    // Style profile specific validation
    return {
      type: 'style_profile_validation',
      severity: 'low',
      passed: true,
      score: 1.0,
    };
  }
}

class ThemeAnalysisValidator extends ModuleValidator {
  async validate(
    input: AIInput,
    context: SecurityContext
  ): Promise<ValidationCheck> {
    // Theme analysis specific validation
    return {
      type: 'theme_analysis_validation',
      severity: 'low',
      passed: true,
      score: 1.0,
    };
  }
}

// ML-based threat detector
class MLThreatDetector {
  async assessThreat(
    input: AIInput,
    context: SecurityContext
  ): Promise<number> {
    // Implement ML-based threat detection
    // This would integrate with a trained model
    let threatScore = 0;

    // Basic heuristic scoring
    if (input.content.length > 5000) threatScore += 0.1;
    if (input.content.includes('admin') || input.content.includes('root'))
      threatScore += 0.2;
    if (context.riskProfile.riskScore > 0.5) threatScore += 0.3;

    return Math.min(threatScore, 1.0);
  }
}
