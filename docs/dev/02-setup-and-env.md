# Setup and Environment Configuration

## Overview

This document describes the environment setup, configuration, and development prerequisites for DocCraft-AI.

## Prerequisites

### System Requirements

- **Node.js**: Version 18.x or higher (20.x recommended)
- **npm**: Version 8.x or higher
- **Git**: Version 2.x or higher
- **Operating System**: Windows 10+, macOS 10.15+, or Linux

### Development Tools

- **Code Editor**: VS Code (recommended) or any modern editor
- **Terminal**: PowerShell (Windows), Terminal (macOS), or bash (Linux)
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

## Environment Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd doccraft-ai-v3
```

### 2. Install Dependencies

```bash
npm install
```

This will automatically:
- Install all npm dependencies
- Set up Husky git hooks
- Install Playwright browser dependencies

### 3. Environment Configuration

#### Required Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Database Configuration
DATABASE_URL=your_postgres_connection_string
MONGODB_URI=your_mongodb_connection_string

# Application Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# External Services
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

#### Environment File Templates

- `.env.example`: Template with all required variables
- `.env.local`: Local development overrides
- `.env.production`: Production environment variables

### 4. Database Setup

#### PostgreSQL (Supabase)

1. **Create Supabase Project**:
   - Visit [supabase.com](https://supabase.com)
   - Create new project
   - Note project URL and anon key

2. **Run Migrations**:
   ```bash
   npm run db:migrate
   ```

3. **Seed Database** (optional):
   ```bash
   npm run db:seed
   ```

#### MongoDB

1. **Setup MongoDB**:
   - Local installation or MongoDB Atlas
   - Create database and user
   - Update connection string in `.env.local`

2. **Verify Connection**:
   ```bash
   npm run supabase:test
   ```

### 5. AI Services Setup

#### OpenAI

1. **Get API Key**:
   - Visit [platform.openai.com](https://platform.openai.com)
   - Create account and generate API key
   - Add to `.env.local`

2. **Test Connection**:
   ```bash
   npm run test:ai
   ```

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 2. Run Tests

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e

# All tests
npm run test:comprehensive
```

### 3. Build and Deploy

```bash
# Development build
npm run build

# Production build
npm run build:production

# Vercel deployment
npm run build:vercel
```

## Configuration Files

### Package.json Scripts

Key development scripts:

- `dev`: Start development server
- `build`: Build for production
- `test`: Run test suite
- `lint`: Run ESLint
- `type-check`: TypeScript type checking
- `docs:all`: Generate all documentation
- `docs:changed`: Generate docs for changed areas

### Vite Configuration

- `vite.config.ts`: Main Vite configuration
- `vite.config.optimized.ts`: Optimized build configuration
- `tsconfig.json`: TypeScript configuration
- `tsconfig.prod.json`: Production TypeScript settings

### ESLint and Prettier

- `.eslintrc.js`: ESLint rules and configuration
- `.prettierrc`: Prettier formatting rules
- `.eslintignore`: Files to ignore during linting

## Troubleshooting

### Common Issues

#### 1. Dependency Installation

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 2. Environment Variables

```bash
# Verify environment file exists
ls -la .env*

# Check variable loading
npm run env:verify
```

#### 3. Database Connection

```bash
# Test Supabase connection
npm run supabase:test

# Reset database (development only)
npm run db:reset
```

#### 4. Build Issues

```bash
# Clear build cache
rm -rf .next dist

# Rebuild
npm run build
```

### Getting Help

1. **Check Logs**: Review console output and error messages
2. **Documentation**: Refer to this guide and other docs
3. **Issues**: Check GitHub issues for known problems
4. **Community**: Reach out to the development team

## Security Considerations

### Environment Variables

- Never commit `.env.local` or `.env.production` to version control
- Use `.env.example` for templates
- Rotate API keys regularly
- Use environment-specific configurations

### Development Security

- Run security audits: `npm audit`
- Keep dependencies updated: `npm update`
- Use HTTPS in production
- Implement proper authentication and authorization

## Performance Optimization

### Development

- Use React DevTools for component profiling
- Monitor bundle size with `npm run analyze`
- Enable source maps for debugging
- Use React.StrictMode for development

### Production

- Enable code splitting and lazy loading
- Optimize images and assets
- Use CDN for static content
- Implement caching strategies

---

**Changelog**
- `initial` - 2024-12-01 - Created initial setup and environment documentation
