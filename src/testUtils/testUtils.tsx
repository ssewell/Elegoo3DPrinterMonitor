/**
 * Test utilities and mock data for testing stability fixes
 */

import { PrinterItem } from 'types/PrinterTypes';

// Mock malformed JSON samples that could crash the app
export const MALFORMED_JSON_SAMPLES = [
  'not json at all',
  '{"incomplete": json',
  '{"Id": "test", "Data": }',
  '{"Id": null, "Data": {}',
  '{"Id": undefined, "Data": {}}',
  '{"Id": "test", invalid}',
  '',
  'null',
  'undefined',
  '[]',
  '{"Data": {}}',
  '{"Id": "", "Data": null}',
];

// Invalid printer data structures (valid JSON but invalid PrinterItem structure)
export const INVALID_PRINTER_DATA: unknown[] = [
  { Id: null, Data: {} },
  { Id: 'test', Data: null },
  { Id: 123, Data: {} },
  { Id: 'test', Data: { Attributes: null } },
  { Id: 'test', Data: { Attributes: {} } },
  { Id: 'test', Data: { Attributes: { MainboardID: null } } },
  { Id: 'test', Data: { Attributes: { MainboardID: 123 } } },
  { Id: 'test', Data: { Attributes: {}, Status: null } },
  { Id: 'test', Data: { Status: { PrintInfo: null } } },
  { Id: 'test', Data: { Status: { PrintInfo: {} } } },
  { Id: 'test', Data: { Status: { PrintInfo: { Status: 'invalid' } } } },
];

// Valid but incomplete printer data (should be accepted)
export const PARTIAL_PRINTER_DATA: PrinterItem[] = [
  {
    Id: 'f25273b12b094c5a8b9513a30ca60049',
    Data: {
      Attributes: {
        Name: 'Test Printer',
        MachineName: '',
        ProtocolVersion: '',
        FirmwareVersion: '',
        Resolution: '',
        MainboardIP: '',
        MainboardID: 'MB001',
        SDCPStatus: 0,
        LocalSDCPAddress: '',
        SDCPAddress: '',
        Capabilities: [],
      },
      Status: {
        CurrentStatus: 0,
        PreviousStatus: 0,
        PrintInfo: {
          Status: 0,
          CurrentLayer: 0,
          TotalLayer: 0,
          CurrentTicks: 0,
          TotalTicks: 0,
          ErrorNumber: 0,
          Filename: '',
        },
        FileTransferInfo: {
          Status: 0,
          DownloadOffset: 0,
          CheckOffset: 0,
          FileTotalSize: 0,
          Filename: '',
        },
      },
    },
  },
  {
    Id: 'f25273b12b094c5a8b9513a30ca60049',
    Data: {
      Attributes: {
        Name: 'Minimal Printer',
        MainboardID: 'MB002',
      } as any, // Partial attributes
      Status: {
        CurrentStatus: 1,
        PreviousStatus: 0,
        PrintInfo: {
          Status: 1,
          CurrentLayer: 10,
          TotalLayer: 100,
          CurrentTicks: 5000,
          TotalTicks: 50000,
          ErrorNumber: 0,
          Filename: 'test.gcode',
        },
        FileTransferInfo: {
          Status: 0,
          DownloadOffset: 0,
          CheckOffset: 0,
          FileTotalSize: 0,
          Filename: '',
        },
      },
    },
  },
];

// Complete valid printer data
export const VALID_PRINTER_DATA: PrinterItem = {
  Id: 'f25273b12b094c5a8b9513a30ca60049',
  Data: {
    Attributes: {
      Name: 'Elegoo Mars 3',
      MachineName: 'Mars3-001',
      ProtocolVersion: '1.0',
      FirmwareVersion: '2.0.1',
      Resolution: '4096x2560',
      MainboardIP: '192.168.1.100',
      MainboardID: 'MB001',
      SDCPStatus: 1,
      LocalSDCPAddress: '/dev/ttyUSB0',
      SDCPAddress: '/dev/ttyUSB0',
      Capabilities: ['wifi', 'sla_printing', 'file_transfer'],
    },
    Status: {
      CurrentStatus: 1,
      PreviousStatus: 0,
      PrintInfo: {
        Status: 1,
        CurrentLayer: 15,
        TotalLayer: 120,
        CurrentTicks: 7500,
        TotalTicks: 60000,
        ErrorNumber: 0,
        Filename: 'model_001.gcode',
      },
      FileTransferInfo: {
        Status: 0,
        DownloadOffset: 0,
        CheckOffset: 0,
        FileTotalSize: 0,
        Filename: '',
      },
    },
  },
};

// Mock IPC event structure
export interface MockIPCPayload {
  channel: string;
  data: unknown;
}

// Mock IPC setup for testing
export const createMockIPCEvent = (data: unknown): MockIPCPayload => ({
  channel: 'update-printers',
  data,
});

export const createMockDebugEvent = (enabled: boolean): MockIPCPayload => ({
  channel: 'toggle-user-debug',
  data: enabled,
});

// Mock electron API for testing
export const mockElectronAPI = {
  ipcRenderer: {
    on: jest.fn((channel: string, callback: Function) => {
      // Store callback for later use
      mockElectronAPI.ipcRenderer.callbacks[channel] = callback;

      // Return unsubscribe function
      return () => {
        delete mockElectronAPI.ipcRenderer.callbacks[channel];
      };
    }),
    removeAllListeners: jest.fn(),
    removeListener: jest.fn((channel: string) => {
      // Simulate removeListener behavior
      delete mockElectronAPI.ipcRenderer.callbacks[channel];
    }),
    callbacks: {} as Record<string, Function>,
  },
};

// Reset mock between tests
export const resetMockElectronAPI = () => {
  const onMock = mockElectronAPI.ipcRenderer.on as jest.Mock;
  if (onMock.mockClear) {
    onMock.mockClear();
  }
  const removeAllListenersMock = mockElectronAPI.ipcRenderer
    .removeAllListeners as jest.Mock;
  if (removeAllListenersMock.mockClear) {
    removeAllListenersMock.mockClear();
  }
  const removeListenerMock = mockElectronAPI.ipcRenderer
    .removeListener as jest.Mock;
  if (removeListenerMock.mockClear) {
    removeListenerMock.mockClear();
  }
  mockElectronAPI.ipcRenderer.callbacks = {};
};

// Helper to simulate window.electron in tests
export const setupMockElectron = () => {
  Object.defineProperty(window, 'electron', {
    value: mockElectronAPI,
    writable: true,
  });
};

// Helper to create error boundary test scenarios
export const createThrowingComponent = (errorMessage: string) => {
  const ThrowingComponent = () => {
    throw new Error(errorMessage);
  };
  return ThrowingComponent;
};

// Helper functions for testing validation
export const createInvalidStringValues = () => [
  null,
  undefined,
  '',
  123,
  [],
  {},
];

export const createInvalidNumberValues = () => [
  null,
  undefined,
  'string',
  [],
  {},
  NaN,
  Infinity,
];

export const createInvalidArrayValues = () => [
  null,
  undefined,
  'string',
  123,
  {},
];

// Console spy utilities
export const createConsoleSpy = () => ({
  error: jest.spyOn(console, 'error').mockImplementation(),
  log: jest.spyOn(console, 'log').mockImplementation(),
  warn: jest.spyOn(console, 'warn').mockImplementation(),
});

export const restoreConsoleSpies = (
  spies: ReturnType<typeof createConsoleSpy>
) => {
  Object.values(spies).forEach((spy) => spy.mockRestore());
};
