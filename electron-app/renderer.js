// In electron-app/renderer.js

// Use window.utils if available, fallback to global
const rendererUtils = window.rendererUtils || {};
const setLoading = rendererUtils.setLoading || function () {};
const themeUtils = window.theme || {};
const applyTheme = themeUtils.applyTheme || function () {};
const listenForThemeChange = themeUtils.listenForThemeChange || function () {};

// --- Ensure copyTableAsCSV is available globally for export ---
import { copyTableAsCSV as copyTableAsCSVUtil } from './utils/copyTableAsCSV.js';
import { showNotification } from './utils/showNotification.js';
import { handleOpenFile } from './utils/handleOpenFile.js';
import { setupTheme } from './utils/setupTheme.js';
import { showUpdateNotification } from './utils/showUpdateNotification.js';
import { setupListeners } from './utils/listeners.js';
import { showAboutModal } from './utils/aboutModal.js';

window.copyTableAsCSV = function ({ container, data }) {
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
		rows.forEach((row) => {
			const cells = Array.from(row.cells).map((cell) => '"' + cell.innerText.replace(/"/g, '""') + '"');
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

const isOpeningFileRef = { value: false };

setupListeners({
	openFileBtn,
	isOpeningFileRef,
	setLoading,
	showNotification,
	handleOpenFile,
	showUpdateNotification,
	showAboutModal,
	applyTheme,
	listenForThemeChange,
});

// --- Theme wiring ---
setupTheme(applyTheme, listenForThemeChange);
