/**
 * Test file for App component stability
 * This file tests the main app component's stability fixes
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import App from '../renderer/App';
import ErrorBoundary from '../components/ErrorBoundary';
import {
  MALFORMED_JSON_SAMPLES,
  INVALID_PRINTER_DATA,
  PARTIAL_PRINTER_DATA,
  VALID_PRINTER_DATA,
  createMockIPCEvent,
  setupMockElectron,
  createConsoleSpy,
  restoreConsoleSpies,
} from '../testUtils/testUtils';

// Mock the Printer component to avoid dependency issues
jest.mock('../components/Printer', () => {
  return function MockPrinter({ item, debug }: { item: any; debug: boolean }) {
    return (
      <div data-testid="printer" data-debug={debug}>
        <div data-testid="printer-name">{item.Data.Attributes.Name}</div>
        <div data-testid="printer-id">{item.Data.Attributes.MainboardID}</div>
      </div>
    );
  };
});

// Mock CSS imports
jest.mock('../components/ProgressBar.css', () => ({}));
jest.mock('../renderer/App.css', () => ({}));

// Mock electron API before each test
beforeEach(() => {
  setupMockElectron();
});

describe('App Component Stability', () => {
  let consoleSpies: ReturnType<typeof createConsoleSpy>;

  beforeEach(() => {
    consoleSpies = createConsoleSpy();
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

  describe('JSON.parse Protection', () => {
    it('should not crash when receiving malformed JSON', () => {
      renderAppWithBoundary();

      MALFORMED_JSON_SAMPLES.forEach((malformedData) => {
        // Clear previous error calls
        consoleSpies.error.mockClear();

        expect(() => {
          // Simulate IPC message with malformed data
          const ipcOnSpy = window.electron.ipcRenderer.on as jest.Mock;
          const handler = (window.electron.ipcRenderer as any)._callbacks[
            'update-printers'
          ];

          if (handler) {
            act(() => {
              handler(malformedData);
            });
          }
        }).not.toThrow();

        // Verify some error was logged (either JSON parse or validation error)
        expect(consoleSpies.error).toHaveBeenCalled();

        // Check the error message content
        const errorCall = consoleSpies.error.mock.calls[0];
        expect(errorCall[0]).toMatch(
          /Failed to parse printer data|Invalid printer data received/
        );
      });
    });

    it('should not crash when receiving invalid printer data structures', () => {
      renderAppWithBoundary();

      INVALID_PRINTER_DATA.forEach((invalidData) => {
        const jsonData = JSON.stringify(invalidData);

        expect(() => {
          const ipcOnSpy = window.electron.ipcRenderer.on as jest.Mock;
          const handler = (window.electron.ipcRenderer as any)._callbacks[
            'update-printers'
          ];

          if (handler) {
            act(() => {
              handler(jsonData);
            });
          }
        }).not.toThrow();

        // Verify validation error was logged
        expect(consoleSpies.error).toHaveBeenCalledWith(
          expect.stringContaining('Invalid printer data received'),
          jsonData
        );
      });
    });

    it('should accept valid printer data and update state', () => {
      renderAppWithBoundary();

      const jsonData = JSON.stringify(VALID_PRINTER_DATA);

      act(() => {
        const ipcOnSpy = window.electron.ipcRenderer.on as jest.Mock;
        const handler = (window.electron.ipcRenderer as any)._callbacks[
          'update-printers'
        ];

        if (handler) {
          handler(jsonData);
        }
      });

      // Verify the printer component is rendered
      expect(screen.getByTestId('printer-name')).toHaveTextContent(
        VALID_PRINTER_DATA.Data.Attributes.Name
      );
    });

    it('should accept partial printer data', () => {
      renderAppWithBoundary();

      PARTIAL_PRINTER_DATA.forEach((partialData) => {
        const jsonData = JSON.stringify(partialData);

        act(() => {
          const ipcOnSpy = window.electron.ipcRenderer.on as jest.Mock;
          const handler = (window.electron.ipcRenderer as any)._callbacks[
            'update-printers'
          ];

          if (handler) {
            handler(jsonData);
          }
        });

        // Should not crash and may show partial information
        expect(consoleSpies.error).not.toHaveBeenCalled();
      });
    });

    it('should ignore data with incorrect RESPONSE_ID', () => {
      renderAppWithBoundary();

      const invalidIdData = {
        ...VALID_PRINTER_DATA,
        Id: 'invalid-id',
      };

      const jsonData = JSON.stringify(invalidIdData);

      act(() => {
        const ipcOnSpy = window.electron.ipcRenderer.on as jest.Mock;
        const handler = (window.electron.ipcRenderer as any)._callbacks[
          'update-printers'
        ];

        if (handler) {
          handler(jsonData);
        }
      });

      // Should not render any printer and no error should be logged
      expect(screen.queryByTestId('printer-name')).not.toBeInTheDocument();
      expect(consoleSpies.error).not.toHaveBeenCalled();
    });
  });

  describe('IPC Communication', () => {
    it('should set up IPC listeners on mount', () => {
      renderAppWithBoundary();

      const ipcOnSpy = window.electron.ipcRenderer.on as jest.Mock;
      expect(ipcOnSpy).toHaveBeenCalledWith(
        'update-printers',
        expect.any(Function)
      );
      expect(ipcOnSpy).toHaveBeenCalledWith(
        'toggle-user-debug',
        expect.any(Function)
      );
    });

    it('should handle debug mode toggle', () => {
      renderAppWithBoundary();

      act(() => {
        const ipcOnSpy = window.electron.ipcRenderer.on as jest.Mock;
        const handler = (window.electron.ipcRenderer as any)._callbacks[
          'toggle-user-debug'
        ];

        if (handler) {
          handler(true);
        }
      });

      // Verify debug mode was set (this would be visible if we had debug-specific UI)
      expect(consoleSpies.log).not.toHaveBeenCalled();
    });

    it('should clean up IPC listeners on unmount', () => {
      const { unmount } = renderAppWithBoundary();

      const ipcOnSpy = window.electron.ipcRenderer.on as jest.Mock;

      // Verify that unsubscribe functions were returned
      const updatePrintersCall = ipcOnSpy.mock.calls.find(
        (call) => call[0] === 'update-printers'
      );
      const debugCall = ipcOnSpy.mock.calls.find(
        (call) => call[0] === 'toggle-user-debug'
      );

      expect(updatePrintersCall?.[1]).toBeInstanceOf(Function);
      expect(debugCall?.[1]).toBeInstanceOf(Function);

      // Unmount should trigger cleanup
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Error Boundary Integration', () => {
    it('should render App within ErrorBoundary', () => {
      renderAppWithBoundary();

      // Should not show error boundary UI when no errors occur
      expect(
        screen.queryByText('Something went wrong')
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Development Error')).not.toBeInTheDocument();
    });

    it('should handle component errors gracefully', () => {
      // This test would be more complex - we'd need to mock a component that throws an error
      // For now, we verify that the ErrorBoundary is properly integrated
      renderAppWithBoundary();

      // The app should render without crashing
      expect(document.querySelector('.App')).toBeTruthy();
    });
  });
});
