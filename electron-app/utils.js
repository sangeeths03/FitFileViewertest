import { formatDistance } from './utils/formatDistance.js';
import { formatDuration } from './utils/formatDuration.js';
import { patchSummaryFields } from './utils/patchSummaryFields.js';
import { displayTables } from './utils/displayTables.js';
import { renderTable } from './utils/renderTable.js';
import { copyTableAsCSV } from './utils/copyTableAsCSV.js';
import { renderChart } from './utils/renderChart.js';
import { renderMap } from './utils/renderMap.js';
import { renderSummary } from './utils/renderSummary.js';

window.renderSummary = renderSummary;

// Export for use in index.html
window.formatDistance = formatDistance;
window.formatDuration = formatDuration;
window.patchSummaryFields = patchSummaryFields;
window.displayTables = displayTables;
window.renderTable = renderTable;
window.copyTableAsCSV = copyTableAsCSV;
window.renderChart = renderChart;
window.renderMap = renderMap;
