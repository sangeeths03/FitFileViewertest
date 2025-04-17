const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const fitParser = require('./fitParser');

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  readFile: (filePath) => {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) reject(err);
        else resolve(data.buffer);
      });
    });
  },
  parseFitFile: async (arrayBuffer) => {
    // Convert ArrayBuffer to Buffer
    const buffer = Buffer.from(arrayBuffer);
    return await fitParser.decodeFitFile(buffer);
  }
});