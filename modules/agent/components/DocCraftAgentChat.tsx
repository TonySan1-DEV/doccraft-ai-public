// MCP Context Block
/*
role: ui-engineer,
tier: Pro,
file: "modules/agent/components/DocCraftAgentChat.tsx",
allowedActions: ["scaffold", "interface", "integrate"],
theme: "user_assistant"
*/

import React, { useState, useEffect, useRef } from "react";
import { useDocCraftAgent } from "../../../src/contexts/AgentContext";
import ChatInputBar from "./ChatInputBar";
import AgentMessage from "./AgentMessage";

/**
 * Main DocCraft Agent Chat UI
 * @component
 * @returns {JSX.Element}
 */
const DocCraftAgentChat: React.FC<{ autoOpen?: boolean }> = ({
  autoOpen = false,
}) => {
  const agentContext = useDocCraftAgent();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { chatHistory, askAgent } = agentContext;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userManuallyClosed, setUserManuallyClosed] = useState(false);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, loading]);

  // Debug: Log chat history changes
  useEffect(() => {
    console.log("Chat history updated:", chatHistory);
  }, [chatHistory]);

  // Auto-open chat when there are messages or when autoOpen is true
  useEffect(() => {
    if (
      (chatHistory.length > 0 && !open && !userManuallyClosed) ||
      (autoOpen && !userManuallyClosed)
    ) {
      // Longer delay for auto-open to respect the Demo page timing
      const timer = setTimeout(
        () => {
          setOpen(true);
          // Dispatch custom event for layout adjustment
          window.dispatchEvent(
            new CustomEvent("agent-toggle", {
              detail: { isOpen: true },
            })
          );
        },
        autoOpen ? 10000 : 0 // 10 second delay when autoOpen is true, no delay for messages
      ); // This adds to the 30 seconds from Demo page = 40 seconds total

      return () => clearTimeout(timer);
    }
  }, [chatHistory.length, open, autoOpen, userManuallyClosed]);

  // Add welcome message when auto-opening
  useEffect(() => {
    if (autoOpen && chatHistory.length === 0) {
      // Add a welcome message directly to the context
      const welcomeMessage = `👋 **Welcome to DocCraft-AI Demo!** 

I'm your AI assistant, and I'm excited to guide you through this interactive demonstration of our powerful features!

## 🎯 **What You'll Experience:**
This demo showcases **7 amazing features** that will transform your content creation workflow:

1. **📄 Document Upload & Analysis** - Watch AI analyze your content structure
2. **✨ AI-Powered Enhancement** - See intelligent suggestions improve your writing
3. **📚 Ebook Analysis & Creation** - Discover insights from existing content
4. **👥 Character Development** - Create rich, complex characters with AI
5. **🤝 Real-Time Collaboration** - Experience seamless teamwork features
6. **📊 Advanced Analytics** - Track performance and engagement metrics
7. **🎯 Personalized Experience** - Watch AI adapt to your writing style

## 🎮 **How to Navigate:**
- **Start Demo** - Click to begin the automated walkthrough
- **Pause/Restart** - Control the pace at any time
- **Progress Bar** - Track your journey through the features
- **Ask Me Anything** - I'm here to explain each step in detail!

## 💡 **Pro Tips:**
- Ask me about any specific feature that interests you
- I can explain how each tool works in real scenarios
- Want to know more about a step? Just ask!
- I'll guide you through the entire experience

**Ready to explore?** The demo will start automatically, but feel free to ask me questions about any feature along the way! 🚀`;

      // Add the message to chat history
      if (agentContext.sendAgentGreeting) {
        agentContext.sendAgentGreeting(welcomeMessage);
      }
    }
  }, [autoOpen, chatHistory.length, agentContext]);

  // Handle minimize/maximize
  const toggleChat = () => {
    const newOpenState = !open;
    setOpen(newOpenState);

    // Track when user manually closes the agent
    if (!newOpenState) {
      setUserManuallyClosed(true);
    }

    // Dispatch custom event for layout adjustment
    window.dispatchEvent(
      new CustomEvent("agent-toggle", {
        detail: { isOpen: newOpenState },
      })
    );
  };

  const handleSend = async (msg: string) => {
    setLoading(true);
    setError(null);
    try {
      await askAgent(msg);
    } catch (e: any) {
      setError(e.message || "Agent failed to respond.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!open && (
        <div className="fixed bottom-4 right-4 z-[9999]">
          <div className="relative">
            <button
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all duration-500 ease-in-out transform hover:scale-125 hover:rotate-6 border-2 border-white animate-pulse hover:animate-bounce relative"
              onClick={toggleChat}
              aria-expanded={open}
              aria-controls="agent-chat-panel"
              aria-label="Open DocCraft Agent Chat"
            >
              <span className="text-2xl animate-pulse relative z-10">🤖</span>
            </button>
          </div>
        </div>
      )}

      {/* Chat Panel */}
      {open && (
        <div
          className="fixed bottom-4 right-4 z-[9999] w-80 md:w-96 shadow-2xl rounded-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-300"
          style={{
            maxHeight: "calc(100vh - 2rem)",
          }}
          aria-label="DocCraft Agent Chat"
          role="dialog"
          aria-modal="true"
          data-mcp-source="agentChatUI"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-xl">🤖</span>
              <div>
                <h3 className="font-semibold">DocCraft Agent</h3>
                <p className="text-xs opacity-90">AI Assistant</p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="text-white hover:text-gray-200 transition-all duration-200 p-1.5 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transform hover:scale-110"
              aria-label="Close chat"
            >
              <div className="w-6 h-6 rounded-full border-2 border-white/60 hover:border-white flex items-center justify-center">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </button>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {chatHistory.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <div className="text-4xl mb-2">🤖</div>
                <p className="text-sm">Ask me anything about DocCraft!</p>
              </div>
            ) : (
              chatHistory.map((message, index) => (
                <AgentMessage
                  key={index}
                  type={message.sender}
                  content={message.message}
                />
              ))
            )}
            {loading && (
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm">Agent is thinking...</span>
              </div>
            )}
            {error && (
              <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-red-600 dark:text-red-400 text-sm">
                  {error}
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <ChatInputBar onSend={handleSend} loading={loading} />
          </div>
        </div>
      )}
    </>
  );
};

export default DocCraftAgentChat;
