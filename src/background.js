'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
import path, { resolve } from "path"
import ipcChannels from "./channel_index.js"
const SerialPort = require('serialport');

// Setting as global object to stop garbage collection
let win;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1080,
    height: 720,
    webPreferences: {

      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      console.log('install dev tools');
      await installExtension(VUEJS3_DEVTOOLS)
      console.log('installed dev tools');
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}


const timeout = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// IPC actions on behalf of render
// IPC -> Serial

// Device info
const lampVID = '1A86';
const lampPID = '7523';
const serialNum = '5&30920091&0&5';
let port;




/**
 * Connect: find and handshake with the lamp
 */
ipcMain.on(ipcChannels.getToMainChannel(ipcChannels.upload), async (event, args) => {
  // TODO error checks
  console.log('args', args);

  // List devices connected and check if lamp is listed
  const lamp = (await SerialPort.list()).find((device) => {
    return device.serialNumber === serialNum && device.vendorId === lampVID && device.productId === lampPID;
  })

  if (isDevelopment) console.log(lamp);

  // if device not found
  if (lamp === undefined) {
    if (isDevelopment) console.error('Error: find lamp ', 'no device connected');
    win.webContents.send(ipcChannels.getToRenderChannel(ipcChannels.upload), { error: 'no device connected' });
    return;
  }

  // Open port
  port = new SerialPort(lamp.path, {
    baudRate: 9600,
    autoOpen: false
  })
  // Port setup
  port.on('error', (err) => {
    if (isDevelopment) console.error('Error: err-callback', err);
    // Send error to renderer
    win.webContents.send(ipcChannels.getToRenderChannel(ipcChannels.upload), { error: err })
    return;
  })

  port.open((err) => {
    if(isDevelopment && err) return console.error('Error: port.open', err);
    // Port is open
  })

  // Stringify data
  // Send data


  // win.webContents.send(ipcChannels.getToRenderChannel(ipcChannels.upload), deviceList)
})
