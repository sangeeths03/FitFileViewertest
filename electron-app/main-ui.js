let globalData = null; // will hold all data received from the extension

// Add this function for Electron usage
window.showFitData = function (data, filePath) {
	globalData = data;
	if (filePath) {
		// Show just the filename, not the full path
		const fileName = filePath.split(/[/\\]/).pop();
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
		window.renderChart();
	}
	if (tabMap && tabMap.classList.contains('active')) {
		window.renderMap();
	}
	if (tabSummary && tabSummary.classList.contains('active')) {
		window.renderSummary(globalData);
	}
};

window.onload = () => {
	// Signal to the extension that the webview is ready (only if available)
	if (typeof acquireVsCodeApi === 'function') {
		const vscode = acquireVsCodeApi();
		vscode.postMessage({ type: 'ready' });
	} else {
		console.warn(
			'acquireVsCodeApi is not available. Ensure this is running in a VS Code environment.',
		);
	}

	// Default: show the Map tab
	document.getElementById('content-data').style.display = 'none';
	document.getElementById('content-chart').style.display = 'none';
	document.getElementById('content-map').style.display = 'block';
	document.getElementById('content-summary').style.display = 'none';

	// Tab button click handlers
	document.getElementById('tab-data').onclick = () => {
		document.getElementById('content-data').style.display = 'block';
		document.getElementById('content-chart').style.display = 'none';
		document.getElementById('content-map').style.display = 'none';
		document.getElementById('content-summary').style.display = 'none';
		setActiveTab('tab-data');
		if (globalData) {
			window.displayTables(globalData);
		}
	};

	document.getElementById('tab-chart').onclick = () => {
		document.getElementById('content-data').style.display = 'none';
		document.getElementById('content-chart').style.display = 'block';
		document.getElementById('content-map').style.display = 'none';
		document.getElementById('content-summary').style.display = 'none';
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
		document.getElementById('content-data').style.display = 'none';
		document.getElementById('content-chart').style.display = 'none';
		document.getElementById('content-map').style.display = 'none';
		document.getElementById('content-summary').style.display = 'block';
		setActiveTab('tab-summary');
		if (globalData) {
			renderSummary(globalData);
		}
	};

	function setActiveTab(tabId) {
		document.querySelectorAll('.tab-button').forEach((btn) => {
			btn.classList.remove('active');
		});
		document.getElementById(tabId).classList.add('active');
	}

	// Listen for fitData message from the extension
	window.addEventListener('message', (event) => {
		const message = event.data;
		if (message && typeof message === 'object' && message.type === 'fitData') {
			globalData = message.data;
			setTimeout(() => {
				displayTables(globalData);
				if (document.getElementById('tab-chart').classList.contains('active')) {
					renderChart();
				}
				if (document.getElementById('tab-map').classList.contains('active')) {
					renderMap();
				}
				if (
					document.getElementById('tab-summary').classList.contains('active')
				) {
					renderSummary(globalData);
				}
			}, 0);
		}
	});
};
