const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        fullscreen: true,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');
}

// Handler IPC untuk Perintah Kamera ke digiCamControl
ipcMain.handle('camera-command', async (event, { action, value }) => {
    try {
        let url = '';
        if (action === 'setISO') {
            url = `http://localhost:5513/api/set?param=ISO&value=${value}`;
        } else if (action === 'setShutter') {
            url = `http://localhost:5513/api/set?param=ShutterSpeed&value=${encodeURIComponent(value)}`;
        } else if (action === 'setAperture') {
            url = `http://localhost:5513/api/set?param=Aperture&value=${value}`;
        } else if (action === 'capture') {
            // Mengambil foto resolusi penuh (24 MP) dan menyimpannya di folder proyek
            url = `http://localhost:5513/api/capture`;
        }

        const response = await fetch(url);
        const result = await response.text();
        return { success: true, data: result };
    } catch (error) {
        console.error('Gagal komunikasi dengan kamera:', error);
        return { success: false, error: error.message };
    }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
