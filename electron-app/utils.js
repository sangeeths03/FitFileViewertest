'use strict';

// utils.js - Utility exports for FitFileViewer Electron app
/**
 * Exposes utility functions globally for use in index.html and other scripts.
 *
 * Note: Exposing utilities globally is generally discouraged in modern JavaScript development
 * due to potential namespace pollution and security risks. In Electron apps, this can make
 * the application vulnerable to cross-site scripting (XSS) attacks if untrusted content is
 * loaded. This approach is used here to simplify integration with the Electron app's renderer
 * process, where direct access to these utilities is required in inline scripts.
 *
 * @global
 * @namespace utils
 */

// Import utility functions
import { formatDistance } from './utils/formatDistance.js';
import { formatDuration } from './utils/formatDuration.js';
import { patchSummaryFields } from './utils/patchSummaryFields.js';
import { displayTables } from './utils/displayTables.js';
import { renderTable } from './utils/renderTable.js';
import { copyTableAsCSV } from './utils/copyTableAsCSV.js';
import { renderChart } from './utils/renderChart.js';
import { renderMap } from './utils/renderMap.js';
import { renderSummary } from './utils/renderSummary.js';
import { setActiveTab } from './utils/setActiveTab.js';
import { toggleTabVisibility } from './utils/toggleTabVisibility.js';
import { showFitData } from './utils/showFitData.js';
import { applyTheme, loadTheme, listenForThemeChange } from './utils/theme.js';
import { showNotification, setLoading } from './utils/rendererUtils.js';
import { formatArray } from './utils/formatUtils.js';

// List of utilities to expose globally
const utils = {
	formatDistance,
	formatDuration,
	patchSummaryFields,
	displayTables,
	renderTable,
	copyTableAsCSV,
	renderChart,
	renderMap,
	renderSummary,
	setActiveTab,
	toggleTabVisibility,
	showFitData,
	applyTheme,
	loadTheme,
	listenForThemeChange,
	showNotification,
	setLoading,
	formatArray,
};

// Attach all utilities to window for global access
for (const [key, fn] of Object.entries(utils)) {
	window[key] = fn;
}
