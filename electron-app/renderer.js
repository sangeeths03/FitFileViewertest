// In electron-app/renderer.js

import { showNotification, setLoading } from './utils/rendererUtils.js';

const openFileBtn = document.getElementById('openFileBtn');
if (!openFileBtn) {
	showNotification('Open File button not found!', 'error', 7000);
}

openFileBtn.addEventListener('click', async () => {
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
		openFileBtn.click(); // Simulate click to reuse logic
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
			}
			await window.electronAPI.addRecentFile(filePath); // move to top
		} catch (err) {
			showNotification(`Error opening recent file: ${err}`, 'error');
		}
		openFileBtn.disabled = false;
		setLoading(false);
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
