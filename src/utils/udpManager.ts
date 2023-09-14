/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
import dgram from 'dgram';
import os from 'os';
import { BrowserWindow, app } from 'electron';

const PORT = 3000;
const requestStatusMessage = Buffer.from('M99999');
const socket = dgram.createSocket('udp4');
const BROADCAST_INTERVAL = 1000; // 1 second

socket.bind(PORT, () => {
  socket.setBroadcast(true);
});

function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const k in interfaces) {
    const ipInterface = interfaces[k];
    if (ipInterface) {
      for (const k2 in ipInterface) {
        const address = ipInterface[k2];
        if (address.family === 'IPv4' && !address.internal) {
          addresses.push(address.address);
        }
      }
    }
  }

  return addresses;
}

const localIPs = getLocalIPs();
console.log('Local IPs:', localIPs);

export function createUDPClient() {
  setInterval(() => {
    socket.send(requestStatusMessage, PORT, '255.255.255.255', (err) => {
      if (err) {
        console.error('Error sending message:', err);
      } else {
        console.log('Requested 3D printer status');
      }
    });
  }, BROADCAST_INTERVAL);
}

export function createUDPServer(windowRef: BrowserWindow) {
  socket.on('listening', () => {
    const address = socket.address();
    console.log(`UDP Server listening on ${address.address}:${address.port}`);
  });

  socket.on('message', (message, remote) => {
    if (localIPs.includes(remote.address)) {
      return;
    }

    console.log('Got data from address:', remote.address);

    windowRef.webContents.send('update-printers', message.toString());
  });

  socket.on('error', (error) => {
    console.error('Error:', error);
  });
}

app.on('before-quit', () => {
  socket.close();
});
