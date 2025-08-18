# DocCraft-AI Developer Guide - Overview

## 🎯 Project Vision

DocCraft-AI is an advanced AI-powered document creation and storytelling platform that combines narrative intelligence, emotional analysis, and multi-agent coordination to deliver personalized content experiences.

## 🏗️ Architecture Overview

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + Supabase Edge Functions
- **Database**: PostgreSQL (primary) + MongoDB (specialized)
- **AI Services**: OpenAI integration with custom prompt engineering
- **Real-time**: WebSocket collaboration + Supabase real-time subscriptions
- **Testing**: Vitest + Playwright + Jest
- **Deployment**: Vercel + Docker + Kubernetes

## 📚 Module Architecture

### Core Modules
- **Agent System**: Multi-agent orchestration with contextual awareness
- **Emotion Arc**: Psychological analysis and emotional journey mapping
- **Narrative Dashboard**: Story structure and plot management
- **Style Profile**: Content styling and brand consistency
- **Theme Analysis**: Content theming and genre analysis

### Supporting Systems
- **Admin Dashboard**: User management and system monitoring
- **Support System**: Customer support automation
- **Audit System**: Comprehensive logging and compliance
- **MCP Integration**: Model Context Protocol for AI coordination

## 🚀 Quick Start

```bash
# Clone and setup
git clone <repository>
cd doccraft-ai-v3
npm install

# Development
npm run dev

# Testing
npm run test:unit
npm run test:e2e

# Build
npm run build
```

## 📖 Documentation Structure

- **01-architecture.md**: Detailed system architecture
- **02-setup-and-env.md**: Environment setup and configuration
- **03-build-and-deploy.md**: Build process and deployment
- **04-frontend.md**: Frontend architecture and components
- **05-backend.md**: Backend services and APIs
- **06-database.md**: Database schemas and migrations
- **07-integrations.md**: External service integrations
- **08-testing-and-quality.md**: Testing strategy and quality gates
- **09-conventions-and-standards.md**: Coding standards and conventions
- **10-operations-and-troubleshooting.md**: Operations and debugging

## 🔄 Auto-Generated Documentation

This documentation is automatically maintained through:
- **Git Hooks**: Pre-commit and pre-push validation
- **CI Checks**: Automated documentation verification
- **Change Detection**: Smart regeneration based on code changes
- **Schema Updates**: Automatic database and API documentation

## 📝 Changes Since Last Release

<!-- AUTO-GEN:BEGIN section=recent-changes -->
*No recent changes detected*
<!-- AUTO-GEN:END section=recent-changes -->

## 🧪 Development Workflow

1. **Feature Development**: Create feature branch from `develop`
2. **Documentation**: Update relevant docs or let auto-gen handle it
3. **Testing**: Run comprehensive test suite
4. **Code Review**: Submit PR with documentation updates
5. **CI Validation**: Automated checks ensure doc consistency
6. **Merge**: Merge to `develop` after approval

## 🔧 Maintenance Commands

```bash
# Generate all documentation
npm run docs:all

# Generate docs for changed areas only
npm run docs:changed

# Verify documentation consistency
npm run docs:verify

# Create/update Architecture Decision Record
npm run docs:adr
```

## 📊 Project Health

- **Build Status**: ✅ Stable
- **Test Coverage**: Comprehensive suite
- **Documentation**: Auto-maintained
- **Security**: Regular audits
- **Performance**: Continuous monitoring

---

**Changelog**
- `initial` - 2024-12-01 - Created initial developer guide structure
