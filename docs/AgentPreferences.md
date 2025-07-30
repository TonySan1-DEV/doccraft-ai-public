# Agent Preferences System

## Overview

The DocCraft-AI assistant uses a secure, MCP-aware preference system to control runtime behavior such as tone, language, memory, and suggestion toggles. These preferences are accessible via React context, stored locally with localStorage persistence, and optionally synced to a backend server for cross-device consistency.

The preference system provides granular control over:
- **Communication Style**: Tone and language settings
- **AI Assistance**: Copilot suggestion engine toggles
- **Memory Management**: Session memory and context retention
- **Interface Options**: Command view modes and display preferences

## Data Structure

### Core Preferences Interface

```typescript
export interface AgentPrefs {
  tone: "friendly" | "formal" | "concise";
  language: string;
  copilotEnabled: boolean;
  memoryEnabled: boolean;
  defaultCommandView: "list" | "grid";
  lockedFields: string[]; // Fields locked by admin policy
}
```

### Preference Types

#### Tone Options
- **`friendly`**: Warm, conversational, approachable responses
- **`formal`**: Professional, structured, business-like communication
- **`concise`**: Brief, direct, to-the-point interactions

#### Language Support
- **`en`**: English (default)
- **`es`**: Spanish
- **`fr`**: French
- **`de`**: German
- **`it`**: Italian
- **`pt`**: Portuguese
- **`ja`**: Japanese
- **`ko`**: Korean
- **`zh`**: Chinese

#### Command View Modes
- **`list`**: Linear command display (default)
- **`grid`**: Grid-based command layout

## Runtime Behavior Control

### Tone & Language Impact

Preferences directly influence LLM prompt formatting and response generation:

```typescript
// Prompt header injection
/* Tone: friendly | Language: en */
/* Respond in ENGLISH */

// Runtime behavior changes
- Formal tone: Structured, professional responses
- Concise tone: Brief, direct answers
- Language: Full response translation
```

### Copilot Engine Control

The `copilotEnabled` preference controls AI suggestion systems:

```typescript
// When enabled
- SmartSuggestionsEngine: Active
- QuickRepliesGenerator: Active
- AutopilotPrompter: Active
- UI: Suggestion elements visible

// When disabled
- All suggestion engines: Disabled
- UI: Suggestion elements hidden
- Background calculations: Prevented
```

### Memory Management

The `memoryEnabled` preference controls session context:

```typescript
// When enabled
- SessionMemoryManager: Active
- ContextSnapshotEngine: Active
- Prior context: Chained across interactions
- UI: Memory-dependent features available

// When disabled
- Session memory: Immediately cleared
- Context accumulation: Prevented
- UI: Memory features hidden
```

## Security & MCP Integration

### Role-Based Access Control

Preferences are secured through MCP (Model Context Protocol) enforcement:

```typescript
// MCP Context Block
{
  role: "user" | "admin" | "developer",
  tier: "Basic" | "Pro" | "Enterprise",
  allowedActions: ["updatePrefs", "readPrefs", "syncPrefs"]
}
```

### Admin Policy Enforcement

Administrators can lock specific preference fields:

```typescript
// Locked fields example
{
  tone: "formal", // Locked by admin
  language: "en",
  copilotEnabled: true,
  memoryEnabled: false, // Locked by admin
  lockedFields: ["tone", "memoryEnabled"]
}
```

### Validation & Sanitization

All preferences undergo strict validation:

```typescript
// Schema validation
const PREFERENCES_SCHEMA = {
  tone: ['friendly', 'formal', 'concise'],
  language: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'],
  copilotEnabled: 'boolean',
  memoryEnabled: 'boolean',
  defaultCommandView: ['list', 'grid']
};
```

## Storage & Persistence

### Local Storage

Preferences are persisted locally using localStorage:

```typescript
// Storage key
const STORAGE_KEY = 'agentPreferences';

// Storage format
{
  tone: "friendly",
  language: "en",
  copilotEnabled: true,
  memoryEnabled: true,
  defaultCommandView: "list",
  lockedFields: [],
  lastUpdated: "2024-01-15T10:30:00Z"
}
```

### Server Sync (Optional)

For cross-device consistency, preferences can sync to backend:

```typescript
// API endpoints
GET /api/user/preferences    // Fetch user preferences
PUT /api/user/preferences    // Update user preferences
GET /api/admin/defaults      // Fetch admin defaults

// Sync headers
{
  'X-MCP-Role': 'user',
  'X-MCP-Tier': 'Pro',
  'X-MCP-Actions': 'updatePrefs,readPrefs',
  'Authorization': 'Bearer <token>'
}
```

## React Context Integration

### Context Provider

```typescript
import { AgentPreferencesProvider, useAgentPreferences } from './contexts/AgentPreferencesContext';

function App() {
  return (
    <AgentPreferencesProvider>
      <YourApp />
    </AgentPreferencesProvider>
  );
}
```

### Hook Usage

```typescript
function MyComponent() {
  const { 
    preferences, 
    updatePreferences, 
    resetToDefaults,
    isFieldLocked 
  } = useAgentPreferences();

  const handleToneChange = (newTone: AgentTone) => {
    updatePreferences({ tone: newTone });
  };

  return (
    <div>
      <p>Current tone: {preferences.tone}</p>
      <button 
        onClick={() => handleToneChange('formal')}
        disabled={isFieldLocked('tone')}
      >
        Set Formal Tone
      </button>
    </div>
  );
}
```

## Runtime Controls

### Behavior Bridge

The `AgentBehaviorBridge` routes preference changes to runtime systems:

```typescript
import { initializeAgentBehaviorBridge } from './agent/runtime/AgentBehaviorBridge';

const bridge = initializeAgentBehaviorBridge(preferences, {
  onSyncPrompt: (tone, language) => {
    // Update LLM prompt formatting
  },
  onToggleCopilot: (enabled) => {
    // Enable/disable suggestion engines
  },
  onToggleMemory: (enabled) => {
    // Enable/disable session memory
  }
});
```

### Runtime Control Functions

```typescript
import { 
  syncPromptBehavior, 
  toggleCopilot, 
  toggleMemory 
} from './agent/runtime/RuntimeControls';

// Update prompt formatting
syncPromptBehavior('formal', 'es');

// Toggle copilot suggestions
toggleCopilot(false);

// Toggle session memory
toggleMemory(true);
```

## Server Sync Integration

### API Functions

```typescript
import { 
  fetchPreferencesFromServer,
  syncPreferencesToServer,
  fetchAdminDefaults 
} from './agent/persistence/preferencesAPI';

// Fetch from server
const serverPrefs = await fetchPreferencesFromServer();

// Sync to server
const success = await syncPreferencesToServer(updatedPrefs);

// Get admin defaults
const adminDefaults = await fetchAdminDefaults();
```

### Hook for Server Sync

```typescript
import { useServerSyncedPreferences } from './agent/hooks/useServerSyncedPreferences';

function MyComponent() {
  const { 
    preferences, 
    syncState, 
    syncToServer,
    refreshFromServer 
  } = useServerSyncedPreferences(initialPrefs, {
    autoSync: true,
    retryOnError: true,
    syncInterval: 30000
  });

  return (
    <div>
      {syncState.isSyncing && <Spinner />}
      {syncState.syncError && <ErrorMessage />}
    </div>
  );
}
```

## Error Handling & Fallbacks

### Graceful Degradation

The system provides multiple fallback layers:

1. **Server preferences** (highest priority)
2. **Admin defaults** (fallback)
3. **Local storage** (fallback)
4. **Static defaults** (final fallback)

### Error Scenarios

```typescript
// Network failures
- Fetch fails → Use local storage
- Sync fails → Continue with local update
- Server unavailable → Work offline

// Validation failures
- Invalid tone → Fallback to 'friendly'
- Invalid language → Fallback to 'en'
- Malformed data → Use defaults

// Authorization failures
- 401 Unauthorized → Skip server sync
- 403 Forbidden → Respect admin locks
- Missing permissions → Read-only mode
```

## Testing

### Unit Tests

```bash
# Run preference system tests
npm test AgentPreferencesContext.test.tsx
npm test AgentBehaviorBridge.test.ts
npm test RuntimeControls.test.ts
npm test preferencesAPI.test.ts
```

### Test Coverage

- ✅ **Context functionality** - State management and updates
- ✅ **MCP security** - Role-based access control
- ✅ **Runtime controls** - Behavior synchronization
- ✅ **Server sync** - API integration and error handling
- ✅ **Validation** - Schema enforcement and sanitization

## Configuration

### Environment Variables

```bash
# API configuration
REACT_APP_API_BASE_URL=/api

# Debug mode
REACT_APP_DEBUG_PREFERENCES=true

# Sync intervals
REACT_APP_SYNC_INTERVAL=30000
```

### Default Values

```typescript
const DEFAULT_PREFERENCES: AgentPrefs = {
  tone: 'friendly',
  language: 'en',
  copilotEnabled: true,
  memoryEnabled: true,
  defaultCommandView: 'list',
  lockedFields: []
};
```

## Migration & Compatibility

### Version Migration

The system includes automatic migration for preference schema changes:

```typescript
// Migration utilities
function migratePreferences(oldPrefs: any): AgentPrefs {
  // Handle schema changes between versions
  return {
    ...DEFAULT_PREFERENCES,
    ...oldPrefs,
    // Apply migrations
  };
}
```

### Backward Compatibility

- ✅ **Schema evolution** - New fields are optional
- ✅ **Type safety** - Runtime validation prevents crashes
- ✅ **Fallback values** - Missing fields use defaults
- ✅ **Migration support** - Automatic schema updates

## Performance Considerations

### Optimization Strategies

- ✅ **Debounced updates** - Batch preference changes
- ✅ **Lazy loading** - Load preferences on demand
- ✅ **Caching** - Cache validated preferences
- ✅ **Background sync** - Non-blocking server updates

### Memory Management

- ✅ **Cleanup on disable** - Clear memory when disabled
- ✅ **Reference management** - Prevent memory leaks
- ✅ **State isolation** - Isolated preference contexts

## Troubleshooting

### Common Issues

1. **Preferences not updating**
   - Check MCP permissions
   - Verify field is not locked
   - Check localStorage quota

2. **Server sync failures**
   - Verify network connectivity
   - Check authentication tokens
   - Review server logs

3. **Runtime behavior not changing**
   - Verify bridge is connected
   - Check runtime controls
   - Validate preference format

### Debug Mode

Enable debug logging for troubleshooting:

```typescript
// Enable debug mode
enableDebugMode();

// Check runtime state
const status = getRuntimeStatus();
const stats = getRuntimeStats();
const validation = validateRuntimeState();
```

## API Reference

### Context Functions

| Function | Description |
|----------|-------------|
| `useAgentPreferences()` | Access preferences context |
| `updatePreferences()` | Update preferences securely |
| `resetToDefaults()` | Reset to default values |
| `isFieldLocked()` | Check if field is admin-locked |

### Runtime Functions

| Function | Description |
|----------|-------------|
| `syncPromptBehavior()` | Update prompt formatting |
| `toggleCopilot()` | Enable/disable suggestions |
| `toggleMemory()` | Enable/disable session memory |

### API Functions

| Function | Description |
|----------|-------------|
| `fetchPreferencesFromServer()` | Get server preferences |
| `syncPreferencesToServer()` | Update server preferences |
| `fetchAdminDefaults()` | Get admin default values |

This documentation provides a comprehensive guide to the Agent Preferences System, covering all aspects from data structure to runtime behavior, security, and integration patterns. 