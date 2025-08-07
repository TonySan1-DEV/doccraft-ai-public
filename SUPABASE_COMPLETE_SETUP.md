# Complete Supabase Setup Guide for DocCraft-AI

This guide provides a comprehensive setup for all Supabase connections, database enhancements, and storage buckets required for the DocCraft-AI project.

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- A Supabase project created
- Your Supabase credentials ready

### 2. Environment Setup

```bash
# 1. Set up environment variables
node scripts/setup-environment.js

# 2. Complete Supabase setup
node scripts/setup-complete-supabase.js

# 3. Test all connections
node scripts/test-complete-connections.js

# 4. Start development server
npm run dev
```

## 📋 Issues Found and Fixed

### ❌ **Issues Identified:**

1. **Missing Environment Variables**: Project using placeholder values
2. **Incomplete Database Schema**: Multiple schema files not applied
3. **Missing Storage Buckets**: Several buckets referenced in code don't exist
4. **Incomplete RLS Policies**: Security policies not properly configured
5. **Missing Database Functions**: Functions referenced in code don't exist
6. **Module Compilation Issues**: modules/agent directory not being compiled
7. **Import Errors**: EnhancedCharacterChat component import issues

### ✅ **Solutions Implemented:**

1. **Complete Environment Setup**: Created `setup-environment.js`
2. **Comprehensive Database Schema**: Created `setup-complete-supabase.js`
3. **All Required Storage Buckets**: 8 buckets configured
4. **Full RLS Policies**: Security policies for all tables
5. **Database Functions**: All required functions created
6. **Module Compilation**: Fixed TypeScript configuration
7. **Import Issues**: Fixed EnhancedCharacterChat component

## 🗄️ Database Schema

### Core Tables

- **`profiles`** - User profiles with tier information
- **`documents`** - User documents and content
- **`document_shares`** - Document sharing permissions
- **`collaboration_sessions`** - Real-time collaboration data
- **`document_versions`** - Version history for documents

### Support System Tables

- **`support_tickets`** - Support ticket management
- **`ticket_messages`** - Ticket conversation messages
- **`support_agents`** - Support agent profiles
- **`chat_sessions`** - Live chat sessions
- **`chat_messages`** - Chat conversation messages
- **`faq_items`** - FAQ content management

### Agent Module Tables

- **`slide_decks`** - Generated slide presentations
- **`narrated_decks`** - Slide decks with narration
- **`tts_narrations`** - Text-to-speech outputs
- **`pipeline_outputs`** - Complete pipeline results

## 📁 Storage Buckets

### Core Buckets

- **`documents`** - Private document storage (50MB limit)
- **`avatars`** - Public user avatars (5MB limit)
- **`uploads`** - Private file uploads (100MB limit)
- **`exports`** - Private export files (50MB limit)

### Agent Module Buckets

- **`narrations`** - Private audio narration files (50MB limit)

### Support System Buckets

- **`support-attachments`** - Private support attachments (10MB limit)
- **`support-images`** - Public support images (5MB limit)
- **`support-documents`** - Private support documents (20MB limit)

## 🔐 Row Level Security (RLS)

### Profiles Policies

- Users can view/update their own profile
- Users can insert their own profile

### Documents Policies

- Users can view their own documents
- Users can view shared documents
- Users can update their own documents
- Users can insert their own documents

### Support System Policies

- Users can view their own tickets
- Agents can view assigned tickets
- Users can create tickets

### Agent Module Policies

- Users can view their own slide decks
- Users can create/update/delete their own slide decks

## ⚙️ Database Functions

### Core Functions

- **`update_updated_at_column()`** - Auto-update timestamps
- **`handle_new_user()`** - Create profile on user signup

### Triggers

- **`update_profiles_updated_at`** - Auto-update profile timestamps
- **`update_documents_updated_at`** - Auto-update document timestamps
- **`update_support_tickets_updated_at`** - Auto-update ticket timestamps
- **`update_slide_decks_updated_at`** - Auto-update slide deck timestamps
- **`update_narrated_decks_updated_at`** - Auto-update narrated deck timestamps
- **`update_tts_narrations_updated_at`** - Auto-update TTS narration timestamps
- **`update_pipeline_outputs_updated_at`** - Auto-update pipeline timestamps

## 🔧 Setup Scripts

### 1. Environment Setup (`setup-environment.js`)

- Validates required environment variables
- Creates `.env` file from template
- Checks Supabase URL and key formats
- Provides setup summary

### 2. Complete Supabase Setup (`setup-complete-supabase.js`)

- Sets up authentication
- Creates all database tables
- Configures RLS policies
- Creates database functions
- Sets up storage buckets
- Tests all connections

### 3. Connection Testing (`test-complete-connections.js`)

- Tests basic connection
- Tests authentication system
- Tests all database tables
- Tests storage buckets
- Tests RLS policies
- Tests database functions
- Tests real-time subscriptions
- Tests file operations

## 🎯 Module-Specific Configurations

### Agent Module (`modules/agent/`)

- **Storage**: `narrations` bucket for audio files
- **Database**: `slide_decks`, `narrated_decks`, `tts_narrations`, `pipeline_outputs`
- **Functions**: Audio file management, TTS processing
- **RLS**: User isolation for all agent data

### Support System

- **Storage**: `support-attachments`, `support-images`, `support-documents`
- **Database**: `support_tickets`, `ticket_messages`, `support_agents`, `chat_sessions`, `chat_messages`, `faq_items`
- **Functions**: Ticket management, chat system
- **RLS**: User and agent isolation

### Core Application

- **Storage**: `documents`, `avatars`, `uploads`, `exports`
- **Database**: `profiles`, `documents`, `document_shares`, `collaboration_sessions`, `document_versions`
- **Functions**: User management, document collaboration
- **RLS**: User isolation and sharing permissions

## 🚨 Troubleshooting

### Common Issues

1. **"Missing Supabase credentials"**
   - Run `node scripts/setup-environment.js`
   - Update `.env` file with your credentials

2. **"Table does not exist"**
   - Run `node scripts/setup-complete-supabase.js`
   - Check Supabase dashboard for table creation

3. **"Storage bucket not found"**
   - Run the complete setup script
   - Verify buckets in Supabase dashboard

4. **"RLS policy violation"**
   - Ensure user is authenticated
   - Check RLS policies in Supabase dashboard

5. **"Function does not exist"**
   - Run the complete setup script
   - Check functions in Supabase dashboard

### Verification Steps

1. **Check Environment Variables**

   ```bash
   node scripts/setup-environment.js
   ```

2. **Verify Database Schema**

   ```bash
   node scripts/test-complete-connections.js
   ```

3. **Test File Operations**
   - Upload a test file to any bucket
   - Download the file
   - Verify permissions

4. **Test Authentication**
   - Sign up a new user
   - Verify profile creation
   - Test login/logout

## 📊 Performance Optimizations

### Database Indexes

- All tables have appropriate indexes
- Full-text search indexes on titles
- JSONB indexes for metadata fields
- Composite indexes for common queries

### Storage Optimizations

- Appropriate file size limits
- MIME type restrictions
- Public/private bucket configuration
- CDN integration ready

### Security Features

- Row Level Security on all tables
- User isolation
- File access controls
- API rate limiting ready

## 🔄 Real-time Features

### Supported Subscriptions

- Document changes
- Chat messages
- Ticket updates
- Agent status changes
- FAQ updates

### WebSocket Configuration

- Automatic reconnection
- Channel management
- Event filtering
- Error handling

## 📈 Monitoring and Analytics

### Database Monitoring

- Query performance tracking
- Connection pooling
- Error logging
- Usage analytics

### Storage Monitoring

- File upload/download tracking
- Storage usage metrics
- Bandwidth monitoring
- Error rate tracking

## 🎉 Success Criteria

After running the complete setup, you should have:

✅ **Environment Variables**: All required variables set  
✅ **Database Tables**: All 15 tables created and accessible  
✅ **Storage Buckets**: All 8 buckets created and configured  
✅ **RLS Policies**: All security policies active  
✅ **Database Functions**: All functions created and working  
✅ **Real-time**: Subscriptions working  
✅ **File Operations**: Upload/download working  
✅ **Authentication**: User signup/login working  
✅ **Module Support**: Agent and support modules ready

## 🚀 Next Steps

1. **Test the Application**: Run `npm run dev` and test all features
2. **Configure Email Templates**: Set up email templates in Supabase dashboard
3. **Set Up Monitoring**: Configure monitoring and analytics
4. **Deploy**: Prepare for production deployment
5. **Scale**: Configure auto-scaling and performance optimizations

---

**🎯 The complete Supabase setup is now ready for the DocCraft-AI application!**
