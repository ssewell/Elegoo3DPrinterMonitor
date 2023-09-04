import React, { useState, useEffect } from 'react';
import './App.css';
import { ipcRenderer } from 'electron';

export default function App() {
  const [data, setData] = useState({});

  // useEffect(() => {
  //   ipcRenderer.on('udp-data', (udpData: any) => {
  //     console.log(udpData);
  //     // setData((prevData) => ({
  //     //   ...prevData,
  //     //   [udpData.Id]: udpData,
  //     // }));
  //   });
  // }, []);

  return (
    <div className="App">
      <h1>Received Packets</h1>
      {Object.entries(data).map(([id, value]) => (
        <div key={id}>
          <strong>Sender ID:</strong> {id}
          <pre>{JSON.stringify(value, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
}
