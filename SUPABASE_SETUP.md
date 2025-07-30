# DocCraft-AI Supabase Setup Guide

This guide will help you set up Supabase specifically for DocCraft-AI with all necessary configurations for authentication, database, storage, and real-time features.

## 🚀 Quick Start

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Create a new organization (if needed)
5. Create a new project:
   - **Name**: `doccraft-ai`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier (upgrade later if needed)

### 2. Get Your Credentials

1. Go to your project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)
   - **Service role key** (starts with `eyJ...`)

### 3. Configure Environment Variables

1. Copy `supabase-config.env.example` to `.env`
2. Fill in your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Authentication Configuration
VITE_AUTH_REDIRECT_URL=http://localhost:5174/auth/callback
VITE_AUTH_SITE_URL=http://localhost:5174
```

### 4. Run Database Setup

```bash
# Install dependencies if not already installed
npm install

# Run the Supabase setup script
node scripts/setup-supabase.js
```

## 🗄️ Database Schema

The setup script will create the following tables:

### Core Tables
- **`profiles`** - User profiles with tier information
- **`documents`** - User documents and content
- **`document_shares`** - Document sharing permissions
- **`collaboration_sessions`** - Real-time collaboration data
- **`document_versions`** - Version history for documents

### Feature Tables
- **`feedback_events`** - User feedback on AI suggestions
- **`preference_versions`** - Versioned user preferences
- **`market_trends`** - Market trend data
- **`writer_profiles`** - Writer-specific profiles

## 🔐 Authentication Setup

### 1. Configure Auth Settings

In your Supabase dashboard:

1. Go to **Authentication** → **Settings**
2. Configure the following:

**Site URL**: `http://localhost:5174`
**Redirect URLs**: 
- `http://localhost:5174/auth/callback`
- `http://localhost:5174/dashboard`

### 2. Email Templates

1. Go to **Authentication** → **Email Templates**
2. Customize the following templates:
   - **Confirm signup**
   - **Reset password**
   - **Magic link**

### 3. Social Providers (Optional)

Configure social login providers:
1. Go to **Authentication** → **Providers**
2. Enable and configure:
   - **Google**
   - **GitHub**
   - **Discord**

## 🔒 Row Level Security (RLS)

All tables have RLS enabled with the following policies:

### Profiles Table
- Users can view/update their own profile
- Admins can view all profiles

### Documents Table
- Users can view their own documents
- Users can view shared documents
- Users can view public documents

### Feedback Events Table
- Users can only access their own feedback
- Rate limiting on feedback creation

### Preference Versions Table
- Users can only access their own preferences
- Version history is preserved

## 📁 Storage Setup

The setup script creates the following storage buckets:

- **`documents`** - Private document storage
- **`avatars`** - Public user avatars
- **`uploads`** - Private file uploads
- **`exports`** - Private export files

## ⚙️ Database Functions

### User Management
- `get_user_profile(user_id)` - Get user profile data
- `create_user_profile(user_id, profile_data)` - Create user profile

### Document Management
- `create_document(title, content, owner_id)` - Create new document
- `share_document(document_id, user_id, permission)` - Share document

### Collaboration
- `join_collaboration_session(room_id, user_id, user_name)` - Join collaboration
- `leave_collaboration_session(room_id, user_id)` - Leave collaboration

### Feedback System
- `create_feedback_event(...)` - Create feedback with sanitization
- `get_feedback_stats(...)` - Get feedback analytics
- `get_pattern_analytics(...)` - Get pattern performance

### Preference Versioning
- `create_preference_version(...)` - Create new preference version
- `restore_preference_version(...)` - Restore previous version
- `get_preference_version_history(...)` - Get version history

## 🔧 Advanced Configuration

### 1. Edge Functions (Optional)

For advanced features, deploy edge functions:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-id

# Deploy functions
supabase functions deploy
```

### 2. Real-time Subscriptions

Configure real-time subscriptions for:
- Document collaboration
- User presence
- Live feedback

### 3. Webhooks

Set up webhooks for:
- User registration
- Document updates
- Feedback events

## 🧪 Testing

### 1. Test Authentication

```bash
# Start the development server
npm run dev

# Test signup/login flow
# Test password reset
# Test email verification
```

### 2. Test Database Operations

```bash
# Test feedback system
npm run test:feedback

# Test preference versioning
npm run test:versioning

# Test preset system
npm run test:preset
```

### 3. Test Real-time Features

- Test document collaboration
- Test user presence
- Test live feedback

## 🚨 Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check environment variables
   - Verify redirect URLs
   - Check email templates

2. **Database Connection Errors**
   - Verify project URL and keys
   - Check RLS policies
   - Verify table permissions

3. **Storage Errors**
   - Check bucket permissions
   - Verify file size limits
   - Check MIME type restrictions

### Debug Commands

```bash
# Check Supabase connection
node scripts/test-supabase-connection.js

# Reset database (development only)
node scripts/reset-database.js

# View database logs
supabase logs
```

## 📊 Monitoring

### 1. Database Monitoring
- Monitor query performance
- Check RLS policy effectiveness
- Track storage usage

### 2. Authentication Monitoring
- Monitor signup/login rates
- Track password reset usage
- Check email delivery rates

### 3. Feature Usage
- Track feedback system usage
- Monitor preference versioning
- Check collaboration sessions

## 🔄 Updates and Maintenance

### Regular Tasks
1. **Weekly**: Check database performance
2. **Monthly**: Review RLS policies
3. **Quarterly**: Update email templates
4. **Annually**: Review security settings

### Backup Strategy
- Enable automatic backups
- Test restore procedures
- Document recovery processes

## 📞 Support

If you encounter issues:

1. Check the [Supabase documentation](https://supabase.com/docs)
2. Review the [Supabase Discord](https://discord.supabase.com)
3. Check [GitHub issues](https://github.com/supabase/supabase/issues)

---

**Next Steps**: After completing this setup, test all features and ensure everything works correctly before deploying to production. 