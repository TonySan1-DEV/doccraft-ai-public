import React from 'react';

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
  onReportError?: (error: unknown, info: { componentStack: string }) => void;
};

type State = {
  hasError: boolean;
  error: unknown | null;
  info?: { componentStack: string };
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error, info: undefined };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.log('ErrorBoundary caught error:', error);
    console.log('ErrorBoundary component stack:', info.componentStack);
    this.setState({ info: { componentStack: info.componentStack } });
    this.props.onReportError?.(error, { componentStack: info.componentStack });
  }

  reset = () => {
    this.setState({ hasError: false, error: null, info: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback)
        return (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-gray-900 text-gray-100 border border-gray-800"
          >
            {this.props.fallback}
            <div className="mt-3">
              <button
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20"
                onClick={this.reset}
              >
                Try again
              </button>
            </div>
          </div>
        );

      // Default fallback
      return (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-gray-900 text-gray-100 border border-gray-800"
        >
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="mt-2 opacity-80">
            The view crashed unexpectedly. You can try again.
          </p>
          <div className="mt-3">
            <button
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20"
              onClick={this.reset}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
