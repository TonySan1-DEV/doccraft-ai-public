import { supabase } from '../supabase'

export interface AuditEvent {
  userId: string
  action: string
  resource: string
  details?: Record<string, any>
  mcpContext: {
    tier: string
    role: string
    allowedActions: string[]
  }
}

export interface AuditLog {
  id: string
  user_id: string
  action: string
  resource: string
  details: Record<string, any>
  timestamp: string
  tier: string
  role: string
  mcp_json: Record<string, any>
  created_at: string
}

export class AuditLogger {
  /**
   * Log an audit event with MCP validation
   */
  static async logAuditEvent(event: AuditEvent): Promise<boolean> {
    try {
      // Validate MCP context
      if (!this.validateMCPAction(event.action, event.mcpContext)) {
        console.warn(`Audit: Action '${event.action}' not allowed for tier '${event.mcpContext.tier}'`)
        return false
      }

      // Prepare log entry
      const logEntry = {
        user_id: event.userId,
        action: event.action,
        resource: event.resource,
        details: event.details || {},
        timestamp: new Date().toISOString(),
        tier: event.mcpContext.tier,
        role: event.mcpContext.role,
        mcp_json: {
          tier: event.mcpContext.tier,
          role: event.mcpContext.role,
          allowedActions: event.mcpContext.allowedActions,
          timestamp: new Date().toISOString()
        }
      }

      // Insert into audit_logs table
      const { error } = await supabase
        .from('audit_logs')
        .insert(logEntry)

      if (error) {
        console.error('Audit: Failed to log event:', error)
        return false
      }

      console.log(`Audit: Logged '${event.action}' on '${event.resource}' for user ${event.userId}`)
      return true
    } catch (error) {
      console.error('Audit: Error logging event:', error)
      return false
    }
  }

  /**
   * Validate if action is allowed in MCP context
   */
  private static validateMCPAction(action: string, mcpContext: AuditEvent['mcpContext']): boolean {
    // Admin can do everything
    if (mcpContext.role === 'admin') return true

    // Check if action is in allowed actions
    return mcpContext.allowedActions.includes(action)
  }

  /**
   * Get audit logs for a user (scoped by tier/role)
   */
  static async getUserAuditLogs(
    userId: string, 
    mcpContext: { tier: string; role: string },
    filters?: {
      action?: string
      resource?: string
      startDate?: string
      endDate?: string
      limit?: number
    }
  ): Promise<AuditLog[]> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })

      // Apply filters
      if (filters?.action) {
        query = query.eq('action', filters.action)
      }
      if (filters?.resource) {
        query = query.eq('resource', filters.resource)
      }
      if (filters?.startDate) {
        query = query.gte('timestamp', filters.startDate)
      }
      if (filters?.endDate) {
        query = query.lte('timestamp', filters.endDate)
      }
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      // Scope by user role/tier
      if (mcpContext.role === 'admin') {
        // Admins can see all logs
        const { data, error } = await query
        if (error) throw error
        return data as AuditLog[]
      } else {
        // Regular users can only see their own logs
        const { data, error } = await query.eq('user_id', userId)
        if (error) throw error
        return data as AuditLog[]
      }
    } catch (error) {
      console.error('Audit: Error fetching logs:', error)
      return []
    }
  }

  /**
   * Get audit statistics for dashboard
   */
  static async getAuditStats(mcpContext: { tier: string; role: string }): Promise<{
    totalEvents: number
    eventsByAction: Record<string, number>
    eventsByResource: Record<string, number>
    recentActivity: AuditLog[]
  }> {
    try {
      let query = supabase.from('audit_logs').select('*')

      // Scope by role
      if (mcpContext.role !== 'admin') {
        // Non-admins can only see their own stats
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          query = query.eq('user_id', user.id)
        }
      }

      const { data, error } = await query
      if (error) throw error

      const logs = data as AuditLog[]

      // Calculate statistics
      const eventsByAction: Record<string, number> = {}
      const eventsByResource: Record<string, number> = {}

      logs.forEach(log => {
        eventsByAction[log.action] = (eventsByAction[log.action] || 0) + 1
        eventsByResource[log.resource] = (eventsByResource[log.resource] || 0) + 1
      })

      return {
        totalEvents: logs.length,
        eventsByAction,
        eventsByResource,
        recentActivity: logs.slice(0, 10) // Last 10 events
      }
    } catch (error) {
      console.error('Audit: Error fetching stats:', error)
      return {
        totalEvents: 0,
        eventsByAction: {},
        eventsByResource: {},
        recentActivity: []
      }
    }
  }

  /**
   * Export audit logs (admin only)
   */
  static async exportAuditLogs(
    startDate: string,
    endDate: string,
    mcpContext: { tier: string; role: string }
  ): Promise<AuditLog[]> {
    try {
      if (mcpContext.role !== 'admin') {
        throw new Error('Only admins can export audit logs')
      }

      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .gte('timestamp', startDate)
        .lte('timestamp', endDate)
        .order('timestamp', { ascending: false })

      if (error) throw error
      return data as AuditLog[]
    } catch (error) {
      console.error('Audit: Error exporting logs:', error)
      return []
    }
  }
} 