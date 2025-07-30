-- Support Agents Table
CREATE TABLE IF NOT EXISTS support_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    avatar TEXT,
    department VARCHAR(100) NOT NULL,
    skills TEXT[] DEFAULT '{}',
    availability VARCHAR(100),
    current_tickets INTEGER DEFAULT 0,
    max_tickets INTEGER DEFAULT 10,
    average_resolution_time DECIMAL(5,2) DEFAULT 0,
    satisfaction_score DECIMAL(3,2) DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);