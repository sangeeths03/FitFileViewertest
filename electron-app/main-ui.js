// This file is part of the Electron app that interacts with the main process and the UI.
import { displayTables } from './utils/displayTables.js';
import { renderChart } from './utils/renderChart.js';
import { renderMap } from './utils/renderMap.js';
import { renderSummary } from './utils/renderSummary.js';
import { setActiveTab } from './utils/setActiveTab.js';
import { toggleTabVisibility } from './utils/toggleTabVisibility.js';
import { applyTheme, loadTheme, listenForThemeChange } from './utils/theme.js';
import { showFitData } from './utils/showFitData.js';
import { arrayBufferToBase64 } from './utils/arrayBufferToBase64.js';
import { getActiveTabContent } from './utils/getActiveTabContent.js';
import { setupTabButton } from './utils/setupTabButton.js';
import { setupFullscreenListeners, setupDOMContentLoaded } from './utils/addFullScreenButton.js';
import { setupWindowOnload } from './utils/setupWindow.js';

const screenfull = window.screenfull;

window.globalData = window.globalData || null; // will hold all data received from the extension

window.showFitData = showFitData;

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

// Unload file when the red X is clicked
const unloadBtn = document.getElementById('unloadFileBtn');
if (unloadBtn) {
	unloadBtn.onclick = () => {
		window.globalData = {};
		const fileSpan = document.getElementById('activeFileName');
		if (fileSpan) {
			fileSpan.textContent = '';
			fileSpan.title = '';
			fileSpan.classList.remove('marquee');
		}
		const fileNameContainer = document.getElementById('activeFileNameContainer');
		if (fileNameContainer) {
			fileNameContainer.classList.remove('has-file');
		}
		unloadBtn.style.display = 'none';
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
	};
}

// --- Enhanced Drag and Drop UI and Global Handling ---
(function() {
  const dropOverlay = document.getElementById('drop-overlay');
  let dragCounter = 0;

  function showDropOverlay() {
    if (dropOverlay) dropOverlay.style.display = 'flex';
    const iframe = document.getElementById('altfit-iframe');
    if (iframe) iframe.style.pointerEvents = 'none';
  }
  function hideDropOverlay() {
    if (dropOverlay) dropOverlay.style.display = 'none';
    const iframe = document.getElementById('altfit-iframe');
    if (iframe) iframe.style.pointerEvents = '';
  }

  // Show overlay on dragenter, hide on dragleave/drop
  window.addEventListener('dragenter', (e) => {
    dragCounter++;
    showDropOverlay();
  });
  window.addEventListener('dragleave', (e) => {
    dragCounter--;
    if (dragCounter <= 0) {
      hideDropOverlay();
      dragCounter = 0;
    }
  });
  window.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    showDropOverlay();
  });
  window.addEventListener('drop', (e) => {
    dragCounter = 0;
    hideDropOverlay();
    e.preventDefault();
    if (!e.dataTransfer || !e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    const file = e.dataTransfer.files[0];
    if (file && file.name.toLowerCase().endsWith('.fit')) {
      const reader = new FileReader();
      reader.onload = async function(event) {
        const arrayBuffer = event.target.result;
        if (arrayBuffer) {
          const fitData = await window.electronAPI.decodeFitFile(arrayBuffer);
          if (fitData && !fitData.error) {
            showFitData(fitData, file.name);
            window.sendFitFileToAltFitReader(arrayBuffer);
          } else {
            alert('Failed to parse FIT file: ' + (fitData.error || 'Unknown error'));
          }
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert('Please drop a .fit file.');
    }
  });

  // Prevent iframe from blocking drag/drop events
  const iframe = document.getElementById('altfit-iframe');
  if (iframe) {
    iframe.addEventListener('dragover', (e) => {
      e.preventDefault();
      showDropOverlay();
    });
    iframe.addEventListener('drop', (e) => {
      e.preventDefault();
      hideDropOverlay();
    });
  }
})();

// Move event listener setup to utility functions
setupFullscreenListeners();
setupDOMContentLoaded();
setupWindowOnload({
  toggleTabVisibility,
  setActiveTab,
  setupTabButton,
  displayTables,
  renderChart,
  renderMap,
  renderSummary,
  getActiveTabContent,
  arrayBufferToBase64,
  showFitData
});
