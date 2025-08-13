import React, { useState, useEffect } from 'react';
import {
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Server,
  Database,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { performanceMonitor } from '../../monitoring/performanceMonitor';

interface SystemStatus {
  cpu: {
    usage: number;
    cores: number;
    temperature?: number;
  };
  memory: {
    used: number;
    total: number;
    available: number;
  };
  disk: {
    used: number;
    total: number;
    iops: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    connections: number;
  };
  database: {
    connections: number;
    queries: number;
    responseTime: number;
  };
  services: {
    ai: 'healthy' | 'warning' | 'critical';
    cache: 'healthy' | 'warning' | 'critical';
    database: 'healthy' | 'warning' | 'critical';
    auth: 'healthy' | 'warning' | 'critical';
  };
}

export const SystemHealth: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<
    'overview' | 'detailed' | 'logs'
  >('overview');

  useEffect(() => {
    const updateSystemStatus = () => {
      // Simulate system status data
      const mockStatus: SystemStatus = {
        cpu: {
          usage: Math.random() * 100,
          cores: 8,
          temperature: 45 + Math.random() * 20,
        },
        memory: {
          used: 2.5 * 1024 * 1024 * 1024, // 2.5GB
          total: 16 * 1024 * 1024 * 1024, // 16GB
          available: 13.5 * 1024 * 1024 * 1024, // 13.5GB
        },
        disk: {
          used: 500 * 1024 * 1024 * 1024, // 500GB
          total: 2 * 1024 * 1024 * 1024 * 1024, // 2TB
          iops: 1500 + Math.random() * 500,
        },
        network: {
          bytesIn: 1024 * 1024 * 1024 + Math.random() * 100 * 1024 * 1024, // 1GB+
          bytesOut: 512 * 1024 * 1024 + Math.random() * 50 * 1024 * 1024, // 512MB+
          connections: 150 + Math.random() * 50,
        },
        database: {
          connections: 25 + Math.random() * 10,
          queries: 1000 + Math.random() * 500,
          responseTime: 5 + Math.random() * 15,
        },
        services: {
          ai: Math.random() > 0.8 ? 'warning' : 'healthy',
          cache: Math.random() > 0.9 ? 'critical' : 'healthy',
          database: 'healthy',
          auth: 'healthy',
        },
      };

      setSystemStatus(mockStatus);
      setIsLoading(false);
    };

    // Initial load
    updateSystemStatus();

    // Update every 5 seconds
    const interval = setInterval(updateSystemStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading || !systemStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading system health...</p>
        </div>
      </div>
    );
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'critical':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const formatBytes = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getMemoryUsagePercentage = (): number => {
    return (systemStatus.memory.used / systemStatus.memory.total) * 100;
  };

  const getDiskUsagePercentage = (): number => {
    return (systemStatus.disk.used / systemStatus.disk.total) * 100;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-600">
            Real-time system status and resource monitoring
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedView('overview')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              selectedView === 'overview'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedView('detailed')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              selectedView === 'detailed'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Detailed
          </button>
          <button
            onClick={() => setSelectedView('logs')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              selectedView === 'logs'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Logs
          </button>
        </div>
      </div>

      {selectedView === 'overview' && (
        <>
          {/* System Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* CPU Usage */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-blue-50 mr-3">
                    <Cpu className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">CPU Usage</h3>
                    <p className="text-sm text-gray-500">
                      {systemStatus.cpu.cores} Cores
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {systemStatus.cpu.usage.toFixed(1)}%
                  </div>
                  {systemStatus.cpu.temperature && (
                    <div className="text-sm text-gray-500">
                      {systemStatus.cpu.temperature.toFixed(1)}°C
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${systemStatus.cpu.usage}%` }}
                />
              </div>
            </div>

            {/* Memory Usage */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-green-50 mr-3">
                    <HardDrive className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Memory</h3>
                    <p className="text-sm text-gray-500">RAM Usage</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {getMemoryUsagePercentage().toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatBytes(systemStatus.memory.used)} /{' '}
                    {formatBytes(systemStatus.memory.total)}
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getMemoryUsagePercentage()}%` }}
                />
              </div>
            </div>

            {/* Disk Usage */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-purple-50 mr-3">
                    <HardDrive className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Disk</h3>
                    <p className="text-sm text-gray-500">Storage Usage</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    {getDiskUsagePercentage().toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatBytes(systemStatus.disk.used)} /{' '}
                    {formatBytes(systemStatus.disk.total)}
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getDiskUsagePercentage()}%` }}
                />
              </div>
            </div>

            {/* Network */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-orange-50 mr-3">
                    <Wifi className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Network</h3>
                    <p className="text-sm text-gray-500">Traffic</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {systemStatus.network.connections} connections
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">In:</span>
                  <span className="font-medium">
                    {formatBytes(systemStatus.network.bytesIn)}/s
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Out:</span>
                  <span className="font-medium">
                    {formatBytes(systemStatus.network.bytesOut)}/s
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Service Health Status */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Service Health Status
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
              {Object.entries(systemStatus.services).map(
                ([service, status]) => (
                  <div
                    key={service}
                    className={`p-4 rounded-lg border ${getHealthColor(status)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-3">{getHealthIcon(status)}</div>
                        <div>
                          <h4 className="font-medium capitalize">{service}</h4>
                          <p className="text-sm opacity-75 capitalize">
                            {status}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </>
      )}

      {selectedView === 'detailed' && (
        <div className="space-y-6">
          {/* Detailed CPU Information */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                CPU Details
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Usage</h4>
                  <div className="text-3xl font-bold text-blue-600">
                    {systemStatus.cpu.usage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">
                    Current CPU utilization
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Cores</h4>
                  <div className="text-3xl font-bold text-green-600">
                    {systemStatus.cpu.cores}
                  </div>
                  <div className="text-sm text-gray-500">
                    Available CPU cores
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Temperature
                  </h4>
                  <div className="text-3xl font-bold text-orange-600">
                    {systemStatus.cpu.temperature?.toFixed(1)}°C
                  </div>
                  <div className="text-sm text-gray-500">
                    Current temperature
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Memory Information */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Memory Details
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Used</h4>
                  <div className="text-3xl font-bold text-red-600">
                    {formatBytes(systemStatus.memory.used)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Currently allocated
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Available</h4>
                  <div className="text-3xl font-bold text-green-600">
                    {formatBytes(systemStatus.memory.available)}
                  </div>
                  <div className="text-sm text-gray-500">Free memory</div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Total</h4>
                  <div className="text-3xl font-bold text-blue-600">
                    {formatBytes(systemStatus.memory.total)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Total system memory
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Database Performance */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Database Performance
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Active Connections
                  </h4>
                  <div className="text-3xl font-bold text-blue-600">
                    {systemStatus.database.connections}
                  </div>
                  <div className="text-sm text-gray-500">
                    Current database connections
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Queries/sec
                  </h4>
                  <div className="text-3xl font-bold text-green-600">
                    {systemStatus.database.queries.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Queries per second
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Response Time
                  </h4>
                  <div className="text-3xl font-bold text-orange-600">
                    {systemStatus.database.responseTime.toFixed(1)}ms
                  </div>
                  <div className="text-sm text-gray-500">
                    Average query response time
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'logs' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">System Logs</h3>
          </div>
          <div className="p-6">
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
              <div className="mb-2">
                [2024-01-15 10:30:15] INFO: System health check completed
              </div>
              <div className="mb-2">
                [2024-01-15 10:30:10] INFO: Memory usage: 15.6%
              </div>
              <div className="mb-2">
                [2024-01-15 10:30:05] INFO: CPU usage: 23.4%
              </div>
              <div className="mb-2">
                [2024-01-15 10:30:00] INFO: Database connections: 28
              </div>
              <div className="mb-2">
                [2024-01-15 10:29:55] INFO: Cache hit rate: 78.2%
              </div>
              <div className="text-yellow-400">
                [2024-01-15 10:29:50] WARN: High memory usage detected
              </div>
              <div className="text-green-400">
                [2024-01-15 10:29:45] INFO: AI service response time: 245ms
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
