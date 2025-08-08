import React, { useState, useMemo } from 'react';
import {
  CharacterPersona,
  CharacterMemory,
  CharacterTrait,
} from '../../../src/types/CharacterPersona';

export interface CharacterViewData {
  id: string;
  persona: CharacterPersona;
  screenTime: number; // percentage of total story
  emotionalArc: string;
  relationshipCount: number;
  developmentScore: number; // 0-100
  lastUpdated: string;
}

export interface CharacterViewTabProps {
  characters?: CharacterViewData[];
  onCharacterSelect?: (characterId: string) => void;
  selectedCharacterId?: string;
  showDevelopmentArcs?: boolean;
  showRelationships?: boolean;
  showEmotionalTimeline?: boolean;
}

const CharacterViewTab: React.FC<CharacterViewTabProps> = ({
  characters = [],
  onCharacterSelect,
  selectedCharacterId,
  showDevelopmentArcs = true,
  showRelationships = true,
  showEmotionalTimeline = true,
}) => {
  const [sortBy, setSortBy] = useState<
    'name' | 'screenTime' | 'developmentScore' | 'relationshipCount'
  >('name');
  const [filterBy, setFilterBy] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredAndSortedCharacters = useMemo(() => {
    let filtered = characters;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        char =>
          char.persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          char.persona.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(char => {
        switch (filterBy) {
          case 'protagonist':
            return char.persona.archetype === 'protagonist';
          case 'antagonist':
            return char.persona.archetype === 'antagonist';
          case 'supporting':
            return char.persona.archetype === 'supporting';
          case 'developed':
            return char.developmentScore > 70;
          case 'underdeveloped':
            return char.developmentScore < 30;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.persona.name.localeCompare(b.persona.name);
        case 'screenTime':
          return b.screenTime - a.screenTime;
        case 'developmentScore':
          return b.developmentScore - a.developmentScore;
        case 'relationshipCount':
          return b.relationshipCount - a.relationshipCount;
        default:
          return 0;
      }
    });
  }, [characters, searchTerm, filterBy, sortBy]);

  const selectedCharacter = characters.find(
    char => char.id === selectedCharacterId
  );

  const getDevelopmentColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScreenTimeColor = (percentage: number): string => {
    if (percentage >= 30) return 'text-blue-600';
    if (percentage >= 15) return 'text-green-600';
    if (percentage >= 5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Character Analysis</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search characters..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          />
          <select
            value={filterBy}
            onChange={e => setFilterBy(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="all">All Characters</option>
            <option value="protagonist">Protagonists</option>
            <option value="antagonist">Antagonists</option>
            <option value="supporting">Supporting</option>
            <option value="developed">Well Developed</option>
            <option value="underdeveloped">Underdeveloped</option>
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="name">Sort by Name</option>
            <option value="screenTime">Sort by Screen Time</option>
            <option value="developmentScore">Sort by Development</option>
            <option value="relationshipCount">Sort by Relationships</option>
          </select>
        </div>
      </div>

      {/* Character Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedCharacters.map(character => (
          <div
            key={character.id}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedCharacterId === character.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onCharacterSelect?.(character.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-900">
                {character.persona.name}
              </h4>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  character.persona.archetype === 'protagonist'
                    ? 'bg-blue-100 text-blue-800'
                    : character.persona.archetype === 'antagonist'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {character.persona.archetype || 'character'}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {character.persona.description}
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Screen Time:</span>
                <span className={getScreenTimeColor(character.screenTime)}>
                  {character.screenTime.toFixed(1)}%
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Development:</span>
                <span
                  className={getDevelopmentColor(character.developmentScore)}
                >
                  {character.developmentScore}%
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Relationships:</span>
                <span className="text-gray-700">
                  {character.relationshipCount}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Character Details */}
      {selectedCharacter && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h4 className="text-lg font-semibold mb-4">
            {selectedCharacter.persona.name} - Details
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div>
              <h5 className="font-medium mb-2">Basic Information</h5>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Archetype:</strong>{' '}
                  {selectedCharacter.persona.archetype || 'Not specified'}
                </div>
                <div>
                  <strong>Voice Style:</strong>{' '}
                  {selectedCharacter.persona.voiceStyle || 'Not specified'}
                </div>
                <div>
                  <strong>Worldview:</strong>{' '}
                  {selectedCharacter.persona.worldview || 'Not specified'}
                </div>
                <div>
                  <strong>Last Updated:</strong>{' '}
                  {new Date(selectedCharacter.lastUpdated).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Development Metrics */}
            <div>
              <h5 className="font-medium mb-2">Development Metrics</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Screen Time:</span>
                  <span
                    className={getScreenTimeColor(selectedCharacter.screenTime)}
                  >
                    {selectedCharacter.screenTime.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Development Score:</span>
                  <span
                    className={getDevelopmentColor(
                      selectedCharacter.developmentScore
                    )}
                  >
                    {selectedCharacter.developmentScore}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Relationships:</span>
                  <span>{selectedCharacter.relationshipCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Emotional Arc:</span>
                  <span>{selectedCharacter.emotionalArc}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Character Traits */}
          {selectedCharacter.persona.traits &&
            selectedCharacter.persona.traits.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium mb-2">Personality Traits</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedCharacter.persona.traits.map((trait, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {trait.name}: {trait.value} ({trait.strength}/10)
                    </span>
                  ))}
                </div>
              </div>
            )}

          {/* Character Memory */}
          {selectedCharacter.persona.memory &&
            selectedCharacter.persona.memory.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium mb-2">Recent Memory</h5>
                <div className="space-y-2">
                  {selectedCharacter.persona.memory
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, 3)
                    .map((memory, index) => (
                      <div
                        key={index}
                        className="text-sm p-2 bg-white rounded border"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-medium">{memory.type}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(memory.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">{memory.content}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
        </div>
      )}

      {/* Empty State */}
      {filteredAndSortedCharacters.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No characters found matching your criteria.</p>
          <p className="text-sm mt-2">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default CharacterViewTab;
