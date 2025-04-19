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
