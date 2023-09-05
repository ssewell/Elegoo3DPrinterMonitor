import React, { useState, useEffect } from 'react';
import './App.css';
import '../components/ProgressBar.css';
import Printer from 'components/Printer';
import { PrinterItem } from 'types/PrinterTypes';

export default function App() {
  const [data, setData] = useState<Record<string, PrinterItem>>({});

  useEffect(() => {
    return window.electron.ipcRenderer.on('update-printers', (udpData: any) => {
      const udpDataJson = JSON.parse(udpData);
      setData((prevData) => ({
        ...prevData,
        [udpDataJson.Id]: udpDataJson,
      }));
    });
  }, []);

  return (
    <div className="App">
      {Object.entries(data).map(([id, value]) => (
        <Printer key={id} item={value} />
      ))}
    </div>
  );
}
