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
	mapContainer.innerHTML =
		'<div id="leaflet-map" style="height: 800px;"></div>';
	const map = L.map('leaflet-map').setView([0, 0], 2);
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	}).addTo(map);
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
					];
				}
				return null;
			})
			.filter((coord) => coord !== null);
		if (coords.length > 0) {
			const polyline = L.polyline(coords, { color: 'blue' }).addTo(map);
			map.fitBounds(polyline.getBounds());
		} else {
			mapContainer.innerHTML =
				'<p>No location data available to display map.</p>';
		}
	} else {
		mapContainer.innerHTML =
			'<p>No location data available to display map.</p>';
	}
}
