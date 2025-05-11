// Utility to create map action buttons for Print/Export and GPX Export
export function createPrintButton() {
	const printBtn = document.createElement('button');
	printBtn.className = 'map-action-btn';
	printBtn.innerHTML =
		'<svg class="icon" viewBox="0 0 20 20" width="18" height="18"><rect x="4" y="12" width="12" height="5" rx="1" fill="#1976d2"/><rect x="4" y="3" width="12" height="7" rx="1" fill="#90caf9"/><rect x="7" y="15" width="6" height="2" rx="1" fill="#fff"/></svg> <span>Print/Export</span>';
	printBtn.title = 'Print or export the current map view';
	printBtn.onclick = () => {
		window.print();
	};
	return printBtn;
}

export function createExportGPXButton() {
	const exportBtn = document.createElement('button');
	exportBtn.className = 'map-action-btn';
	exportBtn.innerHTML =
		'<svg class="icon" viewBox="0 0 20 20" width="18" height="18"><path d="M10 2v12M10 14l-4-4m4 4l4-4" stroke="#1976d2" stroke-width="2" fill="none"/><rect x="4" y="16" width="12" height="2" rx="1" fill="#1976d2"/></svg> <span>Export GPX</span>';
	exportBtn.title = 'Export the current track as a GPX file';
	exportBtn.onclick = () => {
		if (!window.globalData || !window.globalData.recordMesgs) return;
		const coords = window.globalData.recordMesgs
			.filter((row) => row.positionLat != null && row.positionLong != null)
			.map((row) => [
				Number((row.positionLat / 2 ** 31) * 180),
				Number((row.positionLong / 2 ** 31) * 180),
			]);
		let gpx = `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="FitFileViewer">\n<trk><name>Exported Track</name><trkseg>`;
		coords.forEach((c) => {
			gpx += `\n<trkpt lat="${c[0]}" lon="${c[1]}"/>`;
		});
		gpx += '\n</trkseg></trk></gpx>';
		const blob = new Blob([gpx], { type: 'application/gpx+xml' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'track.gpx';
		a.click();
		URL.revokeObjectURL(url);
	};
	return exportBtn;
}

export function createElevationProfileButton() {
	const btn = document.createElement('button');
	btn.className = 'map-action-btn';
	btn.innerHTML =
		'<svg class="icon" viewBox="0 0 20 20" width="18" height="18"><polyline points="2,16 6,10 10,14 14,6 18,12" fill="none" stroke="#1976d2" stroke-width="2"/><circle cx="2" cy="16" r="1.5" fill="#1976d2"/><circle cx="6" cy="10" r="1.5" fill="#1976d2"/><circle cx="10" cy="14" r="1.5" fill="#1976d2"/><circle cx="14" cy="6" r="1.5" fill="#1976d2"/><circle cx="18" cy="12" r="1.5" fill="#1976d2"/></svg> <span>Elevation</span>';
	btn.title = 'Show Elevation Profile';
	const hasAltitude =
		window.globalData &&
		window.globalData.recordMesgs &&
		window.globalData.recordMesgs.some((r) => r.altitude != null);
	if (!hasAltitude) {
		btn.disabled = true;
		btn.title = 'No altitude data available';
	}
	btn.onclick = () => {
		if (!window.globalData || !window.globalData.recordMesgs) return;
		const altitudes = window.globalData.recordMesgs
			.filter(
				(r) =>
					r.positionLat != null && r.positionLong != null && r.altitude != null,
			)
			.map((r, i) => ({ x: i, y: r.altitude }));
		const isDark = document.body.classList.contains('theme-dark');
		const chartWin = window.open(
			'',
			'Elevation Profile',
			'width=600,height=400',
		);
		chartWin.document.write(`
			<html><head><title>Elevation Profile</title>
			<script src="./libs/chartjs-latest.js"></script>
			<link rel="stylesheet" href="./elevProfile.css">
			</head><body class="${
				isDark ? 'theme-dark' : 'theme-light'
			}"><canvas id="elevChart"></canvas>
			<script>
			window.onload = function() {
				const ctx = document.getElementById('elevChart').getContext('2d');
				new Chart(ctx, {
					type: 'line',
					data: { labels: ${JSON.stringify(
						altitudes.map((a) => a.x),
					)}, datasets: [{ label: 'Altitude', data: ${JSON.stringify(
			altitudes.map((a) => a.y),
		)}, borderColor: '${
			isDark ? '#4fc3f7' : 'blue'
		}', backgroundColor: 'transparent', fill: false }] },
					options: { responsive: true, plugins: { legend: { labels: { color: '${
						isDark ? '#eee' : '#222'
					}' } } }, scales: { x: { title: { display: true, text: 'Point Index', color: '${
			isDark ? '#eee' : '#222'
		}' }, ticks: { color: '${
			isDark ? '#eee' : '#222'
		}' } }, y: { title: { display: true, text: 'Altitude (m)', color: '${
			isDark ? '#eee' : '#222'
		}' }, ticks: { color: '${isDark ? '#eee' : '#222'}' } } } }
				});
			}
			</script></body></html>
		`);
		chartWin.document.close();
	};
	return btn;
}

export function createAddFitFileToMapButton() {
	const addOverlayBtn = document.createElement('button');
	addOverlayBtn.className = 'map-action-btn';
	addOverlayBtn.innerHTML =
		'<svg class="icon" viewBox="0 0 20 20" width="18" height="18"><path d="M10 2v16M2 10h16" stroke="#1976d2" stroke-width="2" fill="none"/></svg> <span>Add FIT File(s) to Map</span>';
	addOverlayBtn.title =
		'Overlay one or more FIT files on the map (points and tooltips will be shown)';
	addOverlayBtn.onclick = () => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.fit';
		input.multiple = true;
		input.style.display = 'none';
		input.onchange = async (e) => {
			const files = Array.from(e.target.files);
			if (files.length > 0) {
				for (const file of files) {
					const reader = new FileReader();
					reader.onload = async function (event) {
						const arrayBuffer = event.target.result;
						if (
							arrayBuffer &&
							window.electronAPI &&
							window.electronAPI.decodeFitFile
						) {
							const fitData = await window.electronAPI.decodeFitFile(
								arrayBuffer,
							);
							if (fitData && !fitData.error) {
								if (
									!window.loadedFitFiles ||
									window.loadedFitFiles.length === 0
								) {
									if (window.globalData && window.globalData.recordMesgs) {
										window.loadedFitFiles = [
											{
												data: window.globalData,
												filePath: window.globalData?.cachedFilePath,
											},
										];
									}
								}
								if (
									!window.loadedFitFiles.some((f) => f.filePath === file.name)
								) {
									if (
										fitData &&
										Array.isArray(fitData.recordMesgs) &&
										fitData.recordMesgs.length > 0
									) {
										window.loadedFitFiles.push({
											data: fitData,
											filePath: file.name,
										});
										if (window.renderMap) window.renderMap();
										if (window.updateShownFilesList)
											window.updateShownFilesList();
									} else {
										alert(
											'No valid location data found in this FIT file: ' +
												file.name,
										);
									}
								} else {
									alert(
										'This FIT file is already added as an overlay: ' +
											file.name,
									);
								}
							} else {
								alert(
									'Failed to parse FIT file: ' +
										file.name +
										' - ' +
										(fitData.error || 'Unknown error'),
								);
							}
						}
					};
					reader.readAsArrayBuffer(file);
				}
			}
		};
		document.body.appendChild(input);
		input.click();
		setTimeout(() => document.body.removeChild(input), 5000);
	};
	return addOverlayBtn;
}

// Export the overlay color palette for use in map rendering
export const overlayColorPalette = [
	'#ff5252',
	'#40c4ff',
	'#ffd740',
	'#69f0ae',
	'#ff4081',
	'#7c4dff',
	'#18ffff',
	'#ffab40',
	'#64ffda',
	'#eeff41',
	'#536dfe',
	'#ff6e40',
	'#00e676',
	'#ffb300',
	'#00b8d4',
	'#ffd600',
	'#00bfae',
	'#ff1744',
	'#00e5ff',
	'#ffea00',
	'#76ff03',
	'#ff80ab',
	'#b388ff',
	'#ff9100',
	'#1de9b6',
	'#ff3d00',
	'#00bfae',
	'#ffd740',
	'#00e676',
	'#40c4ff',
	'#ff4081',
	'#69f0ae',
	'#ffab40',
	'#18ffff',
	'#eeff41',
	'#7c4dff',
	'#ff5252',
	'#ffd600',
	'#00e5ff',
	'#ffea00',
	'#76ff03',
].sort(() => Math.random() - 0.5);

export function createShownFilesList() {
	const container = document.createElement('div');
	container.className = 'shown-files-list';
	container.style.margin = '8px 0';
	container.style.fontSize = '0.95em';
	container.style.border = '1px solid #bbb';
	container.style.borderRadius = '6px';
	container.style.padding = '6px 10px';
	container.style.maxWidth = '350px';
	container.style.overflow = 'auto';
	container.style.maxHeight = '80px';
	container.innerHTML =
		'<b>Extra Files shown on map:</b><ul id="shown-files-ul" style="margin:0; padding-left:18px;"></ul>';

	function applyTheme() {
		const isDark = document.body.classList.contains('theme-dark');
		container.style.background = isDark
			? 'rgba(30,34,40,0.92)'
			: 'rgba(255,255,255,0.92)';
		container.style.color = isDark ? '#eee' : '#222';
		container.style.border = isDark ? '1px solid #444' : '1px solid #bbb';
	}
	applyTheme();
	document.body.addEventListener('themechange', applyTheme);

	// Helper: Check color contrast (returns true if color is accessible on the given background)
	function isColorAccessible(fg, bg, filter = '') {
		// fg, bg: CSS color strings (e.g., '#fff', 'rgb(30,34,40)')
		// filter: CSS filter string (e.g., 'invert(0.92) ...')
		function hexToRgb(hex) {
			hex = hex.replace('#', '');
			if (hex.length === 3)
				hex = hex
					.split('')
					.map((x) => x + x)
					.join('');
			const num = parseInt(hex, 16);
			return [num >> 16, (num >> 8) & 255, num & 255];
		}
		function parseColor(str) {
			if (str.startsWith('#')) return hexToRgb(str);
			const m = str.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
			if (m) return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
			return [255, 255, 255];
		}
		// If a filter is provided, simulate the filtered color using a temp element
		let fgColor = fg;
		if (filter) {
			const temp = document.createElement('span');
			temp.style.color = fg;
			temp.style.filter = filter;
			temp.style.display = 'none';
			document.body.appendChild(temp);
			fgColor = getComputedStyle(temp).color;
			document.body.removeChild(temp);
		}
		const [r1, g1, b1] = parseColor(fgColor);
		const [r2, g2, b2] = parseColor(bg);
		// Relative luminance
		function lum(r, g, b) {
			[r, g, b] = [r, g, b].map((v) => {
				v /= 255;
				return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
			});
			return 0.2126 * r + 0.7152 * g + 0.0722 * b;
		}
		const L1 = lum(r1, g1, b1) + 0.05,
			L2 = lum(r2, g2, b2) + 0.05;
		const ratio = L1 > L2 ? L1 / L2 : L2 / L1;
		return ratio >= 3.5; // WCAG AA for UI text
	}

	window.updateShownFilesList = function () {
		const ul = container.querySelector('#shown-files-ul');
		ul.innerHTML = '';
		if (window.loadedFitFiles && window.loadedFitFiles.length > 1) {
			window.loadedFitFiles.forEach((f, idx) => {
				if (idx === 0) return; // skip main file
				const li = document.createElement('li');
				li.textContent = 'File: ' + (f.filePath || '(unknown)');
				const colorIdx = idx % overlayColorPalette.length;
				const color = overlayColorPalette[colorIdx];
				const isDark = document.body.classList.contains('theme-dark');
				let filter = '';
				if (isDark) {
					filter =
						'invert(0.92) hue-rotate(180deg) brightness(0.9) contrast(1.1)';
					li.style.filter = filter;
				}
				const bg = isDark ? 'rgb(30,34,40)' : '#fff';
				li.style.color = color;
				li.style.filter = filter;
				// Add a subtle text outline for readability
				li.style.textShadow = isDark
					? '0 0 1px #000, 0 0 1px #000, 0 0 1px #000'
					: '0 0 1px #fff, 0 0 1px #fff, 0 0 1px #fff';
				let showWarning = !isColorAccessible(color, bg, filter);
				let fullPath = f.filePath || '(unknown)';
				li.style.cursor = 'pointer';
				li.onmouseenter = (e) => {
					window._highlightedOverlayIdx = idx;
					if (window.updateOverlayHighlights) window.updateOverlayHighlights();
					// Show tooltip with full path and warning if needed
					let tooltip = document.createElement('div');
					tooltip.className = 'overlay-filename-tooltip';
					tooltip.style.position = 'fixed';
					tooltip.style.zIndex = 9999;
					tooltip.style.pointerEvents = 'none';
					tooltip.style.background = isDark ? '#23263a' : '#fff';
					tooltip.style.color = isDark ? '#fff' : '#222';
					tooltip.style.border = '1px solid ' + (isDark ? '#444' : '#bbb');
					tooltip.style.borderRadius = '4px';
					tooltip.style.padding = '6px 10px';
					tooltip.style.fontSize = '0.95em';
					tooltip.style.boxShadow = '0 2px 8px #0003';
					let html = '<b>File:</b> ' + fullPath;
					if (showWarning) {
						html +=
							'<br><span style="color:#eab308;">⚠️ This color may be hard to read in this theme.</span>';
					}
					tooltip.innerHTML = html;
					document.body.appendChild(tooltip);
					const moveTooltip = (evt) => {
						const pad = 12;
						let x = evt.clientX + pad;
						let y = evt.clientY + pad;
						if (x + tooltip.offsetWidth > window.innerWidth)
							x = window.innerWidth - tooltip.offsetWidth - pad;
						if (y + tooltip.offsetHeight > window.innerHeight)
							y = window.innerHeight - tooltip.offsetHeight - pad;
						tooltip.style.left = x + 'px';
						tooltip.style.top = y + 'px';
					};
					moveTooltip(e);
					window.addEventListener('mousemove', moveTooltip);
					li._tooltipRemover = () => {
						window.removeEventListener('mousemove', moveTooltip);
						if (tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
					};
				};
				li.onmouseleave = () => {
					window._highlightedOverlayIdx = null;
					if (window.updateOverlayHighlights) window.updateOverlayHighlights();
					if (li._tooltipRemover) li._tooltipRemover();
				};
				li.onclick = () => {
					window._highlightedOverlayIdx = idx;
					if (window.updateOverlayHighlights) window.updateOverlayHighlights();
					if (li._tooltipRemover) li._tooltipRemover();
					// Bring the overlay polyline to front and flash highlight
					if (window._overlayPolylines && window._overlayPolylines[idx]) {
						const polyline = window._overlayPolylines[idx];
						if (polyline.bringToFront) polyline.bringToFront();
						const polyElem = polyline.getElement && polyline.getElement();
						if (polyElem) {
							polyElem.style.transition = 'filter 0.2s';
							polyElem.style.filter =
								'drop-shadow(0 0 16px ' +
								(polyline.options.color || '#1976d2') +
								')';
							setTimeout(() => {
								if (window._highlightedOverlayIdx === idx) {
									polyElem.style.filter =
										'drop-shadow(0 0 8px ' +
										(polyline.options.color || '#1976d2') +
										')';
								}
							}, 250);
							// Center and fit map to this overlay
							if (polyline.getBounds && window._leafletMapInstance) {
								window._leafletMapInstance.fitBounds(polyline.getBounds(), {
									padding: [20, 20],
								});
							}
						}
					}
				};
				ul.appendChild(li);
			});
			container.style.display = '';
		} else {
			container.style.display = 'none';
		}
	};
	// Hide initially if no overlays
	if (!(window.loadedFitFiles && window.loadedFitFiles.length > 1)) {
		container.style.display = 'none';
	}
	return container;
}

export function getOverlayFileName(idx) {
	if (
		window.loadedFitFiles &&
		window.loadedFitFiles[idx] &&
		window.loadedFitFiles[idx].filePath
	) {
		return window.loadedFitFiles[idx].filePath;
	}
	return '';
}

export function createMarkerCountSelector(onChange) {
	const container = document.createElement('div');
	container.className = 'map-action-btn marker-count-container';

	const label = document.createElement('label');
	label.textContent = 'Data Points:';
	label.setAttribute('for', 'marker-count-select');
	label.className = 'marker-count-label';

	const select = document.createElement('select');
	select.id = 'marker-count-select';
	select.className = 'marker-count-select';

	const options = [10, 25, 50, 100, 200, 500, 1000, 'All'];
	options.forEach((val) => {
		const opt = document.createElement('option');
		opt.value = val === 'All' ? 'all' : val;
		opt.textContent = val;
		select.appendChild(opt);
	});

	// Set initial value from global or default
	let initial;
	if (window.mapMarkerCount === undefined) {
		window.mapMarkerCount = 50;
		initial = 50;
	} else if (window.mapMarkerCount === 0) {
		initial = 'all';
	} else {
		initial = window.mapMarkerCount;
	}
	select.value = initial;

	select.onchange = function () {
		let val = select.value;
		if (val === 'all') {
			window.mapMarkerCount = 0;
		} else {
			window.mapMarkerCount = parseInt(val, 10);
		}
		if (typeof onChange === 'function') onChange(window.mapMarkerCount);
		if (window.updateShownFilesList) window.updateShownFilesList();
	};

	// Add mouse wheel support for changing marker count
	select.addEventListener('wheel', (e) => {
		e.preventDefault();
		e.stopPropagation();
		const options = Array.from(select.options);
		let idx = select.selectedIndex;
		if (e.deltaY > 0 && idx < options.length - 1) {
			select.selectedIndex = idx + 1;
		} else if (e.deltaY < 0 && idx > 0) {
			select.selectedIndex = idx - 1;
		}
		select.dispatchEvent(new Event('change'));
	});

	container.appendChild(label);
	container.appendChild(select);

	return container;
}
