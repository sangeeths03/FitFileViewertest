const { app, BrowserWindow, dialog, ipcMain, Menu } = require('electron');
const { createWindow } = require('./windowStateUtils');
const path = require('path');
const fs = require('fs');

const {
	loadRecentFiles,
	saveRecentFiles,
	addRecentFile,
	getShortRecentName,
} = require('./utils/recentFiles');
const { buildAppMenu } = require('./utils/buildAppMenu');

// Register IPC handlers and create the main window when the app is ready
app.whenReady().then(() => {
	// Register file open dialog handler
	const mainWindow = createWindow();

	// Helper to update menu with current theme from renderer
	async function updateMenuWithCurrentTheme(win) {
		let theme = 'dark';
		try {
			theme = await win.webContents.executeJavaScript('localStorage.getItem("ffv-theme")') || 'dark';
		} catch {}
		buildAppMenu(win, theme);
	}

	// Get theme from localStorage in renderer
	mainWindow.webContents.on('did-finish-load', () => {
		mainWindow.webContents
			.executeJavaScript('localStorage.getItem("ffv-theme")')
			.then((theme) => {
				buildAppMenu(mainWindow, theme || 'dark');
				mainWindow.webContents.send('set-theme', theme || 'dark');
			})
			.catch(() => {
				buildAppMenu(mainWindow, 'dark');
				mainWindow.webContents.send('set-theme', 'dark');
			});
	});

	// Always use the current theme for initial menu
	updateMenuWithCurrentTheme(mainWindow);

	// Theme persistence: set theme on window creation
	mainWindow.webContents.on('did-finish-load', () => {
		mainWindow.webContents
			.executeJavaScript('localStorage.getItem("ffv-theme")')
			.then((theme) => {
				mainWindow.webContents.send('set-theme', theme || 'dark');
			})
			.catch(() => {
				mainWindow.webContents.send('set-theme', 'dark');
			});
	});

	ipcMain.handle('dialog:openFile', async () => {
		try {
			const { canceled, filePaths } = await dialog.showOpenDialog({
				filters: [{ name: 'FIT Files', extensions: ['fit'] }],
				properties: ['openFile'],
			});
			if (canceled || filePaths.length === 0) return null;
			addRecentFile(filePaths[0]);
			// Fetch current theme from renderer before rebuilding menu
			const win = BrowserWindow.getFocusedWindow() || mainWindow;
			let theme = 'dark';
			try {
				theme = await win.webContents.executeJavaScript('localStorage.getItem("ffv-theme")') || 'dark';
			} catch {}
			buildAppMenu(win, theme);
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
		// Fetch current theme from renderer before rebuilding menu
		const win = BrowserWindow.getFocusedWindow() || mainWindow;
		let theme = 'dark';
		try {
			theme = await win.webContents.executeJavaScript('localStorage.getItem("ffv-theme")') || 'dark';
		} catch {}
		buildAppMenu(win, theme);
		return loadRecentFiles();
	});

	// Listen for theme change from renderer and update menu
	ipcMain.on('theme-changed', (event, theme) => {
		const win = BrowserWindow.fromWebContents(event.sender);
		if (win) buildAppMenu(win, theme || 'dark');
	});

	app.on('activate', function () {
		if (BrowserWindow.getAllWindows().length === 0) {
			const win = createWindow();
			updateMenuWithCurrentTheme(win);
		} else {
			const win = BrowserWindow.getFocusedWindow() || mainWindow;
			if (win) updateMenuWithCurrentTheme(win);
		}
	});
});

// Gracefully quit the app on all windows closed (except macOS)
app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit();
});
