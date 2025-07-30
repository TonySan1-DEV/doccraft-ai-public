# Preset System Documentation

## Overview

The Preset System allows writers to quickly switch between predefined creative modes, providing optimized configurations for different writing scenarios. This system includes built-in presets for various writing styles and supports custom preset creation.

## Features

- **Built-in Presets**: Pre-configured modes for common writing scenarios
- **Custom Presets**: User-created presets for specific workflows
- **Quick Switching**: One-click preset application
- **Version Integration**: Automatic version creation when applying presets
- **Recommendations**: AI-powered preset suggestions based on current preferences
- **Search & Filter**: Find presets by category, tags, or description
- **Usage Tracking**: Monitor which presets are used most frequently

## Built-in Presets

### Writing Modes

#### Fast Draft ⚡
- **Description**: Optimized for rapid content creation with minimal interruptions
- **Settings**: Friendly tone, copilot enabled, memory enabled
- **Best for**: Quick writing, brainstorming, first drafts

#### Creative Flow 🎨
- **Description**: Enhanced creativity with maximum AI assistance and memory
- **Settings**: Friendly tone, copilot enabled, memory enabled, grid view
- **Best for**: Creative writing, artistic projects, inspiration

#### Academic Writing 📚
- **Description**: Formal tone optimized for research papers and scholarly content
- **Settings**: Formal tone, copilot disabled, memory enabled
- **Best for**: Research papers, academic writing, formal documents

#### Technical Documentation 🔧
- **Description**: Precise and structured for technical writing and documentation
- **Settings**: Concise tone, copilot disabled, memory enabled
- **Best for**: Technical docs, manuals, structured content

### Editing Modes

#### Editor Mode ✏️
- **Description**: Focused editing with minimal distractions and precise feedback
- **Settings**: Concise tone, copilot disabled, memory disabled
- **Best for**: Editing, proofreading, focused work

#### Revision Mode 🔍
- **Description**: Comprehensive revision with detailed feedback and suggestions
- **Settings**: Formal tone, copilot enabled, memory enabled
- **Best for**: Major revisions, detailed editing

#### Proofreading ✅
- **Description**: Grammar and style checking with minimal AI interference
- **Settings**: Concise tone, copilot disabled, memory disabled
- **Best for**: Final proofreading, grammar checks

### Publishing Modes

#### Publication Mode 📖
- **Description**: Polished output ready for professional publication
- **Settings**: Formal tone, copilot disabled, memory enabled
- **Best for**: Final drafts, professional publishing

#### Blog Writing 📝
- **Description**: Engaging and conversational content for web publishing
- **Settings**: Friendly tone, copilot enabled, memory enabled, grid view
- **Best for**: Blog posts, web content, social media

#### Social Media 📱
- **Description**: Concise and engaging content optimized for social platforms
- **Settings**: Friendly tone, copilot enabled, memory disabled, grid view
- **Best for**: Social media posts, short content

### Specialized Modes

#### Storytelling 📖
- **Description**: Narrative-focused mode with enhanced character and plot assistance
- **Settings**: Friendly tone, copilot enabled, memory enabled, grid view
- **Best for**: Fiction writing, storytelling, character development

#### Poetry 🌸
- **Description**: Creative mode optimized for poetic expression and rhythm
- **Settings**: Friendly tone, copilot enabled, memory enabled, grid view
- **Best for**: Poetry, creative expression, artistic writing

#### Script Writing 🎬
- **Description**: Dialogue-focused mode for screenplays and scripts
- **Settings**: Concise tone, copilot enabled, memory enabled
- **Best for**: Screenplays, scripts, dialogue-heavy content

#### Journaling 📔
- **Description**: Personal reflection mode with minimal AI interference
- **Settings**: Friendly tone, copilot disabled, memory enabled
- **Best for**: Personal writing, journaling, private content

## Usage

### Applying Presets

#### Via UI
1. Open the Agent Preferences Panel
2. Click on the "Presets" tab
3. Browse presets by category or search for specific ones
4. Click "Apply" on your chosen preset
5. The preset will be applied and a version will be created automatically

#### Via Code
```typescript
import { presetService } from '../services/presetService';

// Apply a preset
const result = await presetService.applyPreset('Fast Draft', currentPreferences, {
  createVersion: true,
  versionLabel: 'Applied Fast Draft preset',
  mergeMode: 'replace'
});

if (result.success) {
  // Update preferences with applied preset
  await updatePreferences(result.appliedPreferences);
}
```

### Creating Custom Presets

#### Via UI
1. Open the Agent Preferences Panel
2. Click on the "Presets" tab
3. Click "Create Custom Preset"
4. Fill in the preset details:
   - **Name**: Unique preset name
   - **Description**: What this preset is for
   - **Category**: Writing, Editing, Publishing, or Specialized
   - **Settings**: Configure tone, copilot, memory, etc.
5. Click "Create Preset"

#### Via Code
```typescript
const customPreset = await presetService.createCustomPreset({
  name: 'My Custom Preset',
  description: 'Optimized for my specific workflow',
  category: 'writing',
  preferences: {
    tone: 'friendly',
    copilotEnabled: true,
    memoryEnabled: true,
    defaultCommandView: 'grid'
  },
  tags: ['custom', 'workflow', 'optimized']
}, userId);
```

### Searching Presets

```typescript
// Search by query
const searchResults = presetService.searchPresets('fast');

// Get by category
const writingPresets = presetService.getPresetsByCategory('writing');

// Get recommendations
const recommendations = presetService.getPresetRecommendations(currentPreferences);
```

## API Reference

### PresetService

#### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `applyPreset(name, preferences, options)` | Apply a preset to current preferences | `Promise<PresetApplicationResult>` |
| `getAllPresets()` | Get all available presets | `(WriterPreset \| CustomPreset)[]` |
| `getPresetsByCategory(category)` | Get presets by category | `(WriterPreset \| CustomPreset)[]` |
| `searchPresets(query)` | Search presets by name/description/tags | `(WriterPreset \| CustomPreset)[]` |
| `getPresetByName(name)` | Get specific preset by name | `WriterPreset \| CustomPreset \| undefined` |
| `createCustomPreset(preset, userId)` | Create a custom preset | `Promise<CustomPreset \| null>` |
| `updateCustomPreset(name, updates, userId)` | Update a custom preset | `Promise<CustomPreset \| null>` |
| `deleteCustomPreset(name, userId)` | Delete a custom preset | `Promise<boolean>` |
| `getPresetRecommendations(preferences)` | Get AI recommendations | `(WriterPreset \| CustomPreset)[]` |
| `getRecentlyUsedPresets()` | Get recently used presets | `string[]` |
| `addToRecentlyUsed(name)` | Add preset to recently used | `void` |
| `getPresetUsageStats()` | Get usage statistics | `Record<string, number>` |
| `incrementPresetUsage(name)` | Increment usage count | `void` |
| `exportCustomPresets()` | Export custom presets | `string` |
| `importCustomPresets(data, userId)` | Import custom presets | `Promise<boolean>` |

### Types

```typescript
interface WriterPreset {
  name: string;
  description: string;
  icon?: string;
  category: 'writing' | 'editing' | 'publishing' | 'specialized';
  preferences: Partial<AgentPrefs>;
  tags: string[];
  isPopular?: boolean;
}

interface CustomPreset extends WriterPreset {
  id: string;
  userId: string;
  createdAt: string;
  isCustom: true;
}

interface PresetApplicationResult {
  success: boolean;
  appliedPreferences: AgentPrefs;
  versionCreated?: string;
  error?: string;
}
```

## Integration with Version System

When a preset is applied, the system automatically:

1. **Creates a Version**: A new version is created with the applied preset
2. **Tracks Changes**: The version includes metadata about which preset was applied
3. **Enables Rollback**: Users can restore to the state before preset application

### Version Metadata

```typescript
{
  presetName: "Fast Draft",
  presetCategory: "writing",
  mergeMode: "replace",
  appliedAt: "2024-01-15T10:30:00Z"
}
```

## UI Components

### PresetSelector

A comprehensive component for browsing and applying presets:

```typescript
import { PresetSelector } from '../components/PresetSelector';

<PresetSelector 
  onPresetApplied={(preset) => {
    console.log(`Applied preset: ${preset.name}`);
  }}
  showCreateCustom={true}
  showRecentlyUsed={true}
  showRecommendations={true}
/>
```

**Features:**
- Category-based browsing
- Search functionality
- Recently used presets
- AI recommendations
- Custom preset creation
- One-click application

### Integration in AgentPreferencesPanel

The preset system is integrated into the main preferences panel with a dedicated tab:

```typescript
// Tab navigation includes:
// - Preferences (manual settings)
// - Version History (version management)
// - Presets (quick switching)
```

## Best Practices

### Choosing the Right Preset

1. **Fast Draft**: Use for initial writing, brainstorming, or when you need to get ideas down quickly
2. **Editor Mode**: Use when focusing on editing and refinement
3. **Publication Mode**: Use for final drafts and professional content
4. **Creative Flow**: Use for artistic and creative projects
5. **Academic Writing**: Use for research papers and formal documents

### Creating Custom Presets

1. **Start with a Base**: Begin with a built-in preset that's close to your needs
2. **Test Thoroughly**: Apply your custom preset and test it with real writing
3. **Use Descriptive Names**: Name presets clearly to identify their purpose
4. **Add Relevant Tags**: Use tags to make presets searchable
5. **Document Purpose**: Include clear descriptions of when to use each preset

### Workflow Integration

1. **Start with Fast Draft**: Begin writing sessions with Fast Draft for quick ideation
2. **Switch to Editor Mode**: When ready to refine, switch to Editor Mode
3. **Use Publication Mode**: For final polish and professional output
4. **Create Custom Presets**: For recurring workflows or specific project types

## Performance Considerations

### Memory Usage
- Preset definitions are lightweight and cached
- Custom presets are stored in localStorage
- No network requests for built-in presets

### Loading Time
- Preset definitions load instantly
- Custom presets load from localStorage
- Search and filtering are client-side operations

### Storage
- Custom presets stored in localStorage
- Usage statistics tracked locally
- Export/import for backup and sharing

## Troubleshooting

### Common Issues

**Preset Not Applying**
- Check if user has permission to update preferences
- Verify preset preferences are valid
- Check for locked fields in current preferences

**Custom Preset Not Saving**
- Ensure preset name is unique
- Verify all required fields are filled
- Check localStorage permissions

**Search Not Working**
- Verify search query is not empty
- Check if preset has relevant tags
- Ensure search includes name, description, and tags

### Debug Steps

1. **Check Console**: Look for error messages in browser console
2. **Verify Permissions**: Ensure user can update preferences
3. **Test Validation**: Verify preset preferences are valid
4. **Check Storage**: Ensure localStorage is available and working
5. **Validate Data**: Check if preset data is properly formatted

## Future Enhancements

### Planned Features

- **Preset Sharing**: Share custom presets with other users
- **Preset Analytics**: Detailed usage analytics and insights
- **AI Preset Generation**: AI-generated presets based on writing style
- **Preset Templates**: Template system for common preset patterns
- **Cloud Sync**: Sync custom presets across devices

### Performance Improvements

- **Lazy Loading**: Load preset categories on demand
- **Virtual Scrolling**: Handle large numbers of presets efficiently
- **Caching**: Cache frequently used presets
- **Background Sync**: Sync presets in background

### User Experience

- **Drag & Drop**: Reorder presets by drag and drop
- **Keyboard Shortcuts**: Quick preset switching with keyboard
- **Preset Favorites**: Mark frequently used presets as favorites
- **Preset Previews**: Preview preset effects before applying 