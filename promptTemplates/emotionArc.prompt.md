# Emotional Arc Modeling - Cursor Prompt Templates

This document contains reusable prompt templates for developing the Emotional Arc Modeling system in DocCraft AI.

## Template Metadata

- **Project**: DocCraft AI v3
- **Module**: Emotional Arc Modeling
- **Framework**: React + TypeScript + Vite + Tailwind CSS
- **Testing**: Jest + React Testing Library
- **Accessibility**: ARIA compliance required
- **MCP Compliance**: All files require MCP Context Blocks

---

## 1. Module Scaffolding Template

### Title
Emotional Arc Module Scaffolding

### Prompt
```
// Emotional Arc Module Scaffolding – MCP Scoped
/* role: developer, tier: Pro, file: "initEmotionArcModule.ts", allowedActions: ["scaffold", "structure", "define"] */

Prompt: "Scaffold the full file structure for an Emotional Arc Modeling feature in a modular writing app. Include:
- Core logic services (emotionAnalyzer.ts, arcSimulator.ts, suggestionEngine.ts)
- UI components (EmotionTimelineChart.tsx, TensionCurveViewer.tsx, OptimizationSuggestions.tsx)
- Type definitions (emotionTypes.ts)
- Index and loader file

Ensure all files are placed under `/modules/emotionArc/` and follow accessible, testable, and reusable conventions."
```

### Expected File Scope
- `/modules/emotionArc/`
- `/modules/emotionArc/services/`
- `/modules/emotionArc/components/`
- `/modules/emotionArc/types/`
- `/modules/emotionArc/utils/`
- `/modules/emotionArc/constants/`

### Role/Tier/Actions Metadata
- **Role**: developer
- **Tier**: Pro
- **Allowed Actions**: ["scaffold", "structure", "define"]
- **Theme**: writing_suite

---

## 2. Analyzer + Simulator Logic Generation Template

### Title
Emotion Analyzer Logic Generation

### Prompt
```
// Emotion Analyzer Logic – MCP Scoped
/* role: developer, tier: Pro, file: "emotionAnalyzer.ts", allowedActions: ["generate", "analyze", "extract"] */

Prompt: "Generate a functional module that:
1. Accepts raw scene text and optional character focus.
2. Uses OpenAI (or local transformer model) to extract key emotional beats (joy, fear, tension, relief, etc.).
3. Returns a list of `EmotionalBeat` objects including `emotion`, `intensity`, `sceneId`, `characterId`, and `narrativePosition`.
4. Allows pluggable model choice for inference.
Use async/await, TypeScript, and ensure output schema validation."
```

### Expected File Scope
- `/modules/emotionArc/services/emotionAnalyzer.ts`
- `/modules/emotionArc/services/arcSimulator.ts`
- `/modules/emotionArc/services/suggestionEngine.ts`

### Role/Tier/Actions Metadata
- **Role**: developer
- **Tier**: Pro
- **Allowed Actions**: ["generate", "analyze", "extract"]
- **Theme**: writing_suite

---

## 3. UI Component Scaffolding Template

### Title
Emotion Arc UI Components Scaffolding

### Prompt
```
// Emotion Arc UI Components – MCP Scoped
/* role: frontend-developer, tier: Pro, file: "EmotionArcUI.tsx", allowedActions: ["scaffold", "visualize", "simulate", "accessibility"], theme: "emotional_modeling" */

Prompt: "Scaffold UI components for an Emotional Arc Modeling system in a modular writing suite:
1. `<EmotionTimelineChart />`: Line graph showing emotional beats per character over narrative progression. Supports multi-character toggle and ARIA annotations.
2. `<TensionCurveViewer />`: Area chart representing emotional tension or reader empathy across scenes. Includes hover feedback and zoom.
3. `<OptimizationSuggestions />`: Panel listing AI-generated scene improvement suggestions with severity tags and impact score bars.

Ensure:
- Full accessibility (ARIA roles, screen reader labels)
- Type-safe props and reusable structure
- Support for async loading and error boundaries
- Logical folder placement under `/modules/emotionArc/components/`
- Test hooks for React Testing Library
Generate storybook stubs and example props if useful."
```

### Expected File Scope
- `/modules/emotionArc/components/`
- `/modules/emotionArc/components/__tests__/`
- `/modules/emotionArc/components/__stories__/`

### Role/Tier/Actions Metadata
- **Role**: frontend-developer
- **Tier**: Pro
- **Allowed Actions**: ["scaffold", "visualize", "simulate", "accessibility"]
- **Theme**: emotional_modeling

---

## 4. Service-UI Wiring Template

### Title
Connect UI to Services

### Prompt
```
// Connect UI to Services – MCP Scoped
/* role: frontend-developer, tier: Pro, file: "EmotionalArcModule.tsx", allowedActions: ["connect", "fetch", "analyze", "simulate", "suggest"] */

Prompt: "Connect all Emotional Arc UI components to backend services:
- Call `emotionAnalyzer.analyze()` with scene/character input to populate `EmotionTimelineChart`.
- Use `arcSimulator.simulate()` to drive `TensionCurveViewer`.
- Pass `suggestionEngine.recommend()` output into `OptimizationSuggestions`.

Implement with:
- React hooks (or React Query if supported)
- Async loading states and error boundaries
- Type-safe response handling
- Optional debounce for high-frequency text updates"
```

### Expected File Scope
- `/modules/emotionArc/components/EmotionalArcModule.tsx`
- Service integration points

### Role/Tier/Actions Metadata
- **Role**: frontend-developer
- **Tier**: Pro
- **Allowed Actions**: ["connect", "fetch", "analyze", "simulate", "suggest"]
- **Theme**: emotional_modeling

---

## 5. Testing Scaffold Template

### Title
Generate Component Tests

### Prompt
```
// Generate Component Tests – MCP Scoped
/* role: qa, tier: Pro, file: "__tests__/emotionArc.spec.tsx", allowedActions: ["generate", "test", "validate", "mock"] */

Prompt: "Create Jest + React Testing Library test suites for:
- `<EmotionTimelineChart />`
- `<TensionCurveViewer />`
- `<OptimizationSuggestions />`
- `<SceneSentimentPanel />`
- `<CharacterArcSwitch />`

Use:
- `testHooks.ts` for mounting utilities
- Realistic mock data from emotionTypes
- Accessibility tests for ARIA compliance
- Error state and loading state testing"
```

### Expected File Scope
- `/modules/emotionArc/components/__tests__/emotionArc.spec.tsx`
- `/modules/emotionArc/components/__tests__/testHooks.ts`

### Role/Tier/Actions Metadata
- **Role**: qa
- **Tier**: Pro
- **Allowed Actions**: ["generate", "test", "validate", "mock"]
- **Theme**: emotional_modeling

---

## 6. CI/CD Pipeline Template

### Title
CI/CD Pipeline for Emotion Arc Module

### Prompt
```
// CI/CD Pipeline for Emotion Arc Module – MCP Scoped
/* role: devops, tier: Admin, file: ".github/workflows/emotionArc.yml", allowedActions: ["deploy", "lint", "test", "build"] */

Prompt: "Create a GitHub Actions workflow to:
- Run type check and Jest tests on emotionArc module
- Lint with ESLint
- Build Storybook previews for `EmotionArcStories.tsx`
- Deploy to Vercel with `emotionArc` route

Add caching and test matrix for Node versions (16, 18)"
```

### Expected File Scope
- `.github/workflows/emotionArc.yml`
- CI/CD configuration

### Role/Tier/Actions Metadata
- **Role**: devops
- **Tier**: Admin
- **Allowed Actions**: ["deploy", "lint", "test", "build"]
- **Theme**: deployment

---

## 7. Type Definition Template

### Title
Emotion Arc Type Definitions

### Prompt
```
// Emotion Arc Types – MCP Scoped
/* role: developer, tier: Pro, file: "emotionTypes.ts", allowedActions: ["define", "structure", "type"] */

Prompt: "Define TypeScript interfaces and types for Emotional Arc Modeling:
- `EmotionalBeat`: Individual emotion data points
- `ArcSegment`: Story segments with tension levels
- `ReaderSimResult`: Simulated reader response
- `EmotionalArc`: Complete story emotional structure
- `CharacterEmotionalProfile`: Per-character emotion tracking
- `StoryEmotionalMap`: Overall story emotional landscape
- Service interfaces and configuration types

Ensure type safety, documentation, and reusability."
```

### Expected File Scope
- `/modules/emotionArc/types/emotionTypes.ts`

### Role/Tier/Actions Metadata
- **Role**: developer
- **Tier**: Pro
- **Allowed Actions**: ["define", "structure", "type"]
- **Theme**: writing_suite

---

## 8. Validation Utility Template

### Title
Emotion Arc Validation Utilities

### Prompt
```
// Emotion Arc Validation – MCP Scoped
/* role: developer, tier: Pro, file: "validation.ts", allowedActions: ["validate", "verify", "check"] */

Prompt: "Create validation utilities for Emotional Arc data structures:
- `validateEmotionalBeat()`: Validate individual emotion data
- `validateEmotionalArc()`: Validate complete story structure
- `validateSceneData()`: Validate scene-level emotion data
- `validateAnalysisResult()`: Validate analysis output
- Schema validation with detailed error messages
- Type guards for runtime type checking

Include comprehensive error handling and validation rules."
```

### Expected File Scope
- `/modules/emotionArc/utils/validation.ts`

### Role/Tier/Actions Metadata
- **Role**: developer
- **Tier**: Pro
- **Allowed Actions**: ["validate", "verify", "check"]
- **Theme**: writing_suite

---

## 9. Constants and Configuration Template

### Title
Emotion Arc Constants and Configuration

### Prompt
```
// Emotion Arc Constants – MCP Scoped
/* role: developer, tier: Pro, file: "emotions.ts", allowedActions: ["define", "configure", "constant"] */

Prompt: "Define constants and configuration for Emotional Arc Modeling:
- Emotion categories and keywords
- Intensity mappings and thresholds
- Color codes for visualization
- Tension and empathy constants
- Engagement thresholds
- Complexity weights
- Default configurations for services

Ensure consistency across the module."
```

### Expected File Scope
- `/modules/emotionArc/constants/emotions.ts`
- `/modules/emotionArc/constants/config.ts`

### Role/Tier/Actions Metadata
- **Role**: developer
- **Tier**: Pro
- **Allowed Actions**: ["define", "configure", "constant"]
- **Theme**: writing_suite

---

## 10. Documentation Template

### Title
Emotion Arc Module Documentation

### Prompt
```
// Emotion Arc Documentation – MCP Scoped
/* role: technical-writer, tier: Pro, file: "README.md", allowedActions: ["document", "explain", "guide"] */

Prompt: "Create comprehensive documentation for the Emotional Arc Modeling module:
- Overview and purpose
- Architecture and data flow
- API documentation for services
- Component usage examples
- Configuration options
- Testing guidelines
- Performance considerations
- Future enhancements

Include code examples and usage patterns."
```

### Expected File Scope
- `/modules/emotionArc/README.md`

### Role/Tier/Actions Metadata
- **Role**: technical-writer
- **Tier**: Pro
- **Allowed Actions**: ["document", "explain", "guide"]
- **Theme**: documentation

---

## Usage Guidelines

### When to Use Each Template

1. **Module Scaffolding**: Use when starting a new feature or module
2. **Analyzer Logic**: Use when implementing core analysis services
3. **UI Components**: Use when creating new visualization components
4. **Service-UI Wiring**: Use when connecting frontend to backend services
5. **Testing**: Use when creating comprehensive test suites
6. **CI/CD**: Use when setting up deployment pipelines
7. **Type Definitions**: Use when defining data structures
8. **Validation**: Use when implementing data validation
9. **Constants**: Use when defining configuration and constants
10. **Documentation**: Use when creating module documentation

### MCP Compliance Notes

- All templates include MCP Context Blocks
- Role, tier, and allowed actions are specified
- File scope is clearly defined
- Theme is appropriate for the task

### Best Practices

1. **Always include MCP Context Block** at the top of generated files
2. **Use TypeScript** for type safety
3. **Include accessibility features** in UI components
4. **Write comprehensive tests** for all functionality
5. **Document thoroughly** with examples
6. **Follow project conventions** for file structure
7. **Include error handling** in all async operations
8. **Use proper ARIA attributes** for accessibility

---

## Template Version History

- **v1.0**: Initial template set for Emotional Arc Modeling
- **v1.1**: Added CI/CD and documentation templates
- **v1.2**: Enhanced with validation and constants templates

---

*Last Updated: 2024-01-XX*
*Template Version: 1.2* 