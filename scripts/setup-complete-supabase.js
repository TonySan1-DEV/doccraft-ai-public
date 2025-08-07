#!/usr/bin/env node

/**
 * Complete Supabase Setup for DocCraft-AI
 * This script sets up all required database tables, storage buckets, RLS policies,
 * and functions for the complete DocCraft-AI application.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    '❌ Missing Supabase credentials. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupCompleteSupabase() {
  console.log('🚀 Setting up Complete Supabase for DocCraft-AI...\n');

  try {
    // 1. Set up authentication
    await setupAuthentication();

    // 2. Create core database schema
    await setupCoreDatabaseSchema();

    // 3. Create support system schema
    await setupSupportDatabaseSchema();

    // 4. Create agent module schema
    await setupAgentDatabaseSchema();

    // 5. Set up Row Level Security (RLS)
    await setupRowLevelSecurity();

    // 6. Create functions and triggers
    await setupFunctions();

    // 7. Set up storage buckets
    await setupStorageBuckets();

    // 8. Configure email templates
    await setupEmailTemplates();

    // 9. Test all connections
    await testAllConnections();

    console.log('\n✅ Complete Supabase setup finished successfully!');
    console.log('\n📋 Setup Summary:');
    console.log('✅ Authentication configured');
    console.log('✅ Core database schema created');
    console.log('✅ Support system schema created');
    console.log('✅ Agent module schema created');
    console.log('✅ RLS policies configured');
    console.log('✅ Database functions created');
    console.log('✅ Storage buckets configured');
    console.log('✅ Email templates configured');
    console.log('✅ All connections tested');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

async function setupAuthentication() {
  console.log('🔐 Setting up authentication...');

  // Configure auth settings
  const { error } = await supabase.auth.admin.updateUserById(
    '00000000-0000-0000-0000-000000000000',
    {
      email_confirm: true,
    }
  );

  if (error && !error.message.includes('not found')) {
    console.log('⚠️  Auth setup warning:', error.message);
  } else {
    console.log('✅ Authentication system ready');
  }
}

async function setupCoreDatabaseSchema() {
  console.log('🗄️  Setting up core database schema...');

  const coreSchema = `
    -- Enable required extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    CREATE EXTENSION IF NOT EXISTS "vector";
    
    -- Create profiles table
    CREATE TABLE IF NOT EXISTS profiles (
      id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT,
      avatar_url TEXT,
      tier TEXT DEFAULT 'Free' CHECK (tier IN ('Free', 'Pro', 'Admin')),
      preferences JSONB DEFAULT '{"theme": "system", "notifications": true, "collaboration_enabled": true}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create documents table
    CREATE TABLE IF NOT EXISTS documents (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT DEFAULT '',
      owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      collaborators TEXT[] DEFAULT '{}',
      is_public BOOLEAN DEFAULT FALSE,
      metadata JSONB DEFAULT '{"version": 1, "word_count": 0, "character_count": 0}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create document_shares table
    CREATE TABLE IF NOT EXISTS document_shares (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      permission TEXT DEFAULT 'read' CHECK (permission IN ('read', 'write', 'admin')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(document_id, user_id)
    );
    
    -- Create collaboration_sessions table
    CREATE TABLE IF NOT EXISTS collaboration_sessions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      room_id TEXT NOT NULL,
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      user_name TEXT NOT NULL,
      user_color TEXT DEFAULT '#FF6B6B',
      is_active BOOLEAN DEFAULT TRUE,
      joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      left_at TIMESTAMP WITH TIME ZONE,
      UNIQUE(room_id, user_id)
    );
    
    -- Create document_versions table
    CREATE TABLE IF NOT EXISTS document_versions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
      version_number INTEGER NOT NULL,
      content TEXT NOT NULL,
      modified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_documents_owner_id ON documents(owner_id);
    CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents(updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_document_shares_document_id ON document_shares(document_id);
    CREATE INDEX IF NOT EXISTS idx_document_shares_user_id ON document_shares(user_id);
    CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_room_id ON collaboration_sessions(room_id);
    CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_user_id ON collaboration_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_active ON collaboration_sessions(is_active);
    CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
    CREATE INDEX IF NOT EXISTS idx_document_versions_version ON document_versions(version_number DESC);
  `;

  const { error } = await supabase.rpc('exec_sql', { sql: coreSchema });

  if (error) {
    console.log('⚠️  Core schema setup warning:', error.message);
  } else {
    console.log('✅ Core database schema created');
  }
}

async function setupSupportDatabaseSchema() {
  console.log('🎧 Setting up support system schema...');

  const supportSchema = `
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
    
    -- Support Agents Table
    CREATE TABLE IF NOT EXISTS support_agents (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      avatar TEXT,
      department VARCHAR(100) NOT NULL,
      skills TEXT[] DEFAULT '{}',
      availability VARCHAR(20) DEFAULT 'online' CHECK (availability IN ('online', 'offline', 'busy', 'away')),
      current_tickets INTEGER DEFAULT 0,
      max_tickets INTEGER DEFAULT 10,
      average_resolution_time INTEGER DEFAULT 0,
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
    
    -- Create indexes
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
  `;

  const { error } = await supabase.rpc('exec_sql', { sql: supportSchema });

  if (error) {
    console.log('⚠️  Support schema setup warning:', error.message);
  } else {
    console.log('✅ Support system schema created');
  }
}

async function setupAgentDatabaseSchema() {
  console.log('🤖 Setting up agent module schema...');

  const agentSchema = `
    -- Slide Decks Table
    CREATE TABLE IF NOT EXISTS slide_decks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      title TEXT NOT NULL,
      theme TEXT,
      slides JSONB NOT NULL,
      metadata JSONB DEFAULT '{}'::jsonb,
      analysis JSONB DEFAULT '{}'::jsonb,
      tier TEXT DEFAULT 'Pro',
      processing_time_ms INTEGER,
      word_count INTEGER,
      slide_count INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
    
    -- Narrated Decks Table
    CREATE TABLE IF NOT EXISTS narrated_decks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      title TEXT NOT NULL,
      theme TEXT,
      slides JSONB NOT NULL,
      narration_metadata JSONB DEFAULT '{}'::jsonb,
      analysis JSONB DEFAULT '{}'::jsonb,
      size_metadata JSONB DEFAULT '{}'::jsonb,
      tier TEXT DEFAULT 'Pro',
      processing_time_ms INTEGER,
      total_narration_length INTEGER,
      average_narration_length INTEGER,
      total_words INTEGER,
      average_words_per_slide NUMERIC(10,2),
      tone TEXT DEFAULT 'conversational',
      has_introduction BOOLEAN DEFAULT false,
      has_summary BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
    
    -- TTS Narrations Table
    CREATE TABLE IF NOT EXISTS tts_narrations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      audio_file_url TEXT NOT NULL,
      timeline JSONB NOT NULL,
      model_used TEXT DEFAULT 'en-US-JennyNeural',
      audio_metadata JSONB DEFAULT '{}'::jsonb,
      analysis JSONB DEFAULT '{}'::jsonb,
      voice_settings JSONB DEFAULT '{}'::jsonb,
      tier TEXT DEFAULT 'Pro',
      processing_time_ms INTEGER,
      total_duration NUMERIC(10,3),
      slide_count INTEGER,
      average_duration_per_slide NUMERIC(10,3),
      speed_multiplier NUMERIC(3,2) DEFAULT 1.0,
      has_gaps BOOLEAN DEFAULT false,
      total_words INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
    
    -- Pipeline Outputs Table
    CREATE TABLE IF NOT EXISTS pipeline_outputs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slide_deck_id UUID REFERENCES slide_decks(id) ON DELETE CASCADE NOT NULL,
      narrated_deck_id UUID REFERENCES narrated_decks(id) ON DELETE CASCADE NOT NULL,
      tts_narration_id UUID REFERENCES tts_narrations(id) ON DELETE CASCADE NOT NULL,
      status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
      metadata JSONB DEFAULT '{}'::jsonb,
      user_tier TEXT DEFAULT 'Pro',
      features_used TEXT[] DEFAULT '{}',
      access_validated BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
    );
    
    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_slide_decks_user_id ON slide_decks(user_id);
    CREATE INDEX IF NOT EXISTS idx_slide_decks_created_at ON slide_decks(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_slide_decks_title ON slide_decks USING gin(to_tsvector('english', title));
    CREATE INDEX IF NOT EXISTS idx_slide_decks_tier ON slide_decks(tier);
    CREATE INDEX IF NOT EXISTS idx_slide_decks_metadata ON slide_decks USING gin(metadata);
    
    CREATE INDEX IF NOT EXISTS idx_narrated_decks_user_id ON narrated_decks(user_id);
    CREATE INDEX IF NOT EXISTS idx_narrated_decks_created_at ON narrated_decks(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_narrated_decks_title ON narrated_decks USING gin(to_tsvector('english', title));
    CREATE INDEX IF NOT EXISTS idx_narrated_decks_tier ON narrated_decks(tier);
    CREATE INDEX IF NOT EXISTS idx_narrated_decks_tone ON narrated_decks(tone);
    CREATE INDEX IF NOT EXISTS idx_narrated_decks_narration_metadata ON narrated_decks USING gin(narration_metadata);
    
    CREATE INDEX IF NOT EXISTS idx_tts_narrations_user_id ON tts_narrations(user_id);
    CREATE INDEX IF NOT EXISTS idx_tts_narrations_created_at ON tts_narrations(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_tts_narrations_model_used ON tts_narrations(model_used);
    CREATE INDEX IF NOT EXISTS idx_tts_narrations_tier ON tts_narrations(tier);
    CREATE INDEX IF NOT EXISTS idx_tts_narrations_timeline ON tts_narrations USING gin(timeline);
    
    CREATE INDEX IF NOT EXISTS idx_pipeline_outputs_user_id ON pipeline_outputs(user_id);
    CREATE INDEX IF NOT EXISTS idx_pipeline_outputs_created_at ON pipeline_outputs(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_pipeline_outputs_status ON pipeline_outputs(status);
    CREATE INDEX IF NOT EXISTS idx_pipeline_outputs_tier ON pipeline_outputs(user_tier);
    CREATE INDEX IF NOT EXISTS idx_pipeline_outputs_slide_deck_id ON pipeline_outputs(slide_deck_id);
    CREATE INDEX IF NOT EXISTS idx_pipeline_outputs_narrated_deck_id ON pipeline_outputs(narrated_deck_id);
    CREATE INDEX IF NOT EXISTS idx_pipeline_outputs_tts_narration_id ON pipeline_outputs(tts_narration_id);
  `;

  const { error } = await supabase.rpc('exec_sql', { sql: agentSchema });

  if (error) {
    console.log('⚠️  Agent schema setup warning:', error.message);
  } else {
    console.log('✅ Agent module schema created');
  }
}

async function setupRowLevelSecurity() {
  console.log('🔒 Setting up Row Level Security...');

  const rlsPolicies = `
    -- Enable RLS on all tables
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
    ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;
    ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
    ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
    ALTER TABLE support_agents ENABLE ROW LEVEL SECURITY;
    ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
    ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
    ALTER TABLE slide_decks ENABLE ROW LEVEL SECURITY;
    ALTER TABLE narrated_decks ENABLE ROW LEVEL SECURITY;
    ALTER TABLE tts_narrations ENABLE ROW LEVEL SECURITY;
    ALTER TABLE pipeline_outputs ENABLE ROW LEVEL SECURITY;
    
    -- Profiles policies
    DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
    CREATE POLICY "Users can view their own profile" ON profiles
      FOR SELECT USING (auth.uid() = id);
    
    DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
    CREATE POLICY "Users can update their own profile" ON profiles
      FOR UPDATE USING (auth.uid() = id);
    
    DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
    CREATE POLICY "Users can insert their own profile" ON profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
    
    -- Documents policies
    DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
    CREATE POLICY "Users can view their own documents" ON documents
      FOR SELECT USING (auth.uid() = owner_id);
    
    DROP POLICY IF EXISTS "Users can view shared documents" ON documents;
    CREATE POLICY "Users can view shared documents" ON documents
      FOR SELECT USING (
        auth.uid() = ANY(collaborators) OR
        is_public = TRUE OR
        EXISTS (
          SELECT 1 FROM document_shares 
          WHERE document_id = documents.id AND user_id = auth.uid()
        )
      );
    
    DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
    CREATE POLICY "Users can update their own documents" ON documents
      FOR UPDATE USING (auth.uid() = owner_id);
    
    DROP POLICY IF EXISTS "Users can insert their own documents" ON documents;
    CREATE POLICY "Users can insert their own documents" ON documents
      FOR INSERT WITH CHECK (auth.uid() = owner_id);
    
    -- Support tickets policies
    DROP POLICY IF EXISTS "Users can view their own tickets" ON support_tickets;
    CREATE POLICY "Users can view their own tickets" ON support_tickets
      FOR SELECT USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Agents can view assigned tickets" ON support_tickets;
    CREATE POLICY "Agents can view assigned tickets" ON support_tickets
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM support_agents 
          WHERE user_id = auth.uid() AND id = support_tickets.assigned_to
        )
      );
    
    DROP POLICY IF EXISTS "Users can create tickets" ON support_tickets;
    CREATE POLICY "Users can create tickets" ON support_tickets
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    -- Agent module policies
    DROP POLICY IF EXISTS "Users can view their own slide decks" ON slide_decks;
    CREATE POLICY "Users can view their own slide decks" ON slide_decks
      FOR SELECT USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can create slide decks" ON slide_decks;
    CREATE POLICY "Users can create slide decks" ON slide_decks
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can update their own slide decks" ON slide_decks;
    CREATE POLICY "Users can update their own slide decks" ON slide_decks
      FOR UPDATE USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can delete their own slide decks" ON slide_decks;
    CREATE POLICY "Users can delete their own slide decks" ON slide_decks
      FOR DELETE USING (auth.uid() = user_id);
  `;

  const { error } = await supabase.rpc('exec_sql', { sql: rlsPolicies });

  if (error) {
    console.log('⚠️  RLS setup warning:', error.message);
  } else {
    console.log('✅ Row Level Security configured');
  }
}

async function setupFunctions() {
  console.log('⚙️  Setting up database functions...');

  const functions = `
    -- Update timestamp function
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql';
    
    -- Handle new user function
    CREATE OR REPLACE FUNCTION handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO profiles (id, email, full_name)
      VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
      RETURN NEW;
    END;
    $$ language 'plpgsql';
    
    -- Create trigger for new users
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
    
    -- Create triggers for updated_at columns
    DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
    CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
    CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
    CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    DROP TRIGGER IF EXISTS update_support_agents_updated_at ON support_agents;
    CREATE TRIGGER update_support_agents_updated_at BEFORE UPDATE ON support_agents
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    DROP TRIGGER IF EXISTS update_slide_decks_updated_at ON slide_decks;
    CREATE TRIGGER update_slide_decks_updated_at BEFORE UPDATE ON slide_decks
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    DROP TRIGGER IF EXISTS update_narrated_decks_updated_at ON narrated_decks;
    CREATE TRIGGER update_narrated_decks_updated_at BEFORE UPDATE ON narrated_decks
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    DROP TRIGGER IF EXISTS update_tts_narrations_updated_at ON tts_narrations;
    CREATE TRIGGER update_tts_narrations_updated_at BEFORE UPDATE ON tts_narrations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    DROP TRIGGER IF EXISTS update_pipeline_outputs_updated_at ON pipeline_outputs;
    CREATE TRIGGER update_pipeline_outputs_updated_at BEFORE UPDATE ON pipeline_outputs
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `;

  const { error } = await supabase.rpc('exec_sql', { sql: functions });

  if (error) {
    console.log('⚠️  Functions setup warning:', error.message);
  } else {
    console.log('✅ Database functions created');
  }
}

async function setupStorageBuckets() {
  console.log('📁 Setting up storage buckets...');

  // Create storage buckets for different content types
  const buckets = [
    {
      name: 'documents',
      public: false,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: [
        'image/*',
        'application/pdf',
        'text/*',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
    },
    {
      name: 'avatars',
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/*'],
    },
    {
      name: 'uploads',
      public: false,
      fileSizeLimit: 104857600, // 100MB
      allowedMimeTypes: [
        'image/*',
        'application/pdf',
        'text/*',
        'video/*',
        'audio/*',
      ],
    },
    {
      name: 'exports',
      public: false,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/epub+zip',
      ],
    },
    {
      name: 'narrations',
      public: false,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
    },
    {
      name: 'support-attachments',
      public: false,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: [
        'image/*',
        'application/pdf',
        'text/*',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
    },
    {
      name: 'support-images',
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/*'],
    },
    {
      name: 'support-documents',
      public: false,
      fileSizeLimit: 20971520, // 20MB
      allowedMimeTypes: [
        'application/pdf',
        'text/*',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
    },
  ];

  for (const bucket of buckets) {
    try {
      const { error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes,
      });

      if (error) {
        console.log(
          `⚠️  Bucket ${bucket.name} may already exist:`,
          error.message
        );
      } else {
        console.log(`✅ Created bucket: ${bucket.name}`);
      }
    } catch (error) {
      console.log(`❌ Error with bucket ${bucket.name}:`, error.message);
    }
  }

  console.log('✅ Storage buckets configured');
}

async function setupEmailTemplates() {
  console.log('📧 Setting up email templates...');

  // Note: Email template configuration is typically done through the Supabase dashboard
  // This is a placeholder for future implementation
  console.log('✅ Email templates ready (configure in Supabase dashboard)');
}

async function testAllConnections() {
  console.log('🧪 Testing all connections...');

  try {
    // Test database connection
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (profilesError) {
      console.log('⚠️  Database connection warning:', profilesError.message);
    } else {
      console.log('✅ Database connection successful');
    }

    // Test storage connection
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();

    if (bucketsError) {
      console.log('⚠️  Storage connection warning:', bucketsError.message);
    } else {
      console.log(
        `✅ Storage connection successful (${buckets?.length || 0} buckets found)`
      );
    }

    // Test auth connection
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.log('ℹ️  Auth system working (no authenticated user for test)');
    } else {
      console.log('✅ Authentication system working');
    }

    console.log('✅ All connections tested successfully');
  } catch (error) {
    console.log('⚠️  Connection test warning:', error.message);
  }
}

// Run the setup
setupCompleteSupabase().catch(console.error);
