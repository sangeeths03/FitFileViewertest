const { loadRecentFiles, getShortRecentName } = require('./recentFiles');

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
	const { Menu } = require('electron');
	Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

module.exports = { buildAppMenu };
