# DocCraft-AI Architecture Guide

## 🏗️ System Architecture Overview

DocCraft-AI follows a modular, microservices-inspired architecture with clear separation of concerns and robust integration patterns.

## 🎯 Core Design Principles

- **Modularity**: Self-contained modules with well-defined interfaces
- **Contextual Awareness**: AI agents that understand project context
- **Real-time Collaboration**: WebSocket-based collaborative editing
- **Scalable AI**: Multi-agent orchestration with fallback mechanisms
- **Security First**: Comprehensive input validation and audit logging

## 🏛️ High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   AI Services   │
│   (React/TS)    │◄──►│   (Node/Express)│◄──►│   (OpenAI/MCP)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Real-time     │    │   Database      │    │   External      │
│   (WebSocket)   │    │   (PostgreSQL)  │    │   Services      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🧩 Module Architecture

### 1. Agent System (`/modules/agent/`)

**Purpose**: Multi-agent orchestration with contextual awareness

**Key Components**:
- `AgentContext.tsx`: React context for agent state management
- `AgentPreferencesContext.tsx`: User preference management
- `ContextualPromptEngine.ts`: Dynamic prompt generation
- `PromptPatternLibrary.ts`: Reusable prompt patterns

**Architecture**:
```
Agent Coordinator
├── Context Manager
├── Preference Engine
├── Prompt Generator
└── Response Handler
```

### 2. Emotion Arc (`/modules/emotionArc/`)

**Purpose**: Psychological analysis and emotional journey mapping

**Key Components**:
- `EmotionArcEngine.ts`: Core emotional analysis engine
- `EmotionArcVisualizer.tsx`: Interactive emotion visualization
- `EmotionArcAnalyzer.ts`: Pattern recognition and analysis

**Data Flow**:
```
Content Input → Emotion Analysis → Pattern Recognition → Journey Mapping
```

### 3. Narrative Dashboard (`/modules/narrativeDashboard/`)

**Purpose**: Story structure and plot management

**Key Components**:
- `NarrativeCalibrationDashboard.tsx`: Main dashboard interface
- `NarrativeOverlaySelector.tsx`: Story overlay management
- `PlotStructureEngine.ts`: Plot framework engine

**Features**:
- Multi-genre plot frameworks
- Character arc tracking
- Story beat management
- Collaborative editing

### 4. Style Profile (`/modules/styleProfile/`)

**Purpose**: Content styling and brand consistency

**Key Components**:
- `StyleProfileEngine.ts`: Style analysis and application
- `StyleProfileVisualizer.tsx`: Style visualization interface
- `mcpRegistry.ts`: MCP integration for style context

**Capabilities**:
- Brand voice analysis
- Style consistency checking
- Tone adaptation
- Genre-specific styling

### 5. Theme Analysis (`/modules/themeAnalysis/`)

**Purpose**: Content theming and genre analysis

**Key Components**:
- `ThemeAnalysisEngine.ts`: Theme detection and analysis
- `ThemeVisualizer.tsx`: Theme visualization interface
- `GenreAnalyzer.ts`: Genre-specific analysis

## 🔌 Integration Architecture

### MCP (Model Context Protocol) Integration

**Purpose**: Provides AI agents with project context and file access

**Components**:
- `mcp/server.ts`: MCP server implementation
- `mcp/providers/`: Context providers for different domains
- `mcpRegistry.ts`: Registry of available contexts

**Supported Contexts**:
- File system access
- Database schemas
- Environment configuration
- CI/CD pipeline status

### Real-time Collaboration

**Purpose**: Enables multiple users to collaborate on documents

**Technology Stack**:
- WebSocket server (`server/collaboration-server.ts`)
- Supabase real-time subscriptions
- Operational transformation for conflict resolution

**Features**:
- Live cursor tracking
- Real-time document updates
- Conflict resolution
- Presence indicators

## 🗄️ Data Architecture

### Primary Database (PostgreSQL)

**Purpose**: Main application data storage

**Key Tables**:
- Users and authentication
- Documents and content
- Agent preferences
- Audit logs
- Support tickets

**Schema Management**:
- Supabase migrations
- Automatic schema documentation
- Version control for schema changes

### Specialized Database (MongoDB)

**Purpose**: Document-specific data and analytics

**Use Cases**:
- Content versioning
- Analytics data
- Temporary processing data
- Document metadata

**⚠️ Important**: MongoDB schemas are re-introspected and may overwrite custom edits

## 🔐 Security Architecture

### Input Validation

**Components**:
- `security/aiInputValidator.ts`: AI input sanitization
- `security/aiSecurityGateway.ts`: AI service security layer
- `security/auditLogger.ts`: Comprehensive audit logging

**Security Measures**:
- Input sanitization
- Rate limiting
- Content filtering
- Audit trail maintenance

### Authentication & Authorization

**Implementation**:
- Supabase Auth integration
- Role-based access control
- JWT token management
- Session management

## 📊 Monitoring & Observability

### Application Monitoring

**Components**:
- `monitoring/alertSystem.ts`: Alert management
- `monitoring/characterAnalysisMonitor.ts`: AI service monitoring
- `monitoring/performanceMonitor.ts`: Performance tracking

**Metrics Tracked**:
- Response times
- Error rates
- Resource usage
- User engagement

### Logging Strategy

**Log Levels**:
- **DEBUG**: Development and troubleshooting
- **INFO**: General application flow
- **WARN**: Potential issues
- **ERROR**: Errors requiring attention
- **AUDIT**: Security and compliance events

## 🚀 Deployment Architecture

### Frontend Deployment

**Platform**: Vercel
**Build Process**: Vite-based build with TypeScript
**Optimizations**: Code splitting, lazy loading, bundle analysis

### Backend Deployment

**Options**:
- Vercel Edge Functions
- Docker containers
- Kubernetes clusters

**Scaling**: Horizontal scaling with load balancing

## 🔄 Data Flow Patterns

### 1. Content Creation Flow

```
User Input → AI Analysis → Content Generation → Style Application → Output
```

### 2. Collaboration Flow

```
User Action → WebSocket → Server → Broadcast → Other Users
```

### 3. AI Service Flow

```
Request → Input Validation → AI Processing → Response Validation → Output
```

## 📈 Scalability Considerations

### Horizontal Scaling

- Stateless backend services
- Database connection pooling
- Redis for session management
- CDN for static assets

### Performance Optimization

- Lazy loading of modules
- Efficient database queries
- Caching strategies
- Bundle optimization

## 🔧 Configuration Management

### Environment Configuration

**Files**:
- `.env.local`: Local development
- `.env.production`: Production settings
- `config/env.ts`: Environment validation

**Security**: Encrypted environment variables for sensitive data

### Feature Flags

**Implementation**: Environment-based feature toggles
**Usage**: Gradual rollout and A/B testing capabilities

---

**Changelog**
- `initial` - 2024-12-01 - Created comprehensive architecture documentation
