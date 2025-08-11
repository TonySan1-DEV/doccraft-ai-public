export const mcpContext = {
  file: 'modules/narrativeDashboard/tabs/CharacterViewTab.tsx',
  role: 'developer',
  allowedActions: ['refactor', 'type-harden', 'test'],
  contentSensitivity: 'low',
  theme: 'doccraft-ai',
};

import React, { useState, useMemo } from 'react';
import { CharacterPersona } from '../../../src/types/CharacterPersona';
import { clamp100, toPercentDisplay } from '../../emotionArc/utils/scaling';

export interface CharacterViewData {
  id: string;
  persona: CharacterPersona;
  screenTime: number; // percentage of total story (0-100)
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

type SortOption =
  | 'name'
  | 'screenTime'
  | 'developmentScore'
  | 'relationshipCount';

const CharacterViewTab: React.FC<CharacterViewTabProps> = ({
  characters = [],
  onCharacterSelect,
  selectedCharacterId,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [filterBy, setFilterBy] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredAndSortedCharacters = useMemo((): CharacterViewData[] => {
    if (!Array.isArray(characters)) return [];

    let filtered = characters;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        char =>
          char.persona?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          char.persona?.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(char => {
        switch (filterBy) {
          case 'protagonist':
            return char.persona?.archetype === 'protagonist';
          case 'antagonist':
            return char.persona?.archetype === 'antagonist';
          case 'supporting':
            return char.persona?.archetype === 'supporting';
          case 'developed':
            return (char.developmentScore ?? 0) > 70;
          case 'underdeveloped':
            return (char.developmentScore ?? 0) < 30;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.persona?.name ?? '').localeCompare(b.persona?.name ?? '');
        case 'screenTime':
          return (b.screenTime ?? 0) - (a.screenTime ?? 0);
        case 'developmentScore':
          return (b.developmentScore ?? 0) - (a.developmentScore ?? 0);
        case 'relationshipCount':
          return (b.relationshipCount ?? 0) - (a.relationshipCount ?? 0);
        default:
          return 0;
      }
    });
  }, [characters, searchTerm, filterBy, sortBy]);

  const selectedCharacter = useMemo((): CharacterViewData | undefined => {
    if (!selectedCharacterId || !Array.isArray(characters)) return undefined;
    return characters.find(char => char.id === selectedCharacterId);
  }, [characters, selectedCharacterId]);

  const getDevelopmentColor = (score: number): string => {
    const clampedScore = clamp100(score);
    if (clampedScore >= 80) return 'text-green-600';
    if (clampedScore >= 60) return 'text-yellow-600';
    if (clampedScore >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScreenTimeColor = (percentage: number): string => {
    const clampedPercentage = clamp100(percentage);
    if (clampedPercentage >= 80) return 'text-blue-600';
    if (clampedPercentage >= 60) return 'text-green-600';
    if (clampedPercentage >= 40) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const handleSortChange = (value: string): void => {
    if (
      value === 'name' ||
      value === 'screenTime' ||
      value === 'developmentScore' ||
      value === 'relationshipCount'
    ) {
      setSortBy(value as SortOption);
    }
  };

  if (!Array.isArray(characters) || characters.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-4">👤</div>
        <p className="text-lg font-medium mb-2">No Characters Available</p>
        <p className="text-sm">
          Add characters to your narrative to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Character View</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search characters..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-3 py-1 border rounded text-sm"
          />
          <select
            value={filterBy}
            onChange={e => setFilterBy(e.target.value)}
            className="px-3 py-1 border rounded text-sm"
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
            onChange={e => handleSortChange(e.target.value)}
            className="px-3 py-1 border rounded text-sm"
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
            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
              selectedCharacterId === character.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onCharacterSelect?.(character.id)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onCharacterSelect?.(character.id);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`Character: ${character.persona?.name ?? 'Unnamed Character'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">
                {character.persona?.name ?? 'Unnamed Character'}
              </h3>
              <span className="text-xs text-gray-500">
                {character.persona?.archetype ?? 'Unknown'}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {character.persona?.description ?? 'No description available'}
            </p>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Screen Time:</span>
                <span
                  className={`text-xs font-medium ${getScreenTimeColor(character.screenTime ?? 0)}`}
                >
                  {toPercentDisplay(character.screenTime ?? 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Development:</span>
                <span
                  className={`text-xs font-medium ${getDevelopmentColor(character.developmentScore ?? 0)}`}
                >
                  {clamp100(character.developmentScore ?? 0)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Relationships:</span>
                <span className="text-xs font-medium">
                  {character.relationshipCount ?? 0}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Character Details */}
      {selectedCharacter && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-semibold mb-2">
            {selectedCharacter.persona?.name ?? 'Unnamed Character'} - Details
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Archetype:</span>
              <span className="ml-2 font-medium">
                {selectedCharacter.persona?.archetype ?? 'Unknown'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Screen Time:</span>
              <span className="ml-2 font-medium">
                {toPercentDisplay(selectedCharacter.screenTime ?? 0)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Development Score:</span>
              <span className="ml-2 font-medium">
                {clamp100(selectedCharacter.developmentScore ?? 0)}%
              </span>
            </div>
            <div>
              <span className="text-gray-500">Relationships:</span>
              <span className="ml-2 font-medium">
                {selectedCharacter.relationshipCount ?? 0}
              </span>
            </div>
          </div>
          {selectedCharacter.persona?.description && (
            <div className="mt-2">
              <span className="text-gray-500">Description:</span>
              <p className="mt-1 text-sm">
                {selectedCharacter.persona.description}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CharacterViewTab;
