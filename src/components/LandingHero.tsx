import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Play } from 'lucide-react';

export const LandingHero: React.FC = () => {
  try {
    const navigate = useNavigate();

    return (
      <section className="relative py-12 px-8 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-indigo-600/10 dark:from-blue-400/20 dark:via-purple-400/20 dark:to-indigo-400/20"></div>

        <div className="relative max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Document Tools
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Enhance.
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Understand.
            </span>
            <br />
            Create.
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            AI-powered document tools for creators, educators, and innovators.
            Transform your content with intelligent enhancement and analysis.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={() => navigate('/signup')}
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/demo')}
              className="inline-flex items-center px-8 py-4 bg-white/90 dark:bg-slate-800/90 text-gray-900 dark:text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 border border-gray-200 dark:border-slate-700"
            >
              <Play className="w-5 h-5 mr-2" />
              Try Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                10K+
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Documents Processed
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                99%
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Accuracy Rate
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                24/7
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                AI Processing
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('❌ Error in LandingHero component:', error);
    return (
      <div className="py-20 px-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          LandingHero Error
        </h1>
        <p className="text-red-500">
          Something went wrong loading the hero section
        </p>
        <pre className="text-sm text-red-400 bg-red-100 p-4 rounded mt-4">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
};
