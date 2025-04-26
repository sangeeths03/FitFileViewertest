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
		<div id="leaflet-map" style="height: 800px;"></div>
		<div id="map-controls" style="margin-top: 8px;"></div>
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
		CartoDB_Positron: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
			attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
		}),
		CartoDB_DarkMatter: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
			attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
		}),
		Esri_Topo: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
			attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
		}),
		Esri_WorldStreetMap: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
			attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
		}),
		Esri_WorldImagery: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
			attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
		}),
		Esri_WorldTerrain: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}', {
			attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
		}),
		Esri_WorldPhysical: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
			attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
		}),
		Esri_WorldShadedRelief: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}', {
			attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
		}),
		Esri_WorldGrayCanvas: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
			attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
		}),
		Esri_WorldImagery_Labels: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
			attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
		}),
		Esri_WorldStreetMap_Labels: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
			attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
		}),
		Esri_WorldTopo_Labels: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
			attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
		}),
		Esri_NatGeo: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
			attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ',
		}),
		CyclOSM: L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
			attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://www.cyclosm.org/">CyclOSM</a>',
		}),
		Thunderforest_Cycle: L.tileLayer('https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png', {
			attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://www.thunderforest.com/">Thunderforest</a>',
		}),
		Thunderforest_Transport: L.tileLayer('https://tile.thunderforest.com/transport/{z}/{x}/{y}.png', {
			attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://www.thunderforest.com/">Thunderforest</a>',
		}),
		OpenRailwayMap: L.tileLayer('https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
			attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://www.openrailwaymap.org/">OpenRailwayMap</a>',
		}),
		OpenSeaMap: L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
			attribution: 'Map data &copy; <a href="https://www.openseamap.org">OpenSeaMap</a> contributors',
		}),
		WaymarkedTrails_Cycling: L.tileLayer('https://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png', {
			attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://cycling.waymarkedtrails.org/">Waymarked Trails Cycling</a>',
		}),
		WaymarkedTrails_Hiking: L.tileLayer('https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png', {
			attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://hiking.waymarkedtrails.org/">Waymarked Trails Hiking</a>',
		}),
		WaymarkedTrails_Slopes: L.tileLayer('https://tile.waymarkedtrails.org/slopes/{z}/{x}/{y}.png', {
			attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://slopes.waymarkedtrails.org/">Waymarked Trails Riding</a>',
		}),
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
		Humanitarian: L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
			attribution: 'Tiles &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://www.openstreetmap.fr/fonds-de-carte/">Humanitarian OSM</a>',
			subdomains: 'ab',
		}),
		OSM_France: L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
			attribution: 'Tiles &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://www.openstreetmap.fr/fonds-de-carte/">OSM France</a>',
			subdomains: 'abc',
		}),

	};

	const map = L.map('leaflet-map', {
		center: [0, 0],
		zoom: 2,
		layers: [baseLayers['OpenStreetMap']],
		fullscreenControl: true,
	});

	L.control
		.layers(baseLayers, null, { position: 'topright', collapsed: false })
		.addTo(map);
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
		const miniMapLayer = baseLayers['OpenStreetMap'].clone
			? baseLayers['OpenStreetMap'].clone()
			: baseLayers['OpenStreetMap'];
		const miniMap = new L.Control.MiniMap(miniMapLayer, {
			toggleDisplay: true,
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

	// --- Main polyline and markers ---
	if (window.globalData && window.globalData.recordMesgs) {
		const coords = window.globalData.recordMesgs
			.filter((row) => row.positionLat != null && row.positionLong != null)
			.map((row) => {
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
					];
				}
				return null;
			})
			.filter((coord) => coord !== null);

		if (coords.length > 0) {
			// Polyline with custom style
			const polyline = L.polyline(
				coords.map((c) => [c[0], c[1]]),
				{
					color: 'blue',
					weight: 4,
					opacity: 0.8,
					dashArray: '6, 8',
				},
			).addTo(map);
			map.fitBounds(polyline.getBounds(), { padding: [20, 20] });

			// Start/End markers with custom icons
			const start = coords[0];
			const end = coords[coords.length - 1];
			L.marker([start[0], start[1]], { title: 'Start', icon: startIcon })
				.addTo(map)
				.bindPopup('Start');
			L.marker([end[0], end[1]], { title: 'End', icon: endIcon })
				.addTo(map)
				.bindPopup('End');

			// Markers with tooltips for every Nth point (reduce clutter)
			for (
				let i = 0;
				i < coords.length;
				i += Math.max(1, Math.floor(coords.length / 50))
			) {
				const c = coords[i];
				const marker = L.circleMarker([c[0], c[1]], {
					radius: 4,
					color: '#333',
					fillColor: '#fff',
					fillOpacity: 0.7,
					weight: 1,
				});
				if (markerClusterGroup) {
					markerClusterGroup.addLayer(marker);
				} else {
					marker.addTo(map);
				}
				marker.bindTooltip(
					`<b>Index:</b> ${i}<br>` +
						(c[2] ? `<b>Time:</b> ${c[2]}<br>` : '') +
						(c[3] ? `<b>Alt:</b> ${c[3]}<br>` : '') +
						(c[4] ? `<b>HR:</b> ${c[4]}<br>` : '') +
						(c[5] ? `<b>Speed:</b> ${c[5]}` : ''),
					{ direction: 'top', sticky: true },
				);
			}
		} else {
			mapContainer.innerHTML =
				'<p>No location data available to display map.</p>';
		}
	} else {
		mapContainer.innerHTML =
			'<p>No location data available to display map.</p>';
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
