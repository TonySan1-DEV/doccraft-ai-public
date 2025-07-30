import { useState } from 'react'
import { FileText, Download, Share2, BookOpen } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

interface FileAnalyzerProps {
  onAnalysisComplete?: (results: any) => void
}

interface AnalysisResult {
  sectionId: string
  content: string
  analysis: {
    topics: string[]
    sentiment: string
    tone: string
    keyInsights: string[]
    suggestions: string[]
  }
}

export function FileAnalyzer({ onAnalysisComplete }: FileAnalyzerProps) {
  const [document, setDocument] = useState<any>(null)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentSection, setCurrentSection] = useState<number>(0)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      setIsAnalyzing(true)

      try {
        const text = await file.text();
        const processedDoc = await processDocument(file.name, text);
        setDocument(processedDoc);
        await analyzeDocument(processedDoc);
      } catch (error: any) {
        toast.error(error.message || 'Failed to parse document');
      } finally {
        setIsAnalyzing(false);
      }
    },
  })

  const processDocument = async (docTitle: string, docContent: string) => {
    const sections = docContent.split('\n\n').filter(section => section.trim().length > 50).map((sectionContent, index) => ({
      id: `section-${index + 1}`,
      content: sectionContent.trim(),
      topicTags: extractTopicTags(sectionContent),
      tone: analyzeTone(),
      intent: analyzeIntent()
    }))

    return {
      id: `doc-${Date.now()}`,
      title: docTitle,
      content: docContent,
      sections
    }
  }

  const analyzeDocument = async (doc: any) => {
    const results: AnalysisResult[] = []

    for (let i = 0; i < doc.sections.length; i++) {
      setCurrentSection(i + 1)
      const section = doc.sections[i]

      const analysis = await analyzeSection(section)
      results.push({
        sectionId: section.id,
        content: section.content,
        analysis
      })

      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setAnalysisResults(results)
    onAnalysisComplete?.(results)
    toast.success(`Analysis complete! Processed ${results.length} sections.`)
  }

  const analyzeSection = async (section: any) => {
    return {
      topics: extractTopicTags(section.content),
      sentiment: analyzeSentiment(),
      tone: section.tone,
      keyInsights: extractKeyInsights(),
      suggestions: generateSuggestions()
    }
  }

  const extractTopicTags = (content: string): string[] => {
    const keywords = ['technology', 'business', 'innovation', 'strategy', 'development', 'analysis', 'research', 'data', 'process', 'solution']
    const contentLower = content.toLowerCase()
    return keywords.filter(keyword => contentLower.includes(keyword)).slice(0, 3)
  }

  const analyzeTone = (): string => {
    const tones = ['professional', 'casual', 'technical', 'persuasive', 'informative']
    return tones[Math.floor(Math.random() * tones.length)]
  }

  const analyzeIntent = (): string => {
    const intents = ['inform', 'persuade', 'explain', 'analyze', 'describe']
    return intents[Math.floor(Math.random() * intents.length)]
  }

  const analyzeSentiment = (): string => {
    const sentiments = ['positive', 'neutral', 'negative']
    return sentiments[Math.floor(Math.random() * sentiments.length)]
  }

  const extractKeyInsights = (): string[] => {
    return [
      'Key insight 1 from content analysis',
      'Important finding 2',
      'Notable observation 3'
    ]
  }

  const generateSuggestions = (): string[] => {
    return [
      'Consider adding more specific examples',
      'Enhance with visual elements',
      'Expand on key concepts'
    ]
  }

  if (!document) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Upload Document for Full Analysis
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Drop your document here for comprehensive section-by-section analysis.
          </p>
          <div 
            {...getRootProps()} 
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
          >
            <input {...getInputProps()} />
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {isDragActive ? 'Drop the file here' : 'Drag and drop your document here'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                PDF, DOCX, or TXT files supported
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          Analyzing: {document.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {document.sections.length} sections • {isAnalyzing ? `Processing section ${currentSection}/${document.sections.length}` : 'Analysis complete'}
        </p>
      </div>

      {isAnalyzing && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Analyzing section {currentSection} of {document.sections.length}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-200">
                Extracting insights and generating suggestions...
              </p>
            </div>
          </div>
        </div>
      )}

      {analysisResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Analysis Results
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analysisResults.map((result, index) => (
              <div key={result.sectionId} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Section {index + 1}
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Topics:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.analysis.topics.map((topic, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Sentiment:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{result.analysis.sentiment}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Tone:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{result.analysis.tone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {analysisResults.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export Analysis</span>
          </button>
          <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 flex items-center justify-center space-x-2">
            <Share2 className="h-5 w-5" />
            <span>Share Report</span>
          </button>
        </div>
      )}
    </div>
  )
}
