import { supabase } from '../lib/supabase';
import { 
  SupportTicket, 
  TicketMessage, 
  ChatSession, 
  ChatMessage, 
  FAQItem, 
  SupportStats,
  TicketFilter,
  TicketSort,
  SupportAgent
} from '../types/SupportTypes';

// Ticket Management
export const createTicket = async (ticket: SupportTicket): Promise<SupportTicket> => {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert([ticket])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw new Error('Failed to create support ticket');
  }
};

export const getTickets = async (userId: string, filter?: TicketFilter, sort?: TicketSort): Promise<SupportTicket[]> => {
  try {
    let query = supabase
      .from('support_tickets')
      .select('*')
      .eq('userId', userId);

    // Apply filters
    if (filter?.status && filter.status !== 'all') {
      query = query.eq('status', filter.status);
    }
    if (filter?.priority && filter.priority !== 'all') {
      query = query.eq('priority', filter.priority);
    }
    if (filter?.category && filter.category !== 'all') {
      query = query.eq('category', filter.category);
    }
    if (filter?.searchQuery) {
      query = query.or(`title.ilike.%${filter.searchQuery}%,description.ilike.%${filter.searchQuery}%`);
    }

    // Apply sorting
    if (sort) {
      query = query.order(sort.field, { ascending: sort.direction === 'asc' });
    } else {
      query = query.order('createdAt', { ascending: false });
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching tickets:', error);
    throw new Error('Failed to fetch support tickets');
  }
};

export const getTicket = async (ticketId: string): Promise<SupportTicket> => {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching ticket:', error);
    throw new Error('Failed to fetch support ticket');
  }
};

export const updateTicket = async (ticketId: string, updates: Partial<SupportTicket>): Promise<SupportTicket> => {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .update({ ...updates, updatedAt: new Date().toISOString() })
      .eq('id', ticketId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating ticket:', error);
    throw new Error('Failed to update support ticket');
  }
};

export const deleteTicket = async (ticketId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('support_tickets')
      .delete()
      .eq('id', ticketId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting ticket:', error);
    throw new Error('Failed to delete support ticket');
  }
};

// Message Management
export const addTicketMessage = async (message: TicketMessage): Promise<TicketMessage> => {
  try {
    const { data, error } = await supabase
      .from('ticket_messages')
      .insert([message])
      .select()
      .single();

    if (error) throw error;

    // Update ticket's lastActivityAt
    await updateTicket(message.ticketId, {
      lastActivityAt: new Date().toISOString()
    });

    return data;
  } catch (error) {
    console.error('Error adding message:', error);
    throw new Error('Failed to add message to ticket');
  }
};

export const getTicketMessages = async (ticketId: string): Promise<TicketMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticketId', ticketId)
      .order('createdAt', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw new Error('Failed to fetch ticket messages');
  }
};

// Chat Management
export const createChatSession = async (session: ChatSession): Promise<ChatSession> => {
  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert([session])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw new Error('Failed to create chat session');
  }
};

export const getChatSession = async (sessionId: string): Promise<ChatSession> => {
  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching chat session:', error);
    throw new Error('Failed to fetch chat session');
  }
};

export const addChatMessage = async (message: ChatMessage): Promise<ChatMessage> => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([message])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding chat message:', error);
    throw new Error('Failed to add chat message');
  }
};

export const getChatMessages = async (sessionId: string): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('sessionId', sessionId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    throw new Error('Failed to fetch chat messages');
  }
};

// FAQ Management
export const getFAQItems = async (category?: string): Promise<FAQItem[]> => {
  try {
    let query = supabase
      .from('faq_items')
      .select('*')
      .eq('isPublished', true);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching FAQ items:', error);
    throw new Error('Failed to fetch FAQ items');
  }
};

export const searchFAQ = async (query: string): Promise<FAQItem[]> => {
  try {
    const { data, error } = await supabase
      .from('faq_items')
      .select('*')
      .eq('isPublished', true)
      .or(`question.ilike.%${query}%,answer.ilike.%${query}%`);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching FAQ:', error);
    throw new Error('Failed to search FAQ');
  }
};

// Analytics and Stats
export const getSupportStats = async (userId: string): Promise<SupportStats> => {
  try {
    const tickets = await getTickets(userId);
    
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => t.status === 'open').length;
    const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
    
    const ticketsByCategory = tickets.reduce((acc, ticket) => {
      acc[ticket.category] = (acc[ticket.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ticketsByPriority = tickets.reduce((acc, ticket) => {
      acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ticketsByStatus = tickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average resolution time
    const resolvedTicketsWithTime = tickets.filter(t => t.resolvedAt && t.createdAt);
    const averageResolutionTime = resolvedTicketsWithTime.length > 0 
      ? resolvedTicketsWithTime.reduce((acc, ticket) => {
          const created = new Date(ticket.createdAt);
          const resolved = new Date(ticket.resolvedAt!);
          return acc + (resolved.getTime() - created.getTime());
        }, 0) / resolvedTicketsWithTime.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    // Calculate customer satisfaction
    const ticketsWithRating = tickets.filter(t => t.satisfactionRating);
    const customerSatisfaction = ticketsWithRating.length > 0
      ? ticketsWithRating.reduce((acc, ticket) => acc + (ticket.satisfactionRating || 0), 0) / ticketsWithRating.length
      : 0;

    return {
      totalTickets,
      openTickets,
      resolvedTickets,
      averageResolutionTime,
      customerSatisfaction,
      responseTime: 0, // TODO: Implement response time calculation
      ticketsByCategory: ticketsByCategory as any,
      ticketsByPriority: ticketsByPriority as any,
      ticketsByStatus: ticketsByStatus as any
    };
  } catch (error) {
    console.error('Error calculating support stats:', error);
    throw new Error('Failed to calculate support statistics');
  }
};

// Agent Management
export const getAvailableAgents = async (): Promise<SupportAgent[]> => {
  try {
    const { data, error } = await supabase
      .from('support_agents')
      .select('*')
      .eq('isAvailable', true)
      .lt('currentTickets', 'maxTickets');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching available agents:', error);
    throw new Error('Failed to fetch available agents');
  }
};

export const assignTicketToAgent = async (ticketId: string, agentId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('support_tickets')
      .update({ assignedTo: agentId })
      .eq('id', ticketId);

    if (error) throw error;
  } catch (error) {
    console.error('Error assigning ticket to agent:', error);
    throw new Error('Failed to assign ticket to agent');
  }
};

// Auto-assignment logic
export const autoAssignTicket = async (ticket: SupportTicket): Promise<string | null> => {
  try {
    const availableAgents = await getAvailableAgents();
    
    if (availableAgents.length === 0) {
      return null;
    }

    // Simple round-robin assignment
    // In a real system, you'd implement more sophisticated logic
    const assignedAgent = availableAgents[0];
    
    await assignTicketToAgent(ticket.id, assignedAgent.id);
    return assignedAgent.id;
  } catch (error) {
    console.error('Error auto-assigning ticket:', error);
    return null;
  }
};

// Notification system
export const sendTicketNotification = async (ticketId: string, type: 'created' | 'updated' | 'resolved'): Promise<void> => {
  try {
    // TODO: Implement notification system
    // This would integrate with email, push notifications, etc.
    console.log(`Sending ${type} notification for ticket ${ticketId}`);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// Export all functions
export const supportService = {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
  deleteTicket,
  addTicketMessage,
  getTicketMessages,
  createChatSession,
  getChatSession,
  addChatMessage,
  getChatMessages,
  getFAQItems,
  searchFAQ,
  getSupportStats,
  getAvailableAgents,
  assignTicketToAgent,
  autoAssignTicket,
  sendTicketNotification
}; 