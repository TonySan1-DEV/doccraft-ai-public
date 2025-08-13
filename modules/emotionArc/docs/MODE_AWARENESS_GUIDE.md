# 🎯 EmotionalArcModule Mode Awareness Guide

## Overview

The EmotionalArcModule has been enhanced with advanced mode awareness, providing different user experiences based on the current system mode. This guide explains the implementation, features, and usage patterns for each mode.

## 🚀 Enhanced Features

### 1. Mode-Specific Analysis Functions

#### `handleManualModeAnalysis()`

- **Purpose**: Performs analysis only when explicitly requested by the user
- **Behavior**:
  - Basic emotional analysis without proactive suggestions
  - No optimization plan generation
  - Minimal processing for faster response
- **Use Case**: Users who prefer full control over when analysis occurs

#### `handleHybridModeAnalysis()`

- **Purpose**: Provides contextual suggestions with user choice
- **Behavior**:
  - Enhanced analysis with contextual suggestions
  - Generates optimization suggestions requiring user approval
  - Balanced assistance without being intrusive
- **Use Case**: Collaborative writing with AI assistance

#### `handleAutoModeAnalysis()`

- **Purpose**: Proactive analysis with automatic insights
- **Behavior**:
  - Comprehensive analysis with proactive enhancements
  - Auto-applies high-confidence suggestions (>80% confidence)
  - Continuous improvement of emotional arc
- **Use Case**: Users who want maximum AI assistance

### 2. Mode-Specific UI Rendering

#### Manual Mode Interface

```tsx
<div className="manual-mode-interface p-4 bg-blue-50 border-b border-blue-200">
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-3">
      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
      <span className="text-blue-800 font-medium">Manual Mode</span>
      <span className="text-blue-600 text-sm">Full user control</span>
    </div>
    <button onClick={handleManualModeAnalysis}>
      <svg>⚡</svg>
      Analyze Emotional Arc
    </button>
  </div>
</div>
```

**Features**:

- Blue color scheme indicating manual control
- Pulsing indicator showing current mode
- Prominent "Analyze Emotional Arc" button
- Loading state during analysis

#### Hybrid Mode Interface

```tsx
<div className="hybrid-mode-interface p-4 bg-green-50 border-b border-green-200">
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-3">
      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      <span className="text-green-800 font-medium">Hybrid Mode</span>
      <span className="text-green-600 text-sm">Collaborative assistance</span>
    </div>
    <div className="suggestion-badge">{count} suggestions available</div>
  </div>
</div>
```

**Features**:

- Green color scheme indicating collaboration
- Suggestion count badge
- Contextual suggestion preview
- User choice in applying suggestions

#### Auto Mode Interface

```tsx
<div className="auto-mode-interface p-4 bg-purple-50 border-b border-purple-200">
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-3">
      <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
      <span className="text-purple-800 font-medium">Auto Mode</span>
      <span className="text-purple-600 text-sm">Proactive assistance</span>
    </div>
    <div className="auto-analysis-status">Continuously analyzing...</div>
  </div>
</div>
```

**Features**:

- Purple color scheme indicating automation
- Continuous analysis indicator
- Auto-applied enhancement preview
- High-confidence suggestion display

### 3. Mode-Aware Analysis Triggers

#### Manual Mode

```typescript
if (currentMode === 'MANUAL') {
  // Only analyze if explicitly requested
  if (!externalLoading) {
    setLoading(false);
    return;
  }
  await handleManualModeAnalysis();
  return;
}
```

#### Hybrid Mode

```typescript
if (currentMode === 'HYBRID') {
  // Contextual analysis in hybrid mode
  if (debouncedText || sceneInputs.length) {
    await handleHybridModeAnalysis();
  }
}
```

#### Auto Mode

```typescript
if (currentMode === 'FULLY_AUTO') {
  // Continuous analysis in fully auto mode
  if (debouncedText || sceneInputs.length) {
    await handleAutoModeAnalysis();
  }
}
```

## 🔧 Implementation Details

### Error Handling Integration

The component is wrapped in `ModeErrorBoundary` for robust error handling:

```tsx
<ModeErrorBoundary
  fallbackMode="HYBRID"
  onError={(error, errorInfo) => {
    console.error('EmotionalArcModule error:', error, errorInfo);
    setError(error.message);
  }}
  onRecovery={recoveredMode => {
    console.log('EmotionalArcModule recovered to mode:', recoveredMode);
    setError(null);
  }}
>
  {/* Component content */}
</ModeErrorBoundary>
```

### Module Coordination

Integration with the module coordinator system:

```typescript
useEffect(() => {
  const moduleInterface = {
    moduleId: 'emotionArc',
    currentMode,
    adaptToMode: async (mode: SystemMode, strategy: any) => {
      console.log(`EmotionArc module adapting to ${mode} mode`);
    },
    getModuleState: () => ({
      emotionalArc,
      sceneData,
      simulation,
      optimizationPlan,
    }),
    onModeTransition: async (fromMode: SystemMode, toMode: SystemMode) => {
      console.log(
        `EmotionArc module transitioning from ${fromMode} to ${toMode}`
      );
    },
    getCoordinationCapabilities: () => [
      'emotion_analysis',
      'arc_simulation',
      'optimization_suggestions',
    ],
  };

  moduleCoordinator.registerModule(moduleInterface);
  return () => moduleCoordinator.unregisterModule('emotionArc');
}, [currentMode, emotionalArc, sceneData, simulation, optimizationPlan]);
```

### State Management

Mode-aware state management with proper cleanup:

```typescript
// Mode-aware analysis triggers
if (currentMode === 'FULLY_AUTO') {
  // Continuous analysis in fully auto mode
  if (debouncedText || sceneInputs.length) {
    analyzeAll();
  }
} else if (currentMode === 'HYBRID') {
  // Contextual analysis in hybrid mode
  if (debouncedText || sceneInputs.length) {
    analyzeAll();
  }
} else {
  // Manual mode - only analyze when explicitly requested
  if (externalLoading && (debouncedText || sceneInputs.length)) {
    analyzeAll();
  } else if (!externalLoading) {
    // Clean up state when not analyzing
    setEmotionalArc(undefined);
    setSceneData([]);
    setSimulation(undefined);
    setOptimizationPlan(undefined);
  }
}
```

## 🎨 UI Enhancements

### Mode Indicator

Clear visual indication of current mode in the header:

```tsx
<div className="flex items-center mt-2 space-x-2">
  <span className="text-xs text-gray-500">Mode:</span>
  <span
    className={`text-xs px-2 py-1 rounded-full font-medium ${
      currentMode === 'MANUAL'
        ? 'bg-blue-100 text-blue-800'
        : currentMode === 'HYBRID'
          ? 'bg-green-100 text-green-800'
          : 'bg-purple-100 text-purple-800'
    }`}
  >
    {currentMode}
  </span>
</div>
```

### Smooth Transitions

CSS classes for smooth mode transitions:

```css
.emotional-arc-module--manual {
  transition: all 0.3s ease-in-out;
}

.emotional-arc-module--hybrid {
  transition: all 0.3s ease-in-out;
}

.emotional-arc-module--fully_auto {
  transition: all 0.3s ease-in-out;
}
```

### Loading States

Mode-specific loading indicators:

```tsx
{
  loading && (
    <div className="manual-analysis-status mt-3 text-blue-700 flex items-center">
      <svg
        className="animate-spin w-4 h-4 mr-2"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      Analyzing emotional content...
    </div>
  );
}
```

## 🧪 Testing

### Test Coverage

The enhanced module includes comprehensive tests covering:

- **Mode-specific behavior**: Each mode's unique functionality
- **UI rendering**: Mode-specific interface components
- **State transitions**: Mode changes and state preservation
- **Error handling**: Error boundary integration
- **Integration**: Module coordinator and narrative sync

### Test Structure

```typescript
describe('EmotionalArcModule - Mode Awareness', () => {
  describe('MANUAL Mode', () => {
    // Manual mode specific tests
  });

  describe('HYBRID Mode', () => {
    // Hybrid mode specific tests
  });

  describe('FULLY_AUTO Mode', () => {
    // Auto mode specific tests
  });

  describe('Mode Transitions', () => {
    // Mode switching tests
  });

  describe('Error Handling', () => {
    // Error boundary tests
  });
});
```

## 📱 Responsive Design

### Mobile-First Approach

All mode interfaces are designed with mobile responsiveness:

```tsx
<div className="flex flex-col sm:flex-row items-center justify-between">
  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
    {/* Mode indicator */}
  </div>
  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
    {/* Action buttons */}
  </div>
</div>
```

### Touch-Friendly Interactions

Large touch targets and clear visual feedback:

```tsx
<button
  onClick={handleManualModeAnalysis}
  className="manual-analysis-button bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors min-h-[44px]"
  disabled={!debouncedText && !sceneInputs.length}
>
  <svg
    className="w-4 h-4 mr-2 inline"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
  Analyze Emotional Arc
</button>
```

## 🔄 Performance Optimizations

### Debounced Analysis

Prevents excessive API calls during rapid typing:

```typescript
const debouncedText = useDebouncedValue(storyText, 400);

useEffect(() => {
  // Analysis logic with debounced text
}, [debouncedText, JSON.stringify(sceneInputs), currentMode, externalLoading]);
```

### Conditional Rendering

Only renders necessary components based on mode:

```typescript
const renderModeAwareInterface = () => {
  switch (currentMode) {
    case 'MANUAL':
      return renderManualInterface();
    case 'HYBRID':
      return renderHybridInterface();
    case 'FULLY_AUTO':
      return renderAutoInterface();
    default:
      return null;
  }
};
```

### Memoized Calculations

Optimized character and beat filtering:

```typescript
const characterIds = useMemo(() => {
  if (!emotionalArc?.beats) return [];
  return [...new Set(emotionalArc.beats.map(beat => beat.characterId))];
}, [emotionalArc?.beats]);

const filteredBeats = useMemo(() => {
  if (!emotionalArc?.beats) return [];
  if (selectedCharacter === 'all') return emotionalArc.beats;
  return emotionalArc.beats.filter(
    beat => beat.characterId === selectedCharacter
  );
}, [emotionalArc?.beats, selectedCharacter]);
```

## 🚀 Future Enhancements

### Planned Features

1. **Real-time Collaboration**: Multi-user emotional arc analysis
2. **Advanced AI Models**: Integration with newer language models
3. **Custom Mode Configurations**: User-defined analysis parameters
4. **Export Capabilities**: Emotional arc data export in various formats
5. **Integration APIs**: Third-party service integrations

### Extension Points

The modular architecture allows for easy extension:

```typescript
// Custom mode handler
const handleCustomModeAnalysis = useCallback(async () => {
  // Custom analysis logic
}, [dependencies]);

// Custom UI renderer
const renderCustomInterface = () => (
  <div className="custom-mode-interface">
    {/* Custom UI components */}
  </div>
);
```

## 📚 Additional Resources

- [System Modes Documentation](../../../src/types/systemModes.ts)
- [Mode Error Boundary Guide](../../../src/components/ModeErrorBoundary.tsx)
- [Mode-Aware AI Service](../../../src/services/modeAwareAIService.ts)
- [Module Coordinator](../../../src/services/moduleCoordinator.ts)

---

_This guide covers the enhanced mode awareness features of the EmotionalArcModule. For additional support or questions, refer to the project documentation or contact the development team._
