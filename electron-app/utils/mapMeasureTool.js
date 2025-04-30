// Simple point-to-point measurement tool for Leaflet
export function addSimpleMeasureTool(map, controlsDiv) {
	let measurePoints = [];
	let measureLine = null;
	let measureMarkers = [];
	let measureLabel = null;

	function clearMeasure() {
		measurePoints = [];
		if (measureLine) { map.removeLayer(measureLine); measureLine = null; }
		measureMarkers.forEach(m => map.removeLayer(m));
		measureMarkers = [];
		if (measureLabel) { map.removeLayer(measureLabel); measureLabel = null; }
	}

	function onMapClickMeasure(e) {
		if (measurePoints.length >= 2) {
			clearMeasure();
		}
		measurePoints.push(e.latlng);
		const marker = L.marker(e.latlng, { draggable: false });
		marker.addTo(map);
		measureMarkers.push(marker);
		if (measurePoints.length === 2) {
			measureLine = L.polyline(measurePoints, { color: '#222', dashArray: '4,6', weight: 3 }).addTo(map);
			const dist = map.distance(measurePoints[0], measurePoints[1]);
			const mid = L.latLng(
				(measurePoints[0].lat + measurePoints[1].lat) / 2,
				(measurePoints[0].lng + measurePoints[1].lng) / 2
			);
			measureLabel = L.marker(mid, {
				icon: L.divIcon({
					className: 'measure-label',
					html: `<div class="measure-label-content">${dist >= 1000 ? (dist/1000).toFixed(2) + ' km' : dist.toFixed(1) + ' m'}</div>`
				}),
				iconSize: [80, 28],
				iconAnchor: [40, 14],
				interactive: false
			}).addTo(map);
		}
	}

	function enableSimpleMeasure() {
		map.on('click', onMapClickMeasure);
	}

	const measureBtn = document.createElement('button');
	measureBtn.textContent = 'Measure';
	measureBtn.title = 'Click, then click two points on the map to measure distance';
	measureBtn.onclick = () => {
		clearMeasure();
		enableSimpleMeasure();
		measureBtn.disabled = true;
		setTimeout(() => { measureBtn.disabled = false; }, 2000);
	};
	controlsDiv.appendChild(measureBtn);
}
