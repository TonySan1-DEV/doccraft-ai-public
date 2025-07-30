// MCP Context Block
/*
role: developer,
tier: Pro,
file: "modules/themeAnalysis/configs/themePresets.ts",
allowedActions: ["define", "generate", "categorize"],
theme: "theme_analysis"
*/

export interface GenreThemePreset {
  genre: string;
  themes: string[];
  values?: string[]; // philosophical drivers (e.g., truth, power)
}

/**
 * Reusable genre-linked theme libraries for thematic analysis.
 * Expand or customize for additional genres as needed.
 */
export const themePresets: GenreThemePreset[] = [
  {
    genre: 'Coming of Age',
    themes: ['identity', 'belonging', 'rebellion', 'growth'],
    values: ['self-worth', 'freedom']
  },
  {
    genre: 'Noir',
    themes: ['betrayal', 'justice', 'power', 'moral ambiguity'],
    values: ['corruption', 'redemption']
  },
  {
    genre: 'Romance',
    themes: ['love', 'sacrifice', 'jealousy', 'forgiveness'],
    values: ['connection', 'vulnerability']
  },
  {
    genre: 'Thriller',
    themes: ['paranoia', 'control', 'loyalty', 'truth'],
    values: ['survival', 'power']
  }
  // Add more presets as needed
]; 