export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 
  | 'technical_issue' 
  | 'billing' 
  | 'feature_request' 
  | 'bug_report' 
  | 'account_access' 
  | 'general_inquiry'
  | 'integration_help'
  | 'performance'
  | 'security'
  | 'other';

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  userId: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  tags: string[];
  attachments?: TicketAttachment[];
  messages: TicketMessage[];
  satisfactionRating?: number;
  internalNotes?: string;
  estimatedResolutionTime?: string;
  actualResolutionTime?: string;
  escalationLevel: number;
  lastActivityAt: string;
  isUrgent: boolean;
  customerImpact: 'low' | 'medium' | 'high' | 'critical';
  businessImpact: 'low' | 'medium' | 'high' | 'critical';
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: 'user' | 'agent' | 'system';
  content: string;
  contentType: 'text' | 'image' | 'file' | 'system';
  createdAt: string;
  isInternal: boolean;
  attachments?: MessageAttachment[];
  readBy: string[];
  editedAt?: string;
  replyTo?: string;
}

export interface TicketAttachment {
  id: string;
  ticketId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  isPublic: boolean;
}

export interface MessageAttachment {
  id: string;
  messageId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
}

export interface SupportAgent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department: string;
  skills: string[];
  availability: 'online' | 'offline' | 'busy' | 'away';
  currentTickets: number;
  maxTickets: number;
  averageResolutionTime: number;
  satisfactionScore: number;
  isAvailable: boolean;
  lastActiveAt: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  agentId?: string;
  status: 'active' | 'waiting' | 'ended' | 'transferred';
  startedAt: string;
  endedAt?: string;
  messages: ChatMessage[];
  satisfactionRating?: number;
  category: TicketCategory;
  priority: TicketPriority;
  tags: string[];
  notes?: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderType: 'user' | 'agent' | 'system';
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system' | 'typing';
  timestamp: string;
  isRead: boolean;
  attachments?: MessageAttachment[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  views: number;
  helpful: number;
  notHelpful: number;
  lastUpdated: string;
  isPublished: boolean;
  relatedTickets: string[];
}

export interface SupportStats {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  averageResolutionTime: number;
  customerSatisfaction: number;
  responseTime: number;
  ticketsByCategory: Record<TicketCategory, number>;
  ticketsByPriority: Record<TicketPriority, number>;
  ticketsByStatus: Record<TicketStatus, number>;
}

export interface TicketFilter {
  status?: TicketStatus | 'all';
  priority?: TicketPriority | 'all';
  category?: TicketCategory | 'all';
  dateRange?: {
    start: string;
    end: string;
  };
  assignedTo?: string;
  tags?: string[];
  searchQuery?: string;
}

export interface TicketSort {
  field: 'createdAt' | 'updatedAt' | 'priority' | 'status' | 'title';
  direction: 'asc' | 'desc';
}

export interface SupportPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  chatNotifications: boolean;
  preferredLanguage: string;
  timezone: string;
  autoCloseResolvedTickets: boolean;
  autoAssignTickets: boolean;
  escalationThreshold: number;
  satisfactionSurveyEnabled: boolean;
}

export interface EscalationRule {
  id: string;
  name: string;
  conditions: EscalationCondition[];
  actions: EscalationAction[];
  isActive: boolean;
  priority: number;
}

export interface EscalationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface EscalationAction {
  type: 'assign_to' | 'change_priority' | 'send_notification' | 'create_alert';
  parameters: Record<string, any>;
}

export interface SupportMetrics {
  ticketsCreated: number;
  ticketsResolved: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  customerSatisfaction: number;
  firstContactResolution: number;
  escalationRate: number;
  agentProductivity: number;
}

export interface TicketTemplate {
  id: string;
  name: string;
  category: TicketCategory;
  title: string;
  description: string;
  priority: TicketPriority;
  tags: string[];
  isActive: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: string;
}

export interface SupportWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  isActive: boolean;
  applicableCategories: TicketCategory[];
  triggerConditions: WorkflowCondition[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'assignment' | 'notification' | 'escalation' | 'automation';
  parameters: Record<string, any>;
  order: number;
  isRequired: boolean;
  timeoutMinutes?: number;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
  logicalOperator?: 'and' | 'or';
} 