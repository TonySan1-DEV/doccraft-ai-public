# DocCraft-AI Unified Mode System

## Overview

The Unified Mode System is a revolutionary feature that provides three distinct user experience modes while maintaining complete integration with existing DocCraft-AI features. This system leverages the existing MCP (Model Context Protocol) architecture, AgentPreferencesContext, and modular design patterns to deliver intelligent, context-aware AI assistance.

## 🎯 System Modes

### 1. MANUAL Mode

- **AI Initiative Level**: Minimal
- **User Control**: 100%
- **Behavior**: AI only responds to explicit user requests
- **Best For**: Writers who prefer full control, final review stages, sensitive content

**Features:**

- No automatic suggestions
- Silent background analysis
- User-initiated assistance only
- Full control over all AI actions

### 2. HYBRID Mode

- **AI Initiative Level**: Responsive
- **User Control**: 70%
- **Behavior**: AI offers contextual suggestions with user choice
- **Best For**: Collaborative writing, balanced assistance, most writing scenarios

**Features:**

- Contextual AI suggestions
- User approval required for changes
- Gentle, non-intrusive assistance
- Balanced human-AI collaboration

### 3. FULLY_AUTO Mode

- **AI Initiative Level**: Proactive
- **User Control**: 30%
- **Behavior**: AI takes proactive initiative with comprehensive assistance
- **Best For**: Rapid iteration, research-intensive writing, maximum productivity

**Features:**

- Continuous real-time analysis
- Automatic high-confidence enhancements
- Proactive improvement suggestions
- Maximum AI assistance

## 🏗️ Architecture

### Core Components

#### 1. System Mode Types (`src/types/systemModes.ts`)

```typescript
export type SystemMode = 'MANUAL' | 'HYBRID' | 'FULLY_AUTO';

export interface ModeConfiguration {
  mode: SystemMode;
  aiInitiativeLevel: 'MINIMAL' | 'RESPONSIVE' | 'PROACTIVE';
  suggestionFrequency: 'NONE' | 'ON_REQUEST' | 'CONTEXTUAL' | 'CONTINUOUS';
  userControlLevel: number; // 0-100 percentage
  interventionStyle: 'SILENT' | 'GENTLE' | 'ACTIVE' | 'COMPREHENSIVE';
  autoEnhancement: boolean;
  realTimeAnalysis: boolean;
  proactiveSuggestions: boolean;
}
```

#### 2. Mode-Aware AI Service (`src/services/modeAwareAIService.ts`)

- Extends existing `aiHelperService` with mode intelligence
- Processes requests differently based on user mode
- Implements mode-specific behavior patterns

#### 3. Mode Controller (`src/components/ModeController.tsx`)

- Main UI for mode selection and customization
- Handles mode transitions with validation
- Integrates with MCP role-based access control

#### 4. Module Coordinator (`src/services/moduleCoordinator.ts`)

- Manages cross-module intelligence and coordination
- Implements mode-specific coordination strategies
- Enables real-time module communication

### Integration Points

#### Existing Systems Preserved

- **MCP Registry**: Role-based access control with tier permissions
- **AgentPreferencesContext**: Robust preference management with versioning
- **WriterProfileContext**: User state and profile management
- **Real-time Collaboration**: Yjs integration with WebSocket support

#### New Extensions

- Mode-aware preference management
- Cross-module coordination
- Intelligent mode transitions
- Performance analytics

## 🚀 Implementation Guide

### Phase 1: Extend AgentPreferencesContext

The existing `AgentPreferencesContext` has been extended with mode system capabilities:

```typescript
// Enhanced AgentPrefs interface
export interface AgentPrefs {
  // ... existing properties ...

  // === UNIFIED MODE SYSTEM ===
  systemMode?: SystemMode;
  modeConfiguration?: ModeConfiguration;
  modeCustomizations?: Record<SystemMode, Partial<ModeConfiguration>>;
  autoModeSwitch?: boolean;
  modeTransitionPreferences?: ModeTransitionPreferences;
  lastModeChange?: Date;
  modeChangeHistory?: Array<ModeChangeRecord>;
}
```

### Phase 2: Create Mode-Aware Service Layer

The `ModeAwareAIService` extends the existing AI service architecture:

```typescript
export class ModeAwareAIService {
  async processRequest(
    request: AIRequest,
    context: WritingContext,
    userMode: SystemMode
  ): Promise<AIResponse> {
    // Mode-specific request processing
    switch (userMode) {
      case 'MANUAL':
        return this.processManualModeRequest(request, context);
      case 'HYBRID':
        return this.processHybridModeRequest(request, context);
      case 'FULLY_AUTO':
        return this.processFullyAutoModeRequest(request, context);
    }
  }
}
```

### Phase 3: Enhance Existing Modules

Modules like `EmotionalArcModule` have been enhanced with mode-aware behavior:

```typescript
// Mode-aware analysis behavior
if (currentMode === 'MANUAL') {
  // Only analyze if explicitly requested
  if (!externalLoading) {
    setLoading(false);
    return;
  }
}

// Mode-specific suggestion handling
if (currentMode === 'FULLY_AUTO') {
  // Auto-apply high-confidence suggestions
  const autoSuggestions = plan?.suggestions.filter(s => s.confidence > 0.8);
  if (autoSuggestions.length > 0) {
    console.log('Auto-applying high-confidence suggestions:', autoSuggestions);
  }
}
```

### Phase 4: Create Mode Controller UI

The `ModeController` component provides the main interface:

```typescript
export const ModeController: React.FC = () => {
  const handleModeChange = async (newMode: SystemMode) => {
    // Validate user permissions
    const canChangeMode = validateMCPAction('mode_change', {
      tier: preferences.tier,
      role: preferences.role,
    });

    // Create preference version with mode change
    await updatePreferences(
      {
        systemMode: newMode,
        modeConfiguration: getModeDefaults(newMode),
      },
      {
        createVersion: true,
        versionName: `Mode changed to ${newMode}`,
      }
    );
  };
};
```

### Phase 5: Cross-Module Coordination

The `ModuleCoordinator` enables intelligent cross-function coordination:

```typescript
export class ModuleCoordinator {
  async coordinateModulesForMode(mode: SystemMode, context: WritingContext) {
    const coordinationStrategy = this.getCoordinationStrategy(mode);

    // Apply mode-specific coordination
    for (const [moduleName, module] of this.activeModules) {
      await module.adaptToMode(mode, coordinationStrategy);
    }

    // Enable cross-module intelligence based on mode
    if (mode === 'HYBRID' || mode === 'FULLY_AUTO') {
      await this.enableCrossModuleIntelligence(mode);
    }
  }
}
```

## 🗄️ Database Schema

### New Tables

1. **Mode Changes Audit Log**
   - Tracks all mode transitions
   - Includes reason, context, and user metadata

2. **Mode Performance Metrics**
   - Session duration, analysis count, user satisfaction
   - Enables performance optimization

3. **Mode User Preferences**
   - Mode-specific customization settings
   - Per-user mode configurations

4. **Mode Transition Rules**
   - Automated mode switching rules
   - Context-based mode recommendations

5. **Mode Coordination Events**
   - Cross-module communication events
   - Real-time coordination tracking

### Schema Extensions

```sql
-- Add to existing writer_profiles table
ALTER TABLE writer_profiles ADD COLUMN IF NOT EXISTS system_mode VARCHAR(20) DEFAULT 'HYBRID';
ALTER TABLE writer_profiles ADD COLUMN IF NOT EXISTS mode_configuration JSONB DEFAULT '{}';
ALTER TABLE writer_profiles ADD COLUMN IF NOT EXISTS mode_customizations JSONB DEFAULT '{}';
```

## 🎨 User Experience

### Mode Selection Interface

The mode selection interface provides:

- Clear visual indicators for each mode
- Descriptive explanations of mode behavior
- Smooth transitions between modes
- Customization options for each mode

### Mode-Specific UI

Each mode presents a different interface:

- **MANUAL**: Clean, minimal interface with explicit action buttons
- **HYBRID**: Balanced interface with contextual suggestions
- **FULLY_AUTO**: Rich interface with continuous feedback and auto-enhancements

### Transition Experience

Mode transitions include:

- Smooth UI updates
- Context preservation
- User guidance and tips
- Performance optimization

## 🔧 Configuration

### Default Mode Configurations

```typescript
export const DEFAULT_MODE_CONFIGS: Record<SystemMode, ModeConfiguration> = {
  MANUAL: {
    mode: 'MANUAL',
    aiInitiativeLevel: 'MINIMAL',
    suggestionFrequency: 'ON_REQUEST',
    userControlLevel: 100,
    interventionStyle: 'SILENT',
    autoEnhancement: false,
    realTimeAnalysis: false,
    proactiveSuggestions: false,
  },
  HYBRID: {
    mode: 'HYBRID',
    aiInitiativeLevel: 'RESPONSIVE',
    suggestionFrequency: 'CONTEXTUAL',
    userControlLevel: 70,
    interventionStyle: 'GENTLE',
    autoEnhancement: true,
    realTimeAnalysis: true,
    proactiveSuggestions: true,
  },
  FULLY_AUTO: {
    mode: 'FULLY_AUTO',
    aiInitiativeLevel: 'PROACTIVE',
    suggestionFrequency: 'CONTINUOUS',
    userControlLevel: 30,
    interventionStyle: 'COMPREHENSIVE',
    autoEnhancement: true,
    realTimeAnalysis: true,
    proactiveSuggestions: true,
  },
};
```

### Customization Options

Users can customize:

- AI initiative level
- Suggestion frequency
- User control level
- Intervention style
- Feature toggles (auto-enhancement, real-time analysis, etc.)

## 📊 Analytics & Performance

### Mode Performance Tracking

The system tracks:

- Time spent in each mode
- Analysis and suggestion counts
- User satisfaction ratings
- Performance metrics per mode

### Cross-Module Coordination Metrics

- Module communication events
- Coordination efficiency
- Real-time update performance
- Cache hit rates

### User Behavior Analytics

- Mode preference patterns
- Transition frequency
- Feature usage by mode
- Performance optimization opportunities

## 🔒 Security & Permissions

### MCP Integration

Mode changes are validated through the MCP system:

- Role-based access control
- Tier-based feature availability
- Permission validation for mode changes

### Data Privacy

- User preferences are isolated per user
- Mode change history is user-specific
- Performance metrics are anonymized
- Secure preference versioning

## 🚀 Future Enhancements

### Planned Features

1. **Intelligent Mode Switching**
   - Context-aware automatic mode transitions
   - Machine learning-based mode recommendations
   - User behavior pattern recognition

2. **Advanced Coordination**
   - Real-time collaborative mode coordination
   - Multi-user mode synchronization
   - Advanced cross-module intelligence

3. **Performance Optimization**
   - Adaptive caching strategies
   - Background processing optimization
   - Real-time performance monitoring

4. **Enhanced Analytics**
   - Predictive mode recommendations
   - Performance trend analysis
   - User experience optimization

## 🧪 Testing

### Test Coverage

The system includes comprehensive testing:

- Unit tests for mode logic
- Integration tests for module coordination
- E2E tests for mode transitions
- Performance tests for real-time coordination

### Test Scenarios

1. **Mode Transitions**
   - Manual → Hybrid → Fully Auto
   - Permission validation
   - Context preservation

2. **Module Coordination**
   - Cross-module communication
   - Real-time updates
   - Performance optimization

3. **User Experience**
   - UI responsiveness
   - Transition smoothness
   - Customization persistence

## 📚 API Reference

### Mode Controller API

```typescript
// Change user mode
POST /api/mode/change
{
  "newMode": "HYBRID",
  "reason": "User preference",
  "context": "Writing session"
}

// Get mode configuration
GET /api/mode/config/:modeId

// Update mode preferences
PUT /api/mode/preferences
{
  "mode": "HYBRID",
  "preferences": { ... }
}
```

### Module Coordinator API

```typescript
// Register module
POST /api/coordinator/register
{
  "moduleId": "emotionArc",
  "capabilities": ["emotion_analysis", "arc_simulation"]
}

// Coordinate modules for mode
POST /api/coordinator/coordinate
{
  "mode": "HYBRID",
  "context": { ... }
}
```

## 🤝 Contributing

### Development Guidelines

1. **Mode-Aware Development**
   - Always consider mode context when implementing features
   - Implement mode-specific behavior patterns
   - Test across all three modes

2. **Module Integration**
   - Register modules with the coordinator
   - Implement the ModeAwareModule interface
   - Handle mode transitions gracefully

3. **Performance Considerations**
   - Optimize for real-time coordination
   - Implement efficient caching strategies
   - Monitor cross-module communication

### Code Standards

- Follow existing TypeScript patterns
- Implement proper error handling
- Add comprehensive JSDoc documentation
- Include unit tests for new functionality

## 📞 Support

### Getting Help

- Check the troubleshooting guide
- Review mode-specific documentation
- Contact the development team
- Submit issues through the project repository

### Common Issues

1. **Mode Not Changing**
   - Check user permissions
   - Verify MCP configuration
   - Review preference validation

2. **Module Coordination Issues**
   - Check module registration
   - Verify event listeners
   - Review coordination strategies

3. **Performance Problems**
   - Monitor real-time updates
   - Check background processing
   - Review caching strategies

---

The Unified Mode System represents a significant advancement in AI-assisted writing, providing users with unprecedented control over their AI assistance experience while maintaining the power and intelligence of DocCraft-AI's core features.
