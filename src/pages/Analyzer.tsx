import { useMCP } from '../useMCP'
import { AccessWarning } from '../components/AccessWarning'
import { SectionAnalyzer } from '../components/SectionAnalyzer'

export default function Analyzer() {
  const ctx = useMCP("Analyzer.tsx")
  
  if (ctx.tier === "Free") {
    return <AccessWarning tier="Pro" feature="Document Analyzer" />
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📘 Document Analyzer
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Analyze text content to extract structure, themes, tone, and enhancement suggestions.
        </p>
      </div>

      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6 shadow-lg">
        <SectionAnalyzer />
      </div>
    </div>
  )
} 