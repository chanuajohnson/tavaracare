
import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  level?: 'app' | 'provider' | 'route' | 'component';
  name?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showReportButton?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { level = 'component', name, onError } = this.props;
    
    // Enhanced error logging with context
    console.error(`[ErrorBoundary-${level}${name ? `-${name}` : ''}] Error caught:`, {
      error,
      errorInfo,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // Store error info for display
    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Report to error tracking service (if available)
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: `${level}-boundary: ${error.message}`,
        fatal: level === 'app'
      });
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleRetry = () => {
    const { retryCount } = this.state;
    if (retryCount < 3) {
      this.setState({ 
        hasError: false, 
        error: undefined, 
        errorInfo: undefined,
        retryCount: retryCount + 1 
      });
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportError = () => {
    const { error, errorInfo } = this.state;
    const { level = 'component', name } = this.props;
    
    const errorReport = {
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      level,
      name,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Copy to clipboard for now (could integrate with error reporting service)
    navigator.clipboard?.writeText(JSON.stringify(errorReport, null, 2));
    alert('Error details copied to clipboard. Please send this to support.');
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { level = 'component', name, showReportButton = false } = this.props;
      const { error, retryCount } = this.state;
      
      const canRetry = retryCount < 3;
      const isAppLevel = level === 'app';

      return (
        <Card className="border-destructive/20 bg-destructive/5 max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {isAppLevel ? 'Application Error' : 'Something went wrong'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-destructive/80 mb-2">
                {isAppLevel 
                  ? 'A critical error occurred that prevented the application from working properly.'
                  : `An error occurred ${name ? `in ${name}` : 'in this section'}.`
                }
              </p>
              {error?.message && (
                <details className="mt-2">
                  <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                    Technical details
                  </summary>
                  <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                    {error.message}
                  </pre>
                </details>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {canRetry && !isAppLevel && (
                <Button 
                  variant="outline" 
                  onClick={this.handleRetry}
                  className="border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again ({3 - retryCount} attempts left)
                </Button>
              )}
              
              {isAppLevel ? (
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Application
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={this.handleGoHome}
                  className="border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              )}
              
              {showReportButton && (
                <Button 
                  variant="outline" 
                  onClick={this.handleReportError}
                  className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  size="sm"
                >
                  Report Error
                </Button>
              )}
            </div>
            
            {retryCount >= 3 && (
              <p className="text-sm text-muted-foreground">
                If this problem persists, please try refreshing the page or contact support.
              </p>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
