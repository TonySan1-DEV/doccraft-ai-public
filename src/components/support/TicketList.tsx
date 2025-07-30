import React, { useState } from 'react';
import { 
  Search, 
  Clock, 
  MessageSquare, 
  Tag,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Calendar,
  FileText
} from 'lucide-react';
import { SupportTicket, TicketStatus, TicketPriority } from '../../types/SupportTypes';

interface TicketListProps {
  tickets: SupportTicket[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: TicketStatus | 'all';
  setFilterStatus: (status: TicketStatus | 'all') => void;
  filterPriority: TicketPriority | 'all';
  setFilterPriority: (priority: TicketPriority | 'all') => void;
  onUpdateTicket: (ticketId: string, updates: Partial<SupportTicket>) => Promise<void>;
  onRefresh: () => void;
}

const STATUS_COLORS = {
  open: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  in_progress: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
  resolved: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  closed: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
};

const PRIORITY_COLORS = {
  low: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
  high: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
  urgent: 'text-red-600 bg-red-50 dark:bg-red-900/20'
};

const CATEGORY_ICONS = {
  technical_issue: '🔧',
  billing: '💳',
  feature_request: '💡',
  bug_report: '🐛',
  account_access: '🔐',
  general_inquiry: '❓',
  integration_help: '🔗',
  performance: '⚡',
  security: '🛡️',
  other: '📝'
};

export const TicketList: React.FC<TicketListProps> = ({
  tickets,
  loading,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  filterPriority,
  setFilterPriority,
  onRefresh
}) => {
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'priority' | 'status'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const sortedTickets = [...tickets].sort((a, b) => {
    let aValue: any = a[sortBy];
    let bValue: any = b[sortBy];

    if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Support Tickets
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TicketStatus | 'all')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as TicketPriority | 'all')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortDirection}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('-');
              setSortBy(field as typeof sortBy);
              setSortDirection(direction as 'asc' | 'desc');
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="updatedAt-desc">Recently Updated</option>
            <option value="priority-desc">Priority (High to Low)</option>
            <option value="priority-asc">Priority (Low to High)</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading tickets...</p>
          </div>
        ) : sortedTickets.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No tickets found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery || filterStatus !== 'all' || filterPriority !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first support ticket to get started'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedTickets.map((ticket) => (
              <div key={ticket.id} className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg">
                        {CATEGORY_ICONS[ticket.category as keyof typeof CATEGORY_ICONS]}
                      </span>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                        {ticket.title}
                      </h3>
                      {ticket.isUrgent && (
                        <span className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 rounded-full">
                          Urgent
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {ticket.description}
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(ticket.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{ticket.messages?.length || 0} messages</span>
                      </div>
                      {ticket.assignedTo && (
                        <div className="flex items-center space-x-1">
                          <span>Assigned</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {ticket.tags && ticket.tags.length > 0 && (
                      <div className="flex items-center space-x-2 mt-3">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <div className="flex flex-wrap gap-1">
                          {ticket.tags.map((tag, index) => (
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
                  </div>

                  <div className="flex items-center space-x-3 ml-4">
                    {/* Status */}
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[ticket.status]}`}>
                      {getStatusIcon(ticket.status)}
                      <span className="capitalize">{ticket.status.replace('_', ' ')}</span>
                    </div>

                    {/* Priority */}
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${PRIORITY_COLORS[ticket.priority]}`}>
                      <span className="capitalize">{ticket.priority}</span>
                    </div>

                    {/* Actions */}
                    <div className="relative">
                      <button
                        onClick={() => setSelectedTicket(selectedTicket === ticket.id ? null : ticket.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {selectedTicket === ticket.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                          <div className="py-1">
                            <button
                              onClick={() => {/* TODO: View ticket details */}}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </button>
                            <button
                              onClick={() => {/* TODO: Edit ticket */}}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={() => {/* TODO: Delete ticket */}}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 