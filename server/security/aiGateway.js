// Server-side AI Security Gateway for DocCraft-AI
// Express.js integration with enterprise-grade security

const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

class AISecurityGateway {
  constructor(config) {
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    this.app = express();
    this.securityMiddleware = new SecurityMiddleware();
    this.rateLimiters = new Map();
    this.threatDetector = new ThreatDetector();
    this.auditLogger = new AuditLogger(this.supabase);

    this.setupMiddleware();
    this.setupRoutes();
    this.setupSecurityPolicies();
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
          },
        },
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        },
      })
    );

    // CORS configuration
    this.app.use(
      cors({
        origin: this.config.allowedOrigins || ['http://localhost:3000'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      })
    );

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use(this.logRequest.bind(this));

    // Security validation
    this.app.use(this.validateRequest.bind(this));
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // AI request endpoint
    this.app.post(
      '/ai/request',
      this.rateLimitMiddleware.bind(this),
      this.authenticateRequest.bind(this),
      this.validateAIInput.bind(this),
      this.processAIRequest.bind(this)
    );

    // Security metrics endpoint
    this.app.get(
      '/security/metrics',
      this.authenticateAdmin.bind(this),
      this.getSecurityMetrics.bind(this)
    );

    // Audit logs endpoint
    this.app.get(
      '/security/audit',
      this.authenticateAdmin.bind(this),
      this.getAuditLogs.bind(this)
    );

    // Character data protection endpoints
    this.app.post(
      '/character/protect',
      this.authenticateRequest.bind(this),
      this.protectCharacterData.bind(this)
    );

    this.app.post(
      '/character/decrypt',
      this.authenticateRequest.bind(this),
      this.decryptCharacterData.bind(this)
    );

    // Error handling middleware
    this.app.use(this.errorHandler.bind(this));
  }

  setupSecurityPolicies() {
    // Rate limiting policies
    this.rateLimitPolicies = {
      Free: { windowMs: 60 * 60 * 1000, max: 100, burst: 10 },
      Pro: { windowMs: 60 * 60 * 1000, max: 500, burst: 50 },
      Admin: { windowMs: 60 * 60 * 1000, max: 2000, burst: 200 },
    };

    // Security rules
    this.securityRules = [
      {
        name: 'SQL Injection Prevention',
        pattern:
          /(\b(union|select|insert|update|delete|drop|create|alter)\b)/gi,
        action: 'block',
        severity: 'critical',
      },
      {
        name: 'XSS Prevention',
        pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        action: 'block',
        severity: 'critical',
      },
      {
        name: 'Command Injection Prevention',
        pattern:
          /(\b(cat|ls|pwd|whoami|id|uname|ps|netstat|ifconfig|ipconfig)\b)/gi,
        action: 'block',
        severity: 'critical',
      },
    ];
  }

  // Middleware functions
  async logRequest(req, res, next) {
    const startTime = Date.now();

    // Log request details
    const requestLog = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || 'anonymous',
      userTier: req.user?.tier || 'Free',
    };

    console.log('Request:', requestLog);

    // Add response time logging
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      console.log(
        `Response: ${req.method} ${req.url} - ${res.statusCode} (${responseTime}ms)`
      );

      // Log to audit system
      this.auditLogger.logRequest({
        ...requestLog,
        responseTime,
        statusCode: res.statusCode,
        success: res.statusCode < 400,
      });
    });

    next();
  }

  async validateRequest(req, res, next) {
    try {
      // Basic request validation
      if (
        req.method === 'POST' &&
        (!req.body || Object.keys(req.body).length === 0)
      ) {
        return res.status(400).json({ error: 'Request body is required' });
      }

      // Content type validation
      if (
        req.method === 'POST' &&
        req.get('Content-Type') !== 'application/json'
      ) {
        return res
          .status(400)
          .json({ error: 'Content-Type must be application/json' });
      }

      // Request size validation
      const contentLength = req.get('Content-Length');
      if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
        // 10MB limit
        return res.status(413).json({ error: 'Request too large' });
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  rateLimitMiddleware(req, res, next) {
    const userTier = req.user?.tier || 'Free';
    const policy = this.rateLimitPolicies[userTier];

    if (!policy) {
      return res.status(500).json({ error: 'Invalid user tier' });
    }

    const limiter = rateLimit({
      windowMs: policy.windowMs,
      max: policy.max,
      message: { error: 'Rate limit exceeded' },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: req => req.user?.id || req.ip,
      skip: req => req.user?.tier === 'Admin',
    });

    limiter(req, res, next);
  }

  async authenticateRequest(req, res, next) {
    try {
      const authHeader = req.get('Authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization header required' });
      }

      const token = authHeader.substring(7);

      // Validate JWT token
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Get user profile
      const { data: profile, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        return res.status(401).json({ error: 'User profile not found' });
      }

      // Add user info to request
      req.user = {
        id: user.id,
        email: user.email,
        tier: profile.tier || 'Free',
        permissions: profile.permissions || [],
      };

      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  }

  async authenticateAdmin(req, res, next) {
    if (req.user?.tier !== 'Admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  }

  async validateAIInput(req, res, next) {
    try {
      const { content, targetModule } = req.body;

      if (!content || typeof content !== 'string') {
        return res
          .status(400)
          .json({ error: 'Content is required and must be a string' });
      }

      // Check content length
      if (content.length > this.getMaxContentLength(req.user.tier)) {
        return res
          .status(400)
          .json({ error: 'Content too long for user tier' });
      }

      // Apply security rules
      const securityViolations = this.checkSecurityRules(content);
      if (securityViolations.length > 0) {
        return res.status(400).json({
          error: 'Security violation detected',
          violations: securityViolations,
        });
      }

      // Threat detection
      const threatScore = await this.threatDetector.assessThreat(
        content,
        req.user
      );
      if (threatScore > 0.8) {
        return res.status(403).json({
          error: 'High threat level detected',
          threatScore,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  // Route handlers
  async processAIRequest(req, res) {
    try {
      const { content, targetModule, characterData } = req.body;
      const startTime = Date.now();

      // Create secure request context
      const securityContext = {
        userId: req.user.id,
        userTier: req.user.tier,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date(),
      };

      // Process AI request (this would integrate with your AI services)
      const aiResponse = await this.callAIService(
        content,
        targetModule,
        characterData,
        securityContext
      );

      // Record metrics
      const responseTime = Date.now() - startTime;
      await this.recordAIMetrics(req.user.id, targetModule, responseTime, true);

      // Return response
      res.json({
        success: true,
        data: aiResponse,
        metadata: {
          responseTime,
          securityLevel: 'validated',
          threatScore: 0,
        },
      });
    } catch (error) {
      console.error('AI request processing error:', error);

      // Record error metrics
      await this.recordAIMetrics(req.user.id, req.body.targetModule, 0, false);

      res.status(500).json({
        error: 'AI request processing failed',
        message: error.message,
      });
    }
  }

  async getSecurityMetrics(req, res) {
    try {
      const metrics = await this.getSecurityMetricsData();
      res.json({ success: true, data: metrics });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get security metrics' });
    }
  }

  async getAuditLogs(req, res) {
    try {
      const { startDate, endDate, userId, limit = 100, offset = 0 } = req.query;

      const logs = await this.auditLogger.getAuditLogs({
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        userId,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.json({ success: true, data: logs });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get audit logs' });
    }
  }

  async protectCharacterData(req, res) {
    try {
      const { characterData } = req.body;

      if (!characterData || !characterData.id) {
        return res.status(400).json({ error: 'Character data is required' });
      }

      // Protect character data
      const protectedData =
        await this.characterDataProtection.protectCharacterData(
          characterData,
          req.user.id
        );

      res.json({ success: true, data: protectedData });
    } catch (error) {
      res.status(500).json({ error: 'Failed to protect character data' });
    }
  }

  async decryptCharacterData(req, res) {
    try {
      const { protectedData, requestedFields } = req.body;

      if (!protectedData || !protectedData.id) {
        return res
          .status(400)
          .json({ error: 'Protected character data is required' });
      }

      // Decrypt character data
      const decryptedData =
        await this.characterDataProtection.decryptCharacterData(
          protectedData,
          req.user.id,
          requestedFields
        );

      res.json({ success: true, data: decryptedData });
    } catch (error) {
      res.status(500).json({ error: 'Failed to decrypt character data' });
    }
  }

  // Utility methods
  getMaxContentLength(userTier) {
    const limits = {
      Free: 1000,
      Pro: 5000,
      Admin: 10000,
    };
    return limits[userTier] || 1000;
  }

  checkSecurityRules(content) {
    const violations = [];

    for (const rule of this.securityRules) {
      if (rule.pattern.test(content)) {
        violations.push({
          rule: rule.name,
          severity: rule.severity,
          action: rule.action,
        });
      }
    }

    return violations;
  }

  async callAIService(content, targetModule, characterData, securityContext) {
    // This would integrate with your existing AI services
    // For now, return a placeholder response

    const response = {
      content: `AI response for: ${content.substring(0, 100)}...`,
      confidence: 0.9,
      model: 'gpt-4',
      usage: { totalTokens: 150 },
      cached: false,
    };

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));

    return response;
  }

  async recordAIMetrics(userId, module, responseTime, success) {
    try {
      await this.supabase.from('ai_metrics').insert({
        user_id: userId,
        module: module || 'general',
        response_time: responseTime,
        success,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to record AI metrics:', error);
    }
  }

  async getSecurityMetricsData() {
    try {
      // Get recent security events
      const { data: recentEvents } = await this.supabase
        .from('audit_logs')
        .select('*')
        .gte(
          'timestamp',
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        )
        .order('timestamp', { ascending: false });

      // Calculate metrics
      const totalEvents = recentEvents?.length || 0;
      const securityViolations =
        recentEvents?.filter(
          e =>
            e.action === 'security_violation' ||
            e.action === 'high_threat_detected'
        ).length || 0;

      const highThreatEvents =
        recentEvents?.filter(e => e.threat_score > 0.7).length || 0;

      return {
        totalEvents,
        securityViolations,
        highThreatEvents,
        threatLevel:
          highThreatEvents > 10
            ? 'high'
            : highThreatEvents > 5
              ? 'medium'
              : 'low',
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to get security metrics:', error);
      return {
        totalEvents: 0,
        securityViolations: 0,
        highThreatEvents: 0,
        threatLevel: 'unknown',
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  errorHandler(error, req, res, next) {
    console.error('Error:', error);

    // Log error to audit system
    this.auditLogger.logError({
      error: error.message,
      stack: error.stack,
      userId: req.user?.id || 'anonymous',
      url: req.url,
      method: req.method,
      ip: req.ip,
    });

    res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Something went wrong',
    });
  }

  start(port = 3001) {
    this.app.listen(port, () => {
      console.log(`AI Security Gateway running on port ${port}`);
    });
  }
}

// Supporting classes
class SecurityMiddleware {
  constructor() {
    // Security middleware configuration
  }
}

class ThreatDetector {
  async assessThreat(content, user) {
    let threatScore = 0;

    // Basic threat detection
    if (content.length > 5000) threatScore += 0.1;
    if (content.includes('admin') || content.includes('root'))
      threatScore += 0.2;
    if (user.tier === 'Free' && content.length > 1000) threatScore += 0.1;

    return Math.min(threatScore, 1.0);
  }
}

class AuditLogger {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async logRequest(requestData) {
    try {
      await this.supabase.from('audit_logs').insert({
        timestamp: requestData.timestamp,
        user_id: requestData.userId,
        action: 'http_request',
        resource: requestData.url,
        success: requestData.success,
        security_level: 'low',
        threat_score: 0,
        metadata: requestData,
        ip_address: requestData.ip,
        user_agent: requestData.userAgent,
        session_id: `session_${requestData.userId}`,
      });
    } catch (error) {
      console.error('Failed to log request:', error);
    }
  }

  async logError(errorData) {
    try {
      await this.supabase.from('audit_logs').insert({
        timestamp: new Date().toISOString(),
        user_id: errorData.userId,
        action: 'error',
        resource: errorData.url,
        success: false,
        security_level: 'medium',
        threat_score: 0.3,
        metadata: { error: errorData.error, stack: errorData.stack },
        ip_address: errorData.ip,
        user_agent: 'unknown',
        session_id: `session_${errorData.userId}`,
      });
    } catch (error) {
      console.error('Failed to log error:', error);
    }
  }

  async getAuditLogs(filters) {
    try {
      let query = this.supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filters.startDate) {
        query = query.gte('timestamp', filters.startDate.toISOString());
      }

      if (filters.endDate) {
        query = query.lte('timestamp', filters.endDate.toISOString());
      }

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + filters.limit - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Failed to get audit logs:', error);
      return [];
    }
  }
}

// Export the gateway
module.exports = AISecurityGateway;

// Example usage
if (require.main === module) {
  const config = {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_ANON_KEY,
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
    ],
  };

  const gateway = new AISecurityGateway(config);
  gateway.start(process.env.PORT || 3001);
}
