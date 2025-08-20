import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LandingHero } from '../components/LandingHero';
import { Footer } from '../components/Footer';
import Header from '../components/Header';
import { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  Cpu,
  Network,
  Layers,
} from 'lucide-react';

// Enhanced Animated Background Component
const EnhancedAnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      type: string;
      opacity: number;
      life: number;
      maxLife: number;
      fadeDirection: 'in' | 'out';
      fadeSpeed: number;
    }> = [];
    let time = 0;

    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = (x: number, y: number, type: string) => {
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 3, // Increased speed for fluid movement
        vy: (Math.random() - 0.5) * 3,
        size: Math.random() * 2 + 0.5,
        type,
        opacity: Math.random() * 0.3 + 0.1,
        life: Math.random() * 200 + 100, // Longer life for smoother movement
        maxLife: Math.random() * 200 + 100,
        fadeDirection: (Math.random() > 0.5 ? 'in' : 'out') as 'in' | 'out',
        fadeSpeed: Math.random() * 0.02 + 0.01, // Random fade speed
      };
    };

    const initParticles = () => {
      if (!canvas) return;
      particles = [];
      for (let i = 0; i < 25; i++) {
        // Slightly more particles for fluid movement
        particles.push(
          createParticle(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() > 0.5 ? 'ai' : 'data'
          )
        );
      }
    };

    const animate = () => {
      if (!canvas || !ctx) return;

      time += 0.02; // Faster time progression for fluid movement
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create very subtle gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
      );
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.01)');
      gradient.addColorStop(0.5, 'rgba(147, 51, 234, 0.005)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.002)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles with fluid movement and fading
      particles.forEach((particle, index) => {
        // Update position for fluid movement
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Update life and fading
        if (particle.fadeDirection === 'in') {
          particle.opacity += particle.fadeSpeed;
          if (particle.opacity >= 0.3) {
            particle.fadeDirection = 'out';
          }
        } else {
          particle.opacity -= particle.fadeSpeed;
          if (particle.opacity <= 0.05) {
            particle.fadeDirection = 'in';
          }
        }

        // Wrap around edges with smooth transition
        if (particle.x < -50) particle.x = canvas.width + 50;
        if (particle.x > canvas.width + 50) particle.x = -50;
        if (particle.y < -50) particle.y = canvas.height + 50;
        if (particle.y > canvas.height + 50) particle.y = -50;

        // Draw particle with current opacity
        ctx.save();
        ctx.globalAlpha =
          particle.opacity * (particle.life / particle.maxLife) * 0.4;

        if (particle.type === 'ai') {
          ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
          ctx.shadowColor = 'rgba(59, 130, 246, 0.2)';
        } else {
          ctx.fillStyle = 'rgba(147, 51, 234, 0.3)';
          ctx.shadowColor = 'rgba(147, 51, 234, 0.2)';
        }

        ctx.shadowBlur = 3;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Reset particle when life expires
        if (particle.life <= 0) {
          particles[index] = createParticle(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() > 0.5 ? 'ai' : 'data'
          );
        }
        particle.life--;
      });

      // Draw connecting lines with multi-directional flow
      particles.forEach((particle1, i) => {
        particles.slice(i + 1).forEach(particle2 => {
          const dx = particle1.x - particle2.x;
          const dy = particle1.y - particle2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.save();
            const lineOpacity = ((120 - distance) / 120) * 0.03;
            ctx.globalAlpha = lineOpacity;

            // Multi-directional line styling
            const angle = Math.atan2(dy, dx);
            const flowOffset = Math.sin(time * 0.5 + distance * 0.01) * 2;

            ctx.strokeStyle = `rgba(59, 130, 246, ${0.15 + Math.sin(time + distance) * 0.05})`;
            ctx.lineWidth = 0.4;
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.moveTo(particle1.x, particle1.y);
            ctx.lineTo(particle2.x, particle2.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initParticles();
    animate();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

// Floating AI Icons Component with fluid movement and fading
const FloatingAIIcons = () => {
  const [icons, setIcons] = useState<
    Array<{
      id: number;
      icon: React.ComponentType<any>;
      color: string;
      delay: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      opacity: number;
      fadeDirection: 'in' | 'out';
      fadeSpeed: number;
    }>
  >([]);

  useEffect(() => {
    const iconTypes = [
      { icon: Brain, color: 'from-blue-500 to-blue-600', delay: 0 },
      { icon: Cpu, color: 'from-purple-500 to-purple-600', delay: 1000 },
      { icon: Network, color: 'from-green-500 to-green-600', delay: 2000 },
      { icon: Layers, color: 'from-orange-500 to-orange-600', delay: 3000 },
      { icon: Sparkles, color: 'from-pink-500 to-pink-600', delay: 4000 },
    ];

    const newIcons = iconTypes.map((type, index) => ({
      id: index,
      icon: type.icon,
      color: type.color,
      delay: type.delay,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.5, // Movement speed
      vy: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.4 + 0.2,
      fadeDirection: (Math.random() > 0.5 ? 'in' : 'out') as 'in' | 'out',
      fadeSpeed: Math.random() * 0.01 + 0.005,
    }));

    setIcons(newIcons);
  }, []);

  // Animate icons with fluid movement and fading
  useEffect(() => {
    const interval = setInterval(() => {
      setIcons(prevIcons =>
        prevIcons.map(icon => {
          // Update position for fluid movement
          let newX = icon.x + icon.vx;
          let newY = icon.y + icon.vy;

          // Wrap around edges
          if (newX < -5) newX = 105;
          if (newX > 105) newX = -5;
          if (newY < -5) newY = 105;
          if (newY > 105) newY = -5;

          // Update opacity with fading
          let newOpacity = icon.opacity;
          if (icon.fadeDirection === 'in') {
            newOpacity += icon.fadeSpeed;
            if (newOpacity >= 0.6) {
              icon.fadeDirection = 'out';
            }
          } else {
            newOpacity -= icon.fadeSpeed;
            if (newOpacity <= 0.1) {
              icon.fadeDirection = 'in';
            }
          }

          return {
            ...icon,
            x: newX,
            y: newY,
            opacity: newOpacity,
          };
        })
      );
    }, 50); // Smooth 20fps animation

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 2 }}
    >
      {icons.map(iconData => {
        const IconComponent = iconData.icon;
        return (
          <div
            key={iconData.id}
            className={`absolute w-8 h-8 bg-gradient-to-r ${iconData.color} rounded-full flex items-center justify-center text-white shadow-md`}
            style={{
              left: `${iconData.x}%`,
              top: `${iconData.y}%`,
              opacity: iconData.opacity,
              transition: 'opacity 0.1s ease-out',
            }}
          >
            <IconComponent className="w-4 h-4" />
          </div>
        );
      })}
    </div>
  );
};

// Enhanced Background Overlay Component with multi-directional animations
const EnhancedBackgroundOverlay = () => {
  return (
    <>
      {/* Gradient Mesh Overlay - Very subtle, doesn't interfere with original theme */}
      <div className="fixed inset-0" style={{ zIndex: 0 }}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/5 via-white/2 to-purple-50/5" />

        {/* Multi-directional Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-15">
          {' '}
          {/* Increased opacity for visibility */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(45deg, rgba(59, 130, 246, 0.08) 1px, transparent 1px),
                linear-gradient(-45deg, rgba(147, 51, 234, 0.08) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.06) 1px, transparent 1px),
                linear-gradient(0deg, rgba(147, 51, 234, 0.06) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px, 40px 40px, 80px 80px, 50px 50px',
              animation:
                'enhancedGridMove 25s linear infinite, enhancedGridMoveReverse 30s linear infinite',
            }}
          />
        </div>

        {/* Additional diagonal grid patterns for more visible movement */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(30deg, rgba(16, 185, 129, 0.06) 1px, transparent 1px),
                linear-gradient(-30deg, rgba(245, 158, 11, 0.06) 1px, transparent 1px)
              `,
              backgroundSize: '70px 70px, 45px 45px',
              animation:
                'enhancedGridMove 35s linear infinite reverse, enhancedGridMoveReverse 40s linear infinite',
            }}
          />
        </div>

        {/* Horizontal and vertical grid lines for clear directional movement */}
        <div className="absolute inset-0 opacity-12">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
                linear-gradient(0deg, rgba(147, 51, 234, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: '100px 100px, 100px 100px',
              animation:
                'enhancedGridMove 20s linear infinite, enhancedGridMoveReverse 25s linear infinite',
            }}
          />
        </div>

        {/* Concentric grid pattern for radial movement effect */}
        <div className="absolute inset-0 opacity-8">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 50%, transparent 0px, rgba(59, 130, 246, 0.04) 1px, transparent 2px),
                radial-gradient(circle at 25% 25%, transparent 0px, rgba(147, 51, 234, 0.04) 1px, transparent 2px)
              `,
              backgroundSize: '120px 120px, 80px 80px',
              animation:
                'enhancedGridMoveSpiral 45s linear infinite, enhancedGridMoveDiagonal 50s linear infinite',
            }}
          />
        </div>

        {/* Zigzag pattern for more dynamic movement */}
        <div className="absolute inset-0 opacity-6">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(60deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px),
                linear-gradient(-60deg, rgba(245, 158, 11, 0.03) 1px, transparent 1px)
              `,
              backgroundSize: '90px 90px, 60px 60px',
              animation:
                'enhancedGridMove 55s linear infinite reverse, enhancedGridMoveReverse 60s linear infinite',
            }}
          />
        </div>

        {/* Multi-directional Floating Orbs with fluid movement */}
        <div
          className="absolute top-20 left-20 w-32 h-32 bg-blue-400/5 rounded-full blur-xl animate-pulse"
          style={{ animation: 'enhancedOrbFloat 8s ease-in-out infinite' }}
        />
        <div
          className="absolute top-40 right-32 w-24 h-24 bg-purple-400/5 rounded-full blur-xl"
          style={{
            animation: 'enhancedOrbFloat 12s ease-in-out infinite reverse',
          }}
        />
        <div
          className="absolute bottom-32 left-32 w-28 h-28 bg-green-400/5 rounded-full blur-xl"
          style={{ animation: 'enhancedOrbFloat 10s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-20 right-20 w-20 h-20 bg-orange-400/5 rounded-full blur-xl"
          style={{
            animation: 'enhancedOrbFloat 15s ease-in-out infinite reverse',
          }}
        />
      </div>
    </>
  );
};



export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Navigation handlers for feature cards
  const handleFeatureCardClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden flex flex-col">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Enhanced grid pattern with multiple layers */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0 animate-gridMove"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.4) 1px, transparent 0)`,
              backgroundSize: '40px 40px',
            }}
          ></div>
          <div
            className="absolute inset-0 animate-gridMove-reverse"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.3) 1px, transparent 0)`,
              backgroundSize: '60px 60px',
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

      {/* Enhanced Background Components - Positioned to complement, not override */}
      <div className="relative" style={{ zIndex: 1 }}>
        <EnhancedAnimatedBackground />
        <EnhancedBackgroundOverlay />
        <FloatingAIIcons />
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
              <div
                className="feature-card feature-card-blue group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => handleFeatureCardClick('/processor')}
              >
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
                <div className="mt-4 text-blue-600 dark:text-blue-400 font-semibold group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                  Try Now →
                </div>
              </div>

              {/* Character Development */}
              <div
                className="feature-card feature-card-green group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => handleFeatureCardClick('/character-development')}
              >
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
                <div className="mt-4 text-green-600 dark:text-green-400 font-semibold group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
                  Explore →
                </div>
              </div>

              {/* Plot Structure */}
              <div
                className="feature-card feature-card-purple group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => handleFeatureCardClick('/book-outliner')}
              >
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
                <div className="mt-4 text-purple-600 dark:text-purple-400 font-semibold group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                  Build Now →
                </div>
              </div>

              {/* Style Analysis */}
              <div
                className="feature-card feature-card-yellow group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => handleFeatureCardClick('/analyzer')}
              >
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
                <div className="mt-4 text-yellow-600 dark:text-yellow-400 font-semibold group-hover:text-yellow-700 dark:group-hover:text-yellow-300 transition-colors">
                  Analyze →
                </div>
              </div>

              {/* Collaboration Tools */}
              <div
                className="feature-card feature-card-red group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => handleFeatureCardClick('/workspace')}
              >
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
                <div className="mt-4 text-red-600 dark:text-red-400 font-semibold group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors">
                  Collaborate →
                </div>
              </div>

              {/* Performance Analytics */}
              <div
                className="feature-card feature-card-indigo group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => handleFeatureCardClick('/analytics')}
              >
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
                <div className="mt-4 text-indigo-600 dark:text-indigo-400 font-semibold group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                  Track Progress →
                </div>
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
              <Link to="/dashboard" className="group cta-button-primary">
                <span className="mr-2">Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link to="/demo" className="group cta-button-secondary">
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
