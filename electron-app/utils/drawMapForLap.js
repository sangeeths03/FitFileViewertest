// Draws the map for a given lap or laps
// Dependencies must be passed as arguments: map, baseLayers, markerClusterGroup, startIcon, endIcon, mapContainer, getLapColor, formatTooltipData, getLapNumForIdx
export function drawMapForLap(lapIdx, {
	map,
	baseLayers,
	markerClusterGroup,
	startIcon,
	endIcon,
	mapContainer,
	getLapColor,
	formatTooltipData,
	getLapNumForIdx
}) {
	let coords = [];
	const lapMesgs = window.globalData.lapMesgs || [];
	const recordMesgs = window.globalData.recordMesgs || [];

	// Remove all layers except base layers and controls
	map.eachLayer((layer) => {
		if (!Object.values(baseLayers).includes(layer)) {
			map.removeLayer(layer);
		}
	});
	if (markerClusterGroup) markerClusterGroup.clearLayers();

	if (Array.isArray(lapIdx)) {
		let bounds = null;
		const showIcons = lapIdx.length === 1 || (lapIdx.length === 1 && lapIdx[0] === 'all');
		lapIdx.forEach((lapVal, i) => {
			if (lapVal === 'all') return;
			const lap = lapMesgs[Number(lapVal)];
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
				const coords = lapRecords
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
								lap.start_index + idx,
								row,
								Number(lapVal) + 1,
							];
						}
						return null;
					})
					.filter((coord) => coord !== null);
				if (coords.length > 0) {
					const polyColor = getLapColor(lapVal);
					const polyline = L.polyline(
						coords.map((c) => [c[0], c[1]]),
						{
							color: polyColor,
							weight: 4,
							opacity: 0.9,
							dashArray: null,
						},
					).addTo(map);
					if (!bounds) bounds = polyline.getBounds();
					else bounds.extend(polyline.getBounds());
					const start = coords[0];
					const end = coords[coords.length - 1];
					if (showIcons) {
						L.marker([start[0], start[1]], { title: 'Start', icon: startIcon })
							.addTo(map)
							.bindPopup('Start');
						L.marker([end[0], end[1]], { title: 'End', icon: endIcon })
							.addTo(map)
							.bindPopup('End');
					}
					for (
						let j = 0;
						j < coords.length;
						j += Math.max(1, Math.floor(coords.length / 50))
					) {
						const c = coords[j];
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
				}
			}
		});
		if (bounds) map.fitBounds(bounds, { padding: [20, 20] });
		return;
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
							lap.start_index + idx,
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
			}<br>end_index: ${
				lap && lap.end_index
			}<br>recordMesgs: ${
				recordMesgs.length
			}<br>lapMesgs: ${lapMesgs.length}</p>`;
			return;
		}
	} else {
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
						getLapNumForIdx(idx, lapMesgs),
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
