import React from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Star,
  TrendingUp,
  Zap,
  Shield,
  Award
} from 'lucide-react';
import { SupportTicket, SupportStats as SupportStatsType } from '../../types/SupportTypes';

interface SupportStatsProps {
  tickets: SupportTicket[];
}

export const SupportStats: React.FC<SupportStatsProps> = ({ tickets }) => {
  const calculateStats = (): SupportStatsType => {
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => t.status === 'open').length;
    const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
    
    const ticketsByCategory = tickets.reduce((acc, ticket) => {
      acc[ticket.category] = (acc[ticket.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ticketsByPriority = tickets.reduce((acc, ticket) => {
      acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ticketsByStatus = tickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average resolution time
    const resolvedTicketsWithTime = tickets.filter(t => t.resolvedAt && t.createdAt);
    const averageResolutionTime = resolvedTicketsWithTime.length > 0 
      ? resolvedTicketsWithTime.reduce((acc, ticket) => {
          const created = new Date(ticket.createdAt);
          const resolved = new Date(ticket.resolvedAt!);
          return acc + (resolved.getTime() - created.getTime());
        }, 0) / resolvedTicketsWithTime.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    // Calculate customer satisfaction
    const ticketsWithRating = tickets.filter(t => t.satisfactionRating);
    const customerSatisfaction = ticketsWithRating.length > 0
      ? ticketsWithRating.reduce((acc, ticket) => acc + (ticket.satisfactionRating || 0), 0) / ticketsWithRating.length
      : 0;

    return {
      totalTickets,
      openTickets,
      resolvedTickets,
      averageResolutionTime,
      customerSatisfaction,
      responseTime: 0, // TODO: Implement response time calculation
      ticketsByCategory: ticketsByCategory as any,
      ticketsByPriority: ticketsByPriority as any,
      ticketsByStatus: ticketsByStatus as any
    };
  };

  const stats = calculateStats();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'in_progress': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'resolved': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'closed': return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'urgent': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const formatTime = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Math.round(hours)}h`;
    return `${Math.round(hours / 24)}d`;
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTickets}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open Tickets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.openTickets}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.resolvedTickets}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Resolution</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatTime(stats.averageResolutionTime)}
              </p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Satisfaction Score */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Satisfaction</h3>
          <Star className="w-6 h-6 text-yellow-500" />
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.customerSatisfaction.toFixed(1)}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(stats.customerSatisfaction)
                        ? 'text-yellow-500 fill-current'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                out of 5
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(stats.customerSatisfaction / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ticket Status</h3>
        <div className="space-y-3">
          {Object.entries(stats.ticketsByStatus).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                  {status.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {status.replace('_', ' ')}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Priority Distribution</h3>
        <div className="space-y-3">
          {Object.entries(stats.ticketsByPriority).map(([priority, count]) => (
            <div key={priority} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
                  {priority.toUpperCase()}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {priority}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Response Time</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg: 2.3 hours</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">First Contact Resolution</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">85%</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Escalation Rate</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">12%</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Award className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Agent Productivity</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">92%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 