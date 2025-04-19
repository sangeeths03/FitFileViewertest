import { renderTable } from './renderTable.js';

export function displayTables(dataFrames, containerOverride) {
	console.log('[DEBUG] displayTables called', dataFrames);

	const aq = window.aq;
	if (!aq) {
		console.error('[ERROR] Arquero (window.aq) is not available.');
		return;
	}

	const container = containerOverride || document.getElementById('content-data');
	if (!container) {
		console.error('[ERROR] Container element with id "content-data" not found.');
		return;
	}

	container.innerHTML = '';
	const keys = Object.keys(dataFrames).filter(
		key => Array.isArray(dataFrames[key])
	);
	console.log('[DEBUG] Table keys:', keys);

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
