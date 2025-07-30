// MCP Context Block
/*
{
  file: "ContextualPromptEngine.ts",
  role: "ai-engineer",
  allowedActions: ["generate", "analyze", "suggest"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "writing_assistant"
}
*/



// Core interfaces
export interface ContextualPrompt {
  genre: string;
  writingStyle: string;
  currentScene: string;
  characterArc: string;
  suggestedPrompts: string[];
  confidence: number;
  narrativeIntent: NarrativeIntent;
  toneLevel: ToneLevel;
  detectedCharacters: string[];
  locationAnchors: string[];
}

export interface NarrativeIntent {
  type: 'setup' | 'conflict' | 'resolution' | 'transition' | 'climax';
  intensity: number; // 0-1
  description: string;
}

export interface ToneLevel {
  primary: string; // 'tension', 'melancholy', 'joy', 'fear', 'neutral'
  intensity: number; // 0-1
  secondary?: string;
}

export interface GenreTemplate {
  genre: string;
  commonPrompts: string[];
  conflictPatterns: string[];
  characterArcs: string[];
  styleModifiers: Record<string, string[]>;
  confidenceFactors: {
    setup: number;
    conflict: number;
    resolution: number;
    transition: number;
    climax: number;
  };
}

export interface WritingStyleModifier {
  style: string;
  promptTemplates: string[];
  toneAdjustments: Record<string, number>;
  pacingModifiers: string[];
}

// Genre templates for different writing styles
const GENRE_TEMPLATES: Record<string, GenreTemplate> = {
  mystery: {
    genre: 'Mystery',
    commonPrompts: [
      "Reveal a clue that deepens the protagonist's doubt.",
      "Introduce a red herring to increase suspense.",
      "Show the detective's deductive reasoning process.",
      "Create an unexpected revelation that changes everything.",
      "Build tension through environmental details."
    ],
    conflictPatterns: [
      "The truth is more complex than it appears.",
      "Someone is lying, but who?",
      "The clock is ticking on solving this case.",
      "Personal stakes are revealed.",
      "A new suspect emerges."
    ],
    characterArcs: [
      "The detective's confidence is shaken.",
      "The protagonist discovers they were wrong.",
      "A character's past comes back to haunt them.",
      "The hero must face their own darkness.",
      "Trust becomes the ultimate test."
    ],
    styleModifiers: {
      minimalist: [
        "Keep dialogue sparse but revealing.",
        "Use silence to build tension.",
        "Focus on what's not said."
      ],
      dramatic: [
        "Heighten every emotional moment.",
        "Use vivid imagery for impact.",
        "Make every revelation count."
      ],
      lyrical: [
        "Paint the scene with sensory details.",
        "Use metaphor to deepen meaning.",
        "Let the atmosphere speak."
      ]
    },
    confidenceFactors: {
      setup: 0.9,
      conflict: 0.95,
      resolution: 0.85,
      transition: 0.7,
      climax: 0.8
    }
  },
  romance: {
    genre: 'Romance',
    commonPrompts: [
      "Show the characters' growing attraction through small moments.",
      "Create a misunderstanding that tests their connection.",
      "Reveal a vulnerability that brings them closer.",
      "Build tension through near-misses and almost-kisses.",
      "Show how they complement each other's strengths and weaknesses."
    ],
    conflictPatterns: [
      "External forces threaten their happiness.",
      "Internal fears prevent true intimacy.",
      "Past relationships cast long shadows.",
      "Miscommunication creates unnecessary drama.",
      "Timing seems to work against them."
    ],
    characterArcs: [
      "Learning to trust again after heartbreak.",
      "Overcoming fear of vulnerability.",
      "Finding strength in partnership.",
      "Letting go of past expectations.",
      "Embracing love despite risks."
    ],
    styleModifiers: {
      minimalist: [
        "Focus on meaningful glances and touches.",
        "Let subtext carry emotional weight.",
        "Use restraint to heighten desire."
      ],
      dramatic: [
        "Amplify every emotional beat.",
        "Use grand gestures and declarations.",
        "Make every moment cinematic."
      ],
      lyrical: [
        "Paint love with beautiful imagery.",
        "Use metaphor to express deep feelings.",
        "Let the heart speak through poetry."
      ]
    },
    confidenceFactors: {
      setup: 0.85,
      conflict: 0.9,
      resolution: 0.95,
      transition: 0.8,
      climax: 0.9
    }
  },
  scifi: {
    genre: 'Science Fiction',
    commonPrompts: [
      "Explore the implications of this technology on society.",
      "Show how the protagonist adapts to this new reality.",
      "Reveal the hidden cost of progress.",
      "Question what it means to be human.",
      "Examine the relationship between power and responsibility."
    ],
    conflictPatterns: [
      "Technology creates unforeseen consequences.",
      "Humanity faces an existential threat.",
      "Progress comes at a moral cost.",
      "The future is not what anyone expected.",
      "Power corrupts even the well-intentioned."
    ],
    characterArcs: [
      "Coming to terms with a changed world.",
      "Learning to use power responsibly.",
      "Finding humanity in an artificial world.",
      "Questioning everything they believed.",
      "Becoming something more than human."
    ],
    styleModifiers: {
      minimalist: [
        "Focus on the human element within the tech.",
        "Use precise language for complex concepts.",
        "Let the implications speak for themselves."
      ],
      dramatic: [
        "Make every discovery feel monumental.",
        "Use vivid imagery for alien worlds.",
        "Heighten the stakes of every choice."
      ],
      lyrical: [
        "Paint the future with beautiful prose.",
        "Use metaphor to explain the unexplainable.",
        "Let wonder and awe guide the narrative."
      ]
    },
    confidenceFactors: {
      setup: 0.9,
      conflict: 0.85,
      resolution: 0.8,
      transition: 0.7,
      climax: 0.8
    }
  },
  fantasy: {
    genre: 'Fantasy',
    commonPrompts: [
      "Show how magic affects the character's daily life.",
      "Reveal the hidden cost of using power.",
      "Explore the relationship between magic and morality.",
      "Show the protagonist learning to control their abilities.",
      "Examine how power changes relationships."
    ],
    conflictPatterns: [
      "Magic has unintended consequences.",
      "Power corrupts even the pure of heart.",
      "The old ways conflict with new understanding.",
      "Destiny and free will are at odds.",
      "The price of magic is too high."
    ],
    characterArcs: [
      "Learning to master their abilities.",
      "Coming to terms with their destiny.",
      "Finding balance between power and responsibility.",
      "Overcoming the darkness within.",
      "Becoming worthy of their gifts."
    ],
    styleModifiers: {
      minimalist: [
        "Focus on the human story within the magic.",
        "Use restraint to make magic feel special.",
        "Let the ordinary highlight the extraordinary."
      ],
      dramatic: [
        "Make every magical moment feel epic.",
        "Use vivid imagery for fantastical elements.",
        "Heighten the stakes of every magical choice."
      ],
      lyrical: [
        "Paint magic with beautiful prose.",
        "Use metaphor to explain the unexplainable.",
        "Let wonder and awe guide the narrative."
      ]
    },
    confidenceFactors: {
      setup: 0.85,
      conflict: 0.9,
      resolution: 0.85,
      transition: 0.7,
      climax: 0.8
    }
  }
};

// Writing style modifiers
const STYLE_MODIFIERS: Record<string, WritingStyleModifier> = {
  minimalist: {
    style: 'minimalist',
    promptTemplates: [
      "What's not being said here?",
      "How can you show this with fewer words?",
      "What detail would change everything?",
      "What's the most important thing happening?",
      "How can silence speak volumes?"
    ],
    toneAdjustments: {
      tension: 0.8,
      melancholy: 0.6,
      joy: 0.4,
      fear: 0.7,
      neutral: 0.9
    },
    pacingModifiers: [
      "Slow down the moment.",
      "Focus on one detail at a time.",
      "Let the reader fill in the gaps."
    ]
  },
  dramatic: {
    style: 'dramatic',
    promptTemplates: [
      "How can you heighten the emotional stakes?",
      "What would make this moment unforgettable?",
      "How can you make the reader feel this viscerally?",
      "What's the most dramatic way to reveal this?",
      "How can you amplify the conflict?"
    ],
    toneAdjustments: {
      tension: 0.9,
      melancholy: 0.8,
      joy: 0.7,
      fear: 0.9,
      neutral: 0.3
    },
    pacingModifiers: [
      "Speed up the action.",
      "Make every moment count.",
      "Build to a crescendo."
    ]
  },
  lyrical: {
    style: 'lyrical',
    promptTemplates: [
      "How can you paint this scene with words?",
      "What metaphor would capture this feeling?",
      "How can you make the reader see this differently?",
      "What imagery would deepen the meaning?",
      "How can you make the ordinary beautiful?"
    ],
    toneAdjustments: {
      tension: 0.6,
      melancholy: 0.8,
      joy: 0.7,
      fear: 0.5,
      neutral: 0.7
    },
    pacingModifiers: [
      "Savor the moment.",
      "Let the language flow.",
      "Find the rhythm in the words."
    ]
  }
};

// Character arc patterns
const CHARACTER_ARC_PATTERNS = {
  rising: [
    "The character gains confidence or power.",
    "They overcome a major obstacle.",
    "They discover a hidden strength.",
    "They achieve a significant goal.",
    "They find their true purpose."
  ],
  failing: [
    "The character's plans fall apart.",
    "They make a costly mistake.",
    "They lose something important.",
    "Their confidence is shaken.",
    "They face their greatest fear."
  ],
  rebounding: [
    "The character finds new strength after failure.",
    "They adapt to changed circumstances.",
    "They discover an unexpected solution.",
    "They learn from their mistakes.",
    "They find hope in darkness."
  ],
  static: [
    "The character maintains their position.",
    "They resist change or growth.",
    "They stay true to their principles.",
    "They provide stability for others.",
    "They serve as an anchor in chaos."
  ]
};

// Narrative intent detection
function detectNarrativeIntent(sceneText: string): NarrativeIntent {
  const words = sceneText.toLowerCase().split(/\W+/);
  const setupKeywords = ['begin', 'start', 'arrive', 'meet', 'introduce', 'discover'];
  const conflictKeywords = ['fight', 'argue', 'confront', 'challenge', 'threaten', 'attack'];
  const resolutionKeywords = ['solve', 'resolve', 'end', 'conclude', 'finish', 'overcome'];
  const climaxKeywords = ['peak', 'climax', 'moment', 'critical', 'decisive', 'final'];
  const transitionKeywords = ['meanwhile', 'later', 'then', 'after', 'before', 'next'];

  let setupCount = 0, conflictCount = 0, resolutionCount = 0, climaxCount = 0, transitionCount = 0;

  words.forEach(word => {
    if (setupKeywords.includes(word)) setupCount++;
    if (conflictKeywords.includes(word)) conflictCount++;
    if (resolutionKeywords.includes(word)) resolutionCount++;
    if (climaxKeywords.includes(word)) climaxCount++;
    if (transitionKeywords.includes(word)) transitionCount++;
  });

  const counts = { setup: setupCount, conflict: conflictCount, resolution: resolutionCount, climax: climaxCount, transition: transitionCount };
  const maxCount = Math.max(...Object.values(counts));
  const totalWords = words.length;

  let type: NarrativeIntent['type'] = 'setup';
  if (maxCount === conflictCount) type = 'conflict';
  else if (maxCount === resolutionCount) type = 'resolution';
  else if (maxCount === climaxCount) type = 'climax';
  else if (maxCount === transitionCount) type = 'transition';

  const intensity = totalWords > 0 ? maxCount / totalWords : 0.5;

  const descriptions = {
    setup: "Establishing the scene and characters",
    conflict: "Building tension and obstacles",
    resolution: "Resolving conflicts and finding solutions",
    climax: "Reaching the peak moment of tension",
    transition: "Moving between scenes or time periods"
  };

  return {
    type,
    intensity: Math.min(1, intensity * 2), // Scale up for better sensitivity
    description: descriptions[type]
  };
}

// Tone level detection
function detectToneLevel(sceneText: string): ToneLevel {
  const emotionKeywords = {
    tension: ['tense', 'nervous', 'anxious', 'worried', 'fearful', 'suspense'],
    melancholy: ['sad', 'depressed', 'lonely', 'melancholy', 'grief', 'sorrow'],
    joy: ['happy', 'excited', 'joyful', 'elated', 'thrilled', 'delighted'],
    fear: ['afraid', 'terrified', 'scared', 'horrified', 'panicked', 'dread'],
    neutral: ['calm', 'peaceful', 'quiet', 'serene', 'balanced', 'steady']
  };

  const words = sceneText.toLowerCase().split(/\W+/);
  const emotionCounts: Record<string, number> = {};

  Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
    emotionCounts[emotion] = words.filter(word => keywords.includes(word)).length;
  });

  const maxEmotion = Object.entries(emotionCounts).reduce((a, b) => 
    emotionCounts[a[0]] > emotionCounts[b[0]] ? a : b
  );

  const totalWords = words.length;
  const intensity = totalWords > 0 ? maxEmotion[1] / totalWords : 0.3;

  // Find secondary emotion
  const sortedEmotions = Object.entries(emotionCounts)
    .sort(([,a], [,b]) => b - a)
    .filter(([emotion]) => emotion !== maxEmotion[0]);

  const secondary = sortedEmotions.length > 0 && sortedEmotions[0][1] > 0 
    ? sortedEmotions[0][0] 
    : undefined;

  return {
    primary: maxEmotion[0],
    intensity: Math.min(1, intensity * 3), // Scale up for better sensitivity
    secondary
  };
}

// Character and location detection
function extractCharactersAndLocations(sceneText: string): { characters: string[], locations: string[] } {
  // Simple heuristic detection - in production, this would use NLP
  const words = sceneText.split(/\W+/);
  const characters: string[] = [];
  const locations: string[] = [];

  // Look for capitalized words that might be names
  words.forEach((word, index) => {
    if (word.length > 2 && word[0] === word[0].toUpperCase()) {
      // Check if it's followed by common name indicators
      const nextWord = words[index + 1];
      if (nextWord && ['said', 'thought', 'walked', 'looked', 'felt'].includes(nextWord.toLowerCase())) {
        characters.push(word);
      }
    }
  });

  // Look for location indicators
  const locationKeywords = ['room', 'house', 'street', 'building', 'forest', 'city', 'town', 'park', 'office', 'school'];
  words.forEach((word, index) => {
    if (locationKeywords.includes(word.toLowerCase())) {
      const prevWord = words[index - 1];
      if (prevWord && prevWord[0] === prevWord[0].toUpperCase()) {
        locations.push(`${prevWord} ${word}`);
      }
    }
  });

  return {
    characters: [...new Set(characters)], // Remove duplicates
    locations: [...new Set(locations)]
  };
}

// Confidence calculation
function calculateConfidence(
  genre: string,
  narrativeIntent: NarrativeIntent,
  toneLevel: ToneLevel,
  styleMatch: boolean
): number {
  const template = GENRE_TEMPLATES[genre.toLowerCase()];
  if (!template) return 0.5;

  // Base confidence from genre template
  let confidence = template.confidenceFactors[narrativeIntent.type] || 0.7;

  // Adjust for tone consistency
  const toneConsistency = toneLevel.intensity > 0.3 ? 0.1 : -0.1;
  confidence += toneConsistency;

  // Adjust for style match
  if (styleMatch) confidence += 0.1;
  else confidence -= 0.1;

  // Adjust for narrative intent clarity
  if (narrativeIntent.intensity > 0.5) confidence += 0.1;
  else confidence -= 0.1;

  return Math.max(0, Math.min(1, confidence));
}

// Main function
export function generateContextualPrompts(input: {
  genre: string;
  writingStyle: string;
  currentScene: string;
  characterArc: string;
}): ContextualPrompt {
  const { genre, writingStyle, currentScene, characterArc } = input;

  // Analyze the current scene
  const narrativeIntent = detectNarrativeIntent(currentScene);
  const toneLevel = detectToneLevel(currentScene);
  const { characters, locations } = extractCharactersAndLocations(currentScene);

  // Get genre template
  const template = GENRE_TEMPLATES[genre.toLowerCase()];
  const styleModifier = STYLE_MODIFIERS[writingStyle.toLowerCase()];

  // Generate prompts based on analysis
  const suggestedPrompts: string[] = [];

  // Add genre-specific prompts
  if (template) {
    // Add common genre prompts
    suggestedPrompts.push(...template.commonPrompts.slice(0, 2));

    // Add conflict patterns if in conflict phase
    if (narrativeIntent.type === 'conflict') {
      suggestedPrompts.push(...template.conflictPatterns.slice(0, 1));
    }

    // Add character arc prompts
    const arcPatterns = CHARACTER_ARC_PATTERNS[characterArc as keyof typeof CHARACTER_ARC_PATTERNS] || [];
    suggestedPrompts.push(...arcPatterns.slice(0, 1));
  }

  // Add style-specific prompts
  if (styleModifier) {
    suggestedPrompts.push(...styleModifier.promptTemplates.slice(0, 2));
  }

  // Add tone-specific prompts
  if (toneLevel.intensity > 0.5) {
    const tonePrompts = {
      tension: "How can you heighten the suspense?",
      melancholy: "What would deepen the emotional weight?",
      joy: "How can you amplify the positive energy?",
      fear: "What would make this more terrifying?",
      neutral: "How can you add more emotional depth?"
    };
    suggestedPrompts.push(tonePrompts[toneLevel.primary as keyof typeof tonePrompts] || "What would make this scene more compelling?");
  }

  // Ensure we have at least 3 prompts
  while (suggestedPrompts.length < 3) {
    suggestedPrompts.push("What would naturally happen next in this scene?");
  }

  // Limit to 5 prompts maximum
  const finalPrompts = suggestedPrompts.slice(0, 5);

  // Calculate confidence
  const confidence = calculateConfidence(
    genre,
    narrativeIntent,
    toneLevel,
    !!styleModifier
  );

  return {
    genre,
    writingStyle,
    currentScene,
    characterArc,
    suggestedPrompts: finalPrompts,
    confidence,
    narrativeIntent,
    toneLevel,
    detectedCharacters: characters,
    locationAnchors: locations
  };
}

// Utility function to get available genres
export function getAvailableGenres(): string[] {
  return Object.keys(GENRE_TEMPLATES);
}

// Utility function to get available writing styles
export function getAvailableWritingStyles(): string[] {
  return Object.keys(STYLE_MODIFIERS);
}

// Utility function to validate input
export function validatePromptInput(input: {
  genre: string;
  writingStyle: string;
  currentScene: string;
  characterArc: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.genre) errors.push("Genre is required");
  if (!input.writingStyle) errors.push("Writing style is required");
  if (!input.currentScene || input.currentScene.trim().length < 10) {
    errors.push("Current scene must be at least 10 characters long");
  }
  if (!input.characterArc) errors.push("Character arc is required");

  const availableGenres = getAvailableGenres();
  if (input.genre && !availableGenres.includes(input.genre.toLowerCase())) {
    errors.push(`Genre must be one of: ${availableGenres.join(', ')}`);
  }

  const availableStyles = getAvailableWritingStyles();
  if (input.writingStyle && !availableStyles.includes(input.writingStyle.toLowerCase())) {
    errors.push(`Writing style must be one of: ${availableStyles.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
} 