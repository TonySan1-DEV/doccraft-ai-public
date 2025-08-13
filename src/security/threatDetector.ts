// Advanced Threat Detector for DocCraft-AI
// Real-time threat assessment and risk analysis

import {
  SecureAIRequest,
  SecurityContext,
  ThreatDetectionResult,
  RiskFactor,
  SecurityRule,
} from '../types/security';

export class ThreatDetector {
  private threatPatterns: Map<string, RegExp[]>;
  private behavioralProfiles: Map<string, BehavioralProfile>;
  private anomalyDetector: AnomalyDetector;
  private mlModel: MLThreatModel;
  private threatHistory: ThreatEvent[];

  constructor() {
    this.threatPatterns = this.initializeThreatPatterns();
    this.behavioralProfiles = new Map();
    this.anomalyDetector = new AnomalyDetector();
    this.mlModel = new MLThreatModel();
    this.threatHistory = [];
  }

  async assessThreat(
    request: SecureAIRequest,
    context: SecurityContext
  ): Promise<number> {
    const startTime = performance.now();

    try {
      // Multi-layered threat assessment
      const patternThreat = await this.assessPatternThreat(request);
      const behavioralThreat = await this.assessBehavioralThreat(context);
      const anomalyThreat = await this.assessAnomalyThreat(request, context);
      const mlThreat = await this.assessMLThreat(request, context);
      const contextualThreat = await this.assessContextualThreat(
        request,
        context
      );

      // Weighted threat score calculation
      const threatScore = this.calculateWeightedThreatScore({
        pattern: patternThreat,
        behavioral: behavioralThreat,
        anomaly: anomalyThreat,
        ml: mlThreat,
        contextual: contextualThreat,
      });

      // Record threat assessment
      const assessmentTime = performance.now() - startTime;
      await this.recordThreatAssessment(
        request.id,
        threatScore,
        assessmentTime,
        {
          pattern: patternThreat,
          behavioral: behavioralThreat,
          anomaly: anomalyThreat,
          ml: mlThreat,
          contextual: contextualThreat,
        }
      );

      return threatScore;
    } catch (error) {
      console.error('Threat assessment failed:', error);
      return 0.5; // Default to medium threat on error
    }
  }

  private async assessPatternThreat(request: SecureAIRequest): Promise<number> {
    let threatScore = 0;
    const content = request.content.toLowerCase();

    // Check for known threat patterns
    for (const [category, patterns] of this.threatPatterns) {
      for (const pattern of patterns) {
        const matches = content.match(pattern);
        if (matches) {
          threatScore += this.getPatternThreatScore(category, matches.length);
        }
      }
    }

    // Check for suspicious combinations
    const combinationThreat = this.assessPatternCombinations(content);
    threatScore += combinationThreat;

    return Math.min(threatScore, 1.0);
  }

  private async assessBehavioralThreat(
    context: SecurityContext
  ): Promise<number> {
    let threatScore = 0;

    // Get or create behavioral profile
    let profile = this.behavioralProfiles.get(context.userId);
    if (!profile) {
      profile = new BehavioralProfile(context.userId);
      this.behavioralProfiles.set(context.userId, profile);
    }

    // Update profile with current activity
    profile.updateActivity(context);

    // Assess behavioral anomalies
    const activityThreat = profile.assessActivityThreat();
    const locationThreat = profile.assessLocationThreat(context);
    const timingThreat = profile.assessTimingThreat(context);
    const deviceThreat = profile.assessDeviceThreat(context);

    threatScore =
      (activityThreat + locationThreat + timingThreat + deviceThreat) / 4;

    return Math.min(threatScore, 1.0);
  }

  private async assessAnomalyThreat(
    request: SecureAIRequest,
    context: SecurityContext
  ): Promise<number> {
    return await this.anomalyDetector.detectAnomalies(request, context);
  }

  private async assessMLThreat(
    request: SecureAIRequest,
    context: SecurityContext
  ): Promise<number> {
    return await this.mlModel.predictThreat(request, context);
  }

  private async assessContextualThreat(
    request: SecureAIRequest,
    context: SecurityContext
  ): Promise<number> {
    let threatScore = 0;

    // Check user risk profile
    if (context.riskProfile.riskScore > 0.7) {
      threatScore += 0.3;
    }

    // Check for suspicious request patterns
    if (request.priority === 'critical' && context.userTier === 'Free') {
      threatScore += 0.2;
    }

    // Check for unusual module access
    if (
      request.targetModule &&
      !this.isModuleAccessAllowed(request.targetModule, context)
    ) {
      threatScore += 0.4;
    }

    // Check for rapid successive requests
    const rapidRequestThreat = this.assessRapidRequestThreat(context);
    threatScore += rapidRequestThreat;

    // Check for unusual content patterns
    const contentPatternThreat = this.assessContentPatternThreat(request);
    threatScore += contentPatternThreat;

    return Math.min(threatScore, 1.0);
  }

  private calculateWeightedThreatScore(threatScores: {
    pattern: number;
    behavioral: number;
    anomaly: number;
    ml: number;
    contextual: number;
  }): number {
    // Weighted scoring based on threat type importance
    const weights = {
      pattern: 0.25, // Known patterns are reliable
      behavioral: 0.2, // User behavior analysis
      anomaly: 0.2, // Statistical anomalies
      ml: 0.25, // Machine learning predictions
      contextual: 0.1, // Context-based assessment
    };

    const weightedScore =
      threatScores.pattern * weights.pattern +
      threatScores.behavioral * weights.behavioral +
      threatScores.anomaly * weights.anomaly +
      threatScores.ml * weights.ml +
      threatScores.contextual * weights.contextual;

    return Math.min(weightedScore, 1.0);
  }

  private getPatternThreatScore(category: string, matchCount: number): number {
    const baseScores = {
      prompt_injection: 0.3,
      script_injection: 0.4,
      sql_injection: 0.35,
      xss: 0.3,
      command_injection: 0.5,
      path_traversal: 0.25,
      sensitive_data: 0.2,
    };

    const baseScore = baseScores[category as keyof typeof baseScores] || 0.1;
    const multiplier = Math.min(matchCount * 0.1, 0.5);

    return baseScore + multiplier;
  }

  private assessPatternCombinations(content: string): number {
    let threatScore = 0;

    // Check for multiple threat patterns in same content
    const threatCategories = Array.from(this.threatPatterns.keys());
    let detectedCategories = 0;

    for (const category of threatCategories) {
      const patterns = this.threatPatterns.get(category);
      if (patterns) {
        for (const pattern of patterns) {
          if (pattern.test(content)) {
            detectedCategories++;
            break;
          }
        }
      }
    }

    // Multiple threat categories indicate higher risk
    if (detectedCategories > 2) {
      threatScore += 0.3;
    } else if (detectedCategories > 1) {
      threatScore += 0.15;
    }

    return threatScore;
  }

  private isModuleAccessAllowed(
    moduleName: string,
    context: SecurityContext
  ): boolean {
    const modulePermissions = {
      emotionArc: ['Free', 'Pro', 'Admin'],
      narrativeDashboard: ['Pro', 'Admin'],
      plotStructure: ['Free', 'Pro', 'Admin'],
      styleProfile: ['Pro', 'Admin'],
      themeAnalysis: ['Admin'],
    };

    const allowedTiers =
      modulePermissions[moduleName as keyof typeof modulePermissions];
    return allowedTiers ? allowedTiers.includes(context.userTier) : false;
  }

  private assessRapidRequestThreat(context: SecurityContext): number {
    // Check for rapid successive requests (potential DoS)
    const recentActivity = context.accessHistory.filter(event => {
      const timeDiff = Date.now() - event.timestamp.getTime();
      return timeDiff < 60000; // Last minute
    });

    if (recentActivity.length > 10) {
      return 0.4; // High threat for rapid requests
    } else if (recentActivity.length > 5) {
      return 0.2; // Medium threat
    }

    return 0;
  }

  private assessContentPatternThreat(request: SecureAIRequest): number {
    let threatScore = 0;
    const content = request.content;

    // Check for unusually long content
    if (content.length > 10000) {
      threatScore += 0.1;
    }

    // Check for repetitive patterns
    const repetitivePatterns = this.detectRepetitivePatterns(content);
    if (repetitivePatterns > 0.7) {
      threatScore += 0.2;
    }

    // Check for encoding attempts
    if (this.detectEncodingAttempts(content)) {
      threatScore += 0.3;
    }

    return Math.min(threatScore, 1.0);
  }

  private detectRepetitivePatterns(content: string): number {
    if (content.length < 100) return 0;

    const words = content.split(/\s+/);
    const wordCounts = new Map<string, number>();

    for (const word of words) {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      if (cleanWord.length > 3) {
        wordCounts.set(cleanWord, (wordCounts.get(cleanWord) || 0) + 1);
      }
    }

    const maxCount = Math.max(...wordCounts.values());
    const totalWords = words.length;

    return maxCount / totalWords;
  }

  private detectEncodingAttempts(content: string): boolean {
    const encodingPatterns = [
      /%[0-9a-fA-F]{2}/g, // URL encoding
      /\\x[0-9a-fA-F]{2}/g, // Hex encoding
      /\\u[0-9a-fA-F]{4}/g, // Unicode encoding
      /base64/i, // Base64 references
      /rot13/i, // ROT13 encoding
    ];

    return encodingPatterns.some(pattern => pattern.test(content));
  }

  private async recordThreatAssessment(
    requestId: string,
    threatScore: number,
    assessmentTime: number,
    componentScores: Record<string, number>
  ): Promise<void> {
    const threatEvent: ThreatEvent = {
      id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      requestId,
      threatScore,
      assessmentTime,
      componentScores,
      timestamp: new Date(),
    };

    this.threatHistory.push(threatEvent);

    // Keep only last 1000 events
    if (this.threatHistory.length > 1000) {
      this.threatHistory = this.threatHistory.slice(-1000);
    }
  }

  private initializeThreatPatterns(): Map<string, RegExp[]> {
    const patterns = new Map<string, RegExp[]>();

    patterns.set('prompt_injection', [
      /ignore\s+previous\s+instructions/gi,
      /forget\s+everything\s+above/gi,
      /you\s+are\s+now\s+a\s+different\s+ai/gi,
      /roleplay\s+as\s+(?:admin|root|system)/gi,
      /execute\s+(?:command|code|script)/gi,
    ]);

    patterns.set('script_injection', [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /eval\s*\(/gi,
      /Function\s*\(/gi,
    ]);

    patterns.set('sql_injection', [
      /(\b(union|select|insert|update|delete|drop|create|alter)\b)/gi,
      /(\b(and|or)\b\s+\d+\s*=\s*\d+)/gi,
      /(\b(and|or)\b\s+['"]\w+['"]\s*=\s*['"]\w+['"])/gi,
      /(\b(and|or)\b\s+\d+\s*=\s*\d+)/gi,
    ]);

    patterns.set('xss', [
      /<iframe\b[^>]*>/gi,
      /<object\b[^>]*>/gi,
      /<embed\b[^>]*>/gi,
      /<form\b[^>]*>/gi,
      /<input\b[^>]*>/gi,
    ]);

    patterns.set('command_injection', [
      /(\b(cat|ls|pwd|whoami|id|uname|ps|netstat|ifconfig|ipconfig)\b)/gi,
      /(\b(rm|del|erase|format|fdisk|mkfs)\b)/gi,
      /(\b(chmod|chown|chgrp|umask)\b)/gi,
    ]);

    patterns.set('path_traversal', [
      /\.\.\//g,
      /\.\.\\/g,
      /\/etc\/passwd/gi,
      /\/proc\/version/gi,
      /\/sys\/class/gi,
    ]);

    patterns.set('sensitive_data', [
      /(\b(password|secret|key|token|api_key|private_key)\s*[:=]\s*['"]?\w+['"]?)/gi,
      /(\b(ssn|credit_card|cc_number|card_number)\s*[:=]\s*['"]?\d+['"]?)/gi,
      /(\b(phone|mobile|tel)\s*[:=]\s*['"]?[\d\-\+\(\)\s]+['"]?)/gi,
    ]);

    return patterns;
  }

  // Public methods
  async getCurrentThreatLevel(): Promise<number> {
    if (this.threatHistory.length === 0) return 0;

    const recentThreats = this.threatHistory.filter(event => {
      const timeDiff = Date.now() - event.timestamp.getTime();
      return timeDiff < 300000; // Last 5 minutes
    });

    if (recentThreats.length === 0) return 0;

    const avgThreat =
      recentThreats.reduce((sum, event) => sum + event.threatScore, 0) /
      recentThreats.length;
    return avgThreat;
  }

  async getThreatHistory(
    duration: '1h' | '24h' | '7d'
  ): Promise<ThreatEvent[]> {
    const now = Date.now();
    let cutoffTime: number;

    switch (duration) {
      case '1h':
        cutoffTime = now - 60 * 60 * 1000;
        break;
      case '24h':
        cutoffTime = now - 24 * 60 * 60 * 1000;
        break;
      case '7d':
        cutoffTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      default:
        cutoffTime = now - 24 * 60 * 60 * 1000;
    }

    return this.threatHistory.filter(
      event => event.timestamp.getTime() > cutoffTime
    );
  }

  async getThreatTrends(): Promise<ThreatTrend[]> {
    const hourlyData = new Map<number, number[]>();

    for (const event of this.threatHistory) {
      const hour = Math.floor(event.timestamp.getTime() / (60 * 60 * 1000));
      if (!hourlyData.has(hour)) {
        hourlyData.set(hour, []);
      }
      hourlyData.get(hour)!.push(event.threatScore);
    }

    const trends: ThreatTrend[] = [];
    for (const [hour, scores] of hourlyData) {
      const avgScore =
        scores.reduce((sum, score) => sum + score, 0) / scores.length;
      trends.push({
        hour: new Date(hour * 60 * 60 * 1000),
        averageThreat: avgScore,
        requestCount: scores.length,
      });
    }

    return trends.sort((a, b) => a.hour.getTime() - b.hour.getTime());
  }
}

// Supporting classes
class BehavioralProfile {
  private userId: string;
  private activityHistory: ActivityEvent[];
  private locationHistory: LocationEvent[];
  private deviceHistory: DeviceEvent[];
  private requestPatterns: RequestPattern[];

  constructor(userId: string) {
    this.userId = userId;
    this.activityHistory = [];
    this.locationHistory = [];
    this.deviceHistory = [];
    this.requestPatterns = [];
  }

  updateActivity(context: SecurityContext): void {
    const activityEvent: ActivityEvent = {
      timestamp: new Date(),
      action: 'ai_request',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      sessionId: context.sessionId,
    };

    this.activityHistory.push(activityEvent);

    // Keep only last 1000 activities
    if (this.activityHistory.length > 1000) {
      this.activityHistory = this.activityHistory.slice(-1000);
    }
  }

  assessActivityThreat(): number {
    if (this.activityHistory.length < 5) return 0;

    const recentActivity = this.activityHistory.slice(-10);
    const timeSpan =
      recentActivity[recentActivity.length - 1].timestamp.getTime() -
      recentActivity[0].timestamp.getTime();
    const requestsPerMinute = (recentActivity.length * 60000) / timeSpan;

    if (requestsPerMinute > 100) return 0.8;
    if (requestsPerMinute > 50) return 0.5;
    if (requestsPerMinute > 20) return 0.2;

    return 0;
  }

  assessLocationThreat(context: SecurityContext): number {
    if (!context.location) return 0;

    // Check for location anomalies
    const recentLocations = this.locationHistory.slice(-5);
    if (recentLocations.length > 0) {
      const lastLocation = recentLocations[recentLocations.length - 1];
      if (lastLocation.country !== context.location.country) {
        return 0.6; // Country change
      }
    }

    return 0;
  }

  assessTimingThreat(context: SecurityContext): number {
    const recentActivity = this.activityHistory.slice(-20);
    if (recentActivity.length < 5) return 0;

    // Check for unusual timing patterns
    const timeGaps: number[] = [];
    for (let i = 1; i < recentActivity.length; i++) {
      const gap =
        recentActivity[i].timestamp.getTime() -
        recentActivity[i - 1].timestamp.getTime();
      timeGaps.push(gap);
    }

    const avgGap =
      timeGaps.reduce((sum, gap) => sum + gap, 0) / timeGaps.length;
    const suspiciousGaps = timeGaps.filter(gap => gap < avgGap * 0.1).length;

    if (suspiciousGaps > timeGaps.length * 0.3) return 0.4;
    return 0;
  }

  assessDeviceThreat(context: SecurityContext): number {
    const recentDevices = this.deviceHistory.slice(-5);
    if (recentDevices.length > 0) {
      const lastDevice = recentDevices[recentDevices.length - 1];
      if (lastDevice.fingerprint !== context.deviceFingerprint) {
        return 0.3; // Device change
      }
    }

    return 0;
  }
}

class AnomalyDetector {
  async detectAnomalies(
    request: SecureAIRequest,
    context: SecurityContext
  ): Promise<number> {
    // Implement statistical anomaly detection
    // This would use statistical methods to detect unusual patterns

    let anomalyScore = 0;

    // Check for unusual request sizes
    const requestSize = request.content.length;
    if (requestSize > 5000) anomalyScore += 0.2;

    // Check for unusual timing
    const now = Date.now();
    const timeOfDay = new Date(now).getHours();
    if (timeOfDay < 6 || timeOfDay > 22) anomalyScore += 0.1;

    // Check for unusual user agent patterns
    if (this.isUnusualUserAgent(context.userAgent)) {
      anomalyScore += 0.3;
    }

    return Math.min(anomalyScore, 1.0);
  }

  private isUnusualUserAgent(userAgent: string): boolean {
    const unusualPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
    ];

    return unusualPatterns.some(pattern => pattern.test(userAgent));
  }
}

class MLThreatModel {
  async predictThreat(
    request: SecureAIRequest,
    context: SecurityContext
  ): Promise<number> {
    // This would integrate with a trained ML model
    // For now, return a basic heuristic score

    let threatScore = 0;

    // Content-based features
    if (request.content.length > 10000) threatScore += 0.2;
    if (request.content.includes('admin')) threatScore += 0.1;
    if (request.content.includes('root')) threatScore += 0.1;

    // Context-based features
    if (context.riskProfile.riskScore > 0.7) threatScore += 0.3;
    if (context.userTier === 'Free' && request.priority === 'critical')
      threatScore += 0.2;

    return Math.min(threatScore, 1.0);
  }
}

// Types
interface ThreatEvent {
  id: string;
  requestId: string;
  threatScore: number;
  assessmentTime: number;
  componentScores: Record<string, number>;
  timestamp: Date;
}

interface ThreatTrend {
  hour: Date;
  averageThreat: number;
  requestCount: number;
}

interface ActivityEvent {
  timestamp: Date;
  action: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
}

interface LocationEvent {
  timestamp: Date;
  country: string;
  region: string;
  city: string;
}

interface DeviceEvent {
  timestamp: Date;
  fingerprint: string;
  userAgent: string;
}

interface RequestPattern {
  pattern: string;
  frequency: number;
  lastSeen: Date;
}
