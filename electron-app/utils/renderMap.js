/**
 * Renders a Leaflet map inside the element with id 'content-map'.
 * If `window.globalData.recordMesgs` exists and contains valid latitude and longitude data,
 * it plots the coordinates as a polyline on the map and fits the map bounds to the polyline.
 * If no valid location data is available, displays a message instead of the map.
 *
 * Assumes that `window.globalData.recordMesgs` is an array of objects with `positionLat` and `positionLong` properties,
 * where the coordinates are encoded as signed 32-bit integers and need to be converted to degrees.
 *
 * Dependencies:
 * - Leaflet.js library must be loaded and available as global `L`.
 */
export function renderMap() {
	const mapContainer = document.getElementById('content-map');
	mapContainer.innerHTML = `
		<div id="leaflet-map"></div>
		<div id="map-controls"></div>
	`;

	// --- Base layers ---
	const baseLayers = {
		OpenStreetMap: L.tileLayer(
			'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
			{
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			},
		),
		Satellite: L.tileLayer(
			'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
			{
				attribution: 'Tiles &copy; Esri',
			},
		),
		Topo: L.tileLayer('https://tile.opentopomap.org/{z}/{x}/{y}.png', {
			attribution:
				'Map data: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
		}),
		CartoDB_Positron: L.tileLayer(
			'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
			{
				attribution:
					'&copy; <a href="https://carto.com/attributions">CARTO</a>',
			},
		),
		CartoDB_DarkMatter: L.tileLayer(
			'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
			{
				attribution:
					'&copy; <a href="https://carto.com/attributions">CARTO</a>',
			},
		),
		Esri_Topo: L.tileLayer(
			'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
			{
				attribution:
					'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
			},
		),
		Esri_WorldStreetMap: L.tileLayer(
			'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
			{
				attribution:
					'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
			},
		),
		Esri_WorldImagery: L.tileLayer(
			'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
			{
				attribution:
					'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
			},
		),
		Esri_WorldTerrain: L.tileLayer(
			'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}',
			{
				attribution:
					'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
			},
		),
		Esri_WorldPhysical: L.tileLayer(
			'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',
			{
				attribution:
					'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
			},
		),
		Esri_WorldShadedRelief: L.tileLayer(
			'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}',
			{
				attribution:
					'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
			},
		),
		Esri_WorldGrayCanvas: L.tileLayer(
			'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
			{
				attribution:
					'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
			},
		),
		Esri_WorldImagery_Labels: L.tileLayer(
			'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
			{
				attribution:
					'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
			},
		),
		Esri_WorldStreetMap_Labels: L.tileLayer(
			'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
			{
				attribution:
					'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
			},
		),
		Esri_WorldTopo_Labels: L.tileLayer(
			'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
			{
				attribution:
					'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
			},
		),
		Esri_NatGeo: L.tileLayer(
			'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
			{
				attribution:
					'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ',
			},
		),
		CyclOSM: L.tileLayer(
			'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
			{
				attribution:
					'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://www.cyclosm.org/">CyclOSM</a>',
			},
		),
		Thunderforest_Cycle: L.tileLayer(
			'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png',
			{
				attribution:
					'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://www.thunderforest.com/">Thunderforest</a>',
			},
		),
		Thunderforest_Transport: L.tileLayer(
			'https://tile.thunderforest.com/transport/{z}/{x}/{y}.png',
			{
				attribution:
					'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://www.thunderforest.com/">Thunderforest</a>',
			},
		),
		OpenRailwayMap: L.tileLayer(
			'https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png',
			{
				attribution:
					'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://www.openrailwaymap.org/">OpenRailwayMap</a>',
			},
		),
		OpenSeaMap: L.tileLayer(
			'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
			{
				attribution:
					'Map data &copy; <a href="https://www.openseamap.org">OpenSeaMap</a> contributors',
			},
		),
		WaymarkedTrails_Cycling: L.tileLayer(
			'https://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png',
			{
				attribution:
					'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://cycling.waymarkedtrails.org/">Waymarked Trails Cycling</a>',
			},
		),
		WaymarkedTrails_Hiking: L.tileLayer(
			'https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png',
			{
				attribution:
					'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://hiking.waymarkedtrails.org/">Waymarked Trails Hiking</a>',
			},
		),
		WaymarkedTrails_Slopes: L.tileLayer(
			'https://tile.waymarkedtrails.org/slopes/{z}/{x}/{y}.png',
			{
				attribution:
					'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://slopes.waymarkedtrails.org/">Waymarked Trails Riding</a>',
			},
		),
		OpenFreeMap_Liberty: L.maplibreGL({
			style: 'https://tiles.openfreemap.org/styles/liberty',
		}),
		OpenFreeMap_Positron: L.maplibreGL({
			style: 'https://tiles.openfreemap.org/styles/positron',
		}),
		OpenFreeMap_Bright: L.maplibreGL({
			style: 'https://tiles.openfreemap.org/styles/bright',
		}),
		OpenFreeMap_Dark: L.maplibreGL({
			style: 'https://tiles.openfreemap.org/styles/dark',
		}),
		OpenFreeMap_Fiord: L.maplibreGL({
			style: 'https://tiles.openfreemap.org/styles/fiord',
		}),
		Humanitarian: L.tileLayer(
			'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
			{
				attribution:
					'Tiles &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://www.openstreetmap.fr/fonds-de-carte/">Humanitarian OSM</a>',
				subdomains: 'ab',
			},
		),
		OSM_France: L.tileLayer(
			'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
			{
				attribution:
					'Tiles &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://www.openstreetmap.fr/fonds-de-carte/">OSM France</a>',
				subdomains: 'abc',
			},
		),
	};

	const map = L.map('leaflet-map', {
		center: [0, 0],
		zoom: 2,
		layers: [baseLayers['OpenStreetMap']],
		fullscreenControl: true,
	});

	const layersControl = L.control
		.layers(baseLayers, null, { position: 'topright', collapsed: true })
		.addTo(map);

	// Add a custom floating label/button to indicate map type selection
	const mapTypeBtn = document.createElement('div');
	mapTypeBtn.className = 'custom-maptype-btn leaflet-bar';
	mapTypeBtn.style.position = 'absolute';
	mapTypeBtn.style.top = '16px';
	mapTypeBtn.style.right = '60px';
	mapTypeBtn.style.zIndex = 900; // ensure above layers control
	mapTypeBtn.innerHTML = '🗺️ Change Map Type';
	mapTypeBtn.title = 'Click to change the map type';
	mapTypeBtn.onclick = (e) => {
		e.stopPropagation();
		const layersControlEl = document.querySelector('.leaflet-control-layers');
		if (layersControlEl) {
			layersControlEl.classList.add('leaflet-control-layers-expanded');
			layersControlEl.style.zIndex = 1201; // just below the button
			// Focus the first input for accessibility
			const firstInput = layersControlEl.querySelector('input[type="radio"]');
			if (firstInput) firstInput.focus();
		}
	};
	document.getElementById('leaflet-map').appendChild(mapTypeBtn);

	// When the user clicks outside the control, collapse it
	document.addEventListener('mousedown', (e) => {
		const layersControlEl = document.querySelector('.leaflet-control-layers');
		if (
			layersControlEl &&
			layersControlEl.classList.contains('leaflet-control-layers-expanded')
		) {
			if (
				!layersControlEl.contains(e.target) &&
				!mapTypeBtn.contains(e.target)
			) {
				layersControlEl.classList.remove('leaflet-control-layers-expanded');
				layersControlEl.style.zIndex = '';
			}
		}
	});

	// --- Add a custom zoom slider bar (normalized 0-100%) ---
	const zoomSliderBar = document.createElement('div');
	zoomSliderBar.className = 'custom-zoom-slider-bar';
	const minZoom = map.getMinZoom();
	const maxZoom = map.getMaxZoom();
	const zoomToPercent = (zoom) =>
		((zoom - minZoom) / (maxZoom - minZoom)) * 100;
	const percentToZoom = (percent) =>
		minZoom + ((maxZoom - minZoom) * percent) / 100;
	zoomSliderBar.innerHTML = `
		<div class="custom-zoom-slider-label">Zoom</div>
		<input type="range" min="0" max="100" value="${zoomToPercent(
			map.getZoom(),
		)}" step="1" id="zoom-slider-input">
		<div class="custom-zoom-slider-values">
			<span id="zoom-slider-min">0%</span>
			<span style="margin:0 8px;">|</span>
			<span id="zoom-slider-current">${Math.round(
				zoomToPercent(map.getZoom()),
			)}%</span>
			<span style="margin:0 8px;">|</span>
			<span id="zoom-slider-max">100%</span>
		</div>
	`;
	const zoomSlider = zoomSliderBar.querySelector('#zoom-slider-input');
	const zoomSliderCurrent = zoomSliderBar.querySelector('#zoom-slider-current');
	zoomSliderBar.style.pointerEvents = 'auto';
	zoomSlider.style.pointerEvents = 'auto';
	zoomSlider.addEventListener('mousedown', (e) => e.stopPropagation());
	zoomSlider.addEventListener('touchstart', (e) => e.stopPropagation());

	// Fix jank: Only update map zoom on change, and update slider on zoomend
	let isDragging = false;
	zoomSlider.addEventListener('input', (e) => {
		isDragging = true;
		const percent = Number(e.target.value);
		zoomSliderCurrent.textContent = `${percent}%`;
	});
	zoomSlider.addEventListener('change', (e) => {
		const percent = Number(e.target.value);
		const newZoom = percentToZoom(percent);
		map.setZoom(Math.round(newZoom));
		isDragging = false;
	});
	const updateZoomSlider = () => {
		if (!isDragging) {
			const percent = Math.round(zoomToPercent(map.getZoom()));
			zoomSlider.value = percent;
			zoomSliderCurrent.textContent = `${percent}%`;
		}
	};
	map.on('zoomend zoomlevelschange', updateZoomSlider);
	updateZoomSlider();
	document.getElementById('leaflet-map').appendChild(zoomSliderBar);

	L.control
		.scale({ position: 'bottomleft', metric: true, imperial: true })
		.addTo(map);

	// --- Fullscreen control (if plugin loaded) ---
	if (L.control.fullscreen) {
		L.control.fullscreen({ position: 'topleft' }).addTo(map);
	}

	// --- Locate user button ---
	if (L.control.locate) {
		L.control
			.locate({ position: 'topleft', flyTo: true, keepCurrentZoomLevel: true })
			.addTo(map);
	}

	// --- Print/export button ---
	const printBtn = document.createElement('button');
	printBtn.textContent = 'Print/Export Map';
	printBtn.onclick = () => {
		window.print();
	};
	const controlsDiv = document.getElementById('map-controls');
	controlsDiv.appendChild(printBtn);

	// --- Fullscreen button (custom, styled, top left) ---
	const fullscreenControl = document.createElement('div');
	fullscreenControl.className =
		'custom-fullscreen-control leaflet-top leaflet-left';
	const fullscreenEnterSVG = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="5" height="2" rx="1" fill="currentColor"/><rect x="3" y="3" width="2" height="5" rx="1" fill="currentColor"/><rect x="14" y="3" width="5" height="2" rx="1" fill="currentColor"/><rect x="17" y="3" width="2" height="5" rx="1" fill="currentColor"/><rect x="3" y="17" width="5" height="2" rx="1" fill="currentColor"/><rect x="3" y="14" width="2" height="5" rx="1" fill="currentColor"/><rect x="14" y="17" width="5" height="2" rx="1" fill="currentColor"/><rect x="17" y="14" width="2" height="5" rx="1" fill="currentColor"/></svg>`;
	const fullscreenExitSVG = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="7" y="3" width="2" height="5" rx="1" fill="currentColor"/><rect x="3" y="7" width="5" height="2" rx="1" fill="currentColor"/><rect x="14" y="3" width="2" height="5" rx="1" fill="currentColor"/><rect x="15" y="7" width="5" height="2" rx="1" fill="currentColor"/><rect x="3" y="14" width="5" height="2" rx="1" fill="currentColor"/><rect x="7" y="15" width="2" height="5" rx="1" fill="currentColor"/><rect x="15" y="15" width="2" height="5" rx="1" fill="currentColor"/><rect x="15" y="15" width="5" height="2" rx="1" fill="currentColor"/></svg>`;
	fullscreenControl.innerHTML = `
		<div class="leaflet-bar custom-fullscreen-bar">
			<button id="fullscreen-btn" title="Toggle Fullscreen" aria-label="Toggle Fullscreen">${fullscreenEnterSVG}</button>
		</div>
	`;
	const mapDiv = document.getElementById('leaflet-map');
	mapDiv.appendChild(fullscreenControl);

	const fullscreenBtn = fullscreenControl.querySelector('#fullscreen-btn');
	fullscreenBtn.onclick = () => {
		if (!mapDiv) return;
		const isFullscreen = mapDiv.classList.toggle('fullscreen');
		fullscreenBtn.title = isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen';
		fullscreenBtn.innerHTML = isFullscreen
			? fullscreenExitSVG
			: fullscreenEnterSVG;
		if (isFullscreen) {
			mapDiv.requestFullscreen && mapDiv.requestFullscreen();
		} else {
			document.exitFullscreen && document.exitFullscreen();
		}
		setTimeout(() => map.invalidateSize(), 300);
	};

	// --- Listen for fullscreen changes (Escape key or other exit) ---
	document.addEventListener('fullscreenchange', () => {
		const isNowFullscreen = document.fullscreenElement === mapDiv;
		if (!isNowFullscreen) {
			mapDiv.classList.remove('fullscreen');
			fullscreenBtn.title = 'Enter Fullscreen';
			fullscreenBtn.innerHTML = fullscreenEnterSVG;
			setTimeout(() => map.invalidateSize(), 300);
		}
	});

	// Remove old fullscreen button from map-controls if present
	const oldFullscreenBtn = document.querySelector(
		'#map-controls #fullscreen-btn',
	);
	if (oldFullscreenBtn) oldFullscreenBtn.remove();

	// --- Lap selection UI (bottom left, styled like zoom UI, fix pointer events) ---
	if (
		window.globalData &&
		Array.isArray(window.globalData.lapMesgs) &&
		window.globalData.lapMesgs.length > 0
	) {
		const lapControl = document.createElement('div');
		lapControl.className =
			'custom-lap-control-container leaflet-bottom leaflet-left';
		lapControl.innerHTML = `
			<div class="custom-lap-control leaflet-bar">
				<label for="lap-select">Lap:</label>
				<select id="lap-select">
					<option value="all">All</option>
					${window.globalData.lapMesgs
						.map((lap, i) => `<option value="${i}">Lap ${i + 1}</option>`)
						.join('')}
				</select>
			</div>
		`;
		lapControl.addEventListener('mousedown', (e) => e.stopPropagation());
		lapControl.addEventListener('touchstart', (e) => e.stopPropagation());
		document.getElementById('leaflet-map').appendChild(lapControl);

		const lapSelect = lapControl.querySelector('#lap-select');
		lapSelect.addEventListener('change', () => {
			drawMapForLap(lapSelect.value);
		});
		// Add scroll wheel support for changing lap selection
		lapSelect.addEventListener('wheel', (e) => {
			e.preventDefault();
			e.stopPropagation(); // Prevent map zoom when scrolling lap select
			const options = Array.from(lapSelect.options);
			let idx = options.findIndex((opt) => opt.value === lapSelect.value);
			if (e.deltaY > 0 && idx < options.length - 1) {
				idx++;
			} else if (e.deltaY < 0 && idx > 0) {
				idx--;
			}
			lapSelect.value = options[idx].value;
			lapSelect.dispatchEvent(new Event('change'));
		});
	}

	// --- Custom icons for start/end ---
	const startIcon = L.icon({
		iconUrl: 'https://i.gyazo.com/71a575e54ca160ae139e68f7771f1c42.png', // Corrected path
		iconSize: [32, 32],
		iconAnchor: [16, 32],
		popupAnchor: [0, -32],
	});
	const endIcon = L.icon({
		iconUrl: 'https://i.gyazo.com/56eb532007a2a739753c131840994f02.png', // Corrected path
		iconSize: [32, 32],
		iconAnchor: [16, 32],
		popupAnchor: [0, -32],
	});

	// --- Marker cluster group (if available) ---
	let markerClusterGroup = null;
	if (window.L && L.markerClusterGroup) {
		markerClusterGroup = L.markerClusterGroup();
		map.addLayer(markerClusterGroup);
	}

	// --- Minimap (if plugin available) ---
	if (window.L && L.Control && L.Control.MiniMap) {
		// Always use a standard tile layer for the minimap
		const miniMapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: ''
		});
		const miniMap = new L.Control.MiniMap(miniMapLayer, {
			toggleDisplay: true
		}).addTo(map);
	}

	// --- Measurement tool (if plugin available) ---
	if (window.L && L.control && L.control.measure) {
		L.control.measure({ position: 'topleft' }).addTo(map);
	}

	// --- Drawing/editing tool (if plugin available) ---
	if (window.L && L.Control && L.Control.Draw) {
		const drawnItems = new L.FeatureGroup();
		map.addLayer(drawnItems);
		const drawControl = new L.Control.Draw({
			edt: false,
			draw: {
				polygon: true,
				polyline: true,
				rectangle: true,
				circle: true,
				marker: true,
			},
		});
		map.addControl(drawControl);
		map.on(L.Draw.Event.CREATED, function (e) {
			drawnItems.addLayer(e.layer);
		});
	}

	// --- GPX/KML export button ---
	const exportBtn = document.createElement('button');
	exportBtn.textContent = 'Export GPX';
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
	controlsDiv.appendChild(exportBtn);

	// --- Elevation profile (if altitude data) ---
	const hasAltitude =
		window.globalData &&
		window.globalData.recordMesgs &&
		window.globalData.recordMesgs.some((r) => r.altitude != null);
	if (hasAltitude) {
		const elevationBtn = document.createElement('button');
		elevationBtn.textContent = 'Show Elevation Profile';
		elevationBtn.onclick = () => {
			const altitudes = window.globalData.recordMesgs
				.filter(
					(r) =>
						r.positionLat != null &&
						r.positionLong != null &&
						r.altitude != null,
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
		controlsDiv.appendChild(elevationBtn);
	}

	// --- Main polyline and markers, refactored for lap selection ---
	function getLapColor(lapIdx) {
		const palette = [
			'#ff5722',
			'#2196f3',
			'#4caf50',
			'#e91e63',
			'#ff9800',
			'#9c27b0',
			'#00bcd4',
			'#8bc34a',
			'#ffc107',
			'#3f51b5',
			'#f44336',
			'#009688',
			'#cddc39',
			'#607d8b',
			'#795548',
			'#673ab7',
			'#b71c1c',
			'#1b5e20',
			'#0d47a1',
			'#fbc02d',
			'#8d6e63',
			'#c2185b',
			'#1976d2',
			'#388e3c',
			'#f57c00',
			'#7b1fa2',
			'#0288d1',
			'#2c6c6d',
			'#d32f2f',
			'#388e3c',
			'#f57c00',
		];
		if (lapIdx === 'all') return 'blue';
		return palette[Number(lapIdx) % palette.length];
	}

	function formatTooltipData(idx, row, lapNum) {
		const dateStr = row.timestamp
			? new Date(row.timestamp).toLocaleString()
			: '';
		let alt = '';
		if (row.altitude != null) {
			const altMeters = Number(row.altitude);
			const altFeet = altMeters * 3.28084;
			alt = `${altMeters.toFixed(1)} m / ${altFeet.toFixed(0)} ft`;
		}
		const hr =
			row.heartRate != null ? `${Number(row.heartRate).toFixed(1)} bpm` : '';
		let speedKmh = '',
			speedMph = '',
			speed = '';
		if (row.speed != null) {
			const s = Number(row.speed);
			speedKmh = `${(s * 3.6).toFixed(1)} km/h`;
			speedMph = `${(s * 2.23694).toFixed(1)} mph`;
			speed = `${speedKmh} / ${speedMph}`;
		}
		const power = row.power != null ? `${Number(row.power).toFixed(1)} W` : '';
		const cadence =
			row.cadence != null ? `${Number(row.cadence).toFixed(1)} rpm` : '';

		// Calculate total ride time since start in human readable format
		let rideTime = '';
		if (
			window.globalData &&
			window.globalData.recordMesgs &&
			window.globalData.recordMesgs.length > 0 &&
			row.timestamp
		) {
			const first = window.globalData.recordMesgs.find(
				(r) => r.timestamp != null,
			);
			if (first && first.timestamp) {
				const firstTime = new Date(first.timestamp).getTime();
				const currTime = new Date(row.timestamp).getTime();
				const diff = Math.max(0, Math.floor((currTime - firstTime) / 1000));
				const h = Math.floor(diff / 3600);
				const m = Math.floor((diff % 3600) / 60);
				const s = Math.floor(diff % 60);
				const parts = [];
				if (h > 0) parts.push(`${h} hour${h !== 1 ? 's' : ''}`);
				if (m > 0) parts.push(`${m} minute${m !== 1 ? 's' : ''}`);
				if (s > 0 || parts.length === 0)
					parts.push(`${s} second${s !== 1 ? 's' : ''}`);
				rideTime = parts.join(', ');
			}
		}

		// Add distance at this point (convert meters to km/mi)
		let distanceStr = '';
		if (row.distance != null && !isNaN(row.distance)) {
			const meters = Number(row.distance);
			const km = meters / 1000;
			const mi = km * 0.621371;
			distanceStr = `${km.toFixed(2)} km / ${mi.toFixed(2)} mi<br>`;
		}

		return (
			`<b>Lap:</b> ${lapNum}<br>` +
			`<b>Index:</b> ${idx}<br>` +
			(dateStr ? `<b>Time:</b> ${dateStr}<br>` : '') +
			(rideTime ? `<b>Ride Time:</b> ${rideTime}<br>` : '') +
			(distanceStr ? `<b>Distance:</b> ${distanceStr} </b>` : '') +
			(alt ? `<b>Alt:</b> ${alt}<br>` : '') +
			(hr ? `<b>HR:</b> ${hr}<br>` : '') +
			(speed ? `<b>Speed:</b> ${speed}<br>` : '') +
			(power ? `<b>Power:</b> ${power}<br>` : '') +
			(cadence ? `<b>Cadence:</b> ${cadence}` : '')
		);
	}

	function drawMapForLap(lapIdx) {
		// Remove all layers except base layers and controls
		map.eachLayer((layer) => {
			if (!Object.values(baseLayers).includes(layer)) {
				map.removeLayer(layer);
			}
		});
		if (markerClusterGroup) markerClusterGroup.clearLayers();

		let coords = [];
		const lapMesgs = window.globalData.lapMesgs || [];
		const recordMesgs = window.globalData.recordMesgs || [];

		// Helper: find lap number for a given point index
		function getLapNumForIdx(idx) {
			for (let i = 0; i < lapMesgs.length; i++) {
				const lap = lapMesgs[i];
				if (
					lap.start_index != null &&
					lap.end_index != null &&
					idx >= lap.start_index &&
					idx <= lap.end_index
				) {
					return i + 1;
				}
			}
			return null;
		}

		if (lapIdx !== undefined && lapIdx !== 'all' && lapMesgs.length > 0) {
			const lap = lapMesgs[Number(lapIdx)];
			if (
				lap &&
				lap.start_index != null &&
				lap.end_index != null &&
				lap.start_index <= lap.end_index &&
				lap.start_index >= 0 &&
				lap.end_index < recordMesgs.length
			) {
				const lapRecords = recordMesgs.slice(
					lap.start_index,
					lap.end_index + 1,
				);
				coords = lapRecords
					.map((row, idx) => {
						if (
							typeof row.positionLat === 'number' &&
							typeof row.positionLong === 'number'
						) {
							return [
								Number((row.positionLat / 2 ** 31) * 180),
								Number((row.positionLong / 2 ** 31) * 180),
								row.timestamp || null,
								row.altitude || null,
								row.heartRate || null,
								row.speed || null,
								lap.start_index + idx, // global index
								row,
								Number(lapIdx) + 1,
							];
						}
						return null;
					})
					.filter((coord) => coord !== null);
			} else {
				mapContainer.innerHTML = `<p>Lap index out of bounds or invalid.<br>Lap: ${lapIdx}<br>start_index: ${
					lap && lap.start_index
				}<br>end_index: ${lap && lap.end_index}<br>recordMesgs: ${
					recordMesgs.length
				}<br>lapMesgs: ${lapMesgs.length}</p>`;
				return;
			}
		} else {
			// Show all points, but compute actual lap for each
			coords = recordMesgs
				.map((row, idx) => {
					if (
						typeof row.positionLat === 'number' &&
						typeof row.positionLong === 'number'
					) {
						return [
							Number((row.positionLat / 2 ** 31) * 180),
							Number((row.positionLong / 2 ** 31) * 180),
							row.timestamp || null,
							row.altitude || null,
							row.heartRate || null,
							row.speed || null,
							idx,
							row,
							getLapNumForIdx(idx),
						];
					}
					return null;
				})
				.filter((coord) => coord !== null);
		}

		if (coords.length > 0) {
			const polyColor = getLapColor(lapIdx);
			const polyline = L.polyline(
				coords.map((c) => [c[0], c[1]]),
				{
					color: polyColor,
					weight: 4,
					opacity: 0.9,
					dashArray: lapIdx === 'all' ? '6, 8' : null,
				},
			).addTo(map);
			map.fitBounds(polyline.getBounds(), { padding: [20, 20] });

			const start = coords[0];
			const end = coords[coords.length - 1];
			L.marker([start[0], start[1]], { title: 'Start', icon: startIcon })
				.addTo(map)
				.bindPopup('Start');
			L.marker([end[0], end[1]], { title: 'End', icon: endIcon })
				.addTo(map)
				.bindPopup('End');

			for (
				let i = 0;
				i < coords.length;
				i += Math.max(1, Math.floor(coords.length / 50))
			) {
				const c = coords[i];
				const marker = L.circleMarker([c[0], c[1]], {
					radius: 4,
					color: polyColor,
					fillColor: '#fff',
					fillOpacity: 0.85,
					weight: 2,
				});
				if (markerClusterGroup) {
					markerClusterGroup.addLayer(marker);
				} else {
					marker.addTo(map);
				}
				const lapDisplay = c[8] || 1;
				marker.bindTooltip(formatTooltipData(c[6], c[7], lapDisplay), {
					direction: 'top',
					sticky: true,
				});
			}
		} else {
			mapContainer.innerHTML = `<p>No location data available to display map.<br>Lap: ${lapIdx}<br>recordMesgs: ${recordMesgs.length}<br>lapMesgs: ${lapMesgs.length}</p>`;
		}
	}

	// Draw all by default
	if (window.globalData && window.globalData.recordMesgs) {
		drawMapForLap('all');
	}

	// --- Theme support (dark/light) ---
	const updateMapTheme = () => {
		const isDark = document.body.classList.contains('theme-dark');
		const leafletMap = document.getElementById('leaflet-map');
		if (leafletMap) {
			leafletMap.style.filter = isDark
				? 'invert(0.92) hue-rotate(180deg) brightness(0.9) contrast(1.1)'
				: 'none';
		}
	};
	updateMapTheme();
	if (!window._mapThemeListener) {
		window._mapThemeListener = () => updateMapTheme();
		document.body.addEventListener('themechange', window._mapThemeListener);
	}
}
