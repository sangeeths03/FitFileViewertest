import { getOverlayFileName, overlayColorPalette } from './mapActionButtons.js';

/* global L */
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

// Patch lapMesgs to add start_index and end_index if missing
function patchLapIndices(lapMesgs, recordMesgs) {
	for (let i = 0; i < lapMesgs.length; ++i) {
		const lap = lapMesgs[i];
		if (lap.start_index == null || lap.end_index == null) {
			// Find closest record index for start and end positions
			const startIdx = findClosestRecordIndexByLatLon(lap.startPositionLat, lap.startPositionLong, recordMesgs);
			let endIdx = findClosestRecordIndexByLatLon(lap.endPositionLat, lap.endPositionLong, recordMesgs);
			if (endIdx === -1) endIdx = recordMesgs.length - 1;
			lap.start_index = startIdx;
			lap.end_index = endIdx;
			console.log(`[patchLapIndices] Lap ${i+1}: start_index=${startIdx}, end_index=${endIdx}`);
		}
	}
}

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
	console.log('[drawMapForLap] ENTERED FUNCTION, lapIdx =', lapIdx, 'type:', typeof lapIdx, Array.isArray(lapIdx) ? 'isArray' : 'notArray');
	let coords = [];
	const lapMesgs = window.globalData.lapMesgs || [];
	const recordMesgs = window.globalData.recordMesgs || [];

	patchLapIndices(lapMesgs, recordMesgs);

	// Helper: Wait until map container is visible and sized before fitBounds
	function safeFitBounds(map, bounds, options = {}) {
		function tryFit() {
			if (
				map._container &&
				map._container.offsetParent !== null &&
				map._container.clientWidth > 0 &&
				map._container.clientHeight > 0
			) {
				map.invalidateSize();
				map.fitBounds(bounds, options);
			} else {
				requestAnimationFrame(tryFit);
			}
		}
		tryFit();
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

	// --- FIX: handle both string 'all' and array containing 'all' ---
	if (lapIdx === 'all' || (Array.isArray(lapIdx) && lapIdx.includes('all'))) {
		console.log('[drawMapForLap] "all" laps mode: recordMesgs.length =', recordMesgs.length, 'lapMesgs.length =', lapMesgs.length);
		console.log('[drawMapForLap] lapMesgs[0]:', lapMesgs[0]);
		console.log('[drawMapForLap] lapMesgs[1]:', lapMesgs[1]);
		console.log('[drawMapForLap] lapMesgs[2]:', lapMesgs[2]);
		// Test getLapNumForIdx for first few indices
		if (getLapNumForIdx) {
			for (let testIdx = 0; testIdx < 3; ++testIdx) {
				const lapNum = getLapNumForIdx(testIdx, lapMesgs);
				console.log(`[drawMapForLap] getLapNumForIdx(${testIdx}, lapMesgs) =`, lapNum);
			}
		}
		coords = recordMesgs
			.map((row, idx) => {
				if (
					typeof row.positionLat === 'number' &&
					typeof row.positionLong === 'number'
				) {
					let lapNum = 1;
					if (getLapNumForIdx) {
						lapNum = getLapNumForIdx(idx, lapMesgs);
						if (!lapNum || isNaN(lapNum)) lapNum = 1;
					}
					if (idx < 10 || idx > recordMesgs.length - 10) {
						console.log(`[drawMapForLap] idx=${idx}, lapNum=${lapNum}, lat=${row.positionLat}, lon=${row.positionLong}`);
					}
					return [
						Number((row.positionLat / 2 ** 31) * 180),
						Number((row.positionLong / 2 ** 31) * 180),
						row.timestamp || null,
						row.altitude || null,
						row.heartRate || null,
						row.speed || null,
						idx,
						row,
						lapNum
					];
				}
				return null;
			})
			.filter((coord) => coord !== null);
		if (coords.length === 0) {
			mapContainer.innerHTML = `<p>No location data available to display map.<br>Lap: ${lapIdx}<br>recordMesgs: ${recordMesgs.length}<br>lapMesgs: ${lapMesgs.length}</p>`;
			return;
		}
		if (coords.length > 0) {
			const polyColor = getLapColor('all');
			console.log('[drawMapForLap] Drawing polyline for all laps, coords.length =', coords.length);
			const polyline = L.polyline(
				coords.map((c) => [c[0], c[1]]),
				{
					color: polyColor,
					weight: 4,
					opacity: 0.9,
					dashArray: '6, 8',
				},
			).addTo(map);
			map.invalidateSize();
			map.fitBounds(polyline.getBounds(), { padding: [20, 20] });
			const start = coords[0];
			const end = coords[coords.length - 1];
			if (startIcon && endIcon) {
				L.marker([start[0], start[1]], { title: 'Start', icon: startIcon, zIndexOffset: 2000 })
					.addTo(map)
					.bindPopup('Start');
				L.marker([end[0], end[1]], { title: 'End', icon: endIcon, zIndexOffset: 2000 })
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
				let lapDisplay = c[8]; // c[8] is set to lapNum above
				if (!lapDisplay || isNaN(lapDisplay)) lapDisplay = 1;
				if (i < 10 || i > coords.length - 10) {
					console.log(`[drawMapForLap] Marker i=${i}, c[6]=${c[6]}, lapDisplay=${lapDisplay}`);
				}
				const marker = L.circleMarker([c[0], c[1]], {
					radius: 4,
					color: polyColor,
					fillColor: '#fff',
					fillOpacity: 0.85,
					weight: 2,
					zIndexOffset: 1500,
				});
				if (markerClusterGroup) {
					markerClusterGroup.addLayer(marker);
				} else {
					marker.addTo(map);
				}
				marker.bindTooltip(formatTooltipData(c[6], c[7], lapDisplay), {
					direction: 'top',
					sticky: true,
				});
			}
		}
		// Draw overlays if present (reuse existing logic)
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
			let allBounds = null;
			for (let i = 1; i < window.loadedFitFiles.length; ++i) {
				const overlay = window.loadedFitFiles[i];
				const color = colorPalette[overlayIdx % colorPalette.length];
				const fileName =
					typeof getOverlayFileName === 'function'
						? getOverlayFileName(i)
						: overlay.filePath || '';
				const bounds = drawOverlayForFitFile({
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
				if (bounds) {
					if (!allBounds) allBounds = bounds;
					else allBounds.extend(bounds);
				}
				overlayIdx++;
			}
			if (allBounds) {
				safeFitBounds(map, allBounds, { padding: [20, 20] });
			}
		}
		return;
	}

	if (Array.isArray(lapIdx)) {
		console.log('[drawMapForLap] lapIdx is array:', lapIdx);
		// If 'all' is included, treat as 'all' laps mode (single polyline, global record indices)
		if (lapIdx.includes('all')) {
			console.log('[drawMapForLap] "all" laps mode: recordMesgs.length =', recordMesgs.length, 'lapMesgs.length =', lapMesgs.length, 'lapMesgs[0]=', lapMesgs[0]);
			coords = recordMesgs
				.map((row, idx) => {
					if (
						typeof row.positionLat === 'number' &&
						typeof row.positionLong === 'number'
					) {
						let lapNum = 1;
						if (getLapNumForIdx) {
							lapNum = getLapNumForIdx(idx, lapMesgs);
							if (!lapNum || isNaN(lapNum)) lapNum = 1;
						}
						if (idx < 10 || idx > recordMesgs.length - 10) {
							console.log(`[drawMapForLap] idx=${idx}, lapNum=${lapNum}, lat=${row.positionLat}, lon=${row.positionLong}`);
						}
						return [
							Number((row.positionLat / 2 ** 31) * 180),
							Number((row.positionLong / 2 ** 31) * 180),
							row.timestamp || null,
							row.altitude || null,
							row.heartRate || null,
							row.speed || null,
							idx,
							row,
							lapNum
						];
					}
					return null;
				})
				.filter((coord) => coord !== null);
			if (coords.length === 0) {
				mapContainer.innerHTML = `<p>No location data available to display map.<br>Lap: ${lapIdx}<br>recordMesgs: ${recordMesgs.length}<br>lapMesgs: ${lapMesgs.length}</p>`;
				return;
			}
			if (coords.length > 0) {
				const polyColor = getLapColor('all');
				console.log('[drawMapForLap] Drawing polyline for all laps, coords.length =', coords.length);
				const polyline = L.polyline(
					coords.map((c) => [c[0], c[1]]),
					{
						color: polyColor,
						weight: 4,
						opacity: 0.9,
						dashArray: '6, 8',
					},
				).addTo(map);
				map.invalidateSize();
				map.fitBounds(polyline.getBounds(), { padding: [20, 20] });
				const start = coords[0];
				const end = coords[coords.length - 1];
				if (startIcon && endIcon) {
					L.marker([start[0], start[1]], { title: 'Start', icon: startIcon, zIndexOffset: 2000 })
						.addTo(map)
						.bindPopup('Start');
					L.marker([end[0], end[1]], { title: 'End', icon: endIcon, zIndexOffset: 2000 })
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
					let lapDisplay = c[8]; // c[8] is set to lapNum above
					if (!lapDisplay || isNaN(lapDisplay)) lapDisplay = 1;
					if (i < 10 || i > coords.length - 10) {
						console.log(`[drawMapForLap] Marker i=${i}, c[6]=${c[6]}, lapDisplay=${lapDisplay}`);
					}
					const marker = L.circleMarker([c[0], c[1]], {
						radius: 4,
						color: polyColor,
						fillColor: '#fff',
						fillOpacity: 0.85,
						weight: 2,
						zIndexOffset: 1500,
					});
					if (markerClusterGroup) {
						markerClusterGroup.addLayer(marker);
					} else {
						marker.addTo(map);
					}
					marker.bindTooltip(formatTooltipData(c[6], c[7], lapDisplay), {
						direction: 'top',
						sticky: true,
					});
				}
			}
			// Draw overlays if present (reuse existing logic)
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
				let allBounds = null;
				for (let i = 1; i < window.loadedFitFiles.length; ++i) {
					const overlay = window.loadedFitFiles[i];
					const color = colorPalette[overlayIdx % colorPalette.length];
					const fileName =
						typeof getOverlayFileName === 'function'
							? getOverlayFileName(i)
							: overlay.filePath || '';
					const bounds = drawOverlayForFitFile({
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
					if (bounds) {
						if (!allBounds) allBounds = bounds;
						else allBounds.extend(bounds);
					}
					overlayIdx++;
				}
				if (allBounds) {
					safeFitBounds(map, allBounds, { padding: [20, 20] });
				}
			}
			return;
		}
		// Existing code for multi-lap (not 'all')
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
								zIndexOffset: 2000,
							})
								.addTo(map)
								.bindPopup('Start');
							L.marker([end[0], end[1]], { title: 'End', icon: endIcon, zIndexOffset: 2000 })
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
								zIndexOffset: 1500,
							});
							if (markerClusterGroup) {
								markerClusterGroup.addLayer(marker);
							} else {
								marker.addTo(map);
							}
							let lapDisplay;
							if (lapIdx === 'all' || (Array.isArray(lapIdx) && lapIdx.includes('all'))) {
								lapDisplay = getLapNumForIdx ? getLapNumForIdx(c[6], lapMesgs) : (c[8] || 1);
								if (!lapDisplay) lapDisplay = 1;
							} else {
								lapDisplay = c[8] || 1;
							}
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
			let allBounds = null;
			for (let i = 1; i < window.loadedFitFiles.length; ++i) {
				const overlay = window.loadedFitFiles[i];
				const color = colorPalette[overlayIdx % colorPalette.length];
				const fileName =
					typeof getOverlayFileName === 'function'
						? getOverlayFileName(i)
						: overlay.filePath || '';
				const bounds = drawOverlayForFitFile({
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
				if (bounds) {
					if (!allBounds) allBounds = bounds;
					else allBounds.extend(bounds);
				}
				overlayIdx++;
			}
			if (allBounds) {
				safeFitBounds(map, allBounds, { padding: [20, 20] });
			}
			return;
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

	if (coords.length === 0) {
		mapContainer.innerHTML = `<p>No location data available to display map.<br>Lap: ${lapIdx}<br>recordMesgs: ${recordMesgs.length}<br>lapMesgs: ${lapMesgs.length}</p>`;
		return;
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

		// Fix: Ensure map is sized before fitBounds
		map.invalidateSize();
		map.fitBounds(polyline.getBounds(), { padding: [20, 20] });

		const start = coords[0];
		const end = coords[coords.length - 1];
		L.marker([start[0], start[1]], { title: 'Start', icon: startIcon, zIndexOffset: 2000 })
			.addTo(map)
			.bindPopup('Start');
		L.marker([end[0], end[1]], { title: 'End', icon: endIcon, zIndexOffset: 2000 })
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
				zIndexOffset: 1500,
			});
			if (markerClusterGroup) {
				markerClusterGroup.addLayer(marker);
			} else {
				marker.addTo(map);
			}
			let lapDisplay;
			if (lapIdx === 'all' || (Array.isArray(lapIdx) && lapIdx.includes('all'))) {
				lapDisplay = getLapNumForIdx ? getLapNumForIdx(c[6], lapMesgs) : (c[8] || 1);
				if (!lapDisplay) lapDisplay = 1;
			} else {
				lapDisplay = c[8] || 1;
			}
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
			let allBounds = null;
			for (let i = 1; i < window.loadedFitFiles.length; ++i) {
				const overlay = window.loadedFitFiles[i];
				const color = colorPalette[overlayIdx % colorPalette.length];
				const fileName =
					typeof getOverlayFileName === 'function'
						? getOverlayFileName(i)
						: overlay.filePath || '';
				const bounds = drawOverlayForFitFile({
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
				if (bounds) {
					if (!allBounds) allBounds = bounds;
					else allBounds.extend(bounds);
				}
				overlayIdx++;
			}
			if (allBounds) {
				safeFitBounds(map, allBounds, { padding: [20, 20] });
			}
		}
	} else {
		mapContainer.innerHTML = `<p>No location data available to display map.<br>Lap: ${lapIdx}<br>recordMesgs: ${recordMesgs.length}<br>lapMesgs: ${lapMesgs.length}</p>`;
	}
}

// Draws a polyline, markers, and tooltips for a given FIT file's data as an overlay
/**
 * Draws a polyline, markers, and tooltips for a given FIT file's data as an overlay on the map.
 *
 * @param {Object} options - The options for drawing the overlay.
 * @param {Object} options.fitData - The FIT file data containing `recordMesgs` and `lapMesgs`.
 * @param {Array} options.fitData.recordMesgs - Array of records with properties like `positionLat`, `positionLong`, `timestamp`, etc.
 * @param {Array} options.fitData.lapMesgs - Array of lap messages, used for lap-specific data.
 * @param {Object} options.map - The Leaflet map instance to draw on.
 * @param {string} [options.color] - The color for the polyline. This parameter is retained for API compatibility but is overridden by the `overlayIdx`-based palette.
 * @param {Object} [options.markerClusterGroup] - A Leaflet marker cluster group for clustering markers.
 * @param {L.Icon} [options.startIcon] - The icon for the start marker.
 * @param {L.Icon} [options.endIcon] - The icon for the end marker.
 * @param {Function} [options.formatTooltipData] - Function to format tooltip content for markers.
 * @param {Function} [options.getLapNumForIdx] - Function to get the lap number for a given record index.
 * @param {string} [options.fileName] - The name of the FIT file, displayed in tooltips.
 * @param {number} [options.overlayIdx] - The index of the overlay, used for highlighting logic.
 */
export function drawOverlayForFitFile({
	fitData,
	map,
	// eslint-disable-next-line no-unused-vars -- API Compability
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
	// Patch lap indices for overlays as well
	patchLapIndices(lapMesgs, recordMesgs);
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

	if (coords.length === 0) {
		console.warn(`[drawOverlayForFitFile] No valid location data in overlay file: ${fileName || ''}`);
		return null;
	}

	if (coords.length > 0) {
		const isHighlighted =
			typeof overlayIdx === 'number' &&
			window._highlightedOverlayIdx === overlayIdx;

		const paletteColor =
			Array.isArray(overlayColorPalette) && overlayColorPalette.length > 0 && typeof overlayIdx === 'number'
				? overlayColorPalette[overlayIdx % overlayColorPalette.length]
				: '#1976d2'; // Default fallback color
		const polyline = L.polyline(
			coords.map((c) => [c[0], c[1]]),
			{
				color: paletteColor,
				weight: isHighlighted ? 10 : 4,
				opacity: 0.95,
				dashArray: null,
				className: isHighlighted ? 'overlay-highlight-glow' : '',
			}
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
		// --- Ensure start/end markers are always above polylines ---
		if (startIcon && endIcon) {
			L.marker([start[0], start[1]], { title: 'Start', icon: startIcon, zIndexOffset: 2000 })
				.addTo(map)
				.bindPopup('Start');
			L.marker([end[0], end[1]], { title: 'End', icon: endIcon, zIndexOffset: 2000 })
				.addTo(map)
				.bindPopup('End');
		}

		// --- Ensure data point markers are above polylines ---
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
				zIndexOffset: 1500, // <-- ensure above polylines
			});
			if (markerClusterGroup) {
				markerClusterGroup.addLayer(marker);
			} else {
				marker.addTo(map);
			}
			let lapDisplay;
			if (getLapNumForIdx && fitData && fitData.lapMesgs && fitData.lapMesgs.length > 0) {
				lapDisplay = getLapNumForIdx(c[6], fitData.lapMesgs);
			} else {
				lapDisplay = c[8] || 1;
			}
			let tooltip = formatTooltipData
				? formatTooltipData(c[6], c[7], lapDisplay, recordMesgs)
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
