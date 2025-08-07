// LLM Chat Interface Component
// MCP: { role: "admin", allowedActions: ["analyze", "process", "enhance"], theme: "llm_integration", contentSensitivity: "medium", tier: "Pro" }

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send as SendIcon,
  DollarSign as DollarSignIcon,
  MessageSquare as MessageSquareIcon,
  Bot as BotIcon,
  User as UserIcon,
  Settings as SettingsIcon,
  Download as DownloadIcon,
  Copy as CopyIcon,
  Plus as PlusIcon,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
  Search as SearchIcon,
  Grid as GridIcon,
  List as ListIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Activity as ActivityIcon,
  Trash2 as Trash2Icon,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  llmIntegration,
  ChatSession,
  LLMModel,
  LLMProvider,
} from '../services/llmIntegrationService';

interface LLMChatInterfaceProps {
  className?: string;
}

export default function LLMChatInterface({
  className = '',
}: LLMChatInterfaceProps) {
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [models, setModels] = useState<LLMModel[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSessionList, setShowSessionList] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [topP, setTopP] = useState(1);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = useCallback(() => {
    const allProviders = llmIntegration.getAllProviders();
    const allSessions = llmIntegration.getAllChatSessions();

    setProviders(allProviders);
    setSessions(allSessions);

    if (allProviders.length > 0) {
      setSelectedProvider(allProviders[0].id);
      setModels(allProviders[0].models);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  const handleProviderChange = useCallback((providerId: string) => {
    setSelectedProvider(providerId);
    const provider = llmIntegration.getProvider(providerId);
    if (provider) {
      setModels(provider.models);
      if (provider.models.length > 0) {
        setSelectedModel(provider.models[0].id);
      }
    }
  }, []);

  const handleCreateSession = useCallback(() => {
    if (!selectedProvider || !selectedModel) {
      toast.error('Please select a provider and model');
      return;
    }

    const session = llmIntegration.createChatSession(
      `New Chat - ${new Date().toLocaleString()}`,
      selectedProvider,
      selectedModel,
      {
        apiKey,
        temperature,
        maxTokens,
        topP,
        systemPrompt,
      }
    );

    setSessions(prev => [...prev, session]);
    setActiveSession(session);
    toast.success('New chat session created');
  }, [
    selectedProvider,
    selectedModel,
    apiKey,
    temperature,
    maxTokens,
    topP,
    systemPrompt,
  ]);

  const handleSendMessage = useCallback(async () => {
    if (!activeSession || !inputMessage.trim()) return;

    setIsLoading(true);
    setInputMessage('');

    try {
      const response = await llmIntegration.sendMessage(
        activeSession.id,
        inputMessage
      );

      if (response) {
        // Update sessions list to reflect changes
        const updatedSessions = llmIntegration.getAllChatSessions();
        setSessions(updatedSessions);

        // Update active session
        const updatedSession = llmIntegration.getChatSession(activeSession.id);
        if (updatedSession) {
          setActiveSession(updatedSession);
        }

        toast.success('Message sent successfully');
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message');
    } finally {
      setIsLoading(false);
    }
  }, [activeSession, inputMessage]);

  const handleSelectSession = useCallback((session: ChatSession) => {
    setActiveSession(session);
  }, []);

  const handleDeleteSession = useCallback(
    (sessionId: string) => {
      if (llmIntegration.deleteChatSession(sessionId)) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (activeSession?.id === sessionId) {
          setActiveSession(null);
        }
        toast.success('Session deleted');
      }
    },
    [activeSession]
  );

  const handleExportSession = useCallback((sessionId: string) => {
    const sessionData = llmIntegration.exportSession(sessionId);
    if (sessionData) {
      const blob = new Blob([sessionData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-session-${sessionId}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Session exported');
    }
  }, []);

  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard');
  }, []);

  const filteredSessions = sessions.filter(
    session =>
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProviderLogo = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    return provider?.logo || '/logos/default.svg';
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`;
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}k`;
    }
    return tokens.toString();
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BotIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                LLM Chat Interface
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Multi-provider AI chat platform
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSessionList(!showSessionList)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              {showSessionList ? (
                <ChevronDownIcon className="w-5 h-5" />
              ) : (
                <ChevronUpIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[600px]">
        {/* Session List */}
        {showSessionList && (
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Session List Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Chat Sessions
                </h3>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() =>
                      setViewMode(viewMode === 'grid' ? 'list' : 'grid')
                    }
                    className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    {viewMode === 'grid' ? (
                      <ListIcon className="w-4 h-4" />
                    ) : (
                      <GridIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>

              {/* Create New Session */}
              <button
                onClick={handleCreateSession}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium"
              >
                <PlusIcon className="w-4 h-4" />
                <span>New Chat</span>
              </button>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto">
              {filteredSessions.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <MessageSquareIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No chat sessions</p>
                  <p className="text-sm">
                    Create your first session to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredSessions.map(session => (
                    <div
                      key={session.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        activeSession?.id === session.id
                          ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => handleSelectSession(session)}
                      onKeyDown={e =>
                        e.key === 'Enter' && handleSelectSession(session)
                      }
                      role="button"
                      tabIndex={0}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <img
                            src={getProviderLogo(session.provider)}
                            alt={session.provider}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                            {session.provider}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleExportSession(session.id);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <DownloadIcon className="w-3 h-3" />
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteSession(session.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2Icon className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1 truncate">
                        {session.title}
                      </h4>

                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{session.metadata.messageCount} messages</span>
                        <span>{formatCost(session.metadata.totalCost)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeSession ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={getProviderLogo(activeSession.provider)}
                      alt={activeSession.provider}
                      className="w-6 h-6 rounded"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {activeSession.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {activeSession.provider} • {activeSession.model}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <MessageSquareIcon className="w-4 h-4" />
                      <span>{activeSession.metadata.messageCount}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSignIcon className="w-4 h-4" />
                      <span>
                        {formatCost(activeSession.metadata.totalCost)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ActivityIcon className="w-4 h-4" />
                      <span>
                        {formatTokens(activeSession.metadata.totalTokens)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeSession.messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-3xl rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.role === 'user' ? (
                          <UserIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        ) : (
                          <BotIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>
                          <div className="flex items-center space-x-2 mt-2 text-xs opacity-70">
                            <span>
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                            {message.metadata && (
                              <>
                                <span>•</span>
                                <span>{message.metadata.tokens} tokens</span>
                              </>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleCopyMessage(message.content)}
                          className="p-1 opacity-50 hover:opacity-100 transition-opacity"
                        >
                          <CopyIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <textarea
                      value={inputMessage}
                      onChange={e => setInputMessage(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type your message..."
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                      rows={3}
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <SendIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquareIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Active Session
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Select a session or create a new one to start chatting
                </p>
                <button
                  onClick={handleCreateSession}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                >
                  Create New Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Provider Selection */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Provider Settings
              </h4>
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="provider-select"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Provider
                  </label>
                  <select
                    id="provider-select"
                    value={selectedProvider}
                    onChange={e => handleProviderChange(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {providers.map(provider => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="model-select"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Model
                  </label>
                  <select
                    id="model-select"
                    value={selectedModel}
                    onChange={e => setSelectedModel(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {models.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="api-key-input"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      id="api-key-input"
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      placeholder="Enter your API key"
                      className="w-full p-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                    >
                      {showApiKey ? (
                        <EyeOffIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Model Parameters */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Model Parameters
              </h4>
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="temperature-range"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Temperature: {temperature}
                  </label>
                  <input
                    id="temperature-range"
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={e => setTemperature(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label
                    htmlFor="max-tokens-range"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Max Tokens: {maxTokens}
                  </label>
                  <input
                    id="max-tokens-range"
                    type="range"
                    min="1"
                    max="4096"
                    step="1"
                    value={maxTokens}
                    onChange={e => setMaxTokens(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label
                    htmlFor="top-p-range"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Top P: {topP}
                  </label>
                  <input
                    id="top-p-range"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={topP}
                    onChange={e => setTopP(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label
                    htmlFor="system-prompt"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    System Prompt
                  </label>
                  <textarea
                    id="system-prompt"
                    value={systemPrompt}
                    onChange={e => setSystemPrompt(e.target.value)}
                    placeholder="Enter system prompt..."
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
