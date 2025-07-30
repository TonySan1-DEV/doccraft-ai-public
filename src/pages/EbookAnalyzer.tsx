import { useState, useRef } from 'react'

import { 
  BookOpen, 
  TrendingUp, 
  Users, 
  Target, 
  BarChart3, 
  Lightbulb, 
  Upload,

  Play,
  Pause,
  RotateCcw,
  Eye,
  Plus,
  Search,
  Star,
  Share2,
  Edit3,
  MessageSquare
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface EbookAnalysis {
  id: string
  title: string
  genre: string
  marketTrend: number
  readabilityScore: number
  engagementScore: number
  targetAudience: string[]
  keyThemes: string[]
  competitiveAnalysis: {
    similarBooks: string[]
    marketGap: string[]
    pricingStrategy: string
  }
  recommendations: string[]
  status: 'analyzing' | 'completed' | 'error'
}

interface CharacterProfile {
  id: string
  name: string
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor'
  personality: string[]
  goals: string[]
  conflicts: string[]
  arc: string
  relationships: string[]
}

export default function EbookAnalyzer() {

  const [activeTab, setActiveTab] = useState<'analyzer' | 'creator' | 'characters' | 'market'>('analyzer')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState<EbookAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [characters, setCharacters] = useState<CharacterProfile[]>([])
  const [marketData, setMarketData] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      toast.success(`File uploaded: ${file.name}`)
    }
  }

  const analyzeEbook = async () => {
    if (!uploadedFile) {
      toast.error('Please upload an ebook file first')
      return
    }

    setIsAnalyzing(true)
    
    // Simulate analysis process
    setTimeout(() => {
      const mockAnalysis: EbookAnalysis = {
        id: '1',
        title: uploadedFile.name.replace(/\.[^/.]+$/, ''),
        genre: 'Fiction',
        marketTrend: 85,
        readabilityScore: 78,
        engagementScore: 92,
        targetAudience: ['Young Adults', 'Fiction Readers', 'Adventure Enthusiasts'],
        keyThemes: ['Coming of Age', 'Adventure', 'Friendship', 'Self-Discovery'],
        competitiveAnalysis: {
          similarBooks: ['The Hunger Games', 'Divergent', 'Maze Runner'],
          marketGap: ['Strong female protagonist', 'Unique world-building', 'Emotional depth'],
          pricingStrategy: 'Competitive pricing at $9.99'
        },
        recommendations: [
          'Strengthen character development in chapters 3-5',
          'Add more dialogue to increase engagement',
          'Consider expanding the world-building elements',
          'Include more sensory details for immersive reading'
        ],
        status: 'completed'
      }
      
      setAnalysis(mockAnalysis)
      setIsAnalyzing(false)
      toast.success('Ebook analysis completed!')
    }, 3000)
  }

  const createCharacter = () => {
    const newCharacter: CharacterProfile = {
      id: Date.now().toString(),
      name: 'New Character',
      role: 'protagonist',
      personality: ['Brave', 'Curious', 'Determined'],
      goals: ['Find the lost artifact', 'Protect their family'],
      conflicts: ['Internal struggle with fear', 'External threat from antagonist'],
      arc: 'Hero\'s journey from ordinary to extraordinary',
      relationships: ['Mentor figure', 'Love interest', 'Rival']
    }
    
    setCharacters([...characters, newCharacter])
    toast.success('New character created!')
  }

  const analyzeMarket = async () => {
    // Simulate market analysis
    setTimeout(() => {
      setMarketData({
        trendingGenres: ['Romance', 'Thriller', 'Fantasy'],
        popularKeywords: ['enemies to lovers', 'slow burn', 'found family'],
        readerDemographics: {
          ageGroups: { '18-25': 35, '26-35': 28, '36-45': 22, '46+': 15 },
          preferences: ['Fast-paced plots', 'Strong character development', 'Happy endings']
        },
        pricingTrends: {
          averagePrice: 12.99,
          priceRange: { min: 0.99, max: 24.99 }
        }
      })
      toast.success('Market analysis completed!')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Ebook Analysis & Creation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Analyze existing ebooks, create compelling content, and develop rich characters with AI assistance
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'analyzer', label: 'Ebook Analyzer', icon: BookOpen },
              { id: 'creator', label: 'Content Creator', icon: Edit3 },
              { id: 'characters', label: 'Character Development', icon: Users },
              { id: 'market', label: 'Market Analysis', icon: TrendingUp }
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
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          {activeTab === 'analyzer' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Ebook Analysis
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Upload your ebook and get comprehensive analysis including market trends, readability, and improvement suggestions
                </p>
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Drag and drop your ebook file here, or click to browse
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.epub,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Choose File
                </button>
                {uploadedFile && (
                  <p className="mt-4 text-sm text-green-600 dark:text-green-400">
                    ✓ {uploadedFile.name}
                  </p>
                )}
              </div>

              {/* Analysis Controls */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={analyzeEbook}
                  disabled={!uploadedFile || isAnalyzing}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium"
                >
                  {isAnalyzing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  <span>{isAnalyzing ? 'Analyzing...' : 'Start Analysis'}</span>
                </button>
                <button
                  onClick={() => {
                    setUploadedFile(null)
                    setAnalysis(null)
                  }}
                  className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Analysis Results */}
              {analysis && (
                <div className="mt-8 space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Analysis Results
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="font-semibold text-blue-900 dark:text-blue-100">Market Trend</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {analysis.marketTrend}%
                      </div>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="font-semibold text-green-900 dark:text-green-100">Readability</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {analysis.readabilityScore}%
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <span className="font-semibold text-purple-900 dark:text-purple-100">Engagement</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {analysis.engagementScore}%
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        <span className="font-semibold text-orange-900 dark:text-orange-100">Target Audience</span>
                      </div>
                      <div className="text-sm text-orange-700 dark:text-orange-300">
                        {analysis.targetAudience.join(', ')}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Analysis */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Key Themes</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.keyThemes.map((theme, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                          >
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Recommendations</h4>
                      <ul className="space-y-2">
                        {analysis.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'creator' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Content Creator
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Create compelling ebook content with AI assistance
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Plot Development</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Generate Plot Outline</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Create a detailed plot structure</div>
                        </div>
                      </div>
                    </button>
                    
                    <button className="w-full text-left p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Edit3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Scene Builder</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Create engaging scenes</div>
                        </div>
                      </div>
                    </button>
                    
                    <button className="w-full text-left p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                      <div className="flex items-center space-x-3">
                        <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Dialogue Generator</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Generate natural dialogue</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Content Enhancement</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Search className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Style Analysis</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Analyze writing style</div>
                        </div>
                      </div>
                    </button>
                    
                    <button className="w-full text-left p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Star className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Quality Check</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Improve content quality</div>
                        </div>
                      </div>
                    </button>
                    
                    <button className="w-full text-left p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Share2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Publishing Prep</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Prepare for publication</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'characters' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Character Development
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Create and develop rich, multi-dimensional characters
                  </p>
                </div>
                <button
                  onClick={createCharacter}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Character</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {characters.map((character) => (
                  <div key={character.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{character.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        character.role === 'protagonist' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        character.role === 'antagonist' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                        {character.role}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">Personality</h4>
                        <div className="flex flex-wrap gap-1">
                          {character.personality.map((trait, index) => (
                            <span key={index} className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">Goals</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {character.goals.map((goal, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span>{goal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">Character Arc</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{character.arc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'market' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Market Analysis
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Analyze market trends and reader preferences
                  </p>
                </div>
                <button
                  onClick={analyzeMarket}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analyze Market</span>
                </button>
              </div>

              {marketData && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Trending Genres</h3>
                      <div className="space-y-2">
                        {marketData.trendingGenres.map((genre: string, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-gray-700 dark:text-gray-300">{genre}</span>
                            <div className="w-20 bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${85 - index * 15}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Popular Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                        {marketData.popularKeywords.map((keyword: string, index: number) => (
                          <span key={index} className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Pricing Trends</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-700 dark:text-gray-300">Average Price</span>
                          <span className="font-semibold text-purple-600 dark:text-purple-400">
                            ${marketData.pricingTrends.averagePrice}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700 dark:text-gray-300">Price Range</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            ${marketData.pricingTrends.priceRange.min} - ${marketData.pricingTrends.priceRange.max}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Reader Demographics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Age Groups</h4>
                        <div className="space-y-2">
                          {Object.entries(marketData.readerDemographics.ageGroups).map(([age, percentage]) => (
                            <div key={age} className="flex items-center justify-between">
                              <span className="text-gray-700 dark:text-gray-300">{age}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{String(percentage)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Preferences</h4>
                        <div className="space-y-2">
                          {marketData.readerDemographics.preferences.map((pref: string, index: number) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-gray-700 dark:text-gray-300 text-sm">{pref}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 