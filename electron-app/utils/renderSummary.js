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
	// Render main summary as a table with a title and inline copy button
	const summarySection = document.createElement('div');
	summarySection.classList.add('summary-section');
	const summaryHeaderBar = document.createElement('div');
	summaryHeaderBar.className = 'header-bar';
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
				Object.keys(summaryRows[0]).join(',') +
					'\n' +
					Object.values(summaryRows[0]).join(','),
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
	const thead = document.createElement('thead');
	const tbody = document.createElement('tbody');
	const headerRow = document.createElement('tr');
	Object.keys(summaryRows[0]).forEach((key) => {
		const th = document.createElement('th');
		th.textContent = key;
		headerRow.appendChild(th);
	});
	thead.appendChild(headerRow);
	const dataRow = document.createElement('tr');
	Object.values(summaryRows[0]).forEach((val) => {
		const td = document.createElement('td');
		td.textContent = val;
		dataRow.appendChild(td);
	});
	tbody.appendChild(dataRow);
	table.appendChild(thead);
	table.appendChild(tbody);
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
		// Remove lap columns with no data (all values null/undefined/empty/0/NaN)
		const allLapKeys = Object.keys(patchedLaps[0] || {});
		const lapKeys = allLapKeys.filter((key) =>
			patchedLaps.some((lap) => {
				const val = lap[key];
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
			}),
		);
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
				const row = lapKeys.map((key) => lap[key]);
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
				lapRow.appendChild(
					Object.assign(document.createElement('td'), {
						textContent: lap[key],
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
