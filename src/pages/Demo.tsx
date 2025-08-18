// 🔧 DOCCRAFT-AI V3 DEMO INTEGRATION GUIDE
// Complete integration steps for your existing codebase

// =============================================================================
// STEP 1: Create the Enhanced Demo Page Component
// =============================================================================
// File: src/pages/Demo.tsx

import React, { useState, useEffect } from 'react';
import {
  Play,
  Brain,
  Users,
  Target,
  Zap,
  BookOpen,
  Eye,
  Settings,
  MessageCircle,
  Send,
  X,
  HelpCircle,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { toast } from 'react-hot-toast'; // Using your existing toast system
import { useAuth } from '../contexts/AuthContext'; // Integration with your auth system

// Professional Robot Head Line Icon Component
const RobotHeadIcon = ({ className = 'w-6 h-6' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="6" y="8" width="12" height="10" rx="2" fill="none" />
    <rect x="10" y="6" width="4" height="2" rx="1" fill="none" />
    <circle cx="12" cy="4" r="1" fill="none" />
    <line x1="12" y1="5" x2="12" y2="6" />
    <circle cx="9" cy="11" r="1" fill="currentColor" />
    <circle cx="15" cy="11" r="1" fill="currentColor" />
    <line x1="10" y1="14" x2="14" y2="14" strokeLinecap="round" />
    <line x1="10.5" y1="15.5" x2="13.5" y2="15.5" strokeLinecap="round" />
    <line x1="5" y1="10" x2="5" y2="13" strokeLinecap="round" />
    <line x1="19" y1="10" x2="19" y2="13" strokeLinecap="round" />
    <line x1="8" y1="17" x2="9" y2="17" strokeLinecap="round" />
    <line x1="15" y1="17" x2="16" y2="17" strokeLinecap="round" />
  </svg>
);

// AI Demo Assistant Component
interface DemoAssistantProps {
  demoStep: number;
  mode: string;
  activeAgents: string[];
  responses: Record<string, any>;
  hasClickedStartDemo: boolean;
}

interface Message {
  id: number;
  type: string;
  content: string;
  timestamp: Date;
}

const DemoAssistant = ({
  demoStep,
  mode,
  activeAgents,
  responses,
  hasClickedStartDemo,
}: DemoAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasShownInitialInstructions, setHasShownInitialInstructions] =
    useState(false);

  // Auto-open assistant after 7 seconds and show initial instructions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasShownInitialInstructions) {
        setIsOpen(true);
        setHasShownInitialInstructions(true);

        const initialMessages = [
          {
            id: 1,
            type: 'assistant',
            content:
              "👋 Hello! I'm your AI Demo Assistant. I'll guide you through DocCraft-AI's powerful features step by step.",
            timestamp: new Date(),
          },
        ];

        if (!hasClickedStartDemo) {
          initialMessages.push({
            id: 2,
            type: 'assistant',
            content:
              "🚀 Let's begin! First, click the blue 'Start Interactive Demo' button above to see our AI agents in action. I'll explain each step as we go!",
            timestamp: new Date(),
          });
        }

        setMessages(initialMessages);
      }
    }, 7000);

    return () => clearTimeout(timer);
  }, [hasShownInitialInstructions, hasClickedStartDemo]);

  // Handle clicks on different demo elements
  const handleElementClick = (elementType: string, elementId: string) => {
    if (demoStep < 3) return; // Only active after initial demo is complete

    const explanations = {
      agent: {
        research:
          "🔍 **Research Agent**: This AI specializes in gathering relevant information for your writing project. It can find character archetypes, plot inspirations, historical context, and thematic elements. In real use, it connects to databases and references to provide accurate, contextual research that enhances your story's authenticity and depth.",
        outline:
          "🎯 **Structure Agent**: This agent focuses on narrative architecture and story pacing. It analyzes plot structures like the Hero's Journey, Three-Act Structure, or Save the Cat! method. It ensures your story has proper tension curves, character arcs, and dramatic beats positioned for maximum impact.",
        writing:
          "✍️ **Writing Agent**: The creative powerhouse that helps with actual prose composition. It maintains your voice and style while suggesting improvements to dialogue, descriptions, and narrative flow. It can help overcome writer's block, suggest alternative phrasings, and ensure consistency in tone throughout your work.",
        character:
          '👥 **Character Agent**: Specializes in psychological depth and character development. It creates detailed personality profiles, analyzes character motivations, suggests realistic dialogue patterns, and ensures character consistency. It can map character arcs and suggest how personality traits influence plot decisions.',
        emotion:
          "💭 **Emotion Agent**: Maps the emotional journey of your story and characters. It analyzes pacing of emotional beats, suggests where to add tension or relief, and ensures your story has a compelling emotional arc that keeps readers engaged. It's particularly useful for identifying flat emotional moments.",
        style:
          "🎨 **Style Agent**: Your consistency guardian that maintains voice, tone, and stylistic elements throughout your work. It checks for genre consistency, suggests style improvements, and ensures your writing matches your intended audience and purpose. It's like having a professional editor focused solely on style.",
      },
      mode: {
        MANUAL:
          "🎛️ **Manual Mode**: You're in complete control. Each AI agent waits for your specific instructions before taking action. Perfect for writers who want full control over the creative process while having AI assistance available on demand. Click individual 'Run Analysis' buttons to activate specific agents.",
        HYBRID:
          "⚖️ **Hybrid Mode**: The perfect balance between AI assistance and human control. AI agents proactively suggest next steps and improvements, but you review and approve each suggestion before it's implemented. Ideal for collaborative writing where you want intelligent guidance without losing creative control.",
        FULLY_AUTO:
          "🚀 **Full Auto Mode**: All AI agents work collaboratively in the background, analyzing and improving your content in real-time. Best for rapid prototyping, overcoming writer's block, or when you want comprehensive AI assistance throughout your entire writing process. You can still override any suggestions.",
      },
      feature: {
        collaboration:
          '👥 **Real-Time Collaboration**: Multiple writers can work on the same document simultaneously with intelligent conflict resolution. Changes are synced in real-time, and our AI helps merge different writing styles seamlessly while maintaining narrative consistency.',
        psychology:
          '🧠 **Psychological Analysis**: Deep character psychology mapping using established personality frameworks. Creates realistic character behaviors, dialogue patterns, and decision-making processes based on psychological profiles and motivations.',
        plot: '📊 **Plot Structure**: Intelligent story pacing analysis using proven narrative frameworks. Ensures proper tension curves, character development arcs, and dramatic beats positioned for maximum reader engagement and satisfaction.',
        adaptive:
          '⚡ **Adaptive AI**: Our AI learns your writing style, preferences, and patterns over time. It adapts its suggestions to match your voice, genre preferences, and storytelling approach, becoming more personalized with each project.',
      },
    };

    const explanation = explanations[elementType]?.[elementId];
    if (explanation) {
      const explanationMessage = {
        id: Date.now(),
        type: 'assistant',
        content: explanation,
        timestamp: new Date(),
      };

      // Clear chat and show only the explanation
      setMessages([
        {
          id: 1,
          type: 'assistant',
          content:
            "💡 **Explanation Mode** - Here's detailed information about the feature you clicked:",
          timestamp: new Date(),
        },
        explanationMessage,
      ]);

      if (!isOpen) setIsOpen(true);
      if (isMinimized) setIsMinimized(false);
    }
  };

  // Helper function to check if we're in explanation mode
  const isInExplanationMode =
    messages.length === 2 &&
    messages[0]?.content?.includes('💡 **Explanation Mode**');

  // Function to return to normal demo chat
  const returnToDemoChat = () => {
    const welcomeMessage = {
      id: 1,
      type: 'assistant',
      content:
        "👋 Welcome back! I'm ready to help with any questions about DocCraft-AI. You can click on any demo element for detailed explanations, or ask me anything!",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  // Optional: Add explanation category to the header
  const getExplanationCategory = () => {
    if (messages[1]?.content?.includes('Research Agent')) return 'AI Agent';
    if (messages[1]?.content?.includes('Structure Agent')) return 'AI Agent';
    if (messages[1]?.content?.includes('Writing Agent')) return 'AI Agent';
    if (messages[1]?.content?.includes('Character Agent')) return 'AI Agent';
    if (messages[1]?.content?.includes('Emotion Agent')) return 'AI Agent';
    if (messages[1]?.content?.includes('Style Agent')) return 'AI Agent';
    if (messages[1]?.content?.includes('Manual Mode'))
      return 'Collaboration Mode';
    if (messages[1]?.content?.includes('Hybrid Mode'))
      return 'Collaboration Mode';
    if (messages[1]?.content?.includes('Full Auto Mode'))
      return 'Collaboration Mode';
    if (messages[1]?.content?.includes('Real-Time Collaboration'))
      return 'Platform Feature';
    if (messages[1]?.content?.includes('Psychological Analysis'))
      return 'Platform Feature';
    if (messages[1]?.content?.includes('Plot Structure'))
      return 'Platform Feature';
    if (messages[1]?.content?.includes('Adaptive AI'))
      return 'Platform Feature';
    return 'Feature';
  };

  // Real-time demo step guidance
  useEffect(() => {
    if (!hasShownInitialInstructions) return;

    let guidanceMessage = null;

    if (demoStep === 1) {
      guidanceMessage = {
        id: Date.now(),
        type: 'assistant',
        content:
          "🎯 Excellent! You've started the demo in Hybrid mode. Notice the Research and Outline agents are now active (highlighted in blue and green). In Hybrid mode, these agents analyze your content and provide suggestions that you can review and approve before proceeding. This gives you control while leveraging AI insights.",
        timestamp: new Date(),
      };
    } else if (demoStep === 2) {
      guidanceMessage = {
        id: Date.now(),
        type: 'assistant',
        content:
          "🚀 Perfect timing! We've automatically switched to Full Auto mode. Watch as all 6 AI agents collaborate simultaneously - Research, Outline, Writing, Character, Emotion, and Style agents are all working together. This mode is ideal for rapid prototyping, brainstorming, or when you want comprehensive AI assistance throughout your entire writing process.",
        timestamp: new Date(),
      };
    } else if (demoStep === 3) {
      guidanceMessage = {
        id: Date.now(),
        type: 'assistant',
        content:
          "✨ Demo complete! You've experienced how our multi-agent AI system transforms writing. Each agent contributed unique expertise: Research gathered relevant information, Outline structured the narrative, Writing crafted prose, Character developed personalities, Emotion mapped story arcs, and Style ensured consistency. 🖱️ **Try clicking on any agent panel or feature tile below to learn more about how each component works!**",
        timestamp: new Date(),
      };
    }

    if (guidanceMessage) {
      setTimeout(() => {
        setMessages(prev => [...prev, guidanceMessage]);
      }, 1500);
    }
  }, [demoStep, hasShownInitialInstructions]);

  // Predefined responses for common questions
  const responses_db = {
    pricing:
      'Our pricing is flexible: Free tier (1 document/month), Pro ($29/month with unlimited documents), and Enterprise (custom pricing). All tiers include our AI agents!',
    features:
      'DocCraft-AI includes 6 specialized AI agents: Research, Structure, Writing, Character Development, Emotion Analysis, and Style Consistency. Plus real-time collaboration!',
    security:
      'We use enterprise-grade security with Supabase authentication, row-level security, and audit logging. Your content is encrypted and never used to train AI models.',
    integration:
      'We integrate with popular tools like Google Docs, Notion, and Scrivener. Plus our API allows custom integrations with your existing workflow.',
    collaboration:
      'Yes! Multiple writers can work on the same document simultaneously with intelligent conflict resolution and real-time sync.',
    ai_accuracy:
      'Our AI agents achieve 94% accuracy in style consistency and 89% user satisfaction. They learn from your writing style to provide personalized suggestions.',
    export:
      'Export to PDF, DOCX, Markdown, or HTML. We also support direct publishing to platforms like Medium, WordPress, and Ghost.',
    support:
      'We offer 24/7 chat support, comprehensive documentation, video tutorials, and weekly live training sessions for all users.',
    demo_guide:
      'I can guide you through our demo! We have three modes: Manual (you control each agent), Hybrid (AI suggests, you approve), and Full Auto (agents collaborate automatically).',
  };

  const getAIResponse = userMessage => {
    const message = userMessage.toLowerCase();

    // Context-aware responses based on demo state
    if (
      demoStep === 0 &&
      (message.includes('start') ||
        message.includes('demo') ||
        message.includes('begin'))
    ) {
      return "Great! Click the 'Start Interactive Demo' button above. I'll guide you through each step as we explore how our AI agents work together.";
    }

    if (
      demoStep > 0 &&
      message.includes('what') &&
      message.includes('happening')
    ) {
      if (mode === 'HYBRID') {
        return "Right now you're seeing Hybrid mode in action! The Research and Outline agents are analyzing your story concept and providing suggestions. You'd normally approve each step before proceeding.";
      } else if (mode === 'FULLY_AUTO') {
        return "We've switched to Full Auto mode! Watch as all 6 AI agents collaborate automatically. Each agent contributes their expertise - research, structure, writing, character development, emotion, and style.";
      }
    }

    // ENHANCED QUESTION RESPONSES - Add these new response categories:

    // Platform capabilities
    if (
      message.includes('what') &&
      (message.includes('do') || message.includes('can'))
    ) {
      return 'DocCraft-AI is a multi-agent writing platform with 6 specialized AI agents: Research (finds relevant information), Structure (organizes narrative), Writing (crafts prose), Character (develops personalities), Emotion (maps story arcs), and Style (ensures consistency). Each agent can work independently or collaboratively to enhance your writing.';
    }

    // Writing process questions
    if (
      message.includes('how') &&
      (message.includes('work') || message.includes('write'))
    ) {
      return 'Our writing process adapts to your style: 1) Choose your collaboration mode (Manual, Hybrid, or Full Auto), 2) Our AI agents analyze your content and provide targeted assistance, 3) You review and integrate suggestions, 4) The system learns your preferences for future projects. Each agent specializes in different aspects of storytelling.';
    }

    // Comparison questions
    if (
      message.includes('different') ||
      message.includes('compare') ||
      message.includes('versus') ||
      message.includes('vs')
    ) {
      return 'Unlike single AI writing tools, DocCraft-AI uses 6 specialized agents working together. Think of it as having a complete writing team: a researcher, story architect, prose writer, character psychologist, emotion specialist, and style editor - all powered by AI and coordinated intelligently.';
    }

    // Getting started questions
    if (
      message.includes('start') ||
      message.includes('begin') ||
      message.includes('try')
    ) {
      return 'Ready to start? You can begin with our free tier (1 document/month) to experience all 6 AI agents. Simply sign up, create your first project, choose your collaboration mode, and watch our agents enhance your writing. No credit card required for the free trial!';
    }

    // Use cases and examples
    if (
      message.includes('example') ||
      message.includes('use case') ||
      message.includes('for what')
    ) {
      return 'DocCraft-AI works for novels, short stories, screenplays, marketing copy, technical writing, and more. For example: writing a mystery novel? Research agent finds crime archetypes, Structure agent maps tension curves, Character agent develops suspect profiles, Emotion agent ensures reader engagement, Writing agent crafts atmospheric prose, and Style agent maintains noir consistency.';
    }

    // Team and collaboration
    if (
      message.includes('team') ||
      message.includes('multiple') ||
      message.includes('collaborate')
    ) {
      return 'Yes! Multiple writers can collaborate on the same document in real-time. Our intelligent conflict resolution merges different writing styles seamlessly while maintaining narrative consistency. Perfect for co-authors, writing teams, or editor-writer collaboration.';
    }

    // Learning and improvement
    if (
      message.includes('learn') ||
      message.includes('improve') ||
      message.includes('better')
    ) {
      return 'Our AI learns your writing style, genre preferences, and creative patterns over time. The more you use DocCraft-AI, the more personalized the suggestions become. Each agent adapts to your voice while maintaining their specialized expertise.';
    }

    // Original keyword matching for common questions
    for (const [key, response] of Object.entries(responses_db)) {
      if (
        message.includes(key.replace('_', ' ')) ||
        (key === 'pricing' &&
          (message.includes('cost') || message.includes('price'))) ||
        (key === 'demo_guide' &&
          (message.includes('help') || message.includes('guide'))) ||
        (key === 'ai_accuracy' &&
          (message.includes('accurate') || message.includes('quality')))
      ) {
        return response;
      }
    }

    // Enhanced fallback responses
    const fallbacks = [
      'Great question! DocCraft-AI combines 6 specialized AI agents to enhance every aspect of writing. What specific area interests you most - story structure, character development, writing style, or collaboration features?',
      "I'd love to help! Our platform uses multi-agent AI to assist with research, outlining, writing, character development, emotional pacing, and style consistency. What would you like to know more about?",
      'Thanks for asking! DocCraft-AI is designed for writers who want intelligent collaboration throughout their creative process. Would you like to know about our AI agents, collaboration modes, or specific use cases?',
    ];

    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(
      () => {
        const aiResponse = {
          id: Date.now() + 1,
          type: 'assistant',
          content: getAIResponse(inputMessage),
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
      },
      1000 + Math.random() * 1500
    );
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Expose the handleElementClick function for use by parent component
  window.demoAssistantHandleClick = handleElementClick;

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-[9999]">
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group animate-pulse hover:animate-none"
          style={{ zIndex: 9999 }}
        >
          <RobotHeadIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />

          <div className="absolute inset-0 rounded-full bg-blue-500 opacity-30 animate-ping"></div>

          <div className="absolute -top-14 right-0 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
            💬 Chat with AI Assistant
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>

          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
            !
          </div>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-white rounded-2xl shadow-2xl border border-gray-200 z-[9999] transition-all duration-300 ${
        isMinimized
          ? 'w-56 h-16'
          : 'w-60 sm:w-60 md:w-60 lg:w-60 xl:w-64 h-[500px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <RobotHeadIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {isInExplanationMode
                ? 'Feature Explanation'
                : 'AI Demo Assistant'}
            </h3>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">
                {isInExplanationMode
                  ? `Explaining ${getExplanationCategory()}`
                  : 'Online'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isInExplanationMode && (
            <button
              onClick={returnToDemoChat}
              className="px-3 py-1 text-xs bg-blue-600/20 text-blue-600 rounded-md hover:bg-blue-600/30 transition-colors"
            >
              Back to Chat
            </button>
          )}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-200 rounded-md transition-colors"
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4" />
            ) : (
              <Minimize2 className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-200 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-3 space-y-4"
            style={{ height: '360px' }}
          >
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] p-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-xs whitespace-pre-wrap leading-relaxed break-words">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-1 opacity-75 ${
                      message.type === 'user'
                        ? 'text-blue-100'
                        : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 p-3 rounded-xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions - Always visible but more compact */}
          <div className="px-3 py-2 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Quick:</p>
            <div className="flex flex-wrap gap-1">
              {['Price', 'Features', 'Security', 'Demo'].map(
                (question, index) => {
                  const fullQuestions = [
                    'How does pricing work?',
                    'Show me features',
                    'Is it secure?',
                    'Guide me through demo',
                  ];
                  return (
                    <button
                      key={question}
                      onClick={() => {
                        const fullQuestion = fullQuestions[index];
                        if (fullQuestion) {
                          setInputMessage(fullQuestion);
                          setTimeout(() => sendMessage(), 100);
                        }
                      }}
                      className="text-xs px-1.5 py-0.5 bg-blue-600/10 text-blue-600 rounded hover:bg-blue-600/20 transition-colors"
                    >
                      {question}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Input - Always visible with optimized layout */}
          <div className="p-3 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isInExplanationMode
                    ? 'Ask follow-up questions...'
                    : 'Ask about DocCraft-AI...'
                }
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// AI Agent Demo Component with Click Explanation
const AIAgentDemo = ({
  mode,
  isActive,
  agentType,
  onResponse,
  onAgentClick,
}) => {
  const [processing, setProcessing] = useState(false);
  const [response, setResponse] = useState('');

  const simulateResponse = async () => {
    if (!isActive) return;

    setProcessing(true);

    // Simulate AI processing delay
    await new Promise(resolve =>
      setTimeout(resolve, 1500 + Math.random() * 1000)
    );

    const responses = {
      research:
        "Found 3 relevant character archetypes for your detective story. The 'World-Weary Investigator' archetype shows strong emotional depth with internal conflict between justice and cynicism.",
      outline:
        "Generated 15-point story structure following the Hero's Journey. Key plot points include the inciting incident at 12% mark and the climax positioned at 80% for maximum impact.",
      writing:
        "Crafted opening paragraph with atmospheric tension: 'Rain drummed against the precinct windows like impatient fingers, each drop carrying the weight of another unsolved case...'",
      character:
        'Developed psychological profile: Detective Sarah Chen - INTJ personality, motivated by childhood trauma, fears emotional vulnerability, speaks in clipped, precise sentences.',
      emotion:
        'Emotional arc analysis: Story peaks at 85% tension during confrontation scene. Recommended adding relief moment at 60% to prevent reader fatigue.',
      style:
        'Style consistency score: 94%. Voice matches noir genre conventions with modern urban elements. Suggested maintaining present-tense narrative throughout.',
    };

    const agentResponse = responses[agentType] || 'AI analysis complete.';
    setResponse(agentResponse);
    setProcessing(false);
    onResponse(agentType, agentResponse);
  };

  useEffect(() => {
    if (isActive && mode === 'FULLY_AUTO') {
      simulateResponse();
    }
  }, [isActive, mode]);

  const agentConfig = {
    research: {
      name: 'Research Agent',
      icon: Eye,
      color: 'blue',
      bgColor: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      borderColor: 'border-blue-300',
      bgLight: 'bg-blue-50',
    },
    outline: {
      name: 'Structure Agent',
      icon: Target,
      color: 'green',
      bgColor: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      borderColor: 'border-green-300',
      bgLight: 'bg-green-50',
    },
    writing: {
      name: 'Writing Agent',
      icon: BookOpen,
      color: 'purple',
      bgColor: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      borderColor: 'border-purple-300',
      bgLight: 'bg-purple-50',
    },
    character: {
      name: 'Character Agent',
      icon: Users,
      color: 'orange',
      bgColor: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      borderColor: 'border-orange-300',
      bgLight: 'bg-orange-50',
    },
    emotion: {
      name: 'Emotion Agent',
      icon: Brain,
      color: 'rose',
      bgColor: 'bg-rose-500',
      hoverColor: 'hover:bg-rose-600',
      borderColor: 'border-rose-300',
      bgLight: 'bg-rose-50',
    },
    style: {
      name: 'Style Agent',
      icon: Settings,
      color: 'indigo',
      bgColor: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      borderColor: 'border-indigo-300',
      bgLight: 'bg-indigo-50',
    },
  };

  const config = agentConfig[agentType];
  const IconComponent = config.icon;

  const handleClick = () => {
    onAgentClick(agentType);
  };

  return (
    <div
      onClick={handleClick}
      className={`border rounded-lg p-4 transition-all duration-300 cursor-pointer hover:shadow-lg ${
        isActive
          ? `${config.borderColor} ${config.bgLight}`
          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isActive
              ? `${config.bgColor} text-white`
              : 'bg-gray-300 text-gray-600'
          }`}
        >
          <IconComponent className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">{config.name}</h3>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                processing
                  ? 'bg-yellow-500 animate-pulse'
                  : isActive
                    ? 'bg-green-500'
                    : 'bg-gray-400'
              }`}
            />
            <span className="text-xs text-gray-600">
              {processing ? 'Processing...' : isActive ? 'Active' : 'Standby'}
            </span>
          </div>
        </div>
      </div>

      {mode === 'MANUAL' && (
        <button
          onClick={e => {
            e.stopPropagation();
            simulateResponse();
          }}
          disabled={processing}
          className={`w-full py-2 px-3 text-sm rounded-md transition-colors ${
            processing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : `${config.bgColor} text-white ${config.hoverColor}`
          }`}
        >
          {processing ? 'Processing...' : 'Run Analysis'}
        </button>
      )}

      {response && (
        <div className="mt-3 p-3 bg-white rounded border text-sm">
          <p className="text-gray-700">{response}</p>
        </div>
      )}
    </div>
  );
};

// Main Demo Component
const Demo = () => {
  const { user } = useAuth(); // Integration with your auth context
  const [mode, setMode] = useState('MANUAL');
  const [activeAgents, setActiveAgents] = useState([]);
  const [responses, setResponses] = useState({});
  const [demoStep, setDemoStep] = useState(0);
  const [hasClickedStartDemo, setHasClickedStartDemo] = useState(false);

  const modes = [
    {
      value: 'MANUAL',
      label: 'Manual',
      description: 'You control each agent individually',
    },
    {
      value: 'HYBRID',
      label: 'Hybrid',
      description: 'AI suggests next steps, you approve',
    },
    {
      value: 'FULLY_AUTO',
      label: 'Full Auto',
      description: 'AI agents work collaboratively',
    },
  ];

  const agentTypes = [
    'research',
    'outline',
    'writing',
    'character',
    'emotion',
    'style',
  ];

  const handleModeChange = newMode => {
    setMode(newMode);
    setResponses({});

    if (newMode === 'FULLY_AUTO') {
      setActiveAgents(agentTypes);
    } else if (newMode === 'HYBRID') {
      setActiveAgents(['research', 'outline']);
    } else {
      setActiveAgents([]);
    }
  };

  const handleAgentResponse = (agentType, response) => {
    setResponses(prev => ({
      ...prev,
      [agentType]: response,
    }));
  };

  const handleAgentClick = agentType => {
    if (window.demoAssistantHandleClick) {
      window.demoAssistantHandleClick('agent', agentType);
    }
  };

  const handleModeClick = mode => {
    if (window.demoAssistantHandleClick) {
      window.demoAssistantHandleClick('mode', mode);
    }
  };

  const handleFeatureClick = featureType => {
    if (window.demoAssistantHandleClick) {
      window.demoAssistantHandleClick('feature', featureType);
    }
  };

  const startDemo = () => {
    setHasClickedStartDemo(true);
    setDemoStep(1);
    handleModeChange('HYBRID');
    setTimeout(() => setDemoStep(2), 3000);
    setTimeout(() => handleModeChange('FULLY_AUTO'), 5000);
    setTimeout(() => setDemoStep(3), 8000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background Animations and Overlays */}
      {/* Removed enhanced background animations, overlays, and visual effects */}

      {/* AI Demo Assistant */}
      <DemoAssistant
        demoStep={demoStep}
        mode={mode}
        activeAgents={activeAgents}
        responses={responses}
        hasClickedStartDemo={hasClickedStartDemo}
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              DocCraft-AI v3
              <span className="block text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mt-2">
                Multi-Agent Writing Platform
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Experience the power of collaborative AI agents working together
              to transform your writing process. From research to final draft,
              our intelligent system adapts to your creative workflow.
            </p>

            {demoStep === 0 && (
              <button
                onClick={startDemo}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                <Play className="w-5 h-5" />
                Start Interactive Demo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mode Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Choose Your AI Collaboration Mode
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {modes.map(modeOption => (
              <button
                key={modeOption.value}
                onClick={() => {
                  handleModeChange(modeOption.value);
                  if (demoStep >= 3) handleModeClick(modeOption.value);
                }}
                className={`p-6 rounded-xl border-2 transition-all duration-300 text-left hover:shadow-lg ${
                  mode === modeOption.value
                    ? 'border-blue-600 bg-blue-600/10 shadow-lg scale-105'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                } ${demoStep >= 3 ? 'cursor-pointer' : ''}`}
              >
                <h3 className="font-bold text-lg mb-2">{modeOption.label}</h3>
                <p className="text-gray-600 text-sm">
                  {modeOption.description}
                </p>
                {demoStep >= 3 && (
                  <p className="text-blue-600 text-xs mt-2">
                    💡 Click to learn more
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Demo Steps */}
        {demoStep > 0 && (
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-full">
              <Zap className="w-4 h-4 text-yellow-600" />
              <span className="text-yellow-800 font-medium">
                {demoStep === 1 &&
                  'Demo: Starting with Hybrid mode - AI suggests, you approve'}
                {demoStep === 2 &&
                  'Demo: Switching to Full Auto - Watch agents collaborate'}
                {demoStep === 3 &&
                  'Demo: Complete! All agents have contributed to your story'}
              </span>
            </div>
          </div>
        )}

        {/* AI Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {agentTypes.map(agentType => (
            <AIAgentDemo
              key={agentType}
              mode={mode}
              isActive={activeAgents.includes(agentType)}
              agentType={agentType}
              onResponse={handleAgentResponse}
              onAgentClick={handleAgentClick}
            />
          ))}
        </div>

        {/* Results Summary */}
        {Object.keys(responses).length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              AI Collaboration Results
            </h3>
            <div className="space-y-4">
              {Object.entries(responses).map(([agentType, response]) => (
                <div
                  key={agentType}
                  className="border-l-4 border-blue-600 pl-4"
                >
                  <h4 className="font-semibold text-gray-900 capitalize mb-1">
                    {agentType} Agent Output
                  </h4>
                  <p className="text-gray-700 text-sm">{response}</p>
                </div>
              ))}
            </div>

            {Object.keys(responses).length >= 3 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">
                  🎉 Collaborative Success!
                </h4>
                <p className="text-green-800 text-sm">
                  Your AI agents have successfully collaborated to enhance your
                  writing project. The multi-modal approach ensures
                  comprehensive story development from multiple perspectives.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Brain,
              title: 'Psychological Analysis',
              description:
                'Deep character psychology and emotional arc mapping',
              featureType: 'psychology',
            },
            {
              icon: Target,
              title: 'Plot Structure',
              description: 'Intelligent story pacing and narrative framework',
              featureType: 'plot',
            },
            {
              icon: Users,
              title: 'Real-time Collaboration',
              description: 'Multi-user editing with conflict resolution',
              featureType: 'collaboration',
            },
            {
              icon: Zap,
              title: 'Adaptive AI',
              description:
                'Context-aware assistance that evolves with your style',
              featureType: 'adaptive',
            },
          ].map((feature, index) => (
            <div
              key={index}
              onClick={() =>
                demoStep >= 3 && handleFeatureClick(feature.featureType)
              }
              className={`text-center p-6 transition-all duration-300 rounded-lg ${
                demoStep >= 3
                  ? 'cursor-pointer hover:bg-gray-50 hover:shadow-md'
                  : ''
              }`}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
              {demoStep >= 3 && (
                <p className="text-blue-600 text-xs mt-2">
                  💡 Click to learn more
                </p>
              )}
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Writing?
          </h2>
          <p className="text-xl opacity-90 mb-6">
            Join thousands of writers using AI-powered collaboration to create
            better stories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <button
                onClick={() => (window.location.href = '/dashboard')}
                className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Go to Dashboard
              </button>
            ) : (
              <button
                onClick={() => (window.location.href = '/signup')}
                className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Start Free Trial
              </button>
            )}
            <button
              onClick={() => (window.location.href = '/pricing')}
              className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              View Pricing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;

// =============================================================================
// STEP 2: Update Your App.tsx Route Configuration
// =============================================================================
// Make sure your routing in src/App.tsx includes the demo route:

/*
// In your App.tsx file, ensure you have:
import Demo from './pages/Demo';

// In your routes configuration:
<Route path="/demo" element={<Demo />} />
*/

// =============================================================================
// STEP 3: Update Your Navigation Component
// =============================================================================
// Add demo link to your navigation (likely in src/components/Header.tsx or similar):

/*
// Add this to your navigation links:
<Link 
  to="/demo" 
  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
>
  Demo
</Link>
*/

// =============================================================================
// STEP 4: Ensure Required Dependencies
// =============================================================================
// Make sure these packages are installed (they should already be in your project):

/*
npm install react-hot-toast lucide-react
*/

// =============================================================================
// STEP 5: Optional - Add Demo Analytics Tracking
// =============================================================================
// If you want to track demo interactions, add this to your Demo component:

/*
import { AuditLogger } from '../services/AuditLogger'; // Your existing audit service

// Add these tracking calls in your Demo component:
const trackDemoEvent = (event, data) => {
  AuditLogger.logAuditEvent({
    action: `demo_${event}`,
    resource: 'demo_page',
    details: data,
    user_id: user?.id || 'anonymous'
  });
};

// Then call trackDemoEvent at key points:
// - When demo starts: trackDemoEvent('started', { mode: 'HYBRID' })
// - When user clicks agents: trackDemoEvent('agent_clicked', { agent: agentType })
// - When demo completes: trackDemoEvent('completed', { responses: Object.keys(responses) })
*/

// =============================================================================
// STEP 6: CSS Considerations for Your Existing Styles
// =============================================================================
// The demo uses Tailwind classes that should work with your existing setup.
// If you have custom CSS that might conflict, add this to your global CSS:

// =============================================================================
// STEP 7: Error Boundary Integration
// =============================================================================
// Wrap the Demo page in your existing error boundary to handle the ModeErrorBoundary issue:

/*
// In your App.tsx or wherever you define routes:
import { ErrorBoundary } from './components/ErrorBoundary'; // Your existing error boundary

<Route 
  path="/demo" 
  element={
    <ErrorBoundary>
      <Demo />
    </ErrorBoundary>
  } 
/>
*/

// =============================================================================
// STEP 8: Testing Checklist
// =============================================================================
/*
✅ Demo page loads without errors
✅ AI Assistant appears after 7 seconds
✅ Start Demo button works and triggers mode changes
✅ All 6 agent panels display correctly
✅ Click explanations work after demo completion
✅ Mode selection panels are clickable post-demo
✅ Feature tiles provide explanations when clicked
✅ Chat functionality works (send messages, quick questions)
✅ Assistant can be minimized/maximized/closed
✅ Responsive design works on mobile
✅ Navigation to/from demo page works
✅ CTA buttons redirect correctly based on auth state
*/

// =============================================================================
// STEP 9: Optional Customizations
// =============================================================================
// You can customize these aspects to match your brand:

/*
// Color scheme - update these CSS classes:
from-blue-600 to-purple-600  // Main gradient
bg-blue-50                   // Light background
border-blue-500              // Active borders
text-blue-600               // Accent text

// Timing adjustments:
7000  // Assistant auto-open delay (7 seconds)
3000  // Demo step 1 duration
5000  // Demo step 2 start time
8000  // Demo step 3 start time

// Content customization:
- Update the explanations in the `explanations` object
- Modify the agent response simulations
- Customize the quick question buttons
- Adjust the CTA section content
*/
