'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
import path, { resolve } from "path"
import ipcChannels from "./channel_index.js"
import SerialManager from './native/serial.js'
import misc from './helpers/misc.js'
import Logger from './helpers/logger.js'

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



// IPC actions on behalf of render
// IPC -> Serial
const serialManager = new SerialManager();
const frameSize = 7;
const metaSize = 2;

// Try catch wrapper for closing serial port
const closeSerial = async () => {
  try {
    await serialManager.close();
  } catch (error) {
    console.log(err);
  }
}


// Connnect and Handshake with lamp
const connectToLamp = async (channel, log) => {
  try {
    await serialManager.connect();
    // Open serial port
    await serialManager.open();
    // Arduino tends to reset when serial port opens, so wait some time for the mcu to be ready
    await serialManager.waitForString('ready', 3000); // Wait for mcu to send ready string after reset
    log.logInfo('Connected');
    return true;
  } catch (error) {
    log.logErr('Could Not Connect', error);
    win.webContents.send(ipcChannels.getToRenderChannel(channel), { errorMsg: error.message || error.errorMsg, msg: 'fail' });
    await closeSerial();
    return false;
  }
}

/**
 * Upload Data to Lamp
 */
ipcMain.on(ipcChannels.getToMainChannel(ipcChannels.upload), async (event, args) => {
  const log = new Logger('IPC_Upload', isDevelopment);
  log.subTAG = 'Connecting';
  if (!(await connectToLamp(ipcChannels.upload, log))) {
    return;
  }
  log.subTAG = 'Writing';
  // Stringify data
  const { anims } = args;
  for (let index = 0; index < anims.length; index++) {
    const anim = anims[index]; // Current animation
    /**
     * Data format
     * [gear(1 byte)][frameCount (1 byte)]...[animationFrame (7 bytes)]*frameCount
     */
    // Output string
    const outputBuff = Buffer.alloc(2 + frameSize * anim.length)
    // Gear
    outputBuff.writeUInt8(index, 0);
    // Frame Count
    outputBuff.writeUInt8(anim.length, 1);
    // Animation frames
    anim.forEach((frame, index) => {
      const offset = 2 + index * frameSize;
      outputBuff.writeUInt8(frame.color.r, offset, 1);
      outputBuff.writeUInt8(frame.color.g, offset + 1);
      outputBuff.writeUInt8(frame.color.b, offset + 2);
      outputBuff.writeUInt32BE(frame.timeStamp, offset + 3);
    });
    log.logInfo('outputBuffer', outputBuff);
    try {
      await serialManager.handshake(`${index}`, `ready_${index}`); // Handshake with mcu, and indicate we want to write to animations
      await serialManager.writeAndCheck(outputBuff);
    } catch (error) {
      log.logErr('Failed to write to device', error);
      await closeSerial();
      win.webContents.send(ipcChannels.getToRenderChannel(ipcChannels.upload), { ...error, msg: 'fail' });
      return;
    }
  } // end write forloop
  await closeSerial();
  log.logInfo('Successfully wrote all animations');
  win.webContents.send(ipcChannels.getToRenderChannel(ipcChannels.upload), { msg: 'success' })
})


/**
 * Download Data from Lamp
 */
ipcMain.on(ipcChannels.getToMainChannel(ipcChannels.download), async (event, args) => {
  const log = new Logger('IPC_Download', isDevelopment);
  log.subTAG = 'Connecting';
  // Connect To lamp
  if (!(await connectToLamp(ipcChannels.download, log))) {
    return;
  }
  log.subTAG = 'Handshake'
  const packetBuffers = []; // Array holding each packet sent
  // Send request to read code
  try {
    await serialManager.handshake('d', 'ready_d');
  } catch (error) {
    log.logErr('', error);
    win.webContents.send(ipcChannels.getToRenderChannel(ipcChannels.download), { ...error, msg: 'fail' });
  }
  log.subTAG = 'Getting Anims';
  for (let i = 0; i < 6; i++) {
    try {
      log.logInfo(`Index: ${i}`)
      await serialManager.writeACK(true);
      // Wait for frame count
      const metaData = await serialManager.waitForBytes(metaSize); // Buffer holding data about incoming animation
      const index = metaData.readUInt8();
      const frameCount = metaData.readUInt8(1);
      log.logInfo('Meta data: ', { index, frameCount });
      // Tell lamp we we can accept incoming animation now
      await serialManager.writeACK(true);
      log.logInfo(`Waiting for ${frameCount * frameSize} bytes`);
      // Wait for data to come in
      const data = await serialManager.waitForBytes(frameCount * frameSize);
      log.logInfo('Received', data);
      packetBuffers.push(data);
      // Send an acknowledgement byte 
      await serialManager.writeACK(true);
    } catch (error) {
      log.logErr('download failed', error);
      await closeSerial();
      win.webContents.send(ipcChannels.getToRenderChannel(ipcChannels.download), { ...error, msg: 'fail' });
      return;
    } // End handshake & read  try catch
  }
  log.logInfo('read success', packetBuffers);

  const outputAnims = []
  // Parse animation packets into array object
  packetBuffers.forEach((animBuff, index) => {
    const anim = [];
    for (let i = 0; i < animBuff.byteLength; i += 7) {
      anim.push({
        color: {
          r: animBuff.readUInt8(i),
          g: animBuff.readUInt8(i + 1),
          b: animBuff.readUInt8(i + 2),
        },
        timeStamp: animBuff.readUInt32BE(i + 3)
      })
    }
    outputAnims[index] = anim;
  });

  log.logInfo('parse success', outputAnims);

  // Send data to front end
  await closeSerial();
  win.webContents.send(ipcChannels.getToRenderChannel(ipcChannels.download), { data: [...outputAnims], msg: 'success' });


})