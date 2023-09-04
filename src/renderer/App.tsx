import React, { useState, useEffect } from 'react';
import './App.css';

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
      <h1>3D Printer Status</h1>
      {Object.entries(data).map(([id, value]) => (
        <div key={id}>
          <strong>Sender ID:</strong> {id}
          <pre>{JSON.stringify(value, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
}
