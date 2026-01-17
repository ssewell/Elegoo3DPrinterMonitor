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

/**
 * Compute broadcast addresses for all non-internal IPv4 interfaces
 * without using bitwise operators (ESLint: no-bitwise compliant).
 *
 * For each octet, we compute the subnet block size (256 - maskOctet).
 * The broadcast octet = networkOctet + blockSize - 1, where
 * networkOctet = floor(ipOctet / blockSize) * blockSize.
 */
function getBroadcastAddresses() {
  const interfaces = os.networkInterfaces();
  const broadcasts: string[] = [];

  for (const name in interfaces) {
    const iface = interfaces[name];
    if (iface) {
      for (const addr of iface) {
        // Early return for non-IPv4 or internal addresses (loopback)
        if (addr.family === 'IPv4' && !addr.internal) {
          const ipParts = addr.address.split('.').map(Number);
          const maskParts = addr.netmask.split('.').map(Number);

          // Guard against invalid lengths
          if (ipParts.length === 4 && maskParts.length === 4) {
            const broadcastParts = ipParts.map((ip, i) => {
              // Calculate broadcast addresses
              const mask = maskParts[i];
              if (Number.isNaN(ip) || Number.isNaN(mask)) return 255;
              if (mask === 255) return ip; // /32
              if (mask === 0) return 255; // /0
              const blockSize = 256 - mask; // e.g., 16 for 240
              const network = Math.floor(ip / blockSize) * blockSize;
              return Math.min(network + blockSize - 1, 255);
            });

            const broadcastAddress = broadcastParts.join('.');
            broadcasts.push(broadcastAddress);
          }
        }
      }
    }
  }

  return broadcasts;
}

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
const broadcastAddresses = getBroadcastAddresses();

console.log('Local IPs:', localIPs);
console.log('Broadcast Addresses:', broadcastAddresses);

export function createUDPClient() {
  setInterval(() => {
    for (const broadcastAddress of broadcastAddresses) {
      const message = Uint8Array.from(requestStatusMessage);
      socket.send(message, PORT, broadcastAddress, (err) => {
        if (err) {
          console.error(`Error sending message to ${broadcastAddress}:`, err);
        } else {
          console.log(`Requested 3D printer status on ${broadcastAddress}`);
        }
      });
    }
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
