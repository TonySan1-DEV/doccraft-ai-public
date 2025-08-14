# 🚀 DocCraft-AI Vercel Deployment Guide

## Environment Variables Setup

Add these environment variables in Vercel Dashboard → Settings → Environment Variables:

### Required Variables:

1. **VITE_SUPABASE_URL**
   - Value: Your Supabase project URL
   - Environment: Production, Preview, Development

2. **VITE_SUPABASE_ANON_KEY**
   - Value: Your Supabase anon key
   - Environment: Production, Preview, Development

3. **OPENAI_API_KEY**
   - Value: Your OpenAI API key (sk-proj-...)
   - Environment: Production, Preview, Development

4. **VITE_UNSPLASH_ACCESS_KEY**
   - Value: Your Unsplash access key
   - Environment: Production, Preview, Development

5. **SUPABASE_SERVICE_ROLE_KEY**
   - Value: Your Supabase service role key
   - Environment: Production, Preview, Development

## Build Configuration

Vercel will automatically detect:

- Framework: Vite
- Build Command: `npm run build:vercel`
- Output Directory: `dist`
- Install Command: `npm ci`

## Deployment Process

1. **Connect Repository**: Import from GitHub
2. **Configure Environment Variables**: Add all 5 variables above
3. **Deploy**: Vercel handles the rest automatically

## Troubleshooting

### Common Issues:

- **Playwright errors**: Fixed by conditional postinstall script
- **Environment variables**: Ensure all 5 variables are set
- **Build failures**: Check build logs for TypeScript errors

### Success Indicators:

- ✅ Build completes without Playwright errors
- ✅ All environment variables detected
- ✅ Application loads with Supabase connection
- ✅ AI features functional (OpenAI integration)

## Performance Optimizations

- **Edge Functions**: API routes run on Vercel Edge
- **Static Generation**: React app pre-built for optimal performance
- **CDN**: Global content delivery for fast loading
- **Analytics**: Built-in performance monitoring

## API Routes

The following API endpoints are configured:

- `/api/character-chat/*` → Character chat functionality
- `/api/collaboration/*` → Real-time collaboration features

## Security

- CORS headers configured for API routes
- Environment variables properly isolated
- No sensitive data in client-side code

## Monitoring

- Vercel Analytics included
- Performance monitoring enabled
- Error tracking available
