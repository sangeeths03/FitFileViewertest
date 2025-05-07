/*global L */
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
import { addSimpleMeasureTool } from './mapMeasureTool.js';
import { addLapSelector } from './mapLapSelector.js';
import { getLapColor } from './mapColors.js';
import { formatTooltipData } from './formatTooltipData.js';
import { getLapNumForIdx } from './getLapNumForIdx.js';
import { drawMapForLap } from './drawMapForLap.js';
import { updateMapTheme } from './updateMapTheme.js';
import { createStartIcon, createEndIcon } from './mapIcons.js';
import { baseLayers } from './mapBaseLayers.js';
import { createPrintButton, createExportGPXButton, createElevationProfileButton, createMarkerCountSelector } from './mapActionButtons.js';
import { addFullscreenControl } from './mapFullscreenControl.js';

export function renderMap() {
	const mapContainer = document.getElementById('content-map');
	// Fix: Remove any previous Leaflet map instance to avoid grey background bug
	if (window._leafletMapInstance && window._leafletMapInstance.remove) {
		window._leafletMapInstance.remove();
		window._leafletMapInstance = null;
	}
	const oldMapDiv = document.getElementById('leaflet-map');
	if (oldMapDiv) {
		oldMapDiv.remove();
	}
	mapContainer.innerHTML = `
		<div id="leaflet-map"></div>
		<div id="map-controls"></div>
	`;

	const map = L.map('leaflet-map', {
		center: [0, 0],
		zoom: 2,
		layers: [baseLayers['OpenStreetMap']],
		fullscreenControl: true,
	});
	window._leafletMapInstance = map;

	// eslint-disable-next-line no-unused-vars
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
	const controlsDiv = document.getElementById('map-controls');
	controlsDiv.appendChild(createPrintButton());
	controlsDiv.appendChild(createExportGPXButton());
	controlsDiv.appendChild(createElevationProfileButton());
	// Add marker count selector
	controlsDiv.appendChild(createMarkerCountSelector(() => {
		// Redraw map with new marker count
		if (window.globalData && window.globalData.recordMesgs) {
			drawMapForLapWrapper('all');
		}
	}));

	// --- Fullscreen button (custom, styled, top left) ---
	addFullscreenControl(map);

	// --- Custom icons for start/end ---
	const startIcon = createStartIcon();
	const endIcon = createEndIcon();

	// --- Marker cluster group (if available) ---
	let markerClusterGroup = null;
	if (window.L && L.markerClusterGroup) {
		markerClusterGroup = L.markerClusterGroup();
		map.addLayer(markerClusterGroup);
	}

	// --- Lap selection UI (moved to mapLapSelector.js) ---
	function drawMapForLapWrapper(lapIdx) {
		drawMapForLap(lapIdx, {
			map,
			baseLayers,
			markerClusterGroup,
			startIcon,
			endIcon,
			mapContainer,
			getLapColor,
			formatTooltipData,
			getLapNumForIdx
		});
	}
	addLapSelector(map, document.getElementById('leaflet-map'), drawMapForLapWrapper);

	// --- Simple point-to-point measurement tool ---
	addSimpleMeasureTool(map, controlsDiv);

	// --- Minimap (if plugin available) ---
	if (window.L && L.Control && L.Control.MiniMap) {
		// Always use a standard tile layer for the minimap
		const miniMapLayer = L.tileLayer(
			'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
			{
				attribution: '',
			},
		);
		// eslint-disable-next-line no-unused-vars
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

	// Draw all by default
	if (window.globalData && window.globalData.recordMesgs) {
		drawMapForLapWrapper('all');
	}

	// --- Theme support (dark/light) ---
	updateMapTheme();
	if (!window._mapThemeListener) {
		window._mapThemeListener = () => updateMapTheme();
		document.body.addEventListener('themechange', window._mapThemeListener);
	}
}
