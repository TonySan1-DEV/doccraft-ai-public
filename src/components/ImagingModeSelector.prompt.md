# ImagingModeSelector Component Documentation

## 📘 Overview

The `ImagingModeSelector` component is a React-based UI control that allows users to switch between different imaging enhancement modes in DocCraft AI. Imaging modes determine how the application handles image selection, placement, and processing during document enhancement.

### Purpose in DocCraft AI
- **User Control**: Provides granular control over AI-assisted image enhancement
- **Workflow Flexibility**: Adapts to different user preferences and use cases
- **MCP Integration**: Respects context-aware permissions and actions
- **Responsive Design**: Works seamlessly across desktop and mobile devices

### Key Features
- Dropdown interface with visual mode indicators
- Real-time mode switching with immediate state updates
- Tooltip explanations for each mode
- Responsive design with mobile optimization
- Accessibility support with proper ARIA attributes

## 🧠 Mode Descriptions

### Manual Mode 🎯
**When to Use**: When you want complete control over image selection and placement
- **Control Level**: Full manual control
- **AI Involvement**: None - you select all images and placements
- **Best For**: 
  - Precise brand alignment requirements
  - Specific visual preferences
  - Compliance-sensitive documents
  - Learning the enhancement process

### Hybrid Mode 🤝 (Default)
**When to Use**: When you want AI assistance but maintain final approval
- **Control Level**: AI suggests, you approve
- **AI Involvement**: Suggests images and placements, requires user approval
- **Best For**:
  - Most common use cases
  - Balancing efficiency with control
  - Team collaboration scenarios
  - Quality assurance workflows

### Automatic Mode ⚡
**When to Use**: When you want AI to handle most decisions with minimal input
- **Control Level**: AI handles everything, minimal user input
- **AI Involvement**: Fully automatic processing with basic user oversight
- **Best For**:
  - High-volume document processing
  - Time-sensitive workflows
  - Standard document types
  - Batch processing scenarios

### AI-Generated Mode 🤖
**When to Use**: When you want completely hands-off AI processing
- **Control Level**: Fully autonomous AI processing
- **AI Involvement**: Creates and places images automatically
- **Best For**:
  - Experimental content generation
  - Rapid prototyping
  - Creative exploration
  - Automated content pipelines

## 🔧 Integration Guide

### Basic Usage
```tsx
import ImagingModeSelector from './components/ImagingModeSelector';

function SettingsPanel() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Imaging Settings</h2>
      <ImagingModeSelector />
    </div>
  );
}
```

### MCP-Controlled Integration
```tsx
import { useMCP } from '../useMCP';
import ImagingModeSelector from './components/ImagingModeSelector';

function MCPControlledImagingSelector() {
  const ctx = useMCP('ImagingModeSelector.tsx');
  
  // Check if user has permission to adjust imaging modes
  if (!ctx.allowedActions.includes('adjust')) {
    return null; // Hide component if no permission
  }
  
  // Check if user has permission to configure settings
  if (!ctx.allowedActions.includes('configure')) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Imaging mode configuration requires Pro tier access.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Imaging Enhancement</h3>
        <span className="text-xs text-gray-500">
          Tier: {ctx.tier}
        </span>
      </div>
      <ImagingModeSelector />
    </div>
  );
}
```

### Conditional Rendering Based on Mode
```tsx
import { useImagingMode, useIsAutoMode, useRequiresManualInput } from '../hooks/useImagingMode';

function AdaptiveImagingInterface() {
  const { mode } = useImagingMode();
  const isAuto = useIsAutoMode();
  const requiresManual = useRequiresManualInput();
  
  return (
    <div className="space-y-4">
      <ImagingModeSelector />
      
      {/* Show different UI based on mode */}
      {requiresManual && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Manual input required. You'll need to approve image selections.
          </p>
        </div>
      )}
      
      {isAuto && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            Automatic processing enabled. AI will handle image selection.
          </p>
        </div>
      )}
    </div>
  );
}
```

### Provider Setup
```tsx
// In your main App.tsx or layout component
import { ImagingModeProvider } from '../state/imagingMode';

function App() {
  return (
    <ImagingModeProvider initialMode="hybrid">
      <YourAppContent />
    </ImagingModeProvider>
  );
}
```

### Advanced Integration with MCP Context
```tsx
import { useMCP, getMCPPrompt } from '../useMCP';
import { useImagingMode } from '../hooks/useImagingMode';

function ContextAwareImagingSelector() {
  const ctx = useMCP('ImagingModeSelector.tsx');
  const { mode, setMode } = useImagingMode();
  
  // Log context for debugging
  console.log(getMCPPrompt(ctx, 'ImagingModeSelector.tsx'));
  
  // Conditionally render based on role and permissions
  if (ctx.role === 'viewer' && !ctx.allowedActions.includes('adjust')) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          View-only mode. Imaging settings cannot be modified.
        </p>
      </div>
    );
  }
  
  // Show different options based on tier
  const availableModes = ctx.tier === 'Admin' 
    ? ['manual', 'hybrid', 'auto', 'ai-generated']
    : ctx.tier === 'Pro'
    ? ['manual', 'hybrid', 'auto']
    : ['manual', 'hybrid'];
  
  return (
    <div className="space-y-4">
      <div className="text-xs text-gray-500">
        Available modes: {availableModes.join(', ')}
      </div>
      <ImagingModeSelector />
    </div>
  );
}
```

## 🎯 Best Practices

### Performance Considerations
- The component uses React's `useState` for local dropdown state
- Mode changes are handled through the global context
- Tooltips are conditionally rendered to avoid unnecessary DOM nodes

### Accessibility
- Proper ARIA attributes for screen readers
- Keyboard navigation support
- Focus management for dropdown interactions
- Semantic HTML structure

### Mobile Optimization
- Touch-friendly button sizes
- Responsive layout that adapts to screen size
- Proper spacing for mobile interactions
- Dropdown positioning that works on small screens

### Error Handling
- Graceful fallback if context is not available
- Validation of mode values before state updates
- Clear error messages for missing permissions

## 🔗 Related Components
- `ImagingModeProvider` - Global state management
- `useImagingMode` - Hook for accessing mode state
- `useIsAutoMode` - Hook for checking automatic modes
- `useRequiresManualInput` - Hook for manual intervention checks 