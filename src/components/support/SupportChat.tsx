import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Paperclip, 
  Smile, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ChatMessage } from '../../types/SupportTypes';

interface SupportChatProps {
  onClose: () => void;
  userId?: string;
}

const MOCK_AGENT = {
  id: 'agent-1',
  name: 'Sarah Johnson',
  avatar: '👩‍💼',
  status: 'online',
  department: 'Technical Support',
  responseTime: '2-3 minutes'
};

const QUICK_REPLIES = [
  "I need help with my account",
  "I'm having technical issues",
  "I want to report a bug",
  "I have a billing question",
  "I need integration help"
];

export const SupportChat: React.FC<SupportChatProps> = ({ 
  onClose, 
  userId 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<'connecting' | 'connected' | 'waiting' | 'ended'>('connecting');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate connection
    setTimeout(() => {
      setSessionStatus('connected');
      addSystemMessage('Welcome to DocCraft-AI Support! How can we help you today?');
    }, 1000);

    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addSystemMessage = (content: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      sessionId: 'session-1',
      senderId: 'system',
      senderType: 'system',
      content,
      messageType: 'text',
      timestamp: new Date().toISOString(),
      isRead: true
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (content: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      sessionId: 'session-1',
      senderId: userId || 'user',
      senderType: 'user',
      content,
      messageType: 'text',
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setMessages(prev => [...prev, message]);
    setInputMessage('');
  };

  const simulateAgentResponse = (userMessage: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      let response = '';
      
      if (userMessage.toLowerCase().includes('account')) {
        response = "I can help you with your account! What specific issue are you experiencing?";
      } else if (userMessage.toLowerCase().includes('technical') || userMessage.toLowerCase().includes('issue')) {
        response = "I understand you're having technical issues. Let me gather some information to better assist you. What exactly is happening?";
      } else if (userMessage.toLowerCase().includes('bug')) {
        response = "Thank you for reporting this bug. Could you please provide more details about what you were doing when this occurred?";
      } else if (userMessage.toLowerCase().includes('billing')) {
        response = "I'd be happy to help with your billing question. What specific billing issue are you experiencing?";
      } else if (userMessage.toLowerCase().includes('integration')) {
        response = "I can help you with integration questions! What platform or service are you trying to integrate with?";
      } else {
        response = "Thank you for reaching out! I'm here to help. Could you please provide more details about your question?";
      }

      const agentMessage: ChatMessage = {
        id: Date.now().toString(),
        sessionId: 'session-1',
        senderId: MOCK_AGENT.id,
        senderType: 'agent',
        content: response,
        messageType: 'text',
        timestamp: new Date().toISOString(),
        isRead: false
      };
      
      setMessages(prev => [...prev, agentMessage]);
      setIsTyping(false);
    }, 2000 + Math.random() * 2000); // Random delay between 2-4 seconds
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    addUserMessage(inputMessage);
    simulateAgentResponse(inputMessage);
    setShowQuickReplies(false);
  };

  const handleQuickReply = (reply: string) => {
    addUserMessage(reply);
    simulateAgentResponse(reply);
    setShowQuickReplies(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg">
              {MOCK_AGENT.avatar}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {MOCK_AGENT.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {MOCK_AGENT.department} • {MOCK_AGENT.responseTime}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            {sessionStatus === 'connecting' && (
              <>
                <Clock className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-blue-600">Connecting...</span>
              </>
            )}
            {sessionStatus === 'connected' && (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Connected</span>
              </>
            )}
            {sessionStatus === 'waiting' && (
              <>
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-yellow-600">Waiting for agent</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-1 text-gray-500">
            <span className="text-xs">Secure</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.senderType === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.senderType === 'system'
                  ? 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                  : 'bg-gray-200 dark:bg-slate-600 text-gray-900 dark:text-white'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.senderType === 'agent' && (
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">
                    {MOCK_AGENT.avatar}
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.senderType === 'user' 
                      ? 'text-blue-100' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-slate-600 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                  {MOCK_AGENT.avatar}
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {showQuickReplies && messages.length === 1 && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-2">
            {QUICK_REPLIES.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(reply)}
                className="px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-left"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows={1}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white resize-none"
              disabled={sessionStatus !== 'connected'}
            />
          </div>
          <div className="flex items-center space-x-1">
            <button
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              disabled={sessionStatus !== 'connected'}
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              disabled={sessionStatus !== 'connected'}
            >
              <Smile className="w-4 h-4" />
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || sessionStatus !== 'connected'}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 