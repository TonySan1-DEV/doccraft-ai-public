// Enhanced Character Chat Component
// Advanced user-to-character interaction with sophisticated features

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageCircle,
  Brain,
  Heart,
  Users,
  Target,
  Zap,
  Send,
  Mic,
  MicOff,
  Star,
  TrendingUp,
  Lightbulb,
  Eye,
  Settings,
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Camera,
  Video,
  Phone,
  VideoOff,
  MoreHorizontal,
  Smile,
  Frown,
  Meh,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  MapPin,
  User,
  Users2,
  Shield,
  Sword,
  Crown,
  BookOpen,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Target as TargetIcon,
  Heart as HeartIcon,
  Brain as BrainIcon,
  Users as UsersIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { enhancedCharacterInteraction } from "../services/enhancedCharacterInteraction";
import { CharacterPersona } from "../types/CharacterPersona";
import {
  InteractionMode,
  InteractionContext,
  CharacterResponse,
  ConversationFlow,
} from "../services/enhancedCharacterInteraction";

interface EnhancedCharacterChatProps {
  character: CharacterPersona;
  onCharacterUpdate: (character: CharacterPersona) => void;
  className?: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "character";
  content: string;
  timestamp: Date;
  emotion?: string;
  intensity?: number;
  bodyLanguage?: string;
  voiceTone?: string;
  thoughtProcess?: string;
  memoryTriggered?: string;
  relationshipImpact?: string;
  developmentInsight?: string;
}

interface InteractionModeOption {
  id: InteractionMode["type"];
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  intensity: number;
  duration: number;
  goals: string[];
}

export default function EnhancedCharacterChat({
  character,
  onCharacterUpdate,
  className = "",
}: EnhancedCharacterChatProps) {
  const [activeMode, setActiveMode] = useState<InteractionModeOption | null>(
    null
  );
  const [conversationFlow, setConversationFlow] =
    useState<ConversationFlow | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showCharacterInsights, setShowCharacterInsights] = useState(false);
  const [showEmotionalAnalysis, setShowEmotionalAnalysis] = useState(false);
  const [showFollowUpSuggestions, setShowFollowUpSuggestions] = useState(false);
  const [currentContext, setCurrentContext] = useState<InteractionContext>({
    scene: "Casual conversation",
    mood: "neutral",
    timeOfDay: "afternoon",
    location: "living room",
    otherCharacters: [],
    recentEvents: [],
    emotionalState: "calm",
    conversationTone: "casual",
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const interactionModes: InteractionModeOption[] = [
    {
      id: "conversation",
      label: "Casual Chat",
      description: "Natural, relaxed conversation",
      icon: MessageCircle,
      color: "blue",
      intensity: 0.3,
      duration: 15,
      goals: ["Build rapport", "Learn about character", "Explore personality"],
    },
    {
      id: "interview",
      label: "Deep Interview",
      description: "Structured questions for character development",
      icon: Brain,
      color: "purple",
      intensity: 0.7,
      duration: 30,
      goals: [
        "Explore background",
        "Understand motivations",
        "Discover secrets",
      ],
    },
    {
      id: "therapy",
      label: "Emotional Support",
      description: "Therapeutic conversation for emotional growth",
      icon: Heart,
      color: "pink",
      intensity: 0.8,
      duration: 45,
      goals: ["Process emotions", "Heal wounds", "Build resilience"],
    },
    {
      id: "conflict",
      label: "Conflict Resolution",
      description: "Address disagreements and tensions",
      icon: Sword,
      color: "red",
      intensity: 0.9,
      duration: 20,
      goals: ["Resolve conflicts", "Improve communication", "Strengthen bonds"],
    },
    {
      id: "bonding",
      label: "Relationship Building",
      description: "Deepen emotional connections",
      icon: Users,
      color: "green",
      intensity: 0.6,
      duration: 25,
      goals: ["Strengthen relationships", "Build trust", "Create intimacy"],
    },
    {
      id: "mentoring",
      label: "Guidance & Advice",
      description: "Provide wisdom and direction",
      icon: Crown,
      color: "yellow",
      intensity: 0.5,
      duration: 35,
      goals: ["Share wisdom", "Provide guidance", "Support growth"],
    },
  ];

  const startConversation = useCallback(
    async (mode: InteractionModeOption) => {
      setActiveMode(mode);

      const interactionMode: InteractionMode = {
        type: mode.id,
        intensity: mode.intensity,
        focus: mode.description,
        duration: mode.duration,
        goals: mode.goals,
      };

      try {
        const flow = await enhancedCharacterInteraction.startConversation(
          character.id,
          interactionMode,
          currentContext
        );

        setConversationFlow(flow);
        toast.success(`Started ${mode.label} mode`);
      } catch (error) {
        console.error("Failed to start conversation:", error);
        toast.error("Failed to start conversation");
      }
    },
    [character.id, currentContext]
  );

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || !conversationFlow) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const characterResponse =
        await enhancedCharacterInteraction.generateResponse(
          character.id,
          inputMessage,
          conversationFlow,
          currentContext
        );

      const characterMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "character",
        content: characterResponse.content,
        timestamp: new Date(),
        emotion: characterResponse.emotion,
        intensity: characterResponse.intensity,
        bodyLanguage: characterResponse.bodyLanguage,
        voiceTone: characterResponse.voiceTone,
        thoughtProcess: characterResponse.thoughtProcess,
        memoryTriggered: characterResponse.memoryTriggered,
        relationshipImpact: characterResponse.relationshipImpact,
        developmentInsight: characterResponse.developmentInsight,
      };

      setChatMessages((prev) => [...prev, characterMessage]);

      // Update conversation flow
      setConversationFlow((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, characterResponse],
            }
          : null
      );

      // Show follow-up suggestions
      if (characterResponse.developmentInsight) {
        setShowFollowUpSuggestions(true);
      }
    } catch (error) {
      console.error("Failed to generate character response:", error);
      toast.error("Failed to generate character response");
    } finally {
      setIsTyping(false);
    }
  }, [inputMessage, conversationFlow, character.id, currentContext]);

  const switchMode = useCallback(
    async (newMode: InteractionModeOption) => {
      if (!conversationFlow) return;

      try {
        const updatedFlow =
          await enhancedCharacterInteraction.switchInteractionMode(
            conversationFlow,
            {
              type: newMode.id,
              intensity: newMode.intensity,
              focus: newMode.description,
              duration: newMode.duration,
              goals: newMode.goals,
            }
          );

        setConversationFlow(updatedFlow);
        setActiveMode(newMode);
        toast.success(`Switched to ${newMode.label} mode`);
      } catch (error) {
        console.error("Failed to switch mode:", error);
        toast.error("Failed to switch conversation mode");
      }
    },
    [conversationFlow]
  );

  const analyzeConversation = useCallback(async () => {
    if (!conversationFlow) return;

    try {
      const analysis =
        await enhancedCharacterInteraction.analyzeConversationFlow(
          conversationFlow
        );
      console.log("Conversation Analysis:", analysis);

      setShowEmotionalAnalysis(true);
      toast.success("Conversation analysis complete");
    } catch (error) {
      console.error("Failed to analyze conversation:", error);
      toast.error("Failed to analyze conversation");
    }
  }, [conversationFlow]);

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case "joy":
        return <Smile className="w-4 h-4 text-green-500" />;
      case "sadness":
        return <Frown className="w-4 h-4 text-blue-500" />;
      case "anger":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "fear":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "surprise":
        return <Eye className="w-4 h-4 text-purple-500" />;
      case "contempt":
        return <Meh className="w-4 h-4 text-gray-500" />;
      default:
        return <Meh className="w-4 h-4 text-gray-400" />;
    }
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity > 0.7) return "text-red-600";
    if (intensity > 0.4) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {character.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {activeMode
                  ? `${activeMode.label} Mode`
                  : "Select interaction mode"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCharacterInsights(!showCharacterInsights)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Brain className="w-5 h-5" />
            </button>
            <button
              onClick={analyzeConversation}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interaction Mode Selector */}
      {!activeMode && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
            Choose Interaction Mode
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {interactionModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => startConversation(mode)}
                className={`p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-${mode.color}-500 dark:hover:border-${mode.color}-400 transition-all text-left`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <mode.icon className={`w-5 h-5 text-${mode.color}-500`} />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {mode.label}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {mode.description}
                </p>
                <div className="mt-2 flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                    <div
                      className={`bg-${mode.color}-500 h-1 rounded-full`}
                      style={{ width: `${mode.intensity * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(mode.intensity * 100)}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Mode Header */}
      {activeMode && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 bg-${activeMode.color}-500 rounded-full flex items-center justify-center`}
              >
                <activeMode.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {activeMode.label}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activeMode.description}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveMode(null)}
                className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Change Mode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
          {chatMessages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Start a conversation with {character.name}</p>
              {activeMode && (
                <p className="text-sm mt-2">
                  Mode: {activeMode.label} • Goals:{" "}
                  {activeMode.goals.join(", ")}
                </p>
              )}
            </div>
          ) : (
            chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>

                  {/* Character Response Details */}
                  {message.sender === "character" && (
                    <div className="mt-2 space-y-1">
                      {message.emotion && (
                        <div className="flex items-center space-x-1 text-xs opacity-75">
                          {getEmotionIcon(message.emotion)}
                          <span
                            className={getIntensityColor(
                              message.intensity || 0
                            )}
                          >
                            {message.emotion} (
                            {Math.round((message.intensity || 0) * 100)}%)
                          </span>
                        </div>
                      )}

                      {message.bodyLanguage && (
                        <div className="text-xs opacity-75">
                          💬 {message.bodyLanguage}
                        </div>
                      )}

                      {message.voiceTone && (
                        <div className="text-xs opacity-75">
                          🎤 {message.voiceTone}
                        </div>
                      )}

                      {message.memoryTriggered && (
                        <div className="text-xs opacity-75 text-blue-500">
                          🧠 {message.memoryTriggered}
                        </div>
                      )}

                      {message.relationshipImpact && (
                        <div className="text-xs opacity-75 text-green-500">
                          👥 {message.relationshipImpact}
                        </div>
                      )}

                      {message.developmentInsight && (
                        <div className="text-xs opacity-75 text-purple-500">
                          🌱 {message.developmentInsight}
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-sm">
                    {character.name} is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={`Chat with ${character.name}...`}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={isTyping || !activeMode}
            />

            <button
              onClick={() => setIsListening(!isListening)}
              className={`p-2 rounded-lg ${
                isListening
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={handleSendMessage}
              disabled={isTyping || !inputMessage.trim() || !activeMode}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions */}
          {activeMode && (
            <div className="mt-3 flex items-center space-x-2">
              <button
                onClick={() =>
                  setShowFollowUpSuggestions(!showFollowUpSuggestions)
                }
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                💡 Follow-up suggestions
              </button>
              <button
                onClick={analyzeConversation}
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
              >
                📊 Analyze conversation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Insights Panel */}
      {showCharacterInsights && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            Character Insights
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">
                Current Emotion
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {chatMessages[chatMessages.length - 1]?.emotion || "neutral"}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">
                Conversation Depth
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {Math.round(
                  (chatMessages.reduce(
                    (sum, msg) => sum + (msg.intensity || 0),
                    0
                  ) /
                    Math.max(chatMessages.length, 1)) *
                    100
                )}
                %
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Emotional Analysis */}
      {showEmotionalAnalysis && conversationFlow && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            Emotional Analysis
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Duration</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {Math.round(
                  (Date.now() - conversationFlow.startTime.getTime()) / 60000
                )}{" "}
                minutes
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Messages</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {conversationFlow.messages.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Development Progress
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {Math.round(conversationFlow.developmentProgress * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
