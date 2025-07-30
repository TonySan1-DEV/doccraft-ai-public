import { useState } from 'react'

import { 
  Users, 
  Brain, 
  Heart, 
  Target, 
  Zap, 
  Plus, 
  Trash2,
  Save,
  Download,
  Eye,
  Star,
  TrendingUp,
  Lightbulb,
  BookOpen,
  Shield,
  Sword,
  Crown,
  UserCheck,
  MessageCircle,
  Settings
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import CharacterInteractionSystem from '../components/CharacterInteractionSystem'
// import { useCharacterInteraction, useCharacterDevelopment } from '../hooks/useCharacterInteraction'

interface Character {
  id: string
  name: string
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor'
  archetype: string
  personality: {
    traits: string[]
    strengths: string[]
    weaknesses: string[]
    fears: string[]
    desires: string[]
  }
  background: {
    origin: string
    family: string
    education: string
    occupation: string
    significantEvents: string[]
  }
  goals: {
    primary: string
    secondary: string[]
    internal: string
    external: string
  }
  conflicts: {
    internal: string[]
    external: string[]
    relationships: string[]
  }
  arc: {
    type: 'hero' | 'tragic' | 'flat' | 'growth'
    description: string
    stages: string[]
  }
  relationships: {
    allies: string[]
    enemies: string[]
    mentors: string[]
    loveInterests: string[]
  }
  development: {
    currentStage: number
    totalStages: number
    growthAreas: string[]
    achievements: string[]
  }
}

export default function CharacterDevelopment() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'personality' | 'background' | 'goals' | 'relationships' | 'arc' | 'interaction'>('overview')
  const [showInteractionSystem, setShowInteractionSystem] = useState(false)



  const createCharacter = () => {
    const newCharacter: Character = {
      id: Date.now().toString(),
      name: 'New Character',
      role: 'protagonist',
      archetype: 'Hero',
      personality: {
        traits: ['Brave', 'Curious', 'Determined'],
        strengths: ['Leadership', 'Courage', 'Loyalty'],
        weaknesses: ['Impatience', 'Stubbornness', 'Trust issues'],
        fears: ['Failure', 'Loss of loved ones', 'Unknown'],
        desires: ['Recognition', 'Love', 'Purpose']
      },
      background: {
        origin: 'Small town upbringing',
        family: 'Middle-class family',
        education: 'High school graduate',
        occupation: 'Student/Apprentice',
        significantEvents: ['Lost a parent at young age', 'Discovered special abilities']
      },
      goals: {
        primary: 'Find the lost artifact',
        secondary: ['Protect family', 'Prove worth', 'Find love'],
        internal: 'Overcome fear of failure',
        external: 'Defeat the antagonist'
      },
      conflicts: {
        internal: ['Self-doubt', 'Fear of responsibility', 'Identity crisis'],
        external: ['Antagonist threat', 'Society pressure', 'Natural disasters'],
        relationships: ['Love triangle', 'Family expectations', 'Mentor conflict']
      },
      arc: {
        type: 'hero',
        description: 'Hero\'s journey from ordinary to extraordinary',
        stages: ['Call to adventure', 'Crossing threshold', 'Tests and trials', 'Return with elixir']
      },
      relationships: {
        allies: ['Mentor figure', 'Best friend', 'Family member'],
        enemies: ['Main antagonist', 'Rival character'],
        mentors: ['Wise old guide', 'Former teacher'],
        loveInterests: ['Childhood friend', 'Mysterious stranger']
      },
      development: {
        currentStage: 1,
        totalStages: 4,
        growthAreas: ['Self-confidence', 'Leadership skills', 'Emotional intelligence'],
        achievements: ['Completed first quest', 'Gained new allies']
      }
    }
    
    setCharacters([...characters, newCharacter])
    setSelectedCharacter(newCharacter)
    toast.success('New character created!')
  }



  const deleteCharacter = (characterId: string) => {
    setCharacters(characters.filter(c => c.id !== characterId))
    if (selectedCharacter?.id === characterId) {
      setSelectedCharacter(null)
    }
    toast.success('Character deleted!')
  }

  const generateCharacterSuggestion = () => {
    const suggestions = [
      'A reluctant hero who discovers their destiny',
      'A mentor figure with a dark past',
      'A shapeshifter who can\'t be trusted',
      'A trickster who provides comic relief',
      'A shadow character representing the protagonist\'s fears'
    ]
    toast.success(`Suggestion: ${suggestions[Math.floor(Math.random() * suggestions.length)]}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Character Development
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create and develop rich, multi-dimensional characters with AI assistance
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={generateCharacterSuggestion}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              <Lightbulb className="w-4 h-4" />
              <span>Get Suggestion</span>
            </button>
            <button
              onClick={createCharacter}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Create Character</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Character List */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Characters ({characters.length})
              </h2>
              
              <div className="space-y-3">
                {characters.map((character) => (
                  <div
                    key={character.id}
                    onClick={() => setSelectedCharacter(character)}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedCharacter?.id === character.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {character.name}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteCharacter(character.id)
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        character.role === 'protagonist' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        character.role === 'antagonist' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        character.role === 'supporting' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                      }`}>
                        {character.role}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {character.archetype}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Character Details */}
          <div className="lg:col-span-3">
            {selectedCharacter ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                {/* Character Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedCharacter.name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedCharacter.archetype} • {selectedCharacter.role}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium">
                        <Save className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                      <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                      </button>
                    </div>
                  </div>

                  {/* Tab Navigation */}
                  <nav className="flex space-x-8">
                    {[
                      { id: 'overview', label: 'Overview', icon: Eye },
                      { id: 'personality', label: 'Personality', icon: Brain },
                      { id: 'background', label: 'Background', icon: BookOpen },
                      { id: 'goals', label: 'Goals', icon: Target },
                      { id: 'relationships', label: 'Relationships', icon: Users },
                      { id: 'arc', label: 'Character Arc', icon: TrendingUp },
                      { id: 'interaction', label: 'AI Interaction', icon: MessageCircle }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Stats</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Role</span>
                              <span className="font-medium text-gray-900 dark:text-white">{selectedCharacter.role}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Archetype</span>
                              <span className="font-medium text-gray-900 dark:text-white">{selectedCharacter.archetype}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Arc Type</span>
                              <span className="font-medium text-gray-900 dark:text-white">{selectedCharacter.arc.type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Development Stage</span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {selectedCharacter.development.currentStage}/{selectedCharacter.development.totalStages}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Key Traits</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedCharacter.personality.traits.map((trait, index) => (
                              <span key={index} className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                                {trait}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Primary Goal</h3>
                        <p className="text-gray-700 dark:text-gray-300">{selectedCharacter.goals.primary}</p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Main Conflict</h3>
                        <div className="space-y-2">
                          {selectedCharacter.conflicts.external.slice(0, 2).map((conflict, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <Zap className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300 text-sm">{conflict}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'personality' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Strengths</h3>
                          <div className="space-y-2">
                            {selectedCharacter.personality.strengths.map((strength, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Star className="w-4 h-4 text-green-500" />
                                <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Weaknesses</h3>
                          <div className="space-y-2">
                            {selectedCharacter.personality.weaknesses.map((weakness, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Shield className="w-4 h-4 text-red-500" />
                                <span className="text-gray-700 dark:text-gray-300">{weakness}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Fears</h3>
                          <div className="space-y-2">
                            {selectedCharacter.personality.fears.map((fear, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Sword className="w-4 h-4 text-orange-500" />
                                <span className="text-gray-700 dark:text-gray-300">{fear}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Desires</h3>
                          <div className="space-y-2">
                            {selectedCharacter.personality.desires.map((desire, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Heart className="w-4 h-4 text-pink-500" />
                                <span className="text-gray-700 dark:text-gray-300">{desire}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'background' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Origin</h3>
                          <p className="text-gray-700 dark:text-gray-300">{selectedCharacter.background.origin}</p>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Family</h3>
                          <p className="text-gray-700 dark:text-gray-300">{selectedCharacter.background.family}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Education</h3>
                          <p className="text-gray-700 dark:text-gray-300">{selectedCharacter.background.education}</p>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Occupation</h3>
                          <p className="text-gray-700 dark:text-gray-300">{selectedCharacter.background.occupation}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Significant Events</h3>
                        <div className="space-y-2">
                          {selectedCharacter.background.significantEvents.map((event, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700 dark:text-gray-300">{event}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'goals' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Primary Goal</h3>
                        <p className="text-gray-700 dark:text-gray-300">{selectedCharacter.goals.primary}</p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Secondary Goals</h3>
                        <div className="space-y-2">
                          {selectedCharacter.goals.secondary.map((goal, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Target className="w-4 h-4 text-blue-500" />
                              <span className="text-gray-700 dark:text-gray-300">{goal}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Internal Goal</h3>
                          <p className="text-gray-700 dark:text-gray-300">{selectedCharacter.goals.internal}</p>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">External Goal</h3>
                          <p className="text-gray-700 dark:text-gray-300">{selectedCharacter.goals.external}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'relationships' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Allies</h3>
                          <div className="space-y-2">
                            {selectedCharacter.relationships.allies.map((ally, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <UserCheck className="w-4 h-4 text-green-500" />
                                <span className="text-gray-700 dark:text-gray-300">{ally}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Enemies</h3>
                          <div className="space-y-2">
                            {selectedCharacter.relationships.enemies.map((enemy, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Sword className="w-4 h-4 text-red-500" />
                                <span className="text-gray-700 dark:text-gray-300">{enemy}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Mentors</h3>
                          <div className="space-y-2">
                            {selectedCharacter.relationships.mentors.map((mentor, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Crown className="w-4 h-4 text-yellow-500" />
                                <span className="text-gray-700 dark:text-gray-300">{mentor}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Love Interests</h3>
                          <div className="space-y-2">
                            {selectedCharacter.relationships.loveInterests.map((love, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Heart className="w-4 h-4 text-pink-500" />
                                <span className="text-gray-700 dark:text-gray-300">{love}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'arc' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Character Arc</h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">{selectedCharacter.arc.description}</p>
                        
                        <div className="space-y-3">
                          {selectedCharacter.arc.stages.map((stage, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                index < selectedCharacter.development.currentStage 
                                  ? 'bg-green-500' 
                                  : 'bg-gray-300 dark:bg-gray-600'
                              }`}>
                                {index + 1}
                              </div>
                              <span className="text-gray-700 dark:text-gray-300">{stage}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Growth Areas</h3>
                        <div className="space-y-2">
                          {selectedCharacter.development.growthAreas.map((area, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <TrendingUp className="w-4 h-4 text-blue-500" />
                              <span className="text-gray-700 dark:text-gray-300">{area}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Achievements</h3>
                        <div className="space-y-2">
                          {selectedCharacter.development.achievements.map((achievement, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-gray-700 dark:text-gray-300">{achievement}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'interaction' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          AI Character Interaction
                        </h3>
                        <button
                          onClick={() => setShowInteractionSystem(!showInteractionSystem)}
                          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                        >
                          <Settings className="w-4 h-4" />
                          <span>{showInteractionSystem ? 'Hide' : 'Show'} Interaction System</span>
                        </button>
                      </div>
                      
                      {showInteractionSystem ? (
                        <CharacterInteractionSystem
                          character={{
                            id: selectedCharacter.id,
                            name: selectedCharacter.name,
                            role: selectedCharacter.role,
                            archetype: selectedCharacter.archetype,
                            personality: {
                              traits: selectedCharacter.personality.traits,
                              strengths: selectedCharacter.personality.strengths,
                              weaknesses: selectedCharacter.personality.weaknesses,
                              fears: selectedCharacter.personality.fears,
                              desires: selectedCharacter.personality.desires
                            },
                            background: {
                              origin: selectedCharacter.background.origin,
                              family: selectedCharacter.background.family,
                              education: selectedCharacter.background.education,
                              occupation: selectedCharacter.background.occupation,
                              significantEvents: selectedCharacter.background.significantEvents,
                              childhood: '',
                              formativeExperiences: [],
                              culturalBackground: '',
                              socioeconomicStatus: ''
                            },
                            goals: {
                              primary: selectedCharacter.goals.primary,
                              secondary: selectedCharacter.goals.secondary,
                              internal: selectedCharacter.goals.internal,
                              external: selectedCharacter.goals.external,
                              shortTerm: [],
                              longTerm: []
                            },
                            conflicts: {
                              internal: selectedCharacter.conflicts.internal,
                              external: selectedCharacter.conflicts.external,
                              relationships: selectedCharacter.conflicts.relationships,
                              moralDilemmas: []
                            },
                            arc: {
                              type: selectedCharacter.arc.type,
                              description: selectedCharacter.arc.description,
                              stages: selectedCharacter.arc.stages,
                              currentStage: selectedCharacter.development.currentStage
                            },
                            relationships: {
                              allies: selectedCharacter.relationships.allies.map(ally => ({
                                name: ally,
                                relationship: 'ally',
                                description: 'Trusted companion'
                              })),
                              enemies: selectedCharacter.relationships.enemies.map(enemy => ({
                                name: enemy,
                                relationship: 'enemy',
                                description: 'Adversary'
                              })),
                              mentors: selectedCharacter.relationships.mentors.map(mentor => ({
                                name: mentor,
                                relationship: 'mentor',
                                description: 'Guide'
                              })),
                              loveInterests: selectedCharacter.relationships.loveInterests.map(interest => ({
                                name: interest,
                                relationship: 'love interest',
                                description: 'Romantic interest'
                              }))
                            },
                            development: {
                              currentStage: selectedCharacter.development.currentStage,
                              totalStages: selectedCharacter.development.totalStages,
                              growthAreas: selectedCharacter.development.growthAreas,
                              achievements: selectedCharacter.development.achievements,
                              developmentNotes: []
                            },
                            communication: {
                              speakingStyle: 'Natural and conversational',
                              vocabulary: 'Standard',
                              mannerisms: [],
                              emotionalExpression: 'Open',
                              communicationBarriers: []
                            },
                            psychology: {
                              defenseMechanisms: [],
                              copingStrategies: [],
                              triggers: [],
                              comfortZones: [],
                              growthPotential: []
                            },
                            storyContext: {
                              currentSituation: '',
                              immediateGoals: [],
                              obstacles: [],
                              resources: [],
                              timeline: ''
                            },
                            interactionHistory: [],
                            developmentPrompts: []
                          }}
                          onCharacterUpdate={(updatedCharacter) => {
                            // Handle character updates
                            console.log('Character updated:', updatedCharacter);
                          }}
                          storyContext={`${selectedCharacter.name} is a ${selectedCharacter.role} in the story, currently at stage ${selectedCharacter.development.currentStage} of their character arc.`}
                        />
                      ) : (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Character AI Interaction
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Chat with {selectedCharacter.name} to develop their personality, explore their background, and understand their motivations through AI-powered conversations.
                          </p>
                          <button
                            onClick={() => setShowInteractionSystem(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium"
                          >
                            Start Chat with {selectedCharacter.name}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Character Selected
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Select a character from the list or create a new one to get started
                </p>
                <button
                  onClick={createCharacter}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Your First Character</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 