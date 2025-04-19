// This file is part of the Electron app that interacts with the main process and the UI.
import { displayTables } from './utils/displayTables.js';
import { renderChart } from './utils/renderChart.js';
import { renderMap } from './utils/renderMap.js';
import { renderSummary } from './utils/renderSummary.js';

window.globalData = window.globalData || null; // will hold all data received from the extension

/**
 * Show FIT data in the UI. Used by Electron main process.
 * @param {Object} data - Parsed FIT file data.
 * @param {string} filePath - Path to the FIT file.
 */
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
	} else {
		// Pre-render data tables in background if not active
		if (globalData && Object.keys(globalData).length > 0) {
			const bgData = document.getElementById('background-data-container');
			if (bgData) {
				bgData.innerHTML = '';
				// Use a temporary container to avoid ID conflicts
				const temp = document.createElement('div');
				window.displayTables.call(window, globalData, temp);
				while (temp.firstChild) bgData.appendChild(temp.firstChild);
			}
		}
	}
	if (tabChart && tabChart.classList.contains('active')) {
		if (globalData && Object.keys(globalData).length > 0) {
			window.renderChart();
		}
	} else {
		// Pre-render chart in background if not active
		if (globalData && Object.keys(globalData).length > 0) {
			window.renderChart('background-chart-container');
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

/**
 * Utility function to set the active tab.
 * @param {string} tabId - The ID of the tab button to activate.
 */
function setActiveTab(tabId) {
	document.querySelectorAll('.tab-button').forEach((btn) => {
		btn.classList.remove('active');
	});
	const tab = document.getElementById(tabId);
	if (tab) tab.classList.add('active');
}

/**
 * Utility function to toggle tab visibility.
 * @param {string} visibleTabId - The ID of the tab content to show.
 */
function toggleTabVisibility(visibleTabId) {
	const tabContentIds = [
		'content-data',
		'content-chart',
		'content-map',
		'content-summary',
	];
	tabContentIds.forEach((id) => {
		const el = document.getElementById(id);
		if (el) el.style.display = id === visibleTabId ? 'block' : 'none';
	});
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

	// Tab button click handlers (refactored to loop)
	const tabConfig = [
		{
			id: 'tab-data',
			content: 'content-data',
			handler: () => {
				if (document.getElementById('tab-data').classList.contains('active'))
					return;
				toggleTabVisibility('content-data');
				setActiveTab('tab-data');
				// If data is pre-rendered in background, move it to visible container
				const bg = document.getElementById('background-data-container');
				const visible = document.getElementById('content-data');
				if (bg && bg.childNodes.length > 0 && visible) {
					visible.innerHTML = '';
					while (bg.firstChild) visible.appendChild(bg.firstChild);
				} else {
					if (globalData && Object.keys(globalData).length > 0) {
						window.displayTables(globalData);
					}
				}
			},
		},
		{
			id: 'tab-chart',
			content: 'content-chart',
			handler: () => {
				if (document.getElementById('tab-chart').classList.contains('active'))
					return;
				toggleTabVisibility('content-chart');
				setActiveTab('tab-chart');
				 // If chart is pre-rendered in background, move it to visible container
				const bg = document.getElementById('background-chart-container');
				const chartContent = bg && bg.firstChild ? bg.firstChild : null;
				const visible = document.getElementById('content-chart');
				if (chartContent && visible) {
					visible.innerHTML = '';
					visible.appendChild(chartContent);
				} else {
					// Fallback: render as usual
					setTimeout(() => {
						window.renderChart();
					}, 0);
				}
			},
		},
		{
			id: 'tab-map',
			content: 'content-map',
			handler: () => {
				if (document.getElementById('tab-map').classList.contains('active'))
					return;
				toggleTabVisibility('content-map');
				setActiveTab('tab-map');
				window.renderMap();
			},
		},
		{
			id: 'tab-summary',
			content: 'content-summary',
			handler: () => {
				if (document.getElementById('tab-summary').classList.contains('active'))
					return;
				toggleTabVisibility('content-summary');
				setActiveTab('tab-summary');
				if (globalData && Object.keys(globalData).length > 0) {
					window.renderSummary(globalData);
				}
			},
		},
	];
	tabConfig.forEach(({ id, handler }) => {
		const btn = document.getElementById(id);
		if (btn) btn.onclick = handler;
	});

	// Listen for fitData message from the extension
	window.addEventListener('message', (event) => {
		const message = event.data;
		if (
			message &&
			typeof message === 'object' &&
			'type' in message &&
			message.type === 'fitData' &&
			'data' in message &&
			typeof message.data === 'object'
		) {
			globalData = message.data;
			displayTables(globalData);
			const tabChart = document.getElementById('tab-chart');
			const tabMap = document.getElementById('tab-map');
			const tabSummary = document.getElementById('tab-summary');
			if (tabChart && tabChart.classList.contains('active')) {
				renderChart();
			}
			if (tabMap && tabMap.classList.contains('active')) {
				renderMap();
			}
			if (tabSummary && tabSummary.classList.contains('active')) {
				renderSummary(globalData);
			}
		}
	});
};
