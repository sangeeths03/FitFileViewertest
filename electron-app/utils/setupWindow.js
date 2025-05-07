/* global acquireVsCodeApi */

export function setupWindowOnload({
	toggleTabVisibility,
	setActiveTab,
	setupTabButton,
	displayTables,
	renderChart,
	renderMap,
	renderSummary,
}) {
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
						if (window.globalData && Object.keys(window.globalData).length > 0) {
							window.displayTables(window.globalData);
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
					if (
						document.getElementById('tab-summary').classList.contains('active')
					)
						return;
					toggleTabVisibility('content-summary');
					setActiveTab('tab-summary');
					if (window.globalData && Object.keys(window.globalData).length > 0) {
						window.renderSummary(window.globalData);
					}
				},
			},
			{
				id: 'tab-altfit',
				content: 'content-altfit',
				handler: () => {
					if (
						document.getElementById('tab-altfit').classList.contains('active')
					)
						return;
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
						resultDiv.innerHTML =
							'<span style="color:red">Electron API not available.</span>';
						return;
					}
					const file = await window.electronAPI.openFileDialog();
					if (!file) return;
					let arrayBuffer = await window.electronAPI.readFile(file);
					let result;
					if (lib === 'default') {
						result = await window.electronAPI.parseFitFile(arrayBuffer, {
							decrypt,
						});
					} else {
						// Placeholder for alternative library logic
						result = { error: 'Alternative FIT library not implemented yet.' };
					}
					if (result && result.error) {
						resultDiv.innerHTML = `<span style='color:red'>Error: ${result.error}</span>`;
					} else {
						resultDiv.innerHTML = `<pre>${JSON.stringify(
							result,
							null,
							2,
						)}</pre>`;
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
				window.globalData = message.data;
				displayTables(window.globalData);
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
					renderSummary(window.globalData);
				}
			}
		});
	};
}
