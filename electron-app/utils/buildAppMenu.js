const { loadRecentFiles, getShortRecentName } = require('./recentFiles');
const { Menu, BrowserWindow } = require('electron');
const Store = require('electron-store').default;
const store = new Store({ name: 'settings' });

const decoderOptionDefaults = {
	applyScaleAndOffset: true,
	expandSubFields: true,
	expandComponents: true,
	convertTypesToStrings: true,
	convertDateTimesToDates: true,
	includeUnknownData: true,
	mergeHeartRates: true,
};

function getDecoderOptions() {
	return store.get('decoderOptions', decoderOptionDefaults);
}

function setDecoderOption(key, value) {
	const options = getDecoderOptions();
	options[key] = value;
	store.set('decoderOptions', options);
	return options;
}

function getTheme() {
	return store.get('theme', 'dark');
}

function setTheme(theme) {
	store.set('theme', theme);
}

/**
 * Builds and sets the application menu for the Electron app.
 * The menu includes File, Edit, View, Window, and Settings menus, with support for opening files,
 * displaying a list of recent files, and standard menu roles.
 *
 * @param {Electron.BrowserWindow} mainWindow - The main application window to which menu actions are dispatched.
 * @param {string} [currentTheme=null] - The current theme of the application, used to set the checked state of theme radio buttons.
 * @param {string|null} [loadedFitFilePath=null] - The path of the loaded FIT file, used to enable/disable the Summary Columns menu item.
 */
function buildAppMenu(
	mainWindow,
	currentTheme = null,
	loadedFitFilePath = null,
) {
	const theme = currentTheme || getTheme();
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

	const decoderOptions = getDecoderOptions();
	const decoderOptionsMenu = {
		label: 'Decoder Options',
		submenu: Object.keys(decoderOptionDefaults).map((key) => ({
			label: key,
			type: 'checkbox',
			checked: !!decoderOptions[key],
			click: (menuItem) => {
				const newOptions = setDecoderOption(key, menuItem.checked);
				const win = BrowserWindow.getFocusedWindow() || mainWindow;
				if (win && win.webContents) {
					win.webContents.send('decoder-options-changed', newOptions);
				}
			},
		})),
	};

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
				{
					label: 'Save As...',
					enabled: !!loadedFitFilePath,
					accelerator: 'CmdOrCtrl+S',
					click: () => {
						const win = BrowserWindow.getFocusedWindow() || mainWindow;
						if (win && win.webContents) {
							win.webContents.send('menu-save-as');
						}
					},
				},
				{
					label: 'Export...',
					enabled: !!loadedFitFilePath,
					click: () => {
						const win = BrowserWindow.getFocusedWindow() || mainWindow;
						if (win && win.webContents) {
							win.webContents.send('menu-export');
						}
					},
				},
				{
					label: 'Print...',
					enabled: !!loadedFitFilePath,
					accelerator: 'CmdOrCtrl+P',
					click: () => {
						const win = BrowserWindow.getFocusedWindow() || mainWindow;
						if (win && win.webContents) {
							win.webContents.send('menu-print');
						}
					},
				},
				{ type: 'separator' },
				{
					label: 'Close Window',
					accelerator: 'CmdOrCtrl+W',
					click: () => {
						const win = BrowserWindow.getFocusedWindow();
						if (win) {
							win.close();
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
							checked: theme === 'dark',
							click: () => {
								setTheme('dark');
								const win = BrowserWindow.getFocusedWindow() || mainWindow;
								if (win && win.webContents) {
									win.webContents.send('set-theme', 'dark');
								}
							},
						},
						{
							label: 'Light',
							type: 'radio',
							checked: theme === 'light',
							click: () => {
								setTheme('light');
								const win = BrowserWindow.getFocusedWindow() || mainWindow;
								if (win && win.webContents) {
									win.webContents.send('set-theme', 'light');
								}
							},
						},
					],
				},
				{
					label: 'Check for Updates...',
					click: () => {
						const win = BrowserWindow.getFocusedWindow() || mainWindow;
						if (win && win.webContents) {
							win.webContents.send('menu-check-for-updates');
						}
					},
				},
				decoderOptionsMenu,
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
