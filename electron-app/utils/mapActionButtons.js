// Utility to create map action buttons for Print/Export and GPX Export
export function createPrintButton() {
	const printBtn = document.createElement('button');
	printBtn.className = 'map-action-btn';
	printBtn.innerHTML = '<svg class="icon" viewBox="0 0 20 20" width="18" height="18"><rect x="4" y="12" width="12" height="5" rx="1" fill="#1976d2"/><rect x="4" y="3" width="12" height="7" rx="1" fill="#90caf9"/><rect x="7" y="15" width="6" height="2" rx="1" fill="#fff"/></svg> <span>Print/Export</span>';
	printBtn.title = 'Print or export the current map view';
	printBtn.onclick = () => {
		window.print();
	};
	return printBtn;
}

export function createExportGPXButton() {
	const exportBtn = document.createElement('button');
	exportBtn.className = 'map-action-btn';
	exportBtn.innerHTML = '<svg class="icon" viewBox="0 0 20 20" width="18" height="18"><path d="M10 2v12M10 14l-4-4m4 4l4-4" stroke="#1976d2" stroke-width="2" fill="none"/><rect x="4" y="16" width="12" height="2" rx="1" fill="#1976d2"/></svg> <span>Export GPX</span>';
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
			gpx += `\n<trkpt lat=\"${c[0]}\" lon=\"${c[1]}\"/>`;
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
	btn.innerHTML = '<svg class="icon" viewBox="0 0 20 20" width="18" height="18"><polyline points="2,16 6,10 10,14 14,6 18,12" fill="none" stroke="#1976d2" stroke-width="2"/><circle cx="2" cy="16" r="1.5" fill="#1976d2"/><circle cx="6" cy="10" r="1.5" fill="#1976d2"/><circle cx="10" cy="14" r="1.5" fill="#1976d2"/><circle cx="14" cy="6" r="1.5" fill="#1976d2"/><circle cx="18" cy="12" r="1.5" fill="#1976d2"/></svg> <span>Elevation</span>';
	btn.title = 'Show Elevation Profile';
	const hasAltitude = window.globalData && window.globalData.recordMesgs && window.globalData.recordMesgs.some(r => r.altitude != null);
	if (!hasAltitude) {
		btn.disabled = true;
		btn.title = 'No altitude data available';
	}
	btn.onclick = () => {
		if (!window.globalData || !window.globalData.recordMesgs) return;
		const altitudes = window.globalData.recordMesgs
			.filter(r => r.positionLat != null && r.positionLong != null && r.altitude != null)
			.map((r, i) => ({ x: i, y: r.altitude }));
		const isDark = document.body.classList.contains('theme-dark');
		const chartWin = window.open('', 'Elevation Profile', 'width=600,height=400');
		chartWin.document.write(`
			<html><head><title>Elevation Profile</title>
			<script src="./libs/chartjs-latest.js"></script>
			<link rel="stylesheet" href="./elevProfile.css">
			</head><body class="${isDark ? 'theme-dark' : 'theme-light'}"><canvas id="elevChart"></canvas>
			<script>
			window.onload = function() {
				const ctx = document.getElementById('elevChart').getContext('2d');
				new Chart(ctx, {
					type: 'line',
					data: { labels: ${JSON.stringify(altitudes.map(a => a.x))}, datasets: [{ label: 'Altitude', data: ${JSON.stringify(altitudes.map(a => a.y))}, borderColor: '${isDark ? '#4fc3f7' : 'blue'}', backgroundColor: 'transparent', fill: false }] },
					options: { responsive: true, plugins: { legend: { labels: { color: '${isDark ? '#eee' : '#222'}' } } }, scales: { x: { title: { display: true, text: 'Point Index', color: '${isDark ? '#eee' : '#222'}' }, ticks: { color: '${isDark ? '#eee' : '#222'}' } }, y: { title: { display: true, text: 'Altitude (m)', color: '${isDark ? '#eee' : '#222'}' }, ticks: { color: '${isDark ? '#eee' : '#222'}' } } } }
				});
			}
			</script></body></html>
		`);
		chartWin.document.close();
	};
	return btn;
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
	options.forEach(val => {
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

	select.onchange = function() {
		let val = select.value;
		if (val === 'all') {
			window.mapMarkerCount = 0;
		} else {
			window.mapMarkerCount = parseInt(val, 10);
		}
		if (typeof onChange === 'function') onChange(window.mapMarkerCount);
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
