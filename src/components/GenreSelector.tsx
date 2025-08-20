// MCP Context Block
/*
{
  file: "GenreSelector.tsx",
  role: "frontend-developer",
  allowedActions: ["ui", "genre", "preferences"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "genre_selection"
}
*/

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  Star,
  BookOpen,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useAgentPreferences } from '../contexts/AgentPreferencesContext';
import {
  Genre,
  genreCategories,
  allGenres,
  getPopularGenres,
  searchGenres,
  getGenreById,
  CHILDRENS_GENRE_KEY,
  CHILDRENS_SUBTYPES,
} from '../constants/genreConstants';
import { isChildrenGenreEnabled } from '../config/flags';

interface GenreSelectorProps {
  className?: string;
  onGenreSelected?: (genre: Genre) => void;
  selectedGenreId?: string;
  showSearch?: boolean;
  showPopular?: boolean;
  showCategories?: boolean;
  showSubgenres?: boolean;
  allowMultiple?: boolean;
  maxSelections?: number;
  disabled?: boolean;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dropdown' | 'cards' | 'list';
  onSubtypeChange?: (value: string | undefined) => void;
}

interface GenreCardProps {
  genre: Genre;
  isSelected: boolean;
  onSelect: (genre: Genre) => void;
  showSubgenres?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface GenreDropdownProps {
  genre: Genre;
  isSelected: boolean;
  onSelect: (genre: Genre) => void;
  showSubgenres?: boolean;
}

export function GenreSelector({
  className = '',
  onGenreSelected,
  selectedGenreId,
  showSearch = true,
  showPopular = true,
  showCategories = true,
  showSubgenres = false,
  allowMultiple = false,
  maxSelections = 1,
  disabled = false,
  placeholder = 'Select a genre...',
  size = 'md',
  variant = 'dropdown',
  onSubtypeChange,
}: GenreSelectorProps) {
  // TODO: Consider adding validation for maxSelections > 0 when allowMultiple is true
  // TODO: Consider adding accessibility attributes for screen readers
  // TODO: Consider adding keyboard navigation support for dropdown variant
  const { updatePreferences } = useAgentPreferences();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  const [selectedSubtype, setSelectedSubtype] = useState<string>('children-middle');

  // Initialize selected genres from props
  useEffect(() => {
    if (selectedGenreId && typeof selectedGenreId === 'string') {
      const genre = getGenreById(selectedGenreId);
      if (
        genre &&
        typeof genre === 'object' &&
        'id' in genre &&
        'name' in genre
      ) {
        setSelectedGenres([genre]);
      } else {
        console.warn(`Invalid genre found for ID: ${selectedGenreId}`);
        setSelectedGenres([]);
      }
    } else if (!selectedGenreId) {
      setSelectedGenres([]);
    }
  }, [selectedGenreId]);

  // Load recently used genres from localStorage
  useEffect(() => {
    try {
      const recent = localStorage.getItem('doccraft-recent-genres');
      if (recent) {
        const parsed = JSON.parse(recent);
        // Validate that parsed data is an array of strings
        if (
          Array.isArray(parsed) &&
          parsed.every(item => typeof item === 'string')
        ) {
          setRecentlyUsed(parsed);
        } else {
          console.warn(
            'Invalid recent genres format, resetting to empty array'
          );
          setRecentlyUsed([]);
        }
      }
    } catch (error) {
      console.warn('Failed to parse recent genres:', error);
      setRecentlyUsed([]);
    }
  }, []);

  // Get filtered genres based on search and category
  const filteredGenres = useMemo(() => {
    let genres = allGenres;

    // Filter by search query
    if (searchQuery.trim()) {
      genres = searchGenres(searchQuery);
    }

    // Filter by category
    if (activeCategory !== 'all') {
      genres = genres.filter(genre => genre.category === activeCategory);
    }

    return genres;
  }, [searchQuery, activeCategory]);

  // Get popular genres
  const popularGenres = useMemo(() => getPopularGenres(), []);

  // Get recently used genres
  const recentGenres = useMemo(() => {
    return recentlyUsed
      .map(id => getGenreById(id))
      .filter(
        (genre): genre is Genre =>
          genre !== undefined &&
          typeof genre === 'object' &&
          'id' in genre &&
          'name' in genre
      );
  }, [recentlyUsed]);

  // Handle genre selection
  const handleGenreSelect = useCallback(
    (genre: Genre) => {
      if (disabled) return;

      // Validate genre object
      if (
        !genre ||
        typeof genre !== 'object' ||
        !('id' in genre) ||
        !('name' in genre)
      ) {
        console.warn('Invalid genre object provided to handleGenreSelect');
        return;
      }

      let newSelectedGenres: Genre[];

      if (allowMultiple) {
        const isAlreadySelected = selectedGenres.some(g => g.id === genre.id);
        if (isAlreadySelected) {
          newSelectedGenres = selectedGenres.filter(g => g.id !== genre.id);
        } else {
          if (selectedGenres.length >= maxSelections) {
            newSelectedGenres = [...selectedGenres.slice(1), genre];
          } else {
            newSelectedGenres = [...selectedGenres, genre];
          }
        }
      } else {
        newSelectedGenres = [genre];
      }

      setSelectedGenres(newSelectedGenres);

      // Update preferences if this is the main genre selector
      if (!allowMultiple) {
        try {
          updatePreferences({ genre: genre.id });
        } catch (error) {
          console.warn('Failed to update preferences:', error);
        }
      }

      // Add to recently used
      try {
        const updatedRecent = [
          genre.id,
          ...recentlyUsed.filter(id => id !== genre.id),
        ].slice(0, 5);
        setRecentlyUsed(updatedRecent);
        localStorage.setItem(
          'doccraft-recent-genres',
          JSON.stringify(updatedRecent)
        );
      } catch (error) {
        console.warn('Failed to update recently used genres:', error);
      }

      // Call callback
      onGenreSelected?.(genre);

      // Close dropdown for single selection
      if (!allowMultiple) {
        setIsOpen(false);
        setSearchQuery('');
      }
    },
    [
      selectedGenres,
      allowMultiple,
      maxSelections,
      disabled,
      onGenreSelected,
      updatePreferences,
      recentlyUsed,
    ]
  );

  // Handle search
  const handleSearch = useCallback((query: string) => {
    if (typeof query === 'string') {
      setSearchQuery(query);
    }
  }, []);

  // Handle category change
  const handleCategoryChange = useCallback((category: string) => {
    if (
      typeof category === 'string' &&
      (category === 'all' || genreCategories.some(cat => cat.id === category))
    ) {
      setActiveCategory(category);
    }
  }, []);

  // Get display value
  const displayValue = useMemo(() => {
    if (selectedGenres.length === 0) return placeholder;
    if (selectedGenres.length === 1) return selectedGenres[0].name;
    return `${selectedGenres.length} genres selected`;
  }, [selectedGenres, placeholder]);

  // Size classes
  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-2',
    lg: 'text-lg px-4 py-3',
  };

  // Ensure size has a valid value
  const currentSize = size || 'md';
  const currentSizeClass = sizeClasses[currentSize] || sizeClasses.md;

  if (variant === 'cards') {
    return (
      <div className={`genre-selector-cards ${className}`}>
        <div className="mb-4">
          {showSearch && (
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search genres..."
                value={searchQuery}
                onChange={e => {
                  const target = e.target as HTMLInputElement;
                  handleSearch(target.value);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={disabled}
              />
            </div>
          )}

          {showCategories && (
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {genreCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === category.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGenres.map(genre => (
            <GenreCard
              key={genre.id}
              genre={genre}
              isSelected={selectedGenres.some(g => g.id === genre.id)}
              onSelect={handleGenreSelect}
              showSubgenres={showSubgenres}
              size={currentSize}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={`genre-selector-list ${className}`}>
        <div className="space-y-2">
          {filteredGenres.map(genre => (
            <GenreDropdown
              key={genre.id}
              genre={genre}
              isSelected={selectedGenres.some(g => g.id === genre.id)}
              onSelect={handleGenreSelect}
              showSubgenres={showSubgenres}
            />
          ))}
        </div>
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative genre-selector ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between ${currentSizeClass} border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span className="flex items-center space-x-2">
          {selectedGenres.length > 0 && (
            <span className="text-gray-500">{selectedGenres[0].icon}</span>
          )}
          <span className={selectedGenres.length === 0 ? 'text-gray-500' : ''}>
            {displayValue}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-4">
            {showSearch && (
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search genres..."
                  value={searchQuery}
                  onChange={e => {
                    const target = e.target as HTMLInputElement;
                    handleSearch(target.value);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {showCategories && (
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === 'all'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {genreCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === category.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.icon} {category.name}
                  </button>
                ))}
              </div>
            )}

            {showPopular &&
              Array.isArray(popularGenres) &&
              popularGenres.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Popular
                    </span>
                  </div>
                  <div className="space-y-1">
                    {popularGenres.slice(0, 5).map(genre => (
                      <GenreDropdown
                        key={genre.id}
                        genre={genre}
                        isSelected={selectedGenres.some(g => g.id === genre.id)}
                        onSelect={handleGenreSelect}
                        showSubgenres={showSubgenres}
                      />
                    ))}
                  </div>
                </div>
              )}

            {Array.isArray(recentGenres) && recentGenres.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Recently Used
                  </span>
                </div>
                <div className="space-y-1">
                  {recentGenres.slice(0, 3).map(genre => (
                    <GenreDropdown
                      key={genre.id}
                      genre={genre}
                      isSelected={selectedGenres.some(g => g.id === genre.id)}
                      onSelect={handleGenreSelect}
                      showSubgenres={showSubgenres}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1">
              {filteredGenres.map(genre => (
                <GenreDropdown
                  key={genre.id}
                  genre={genre}
                  isSelected={selectedGenres.some(g => g.id === genre.id)}
                  onSelect={handleGenreSelect}
                  showSubgenres={showSubgenres}
                />
              ))}
            </div>

            {filteredGenres.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No genres found matching &quot;{searchQuery}&quot;
              </div>
            )}

            {/* Children's Subtype Selection */}
            {isChildrenGenreEnabled() && 
             selectedGenres.length === 1 && 
             selectedGenres[0].id === CHILDRENS_GENRE_KEY && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Age Group
                </label>
                <select
                  value={selectedSubtype}
                  onChange={(e) => {
                    const newSubtype = e.target.value;
                    setSelectedSubtype(newSubtype);
                    onSubtypeChange?.(newSubtype);
                  }}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {CHILDRENS_SUBTYPES.map(subtype => (
                    <option key={subtype} value={subtype}>
                      {subtype === 'children-early' ? 'Early (Ages 4-6)' :
                       subtype === 'children-middle' ? 'Middle (Ages 7-9)' :
                       'Older (Ages 10-12)'}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function GenreCard({
  genre,
  isSelected,
  onSelect,
  showSubgenres,
  size,
}: GenreCardProps) {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    medium: 'p-4', // Add medium as alias for md
  };

  // Ensure size has a valid value
  const currentSize = size || 'medium';
  const currentSizeClass = sizeClasses[currentSize] || sizeClasses.medium;

  return (
    <button
      onClick={() => onSelect(genre)}
      className={`w-full text-left border rounded-lg transition-all duration-200 ${currentSizeClass} ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start space-x-3">
        <span className="text-2xl">{genre.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-gray-900 truncate">{genre.name}</h3>
            {genre.isPopular && (
              <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {genre.description}
          </p>

          {showSubgenres &&
            Array.isArray(genre.subgenres) &&
            genre.subgenres.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {genre.subgenres.slice(0, 3).map((subgenre, index) => (
                    <span
                      key={`${subgenre}-${index}`}
                      className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                    >
                      {typeof subgenre === 'string' ? subgenre : 'Unknown'}
                    </span>
                  ))}
                  {genre.subgenres.length > 3 && (
                    <span className="inline-block px-2 py-1 text-xs text-gray-500">
                      +{genre.subgenres.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

          <div className="flex items-center space-x-2 mt-2">
            <span
              className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                genre.category === 'fiction'
                  ? 'bg-purple-100 text-purple-800'
                  : genre.category === 'nonfiction'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {genre.category === 'fiction' ? (
                <BookOpen className="w-3 h-3 mr-1" />
              ) : (
                <FileText className="w-3 h-3 mr-1" />
              )}
              {genre.category}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function GenreDropdown({
  genre,
  isSelected,
  onSelect,
  showSubgenres,
}: GenreDropdownProps) {
  return (
    <button
      onClick={() => onSelect(genre)}
      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
        isSelected
          ? 'bg-blue-100 text-blue-900'
          : 'hover:bg-gray-100 text-gray-900'
      }`}
    >
      <div className="flex items-center space-x-3">
        <span className="text-lg">{genre.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-medium truncate">{genre.name}</span>
            {genre.isPopular && (
              <Star className="w-3 h-3 text-yellow-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-gray-600 truncate">{genre.description}</p>

          {showSubgenres &&
            Array.isArray(genre.subgenres) &&
            genre.subgenres.length > 0 && (
              <div className="mt-1">
                <div className="flex flex-wrap gap-1">
                  {genre.subgenres.slice(0, 2).map((subgenre, index) => (
                    <span
                      key={`${subgenre}-${index}`}
                      className="inline-block px-1 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                    >
                      {typeof subgenre === 'string' ? subgenre : 'Unknown'}
                    </span>
                  ))}
                  {genre.subgenres.length > 2 && (
                    <span className="inline-block px-1 py-0.5 text-xs text-gray-500">
                      +{genre.subgenres.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </button>
  );
}

export default GenreSelector;
