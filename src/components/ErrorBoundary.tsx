'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 rounded-lg bg-red-50 border border-red-100">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Algo salió mal
          </h2>
          <p className="text-sm text-red-600">
            {this.state.error?.message || 'Error desconocido'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
} 