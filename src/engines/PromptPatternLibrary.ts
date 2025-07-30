// MCP Context Block
/*
{
  file: "PromptPatternLibrary.ts",
  role: "ai-engineer",
  allowedActions: ["generate", "organize", "template"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "writing_assistant"
}
*/

// Core interfaces
export interface PromptPattern {
  arc: "setup" | "rising" | "failing" | "climax" | "resolution";
  pattern: string;
  tone?: "dramatic" | "lighthearted" | "ironic" | "reflective" | "dark";
  style?: string; // Optional style filter
  difficulty?: "easy" | "medium" | "hard";
  tags?: string[]; // For categorization
  source?: "builtin" | "user"; // Track pattern origin
}

export interface GenrePromptPatterns {
  genre: string;
  description?: string;
  commonThemes?: string[];
  patterns: PromptPattern[];
  confidenceFactors?: {
    setup: number;
    rising: number;
    failing: number;
    climax: number;
    resolution: number;
  };
}

export interface ToneFilter {
  tension: string[];
  melancholy: string[];
  joy: string[];
  fear: string[];
  neutral: string[];
}

export interface StyleFilter {
  minimalist: string[];
  dramatic: string[];
  lyrical: string[];
}

// Tone-specific pattern filters
const TONE_FILTERS: ToneFilter = {
  tension: [
    "heighten the stakes",
    "increase pressure",
    "build suspense",
    "create urgency",
    "raise the tension"
  ],
  melancholy: [
    "deepen the emotional weight",
    "explore loss",
    "show vulnerability",
    "reflect on the past",
    "find beauty in sadness"
  ],
  joy: [
    "amplify the positive energy",
    "celebrate the moment",
    "show genuine happiness",
    "spread contagious joy",
    "find triumph in small victories"
  ],
  fear: [
    "make this more terrifying",
    "heighten the horror",
    "create dread",
    "show primal fear",
    "build psychological terror"
  ],
  neutral: [
    "add more emotional depth",
    "find the hidden meaning",
    "explore subtle emotions",
    "show internal conflict",
    "reveal character complexity"
  ]
};

// Style-specific pattern filters
const STYLE_FILTERS: StyleFilter = {
  minimalist: [
    "show with fewer words",
    "focus on what's not said",
    "use silence effectively",
    "let subtext carry weight",
    "find the essential detail"
  ],
  dramatic: [
    "heighten every moment",
    "make this unforgettable",
    "create cinematic impact",
    "amplify the emotion",
    "build to a crescendo"
  ],
  lyrical: [
    "paint with beautiful words",
    "use metaphor to deepen meaning",
    "find the poetry in prose",
    "let language flow naturally",
    "create sensory richness"
  ]
};

// Comprehensive prompt pattern library
export const promptLibrary: GenrePromptPatterns[] = [
  {
    genre: "Romance",
    description: "Emotional narratives focused on love, relationships, and the journey of the heart",
    commonThemes: ["love", "trust", "vulnerability", "sacrifice", "growth", "healing"],
    patterns: [
      // Setup patterns
      {
        arc: "setup",
        pattern: "Describe the moment [CHARACTER] first notices something special.",
        tone: "lighthearted",
        style: "lyrical",
        difficulty: "easy",
        tags: ["romance", "setup", "noticing"],
        source: "builtin"
      },
      {
        arc: "setup",
        pattern: "Show [CHARACTER] meeting someone who challenges their assumptions.",
        tone: "dramatic",
        style: "dramatic",
        difficulty: "medium",
        tags: ["romance", "setup", "meeting"],
        source: "builtin"
      },
      {
        arc: "setup",
        pattern: "Establish the walls [CHARACTER] has built around their heart.",
        tone: "reflective",
        style: "minimalist",
        difficulty: "medium",
        tags: ["romance", "setup", "walls"],
        source: "builtin"
      },
      
      // Rising patterns
      {
        arc: "rising",
        pattern: "Introduce a misunderstanding that threatens the bond.",
        tone: "dramatic",
        style: "dramatic",
        difficulty: "medium",
        tags: ["romance", "rising", "misunderstanding"],
        source: "builtin"
      },
      {
        arc: "rising",
        pattern: "Show [CHARACTER] discovering they're falling in love.",
        tone: "lighthearted",
        style: "lyrical",
        difficulty: "medium",
        tags: ["romance", "rising", "falling"],
        source: "builtin"
      },
      {
        arc: "rising",
        pattern: "Reveal a vulnerability that brings them closer.",
        tone: "reflective",
        style: "minimalist",
        difficulty: "hard",
        tags: ["romance", "rising", "vulnerability"],
        source: "builtin"
      },
      
      // Failing patterns
      {
        arc: "failing",
        pattern: "Have [CHARACTER] push someone away out of fear.",
        tone: "dark",
        style: "dramatic",
        difficulty: "medium",
        tags: ["romance", "failing", "pushing-away"],
        source: "builtin"
      },
      {
        arc: "failing",
        pattern: "Reveal a secret that threatens their relationship.",
        tone: "dark",
        style: "minimalist",
        difficulty: "hard",
        tags: ["romance", "failing", "secret"],
        source: "builtin"
      },
      {
        arc: "failing",
        pattern: "Show external forces trying to keep them apart.",
        tone: "dramatic",
        style: "dramatic",
        difficulty: "medium",
        tags: ["romance", "failing", "external-forces"],
        source: "builtin"
      },
      
      // Climax patterns
      {
        arc: "climax",
        pattern: "Let [CHARACTER] take a vulnerable emotional risk.",
        tone: "dramatic",
        style: "dramatic",
        difficulty: "hard",
        tags: ["romance", "climax", "risk"],
        source: "builtin"
      },
      {
        arc: "climax",
        pattern: "Show the moment of truth about their feelings.",
        tone: "lighthearted",
        style: "lyrical",
        difficulty: "medium",
        tags: ["romance", "climax", "truth"],
        source: "builtin"
      },
      {
        arc: "climax",
        pattern: "Reveal what [CHARACTER] is willing to sacrifice for love.",
        tone: "reflective",
        style: "minimalist",
        difficulty: "hard",
        tags: ["romance", "climax", "sacrifice"],
        source: "builtin"
      },
      
      // Resolution patterns
      {
        arc: "resolution",
        pattern: "Show a gesture that redefines love for both characters.",
        tone: "lighthearted",
        style: "lyrical",
        difficulty: "medium",
        tags: ["romance", "resolution", "gesture"],
        source: "builtin"
      },
      {
        arc: "resolution",
        pattern: "Reveal how love has changed them for the better.",
        tone: "lighthearted",
        style: "dramatic",
        difficulty: "medium",
        tags: ["romance", "resolution", "growth"],
        source: "builtin"
      },
      {
        arc: "resolution",
        pattern: "Show them finding strength in partnership.",
        tone: "reflective",
        style: "minimalist",
        difficulty: "hard",
        tags: ["romance", "resolution", "partnership"],
        source: "builtin"
      }
    ],
    confidenceFactors: {
      setup: 0.85,
      rising: 0.9,
      failing: 0.85,
      climax: 0.95,
      resolution: 0.9
    }
  },
  
  {
    genre: "Science Fiction",
    description: "Futuristic narratives exploring technology, society, and the human condition",
    commonThemes: ["technology", "humanity", "progress", "ethics", "identity", "survival"],
    patterns: [
      // Setup patterns
      {
        arc: "setup",
        pattern: "Show a glimpse of the world's key technology or anomaly.",
        tone: "dramatic",
        style: "dramatic",
        difficulty: "easy",
        tags: ["scifi", "setup", "technology"],
        source: "builtin"
      },
      {
        arc: "setup",
        pattern: "Show [CHARACTER] encountering technology that changes everything.",
        tone: "dramatic",
        style: "dramatic",
        difficulty: "medium",
        tags: ["scifi", "setup", "encounter"],
        source: "builtin"
      },
      {
        arc: "setup",
        pattern: "Establish a world where the rules have changed.",
        tone: "reflective",
        style: "lyrical",
        difficulty: "medium",
        tags: ["scifi", "setup", "world"],
        source: "builtin"
      },
      
      // Rising patterns
      {
        arc: "rising",
        pattern: "Reveal a system flaw with unforeseen consequences.",
        tone: "dramatic",
        style: "dramatic",
        difficulty: "medium",
        tags: ["scifi", "rising", "flaw"],
        source: "builtin"
      },
      {
        arc: "rising",
        pattern: "Show [CHARACTER] adapting to a new reality.",
        tone: "dramatic",
        style: "dramatic",
        difficulty: "medium",
        tags: ["scifi", "rising", "adaptation"],
        source: "builtin"
      },
      {
        arc: "rising",
        pattern: "Show technology creating unforeseen consequences.",
        tone: "dark",
        style: "minimalist",
        difficulty: "medium",
        tags: ["scifi", "rising", "consequences"],
        source: "builtin"
      },
      
      // Failing patterns
      {
        arc: "failing",
        pattern: "Force [CHARACTER] to choose between safety and knowledge.",
        tone: "dark",
        style: "dramatic",
        difficulty: "medium",
        tags: ["scifi", "failing", "choice"],
        source: "builtin"
      },
      {
        arc: "failing",
        pattern: "Show [CHARACTER] losing control of the technology.",
        tone: "dark",
        style: "dramatic",
        difficulty: "medium",
        tags: ["scifi", "failing", "control"],
        source: "builtin"
      },
      {
        arc: "failing",
        pattern: "Reveal that progress has a moral price.",
        tone: "reflective",
        style: "lyrical",
        difficulty: "hard",
        tags: ["scifi", "failing", "moral-price"],
        source: "builtin"
      },
      
      // Climax patterns
      {
        arc: "climax",
        pattern: "Have [CHARACTER] confront the consequences of their discovery.",
        tone: "dramatic",
        style: "dramatic",
        difficulty: "hard",
        tags: ["scifi", "climax", "confrontation"],
        source: "builtin"
      },
      {
        arc: "climax",
        pattern: "Show the moment when everything changes forever.",
        tone: "dark",
        style: "minimalist",
        difficulty: "hard",
        tags: ["scifi", "climax", "change"],
        source: "builtin"
      },
      {
        arc: "climax",
        pattern: "Reveal what [CHARACTER] is willing to sacrifice for the future.",
        tone: "reflective",
        style: "lyrical",
        difficulty: "hard",
        tags: ["scifi", "climax", "sacrifice"],
        source: "builtin"
      },
      
      // Resolution patterns
      {
        arc: "resolution",
        pattern: "Depict a new equilibrium — changed or still evolving.",
        tone: "reflective",
        style: "lyrical",
        difficulty: "medium",
        tags: ["scifi", "resolution", "equilibrium"],
        source: "builtin"
      },
      {
        arc: "resolution",
        pattern: "Show [CHARACTER] finding balance between old and new.",
        tone: "reflective",
        style: "minimalist",
        difficulty: "medium",
        tags: ["scifi", "resolution", "balance"],
        source: "builtin"
      },
      {
        arc: "resolution",
        pattern: "Show the price and promise of progress.",
        tone: "reflective",
        style: "dramatic",
        difficulty: "medium",
        tags: ["scifi", "resolution", "progress"],
        source: "builtin"
      }
    ],
    confidenceFactors: {
      setup: 0.9,
      rising: 0.85,
      failing: 0.8,
      climax: 0.85,
      resolution: 0.8
    }
  },
  
  {
    genre: "Mystery",
    description: "Suspenseful narratives focused on solving puzzles, uncovering secrets, and revealing hidden truths",
    commonThemes: ["truth", "justice", "deception", "clues", "suspicion", "redemption"],
    patterns: [
      // Setup patterns
      {
        arc: "setup",
        pattern: "Drop a subtle detail that contradicts the surface narrative.",
        tone: "ironic",
        style: "minimalist",
        difficulty: "easy",
        tags: ["mystery", "setup", "detail"],
        source: "builtin"
      },
      {
        arc: "setup",
        pattern: "Show [CHARACTER] discovering something that doesn't fit.",
        tone: "dramatic",
        style: "dramatic",
        difficulty: "medium",
        tags: ["mystery", "setup", "discovery"],
        source: "builtin"
      },
      {
        arc: "setup",
        pattern: "Establish a world where appearances deceive.",
        tone: "reflective",
        style: "lyrical",
        difficulty: "hard",
        tags: ["mystery", "setup", "atmosphere"],
        source: "builtin"
      },
      
      // Rising patterns
      {
        arc: "rising",
        pattern: "Let [CHARACTER] find a clue that deepens suspicion.",
        tone: "dramatic",
        style: "dramatic",
        difficulty: "medium",
        tags: ["mystery", "rising", "clue"],
        source: "builtin"
      },
      {
        arc: "rising",
        pattern: "Reveal a clue that contradicts earlier evidence.",
        tone: "ironic",
        style: "dramatic",
        difficulty: "medium",
        tags: ["mystery", "rising", "contradiction"],
        source: "builtin"
      },
      {
        arc: "rising",
        pattern: "Show [CHARACTER] realizing they were wrong about [SECRET].",
        tone: "dark",
        style: "minimalist",
        difficulty: "hard",
        tags: ["mystery", "rising", "realization"],
        source: "builtin"
      },
      
      // Failing patterns
      {
        arc: "failing",
        pattern: "Have the trail go cold or lead to the wrong suspect.",
        tone: "reflective",
        style: "lyrical",
        difficulty: "medium",
        tags: ["mystery", "failing", "dead-end"],
        source: "builtin"
      },
      {
        arc: "failing",
        pattern: "Make [CHARACTER] doubt everything they thought they knew.",
        tone: "dark",
        style: "minimalist",
        difficulty: "hard",
        tags: ["mystery", "failing", "doubt"],
        source: "builtin"
      },
      {
        arc: "failing",
        pattern: "Reveal that [CHARACTER] has been manipulated.",
        tone: "dark",
        style: "dramatic",
        difficulty: "hard",
        tags: ["mystery", "failing", "manipulation"],
        source: "builtin"
      },
      
      // Climax patterns
      {
        arc: "climax",
        pattern: "Reveal a truth that challenges everything [CHARACTER] believed.",
        tone: "dark",
        style: "minimalist",
        difficulty: "hard",
        tags: ["mystery", "climax", "truth"],
        source: "builtin"
      },
      {
        arc: "climax",
        pattern: "Force [CHARACTER] to choose between truth and loyalty.",
        tone: "dramatic",
        style: "dramatic",
        difficulty: "hard",
        tags: ["mystery", "climax", "choice"],
        source: "builtin"
      },
      {
        arc: "climax",
        pattern: "Show [CHARACTER] facing their greatest fear.",
        tone: "dramatic",
        style: "dramatic",
        difficulty: "medium",
        tags: ["mystery", "climax", "confrontation"],
        source: "builtin"
      },
      
      // Resolution patterns
      {
        arc: "resolution",
        pattern: "Resolve the case with a consequence — not just an answer.",
        tone: "reflective",
        style: "dramatic",
        difficulty: "medium",
        tags: ["mystery", "resolution", "consequence"],
        source: "builtin"
      },
      {
        arc: "resolution",
        pattern: "Show [CHARACTER] finding peace with the truth.",
        tone: "reflective",
        style: "lyrical",
        difficulty: "medium",
        tags: ["mystery", "resolution", "peace"],
        source: "builtin"
      },
      {
        arc: "resolution",
        pattern: "Reveal the cost of uncovering the truth.",
        tone: "reflective",
        style: "minimalist",
        difficulty: "hard",
        tags: ["mystery", "resolution", "cost"],
        source: "builtin"
      }
    ],
    confidenceFactors: {
      setup: 0.9,
      rising: 0.95,
      failing: 0.85,
      climax: 0.9,
      resolution: 0.8
    }
  }
];

// Runtime pattern storage for user-defined patterns
let userPatterns: GenrePromptPatterns[] = [];

// Utility functions for pattern filtering and retrieval
export function getPatternsByGenre(genre: string): PromptPattern[] {
  const genrePatterns = promptLibrary.find(g => g.genre.toLowerCase() === genre.toLowerCase());
  const userGenrePatterns = userPatterns.find(g => g.genre.toLowerCase() === genre.toLowerCase());
  
  const builtinPatterns = genrePatterns?.patterns || [];
  const customPatterns = userGenrePatterns?.patterns || [];
  
  return [...builtinPatterns, ...customPatterns];
}

export function getPatternsByArc(genre: string, arc: PromptPattern['arc']): PromptPattern[] {
  const patterns = getPatternsByGenre(genre);
  return patterns.filter(p => p.arc === arc);
}

export function getPatternsByTone(genre: string, tone: string): PromptPattern[] {
  const patterns = getPatternsByGenre(genre);
  return patterns.filter(p => !p.tone || p.tone === tone);
}

export function getPatternsByStyle(genre: string, style: string): PromptPattern[] {
  const patterns = getPatternsByGenre(genre);
  return patterns.filter(p => !p.style || p.style === style);
}

export function getPatternsByDifficulty(genre: string, difficulty: PromptPattern['difficulty']): PromptPattern[] {
  const patterns = getPatternsByGenre(genre);
  return patterns.filter(p => !p.difficulty || p.difficulty === difficulty);
}

export function getPatternsByTags(genre: string, tags: string[]): PromptPattern[] {
  const patterns = getPatternsByGenre(genre);
  return patterns.filter(p => p.tags && tags.some(tag => p.tags!.includes(tag)));
}

// Main runtime filter utility
export function getPromptPatterns(
  genre: string,
  arc?: string,
  tone?: string
): PromptPattern[] {
  let patterns = getPatternsByGenre(genre);
  
  // Filter by arc if specified
  if (arc) {
    patterns = patterns.filter(p => p.arc === arc);
  }
  
  // Filter by tone if specified
  if (tone) {
    const tonePatterns = patterns.filter(p => p.tone === tone);
    // If no tone-specific patterns found, fall back to tone-agnostic patterns
    if (tonePatterns.length > 0) {
      patterns = tonePatterns;
    } else {
      patterns = patterns.filter(p => !p.tone); // Return tone-agnostic patterns
    }
  }
  
  // Sort by source (builtin first, then user patterns)
  patterns.sort((a, b) => {
    if (a.source === "builtin" && b.source === "user") return -1;
    if (a.source === "user" && b.source === "builtin") return 1;
    return 0;
  });
  
  return patterns;
}

// User pattern registration API
export function registerUserPromptPatterns(patterns: GenrePromptPatterns[]): void {
  patterns.forEach(userGenre => {
    // Add source tag to all user patterns
    userGenre.patterns.forEach(pattern => {
      pattern.source = "user";
    });
    
    // Check for existing user patterns for this genre
    const existingUserGenre = userPatterns.find(g => g.genre.toLowerCase() === userGenre.genre.toLowerCase());
    
    if (existingUserGenre) {
      // Merge patterns, avoiding duplicates
      const existingPatterns = existingUserGenre.patterns;
      const newPatterns = userGenre.patterns.filter(newPattern => 
        !existingPatterns.some(existingPattern => 
          existingPattern.arc === newPattern.arc && 
          existingPattern.pattern === newPattern.pattern
        )
      );
      
      existingUserGenre.patterns = [...existingPatterns, ...newPatterns];
    } else {
      // Add new genre
      userPatterns.push(userGenre);
    }
  });
}

// Clear user patterns (for testing or reset)
export function clearUserPromptPatterns(): void {
  userPatterns = [];
}

// Get all patterns (builtin + user) for admin/dev tools
export function listAllPatterns(): { builtin: GenrePromptPatterns[], user: GenrePromptPatterns[] } {
  return {
    builtin: promptLibrary,
    user: userPatterns
  };
}

export function getAvailableGenres(): string[] {
  const builtinGenres = promptLibrary.map(g => g.genre);
  const userGenres = userPatterns.map(g => g.genre);
  return [...new Set([...builtinGenres, ...userGenres])];
}

export function getAvailableArcs(): PromptPattern['arc'][] {
  return ["setup", "rising", "failing", "climax", "resolution"];
}

export function getAvailableTones(): string[] {
  return ["dramatic", "lighthearted", "ironic", "reflective", "dark"];
}

export function getAvailableStyles(): string[] {
  return Object.keys(STYLE_FILTERS);
}

export function getAvailableDifficulties(): PromptPattern['difficulty'][] {
  return ["easy", "medium", "hard"];
}

// Pattern replacement function for placeholders
export function replacePatternPlaceholders(pattern: string, context: {
  character?: string;
  secret?: string;
  motive?: string;
  location?: string;
  emotion?: string;
}): string {
  let result = pattern;
  
  if (context.character) {
    result = result.replace(/\[CHARACTER\]/g, context.character);
  }
  if (context.secret) {
    result = result.replace(/\[SECRET\]/g, context.secret);
  }
  if (context.motive) {
    result = result.replace(/\[MOTIVE\]/g, context.motive);
  }
  if (context.location) {
    result = result.replace(/\[LOCATION\]/g, context.location);
  }
  if (context.emotion) {
    result = result.replace(/\[EMOTION\]/g, context.emotion);
  }
  
  return result;
}

// Get tone-specific suggestions
export function getToneSuggestions(tone: string): string[] {
  return TONE_FILTERS[tone as keyof ToneFilter] || [];
}

// Get style-specific suggestions
export function getStyleSuggestions(style: string): string[] {
  return STYLE_FILTERS[style as keyof StyleFilter] || [];
}

// Validate pattern input
export function validatePatternInput(input: {
  genre: string;
  arc?: PromptPattern['arc'];
  tone?: string;
  style?: string;
  difficulty?: PromptPattern['difficulty'];
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.genre) errors.push("Genre is required");
  
  const availableGenres = getAvailableGenres();
  if (input.genre && !availableGenres.includes(input.genre)) {
    errors.push(`Genre must be one of: ${availableGenres.join(', ')}`);
  }

  if (input.arc) {
    const availableArcs = getAvailableArcs();
    if (!availableArcs.includes(input.arc)) {
      errors.push(`Arc must be one of: ${availableArcs.join(', ')}`);
    }
  }

  if (input.tone) {
    const availableTones = getAvailableTones();
    if (!availableTones.includes(input.tone)) {
      errors.push(`Tone must be one of: ${availableTones.join(', ')}`);
    }
  }

  if (input.style) {
    const availableStyles = getAvailableStyles();
    if (!availableStyles.includes(input.style)) {
      errors.push(`Style must be one of: ${availableStyles.join(', ')}`);
    }
  }

  if (input.difficulty) {
    const availableDifficulties = getAvailableDifficulties();
    if (!availableDifficulties.includes(input.difficulty)) {
      errors.push(`Difficulty must be one of: ${availableDifficulties.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
} 