# DocCraft-AI Codebase Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Core System Architecture](#core-system-architecture)
4. [Module System](#module-system)
5. [Key Features & Capabilities](#key-features--capabilities)
6. [Data Models & Types](#data-models--types)
7. [Services & APIs](#services--apis)
8. [Testing & Quality Assurance](#testing--quality-assurance)
9. [Development Workflow](#development-workflow)
10. [Deployment & Infrastructure](#deployment--infrastructure)

## Project Overview

**DocCraft-AI** is a sophisticated AI-powered writing and content creation platform that combines advanced natural language processing, character development, emotional arc analysis, and collaborative writing tools. The platform is designed to assist writers, content creators, and teams in producing high-quality, engaging content through intelligent AI assistance.

### Core Mission

Transform the writing process by providing AI-powered insights, character development tools, emotional arc optimization, and collaborative writing capabilities while maintaining user control and creative direction.

### Key Value Propositions

- **AI-Enhanced Writing**: Intelligent content analysis and improvement suggestions
- **Character Development**: Advanced character creation and consistency management
- **Emotional Arc Optimization**: AI-powered emotional storytelling analysis
- **Collaborative Writing**: Real-time team collaboration with AI assistance
- **Narrative Analytics**: Comprehensive storytelling insights and metrics

## Architecture & Technology Stack

### Frontend Framework

- **React 18.2.0** with TypeScript 5.8.3
- **Vite 5.4.19** for build tooling and development server
- **Tailwind CSS 3.4.0** for styling and responsive design
- **React Router DOM 6.8.1** for client-side routing

### Backend & Services

- **Supabase** for database, authentication, and real-time features
- **Express.js** for custom API endpoints and collaboration server
- **Node.js** with TypeScript for server-side logic

### AI & Machine Learning

- **OpenAI GPT-4** integration for content analysis and generation
- **Custom AI Services** for character development and emotional analysis
- **Vector Embeddings** for semantic search and content similarity

### Collaboration & Real-time Features

- **Yjs** for collaborative editing
- **WebSocket** connections for real-time updates
- **Socket.io** for enhanced real-time communication

### Testing & Quality

- **Jest** for unit testing
- **Playwright** for end-to-end testing
- **ESLint** for code quality and consistency
- **TypeScript** for type safety and developer experience

## Core System Architecture

### Application Structure

```
src/
├── App.tsx                 # Main application component with routing
├── main.tsx               # Application entry point
├── components/            # Reusable UI components
├── contexts/              # React context providers
├── hooks/                 # Custom React hooks
├── pages/                 # Application pages and views
├── services/              # Business logic and external API calls
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions and helpers
└── lib/                   # Third-party library configurations
```

### Context Architecture

The application uses a sophisticated context system for state management:

1. **WriterProfileProvider**: Manages user writing profiles and preferences
2. **DocCraftAgentProvider**: Handles AI agent interactions and onboarding
3. **AuthContext**: Manages user authentication and authorization
4. **AgentPreferencesContext**: Stores user preferences for AI behavior

### Routing & Navigation

The application implements a tiered access control system:

- **Public Routes**: Home, login, signup, demo
- **Protected Routes**: Dashboard, document processing, analytics
- **Admin Routes**: Audit logs, system administration
- **Pro Tier Routes**: Advanced analytics, premium features

## Module System

DocCraft-AI uses a modular architecture with specialized modules for different writing domains:

### 1. Emotion Arc Module (`modules/emotionArc/`)

**Purpose**: AI-powered emotional analysis and optimization for narrative storytelling

**Key Components**:

- `EmotionAnalyzer`: AI-powered emotion extraction from text
- `ArcSimulator`: Reader engagement and tension simulation
- `SuggestionEngine`: AI-powered optimization recommendations
- `EmotionTimelineChart`: Character emotion visualization
- `TensionCurveViewer`: Reader engagement curves

**Features**:

- Multi-character emotional analysis
- Real-time processing with debounced text analysis
- WCAG 2.1 AA compliant accessibility
- Full TypeScript support with tree-shaking optimization

### 2. Narrative Dashboard Module (`modules/narrativeDashboard/`)

**Purpose**: Unified workspace for emotional arcs, plot structure, and character development

**Key Components**:

- **Tabbed Views**: Plot, Emotion, Character, and Optimization tabs
- **Overlay System**: Toggle emotional, structural, and character overlays
- **AI Suggestions**: Contextual, actionable feedback for scenes
- **Export System**: Multiple format export capabilities
- **Scene Inspector**: Detailed scene-level metadata and suggestions

**Features**:

- Real-time narrative health metrics
- AI-powered improvement suggestions
- Comprehensive export options (MD, JSON, PDF)
- Advanced accessibility with ARIA roles and keyboard navigation

### 3. Plot Structure Module (`modules/plotStructure/`)

**Purpose**: Framework-based plot analysis and optimization

**Key Components**:

- `plotFrameworkEngine`: Core plotting logic
- `initPlotEngine`: Plot initialization and setup
- Framework configurations for different storytelling approaches

### 4. Style Profile Module (`modules/styleProfile/`)

**Purpose**: Writing style analysis and personalization

**Key Components**:

- Style analysis and comparison tools
- Visual style dashboards
- AI-powered style suggestions
- Export and sharing capabilities

### 5. Theme Analysis Module (`modules/themeAnalysis/`)

**Purpose**: Thematic content analysis and optimization

**Key Components**:

- Theme detection and analysis
- Content theme mapping
- Thematic consistency checking
- Theme-based content recommendations

## Key Features & Capabilities

### 1. AI-Powered Content Enhancement

- **Content Analysis**: Intelligent document structure analysis
- **Writing Suggestions**: AI-generated improvement recommendations
- **Style Optimization**: Personalized writing style enhancement
- **Content Generation**: AI-assisted content creation

### 2. Character Development System

- **Character Creation**: Comprehensive character profile building
- **Personality Analysis**: MBTI and Enneagram integration
- **Relationship Mapping**: Character interaction tracking
- **Development Tracking**: Character arc and growth monitoring
- **Memory System**: Character memory and experience tracking

### 3. Emotional Arc Optimization

- **Emotion Detection**: AI-powered emotional content analysis
- **Tension Mapping**: Reader engagement curve simulation
- **Character Emotion Tracking**: Individual character emotional journeys
- **Optimization Suggestions**: AI-powered emotional arc improvements

### 4. Collaborative Writing

- **Real-time Collaboration**: Live collaborative editing
- **Version Control**: Document versioning and history
- **Team Management**: User roles and permissions
- **Conflict Resolution**: Intelligent merge conflict handling

### 5. Analytics & Insights

- **Writing Analytics**: Performance metrics and insights
- **Engagement Tracking**: Reader response analysis
- **Content Optimization**: AI-powered improvement suggestions
- **Progress Monitoring**: Writing goal tracking and achievement

## Data Models & Types

### Character System

```typescript
interface CharacterPersona {
  id: string;
  name: string;
  description: string;
  personality: string[];
  goals: string[];
  conflicts: string[];
  arc: string;
  memory?: CharacterMemory[];
  traits?: CharacterTrait[];
  developmentNotes?: string[];
  archetype?: string;
  voiceStyle?: string;
  worldview?: string;
  backstory?: string;
  knownConnections?: Array<{
    name: string;
    relationship: string;
    description?: string;
  }>;
}
```

### Document System

```typescript
interface Document {
  id: string;
  title: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  sections?: DocumentSection[];
  metadata?: DocumentMetadata;
}
```

### Emotional Analysis

```typescript
interface EmotionalBeat {
  sceneId: string;
  characterId: string;
  emotion: string;
  intensity: number;
  timestamp: number;
  context: string;
}
```

## Services & APIs

### 1. AI Helper Service (`src/services/aiHelperService.ts`)

**Purpose**: Core AI content processing and enhancement

**Capabilities**:

- Text rewriting and summarization
- Content improvement suggestions
- AI-powered content analysis
- Audit logging for AI usage

**Key Methods**:

- `runAIAction()`: Execute AI-powered content actions
- `rewrite()`, `summarize()`, `suggest()`: Content enhancement operations

### 2. Advanced Character AI (`src/services/advancedCharacterAI.ts`)

**Purpose**: Sophisticated character development and management

**Capabilities**:

- Character memory management
- Consistency analysis and improvement
- Character evolution tracking
- Personality deepening and development
- Contextual response generation

**Key Methods**:

- `addMemory()`: Add character memories and experiences
- `analyzeConsistency()`: Check character consistency
- `trackCharacterEvolution()`: Monitor character growth
- `generateContextualResponse()`: Create character interactions

### 3. Agentic AI System (`src/services/agenticAI/`)

**Purpose**: Autonomous AI agents for writing assistance

**Capabilities**:

- Goal planning and task breakdown
- Autonomous task execution
- Multi-agent coordination
- Quality assurance and optimization
- Mode-aware behavior adaptation

**Agent Types**:

- Research Agent: Topic research and analysis
- Outline Agent: Content structure planning
- Writing Agent: Content generation and optimization
- Editing Agent: Content refinement
- Analysis Agent: Content analysis and insights

### 4. Supabase Integration (`src/lib/supabase.ts`)

**Purpose**: Database operations and real-time features

**Capabilities**:

- User authentication and authorization
- Document storage and retrieval
- Real-time collaboration
- Vector search and similarity
- File storage and management

## Testing & Quality Assurance

### Testing Strategy

The application implements a comprehensive testing strategy:

1. **Unit Testing**: Jest-based component and service testing
2. **Integration Testing**: Service integration and API testing
3. **End-to-End Testing**: Playwright-based user journey testing
4. **Accessibility Testing**: WCAG compliance and screen reader support
5. **Performance Testing**: Load testing and optimization validation

### Test Coverage

- **Unit Tests**: Core business logic and utilities
- **Component Tests**: React component behavior and rendering
- **E2E Tests**: Complete user workflows and interactions
- **Accessibility Tests**: Screen reader compatibility and keyboard navigation
- **Performance Tests**: Load times and resource optimization

### Quality Tools

- **ESLint**: Code quality and consistency enforcement
- **Prettier**: Code formatting and style consistency
- **TypeScript**: Type safety and developer experience
- **Husky**: Git hooks for pre-commit quality checks
- **Lint-staged**: Staged file quality validation

## Development Workflow

### Development Environment

- **Local Development**: Vite dev server with hot reload
- **Type Checking**: Strict TypeScript configuration
- **Linting**: ESLint with React and accessibility rules
- **Formatting**: Prettier for consistent code style

### Build Process

- **Development Build**: Fast refresh and debugging support
- **Production Build**: Optimized bundle with tree-shaking
- **Type Checking**: Strict type validation before deployment
- **Bundle Analysis**: Performance optimization insights

### Code Quality

- **Pre-commit Hooks**: Automatic quality checks
- **Code Review**: Pull request validation and approval
- **Documentation**: Comprehensive inline and external documentation
- **Testing**: Automated test execution and coverage reporting

## Deployment & Infrastructure

### Frontend Deployment

- **Build Process**: Vite-based production builds
- **Static Hosting**: Optimized static asset delivery
- **CDN Integration**: Global content distribution
- **Performance Optimization**: Bundle splitting and lazy loading

### Backend Services

- **Supabase**: Managed database and authentication
- **Custom APIs**: Express.js server for specialized functionality
- **Real-time Features**: WebSocket and collaboration services
- **File Storage**: Cloud storage for documents and media

### Environment Management

- **Configuration**: Environment-specific settings
- **Secrets Management**: Secure credential handling
- **Feature Flags**: Environment-based feature toggles
- **Monitoring**: Application performance and error tracking

## Conclusion

DocCraft-AI represents a sophisticated, enterprise-grade writing platform that combines cutting-edge AI technology with intuitive user experience design. The modular architecture, comprehensive testing strategy, and focus on accessibility make it a robust foundation for AI-powered content creation tools.

The platform's strength lies in its ability to provide intelligent writing assistance while maintaining user control and creative direction. The integration of emotional analysis, character development, and collaborative features creates a unique writing environment that enhances rather than replaces human creativity.

For developers working with this codebase, the MCP (Model Context Protocol) system provides clear guidance on file roles and permissions, while the comprehensive testing infrastructure ensures code quality and reliability. The modular design allows for easy extension and customization, making it an excellent foundation for building advanced writing and content creation applications.
