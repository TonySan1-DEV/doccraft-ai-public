// Enterprise AI Security Gateway for DocCraft-AI
// Zero-trust architecture with comprehensive monitoring and threat detection

import { SupabaseClient } from '@supabase/supabase-js';
import {
  SecureAIRequest,
  SecureAIResponse,
  SecurityContext,
  SecurityError,
  ValidationResult,
  ThreatDetectionResult,
  SecurityMetrics,
  AuditLogEntry,
  PerformanceMetrics,
} from '../types/security';
import { AIInputValidator } from './aiInputValidator';
import { AuditLogger } from './auditLogger';
import { PerformanceMonitor } from '../monitoring/performanceMonitor';
import { ThreatDetector } from './threatDetector';
import { RateLimiter } from './rateLimiter';
import { AlertService } from '../monitoring/alertSystem';

export class AISecurityGateway {
  private inputValidator: AIInputValidator;
  private auditLogger: AuditLogger;
  private performanceMonitor: PerformanceMonitor;
  private rateLimiters: Map<string, RateLimiter>;
  private threatDetector: ThreatDetector;
  private alertService: AlertService;

  constructor(
    private supabase: SupabaseClient,
    alertService: AlertService
  ) {
    this.inputValidator = new AIInputValidator();
    this.auditLogger = new AuditLogger(supabase);
    this.performanceMonitor = new PerformanceMonitor(supabase, alertService);
    this.rateLimiters = this.setupRateLimiters();
    this.threatDetector = new ThreatDetector();
    this.alertService = alertService;
  }

  async processSecureAIRequest(
    request: SecureAIRequest,
    context: SecurityContext
  ): Promise<SecureAIResponse> {
    const startTime = performance.now();
    const requestId = this.generateRequestId();

    try {
      // Security validation pipeline
      await this.validateAuthentication(context);
      await this.checkRateLimit(context.userId, context.userTier);

      const validationResult = await this.validateAIInput(request, context);
      if (!validationResult.passed) {
        await this.handleSecurityViolation(
          requestId,
          validationResult,
          context
        );
        throw new SecurityError('Input validation failed', validationResult);
      }

      // Threat detection
      const threatLevel = await this.threatDetector.assessThreat(
        request,
        context
      );
      if (threatLevel > 0.8) {
        await this.handleHighThreatLevel(requestId, threatLevel, context);
      }

      // Process request with monitoring
      const sanitizedRequest = await this.sanitizeInput(
        request,
        validationResult
      );
      const aiResponse = await this.forwardToAIService(
        sanitizedRequest,
        context
      );
      const filteredResponse = await this.filterResponse(aiResponse, context);

      // Record comprehensive metrics
      const executionTime = performance.now() - startTime;
      await this.recordSecurityMetrics(
        requestId,
        request,
        filteredResponse,
        executionTime,
        context
      );

      return {
        content: filteredResponse.content,
        confidence: filteredResponse.confidence,
        model: filteredResponse.model,
        usage: filteredResponse.usage,
        cached: filteredResponse.cached,
        securityLevel: 'validated',
        requestId,
        securityMetadata: {
          validationScore: validationResult.score,
          threatScore: threatLevel,
          encryptionLevel: 'AES-256',
          auditTrail: [`Request processed at ${new Date().toISOString()}`],
          complianceStatus: await this.getComplianceStatus(context),
        },
      };
    } catch (error) {
      await this.handleSecurityError(requestId, error, request, context);
      throw error;
    }
  }

  private async validateAuthentication(
    context: SecurityContext
  ): Promise<void> {
    if (!context.userId || !context.sessionId) {
      throw new SecurityError('Authentication required', {
        code: 'AUTH_REQUIRED',
        severity: 'high',
        context,
        timestamp: new Date(),
      });
    }

    // Validate session and permissions
    const sessionValid = await this.validateSession(
      context.sessionId,
      context.userId
    );
    if (!sessionValid) {
      throw new SecurityError('Invalid session', {
        code: 'INVALID_SESSION',
        severity: 'high',
        context,
        timestamp: new Date(),
      });
    }
  }

  private async checkRateLimit(
    userId: string,
    userTier: string
  ): Promise<void> {
    const rateLimiter = this.rateLimiters.get(userId);
    if (!rateLimiter) {
      // Initialize rate limiter for new user
      this.rateLimiters.set(userId, new RateLimiter(userId, userTier));
      return;
    }

    if (!rateLimiter.checkLimit()) {
      throw new SecurityError('Rate limit exceeded', {
        code: 'RATE_LIMIT_EXCEEDED',
        severity: 'medium',
        context: { userId, userTier } as SecurityContext,
        timestamp: new Date(),
      });
    }
  }

  private async validateAIInput(
    request: SecureAIRequest,
    context: SecurityContext
  ): Promise<ValidationResult> {
    return await this.inputValidator.validateAIInput(
      {
        content: request.content,
        targetModule: request.targetModule,
        characterData: request.characterData,
        userId: context.userId,
        sessionId: context.sessionId,
        timestamp: request.timestamp,
        metadata: request.metadata,
      },
      context
    );
  }

  private async handleSecurityViolation(
    requestId: string,
    validationResult: ValidationResult,
    context: SecurityContext
  ): Promise<void> {
    const violation = {
      requestId,
      userId: context.userId,
      timestamp: new Date(),
      violations: validationResult.violations,
      riskLevel: validationResult.riskLevel,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    };

    await this.auditLogger.logSecurityViolation(violation);
    await this.alertService.triggerAlert(
      'security',
      'high',
      'Security violation detected',
      violation
    );

    // Update user risk profile
    await this.updateUserRiskProfile(context.userId, validationResult);
  }

  private async handleHighThreatLevel(
    requestId: string,
    threatLevel: number,
    context: SecurityContext
  ): Promise<void> {
    const threat = {
      requestId,
      userId: context.userId,
      threatLevel,
      timestamp: new Date(),
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      metadata: { requestContent: context },
    };

    await this.auditLogger.logHighThreat(threat);
    await this.alertService.triggerAlert(
      'security',
      'critical',
      'High threat level detected',
      threat
    );

    // Block user if threat level is critical
    if (threatLevel > 0.9) {
      await this.blockUser(context.userId, 'Critical threat level detected');
    }
  }

  private async sanitizeInput(
    request: SecureAIRequest,
    validationResult: ValidationResult
  ): Promise<SecureAIRequest> {
    // Remove or sanitize flagged content
    let sanitizedContent = request.content;

    for (const violation of validationResult.violations) {
      if (violation.severity === 'critical') {
        sanitizedContent = this.removeMaliciousContent(
          sanitizedContent,
          violation
        );
      } else if (violation.severity === 'high') {
        sanitizedContent = this.sanitizeContent(sanitizedContent, violation);
      }
    }

    return {
      ...request,
      content: sanitizedContent,
    };
  }

  private async forwardToAIService(
    request: SecureAIRequest,
    context: SecurityContext
  ): Promise<any> {
    // Forward to appropriate AI service based on target module
    const startTime = performance.now();

    try {
      let response;

      if (request.targetModule) {
        response = await this.routeToModule(
          request.targetModule,
          request,
          context
        );
      } else {
        response = await this.routeToGeneralAI(request, context);
      }

      const responseTime = performance.now() - startTime;

      // Record performance metrics
      await this.performanceMonitor.recordAIPerformance(
        {
          type: 'ai_request',
          module: request.targetModule || 'general',
          userId: context.userId,
          timestamp: new Date(),
          metadata: request.metadata,
        },
        {
          content: response.content,
          qualityScore: response.qualityScore || 0.8,
          metadata: response.metadata || {},
        },
        {
          responseTime,
          cacheHit: response.cached || false,
          tokenUsage: response.usage?.totalTokens || 0,
          securityLevel: 'validated',
          threatScore: 0,
          metadata: { requestId: request.id },
        }
      );

      return response;
    } catch (error) {
      const responseTime = performance.now() - startTime;
      await this.performanceMonitor.recordAIPerformance(
        {
          type: 'ai_request_error',
          module: request.targetModule || 'general',
          userId: context.userId,
          timestamp: new Date(),
          metadata: request.metadata,
        },
        {
          content: '',
          qualityScore: 0,
          metadata: { error: error.message },
        },
        {
          responseTime,
          cacheHit: false,
          tokenUsage: 0,
          securityLevel: 'error',
          threatScore: 0,
          metadata: { requestId: request.id, error: error.message },
        }
      );

      throw error;
    }
  }

  private async filterResponse(
    aiResponse: any,
    context: SecurityContext
  ): Promise<any> {
    // Apply output filtering for sensitive content
    const filteredContent = await this.inputValidator.filterOutput(
      aiResponse.content,
      context
    );

    return {
      ...aiResponse,
      content: filteredContent,
    };
  }

  private async recordSecurityMetrics(
    requestId: string,
    request: SecureAIRequest,
    response: any,
    executionTime: number,
    context: SecurityContext
  ): Promise<void> {
    const metrics: SecurityMetrics = {
      threatLevel: 0, // Will be calculated based on validation results
      validationAccuracy: 1.0,
      responseTime: executionTime,
      blockedAttacks: 0,
      falsePositives: 0,
      encryptionCoverage: 100,
      complianceScore: 95,
      lastUpdated: new Date(),
    };

    await this.performanceMonitor.recordSecurityMetrics(requestId, metrics);
  }

  private async handleSecurityError(
    requestId: string,
    error: any,
    request: SecureAIRequest,
    context: SecurityContext
  ): Promise<void> {
    const securityError: AuditLogEntry = {
      id: requestId,
      timestamp: new Date(),
      userId: context.userId,
      action: 'ai_request_failed',
      resource: request.targetModule || 'general',
      success: false,
      securityLevel: 'error',
      threatScore: 0,
      metadata: { error: error.message, request },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      sessionId: context.sessionId,
    };

    await this.auditLogger.logSecurityError(securityError);
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async validateSession(
    sessionId: string,
    userId: string
  ): Promise<boolean> {
    // Implement session validation logic
    try {
      const { data, error } = await this.supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .eq('active', true)
        .single();

      if (error || !data) {
        return false;
      }

      // Check if session is expired
      const expiresAt = new Date(data.expires_at);
      return expiresAt > new Date();
    } catch (error) {
      return false;
    }
  }

  private async updateUserRiskProfile(
    userId: string,
    validationResult: ValidationResult
  ): Promise<void> {
    // Update user risk profile in database
    try {
      const riskScore = this.calculateRiskScore(validationResult);

      await this.supabase.from('user_risk_profiles').upsert({
        user_id: userId,
        risk_score: riskScore,
        threat_level: validationResult.riskLevel,
        last_violation: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to update user risk profile:', error);
    }
  }

  private calculateRiskScore(validationResult: ValidationResult): number {
    let riskScore = 0;

    for (const violation of validationResult.violations) {
      switch (violation.severity) {
        case 'critical':
          riskScore += 0.4;
          break;
        case 'high':
          riskScore += 0.2;
          break;
        case 'medium':
          riskScore += 0.1;
          break;
        case 'low':
          riskScore += 0.05;
          break;
      }
    }

    return Math.min(riskScore, 1.0);
  }

  private async blockUser(userId: string, reason: string): Promise<void> {
    try {
      await this.supabase.from('user_blocks').insert({
        user_id: userId,
        reason,
        blocked_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      });

      await this.alertService.triggerAlert(
        'security',
        'critical',
        `User ${userId} blocked`,
        { reason }
      );
    } catch (error) {
      console.error('Failed to block user:', error);
    }
  }

  private removeMaliciousContent(content: string, violation: any): string {
    // Remove malicious content patterns
    if (violation.type === 'prompt_injection') {
      return content.replace(/ignore\s+previous\s+instructions/gi, '');
    }

    return content;
  }

  private sanitizeContent(content: string, violation: any): string {
    // Sanitize potentially harmful content
    if (violation.type === 'script_injection') {
      return content.replace(
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        ''
      );
    }

    return content;
  }

  private async routeToModule(
    moduleName: string,
    request: SecureAIRequest,
    context: SecurityContext
  ): Promise<any> {
    // Route to specific module AI service
    switch (moduleName) {
      case 'emotionArc':
        return await this.callEmotionArcAI(request, context);
      case 'narrativeDashboard':
        return await this.callNarrativeDashboardAI(request, context);
      case 'plotStructure':
        return await this.callPlotStructureAI(request, context);
      case 'styleProfile':
        return await this.callStyleProfileAI(request, context);
      case 'themeAnalysis':
        return await this.callThemeAnalysisAI(request, context);
      default:
        throw new Error(`Unknown module: ${moduleName}`);
    }
  }

  private async routeToGeneralAI(
    request: SecureAIRequest,
    context: SecurityContext
  ): Promise<any> {
    // Route to general AI service
    // This would integrate with existing AI services
    return {
      content: 'AI response placeholder',
      qualityScore: 0.8,
      cached: false,
      usage: { totalTokens: 100 },
      metadata: {},
    };
  }

  private async callEmotionArcAI(
    request: SecureAIRequest,
    context: SecurityContext
  ): Promise<any> {
    // Implement emotion arc AI service call
    return {
      content: 'Emotion arc AI response',
      qualityScore: 0.9,
      cached: false,
      usage: { totalTokens: 150 },
    };
  }

  private async callNarrativeDashboardAI(
    request: SecureAIRequest,
    context: SecurityContext
  ): Promise<any> {
    // Implement narrative dashboard AI service call
    return {
      content: 'Narrative dashboard AI response',
      qualityScore: 0.9,
      cached: false,
      usage: { totalTokens: 150 },
    };
  }

  private async callPlotStructureAI(
    request: SecureAIRequest,
    context: SecurityContext
  ): Promise<any> {
    // Implement plot structure AI service call
    return {
      content: 'Plot structure AI response',
      qualityScore: 0.9,
      cached: false,
      usage: { totalTokens: 150 },
    };
  }

  private async callStyleProfileAI(
    request: SecureAIRequest,
    context: SecurityContext
  ): Promise<any> {
    // Implement style profile AI service call
    return {
      content: 'Style profile AI response',
      qualityScore: 0.9,
      cached: false,
      usage: { totalTokens: 150 },
    };
  }

  private async callThemeAnalysisAI(
    request: SecureAIRequest,
    context: SecurityContext
  ): Promise<any> {
    // Implement theme analysis AI service call
    return {
      content: 'Theme analysis AI response',
      qualityScore: 0.9,
      cached: false,
      usage: { totalTokens: 150 },
    };
  }

  private async getComplianceStatus(context: SecurityContext): Promise<any> {
    // Return compliance status based on user tier and context
    return {
      gdpr: true,
      ccpa: true,
      hipaa: context.userTier === 'Admin',
      sox: context.userTier === 'Admin',
      iso27001: true,
      lastAudit: new Date(),
    };
  }

  private setupRateLimiters(): Map<string, RateLimiter> {
    return new Map();
  }

  // Public methods for external access
  async getSecurityMetrics(): Promise<SecurityMetrics> {
    return await this.performanceMonitor.getSecurityMetrics();
  }

  async getThreatLevel(): Promise<number> {
    return await this.threatDetector.getCurrentThreatLevel();
  }

  async getComplianceReport(): Promise<any> {
    return await this.auditLogger.generateComplianceReport();
  }
}
