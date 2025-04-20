const { loadRecentFiles, getShortRecentName } = require('./recentFiles');

/**
 * Builds and sets the application menu for the Electron app.
 * The menu includes File, Edit, View, and Window menus, with support for opening files,
 * displaying a list of recent files, and standard menu roles.
 *
 * @param {Electron.BrowserWindow} mainWindow - The main application window to which menu actions are dispatched.
 */
function buildAppMenu(mainWindow) {
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
				{ role: 'quit' },
			],
		},
		{ role: 'editMenu' },
		{ role: 'viewMenu' },
		{ role: 'windowMenu' },
	];
	const { Menu } = require('electron');
	Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

module.exports = { buildAppMenu };
