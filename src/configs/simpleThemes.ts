// Simple 5-Color Theme System Configuration
// Provides basic theme definitions with primary, secondary, and accent colors

export interface SimpleTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
}

// Predefined themes with specific colors
export const simpleThemes: SimpleTheme[] = [
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    primary: '#1e3a8a', // Deep blue
    secondary: '#3b82f6', // Bright blue
    accent: '#60a5fa', // Light blue
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    primary: '#166534', // Dark green
    secondary: '#16a34a', // Medium green
    accent: '#22c55e', // Light green
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    primary: '#581c87', // Dark purple
    secondary: '#9333ea', // Medium purple
    accent: '#a855f7', // Light purple
  },
  {
    id: 'ruby-red',
    name: 'Ruby Red',
    primary: '#991b1b', // Dark red
    secondary: '#dc2626', // Medium red
    accent: '#ef4444', // Light red
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    primary: '#c2410c', // Dark orange
    secondary: '#ea580c', // Medium orange
    accent: '#f97316', // Light orange
  },
];

// Helper function to get theme by ID
export const getThemeById = (id: string): SimpleTheme | undefined => {
  return simpleThemes.find(theme => theme.id === id);
};

// Helper function to get default theme (Ocean Blue)
export const getDefaultTheme = (): SimpleTheme => {
  return simpleThemes[0]; // Ocean Blue is always first
};
