/*
role: ui-engineer,
tier: Pro,
file: "modules/agent/components/DocCraftAgentChat.tsx",
allowedActions: ["subscribe", "listen", "update"],
theme: "pipeline_status_realtime"
*/

/* MCP: doc2video_ui */

import React, { useState, useEffect, useRef } from 'react';
import { useDocCraftAgent } from '../../../src/contexts/AgentContext';
import ChatInputBar from './ChatInputBar';
import AgentMessage from './AgentMessage';
import ScriptEditor from './ScriptEditor';
import VideoDeliveryPanel from './videoDeliveryPanel';
import { supabase } from '../services/supabaseStorage';
import { resumePipeline } from '../services/taskOrchestrator';

// Pipeline status interfaces
interface PipelineStatus {
  id: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'paused';
  mode: 'auto' | 'hybrid' | 'manual';
  features: string[];
  currentStep?: string;
  progress: number;
  errorMessage?: string;
  errorDetails?: any;
  processingTimeMs?: number;
  durationSeconds?: number;
  tier: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  slideDeckId?: string;
  narratedDeckId?: string;
  ttsNarrationId?: string;
  slideDeckTitle?: string;
  narratedDeckTitle?: string;
  ttsAudioUrl?: string;
  pausedAt?: string;
  pauseReason?: string;
}

// Supabase Realtime payload interface
interface PipelineRealtimePayload {
  new: PipelineStatus;
  old: PipelineStatus | null;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}

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

  // Doc-to-Video Pipeline State
  const [mode, setMode] = useState<'auto' | 'hybrid' | 'manual'>('auto');
  const [features, setFeatures] = useState({
    script: true,
    slides: true,
    voiceover: true,
  });

  // Pipeline Status Tracking
  const [pipelineId, setPipelineId] = useState<string | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus | null>(
    null
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(
    null
  );

  // Script Editor State
  const [showScriptEditor, setShowScriptEditor] = useState(false);
  const [currentScript, setCurrentScript] = useState<string>('');
  const [isResumingPipeline, setIsResumingPipeline] = useState(false);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, loading]);

  // Debug: Log chat history changes
  useEffect(() => {
    console.log('Chat history updated:', chatHistory);
  }, [chatHistory]);

  // Pipeline status realtime subscription effect
  useEffect(() => {
    if (!pipelineId) return;

    setIsSubscribed(true);
    setSubscriptionError(null);

    // Get initial pipeline status
    const getInitialStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('pipelines')
          .select('*')
          .eq('id', pipelineId)
          .single();

        if (error) {
          console.error('Failed to get initial pipeline status:', error);
          setSubscriptionError('Failed to get pipeline status');
          return;
        }

        if (data) {
          setPipelineStatus(data);

          // If pipeline is already completed, don't subscribe
          if (data.status === 'success' || data.status === 'failed') {
            setIsSubscribed(false);
            return;
          }
        }
      } catch (error) {
        console.error('Error getting initial pipeline status:', error);
        setSubscriptionError('Failed to get pipeline status');
        return;
      }
    };

    // Get initial status first
    getInitialStatus();

    // Create a unique channel name for this pipeline
    const channelName = `pipeline-${pipelineId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'pipelines',
          filter: `id=eq.${pipelineId}`,
        },
        (payload: PipelineRealtimePayload) => {
          console.log('Pipeline status update received:', payload);

          if (payload.new) {
            setPipelineStatus(payload.new);

            // Handle paused state for script review
            if (
              payload.new.status === 'paused' &&
              payload.new.pauseReason === 'script_review_required'
            ) {
              console.log('Pipeline paused for script review');

              // Fetch the current script from the narrated deck
              if (payload.new.narratedDeckId) {
                supabase
                  .from('narrated_decks')
                  .select('slides')
                  .eq('id', payload.new.narratedDeckId)
                  .single()
                  .then(({ data, error }) => {
                    if (!error && data) {
                      const script = data.slides
                        .map((slide: any) => slide.narration)
                        .join('\n\n');
                      setCurrentScript(script);
                      setShowScriptEditor(true);
                    }
                  });
              }
            }

            // Unsubscribe when pipeline is completed or failed
            if (
              payload.new.status === 'success' ||
              payload.new.status === 'failed'
            ) {
              console.log('Pipeline completed, unsubscribing from updates');
              supabase.removeChannel(channel);
              activeSubscriptions.current.delete(channelName);
              setIsSubscribed(false);

              // Show completion notification
              if (payload.new.status === 'success') {
                showPipelineNotification(
                  'success',
                  `✅ Pipeline completed successfully! Generated ${payload.new.features.join(', ')}.`
                );
              } else if (payload.new.status === 'failed') {
                showPipelineNotification(
                  'failed',
                  `❌ Pipeline failed: ${payload.new.errorMessage || 'Unknown error'}`
                );
              }
            }
          }
        }
      )
      .subscribe(status => {
        console.log('Subscription status:', status);

        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to pipeline updates');
          activeSubscriptions.current.add(channelName);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Channel subscription error');
          setSubscriptionError('Failed to subscribe to pipeline updates');
          setIsSubscribed(false);
          activeSubscriptions.current.delete(channelName);
        } else if (status === 'TIMED_OUT') {
          console.error('Subscription timed out');
          setSubscriptionError('Pipeline status subscription timed out');
          setIsSubscribed(false);
          activeSubscriptions.current.delete(channelName);
        }
      });

    // Cleanup function
    return () => {
      console.log('Cleaning up pipeline subscription');
      supabase.removeChannel(channel);
      activeSubscriptions.current.delete(channelName);
      setIsSubscribed(false);
    };
  }, [pipelineId]);

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
            new CustomEvent('agent-toggle', {
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
      new CustomEvent('agent-toggle', {
        detail: { isOpen: newOpenState },
      })
    );
  };

  const handleSend = async (msg: string) => {
    setLoading(true);
    setError(null);
    setSubscriptionError(null);

    try {
      // Check if this is a doc2video command and enhance it with mode + features
      if (msg.startsWith('/doc2video')) {
        // Clear previous pipeline status when starting a new pipeline
        setPipelineId(null);
        setPipelineStatus(null);
        setIsSubscribed(false);

        const featureFlags = Object.entries(features)
          .filter(([, enabled]) => enabled)
          .map(([key]) => key)
          .join(',');

        // Sanitize input to prevent injection
        const sanitizedMode =
          mode === 'auto' || mode === 'hybrid' || mode === 'manual'
            ? mode
            : 'auto';
        const sanitizedFeatures = featureFlags.replace(/[^a-zA-Z,]/g, '');

        const enhancedCommand = `/doc2video ${sanitizedMode} features=${sanitizedFeatures}`;
        const response = await askAgent(enhancedCommand);

        // Try to extract pipeline ID from response
        if (response && typeof response === 'string') {
          // Look for pipeline ID in the response (this would need to be implemented in the agent)
          const pipelineIdMatch = response.match(
            /pipeline[_-]?id[:\s]*([a-f0-9-]{36})/i
          );
          if (pipelineIdMatch) {
            setPipelineId(pipelineIdMatch[1]);
            console.log('Pipeline ID captured:', pipelineIdMatch[1]);
          }
        }
      } else {
        await askAgent(msg);
      }
    } catch (e: any) {
      setError(e.message || 'Agent failed to respond.');
    } finally {
      setLoading(false);
    }
  };

  // Handle suggested actions from agent messages
  const handleSuggestedAction = async (action: string) => {
    setLoading(true);
    setError(null);
    try {
      await askAgent(action);
    } catch (e: any) {
      setError(e.message || 'Action failed to execute.');
    } finally {
      setLoading(false);
    }
  };

  // Handle pipeline success actions
  const handlePipelineAction = (
    action: 'view-slides' | 'view-script' | 'play-audio'
  ) => {
    if (!pipelineStatus) return;

    switch (action) {
      case 'view-slides':
        if (pipelineStatus.slideDeckId) {
          // TODO: Implement slide deck viewer
          console.log('View slides for:', pipelineStatus.slideDeckId);
        }
        break;
      case 'view-script':
        if (pipelineStatus.narratedDeckId) {
          // TODO: Implement script viewer
          console.log('View script for:', pipelineStatus.narratedDeckId);
        }
        break;
      case 'play-audio':
        if (pipelineStatus.ttsAudioUrl) {
          // TODO: Implement audio player
          console.log('Play audio:', pipelineStatus.ttsAudioUrl);
        }
        break;
    }
  };

  // Script Editor Handlers
  const handleScriptApprove = async (editedScript: string) => {
    if (!pipelineId) return;

    setIsResumingPipeline(true);
    setError(null);

    try {
      console.log('🔄 Resuming pipeline with edited script...');

      const result = await resumePipeline(pipelineId, {
        editedScript,
        userId: 'user', // TODO: Get actual user ID
        tier: pipelineStatus?.tier || 'Pro',
      });

      if (result.success) {
        setShowScriptEditor(false);
        setCurrentScript('');
        showPipelineNotification(
          'success',
          '✅ Script approved and narration generated successfully!'
        );
      } else {
        setError('Failed to resume pipeline: ' + result.errors.join(', '));
      }
    } catch (error: any) {
      setError(error.message || 'Failed to resume pipeline');
    } finally {
      setIsResumingPipeline(false);
    }
  };

  const handleScriptEditAgain = async () => {
    if (!pipelineId) return;

    setError(null);
    try {
      // Trigger a new script generation
      await askAgent(
        `/doc2video ${pipelineStatus?.mode || 'hybrid'} regenerate_script=true`
      );
    } catch (error: any) {
      setError(error.message || 'Failed to regenerate script');
    }
  };

  const handleScriptCancel = () => {
    setShowScriptEditor(false);
    setCurrentScript('');
  };

  // Show toast notification for pipeline completion
  const showPipelineNotification = (
    status: 'success' | 'failed',
    message: string
  ) => {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-[10000] p-4 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300 transform translate-x-full ${
      status === 'success'
        ? 'bg-green-500 hover:bg-green-600'
        : 'bg-red-500 hover:bg-red-600'
    }`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 5000);

    // Click to dismiss
    toast.addEventListener('click', () => {
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    });
  };

  // Track active subscriptions for cleanup
  const activeSubscriptions = useRef<Set<string>>(new Set());

  // Cleanup all active subscriptions
  const cleanupAllSubscriptions = () => {
    // TODO: Store channel objects instead of names for proper cleanup
    // For now, we'll rely on the individual cleanup functions
    activeSubscriptions.current.clear();
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupAllSubscriptions();
    };
  }, []);

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
          className="fixed bottom-4 right-4 z-[9999] w-80 md:w-96 lg:w-[28rem] shadow-2xl rounded-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-300 transform hover:scale-105"
          style={{
            maxHeight: 'calc(100vh - 2rem)',
            minHeight: '500px',
          }}
          aria-label="DocCraft Agent Chat"
          role="dialog"
          aria-modal="true"
          data-mcp-source="agentChatUI"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 text-white p-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <span className="text-2xl animate-pulse">🤖</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <div>
                <h3 className="font-bold text-lg">DocCraft Agent</h3>
                <p className="text-xs opacity-90 font-medium">AI Assistant</p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="text-white hover:text-gray-200 transition-all duration-200 p-2 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transform hover:scale-110 active:scale-95"
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

          {/* Doc-to-Video Pipeline Controls */}
          <div className="flex flex-col gap-4 p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20">
            {/* Mode Selector */}
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="radio"
                  name="mode"
                  value="auto"
                  checked={mode === 'auto'}
                  onChange={() => setMode('auto')}
                  className="text-blue-600 focus:ring-blue-500 transition-all duration-200"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Auto
                </span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="radio"
                  name="mode"
                  value="hybrid"
                  checked={mode === 'hybrid'}
                  onChange={() => setMode('hybrid')}
                  className="text-blue-600 focus:ring-blue-500 transition-all duration-200"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Hybrid
                </span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="radio"
                  name="mode"
                  value="manual"
                  checked={mode === 'manual'}
                  onChange={() => setMode('manual')}
                  className="text-blue-600 focus:ring-blue-500 transition-all duration-200"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Manual
                </span>
              </label>
            </div>

            {/* Feature Toggles */}
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={features.script}
                  onChange={() =>
                    setFeatures(prev => ({ ...prev, script: !prev.script }))
                  }
                  className="text-blue-600 focus:ring-blue-500 rounded transition-all duration-200"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Generate Script
                </span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={features.slides}
                  onChange={() =>
                    setFeatures(prev => ({ ...prev, slides: !prev.slides }))
                  }
                  className="text-blue-600 focus:ring-blue-500 rounded transition-all duration-200"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Generate Slides
                </span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={features.voiceover}
                  onChange={() =>
                    setFeatures(prev => ({
                      ...prev,
                      voiceover: !prev.voiceover,
                    }))
                  }
                  className="text-blue-600 focus:ring-blue-500 rounded transition-all duration-200"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Add Voiceover
                </span>
              </label>
            </div>
          </div>

          {/* Pipeline Status Display */}
          {pipelineStatus && (
            <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="p-4">
                {/* Status Banner */}
                <div
                  className={`p-3 rounded-lg text-sm mb-3 ${
                    pipelineStatus.status === 'success'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : pipelineStatus.status === 'failed'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : pipelineStatus.status === 'running'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">
                        {pipelineStatus.status === 'success'
                          ? '✅'
                          : pipelineStatus.status === 'failed'
                            ? '❌'
                            : pipelineStatus.status === 'running'
                              ? '🔄'
                              : '⏳'}
                      </span>
                      <span className="font-medium">
                        Pipeline:{' '}
                        {pipelineStatus.status.charAt(0).toUpperCase() +
                          pipelineStatus.status.slice(1)}
                      </span>
                    </div>
                    {isSubscribed && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs">Live</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar for Running Pipelines */}
                  {pipelineStatus.status === 'running' && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>
                          {pipelineStatus.currentStep
                            ?.replace(/_/g, ' ')
                            .replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span>{pipelineStatus.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${pipelineStatus.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {pipelineStatus.errorMessage && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded text-xs">
                      <span className="font-semibold">Error:</span>{' '}
                      {pipelineStatus.errorMessage}
                    </div>
                  )}

                  {/* Success Actions */}
                  {pipelineStatus.status === 'success' && (
                    <div className="mt-3">
                      <VideoDeliveryPanel
                        pipeline={pipelineStatus}
                        userTier={pipelineStatus.tier}
                        className="mb-4"
                      />
                    </div>
                  )}
                </div>

                {/* Pipeline Details */}
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Mode:</span>
                    <span className="font-medium">{pipelineStatus.mode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Features:</span>
                    <span className="font-medium">
                      {pipelineStatus.features.join(', ')}
                    </span>
                  </div>
                  {pipelineStatus.processingTimeMs && (
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">
                        {(pipelineStatus.processingTimeMs / 1000).toFixed(1)}s
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Subscription Error Display */}
          {subscriptionError && (
            <div className="border-b border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/10">
              <div className="p-3">
                <div className="text-xs text-red-600 dark:text-red-400">
                  <span className="font-semibold">
                    Realtime Connection Error:
                  </span>{' '}
                  {subscriptionError}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-900/10">
            {chatHistory.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                <div className="text-6xl mb-4 animate-bounce">🤖</div>
                <p className="text-lg font-medium mb-2">Welcome to DocCraft!</p>
                <p className="text-sm opacity-75">
                  Ask me anything about creating videos, scripts, or
                  presentations.
                </p>
              </div>
            ) : (
              chatHistory.map((message, index) => (
                <div key={index} className="animate-fade-in">
                  <AgentMessage
                    type={message.sender}
                    content={message.message}
                  />
                  {/* Render suggested actions if available */}
                  {message.suggestedActions &&
                    message.suggestedActions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.suggestedActions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={() => handleSuggestedAction(action.action)}
                            className="px-4 py-2 text-xs bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full transition-all duration-200 font-medium transform hover:scale-105 active:scale-95 shadow-sm"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              ))
            )}
            {loading && (
              <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-sm font-medium">
                  Agent is thinking...
                </span>
              </div>
            )}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                    {error}
                  </p>
                </div>
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

      {/* Script Editor Modal */}
      {showScriptEditor && pipelineId && currentScript && (
        <div className="fixed inset-0 z-[10000] bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <ScriptEditor
              pipelineId={pipelineId}
              initialScript={currentScript}
              onApprove={handleScriptApprove}
              onEditAgain={handleScriptEditAgain}
              onCancel={handleScriptCancel}
              tier={pipelineStatus?.tier || 'Pro'}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default DocCraftAgentChat;
