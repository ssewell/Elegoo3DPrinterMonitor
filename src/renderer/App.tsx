import React, { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import '../components/ProgressBar.css';
import Printer from 'components/Printer';
import Toast, { ToastMessage, ToastVariant } from 'components/Toast';
import { PrinterItem } from 'types/PrinterTypes';
import { isValidPrinterItem } from 'utils/validation';

const RESPONSE_ID = 'f25273b12b094c5a8b9513a30ca60049'; // Id included in valid JSON response from 3D printer
const OFFLINE_TIMEOUT_MS = 30000;
const TOAST_DEDUPE_WINDOW_MS = 5000;
const TOAST_AUTO_DISMISS_MS = 6000;
const CURRENT_TIME_INTERVAL_MS = 1000;

interface PrinterRecord {
  item: PrinterItem;
  lastSeen: number;
}

export default function App() {
  const [data, setData] = useState<Record<string, PrinterRecord>>({});
  const [debugMode, setDebugMode] = useState(false);
  const [hasSeenPrinters, setHasSeenPrinters] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toastIdRef = useRef(0);
  const toastDedupeRef = useRef<Record<string, number>>({});
  const toastTimeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const dismissToast = useCallback((toastId: string) => {
    setToasts((prevToasts) =>
      prevToasts.filter((toast) => toast.id !== toastId)
    );
  }, []);

  const addToast = useCallback(
    (message: string, variant: ToastVariant, dedupeKey: string) => {
      const now = Date.now();
      const lastShown = toastDedupeRef.current[dedupeKey];

      if (lastShown && now - lastShown < TOAST_DEDUPE_WINDOW_MS) {
        return;
      }

      toastDedupeRef.current[dedupeKey] = now;

      const toastId = `toast-${toastIdRef.current}`;
      toastIdRef.current += 1;
      setToasts((prevToasts) => [
        ...prevToasts,
        { id: toastId, message, variant },
      ]);

      const timeoutId = setTimeout(() => {
        dismissToast(toastId);
      }, TOAST_AUTO_DISMISS_MS);

      toastTimeoutsRef.current.push(timeoutId);
    },
    [dismissToast]
  );

  useEffect(() => {
    const timeouts = toastTimeoutsRef.current;

    return () => {
      timeouts.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
    };
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(Date.now());
    }, CURRENT_TIME_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    return window.electron.ipcRenderer.on('update-printers', (udpData: any) => {
      try {
        const udpDataJson: PrinterItem = JSON.parse(udpData);

        // Validate the parsed data before using it
        if (!isValidPrinterItem(udpDataJson)) {
          // eslint-disable-next-line no-console
          console.error('Invalid printer data received:', udpData);
          addToast(
            'Received invalid printer data. Check logs for details.',
            'error',
            'invalid-printer-data'
          );
          return;
        }

        if (udpDataJson.Id !== RESPONSE_ID) return;

        setHasSeenPrinters(true);

        setData((prevData) => ({
          ...prevData,
          [udpDataJson.Data.Attributes.MainboardID]: {
            item: udpDataJson,
            lastSeen: Date.now(),
          },
        }));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to parse printer data:', error, udpData);
        addToast(
          'Failed to parse printer data. Check logs for details.',
          'error',
          'parse-printer-data'
        );
      }
    });
  }, [addToast]);

  useEffect(() => {
    return window.electron.ipcRenderer.on(
      'toggle-user-debug',
      (enabled: any) => {
        setDebugMode(enabled);
      }
    );
  }, []);

  const entries = Object.entries(data);
  const onlinePrinterCount = entries.filter(([, value]) => {
    return currentTime - value.lastSeen <= OFFLINE_TIMEOUT_MS;
  }).length;
  const isLoading = !hasSeenPrinters;
  const showEmptyState = hasSeenPrinters && onlinePrinterCount === 0;

  return (
    <div className="App">
      {isLoading && (
        <div className="state-panel">
          <div className="loading-spinner" />
          <div>
            <div className="state-title">Searching for printers...</div>
          </div>
        </div>
      )}
      {showEmptyState && (
        <div className="state-panel state-panel-empty">
          <div>
            <div className="state-title">No printers online</div>
            <div className="state-body">
              Make sure your printers are powered on and connected to the
              network.
            </div>
          </div>
        </div>
      )}
      {entries.map(([id, value]) => {
        const isOnline = currentTime - value.lastSeen <= OFFLINE_TIMEOUT_MS;

        return (
          <Printer
            key={id}
            item={value.item}
            debug={debugMode}
            isOnline={isOnline}
            lastSeen={value.lastSeen}
            currentTime={currentTime}
          />
        );
      })}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
