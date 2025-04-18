import { renderTable } from './renderTable.js';

export function displayTables(dataFrames) {
    console.log('[DEBUG] displayTables called', dataFrames);
    const aq = window.aq;
    const container = document.getElementById('content-data');
    container.innerHTML = '';
    const keys = Object.keys(dataFrames);
    console.log('[DEBUG] Table keys:', keys);
    // Prioritize 'recordMesgs' to appear first in the sorted keys, as it is likely the main data table.
    keys.sort((a, b) => (a === 'recordMesgs' ? -1 : b === 'recordMesgs' ? 1 : 0));
    keys.forEach((key, index) => {
        // Only try to render if the value is an array (table data)
        if (!Array.isArray(dataFrames[key])) {
            return; // skip non-table keys like cachedFileName, cachedFilePath
        }
        try {
            const table = aq.from(dataFrames[key]);
            console.log(
                `[DEBUG] Rendering table for key: ${key}, rows:`,
                table.numRows(),
            );
            renderTable(container, key, table, index);
        } catch (e) {
            console.error(`[ERROR] Failed to render table for key: ${key}`, e);
        }
    });
}