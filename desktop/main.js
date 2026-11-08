const { app, BrowserWindow, session, desktopCapturer, ipcMain, clipboard, globalShortcut, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');
require('./auth-vault').install();

let mainWindow;
const {loadUpdateConfig,configureUpdater,scheduleAutomaticUpdateCheck,emitUpdateState}=require('./update-service');


function safeExternalUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return ['https:', 'http:'].includes(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
}

function isTrustedRenderer(webContents) {
  try {
    const current = new URL(webContents?.getURL?.() || '');
    return current.protocol === 'file:' && current.pathname.endsWith('/src/index.html');
  } catch {
    return false;
  }
}

function hardenWindow(win) {
  const wc = win.webContents;
  wc.setWindowOpenHandler(({ url }) => {
    const safe = safeExternalUrl(url);
    if (safe) shell.openExternal(safe).catch(() => {});
    return { action: 'deny' };
  });
  wc.on('will-navigate', (event, url) => {
    event.preventDefault();
    const safe = safeExternalUrl(url);
    if (safe) shell.openExternal(safe).catch(() => {});
  });
  wc.on('will-attach-webview', event => event.preventDefault());
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 840,
    minWidth: 980,
    minHeight: 660,
    backgroundColor: '#111214',
    title: 'Banana Cord',
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'assets', 'banana-cord.png'),
    webPreferences: {
      // The renderer only receives explicitly allowed operations from preload.
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      devTools: !app.isPackaged,
      autoplayPolicy: 'no-user-gesture-required',
      backgroundThrottling: true
    }
  });
  hardenWindow(mainWindow);
  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
}

app.whenReady().then(() => {
  loadUpdateConfig();
  configureUpdater();
  const allowedPermissions = new Set(['media', 'display-capture', 'fullscreen', 'speaker-selection']);
  session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
    return allowedPermissions.has(permission) && isTrustedRenderer(webContents);
  });
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(allowedPermissions.has(permission) && isTrustedRenderer(webContents));
  });

  // Keep timers, voice activity and WebRTC stats running while minimized during a call only.
  ipcMain.handle('voice:background-active',(event,active)=>{event.sender.setBackgroundThrottling(!active);return true;});
  ipcMain.handle('clipboard:write', (_event,text)=>{if(typeof text!=='string'||text.length>20000)throw new Error('Texto inválido.');clipboard.writeText(text);return true;});
  ipcMain.handle('external:open',async (_event,raw)=>{const url=safeExternalUrl(raw);if(!url)throw new Error('Link bloqueado.');await shell.openExternal(url);return true;});
  const registerShortcut = (accelerator, eventName) => {
    try { globalShortcut.register(accelerator, () => { if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send(eventName); }); } catch {}
  };
  registerShortcut('CommandOrControl+Shift+M', 'shortcut:mute');
  registerShortcut('CommandOrControl+Shift+D', 'shortcut:deafen');
  registerShortcut('CommandOrControl+Shift+S', 'shortcut:screen');

  createWindow();
  mainWindow.webContents.once('did-finish-load', () => { emitUpdateState(); scheduleAutomaticUpdateCheck(); });
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('before-quit', () => {

  try { globalShortcut.unregisterAll(); } catch {}
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
