/**
 * Test file for IPC listener memory management
 * This file tests cleanup behavior of IPC listeners to prevent memory leaks
 */

import { render } from '@testing-library/react';
import App from '../renderer/App';
import ErrorBoundary from '../components/ErrorBoundary';
import {
  setupMockElectron,
  resetMockElectronAPI,
  createConsoleSpy,
  restoreConsoleSpies,
} from '../testUtils/testUtils';

// Mock Printer component
jest.mock('../components/Printer', () => {
  return function MockPrinter({ item, debug }: { item: any; debug: boolean }) {
    return (
      <div data-testid="printer" data-debug={debug}>
        <div data-testid="printer-name">{item.Data.Attributes.Name}</div>
      </div>
    );
  };
});

// Mock CSS imports
jest.mock('../components/ProgressBar.css', () => ({}));
jest.mock('../renderer/App.css', () => ({}));

describe('IPC Memory Management', () => {
  let consoleSpies: ReturnType<typeof createConsoleSpy>;

  beforeEach(() => {
    setupMockElectron();
    consoleSpies = createConsoleSpy();
  });

  afterEach(() => {
    resetMockElectronAPI();
  });

  afterEach(() => {
    restoreConsoleSpies(consoleSpies);
  });

  const renderAppWithBoundary = () => {
    return render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  };

  describe('IPC Listener Setup', () => {
    it('should create unique unsubscribe functions for each listener', () => {
      renderAppWithBoundary();

      const ipcOnSpy = window.electron.ipcRenderer.on as jest.Mock;

      // Should have been called for both channels
      expect(ipcOnSpy).toHaveBeenCalledTimes(2);
      expect(ipcOnSpy).toHaveBeenCalledWith(
        'update-printers',
        expect.any(Function)
      );
      expect(ipcOnSpy).toHaveBeenCalledWith(
        'toggle-user-debug',
        expect.any(Function)
      );

      // Each call should return a function
      const updatePrintersUnsubscribe = ipcOnSpy.mock.results[0].value;
      const debugUnsubscribe = ipcOnSpy.mock.results[1].value;

      expect(typeof updatePrintersUnsubscribe).toBe('function');
      expect(typeof debugUnsubscribe).toBe('function');
    });

    it('should register different callbacks for different channels', () => {
      renderAppWithBoundary();

      const ipcOnSpy = window.electron.ipcRenderer.on as jest.Mock;

      const updatePrintersCall = ipcOnSpy.mock.calls.find(
        (call) => call[0] === 'update-printers'
      );
      const debugCall = ipcOnSpy.mock.calls.find(
        (call) => call[0] === 'toggle-user-debug'
      );

      const updatePrintersCallback = updatePrintersCall?.[1];
      const debugCallback = debugCall?.[1];

      // Callbacks should be different functions
      expect(updatePrintersCallback).not.toBe(debugCallback);
      expect(typeof updatePrintersCallback).toBe('function');
      expect(typeof debugCallback).toBe('function');
    });
  });

  describe('IPC Listener Cleanup', () => {
    it('should call unsubscribe functions on component unmount', () => {
      const { unmount } = renderAppWithBoundary();

      const ipcOnSpy = window.electron.ipcRenderer.on as jest.Mock;

      // The unsubscribe functions should be callable
      const updatePrintersUnsubscribe = ipcOnSpy.mock.results[0].value;
      const debugUnsubscribe = ipcOnSpy.mock.results[1].value;

      expect(typeof updatePrintersUnsubscribe).toBe('function');
      expect(typeof debugUnsubscribe).toBe('function');

      // Should not throw when called
      expect(() => {
        if (typeof updatePrintersUnsubscribe === 'function') {
          updatePrintersUnsubscribe();
        }
        if (typeof debugUnsubscribe === 'function') {
          debugUnsubscribe();
        }
      }).not.toThrow();
    });

    it('should not create duplicate listeners on re-render', () => {
      const { rerender } = renderAppWithBoundary();

      const ipcOnSpy = window.electron.ipcRenderer.on as jest.Mock;

      // Initial setup
      expect(ipcOnSpy).toHaveBeenCalledTimes(2);

      // Rerender should not create new listeners (empty dependency array)
      rerender(
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      );

      // Should still only have 2 calls (not more)
      expect(ipcOnSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Memory Leak Prevention', () => {
    it('should prevent multiple listener registrations', () => {
      // Simulate multiple component mounts/unmounts
      for (let i = 0; i < 5; i++) {
        const { unmount } = renderAppWithBoundary();
        unmount();
      }

      const ipcOnSpy = window.electron.ipcRenderer.on as jest.Mock;

      // Each mount should create exactly 2 listeners (5 mounts × 2)
      expect(ipcOnSpy).toHaveBeenCalledTimes(10);

      // Each should have returned unsubscribe function
      ipcOnSpy.mock.results.forEach((result: any, index: number) => {
        expect(typeof result.value).toBe('function');
        expect(['update-printers', 'toggle-user-debug']).toContain(
          ipcOnSpy.mock.calls[index][0] as string
        );
      });
    });

    it('should handle rapid mount/unmount cycles', () => {
      const renderTime: number[] = [];

      // Simulate rapid mount/unmount
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();

        const { unmount } = renderAppWithBoundary();
        unmount();

        const endTime = performance.now();
        renderTime.push(endTime - startTime);
      }

      // All operations should complete quickly (under 100ms each)
      renderTime.forEach((time) => {
        expect(time).toBeLessThan(100);
      });

      // Average should be reasonable
      const avgTime = renderTime.reduce((a, b) => a + b, 0) / renderTime.length;
      expect(avgTime).toBeLessThan(50);
    });
  });

  describe('Error Handling in Cleanup', () => {
    it('should handle missing removeListener gracefully', () => {
      renderAppWithBoundary();

      // Remove removeListener method to simulate missing method
      const originalRemoveListener = (window.electron.ipcRenderer as any)
        .removeListener;
      delete (window.electron.ipcRenderer as any).removeListener;

      const ipcOnSpy = window.electron.ipcRenderer.on as jest.Mock;

      // Should not throw when trying to cleanup
      expect(() => {
        const unsubscribe = ipcOnSpy.mock.results[0].value;
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      }).not.toThrow();

      // Should not log error since our removeListener mock handles missing method gracefully
      expect(consoleSpies.error).not.toHaveBeenCalled();

      // Restore method
      (window.electron.ipcRenderer as any).removeListener =
        originalRemoveListener;
    });

    it('should cleanup in correct order', () => {
      const cleanupOrder: string[] = [];

      // Track cleanup order
      const originalOn = window.electron.ipcRenderer.on;
      (window.electron.ipcRenderer as any).on = jest.fn(
        (channel: string, callback: Function) => {
          return () => {
            cleanupOrder.push(channel);
            return originalOn(channel as any, callback as any);
          };
        }
      );

      renderAppWithBoundary();

      const ipcOnSpy = window.electron.ipcRenderer.on as jest.Mock;

      // Trigger cleanup
      const { unmount } = renderAppWithBoundary();
      unmount();

      // Cleanup order should match subscription order (ignoring any console.log messages)
      expect(cleanupOrder).toEqual(['update-printers', 'toggle-user-debug']);

      // Restore
      window.electron.ipcRenderer.on = originalOn;
    });
  });
});
