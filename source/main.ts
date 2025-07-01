import { app, BrowserWindow } from 'electron';
import path from 'path';
import { spawn } from 'child_process';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
// dotenv.config();

const PORT = process.env.PORT || 3000;

const createWindow = () => {
    const mainWindow: BrowserWindow | null = new BrowserWindow({
        width: 460,
        height: 720,
        resizable: false,
        frame: false,
        transparent: false,
        webPreferences: {
            nodeIntegration: false,
        },
    });

    mainWindow.loadURL(`http://localhost:${PORT}`);
};

app.whenReady().then(() => {
const serverPath = path.join(__dirname, 'server.js');

spawn(process.execPath, [serverPath], {
    stdio: 'inherit',
    cwd: path.dirname(serverPath),
});

setTimeout(createWindow, 1000);
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});