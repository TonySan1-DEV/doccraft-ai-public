// MCP Context Block
/*
{
  file: "ModeErrorBoundary.tsx",
  role: "frontend-developer",
  allowedActions: ["ui", "error_handling", "recovery"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "error_boundary"
}
*/

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Settings,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
} from 'lucide-react';
import {
  ModeValidationError,
  MODE_ERROR_CODES,
  MODE_RECOVERY_ACTIONS,
  SystemMode,
  ModeConfiguration,
  DEFAULT_MODE_CONFIGS,
} from '../types/systemModes';

interface ModeErrorBoundaryProps {
  children: ReactNode;
  fallbackMode?: SystemMode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRecovery?: (recoveredMode: SystemMode) => void;
  showRecoveryOptions?: boolean;
}

interface ModeErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  modeValidationError?: ModeValidationError;
  recoveryAttempts: number;
  isRecovering: boolean;
  lastKnownGoodMode?: SystemMode;
  fallbackMode: SystemMode;
  lastRecoveryTime: number;
}

interface MemoryTracker {
  componentMountTime: number;
  timeouts: Set<NodeJS.Timeout>;
  intervals: Set<NodeJS.Timeout>;
  eventListeners: Array<{
    element: EventTarget;
    event: string;
    handler: EventListener;
  }>;
  memoryUsageBaseline: number;
}

interface MemoryAlert {
  timestamp: number;
  memoryUsage: number;
  componentAge: number;
  action: string;
}

/**
 * Mode Error Boundary Component
 *
 * @description Specialized error boundary for handling mode system errors
 * with automatic recovery mechanisms, memory leak prevention, and user-friendly error reporting
 */
export class ModeErrorBoundary extends Component<
  ModeErrorBoundaryProps,
  ModeErrorBoundaryState
> {
  private readonly MAX_RECOVERY_ATTEMPTS = 3;
  private readonly RECOVERY_TIMEOUT = 5000;
  private readonly MEMORY_CLEANUP_INTERVAL = 60000; // 1 minute
  private readonly MEMORY_ALERT_THRESHOLD = 50 * 1024 * 1024; // 50MB

  private recoveryTimeout: NodeJS.Timeout | null = null;
  private memoryCleanupInterval: NodeJS.Timeout | null = null;
  private memoryTracker: MemoryTracker;
  private memoryAlerts: MemoryAlert[] = [];

  constructor(props: ModeErrorBoundaryProps) {
    super(props);

    this.memoryTracker = {
      componentMountTime: Date.now(),
      timeouts: new Set(),
      intervals: new Set(),
      eventListeners: [],
      memoryUsageBaseline: this.getMemoryUsage(),
    };

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRecovering: false,
      recoveryAttempts: 0,
      fallbackMode: props.fallbackMode || 'HYBRID',
      lastRecoveryTime: 0,
    };
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<ModeErrorBoundaryState> {
    return {
      hasError: true,
      error,
      modeValidationError: this.extractModeValidationError(error),
    };
  }

  componentDidMount() {
    // Set up memory cleanup interval
    this.memoryCleanupInterval = this.createManagedInterval(() => {
      this.performMemoryCleanup();
    }, this.MEMORY_CLEANUP_INTERVAL);

    // Add window error listener for unhandled errors
    const windowErrorHandler = this.handleWindowError.bind(this);
    window.addEventListener('error', windowErrorHandler);
    this.memoryTracker.eventListeners.push({
      element: window,
      event: 'error',
      handler: windowErrorHandler,
    });

    // Add unhandled promise rejection listener
    const unhandledRejectionHandler = this.handleUnhandledRejection.bind(this);
    window.addEventListener('unhandledrejection', unhandledRejectionHandler);
    this.memoryTracker.eventListeners.push({
      element: window,
      event: 'unhandledrejection',
      handler: unhandledRejectionHandler,
    });
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ModeErrorBoundary caught an error:', error, errorInfo);

    // Extract mode-specific error information
    const modeValidationError = this.extractModeValidationError(error);

    this.setState({
      error,
      errorInfo,
      modeValidationError,
      lastKnownGoodMode: this.getLastKnownGoodMode(),
    });

    // Notify parent component
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Attempt automatic recovery for certain error types
    if (
      modeValidationError?.recoverable &&
      this.state.recoveryAttempts < this.MAX_RECOVERY_ATTEMPTS
    ) {
      this.attemptAutomaticRecovery();
    }
  }

  componentWillUnmount() {
    // Clear all timeouts
    if (this.recoveryTimeout) {
      clearTimeout(this.recoveryTimeout);
      this.memoryTracker.timeouts.delete(this.recoveryTimeout);
      this.recoveryTimeout = null;
    }

    // Clear all tracked timeouts and intervals
    this.memoryTracker.timeouts.forEach(timeout => clearTimeout(timeout));
    this.memoryTracker.intervals.forEach(interval => clearInterval(interval));

    // Remove all event listeners
    this.memoryTracker.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });

    // Clean up localStorage entries
    this.cleanupLocalStorageEntries();

    // Clear memory tracker
    this.memoryTracker.timeouts.clear();
    this.memoryTracker.intervals.clear();
    this.memoryTracker.eventListeners = [];

    console.log(
      `ModeErrorBoundary cleanup completed. Component lived for ${Date.now() - this.memoryTracker.componentMountTime}ms`
    );
  }

  /**
   * Extract mode validation error from generic error
   */
  private static extractModeValidationError(
    error: Error
  ): ModeValidationError | undefined {
    // Check if error has mode-specific information
    if ((error as any).modeValidationError) {
      return (error as any).modeValidationError;
    }

    // Check error message for mode-related keywords
    const message = error.message.toLowerCase();
    if (
      message.includes('mode') ||
      message.includes('validation') ||
      message.includes('configuration')
    ) {
      return {
        type: 'system_error',
        message: error.message,
        code: MODE_ERROR_CODES.SYSTEM_ERROR,
        recoverable: true,
        recoveryActions: MODE_RECOVERY_ACTIONS[MODE_ERROR_CODES.SYSTEM_ERROR],
      };
    }

    return undefined;
  }

  /**
   * Get the last known good mode from localStorage or preferences
   */
  private getLastKnownGoodMode(): SystemMode | undefined {
    try {
      const stored = localStorage.getItem('docCraft_lastKnownGoodMode');
      if (stored && ['MANUAL', 'HYBRID', 'FULLY_AUTO'].includes(stored)) {
        return stored as SystemMode;
      }
    } catch (error) {
      console.warn('Could not retrieve last known good mode:', error);
    }
    return undefined;
  }

  /**
   * Store the current mode as a known good mode
   */
  private storeKnownGoodMode(mode: SystemMode): void {
    try {
      localStorage.setItem('docCraft_lastKnownGoodMode', mode);
    } catch (error) {
      console.warn('Could not store known good mode:', error);
    }
  }

  /**
   * Memory management methods
   */
  private getMemoryUsage(): number {
    // Get memory usage if available (Chrome DevTools)
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize || 0;
    }
    return 0;
  }

  private createManagedTimeout(
    callback: () => void,
    delay: number
  ): NodeJS.Timeout {
    const timeout = setTimeout(() => {
      // Remove from tracking set when timeout executes
      this.memoryTracker.timeouts.delete(timeout);
      callback();
    }, delay);

    // Track timeout for cleanup
    this.memoryTracker.timeouts.add(timeout);

    return timeout;
  }

  private createManagedInterval(
    callback: () => void,
    delay: number
  ): NodeJS.Timeout {
    const interval = setInterval(() => {
      callback();
    }, delay);

    // Track interval for cleanup
    this.memoryTracker.intervals.add(interval);

    return interval;
  }

  private performMemoryCleanup(): void {
    const currentMemoryUsage = this.getMemoryUsage();
    const memoryGrowth =
      currentMemoryUsage - this.memoryTracker.memoryUsageBaseline;

    // Log memory growth if significant
    if (memoryGrowth > 10 * 1024 * 1024) {
      // 10MB
      console.warn(
        `ModeErrorBoundary memory growth detected: ${memoryGrowth / 1024 / 1024}MB`
      );
    }

    // Clean up old localStorage entries
    this.cleanupOldRecoveryData();

    // Check memory usage and trigger alerts if needed
    this.checkMemoryUsage();

    // Force garbage collection if available (development only)
    if (process.env.NODE_ENV === 'development' && 'gc' in window) {
      (window as any).gc();
    }
  }

  private checkMemoryUsage(): void {
    const currentMemoryUsage = this.getMemoryUsage();
    const memoryGrowth =
      currentMemoryUsage - this.memoryTracker.memoryUsageBaseline;
    const componentAge = Date.now() - this.memoryTracker.componentMountTime;

    if (memoryGrowth > this.MEMORY_ALERT_THRESHOLD) {
      const alert: MemoryAlert = {
        timestamp: Date.now(),
        memoryUsage: currentMemoryUsage,
        componentAge,
        action: 'MEMORY_THRESHOLD_EXCEEDED',
      };

      this.memoryAlerts.push(alert);

      // Keep only last 10 alerts
      if (this.memoryAlerts.length > 10) {
        this.memoryAlerts.shift();
      }

      console.warn('Memory usage alert:', alert);

      // Trigger aggressive cleanup if memory usage is very high
      if (memoryGrowth > 100 * 1024 * 1024) {
        // 100MB
        this.performAggressiveCleanup();
      }
    }
  }

  private performAggressiveCleanup(): void {
    console.log('Performing aggressive memory cleanup');

    // Clear all caches
    this.cleanupLocalStorageEntries();

    // Force state cleanup
    if (this.state.hasError) {
      this.setState({
        error: null,
        errorInfo: null,
      });
    }

    // Clear old memory alerts
    this.memoryAlerts = this.memoryAlerts.slice(-3); // Keep only last 3

    // Update baseline
    this.memoryTracker.memoryUsageBaseline = this.getMemoryUsage();
  }

  private cleanupLocalStorageEntries(): void {
    try {
      // Clean up all mode-related localStorage entries
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith('mode-recovery-') ||
            key.startsWith('mode-error-') ||
            key.startsWith('mode-boundary-'))
        ) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`Failed to remove localStorage key: ${key}`, error);
        }
      });

      console.log(`Cleaned up ${keysToRemove.length} localStorage entries`);
    } catch (error) {
      console.warn('Error during localStorage cleanup:', error);
    }
  }

  private cleanupOldRecoveryData(): void {
    try {
      const recoveryData = localStorage.getItem('mode-recovery-data');
      if (recoveryData) {
        const data = JSON.parse(recoveryData);

        // Remove entries older than 24 hours
        if (Date.now() - data.timestamp > 86400000) {
          localStorage.removeItem('mode-recovery-data');
          console.log('Removed old recovery data');
        }
      }

      // Clean up error logs older than 1 hour
      const errorLog = localStorage.getItem('mode-error-log');
      if (errorLog) {
        const logs = JSON.parse(errorLog);
        const oneHourAgo = Date.now() - 3600000;

        const recentLogs = logs.filter(
          (log: any) => log.timestamp > oneHourAgo
        );

        if (recentLogs.length !== logs.length) {
          localStorage.setItem('mode-error-log', JSON.stringify(recentLogs));
          console.log(
            `Cleaned up ${logs.length - recentLogs.length} old error logs`
          );
        }
      }
    } catch (error) {
      console.warn('Error during recovery data cleanup:', error);
    }
  }

  /**
   * Event handlers for unhandled errors
   */
  private handleWindowError = (event: ErrorEvent): void => {
    console.warn('Unhandled error caught by ModeErrorBoundary:', event.error);
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
    console.warn(
      'Unhandled promise rejection caught by ModeErrorBoundary:',
      event.reason
    );
  };

  /**
   * Attempt automatic recovery from mode errors
   */
  private attemptAutomaticRecovery = async (): Promise<void> => {
    if (
      this.state.isRecovering ||
      this.state.recoveryAttempts >= this.MAX_RECOVERY_ATTEMPTS
    ) {
      return;
    }

    this.setState({ isRecovering: true });

    try {
      // Clear any existing recovery timeout
      if (this.recoveryTimeout) {
        clearTimeout(this.recoveryTimeout);
        this.memoryTracker.timeouts.delete(this.recoveryTimeout);
        this.recoveryTimeout = null;
      }

      // Create new managed timeout
      this.recoveryTimeout = this.createManagedTimeout(async () => {
        try {
          const recoveryMode = this.determineRecoveryMode();
          const success = await this.switchToRecoveryMode(recoveryMode);

          if (success) {
            this.setState({
              hasError: false,
              error: null,
              errorInfo: null,
              modeValidationError: undefined,
              isRecovering: false,
              lastRecoveryTime: Date.now(),
            });

            // Store successful recovery info
            this.storeRecoverySuccess(recoveryMode);

            // Notify parent of recovery
            if (this.props.onRecovery) {
              this.props.onRecovery(recoveryMode);
            }

            console.log(
              '✅ Mode system recovered successfully to:',
              recoveryMode
            );
          } else {
            throw new Error('Recovery mode switch failed');
          }
        } catch (recoveryError) {
          console.error('❌ Recovery attempt failed:', recoveryError);
          this.setState(prevState => ({
            isRecovering: false,
            recoveryAttempts: prevState.recoveryAttempts + 1,
          }));
        }

        this.recoveryTimeout = null;
      }, this.RECOVERY_TIMEOUT);
    } catch (error) {
      console.error('Error initiating recovery:', error);
      this.setState({ isRecovering: false });
    }
  };

  /**
   * Store recovery success information
   */
  private storeRecoverySuccess(recoveryMode: SystemMode): void {
    try {
      const recoveryData = {
        mode: recoveryMode,
        timestamp: Date.now(),
        success: true,
        attempts: this.state.recoveryAttempts + 1,
      };

      localStorage.setItem('mode-recovery-data', JSON.stringify(recoveryData));

      // Store the recovery mode as known good
      this.storeKnownGoodMode(recoveryMode);
    } catch (error) {
      console.warn('Could not store recovery success data:', error);
    }
  }

  /**
   * Determine the best recovery mode based on error type and context
   */
  private determineRecoveryMode(): SystemMode {
    const { modeValidationError, lastKnownGoodMode, fallbackMode } = this.state;

    // If we have a last known good mode, try that first
    if (lastKnownGoodMode) {
      return lastKnownGoodMode;
    }

    // If error is related to a specific mode, try a different one
    if (modeValidationError?.type === 'invalid_mode') {
      const currentMode =
        (modeValidationError.context?.currentMode as SystemMode) ||
        fallbackMode;
      const availableModes: SystemMode[] = ['MANUAL', 'HYBRID', 'FULLY_AUTO'];
      const alternativeMode = availableModes.find(mode => mode !== currentMode);
      return alternativeMode || fallbackMode;
    }

    // Default to fallback mode
    return fallbackMode;
  }

  /**
   * Switch to the specified recovery mode
   */
  private async switchToRecoveryMode(mode: SystemMode): Promise<boolean> {
    try {
      // Validate the mode configuration
      const config = DEFAULT_MODE_CONFIGS[mode];
      if (!config) {
        throw new Error(`Invalid recovery mode: ${mode}`);
      }

      // Dispatch mode change event
      window.dispatchEvent(
        new CustomEvent('modeRecovery', {
          detail: {
            mode,
            config,
            timestamp: new Date(),
            reason: 'Automatic recovery from error',
          },
        })
      );

      // Wait a bit for modules to process the change
      await new Promise(resolve => {
        const timeout = this.createManagedTimeout(resolve, 500);
        return timeout;
      });

      return true;
    } catch (error) {
      console.error('Failed to switch to recovery mode:', error);
      return false;
    }
  }

  /**
   * Handle manual recovery attempt
   */
  private handleManualRecovery = async (mode: SystemMode): Promise<void> => {
    this.setState({ isRecovering: true });

    try {
      const success = await this.switchToRecoveryMode(mode);

      if (success) {
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
          modeValidationError: undefined,
          isRecovering: false,
          recoveryAttempts: 0,
        });

        this.storeKnownGoodMode(mode);

        if (this.props.onRecovery) {
          this.props.onRecovery(mode);
        }
      } else {
        throw new Error('Manual recovery failed');
      }
    } catch (error) {
      console.error('Manual recovery failed:', error);
      this.setState({ isRecovering: false });
    }
  };

  /**
   * Reset the error boundary
   */
  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      modeValidationError: undefined,
      isRecovering: false,
      recoveryAttempts: 0,
    });
  };

  /**
   * Get memory usage report for debugging
   */
  private getMemoryReport(): object {
    return {
      componentAge: Date.now() - this.memoryTracker.componentMountTime,
      currentMemoryUsage: this.getMemoryUsage(),
      memoryGrowth:
        this.getMemoryUsage() - this.memoryTracker.memoryUsageBaseline,
      trackedTimeouts: this.memoryTracker.timeouts.size,
      trackedIntervals: this.memoryTracker.intervals.size,
      trackedEventListeners: this.memoryTracker.eventListeners.length,
      recentAlerts: this.memoryAlerts.length,
      recoveryAttempts: this.state.recoveryAttempts,
    };
  }

  /**
   * Render error UI with recovery options
   */
  render() {
    if (this.state.hasError) {
      return this.renderErrorUI();
    }

    return this.props.children;
  }

  /**
   * Render the error UI with recovery options
   */
  private renderErrorUI(): ReactNode {
    const {
      error,
      modeValidationError,
      isRecovering,
      recoveryAttempts,
      fallbackMode,
    } = this.state;

    const isRecoverable = modeValidationError?.recoverable ?? true;
    const recoveryActions =
      modeValidationError?.recoveryActions ??
      MODE_RECOVERY_ACTIONS[MODE_ERROR_CODES.SYSTEM_ERROR];

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl border border-red-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Mode System Error</h1>
                <p className="text-red-100">
                  Something went wrong with the writing mode system
                </p>
              </div>
            </div>
          </div>

          {/* Error Details */}
          <div className="p-6 space-y-6">
            {/* Error Summary */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 mb-2">
                    Error Details
                  </h3>
                  <p className="text-red-700 text-sm mb-2">
                    {modeValidationError?.message ||
                      error?.message ||
                      'An unexpected error occurred'}
                  </p>
                  {modeValidationError?.code && (
                    <p className="text-red-600 text-xs font-mono">
                      Error Code: {modeValidationError.code}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Recovery Status */}
            {isRecovering && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                  <div>
                    <h3 className="font-semibold text-blue-800">
                      Attempting Recovery
                    </h3>
                    <p className="text-blue-700 text-sm">
                      Attempt {recoveryAttempts + 1} of{' '}
                      {this.MAX_RECOVERY_ATTEMPTS}...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Recovery Options */}
            {isRecoverable && !isRecovering && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-800 mb-3">
                      Recovery Options
                    </h3>

                    {/* Mode Selection */}
                    <div className="space-y-3">
                      <p className="text-green-700 text-sm">
                        Select a mode to recover to:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {(
                          ['MANUAL', 'HYBRID', 'FULLY_AUTO'] as SystemMode[]
                        ).map(mode => (
                          <button
                            key={mode}
                            onClick={() => this.handleManualRecovery(mode)}
                            disabled={isRecovering}
                            className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                              mode === fallbackMode
                                ? 'border-green-500 bg-green-100 text-green-800'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50'
                            }`}
                          >
                            <div className="text-center">
                              <div className="font-semibold">
                                {mode.replace('_', ' ')}
                              </div>
                              <div className="text-xs opacity-75">
                                {mode === fallbackMode
                                  ? 'Recommended'
                                  : 'Alternative'}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recovery Actions */}
            {recoveryActions && recoveryActions.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <HelpCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-800 mb-2">
                      Suggested Actions
                    </h3>
                    <ul className="space-y-1">
                      {recoveryActions.map((action, index) => (
                        <li
                          key={index}
                          className="text-amber-700 text-sm flex items-start space-x-2"
                        >
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={this.handleReset}
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2 inline" />
                Try Again
              </button>

              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4 mr-2 inline" />
                Reload Page
              </button>
            </div>

            {/* Technical Details (Collapsible) */}
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                Technical Details
              </summary>
              <div className="space-y-2 text-sm text-gray-600">
                {error?.stack && (
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                      {error.stack}
                    </pre>
                  </div>
                )}
                {this.state.errorInfo && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
                {/* Memory Report */}
                <div>
                  <strong>Memory Report:</strong>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                    {JSON.stringify(this.getMemoryReport(), null, 2)}
                  </pre>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }
}

export default ModeErrorBoundary;
