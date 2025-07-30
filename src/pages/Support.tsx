import React, { useState, useEffect } from 'react';
import { 
  Headphones, 
  MessageCircle, 
  FileText, 
  Plus, 
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SupportTicket, TicketStatus, TicketPriority } from '../types/SupportTypes';
import { createTicket, getTickets, updateTicket } from '../services/supportService';
import { SupportChat } from '../components/support/SupportChat';
import { TicketForm } from '../components/support/TicketForm';
import { TicketList } from '../components/support/TicketList';
import { FAQSection } from '../components/support/FAQSection';
import { SupportStats } from '../components/support/SupportStats';
import { Footer } from '../components/Footer';

export const Support: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'chat' | 'faq' | 'create'>('overview');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TicketPriority | 'all'>('all');
  const [showChat, setShowChat] = useState(false);
  
  // INSPECTION MODE: Bypass authentication for inspection
  const isInspectionMode = !user;
  const mockUser = { id: 'inspection-user-id', email: 'inspect@doccraft-ai.com' };

  useEffect(() => {
    if (user || isInspectionMode) {
      loadTickets();
    }
  }, [user, isInspectionMode]);

  const loadTickets = async () => {
    if (!user && !isInspectionMode) return;
    
    setLoading(true);
    try {
      if (isInspectionMode) {
        // Mock data for inspection
        const mockTickets: SupportTicket[] = [
          {
            id: '1',
            title: 'Feature Request: Dark Mode',
            description: 'Would like to see a dark mode option for better visibility.',
            status: 'open',
            priority: 'medium',
            category: 'feature_request',
            userId: mockUser.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: [],
            messages: [],
            escalationLevel: 0,
            lastActivityAt: new Date().toISOString(),
            isUrgent: false,
            customerImpact: 'low',
            businessImpact: 'low'
          },
          {
            id: '2',
            title: 'Bug Report: Export Function',
            description: 'Export function is not working properly in Chrome browser.',
            status: 'in_progress',
            priority: 'high',
            category: 'bug_report',
            userId: mockUser.id,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date().toISOString(),
            tags: [],
            messages: [],
            escalationLevel: 0,
            lastActivityAt: new Date().toISOString(),
            isUrgent: false,
            customerImpact: 'low',
            businessImpact: 'low'
          },
          {
            id: '3',
            title: 'General Question: API Limits',
            description: 'What are the current API rate limits for the Pro plan?',
            status: 'resolved',
            priority: 'low',
            category: 'general_inquiry',
            userId: mockUser.id,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date().toISOString(),
            tags: [],
            messages: [],
            escalationLevel: 0,
            lastActivityAt: new Date().toISOString(),
            isUrgent: false,
            customerImpact: 'low',
            businessImpact: 'low'
          }
        ];
        setTickets(mockTickets);
      } else {
        const userTickets = await getTickets(user.id);
        setTickets(userTickets);
      }
    } catch (error) {
      console.error('Failed to load tickets:', error);
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (ticketData: Partial<SupportTicket>) => {
    if (!user && !isInspectionMode) return;

    try {
      if (isInspectionMode) {
        // Mock ticket creation for inspection
        const newTicket: SupportTicket = {
          id: Date.now().toString(),
          ...ticketData,
          userId: mockUser.id,
          status: 'open',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as SupportTicket;
        
        setTickets(prev => [newTicket, ...prev]);
        setActiveTab('tickets');
        toast.success('Support ticket created successfully! (Inspection Mode)');
      } else {
        const newTicket = await createTicket({
          ...ticketData,
          userId: user.id,
          status: 'open',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as SupportTicket);

        setTickets(prev => [newTicket, ...prev]);
        setActiveTab('tickets');
        toast.success('Support ticket created successfully!');
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
      toast.error('Failed to create support ticket');
    }
  };

  const handleUpdateTicket = async (ticketId: string, updates: Partial<SupportTicket>) => {
    try {
      if (isInspectionMode) {
        // Mock ticket update for inspection
        setTickets(prev => prev.map(ticket => 
          ticket.id === ticketId ? { ...ticket, ...updates, updatedAt: new Date().toISOString() } : ticket
        ));
        toast.success('Ticket updated successfully! (Inspection Mode)');
      } else {
        const updatedTicket = await updateTicket(ticketId, updates);
        setTickets(prev => prev.map(ticket => 
          ticket.id === ticketId ? updatedTicket : ticket
        ));
        toast.success('Ticket updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update ticket:', error);
      toast.error('Failed to update ticket');
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Headphones },
    { id: 'tickets', label: 'My Tickets', icon: FileText },
    { id: 'create', label: 'New Ticket', icon: Plus },
    { id: 'chat', label: 'Live Chat', icon: MessageCircle },
    { id: 'faq', label: 'FAQ', icon: HelpCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      {/* Back to Home */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="text-center mb-8">
          <Link 
            to="/"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>


          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Customer Support
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Get help with DocCraft-AI. We're here to assist you 24/7.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Live Chat
                </button>
              </div>
            </div>
          </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick Actions */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setActiveTab('create')}
                      className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Plus className="w-6 h-6 text-blue-600 mr-3" />
                      <div className="text-left">
                        <h3 className="font-medium text-gray-900 dark:text-white">Create Ticket</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Submit a new support request</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setShowChat(true)}
                      className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <MessageCircle className="w-6 h-6 text-green-600 mr-3" />
                      <div className="text-left">
                        <h3 className="font-medium text-gray-900 dark:text-white">Live Chat</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Chat with support team</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('faq')}
                      className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <HelpCircle className="w-6 h-6 text-purple-600 mr-3" />
                      <div className="text-left">
                        <h3 className="font-medium text-gray-900 dark:text-white">FAQ</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Find quick answers</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('tickets')}
                      className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <FileText className="w-6 h-6 text-orange-600 mr-3" />
                      <div className="text-left">
                        <h3 className="font-medium text-gray-900 dark:text-white">My Tickets</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">View all your tickets</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Support Stats */}
              <div className="lg:col-span-1">
                <SupportStats tickets={tickets} />
              </div>
            </div>
          )}

          {activeTab === 'tickets' && (
            <TicketList
              tickets={filteredTickets}
              loading={loading}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterPriority={filterPriority}
              setFilterPriority={setFilterPriority}
              onUpdateTicket={handleUpdateTicket}
              onRefresh={loadTickets}
            />
          )}

          {activeTab === 'create' && (
            <TicketForm
              onSubmit={handleCreateTicket}
              onCancel={() => setActiveTab('overview')}
            />
          )}

          {activeTab === 'faq' && (
            <FAQSection />
          )}
        </div>

        {/* Live Chat Widget */}
        {showChat && (
          <SupportChat
            onClose={() => setShowChat(false)}
            userId={user?.id}
          />
        )}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Support; 