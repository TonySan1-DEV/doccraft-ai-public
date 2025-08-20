// MCP Context Block
/*
{
  file: "genreConstants.ts",
  role: "frontend-developer",
  allowedActions: ["define", "configure", "organize"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "genre_selection"
}
*/

export interface Genre {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'fiction' | 'nonfiction' | 'special';
  subgenres?: string[];
  tags: string[];
  isPopular?: boolean;
  defaultTone?: 'friendly' | 'formal' | 'concise';
  targetAudience?: string[];
}

export interface GenreCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  genres: Genre[];
}

// Children's Genre Constants
export const CHILDRENS_GENRE_KEY = "children";
export const CHILDRENS_SUBTYPES = [
  "children-early",   // ages ~4–6, PreK/K-1
  "children-middle",  // ages ~7–9, A1–A2
  "children-older",   // ages ~10–12, B1
] as const;
export type ChildrensSubtype = typeof CHILDRENS_SUBTYPES[number];

// Fiction Genres
export const fictionGenres: Genre[] = [
  {
    id: 'fantasy',
    name: 'Fantasy',
    description:
      'Imaginative worlds with magic, mythical creatures, and supernatural elements',
    icon: '🐉',
    category: 'fiction',
    subgenres: [
      'High Fantasy',
      'Urban Fantasy',
      'Dark Fantasy',
      'Epic Fantasy',
      'Contemporary Fantasy',
    ],
    tags: ['magic', 'adventure', 'mythical', 'supernatural'],
    isPopular: true,
    defaultTone: 'friendly',
    targetAudience: ['young-adult', 'adult'],
  },
  {
    id: 'science-fiction',
    name: 'Science Fiction',
    description:
      'Futuristic technology, space exploration, and scientific concepts',
    icon: '🚀',
    category: 'fiction',
    subgenres: [
      'Hard Sci-Fi',
      'Space Opera',
      'Cyberpunk',
      'Dystopian',
      'Time Travel',
    ],
    tags: ['technology', 'future', 'space', 'scientific'],
    isPopular: true,
    defaultTone: 'formal',
    targetAudience: ['young-adult', 'adult'],
  },
  {
    id: 'mystery',
    name: 'Mystery',
    description:
      'Suspenseful stories with puzzles, investigations, and crime-solving',
    icon: '🔍',
    category: 'fiction',
    subgenres: [
      'Detective',
      'Cozy Mystery',
      'Thriller',
      'Police Procedural',
      'Amateur Sleuth',
    ],
    tags: ['suspense', 'investigation', 'crime', 'puzzle'],
    isPopular: true,
    defaultTone: 'concise',
    targetAudience: ['young-adult', 'adult'],
  },
  {
    id: 'romance',
    name: 'Romance',
    description:
      'Stories focused on love, relationships, and emotional connections',
    icon: '💕',
    category: 'fiction',
    subgenres: ['Contemporary', 'Historical', 'Paranormal', 'Erotic', 'Clean'],
    tags: ['love', 'relationships', 'emotional', 'connection'],
    isPopular: true,
    defaultTone: 'friendly',
    targetAudience: ['young-adult', 'adult'],
  },
  {
    id: 'historical-fiction',
    name: 'Historical Fiction',
    description: 'Stories set in the past with authentic historical details',
    icon: '🏛️',
    category: 'fiction',
    subgenres: ['Medieval', 'Victorian', 'World War II', 'Ancient', 'Colonial'],
    tags: ['historical', 'period', 'authentic', 'past'],
    defaultTone: 'formal',
    targetAudience: ['adult'],
  },
  {
    id: 'thriller',
    name: 'Thriller',
    description: 'High-stakes, fast-paced stories with danger and suspense',
    icon: '⚡',
    category: 'fiction',
    subgenres: ['Psychological', 'Legal', 'Political', 'Military', 'Domestic'],
    tags: ['suspense', 'danger', 'action', 'high-stakes'],
    defaultTone: 'concise',
    targetAudience: ['young-adult', 'adult'],
  },
  {
    id: 'horror',
    name: 'Horror',
    description: 'Stories designed to frighten and create suspense',
    icon: '👻',
    category: 'fiction',
    subgenres: [
      'Supernatural',
      'Psychological',
      'Gothic',
      'Cosmic',
      'Body Horror',
    ],
    tags: ['fear', 'suspense', 'supernatural', 'dark'],
    defaultTone: 'concise',
    targetAudience: ['young-adult', 'adult'],
  },
  {
    id: 'adventure',
    name: 'Adventure',
    description: 'Action-packed stories with exploration and discovery',
    icon: '🗺️',
    category: 'fiction',
    subgenres: [
      'Survival',
      'Exploration',
      'Treasure Hunt',
      'Swashbuckling',
      'Expedition',
    ],
    tags: ['action', 'exploration', 'discovery', 'journey'],
    defaultTone: 'friendly',
    targetAudience: ['young-adult', 'adult'],
  },
  {
    id: CHILDRENS_GENRE_KEY,
    name: 'Children\'s Book',
    description: 'Stories designed for young readers with age-appropriate content and themes',
    icon: '📚',
    category: 'fiction',
    subgenres: CHILDRENS_SUBTYPES,
    tags: ['children', 'educational', 'imaginative', 'age-appropriate'],
    isPopular: true,
    defaultTone: 'friendly',
    targetAudience: ['children-early', 'children-middle', 'children-older'],
  },
];

// Nonfiction Genres
export const nonfictionGenres: Genre[] = [
  {
    id: 'memoir',
    name: 'Memoir',
    description: 'Personal life stories and autobiographical accounts',
    icon: '📖',
    category: 'nonfiction',
    subgenres: [
      'Personal Memoir',
      'Celebrity Memoir',
      'Travel Memoir',
      'Spiritual Memoir',
    ],
    tags: ['personal', 'autobiographical', 'life-story', 'reflection'],
    isPopular: true,
    defaultTone: 'friendly',
    targetAudience: ['adult'],
  },
  {
    id: 'self-help',
    name: 'Self-Help',
    description:
      'Books designed to improve personal development and life skills',
    icon: '💪',
    category: 'nonfiction',
    subgenres: [
      'Personal Development',
      'Psychology',
      'Business',
      'Health',
      'Relationships',
    ],
    tags: ['development', 'improvement', 'skills', 'growth'],
    isPopular: true,
    defaultTone: 'friendly',
    targetAudience: ['young-adult', 'adult'],
  },
  {
    id: 'history',
    name: 'History',
    description: 'Accounts of past events, people, and civilizations',
    icon: '📚',
    category: 'nonfiction',
    subgenres: [
      'Ancient History',
      'Military History',
      'Social History',
      'Biographical History',
    ],
    tags: ['historical', 'events', 'civilization', 'research'],
    defaultTone: 'formal',
    targetAudience: ['adult'],
  },
  {
    id: 'science',
    name: 'Science',
    description: 'Books about scientific discoveries, theories, and research',
    icon: '🔬',
    category: 'nonfiction',
    subgenres: ['Physics', 'Biology', 'Chemistry', 'Astronomy', 'Psychology'],
    tags: ['scientific', 'research', 'discovery', 'theory'],
    defaultTone: 'formal',
    targetAudience: ['young-adult', 'adult'],
  },
  {
    id: 'business',
    name: 'Business',
    description:
      'Books about entrepreneurship, management, and business strategies',
    icon: '💼',
    category: 'nonfiction',
    subgenres: [
      'Entrepreneurship',
      'Management',
      'Marketing',
      'Finance',
      'Leadership',
    ],
    tags: ['business', 'entrepreneurship', 'management', 'strategy'],
    defaultTone: 'formal',
    targetAudience: ['adult'],
  },
  {
    id: 'philosophy',
    name: 'Philosophy',
    description:
      'Books exploring fundamental questions about existence and knowledge',
    icon: '🤔',
    category: 'nonfiction',
    subgenres: [
      'Ethics',
      'Metaphysics',
      'Epistemology',
      'Political Philosophy',
    ],
    tags: ['philosophy', 'existence', 'knowledge', 'ethics'],
    defaultTone: 'formal',
    targetAudience: ['adult'],
  },
  {
    id: 'travel',
    name: 'Travel',
    description: 'Books about destinations, cultures, and travel experiences',
    icon: '✈️',
    category: 'nonfiction',
    subgenres: [
      'Travel Guide',
      'Travel Memoir',
      'Cultural',
      'Adventure Travel',
    ],
    tags: ['travel', 'culture', 'destination', 'experience'],
    defaultTone: 'friendly',
    targetAudience: ['young-adult', 'adult'],
  },
  {
    id: 'cookbook',
    name: 'Cookbook',
    description: 'Recipe collections and culinary instruction books',
    icon: '👨‍🍳',
    category: 'nonfiction',
    subgenres: [
      'Regional Cuisine',
      'Dietary',
      'Baking',
      'Quick Meals',
      'Gourmet',
    ],
    tags: ['cooking', 'recipes', 'culinary', 'food'],
    defaultTone: 'friendly',
    targetAudience: ['young-adult', 'adult'],
  },
];

// Special Category (can belong to either fiction or nonfiction)
export const specialGenres: Genre[] = [
  {
    id: 'biography',
    name: 'Biography & Autobiography',
    description: "Detailed accounts of real people's lives and achievements",
    icon: '👤',
    category: 'special',
    subgenres: ['Autobiography', 'Biography', 'Memoir', 'Celebrity Bio'],
    tags: ['biographical', 'real-people', 'achievements', 'life-story'],
    isPopular: true,
    defaultTone: 'formal',
    targetAudience: ['young-adult', 'adult'],
  },
];

// Genre Categories
export const genreCategories: GenreCategory[] = [
  {
    id: 'fiction',
    name: 'Fiction',
    description: 'Imaginative stories and creative narratives',
    icon: '📚',
    genres: fictionGenres,
  },
  {
    id: 'nonfiction',
    name: 'Nonfiction',
    description: 'Factual content and real-world information',
    icon: '📖',
    genres: nonfictionGenres,
  },
  {
    id: 'special',
    name: 'Special',
    description: 'Unique categories that can span multiple types',
    icon: '⭐',
    genres: specialGenres,
  },
];

// All genres combined
export const allGenres: Genre[] = [
  ...fictionGenres,
  ...nonfictionGenres,
  ...specialGenres,
];

// Utility functions
export function getGenreById(id: string): Genre | undefined {
  return allGenres.find(genre => genre.id === id);
}

export function getGenresByCategory(category: string): Genre[] {
  return allGenres.filter(genre => genre.category === category);
}

export function getPopularGenres(): Genre[] {
  return allGenres.filter(genre => genre.isPopular);
}

export function searchGenres(query: string): Genre[] {
  const lowercaseQuery = query.toLowerCase();
  return allGenres.filter(
    genre =>
      genre.name.toLowerCase().includes(lowercaseQuery) ||
      genre.description.toLowerCase().includes(lowercaseQuery) ||
      genre.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

export function getGenreBySubgenre(subgenre: string): Genre | undefined {
  return allGenres.find(genre =>
    genre.subgenres?.some(sub => sub.toLowerCase() === subgenre.toLowerCase())
  );
}

export function validateGenre(genreId: string): boolean {
  return allGenres.some(genre => genre.id === genreId);
}

// Default genre for fallback
export const defaultGenre: Genre = {
  id: 'general',
  name: 'General',
  description: 'General content without specific genre classification',
  icon: '📄',
  category: 'nonfiction',
  tags: ['general', 'content'],
  defaultTone: 'friendly',
  targetAudience: ['all'],
};
