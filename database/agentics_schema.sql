-- Agentics System Schema
-- This file creates the necessary tables for the Agentics orchestration system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Agent runs table - stores the main orchestration runs
CREATE TABLE IF NOT EXISTS agent_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    graph JSONB NOT NULL, -- Stores the OrchestrationGraph
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'aborted')),
    cost_usd DECIMAL(10,4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artifacts table - stores all artifacts produced by agents
CREATE TABLE IF NOT EXISTS artifacts (
    run_id UUID NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('goal', 'outline', 'sections', 'image_briefs', 'images', 'audio_manifest', 'safety_report', 'eval', 'cost_report')),
    value JSONB NOT NULL,
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (run_id, key)
);

-- Agent jobs table - tracks individual node execution
CREATE TABLE IF NOT EXISTS agent_jobs (
    id SERIAL PRIMARY KEY,
    run_id UUID NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
    node_id TEXT NOT NULL,
    attempt INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'aborted')),
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_runs_user_id ON agent_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON agent_runs(status);
CREATE INDEX IF NOT EXISTS idx_agent_runs_created_at ON agent_runs(created_at);

CREATE INDEX IF NOT EXISTS idx_artifacts_run_id ON artifacts(run_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_kind ON artifacts(kind);
CREATE INDEX IF NOT EXISTS idx_artifacts_key ON artifacts(key);

CREATE INDEX IF NOT EXISTS idx_agent_jobs_run_id ON agent_jobs(run_id);
CREATE INDEX IF NOT EXISTS idx_agent_jobs_status ON agent_jobs(status);
CREATE INDEX IF NOT EXISTS idx_agent_jobs_scheduled_at ON agent_jobs(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_agent_jobs_status_scheduled ON agent_jobs(status, scheduled_at);

-- Composite index for efficient job scheduling
CREATE INDEX IF NOT EXISTS idx_agent_jobs_status_scheduled_at ON agent_jobs(status, scheduled_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_agent_runs_updated_at BEFORE UPDATE ON agent_runs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artifacts_updated_at BEFORE UPDATE ON artifacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_jobs_updated_at BEFORE UPDATE ON agent_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_jobs ENABLE ROW LEVEL SECURITY;

-- RLS policies for agent_runs
CREATE POLICY "Users can view their own agent runs" ON agent_runs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agent runs" ON agent_runs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent runs" ON agent_runs
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for artifacts
CREATE POLICY "Users can view artifacts from their runs" ON artifacts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM agent_runs 
            WHERE agent_runs.id = artifacts.run_id 
            AND agent_runs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create artifacts for their runs" ON artifacts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM agent_runs 
            WHERE agent_runs.id = artifacts.run_id 
            AND agent_runs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update artifacts from their runs" ON artifacts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM agent_runs 
            WHERE agent_runs.id = artifacts.run_id 
            AND agent_runs.user_id = auth.uid()
        )
    );

-- RLS policies for agent_jobs
CREATE POLICY "Users can view jobs from their runs" ON agent_jobs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM agent_runs 
            WHERE agent_runs.id = agent_jobs.run_id 
            AND agent_runs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create jobs for their runs" ON agent_jobs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM agent_runs 
            WHERE agent_runs.id = agent_jobs.run_id 
            AND agent_runs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update jobs from their runs" ON agent_jobs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM agent_runs 
            WHERE agent_runs.id = agent_jobs.run_id 
            AND agent_runs.user_id = auth.uid()
        )
    );

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON agent_runs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON artifacts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON agent_jobs TO authenticated;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
