const { app, BrowserWindow, dialog, ipcMain, Menu } = require('electron');
const { createWindow } = require('./windowStateUtils');
const path = require('path');
const fs = require('fs');

const { loadRecentFiles, saveRecentFiles, addRecentFile, getShortRecentName } = require('./utils/recentFiles');
const { buildAppMenu } = require('./utils/buildAppMenu');

// Register IPC handlers and create the main window when the app is ready
app.whenReady().then(() => {
	// Register file open dialog handler
	const mainWindow = createWindow();
	buildAppMenu(mainWindow);

	ipcMain.handle('dialog:openFile', async () => {
		try {
			const { canceled, filePaths } = await dialog.showOpenDialog({
				filters: [{ name: 'FIT Files', extensions: ['fit'] }],
				properties: ['openFile'],
			});
			if (canceled || filePaths.length === 0) return null;
			addRecentFile(filePaths[0]);
			buildAppMenu(BrowserWindow.getFocusedWindow() || mainWindow);
			return filePaths[0];
		} catch (err) {
			console.error('Error opening file dialog:', err);
			return null;
		}
	});

	// IPC: Get recent files
	ipcMain.handle('recentFiles:get', async () => {
		return loadRecentFiles();
	});

	// IPC: Add a file to recent files (for manual add if needed)
	ipcMain.handle('recentFiles:add', async (event, filePath) => {
		addRecentFile(filePath);
		buildAppMenu(BrowserWindow.getFocusedWindow() || mainWindow);
		return loadRecentFiles();
	});

	app.on('activate', function () {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

// Gracefully quit the app on all windows closed (except macOS)
app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit();
});
