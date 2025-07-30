import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FileText, 
  Sparkles, 
  Brain, 
  Users, 
  ArrowRight, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle,
  BarChart3,
  BookOpen,
  Settings,
  Palette
} from 'lucide-react'

interface DemoStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  duration: number
  status: 'pending' | 'active' | 'completed' | 'error'
}

export default function Demo() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showResults, setShowResults] = useState(false)

  const demoSteps: DemoStep[] = [
    {
      id: 'document-upload',
      title: 'Document Upload & Analysis',
      description: 'Upload your document and watch AI analyze its structure, tone, and content',
      icon: <FileText className="w-6 h-6" />,
      duration: 3000,
      status: 'pending'
    },
    {
      id: 'ai-enhancement',
      title: 'AI-Powered Enhancement',
      description: 'See how AI improves your content with intelligent suggestions and corrections',
      icon: <Sparkles className="w-6 h-6" />,
      duration: 4000,
      status: 'pending'
    },
    {
      id: 'ebook-analysis',
      title: 'Ebook Analysis & Creation',
      description: 'Analyze existing ebooks and create compelling new content with AI assistance',
      icon: <BookOpen className="w-6 h-6" />,
      duration: 3500,
      status: 'pending'
    },
    {
      id: 'character-development',
      title: 'Character Development',
      description: 'Create rich, multi-dimensional characters with AI-powered personality development',
      icon: <Users className="w-6 h-6" />,
      duration: 3000,
      status: 'pending'
    },
    {
      id: 'collaboration',
      title: 'Real-Time Collaboration',
      description: 'Experience seamless collaboration with team members in real-time',
      icon: <Users className="w-6 h-6" />,
      duration: 3500,
      status: 'pending'
    },
    {
      id: 'analytics',
      title: 'Advanced Analytics',
      description: 'View detailed insights about your content performance and engagement',
      icon: <BarChart3 className="w-6 h-6" />,
      duration: 3000,
      status: 'pending'
    },
    {
      id: 'personalization',
      title: 'Personalized Experience',
      description: 'Discover how AI adapts to your writing style and preferences',
      icon: <Brain className="w-6 h-6" />,
      duration: 2500,
      status: 'pending'
    }
  ]

  useEffect(() => {
    if (isPlaying && currentStep < demoSteps.length) {
      const timer = setTimeout(() => {
        if (currentStep < demoSteps.length - 1) {
          setCurrentStep(prev => prev + 1)
        } else {
          setIsPlaying(false)
          setShowResults(true)
        }
      }, demoSteps[currentStep].duration)

      return () => clearTimeout(timer)
    }
  }, [isPlaying, currentStep, demoSteps])

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress(() => {
          const stepProgress = (Date.now() % demoSteps[currentStep].duration) / demoSteps[currentStep].duration
          return (currentStep + stepProgress) / demoSteps.length * 100
        })
      }, 100)

      return () => clearInterval(interval)
    }
  }, [isPlaying, currentStep, demoSteps])

  const handlePlay = () => {
    setIsPlaying(true)
    setCurrentStep(0)
    setProgress(0)
    setShowResults(false)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleRestart = () => {
    setIsPlaying(false)
    setCurrentStep(0)
    setProgress(0)
    setShowResults(false)
  }

  const getStepStatus = (index: number) => {
    if (index < currentStep) return 'completed'
    if (index === currentStep) return 'active'
    return 'pending'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                ← Back to Home
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                DocCraft-AI Demo
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePlay}
                disabled={isPlaying}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Demo
              </button>
              <button
                onClick={handlePause}
                disabled={!isPlaying}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </button>
              <button
                onClick={handleRestart}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Demo Progress
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Demo Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Demo Area */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              {!showResults ? (
                <div className="text-center">
                  {currentStep < demoSteps.length && (
                    <div className="space-y-6">
                      <div className="flex justify-center">
                        <div className={`p-4 rounded-full ${
                          getStepStatus(currentStep) === 'active' 
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {demoSteps[currentStep].icon}
                        </div>
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {demoSteps[currentStep].title}
                      </h2>
                      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        {demoSteps[currentStep].description}
                      </p>
                      
                      {/* Animated Demo Content */}
                      <div className="mt-8">
                        {currentStep === 0 && <DocumentUploadDemo />}
                        {currentStep === 1 && <AIEnhancementDemo />}
                        {currentStep === 2 && <EbookAnalysisDemo />}
                        {currentStep === 3 && <CharacterDevelopmentDemo />}
                        {currentStep === 4 && <CollaborationDemo />}
                        {currentStep === 5 && <AnalyticsDemo />}
                        {currentStep === 6 && <PersonalizationDemo />}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <DemoResults />
              )}
            </div>
          </div>

          {/* Steps Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Demo Steps
              </h3>
              <div className="space-y-4">
                {demoSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                      getStepStatus(index) === 'completed'
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : getStepStatus(index) === 'active'
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className={`flex-shrink-0 ${
                      getStepStatus(index) === 'completed'
                        ? 'text-green-600 dark:text-green-400'
                        : getStepStatus(index) === 'active'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {getStepStatus(index) === 'completed' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        getStepStatus(index) === 'completed'
                          ? 'text-green-800 dark:text-green-200'
                          : getStepStatus(index) === 'active'
                          ? 'text-blue-800 dark:text-blue-200'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {step.title}
                      </p>
                      <p className={`text-xs ${
                        getStepStatus(index) === 'completed'
                          ? 'text-green-600 dark:text-green-400'
                          : getStepStatus(index) === 'active'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Experience the full power of DocCraft-AI with your own documents. 
              Sign up now and start transforming your content creation workflow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 border border-gray-200 dark:border-gray-600"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Demo Components
const DocumentUploadDemo = () => (
  <div className="space-y-4">
    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
      <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
      <p className="text-gray-600 dark:text-gray-400">Drag and drop your document here</p>
    </div>
    <div className="flex justify-center">
      <div className="animate-pulse bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4">
        <p className="text-blue-800 dark:text-blue-200 text-sm">Analyzing document structure...</p>
      </div>
    </div>
  </div>
)

const AIEnhancementDemo = () => (
  <div className="space-y-4">
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <p className="text-gray-700 dark:text-gray-300 text-sm">
        "The quick brown fox jumps over the lazy dog."
      </p>
    </div>
    <div className="flex justify-center">
      <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
    </div>
    <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
      <p className="text-green-800 dark:text-green-200 text-sm">
        "The swift brown fox leaps gracefully over the slumbering canine."
      </p>
    </div>
  </div>
)

const EbookAnalysisDemo = () => (
  <div className="space-y-4">
    <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
      <p className="text-purple-800 dark:text-purple-200 text-sm">
        "This ebook has a strong narrative arc and engaging characters. 
        The plot twists are well-executed and the pacing is perfect."
      </p>
    </div>
    <div className="flex justify-center">
      <BookOpen className="w-8 h-8 text-purple-500 animate-pulse" />
    </div>
    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
      <p className="text-blue-800 dark:text-blue-200 text-sm">
        "The analysis reveals a clear structure, excellent pacing, and a compelling plot. 
        The character development is particularly strong."
      </p>
    </div>
  </div>
)

const CharacterDevelopmentDemo = () => (
  <div className="space-y-4">
    <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4">
      <p className="text-indigo-800 dark:text-indigo-200 text-sm">
        "The protagonist is a complex, multi-dimensional character with a clear backstory 
        and a well-defined personality. The antagonist is equally compelling."
      </p>
    </div>
    <div className="flex justify-center">
      <Users className="w-8 h-8 text-indigo-500 animate-pulse" />
    </div>
    <div className="bg-pink-50 dark:bg-pink-900/30 rounded-lg p-4">
      <p className="text-pink-800 dark:text-pink-200 text-sm">
        "The AI has successfully developed a character that resonates with readers, 
        capturing their attention and making them care about their journey."
      </p>
    </div>
  </div>
)

const CollaborationDemo = () => (
  <div className="space-y-4">
    <div className="flex items-center space-x-4">
      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
        <span className="text-white text-xs font-bold">A</span>
      </div>
      <div className="flex-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
        <p className="text-blue-800 dark:text-blue-200 text-sm">Great suggestion!</p>
      </div>
    </div>
    <div className="flex items-center space-x-4 justify-end">
      <div className="flex-1 bg-green-50 dark:bg-green-900/30 rounded-lg p-3 text-right">
        <p className="text-green-800 dark:text-green-200 text-sm">Thanks! I'll implement that.</p>
      </div>
      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
        <span className="text-white text-xs font-bold">B</span>
      </div>
    </div>
  </div>
)

const AnalyticsDemo = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">95%</div>
        <div className="text-xs text-gray-600 dark:text-gray-400">Readability</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">8.5</div>
        <div className="text-xs text-gray-600 dark:text-gray-400">Engagement</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">12</div>
        <div className="text-xs text-gray-600 dark:text-gray-400">Suggestions</div>
      </div>
    </div>
    <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-end justify-around p-2">
      <div className="w-4 bg-blue-500 rounded-t" style={{ height: '60%' }}></div>
      <div className="w-4 bg-green-500 rounded-t" style={{ height: '80%' }}></div>
      <div className="w-4 bg-purple-500 rounded-t" style={{ height: '40%' }}></div>
      <div className="w-4 bg-yellow-500 rounded-t" style={{ height: '90%' }}></div>
    </div>
  </div>
)

const PersonalizationDemo = () => (
  <div className="space-y-4">
    <div className="flex items-center space-x-4">
      <Settings className="w-5 h-5 text-gray-400" />
      <span className="text-gray-700 dark:text-gray-300 text-sm">Writing Style: Professional</span>
    </div>
    <div className="flex items-center space-x-4">
      <Palette className="w-5 h-5 text-gray-400" />
      <span className="text-gray-700 dark:text-gray-300 text-sm">Tone: Formal</span>
    </div>
    <div className="flex items-center space-x-4">
      <Brain className="w-5 h-5 text-gray-400" />
      <span className="text-gray-700 dark:text-gray-300 text-sm">AI Learning: Active</span>
    </div>
    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
      <p className="text-blue-800 dark:text-blue-200 text-sm">
        AI has learned your preferences and will suggest content that matches your style.
      </p>
    </div>
  </div>
)

const DemoResults = () => (
  <div className="text-center space-y-6">
    <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
      Demo Complete!
    </h3>
    <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
      You've seen how DocCraft-AI can transform your content creation workflow. 
      Ready to experience it with your own documents?
    </p>
    <div className="flex justify-center space-x-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">7</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Features Demonstrated</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">100%</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">AI Powered</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">24/7</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Available</div>
      </div>
    </div>
  </div>
) 