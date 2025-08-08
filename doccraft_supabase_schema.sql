
-- Users table (Supabase auth handles core, this adds profile metadata)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  created_at timestamp default now()
);

-- Uploaded documents
create table documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  filename text not null,
  file_type text,
  doc_type text, -- newsletter, ebook, etc.
  content text,
  status text default 'uploaded', -- uploaded | processing | enhanced
  created_at timestamp default now()
);

-- AI enhancements linked to document + section
create table enhancements (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  section_id text,
  original_text text,
  suggested_text text,
  image_url text,
  confidence_score numeric,
  mode text, -- auto | hybrid | manual
  created_at timestamp default now()
);

-- Generated or suggested images
create table images (
  id uuid primary key default gen_random_uuid(),
  enhancement_id uuid references enhancements(id),
  prompt_used text,
  source text, -- dalle, replicate, user_uploaded
  image_url text,
  created_at timestamp default now()
);

-- Export log for formats and snapshots
create table exports (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id),
  export_type text, -- pdf, epub, markdown
  export_url text,
  created_at timestamp default now()
);

-- Optional: saved user settings
create table user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  prefers_dark_mode boolean default false,
  interaction_mode text default 'hybrid'
);
