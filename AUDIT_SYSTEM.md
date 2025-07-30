# 🔍 MCP-Compliant Audit Log System

## 📋 **Overview**

The DocCraft AI audit log system provides comprehensive tracking of all user actions and system events with MCP (Model-Context-Permission) validation. This ensures that only authorized actions are logged and that access to audit data is properly controlled based on user tiers and roles.

## 🏗️ **Architecture**

### **Core Components**

1. **AuditLogger** (`src/lib/audit/auditLogger.ts`)
   - MCP-compliant event logging
   - Action validation against allowed permissions
   - Secure log storage and retrieval
   - Role-based access control

2. **Database Schema** (`database/audit_schema.sql`)
   - Optimized audit_logs table
   - Row Level Security (RLS) policies
   - Performance indexes
   - Automatic cleanup functions

3. **AuditLogPanel** (`src/components/audit/AuditLogPanel.tsx`)
   - Real-time log display
   - Advanced filtering and search
   - Role-based data access
   - Export functionality for admins

## 🔐 **MCP Integration**

### **Action Validation**
```typescript
// Every audit event is validated against MCP context
await AuditLogger.logAuditEvent({
  userId: 'user-123',
  action: 'ai_rewrite',
  resource: 'ai_helper',
  details: { inputLength: 150, outputLength: 120 },
  mcpContext: {
    tier: 'Pro',
    role: 'user',
    allowedActions: ['ai_rewrite', 'ai_summarize', 'view_audit_logs']
  }
})
```

### **Tier-Based Access**
- **Free**: Limited audit access (own logs only)
- **Pro**: Enhanced audit features + own logs
- **Admin**: Full system audit access + export capabilities

## 📊 **Tracked Events**

### **AI Helper Events**
- `ai_rewrite` - Text rewriting operations
- `ai_summarize` - Text summarization
- `ai_suggest` - AI suggestions
- `ai_rewrite_failed` - Failed AI operations

### **Document Events**
- `create` - Document creation
- `update` - Document modifications
- `delete` - Document deletion
- `share` - Document sharing
- `collaboration_save` - Real-time saves

### **Collaboration Events**
- `collaboration_join` - User joins collaboration
- `collaboration_leave` - User leaves collaboration
- `collaboration_connect_failed` - Connection failures

### **System Events**
- `login` - User authentication
- `logout` - User logout
- `profile_update` - Profile modifications
- `tier_upgrade` - Subscription changes

## 🗄️ **Database Schema**

### **audit_logs Table**
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tier TEXT NOT NULL CHECK (tier IN ('Free', 'Pro', 'Admin')),
  role TEXT NOT NULL CHECK (role IN ('user', 'admin')),
  mcp_json JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **RLS Policies**
```sql
-- Users can view their own logs
CREATE POLICY "Users can view their own audit logs" 
ON audit_logs FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all logs
CREATE POLICY "Admins can view all audit logs" 
ON audit_logs FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
```

## 🎨 **UI Components**

### **AuditLogPanel Features**
- ✅ **Real-time Updates**: Live log streaming
- ✅ **Advanced Filtering**: By action, resource, date range
- ✅ **Role-based Access**: Different views for different tiers
- ✅ **Export Functionality**: CSV export for admins
- ✅ **Statistics Dashboard**: Usage analytics
- ✅ **Search & Pagination**: Efficient data browsing

### **Access Control**
```typescript
// Admin sees all logs
if (mcpContext.role === 'admin') {
  // Full system access
} else {
  // Scoped to user's own logs
  query = query.eq('user_id', userId)
}
```

## 🔧 **Integration Points**

### **1. AI Helper Service**
```typescript
// Log AI usage with detailed metrics
await AuditLogger.logAuditEvent({
  userId,
  action: `ai_${action}`,
  resource: 'ai_helper',
  details: {
    action,
    inputLength: text.length,
    outputLength: result.length,
    model: 'gpt-4',
    tokens: completion.usage?.total_tokens || 0
  },
  mcpContext
})
```

### **2. Document Service**
```typescript
// Log document operations
await AuditLogger.logAuditEvent({
  userId,
  action: 'create',
  resource: 'document',
  details: {
    documentId: data.id,
    title,
    isPublic,
    contentLength: content.length
  },
  mcpContext
})
```

### **3. Collaboration System**
```typescript
// Log collaboration events
await AuditLogger.logAuditEvent({
  userId,
  action: 'collaboration_join',
  resource: 'collaboration',
  details: {
    roomId,
    userName,
    userColor,
    wsUrl
  },
  mcpContext
})
```

## 📈 **Analytics & Reporting**

### **Audit Statistics**
```typescript
const stats = await AuditLogger.getAuditStats(mcpContext)
// Returns:
// - totalEvents: number
// - eventsByAction: Record<string, number>
// - eventsByResource: Record<string, number>
// - recentActivity: AuditLog[]
```

### **Export Capabilities**
```typescript
// Admin-only export functionality
const logs = await AuditLogger.exportAuditLogs(
  startDate,
  endDate,
  mcpContext
)
```

## 🔒 **Security Features**

### **Data Protection**
- ✅ **Encrypted Storage**: All sensitive data encrypted
- ✅ **Access Control**: Role-based permissions
- ✅ **Audit Trail**: Complete action history
- ✅ **Data Retention**: Automatic cleanup policies
- ✅ **Privacy Compliance**: GDPR-ready logging

### **MCP Validation**
```typescript
private static validateMCPAction(action: string, mcpContext: AuditEvent['mcpContext']): boolean {
  // Admin can do everything
  if (mcpContext.role === 'admin') return true
  
  // Check if action is in allowed actions
  return mcpContext.allowedActions.includes(action)
}
```

## 🚀 **Usage Examples**

### **Basic Logging**
```typescript
import { AuditLogger } from '../lib/audit/auditLogger'

// Log a simple event
await AuditLogger.logAuditEvent({
  userId: 'user-123',
  action: 'view_document',
  resource: 'document',
  details: { documentId: 'doc-456' },
  mcpContext: {
    tier: 'Pro',
    role: 'user',
    allowedActions: ['view_document', 'edit_document']
  }
})
```

### **Advanced Filtering**
```typescript
// Get filtered logs
const logs = await AuditLogger.getUserAuditLogs(userId, mcpContext, {
  action: 'ai_rewrite',
  resource: 'ai_helper',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  limit: 100
})
```

### **Statistics Dashboard**
```typescript
// Get audit statistics
const stats = await AuditLogger.getAuditStats(mcpContext)
console.log(`Total events: ${stats.totalEvents}`)
console.log(`AI usage: ${stats.eventsByAction['ai_rewrite'] || 0}`)
```

## 📋 **Configuration**

### **Environment Variables**
```bash
# Database
DATABASE_URL=your_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key

# Audit Settings
AUDIT_RETENTION_DAYS=365
AUDIT_LOG_LEVEL=info
```

### **MCP Registry Updates**
```typescript
// Add audit actions to MCP registry
export const mcpRegistry = {
  "lib/audit/auditLogger.ts": {
    allowedActions: ["log_audit_event", "get_audit_logs", "get_audit_stats"],
    tier: "Pro+",
    role: "user"
  }
}
```

## 🎯 **Best Practices**

### **1. Consistent Logging**
- Always include relevant details
- Use standardized action names
- Include user context and timestamps

### **2. Performance Optimization**
- Use database indexes effectively
- Implement log rotation
- Monitor query performance

### **3. Security Compliance**
- Validate all inputs
- Encrypt sensitive data
- Implement proper access controls

### **4. Monitoring & Alerts**
- Set up log monitoring
- Configure alert thresholds
- Regular security audits

## 🔄 **Maintenance**

### **Log Cleanup**
```sql
-- Automatic cleanup of old logs
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
BEGIN
  DELETE FROM audit_logs 
  WHERE timestamp < NOW() - INTERVAL '1 year';
  RETURN ROW_COUNT;
END;
$$ LANGUAGE plpgsql;
```

### **Performance Monitoring**
```sql
-- Monitor audit log performance
SELECT 
  COUNT(*) as total_logs,
  AVG(EXTRACT(EPOCH FROM (NOW() - timestamp))) as avg_age_days
FROM audit_logs;
```

---

**🎉 The MCP-compliant audit log system is now fully integrated and ready for production use!** 