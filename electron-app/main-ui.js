import { formatDistance } from './utils/formatDistance.js';
import { formatDuration } from './utils/formatDuration.js';
import { patchSummaryFields } from './utils/patchSummaryFields.js';
import { displayTables } from './utils/displayTables.js';
import { renderTable } from './utils/renderTable.js';
import { copyTableAsCSV } from './utils/copyTableAsCSV.js';
import { renderChart } from './utils/renderChart.js';
import { renderMap } from './utils/renderMap.js';
import { renderSummary } from './utils/renderSummary.js';

window.globalData = window.globalData || null; // will hold all data received from the extension

// Add this function for Electron usage
window.showFitData = function (data, filePath) {
	globalData = data;
	if (filePath) {
		// Show just the filename, not the full path
		let fileName = globalData.cachedFileName;
		if (!fileName || globalData.cachedFilePath !== filePath) {
			fileName = filePath.split(/[/\\]/).pop();
			globalData.cachedFileName = fileName;
			globalData.cachedFilePath = filePath;
		}
		const fileSpan = document.getElementById('activeFileName');
		if (fileSpan) {
			fileSpan.textContent = `Active: ${fileName}`;
			fileSpan.title = filePath; // Show full path on mouseover
		}
		document.title = `Fit File Viewer - ${fileName}`; // Set title bar
	}
	const tabData = document.getElementById('tab-data');
	const tabChart = document.getElementById('tab-chart');
	const tabMap = document.getElementById('tab-map');
	const tabSummary = document.getElementById('tab-summary');

	if (tabData && tabData.classList.contains('active')) {
		window.displayTables(globalData);
	}
	if (tabChart && tabChart.classList.contains('active')) {
		if (globalData && Object.keys(globalData).length > 0) {
			window.renderChart();
		}
	}
	if (tabMap && tabMap.classList.contains('active')) {
		if (globalData && Object.keys(globalData).length > 0) {
			window.renderMap();
		}
	}
	if (tabSummary && tabSummary.classList.contains('active')) {
		window.renderSummary(globalData);
	}
};

	// Utility function to set the active tab
	function setActiveTab(tabId) {
		document.querySelectorAll('.tab-button').forEach((btn) => {
			btn.classList.remove('active');
		});
		document.getElementById(tabId).classList.add('active');
	}

	window.onload = () => {
	// Signal to the extension that the webview is ready (only if available)
	let vscode;
	if (typeof acquireVsCodeApi === 'function') {
		vscode = acquireVsCodeApi();
		vscode.postMessage({ type: 'ready' });
	} else {
		console.warn(
			'acquireVsCodeApi is not available. Messages will be logged locally.',
		);
		vscode = {
			postMessage: (message) => {
				console.log('Message logged locally:', message);
			},
		};
	}

	// Default: show the Map tab
	toggleTabVisibility('content-map');

	// Utility function to toggle tab visibility
	function toggleTabVisibility(visibleTabId) {
		const tabContentIds = ['content-data', 'content-chart', 'content-map', 'content-summary'];
		tabContentIds.forEach((id) => {
			document.getElementById(id).style.display = id === visibleTabId ? 'block' : 'none';
		});
	}

	// Tab button click handlers
	document.getElementById('tab-data').onclick = () => {
		toggleTabVisibility('content-data');
		setActiveTab('tab-data');
		if (globalData && Object.keys(globalData).length > 0) {
			window.displayTables(globalData);
		}
	};

	document.getElementById('tab-chart').onclick = () => {
		toggleTabVisibility('content-chart');
		setActiveTab('tab-chart');
		window.renderChart();
	};

	document.getElementById('tab-map').onclick = () => {
		document.getElementById('content-data').style.display = 'none';
		document.getElementById('content-chart').style.display = 'none';
		document.getElementById('content-map').style.display = 'block';
		document.getElementById('content-summary').style.display = 'none';
		setActiveTab('tab-map');
		window.renderMap();
	};

	document.getElementById('tab-summary').onclick = () => {
		toggleTabVisibility('content-summary');
		setActiveTab('tab-summary');
		if (globalData && Object.keys(globalData).length > 0) {
			window.renderSummary(globalData);
		}
	};

	// Listen for fitData message from the extension
	window.addEventListener('message', (event) => {
		const message = event.data;
		if (message && typeof message === 'object' && 'type' in message && message.type === 'fitData' && 'data' in message && typeof message.data === 'object') {
			globalData = message.data;
			displayTables(globalData);
			if (document.getElementById('tab-chart').classList.contains('active')) {
				renderChart();
			}
			if (document.getElementById('tab-map').classList.contains('active')) {
				renderMap();
			}
			if (document.getElementById('tab-summary').classList.contains('active')) {
				renderSummary(globalData);
			}
		}
	});
};
