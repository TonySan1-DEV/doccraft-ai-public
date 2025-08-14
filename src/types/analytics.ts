// Enterprise Analytics and Business Intelligence Types
// Comprehensive type definitions for real-time performance monitoring and business insights

export type TimeFrame =
  | '1h'
  | '6h'
  | '24h'
  | '7d'
  | '30d'
  | '90d'
  | '1y'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly';

export interface DashboardData {
  modulePerformance: ModulePerformanceReport;
  userSatisfaction: UserSatisfactionMetrics;
  qualityMetrics: QualityMetrics;
  responseTimeTrend: TrendData;
  coordinationTrend: TrendData;
  cacheHitTrend: TrendData;
  securityTrend: TrendData;
  sessionAnalytics: SessionAnalytics;
  conversionMetrics: ConversionMetrics;
  retentionMetrics: RetentionMetrics;
  securityMetrics: SecurityMetrics;
  securityViolations: SecurityViolation[];
  protectionMetrics: ProtectionMetrics;
}

export interface RealtimeMetrics {
  avgResponseTime: number;
  coordinationTime: number;
  cacheHitRate: number;
  securityScore: number;
  activeUsers: number;
  requestVolume: number;
  errorRate: number;
  throughput: number;
  latency: number;
  availability: number;
}

export interface BusinessInsights {
  revenue: RevenueMetrics;
  userMetrics: UserMetrics;
  featureAdoption: FeatureMetrics;
  predictions: PredictiveInsights;
  recommendations: BusinessRecommendation[];
  competitive: CompetitiveAnalysis;
  timestamp: Date;
}

export interface RevenueMetrics {
  totalRevenue: number;
  revenuePerUser: number;
  conversionRate: number;
  churnRate: number;
  ltv: number; // Lifetime Value
  mrr: number; // Monthly Recurring Revenue
  growth: number;
  current: number; // Current revenue
  revenueByModule: Record<string, number>;
  revenueByUserSegment: Record<string, number>;
}

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  userEngagement: number;
  sessionDuration: number;
  pagesPerSession: number;
  userSegments: UserSegment[];
  userBehavior: UserBehaviorMetrics;
}

export interface FeatureMetrics {
  featureUsage: Record<string, number>;
  featureAdoption: Record<string, number>;
  featureSatisfaction: Record<string, number>;
  featureRetention: Record<string, number>;
  popularFeatures: string[];
  underutilizedFeatures: string[];
}

export interface PredictiveInsights {
  userChurnRisk: ChurnPrediction[];
  revenueForecast: RevenueForecast;
  featureAdoptionPredictions: FeatureAdoptionPrediction[];
  scalingRecommendations: ScalingRecommendation[];
  marketTrends: MarketTrend[];
  seasonalPatterns: SeasonalPattern[];
}

export interface BusinessRecommendation {
  id: string;
  type: 'optimization' | 'scaling' | 'feature' | 'security' | 'revenue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: {
    revenue: number;
    users: number;
    performance: number;
  };
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  status: 'pending' | 'approved' | 'in-progress' | 'completed';
}

export interface CompetitiveAnalysis {
  marketPosition: string;
  competitiveAdvantages: string[];
  competitiveThreats: string[];
  marketShare: number;
  competitorBenchmarks: CompetitorBenchmark[];
  differentiationFactors: string[];
}

export interface ModulePerformanceReport {
  moduleAnalysis: ModuleAnalysis[];
  crossModuleInsights: CrossModuleInsights;
  optimizationOpportunities: OptimizationOpportunity[];
  overallPerformance: OverallPerformanceScore;
  recommendations: ModuleRecommendation[];
}

export interface ModuleAnalysis {
  moduleName: string;
  performance: ModulePerformanceMetrics;
  usage: ModuleUsageMetrics;
  business: ModuleBusinessMetrics;
}

export interface ModulePerformanceMetrics {
  responseTime: number;
  qualityScore: number;
  userSatisfaction: number;
  errorRate: number;
  cacheEfficiency: number;
  availability: number;
  throughput: number;
}

export interface ModuleUsageMetrics {
  requestVolume: number;
  activeUsers: number;
  popularFeatures: string[];
  usagePatterns: UsagePattern[];
  peakUsageTimes: TimeRange[];
}

export interface ModuleBusinessMetrics {
  revenueImpact: number;
  conversionContribution: number;
  retentionImpact: number;
  costPerRequest: number;
  roi: number;
}

export interface CrossModuleInsights {
  moduleInteractions: ModuleInteraction[];
  dependencyGraph: ModuleDependency[];
  coordinationEfficiency: number;
  bottlenecks: string[];
  optimizationOpportunities: string[];
}

export interface OptimizationOpportunity {
  id: string;
  module: string;
  type: 'performance' | 'scaling' | 'cost' | 'user-experience';
  description: string;
  impact: number;
  effort: number;
  priority: number;
  estimatedSavings: number;
}

export interface OverallPerformanceScore {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: PerformanceBreakdown;
  trend: 'improving' | 'stable' | 'declining';
}

export interface PerformanceBreakdown {
  performance: number;
  reliability: number;
  efficiency: number;
  userExperience: number;
  security: number;
}

export interface ModuleRecommendation {
  module: string;
  action: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
  effort: string;
  timeline: string;
}

export interface UserSatisfactionMetrics {
  overallSatisfaction: number;
  satisfactionByModule: Record<string, number>;
  satisfactionByUserType: Record<string, number>;
  satisfactionTrend: TrendData;
  feedbackAnalysis: FeedbackAnalysis;
}

export interface QualityMetrics {
  overallQuality: number;
  qualityByModule: Record<string, number>;
  qualityTrend: TrendData;
  qualityFactors: QualityFactor[];
}

export interface TrendData {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  direction: 'up' | 'down' | 'stable';
  data: Array<{ timestamp: number; value: number }>;
}

export interface SessionAnalytics {
  totalSessions: number;
  averageSessionDuration: number;
  sessionDepth: number;
  bounceRate: number;
  sessionByDevice: Record<string, number>;
  sessionByLocation: Record<string, number>;
}

export interface ConversionMetrics {
  conversionRate: number;
  conversionByModule: Record<string, number>;
  conversionByUserSegment: Record<string, number>;
  conversionFunnel: ConversionFunnelStep[];
}

export interface RetentionMetrics {
  retentionRate: number;
  retentionByCohort: Record<string, number>;
  retentionByModule: Record<string, number>;
  churnAnalysis: ChurnAnalysis;
}

export interface SecurityMetrics {
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  blockedAttacks: number;
  falsePositives: number;
  encryptionCoverage: number;
  complianceScore: number;
  vulnerabilityCount: number;
}

export interface SecurityViolation {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  module: string;
  user: string;
  resolved: boolean;
}

export interface ProtectionMetrics {
  firewallEffectiveness: number;
  intrusionDetection: number;
  dataProtection: number;
  accessControl: number;
  monitoringCoverage: number;
}

export interface AlertData {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  module: string;
  status: 'active' | 'acknowledged' | 'resolved';
  data?: any;
}

// Supporting interfaces
export interface UserSegment {
  name: string;
  count: number;
  characteristics: Record<string, any>;
}

export interface UserBehaviorMetrics {
  averageSessionTime: number;
  featureUsagePattern: Record<string, number>;
  navigationPattern: string[];
  engagementScore: number;
}

export interface UsagePattern {
  timeOfDay: string;
  dayOfWeek: string;
  frequency: number;
  duration: number;
}

export interface TimeRange {
  start: string;
  end: string;
  frequency: number;
}

export interface ModuleInteraction {
  from: string;
  to: string;
  frequency: number;
  latency: number;
  successRate: number;
}

export interface ModuleDependency {
  module: string;
  dependencies: string[];
  criticality: 'low' | 'medium' | 'high' | 'critical';
}

export interface FeedbackAnalysis {
  positiveFeedback: number;
  negativeFeedback: number;
  neutralFeedback: number;
  commonIssues: string[];
  improvementSuggestions: string[];
}

export interface QualityFactor {
  name: string;
  score: number;
  weight: number;
  impact: string;
}

export interface ConversionFunnelStep {
  step: string;
  users: number;
  conversionRate: number;
  dropoffRate: number;
}

export interface ChurnAnalysis {
  churnRate: number;
  churnReasons: Record<string, number>;
  churnBySegment: Record<string, number>;
  retentionStrategies: string[];
}

export interface ChurnPrediction {
  userId: string;
  riskScore: number;
  riskFactors: string[];
  predictedChurnDate: Date;
  confidence: number;
}

export interface RevenueForecast {
  nextMonth: number;
  nextQuarter: number;
  nextYear: number;
  confidence: number;
  factors: string[];
}

export interface FeatureAdoptionPrediction {
  feature: string;
  predictedAdoption: number;
  timeline: string;
  confidence: number;
  factors: string[];
}

export interface ScalingRecommendation {
  component: string;
  currentCapacity: number;
  recommendedCapacity: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  estimatedCost: number;
  benefits: string[];
}

export interface MarketTrend {
  name: string;
  direction: 'up' | 'down' | 'stable';
  magnitude: number;
  impact: string;
  timeline: string;
}

export interface SeasonalPattern {
  pattern: string;
  season: string;
  impact: number;
  recommendations: string[];
}

export interface CompetitorBenchmark {
  competitor: string;
  metric: string;
  theirValue: number;
  ourValue: number;
  difference: number;
  advantage: 'us' | 'them' | 'neutral';
}

// Dashboard Component Types
export interface PerformanceMetricCard {
  title: string;
  value: number;
  target: number;
  unit: string;
  trend: {
    changePercent?: number;
    direction?: 'up' | 'down' | 'stable';
  };
  critical?: boolean;
  drill?: () => void;
  icon?: React.ReactNode;
}
