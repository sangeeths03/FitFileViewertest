const { app, BrowserWindow, dialog, ipcMain, Menu } = require('electron');
const { createWindow } = require('./windowStateUtils');
const path = require('path');
const fs = require('fs');

const RECENT_FILES_PATH = path.join(app.getPath('userData'), 'recent-files.json');
const MAX_RECENT_FILES = 10;

function loadRecentFiles() {
	try {
		const data = fs.readFileSync(RECENT_FILES_PATH, 'utf8');
		return JSON.parse(data);
	} catch {
		return [];
	}
}

function saveRecentFiles(list) {
	try {
		fs.writeFileSync(RECENT_FILES_PATH, JSON.stringify(list));
	} catch (err) {
		console.error('Failed to save recent files:', err);
	}
}

function addRecentFile(filePath) {
	let list = loadRecentFiles();
	list = list.filter(f => f !== filePath);
	list.unshift(filePath);
	if (list.length > MAX_RECENT_FILES) list = list.slice(0, MAX_RECENT_FILES);
	saveRecentFiles(list);
}

function getShortRecentName(file) {
	const parts = file.split(/\\|\//g);
	return parts.length >= 2 ? `${parts[parts.length-2]}${String.fromCharCode(92)}${parts[parts.length-1]}` : parts[parts.length-1];
}

function buildAppMenu(mainWindow) {
	const recentFiles = loadRecentFiles();
	const recentMenuItems = recentFiles.length > 0 ? recentFiles.map((file, idx) => ({
		label: getShortRecentName(file),
		tooltip: file,
		click: () => {
			if (mainWindow && mainWindow.webContents) {
				mainWindow.webContents.send('open-recent-file', file);
			}
		},
	})) : [{ label: 'No Recent Files', enabled: false }];

	const template = [
		{
			label: 'File',
			submenu: [
				{
					label: 'Open...',
					accelerator: 'CmdOrCtrl+O',
					click: () => {
						if (mainWindow && mainWindow.webContents) {
							mainWindow.webContents.send('menu-open-file');
						}
					},
				},
				{ type: 'separator' },
				{
					label: 'Open Recent',
					submenu: recentMenuItems,
				},
				{ type: 'separator' },
				{ role: 'quit' },
			],
		},
		{ role: 'editMenu' },
		{ role: 'viewMenu' },
		{ role: 'windowMenu' },
	];
	Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

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
