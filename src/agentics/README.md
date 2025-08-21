# Agentics System

A sophisticated AI orchestration framework for DocCraft AI that coordinates multiple AI agents to accomplish complex writing tasks.

## 🚀 Quick Start

### 1. Enable the Feature

Set the environment variable:

```bash
FEATURE_AGENTICS=true
VITE_FEATURE_AGENTICS=true
```

### 2. Run the Database Migration

```sql
-- Apply the agentics schema
\i database/agentics_schema.sql
```

### 3. Use the Frontend Hook

```typescript
import { useAgentics } from '../hooks/useAgentics';

function MyComponent() {
  const { isEnabled, startRun, isRunning } = useAgentics();

  const handleStart = async () => {
    const runId = await startRun(
      "Create a children's story about a brave mouse",
      {
        audience: 'children',
        qualityLevel: 'high',
        budgetCap: 0.50
      }
    );
  };

  return (
    <div>
      {isEnabled && (
        <button onClick={handleStart} disabled={isRunning}>
          Start Agentics Pipeline
        </button>
      )}
    </div>
  );
}
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes    │    │   Orchestrator  │
│   (useAgentics) │◄──►│  /api/agentics  │◄──►│   (DAG Engine)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Blackboard    │    │   Agent        │
                       │  (Supabase)     │◄──►│   Registry     │
                       └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Budget        │    │   Tools        │
                       │   Manager       │    │  (OpenAI, etc) │
                       └─────────────────┘    └─────────────────┘
```

## 🔧 Core Components

### Types (`types.ts`)

Core interfaces and schemas:

- `AgentName`: Union of all available agents
- `ArtifactKind`: Types of artifacts agents can produce
- `OrchestrationGraph`: DAG structure for execution
- `RunContext`: Execution context with budget and blackboard

### Blackboard (`blackboard.supabase.ts`)

Supabase-native artifact storage:

- Implements the `Blackboard` interface
- Stores artifacts with metadata
- Supports querying by kind and key

### Orchestrator (`orchestrator.ts`)

DAG execution engine:

- Topological sorting of nodes
- Parallel execution groups
- Retry logic with exponential backoff
- Conditional execution based on feature flags

### Budget Manager (`budget.ts`)

Cost tracking and optimization:

- Per-run and per-node cost tracking
- Hard budget caps with enforcement
- Automatic model downgrade paths
- Cost estimation for different models

### Agents (`agents/`)

Thin agent implementations:

- `PlannerAgent`: Builds orchestration graphs
- `BaseAgent`: Abstract base class for all agents
- `AgentRegistry`: Manages agent registration and lookup

### Tools (`tools/`)

Zod-validated tool implementations:

- `openai.generate`: OpenAI API wrapper
- `audio.export`: Audio generation via existing TTS
- `images.suggest`: Image generation suggestions

## 🎯 Available Agents

| Agent       | Purpose                    | Inputs                                               | Outputs              | Conditional                |
| ----------- | -------------------------- | ---------------------------------------------------- | -------------------- | -------------------------- |
| `planner`   | Build orchestration graphs | `goal`                                               | `outline`            | Always                     |
| `research`  | Gather context             | `goal`                                               | `research_notes`     | Always                     |
| `structure` | Create outlines            | `goal`, `research_notes`                             | `outline`            | Always                     |
| `writing`   | Generate content           | `outline`                                            | `sections`           | Always                     |
| `character` | Character analysis         | `sections`                                           | `character_analysis` | Quality > low              |
| `emotion`   | Emotional arcs             | `sections`                                           | `emotion_analysis`   | Quality > low              |
| `style`     | Style guides               | `sections`, `character_analysis`, `emotion_analysis` | `style_guide`        | Always                     |
| `imagery`   | Image briefs               | `sections`, `style_guide`                            | `image_briefs`       | `FEATURE_ENHANCED_IMAGERY` |
| `audiobook` | Audio manifests            | `sections`, `style_guide`                            | `audio_manifest`     | `FEATURE_AUDIOBOOK`        |
| `safety`    | Content safety             | Various                                              | `safety_report`      | Children's content         |

## 🔄 Execution Flow

1. **Goal Input**: User provides a writing goal
2. **Planner**: Builds orchestration graph based on goal and options
3. **Research**: Gathers context and background information
4. **Structure**: Creates narrative outline
5. **Writing**: Generates content sections
6. **Enhancement**: Character, emotion, and style analysis (parallel)
7. **Features**: Imagery and audiobook generation (conditional)
8. **Safety**: Content policy checks (conditional)
9. **Output**: All artifacts available for user

## 💰 Budget Management

### Cost Estimates (per 1K tokens)

- GPT-4o: $0.005
- GPT-4o-mini: $0.00015
- GPT-3.5-turbo: $0.0005
- Claude-3-Opus: $0.015
- Claude-3-Sonnet: $0.003

### Budget Optimization

- Automatic model downgrade when caps are reached
- Quality-based agent selection (skip expensive agents for low budget)
- Parallel execution to reduce total latency

## 🚦 Feature Flags

```bash
# Core agentics system
FEATURE_AGENTICS=false

# Feature-specific agents
FEATURE_ENHANCED_IMAGERY=false
FEATURE_AUDIOBOOK=false
FEATURE_CHILDRENS_GENRE=false

# When flags are OFF:
# - Legacy flows run unchanged
# - All agentics endpoints return 404
# - No new functionality exposed
```

## 📊 API Endpoints

### POST `/api/agentics/run`

Start a new orchestration run.

**Request:**

```json
{
  "goal": "Create a fantasy story about dragons",
  "options": {
    "audience": "young-adult",
    "qualityLevel": "high",
    "budgetCap": 1.0
  }
}
```

**Response:**

```json
{
  "success": true,
  "runId": "uuid-here"
}
```

### GET `/api/agentics/status/:runId`

Get run status and artifacts.

### GET `/api/agentics/runs`

List all runs for the user.

### DELETE `/api/agentics/run/:runId`

Cancel/abort a running orchestration.

## 🧪 Testing

### Run Tests

```bash
npm test -- tests/agentics/
```

### Test Scenarios

- Feature flag behavior (ON/OFF)
- Budget cap enforcement
- Model downgrade paths
- Parallel execution groups
- Retry logic and failure handling

### Mock Dependencies

```typescript
const mockDeps = {
  supabaseUrl: 'test-url',
  supabaseKey: 'test-key',
};
const router = makeAgenticsRouter(mockDeps);
```

## 🔍 Monitoring

### Metrics

- Success rate per agent type
- Retry counts and failure rates
- Cost per run and per node
- Execution latency (p50, p95)

### Logs

- Structured logging for all operations
- Budget events and model downgrades
- Agent execution details

### Debug Mode

```bash
DEBUG=agentics:*
```

## 🚀 Deployment

### Environment Setup

```bash
# Required
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-key

# Feature Flags
FEATURE_AGENTICS=false  # Start with OFF
```

### Rollout Plan

1. **Phase 1**: Deploy scaffolding behind flags (OFF)
2. **Phase 2**: Enable in development environment
3. **Phase 3**: Canary deployment in staging
4. **Phase 4**: Gradual rollout to production

## 🐛 Troubleshooting

### Common Issues

**Feature Flag Not Working**

- Verify `FEATURE_AGENTICS=true` in environment
- Check both frontend and backend flags

**Database Connection Issues**

- Verify Supabase credentials
- Check RLS policies are properly configured

**Agent Execution Failures**

- Check agent registry for missing agents
- Verify input artifacts exist in blackboard

**Budget Exceeded**

- Check budget cap configuration
- Verify model downgrade paths

### Debug Commands

```bash
# Check feature flags
echo $FEATURE_AGENTICS

# Check database connection
psql $DATABASE_URL -c "SELECT * FROM agent_runs LIMIT 1;"

# Check agent registry
curl -H "Authorization: Bearer $TOKEN" /api/agentics/runs
```

## 🔮 Future Enhancements

- **Advanced Conditionals**: Expression parser for complex when conditions
- **Dynamic Graph Modification**: Runtime graph updates based on results
- **Multi-tenant Orchestration**: Support for collaborative workflows
- **Advanced Scheduling**: Cron-based and event-driven orchestration
- **Plugin System**: Third-party agent and tool integration

## 📚 Additional Resources

- [Full Documentation](docs/dev/15-agentics.md)
- [API Reference](docs/api/openapi.yaml)
- [Examples](examples/)
- [Architecture Overview](docs/dev/01-architecture.md)

## 🤝 Contributing

### Adding New Agents

1. Extend `BaseAgent` class
2. Implement `executeLogic` method
3. Register in agent registry
4. Add to planner graph building logic

### Adding New Tools

1. Define input/output schemas
2. Implement tool handler
3. Add to tool registry
4. Update agent implementations

### Testing Guidelines

- Use dependency injection for testability
- Mock external services (OpenAI, Supabase)
- Test both success and failure paths
- Verify budget and cost tracking
