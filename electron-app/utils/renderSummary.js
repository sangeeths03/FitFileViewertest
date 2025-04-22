import { patchSummaryFields } from './patchSummaryFields.js';
import { formatDistance } from './formatDistance.js';
import { formatDuration } from './formatDuration.js';

/**
 * Renders a summary of activity data, including main summary and lap summary tables,
 * into the DOM element with id 'content-summary'. Provides "Copy as CSV" buttons for both tables.
 *
 * The summary is generated from either `sessionMesgs` or `recordMesgs` in the input data.
 * If lap data is available (`lapMesgs`), a lap summary table is also rendered.
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

	// --- Column Selector State ---
	function getStorageKey() {
		// Use the full file path if available, fallback to file name, fallback to 'default'
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
	// Scan all sessionMesgs/recordMesgs for all possible keys
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
					// Only filter out keys that are truly not present in any file ever selected by the user
					return arr;
				}
			}
		} catch (e) {}
		return null;
	}
	// Always reload visibleColumns from storage for the current file
	let visibleColumns = loadColPrefs() || allKeys.slice();

	// --- Modal Popup for Column Selection ---
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

	// --- Gear Icon Button ---
	const gearBtn = document.createElement('button');
	gearBtn.className = 'summary-gear-btn';
	gearBtn.title = 'Select columns';
	gearBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M19.4 13.5c.04-.5.06-1 .06-1.5s-.02-1-.06-1.5l1.7-1.3a.5.5 0 0 0 .12-.64l-1.6-2.8a.5.5 0 0 0-.6-.22l-2 .8a7.03 7.03 0 0 0-1.3-.76l-.3-2.1A.5.5 0 0 0 14 2h-4a.5.5 0 0 0-.5.42l-.3 2.1c-.46.2-.9.46-1.3.76l-2-.8a.5.5 0 0 0-.6.22l-1.6 2.8a.5.5 0 0 0 .12.64l1.7 1.3c-.04.5-.06 1-.06 1.5s.02 1 .06 1.5l-1.7 1.3a.5.5 0 0 0-.12.64l1.6 2.8a.5.5 0 0 0 .6.22l2-.8c.4.3.84.56 1.3.76l.3 2.1A.5.5 0 0 0 10 22h4a.5.5 0 0 0 .5-.42l.3-2.1c.46-.2.9-.46 1.3-.76l2 .8a.5.5 0 0 0 .6-.22l1.6-2.8a.5.5 0 0 0-.12-.64l-1.7-1.3z" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>`;
	gearBtn.onclick = (e) => {
		e.stopPropagation();
		showColModal();
	};

	// --- Sync Lap Table Column Widths ---
	function syncLapTableColWidths(summaryTable, lapTable) {
		const summaryCols = summaryTable.querySelectorAll('thead th');
		let colgroup = lapTable.querySelector('colgroup');
		if (!colgroup) {
			colgroup = document.createElement('colgroup');
			lapTable.insertBefore(colgroup, lapTable.firstChild);
		}
		colgroup.innerHTML = '';
		summaryCols.forEach((th) => {
			const width = th.offsetWidth;
			const col = document.createElement('col');
			if (width > 0) col.style.width = width + 'px';
			colgroup.appendChild(col);
		});
	}

	// --- Render Table with Visible Columns ---
	function renderTable() {
		table.innerHTML = '';
		const thead = document.createElement('thead');
		const tbody = document.createElement('tbody');
		const headerRow = document.createElement('tr');
		// Always use allKeys order for visibleColumns
		const sortedVisible = allKeys.filter(k => visibleColumns.includes(k));
		// Add colgroup for summary table
		let colgroup = document.createElement('colgroup');
		sortedVisible.forEach(() => {
			const col = document.createElement('col');
			colgroup.appendChild(col);
		});
		table.appendChild(colgroup);
		sortedVisible.forEach((key) => {
			const th = document.createElement('th');
			th.textContent = key;
			headerRow.appendChild(th);
		});
		thead.appendChild(headerRow);
		const dataRow = document.createElement('tr');
		sortedVisible.forEach((key) => {
			const td = document.createElement('td');
			td.textContent = summaryRows[0][key] !== undefined ? summaryRows[0][key] : '';
			dataRow.appendChild(td);
		});
		tbody.appendChild(dataRow);
		table.appendChild(thead);
		table.appendChild(tbody);

		// Update lap table live as well
		const lapSection = container.querySelector('.lap-section');
		if (lapSection) {
			lapSection.innerHTML = '';
			if (data.lapMesgs && data.lapMesgs.length > 0) {
				const patchedLaps = data.lapMesgs.map((lap) => {
					const patched = { ...lap };
					patchSummaryFields(patched);
					return patched;
				});
				const lapKeys = sortedVisible.slice();
				const lapHeaderBar = document.createElement('div');
				lapHeaderBar.className = 'header-bar';
				const lapHeading = document.createElement('h3');
				lapHeading.textContent = 'Lap Summary';
				lapHeading.classList.add('lap-title');
				lapHeaderBar.appendChild(lapHeading);
				const lapCopyBtn = document.createElement('button');
				lapCopyBtn.textContent = 'Copy as CSV';
				lapCopyBtn.className = 'copy-btn';
				lapCopyBtn.onclick = () => {
					const csvRows = [lapKeys.join(',')];
					patchedLaps.forEach((lap) => {
						const row = lapKeys.map((key) => lap[key] !== undefined ? lap[key] : '');
						csvRows.push(row.join(','));
					});
					navigator.clipboard.writeText(csvRows.join('\n'));
				};
				lapHeaderBar.appendChild(lapCopyBtn);
				lapHeaderBar.style.display = 'flex';
				lapHeaderBar.style.alignItems = 'center';
				lapHeaderBar.style.gap = '10px';
				lapSection.appendChild(lapHeaderBar);
				const lapTable = document.createElement('table');
				lapTable.classList.add('display');
				// Add colgroup for lap table (will be synced after summary table renders)
				let lapColgroup = document.createElement('colgroup');
				lapKeys.forEach(() => {
					const col = document.createElement('col');
					lapColgroup.appendChild(col);
				});
				lapTable.appendChild(lapColgroup);
				const lapThead = document.createElement('thead');
				const lapTbody = document.createElement('tbody');
				const lapHeaderRow = document.createElement('tr');
				lapKeys.forEach((key) => {
					const th = document.createElement('th');
					th.textContent = key;
					lapHeaderRow.appendChild(th);
				});
				lapThead.appendChild(lapHeaderRow);
				patchedLaps.forEach((lap) => {
					const lapRow = document.createElement('tr');
					lapKeys.forEach((key) => {
						let lapVal = lap[key] !== undefined ? String(lap[key]) : '';
						let summaryVal = summaryRows[0][key] !== undefined ? String(summaryRows[0][key]) : '';
						// Pad lap value with spaces if summary value is longer
						if (summaryVal.length > lapVal.length) {
							lapVal = lapVal.padEnd(summaryVal.length, ' ');
						}
						lapRow.appendChild(
							Object.assign(document.createElement('td'), {
								textContent: lapVal,
							}),
						);
					});
					lapTbody.appendChild(lapRow);
				});
				lapTable.appendChild(lapThead);
				lapTable.appendChild(lapTbody);
				lapSection.appendChild(lapTable);
			}
		}

		// After rendering summary table, update lap table widths
		setTimeout(() => {
			const lapSection = container.querySelector('.lap-section');
			if (lapSection) {
				const lapTable = lapSection.querySelector('table');
				if (lapTable) syncLapTableColWidths(table, lapTable);
			}
		}, 0);
	}

	// Render main summary as a table with a title and inline copy button
	const summarySection = document.createElement('div');
	summarySection.classList.add('summary-section');
	const summaryHeaderBar = document.createElement('div');
	summaryHeaderBar.className = 'header-bar';
	summaryHeaderBar.style.position = 'relative';
	summaryHeaderBar.appendChild(gearBtn); // Add gear icon to left
	const summaryTitle = document.createElement('h3');
	summaryTitle.textContent = 'Activity Summary';
	summaryTitle.classList.add('summary-title');
	summaryHeaderBar.appendChild(summaryTitle);
	const copyBtn = document.createElement('button');
	copyBtn.textContent = 'Copy as CSV';
	copyBtn.className = 'copy-btn';
	copyBtn.onclick = () => {
		if (summaryRows.length > 0) {
			const csv = [
				visibleColumns.join(',') + '\n' + visibleColumns.map((k) => summaryRows[0][k]).join(',')
			];
			const csvText = csv.join('\n');
			if (navigator.clipboard && navigator.clipboard.writeText) {
				navigator.clipboard
					.writeText(csvText)
					.then(() => console.log('Copied CSV to clipboard!'))
					.catch((err) => console.error('Failed to copy CSV:', err));
			} else {
				// Fallback mechanism
				const textarea = document.createElement('textarea');
				textarea.value = csvText;
				textarea.style.position = 'fixed'; // Prevent scrolling to the bottom
				textarea.style.opacity = '0';
				document.body.appendChild(textarea);
				textarea.focus();
				textarea.select();
				try {
					document.execCommand('copy');
					console.log('Copied CSV to clipboard using fallback!');
				} catch (err) {
					console.error('Failed to copy CSV using fallback:', err);
				}
				document.body.removeChild(textarea);
			}
		}
	};
	summaryHeaderBar.appendChild(copyBtn);
	summaryHeaderBar.style.display = 'flex';
	summaryHeaderBar.style.alignItems = 'center';
	summaryHeaderBar.style.gap = '10px';
	summarySection.appendChild(summaryHeaderBar);
	const table = document.createElement('table');
	table.classList.add('display');
	renderTable();
	summarySection.appendChild(table);
	container.appendChild(summarySection);

	// Lap summary table
	if (data.lapMesgs && data.lapMesgs.length > 0) {
		const lapSection = document.createElement('div');
		lapSection.classList.add('lap-section');
		// Patch all lap rows for human readable fields
		const patchedLaps = data.lapMesgs.map((lap) => {
			const patched = { ...lap };
			patchSummaryFields(patched);
			return patched;
		 });
		// Always show columns that are in visibleColumns, even if not present in lap data
		const lapKeys = visibleColumns.slice();
		// Copy as CSV for lap summary
		const lapHeaderBar = document.createElement('div');
		lapHeaderBar.className = 'header-bar';
		const lapHeading = document.createElement('h3');
		lapHeading.textContent = 'Lap Summary';
		lapHeading.classList.add('lap-title');
		lapHeaderBar.appendChild(lapHeading);
		const lapCopyBtn = document.createElement('button');
		lapCopyBtn.textContent = 'Copy as CSV';
		lapCopyBtn.className = 'copy-btn';
		lapCopyBtn.onclick = () => {
			const csvRows = [lapKeys.join(',')];
			patchedLaps.forEach((lap) => {
				const row = lapKeys.map((key) => lap[key] !== undefined ? lap[key] : '');
				csvRows.push(row.join(','));
			});
			navigator.clipboard.writeText(csvRows.join('\n'));
		};
		lapHeaderBar.appendChild(lapCopyBtn);
		lapHeaderBar.style.display = 'flex';
		lapHeaderBar.style.alignItems = 'center';
		lapHeaderBar.style.gap = '10px';
		lapSection.appendChild(lapHeaderBar);
		const lapTable = document.createElement('table');
		lapTable.classList.add('display');
		// Add colgroup for lap table (will be synced after summary table renders)
		let lapColgroup = document.createElement('colgroup');
		lapKeys.forEach(() => {
			const col = document.createElement('col');
			lapColgroup.appendChild(col);
		});
		lapTable.appendChild(lapColgroup);
		const lapThead = document.createElement('thead');
		const lapTbody = document.createElement('tbody');
		const lapHeaderRow = document.createElement('tr');
		lapKeys.forEach((key) => {
			const th = document.createElement('th');
			th.textContent = key;
			lapHeaderRow.appendChild(th);
		});
		lapThead.appendChild(lapHeaderRow);
		// Data rows
		patchedLaps.forEach((lap) => {
			const lapRow = document.createElement('tr');
			lapKeys.forEach((key) => {
				let lapVal = lap[key] !== undefined ? String(lap[key]) : '';
				let summaryVal = summaryRows[0][key] !== undefined ? String(summaryRows[0][key]) : '';
				// Pad lap value with spaces if summary value is longer
				if (summaryVal.length > lapVal.length) {
					lapVal = lapVal.padEnd(summaryVal.length, ' ');
				}
				lapRow.appendChild(
					Object.assign(document.createElement('td'), {
						textContent: lapVal,
					}),
				);
			});
			lapTbody.appendChild(lapRow);
		});
		lapTable.appendChild(lapThead);
		lapTable.appendChild(lapTbody);
		lapSection.appendChild(lapTable);
		container.appendChild(lapSection);
	}
}
