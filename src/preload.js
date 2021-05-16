import { contextBridge, ipcRenderer } from "electron";
import ipcChannels from "./channel_index.js";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "ipc", {
    send: (channel, data) => {
        // whitelist channels
        if (Object.values(ipcChannels.toMainChannels).includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    receive: (channel, func) => {
        if (Object.values(ipcChannels.toRenderChannels).includes(channel)) {
            // Deliberately strip event as it includes `sender` 
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    }
}
);