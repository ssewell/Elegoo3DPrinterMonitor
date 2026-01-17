import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console only (per requirements)
    // eslint-disable-next-line no-console
    console.error('Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;

    if (hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';

      if (isDevelopment) {
        // Development: Show detailed error information
        return (
          <div
            style={{
              padding: '20px',
              margin: '20px',
              border: '1px solid #ff6b6b',
              borderRadius: '4px',
              backgroundColor: '#ffe6e6',
              fontFamily: 'monospace',
            }}
          >
            <h2 style={{ color: '#d63031' }}>Development Error</h2>
            <details style={{ whiteSpace: 'pre-wrap' }}>
              <summary>Error Details</summary>
              <p>
                <strong>Error:</strong> {error?.toString()}
              </p>
              <p>
                <strong>Stack:</strong>
              </p>
              <pre>{error?.stack}</pre>
              <p>
                <strong>Component Stack:</strong>
              </p>
              <pre>{errorInfo?.componentStack}</pre>
            </details>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Reload Application
            </button>
          </div>
        );
      }

      // Production: Show simple user-friendly message
      return (
        <div
          style={{
            padding: '20px',
            margin: '20px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: '#f8f9fa',
            textAlign: 'center',
          }}
        >
          <h2 style={{ color: '#666', marginBottom: '10px' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#888', marginBottom: '20px' }}>
            An unexpected error occurred. Please restart the application.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    const { children } = this.props;

    return children;
  }
}

export default ErrorBoundary;
