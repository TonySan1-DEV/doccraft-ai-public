import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="text-center max-w-2xl mx-auto p-8">
            <h1 className="text-3xl font-bold text-red-600 mb-4">
              🚨 Application Error
            </h1>
            <p className="text-red-500 mb-6">
              Something went wrong loading the application. Please check the console for more details.
            </p>
            <div className="bg-red-100 p-4 rounded-lg text-left">
              <h2 className="font-semibold text-red-800 mb-2">Error Details:</h2>
              <pre className="text-sm text-red-700 whitespace-pre-wrap">
                {this.state.error?.message || 'Unknown error'}
              </pre>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
} 