/* eslint-disable no-console */
// This file is part of the Electron app that interacts with the main process and the UI.
import { displayTables } from './utils/displayTables.js';
import { renderChart } from './utils/renderChart.js';
import { renderMap } from './utils/renderMap.js';
import { renderSummary } from './utils/renderSummary.js';
import { setActiveTab } from './utils/setActiveTab.js';
import { toggleTabVisibility } from './utils/toggleTabVisibility.js';
import { applyTheme, loadTheme, listenForThemeChange } from './utils/theme.js';
import { showFitData } from './utils/showFitData.js';

window.globalData = window.globalData || null; // will hold all data received from the extension

window.showFitData = showFitData;

// Listen for theme change from main process
listenForThemeChange(applyTheme);

// On load, apply theme
applyTheme(loadTheme());

// Listen for menu event to open summary column selector
if (window.electronAPI && window.electronAPI.onOpenSummaryColumnSelector === undefined) {
    window.electronAPI.onOpenSummaryColumnSelector = (callback) => {
        if (window.electronAPI && window.electronAPI._summaryColListenerAdded !== true) {
            window.electronAPI._summaryColListenerAdded = true;
            window.electronAPI.onIpc('open-summary-column-selector', callback);
        }
    };
}

// Register handler to show summary column selector from menu
if (window.electronAPI && window.electronAPI.onIpc) {
    window.electronAPI.onIpc('open-summary-column-selector', () => {
        // Switch to summary tab if not already active
        const tabSummary = document.getElementById('tab-summary');
        if (!tabSummary.classList.contains('active')) {
            tabSummary.click();
        }
        // Wait for renderSummary to finish, then open the column selector
        setTimeout(() => {
            const gearBtn = document.querySelector('.summary-gear-btn');
            if (gearBtn) gearBtn.click();
        }, 100);
    });
}

// Listen for unload-fit-file event from main process
if (window.electronAPI && window.electronAPI.onIpc) {
    window.electronAPI.onIpc('unload-fit-file', () => {
        // Clear globalData and UI
        window.globalData = {};
        // Clear file name display
        const fileSpan = document.getElementById('activeFileName');
        if (fileSpan) {
            fileSpan.textContent = '';
            fileSpan.title = '';
        }
        // Reset all content areas
        document.getElementById('content-map').innerHTML = '';
        document.getElementById('content-data').innerHTML = '';
        document.getElementById('content-chart').innerHTML = '';
        document.getElementById('content-summary').innerHTML = '';
        // Switch to map tab
        setActiveTab('tab-map');
        // Notify main process to update menu
        if (window.electronAPI && window.electronAPI.send) {
            window.electronAPI.send('fit-file-loaded', null);
        }
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
