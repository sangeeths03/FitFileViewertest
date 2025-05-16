// filepath: electron-app/utils/renderChartJS.js
// Chart.js rendering for FIT file data
// Assumes Chart.js is loaded as window.Chart

// Register chartjs-plugin-zoom if available
if (window.Chart && window.Chart.register && window.Chart.Zoom) {
	window.Chart.register(window.Chart.Zoom);
	console.log('[ChartJS] chartjs-plugin-zoom registered.');
} else if (window.Chart && window.Chart.register && window.chartjsPluginZoom) {
	window.Chart.register(window.chartjsPluginZoom);
	console.log('[ChartJS] chartjs-plugin-zoom registered (window.chartjsPluginZoom).');
} else if (window.Chart && window.Chart.register && window.ChartZoom) {
	window.Chart.register(window.ChartZoom);
	console.log('[ChartJS] chartjs-plugin-zoom registered (window.ChartZoom).');
} else {
	console.warn('[ChartJS] chartjs-plugin-zoom is not loaded. Zoom/pan will be unavailable.');
}

// Listen for a custom event to trigger chart re-render on file load
if (!window._fitFileViewerChartListener) {
	window._fitFileViewerChartListener = true;
	window.addEventListener('fitfile-loaded', function () {
		console.log('[ChartJS] fitfile-loaded event received, re-rendering charts');
		// Re-render charts when a new file is loaded
		renderChartJS();
	});
	// Warn if event is not dispatched after file load
	setTimeout(() => {
		if (!window._chartjsInstances || window._chartjsInstances.length === 0) {
			console.warn(
				'[ChartJS] fitfile-loaded event may not be dispatched after file load. Charts will not update until you call window.dispatchEvent(new Event("fitfile-loaded")) after loading a new file.'
			);
		}
	}, 2000);
}

// Throttle for animation progress log
let _lastAnimLog = 0;
function throttledAnimLog(msg) {
	const now = Date.now();
	if (now - _lastAnimLog > 200) {
		console.log(msg);
		_lastAnimLog = now;
	}
}

// Helper function to update animation configurations for all charts
function updateChartAnimations(chart, type) {
	if (!chart || !chart.options) return;

	// Update animation configuration
	if (!chart.options.animation) {
		chart.options.animation = {};
	}

	chart.options.animation = {
		...chart.options.animation,
		duration: 1200,
		easing: 'easeInOutQuart',
		onProgress: function(context) {
			if (context && context.currentStep !== undefined && context.numSteps !== undefined) {
				throttledAnimLog(`[ChartJS] ${type} chart animation: ${Math.round((100 * context.currentStep) / context.numSteps)}%`);
			}
		},
		onComplete: function() {
			console.log(`[ChartJS] ${type} chart animation complete`);
		}
	};

	// Add animations configuration based on chart type
	if (!chart.options.animations) {
		chart.options.animations = {};
	}

	if (chart.config.type === 'line') {
		chart.options.animations.tension = {
			duration: 1500,
			easing: 'easeOutQuart',
			from: 0,
			to: 0.4
		};
	} else if (chart.config.type === 'bar') {
		chart.options.animations.colors = {
			duration: 1000,
			easing: 'easeOutQuart'
		};
	} else if (chart.config.type === 'doughnut') {
		chart.options.animations.animateRotate = true;
		chart.options.animations.animateScale = true;
	}

	return chart;
}

export function renderChartJS(targetContainer) {
	// Ensure charts are destroyed and re-rendered when a new file is loaded
	if (window._chartjsInstances && Array.isArray(window._chartjsInstances)) {
		window._chartjsInstances.forEach((ch) => ch && ch.destroy && ch.destroy());
	}
	window._chartjsInstances = [];

	const chartContainer = targetContainer
		? typeof targetContainer === 'string'
			? document.getElementById(targetContainer)
			: targetContainer
		: document.getElementById('chartjs-chart-container');
	if (!chartContainer) {
		console.error('[ChartJS] Target container not found. Skipping chart rendering.');
		return;
	}
	chartContainer.innerHTML = '';

	if (!window.globalData || !window.globalData.recordMesgs || !Array.isArray(window.globalData.recordMesgs)) {
		chartContainer.innerHTML = '<p>No recordMesgs data available for chart.</p>';
		return;
	}
	if (!window.Chart) {
		chartContainer.innerHTML = '<p>Chart.js library is not loaded.</p>';
		return;
	}

	// Log Chart.js version and registered plugins
	console.log('[ChartJS] Chart.js version:', window.Chart.version);

	const data = window.globalData.recordMesgs;
	const labels = data
		.map((row) => {
			const timestamp = row.timestamp;
			return timestamp && !isNaN(new Date(timestamp).getTime()) ? timestamp : null;
		})
		.filter((timestamp) => timestamp !== null);

	// List of fields to plot, in order
	const fields = [
		'speed',
		'heartRate',
		'altitude',
		'power',
		'cadence',
		'temperature',
		'distance',
		'enhancedSpeed',
		'enhancedAltitude',
		'resistance',
		'flow',
		'grit',
	];
	const fieldLabels = {
		speed: 'Speed (m/s)',
		heartRate: 'Heart Rate (bpm)',
		altitude: 'Altitude (m)',
		power: 'Power (W)',
		cadence: 'Cadence (rpm)',
		temperature: 'Temperature (°C)',
		distance: 'Distance (m)',
		enhancedSpeed: 'Enhanced Speed (m/s)',
		enhancedAltitude: 'Enhanced Altitude (m)',
		resistance: 'Resistance',
		flow: 'Flow',
		grit: 'Grit',
	};
	const fieldColors = {
		speed: '#1976d2',
		heartRate: '#e53935',
		altitude: '#43a047',
		power: '#ff9800',
		cadence: '#8e24aa',
		temperature: '#00bcd4',
		distance: '#607d8b',
		enhancedSpeed: '#009688',
		enhancedAltitude: '#cddc39',
		resistance: '#795548',
		flow: '#c42196',
		grit: '#6e1cbb',
	};

	const zoomPluginConfig = {
		helpers: {}, // for plugin compatibility
		zoom: {
			wheel: { enabled: true },
			pinch: { enabled: true },
			mode: 'xy',
			drag: { enabled: true, modifierKey: 'ctrl' },
			limits: {
				x: { minRange: 1000 },
				y: { minRange: 1 },
			},
		},
		pan: {
			enabled: true,
			mode: 'xy',
			modifierKey: 'shift',
		},
		limits: {},
		// Show reset zoom button
		zoomButton: {
			enabled: true,
			text: 'Reset Zoom',
			position: 'top',
		},
	};

	let anyChart = false;
	fields.forEach((field) => {
		if (data.some((row) => typeof row[field] === 'number')) {
			anyChart = true;
			const canvas = document.createElement('canvas');
			canvas.id = `chartjs-canvas-${field}`;
			canvas.style.marginBottom = '32px';
			canvas.style.maxHeight = '320px';
			canvas.style.background = '#181c24';
			canvas.style.borderRadius = '12px';
			canvas.style.boxShadow = '0 2px 16px 0 rgba(0,0,0,0.18)';
			chartContainer.appendChild(canvas);

			// Downsample if too many points
			let chartData = data.map((row, i) => ({ x: labels[i], y: row[field] ?? null }));
			const maxPoints = 700; // adjust as needed for performance
			if (chartData.length > maxPoints) {
				const step = Math.ceil(chartData.length / maxPoints);
				chartData = chartData.filter((_, i) => i % step === 0);
			}

			const dataset = {
				label: fieldLabels[field] || field,
				data: chartData,
				borderColor: fieldColors[field] || '#1976d2',
				backgroundColor: (fieldColors[field] || '#1976d2') + '22',
				pointBackgroundColor: '#fff',
				pointBorderColor: fieldColors[field] || '#1976d2',
				pointBorderWidth: 2,
				pointRadius: 0.1,
				pointHoverRadius: 8,
				pointHoverBackgroundColor: fieldColors[field] || '#1976d2',
				pointHoverBorderColor: '#fff',
				borderWidth: 3,
				borderCapStyle: 'round',
				borderJoinStyle: 'round',
				cubicInterpolationMode: 'monotone',
				spanGaps: true,
				fill: {
					target: 'origin',
					above: (fieldColors[field] || '#1976d2') + '11',
					below: (fieldColors[field] || '#1976d2') + '11',
				},
				// Set tension to 0 initially, will animate to 0.4 after creation
				tension: (field === fields[0]) ? 0 : 0.4,
			};
			const context = canvas.getContext('2d');
			if (!context) {
				console.error(`[ChartJS] Failed to get 2D context for canvas with ID: ${canvas.id}`);
				return;
			}
			// Build chart options
			const chartOptions = {
				responsive: true,
				maintainAspectRatio: false,
				interaction: { mode: 'index', intersect: false },
				plugins: {
					legend: {
						display: true,
						position: 'bottom',
						labels: {
							color: '#fff',
							font: { weight: 'bold', size: 13 },
							padding: 18,
						},
					},
					title: {
						display: true,
						text: fieldLabels[field] || field,
						color: fieldColors[field] || '#fff',
						font: { size: 20, weight: 'bold', family: 'inherit' },
						padding: { top: 18, bottom: 8 },
					},
					tooltip: {
						mode: 'index',
						intersect: false,
						backgroundColor: '#222',
						titleColor: '#fff',
						bodyColor: '#fff',
						borderColor: fieldColors[field] || '#1976d2',
						borderWidth: 2,
						padding: 12,
						caretSize: 8,
					},
					decimation: {
						enabled: true,
						algorithm: 'lttb',
						samples: maxPoints,
					},
					zoom: zoomPluginConfig,
				},
				scales: {
					x: {
						title: {
							display: true,
							text: 'Timestamp',
							color: '#fff',
							font: { weight: 'bold', size: 13 },
						},
						ticks: {
							color: '#fff',
							font: { size: 12 },
							maxRotation: 0,
							padding: 6,
						},
						grid: { color: 'rgba(255,255,255,0.08)' },
						type: 'time',
						time: {
							unit: 'minute',
							displayFormats: { minute: 'HH:mm', hour: 'HH:mm', second: 'HH:mm:ss' },
						},
					},
					y: {
						title: {
							display: true,
							text: fieldLabels[field] || field,
							color: fieldColors[field] || '#1976d2',
							font: { weight: 'bold', size: 13 },
						},
						ticks: {
							color: fieldColors[field] || '#1976d2',
							font: { size: 12 },
							padding: 6,
						},
						grid: { color: (fieldColors[field] || '#1976d2') + '22' },
					},
				},
				elements: {
					line: {
						borderWidth: 3,
						borderCapStyle: 'round',
						borderJoinStyle: 'round',
						cubicInterpolationMode: 'monotone',
					},
					point: {
						backgroundColor: '#fff',
						borderColor: fieldColors[field] || '#1976d2',
						borderWidth: 2,
						radius: 2.5,
						hoverRadius: 8,
						hoverBackgroundColor: fieldColors[field] || '#1976d2',
						hoverBorderColor: '#fff',
					},
				},
				layout: {
					padding: { left: 16, right: 16, top: 8, bottom: 8 },
				},
				// Properly configured animations for Chart.js v4
				animation: {
					duration: 1200,
					easing: 'easeInOutQuart',
					onProgress: function(context) {
						throttledAnimLog(`[ChartJS] Animation progress: ${Math.round((100 * context.currentStep) / context.numSteps)}%`);
					},
					onComplete: function() {
						console.log('[ChartJS] Animation complete');
					}
				},
				animations: {
					tension: {
						duration: 2000,
						easing: 'easeOutQuart',
						from: 0,
						to: 0.4,
						loop: false
					}
				},
				transitions: {
					active: {
						animation: {
							duration: 400
						}
					}
				}
			};

			const chart = new window.Chart(context, {
				type: 'line',
				data: {
					labels: chartData.map((d) => d.x),
					datasets: [dataset],
				},
				options: chartOptions,
			});

			updateChartAnimations(chart, 'Line');

			if (field === fields[0]) {
				// Disable decimation and downsampling for the first chart to ensure animation is visible
				console.log('[ChartJS] Disabling decimation and downsampling for first chart');
				if (chart.options.plugins && chart.options.plugins.decimation) {
					chart.options.plugins.decimation.enabled = false;
				}

				// If chartData was downsampled, restore all points
				if (data.length > maxPoints && chartData.length < data.length) {
					chart.data.labels = data.map((row, i) => labels[i]);
					chart.data.datasets[0].data = data.map((row, i) => ({ x: labels[i], y: row[field] ?? null }));
					chart.update('none'); // Update without animation first

					// Now trigger the tension animation
					setTimeout(() => {
						console.log('[ChartJS] Starting tension animation');
						chart.update();
					}, 200);
				}

				console.log('[ChartJS] Chart.js version:', window.Chart && window.Chart.version);
				console.log('[ChartJS] First chart config:', chart.config);
			}

			window._chartjsInstances.push(chart);
		}
	});

	// Rest of the function remains the same
	// Render eventMesgs chart (if available)
	if (window.globalData && Array.isArray(window.globalData.eventMesgs) && window.globalData.eventMesgs.length > 0) {
		const eventData = window.globalData.eventMesgs
			.filter((row) => row.timestamp && !isNaN(new Date(row.timestamp).getTime()) && typeof row.data === 'number')
			.map((row) => ({
				x: row.timestamp,
				y: row.data,
				event: row.event,
				eventType: row.eventType,
				eventGroup: row.eventGroup,
				timerTrigger: row.timerTrigger,
			}));

		if (eventData.length > 0) {
			const canvas = document.createElement('canvas');
			canvas.id = 'chartjs-canvas-eventMesgs';
			canvas.style.marginBottom = '32px';
			canvas.style.maxHeight = '320px';
			canvas.style.background = '#181c24';
			canvas.style.borderRadius = '12px';
			canvas.style.boxShadow = '0 2px 16px 0 rgba(0,0,0,0.18)';
			chartContainer.appendChild(canvas);

			const context = canvas.getContext('2d');
			const chart = new window.Chart(context, {
				type: 'line',
				data: {
					datasets: [
						{
							label: 'Event Data',
							data: eventData,
							borderColor: '#ff4081',
							backgroundColor: '#ff408122',
							pointBackgroundColor: '#fff',
							pointBorderColor: '#ff4081',
							pointBorderWidth: 2,
							pointRadius: 4,
							pointHoverRadius: 8,
							pointHoverBackgroundColor: '#ff4081',
							pointHoverBorderColor: '#fff',
							borderWidth: 2,
							showLine: false, // scatter style
							spanGaps: true,
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: { display: true, position: 'bottom', labels: { color: '#fff' } },
						title: { display: true, text: 'EventMesgs Data', color: '#fff', font: { size: 18 } },
						tooltip: {
							callbacks: {
								label: function (context) {
									const d = context.raw;
									return `y: ${d.y}, event: ${d.event}, type: ${d.eventType}`;
								},
							},						},
						zoom: zoomPluginConfig,
					},
					scales: {
						x: {
							type: 'time',
							title: { display: true, text: 'Timestamp', color: '#fff' },
							ticks: { color: '#fff' },
							grid: { color: 'rgba(255,255,255,0.08)' },
						},
						y: {
							title: { display: true, text: 'Data', color: '#ff4081' },
							ticks: { color: '#ff4081' },
							grid: { color: '#ff408122' },
						},
					},
					animation: {
						duration: 1200,
						easing: 'easeInOutQuart',
						onProgress: function(context) {
							if (context && context.currentStep !== undefined && context.numSteps !== undefined) {
								throttledAnimLog(`[ChartJS] Event chart animation: ${Math.round((100 * context.currentStep) / context.numSteps)}%`);
							}
						},
						onComplete: function() {
							console.log('[ChartJS] Event chart animation complete');
						}
					},
					animations: {
						tension: {
							duration: 1500,
							easing: 'easeOutQuart',
							from: 0,
							to: 0.4
						}
					},
				},
			});
			updateChartAnimations(chart, 'Event');
			window._chartjsInstances.push(chart);
		}
	}

	// Render timeInZoneMesgs bar chart (if available)
	if (window.globalData && Array.isArray(window.globalData.timeInZoneMesgs) && window.globalData.timeInZoneMesgs.length > 0) {
		const zoneMsgs = window.globalData.timeInZoneMesgs.filter((row) => row.timeInHrZone || row.timeInPowerZone);
		if (zoneMsgs.length > 0) {
			function safeParseArray(val, label, idx) {
				if (Array.isArray(val)) return val;
				if (!val || typeof val !== 'string') return [];
				try {
					const clean = val.trim().replace(/^"+|"+$/g, '');
					const arr = JSON.parse(clean);
					if (!Array.isArray(arr)) throw new Error('Not an array');
					return arr;
				} catch (e) {
					return [];
				}
			}

			// Split by referenceMesg
			const sessionMsgs = zoneMsgs.filter((row) => row.referenceMesg === 'session');
			const lapMsgs = zoneMsgs.filter((row) => row.referenceMesg === 'lap');

			// Helper to build datasets for bar charts
			function buildZoneDatasets(msgs, zoneKey, colorBase, labelPrefix, stackName) {
				if (!msgs.length) return [];
				const firstZones = safeParseArray(msgs[0][zoneKey], zoneKey, 0);
				const numZones = firstZones.length;
				const datasets = [];
				for (let z = 1; z < numZones; z++) {
					const dataArr = msgs.map((row, i) => {
						const arr = safeParseArray(row[zoneKey], zoneKey, i);
						return arr[z] || 0;
					});
					datasets.push({
						label: `${labelPrefix} ${z}`,
						data: dataArr,
						backgroundColor: `hsl(${colorBase + z * 20}, 70%, 55%)`,
						borderColor: `hsl(${colorBase + z * 20}, 70%, 35%)`,
						borderWidth: 1.5,
						borderRadius: 6,
						stack: stackName,
						barPercentage: 0.7,
						categoryPercentage: 0.7,
					});
				}
				return datasets;
			}

			// Helper to sum total time in each zone (for doughnut)
			function sumZones(msgs, zoneKey) {
				if (!msgs.length) return [];
				const firstZones = safeParseArray(msgs[0][zoneKey], zoneKey, 0);
				const numZones = firstZones.length;
				const sums = Array(numZones).fill(0);
				msgs.forEach((row, i) => {
					const arr = safeParseArray(row[zoneKey], zoneKey, i);
					arr.forEach((val, z) => {
						sums[z] += val || 0;
					});
				});
				return sums;
			}

			// --- Render Lap Charts ---
			if (lapMsgs.length) {
				const labels = lapMsgs.map((row) => `${row.referenceMesg || ''} ${row.referenceIndex || ''}`.trim());
				const hrZoneDatasets = buildZoneDatasets(lapMsgs, 'timeInHrZone', 180, 'HR Zone', 'hr');
				const pwrZoneDatasets = buildZoneDatasets(lapMsgs, 'timeInPowerZone', 320, 'Power Zone', 'pwr');
				if (hrZoneDatasets.length > 0) {
					const canvas = document.createElement('canvas');
					canvas.id = 'chartjs-canvas-hrZones-lap';
					canvas.style.marginBottom = '32px';
					canvas.style.maxHeight = '500px';
					canvas.style.background = '#181c24';
					canvas.style.borderRadius = '12px';
					canvas.style.boxShadow = '0 2px 16px 0 rgba(0,0,0,0.18)';
					chartContainer.appendChild(canvas);
					const context = canvas.getContext('2d');
					const chart = new window.Chart(context, {
						type: 'bar',
						data: { labels, datasets: hrZoneDatasets },
						options: {
							responsive: true,
							maintainAspectRatio: false,
							plugins: {
								legend: { display: true, position: 'bottom', labels: { color: '#fff' } },
								title: { display: true, text: 'Lap: Time in Heart Rate Zones', color: '#fff', font: { size: 18 } },
								tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} sec` } },
								zoom: zoomPluginConfig,
							},
							scales: {
								x: {
									title: { display: true, text: 'Lap', color: '#fff' },
									ticks: { color: '#fff', font: { size: 12 } },
									grid: { color: 'rgba(255,255,255,0.08)' },
									stacked: true,
								},
								y: {
									title: { display: true, text: 'Seconds', color: '#00bcd4' },
									ticks: { color: '#00bcd4', font: { size: 12 } },
									grid: { color: '#00bcd422' },
									beginAtZero: true,
									stacked: true,
								},
							},
							elements: { bar: { borderRadius: 6 } },
							layout: { padding: { left: 16, right: 16, top: 8, bottom: 8 } },
							animation: {
								duration: 1200,
								easing: 'easeInOutQuart',
							},
						},
					});
					updateChartAnimations(chart, 'Bar');
					window._chartjsInstances.push(chart);
				}
				if (pwrZoneDatasets.length > 0) {
					const canvas = document.createElement('canvas');
					canvas.id = 'chartjs-canvas-pwrZones-lap';
					canvas.style.marginBottom = '32px';
					canvas.style.maxHeight = '500px';
					canvas.style.background = '#181c24';
					canvas.style.borderRadius = '12px';
					canvas.style.boxShadow = '0 2px 16px 0 rgba(0,0,0,0.18)';
					chartContainer.appendChild(canvas);
					const context = canvas.getContext('2d');
					const chart = new window.Chart(context, {
						type: 'bar',
						data: { labels, datasets: pwrZoneDatasets },
						options: {
							responsive: true,
							maintainAspectRatio: false,
							plugins: {
								legend: { display: true, position: 'bottom', labels: { color: '#fff' } },
								title: { display: true, text: 'Lap: Time in Power Zones', color: '#fff', font: { size: 18 } },
								tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} sec` } },
								zoom: zoomPluginConfig,
							},
							scales: {
								x: {
									title: { display: true, text: 'Lap', color: '#fff' },
									ticks: { color: '#fff', font: { size: 12 } },
									grid: { color: 'rgba(255,255,255,0.08)' },
									stacked: true,
								},
								y: {
									title: { display: true, text: 'Seconds', color: '#c42196' },
									ticks: { color: '#c42196', font: { size: 12 } },
									grid: { color: '#c4219622' },
									beginAtZero: true,
									stacked: true,
								},
							},
							elements: { bar: { borderRadius: 6 } },
							layout: { padding: { left: 16, right: 16, top: 8, bottom: 8 } },
							animation: {
								duration: 1200,
								easing: 'easeInOutQuart',
							},
						},
					});
					updateChartAnimations(chart, 'Bar');
					window._chartjsInstances.push(chart);
				}
			}

			// --- Render Session Charts ---
			if (sessionMsgs.length) {
				const labels = sessionMsgs.map((row) => `${row.referenceMesg || ''} ${row.referenceIndex || ''}`.trim());
				const hrZoneDatasets = buildZoneDatasets(sessionMsgs, 'timeInHrZone', 180, 'HR Zone', 'hr');
				const pwrZoneDatasets = buildZoneDatasets(sessionMsgs, 'timeInPowerZone', 320, 'Power Zone', 'pwr');
				if (hrZoneDatasets.length > 0) {
					const canvas = document.createElement('canvas');
					canvas.id = 'chartjs-canvas-hrZones-session';
					canvas.style.marginBottom = '32px';
					canvas.style.maxHeight = '450px';
					canvas.style.background = '#181c24';
					canvas.style.borderRadius = '12px';
					canvas.style.boxShadow = '0 2px 16px 0 rgba(0,0,0,0.18)';
					chartContainer.appendChild(canvas);
					const context = canvas.getContext('2d');
					const chart = new window.Chart(context, {
						type: 'bar',
						data: { labels, datasets: hrZoneDatasets },
						options: {
							responsive: true,
							maintainAspectRatio: false,
							plugins: {
								legend: { display: true, position: 'bottom', labels: { color: '#fff' } },
								title: { display: true, text: 'Session: Time in Heart Rate Zones', color: '#fff', font: { size: 18 } },
								tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} sec` } },
								zoom: zoomPluginConfig,
							},
							scales: {
								x: {
									title: { display: true, text: 'Session', color: '#fff' },
									ticks: { color: '#fff', font: { size: 12 } },
									grid: { color: 'rgba(255,255,255,0.08)' },
									stacked: true,
								},
								y: {
									title: { display: true, text: 'Seconds', color: '#00bcd4' },
									ticks: { color: '#00bcd4', font: { size: 12 } },
									grid: { color: '#00bcd422' },
									beginAtZero: true,
									stacked: true,
								},
							},
							elements: { bar: { borderRadius: 6 } },
							layout: { padding: { left: 16, right: 16, top: 8, bottom: 8 } },
							animation: {
								duration: 1200,
								easing: 'easeInOutQuart',
							},
						},
					});
					updateChartAnimations(chart, 'Bar');
					window._chartjsInstances.push(chart);
				}
				if (pwrZoneDatasets.length > 0) {
					const canvas = document.createElement('canvas');
					canvas.id = 'chartjs-canvas-pwrZones-session';
					canvas.style.marginBottom = '32px';
					canvas.style.maxHeight = '450px';
					canvas.style.background = '#181c24';
					canvas.style.borderRadius = '12px';
					canvas.style.boxShadow = '0 2px 16px 0 rgba(0,0,0,0.18)';
					chartContainer.appendChild(canvas);
					const context = canvas.getContext('2d');
					const chart = new window.Chart(context, {
						type: 'bar',
						data: { labels, datasets: pwrZoneDatasets },
						options: {
							responsive: true,
							maintainAspectRatio: false,
							plugins: {
								legend: { display: true, position: 'bottom', labels: { color: '#fff' } },
								title: { display: true, text: 'Session: Time in Power Zones', color: '#fff', font: { size: 18 } },
								tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} sec` } },
								zoom: zoomPluginConfig,
							},
							scales: {
								x: {
									title: { display: true, text: 'Session', color: '#fff' },
									ticks: { color: '#fff', font: { size: 12 } },
									grid: { color: 'rgba(255,255,255,0.08)' },
									stacked: true,
								},
								y: {
									title: { display: true, text: 'Seconds', color: '#c42196' },
									ticks: { color: '#c42196', font: { size: 12 } },
									grid: { color: '#c4219622' },
									beginAtZero: true,
									stacked: true,
								},
							},
							elements: { bar: { borderRadius: 6 } },
							layout: { padding: { left: 16, right: 16, top: 8, bottom: 8 } },
							animation: {
								duration: 1200,
								easing: 'easeInOutQuart',
							},
						},
					});
					updateChartAnimations(chart, 'Bar');
					window._chartjsInstances.push(chart);
				}

				// --- Session: Doughnut Charts for Total Time in Each Zone ---
				const hrZoneSums = sumZones(sessionMsgs, 'timeInHrZone');
				const pwrZoneSums = sumZones(sessionMsgs, 'timeInPowerZone');
				if (hrZoneSums.length > 1) {
					const canvas = document.createElement('canvas');
					canvas.id = 'chartjs-canvas-hrZoneDoughnut-session';
					canvas.style.marginBottom = '32px';
					canvas.style.maxHeight = '450px';
					canvas.style.background = '#181c24';
					canvas.style.borderRadius = '12px';
					canvas.style.boxShadow = '0 2px 16px 0 rgba(0,0,0,0.18)';
					chartContainer.appendChild(canvas);
					const context = canvas.getContext('2d');
					const chart = new window.Chart(context, {
						type: 'doughnut',
						data: {
							labels: hrZoneSums.map((_, z) => (z === 0 ? null : `HR Zone ${z}`)).filter(Boolean),
							datasets: [
								{
									data: hrZoneSums.slice(1),
									backgroundColor: hrZoneSums.slice(1).map((_, z) => `hsl(${180 + (z + 1) * 20}, 70%, 55%)`),
									borderColor: '#222',
									borderWidth: 2,
								},
							],
						},
						options: {
							responsive: true,
							maintainAspectRatio: false,
							plugins: {
								legend: { display: true, position: 'bottom', labels: { color: '#fff' } },
								title: { display: true, text: 'Session: Total Time in Heart Rate Zones', color: '#fff', font: { size: 16 } },
								tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed} sec` } },
								zoom: zoomPluginConfig,
							},
							animation: {
								duration: 1200,
								easing: 'easeInOutQuart',
							},
						},
					});
					updateChartAnimations(chart, 'Doughnut');
					window._chartjsInstances.push(chart);
				}
				if (pwrZoneSums.length > 1) {
					const canvas = document.createElement('canvas');
					canvas.id = 'chartjs-canvas-pwrZoneDoughnut-session';
					canvas.style.marginBottom = '32px';
					canvas.style.maxHeight = '450px';
					canvas.style.background = '#181c24';
					canvas.style.borderRadius = '12px';
					canvas.style.boxShadow = '0 2px 16px 0 rgba(0,0,0,0.18)';
					chartContainer.appendChild(canvas);
					const context = canvas.getContext('2d');
					const chart = new window.Chart(context, {
						type: 'doughnut',
						data: {
							labels: pwrZoneSums.map((_, z) => (z === 0 ? null : `Power Zone ${z}`)).filter(Boolean),
							datasets: [
								{
									data: pwrZoneSums.slice(1),
									backgroundColor: pwrZoneSums.slice(1).map((_, z) => `hsl(${320 + (z + 1) * 15}, 70%, 60%)`),
									borderColor: '#222',
									borderWidth: 2,
								},
							],
						},
						options: {
							responsive: true,
							maintainAspectRatio: false,
							plugins: {
								legend: { display: true, position: 'bottom', labels: { color: '#fff' } },
								title: { display: true, text: 'Session: Total Time in Power Zones', color: '#fff', font: { size: 16 } },
								tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed} sec` } },
								zoom: zoomPluginConfig,
							},
							animation: {
								duration: 1200,
								easing: 'easeInOutQuart',
							},
						},
					});
					updateChartAnimations(chart, 'Doughnut');
					window._chartjsInstances.push(chart);
				}
			}
		}
	}

	if (!anyChart) {
		chartContainer.innerHTML = '<p>No suitable numeric data available for Chart.js chart.</p>';
	}
}
