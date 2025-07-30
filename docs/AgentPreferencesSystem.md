# Agent Preferences System Documentation

## Overview

The Agent Preferences System provides secure, MCP-aware user preference management for the DocCraft-AI assistant. It controls runtime behavior including tone, language, copilot suggestions, and session memory through a centralized context with fallback layers and server synchronization.

## Core Components

### AgentPreferencesContext

The central React context that provides preferences, update functions, and locked field management.

```typescript
// Context interface
interface AgentPreferencesContextValue {
  preferences: AgentPrefs;
  updatePreferences: (updates: Partial<AgentPrefs>) => void;
  resetToDefaults: () => void;
  isFieldLocked: (field: keyof AgentPrefs) => boolean;
  lockedFields: string[];
  syncState: ServerSyncState;
}
```

#### React Usage Example

```typescript
import { useAgentPreferences } from './contexts/AgentPreferencesContext';

function MyComponent() {
  const { 
    preferences, 
    updatePreferences, 
    isFieldLocked,
    lockedFields 
  } = useAgentPreferences();

  const handleToneChange = (newTone: AgentTone) => {
    if (!isFieldLocked('tone')) {
      updatePreferences({ tone: newTone });
    }
  };

  return (
    <div>
      <p>Current tone: {preferences.tone}</p>
      <button 
        onClick={() => handleToneChange('formal')}
        disabled={isFieldLocked('tone')}
        aria-describedby={isFieldLocked('tone') ? 'tone-locked' : undefined}
      >
        Set Formal Tone
      </button>
      {isFieldLocked('tone') && (
        <span id="tone-locked" className="text-sm text-gray-500">
          Admin-locked preference
        </span>
      )}
    </div>
  );
}
```

#### Context Provider Setup

```typescript
import { AgentPreferencesProvider } from './contexts/AgentPreferencesContext';

function App() {
  return (
    <AgentPreferencesProvider>
      <YourApp />
    </AgentPreferencesProvider>
  );
}
```

## Admin Policy Support

### Fallback Order

The system implements a robust fallback hierarchy to ensure preferences are always available:

1. **LocalStorage** (highest priority)
   - User's saved preferences
   - Most recent user selections
   - Persisted across sessions

2. **Server** (if available)
   - Cross-device synchronization
   - Admin-managed user preferences
   - Requires authentication

3. **Admin Policy** (`agentDefaultPolicy.ts`)
   - Organization-wide defaults
   - Tier-specific configurations
   - Locked field definitions

4. **Static Defaults** (final fallback)
   - Hardcoded safe defaults
   - Ensures system always has valid preferences
   - Prevents crashes or undefined states

### Locked Fields Implementation

```typescript
// Admin policy example
export const agentDefaultPolicy = {
  Basic: {
    tone: 'friendly',
    language: 'en',
    copilotEnabled: false, // Locked for Basic tier
    memoryEnabled: false,  // Locked for Basic tier
    defaultCommandView: 'list',
    lockedFields: ['copilotEnabled', 'memoryEnabled']
  },
  Pro: {
    tone: 'friendly',
    language: 'en',
    copilotEnabled: true,
    memoryEnabled: true,
    defaultCommandView: 'list',
    lockedFields: [] // No locked fields for Pro
  }
};
```

#### Locked Field Prevention

```typescript
// Context implementation
const updatePreferences = useCallback((updates: Partial<AgentPrefs>) => {
  // Check MCP permissions
  if (!ctx.allowedActions.includes('updatePrefs')) {
    console.warn('User lacks updatePrefs permission');
    return;
  }

  // Filter out locked fields
  const allowedUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
    if (!lockedFields.includes(key)) {
      acc[key] = value;
    } else {
      console.warn(`Field ${key} is locked by admin policy`);
    }
    return acc;
  }, {} as Partial<AgentPrefs>);

  // Apply allowed updates
  setPreferences(prev => ({ ...prev, ...allowedUpdates }));
}, [ctx.allowedActions, lockedFields]);
```

## Runtime Behavior Bridge

The `AgentBehaviorBridge` routes preference changes to runtime subsystems, ensuring immediate behavior updates.

### Bridge Architecture

```typescript
import { initializeAgentBehaviorBridge } from './agent/runtime/AgentBehaviorBridge';

const bridge = initializeAgentBehaviorBridge(preferences, {
  onSyncPrompt: (tone: string, language: string) => {
    // Update LLM prompt formatting
    PromptBuilder.setTone(tone);
    PromptBuilder.setLanguage(language);
  },
  onToggleCopilot: (enabled: boolean) => {
    // Enable/disable suggestion engines
    if (enabled) {
      CopilotEngine.enable();
      SmartSuggestionsEngine.enable();
    } else {
      CopilotEngine.disable();
      SmartSuggestionsEngine.disable();
    }
  },
  onToggleMemory: (enabled: boolean) => {
    // Enable/disable session memory
    if (enabled) {
      SessionMemory.enable();
    } else {
      SessionMemory.clear();
      SessionMemory.disable();
    }
  }
});
```

### Triggered Subsystems

#### 1. Prompt Builder (Tone/Language)

```typescript
// Prompt header injection
function syncPromptBehavior(tone: string, language: string): SyncResult {
  const header = `/* Tone: ${tone} | Language: ${language} */`;
  
  // Update global prompt builder
  PromptBuilder.setTone(tone);
  PromptBuilder.setLanguage(language);
  
  // Inject header into all future prompts
  if (typeof window !== 'undefined' && (window as any).setPromptPrefix) {
    (window as any).setPromptPrefix(header);
  }
  
  return { header, injected: true, tone, language };
}
```

#### 2. Copilot Engine (Suggestions)

```typescript
// Suggestion engine control
function toggleCopilot(enabled: boolean): RuntimeStatus {
  if (enabled) {
    CopilotEngine.enable();
    SmartSuggestionsEngine.enable();
    QuickRepliesGenerator.enable();
    notifyUIComponents('copilot', 'show');
  } else {
    CopilotEngine.disable();
    SmartSuggestionsEngine.disable();
    QuickRepliesGenerator.disable();
    notifyUIComponents('copilot', 'hide');
  }
  
  return { copilotActive: enabled, lastToggle: Date.now() };
}
```

#### 3. Session Memory (Context Retention)

```typescript
// Memory management
function toggleMemory(enabled: boolean): RuntimeStatus {
  if (enabled) {
    SessionMemory.enable();
    ContextSnapshotEngine.enable();
  } else {
    SessionMemory.clear();
    SessionMemory.disable();
    ContextSnapshotEngine.disable();
  }
  
  return { memoryActive: enabled, lastToggle: Date.now() };
}
```

### Bridge Lifecycle

```typescript
// React integration
function AgentShell() {
  const { preferences } = useAgentPreferences();
  const bridgeRef = useRef<AgentBridgeController>();

  useEffect(() => {
    // Initialize bridge
    bridgeRef.current = initializeAgentBehaviorBridge(preferences, {
      onSyncPrompt: syncPromptBehavior,
      onToggleCopilot: toggleCopilot,
      onToggleMemory: toggleMemory,
      debug: process.env.NODE_ENV === 'development'
    });

    return () => {
      // Cleanup on unmount
      bridgeRef.current?.dispose();
    };
  }, []);

  // Update bridge when preferences change
  useEffect(() => {
    bridgeRef.current?.update(preferences);
  }, [preferences]);

  return <div>Agent Shell Content</div>;
}
```

## Server Sync Layer

### Core API Functions

#### fetchPreferencesFromServer()

```typescript
export async function fetchPreferencesFromServer(): Promise<AgentPrefs | null> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_CONFIG.baseUrl}/api/user/preferences`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(API_CONFIG.timeout)
    });

    if (!response.ok) {
      if (response.status === 404) {
        logTelemetryEvent('preferences_fetch_not_found', { status: 404 });
        return null;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const validatedPrefs = validatePreferences(data);
    
    if (validatedPrefs) {
      logTelemetryEvent('preferences_fetch_success', { hasServerPrefs: true });
      return validatedPrefs;
    } else {
      logTelemetryEvent('preferences_fetch_invalid', { rawData: data });
      return null;
    }
  } catch (error) {
    console.error('[PreferencesAPI] Fetch error:', error);
    logTelemetryEvent('preferences_fetch_error', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return null;
  }
}
```

#### syncPreferencesToServer()

```typescript
export async function syncPreferencesToServer(updatedPrefs: AgentPrefs): Promise<boolean> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_CONFIG.baseUrl}/api/user/preferences`, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedPrefs),
      signal: AbortSignal.timeout(API_CONFIG.timeout)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    logTelemetryEvent('preferences_sync_success', { 
      fields: Object.keys(updatedPrefs) 
    });
    return true;
  } catch (error) {
    console.error('[PreferencesAPI] Sync error:', error);
    logTelemetryEvent('preferences_sync_error', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return false;
  }
}
```

### Supabase Integration

```typescript
// Supabase-specific implementation
export async function fetchPreferencesFromSupabase(): Promise<AgentPrefs | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }

    return validatePreferences(data);
  } catch (error) {
    console.error('[Supabase] Fetch error:', error);
    return null;
  }
}

export async function syncPreferencesToSupabase(updatedPrefs: AgentPrefs): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        ...updatedPrefs,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[Supabase] Sync error:', error);
    return false;
  }
}
```

### Graceful Fallback & Error Handling

```typescript
// Retry wrapper with exponential backoff
export async function fetchPreferencesWithRetry(
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<AgentPrefs | null> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await fetchPreferencesFromServer();
      if (result) return result;
      
      // If null (not found), don't retry
      return null;
    } catch (error) {
      if (attempt === maxRetries - 1) {
        console.error('[PreferencesAPI] Max retries exceeded:', error);
        return null;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return null;
}

// Context integration with fallback
const loadInitialPrefs = async (): Promise<AgentPrefs> => {
  // Try server first
  const serverPrefs = await fetchPreferencesWithRetry();
  if (serverPrefs) return serverPrefs;

  // Try admin defaults
  const adminDefaults = await fetchAdminDefaults();
  if (adminDefaults) return adminDefaults;

  // Fallback to static defaults
  return DEFAULT_PREFERENCES;
};
```

## Testing

### Test Coverage Areas

#### 1. AgentPreferencesContext.test.tsx

```typescript
describe('AgentPreferencesContext', () => {
  it('should load default preferences when no storage exists', async () => {
    render(
      <AgentPreferencesProvider>
        <TestComponent />
      </AgentPreferencesProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('tone')).toHaveTextContent('friendly');
      expect(screen.getByTestId('language')).toHaveTextContent('en');
    });
  });

  it('should prevent updates when user lacks updatePrefs permission', async () => {
    mockUseMCP.mockReturnValue({ 
      allowedActions: ['read'], 
      tier: 'Basic' 
    });

    render(
      <AgentPreferencesProvider>
        <TestComponent />
      </AgentPreferencesProvider>
    );

    fireEvent.click(screen.getByTestId('update-tone'));
    
    await waitFor(() => {
      expect(screen.getByTestId('tone')).toHaveTextContent('friendly');
    });
  });

  it('should respect locked fields from admin policy', async () => {
    mockLoadInitialPrefs.mockResolvedValue({
      ...DEFAULT_PREFERENCES,
      copilotEnabled: true,
      lockedFields: ['copilotEnabled']
    });

    render(
      <AgentPreferencesProvider>
        <TestComponent />
      </AgentPreferencesProvider>
    );

    fireEvent.click(screen.getByTestId('toggle-copilot'));
    
    await waitFor(() => {
      expect(screen.getByTestId('copilot-enabled')).toBeChecked();
    });
  });
});
```

#### 2. AgentBehaviorBridge.test.ts

```typescript
describe('AgentBehaviorBridge', () => {
  it('should call onSyncPrompt when tone or language changes', () => {
    const onSyncPrompt = jest.fn();
    const bridge = initializeAgentBehaviorBridge(basePrefs, {
      onSyncPrompt,
      onToggleCopilot: jest.fn(),
      onToggleMemory: jest.fn()
    });

    bridge.update({ ...basePrefs, tone: 'formal' });
    
    expect(onSyncPrompt).toHaveBeenCalledWith('formal', 'en');
  });

  it('should call onToggleCopilot when copilotEnabled changes', () => {
    const onToggleCopilot = jest.fn();
    const bridge = initializeAgentBehaviorBridge(basePrefs, {
      onSyncPrompt: jest.fn(),
      onToggleCopilot,
      onToggleMemory: jest.fn()
    });

    bridge.update({ ...basePrefs, copilotEnabled: false });
    
    expect(onToggleCopilot).toHaveBeenCalledWith(false);
  });

  it('should not call handlers when preferences are unchanged', () => {
    const onSyncPrompt = jest.fn();
    const bridge = initializeAgentBehaviorBridge(basePrefs, {
      onSyncPrompt,
      onToggleCopilot: jest.fn(),
      onToggleMemory: jest.fn()
    });

    bridge.update(basePrefs); // Same preferences
    
    expect(onSyncPrompt).not.toHaveBeenCalled();
  });
});
```

#### 3. RuntimeControls.test.ts

```typescript
describe('RuntimeControls', () => {
  describe('syncPromptBehavior', () => {
    it('should validate tone is one of allowed values', () => {
      expect(syncPromptBehavior('friendly', 'en').tone).toBe('friendly');
      const result = syncPromptBehavior('invalid-tone' as any, 'en');
      expect(result.tone).toBe('friendly'); // Fallback
    });

    it('should avoid duplicate header injection', () => {
      const result1 = syncPromptBehavior('formal', 'es');
      const result2 = syncPromptBehavior('formal', 'es');
      
      expect(result1.injected).toBe(true);
      expect(result2.injected).toBe(false);
      expect(result2.reason).toBe('duplicate');
    });
  });

  describe('toggleCopilot', () => {
    it('should enable copilot engine when enabled', () => {
      const status = toggleCopilot(true);
      
      expect(status.copilotActive).toBe(true);
      expect(CopilotEngine.enable).toHaveBeenCalled();
    });

    it('should disable copilot engine when disabled', () => {
      const status = toggleCopilot(false);
      
      expect(status.copilotActive).toBe(false);
      expect(CopilotEngine.disable).toHaveBeenCalled();
    });
  });
});
```

#### 4. preferencesAPI.test.ts

```typescript
describe('preferencesAPI', () => {
  it('should return null if API returns 404', async () => {
    fetchSpy.mockResolvedValueOnce({ 
      ok: false, 
      status: 404, 
      statusText: 'Not Found' 
    } as Response);

    const result = await fetchPreferencesFromServer();
    
    expect(result).toBeNull();
    expect(mockLogTelemetryEvent).toHaveBeenCalledWith(
      'preferences_fetch_not_found', 
      { status: 404 }
    );
  });

  it('should send correct payload to server', async () => {
    fetchSpy.mockResolvedValueOnce({ ok: true } as Response);

    const testPrefs = {
      tone: 'formal',
      language: 'es',
      copilotEnabled: true,
      memoryEnabled: false,
      defaultCommandView: 'grid'
    };

    const success = await syncPreferencesToServer(testPrefs);
    
    expect(success).toBe(true);
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/user/preferences'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(testPrefs)
      })
    );
  });
});
```

### Security Validation

```typescript
// MCP permission testing
describe('MCP Security', () => {
  it('should validate role-based access control', () => {
    const basicUser = { role: 'user', tier: 'Basic', allowedActions: ['read'] };
    const proUser = { role: 'user', tier: 'Pro', allowedActions: ['read', 'updatePrefs'] };
    
    expect(hasUpdatePermission(basicUser)).toBe(false);
    expect(hasUpdatePermission(proUser)).toBe(true);
  });

  it('should prevent unauthorized preference updates', () => {
    const unauthorizedContext = { allowedActions: ['read'] };
    
    const result = updatePreferencesWithContext(
      { tone: 'formal' }, 
      unauthorizedContext
    );
    
    expect(result.success).toBe(false);
    expect(result.reason).toBe('insufficient_permissions');
  });
});
```

## Security

### MCP Enforcement

The system enforces Model Context Protocol (MCP) security at multiple levels:

```typescript
// Context-level security
const updatePreferences = useCallback((updates: Partial<AgentPrefs>) => {
  // Check MCP permissions
  if (!ctx.allowedActions.includes('updatePrefs')) {
    logTelemetryEvent('preferences_update_denied', {
      userRole: ctx.role,
      userTier: ctx.tier,
      attemptedFields: Object.keys(updates)
    });
    return;
  }

  // Validate updates against schema
  const validatedUpdates = validatePreferenceUpdates(updates);
  if (!validatedUpdates) {
    logTelemetryEvent('preferences_validation_failed', { updates });
    return;
  }

  // Apply updates
  setPreferences(prev => ({ ...prev, ...validatedUpdates }));
  
  // Sync to server if available
  if (ctx.allowedActions.includes('syncPrefs')) {
    syncPreferencesToServer({ ...preferences, ...validatedUpdates });
  }
}, [ctx.allowedActions, ctx.role, ctx.tier]);
```

### Role-Aware Updates

```typescript
// Role-based field access
const isFieldAccessible = (field: keyof AgentPrefs, context: MCPContext): boolean => {
  // Admin can access all fields
  if (context.role === 'admin') return true;
  
  // Pro users can access most fields
  if (context.tier === 'Pro') {
    return !['adminOnlyField'].includes(field);
  }
  
  // Basic users have limited access
  if (context.tier === 'Basic') {
    return ['tone', 'language'].includes(field);
  }
  
  return false;
};

// Field-specific validation
const validateFieldUpdate = (
  field: keyof AgentPrefs, 
  value: any, 
  context: MCPContext
): boolean => {
  if (!isFieldAccessible(field, context)) {
    return false;
  }
  
  // Check if field is locked by admin policy
  if (lockedFields.includes(field)) {
    return false;
  }
  
  // Validate value against schema
  return validateFieldValue(field, value);
};
```

### Failsafe Behavior

```typescript
// Graceful degradation on preference failure
const loadPreferencesWithFallback = async (): Promise<AgentPrefs> => {
  try {
    // Try server first
    const serverPrefs = await fetchPreferencesFromServer();
    if (serverPrefs) return serverPrefs;
  } catch (error) {
    console.warn('Server preferences failed, trying admin defaults:', error);
  }

  try {
    // Try admin defaults
    const adminDefaults = await fetchAdminDefaults();
    if (adminDefaults) return adminDefaults;
  } catch (error) {
    console.warn('Admin defaults failed, using static defaults:', error);
  }

  // Final fallback to static defaults
  return DEFAULT_PREFERENCES;
};

// Sync failure handling
const syncWithRetry = async (preferences: AgentPrefs): Promise<void> => {
  try {
    const success = await syncPreferencesToServer(preferences);
    if (!success) {
      // Store locally for later sync
      localStorage.setItem('pendingSync', JSON.stringify(preferences));
    }
  } catch (error) {
    console.error('Sync failed, storing locally:', error);
    localStorage.setItem('pendingSync', JSON.stringify(preferences));
  }
};
```

### Security Audit Trail

```typescript
// Comprehensive logging for security auditing
const logPreferenceChange = (
  field: keyof AgentPrefs,
  oldValue: any,
  newValue: any,
  context: MCPContext
) => {
  logTelemetryEvent('preferences_changed', {
    field,
    oldValue,
    newValue,
    userRole: context.role,
    userTier: context.tier,
    timestamp: Date.now(),
    sessionId: getSessionId()
  });
};

// Failed access attempts
const logAccessDenied = (
  action: string,
  context: MCPContext,
  details: any
) => {
  logTelemetryEvent('access_denied', {
    action,
    userRole: context.role,
    userTier: context.tier,
    allowedActions: context.allowedActions,
    details,
    timestamp: Date.now()
  });
};
```

## Integration Guide

### Adding to New Components

```typescript
// 1. Import the hook
import { useAgentPreferences } from './contexts/AgentPreferencesContext';

// 2. Use in component
function MyNewComponent() {
  const { preferences, updatePreferences, isFieldLocked } = useAgentPreferences();
  
  // 3. Check permissions before updates
  const handleChange = (field: keyof AgentPrefs, value: any) => {
    if (!isFieldLocked(field)) {
      updatePreferences({ [field]: value });
    }
  };
  
  return (
    <div>
      {/* Component content */}
    </div>
  );
}
```

### Server Integration

```typescript
// 1. Set up API endpoints
// GET /api/user/preferences
// PUT /api/user/preferences
// GET /api/admin/defaults

// 2. Configure authentication
const getAuthHeaders = async () => ({
  'Authorization': `Bearer ${await getAuthToken()}`,
  'X-MCP-Role': context.role,
  'X-MCP-Tier': context.tier,
  'X-MCP-Actions': context.allowedActions.join(',')
});

// 3. Handle errors gracefully
const handleSyncError = (error: Error) => {
  console.error('Sync failed:', error);
  // Continue with local preferences
  // Queue for retry later
};
```

This documentation provides a complete guide for understanding, implementing, and maintaining the Agent Preferences System with security, testing, and integration considerations. 