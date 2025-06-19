const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getUSBDrives: () => ipcRenderer.invoke('get-usb-drives'),
  writeISO: (isoPath, usbDevice) => ipcRenderer.invoke('write-iso', { isoPath, usbDevice })
});
