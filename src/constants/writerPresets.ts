// MCP Context Block
/*
{
  file: "writerPresets.ts",
  role: "frontend-developer",
  allowedActions: ["presets", "preferences"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "writer_presets"
}
*/

import { AgentPrefs } from '../types/agentPreferences';

// Preset interface
export interface WriterPreset {
  name: string;
  description: string;
  icon?: string;
  category: 'writing' | 'editing' | 'publishing' | 'specialized';
  preferences: Partial<AgentPrefs>;
  tags: string[];
  isPopular?: boolean;
}

// Custom preset interface for user-created presets
export interface CustomPreset extends WriterPreset {
  id: string;
  userId: string;
  createdAt: string;
  isCustom: true;
}

// Writer presets for different creative modes
export const writerPresets: Record<string, WriterPreset> = {
  // Writing Modes
  "Fast Draft": {
    name: "Fast Draft",
    description: "Optimized for rapid content creation with minimal interruptions",
    icon: "⚡",
    category: "writing",
    preferences: {
      tone: "friendly",
      language: "en",
      copilotEnabled: true,
      memoryEnabled: true,
      defaultCommandView: "list"
    },
    tags: ["quick", "draft", "creative", "flow"],
    isPopular: true
  },

  "Creative Flow": {
    name: "Creative Flow",
    description: "Enhanced creativity with maximum AI assistance and memory",
    icon: "🎨",
    category: "writing",
    preferences: {
      tone: "friendly",
      language: "en",
      copilotEnabled: true,
      memoryEnabled: true,
      defaultCommandView: "grid"
    },
    tags: ["creative", "artistic", "flow", "inspiration"]
  },

  "Academic Writing": {
    name: "Academic Writing",
    description: "Formal tone optimized for research papers and scholarly content",
    icon: "📚",
    category: "writing",
    preferences: {
      tone: "formal",
      language: "en",
      copilotEnabled: false,
      memoryEnabled: true,
      defaultCommandView: "list"
    },
    tags: ["academic", "research", "formal", "scholarly"]
  },

  "Technical Documentation": {
    name: "Technical Documentation",
    description: "Precise and structured for technical writing and documentation",
    icon: "🔧",
    category: "writing",
    preferences: {
      tone: "concise",
      language: "en",
      copilotEnabled: false,
      memoryEnabled: true,
      defaultCommandView: "list"
    },
    tags: ["technical", "documentation", "precise", "structured"]
  },

  // Editing Modes
  "Editor Mode": {
    name: "Editor Mode",
    description: "Focused editing with minimal distractions and precise feedback",
    icon: "✏️",
    category: "editing",
    preferences: {
      tone: "concise",
      language: "en",
      copilotEnabled: false,
      memoryEnabled: false,
      defaultCommandView: "list"
    },
    tags: ["editing", "focused", "precise", "minimal"],
    isPopular: true
  },

  "Revision Mode": {
    name: "Revision Mode",
    description: "Comprehensive revision with detailed feedback and suggestions",
    icon: "🔍",
    category: "editing",
    preferences: {
      tone: "formal",
      language: "en",
      copilotEnabled: true,
      memoryEnabled: true,
      defaultCommandView: "list"
    },
    tags: ["revision", "detailed", "comprehensive", "feedback"]
  },

  "Proofreading": {
    name: "Proofreading",
    description: "Grammar and style checking with minimal AI interference",
    icon: "✅",
    category: "editing",
    preferences: {
      tone: "concise",
      language: "en",
      copilotEnabled: false,
      memoryEnabled: false,
      defaultCommandView: "list"
    },
    tags: ["proofreading", "grammar", "style", "minimal"]
  },

  // Publishing Modes
  "Publication Mode": {
    name: "Publication Mode",
    description: "Polished output ready for professional publication",
    icon: "📖",
    category: "publishing",
    preferences: {
      tone: "formal",
      language: "en",
      copilotEnabled: false,
      memoryEnabled: true,
      defaultCommandView: "list"
    },
    tags: ["publication", "polished", "professional", "final"],
    isPopular: true
  },

  "Blog Writing": {
    name: "Blog Writing",
    description: "Engaging and conversational content for web publishing",
    icon: "📝",
    category: "publishing",
    preferences: {
      tone: "friendly",
      language: "en",
      copilotEnabled: true,
      memoryEnabled: true,
      defaultCommandView: "grid"
    },
    tags: ["blog", "web", "engaging", "conversational"]
  },

  "Social Media": {
    name: "Social Media",
    description: "Concise and engaging content optimized for social platforms",
    icon: "📱",
    category: "publishing",
    preferences: {
      tone: "friendly",
      language: "en",
      copilotEnabled: true,
      memoryEnabled: false,
      defaultCommandView: "grid"
    },
    tags: ["social", "concise", "engaging", "platform"]
  },

  // Specialized Modes
  "Storytelling": {
    name: "Storytelling",
    description: "Narrative-focused mode with enhanced character and plot assistance",
    icon: "📖",
    category: "specialized",
    preferences: {
      tone: "friendly",
      language: "en",
      copilotEnabled: true,
      memoryEnabled: true,
      defaultCommandView: "grid"
    },
    tags: ["storytelling", "narrative", "character", "plot"]
  },

  "Poetry": {
    name: "Poetry",
    description: "Creative mode optimized for poetic expression and rhythm",
    icon: "🌸",
    category: "specialized",
    preferences: {
      tone: "friendly",
      language: "en",
      copilotEnabled: true,
      memoryEnabled: true,
      defaultCommandView: "grid"
    },
    tags: ["poetry", "creative", "rhythm", "expression"]
  },

  "Script Writing": {
    name: "Script Writing",
    description: "Dialogue-focused mode for screenplays and scripts",
    icon: "🎬",
    category: "specialized",
    preferences: {
      tone: "concise",
      language: "en",
      copilotEnabled: true,
      memoryEnabled: true,
      defaultCommandView: "list"
    },
    tags: ["script", "dialogue", "screenplay", "drama"]
  },

  "Journaling": {
    name: "Journaling",
    description: "Personal reflection mode with minimal AI interference",
    icon: "📔",
    category: "specialized",
    preferences: {
      tone: "friendly",
      language: "en",
      copilotEnabled: false,
      memoryEnabled: true,
      defaultCommandView: "list"
    },
    tags: ["journaling", "personal", "reflection", "private"]
  }
};

// Preset categories for organization
export const presetCategories = {
  writing: {
    name: "Writing",
    description: "Modes optimized for content creation",
    icon: "✍️"
  },
  editing: {
    name: "Editing",
    description: "Modes focused on revision and refinement",
    icon: "✏️"
  },
  publishing: {
    name: "Publishing",
    description: "Modes for final output and publication",
    icon: "📖"
  },
  specialized: {
    name: "Specialized",
    description: "Specialized modes for specific content types",
    icon: "🎯"
  }
};

// Popular presets for quick access
export const popularPresets = Object.values(writerPresets).filter(preset => preset.isPopular);

// Get presets by category
export function getPresetsByCategory(category: keyof typeof presetCategories): WriterPreset[] {
  return Object.values(writerPresets).filter(preset => preset.category === category);
}

// Search presets by tags or name
export function searchPresets(query: string): WriterPreset[] {
  const lowercaseQuery = query.toLowerCase();
  return Object.values(writerPresets).filter(preset => 
    preset.name.toLowerCase().includes(lowercaseQuery) ||
    preset.description.toLowerCase().includes(lowercaseQuery) ||
    preset.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

// Get preset by name
export function getPresetByName(name: string): WriterPreset | undefined {
  return writerPresets[name];
}

// Validate preset preferences against AgentPrefs
export function validatePresetPreferences(preferences: Partial<AgentPrefs>): boolean {
  const validTones = ['friendly', 'formal', 'concise'];
  const validLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'];
  const validCommandViews = ['list', 'grid'];

  if (preferences.tone && !validTones.includes(preferences.tone)) {
    return false;
  }

  if (preferences.language && !validLanguages.includes(preferences.language)) {
    return false;
  }

  if (preferences.defaultCommandView && !validCommandViews.includes(preferences.defaultCommandView)) {
    return false;
  }

  if (preferences.copilotEnabled !== undefined && typeof preferences.copilotEnabled !== 'boolean') {
    return false;
  }

  if (preferences.memoryEnabled !== undefined && typeof preferences.memoryEnabled !== 'boolean') {
    return false;
  }

  return true;
}

// Merge preset preferences with current preferences
export function mergePresetWithCurrent(
  presetPreferences: Partial<AgentPrefs>,
  currentPreferences: AgentPrefs
): AgentPrefs {
  return {
    ...currentPreferences,
    ...presetPreferences
  };
}

// Get preset recommendations based on current preferences
export function getPresetRecommendations(currentPreferences: AgentPrefs): WriterPreset[] {
  const recommendations: Array<{ preset: WriterPreset; score: number }> = [];

  Object.values(writerPresets).forEach(preset => {
    let score = 0;

    // Score based on tone similarity
    if (preset.preferences.tone === currentPreferences.tone) {
      score += 3;
    }

    // Score based on copilot preference
    if (preset.preferences.copilotEnabled === currentPreferences.copilotEnabled) {
      score += 2;
    }

    // Score based on memory preference
    if (preset.preferences.memoryEnabled === currentPreferences.memoryEnabled) {
      score += 2;
    }

    // Score based on command view preference
    if (preset.preferences.defaultCommandView === currentPreferences.defaultCommandView) {
      score += 1;
    }

    recommendations.push({ preset, score });
  });

  // Sort by score and return top 3
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(r => r.preset);
} 