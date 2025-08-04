import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  Palette,
  MessageCircle,
  Lightbulb,
} from "lucide-react";
import { useDocCraftAgent } from "../contexts/AgentContext";
import DocCraftAgentChat from "../../modules/agent/components/DocCraftAgentChat";
import { useMCP } from "../useMCP";

interface DemoStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: number;
  status: "pending" | "active" | "completed" | "error";
}

// Confetti Explosion Component
const ConfettiExplosion = () => {
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rotation: number;
      rotationSpeed: number;
      shape: "circle" | "square" | "triangle" | "star";
    }>
  >([]);

  useEffect(() => {
    // Get the demo section element to confine confetti to that area
    const demoSection = document.querySelector(
      ".lg\\:col-span-2"
    ) as HTMLElement;
    if (!demoSection) return;

    const demoRect = demoSection.getBoundingClientRect();

    // Create confetti particles that explode from the center of the demo section
    const newParticles = Array.from({ length: 300 }, (_, i) => {
      const centerX = demoRect.left + demoRect.width / 2;
      const centerY = demoRect.top + demoRect.height / 2;

      return {
        id: i,
        x: centerX + (Math.random() - 0.5) * demoRect.width, // Spread across demo section width
        y: centerY + (Math.random() - 0.5) * demoRect.height, // Spread across demo section height
        vx: (Math.random() - 0.5) * 4, // Slower horizontal spread
        vy: Math.random() * 2 + 1.5, // Slower upward explosion then gentle fall
        color: [
          "#ff6b6b",
          "#4ecdc4",
          "#45b7d1",
          "#96ceb4",
          "#feca57",
          "#ff9ff3",
          "#54a0ff",
          "#5f27cd",
          "#ff9f43",
          "#00d2d3",
          "#ff6348",
          "#2ed573",
          "#1e90ff",
          "#ffa502",
          "#ff4757",
        ][Math.floor(Math.random() * 15)],
        size: Math.random() * 8 + 4, // Reverted to original size
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 6, // Slower rotation
        shape: ["circle", "square", "triangle", "star"][
          Math.floor(Math.random() * 4)
        ] as "circle" | "square" | "triangle" | "star",
      };
    });
    setParticles(newParticles);

    // Animate confetti with explosion effect then gentle fall
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vy: particle.vy + 0.08, // Gentler gravity for slower fall
            rotation: particle.rotation + particle.rotationSpeed,
          }))
          .filter((particle) => particle.y < window.innerHeight + 50)
      );
    }, 24); // Slower animation (was 16)

    // Clean up after 6 seconds
    const cleanup = setTimeout(() => {
      setParticles([]);
    }, 6000);

    return () => {
      clearInterval(interval);
      clearTimeout(cleanup);
    };
  }, []);

  const renderParticle = (particle: any) => {
    const baseStyle = {
      left: particle.x,
      top: particle.y,
      width: particle.size,
      height: particle.size,
      backgroundColor: particle.color,
      transform: `rotate(${particle.rotation}deg)`,
      position: "absolute" as const,
    };

    switch (particle.shape) {
      case "circle":
        return (
          <div
            key={particle.id}
            className="rounded-full animate-bounce"
            style={baseStyle}
          />
        );
      case "square":
        return (
          <div key={particle.id} className="animate-spin" style={baseStyle} />
        );
      case "triangle":
        return (
          <div
            key={particle.id}
            className="animate-pulse"
            style={{
              ...baseStyle,
              clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            }}
          />
        );
      case "star":
        return (
          <div
            key={particle.id}
            className="animate-ping"
            style={{
              ...baseStyle,
              clipPath:
                "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
            }}
          />
        );
      default:
        return (
          <div
            key={particle.id}
            className="rounded-full animate-bounce"
            style={baseStyle}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(renderParticle)}
    </div>
  );
};

export default function Demo() {
  const navigate = useNavigate();
  
  /* MCP: { role: "curator", allowedActions: ["refactor", "animate", "style", "organize", "present"] } */
  const ctx = useMCP("Demo.tsx");

  // Add error handling for the agent context
  let sendAgentGreeting: any = () => {};
  try {
    const agentContext = useDocCraftAgent();
    sendAgentGreeting = agentContext.sendAgentGreeting || (() => {});
  } catch (error) {
    console.warn("Agent context not available:", error);
  }

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [agentActivated, setAgentActivated] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Use ref to track current step for the timeout
  const currentStepRef = useRef(currentStep);
  currentStepRef.current = currentStep;

  // Listen for agent state changes
  useEffect(() => {
    const handleAgentToggle = (event: Event) => {
      const customEvent = event as CustomEvent;
      setAgentOpen(customEvent.detail.isOpen);
    };

    window.addEventListener("agent-toggle", handleAgentToggle);
    return () => window.removeEventListener("agent-toggle", handleAgentToggle);
  }, []);

  // Auto-open AI agent after reading time
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!agentActivated) {
        setAgentActivated(true);
        console.log("Agent activated - will auto-open with welcome message");
      }
    }, 30000); // 30 seconds - adequate time for average to slow readers

    return () => clearTimeout(timer);
  }, [agentActivated]);

  const demoSteps: DemoStep[] = [
    {
      id: "document-upload",
      title: "Document Upload & Analysis",
      description:
        "Upload your document and watch AI analyze its structure, tone, and content",
      icon: <FileText className="w-6 h-6" />,
      duration: 15000, // 15 seconds - extended for reading time
      status: "pending",
    },
    {
      id: "ai-enhancement",
      title: "AI-Powered Enhancement",
      description:
        "See how AI improves your content with intelligent suggestions and corrections",
      icon: <Sparkles className="w-6 h-6" />,
      duration: 12000, // 12 seconds - extended for reading time
      status: "pending",
    },
    {
      id: "ebook-analysis",
      title: "Ebook Analysis & Creation",
      description:
        "Analyze existing ebooks and create compelling new content with AI assistance",
      icon: <BookOpen className="w-6 h-6" />,
      duration: 14000, // 14 seconds - extended for reading time
      status: "pending",
    },
    {
      id: "character-development",
      title: "Character Development",
      description:
        "Create rich, multi-dimensional characters with AI-powered development tools",
      icon: <Brain className="w-6 h-6" />,
      duration: 12000, // 12 seconds - extended for reading time
      status: "pending",
    },
    {
      id: "collaboration",
      title: "Real-Time Collaboration",
      description:
        "Work together seamlessly with real-time editing and feedback integration",
      icon: <Users className="w-6 h-6" />,
      duration: 10000, // 10 seconds - extended for reading time
      status: "pending",
    },
    {
      id: "analytics",
      title: "Advanced Analytics",
      description:
        "Track performance and engagement with comprehensive analytics and insights",
      icon: <BarChart3 className="w-6 h-6" />,
      duration: 12000, // 12 seconds - extended for reading time
      status: "pending",
    },
    {
      id: "personalization",
      title: "Personalized Experience",
      description:
        "AI adapts to your unique writing style and preferences for optimal results",
      icon: <Settings className="w-6 h-6" />,
      duration: 10000, // 10 seconds - extended for reading time
      status: "pending",
    },
  ];

  // Auto-activate AI assistant on page load
  useEffect(() => {
    if (!agentActivated) {
      const timer = setTimeout(() => {
        setAgentActivated(true);
        // The original code had a duplicate welcome message here.
        // It's removed as per the edit hint to remove duplicate welcome messages.
      }, 1500); // 1.5 second delay for better UX

      return () => clearTimeout(timer);
    }
  }, [agentActivated]);

  // Handle step selection
  const handleStepClick = (stepIndex: number) => {
    console.log(
      `User clicked step panel ${stepIndex + 1}, activating demo content`
    );

    // Update current step and progress immediately
    setCurrentStep(stepIndex);
    setProgress((stepIndex / demoSteps.length) * 100);

    console.log(`Current step updated to: ${stepIndex + 1}`);

    // Stop auto-progression when user manually clicks a step
    if (isPlaying) {
      console.log("Stopping auto-progression due to manual step selection");
      setIsPlaying(false);
    }

    // Force immediate re-render
    setTimeout(() => {
      console.log(`Demo content should now display for step ${stepIndex + 1}`);
      console.log(`Current step state: ${currentStep + 1}`);
    }, 0);

    // Send step-specific guidance to the agent
    const stepGuidance = getStepGuidance(stepIndex);
    if (stepGuidance) {
      console.log(
        `User clicked step ${stepIndex + 1}:`,
        stepGuidance.substring(0, 100) + "..."
      );
      try {
        sendAgentGreeting(stepGuidance);
        console.log("Agent guidance sent successfully");
      } catch (error) {
        console.error("Failed to send agent guidance:", error);
      }
    }

    // Force a re-render to ensure demo content updates
    setTimeout(() => {
      console.log(`Demo content should now display for step ${stepIndex + 1}`);
    }, 100);
  };

  // Demo progression logic - auto-advance through steps
  useEffect(() => {
    if (!isPlaying) return;

    console.log(
      `Starting timer for step ${currentStep + 1}, duration: ${
        demoSteps[currentStep].duration
      }ms`
    );

    const stepTimer = setTimeout(() => {
      console.log(
        `Timer completed for step ${currentStep + 1}, advancing to next step`
      );

      if (currentStep < demoSteps.length - 1) {
        const nextStep = currentStep + 1;
        console.log(
          `Advancing from step ${currentStep + 1} to step ${nextStep + 1}`
        );
        setCurrentStep(nextStep);

        // Send step-specific guidance to the agent
        const stepGuidance = getStepGuidance(nextStep);
        if (stepGuidance) {
          setTimeout(() => {
            console.log(
              `Auto-advancing to step ${nextStep + 1}:`,
              stepGuidance.substring(0, 100) + "..."
            );
            try {
              sendAgentGreeting(stepGuidance);
              console.log("Agent guidance sent successfully");
            } catch (error) {
              console.error("Failed to send agent guidance:", error);
            }
          }, 500); // Small delay to let the step transition complete
        }
      } else {
        // Demo completed
        console.log("Demo completed - all steps finished");
        setIsPlaying(false);
        setShowResults(true);
        setShowConfetti(true); // Trigger confetti explosion

        // Send completion message
        setTimeout(() => {
          sendAgentGreeting(`🎉 **Demo Complete!** 

Congratulations! You've just witnessed the full power of DocCraft-AI in action. Here's what we've demonstrated:

✅ **Document Upload & Analysis** - AI analyzed your document structure and provided actionable insights
✅ **AI-Powered Enhancement** - Intelligent suggestions improved your content quality
✅ **Ebook Analysis & Creation** - Deep insights into existing content and creation guidance
✅ **Character Development** - Rich, multi-dimensional character creation with AI
✅ **Real-Time Collaboration** - Seamless teamwork and feedback integration
✅ **Advanced Analytics** - Performance insights and engagement metrics
✅ **Personalized Experience** - AI adapting to your unique writing style

**Ready to experience this with your own documents?** 

Do you have any questions about what you've seen or how DocCraft-AI can help with your specific projects?`);
        }, 1000);
      }
    }, demoSteps[currentStep].duration);

    return () => {
      console.log(`Clearing timer for step ${currentStep + 1}`);
      clearTimeout(stepTimer);
    };
  }, [isPlaying, currentStep, demoSteps.length]);

  // Progress calculation
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress(() => {
        const stepProgress =
          (Date.now() % demoSteps[currentStep].duration) /
          demoSteps[currentStep].duration;
        return ((currentStep + stepProgress) / demoSteps.length) * 100;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, currentStep, demoSteps.length]);

  const handlePlay = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    setProgress(0);
    setShowResults(false);

    // Send initial Step 1 guidance
    setTimeout(() => {
      const stepGuidance = getStepGuidance(0);
      if (stepGuidance) {
        console.log(
          "Sending initial Step 1 guidance:",
          stepGuidance.substring(0, 100) + "..."
        );
        try {
          sendAgentGreeting(stepGuidance);
          console.log("Initial agent guidance sent successfully");
        } catch (error) {
          console.error("Failed to send initial agent guidance:", error);
        }
      }
    }, 1000); // 1 second delay to let the demo start

    // Auto-scroll to progress bar after a short delay
    setTimeout(() => {
      // Specifically target the Demo Progress section
      const progressSection = document.getElementById("demo-progress");
      if (progressSection) {
        progressSection.scrollIntoView({
          behavior: "smooth",
          block: "start", // Position at top of viewing area
          inline: "nearest",
        });
      } else {
        // Fallback: look for any element containing "Demo Progress" text
        const elements = document.querySelectorAll("*");
        for (const element of elements) {
          if (
            element.textContent &&
            element.textContent.includes("Demo Progress")
          ) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "nearest",
            });
            break;
          }
        }
      }
    }, 300);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setProgress(0);
    setShowResults(false);
  };

  const getStepStatus = (index: number) => {
    // If demo is completed (showResults is true), all steps should be accessible
    if (showResults) {
      if (index === currentStep) return "active";
      return "completed"; // All steps are considered completed but clickable
    }
    
    // During demo progression
    if (index < currentStep) return "completed";
    if (index === currentStep) return "active";
    return "pending";
  };

  // Enhanced step highlighting with animation states
  const getStepHighlightClass = (index: number) => {
    const status = getStepStatus(index);
    const baseClasses = "transition-all duration-500 ease-in-out transform cursor-pointer hover:scale-105";

    if (status === "active") {
      return `${baseClasses} scale-105 shadow-lg ring-2 ring-blue-400 ring-opacity-50 animate-pulse`;
    } else if (status === "completed") {
      return `${baseClasses} scale-100 shadow-md hover:shadow-lg`;
    } else {
      return `${baseClasses} scale-95 opacity-75 hover:opacity-100`;
    }
  };

  const getStepIconClass = (index: number) => {
    const status = getStepStatus(index);
    const baseClasses = "transition-all duration-300 ease-in-out";

    if (status === "active") {
      return `${baseClasses} text-blue-600 dark:text-blue-400 animate-bounce`;
    } else if (status === "completed") {
      return `${baseClasses} text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300`;
    } else {
      return `${baseClasses} text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400`;
    }
  };

  // Function to get step-specific guidance
  const getStepGuidance = (stepIndex: number) => {
    const stepMessages = {
      0: `📄 **Step 1: Document Upload & Analysis**

Watch how DocCraft-AI intelligently analyzes your document! Right now, we're:

🔍 **Analyzing Structure** - AI is examining your document's organization and flow
🎯 **Detecting Tone** - Understanding the emotional and stylistic elements
💡 **Finding Insights** - Identifying key areas for improvement and enhancement

The AI is processing "The Great Gatsby" (45,000 words) and will provide:
• Engagement score and readability metrics
• Specific improvement opportunities
• Actionable recommendations for enhancement

This is just the beginning - wait until you see how AI can transform your content!

Do you have any questions about the document analysis process?`,

      1: `✨ **Step 2: AI-Powered Enhancement**

Now we're seeing AI's magic in action! The system is:

🚀 **Generating Improvements** - AI is suggesting enhancements to make your content more engaging
📝 **Refining Language** - Transforming basic text into compelling prose
🎨 **Enhancing Style** - Adding sophistication while maintaining your voice

Watch how "The quick brown fox jumps over the lazy dog" becomes "The swift brown fox leaps gracefully over the slumbering canine" - more vivid, more engaging, more professional.

This is where AI becomes your writing partner, helping you create content that truly resonates with readers.

Do you have any questions about how AI enhancement works?`,

      2: `📚 **Step 3: Ebook Analysis & Creation**

This is where DocCraft-AI really shines! We're now:

📖 **Analyzing Existing Content** - AI is examining ebook structure and narrative flow
🎯 **Identifying Patterns** - Finding what makes content successful and engaging
🔄 **Generating Insights** - Creating actionable recommendations for improvement

The AI has analyzed your ebook and found:
• Strong narrative arc with engaging characters
• Well-executed plot twists and perfect pacing
• Opportunities for deeper character development

This analysis helps you understand what works and how to make it even better!

Do you have any questions about ebook analysis and creation?`,

      3: `👥 **Step 4: Character Development**

Now we're diving into character creation! DocCraft-AI is:

🎭 **Analyzing Character Depth** - Understanding personality, motivations, and growth arcs
🧠 **Creating Backstories** - Developing rich, believable character histories
💫 **Building Relationships** - Crafting dynamic interactions between characters

The AI has identified:
• Complex, multi-dimensional protagonist with clear backstory
• Equally compelling antagonist with strong motivations
• Opportunities for deeper character development

This is where your characters come to life with AI assistance!

Do you have any questions about character development with AI?`,

      4: `🤝 **Step 5: Real-Time Collaboration**

Experience seamless teamwork! Right now we're demonstrating:

👥 **Team Integration** - Multiple users working on the same document
💬 **Live Feedback** - Real-time comments and suggestions
🔄 **Version Control** - Tracking changes and maintaining document integrity

Watch how team members can:
• Add suggestions and improvements
• Provide instant feedback
• Collaborate without conflicts

This is how modern teams create amazing content together!

Do you have any questions about real-time collaboration features?`,

      5: `📊 **Step 6: Advanced Analytics**

Now we're exploring the data! DocCraft-AI is showing:

📈 **Performance Metrics** - Engagement scores, readability, and audience response
🎯 **Content Insights** - What's working and what can be improved
📋 **Trend Analysis** - Understanding patterns in successful content

The analytics reveal:
• Engagement patterns and reader behavior
• Content performance across different metrics
• Opportunities for optimization

This data helps you create content that truly connects with your audience!

Do you have any questions about the analytics and insights?`,

      6: `🎯 **Step 7: Personalized Experience**

The final step shows AI adaptation! We're demonstrating:

🧠 **Learning Your Style** - AI adapting to your unique writing preferences
🎨 **Personalized Suggestions** - Recommendations tailored to your voice
🔄 **Continuous Improvement** - AI getting better at helping you over time

The system has learned:
• Your preferred writing style and tone
• Your common patterns and preferences
• How to enhance your work while maintaining your voice

This is where AI becomes your personal writing assistant!

Do you have any questions about the personalized AI experience?`,
    };

    return stepMessages[stepIndex as keyof typeof stepMessages];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Simple error boundary */}
      <div className="w-full h-full">
        {/* Header */}
        <div
          className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 transition-all duration-300 ${
            agentOpen ? "mr-80 md:mr-96" : ""
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate("/")}
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

        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ${
            agentOpen ? "mr-80 md:mr-96" : ""
          }`}
        >
          {/* Agent Status Indicator */}
          {agentOpen && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  💬 AI Assistant is active - Ask me anything about the demo!
                </span>
              </div>
            </div>
          )}
          {/* Demo Instructions */}
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Welcome to the DocCraft-AI Demo! 🤖
                </h2>
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                  <p className="text-base">
                    This interactive demo showcases the powerful features of
                    DocCraft-AI. Here's how to get the most out of it:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm">
                        Click <strong>"Start Demo"</strong> to begin the
                        automated walkthrough
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm">
                        Use <strong>"Pause"</strong> and{" "}
                        <strong>"Restart"</strong> to control the demo
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm">
                        Watch the <strong>progress bar</strong> to track demo
                        completion
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm">
                        Our <strong>AI Assistant</strong> is here to help - just
                        ask questions!
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        💡 Pro Tip: The AI Assistant will automatically greet
                        you and offer to guide you through the demo. Feel free
                        to ask questions about any feature!
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div id="demo-progress" className="demo-progress-section mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Demo Progress
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Step {currentStep + 1} of {demoSteps.length}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-in-out shadow-lg"
                style={{ width: `${progress}%` }}
              />
              {/* Step markers */}
              <div className="absolute inset-0 flex justify-between items-center px-2">
                {demoSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index <= currentStep
                        ? "bg-white shadow-sm"
                        : "bg-gray-400 dark:bg-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Demo Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Demo Area */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 relative overflow-hidden">
                {/* Step Indicator - Positioned on demo content */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Step {currentStep + 1} of {demoSteps.length}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {demoSteps[currentStep]?.title}
                    </div>
                  </div>
                </div>
                {!showResults ? (
                  <div className="text-center relative">
                    {currentStep < demoSteps.length && (
                      <div className="space-y-6">
                        {/* Active Step Highlight Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl pointer-events-none transition-opacity duration-1000"></div>

                        <div className="flex justify-center relative z-10">
                          <div
                            className={`p-6 rounded-full transition-all duration-500 ease-in-out transform ${
                              getStepStatus(currentStep) === "active"
                                ? "bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800 dark:to-purple-800 text-blue-600 dark:text-blue-400 shadow-lg ring-4 ring-blue-200 dark:ring-blue-700 scale-110 animate-pulse"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {demoSteps[currentStep].icon}
                          </div>
                        </div>
                        <div className="relative z-10">
                          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {demoSteps[currentStep].title}
                          </h2>
                          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-4 rounded-full"></div>
                          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            {demoSteps[currentStep].description}
                          </p>
                        </div>

                        {/* Animated Demo Content */}
                        <div className="mt-8 relative">
                          <div className="transition-all duration-700 ease-in-out transform hover:scale-105">
                            {currentStep === 0 && (
                              <div>
                                <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                                  🎯 ACTIVE: Step 1 - Document Upload & Analysis
                                </div>
                                <DocumentUploadDemo />
                              </div>
                            )}
                            {currentStep === 1 && (
                              <div>
                                <div className="text-sm font-bold text-purple-600 dark:text-purple-400 mb-4 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                                  🎯 ACTIVE: Step 2 - AI-Powered Enhancement
                                </div>
                                <AIEnhancementDemo />
                              </div>
                            )}
                            {currentStep === 2 && (
                              <div>
                                <div className="text-sm font-bold text-green-600 dark:text-green-400 mb-4 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                                  🎯 ACTIVE: Step 3 - Ebook Analysis & Creation
                                </div>
                                <EbookAnalysisDemo />
                              </div>
                            )}
                            {currentStep === 3 && (
                              <div>
                                <div className="text-sm font-bold text-orange-600 dark:text-orange-400 mb-4 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                                  🎯 ACTIVE: Step 4 - Character Development
                                </div>
                                <CharacterDevelopmentDemo />
                              </div>
                            )}
                            {currentStep === 4 && (
                              <div>
                                <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-4 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700">
                                  🎯 ACTIVE: Step 5 - Real-Time Collaboration
                                </div>
                                <CollaborationDemo />
                              </div>
                            )}
                            {currentStep === 5 && (
                              <div>
                                <div className="text-sm font-bold text-teal-600 dark:text-teal-400 mb-4 p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-700">
                                  🎯 ACTIVE: Step 6 - Advanced Analytics
                                </div>
                                <AnalyticsDemo />
                              </div>
                            )}
                            {currentStep === 6 && (
                              <div>
                                <div className="text-sm font-bold text-pink-600 dark:text-pink-400 mb-4 p-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-700">
                                  🎯 ACTIVE: Step 7 - Personalized Experience
                                </div>
                                <PersonalizationDemo />
                              </div>
                            )}
                          </div>

                          {/* Step transition overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 dark:from-blue-900/10 dark:to-purple-900/10 rounded-lg pointer-events-none transition-opacity duration-1000"></div>

                          {/* Active step indicator */}
                          <div className="absolute top-2 right-2">
                            <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                              {currentStep + 1}
                            </div>
                          </div>
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
                      onClick={() => handleStepClick(index)}
                      className={`flex items-center space-x-3 p-4 rounded-lg transition-all duration-500 ease-in-out transform cursor-pointer hover:scale-105 ${getStepHighlightClass(
                        index
                      )} ${
                        getStepStatus(index) === "completed"
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-800/30 dark:hover:to-emerald-800/30"
                          : getStepStatus(index) === "active"
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800/30 dark:hover:to-purple-800/30"
                          : "bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 ${getStepIconClass(index)}`}
                      >
                        {getStepStatus(index) === "completed" ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <div className="w-6 h-6">{step.icon}</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium transition-colors duration-300 ${
                            getStepStatus(index) === "completed"
                              ? "text-green-800 dark:text-green-200"
                              : getStepStatus(index) === "active"
                              ? "text-blue-800 dark:text-blue-200"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {step.title}
                        </p>
                        <p
                          className={`text-xs transition-colors duration-300 ${
                            getStepStatus(index) === "completed"
                              ? "text-green-600 dark:text-green-400"
                              : getStepStatus(index) === "active"
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {step.description}
                        </p>
                        {getStepStatus(index) === "active" && (
                          <div className="mt-2 flex items-center space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                              Active
                            </span>
                          </div>
                        )}
                        {/* Show "Click to Review" for completed steps after demo completion */}
                        {showResults && getStepStatus(index) === "completed" && (
                          <div className="mt-2 flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                              Click to Review
                            </span>
                          </div>
                        )}
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
                Experience the full power of DocCraft-AI with your own
                documents. Sign up now and start transforming your content
                creation workflow.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/signup")}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 border border-gray-200 dark:border-gray-600"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Assistant */}
        <DocCraftAgentChat autoOpen={agentActivated} />
        {showConfetti && <ConfettiExplosion />}
      </div>
    </div>
  );
}

// Demo Components
const DocumentUploadDemo = () => (
  <div className="space-y-6">
    {/* Step 1: Upload Animation */}
    <div className="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
      <div className="animate-bounce mb-4">
        <FileText className="w-16 h-16 mx-auto text-blue-500" />
      </div>
      <p className="text-blue-800 dark:text-blue-200 font-medium mb-2">
        📄 Uploading your document...
      </p>
      <div className="w-full bg-blue-200 dark:bg-blue-700 rounded-full h-2 mb-4">
        <div
          className="bg-blue-500 h-2 rounded-full animate-pulse"
          style={{ width: "85%" }}
        ></div>
      </div>
      <p className="text-sm text-blue-600 dark:text-blue-300">
        "The Great Gatsby" - 45,000 words
      </p>
    </div>

    {/* Step 2: AI Analysis Animation */}
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
      <div className="flex items-center justify-center mb-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mr-3"></div>
        <span className="text-purple-800 dark:text-purple-200 font-semibold">
          AI Analysis in Progress...
        </span>
      </div>

      {/* Analysis Results Animation */}
      <div className="space-y-3">
        <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Structure Analysis: Complete
          </span>
        </div>
        <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Tone Detection: In Progress
          </span>
        </div>
        <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Content Insights: Analyzing
          </span>
        </div>
      </div>
    </div>

    {/* Step 3: Analysis Results */}
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
      <h4 className="text-green-800 dark:text-green-200 font-semibold mb-4 flex items-center">
        <CheckCircle className="w-5 h-5 mr-2" />
        Analysis Complete!
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            85%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Engagement Score
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            12
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Key Insights Found
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            3
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Enhancement Opportunities
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            2.5min
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Processing Time
          </div>
        </div>
      </div>
    </div>

    {/* Key Insight Highlight */}
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
      <div className="flex items-start space-x-3">
        <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-yellow-800 dark:text-yellow-200 font-medium text-sm">
            💡 Key Insight: Your narrative structure is strong, but character
            development could be enhanced for deeper reader engagement.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const AIEnhancementDemo = () => (
  <div className="space-y-6">
    {/* Step 1: Original Content */}
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
      <h4 className="text-gray-800 dark:text-gray-200 font-semibold mb-3 flex items-center">
        <FileText className="w-4 h-4 mr-2" />
        Original Content
      </h4>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
        <p className="text-gray-700 dark:text-gray-300 text-sm italic">
          "The quick brown fox jumps over the lazy dog."
        </p>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Basic sentence - needs enhancement
        </div>
      </div>
    </div>

    {/* Step 2: AI Processing Animation */}
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-700">
      <div className="flex items-center justify-center mb-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mr-3"></div>
        <span className="text-yellow-800 dark:text-yellow-200 font-semibold">
          AI Enhancement in Progress...
        </span>
      </div>

      {/* Enhancement Steps Animation */}
      <div className="space-y-3">
        <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Vocabulary Enhancement: Complete
          </span>
        </div>
        <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Style Refinement: In Progress
          </span>
        </div>
        <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Engagement Optimization: Analyzing
          </span>
        </div>
      </div>
    </div>

    {/* Step 3: Enhanced Result */}
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
      <h4 className="text-green-800 dark:text-green-200 font-semibold mb-3 flex items-center">
        <Sparkles className="w-4 h-4 mr-2" />
        AI Enhanced Content
      </h4>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-600">
        <p className="text-green-800 dark:text-green-200 text-sm font-medium">
          "The swift brown fox leaps gracefully over the slumbering canine."
        </p>
        <div className="mt-3 space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-green-600 dark:text-green-400">
              Enhanced vocabulary
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-blue-600 dark:text-blue-400">
              Improved flow and rhythm
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-xs text-purple-600 dark:text-purple-400">
              Better engagement potential
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Enhancement Metrics */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm text-center">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
          +45%
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Engagement
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm text-center">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          +32%
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Readability
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm text-center">
        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
          +28%
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">Impact</div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm text-center">
        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
          0.8s
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Processing
        </div>
      </div>
    </div>
  </div>
);

const EbookAnalysisDemo = () => (
  <div className="space-y-4">
    <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
      <p className="text-purple-800 dark:text-purple-200 text-sm">
        "This ebook has a strong narrative arc and engaging characters. The plot
        twists are well-executed and the pacing is perfect."
      </p>
    </div>
    <div className="flex justify-center">
      <BookOpen className="w-8 h-8 text-purple-500 animate-pulse" />
    </div>
    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
      <p className="text-blue-800 dark:text-blue-200 text-sm">
        "The analysis reveals a clear structure, excellent pacing, and a
        compelling plot. The character development is particularly strong."
      </p>
    </div>
  </div>
);

const CharacterDevelopmentDemo = () => (
  <div className="space-y-4">
    <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4">
      <p className="text-indigo-800 dark:text-indigo-200 text-sm">
        "The protagonist is a complex, multi-dimensional character with a clear
        backstory and a well-defined personality. The antagonist is equally
        compelling."
      </p>
    </div>
    <div className="flex justify-center">
      <Users className="w-8 h-8 text-indigo-500 animate-pulse" />
    </div>
    <div className="bg-pink-50 dark:bg-pink-900/30 rounded-lg p-4">
      <p className="text-pink-800 dark:text-pink-200 text-sm">
        "The AI has successfully developed a character that resonates with
        readers, capturing their attention and making them care about their
        journey."
      </p>
    </div>
  </div>
);

const CollaborationDemo = () => (
  <div className="space-y-4">
    <div className="flex items-center space-x-4">
      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
        <span className="text-white text-xs font-bold">A</span>
      </div>
      <div className="flex-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
        <p className="text-blue-800 dark:text-blue-200 text-sm">
          Great suggestion!
        </p>
      </div>
    </div>
    <div className="flex items-center space-x-4 justify-end">
      <div className="flex-1 bg-green-50 dark:bg-green-900/30 rounded-lg p-3 text-right">
        <p className="text-green-800 dark:text-green-200 text-sm">
          Thanks! I'll implement that.
        </p>
      </div>
      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
        <span className="text-white text-xs font-bold">B</span>
      </div>
    </div>
  </div>
);

const AnalyticsDemo = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          95%
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Readability
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
          8.5
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Engagement
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
          12
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Suggestions
        </div>
      </div>
    </div>
    <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-end justify-around p-2">
      <div
        className="w-4 bg-blue-500 rounded-t"
        style={{ height: "60%" }}
      ></div>
      <div
        className="w-4 bg-green-500 rounded-t"
        style={{ height: "80%" }}
      ></div>
      <div
        className="w-4 bg-purple-500 rounded-t"
        style={{ height: "40%" }}
      ></div>
      <div
        className="w-4 bg-yellow-500 rounded-t"
        style={{ height: "90%" }}
      ></div>
    </div>
  </div>
);

const PersonalizationDemo = () => (
  <div className="space-y-4">
    <div className="flex items-center space-x-4">
      <Settings className="w-5 h-5 text-gray-400" />
      <span className="text-gray-700 dark:text-gray-300 text-sm">
        Writing Style: Professional
      </span>
    </div>
    <div className="flex items-center space-x-4">
      <Palette className="w-5 h-5 text-gray-400" />
      <span className="text-gray-700 dark:text-gray-300 text-sm">
        Tone: Formal
      </span>
    </div>
    <div className="flex items-center space-x-4">
      <Brain className="w-5 h-5 text-gray-400" />
      <span className="text-gray-700 dark:text-gray-300 text-sm">
        AI Learning: Active
      </span>
    </div>
    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
      <p className="text-blue-800 dark:text-blue-200 text-sm">
        AI has learned your preferences and will suggest content that matches
        your style.
      </p>
    </div>
  </div>
);

const DemoResults = () => {
  const navigate = useNavigate();

  const handleStartHere = () => {
    navigate("/signup");
  };

  return (
    <div className="text-center space-y-8">
      {/* Congratulations Message */}
      <div className="space-y-4">
        <div className="relative">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto animate-bounce" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
        </div>

        <div className="space-y-2">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
            🎉 Congratulations! 🎉
          </h2>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
            You have completed the DocCraft-AI Demo!
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            You've just witnessed the full power of AI-driven content creation.
            Ready to transform your writing experience?
          </p>
        </div>
      </div>

      {/* Feature Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            7
          </div>
          <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Powerful Features
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Demonstrated
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-6 border border-green-200 dark:border-green-700">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
            100%
          </div>
          <div className="text-sm font-medium text-green-800 dark:text-green-200">
            AI Powered
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
            Intelligent
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            24/7
          </div>
          <div className="text-sm font-medium text-purple-800 dark:text-purple-200">
            Available
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
            Always Ready
          </div>
        </div>
      </div>

      {/* Start Here Button */}
      <div className="space-y-4">
        <div className="relative">
          <button
            onClick={handleStartHere}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-pulse"
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            {/* Button content */}
            <div className="relative flex items-center space-x-3">
              <span className="text-2xl">🚀</span>
              <span>Start Here</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </button>

          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300 -z-10"></div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Join thousands of writers already using DocCraft-AI
        </p>
      </div>

      {/* Additional CTA */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          What's Next?
        </h4>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Create your account and start experiencing the future of AI-powered
          content creation. Your first document analysis is on us!
        </p>
      </div>
    </div>
  );
};
