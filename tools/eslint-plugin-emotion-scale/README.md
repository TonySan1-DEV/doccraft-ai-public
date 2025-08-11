# ESLint Plugin: Emotion Scale

A custom ESLint plugin to prevent inappropriate scaling operations on emotion-related fields in the DocCraft AI project.

## Features

- Detects `* 100` and `/ 100` operations on emotion fields
- Supports member expressions like `obj.intensity * 100`
- Allows legitimate UI formatting and utility functions
- Configurable exceptions for tests, stories, and utility files

## Installation

This plugin is included as a local tool in the DocCraft AI project.

## Usage

### Configuration

```javascript
import emotionScalePlugin from './tools/eslint-plugin-emotion-scale/index.js';

export default [
  {
    files: ['modules/emotionArc/**/*.{ts,tsx}'],
    plugins: {
      'emotion-scale': emotionScalePlugin,
    },
    rules: {
      'emotion-scale/no-emotion-mis-scaling': [
        'error',
        {
          fields: [
            'intensity',
            'confidence',
            'tension',
            'empathy',
            'engagement',
            'emotionalComplexity',
          ],
          allowFunctions: [
            'formatPercentage',
            'renderPercent',
            'toPercentDisplay',
          ],
          allowFileGlobs: ['**/__tests__/**', '**/*.stories.*'],
          allowPosition: true,
        },
      ],
    },
  },
];
```

### Options

- `fields`: Array of emotion field names to monitor (default: `["intensity", "confidence", "tension", "empathy", "engagement", "emotionalComplexity"]`)
- `allowFunctions`: Array of function names where scaling operations are allowed (default: `["formatPercentage", "renderPercent", "toPercentDisplay"]`)
- `allowFileGlobs`: Array of file patterns where scaling operations are allowed (default: `["**/__tests__/**", "**/*.stories.*"]`)
- `allowPosition`: Boolean to allow position → percentage conversion (default: `true`)

### Examples

#### ❌ Invalid Operations

```typescript
// These will trigger errors
const intensity = emotion.intensity * 100; // Error
const confidence = emotion.confidence / 100; // Error
const tension = curve.tension * 100; // Error
```

#### ✅ Valid Operations

```typescript
// These are allowed
const displayText = toPercentDisplay(position); // OK
const percentage = formatPercentage(intensity); // OK
const clamped = clamp100(value); // OK
```

## Error Messages

The plugin provides clear error messages:

```
Avoid multiplying by 100 on intensity (0–100 domain). Use data as-is or UI formatters. For fractions, convert upstream.
```

## Contributing

This plugin is specifically designed for the DocCraft AI emotion arc module. For modifications, update the plugin code and test with the emotion arc module.
