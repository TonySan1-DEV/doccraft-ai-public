# Mode Controller Component

## Overview

The Mode Controller is a comprehensive, visually stunning interface for managing DocCraft-AI's writing modes. It provides users with an intuitive way to switch between different AI assistance levels while offering smart recommendations and detailed comparisons.

## Features

### 🎨 **Visual Design**

- **Beautiful Mode Cards**: Each mode has a distinct color scheme and icon
- **Smooth Animations**: Hover effects, transitions, and loading states
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Modern UI**: Clean, professional design with Tailwind CSS

### 🧠 **Smart Recommendations**

- **Context-Aware Suggestions**: Analyzes writing context and user experience
- **Confidence Scoring**: Shows recommendation confidence percentages
- **Feature Highlighting**: Explains why each mode is recommended
- **Adaptive Learning**: Adjusts recommendations based on usage patterns

### 🔄 **Mode Management**

- **Three Writing Modes**:
  - **Manual**: Full user control, minimal AI intervention
  - **Hybrid**: Collaborative assistance with user choice
  - **Fully Auto**: Proactive AI enhancement
- **Seamless Switching**: Smooth transitions between modes
- **Configuration Validation**: Ensures mode compatibility
- **Version Control**: Tracks mode changes with rollback capability

### 📊 **Advanced Features**

- **Mode Comparison Table**: Side-by-side feature comparison
- **Interactive Previews**: Experience modes before switching
- **Session Tracking**: Monitor writing session duration
- **Performance Analytics**: Track mode effectiveness

## Component Architecture

### Main Components

1. **ModeController** - Main orchestrator component
2. **ModeCard** - Individual mode selection cards
3. **SmartRecommendations** - AI-powered mode suggestions
4. **ModeComparison** - Feature comparison table
5. **AnimatedModePreview** - Interactive mode preview modal

### Props Interface

```typescript
interface ModeControllerProps {
  className?: string; // Custom CSS classes
  showAdvanced?: boolean; // Toggle advanced features
  onModeChange?: (mode: SystemMode, config: ModeConfiguration) => void;
}
```

## Usage

### Basic Implementation

```tsx
import ModeController from '../components/ModeController';

function App() {
  const handleModeChange = (mode, config) => {
    console.log('Mode changed to:', mode);
    // Handle mode change logic
  };

  return <ModeController onModeChange={handleModeChange} showAdvanced={true} />;
}
```

### Advanced Usage with Custom Styling

```tsx
<ModeController
  className="custom-mode-controller"
  showAdvanced={true}
  onModeChange={(mode, config) => {
    // Custom mode change handling
    updateUserPreferences(mode, config);
    trackAnalytics(mode);
    showNotification(`Switched to ${mode} mode`);
  }}
/>
```

## Integration

### Required Dependencies

- **React 18+** with hooks support
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **react-hot-toast** for notifications

### Context Integration

The component integrates with:

- `AgentPreferencesContext` - User preferences and mode state
- `useMCP` - Role-based access control
- `ModeErrorBoundary` - Error handling and recovery

### State Management

```typescript
// Mode state
const [currentMode, setCurrentMode] = useState<SystemMode>('HYBRID');
const [selectedMode, setSelectedMode] = useState<SystemMode>('HYBRID');

// UI state
const [isLoading, setIsLoading] = useState(false);
const [showPreview, setShowPreview] = useState(false);
const [showComparison, setShowComparison] = useState(false);
```

## Customization

### Theme Customization

```typescript
// Custom mode colors
const customModeColors = {
  MANUAL: 'from-indigo-500 to-indigo-600',
  HYBRID: 'from-pink-500 to-pink-600',
  FULLY_AUTO: 'from-emerald-500 to-emerald-600'
};

// Custom icons
const customModeIcons = {
  MANUAL: <CustomManualIcon />,
  HYBRID: <CustomHybridIcon />,
  FULLY_AUTO: <CustomAutoIcon />
};
```

### Feature Toggles

```typescript
// Enable/disable specific features
const featureFlags = {
  showRecommendations: true,
  showComparison: true,
  showPreview: true,
  showAdvanced: false,
};
```

## Accessibility

### ARIA Labels

- Proper labeling for all interactive elements
- Screen reader support for mode descriptions
- Keyboard navigation support
- Focus management for modal dialogs

### Keyboard Navigation

- Tab navigation through all interactive elements
- Enter/Space key support for buttons
- Escape key to close modals
- Arrow key navigation in comparison tables

## Performance

### Optimization Features

- **Lazy Loading**: Components load only when needed
- **Memoization**: Prevents unnecessary re-renders
- **Debounced Updates**: Smooth state transitions
- **Virtual Scrolling**: Handles large comparison tables

### Bundle Size

- **Tree Shaking**: Only imports used components
- **Code Splitting**: Separates advanced features
- **Icon Optimization**: Uses optimized Lucide icons

## Testing

### Test Coverage

```bash
# Run component tests
npm test ModeController

# Run visual regression tests
npm run test:visual

# Run accessibility tests
npm run test:a11y
```

### Test Scenarios

- Mode switching functionality
- Error handling and recovery
- Responsive design behavior
- Accessibility compliance
- Performance benchmarks

## Error Handling

### Error Boundaries

The component is wrapped in `ModeErrorBoundary` which provides:

- Automatic error recovery
- User-friendly error messages
- Fallback mode suggestions
- Recovery action guidance

### Validation

```typescript
// Mode configuration validation
const validation = validateModeConfiguration(config);
if (!validation.valid) {
  throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
}

// Permission validation
if (mcpContext.role === 'viewer') {
  throw new Error('Insufficient permissions');
}
```

## Analytics & Monitoring

### Event Tracking

```typescript
// Mode change events
trackEvent('mode_changed', {
  fromMode: previousMode,
  toMode: newMode,
  timestamp: new Date(),
  context: writingContext,
});

// User interaction events
trackEvent('mode_preview_opened', { mode: previewMode });
trackEvent('recommendation_clicked', { mode: recommendedMode });
```

### Performance Metrics

- Mode switch duration
- User engagement time
- Error rates and recovery success
- Feature usage statistics

## Future Enhancements

### Planned Features

1. **AI-Powered Mode Suggestions**: Machine learning-based recommendations
2. **Custom Mode Creation**: User-defined mode configurations
3. **Mode Scheduling**: Automatic mode switching based on time/context
4. **Collaborative Mode Sharing**: Share mode preferences with teams
5. **Advanced Analytics**: Detailed performance insights and trends

### Roadmap

- **Q1**: Enhanced recommendation engine
- **Q2**: Custom mode builder
- **Q3**: Advanced analytics dashboard
- **Q4**: Team collaboration features

## Contributing

### Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks

### Pull Request Process

1. Create feature branch from `main`
2. Implement changes with tests
3. Update documentation
4. Submit PR with detailed description
5. Code review and approval
6. Merge to main branch

## Support

### Documentation

- [Component API Reference](./API.md)
- [Design System Guidelines](./DESIGN.md)
- [Integration Examples](./EXAMPLES.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

### Community

- **GitHub Issues**: Bug reports and feature requests
- **Discord**: Community discussions and support
- **Documentation**: Comprehensive guides and tutorials

---

_Last updated: December 2024_
_Version: 3.0.0_
_Maintainer: DocCraft-AI Team_
