import { Component } from 'react';
import type { ReactNode } from 'react';
import { ThemeContext } from '../lib/ThemeContext';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  static contextType = ThemeContext;
  declare context: React.ContextType<typeof ThemeContext>;

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

      const newspaper = this.context?.theme === 'newspaper';

      return (
        <div className={newspaper
          ? 'bg-white border border-black border-t-4 overflow-hidden flex flex-col'
          : 'bg-white rounded-xl shadow-md overflow-hidden flex flex-col'
        }>
          <header className={newspaper
            ? 'bg-transparent border-b border-black px-5 py-2 flex items-center gap-2'
            : 'bg-red-600 text-white px-5 py-3 flex items-center gap-2'
          }>
            {!newspaper && <span className="text-xl">⚠️</span>}
            <h2 className={newspaper
              ? 'text-xs font-bold flex-1 uppercase tracking-[0.15em] font-serif text-black'
              : 'text-base font-semibold flex-1'
            }>Error</h2>
          </header>
          <div className="p-5 flex-1">
            <div className="flex flex-col items-center gap-2 py-4 text-center text-gray-500">
              <p className="text-sm">Something went wrong loading this section.</p>
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className={newspaper
                  ? 'mt-1 px-4 py-1 border border-black text-black text-sm rounded-none font-serif hover:bg-black hover:text-[#f5f0e8] transition-colors'
                  : 'mt-1 px-4 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors'
                }
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
