import { renderTable } from './renderTable.js';

/**
 * Renders all data tables from the provided dataFrames object into the specified container.
 *
 * - Uses Arquero (window.aq) to convert arrays to tables.
 * - Renders each table using renderTable().
 * - 'recordMesgs' is always rendered first, then other tables alphabetically.
 *
 * @param {Object} dataFrames - An object where each key is a table name and the value is an array of row objects.
 * @param {HTMLElement} [containerOverride] - Optional container element to render tables into. Defaults to element with id 'content-data'.
 */
export function displayTables(dataFrames, containerOverride) {
	console.log('[DEBUG] displayTables called', dataFrames);

	const aq = window.aq;
	if (!aq) {
		console.error('[ERROR] Arquero (window.aq) is not available.');
		return;
	}

	const container =
		containerOverride || document.getElementById('content-data');
	if (!container) {
		console.error(
			'[ERROR] Container element with id "content-data" not found.',
		);
		return;
	}

	container.innerHTML = '';
	const keys = Object.keys(dataFrames).filter((key) =>
		Array.isArray(dataFrames[key]),
	);
	console.log('[DEBUG] Table keys:', keys);

	// Debug: print first row of each table
	keys.forEach((key) => {
		const rows = dataFrames[key];
		if (rows && rows.length > 0) {
			console.log(`[DEBUG] First row for ${key}:`, rows[0], 'Type:', typeof rows[0]);
		}
	});

	// Sort keys so 'recordMesgs' appears first, then alphabetically
	keys.sort((a, b) => {
		if (a === 'recordMesgs') return -1;
		if (b === 'recordMesgs') return 1;
		return a.localeCompare(b);
	});

	keys.forEach((key, index) => {
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
