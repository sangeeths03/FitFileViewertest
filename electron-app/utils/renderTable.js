import { copyTableAsCSV } from './copyTableAsCSV.js';

export function renderTable(container, title, table, index) {
	const tableId = 'datatable_' + index;
	const section = document.createElement('div');
	section.classList.add('table-section');
	const header = document.createElement('div');
	header.classList.add('table-header');
	const leftSpan = document.createElement('span');
	leftSpan.textContent = title;
	const rightContainer = document.createElement('div');
	rightContainer.style.display = 'flex';
	rightContainer.style.alignItems = 'center';
	rightContainer.style.gap = '10px';
	const copyButton = document.createElement('button');
	copyButton.textContent = 'Copy as CSV';
	copyButton.classList.add('copy-btn');
	copyButton.onclick = (event) => {
		event.stopPropagation();
		copyTableAsCSV(table, title);
	};
	const icon = document.createElement('span');
	icon.textContent = '➕';
	rightContainer.appendChild(copyButton);
	rightContainer.appendChild(icon);
	header.appendChild(leftSpan);
	header.appendChild(rightContainer);
	header.onclick = () => {
		const content = document.getElementById(tableId + '_content');
		const currentDisplay = window.getComputedStyle(content).display;
		const isVisible = currentDisplay === 'block';
		content.style.display = isVisible ? 'none' : 'block';
		icon.textContent = isVisible ? '➕' : '➖';
	};
	const content = document.createElement('div');
	content.classList.add('table-content');
	content.id = tableId + '_content';
	content.style.display = 'none';
	const tableElement = document.createElement('table');
	tableElement.id = tableId;
	tableElement.classList.add('display');
	tableElement.innerHTML = table.toHTML({ limit: Infinity });
	content.appendChild(tableElement);
	section.appendChild(header);
	section.appendChild(content);
	container.appendChild(section);
	if (window.jQuery) {
		$(document).ready(function () {
			setTimeout(() => {
				try {
					if ($.fn.DataTable) {
						console.log(`[DEBUG] Initializing DataTable for #${tableId}`);
						$('#' + tableId).DataTable({
							paging: false,
							searching: true,
							ordering: true,
							autoWidth: true,
						});
					} else {
						console.error('[ERROR] DataTables.js is not loaded');
					}
				} catch (e) {
					console.error(`[ERROR] DataTable init failed for #${tableId}`, e);
				}
			}, 100);
		});
	} else {
		console.warn(
			'[WARNING] jQuery is not available. Falling back to native DOM methods.',
		);
		setTimeout(() => {
			const tableElement = document.getElementById(tableId);
			if (tableElement) {
				console.log(`[DEBUG] DataTable initialization skipped for #${tableId}`);
			} else {
				console.error(`[ERROR] Table element not found for #${tableId}`);
			}
		}, 100);
	}
}