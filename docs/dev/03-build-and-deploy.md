# Build and Deployment Guide

## Overview

This document describes the build process, deployment strategies, and CI/CD pipeline configuration for DocCraft-AI.

## Build System

### Technology Stack

- **Build Tool**: Vite 5.x
- **Bundler**: Rollup (via Vite)
- **Transpiler**: TypeScript + SWC
- **Package Manager**: npm

### Build Configurations

#### Development Build

```bash
npm run dev
```

**Features**:
- Hot Module Replacement (HMR)
- Source maps enabled
- Unminified code
- Fast refresh for React components

#### Production Build

```bash
npm run build
```

**Features**:
- Code minification and optimization
- Tree shaking
- Asset optimization
- Bundle splitting

#### Optimized Build

```bash
npm run build:optimized
```

**Features**:
- Advanced optimizations
- Bundle analysis
- Performance profiling
- Custom Vite configuration

### Build Process

1. **Dependency Resolution**: npm installs all dependencies
2. **Type Checking**: TypeScript compilation (optional in production)
3. **Bundling**: Vite bundles all source files
4. **Optimization**: Code splitting, minification, tree shaking
5. **Asset Processing**: Images, fonts, and other assets
6. **Output Generation**: Production-ready files in `dist/` directory

## Deployment Strategies

### 1. Vercel Deployment (Recommended)

#### Automatic Deployment

```bash
# Connect to Vercel
vercel

# Deploy to production
vercel --prod
```

#### Manual Deployment

```bash
# Build for Vercel
npm run build:vercel

# Deploy using Vercel CLI
vercel --prod
```

#### Environment Configuration

Create `vercel.json` in project root:

```json
{
  "buildCommand": "npm run build:vercel",
  "outputDirectory": "dist",
  "framework": "vite",
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```

### 2. Docker Deployment

#### Dockerfile

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose

```yaml
version: '3.8'
services:
  doccraft-ai:
    build: .
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

### 3. Kubernetes Deployment

#### Deployment Manifest

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: doccraft-ai
spec:
  replicas: 3
  selector:
    matchLabels:
      app: doccraft-ai
  template:
    metadata:
      labels:
        app: doccraft-ai
    spec:
      containers:
      - name: doccraft-ai
        image: doccraft-ai:latest
        ports:
        - containerPort: 80
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
```

#### Service Manifest

```yaml
apiVersion: v1
kind: Service
metadata:
  name: doccraft-ai-service
spec:
  selector:
    app: doccraft-ai
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer
```

## CI/CD Pipeline

### GitHub Actions

#### Documentation Guard

```yaml
# .github/workflows/docs-guard.yml
name: Documentation Guard
on: [pull_request, push]
jobs:
  verify-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run docs:changed
      - run: npm run docs:verify
```

#### Build and Test

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:unit
      - run: npm run build
      - run: npm run test:e2e
```

### Build Stages

1. **Install**: Install dependencies
2. **Lint**: Run ESLint and Prettier
3. **Test**: Execute test suite
4. **Build**: Create production build
5. **Deploy**: Deploy to target environment

## Environment Management

### Environment Variables

#### Development

```bash
# .env.local
NODE_ENV=development
VITE_API_URL=http://localhost:3001
VITE_DEBUG=true
```

#### Production

```bash
# .env.production
NODE_ENV=production
VITE_API_URL=https://api.doccraft-ai.com
VITE_DEBUG=false
```

#### Staging

```bash
# .env.staging
NODE_ENV=staging
VITE_API_URL=https://staging-api.doccraft-ai.com
VITE_DEBUG=true
```

### Configuration Files

#### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lodash', 'moment']
        }
      }
    }
  }
})
```

#### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## Performance Optimization

### Build Optimization

1. **Code Splitting**: Automatic route-based splitting
2. **Tree Shaking**: Remove unused code
3. **Minification**: Compress JavaScript and CSS
4. **Asset Optimization**: Optimize images and fonts

### Runtime Optimization

1. **Lazy Loading**: Load components on demand
2. **Caching**: Implement proper cache headers
3. **CDN**: Use Content Delivery Network
4. **Compression**: Enable gzip/brotli compression

## Monitoring and Observability

### Build Metrics

- Build time
- Bundle size
- Asset count
- Dependency tree

### Runtime Metrics

- Page load time
- Time to interactive
- Core Web Vitals
- Error rates

### Tools

- **Bundle Analyzer**: `npm run analyze`
- **Lighthouse**: Performance auditing
- **Web Vitals**: Core metrics monitoring
- **Error Tracking**: Sentry integration

## Troubleshooting

### Common Build Issues

#### 1. Memory Issues

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

#### 2. TypeScript Errors

```bash
# Skip type checking for deployment
npm run typecheck:skip
npm run build
```

#### 3. Dependency Issues

```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Deployment Issues

#### 1. Environment Variables

```bash
# Verify environment file
cat .env.production

# Check variable loading
npm run env:verify
```

#### 2. Build Failures

```bash
# Check build logs
npm run build --verbose

# Verify dependencies
npm ls
```

#### 3. Runtime Errors

```bash
# Check application logs
npm run logs

# Verify configuration
npm run config:verify
```

## Security Considerations

### Build Security

- Audit dependencies regularly
- Use lockfiles for reproducible builds
- Scan for vulnerabilities
- Sign builds when possible

### Deployment Security

- Use HTTPS in production
- Implement proper CORS policies
- Secure environment variables
- Regular security updates

---

**Changelog**
- `initial` - 2024-12-01 - Created initial build and deployment documentation
