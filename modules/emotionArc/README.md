# @doccraft/emotion-arc

> **AI-powered emotional analysis and optimization for narrative storytelling**

[![npm version](https://img.shields.io/npm/v/@doccraft/emotion-arc.svg)](https://www.npmjs.com/package/@doccraft/emotion-arc)
[![npm downloads](https://img.shields.io/npm/dm/@doccraft/emotion-arc.svg)](https://www.npmjs.com/package/@doccraft/emotion-arc)
[![License](https://img.shields.io/npm/l/@doccraft/emotion-arc.svg)](https://github.com/your-org/doccraft-ai/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)

## 📦 Installation

```bash
npm install @doccraft/emotion-arc
# or
yarn add @doccraft/emotion-arc
# or
pnpm add @doccraft/emotion-arc
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { EmotionalArcModule } from '@doccraft/emotion-arc';

function App() {
  return (
    <EmotionalArcModule
      initialText="Your story text here..."
      onCharacterSelect={(characterId) => console.log('Selected:', characterId)}
      onSuggestionApply={(suggestionId) => console.log('Applied:', suggestionId)}
    />
  );
}
```

### Advanced Usage

```typescript
import { 
  EmotionAnalyzer, 
  ArcSimulator, 
  SuggestionEngine,
  EmotionalArcModule 
} from '@doccraft/emotion-arc';

// Direct service usage
const analyzer = new EmotionAnalyzer();
const simulator = new ArcSimulator();
const suggestionEngine = new SuggestionEngine();

// Analyze story emotions
const emotionalBeats = await analyzer.analyzeStoryEmotions(scenes);

// Generate tension simulation
const simulation = simulator.generateArcSimulation(emotionalBeats);

// Get optimization suggestions
const suggestions = suggestionEngine.generateOptimizationSuggestions(arc, simulation);
```

## 🎯 Features

### Core Services

- **EmotionAnalyzer**: AI-powered emotion extraction from text
- **ArcSimulator**: Reader engagement and tension simulation
- **SuggestionEngine**: AI-powered optimization recommendations

### UI Components

- **EmotionTimelineChart**: Character emotion visualization
- **TensionCurveViewer**: Reader engagement curves
- **OptimizationSuggestions**: AI recommendation display
- **SceneSentimentPanel**: Per-scene breakdown
- **CharacterArcSwitch**: Character selection interface

### Key Capabilities

- ✅ **Multi-character Analysis**: Individual and ensemble character arc views
- ✅ **Real-time Processing**: Debounced text analysis with loading states
- ✅ **Accessibility**: WCAG 2.1 AA compliant with screen reader support
- ✅ **TypeScript**: Full type safety and IntelliSense support
- ✅ **Modular Design**: Import only what you need
- ✅ **Tree Shaking**: Optimized bundle sizes

## 📚 API Reference

### Main Module

```typescript
import { EmotionalArcModule } from '@doccraft/emotion-arc';

interface EmotionalArcModuleProps {
  initialScenes?: SceneInput[];
  initialText?: string;
  isLoading?: boolean;
  error?: string | null;
  onCharacterSelect?: (characterId: string) => void;
  onSceneSelect?: (sceneId: string) => void;
  onSuggestionApply?: (suggestionId: string) => void;
  onSuggestionDismiss?: (suggestionId: string) => void;
  className?: string;
  'aria-label'?: string;
}
```

### Services

```typescript
// Emotion Analysis
import { EmotionAnalyzer } from '@doccraft/emotion-arc/services';

const analyzer = new EmotionAnalyzer();
const result = await analyzer.analyzeStoryEmotions(scenes);

// Arc Simulation
import { ArcSimulator } from '@doccraft/emotion-arc/services';

const simulator = new ArcSimulator();
const simulation = simulator.generateArcSimulation(sceneData);

// Optimization Suggestions
import { SuggestionEngine } from '@doccraft/emotion-arc/services';

const suggestionEngine = new SuggestionEngine();
const plan = suggestionEngine.generateOptimizationSuggestions(arc, simulation);
```

### Components

```typescript
// Individual components
import { 
  EmotionTimelineChart,
  TensionCurveViewer,
  OptimizationSuggestions,
  SceneSentimentPanel,
  CharacterArcSwitch
} from '@doccraft/emotion-arc/components';
```

### Types

```typescript
import type {
  EmotionalBeat,
  EmotionalArc,
  ArcSimulationResult,
  StoryOptimizationPlan,
  OptimizationSuggestion
} from '@doccraft/emotion-arc/types';
```

### Utilities

```typescript
import { validateEmotionalBeat, validateEmotionalArc } from '@doccraft/emotion-arc/utils';
```

### Constants

```typescript
import { EMOTION_CATEGORIES, EMOTION_COLORS } from '@doccraft/emotion-arc/constants';
```

## 🧪 Testing

### Test Utilities

```typescript
import { 
  renderWithProviders, 
  mockEmotionalBeats, 
  mockTensionCurve 
} from '@doccraft/emotion-arc/test-utils';

// Use in your tests
const { render } = renderWithProviders();
render(<EmotionalArcModule />);
```

### Storybook Stories

```typescript
import { EmotionArcStories } from '@doccraft/emotion-arc/stories';

// Use for documentation and development
```

## ⚙️ Configuration

### Environment Variables

```bash
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4

# Analysis Settings
EMOTION_ANALYSIS_TIMEOUT=30000
DEBOUNCE_DELAY=400
```

### Customization

```typescript
// Emotion analyzer configuration
const analyzerConfig = {
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 1000,
  timeout: 30000
};

// UI customization
const uiConfig = {
  theme: 'light' | 'dark',
  chartColors: ['#3B82F6', '#EF4444', '#10B981'],
  animationDuration: 300
};
```

## ♿ Accessibility

This package is designed with accessibility as a core principle:

- **WCAG 2.1 AA Compliance**: All components meet accessibility standards
- **Screen Reader Support**: Proper ARIA labels and roles throughout
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: Sufficient contrast ratios for all text and UI elements
- **Focus Management**: Clear focus indicators and logical tab order

## 📦 Bundle Size

- **Main Bundle**: ~45KB gzipped
- **Services Only**: ~15KB gzipped
- **Components Only**: ~30KB gzipped
- **Tree Shaking**: Import only what you need

## 🔧 Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/your-org/doccraft-ai.git
cd doccraft-ai/modules/emotionArc

# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test

# Start development server
npm run dev
```

### Contributing

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for detailed contribution guidelines.

## 📄 License

This package is licensed under the MIT License. See [LICENSE](../../LICENSE) for details.

## 🤝 Support

- **Documentation**: [https://doccraft-ai.com/docs/emotion-arc](https://doccraft-ai.com/docs/emotion-arc)
- **Issues**: [GitHub Issues](https://github.com/your-org/doccraft-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/doccraft-ai/discussions)
- **Email**: [support@doccraft-ai.com](mailto:support@doccraft-ai.com)

## 📈 Changelog

See [CHANGELOG.md](./docs/CHANGELOG.md) for version history and updates.

---

**Made with ❤️ by the DocCraft AI Team**

*Version: 1.0.0* 