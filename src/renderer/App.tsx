import React, { useState, useEffect } from 'react';
import './App.css';
import '../components/ProgressBar.css';
import Printer from 'components/Printer';
import { PrinterItem } from 'types/PrinterTypes';

const RESPONSE_ID = 'f25273b12b094c5a8b9513a30ca60049'; // Id included in valid JSON response from 3D printer

export default function App() {
  const [data, setData] = useState<Record<string, PrinterItem>>({});
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    return window.electron.ipcRenderer.on('update-printers', (udpData: any) => {
      const udpDataJson: PrinterItem = JSON.parse(udpData);

      if (udpDataJson.Id !== RESPONSE_ID) return;

      setData((prevData) => ({
        ...prevData,
        [udpDataJson.Data.Attributes.MainboardID]: udpDataJson,
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
