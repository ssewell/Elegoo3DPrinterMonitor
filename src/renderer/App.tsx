import React, { useState, useEffect } from 'react';
import './App.css';
import Printer from 'components/Printer';

export default function App() {
  const [data, setData] = useState({});

  useEffect(() => {
    window.electron.ipcRenderer.on('update-printers', (udpData: any) => {
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
