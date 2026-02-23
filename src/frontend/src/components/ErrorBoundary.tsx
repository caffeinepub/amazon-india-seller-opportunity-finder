import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', {
      error,
      errorInfo,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-2xl w-full">
            <Alert variant="destructive">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle className="text-xl font-bold mb-2">
                Application Error
              </AlertTitle>
              <AlertDescription className="space-y-4">
                <p className="text-base">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>

                <div className="space-y-2">
                  <p className="font-semibold text-sm">What you can do:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Click the button below to reload the application</li>
                    <li>Clear your browser cache and cookies</li>
                    <li>Try using a different browser</li>
                    <li>Check your internet connection</li>
                  </ul>
                </div>

                <Button onClick={this.handleReset} variant="outline" className="mt-4">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Application
                </Button>

                {import.meta.env.DEV && this.state.errorInfo && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-semibold mb-2">
                      Technical Details (Development Only)
                    </summary>
                    <div className="p-3 bg-background/50 rounded-md border text-xs font-mono space-y-2">
                      <div>
                        <span className="font-semibold">Error:</span>
                        <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-words">
                          {this.state.error?.stack}
                        </pre>
                      </div>
                      <div>
                        <span className="font-semibold">Component Stack:</span>
                        <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-words">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    </div>
                  </details>
                )}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
