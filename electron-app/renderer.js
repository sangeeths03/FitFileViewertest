// In electron-app/renderer.js

// Utility to show notification
function showNotification(message, type = 'error', timeout = 5000) {
	const notif = document.getElementById('notification');
	if (!notif) return;
	notif.textContent = message;
	notif.className = `notification ${type}`;
	notif.style.display = 'block';
	if (timeout > 0) {
		setTimeout(() => {
			notif.style.display = 'none';
		}, timeout);
	}
}

// Utility to show/hide loading overlay
function setLoading(isLoading) {
	const overlay = document.getElementById('loadingOverlay');
	if (!overlay) return;
	overlay.style.display = isLoading ? 'flex' : 'none';
	document.body.style.cursor = isLoading ? 'wait' : '';
}

const openFileBtn = document.getElementById('openFileBtn');
if (!openFileBtn) {
	showNotification('Open File button not found!', 'error', 7000);
}

openFileBtn.addEventListener('click', async () => {
	// Check for electronAPI and methods
	if (!window.electronAPI ||
		!window.electronAPI.openFile ||
		!window.electronAPI.readFile ||
		!window.electronAPI.parseFitFile) {
		showNotification('Electron API not available. Please restart the app.', 'error', 7000);
		return;
	}

	openFileBtn.disabled = true;
	setLoading(true);
	let filePath;
	try {
		filePath = await window.electronAPI.openFile();
	} catch (err) {
		showNotification(`Failed to open file dialog: ${err}`, 'error');
		openFileBtn.disabled = false;
		setLoading(false);
		return;
	}
	if (filePath) {
		let arrayBuffer;
		try {
			arrayBuffer = await window.electronAPI.readFile(filePath);
		} catch (err) {
			showNotification(`Error reading file: ${err}`, 'error');
			openFileBtn.disabled = false;
			setLoading(false);
			return;
		}
		let result;
		try {
			result = await window.electronAPI.parseFitFile(arrayBuffer);
		} catch (err) {
			showNotification(`Error parsing FIT file: ${err}`, 'error');
			openFileBtn.disabled = false;
			setLoading(false);
			return;
		}
		if (result && result.error) {
			showNotification(`Error: ${result.error}\n${result.details || ''}`, 'error');
		} else {
			console.log('[DEBUG] FIT parse result:', result);
			try {
				window.showFitData(result, filePath);
			} catch (err) {
				showNotification(`Error displaying FIT data: ${err}`, 'error');
			}
		}
	}
	openFileBtn.disabled = false;
	setLoading(false);
});

// --- Recent Files Context Menu for Open Button ---
openFileBtn.addEventListener('contextmenu', async (event) => {
	event.preventDefault();
	if (!window.electronAPI || !window.electronAPI.recentFiles) return;
	const recentFiles = await window.electronAPI.recentFiles();
	if (!recentFiles || recentFiles.length === 0) {
		showNotification('No recent files found.', 'info', 2000);
		return;
	}
	// Remove any existing menu
	const oldMenu = document.getElementById('recent-files-menu');
	if (oldMenu) oldMenu.remove();
	// Create menu
	const menu = document.createElement('div');
	menu.id = 'recent-files-menu';
	menu.style.position = 'fixed';
	menu.style.zIndex = 10010;
	menu.style.left = `${event.clientX}px`;
	menu.style.top = `${event.clientY}px`;
	menu.style.background = '#23263a';
	menu.style.color = '#fff';
	menu.style.border = '1px solid #33374d';
	menu.style.borderRadius = '6px';
	menu.style.boxShadow = '0 2px 12px rgb(0 0 0 / 25%)';
	menu.style.minWidth = '320px';
	menu.style.maxWidth = '480px';
	menu.style.fontSize = '1rem';
	menu.style.padding = '4px 0';
	menu.style.cursor = 'pointer';
	menu.style.userSelect = 'none';
	menu.oncontextmenu = (e) => e.preventDefault();

	recentFiles.forEach((file) => {
		const parts = file.split(/\\|\//g); // split on both \\ and /
		const shortName = parts.length >= 2 ? `${parts[parts.length-2]}${String.fromCharCode(92)}${parts[parts.length-1]}` : parts[parts.length-1];
		const item = document.createElement('div');
		item.textContent = shortName;
		item.title = file; // show full path on hover
		item.style.padding = '8px 18px';
		item.style.whiteSpace = 'nowrap';
		item.style.overflow = 'hidden';
		item.style.textOverflow = 'ellipsis';
		item.onmouseenter = () => { item.style.background = '#33374d'; };
		item.onmouseleave = () => { item.style.background = 'transparent'; };
		item.onclick = async () => {
			menu.remove();
			openFileBtn.disabled = true;
			setLoading(true);
			try {
				let arrayBuffer = await window.electronAPI.readFile(file);
				let result = await window.electronAPI.parseFitFile(arrayBuffer);
				if (result && result.error) {
					showNotification(`Error: ${result.error}\n${result.details || ''}`, 'error');
				} else {
					window.showFitData(result, file);
				}
				await window.electronAPI.addRecentFile(file); // move to top
			} catch (err) {
				showNotification(`Error opening recent file: ${err}`, 'error');
			}
			openFileBtn.disabled = false;
			setLoading(false);
		};
		menu.appendChild(item);
	});
	// Remove menu on click elsewhere
	const removeMenu = (e) => {
		if (!menu.contains(e.target)) menu.remove();
		document.removeEventListener('mousedown', removeMenu);
	};
	document.addEventListener('mousedown', removeMenu);
	document.body.appendChild(menu);
});
