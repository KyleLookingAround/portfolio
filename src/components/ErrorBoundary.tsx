import { Component } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="rounded-xl bg-white dark:bg-surface-dark border border-red-200 dark:border-red-800 p-5 flex flex-col gap-2">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            ⚠️ Something went wrong loading this section.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mx-auto px-4 py-1.5 bg-brand text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
