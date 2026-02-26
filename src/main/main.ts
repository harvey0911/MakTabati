import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { fork, ChildProcess } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null;
let backendProcess: ChildProcess | null;

function startBackend() {
    const serverPath = app.isPackaged
        ? path.join(process.resourcesPath, 'backend', 'server.js')
        : path.join(__dirname, '..', 'backend', 'server.js');

    const nodePath = app.isPackaged
        ? path.join(process.resourcesPath, 'node_modules')
        : path.join(__dirname, '..', '..', 'node_modules');

    backendProcess = fork(serverPath, [], {
        env: {
            ...process.env,
            NODE_ENV: app.isPackaged ? 'production' : 'development',
            NODE_PATH: nodePath,
            USER_DATA_PATH: app.getPath('userData')
        }
    });

    backendProcess.on('message', (msg) => {
        console.log('Backend message:', msg);
    });

    backendProcess.on('error', (err) => {
        console.error('Backend error:', err);
    });

    backendProcess.on('exit', (code) => {
        console.error('Backend exited with code:', code);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        title: "MakTabati - Library Management System"
    });

    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', () => {
    startBackend();
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (backendProcess) backendProcess.kill();
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
