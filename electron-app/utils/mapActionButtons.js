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

	const colorPalette = [
		'#ff5252', // bright red
		'#40c4ff', // bright blue
		'#ffd740', // bright yellow
		'#69f0ae', // bright green
		'#ff4081', // bright pink
		'#7c4dff', // bright purple
		'#18ffff', // cyan
		'#ffab40', // orange
		'#64ffda', // teal
		'#eeff41', // lime
		'#536dfe', // vivid blue
		'#ff6e40', // coral
		'#00e676', // vivid green
		'#ffb300', // gold
		'#00b8d4', // turquoise
		'#ffd600', // yellow
		'#00bfae', // aqua
		'#ff1744', // vivid red
		'#00e5ff', // electric blue
		'#ffea00', // lemon
		'#76ff03', // light green
		'#ff80ab', // light pink
		'#b388ff', // light purple
		'#ff9100', // vivid orange
		'#1de9b6', // mint
		'#ff3d00', // orange red
		'#00bfae', // teal
		'#ffd740', // yellow
		'#00e676', // green
		'#40c4ff', // blue
		'#ff4081', // pink
		'#69f0ae', // green
		'#ffab40', // orange
		'#18ffff', // cyan
		'#eeff41', // lime
		'#7c4dff', // purple
		'#ff5252', // red
		'#ffd600', // yellow
		'#00e5ff', // blue
		'#ffea00', // lemon
		'#76ff03'  // green
	].sort(() => Math.random() - 0.5);

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

	window.updateShownFilesList = function () {
		const ul = container.querySelector('#shown-files-ul');
		ul.innerHTML = '';
		if (window.loadedFitFiles && window.loadedFitFiles.length > 1) {
			window.loadedFitFiles.forEach((f, idx) => {
				if (idx === 0) return; // skip main file
				const li = document.createElement('li');
				li.textContent = 'File: ' + (f.filePath || '(unknown)');
				li.style.color = colorPalette[(idx - 1) % colorPalette.length];
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
