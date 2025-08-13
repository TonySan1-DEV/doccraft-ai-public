import React, { useState, useEffect } from 'react';
import {
  Bell,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
  Plus,
} from 'lucide-react';
import { performanceMonitor } from '../../monitoring/performanceMonitor';

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  threshold: number;
  operator: 'gt' | 'lt' | 'eq';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  cooldown: number;
  lastTriggered?: number;
}

interface AlertHistory {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: string;
  message: string;
  timestamp: number;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: number;
}

export const AlertManagement: React.FC = () => {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editingRule, setEditingRule] = useState<Partial<AlertRule>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRule, setNewRule] = useState<Partial<AlertRule>>({});

  useEffect(() => {
    // Load alert rules and history
    loadAlertRules();
    loadAlertHistory();

    // Listen for new alerts
    const handleAlert = (alert: any) => {
      addAlertToHistory(alert);
    };

    performanceMonitor.on('alert', handleAlert);

    return () => {
      performanceMonitor.off('alert', handleAlert);
    };
  }, []);

  const loadAlertRules = () => {
    // This would typically load from the performance monitor
    // For now, we'll use mock data
    const mockRules: AlertRule[] = [
      {
        id: 'ai_response_time_high',
        name: 'AI Response Time High',
        metric: 'ai.response_time',
        threshold: 1000,
        operator: 'gt',
        severity: 'high',
        enabled: true,
        cooldown: 60000,
      },
      {
        id: 'cache_hit_rate_low',
        name: 'Cache Hit Rate Low',
        metric: 'ai.cache_hit_rate',
        threshold: 0.4,
        operator: 'lt',
        severity: 'medium',
        enabled: true,
        cooldown: 300000,
      },
    ];
    setAlertRules(mockRules);
  };

  const loadAlertHistory = () => {
    // Mock alert history
    const mockHistory: AlertHistory[] = [
      {
        id: '1',
        ruleId: 'ai_response_time_high',
        ruleName: 'AI Response Time High',
        severity: 'high',
        message: 'AI response time exceeded 1000ms threshold',
        timestamp: Date.now() - 300000,
        acknowledged: false,
      },
    ];
    setAlertHistory(mockHistory);
  };

  const addAlertToHistory = (alert: any) => {
    const newAlert: AlertHistory = {
      id: Date.now().toString(),
      ruleId: alert.rule.id,
      ruleName: alert.rule.name,
      severity: alert.rule.severity,
      message: `${alert.rule.name}: ${alert.metric.name} = ${alert.metric.value}`,
      timestamp: alert.timestamp,
      acknowledged: false,
    };
    setAlertHistory(prev => [newAlert, ...prev]);
  };

  const handleEditRule = (rule: AlertRule) => {
    setIsEditing(rule.id);
    setEditingRule(rule);
  };

  const handleSaveRule = () => {
    if (isEditing) {
      setAlertRules(prev =>
        prev.map(rule =>
          rule.id === isEditing ? { ...rule, ...editingRule } : rule
        )
      );
    }
    setIsEditing(null);
    setEditingRule({});
  };

  const handleDeleteRule = (ruleId: string) => {
    setAlertRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const handleCreateRule = () => {
    if (newRule.name && newRule.metric && newRule.threshold !== undefined) {
      const rule: AlertRule = {
        id: Date.now().toString(),
        name: newRule.name,
        metric: newRule.metric,
        threshold: newRule.threshold,
        operator: newRule.operator || 'gt',
        severity: newRule.severity || 'medium',
        enabled: newRule.enabled !== undefined ? newRule.enabled : true,
        cooldown: newRule.cooldown || 60000,
      } as AlertRule;

      setAlertRules(prev => [...prev, rule]);
      setNewRule({});
      setShowCreateForm(false);
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlertHistory(prev =>
      prev.map(alert =>
        alert.id === alertId
          ? {
              ...alert,
              acknowledged: true,
              acknowledgedBy: 'Admin',
              acknowledgedAt: Date.now(),
            }
          : alert
      )
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5" />;
      case 'low':
        return <Bell className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alert Management</h1>
          <p className="text-gray-600">Configure and monitor system alerts</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Alert Rule
        </button>
      </div>

      {/* Create New Alert Rule Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Create New Alert Rule
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rule Name
              </label>
              <input
                type="text"
                value={newRule.name || ''}
                onChange={e =>
                  setNewRule(prev => ({ ...prev, name: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="e.g., High Memory Usage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Metric
              </label>
              <select
                value={newRule.metric || ''}
                onChange={e =>
                  setNewRule(prev => ({ ...prev, metric: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Select Metric</option>
                <option value="ai.response_time">AI Response Time</option>
                <option value="ai.cache_hit_rate">Cache Hit Rate</option>
                <option value="system.memory.heap_used">Memory Usage</option>
                <option value="ux.action_duration">User Action Duration</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Threshold
              </label>
              <input
                type="number"
                value={newRule.threshold || ''}
                onChange={e =>
                  setNewRule(prev => ({
                    ...prev,
                    threshold: parseFloat(e.target.value),
                  }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="e.g., 1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operator
              </label>
              <select
                value={newRule.operator || 'gt'}
                onChange={e =>
                  setNewRule(prev => ({
                    ...prev,
                    operator: e.target.value as any,
                  }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="gt">Greater Than</option>
                <option value="lt">Less Than</option>
                <option value="eq">Equal To</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity
              </label>
              <select
                value={newRule.severity || 'medium'}
                onChange={e =>
                  setNewRule(prev => ({
                    ...prev,
                    severity: e.target.value as any,
                  }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cooldown (ms)
              </label>
              <input
                type="number"
                value={newRule.cooldown || 60000}
                onChange={e =>
                  setNewRule(prev => ({
                    ...prev,
                    cooldown: parseInt(e.target.value),
                  }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="60000"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateRule}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Rule
            </button>
          </div>
        </div>
      )}

      {/* Alert Rules */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Alert Rules</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {alertRules.map(rule => (
            <div key={rule.id} className="px-6 py-4">
              {isEditing === rule.id ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <input
                    type="text"
                    value={editingRule.name || rule.name}
                    onChange={e =>
                      setEditingRule(prev => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="border border-gray-300 rounded-md px-3 py-2"
                  />
                  <input
                    type="number"
                    value={
                      editingRule.threshold !== undefined
                        ? editingRule.threshold
                        : rule.threshold
                    }
                    onChange={e =>
                      setEditingRule(prev => ({
                        ...prev,
                        threshold: parseFloat(e.target.value),
                      }))
                    }
                    className="border border-gray-300 rounded-md px-3 py-2"
                  />
                  <select
                    value={editingRule.severity || rule.severity}
                    onChange={e =>
                      setEditingRule(prev => ({
                        ...prev,
                        severity: e.target.value as any,
                      }))
                    }
                    className="border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveRule}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(null)}
                      className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-2 rounded-lg ${getSeverityColor(rule.severity)}`}
                    >
                      {getSeverityIcon(rule.severity)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{rule.name}</p>
                      <p className="text-sm text-gray-600">
                        {rule.metric} {rule.operator} {rule.threshold}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rule.enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {rule.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      onClick={() => handleEditRule(rule)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Alert History */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {alertHistory.map(alert => (
            <div key={alert.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}
                  >
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {alert.ruleName}
                    </p>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {alert.acknowledged ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        Acknowledged by {alert.acknowledgedBy}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
