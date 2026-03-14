const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };

export async function getActivePorts() {
  if (!ipcRenderer) return [];
  
  try {
    const rawData = await ipcRenderer.invoke('get-ports');
    return parseNetstat(rawData);
  } catch (error) {
    console.error('Failed to get ports:', error);
    return [];
  }
}

export async function killProcess(pid) {
  if (!ipcRenderer) return false;
  try {
    await ipcRenderer.invoke('kill-process', pid);
    return true;
  } catch (error) {
    console.error(`Failed to kill process ${pid}:`, error);
    return false;
  }
}

function parseNetstat(data) {
  const lines = data.split('\n');
  const ports = [];

  // Skip header lines
  for (let i = 4; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(/\s+/);
    if (parts.length < 5) continue;

    const protocol = parts[0];
    const localAddress = parts[1];
    const foreignAddress = parts[2];
    const state = parts[3];
    const pid = parts[4];

    // Extraction: [Address]:[Port]
    const portMatch = localAddress.match(/:(\d+)$/);
    const port = portMatch ? portMatch[1] : 'Unknown';

    if (state === 'LISTENING') {
      ports.push({
        protocol,
        localAddress,
        port,
        state,
        pid
      });
    }
  }

  return ports;
}
