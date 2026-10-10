import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App error caught by boundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white p-8 rounded-2xl border border-[#DDE4DA] shadow-lg space-y-4">
            <h2 className="text-xl font-serif font-bold text-[#143427]">
              Greenleaf Corporation Store
            </h2>
            <p className="text-xs text-[#5D7164]">
              Произошла непредвиденная ошибка при загрузке.
            </p>
            {this.state.error && (
              <pre className="text-[11px] p-3 bg-[#F4F7F2] rounded text-[#8B3A3A] overflow-x-auto text-left">
                {this.state.error.message}
              </pre>
            )}
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 bg-[#1B4332] text-white text-xs font-semibold rounded-lg hover:bg-[#143427] transition-colors"
            >
              Перезагрузить приложение
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
