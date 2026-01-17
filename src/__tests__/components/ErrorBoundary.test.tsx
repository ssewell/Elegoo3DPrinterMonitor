/**
 * Test file for ErrorBoundary component
 * This file tests the error boundary implementation
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../../components/ErrorBoundary';
import {
  createThrowingComponent,
  createConsoleSpy,
  restoreConsoleSpies,
} from '../../testUtils/testUtils';

describe('ErrorBoundary', () => {
  let consoleSpies: ReturnType<typeof createConsoleSpy>;

  beforeEach(() => {
    consoleSpies = createConsoleSpy();
  });

  afterEach(() => {
    restoreConsoleSpies(consoleSpies);
  });

  describe('Error Handling', () => {
    it('should render children when no error occurs', () => {
      function GoodComponent() {
        return <div>Good Component</div>;
      }

      render(
        <ErrorBoundary>
          <GoodComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Good Component')).toBeInTheDocument();
    });

    it('should catch errors in child components', () => {
      const ThrowingComponent = createThrowingComponent('Test error message');

      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      // Should show error boundary UI instead of crashing
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should log errors to console only', () => {
      const ThrowingComponent = createThrowingComponent('Test error message');

      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      // Verify error was logged to console
      expect(consoleSpies.error).toHaveBeenCalledWith(
        'Error Boundary caught an error:',
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });

    it('should show detailed error information in development mode', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const ThrowingComponent = createThrowingComponent(
        'Development test error'
      );

      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      // Should show development error UI
      expect(screen.getByText('Development Error')).toBeInTheDocument();
      expect(screen.getByText('Error Details')).toBeInTheDocument();
      expect(screen.getAllByText(/Development test error/)).toHaveLength(2);
      expect(screen.getByText('Reload Application')).toBeInTheDocument();

      // Restore original NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should show simple error message in production mode', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const ThrowingComponent = createThrowingComponent(
        'Production test error'
      );

      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      // Should show production error UI
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(
        screen.getByText(
          'An unexpected error occurred. Please restart the application.'
        )
      ).toBeInTheDocument();
      expect(screen.getByText('Reload Application')).toBeInTheDocument();

      // Should not show development details
      expect(screen.queryByText('Development Error')).not.toBeInTheDocument();
      expect(screen.queryByText('Error Details')).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Production test error/)
      ).not.toBeInTheDocument();

      // Restore original NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe('Recovery', () => {
    it('should provide reload functionality', () => {
      const originalLocation = window.location;
      const mockReload = jest.fn();

      Object.defineProperty(window, 'location', {
        value: {
          ...originalLocation,
          reload: mockReload,
        },
        writable: true,
      });

      const ThrowingComponent = createThrowingComponent('Test error');

      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByText('Reload Application');
      reloadButton.click();

      expect(mockReload).toHaveBeenCalled();

      // Restore original location
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
      });
    });
  });

  describe('State Management', () => {
    it('should maintain error state until reload', () => {
      const ThrowingComponent = createThrowingComponent('Test error');
      function GoodComponent() {
        return <div>Good Component</div>;
      }

      const { rerender } = render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      // Should show error state
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Rerender with valid component (error boundary should maintain error state)
      // This is correct behavior - error boundary requires reload to reset
      rerender(
        <ErrorBoundary>
          <GoodComponent />
        </ErrorBoundary>
      );

      // Error boundary should still show error state (requires reload to reset)
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null children', () => {
      render(<ErrorBoundary>{null}</ErrorBoundary>);

      // Should not crash and should not show error UI
      expect(
        screen.queryByText('Something went wrong')
      ).not.toBeInTheDocument();
    });

    it('should handle multiple children', () => {
      function Child1() {
        return <div>Child 1</div>;
      }
      function Child2() {
        return <div>Child 2</div>;
      }

      render(
        <ErrorBoundary>
          <Child1 />
          <Child2 />
        </ErrorBoundary>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(
        screen.queryByText('Something went wrong')
      ).not.toBeInTheDocument();
    });

    it('should handle async errors in components', () => {
      function AsyncThrowingComponent() {
        React.useEffect(() => {
          throw new Error('Async error');
        }, []);
        return <div>Async Component</div>;
      }

      // Note: useEffect errors are not caught by ErrorBoundary in React 18+
      // This test verifies the boundary handles synchronous errors correctly
      expect(() => {
        render(
          <ErrorBoundary>
            <AsyncThrowingComponent />
          </ErrorBoundary>
        );
      }).not.toThrow();
    });
  });
});
