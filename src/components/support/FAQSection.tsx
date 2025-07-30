import React, { useState } from 'react';
import { 
  Search, 
  HelpCircle, 
  ThumbsUp, 
  ThumbsDown, 
  ChevronDown, 
  ChevronRight,
  BookOpen,
  FileText,
  Video,
  Star,
  TrendingUp,
  Clock,
  User,
  MessageSquare
} from 'lucide-react';
import { FAQItem } from '../../types/SupportTypes';

const FAQ_CATEGORIES = [
  { id: 'getting-started', name: 'Getting Started', icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
  { id: 'account-billing', name: 'Account & Billing', icon: FileText, color: 'text-green-600 bg-green-50' },
  { id: 'technical-support', name: 'Technical Support', icon: HelpCircle, color: 'text-purple-600 bg-purple-50' },
  { id: 'features', name: 'Features & Usage', icon: Star, color: 'text-yellow-600 bg-yellow-50' },
  { id: 'troubleshooting', name: 'Troubleshooting', icon: TrendingUp, color: 'text-red-600 bg-red-50' }
];

const MOCK_FAQ_ITEMS: FAQItem[] = [
  {
    id: '1',
    question: 'How do I get started with DocCraft-AI?',
    answer: 'Getting started with DocCraft-AI is easy! Simply sign up for an account, choose your plan, and you\'ll be guided through our onboarding process. We offer interactive tutorials and a comprehensive knowledge base to help you get up and running quickly.',
    category: 'getting-started',
    tags: ['onboarding', 'signup', 'tutorial'],
    views: 1250,
    helpful: 89,
    notHelpful: 3,
    lastUpdated: '2024-01-15T10:30:00Z',
    isPublished: true,
    relatedTickets: []
  },
  {
    id: '2',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual plans. All payments are processed securely through Stripe, and you can update your payment method at any time in your account settings.',
    category: 'account-billing',
    tags: ['payment', 'billing', 'credit-card'],
    views: 890,
    helpful: 67,
    notHelpful: 2,
    lastUpdated: '2024-01-10T14:20:00Z',
    isPublished: true,
    relatedTickets: []
  },
  {
    id: '3',
    question: 'How do I integrate DocCraft-AI with my existing workflow?',
    answer: 'DocCraft-AI offers multiple integration options including API access, webhooks, and plugins for popular platforms like Slack, Microsoft Teams, and Discord. Our integration guide provides step-by-step instructions for each platform.',
    category: 'technical-support',
    tags: ['integration', 'api', 'webhooks'],
    views: 756,
    helpful: 45,
    notHelpful: 1,
    lastUpdated: '2024-01-12T09:15:00Z',
    isPublished: true,
    relatedTickets: []
  },
  {
    id: '4',
    question: 'What are the system requirements?',
    answer: 'DocCraft-AI is a web-based application that works on any modern browser. We recommend Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+. For optimal performance, ensure you have a stable internet connection and at least 4GB of RAM.',
    category: 'technical-support',
    tags: ['system-requirements', 'browser', 'performance'],
    views: 634,
    helpful: 52,
    notHelpful: 4,
    lastUpdated: '2024-01-08T16:45:00Z',
    isPublished: true,
    relatedTickets: []
  },
  {
    id: '5',
    question: 'Can I export my data from DocCraft-AI?',
    answer: 'Yes! You can export your data in multiple formats including JSON, CSV, and PDF. Go to your account settings and look for the "Export Data" option. You can export individual projects or your entire account data.',
    category: 'features',
    tags: ['export', 'data', 'backup'],
    views: 445,
    helpful: 38,
    notHelpful: 2,
    lastUpdated: '2024-01-14T11:30:00Z',
    isPublished: true,
    relatedTickets: []
  },
  {
    id: '6',
    question: 'How do I reset my password?',
    answer: 'To reset your password, go to the login page and click "Forgot Password?" Enter your email address and we\'ll send you a secure link to reset your password. The link expires after 24 hours for security.',
    category: 'account-billing',
    tags: ['password', 'security', 'login'],
    views: 1120,
    helpful: 78,
    notHelpful: 5,
    lastUpdated: '2024-01-09T13:20:00Z',
    isPublished: true,
    relatedTickets: []
  }
];

export const FAQSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [helpfulVotes, setHelpfulVotes] = useState<Set<string>>(new Set());
  const [notHelpfulVotes, setNotHelpfulVotes] = useState<Set<string>>(new Set());

  const filteredFAQ = MOCK_FAQ_ITEMS.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleHelpfulVote = (itemId: string) => {
    if (!helpfulVotes.has(itemId) && !notHelpfulVotes.has(itemId)) {
      setHelpfulVotes(prev => new Set([...prev, itemId]));
      // TODO: Send vote to backend
    }
  };

  const handleNotHelpfulVote = (itemId: string) => {
    if (!helpfulVotes.has(itemId) && !notHelpfulVotes.has(itemId)) {
      setNotHelpfulVotes(prev => new Set([...prev, itemId]));
      // TODO: Send vote to backend
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Find quick answers to common questions about DocCraft-AI
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search FAQ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-lg"
        />
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`p-4 rounded-lg border transition-all ${
            selectedCategory === 'all'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
          }`}
        >
          <div className="text-center">
            <HelpCircle className="w-6 h-6 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-900 dark:text-white">All</div>
          </div>
        </button>
        
        {FAQ_CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-4 rounded-lg border transition-all ${
                selectedCategory === category.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="text-center">
                <Icon className={`w-6 h-6 mx-auto mb-2 ${category.color.split(' ')[0]}`} />
                <div className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFAQ.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No FAQ items found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search or category filter
            </p>
          </div>
        ) : (
          filteredFAQ.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => toggleExpanded(item.id)}
                className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {item.question}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Updated {formatDate(item.lastUpdated)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{item.views} views</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{item.helpful} helpful</span>
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {expandedItems.has(item.id) ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </button>

              {expandedItems.has(item.id) && (
                <div className="px-6 pb-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="pt-4">
                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                      {item.answer}
                    </p>

                    {/* Tags */}
                    {item.tags.length > 0 && (
                      <div className="flex items-center space-x-2 mb-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Tags:</span>
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-gray-300 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Voting */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Was this helpful?
                        </span>
                        <button
                          onClick={() => handleHelpfulVote(item.id)}
                          disabled={helpfulVotes.has(item.id) || notHelpfulVotes.has(item.id)}
                          className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                            helpfulVotes.has(item.id)
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">Yes</span>
                        </button>
                        <button
                          onClick={() => handleNotHelpfulVote(item.id)}
                          disabled={helpfulVotes.has(item.id) || notHelpfulVotes.has(item.id)}
                          className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                            notHelpfulVotes.has(item.id)
                              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                              : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <ThumbsDown className="w-4 h-4" />
                          <span className="text-sm">No</span>
                        </button>
                      </div>

                      <button className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                        <MessageSquare className="w-4 h-4" />
                        <span>Contact Support</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Additional Resources */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Still need help?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-white dark:bg-slate-800 rounded-lg">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Documentation</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Comprehensive guides</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white dark:bg-slate-800 rounded-lg">
            <Video className="w-6 h-6 text-green-600" />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Video Tutorials</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Step-by-step videos</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white dark:bg-slate-800 rounded-lg">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Live Chat</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Get instant help</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 