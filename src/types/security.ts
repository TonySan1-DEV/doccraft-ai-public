// Enterprise Security Types for DocCraft-AI
// Comprehensive security interfaces for zero-trust architecture

export interface SecurityContext {
  userId: string;
  userTier: 'Free' | 'Pro' | 'Admin';
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  accessHistory: AccessEvent[];
  riskProfile: RiskProfile;
  permissions: string[];
  lastActivity: Date;
  deviceFingerprint: string;
  location?: {
    country: string;
    region: string;
    city: string;
  };
}

export interface AccessEvent {
  id: string;
  timestamp: Date;
  action: string;
  resource: string;
  success: boolean;
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, unknown>;
}

export interface RiskProfile {
  riskScore: number; // 0-1 scale
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  suspiciousPatterns: string[];
  failedAttempts: number;
  lastViolation?: Date;
  riskFactors: RiskFactor[];
}

export interface RiskFactor {
  type: 'authentication' | 'behavior' | 'content' | 'network' | 'device';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  score: number;
  timestamp: Date;
}

export interface SecureAIRequest {
  id: string;
  content: string;
  targetModule?: string;
  characterData?: CharacterData;
  context: SecurityContext;
  timestamp: Date;
  priority: 'low' | 'normal' | 'high' | 'critical';
  metadata: Record<string, unknown>;
}

export interface SecureAIResponse {
  content: string;
  confidence: number;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cached: boolean;
  securityLevel: 'validated' | 'filtered' | 'blocked';
  requestId: string;
  securityMetadata: SecurityMetadata;
}

export interface SecurityMetadata {
  validationScore: number;
  threatScore: number;
  encryptionLevel: string;
  auditTrail: string[];
  complianceStatus: ComplianceStatus;
}

export interface ComplianceStatus {
  gdpr: boolean;
  ccpa: boolean;
  hipaa: boolean;
  sox: boolean;
  iso27001: boolean;
  lastAudit: Date;
}

export interface ValidationResult {
  passed: boolean;
  score: number; // 0-1 scale
  violations: ValidationViolation[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface ValidationViolation {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  line?: number;
  column?: number;
  suggestion?: string;
}

export interface ValidationCheck {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  passed: boolean;
  score: number;
  details?: Record<string, unknown>;
}

export interface AIInput {
  content: string;
  targetModule?: string;
  characterData?: CharacterData;
  userId: string;
  sessionId: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
}

export interface CharacterData {
  id: string;
  name: string;
  description: string;
  personality: Record<string, unknown>;
  background: string;
  relationships: CharacterRelationship[];
  sensitiveFields?: Record<string, unknown>;
}

export interface CharacterRelationship {
  characterId: string;
  relationshipType: 'friend' | 'enemy' | 'family' | 'romantic' | 'mentor';
  description: string;
}

export interface ProtectedCharacterData extends CharacterData {
  metadata: {
    userId: string;
    createdAt: Date;
    lastModified: Date;
    accessLevel: 'private' | 'shared' | 'public';
    encryptionLevel: string;
  };
  accessControl: {
    owner: string;
    sharedWith: string[];
    permissions: string[];
    accessHistory: AccessEvent[];
    securityLevel: 'low' | 'medium' | 'high';
  };
}

export interface AIOperation {
  type: string;
  module: string;
  userId: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
}

export interface AIResult {
  content: string;
  qualityScore: number;
  userFeedback?: {
    rating: number;
    comment?: string;
  };
  metadata: Record<string, unknown>;
}

export interface PerformanceMetrics {
  responseTime: number;
  cacheHit: boolean;
  tokenUsage: number;
  securityLevel: string;
  threatScore: number;
  metadata: Record<string, unknown>;
}

export interface SecurityMetrics {
  threatLevel: number; // 0-1 scale
  validationAccuracy: number;
  responseTime: number;
  blockedAttacks: number;
  falsePositives: number;
  encryptionCoverage: number; // % of sensitive data encrypted
  complianceScore: number;
  lastUpdated: Date;
}

export interface AlertThresholds {
  responseTime: number;
  threatScore: number;
  errorRate: number;
  securityViolations: number;
  performanceDegradation: number;
}

export interface SecurityError extends Error {
  code: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: SecurityContext;
  timestamp: Date;
  requestId?: string;
}

export interface ModuleName {
  emotionArc: 'emotionArc';
  narrativeDashboard: 'narrativeDashboard';
  plotStructure: 'plotStructure';
  styleProfile: 'styleProfile';
  themeAnalysis: 'themeAnalysis';
}

export type ModuleNameType = keyof ModuleName;

export interface SecurityRule {
  id: string;
  name: string;
  description: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'block' | 'flag' | 'log' | 'sanitize';
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RateLimiter {
  userId: string;
  userTier: string;
  requests: number;
  windowStart: Date;
  limit: number;
  window: number; // milliseconds
}

export interface ThreatDetectionResult {
  threatLevel: number; // 0-1 scale
  confidence: number;
  detectedThreats: string[];
  riskFactors: RiskFactor[];
  recommendations: string[];
  timestamp: Date;
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  success: boolean;
  securityLevel: string;
  threatScore: number;
  metadata: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
}

export interface EncryptionService {
  algorithm: string;
  keySize: number;
  mode: string;
  padding: string;
}

export interface AccessMonitor {
  userId: string;
  resourceId: string;
  accessType: 'read' | 'write' | 'delete' | 'create';
  timestamp: Date;
  success: boolean;
  metadata: Record<string, unknown>;
}

export interface MLThreatDetector {
  modelVersion: string;
  confidence: number;
  falsePositiveRate: number;
  lastTraining: Date;
  features: string[];
}

export interface RealtimeStream {
  id: string;
  metric: string;
  subscribers: number;
  lastUpdate: Date;
  data: unknown[];
}

export interface MetricTimeSeries {
  metric: string;
  data: Array<{
    timestamp: Date;
    value: number;
    metadata: Record<string, unknown>;
  }>;
  aggregation: 'min' | 'max' | 'avg' | 'sum' | 'count';
}

export interface DashboardMetrics {
  [key: string]: {
    current: number;
    trend: 'up' | 'down' | 'stable';
    history: number[];
    target: number;
    critical: boolean;
  };
}

export interface RealtimeData {
  [key: string]: number;
}

export interface Alert {
  id: string;
  type: 'security' | 'performance' | 'error' | 'warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  metadata: Record<string, unknown>;
}

export interface SecurityStatusIndicator {
  level: 'secure' | 'warning' | 'danger' | 'critical';
  message: string;
  lastUpdate: Date;
}

export interface PerformanceStatusIndicator {
  metrics: RealtimeData;
  status: 'optimal' | 'degraded' | 'critical';
  lastUpdate: Date;
}
