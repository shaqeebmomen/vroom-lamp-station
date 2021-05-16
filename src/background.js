'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
import path, { resolve } from "path"
import ipcChannels from "./channel_index.js"
import SerialManager from './native/serial.js'

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
    // if (!process.env.IS_TEST) win.webContents.openDevTools()
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

const serialManager = new SerialManager();

/**
 * Connect: find and handshake with the lamp
 */
ipcMain.on(ipcChannels.getToMainChannel(ipcChannels.upload), async (event, args) => {
  // Port setup
  await serialManager.connect();
  // Stringify data
  const { anims } = args;
  for (let index = 0; index < anims.length; index++) {
    const anim = anims[index]; // Current animation

    /**
     * Data format
     * [gear(1 byte)][frameCount (1 byte)]...[animationFrame (5 bytes)]*frameCount
     */
    // Output string
    const outputBuff = Buffer.alloc(2 + 5 * anim.length)
    const initByteShift = 10; // Shifts the first two bytes (which are typically < 10) up so they are easy to detect (according to my oscilloscope)
    // Gear
    outputBuff.writeUInt8(index + initByteShift, 0);
    // Frame Count
    outputBuff.writeUInt8(anim.length + initByteShift, 1);
    // Animation frames
    anim.forEach((frame, index) => {
      const offset = 2 + index * 5;
      outputBuff.writeUInt8(frame.color.r, offset, 1);
      outputBuff.writeUInt8(frame.color.g, offset + 1);
      outputBuff.writeUInt8(frame.color.b, offset + 2);
      outputBuff.writeUInt16BE(frame.timeStamp, offset + 3);
    });
    if (isDevelopment) console.log('outputBuffer', outputBuff);
    await serialManager.writeToDevice(outputBuff);
    // TODO Wait for mcu acknowledge
  }
  win.webContents.send(ipcChannels.getToRenderChannel(ipcChannels.upload), { msg: 'success' })
})
