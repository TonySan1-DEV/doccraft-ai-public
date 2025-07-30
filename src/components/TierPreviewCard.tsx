import React from 'react'
import { ArrowRight, Check } from 'lucide-react'

interface TierPreviewCardProps {
  icon: string
  title: string
  features: string[]
  ctaLabel: string
  onClick: () => void
}

export const TierPreviewCard: React.FC<TierPreviewCardProps> = ({
  icon,
  title,
  features,
  ctaLabel,
  onClick
}) => {
  return (
    <div className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg hover:shadow-xl border border-white/20 dark:border-slate-700/20 transition-all duration-300 hover:-translate-y-1">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative">
        {/* Icon and Title */}
        <div className="flex items-center mb-6">
          <div className="text-4xl mr-4">{icon}</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">
                {feature}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={onClick}
          className="group/btn w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
        >
          {ctaLabel}
          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
} 