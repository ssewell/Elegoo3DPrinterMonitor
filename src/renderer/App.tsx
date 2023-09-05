import React, { useState, useEffect } from 'react';
import './App.css';
import '../components/ProgressBar.css';
import Printer from 'components/Printer';
import { PrinterItem } from 'types/PrinterTypes';

export default function App() {
  const [data, setData] = useState<Record<string, PrinterItem>>({});
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    return window.electron.ipcRenderer.on('update-printers', (udpData: any) => {
      const udpDataJson = JSON.parse(udpData);
      setData((prevData) => ({
        ...prevData,
        [udpDataJson.Id]: udpDataJson,
      }));
    });
  }, []);

  useEffect(() => {
    return window.electron.ipcRenderer.on(
      'toggle-user-debug',
      (enabled: any) => {
        setDebugMode(enabled);
      }
    );
  }, []);

  return (
    <div className="App">
      {Object.entries(data).map(([id, value]) => (
        <Printer key={id} item={value} debug={debugMode} />
      ))}
    </div>
  );
}
