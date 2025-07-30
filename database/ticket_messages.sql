-- Ticket Messages Table
CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    sender_type VARCHAR(20) NOT NULL DEFAULT 'user',
    content TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'text',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_internal BOOLEAN DEFAULT FALSE,
    read_by UUID[] DEFAULT '{}',
    edited_at TIMESTAMP WITH TIME ZONE,
    reply_to UUID REFERENCES ticket_messages(id)
);