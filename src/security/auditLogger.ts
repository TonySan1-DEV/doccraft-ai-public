// Enterprise Audit Logger for DocCraft-AI
// Comprehensive security event logging and compliance reporting

import { SupabaseClient } from '@supabase/supabase-js';
import {
  AuditLogEntry,
  SecurityContext,
  SecurityMetrics,
  ComplianceStatus,
} from '../types/security';

export class AuditLogger {
  private supabase: SupabaseClient;
  private logBuffer: AuditLogEntry[];
  private bufferSize: number;
  private flushInterval: number;
  private flushTimer: NodeJS.Timeout | null;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
    this.logBuffer = [];
    this.bufferSize = 100; // Flush when buffer reaches 100 entries
    this.flushInterval = 30000; // Flush every 30 seconds
    this.flushTimer = null;

    this.startPeriodicFlush();
  }

  async logSecurityViolation(violation: {
    requestId: string;
    userId: string;
    timestamp: Date;
    violations: any[];
    riskLevel: string;
    ipAddress: string;
    userAgent: string;
  }): Promise<void> {
    const auditEntry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: violation.timestamp,
      userId: violation.userId,
      action: 'security_violation',
      resource: 'ai_gateway',
      success: false,
      securityLevel: 'high',
      threatScore: this.calculateThreatScore(violation.violations),
      metadata: {
        requestId: violation.requestId,
        violations: violation.violations,
        riskLevel: violation.riskLevel,
        violationCount: violation.violations.length,
      },
      ipAddress: violation.ipAddress,
      userAgent: violation.userAgent,
      sessionId: `session_${violation.userId}`,
    };

    await this.logEntry(auditEntry);
  }

  async logHighThreat(threat: {
    requestId: string;
    userId: string;
    threatLevel: number;
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
    metadata: any;
  }): Promise<void> {
    const auditEntry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: threat.timestamp,
      userId: threat.userId,
      action: 'high_threat_detected',
      resource: 'ai_gateway',
      success: false,
      securityLevel: 'critical',
      threatScore: threat.threatLevel,
      metadata: {
        requestId: threat.requestId,
        threatLevel: threat.threatLevel,
        ...threat.metadata,
      },
      ipAddress: threat.ipAddress,
      userAgent: threat.userAgent,
      sessionId: `session_${threat.userId}`,
    };

    await this.logEntry(auditEntry);
  }

  async logSecurityError(error: AuditLogEntry): Promise<void> {
    await this.logEntry(error);
  }

  async logAIAccess(
    userId: string,
    action: string,
    resource: string,
    success: boolean,
    metadata: Record<string, unknown>
  ): Promise<void> {
    const auditEntry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      userId,
      action,
      resource,
      success,
      securityLevel: success ? 'low' : 'medium',
      threatScore: success ? 0 : 0.3,
      metadata,
      ipAddress: 'unknown',
      userAgent: 'unknown',
      sessionId: `session_${userId}`,
    };

    await this.logEntry(auditEntry);
  }

  async logUserActivity(
    userId: string,
    action: string,
    resource: string,
    success: boolean,
    context: SecurityContext
  ): Promise<void> {
    const auditEntry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      userId,
      action,
      resource,
      success,
      securityLevel: this.assessSecurityLevel(action, success),
      threatScore: context.riskProfile.riskScore,
      metadata: {
        userTier: context.userTier,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        deviceFingerprint: context.deviceFingerprint,
        location: context.location,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      sessionId: context.sessionId,
    };

    await this.logEntry(auditEntry);
  }

  async logComplianceEvent(
    eventType: string,
    userId: string,
    details: Record<string, unknown>
  ): Promise<void> {
    const auditEntry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      userId,
      action: `compliance_${eventType}`,
      resource: 'compliance_system',
      success: true,
      securityLevel: 'low',
      threatScore: 0,
      metadata: {
        complianceEvent: eventType,
        ...details,
      },
      ipAddress: 'system',
      userAgent: 'system',
      sessionId: 'system',
    };

    await this.logEntry(auditEntry);
  }

  private async logEntry(entry: AuditLogEntry): Promise<void> {
    // Add to buffer
    this.logBuffer.push(entry);

    // Flush if buffer is full
    if (this.logBuffer.length >= this.bufferSize) {
      await this.flushBuffer();
    }
  }

  private async flushBuffer(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    try {
      const entriesToFlush = [...this.logBuffer];
      this.logBuffer = [];

      // Batch insert into database
      const { error } = await this.supabase.from('audit_logs').insert(
        entriesToFlush.map(entry => ({
          id: entry.id,
          timestamp: entry.timestamp.toISOString(),
          user_id: entry.userId,
          action: entry.action,
          resource: entry.resource,
          success: entry.success,
          security_level: entry.securityLevel,
          threat_score: entry.threatScore,
          metadata: entry.metadata,
          ip_address: entry.ipAddress,
          user_agent: entry.userAgent,
          session_id: entry.sessionId,
        }))
      );

      if (error) {
        console.error('Failed to flush audit log buffer:', error);
        // Re-add entries to buffer for retry
        this.logBuffer.unshift(...entriesToFlush);
      }
    } catch (error) {
      console.error('Error flushing audit log buffer:', error);
      // Re-add entries to buffer for retry
      this.logBuffer.unshift(...this.logBuffer);
    }
  }

  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flushBuffer();
    }, this.flushInterval);
  }

  private calculateThreatScore(violations: any[]): number {
    let totalScore = 0;

    for (const violation of violations) {
      switch (violation.severity) {
        case 'critical':
          totalScore += 0.4;
          break;
        case 'high':
          totalScore += 0.2;
          break;
        case 'medium':
          totalScore += 0.1;
          break;
        case 'low':
          totalScore += 0.05;
          break;
      }
    }

    return Math.min(totalScore, 1.0);
  }

  private assessSecurityLevel(action: string, success: boolean): string {
    if (!success) return 'medium';

    const highSecurityActions = [
      'admin_access',
      'user_creation',
      'permission_change',
      'system_config',
      'data_export',
    ];

    return highSecurityActions.includes(action) ? 'high' : 'low';
  }

  // Public methods for external access
  async generateComplianceReport(
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<ComplianceReport> {
    try {
      let query = this.supabase
        .from('audit_logs')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: auditLogs, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch audit logs: ${error.message}`);
      }

      return this.analyzeCompliance(auditLogs || []);
    } catch (error) {
      console.error('Failed to generate compliance report:', error);
      throw error;
    }
  }

  private analyzeCompliance(auditLogs: any[]): ComplianceReport {
    const totalEvents = auditLogs.length;
    const securityViolations = auditLogs.filter(
      log =>
        log.action === 'security_violation' ||
        log.action === 'high_threat_detected'
    ).length;

    const highThreatEvents = auditLogs.filter(
      log => log.threat_score > 0.7
    ).length;

    const userActivity = auditLogs.filter(
      log => log.action.startsWith('user_') || log.action.startsWith('ai_')
    ).length;

    const complianceScore = this.calculateComplianceScore(auditLogs);

    return {
      period: {
        start: new Date(
          Math.min(...auditLogs.map(log => new Date(log.timestamp).getTime()))
        ),
        end: new Date(
          Math.max(...auditLogs.map(log => new Date(log.timestamp).getTime()))
        ),
      },
      summary: {
        totalEvents,
        securityViolations,
        highThreatEvents,
        userActivity,
        complianceScore,
      },
      details: {
        eventsByAction: this.groupEventsByAction(auditLogs),
        eventsByUser: this.groupEventsByUser(auditLogs),
        threatScoreDistribution:
          this.calculateThreatScoreDistribution(auditLogs),
        securityLevelBreakdown: this.calculateSecurityLevelBreakdown(auditLogs),
      },
      recommendations: this.generateComplianceRecommendations(auditLogs),
    };
  }

  private calculateComplianceScore(auditLogs: any[]): number {
    if (auditLogs.length === 0) return 100;

    let score = 100;

    // Deduct points for security violations
    const violations = auditLogs.filter(
      log =>
        log.action === 'security_violation' ||
        log.action === 'high_threat_detected'
    );
    score -= violations.length * 5;

    // Deduct points for high threat events
    const highThreat = auditLogs.filter(log => log.threat_score > 0.7);
    score -= highThreat.length * 3;

    // Deduct points for failed actions
    const failedActions = auditLogs.filter(log => !log.success);
    score -= failedActions.length * 2;

    return Math.max(score, 0);
  }

  private groupEventsByAction(auditLogs: any[]): Record<string, number> {
    const grouped: Record<string, number> = {};

    for (const log of auditLogs) {
      grouped[log.action] = (grouped[log.action] || 0) + 1;
    }

    return grouped;
  }

  private groupEventsByUser(auditLogs: any[]): Record<string, number> {
    const grouped: Record<string, number> = {};

    for (const log of auditLogs) {
      grouped[log.user_id] = (grouped[log.user_id] || 0) + 1;
    }

    return grouped;
  }

  private calculateThreatScoreDistribution(
    auditLogs: any[]
  ): Record<string, number> {
    const distribution: Record<string, number> = {
      low: 0, // 0-0.3
      medium: 0, // 0.3-0.7
      high: 0, // 0.7-1.0
      critical: 0, // >0.9
    };

    for (const log of auditLogs) {
      const threatScore = log.threat_score || 0;

      if (threatScore <= 0.3) {
        distribution.low++;
      } else if (threatScore <= 0.7) {
        distribution.medium++;
      } else if (threatScore <= 0.9) {
        distribution.high++;
      } else {
        distribution.critical++;
      }
    }

    return distribution;
  }

  private calculateSecurityLevelBreakdown(
    auditLogs: any[]
  ): Record<string, number> {
    const breakdown: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    for (const log of auditLogs) {
      const level = log.security_level || 'low';
      breakdown[level] = (breakdown[level] || 0) + 1;
    }

    return breakdown;
  }

  private generateComplianceRecommendations(auditLogs: any[]): string[] {
    const recommendations: string[] = [];

    const highThreatCount = auditLogs.filter(
      log => log.threat_score > 0.7
    ).length;
    if (highThreatCount > 10) {
      recommendations.push(
        'High number of high-threat events detected. Review security policies and threat detection thresholds.'
      );
    }

    const violationCount = auditLogs.filter(
      log => log.action === 'security_violation'
    ).length;
    if (violationCount > 20) {
      recommendations.push(
        'Frequent security violations detected. Consider implementing additional input validation and user training.'
      );
    }

    const failedActions = auditLogs.filter(log => !log.success).length;
    if (failedActions > auditLogs.length * 0.1) {
      recommendations.push(
        'High failure rate detected. Review system configuration and user permissions.'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        'System appears to be operating within normal compliance parameters.'
      );
    }

    return recommendations;
  }

  async getAuditLogs(
    filters: {
      userId?: string;
      action?: string;
      resource?: string;
      startDate?: Date;
      endDate?: Date;
      securityLevel?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ logs: AuditLogEntry[]; total: number }> {
    try {
      let query = this.supabase
        .from('audit_logs')
        .select('*', { count: 'exact' });

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.action) {
        query = query.eq('action', filters.action);
      }

      if (filters.resource) {
        query = query.eq('resource', filters.resource);
      }

      if (filters.startDate) {
        query = query.gte('timestamp', filters.startDate.toISOString());
      }

      if (filters.endDate) {
        query = query.lte('timestamp', filters.endDate.toISOString());
      }

      if (filters.securityLevel) {
        query = query.eq('security_level', filters.securityLevel);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 100) - 1
        );
      }

      const { data: logs, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch audit logs: ${error.message}`);
      }

      return {
        logs: (logs || []).map(this.mapDatabaseToAuditLog),
        total: count || 0,
      };
    } catch (error) {
      console.error('Failed to get audit logs:', error);
      throw error;
    }
  }

  private mapDatabaseToAuditLog(dbLog: any): AuditLogEntry {
    return {
      id: dbLog.id,
      timestamp: new Date(dbLog.timestamp),
      userId: dbLog.user_id,
      action: dbLog.action,
      resource: dbLog.resource,
      success: dbLog.success,
      securityLevel: dbLog.security_level,
      threatScore: dbLog.threat_score,
      metadata: dbLog.metadata,
      ipAddress: dbLog.ip_address,
      userAgent: dbLog.user_agent,
      sessionId: dbLog.session_id,
    };
  }

  // Cleanup method
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // Final flush
    this.flushBuffer();
  }
}

// Types
interface ComplianceReport {
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalEvents: number;
    securityViolations: number;
    highThreatEvents: number;
    userActivity: number;
    complianceScore: number;
  };
  details: {
    eventsByAction: Record<string, number>;
    eventsByUser: Record<string, number>;
    threatScoreDistribution: Record<string, number>;
    securityLevelBreakdown: Record<string, number>;
  };
  recommendations: string[];
}
