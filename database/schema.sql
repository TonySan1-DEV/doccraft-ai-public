-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

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

-- Create document_versions table for version history
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  modified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_owner_id ON documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_shares_document_id ON document_shares(document_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_user_id ON document_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_room_id ON collaboration_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_user_id ON collaboration_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_active ON collaboration_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_version ON document_versions(version_number DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for documents
CREATE POLICY "Users can view their own documents" ON documents
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can view shared documents" ON documents
  FOR SELECT USING (
    auth.uid() = ANY(collaborators) OR
    is_public = TRUE OR
    EXISTS (
      SELECT 1 FROM document_shares 
      WHERE document_id = documents.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own documents" ON documents
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can update shared documents with write permission" ON documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM document_shares 
      WHERE document_id = documents.id 
      AND user_id = auth.uid() 
      AND permission IN ('write', 'admin')
    )
  );

CREATE POLICY "Users can delete their own documents" ON documents
  FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for document_shares
CREATE POLICY "Users can view shares for documents they own" ON document_shares
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents 
      WHERE id = document_shares.document_id 
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view shares for documents shared with them" ON document_shares
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Document owners can manage shares" ON document_shares
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM documents 
      WHERE id = document_shares.document_id 
      AND owner_id = auth.uid()
    )
  );

-- RLS Policies for collaboration_sessions
CREATE POLICY "Users can view their own sessions" ON collaboration_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view sessions in rooms they're in" ON collaboration_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM collaboration_sessions cs2 
      WHERE cs2.room_id = collaboration_sessions.room_id 
      AND cs2.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own sessions" ON collaboration_sessions
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for document_versions
CREATE POLICY "Users can view versions of their own documents" ON document_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents 
      WHERE id = document_versions.document_id 
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view versions of shared documents" ON document_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM document_shares 
      WHERE document_id = document_versions.document_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create versions for documents they can edit" ON document_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents 
      WHERE id = document_versions.document_id 
      AND owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM document_shares 
      WHERE document_id = document_versions.document_id 
      AND user_id = auth.uid() 
      AND permission IN ('write', 'admin')
    )
  );

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 