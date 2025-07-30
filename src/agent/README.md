# Contextual Prompt Engine

## Overview

The ContextualPromptEngine dynamically generates LLM prompt headers based on user preferences, document genre, and narrative arc stage. It provides intelligent pattern matching with fallbacks and memoization for performance.

## Features

- 🎭 **Dynamic Tone Adaptation**: Friendly, formal, casual, professional, creative, dramatic
- 🌍 **Multi-language Support**: English, Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese
- 📚 **Genre-specific Patterns**: Romance, Sci-Fi, Mystery, Fantasy, Thriller, Horror, Comedy, Historical
- 📈 **Arc-aware Generation**: Setup, rising action, climax, resolution
- 🧠 **Smart Memoization**: Avoids duplicate generation for identical inputs
- 🛡️ **Safe Fallbacks**: Graceful degradation for unknown genres/arcs
- 🔧 **Character Injection**: Automatically injects character names into patterns

## Quick Start

```typescript
import { buildContextualPromptHeader } from './ContextualPromptEngine';

const prefs = {
  tone: 'friendly',
  language: 'en',
  genre: 'Romance'
};

const context = {
  scene: 'A coffee shop on a rainy afternoon',
  arc: 'setup',
  characterName: 'Emma'
};

const header = buildContextualPromptHeader(prefs, context);

console.log(header.header);
// Output:
// /* Tone: friendly | Language: en | Genre: Romance */
// /* Pattern: "Introduce Emma and create a moment of unexpected connection" */
```

## API Reference

### `buildContextualPromptHeader(prefs, context)`

Generates a contextual prompt header based on user preferences and document context.

**Parameters:**
- `prefs: UserPrefs` - User preferences (tone, language, genre)
- `context: DocumentContext` - Document context (scene, arc, characterName)

**Returns:**
- `PromptHeader` - Generated prompt header with metadata

### Types

```typescript
interface UserPrefs {
  tone: string;      // 'friendly' | 'formal' | 'casual' | 'professional' | 'creative' | 'dramatic'
  language: string;  // 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ja' | 'ko' | 'zh'
  genre: string;     // Any genre string
}

interface DocumentContext {
  scene: string;           // Scene description
  arc: string;            // 'setup' | 'rising' | 'climax' | 'resolution'
  characterName?: string; // Optional character name
}

interface PromptHeader {
  header: string;        // Generated prompt header
  tone: string;         // Used tone
  language: string;     // Used language
  genre: string;        // Used genre
  patternUsed?: string; // Pattern that was used
}
```

## Usage Examples

### Basic Usage

```typescript
import { buildContextualPromptHeader } from './ContextualPromptEngine';

// Simple romance setup
const header = buildContextualPromptHeader(
  { tone: 'friendly', language: 'en', genre: 'Romance' },
  { scene: 'A bookstore', arc: 'setup', characterName: 'Alex' }
);

console.log(header.header);
// /* Tone: friendly | Language: en | Genre: Romance */
// /* Pattern: "Introduce Alex and create a moment of unexpected connection" */
```

### Advanced Usage with Engine Instance

```typescript
import { ContextualPromptEngine } from './ContextualPromptEngine';

// Create engine with custom configuration
const engine = new ContextualPromptEngine({
  debug: true,
  enableMemoization: true,
  maxMemoizedEntries: 200
});

// Generate headers for different scenarios
const scenarios = [
  {
    prefs: { tone: 'dramatic', language: 'es', genre: 'Mystery' },
    context: { scene: 'A dark alley', arc: 'climax', characterName: 'Detective Maria' }
  },
  {
    prefs: { tone: 'casual', language: 'fr', genre: 'Comedy' },
    context: { scene: 'A chaotic office', arc: 'rising', characterName: 'Pierre' }
  }
];

scenarios.forEach(({ prefs, context }) => {
  const header = engine.buildContextualPromptHeader(prefs, context);
  console.log(`${prefs.genre} - ${context.arc}:`, header.patternUsed);
});
```

### Genre-Specific Patterns

```typescript
// Sci-Fi with technological elements
const sciFiHeader = buildContextualPromptHeader(
  { tone: 'professional', language: 'en', genre: 'Sci-Fi' },
  { scene: 'A space station', arc: 'setup', characterName: 'Commander Chen' }
);

// Fantasy with magical elements
const fantasyHeader = buildContextualPromptHeader(
  { tone: 'creative', language: 'en', genre: 'Fantasy' },
  { scene: 'An ancient forest', arc: 'rising', characterName: 'Mage Elena' }
);

// Horror with supernatural elements
const horrorHeader = buildContextualPromptHeader(
  { tone: 'dramatic', language: 'en', genre: 'Horror' },
  { scene: 'An abandoned mansion', arc: 'climax', characterName: 'Sarah' }
);
```

## Pattern Library

The engine uses a comprehensive pattern library with genre and arc-specific prompts:

### Available Genres
- **Romance**: Love, relationships, emotional connections
- **Sci-Fi**: Technology, futuristic settings, scientific discovery
- **Mystery**: Investigation, clues, revelations
- **Fantasy**: Magic, mythical worlds, supernatural elements
- **Thriller**: Suspense, danger, high stakes
- **Horror**: Fear, supernatural, psychological tension
- **Comedy**: Humor, misunderstandings, light-hearted situations
- **Historical**: Period settings, historical events, cultural context

### Available Arcs
- **Setup**: Introduction, world-building, character establishment
- **Rising**: Conflict development, tension building
- **Climax**: Peak conflict, revelation, high stakes
- **Resolution**: Consequences, aftermath, character growth

### Pattern Examples

```typescript
// Romance - Setup
"Introduce [CHARACTER] and create a moment of unexpected connection"

// Sci-Fi - Rising
"Create a discovery that challenges [CHARACTER]'s understanding of reality"

// Mystery - Climax
"Confront [CHARACTER] with the truth they've been seeking"

// Fantasy - Resolution
"Show [CHARACTER] mastering their magical abilities"
```

## Configuration

### Engine Configuration

```typescript
interface PromptEngineConfig {
  debug?: boolean;              // Enable debug logging
  enableMemoization?: boolean;  // Enable result caching
  maxMemoizedEntries?: number;  // Maximum cache size
}
```

### Safe Fallbacks

The engine includes safe fallbacks for invalid inputs:

- **Invalid Tone**: Falls back to 'friendly'
- **Invalid Language**: Falls back to 'en'
- **Unknown Genre**: Uses 'DEFAULT' patterns
- **Unknown Arc**: Falls back to 'setup'

## Performance Features

### Memoization

The engine caches results to avoid duplicate generation:

```typescript
const engine = new ContextualPromptEngine({ enableMemoization: true });

// First call - generates new pattern
const header1 = engine.buildContextualPromptHeader(prefs, context);

// Second call - uses cached result
const header2 = engine.buildContextualPromptHeader(prefs, context);

// Results are identical
expect(header1).toEqual(header2);
```

### Cache Management

```typescript
// Clear cache
engine.clearMemoizationCache();

// Get cache statistics
const stats = engine.getCacheStats();
console.log(`Cache size: ${stats.size}, Last used: ${stats.lastUsed}`);
```

## Debug Mode

Enable debug logging for development:

```typescript
const debugEngine = new ContextualPromptEngine({ debug: true });

debugEngine.buildContextualPromptHeader(prefs, context);
// Output:
// [PromptEngine] Building contextual prompt header
// [PromptEngine] Prefs: { tone: 'friendly', language: 'en', genre: 'Romance' }
// [PromptEngine] Context: { scene: 'A coffee shop', arc: 'setup', characterName: 'Emma' }
// [PromptEngine] Looking for pattern: Romance / setup
// [PromptEngine] Found exact pattern for Romance / setup: "Introduce [CHARACTER] and create a moment of unexpected connection"
// [PromptEngine] Injected character name: "Introduce [CHARACTER] and create a moment of unexpected connection" → "Introduce Emma and create a moment of unexpected connection"
// [PromptEngine] Built header: /* Tone: friendly | Language: en | Genre: Romance */\n/* Pattern: "Introduce Emma and create a moment of unexpected connection" */\n\n
// [PromptEngine] Generated header: { header: "...", tone: "friendly", language: "en", genre: "Romance", patternUsed: "..." }
```

## Best Practices

### 1. Character Names
- Always provide character names when available
- Use full names for better context
- Handle special characters gracefully

### 2. Genre Selection
- Choose specific genres for better pattern matching
- Use 'DEFAULT' as fallback for unknown genres
- Consider genre subcategories for more specific patterns

### 3. Arc Progression
- Match arc to current story stage
- Use 'setup' for introductions
- Use 'climax' for high-stakes moments

### 4. Tone Consistency
- Maintain consistent tone throughout story
- Match tone to genre expectations
- Consider audience preferences

### 5. Performance
- Enable memoization for repeated calls
- Clear cache periodically for memory management
- Use debug mode sparingly in production

## Testing

Run the test suite:

```bash
npm test ContextualPromptEngine.test.ts
```

Test coverage includes:
- Basic functionality
- Pattern matching
- Fallback behavior
- Memoization
- Character injection
- Edge cases
- Configuration options

## Integration

### With LLM Systems

```typescript
import { buildContextualPromptHeader } from './ContextualPromptEngine';

async function generateStoryContent(prefs: UserPrefs, context: DocumentContext, userPrompt: string) {
  const header = buildContextualPromptHeader(prefs, context);
  
  const fullPrompt = `${header.header}${userPrompt}`;
  
  // Send to LLM
  const response = await callLLM(fullPrompt);
  
  return response;
}
```

### With React Components

```typescript
import React, { useState } from 'react';
import { buildContextualPromptHeader } from './ContextualPromptEngine';

function StoryGenerator() {
  const [prefs, setPrefs] = useState({
    tone: 'friendly',
    language: 'en',
    genre: 'Romance'
  });
  
  const [context, setContext] = useState({
    scene: '',
    arc: 'setup',
    characterName: ''
  });
  
  const generateHeader = () => {
    return buildContextualPromptHeader(prefs, context);
  };
  
  return (
    <div>
      {/* UI components for prefs and context */}
      <div className="generated-header">
        <pre>{generateHeader().header}</pre>
      </div>
    </div>
  );
}
```

## Future Enhancements

- [ ] Custom pattern library support
- [ ] A/B testing for pattern effectiveness
- [ ] Machine learning pattern optimization
- [ ] Multi-language pattern variations
- [ ] Genre subcategory support
- [ ] Collaborative pattern editing
- [ ] Pattern effectiveness metrics
- [ ] Real-time pattern updates 