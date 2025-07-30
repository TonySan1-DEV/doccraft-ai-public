# Emotional Arc Modeling Module

> **AI-powered emotional analysis and optimization for narrative storytelling**

[![CI/CD Status](https://github.com/your-org/doccraft-ai/workflows/Emotional%20Arc%20Module%20CI%2FCD/badge.svg)](https://github.com/your-org/doccraft-ai/actions)
[![Test Coverage](https://codecov.io/gh/your-org/doccraft-ai/branch/main/graph/badge.svg?flag=emotionArc)](https://codecov.io/gh/your-org/doccraft-ai)
[![Accessibility](https://img.shields.io/badge/accessibility-WCAG%202.1%20AA-green)](https://www.w3.org/WAI/WCAG21/AA/)
[![MCP Compliant](https://img.shields.io/badge/MCP-Compliant-blue)](https://github.com/modelcontextprotocol)

## 📖 Overview

The Emotional Arc Modeling module provides AI-driven analysis of narrative emotional content, helping writers optimize story structure and reader engagement. The system tracks emotional beats, simulates reader empathy, visualizes tension curves, and suggests story improvements.

### 🎯 Key Features

- **📊 Emotional Timeline Analysis**: Track character emotions across narrative progression
- **⚡ Tension Curve Visualization**: Monitor reader engagement and emotional peaks
- **💡 AI Optimization Suggestions**: Get intelligent recommendations for story improvement
- **🎭 Scene-by-Scene Breakdown**: Detailed sentiment analysis per scene
- **🔄 Multi-Character Support**: Individual and ensemble character arc views
- **♿ Full Accessibility**: WCAG 2.1 AA compliant with screen reader support

## 🏗️ Architecture

### Core Services

```typescript
// Emotion Analysis Service
emotionAnalyzer.ts
├── analyzeEmotion(text: string) → EmotionalBeat
├── analyzeSceneEmotions(scenes: SceneInput[]) → SceneEmotionData[]
└── analyzeStoryEmotions(story: string) → EmotionalArc

// Arc Simulation Service  
arcSimulator.ts
├── generateArcSimulation(data: SceneEmotionData[]) → ArcSimulationResult
├── generateArcSegments(tension: TensionCurve) → ArcSegment[]
└── simulateReaderResponse(arc: EmotionalArc) → ReaderSimResult

// Optimization Service
suggestionEngine.ts
├── generateOptimizationSuggestions(arc: EmotionalArc) → StoryOptimizationPlan
├── assessRisk(suggestion: OptimizationSuggestion) → RiskLevel
└── prioritizeSuggestions(plan: StoryOptimizationPlan) → OptimizationSuggestion[]
```

### UI Components

```typescript
// Main Module
EmotionalArcModule.tsx
├── EmotionTimelineChart.tsx    // Character emotion visualization
├── TensionCurveViewer.tsx      // Reader engagement curves
├── OptimizationSuggestions.tsx  // AI improvement recommendations
├── SceneSentimentPanel.tsx      // Per-scene breakdown
└── CharacterArcSwitch.tsx       // Character selection toggle
```

### Data Flow

```
Story Text → Emotion Analyzer → Emotional Beats → Arc Simulator → Tension Curves → Suggestion Engine → Optimization Plan
     ↓              ↓                ↓              ↓              ↓                ↓
UI Components ← Timeline Chart ← Filtered Data ← Curve Viewer ← Engagement Data ← Suggestions Panel
```

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test -- --testPathPattern=modules/emotionArc
```

### Basic Usage

```typescript
import { EmotionalArcModule } from './modules/emotionArc';

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
  SuggestionEngine 
} from './modules/emotionArc';

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

## 📊 Features in Detail

### Emotional Timeline Chart

- **Multi-character visualization** with toggle between ensemble and individual views
- **Interactive beat selection** with detailed emotion information
- **Character summary statistics** showing total beats and average intensity
- **Accessibility features** with ARIA labels and keyboard navigation

### Tension Curve Viewer

- **Area chart visualization** of reader engagement over narrative progression
- **Emotional peak detection** highlighting high-impact moments
- **Engagement drop warnings** for potential reader disengagement
- **Zoom and hover functionality** for detailed analysis

### Optimization Suggestions

- **Categorized recommendations** (pacing, character development, emotional resonance)
- **Impact scoring** with visual impact bars
- **Risk assessment** for each suggestion
- **Implementation guidance** with specific change recommendations

### Scene Sentiment Panel

- **Scene-by-scene breakdown** with sentiment indicators
- **Character emotion tracking** within each scene
- **Interactive scene selection** with highlighting
- **Context clues** and emotional context analysis

## ♿ Accessibility

This module is designed with accessibility as a core principle:

### WCAG 2.1 AA Compliance

- ✅ **Keyboard Navigation**: All interactive elements accessible via keyboard
- ✅ **Screen Reader Support**: Proper ARIA labels and roles throughout
- ✅ **Color Contrast**: Sufficient contrast ratios for all text and UI elements
- ✅ **Focus Management**: Clear focus indicators and logical tab order
- ✅ **Error Handling**: Accessible error messages and recovery options

### Accessibility Features

```typescript
// Example of accessible component usage
<EmotionTimelineChart
  emotionalBeats={beats}
  aria-label="Emotional timeline chart"
  onBeatClick={(beat) => handleBeatClick(beat)}
  // Screen reader announcements for loading states
  aria-live="polite"
/>
```

## 🧪 Testing

### Running Tests

```bash
# Run all emotion arc tests
npm test -- --testPathPattern=modules/emotionArc

# Run specific component tests
npm test -- --testPathPattern=EmotionTimelineChart

# Run accessibility tests
npm test -- --testPathPattern=accessibility

# Run with coverage
npm test -- --coverage --testPathPattern=modules/emotionArc
```

### Test Coverage

- **Unit Tests**: Individual component and service testing
- **Integration Tests**: Full module workflow testing
- **Accessibility Tests**: ARIA compliance and screen reader testing
- **Error State Tests**: Graceful error handling verification
- **Loading State Tests**: Async operation state management

## 🔧 Configuration

### Environment Variables

```bash
# OpenAI API configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4

# Analysis settings
EMOTION_ANALYSIS_TIMEOUT=30000
DEBOUNCE_DELAY=400

# Feature flags
ENABLE_REAL_TIME_ANALYSIS=true
ENABLE_OPTIMIZATION_SUGGESTIONS=true
```

### Customization Options

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

## 📈 Performance

### Optimization Features

- **Debounced Analysis**: 400ms delay prevents excessive API calls
- **Caching**: Analysis results cached for improved performance
- **Lazy Loading**: Components load only when needed
- **Virtual Scrolling**: Efficient rendering of large datasets
- **Bundle Optimization**: Tree-shaking and code splitting

### Performance Metrics

- **Initial Load**: < 2 seconds
- **Analysis Response**: < 5 seconds for typical stories
- **UI Responsiveness**: < 100ms for user interactions
- **Memory Usage**: < 50MB for typical usage

## 🔒 Security

### Data Protection

- **No Data Persistence**: Analysis results not stored permanently
- **API Key Security**: Secure handling of OpenAI API keys
- **Input Sanitization**: All user inputs validated and sanitized
- **Error Handling**: Secure error messages without sensitive data exposure

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed contribution guidelines.

### Development Setup

```bash
# Clone repository
git clone https://github.com/your-org/doccraft-ai.git

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run linting
npm run lint
```

## 📝 API Reference

### Core Types

```typescript
interface EmotionalBeat {
  sceneId: string;
  characterId: string;
  emotion: string;
  intensity: number;
  narrativePosition: number;
}

interface EmotionalArc {
  id: string;
  title: string;
  beats: EmotionalBeat[];
  segments: ArcSegment[];
  overallTension: number;
  emotionalComplexity: number;
  pacingScore: number;
}

interface OptimizationSuggestion {
  id: string;
  type: 'pacing' | 'character' | 'emotional';
  priority: 'low' | 'medium' | 'high';
  description: string;
  specificChanges: string[];
  expectedImpact: number;
  riskLevel: 'low' | 'medium' | 'high';
}
```

### Service Methods

```typescript
// EmotionAnalyzer
async analyzeEmotion(text: string, config?: EmotionAnalyzerConfig): Promise<EmotionalBeat>
async analyzeSceneEmotions(scenes: SceneInput[]): Promise<SceneEmotionData[]>
async analyzeStoryEmotions(story: string): Promise<EmotionalArc>

// ArcSimulator
generateArcSimulation(sceneData: SceneEmotionData[]): ArcSimulationResult
generateArcSegments(tensionCurve: TensionCurve, scenes: SceneEmotionData[]): ArcSegment[]
simulateReaderResponse(arc: EmotionalArc): ReaderSimResult

// SuggestionEngine
generateOptimizationSuggestions(arc: EmotionalArc, simulation: ArcSimulationResult): StoryOptimizationPlan
assessRisk(suggestion: OptimizationSuggestion): RiskLevel
prioritizeSuggestions(plan: StoryOptimizationPlan): OptimizationSuggestion[]
```

## 🐛 Troubleshooting

### Common Issues

**Analysis not working**
- Check OpenAI API key configuration
- Verify network connectivity
- Check browser console for errors

**UI not responding**
- Ensure all dependencies are installed
- Check for JavaScript errors in console
- Verify component props are correct

**Accessibility issues**
- Test with screen reader software
- Verify keyboard navigation works
- Check color contrast ratios

### Debug Mode

```typescript
// Enable debug logging
const debugConfig = {
  enableLogging: true,
  logLevel: 'debug',
  showPerformanceMetrics: true
};
```

## 📞 Support

### Contact Information

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/doccraft-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/doccraft-ai/discussions)
- **Email**: support@doccraft-ai.com

### Getting Help

1. **Check Documentation**: Review this README and [CONTRIBUTING.md](./CONTRIBUTING.md)
2. **Search Issues**: Look for similar problems in GitHub Issues
3. **Create Issue**: If no solution found, create a new issue with detailed information
4. **Join Community**: Participate in GitHub Discussions for help

## 📄 License

This module is part of DocCraft AI and is licensed under the MIT License. See [LICENSE](../../LICENSE) for details.

---

**Made with ❤️ by the DocCraft AI Team**

*Last updated: January 2024*
*Version: 1.0.0* 