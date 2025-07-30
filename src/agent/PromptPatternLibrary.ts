// MCP Context Block
/*
{
  file: "PromptPatternLibrary.ts",
  role: "pattern-library",
  allowedActions: ["provide", "match", "fallback"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "creativity"
}
*/

// Pattern structure
interface PatternEntry {
  genre: string;
  arc: string;
  pattern: string;
  description?: string;
}

// Prompt configuration interface
interface PromptConfig {
  tone?: string;
  memory?: boolean;
  copilot?: boolean;
  language?: string;
}

// Pattern library data
const PATTERN_LIBRARY: PatternEntry[] = [
  // Romance patterns
  {
    genre: "Romance",
    arc: "setup",
    pattern: "Introduce [CHARACTER] and create a moment of unexpected connection",
    description: "Establish romantic tension and character introduction"
  },
  {
    genre: "Romance",
    arc: "rising",
    pattern: "Create a conflict that forces [CHARACTER] to question their feelings",
    description: "Build romantic tension through obstacles"
  },
  {
    genre: "Romance",
    arc: "climax",
    pattern: "Reveal a secret that [CHARACTER] must hide from [OTHER]",
    description: "High emotional stakes and revelation"
  },
  {
    genre: "Romance",
    arc: "resolution",
    pattern: "Show [CHARACTER] making a choice that defines their relationship",
    description: "Resolution and commitment"
  },

  // Sci-Fi patterns
  {
    genre: "Sci-Fi",
    arc: "setup",
    pattern: "Introduce a technological element that changes [CHARACTER]'s world",
    description: "Establish futuristic setting and technology"
  },
  {
    genre: "Sci-Fi",
    arc: "rising",
    pattern: "Create a discovery that challenges [CHARACTER]'s understanding of reality",
    description: "Build tension through scientific revelation"
  },
  {
    genre: "Sci-Fi",
    arc: "climax",
    pattern: "Force [CHARACTER] to make a choice between technology and humanity",
    description: "High stakes technological dilemma"
  },
  {
    genre: "Sci-Fi",
    arc: "resolution",
    pattern: "Show [CHARACTER] integrating technology with human values",
    description: "Synthesis of technology and humanity"
  },

  // Mystery patterns
  {
    genre: "Mystery",
    arc: "setup",
    pattern: "Present [CHARACTER] with an unexplained event that demands investigation",
    description: "Establish mystery and investigative elements"
  },
  {
    genre: "Mystery",
    arc: "rising",
    pattern: "Reveal a clue that [CHARACTER] must interpret while danger grows",
    description: "Build tension through investigation"
  },
  {
    genre: "Mystery",
    arc: "climax",
    pattern: "Confront [CHARACTER] with the truth they've been seeking",
    description: "Revelation and confrontation"
  },
  {
    genre: "Mystery",
    arc: "resolution",
    pattern: "Show [CHARACTER] dealing with the consequences of their discovery",
    description: "Resolution and aftermath"
  },

  // Fantasy patterns
  {
    genre: "Fantasy",
    arc: "setup",
    pattern: "Introduce [CHARACTER] to a magical element that changes their destiny",
    description: "Establish magical world and character's role"
  },
  {
    genre: "Fantasy",
    arc: "rising",
    pattern: "Create a magical challenge that tests [CHARACTER]'s abilities",
    description: "Build tension through magical obstacles"
  },
  {
    genre: "Fantasy",
    arc: "climax",
    pattern: "Force [CHARACTER] to use their magic in an unexpected way",
    description: "Magical revelation and power"
  },
  {
    genre: "Fantasy",
    arc: "resolution",
    pattern: "Show [CHARACTER] mastering their magical abilities",
    description: "Mastery and resolution"
  },

  // Thriller patterns
  {
    genre: "Thriller",
    arc: "setup",
    pattern: "Place [CHARACTER] in a situation where their safety is compromised",
    description: "Establish danger and stakes"
  },
  {
    genre: "Thriller",
    arc: "rising",
    pattern: "Create a trap that [CHARACTER] must escape while time runs out",
    description: "Build tension through danger"
  },
  {
    genre: "Thriller",
    arc: "climax",
    pattern: "Force [CHARACTER] to face their greatest fear to survive",
    description: "Ultimate confrontation and survival"
  },
  {
    genre: "Thriller",
    arc: "resolution",
    pattern: "Show [CHARACTER] dealing with the psychological aftermath",
    description: "Recovery and consequences"
  },

  // Horror patterns
  {
    genre: "Horror",
    arc: "setup",
    pattern: "Introduce [CHARACTER] to something that defies their understanding",
    description: "Establish supernatural or horrific elements"
  },
  {
    genre: "Horror",
    arc: "rising",
    pattern: "Create a situation where [CHARACTER]'s reality is questioned",
    description: "Build tension through psychological horror"
  },
  {
    genre: "Horror",
    arc: "climax",
    pattern: "Confront [CHARACTER] with the source of their terror",
    description: "Direct confrontation with horror"
  },
  {
    genre: "Horror",
    arc: "resolution",
    pattern: "Show [CHARACTER] changed by their encounter with horror",
    description: "Transformation and aftermath"
  },

  // Comedy patterns
  {
    genre: "Comedy",
    arc: "setup",
    pattern: "Place [CHARACTER] in an awkward situation they must navigate",
    description: "Establish comedic premise and character"
  },
  {
    genre: "Comedy",
    arc: "rising",
    pattern: "Create a misunderstanding that [CHARACTER] must resolve",
    description: "Build humor through escalating confusion"
  },
  {
    genre: "Comedy",
    arc: "climax",
    pattern: "Force [CHARACTER] to make a choice that reveals the truth",
    description: "Comedic revelation and resolution"
  },
  {
    genre: "Comedy",
    arc: "resolution",
    pattern: "Show [CHARACTER] learning from their comedic misadventure",
    description: "Growth and humor"
  },

  // Historical patterns
  {
    genre: "Historical",
    arc: "setup",
    pattern: "Introduce [CHARACTER] to a historical event that will change their life",
    description: "Establish historical setting and stakes"
  },
  {
    genre: "Historical",
    arc: "rising",
    pattern: "Create a conflict that reflects the historical period's tensions",
    description: "Build tension through historical context"
  },
  {
    genre: "Historical",
    arc: "climax",
    pattern: "Force [CHARACTER] to make a choice that impacts history",
    description: "Historical significance and choice"
  },
  {
    genre: "Historical",
    arc: "resolution",
    pattern: "Show [CHARACTER] dealing with the consequences of their historical role",
    description: "Historical impact and legacy"
  },

  // DEFAULT patterns (fallbacks)
  {
    genre: "DEFAULT",
    arc: "setup",
    pattern: "Introduce [CHARACTER] and establish the central conflict",
    description: "Generic setup pattern"
  },
  {
    genre: "DEFAULT",
    arc: "rising",
    pattern: "Create a challenge that [CHARACTER] must overcome",
    description: "Generic rising action pattern"
  },
  {
    genre: "DEFAULT",
    arc: "climax",
    pattern: "Force [CHARACTER] to make a difficult choice",
    description: "Generic climax pattern"
  },
  {
    genre: "DEFAULT",
    arc: "resolution",
    pattern: "Show [CHARACTER] dealing with the consequences of their choice",
    description: "Generic resolution pattern"
  }
];

// Pattern lookup cache
const patternCache = new Map<string, string>();

/**
 * Checks if a pattern exists for the given genre and arc
 */
export function hasPatternFor(genre: string, arc: string): boolean {
  const entry = PATTERN_LIBRARY.find(
    p => p.genre.toLowerCase() === genre.toLowerCase() && 
         p.arc.toLowerCase() === arc.toLowerCase()
  );
  
  return !!entry;
}

/**
 * Gets a complete prompt template based on genre, arc, and configuration
 */
export function getPromptFor(genre: string, arc: string, config: PromptConfig = {}): string {
  // Get the base pattern
  let pattern = getPattern(genre, arc);
  
  // If no specific pattern found, try DEFAULT fallback
  if (!pattern) {
    pattern = getPattern('DEFAULT', arc) || 'Create engaging content for [CHARACTER]';
  }
  
  // Build the prompt template
  let prompt = `[${genre.toUpperCase()}] ${pattern}\n\n`;
  
  // Add tone modifier
  if (config.tone) {
    prompt += `Tone: ${config.tone}\n`;
  }
  
  // Add memory context
  if (config.memory) {
    prompt += `Memory: Remember previous context and build upon it\n`;
  }
  
  // Add copilot behavior
  if (config.copilot) {
    prompt += `Behavior: Proactively suggest improvements and alternatives\n`;
  }
  
  // Add language preference
  if (config.language && config.language !== 'en') {
    prompt += `Language: Respond in ${config.language}\n`;
  }
  
  // Add character placeholder instruction
  prompt += `\nReplace [CHARACTER] with the main character's name and develop this scene.`;
  
  return prompt;
}

/**
 * Gets a pattern from the library based on genre and arc
 */
export function getPattern(genre: string, arc: string): string | null {
  const cacheKey = `${genre}:${arc}`;
  
  // Check cache first
  if (patternCache.has(cacheKey)) {
    return patternCache.get(cacheKey)!;
  }

  // Find pattern in library
  const entry = PATTERN_LIBRARY.find(
    p => p.genre.toLowerCase() === genre.toLowerCase() && 
         p.arc.toLowerCase() === arc.toLowerCase()
  );

  if (entry) {
    // Cache the result
    patternCache.set(cacheKey, entry.pattern);
    return entry.pattern;
  }

  return null;
}

/**
 * Gets all patterns for a specific genre
 */
export function getPatternsForGenre(genre: string): PatternEntry[] {
  return PATTERN_LIBRARY.filter(
    p => p.genre.toLowerCase() === genre.toLowerCase()
  );
}

/**
 * Gets all available genres
 */
export function getAvailableGenres(): string[] {
  const genres = new Set(PATTERN_LIBRARY.map(p => p.genre));
  return Array.from(genres).filter(g => g !== 'DEFAULT');
}

/**
 * Gets all available arcs
 */
export function getAvailableArcs(): string[] {
  const arcs = new Set(PATTERN_LIBRARY.map(p => p.arc));
  return Array.from(arcs);
}

/**
 * Gets pattern description
 */
export function getPatternDescription(genre: string, arc: string): string | null {
  const entry = PATTERN_LIBRARY.find(
    p => p.genre.toLowerCase() === genre.toLowerCase() && 
         p.arc.toLowerCase() === arc.toLowerCase()
  );
  
  return entry?.description || null;
}

/**
 * Clears the pattern cache
 */
export function clearPatternCache(): void {
  patternCache.clear();
}

/**
 * Gets cache statistics
 */
export function getCacheStats(): { size: number; hits: number } {
  return {
    size: patternCache.size,
    hits: 0 // Would need to implement hit tracking
  };
}

// Export the pattern library as a class-like object
export const PromptPatternLibrary = {
  getPattern,
  hasPatternFor,
  getPromptFor,
  getPatternsForGenre,
  getAvailableGenres,
  getAvailableArcs,
  getPatternDescription,
  clearPatternCache,
  getCacheStats
};
export type { PatternEntry, PromptConfig }; 