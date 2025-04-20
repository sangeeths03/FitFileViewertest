/**
 * Displays FIT file data in the UI and updates relevant UI elements based on the active tab.
 *
 * - Updates the displayed file name and document title.
 * - Renders data tables, charts, maps, or summary depending on the active tab.
 * - Pre-renders data tables in the background if the data tab is not active.
 *
 * @param {Object} data - The parsed FIT file data to display.
 * @param {string} [filePath] - The full path of the FIT file, used to extract and display the file name.
 */
export function showFitData(data, filePath) {
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
	}
	if (tabMap && tabMap.classList.contains('active')) {
		if (globalData && Object.keys(globalData).length > 0) {
			window.renderMap();
		}
	}
	if (tabSummary && tabSummary.classList.contains('active')) {
		window.renderSummary(globalData);
	}
}
