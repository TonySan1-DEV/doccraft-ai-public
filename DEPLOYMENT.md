# DocCraft-AI Vercel Deployment Guide

## Prerequisites

1. Vercel account connected to GitHub
2. Required API keys (Supabase, OpenAI, Unsplash)
3. Node.js 18+ and npm 8+

## Deployment Steps

### 1. Import Repository in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `doccraft-ai` repository

### 2. Configure Build Settings

The following settings are automatically detected:

- **Framework**: Vite
- **Build Command**: `npm run build:vercel`
- **Output Directory**: `dist`
- **Install Command**: `npm ci --omit=dev`

### 3. Configure Environment Variables

In Vercel Project Settings > Environment Variables, add:

#### Required Variables:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
OPENAI_API_KEY=sk-proj-your-openai-key-here
VITE_OPENAI_API_KEY=sk-proj-your-openai-key-here
VITE_UNSPLASH_ACCESS_KEY=your-unsplash-access-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Note:** Both `OPENAI_API_KEY` (server-side) and `VITE_OPENAI_API_KEY` (client-side) are required for full AI functionality.

#### Optional Variables:

```
VITE_ENABLE_COLLABORATION=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_VOICE_FEATURES=true
NODE_ENV=production
```

### 4. Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Verify deployment success

## OpenAI API Key Configuration

### Environment Variables Required

The application uses OpenAI API keys in two contexts:

1. **OPENAI_API_KEY** (Server-side)
   - Used by: `server/openai-proxy.js`, `src/services/engagementAnalyzer.ts`
   - Environment: Production, Preview, Development
   - Purpose: Direct OpenAI API calls from server-side services

2. **VITE_OPENAI_API_KEY** (Client-side)
   - Used by: Client-side services making calls to `/api/openai/chat`
   - Environment: Production, Preview, Development
   - Purpose: Client-side OpenAI API calls through proxy endpoints

### Configuration Steps

1. **Vercel Dashboard**: Add both variables in Project Settings > Environment Variables
2. **Local Development**: Copy `env.template` to `.env.local` and fill in your keys
3. **CI/CD**: Ensure both variables are available in your CI environment

### Usage Patterns

- **Server-side**: Direct OpenAI SDK calls using `process.env.OPENAI_API_KEY`
- **Client-side**: HTTP requests to proxy endpoints using `import.meta.env.VITE_OPENAI_API_KEY`
- **Fallback**: Services gracefully degrade when API keys are unavailable

## Build Configuration

### TypeScript Configuration

- Uses `tsconfig.vercel.json` for deployment
- Excludes server files, tests, and development tools
- Optimized for production builds

### Vite Configuration

- Optimized chunk splitting for better performance
- Terser minification with console removal
- ES2020 target for modern browsers

### Package.json Scripts

- `build:vercel`: TypeScript check + Vite build
- `postinstall`: Conditional Playwright installation (skipped on Vercel)

## Deployment Features

### Routing

- SPA routing with fallback to index.html
- Clean URLs enabled
- Proper asset caching headers

### Security Headers

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### Performance

- Asset caching (1 year for static assets)
- Code splitting and chunk optimization
- Tree shaking and dead code elimination

## Troubleshooting

### Common Issues

#### Build Failures

1. Check TypeScript compilation errors
2. Verify environment variables are set
3. Ensure all dependencies are properly installed

#### Runtime Errors

1. Check browser console for client-side errors
2. Verify Supabase connection
3. Check API key validity

#### Performance Issues

1. Monitor bundle size in build output
2. Check for large dependencies
3. Verify chunk splitting is working

### Debug Commands

```bash
# Test Vercel build locally
VERCEL=1 npm run build:vercel

# Test preview
npm run preview

# Verify no Playwright errors
npm install --production

# Check environment variable loading
echo "Verify env.template exists and is documented"
```

## Post-Deployment

### Verification Checklist

- [ ] Application loads without errors
- [ ] Authentication works with Supabase
- [ ] AI features are functional
- [ ] Image generation works
- [ ] Responsive design is correct
- [ ] Performance metrics are acceptable

### Monitoring

- Set up Vercel Analytics
- Monitor Core Web Vitals
- Track error rates and performance

## Advanced Configuration

### Custom Domains

1. Add custom domain in Vercel dashboard
2. Configure DNS records
3. Enable HTTPS

### Environment-Specific Deployments

- Production: Main branch
- Preview: Pull requests
- Development: Feature branches

### CI/CD Integration

- Automatic deployments on push to main
- Preview deployments for pull requests
- Environment-specific builds

## Support

For deployment issues:

1. Check Vercel build logs
2. Review TypeScript compilation output
3. Verify environment variable configuration
4. Check browser console for runtime errors

## Notes

- Server-side features (collaboration, real-time) are excluded from static deployment
- Advanced features can be added in subsequent deployment phases
- The application is optimized for frontend-only deployment on Vercel
