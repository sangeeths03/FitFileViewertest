const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const { createWindow } = require('./windowStateUtils');

ipcMain.handle('dialog:openFile', async () => {
	const { canceled, filePaths } = await dialog.showOpenDialog({
		filters: [{ name: 'FIT Files', extensions: ['fit'] }],
		properties: ['openFile'],
	});
	if (canceled || filePaths.length === 0) return null;
	return filePaths[0];
});

app.whenReady().then(() => {
	createWindow();
	app.on('activate', function () {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit();
});
