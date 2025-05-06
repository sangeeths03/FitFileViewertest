// In electron-app/renderer.js

// Use window.utils if available, fallback to global
const rendererUtils = window.rendererUtils || {};
const showNotification = rendererUtils.showNotification || function(msg, type, timeout) { alert(msg); };
const setLoading = rendererUtils.setLoading || function(){};
const themeUtils = window.theme || {};
const applyTheme = themeUtils.applyTheme || function(){};
const listenForThemeChange = themeUtils.listenForThemeChange || function(){};

// --- Ensure copyTableAsCSV is available globally for export ---
import { copyTableAsCSV as copyTableAsCSVUtil } from './utils/copyTableAsCSV.js';
window.copyTableAsCSV = function({ container, data }) {
	// Find the first table in the container
	const tableEl = container && container.querySelector('table');
	if (!tableEl) return '';
	// Use Arquero to extract data if available, else fallback to DOM parsing
	if (window.aq && data && data.summaryTable) {
		// summaryTable is expected to be an Arquero table
		return copyTableAsCSVUtil(data.summaryTable);
	} else {
		// Fallback: parse table rows
		let csv = '';
		const rows = Array.from(tableEl.rows);
		rows.forEach(row => {
			const cells = Array.from(row.cells).map(cell => '"' + cell.innerText.replace(/"/g, '""') + '"');
			csv += cells.join(',') + '\n';
		});
		return csv;
	}
};

// --- Optionally expose createExportGPXButton globally ---
import { createExportGPXButton } from './utils/mapActionButtons.js';
window.createExportGPXButton = createExportGPXButton;

const openFileBtn = document.getElementById('openFileBtn');
if (!openFileBtn) {
	showNotification('Open File button not found!', 'error', 7000);
}

let isOpeningFile = false;

async function handleOpenFile() {
	if (isOpeningFile) return;
	isOpeningFile = true;
	try {
		// Check for electronAPI and methods
		if (
			!window.electronAPI ||
			!window.electronAPI.openFile ||
			!window.electronAPI.readFile ||
			!window.electronAPI.parseFitFile
		) {
			showNotification(
				'Electron API not available. Please restart the app.',
				'error',
				7000,
			);
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
				showNotification(
					`Error: ${result.error}\n${result.details || ''}`,
					'error',
				);
			} else {
				console.log('[DEBUG] FIT parse result:', result);
				try {
					window.showFitData(result, filePath);
					if (window.sendFitFileToAltFitReader) {
						window.sendFitFileToAltFitReader(arrayBuffer);
					}
				} catch (err) {
					showNotification(`Error displaying FIT data: ${err}`, 'error');
				}
			}
		}
		openFileBtn.disabled = false;
		setLoading(false);
	} finally {
		isOpeningFile = false;
	}
}

openFileBtn.addEventListener('click', handleOpenFile);

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
	menu.style.border = '2px solid #fff'; // improved contrast
	menu.style.borderRadius = '6px';
	menu.style.boxShadow = '0 2px 12px rgb(0 0 0 / 40%)'; // improved shadow
	menu.style.minWidth = '320px';
	menu.style.maxWidth = '480px';
	menu.style.fontSize = '1rem';
	menu.style.padding = '4px 0';
	menu.style.cursor = 'pointer';
	menu.style.userSelect = 'none';
	menu.oncontextmenu = (e) => e.preventDefault();
	menu.setAttribute('role', 'menu');
	menu.setAttribute('aria-label', 'Recent files');

	let focusedIndex = 0;
	const items = [];
	recentFiles.forEach((file, idx) => {
		const parts = file.split(/\\|\//g);
		const shortName =
			parts.length >= 2
				? `${parts[parts.length - 2]}${String.fromCharCode(92)}${parts[parts.length - 1]}`
				: parts[parts.length - 1];
		const item = document.createElement('div');
		item.textContent = shortName;
		item.title = file;
		item.style.padding = '8px 18px';
		item.style.whiteSpace = 'nowrap';
		item.style.overflow = 'hidden';
		item.style.textOverflow = 'ellipsis';
		item.setAttribute('role', 'menuitem');
		item.setAttribute('tabindex', '-1');
		item.style.background = idx === 0 ? '#444b6e' : 'transparent';
		item.onmouseenter = () => {
			item.style.background = '#444b6e';
		};
		item.onmouseleave = () => {
			item.style.background = focusedIndex === idx ? '#444b6e' : 'transparent';
		};
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
					if (window.sendFitFileToAltFitReader) {
						window.sendFitFileToAltFitReader(arrayBuffer);
					}
				}
				await window.electronAPI.addRecentFile(file);
			} catch (err) {
				showNotification(`Error opening recent file: ${err}`, 'error');
			}
			openFileBtn.disabled = false;
			setLoading(false);
		};
		items.push(item);
		menu.appendChild(item);
	});
	// Keyboard navigation for menu
	function focusItem(idx) {
		items.forEach((el, i) => {
			el.style.background = i === idx ? '#444b6e' : 'transparent';
			if (i === idx) el.focus();
		});
		focusedIndex = idx;
	}
	menu.addEventListener('keydown', (e) => {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			focusItem((focusedIndex + 1) % items.length);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			focusItem((focusedIndex - 1 + items.length) % items.length);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			items[focusedIndex].click();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			menu.remove();
		}
	});
	setTimeout(() => focusItem(0), 0);
	// Remove menu on click elsewhere
	const removeMenu = (e) => {
		if (!menu.contains(e.target)) menu.remove();
		document.removeEventListener('mousedown', removeMenu);
	};
	document.addEventListener('mousedown', removeMenu);
	document.body.appendChild(menu);
	menu.focus();
});

// Listen for menu events from main process using electronAPI
if (
	window.electronAPI &&
	window.electronAPI.onMenuOpenFile &&
	window.electronAPI.onOpenRecentFile
) {
	window.electronAPI.onMenuOpenFile(() => {
		handleOpenFile(); // Ensure no event argument is passed
	});
	window.electronAPI.onOpenRecentFile(async (filePath) => {
		openFileBtn.disabled = true;
		setLoading(true);
		try {
			let arrayBuffer = await window.electronAPI.readFile(filePath);
			let result = await window.electronAPI.parseFitFile(arrayBuffer);
			if (result && result.error) {
				showNotification(
					`Error: ${result.error}\n${result.details || ''}`,
					'error',
				);
			} else {
				window.showFitData(result, filePath);
				if (window.sendFitFileToAltFitReader) {
					window.sendFitFileToAltFitReader(arrayBuffer);
				}
			}
			await window.electronAPI.addRecentFile(filePath); // move to top
		} catch (err) {
			showNotification(`Error opening recent file: ${err}`, 'error');
		}
		openFileBtn.disabled = false;
		setLoading(false);
	});
}

// Listen for decoder options changes from main process
if (window.electronAPI && window.electronAPI.onIpc) {
	window.electronAPI.onIpc('decoder-options-changed', (event, newOptions) => {
		console.log('[DEBUG] Decoder options changed:', newOptions);
		showNotification('Decoder options updated.', 'info', 2000);
		// If a file is loaded, re-parse and update the data table
		if (window.globalData && window.globalData.cachedFilePath) {
			const filePath = window.globalData.cachedFilePath;
			setLoading(true);
			window.electronAPI.readFile(filePath)
				.then(arrayBuffer => window.electronAPI.parseFitFile(arrayBuffer))
				.then(result => {
					if (result && result.error) {
						showNotification(`Error: ${result.error}\n${result.details || ''}`, 'error');
					} else {
						window.showFitData(result, filePath);
					}
				})
				.catch(err => {
					showNotification(`Error reloading file: ${err}`, 'error');
				})
				.finally(() => setLoading(false));
		}
	});
}

// Listen for export-file event from main process
if (window.electronAPI && window.electronAPI.onIpc) {
	window.electronAPI.onIpc('export-file', async (event, filePath) => {
		if (!window.globalData) return;
		const ext = filePath.split('.').pop().toLowerCase();
		if (ext === 'csv') {
			// Export summary table as CSV
			const container = document.getElementById('content-summary');
			if (window.copyTableAsCSV && container) {
				const csv = window.copyTableAsCSV({
					container,
					data: window.globalData,
				});
				const blob = new Blob([csv], { type: 'text/csv' });
				const a = document.createElement('a');
				a.href = URL.createObjectURL(blob);
				a.download = filePath.split(/[\\/]/).pop();
				document.body.appendChild(a);
				a.click();
				setTimeout(() => {
					URL.revokeObjectURL(a.href);
					document.body.removeChild(a);
				}, 100);
			}
		} else if (ext === 'gpx') {
			// Export GPX (track)
			if (window.createExportGPXButton && window.globalData.recordMesgs) {
				// Use the same logic as the map export button
				const coords = window.globalData.recordMesgs
					.filter((row) => row.positionLat != null && row.positionLong != null)
					.map((row) => [
						Number((row.positionLat / 2 ** 31) * 180),
						Number((row.positionLong / 2 ** 31) * 180),
					]);
				let gpx = `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="FitFileViewer">\n<trk><name>Exported Track</name><trkseg>`;
				coords.forEach((c) => {
					gpx += `\n<trkpt lat=\"${c[0]}\" lon=\"${c[1]}\"/>`;
				});
				gpx += '\n</trkseg></trk></gpx>';
				const blob = new Blob([gpx], { type: 'application/gpx+xml' });
				const a = document.createElement('a');
				a.href = URL.createObjectURL(blob);
				a.download = filePath.split(/[\\/]/).pop();
				document.body.appendChild(a);
				a.click();
				setTimeout(() => {
					URL.revokeObjectURL(a.href);
					document.body.removeChild(a);
				}, 100);
			}
		}
	});
	window.electronAPI.onIpc('show-notification', (event, msg, type) => {
		if (typeof showNotification === 'function') showNotification(msg, type || 'info', 3000);
	});
}

// Listen for menu-print event from main process
if (window.electronAPI && window.electronAPI.onIpc) {
	window.electronAPI.onIpc('menu-print', () => {
		window.print();
	});
}

// Listen for menu-triggered update check
if (window.electronAPI && window.electronAPI.onIpc) {
	window.electronAPI.onIpc('menu-check-for-updates', () => {
		const { ipcRenderer } = window.require ? window.require('electron') : {};
		if (ipcRenderer) ipcRenderer.send('menu-check-for-updates');
	});
}

// Listen for menu-save-as and menu-export from main process and send IPC to main
if (window.electronAPI && window.electronAPI.onIpc) {
	window.electronAPI.onIpc('menu-save-as', () => {
		if (window.electronAPI.send) window.electronAPI.send('menu-save-as');
	});
	window.electronAPI.onIpc('menu-export', () => {
		if (window.electronAPI.send) window.electronAPI.send('menu-export');
	});
}

// Debounce chart rendering on window resize for performance
let chartRenderTimeout;
window.addEventListener('resize', () => {
	if (document.getElementById('tab-chart')?.classList.contains('active')) {
		clearTimeout(chartRenderTimeout);
		chartRenderTimeout = setTimeout(() => {
			if (window.renderChart) window.renderChart();
		}, 200);
	}
});

// --- Theme wiring ---
(async function setupTheme() {
	let theme = 'dark';
	if (window.electronAPI && typeof window.electronAPI.getTheme === 'function') {
		try {
			theme = await window.electronAPI.getTheme();
		} catch (e) {
			console.warn('Could not get theme from main process, defaulting to dark.');
		}
	}
	applyTheme(theme);
	listenForThemeChange(applyTheme);
})();

// --- Auto-Updater Event Listeners ---
if (window.electronAPI && window.electronAPI.onUpdateEvent) {
	console.log('[AutoUpdater] Listening for update events via electronAPI...');
	window.electronAPI.onUpdateEvent('update-checking', () => {
		console.log('[AutoUpdater] Checking for updates...');
		showUpdateNotification('Checking for updates...', 'info', 3000);
	});
	window.electronAPI.onUpdateEvent('update-available', (info) => {
		console.log('[AutoUpdater] Update available:', info);
		showUpdateNotification('Update available! Downloading...', 'info', 4000);
	});
	window.electronAPI.onUpdateEvent('update-not-available', () => {
		console.log('[AutoUpdater] No update available.');
		showUpdateNotification('You are using the latest version.', 'success', 4000);
	});
	window.electronAPI.onUpdateEvent('update-error', (err) => {
		console.error('[AutoUpdater] Update error:', err);
		showUpdateNotification('Update error: ' + err, 'error', 7000);
	});
	window.electronAPI.onUpdateEvent('update-download-progress', (progress) => {
		console.log(`[AutoUpdater] Download progress: ${Math.round(progress.percent)}%`, progress);
		showUpdateNotification(`Downloading update: ${Math.round(progress.percent)}%`, 'info', 2000);
	});
	window.electronAPI.onUpdateEvent('update-downloaded', () => {
		console.log('[AutoUpdater] Update downloaded. Waiting for user action...');
		showUpdateNotification('Update downloaded! Restart to install the update now, or choose Later to finish your work.', 'success', 0, 'update-downloaded');
	});
}

// --- Update Notification Function ---
function showUpdateNotification(message, type = 'info', duration = 6000, withAction = false) {
	const notification = document.getElementById('notification');
	if (!notification) return;
	notification.textContent = message;
	notification.className = `notification ${type}`;
	notification.style.display = 'block';
	// Remove previous buttons if any
	while (notification.firstChild) notification.removeChild(notification.firstChild);
	const msgSpan = document.createElement('span');
	msgSpan.textContent = message;
	notification.appendChild(msgSpan);
	if (withAction === 'update-downloaded') {
		const restartBtn = document.createElement('button');
		restartBtn.textContent = 'Restart & Update';
		restartBtn.className = 'themed-btn';
		restartBtn.onclick = () => {
			if (window.electronAPI && window.electronAPI.installUpdate) {
				window.electronAPI.installUpdate();
			}
		};
		notification.appendChild(restartBtn);
		const laterBtn = document.createElement('button');
		laterBtn.textContent = 'Later';
		laterBtn.className = 'themed-btn';
		laterBtn.style.marginLeft = '10px';
		laterBtn.onclick = () => {
			notification.style.display = 'none';
		};
		notification.appendChild(laterBtn);
	} else if (withAction) {
		const btn = document.createElement('button');
		btn.textContent = 'Restart & Update';
		btn.className = 'themed-btn';
		btn.onclick = () => {
			if (window.electronAPI && window.electronAPI.installUpdate) {
				window.electronAPI.installUpdate();
			}
		};
		notification.appendChild(btn);
	}
	if (!withAction || withAction === true) {
		setTimeout(() => {
			notification.style.display = 'none';
		}, duration);
	}
}
