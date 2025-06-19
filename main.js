const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const { diskInfo } = require('node-disk-info');
const fs = require('fs');

let splash;
let mainWindow;

function createSplash() {
  splash = new BrowserWindow({
    width: 600,
    height: 338,
    transparent: false,
    frame: false,
    alwaysOnTop: true,
    center: true,
    resizable: false,
    show: false,
  });

  splash.loadFile(path.join(__dirname, 'splash.html'));

  splash.once('ready-to-show', () => {
    splash.show();
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  Menu.setApplicationMenu(null);

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    if (splash) {
      splash.close();
    }
    mainWindow.show();
  });
}

app.whenReady().then(() => {
  createSplash();

  setTimeout(() => {
    createMainWindow();
  }, 3000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handler to get USB drives
ipcMain.handle('get-usb-drives', async () => {
  try {
    const disks = await diskInfo.getDiskInfo();
    const usbDrives = disks.filter(disk => disk.filesystem.toLowerCase().includes('removable') || disk.description.toLowerCase().includes('usb'))
      .map(disk => ({
        device: disk.filesystem,
        description: disk.description,
        letter: disk.mounted
      }));
    return usbDrives;
  } catch (err) {
    console.error('Error listing drives:', err);
    return [];
  }
});

// IPC handler to write ISO to USB (simulation)
ipcMain.handle('write-iso', async (event, { isoPath, usbDevice }) => {
  try {
    if (!fs.existsSync(isoPath)) {
      return 'ISO file does not exist.';
    }
    console.log(`Starting to write ISO ${isoPath} to USB device ${usbDevice}`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    return 'ISO written successfully (simulation).';
  } catch (error) {
    console.error('Error writing ISO:', error);
    return `Error writing ISO: ${error.message || error}`;
  }
});
