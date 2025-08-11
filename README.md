# DocCraft-AI v3

![CI Status](https://github.com/YOUR_USERNAME/doccraft-ai-v3/actions/workflows/ci.yml/badge.svg)
![Test Status](https://github.com/YOUR_USERNAME/doccraft-ai-v3/actions/workflows/test.yml/badge.svg)
![Lint Status](https://github.com/YOUR_USERNAME/doccraft-ai-v3/actions/workflows/lint.yml/badge.svg)
![Type Check](https://github.com/YOUR_USERNAME/doccraft-ai-v3/actions/workflows/typecheck.yml/badge.svg)
![Coverage](https://github.com/YOUR_USERNAME/doccraft-ai-v3/actions/workflows/coverage.yml/badge.svg)
![Deploy](https://vercel.com/docs/badges?app=doccraft-ai-v3&style=flat)

## Overview

DocCraft-AI v3 is an advanced AI-powered document processing and content generation platform that leverages contextual prompt engineering and emotional arc analysis to create engaging, personalized content. Built with modern web technologies and a modular architecture, it provides a comprehensive solution for AI-assisted content creation.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [MCP Setup](#-mcp-setup)
- [Environment Variables](#-environment-variables)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Deployment](#️-deployment)
- [Architecture](#architecture)
- [Development](#development)
- [Linting Policy](#-linting-policy)
  - [Scales & Lint - How to Fix](#scales-and-lint-how-to-fix)
- [Contributing](#contributing)
- [Support](#support)
- [Roadmap](#roadmap)

## Features

### 🤖 **AI-Powered Content Generation**

- **Contextual Prompt Engineering**: Dynamic prompt generation based on user preferences and document context
- **Emotional Arc Analysis**: Advanced sentiment analysis and emotional journey mapping
- **Genre-Specific Patterns**: Tailored content patterns for different genres and story arcs
- **Real-time Suggestions**: Live content suggestions and optimization recommendations

### 📊 **Advanced Analytics & Diagnostics**

- **Fallback Diagnostics**: Comprehensive logging and monitoring of prompt fallback behavior
- **Performance Metrics**: Real-time performance tracking and optimization insights
- **Audit Logging**: Complete audit trail for compliance and debugging
- **Market Trend Analysis**: Publishing trend analysis and market insights

### 🔧 **Developer Experience**

- **TypeScript Support**: Full TypeScript implementation with strict type checking
- **Comprehensive Testing**: Jest-based unit tests with 100% coverage
- **CI/CD Pipeline**: Automated testing and deployment with GitHub Actions
- **Modular Architecture**: Clean, maintainable codebase with clear separation of concerns

## Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Supabase account and project
- OpenAI API key
- Cursor AI Desktop (for MCP integration)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/doccraft-ai-v3.git
cd doccraft-ai-v3

# Install dependencies
npm install

# Set up environment variables
cp env.local.example .env.local

# Run tests
npm test

# Start development server
npm run dev
```

## 🔌 MCP Setup

DocCraft-AI v3 includes a Model Context Protocol (MCP) server for enhanced AI assistance in Cursor AI Desktop.

### Prerequisites

1. Ensure you have Node.js >=18 installed
2. Install Cursor AI Desktop
3. Have the project cloned locally

### Setup Instructions

1. **Start Cursor AI Desktop**
2. **Open the project** in Cursor
3. **MCP server will automatically launch** via the configured command:
   ```bash
   npm run mcp
   ```

### MCP Features

- **Contextual Engineering**: Provides project-specific context to AI assistants
- **CI/CD Awareness**: Integrates with GitHub Actions and deployment pipelines
- **Database Context**: Access to Supabase schema and data patterns
- **Environment Management**: Secure handling of environment variables

### Development Mode

For development with auto-reload:

```bash
npm run mcp:watch
```

### Validation

The MCP configuration is validated in CI/CD:

```bash
node scripts/validate-mcp-config.js
```

### Usage

#### Basic Prompt Generation

```typescript
import { buildContextualPromptHeader } from './src/agent/ContextualPromptEngine';

const prefs = {
  tone: 'friendly',
  language: 'en',
  genre: 'Romance',
};

const context = {
  scene: 'Opening scene',
  arc: 'setup',
  characterName: 'Sarah',
};

const header = buildContextualPromptHeader(prefs, context);
console.log(header.header);
```

#### Fallback Diagnostics

```typescript
import {
  logFallbackWarning,
  getDiagnostics,
} from './src/agent/ContextualPromptEngine';

// Log fallback events (debug mode)
logFallbackWarning('UnknownGenre', 'unknown', 'DEFAULT pattern', true);

// Get diagnostics
const diagnostics = getDiagnostics();
console.log('Fallback events:', diagnostics.length);
```

## 🔐 Environment Variables

The following environment variables are required for full functionality:

### Required Variables

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### Optional Variables

```bash
# For production deployment
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# For audit logging (optional)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=doccraft-audit-logs
```

## 📈 CI/CD Pipeline

DocCraft-AI v3 uses a modular CI/CD pipeline with GitHub Actions:

### Orchestrator (`ci.yml`)

- **Main orchestrator** that calls all modular workflows
- **Parallel execution** of all jobs for faster feedback
- **Comprehensive status reporting** with detailed PR comments
- **Audit workflow integration** with proper secret inheritance

### Modular Workflows

- **`lint.yml`** - ESLint code linting and formatting checks
- **`typecheck.yml`** - TypeScript type checking and validation
- **`test.yml`** - Unit tests execution with Jest
- **`coverage.yml`** - Code coverage analysis and reporting
- **`emotionArc.yml`** - Emotion Arc module specific tests and validation

### Audit Workflows

- **`export-audit-logs.yml`** - Export audit logs to S3/BigQuery
- **`reingest-audit-logs.yml`** - Reingest audit logs from external sources

### Benefits

- **Modularity**: Each workflow has a single responsibility
- **Reusability**: Workflows can run independently or as part of the orchestrator
- **Maintainability**: Changes to one workflow don't affect others
- **Parallelization**: All workflows run in parallel for faster CI feedback

## ☁️ Deployment

DocCraft-AI v3 is designed for deployment on Vercel:

### Vercel Deployment

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Configure Environment Variables**: Add all required environment variables in Vercel dashboard
3. **Deploy**: Automatic deployments on every push to main branch

### Environment Setup

```bash
# Production environment variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.vercel.app
```

### Build Configuration

- **Framework**: Next.js 13+ with App Router
- **Node Version**: 18.x
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

## Architecture

### Core Components

#### **ContextualPromptEngine**

- **Purpose**: Generates contextual prompts based on user preferences and document context
- **Features**:
  - Genre-specific pattern matching
  - Fallback diagnostics and logging
  - Memoization for performance
  - Character name injection

#### **EmotionalArcModule**

- **Purpose**: Analyzes and manages emotional journeys in content
- **Features**:
  - Sentiment analysis
  - Emotional arc visualization
  - Tension curve mapping
  - Optimization suggestions

#### **Audit System**

- **Purpose**: Comprehensive logging and monitoring
- **Features**:
  - Pattern moderation logging
  - Performance metrics
  - Compliance tracking
  - Debug diagnostics

### Testing Strategy

#### **Unit Tests**

- **Coverage**: 100% test coverage for all core functions
- **Framework**: Jest with TypeScript support
- **Mocking**: Comprehensive mocking for external dependencies
- **Edge Cases**: Extensive edge case testing

#### **Integration Tests**

- **End-to-End**: Full workflow testing
- **Performance**: Load and stress testing
- **Fallback Scenarios**: Comprehensive fallback testing

## Development

### Project Structure

```
src/
├── agent/
│   ├── ContextualPromptEngine.ts    # Core prompt engine
│   ├── PromptPatternLibrary.ts      # Pattern definitions
│   └── __tests__/                   # Test files
├── components/                       # React components
├── services/                        # Business logic
└── utils/                          # Utility functions
```

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- ContextualPromptEngine.test.ts
```

### Code Quality

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Formatting
npm run format
```

## 🔍 Linting Policy

DocCraft-AI v3 enforces strict code quality standards through automated linting:

### **Automated Linting**

- **ESLint + Prettier**: Run automatically on save in Cursor Desktop
- **Husky Pre-commit**: Lint-staged runs before every commit (auto-installed via `npm install`)
- **CI/CD Enforcement**: GitHub Actions fails if lint errors exist (`--max-warnings 0`)

### **Manual Linting Commands**

```bash
# Run linting with auto-fix
npm run lint:fix

# Run strict linting (no warnings allowed)
npm run lint:strict

# Run all pre-commit checks
npm run pre-commit
```

### **Lint-staged Configuration**

Automatically formats and lints staged files:

- **JavaScript/TypeScript**: ESLint + Prettier
- **JSON/CSS/Markdown**: Prettier formatting
- **Pre-commit Hook**: Runs before every commit

### **Recent Cleanup Progress**

- **Before**: 1107 problems (70 errors, 1037 warnings)
- **After**: 259 problems (0 errors, 259 warnings)
- **Improvement**: 848 issues resolved (76.6% reduction)
- **Status**: ✅ **ALL ERRORS ELIMINATED!**
- **Documentation**: See [docs/LINTING_CLEANUP_PROGRESS.md](docs/LINTING_CLEANUP_PROGRESS.md)

### **Scales & Lint - How to Fix** {#scales-and-lint-how-to-fix}

When working with emotion data in the `modules/emotionArc` module, follow these scaling rules:

#### **Quick Cheat Sheet**

| Field Type         | Scale | Data Format      | Display Format       | Example |
| ------------------ | ----- | ---------------- | -------------------- | ------- |
| **Emotion Fields** | 0–100 | `intensity: 75`  | Use as-is            | `75%`   |
| **Position**       | 0–1   | `position: 0.5`  | `toPercentDisplay()` | `50%`   |
| **Tension**        | 0–100 | `tension: 60`    | Use as-is            | `60%`   |
| **Confidence**     | 0–100 | `confidence: 90` | Use as-is            | `90%`   |

#### **Emotion Magnitudes (0–100)**

```typescript
// ✅ Correct - emotion fields are 0–100
const intensity = 75; // 0–100 scale
const confidence = 90; // 0–100 scale
const tension = 60; // 0–100 scale
const empathy = 85; // 0–100 scale

// ❌ Wrong - don't multiply by 100
const bad = intensity * 100; // ESLint will flag this
```

#### **Position Values (0–1)**

```typescript
// ✅ Correct - position is 0–1, display with toPercentDisplay
const position = 0.5; // 0–1 scale
const display = toPercentDisplay(position); // Shows "50%"

// ❌ Wrong - don't multiply position by 100 directly
const bad = position * 100; // ESLint will suggest toPercentDisplay()
```

#### **Auto-Fix Suggestions**

The ESLint plugin provides one-click fixes:

- **For position**: `position * 100` → `toPercentDisplay(position)`
- **For emotion fields**: `intensity * 100` → `intensity` (remove the multiplication)

#### **UI Display Only**

```typescript
// ✅ Allowed - UI formatting functions
const display = formatPercentage(position * 100); // OK in UI formatters
const percent = renderPercent(intensity); // OK in UI formatters
```

#### **When ESLint Complains**

The emotion scaling ESLint plugin will flag these common issues with auto-fix suggestions:

- **`"Remove *100 or /100 for intensity since it's already 0–100"`**
  - **Fix**: Remove the multiplication/division
  - **Example**: `intensity * 100` → `intensity`

- **`"Wrap in toPercentDisplay(...) if this is UI display for a 0–1 value"`**
  - **Fix**: Use `toPercentDisplay()` for position values
  - **Example**: `position * 100` → `toPercentDisplay(position)`

- **`"Avoid multiplying by 100 on emotion data (0–100 domain)"`**
  - **Fix**: Use data as-is or proper UI formatters
  - **Example**: `tension * 100` → `tension` or `formatPercentage(tension)`

#### **Utilities Reference**

Scaling utilities are available in [`modules/emotionArc/utils/scaling.ts`](modules/emotionArc/utils/scaling.ts):

```typescript
import {
  toPercentDisplay, // Convert 0–1 to "50%"
  clamp100, // Clamp value to 0–100
  assert0to100, // Validate 0–100 range
  formatPercentage, // Format for UI display
} from '../utils/scaling';
```

### **CI/CD Integration**

- **GitHub Actions**: Enforces `--max-warnings 0` policy
- **Pull Request Checks**: Linting must pass before merge
- **Automated Feedback**: PR comments with lint results

### **Automatic Setup**

- **Husky Installation**: Automatically installed when running `npm install`
- **Pre-commit Hooks**: Ready to use immediately after installation
- **Zero Configuration**: No manual setup required for new developers
- **Documentation**: See [docs/HUSKY_SETUP.md](docs/HUSKY_SETUP.md) for detailed setup information

## Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards

- **TypeScript**: Strict type checking enabled
- **Testing**: All new code must include tests
- **Documentation**: Comprehensive JSDoc comments
- **Formatting**: Prettier and ESLint configuration

### Testing Guidelines

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test component interactions
- **Edge Cases**: Test boundary conditions and error scenarios
- **Performance**: Test with realistic data volumes

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/doccraft-ai-v3/issues)
- **Documentation**: [Wiki](https://github.com/YOUR_USERNAME/doccraft-ai-v3/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/doccraft-ai-v3/discussions)

## Roadmap

### v3.1 - Enhanced Diagnostics

- [ ] Advanced fallback analytics
- [ ] Performance optimization dashboard
- [ ] Real-time monitoring alerts

### v3.2 - AI Improvements

- [ ] Multi-language support
- [ ] Advanced genre detection
- [ ] Contextual memory system

### v3.3 - Developer Experience

- [ ] CLI tool for local development
- [ ] VS Code extension
- [ ] Advanced debugging tools

---

**Built with ❤️ by the DocCraft-AI Team**
