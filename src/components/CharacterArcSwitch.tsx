// MCP Context Block
/*
{
  file: "CharacterArcSwitch.tsx",
  role: "developer",
  allowedActions: ["analyze", "simulate", "visualize", "suggest"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "writing_suite"
}
*/



interface CharacterArcSwitchProps {
  characterIds: string[];
  selectedCharacter: string;
  onCharacterSwitch: (characterId: string) => void;
}

export default function CharacterArcSwitch({
  characterIds,
  selectedCharacter,
  onCharacterSwitch
}: CharacterArcSwitchProps) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">View:</span>
      
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => onCharacterSwitch('all')}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
            selectedCharacter === 'all'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Characters
        </button>
        
        {characterIds.length > 0 && (
          <div className="relative">
            <select
              value={selectedCharacter === 'all' ? '' : selectedCharacter}
              onChange={(e) => onCharacterSwitch(e.target.value || 'all')}
              className="px-3 py-1 text-xs font-medium text-gray-600 bg-transparent border-none focus:outline-none focus:ring-0"
            >
              <option value="" disabled>
                Individual
              </option>
              {characterIds.map(characterId => (
                <option key={characterId} value={characterId}>
                  {characterId}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {selectedCharacter !== 'all' && (
        <button
          onClick={() => onCharacterSwitch('all')}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Reset
        </button>
      )}
    </div>
  );
} 