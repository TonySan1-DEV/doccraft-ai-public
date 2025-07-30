import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LandingHero } from '../components/LandingHero'
import { Footer } from '../components/Footer'

export default function Home() {
  console.log('🏠 Home component loading...')
  
  try {
    const { user } = useAuth()
    console.log('🏠 User from auth context:', user)

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden flex flex-col">
        {/* AI Texture Overlay */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(244, 114, 182, 0.1) 0%, transparent 50%)
            `
          }}></div>
        </div>
        {/* AI Background Overlay */}
        <div className="absolute inset-0">
          {/* Enhanced Animated Grid Pattern */}
          <div className="absolute inset-0 opacity-15 dark:opacity-25">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px),
                linear-gradient(90deg, rgba(99, 102, 241, 0.15) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              animation: 'gridMove 20s linear infinite'
            }}></div>
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
              animation: 'gridMove 30s linear infinite reverse'
            }}></div>
          </div>
          
          {/* Enhanced Floating AI Particles */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0s'}}></div>
            <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-2/3 left-1/2 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '3s'}}></div>
            <div className="absolute top-3/4 left-1/3 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '4s'}}></div>
            <div className="absolute top-1/6 right-1/6 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '5s'}}></div>
            <div className="absolute top-5/6 left-1/6 w-1 h-1 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '6s'}}></div>
            <div className="absolute top-1/8 right-1/3 w-2 h-2 bg-teal-400 rounded-full animate-pulse" style={{animationDelay: '7s'}}></div>
          </div>
          
          {/* AI Data Streams */}
          <div className="absolute inset-0 opacity-30 dark:opacity-40">
            <div className="absolute top-0 left-1/6 w-px h-full bg-gradient-to-b from-transparent via-blue-400 to-transparent animate-digitalRain1"></div>
            <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-purple-400 to-transparent animate-digitalRain2"></div>
            <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-pink-400 to-transparent animate-digitalRain3"></div>
            <div className="absolute top-0 right-1/6 w-px h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-digitalRain1" style={{animationDelay: '1s'}}></div>
          </div>
          
          {/* Enhanced Moving Light Beams */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-40 animate-lightBeam1"></div>
            <div className="absolute top-1/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-30 animate-lightBeam2"></div>
            <div className="absolute top-2/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent opacity-35 animate-lightBeam3"></div>
            <div className="absolute top-1/6 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-25 animate-lightBeam1" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-5/6 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-20 animate-lightBeam2" style={{animationDelay: '3s'}}></div>
          </div>
          
          {/* AI Circuit Patterns */}
          <div className="absolute inset-0 opacity-20 dark:opacity-30">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4"/>
                  <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#F472B6" stopOpacity="0.4"/>
                </linearGradient>
              </defs>
              <g className="animate-neuralPulse">
                <path d="M10,20 L30,20 L30,40 L50,40 L50,60 L70,60 L70,80 L90,80" stroke="url(#circuitGradient)" strokeWidth="0.2" fill="none"/>
                <path d="M20,10 L40,10 L40,30 L60,30 L60,50 L80,50" stroke="url(#circuitGradient)" strokeWidth="0.2" fill="none"/>
                <circle cx="30" cy="20" r="0.8" fill="url(#circuitGradient)"/>
                <circle cx="50" cy="40" r="0.8" fill="url(#circuitGradient)"/>
                <circle cx="70" cy="60" r="0.8" fill="url(#circuitGradient)"/>
                <circle cx="40" cy="10" r="0.8" fill="url(#circuitGradient)"/>
                <circle cx="60" cy="30" r="0.8" fill="url(#circuitGradient)"/>
                <circle cx="80" cy="50" r="0.8" fill="url(#circuitGradient)"/>
              </g>
            </svg>
          </div>
          
          {/* Enhanced Neural Network Connections */}
          <div className="absolute inset-0 opacity-8 dark:opacity-15">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4"/>
                  <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#F472B6" stopOpacity="0.4"/>
                </linearGradient>
              </defs>
              <g className="animate-neuralPulse">
                <circle cx="20" cy="30" r="0.8" fill="url(#neuralGradient)"/>
                <circle cx="80" cy="40" r="0.8" fill="url(#neuralGradient)"/>
                <circle cx="40" cy="70" r="0.8" fill="url(#neuralGradient)"/>
                <circle cx="60" cy="20" r="0.8" fill="url(#neuralGradient)"/>
                <circle cx="10" cy="60" r="0.8" fill="url(#neuralGradient)"/>
                <circle cx="90" cy="80" r="0.8" fill="url(#neuralGradient)"/>
                <circle cx="30" cy="50" r="0.6" fill="url(#neuralGradient)"/>
                <circle cx="70" cy="30" r="0.6" fill="url(#neuralGradient)"/>
                <line x1="20" y1="30" x2="80" y2="40" stroke="url(#neuralGradient)" strokeWidth="0.15"/>
                <line x1="80" y1="40" x2="40" y2="70" stroke="url(#neuralGradient)" strokeWidth="0.15"/>
                <line x1="40" y1="70" x2="60" y2="20" stroke="url(#neuralGradient)" strokeWidth="0.15"/>
                <line x1="60" y1="20" x2="10" y2="60" stroke="url(#neuralGradient)" strokeWidth="0.15"/>
                <line x1="10" y1="60" x2="90" y2="80" stroke="url(#neuralGradient)" strokeWidth="0.15"/>
                <line x1="30" y1="50" x2="70" y2="30" stroke="url(#neuralGradient)" strokeWidth="0.15"/>
                <line x1="20" y1="30" x2="30" y2="50" stroke="url(#neuralGradient)" strokeWidth="0.15"/>
                <line x1="80" y1="40" x2="70" y2="30" stroke="url(#neuralGradient)" strokeWidth="0.15"/>
              </g>
            </svg>
          </div>
          
          {/* Enhanced Rotating Data Rings */}
          <div className="absolute inset-0 opacity-20 dark:opacity-30">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-blue-400/40 rounded-full animate-spin-slow"></div>
            <div className="absolute top-1/2 right-1/4 w-24 h-24 border border-purple-400/40 rounded-full animate-spin-reverse"></div>
            <div className="absolute bottom-1/4 left-1/3 w-20 h-20 border border-pink-400/40 rounded-full animate-spin-slow"></div>
            <div className="absolute top-1/3 left-1/6 w-16 h-16 border border-cyan-400/35 rounded-full animate-spin-reverse"></div>
            <div className="absolute bottom-1/3 right-1/6 w-28 h-28 border border-emerald-400/35 rounded-full animate-spin-slow"></div>
            <div className="absolute top-2/3 left-2/3 w-12 h-12 border border-orange-400/35 rounded-full animate-spin-reverse"></div>
          </div>
          
          {/* AI Holographic Orbs */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 right-1/4 w-6 h-6 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full animate-pulse-glow"></div>
            <div className="absolute top-3/4 left-1/4 w-4 h-4 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-pulse-glow" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/2 right-1/2 w-5 h-5 bg-gradient-to-r from-pink-400/20 to-indigo-400/20 rounded-full animate-pulse-glow" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/6 left-1/2 w-3 h-3 bg-gradient-to-r from-cyan-400/20 to-emerald-400/20 rounded-full animate-pulse-glow" style={{animationDelay: '3s'}}></div>
          </div>
          
          {/* Enhanced Floating Geometric Shapes */}
          <div className="absolute inset-0">
            <div className="absolute top-1/6 right-1/6 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-float-slow opacity-70"></div>
            <div className="absolute top-2/3 left-1/6 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-float-medium opacity-80"></div>
            <div className="absolute bottom-1/3 right-1/3 w-2.5 h-2.5 bg-gradient-to-r from-pink-400 to-indigo-400 rounded-full animate-float-fast opacity-60"></div>
            <div className="absolute top-1/3 left-2/3 w-2 h-2 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full animate-float-slow opacity-65"></div>
            <div className="absolute bottom-1/6 right-1/6 w-1.5 h-1.5 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-float-medium opacity-75"></div>
            <div className="absolute top-5/6 left-1/3 w-2.5 h-2.5 bg-gradient-to-r from-teal-400 to-blue-400 rounded-full animate-float-fast opacity-55"></div>
          </div>
          
          {/* AI Energy Fields */}
          <div className="absolute inset-0 opacity-15 dark:opacity-25">
            <div className="absolute top-1/4 left-1/4 w-48 h-48 border border-blue-400/20 rounded-full animate-pulse-glow"></div>
            <div className="absolute top-1/2 right-1/4 w-32 h-32 border border-purple-400/20 rounded-full animate-pulse-glow" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-1/4 left-1/3 w-40 h-40 border border-pink-400/20 rounded-full animate-pulse-glow" style={{animationDelay: '2s'}}></div>
          </div>
          
          {/* Enhanced Glowing Orbs */}
          <div className="absolute inset-0">
            <div className="absolute top-1/3 left-1/2 w-4 h-4 bg-blue-400/25 rounded-full animate-pulse-glow"></div>
            <div className="absolute top-2/3 right-1/3 w-3 h-3 bg-purple-400/25 rounded-full animate-pulse-glow" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-1/3 left-1/4 w-3.5 h-3.5 bg-pink-400/25 rounded-full animate-pulse-glow" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/6 right-1/3 w-2.5 h-2.5 bg-cyan-400/25 rounded-full animate-pulse-glow" style={{animationDelay: '3s'}}></div>
            <div className="absolute bottom-1/6 left-1/2 w-3 h-3 bg-emerald-400/25 rounded-full animate-pulse-glow" style={{animationDelay: '4s'}}></div>
            <div className="absolute top-5/6 right-1/6 w-2 h-2 bg-orange-400/25 rounded-full animate-pulse-glow" style={{animationDelay: '5s'}}></div>
          </div>
          
          {/* AI Matrix Code Rain */}
          <div className="absolute inset-0 opacity-25 dark:opacity-35">
            <div className="absolute top-0 left-1/8 w-px h-full bg-gradient-to-b from-transparent via-blue-400 to-transparent animate-digitalRain1"></div>
            <div className="absolute top-0 left-3/8 w-px h-full bg-gradient-to-b from-transparent via-purple-400 to-transparent animate-digitalRain2"></div>
            <div className="absolute top-0 left-5/8 w-px h-full bg-gradient-to-b from-transparent via-pink-400 to-transparent animate-digitalRain3"></div>
            <div className="absolute top-0 left-7/8 w-px h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-digitalRain1" style={{animationDelay: '1s'}}></div>
          </div>
          
          {/* Floating Brand Watermark */}
          <div className="absolute inset-0 opacity-3 dark:opacity-5 pointer-events-none">
            <div className="absolute top-1/4 right-1/6 text-6xl font-bold bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 bg-clip-text text-transparent animate-float-slow">
              DocCraft
            </div>
            <div className="absolute bottom-1/4 left-1/6 text-4xl font-bold bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-blue-400/10 bg-clip-text text-transparent animate-float-medium">
              AI
            </div>
          </div>
        </div>

        {/* Main Content with AI Highlights */}
        <div className="relative z-10">
          {/* AI Content Highlights */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-gradient-to-r from-purple-400/5 to-pink-400/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 left-1/3 w-56 h-56 bg-gradient-to-r from-pink-400/5 to-indigo-400/5 rounded-full blur-3xl"></div>
          </div>
          
          {/* Professional Brand Header */}
          <header className="relative z-20 py-8 px-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              {/* Brand Logo and Name */}
              <div className="flex items-center space-x-4 group cursor-pointer">
                {/* AI Brain Icon */}
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-blue-500/25 transition-all duration-300 group-hover:scale-105">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  {/* Glowing Ring Effect */}
                  <div className="absolute inset-0 w-16 h-16 border-2 border-blue-400/30 rounded-2xl animate-pulse-glow"></div>
                  <div className="absolute inset-0 w-16 h-16 border border-purple-400/20 rounded-2xl animate-spin-slow"></div>
                </div>
                
                {/* Brand Name */}
                <div className="text-center">
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:via-purple-500 group-hover:to-pink-500 transition-all duration-300">
                    DocCraft AI
                  </h1>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium tracking-wide">
                    Intelligent Content Creation Platform
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-light tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:translate-y-1">
                    Powered by Advanced AI Technology
                  </p>
                </div>
                
                {/* Neural Network Connection Lines */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                  <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3"/>
                        <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#F472B6" stopOpacity="0.3"/>
                      </linearGradient>
                    </defs>
                    <g className="animate-neuralPulse">
                      <line x1="50" y1="50" x2="150" y2="50" stroke="url(#brandGradient)" strokeWidth="0.5"/>
                      <circle cx="50" cy="50" r="1" fill="url(#brandGradient)"/>
                      <circle cx="150" cy="50" r="1" fill="url(#brandGradient)"/>
                    </g>
                  </svg>
                </div>
              </div>
              
                              {/* Login Button */}
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/login" 
                    className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 overflow-hidden"
                  >
                    {/* Notification Pulse */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Glowing Ring Effect */}
                  <div className="absolute inset-0 border-2 border-blue-400/30 rounded-xl animate-pulse-glow"></div>
                  
                  {/* Icon */}
                  <svg className="w-5 h-5 mr-2 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  
                  {/* Text */}
                  <span className="relative z-10">Login</span>
                  
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-ai-shimmer"></div>
                </Link>
                
                {/* Sign Up Button */}
                <Link 
                  to="/signup" 
                  className="group relative inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105"
                >
                  <span className="relative z-10">Sign Up</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-ai-shimmer"></div>
                </Link>
                
                {/* User Status Indicator */}
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Live</span>
                </div>
              </div>
            </div>
          </header>
          
          <LandingHero />
          
          {/* Features Section */}
          <section className="py-20 px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wider">
                    DOCCRAFT AI FEATURES
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                  Powerful AI Tools for
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Creators</span>
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  Transform your content with intelligent enhancement, analysis, creation, and collaboration tools
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Feature Cards */}
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-slate-700/20 hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-2 hover:scale-105 hover:border-blue-300/50 dark:hover:border-blue-400/50 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-ai-shimmer"></div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 group-hover:animate-icon-pulse transition-all duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Document Processing</h3>
                  <p className="text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">Upload and enhance your documents with AI-powered analysis and intelligent suggestions.</p>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-slate-700/20 hover:shadow-xl hover:shadow-green-500/25 hover:-translate-y-2 hover:scale-105 transition-all duration-300 group cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">AI Image Generation</h3>
                  <p className="text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">Create stunning visuals with AI-powered image generation and contextual suggestions.</p>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-slate-700/20 hover:shadow-xl hover:shadow-purple-500/25 hover:-translate-y-2 hover:scale-105 transition-all duration-300 group cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">Content Analysis</h3>
                  <p className="text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">Get deep insights into your content with advanced AI analysis and recommendations.</p>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-slate-700/20 hover:shadow-xl hover:shadow-orange-500/25 hover:-translate-y-2 hover:scale-105 transition-all duration-300 group cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">eBook Analysis</h3>
                  <p className="text-gray-600 dark:text-gray-300">Analyze and extract insights from eBooks with intelligent content breakdown and summaries.</p>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-slate-700/20 hover:shadow-xl hover:shadow-indigo-500/25 hover:-translate-y-2 hover:scale-105 transition-all duration-300 group cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Book Outlining</h3>
                  <p className="text-gray-600 dark:text-gray-300">Create comprehensive book outlines with AI-powered structure and chapter planning.</p>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-slate-700/20 hover:shadow-xl hover:shadow-teal-500/25 hover:-translate-y-2 hover:scale-105 transition-all duration-300 group cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Character Development</h3>
                  <p className="text-gray-600 dark:text-gray-300">Build rich, complex characters with AI-assisted personality and backstory creation.</p>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-slate-700/20 hover:shadow-xl hover:shadow-yellow-500/25 hover:-translate-y-2 hover:scale-105 transition-all duration-300 group cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 4v2h6V4M9 4a2 2 0 012-2h4a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Content Enhancement</h3>
                  <p className="text-gray-600 dark:text-gray-300">Enhance your writing with AI-powered suggestions for tone, style, and clarity improvements.</p>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-slate-700/20 hover:shadow-xl hover:shadow-pink-500/25 hover:-translate-y-2 hover:scale-105 transition-all duration-300 group cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Analytics Dashboard</h3>
                  <p className="text-gray-600 dark:text-gray-300">Track your content performance with detailed analytics and engagement insights.</p>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-slate-700/20 hover:shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-2 hover:scale-105 transition-all duration-300 group cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Collaborative Workspace</h3>
                  <p className="text-gray-600 dark:text-gray-300">Work together with real-time collaboration tools and shared project management.</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Ready to Transform Your Content?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Join thousands of creators who are already using DocCraft-AI to enhance their work
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/signup"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/demo"
                  className="inline-flex items-center px-8 py-4 bg-white/90 dark:bg-slate-800/90 text-gray-900 dark:text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 border border-gray-200 dark:border-slate-700"
                >
                  Try Demo
                </Link>
              </div>
            </div>
          </section>
          
          {/* Footer */}
          <div className="relative z-10">
            <Footer />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('❌ Error in Home component:', error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Home Error</h1>
          <p className="text-red-500 mb-4">Something went wrong loading the home page</p>
          <pre className="text-sm text-red-400 bg-red-100 p-4 rounded">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </div>
      </div>
    )
  }
} 