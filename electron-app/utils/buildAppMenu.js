const { loadRecentFiles, getShortRecentName } = require('./recentFiles');
const { Menu, BrowserWindow } = require('electron');

/**
 * Builds and sets the application menu for the Electron app.
 * The menu includes File, Edit, View, Window, and Settings menus, with support for opening files,
 * displaying a list of recent files, and standard menu roles.
 *
 * @param {Electron.BrowserWindow} mainWindow - The main application window to which menu actions are dispatched.
 * @param {string} [currentTheme='dark'] - The current theme of the application, used to set the checked state of theme radio buttons.
 * @param {string|null} [loadedFitFilePath=null] - The path of the loaded FIT file, used to enable/disable the Summary Columns menu item.
 */
function buildAppMenu(mainWindow, currentTheme = 'dark', loadedFitFilePath = null) {
	const recentFiles = loadRecentFiles();
	const recentMenuItems =
		recentFiles.length > 0
			? recentFiles.map((file, idx) => ({
					label: getShortRecentName(file),
					tooltip: file,
					click: () => {
						if (mainWindow && mainWindow.webContents) {
							mainWindow.webContents.send('open-recent-file', file);
						}
					},
			  }))
			: [{ label: 'No Recent Files', enabled: false }];

	/**
	 * Defines the application menu template for the Electron app.
	 *
	 * The template includes the following menus:
	 * - File: Contains options to open files, view recent files, and quit the application.
	 * - Edit: Standard edit menu (cut, copy, paste, etc.).
	 * - View: Standard view menu (reload, toggle dev tools, etc.).
	 * - Window: Standard window menu (minimize, close, etc.).
	 * - Settings: Contains options to configure application settings, such as theme.
	 *
	 * @type {Array<Object>}
	 * @property {string} label - The display label for the menu item.
	 * @property {Array<Object>} [submenu] - Submenu items for the menu.
	 * @property {string} [accelerator] - Keyboard shortcut for the menu item.
	 * @property {Function} [click] - Click handler for the menu item.
	 * @property {string} [role] - Built-in role for standard menu items.
	 */
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
				{
					label: 'Unload File',
					enabled: !!loadedFitFilePath,
					click: () => {
						const win = BrowserWindow.getFocusedWindow() || mainWindow;
						if (win && win.webContents) {
							win.webContents.send('unload-fit-file');
						}
					},
				},
				{ type: 'separator' },
				{ role: 'quit' },
			],
		},
		{ role: 'viewMenu' },
		{
			label: 'Settings',
			submenu: [
				{
					label: 'Theme',
					submenu: [
						{
							label: 'Dark',
							type: 'radio',
							checked: currentTheme === 'dark',
							click: () => {
								const win = BrowserWindow.getFocusedWindow() || mainWindow;
								console.log('[DEBUG] Theme menu clicked: dark, win:', !!win);
								if (win && win.webContents) {
									win.webContents.send('set-theme', 'dark');
								}
							},
						},
						{
							label: 'Light',
							type: 'radio',
							checked: currentTheme === 'light',
							click: () => {
								const win = BrowserWindow.getFocusedWindow() || mainWindow;
								console.log('[DEBUG] Theme menu clicked: light, win:', !!win);
								if (win && win.webContents) {
									win.webContents.send('set-theme', 'light');
								}
							},
						},
						],
					},
				{
					label: 'Summary Columns...',
					enabled: !!loadedFitFilePath,
					click: () => {
						const win = BrowserWindow.getFocusedWindow() || mainWindow;
						if (win && win.webContents) {
							win.webContents.send('open-summary-column-selector');
						}
					},
				},
			],
		},
	];
	Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

module.exports = { buildAppMenu };
