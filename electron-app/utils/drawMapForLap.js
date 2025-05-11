import { getOverlayFileName, overlayColorPalette } from './mapActionButtons.js';

/* global L */
// Draws the map for a given lap or laps
// Dependencies must be passed as arguments: map, baseLayers, markerClusterGroup, startIcon, endIcon, mapContainer, getLapColor, formatTooltipData, getLapNumForIdx
export function drawMapForLap(
	lapIdx,
	{
		map,
		baseLayers,
		markerClusterGroup,
		startIcon,
		endIcon,
		mapContainer,
		getLapColor,
		formatTooltipData,
		getLapNumForIdx,
	},
) {
	let coords = [];
	const lapMesgs = window.globalData.lapMesgs || [];
	const recordMesgs = window.globalData.recordMesgs || [];

	// Helper to find the index in recordMesgs closest to a given lat/lon
	function findClosestRecordIndexByLatLon(lat, lon, records) {
		let minDist = Infinity;
		let minIdx = -1;
		for (let i = 0; i < records.length; ++i) {
			const r = records[i];
			if (
				typeof r.positionLat === 'number' &&
				typeof r.positionLong === 'number'
			) {
				const dLat = r.positionLat - lat;
				const dLon = r.positionLong - lon;
				const dist = dLat * dLat + dLon * dLon;
				if (dist < minDist) {
					minDist = dist;
					minIdx = i;
				}
			}
		}
		return minIdx;
	}

	// If lapIdx is an array with one element (not "all"), treat as single lap
	if (Array.isArray(lapIdx) && lapIdx.length === 1 && lapIdx[0] !== 'all') {
		lapIdx = lapIdx[0];
	}

	// Remove all layers except base layers and controls
	map.eachLayer((layer) => {
		if (!Object.values(baseLayers).includes(layer)) {
			map.removeLayer(layer);
		}
	});
	if (markerClusterGroup) markerClusterGroup.clearLayers();

	if (Array.isArray(lapIdx)) {
		let bounds = null;
		const showIcons =
			lapIdx.length === 1 || (lapIdx.length === 1 && lapIdx[0] === 'all');
		lapIdx.forEach((lapVal) => {
			if (lapVal === 'all') return;
			const lap = lapMesgs[Number(lapVal)];
			if (
				lap &&
				lap.startPositionLat != null &&
				lap.startPositionLong != null &&
				lap.endPositionLat != null &&
				lap.endPositionLong != null
			) {
				const startIdx = findClosestRecordIndexByLatLon(
					lap.startPositionLat,
					lap.startPositionLong,
					recordMesgs,
				);
				let endIdx = findClosestRecordIndexByLatLon(
					lap.endPositionLat,
					lap.endPositionLong,
					recordMesgs,
				);
				if (endIdx === -1) {
					// Fallback: use the last record
					endIdx = recordMesgs.length - 1;
				}
				if (startIdx !== -1 && endIdx !== -1 && startIdx <= endIdx) {
					const lapRecords = recordMesgs.slice(startIdx, endIdx + 1);
					const lapCoords = lapRecords
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
									startIdx + idx,
									row,
									Number(lapVal) + 1,
								];
							}
							return null;
						})
						.filter((coord) => coord !== null);
					if (lapCoords.length > 0) {
						const polyColor = getLapColor(Number(lapVal));
						const polyline = L.polyline(
							lapCoords.map((c) => [c[0], c[1]]),
							{
								color: polyColor,
								weight: 4,
								opacity: 0.9,
								dashArray: null,
							},
						).addTo(map);
						if (!bounds) bounds = polyline.getBounds();
						else bounds.extend(polyline.getBounds());
						const start = lapCoords[0];
						const end = lapCoords[lapCoords.length - 1];
						if (showIcons) {
							L.marker([start[0], start[1]], {
								title: 'Start',
								icon: startIcon,
							})
								.addTo(map)
								.bindPopup('Start');
							L.marker([end[0], end[1]], { title: 'End', icon: endIcon })
								.addTo(map)
								.bindPopup('End');
						}
						for (
							let j = 0;
							j < lapCoords.length;
							j +=
								window.mapMarkerCount === 0 || !window.mapMarkerCount
									? 1
									: Math.max(
											1,
											Math.floor(lapCoords.length / window.mapMarkerCount),
									  )
						) {
							const c = lapCoords[j];
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
			}
		});
		if (bounds) map.fitBounds(bounds, { padding: [20, 20] });
		// --- Draw overlays if present ---
		if (
			window.loadedFitFiles &&
			Array.isArray(window.loadedFitFiles) &&
			window.loadedFitFiles.length > 1
		) {
			const colorPalette = [
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
			];
			let overlayIdx = 0;
			for (let i = 1; i < window.loadedFitFiles.length; ++i) {
				const overlay = window.loadedFitFiles[i];
				const color = colorPalette[overlayIdx % colorPalette.length];
				const fileName =
					typeof getOverlayFileName === 'function'
						? getOverlayFileName(i)
						: overlay.filePath || '';
				drawOverlayForFitFile({
					fitData: overlay.data,
					map,
					color,
					markerClusterGroup,
					startIcon,
					endIcon,
					formatTooltipData,
					getLapNumForIdx,
					fileName,
					overlayIdx: i,
				});
				overlayIdx++;
			}
		}
		return;
	}

	if (lapIdx !== undefined && lapIdx !== 'all' && lapMesgs.length > 0) {
		const lap = lapMesgs[Number(lapIdx)];
		if (
			lap &&
			lap.startPositionLat != null &&
			lap.startPositionLong != null &&
			lap.endPositionLat != null &&
			lap.endPositionLong != null
		) {
			const startIdx = findClosestRecordIndexByLatLon(
				lap.startPositionLat,
				lap.startPositionLong,
				recordMesgs,
			);
			let endIdx = findClosestRecordIndexByLatLon(
				lap.endPositionLat,
				lap.endPositionLong,
				recordMesgs,
			);
			if (endIdx === -1) {
				// Fallback: use the last record
				endIdx = recordMesgs.length - 1;
			}
			if (startIdx !== -1 && endIdx !== -1 && startIdx <= endIdx) {
				const lapRecords = recordMesgs.slice(startIdx, endIdx + 1);
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
								startIdx + idx,
								row,
								Number(lapIdx) + 1,
							];
						}
						return null;
					})
					.filter((coord) => coord !== null);
			} else {
				mapContainer.innerHTML = `<p>Lap index out of bounds or invalid.<br>Lap: ${lapIdx}<br>startIdx: ${startIdx}<br>endIdx: ${endIdx}<br>recordMesgs: ${recordMesgs.length}<br>lapMesgs: ${lapMesgs.length}</p>`;
				return;
			}
		} else {
			mapContainer.innerHTML = `<p>Lap index out of bounds or invalid.<br>Lap: ${lapIdx}<br>startPositionLat: ${
				lap && lap.startPositionLat
			}<br>endPositionLat: ${lap && lap.endPositionLat}<br>recordMesgs: ${
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
			i +=
				window.mapMarkerCount === 0 || !window.mapMarkerCount
					? 1
					: Math.max(1, Math.floor(coords.length / window.mapMarkerCount))
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
		// --- Draw overlays if present ---
		if (
			window.loadedFitFiles &&
			Array.isArray(window.loadedFitFiles) &&
			window.loadedFitFiles.length > 1
		) {
			const colorPalette = [
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
			];
			let overlayIdx = 0;
			for (let i = 1; i < window.loadedFitFiles.length; ++i) {
				const overlay = window.loadedFitFiles[i];
				const color = colorPalette[overlayIdx % colorPalette.length];
				const fileName =
					typeof getOverlayFileName === 'function'
						? getOverlayFileName(i)
						: overlay.filePath || '';
				drawOverlayForFitFile({
					fitData: overlay.data,
					map,
					color,
					markerClusterGroup,
					startIcon,
					endIcon,
					formatTooltipData,
					getLapNumForIdx,
					fileName,
					overlayIdx: i,
				});
				overlayIdx++;
			}
		}
	} else {
		mapContainer.innerHTML = `<p>No location data available to display map.<br>Lap: ${lapIdx}<br>recordMesgs: ${recordMesgs.length}<br>lapMesgs: ${lapMesgs.length}</p>`;
	}
}

// Draws a polyline, markers, and tooltips for a given FIT file's data as an overlay
export function drawOverlayForFitFile({
	fitData,
	map,
	color, // keep for API compatibility, but will override below
	markerClusterGroup,
	startIcon,
	endIcon,
	formatTooltipData,
	getLapNumForIdx,
	fileName,
	overlayIdx, // pass overlayIdx for highlight logic
}) {
	const recordMesgs = fitData.recordMesgs || [];
	const lapMesgs = fitData.lapMesgs || [];
	const coords = recordMesgs
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
					getLapNumForIdx ? getLapNumForIdx(idx, lapMesgs) : 1,
				];
			}
			return null;
		})
		.filter((coord) => coord !== null);

	if (coords.length > 0) {
		const isHighlighted =
			typeof overlayIdx === 'number' &&
			window._highlightedOverlayIdx === overlayIdx;
		const paletteColor =
			typeof overlayIdx === 'number'
				? overlayColorPalette[overlayIdx % overlayColorPalette.length]
				: overlayColorPalette[0];
		const polyline = L.polyline(
			coords.map((c) => [c[0], c[1]]),
			{
				color: paletteColor,
				weight: isHighlighted ? 10 : 4,
				opacity: 0.95,
				dashArray: null,
				className: isHighlighted ? 'overlay-highlight-glow' : '',
			},
		).addTo(map);

		// Track overlay polylines for highlight updates
		if (typeof overlayIdx === 'number') {
			if (!window._overlayPolylines) window._overlayPolylines = {};
			window._overlayPolylines[overlayIdx] = polyline;
		}

		if (isHighlighted) {
			const polyElem = polyline.getElement && polyline.getElement();
			if (polyElem) {
				polyElem.style.filter =
					'drop-shadow(0 0 8px ' + (paletteColor || '#1976d2') + ')';
			}
		}

		const start = coords[0];
		const end = coords[coords.length - 1];
		if (startIcon && endIcon) {
			L.marker([start[0], start[1]], { title: 'Start', icon: startIcon })
				.addTo(map)
				.bindPopup('Start');
			L.marker([end[0], end[1]], { title: 'End', icon: endIcon })
				.addTo(map)
				.bindPopup('End');
		}

		for (
			let i = 0;
			i < coords.length;
			i +=
				window.mapMarkerCount === 0 || !window.mapMarkerCount
					? 1
					: Math.max(1, Math.floor(coords.length / window.mapMarkerCount))
		) {
			const c = coords[i];
			const marker = L.circleMarker([c[0], c[1]], {
				radius: 4,
				color: paletteColor || '#1976d2',
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
			let tooltip = formatTooltipData
				? formatTooltipData(c[6], c[7], lapDisplay)
				: '';
			if (fileName) {
				tooltip = `<b>${fileName}</b><br>` + tooltip;
			}
			marker.bindTooltip(tooltip, {
				direction: 'top',
				sticky: true,
			});
		}
		return polyline.getBounds();
	}
	return null;
}

// Add global function to update overlay highlights without redrawing the map
window.updateOverlayHighlights = function () {
	if (!window._overlayPolylines) return;
	Object.entries(window._overlayPolylines).forEach(([idx, polyline]) => {
		const isHighlighted = Number(idx) === window._highlightedOverlayIdx;
		polyline.setStyle({
			weight: isHighlighted ? 10 : 4,
			className: isHighlighted ? 'overlay-highlight-glow' : '',
			// Optionally, update color or other style here if needed
		});
		const polyElem = polyline.getElement && polyline.getElement();
		if (polyElem) {
			polyElem.style.filter = isHighlighted
				? 'drop-shadow(0 0 8px ' + (polyline.options.color || '#1976d2') + ')'
				: '';
		}
	});
};
