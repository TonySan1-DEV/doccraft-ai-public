# DocCraft-AI Environment Setup Guide

## Overview

This guide explains how to configure environment variables for DocCraft-AI, ensuring all AI features work correctly in both development and production environments.

## Required Environment Variables

### 1. Supabase Configuration

```bash
# Database and Authentication
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Purpose**: Database connection, user authentication, and real-time features.

### 2. OpenAI API Keys

```bash
# Server-side OpenAI calls
OPENAI_API_KEY=sk-proj-your-openai-key-here

# Client-side OpenAI calls
VITE_OPENAI_API_KEY=sk-proj-your-openai-key-here
```

**Critical**: Both variables are required for full AI functionality.

**Usage Patterns**:

- `OPENAI_API_KEY`: Used by server-side services (`server/openai-proxy.js`, `src/services/engagementAnalyzer.ts`)
- `VITE_OPENAI_API_KEY`: Used by client-side services making calls to proxy endpoints

### 3. External APIs

```bash
# Image generation and search
VITE_UNSPLASH_ACCESS_KEY=your-unsplash-access-key
```

**Purpose**: Image suggestions and stock photo integration.

### 4. Feature Flags

```bash
# Optional features
VITE_ENABLE_COLLABORATION=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_VOICE_FEATURES=true
```

## Setup Instructions

### Local Development

1. **Copy template**:

   ```bash
   cp env.template .env.local
   ```

2. **Fill in your values**:
   - Get OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Get Supabase credentials from your project dashboard
   - Get Unsplash access key from [Unsplash Developers](https://unsplash.com/developers)

3. **Verify setup**:
   ```bash
   npm run dev
   ```

### Vercel Deployment

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables

2. **Add all required variables**:
   - `OPENAI_API_KEY` → `@openai_api_key`
   - `VITE_OPENAI_API_KEY` → `@vite_openai_api_key`
   - `VITE_SUPABASE_URL` → `@vite_supabase_url`
   - `VITE_SUPABASE_ANON_KEY` → `@vite_supabase_anon_key`
   - `SUPABASE_SERVICE_ROLE_KEY` → `@supabase_service_role_key`
   - `VITE_UNSPLASH_ACCESS_KEY` → `@vite_unsplash_access_key`

3. **Set values** for each environment (Production, Preview, Development)

### CI/CD Pipeline

Ensure these variables are available in your CI environment:

```yaml
# GitHub Actions example
env:
  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  VITE_OPENAI_API_KEY: ${{ secrets.VITE_OPENAI_API_KEY }}
  VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
  VITE_UNSPLASH_ACCESS_KEY: ${{ secrets.VITE_UNSPLASH_ACCESS_KEY }}
```

## Verification

### Test OpenAI Integration

1. **Check server-side**:

   ```bash
   node -e "console.log('Server OpenAI:', process.env.OPENAI_API_KEY ? 'Set' : 'Missing')"
   ```

2. **Check client-side**:

   ```bash
   node -e "console.log('Client OpenAI:', process.env.VITE_OPENAI_API_KEY ? 'Set' : 'Missing')"
   ```

3. **Test AI features**:
   - Character interaction
   - Content analysis
   - Image suggestions

### Common Issues

1. **"No OpenAI API key available"**
   - Check both `OPENAI_API_KEY` and `VITE_OPENAI_API_KEY` are set
   - Verify variable names match exactly

2. **"OpenAI proxy error"**
   - Ensure `OPENAI_API_KEY` is set for server-side calls
   - Check API key validity and quota

3. **"Environment variable not found"**
   - Restart development server after adding variables
   - Check file naming (`.env.local`, not `.env`)

## Security Notes

- **Never commit** `.env.local` or `.env` files
- **Use Vercel secrets** for production deployments
- **Rotate API keys** regularly
- **Monitor usage** to prevent quota exhaustion

## Support

For environment setup issues:

1. Check this guide first
2. Verify all required variables are set
3. Test with minimal configuration
4. Check Vercel deployment logs
5. Review browser console for client-side errors
