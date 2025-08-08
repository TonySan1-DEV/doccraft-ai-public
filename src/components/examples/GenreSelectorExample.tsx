// MCP Context Block
/*
{
  file: "GenreSelectorExample.tsx",
  role: "frontend-developer",
  allowedActions: ["demo", "example", "showcase"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "genre_selection"
}
*/

import { useState } from 'react';
import { GenreSelector } from '../GenreSelector';
import { Genre } from '../../constants/genreConstants';

interface GenreSelectorExampleProps {
  className?: string;
}

export function GenreSelectorExample({
  className = '',
}: GenreSelectorExampleProps) {
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [activeVariant, setActiveVariant] = useState<
    'dropdown' | 'cards' | 'list'
  >('dropdown');

  const handleGenreSelected = (genre: Genre) => {
    setSelectedGenre(genre);
    console.log('Selected genre:', genre);
  };

  const handleMultipleGenresSelected = (genre: Genre) => {
    setSelectedGenres(prev => {
      const isAlreadySelected = prev.some(g => g.id === genre.id);
      if (isAlreadySelected) {
        return prev.filter(g => g.id !== genre.id);
      } else {
        return [...prev, genre];
      }
    });
  };

  return (
    <div className={`genre-selector-example ${className}`}>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Genre Selector Examples
          </h1>
          <p className="text-gray-600 mb-8">
            Explore different configurations and use cases for the GenreSelector
            component
          </p>
        </div>

        {/* Variant Selector */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-lg font-semibold mb-4">Choose Display Variant</h2>
          <div className="flex space-x-4">
            {(['dropdown', 'cards', 'list'] as const).map(variant => (
              <button
                key={variant}
                onClick={() => setActiveVariant(variant)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeVariant === variant
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {variant.charAt(0).toUpperCase() + variant.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Dropdown */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Basic Dropdown</h3>
            <p className="text-sm text-gray-600 mb-4">
              Simple dropdown with search and popular genres
            </p>
            <GenreSelector
              onGenreSelected={handleGenreSelected}
              selectedGenreId={selectedGenre?.id}
              showSearch={true}
              showPopular={true}
              showCategories={true}
              variant={activeVariant}
              placeholder="Choose a genre..."
            />
            {selectedGenre && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium">
                  Selected: {selectedGenre.name}
                </p>
                <p className="text-xs text-gray-600">
                  {selectedGenre.description}
                </p>
              </div>
            )}
          </div>

          {/* Multiple Selection */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Multiple Selection</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select multiple genres (max 3)
            </p>
            <GenreSelector
              onGenreSelected={handleMultipleGenresSelected}
              allowMultiple={true}
              maxSelections={3}
              showSearch={true}
              showCategories={true}
              variant={activeVariant}
              placeholder="Choose genres..."
            />
            {selectedGenres.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium">
                  Selected ({selectedGenres.length}):{' '}
                  {selectedGenres.map(g => g.name).join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* With Subgenres */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">With Subgenres</h3>
            <p className="text-sm text-gray-600 mb-4">
              Shows detailed subgenre information
            </p>
            <GenreSelector
              onGenreSelected={handleGenreSelected}
              showSubgenres={true}
              showSearch={true}
              showCategories={true}
              variant={activeVariant}
              placeholder="Select with subgenres..."
            />
          </div>

          {/* Compact Size */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Compact Size</h3>
            <p className="text-sm text-gray-600 mb-4">
              Smaller size for tight layouts
            </p>
            <GenreSelector
              onGenreSelected={handleGenreSelected}
              size="sm"
              showSearch={false}
              showPopular={false}
              variant={activeVariant}
              placeholder="Compact selector..."
            />
          </div>

          {/* Disabled State */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Disabled State</h3>
            <p className="text-sm text-gray-600 mb-4">
              Disabled for read-only or loading states
            </p>
            <GenreSelector
              disabled={true}
              selectedGenreId="fantasy"
              variant={activeVariant}
              placeholder="Disabled selector..."
            />
          </div>

          {/* Large Size */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Large Size</h3>
            <p className="text-sm text-gray-600 mb-4">
              Larger size for prominent placement
            </p>
            <GenreSelector
              onGenreSelected={handleGenreSelected}
              size="lg"
              showSearch={true}
              showPopular={true}
              variant={activeVariant}
              placeholder="Large selector..."
            />
          </div>
        </div>

        {/* Usage Examples */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Integration Examples</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* eBook Creation */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">eBook Creation</h4>
              <p className="text-sm text-gray-600 mb-3">
                Select genre for your book project
              </p>
              <GenreSelector
                onGenreSelected={handleGenreSelected}
                selectedGenreId={selectedGenre?.id}
                showSearch={true}
                showPopular={true}
                showCategories={true}
                variant="dropdown"
                placeholder="Choose book genre..."
              />
            </div>

            {/* Video Script */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Video Script</h4>
              <p className="text-sm text-gray-600 mb-3">
                Select content type for video narration
              </p>
              <GenreSelector
                onGenreSelected={handleGenreSelected}
                selectedGenreId={selectedGenre?.id}
                showSearch={true}
                showCategories={true}
                variant="dropdown"
                placeholder="Choose content type..."
              />
            </div>

            {/* Content Analysis */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Content Analysis</h4>
              <p className="text-sm text-gray-600 mb-3">
                Select genres to analyze
              </p>
              <GenreSelector
                onGenreSelected={handleMultipleGenresSelected}
                allowMultiple={true}
                maxSelections={5}
                showSearch={true}
                showCategories={true}
                variant="cards"
                placeholder="Select genres to analyze..."
              />
            </div>

            {/* Quick Selection */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Quick Selection</h4>
              <p className="text-sm text-gray-600 mb-3">
                Fast genre selection for quick workflows
              </p>
              <GenreSelector
                onGenreSelected={handleGenreSelected}
                showSearch={false}
                showPopular={true}
                showCategories={false}
                variant="list"
                placeholder="Quick select..."
              />
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Code Examples
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Basic Usage
              </h4>
              <pre className="text-sm text-gray-400 bg-gray-800 p-3 rounded overflow-x-auto">
                {`<GenreSelector
  onGenreSelected={(genre) => console.log(genre)}
  selectedGenreId="fantasy"
  showSearch={true}
  showPopular={true}
  showCategories={true}
/>`}
              </pre>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Multiple Selection
              </h4>
              <pre className="text-sm text-gray-400 bg-gray-800 p-3 rounded overflow-x-auto">
                {`<GenreSelector
  allowMultiple={true}
  maxSelections={3}
  onGenreSelected={(genre) => handleMultipleSelection(genre)}
  variant="cards"
  showSubgenres={true}
/>`}
              </pre>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Different Variants
              </h4>
              <pre className="text-sm text-gray-400 bg-gray-800 p-3 rounded overflow-x-auto">
                {`// Dropdown (default)
<GenreSelector variant="dropdown" />

// Cards layout
<GenreSelector variant="cards" />

// List layout
<GenreSelector variant="list" />`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenreSelectorExample;
