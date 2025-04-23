import { patchSummaryFields } from './patchSummaryFields.js';
import { formatDistance } from './formatDistance.js';
import { formatDuration } from './formatDuration.js';

/**
 * Renders a summary of activity data, including main summary and lap summary tables,
 * into the DOM element with id 'content-summary'. Provides "Copy as CSV" buttons for both tables.
 *
 * The summary is generated from either `sessionMesgs` or `recordMesgs` in the input data.
 * If lap data is available (`lapMesgs`), lap rows are appended to the same table.
 *
 * @param {Object} data - The activity data object.
 * @param {Array<Object>} [data.sessionMesgs] - Array of session message objects (optional).
 * @param {Array<Object>} [data.recordMesgs] - Array of record message objects (optional).
 * @param {Array<Object>} [data.lapMesgs] - Array of lap message objects (optional).
 *
 * @example
 * renderSummary({
 *   sessionMesgs: [{ total_ascent: 100, total_descent: 80, ... }],
 *   recordMesgs: [{ timestamp: 123, distance: 1000, speed: 2.5, ... }, ...],
 *   lapMesgs: [{ lap_index: 1, total_time: 300, ... }, ...]
 * });
 */
export function renderSummary(data) {
	const container = document.getElementById('content-summary');
	container.innerHTML = '';
	let summaryRows = [];
	// Main summary table logic
	if (data.sessionMesgs && data.sessionMesgs.length > 0) {
		const raw = { ...data.sessionMesgs[0] };
		patchSummaryFields(raw);
		if (raw.total_ascent != null && !isNaN(raw.total_ascent)) {
			raw.total_ascent_ft = (raw.total_ascent * 3.28084).toFixed(0) + ' ft';
		}
		if (raw.total_descent != null) {
			raw.total_descent_ft = (raw.total_descent * 3.28084).toFixed(0) + ' ft';
		}
		summaryRows = [raw];
	} else if (data.recordMesgs && data.recordMesgs.length > 0) {
		const aq = window.aq;
		const table = aq.from(data.recordMesgs);
		const stats = {
			total_records: table.numRows(),
			start_time: table.get(0, 'timestamp'),
			end_time: table.get(table.numRows() - 1, 'timestamp'),
		};
		if (table.columnNames().includes('distance')) {
			const dist = table.get(table.numRows() - 1, 'distance');
			stats.total_distance = formatDistance(dist);
		}
		if (table.columnNames().includes('timestamp')) {
			const start = new Date(table.get(0, 'timestamp'));
			const end = new Date(table.get(table.numRows() - 1, 'timestamp'));
			const sec = Math.round((end - start) / 1000);
			stats.duration = formatDuration(sec);
		}
		if (table.columnNames().includes('speed')) {
			const avg =
				table.array('speed').reduce((a, b) => a + b, 0) / table.numRows();
			const max = Math.max(...table.array('speed'));
			stats.avg_speed =
				(avg * 3.6).toFixed(2) +
				' km/h / ' +
				(avg * 2.23694).toFixed(2) +
				' mph';
			stats.max_speed =
				(max * 3.6).toFixed(2) +
				' km/h / ' +
				(max * 2.23694).toFixed(2) +
				' mph';
		}
		if (table.columnNames().includes('altitude')) {
			const min = Math.min(...table.array('altitude'));
			const max = Math.max(...table.array('altitude'));
			stats.min_altitude_ft = (min * 3.28084).toFixed(0) + ' ft';
			stats.max_altitude_ft = (max * 3.28084).toFixed(0) + ' ft';
		}
		patchSummaryFields(stats);
		summaryRows = [stats];
	} else {
		container.innerHTML = '<p>No summary data available.</p>';
		return;
	}
	// Remove summary columns with no data, all zero values, or NaN
	if (summaryRows.length > 0) {
		const keys = Object.keys(summaryRows[0]);
		const filteredKeys = keys.filter((key) => {
			const val = summaryRows[0][key];
			// Remove if null, undefined, empty string, strictly 0, or NaN
			return (
				val !== null &&
				val !== undefined &&
				val !== '' &&
				!(
					(typeof val === 'number' && val === 0) ||
					(typeof val === 'string' &&
						/^(0+(\.0+)?|0*\.\d*0+)$/.test(val.trim()))
				) &&
				!(typeof val === 'number' && isNaN(val))
			);
		});
		summaryRows[0] = Object.fromEntries(
			filteredKeys.map((k) => [k, summaryRows[0][k]]),
		);
	}

	function getStorageKey() {
		let fpath = '';
		if (window?.globalData?.cachedFilePath) {
			fpath = window.globalData.cachedFilePath;
		} else if (data?.cachedFilePath) {
			fpath = data.cachedFilePath;
		} else if (window?.activeFitFileName) {
			fpath = window.activeFitFileName;
		}
		if (fpath) {
			return `summaryColSel_${encodeURIComponent(fpath)}`;
		}
		return 'summaryColSel_default';
	}
	let allKeys = Object.keys(summaryRows[0]);
	if (data.sessionMesgs && data.sessionMesgs.length > 0) {
		data.sessionMesgs.forEach(row => {
			Object.keys(row).forEach(k => { if (!allKeys.includes(k)) allKeys.push(k); });
		});
	} else if (data.recordMesgs && data.recordMesgs.length > 0) {
		data.recordMesgs.forEach(row => {
			Object.keys(row).forEach(k => { if (!allKeys.includes(k)) allKeys.push(k); });
		});
	}
	function saveColPrefs() {
		try {
			localStorage.setItem(getStorageKey(), JSON.stringify(visibleColumns));
		} catch (e) {}
	}
	function loadColPrefs() {
		try {
			const v = localStorage.getItem(getStorageKey());
			if (v) {
				const arr = JSON.parse(v);
				if (Array.isArray(arr) && arr.length > 0) {
					return arr;
				}
			}
		} catch (e) {}
		return null;
	}
	let visibleColumns = loadColPrefs() || allKeys.slice();

	// Add label column (always visible, not user-hideable)
	const LABEL_COL = '__row_label__';
	function getRowLabel(rowIdx, isLap) {
		if (isLap) return `Lap ${rowIdx + 1}`;
		return 'Summary';
	}
	// Filtering state
	let filterValue = 'All';

	function renderTable() {
		let section = container.querySelector('.summary-section');
		if (!section) {
			section = document.createElement('div');
			section.classList.add('summary-section');
			container.appendChild(section);
		}
		section.innerHTML = '';
		// Filter dropdown
		const filterBar = document.createElement('div');
		filterBar.className = 'summary-filter-bar';
		const filterLabel = document.createElement('label');
		filterLabel.textContent = 'Show: ';
		const filterSelect = document.createElement('select');
		filterSelect.innerHTML = '<option value="All">All</option><option value="Summary">Summary</option>';
		if (data.lapMesgs && data.lapMesgs.length > 0) {
			for (let i = 0; i < data.lapMesgs.length; ++i) {
				filterSelect.innerHTML += `<option value="Lap ${i+1}">Lap ${i+1}</option>`;
			}
		}
		filterSelect.value = filterValue;
		filterSelect.onchange = (e) => {
			filterValue = filterSelect.value;
			renderTable();
		};
		filterLabel.appendChild(filterSelect);
		filterBar.appendChild(filterLabel);
		section.appendChild(filterBar);

		const headerBar = document.createElement('div');
		headerBar.className = 'header-bar';
		headerBar.style.position = 'relative';
		headerBar.appendChild(gearBtn);
		const title = document.createElement('h3');
		title.textContent = 'Activity Summary';
		title.classList.add('summary-title');
		headerBar.appendChild(title);
		const copyBtn = document.createElement('button');
		copyBtn.textContent = 'Copy as CSV';
		copyBtn.className = 'copy-btn';
		copyBtn.onclick = () => {
			const rows = [];
			const sortedVisible = [LABEL_COL, ...allKeys.filter(k => visibleColumns.includes(k))];
			rows.push(sortedVisible.map(k => k === LABEL_COL ? 'Type' : k).join(','));
			// Summary row
			if (filterValue === 'All' || filterValue === 'Summary') {
				rows.push(sortedVisible.map(k => k === LABEL_COL ? 'Summary' : (summaryRows[0][k] !== undefined ? summaryRows[0][k] : '')).join(','));
			}
			// Lap rows
			if (data.lapMesgs && data.lapMesgs.length > 0 && (filterValue === 'All' || filterValue.startsWith('Lap'))) {
				const patchedLaps = data.lapMesgs.map((lap) => {
					const patched = { ...lap };
					patchSummaryFields(patched);
					return patched;
				});
				patchedLaps.forEach((lap, i) => {
					if (filterValue === 'All' || filterValue === `Lap ${i+1}`) {
						rows.push(sortedVisible.map(k => k === LABEL_COL ? `Lap ${i+1}` : (lap[k] !== undefined ? lap[k] : '')).join(','));
					}
				});
			}
			navigator.clipboard.writeText(rows.join('\n'));
		};
		headerBar.appendChild(copyBtn);
		headerBar.style.display = 'flex';
		headerBar.style.alignItems = 'center';
		headerBar.style.gap = '10px';
		section.appendChild(headerBar);

		const table = document.createElement('table');
		table.classList.add('display');
		const thead = document.createElement('thead');
		const tbody = document.createElement('tbody');
		const sortedVisible = [LABEL_COL, ...allKeys.filter(k => visibleColumns.includes(k))];
		const headerRow = document.createElement('tr');
		sortedVisible.forEach((key) => {
			const th = document.createElement('th');
			th.textContent = key === LABEL_COL ? 'Type' : key;
			headerRow.appendChild(th);
		});
		thead.appendChild(headerRow);
		// Summary row
		if (filterValue === 'All' || filterValue === 'Summary') {
			const summaryRow = document.createElement('tr');
			sortedVisible.forEach((key, idx) => {
				const td = document.createElement('td');
				td.textContent = key === LABEL_COL ? 'Summary' : (summaryRows[0][key] !== undefined ? summaryRows[0][key] : '');
				if (idx === 0) td.classList.add('summary-row');
				summaryRow.appendChild(td);
			});
			tbody.appendChild(summaryRow);
		}
		// Lap rows
		if (data.lapMesgs && data.lapMesgs.length > 0 && (filterValue === 'All' || filterValue.startsWith('Lap'))) {
			const patchedLaps = data.lapMesgs.map((lap) => {
				const patched = { ...lap };
				patchSummaryFields(patched);
				return patched;
			});
			patchedLaps.forEach((lap, i) => {
				if (filterValue === 'All' || filterValue === `Lap ${i+1}`) {
					const lapRow = document.createElement('tr');
					sortedVisible.forEach((key, idx) => {
						const td = document.createElement('td');
						td.textContent = key === LABEL_COL ? `Lap ${i+1}` : (lap[key] !== undefined ? lap[key] : '');
						lapRow.appendChild(td);
					});
					tbody.appendChild(lapRow);
				}
			});
		}
		table.appendChild(thead);
		table.appendChild(tbody);
		section.appendChild(table);
	}

	function showColModal() {
		// Remove any existing modal
		const old = document.querySelector('.summary-col-modal-overlay');
		if (old) old.remove();
		const overlay = document.createElement('div');
		overlay.className = 'summary-col-modal-overlay';
		const modal = document.createElement('div');
		modal.className = 'summary-col-modal';
		const title = document.createElement('h2');
		title.textContent = 'Select Summary Columns';
		modal.appendChild(title);
		// Select/Deselect All
		const selectAllBtn = document.createElement('button');
		selectAllBtn.className = 'select-all-btn themed-btn';
		selectAllBtn.textContent = visibleColumns.length === allKeys.length ? 'Deselect All' : 'Select All';
		selectAllBtn.onclick = () => {
			if (visibleColumns.length === allKeys.length) {
				visibleColumns = [];
			} else {
				visibleColumns = allKeys.slice();
			}
			updateColList();
			renderTable();
			saveColPrefs();
		};
		modal.appendChild(selectAllBtn);
		// Column list
		const colList = document.createElement('div');
		colList.className = 'col-list';
		modal.appendChild(colList);
		let lastCheckedIndex = null;
		function updateColList() {
			colList.innerHTML = '';
			// Always show label column as checked and disabled
			const label = document.createElement('label');
			const cb = document.createElement('input');
			cb.type = 'checkbox';
			cb.checked = true;
			cb.disabled = true;
			label.appendChild(cb);
			label.appendChild(document.createTextNode('Type'));
			colList.appendChild(label);
			allKeys.forEach((key, idx) => {
				const label = document.createElement('label');
				const cb = document.createElement('input');
				cb.type = 'checkbox';
				cb.checked = visibleColumns.includes(key);
				cb.tabIndex = 0;
				cb.onmousedown = (e) => {
					if (e.shiftKey && lastCheckedIndex !== null) {
						e.preventDefault();
						const start = Math.min(lastCheckedIndex, idx);
						const end = Math.max(lastCheckedIndex, idx);
						const shouldCheck = !visibleColumns.includes(key);
						for (let i = start; i <= end; ++i) {
							const k = allKeys[i];
							if (shouldCheck && !visibleColumns.includes(k)) visibleColumns.push(k);
							if (!shouldCheck && visibleColumns.includes(k)) visibleColumns = visibleColumns.filter(x => x !== k);
						}
						// Sort visibleColumns to match allKeys order
						visibleColumns = allKeys.filter(k => visibleColumns.includes(k));
						updateColList();
						renderTable();
						saveColPrefs();
					}
				};
				cb.onchange = (e) => {
					if (e.shiftKey && lastCheckedIndex !== null) return; // handled in onmousedown
					lastCheckedIndex = idx;
					if (cb.checked) {
						if (!visibleColumns.includes(key)) visibleColumns.push(key);
					} else {
						visibleColumns = visibleColumns.filter((k) => k !== key);
					}
					// Sort visibleColumns to match allKeys order
					visibleColumns = allKeys.filter(k => visibleColumns.includes(k));
					selectAllBtn.textContent = visibleColumns.length === allKeys.length ? 'Deselect All' : 'Select All';
					renderTable();
					saveColPrefs();
				};
				label.appendChild(cb);
				label.appendChild(document.createTextNode(key));
				colList.appendChild(label);
			});
			selectAllBtn.textContent = visibleColumns.length === allKeys.length ? 'Deselect All' : 'Select All';
		}
		updateColList();
		// Actions
		const actions = document.createElement('div');
		actions.className = 'modal-actions';
		const cancelBtn = document.createElement('button');
		cancelBtn.className = 'themed-btn';
		cancelBtn.textContent = 'Cancel';
		cancelBtn.onclick = () => overlay.remove();
		const okBtn = document.createElement('button');
		okBtn.className = 'themed-btn';
		okBtn.textContent = 'OK';
		okBtn.onclick = () => {
			overlay.remove();
			renderTable();
			saveColPrefs();
		};
		actions.appendChild(cancelBtn);
		actions.appendChild(okBtn);
		modal.appendChild(actions);
		overlay.appendChild(modal);
		document.body.appendChild(overlay);
	}

	const gearBtn = document.createElement('button');
	gearBtn.className = 'summary-gear-btn';
	gearBtn.title = 'Select columns';
	gearBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M19.4 13.5c.04-.5.06-1 .06-1.5s-.02-1-.06-1.5l1.7-1.3a.5.5 0 0 0 .12-.64l-1.6-2.8a.5.5 0 0 0-.6-.22l-2 .8a7.03 7.03 0 0 0-1.3-.76l-.3-2.1A.5.5 0 0 0 14 2h-4a.5.5 0 0 0-.5.42l-.3 2.1c-.46.2-.9.46-1.3.76l-2-.8a.5.5 0 0 0-.6.22l-1.6 2.8a.5.5 0 0 0 .12.64l1.7 1.3c-.04.5-.06 1-.06 1.5s.02 1 .06 1.5l-1.7 1.3a.5.5 0 0 0-.12.64l-1.6 2.8a.5.5 0 0 0 .6.22l2-.8c.4.3.84.56 1.3.76l.3 2.1A.5.5 0 0 0 10 22h4a.5.5 0 0 0 .5-.42l.3-2.1c.46-.2.9-.46 1.3-.76l2 .8a.5.5 0 0 0 .6-.22l1.6-2.8a.5.5 0 0 0-.12-.64l-1.7-1.3z" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>`;
	gearBtn.onclick = (e) => {
		e.stopPropagation();
		showColModal();
	};

	renderTable();
}
