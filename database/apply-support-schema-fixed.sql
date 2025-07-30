-- Support System Database Schema (Fixed Version)
-- DocCraft-AI v3 Support Module
-- Execute this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'technical_issue', 'billing', 'feature_request', 'bug_report', 
        'account_access', 'general_inquiry', 'integration_help', 
        'performance', 'security', 'other'
    )),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[] DEFAULT '{}',
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    internal_notes TEXT,
    estimated_resolution_time TIMESTAMP WITH TIME ZONE,
    actual_resolution_time TIMESTAMP WITH TIME ZONE,
    escalation_level INTEGER DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_urgent BOOLEAN DEFAULT FALSE,
    customer_impact VARCHAR(20) DEFAULT 'low' CHECK (customer_impact IN ('low', 'medium', 'high', 'critical')),
    business_impact VARCHAR(20) DEFAULT 'low' CHECK (business_impact IN ('low', 'medium', 'high', 'critical'))
);

-- Ticket Messages Table
CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'agent', 'system')),
    content TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'file', 'system')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_internal BOOLEAN DEFAULT FALSE,
    read_by UUID[] DEFAULT '{}',
    edited_at TIMESTAMP WITH TIME ZONE,
    reply_to UUID REFERENCES ticket_messages(id)
);

-- Ticket Attachments Table
CREATE TABLE IF NOT EXISTS ticket_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_public BOOLEAN DEFAULT TRUE
);

-- Message Attachments Table
CREATE TABLE IF NOT EXISTS message_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES ticket_messages(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    url TEXT NOT NULL
);

-- Support Agents Table (Fixed - removed foreign key constraint)
CREATE TABLE IF NOT EXISTS support_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- Removed REFERENCES auth.users(id) constraint
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    avatar TEXT,
    department VARCHAR(100) NOT NULL,
    skills TEXT[] DEFAULT '{}',
    availability VARCHAR(20) DEFAULT 'online' CHECK (availability IN ('online', 'offline', 'busy', 'away')),
    current_tickets INTEGER DEFAULT 0,
    max_tickets INTEGER DEFAULT 10,
    average_resolution_time INTEGER DEFAULT 0, -- in minutes
    satisfaction_score DECIMAL(3,2) DEFAULT 0.00,
    is_available BOOLEAN DEFAULT TRUE,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Sessions Table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES support_agents(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'waiting', 'ended', 'transferred')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'agent', 'system')),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQ Items Table
CREATE TABLE IF NOT EXISTS faq_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    views INTEGER DEFAULT 0,
    helpful INTEGER DEFAULT 0,
    not_helpful INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_published BOOLEAN DEFAULT TRUE,
    related_tickets UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support Preferences Table
CREATE TABLE IF NOT EXISTS support_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_email BOOLEAN DEFAULT TRUE,
    notification_push BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    auto_assign BOOLEAN DEFAULT TRUE,
    preferred_agent UUID REFERENCES support_agents(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON ticket_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_sender_id ON ticket_messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_started_at ON chat_sessions(started_at);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);

CREATE INDEX IF NOT EXISTS idx_faq_items_category ON faq_items(category);
CREATE INDEX IF NOT EXISTS idx_faq_items_is_published ON faq_items(is_published);
CREATE INDEX IF NOT EXISTS idx_faq_items_views ON faq_items(views);

CREATE INDEX IF NOT EXISTS idx_support_agents_department ON support_agents(department);
CREATE INDEX IF NOT EXISTS idx_support_agents_is_available ON support_agents(is_available);

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_agents_updated_at BEFORE UPDATE ON support_agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faq_items_updated_at BEFORE UPDATE ON faq_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_preferences_updated_at BEFORE UPDATE ON support_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for updating ticket last activity
CREATE OR REPLACE FUNCTION update_ticket_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE support_tickets 
    SET last_activity_at = NOW()
    WHERE id = NEW.ticket_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ticket_last_activity_trigger 
    AFTER INSERT OR UPDATE ON ticket_messages
    FOR EACH ROW EXECUTE FUNCTION update_ticket_last_activity();

-- Create trigger for updating agent ticket count
CREATE OR REPLACE FUNCTION update_agent_ticket_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update agent's current ticket count when tickets are assigned/unassigned
    IF TG_OP = 'INSERT' THEN
        IF NEW.assigned_to IS NOT NULL THEN
            UPDATE support_agents 
            SET current_tickets = current_tickets + 1
            WHERE id = NEW.assigned_to;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- If assignment changed
        IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
            -- Decrease count for old agent
            IF OLD.assigned_to IS NOT NULL THEN
                UPDATE support_agents 
                SET current_tickets = GREATEST(current_tickets - 1, 0)
                WHERE id = OLD.assigned_to;
            END IF;
            -- Increase count for new agent
            IF NEW.assigned_to IS NOT NULL THEN
                UPDATE support_agents 
                SET current_tickets = current_tickets + 1
                WHERE id = NEW.assigned_to;
            END IF;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrease count when ticket is deleted
        IF OLD.assigned_to IS NOT NULL THEN
            UPDATE support_agents 
            SET current_tickets = GREATEST(current_tickets - 1, 0)
            WHERE id = OLD.assigned_to;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agent_ticket_count_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_agent_ticket_count();

-- Enable Row Level Security (RLS)
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Support Tickets policies
CREATE POLICY "Users can view their own tickets" ON support_tickets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tickets" ON support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets" ON support_tickets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Agents can view all tickets" ON support_tickets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM support_agents 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Agents can update all tickets" ON support_tickets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM support_agents 
            WHERE user_id = auth.uid()
        )
    );

-- Ticket Messages policies
CREATE POLICY "Users can view messages for their tickets" ON ticket_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM support_tickets 
            WHERE id = ticket_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages for their tickets" ON ticket_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM support_tickets 
            WHERE id = ticket_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Agents can view all messages" ON ticket_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM support_agents 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Agents can create messages for any ticket" ON ticket_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM support_agents 
            WHERE user_id = auth.uid()
        )
    );

-- Support Agents policies
CREATE POLICY "Agents can view all agents" ON support_agents
    FOR SELECT USING (true);

CREATE POLICY "Agents can update their own profile" ON support_agents
    FOR UPDATE USING (user_id = auth.uid());

-- FAQ Items policies
CREATE POLICY "Anyone can view published FAQs" ON faq_items
    FOR SELECT USING (is_published = true);

CREATE POLICY "Agents can manage all FAQs" ON faq_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM support_agents 
            WHERE user_id = auth.uid()
        )
    );

-- Chat Sessions policies
CREATE POLICY "Users can view their own chat sessions" ON chat_sessions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own chat sessions" ON chat_sessions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Agents can view all chat sessions" ON chat_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM support_agents 
            WHERE user_id = auth.uid()
        )
    );

-- Chat Messages policies
CREATE POLICY "Users can view messages in their sessions" ON chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_sessions 
            WHERE id = session_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages in their sessions" ON chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_sessions 
            WHERE id = session_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Agents can view all chat messages" ON chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM support_agents 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Agents can create messages in any session" ON chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM support_agents 
            WHERE user_id = auth.uid()
        )
    );

-- Support Preferences policies
CREATE POLICY "Users can manage their own preferences" ON support_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated; 