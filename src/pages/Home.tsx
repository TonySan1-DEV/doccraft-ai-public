import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LandingHero } from '../components/LandingHero';
import { Footer } from '../components/Footer';
import Header from '../components/Header';
import { useState, useEffect } from 'react';
import {
  Check,
  User,
  Users,
  Bot,
  Zap,
  Brain,
  Target,
  Crown,
  Star,
  ArrowRight,
  Play,
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden flex flex-col">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Enhanced grid pattern with multiple layers */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.4) 1px, transparent 0)`,
              backgroundSize: '40px 40px',
              animation: 'gridMove 20s linear infinite',
            }}
          ></div>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.3) 1px, transparent 0)`,
              backgroundSize: '60px 60px',
              animation: 'gridMove 25s linear infinite reverse',
            }}
          ></div>
        </div>

        {/* Enhanced digital rain effect with multiple streams */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-1/6 top-0 w-px h-full bg-gradient-to-b from-transparent via-blue-400 to-transparent animate-digitalRain1"></div>
          <div className="absolute left-1/3 top-0 w-px h-full bg-gradient-to-b from-transparent via-indigo-400 to-transparent animate-digitalRain2"></div>
          <div className="absolute left-1/2 top-0 w-px h-full bg-gradient-to-b from-transparent via-purple-400 to-transparent animate-digitalRain3"></div>
          <div
            className="absolute left-2/3 top-0 w-px h-full bg-gradient-to-b from-transparent via-blue-500 to-transparent animate-digitalRain1"
            style={{ animationDelay: '1s' }}
          ></div>
          <div
            className="absolute left-5/6 top-0 w-px h-full bg-gradient-to-b from-transparent via-indigo-500 to-transparent animate-digitalRain2"
            style={{ animationDelay: '2s' }}
          ></div>
        </div>

        {/* Enhanced light beam effects with multiple directions */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-lightBeam1"></div>
          <div
            className="absolute top-1/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-lightBeam1"
            style={{ animationDelay: '2s' }}
          ></div>
          <div
            className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-lightBeam1"
            style={{ animationDelay: '4s' }}
          ></div>
          <div
            className="absolute top-3/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-lightBeam1"
            style={{ animationDelay: '6s' }}
          ></div>

          {/* Vertical beams */}
          <div
            className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-transparent via-blue-400 to-transparent animate-lightBeam1"
            style={{ animationDelay: '1s' }}
          ></div>
          <div
            className="absolute top-0 left-1/4 h-full w-1 bg-gradient-to-b from-transparent via-indigo-400 to-transparent animate-lightBeam1"
            style={{ animationDelay: '3s' }}
          ></div>
          <div
            className="absolute top-0 left-1/2 h-full w-1 bg-gradient-to-b from-transparent via-purple-400 to-transparent animate-lightBeam1"
            style={{ animationDelay: '5s' }}
          ></div>
          <div
            className="absolute top-0 left-3/4 h-full w-1 bg-gradient-to-b from-transparent via-blue-500 to-transparent animate-lightBeam1"
            style={{ animationDelay: '7s' }}
          ></div>
        </div>

        {/* Enhanced neural network nodes with more complexity */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-blue-400 rounded-full animate-neuralPulse"
              style={{
                left: `${15 + i * 6}%`,
                top: `${20 + i * 5}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${2 + (i % 3)}s`,
              }}
            ></div>
          ))}
          {[...Array(8)].map((_, i) => (
            <div
              key={`secondary-${i}`}
              className="absolute w-2 h-2 bg-indigo-400 rounded-full animate-neuralPulse"
              style={{
                left: `${25 + i * 8}%`,
                top: `${40 + i * 7}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${1.5 + (i % 2)}s`,
              }}
            ></div>
          ))}
        </div>

        {/* Additional floating elements */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={`float-${i}`}
              className="absolute w-4 h-4 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-60 animate-float"
              style={{
                left: `${10 + i * 15}%`,
                top: `${60 + i * 6}%`,
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${3 + (i % 2)}s`,
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Header */}
      <Header />

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Hero Section */}
        <LandingHero />

        {/* Features Section */}
        <section className="features-section py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="features-title text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Powerful AI Tools for Writers
              </h2>
              <p className="features-subtitle text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Transform your writing process with cutting-edge AI technology
                designed specifically for authors, content creators, and
                storytellers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Document Processing */}
              <div className="feature-card feature-card-blue group">
                <div className="feature-card-icon">
                  <Bot className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="feature-card-title text-gray-900 dark:text-white">
                  AI Document Processing
                </h3>
                <p className="feature-card-description">
                  Intelligent document analysis, enhancement, and optimization
                  powered by advanced AI algorithms.
                </p>
                <ul className="feature-card-list">
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <Check className="feature-card-check" />
                    Smart content analysis
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <Check className="feature-card-check" />
                    Style optimization
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <Check className="feature-card-check" />
                    Grammar enhancement
                  </li>
                </ul>
              </div>

              {/* Character Development */}
              <div className="feature-card feature-card-green group">
                <div className="feature-card-icon">
                  <User className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="feature-card-title text-gray-900 dark:text-white">
                  Character Development
                </h3>
                <p className="feature-card-description">
                  Create compelling, multi-dimensional characters with
                  AI-assisted personality development and arc planning.
                </p>
                <ul className="feature-card-list">
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <Check className="feature-card-check" />
                    Personality profiling
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <Check className="feature-card-check" />
                    Character arc planning
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <Check className="feature-card-check" />
                    Relationship mapping
                  </li>
                </ul>
              </div>

              {/* Plot Structure */}
              <div className="feature-card feature-card-purple group">
                <div className="feature-card-icon">
                  <Target className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="feature-card-title text-gray-900 dark:text-white">
                  Plot Structure
                </h3>
                <p className="feature-card-description">
                  Build engaging story structures with AI-powered plot analysis
                  and narrative optimization tools.
                </p>
                <ul className="feature-card-list">
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <Check className="feature-card-check" />
                    Story arc analysis
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <Check className="feature-card-check" />
                    Pacing optimization
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <Check className="feature-card-check" />
                    Conflict resolution
                  </li>
                </ul>
              </div>

              {/* Style Analysis */}
              <div className="feature-card feature-card-yellow group">
                <div className="feature-card-icon">
                  <Brain className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="feature-card-title text-gray-900 dark:text-white">
                  Style Analysis
                </h3>
                <p className="feature-card-description">
                  Analyze and enhance your writing style with AI-powered
                  insights and personalized recommendations.
                </p>
                <ul className="feature-card-list">
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <Check className="feature-card-check" />
                    Style consistency
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <Check className="feature-card-check" />
                    Tone analysis
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <Check className="feature-card-check" />
                    Voice optimization
                  </li>
                </ul>
              </div>

              {/* Collaboration Tools */}
              <div className="feature-card feature-card-red group">
                <div className="feature-card-icon">
                  <Users className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="feature-card-title text-gray-900 dark:text-white">
                  Collaboration Tools
                </h3>
                <p className="feature-card-description">
                  Work seamlessly with teams using real-time collaboration
                  features and AI-assisted feedback systems.
                </p>
                <ul className="feature-card-list">
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <Check className="feature-card-check" />
                    Real-time editing
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <Check className="feature-card-check" />
                    AI feedback system
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <Check className="feature-card-check" />
                    Version control
                  </li>
                </ul>
              </div>

              {/* Performance Analytics */}
              <div className="feature-card feature-card-indigo group">
                <div className="feature-card-icon">
                  <Zap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="feature-card-title text-gray-900 dark:text-white">
                  Performance Analytics
                </h3>
                <p className="feature-card-description">
                  Track your writing progress and performance with detailed
                  analytics and AI-powered insights.
                </p>
                <ul className="feature-card-list">
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <Check className="feature-card-check" />
                    Progress tracking
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <Check className="feature-card-check" />
                    Performance metrics
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <Check className="feature-card-check" />
                    Improvement suggestions
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section py-20 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-indigo-700/90"></div>
          <div className="absolute inset-0 opacity-30">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20px 20px, rgba(255, 255, 255, 0.1) 2px, transparent 2px)',
                backgroundSize: '40px 40px',
              }}
            ></div>
          </div>

          <div className="relative max-w-4xl mx-auto text-center z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-pulse">
              Ready to Transform Your Writing?
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join thousands of writers who have already revolutionized their
              creative process with DocCraft AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard"
                className="group cta-button-primary inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
              >
                <span className="mr-2">Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link
                to="/demo"
                className="group cta-button-secondary inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-300 text-lg backdrop-blur-sm hover:backdrop-blur-none"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                <span>Watch Demo</span>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
