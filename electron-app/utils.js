// utils.js - Utility exports for FitFileViewer Electron app
// Exposes utility functions globally for use in index.html and other scripts

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
import { showNotification } from './utils/showNotification.js';
import { getWindowState } from './windowStateUtils.js';

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
  showNotification,
  getWindowState,
};

// Attach all utilities to window for global access
for (const [key, fn] of Object.entries(utils)) {
  window[key] = fn;
}
