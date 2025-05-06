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

// Helper to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Define getActiveTabContent function
function getActiveTabContent() {
	const tabContents = document.querySelectorAll('.tab-content');
	for (const el of tabContents) {
		if (el.style.display === 'block') return el;
	}
	return null;
}

// When a FIT file is opened, always send it to the iframe (even if not active)
window.sendFitFileToAltFitReader = async function(arrayBuffer) {
  const iframe = document.getElementById('altfit-iframe');
  if (iframe) {
    // If iframe is not loaded yet, wait for it to load before posting message
    const postToIframe = () => {
      if (iframe.contentWindow) {
        const base64 = arrayBufferToBase64(arrayBuffer);
        iframe.contentWindow.postMessage({ type: 'fit-file', base64 }, '*');
      }
    };
    if (iframe.src && !iframe.src.includes('libs/ffv/index.html')) {
      iframe.src = 'libs/ffv/index.html';
      iframe.onload = postToIframe;
    } else if (iframe.contentWindow && iframe.src) {
      postToIframe();
    } else {
      iframe.onload = postToIframe;
    }
  }
};

// Listen for theme change from main process
listenForThemeChange((theme) => {
	applyTheme(theme);
	// If chart tab is active, re-render chart to update theme
	const tabChart = document.getElementById('tab-chart');
	if (tabChart && tabChart.classList.contains('active')) {
		renderChart();
	}
});

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

// --- Improved Full Screen Button for Each Tab ---
function addFullScreenButton(tabContentId) {
	const container = document.getElementById(tabContentId);
	if (!container) return;
	if (document.getElementById(tabContentId + '-fullscreen-btn')) return;

	const wrapper = document.createElement('div');
	wrapper.className = 'fullscreen-btn-wrapper';
	wrapper.style.position = 'absolute';
	wrapper.style.right = '24px';
	wrapper.style.bottom = '24px';
	wrapper.style.zIndex = 1001;
	wrapper.style.pointerEvents = 'none';

	const btn = document.createElement('button');
	btn.id = tabContentId + '-fullscreen-btn';
	btn.className = 'fullscreen-btn improved';
	btn.title = 'Toggle Full Screen';
	btn.innerHTML = '<span class="fullscreen-icon">⛶</span>';
	btn.style.pointerEvents = 'auto';

	btn.onclick = (e) => {
		e.stopPropagation();
		const activeContent = getActiveTabContent();
		if (!activeContent) return;
		if (!document.fullscreenElement) {
			activeContent.requestFullscreen();
			btn.title = 'Exit Full Screen';
			btn.querySelector('.fullscreen-icon').textContent = '🗗';
			addExitFullscreenOverlay(activeContent);
		} else {
			document.exitFullscreen();
			btn.title = 'Toggle Full Screen';
			btn.querySelector('.fullscreen-icon').textContent = '⛶';
			removeExitFullscreenOverlay(activeContent);
		}
	};

	document.addEventListener('fullscreenchange', () => {
		if (!document.fullscreenElement) {
			btn.title = 'Toggle Full Screen';
			btn.querySelector('.fullscreen-icon').textContent = '⛶';
			const activeContent = getActiveTabContent();
			if (activeContent) removeExitFullscreenOverlay(activeContent);
		}
	});

	wrapper.appendChild(btn);
	const parent = container.parentElement;
	if (parent) {
		parent.style.position = 'relative';
		parent.appendChild(wrapper);
	}
}

function addExitFullscreenOverlay(container) {
	if (container.querySelector('.exit-fullscreen-overlay')) return;
	const overlay = document.createElement('button');
	overlay.className = 'exit-fullscreen-overlay';
	overlay.innerHTML = 'Exit Fullscreen';
	overlay.style.position = 'fixed';
	overlay.style.top = '24px';
	overlay.style.right = '24px';
	overlay.style.zIndex = 10002;
	overlay.style.padding = '10px 18px';
	overlay.style.background = 'rgba(30,34,54,0.92)';
	overlay.style.color = '#fff';
	overlay.style.border = 'none';
	overlay.style.borderRadius = '24px';
	overlay.style.fontSize = '1.1rem';
	overlay.style.cursor = 'pointer';
	overlay.style.boxShadow = '0 2px 12px rgb(0 0 0 / 18%)';
	overlay.style.setProperty('width', 'auto', 'important');
	overlay.style.setProperty('height', 'auto', 'important');
	overlay.style.minWidth = 'unset';
	overlay.style.minHeight = 'unset';
	overlay.style.display = 'inline-block';
	overlay.style.pointerEvents = 'auto';
	overlay.onclick = (e) => {
		e.stopPropagation();
		document.exitFullscreen();
	};
	container.appendChild(overlay);
}

function removeExitFullscreenOverlay(container) {
	const overlay = container.querySelector('.exit-fullscreen-overlay');
	if (overlay) overlay.remove();
}

window.addEventListener('fullscreenchange', () => {
	const activeContent = getActiveTabContent && getActiveTabContent();
	if (document.fullscreenElement) {
		if (activeContent) addExitFullscreenOverlay(activeContent);
	} else {
		if (activeContent) removeExitFullscreenOverlay(activeContent);
	}
});

window.addEventListener('keydown', (e) => {
	if (e.key === 'F11') {
		e.preventDefault();
		const activeContent = getActiveTabContent && getActiveTabContent();
		if (activeContent) {
			if (!document.fullscreenElement) {
				activeContent.requestFullscreen();
				addExitFullscreenOverlay(activeContent);
			} else {
				document.exitFullscreen();
				removeExitFullscreenOverlay(activeContent);
			}
		}
	}
	if (e.key === 'Escape') {
		e.preventDefault();
		// Always try to exit browser fullscreen first
		if (document.fullscreenElement && document.hasFocus()) {
			document.exitFullscreen().catch(() => {});
		} else {
			// If not in browser fullscreen, check for tab pseudo-fullscreen
			const tabContents = document.querySelectorAll('.tab-content');
			let exited = false;
			for (const el of tabContents) {
				if (el.classList.contains('fullscreen')) {
					el.classList.remove('fullscreen');
					removeExitFullscreenOverlay(el);
					exited = true;
				}
			}
			// If nothing exited, try to exit Electron's native fullscreen
			if (!exited && window.electronAPI && typeof window.electronAPI.setFullScreen === 'function') {
				window.electronAPI.setFullScreen(false);
			}
		}
	}
});

window.addEventListener('DOMContentLoaded', () => {
	['content-data', 'content-chart', 'content-map', 'content-summary', 'content-altfit'].forEach(addFullScreenButton);
});

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
		{
			id: 'tab-altfit',
			content: 'content-altfit',
			handler: () => {
				if (document.getElementById('tab-altfit').classList.contains('active')) return;
				toggleTabVisibility('content-altfit');
				setActiveTab('tab-altfit');
				// Dynamically set iframe src when tab is activated
				const iframe = document.getElementById('altfit-iframe');
				if (iframe && !iframe.src.includes('libs/ffv/index.html')) {
					iframe.src = 'libs/ffv/index.html';
				}
			},
		},
	];

	// Refactor tabConfig.forEach to use a reusable function
	function setupTabButton(id, handler) {
		const btn = document.getElementById(id);
		if (btn) btn.onclick = handler;
	}
	tabConfig.forEach(({ id, handler }) => setupTabButton(id, handler));

	// After tabConfig.forEach
	// Ensure iframe src is cleared when switching away from altfit tab
	const allTabButtons = document.querySelectorAll('.tab-button');
	allTabButtons.forEach((btn) => {
		btn.addEventListener('click', () => {
			if (btn.id !== 'tab-altfit') {
				const iframe = document.getElementById('altfit-iframe');
				if (iframe) iframe.src = '';
			}
		});
	});

	// Alt FIT Reader logic
	const altFitBtn = document.getElementById('altfit-open-btn');
	if (altFitBtn) {
		altFitBtn.onclick = async () => {
			const lib = document.getElementById('fit-lib-select').value;
			const decrypt = document.getElementById('fit-decrypt-select').value;
			const resultDiv = document.getElementById('altfit-result');
			resultDiv.innerHTML = '';
			try {
				// Placeholder: open file dialog and parse using selected lib/method
				if (!window.electronAPI || !window.electronAPI.openFileDialog) {
					resultDiv.innerHTML = '<span style="color:red">Electron API not available.</span>';
					return;
				}
				const file = await window.electronAPI.openFileDialog();
				if (!file) return;
				let arrayBuffer = await window.electronAPI.readFile(file);
				let result;
				if (lib === 'default') {
					result = await window.electronAPI.parseFitFile(arrayBuffer, { decrypt });
				} else {
					// Placeholder for alternative library logic
					result = { error: 'Alternative FIT library not implemented yet.' };
				}
				if (result && result.error) {
					resultDiv.innerHTML = `<span style='color:red'>Error: ${result.error}</span>`;
				} else {
					resultDiv.innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
				}
			} catch (err) {
				resultDiv.innerHTML = `<span style='color:red'>Error: ${err}</span>`;
			}
		};
	}

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
