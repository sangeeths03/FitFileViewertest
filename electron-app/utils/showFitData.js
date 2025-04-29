// utils/showFitData.js

/**
 * Show FIT data in the UI. Used by Electron main process.
 * @param {Object} data - Parsed FIT file data.
 * @param {string} filePath - Path to the FIT file.
 */
export function showFitData(data, filePath) {
	window.globalData = data;
	if (filePath) {
		// Show just the filename, not the full path
		let fileName = window.globalData.cachedFileName;
		if (!fileName || window.globalData.cachedFilePath !== filePath) {
			fileName = filePath.split(/[/\\]/).pop();
			window.globalData.cachedFileName = fileName;
			window.globalData.cachedFilePath = filePath;
		}
		const fileSpan = document.getElementById('activeFileName');
		if (fileSpan) {
			fileSpan.textContent = `Active: ${fileName}`;
			fileSpan.title = filePath; // Show full path on mouseover
		}
		// Only update the title if fileName is present
		document.title = fileName
			? `Fit File Viewer - ${fileName}`
			: 'Fit File Viewer';
		// Set global.loadedFitFilePath for menu enable/disable
		if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
			window.require('electron').remote.getGlobal('loadedFitFilePath', filePath);
		}
		if (typeof global !== 'undefined') {
			global.loadedFitFilePath = filePath;
		}
		// Notify main process to rebuild menu so Summary Columns is enabled
		if (window.electronAPI && typeof window.electronAPI.sendThemeChanged === 'function') {
			// Use theme change as a trigger to rebuild menu, passing current theme
			const theme = localStorage.getItem('ffv-theme') || 'dark';
			window.electronAPI.sendThemeChanged(theme);
		}
		// Notify main process of loaded file for menu enable/disable
		if (window.electronAPI && window.electronAPI.send) {
			window.electronAPI.send('fit-file-loaded', filePath);
		} else if (window.require) {
			const { ipcRenderer } = window.require('electron');
			if (ipcRenderer) ipcRenderer.send('fit-file-loaded', filePath);
		}
	}

	// After window.globalData is set and contains lapMesgs and recordMesgs
	if (window.globalData && window.globalData.lapMesgs && window.globalData.recordMesgs) {
		const records = window.globalData.recordMesgs;
		const laps = window.globalData.lapMesgs;
		for (let i = 0; i < laps.length; ++i) {
			const lap = laps[i];
			const startTime = lap.startTime || lap.start_time;
			const nextLap = laps[i + 1];
			const endTime = nextLap ? (nextLap.startTime || nextLap.start_time) : null;
			// Find first record with timestamp >= lap start
			let startIdx = records.findIndex(r => r.timestamp && startTime && new Date(r.timestamp).getTime() >= new Date(startTime).getTime());
			if (startIdx === -1 && startTime) {
				let minDiff = Infinity;
				for (let j = 0; j < records.length; ++j) {
					if (records[j].timestamp) {
						const diff = Math.abs(new Date(records[j].timestamp).getTime() - new Date(startTime).getTime());
						if (diff < minDiff) {
							minDiff = diff;
							startIdx = j;
						}
					}
				}
			}
			// Find last record before next lap's start (or end of file)
			let endIdx = records.length - 1;
			if (endTime) {
				for (let j = startIdx; j < records.length; ++j) {
					if (records[j].timestamp && new Date(records[j].timestamp).getTime() >= new Date(endTime).getTime()) {
						endIdx = j - 1;
						break;
					}
				}
			}
			// Clamp
			if (startIdx < 0) startIdx = 0;
			if (endIdx < startIdx) endIdx = startIdx;
			if (endIdx >= records.length) endIdx = records.length - 1;
			lap.start_index = startIdx;
			lap.end_index = endIdx;
		}
	}

	const tabData = document.getElementById('tab-data');
	const tabChart = document.getElementById('tab-chart');
	const tabMap = document.getElementById('tab-map');
	const tabSummary = document.getElementById('tab-summary');

	if (tabData && tabData.classList.contains('active')) {
		window.displayTables(window.globalData);
	} else {
		// Pre-render data tables in background if not active
		if (window.globalData && Object.keys(window.globalData).length > 0) {
			const bgData = document.getElementById('background-data-container');
			if (bgData) {
				bgData.innerHTML = '';
				// Use a temporary container to avoid ID conflicts
				const temp = document.createElement('div');
				window.displayTables.call(window, window.globalData, temp);
				while (temp.firstChild) bgData.appendChild(temp.firstChild);
			}
		}
	}
	if (tabChart && tabChart.classList.contains('active')) {
		if (window.globalData && Object.keys(window.globalData).length > 0) {
			window.renderChart();
		}
	}
	if (tabMap && tabMap.classList.contains('active')) {
		if (window.globalData && Object.keys(window.globalData).length > 0) {
			window.renderMap();
		}
	}
	if (tabSummary && tabSummary.classList.contains('active')) {
		window.renderSummary(window.globalData);
	}
}
