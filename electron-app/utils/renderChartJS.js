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
	let _fitfileLoadedFired = false;
	window.addEventListener('fitfile-loaded', function () {
		_fitfileLoadedFired = true;
		console.log('[ChartJS] fitfile-loaded event received, re-rendering charts');
		// Re-render charts when a new file is loaded
		renderChartJS();
	});
	// Also listen for file input changes (if any file input exists)
	const fileInputs = document.querySelectorAll('input[type="file"]');
	fileInputs.forEach(input => {
		input.addEventListener('change', function () {
			console.log('[ChartJS] File input changed, re-rendering charts');
			setTimeout(() => {
				window.dispatchEvent(new Event('fitfile-loaded'));
			}, 100); // slight delay to allow file to load
		});
	});
	// Warn if event is not dispatched after file load
	setTimeout(() => {
		if (!_fitfileLoadedFired && (!window._chartjsInstances || window._chartjsInstances.length === 0)) {
			console.warn('[ChartJS] fitfile-loaded event was not dispatched after file load. Charts will not update until you call window.dispatchEvent(new Event("fitfile-loaded")) after loading a new file.');
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
		onProgress: function (context) {
			if (context && context.currentStep !== undefined && context.numSteps !== undefined) {
				throttledAnimLog(`[ChartJS] ${type} chart animation: ${Math.round((100 * context.currentStep) / context.numSteps)}%`);
			}
		},
		onComplete: function () {
			console.log(`[ChartJS] ${type} chart animation complete`);
		},
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
			to: 0.4,
		};
	} else if (chart.config.type === 'bar') {
		chart.options.animations.colors = {
			duration: 1000,
			easing: 'easeOutQuart',
		};
	} else if (chart.config.type === 'doughnut') {
		chart.options.animations.animateRotate = true;
		chart.options.animations.animateScale = true;
	}

	return chart;
}

// --- Max Points Dropdown UI (persistent, outside renderChartJS) ---
const defaultMaxPoints = 250;
const maxPointsOptions = [1, 10, 25, 50, 100, 200, 250, 500, 700, 1000, 2000, 3000, 5000, 10000, 50000, 100000, 1000000, 'all'];
const chartOptionsConfig = [
	{
		id: 'maxpoints',
		label: 'Max Points',
		options: maxPointsOptions,
		default: defaultMaxPoints,
	},
	{
		id: 'showGrid',
		label: 'Show Grid',
		options: ['on', 'off'],
		default: 'on',
	},
	{
		id: 'showLegend',
		label: 'Show Legend',
		options: ['on', 'off'],
		default: 'on',
	},
	{
		id: 'showTitle',
		label: 'Show Title',
		options: ['on', 'off'],
		default: 'on',
	},
];

const chartFields = [
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

// Move fieldColors definition above ensureChartSettingsDropdowns so it's in scope
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

function ensureChartSettingsDropdowns(targetContainer) {
	let chartContainer = targetContainer
		? typeof targetContainer === 'string'
			? document.getElementById(targetContainer)
			: targetContainer
		: document.getElementById('chartjs-chart-container');
	if (!chartContainer) return { maxpoints: defaultMaxPoints, showGrid: 'on', showLegend: 'on', showTitle: 'on' };

	let wrapper = document.getElementById('chartjs-settings-wrapper');
	if (!wrapper) {
		wrapper = document.createElement('div');
		wrapper.id = 'chartjs-settings-wrapper';
		wrapper.style.display = 'flex';
		wrapper.style.alignItems = 'center';
		wrapper.style.gap = '18px';
		wrapper.style.margin = '8px 0 16px 0';
		chartContainer.parentNode.insertBefore(wrapper, chartContainer);
	}
	// Only create dropdowns if not present
	chartOptionsConfig.forEach((opt) => {
		if (!document.getElementById('chartjs-' + opt.id + '-dropdown')) {
			const label = document.createElement('label');
			label.textContent = opt.label + ':';
			label.style.color = '#fff';
			label.style.fontWeight = 'bold';
			label.setAttribute('for', 'chartjs-' + opt.id + '-dropdown');
			const dropdown = document.createElement('select');
			dropdown.id = 'chartjs-' + opt.id + '-dropdown';
			dropdown.style.padding = '4px 8px';
			dropdown.style.borderRadius = '6px';
			dropdown.style.fontSize = '15px';
			dropdown.style.background = '#222';
			dropdown.style.color = '#fff';
			opt.options.forEach((val) => {
				const option = document.createElement('option');
				option.value = val;
				option.textContent = val === 'all' ? 'All' : val === 'on' ? 'On' : val === 'off' ? 'Off' : val;
				dropdown.appendChild(option);
			});
			// Set initial value from localStorage or default
			const stored = localStorage.getItem('chartjs_' + opt.id);
			dropdown.value = stored !== null ? stored : opt.default;
			// Mouse wheel support for maxpoints
			if (opt.id === 'maxpoints') {
				dropdown.addEventListener('wheel', (e) => {
					e.preventDefault();
					const idx = opt.options.indexOf(dropdown.value === 'all' ? 'all' : Number(dropdown.value));
					let newIdx = idx + (e.deltaY > 0 ? 1 : -1);
					if (newIdx < 0) newIdx = 0;
					if (newIdx >= opt.options.length) newIdx = opt.options.length - 1;
					dropdown.value = opt.options[newIdx];
					dropdown.dispatchEvent(new Event('change'));
				}, { passive: false });
			}
			dropdown.addEventListener('change', (e) => {
				localStorage.setItem('chartjs_' + opt.id, e.target.value);
				renderChartJS(targetContainer);
			});
			wrapper.appendChild(label);
			wrapper.appendChild(dropdown);
		}
	});
	// Remove color pickers for each chart field (now handled per-chart in renderChartJS)
	// chartFields.forEach(field => {
	//     const colorId = 'chartjs-color-' + field;
	//     if (!document.getElementById(colorId)) {
	//         const label = document.createElement('label');
	//         label.textContent = field.charAt(0).toUpperCase() + field.slice(1) + ' Color:';
	//         label.style.color = '#fff';
	//         label.style.fontWeight = 'bold';
	//         label.setAttribute('for', colorId);
	//         const input = document.createElement('input');
	//         input.type = 'color';
	//         input.id = colorId;
	//         input.style.marginLeft = '4px';
	//         input.style.marginRight = '8px';
	//         // Default color from fieldColors or fallback
	//         const stored = localStorage.getItem('chartjs_color_' + field);
	//         const defaultColor = fieldColors[field] || '#1976d2';
	//         input.value = stored || defaultColor;
	//         input.addEventListener('change', (e) => {
	//             localStorage.setItem('chartjs_color_' + field, e.target.value);
	//             renderChartJS(targetContainer);
	//         });
	//         wrapper.appendChild(label);
	//         wrapper.appendChild(input);
	//     }
	// });
	// Return current settings
	const settings = {};
	chartOptionsConfig.forEach((opt) => {
		const dropdown = document.getElementById('chartjs-' + opt.id + '-dropdown');
		settings[opt.id] = dropdown
			? opt.id === 'maxpoints' && dropdown.value === 'all'
				? 'all'
				: opt.id === 'maxpoints'
				? parseInt(dropdown.value, 10)
				: dropdown.value
			: opt.default;
	});
	// Only return color settings from localStorage or fieldColors
	settings.colors = {};
	chartFields.forEach((field) => {
		const stored = localStorage.getItem('chartjs_color_' + field);
		settings.colors[field] = stored || fieldColors[field] || '#1976d2';
	});
	return settings;
}

export function renderChartJS(targetContainer) {
	// Ensure charts are destroyed and re-rendered when a new file is loaded
	if (window._chartjsInstances && Array.isArray(window._chartjsInstances)) {
		window._chartjsInstances.forEach((ch) => ch && ch.destroy && ch.destroy());
	}
	window._chartjsInstances = [];

	let chartContainer = targetContainer
		? typeof targetContainer === 'string'
			? document.getElementById(targetContainer)
			: targetContainer
		: document.getElementById('chartjs-chart-container');
	if (!chartContainer) {
		console.error('[ChartJS] Target container not found. Skipping chart rendering.');
		return;
	}

	const settings = ensureChartSettingsDropdowns(targetContainer);
	const maxPoints = settings.maxpoints;
	const showGrid = settings.showGrid !== 'off';
	const showLegend = settings.showLegend !== 'off';
	const showTitle = settings.showTitle !== 'off';
	const customColors = settings.colors;
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

			// --- COLOR DROPDOWN: render inside the canvas using Chart.js plugin ---
			const colorChoices = [
				'#1976d2',
				'#e53935',
				'#43a047',
				'#ff9800',
				'#8e24aa',
				'#00bcd4',
				'#607d8b',
				'#009688',
				'#cddc39',
				'#795548',
				'#c42196',
				'#6e1cbb',
				'#fff',
				'#000',
			];
			const currentColor = customColors[field] || fieldColors[field] || '#1976d2';

			// Chart.js plugin to draw color dropdown inside the canvas
			const colorDropdownPlugin = {
				id: `colorDropdownPlugin-${field}`,
				// Track hover state in plugin instance
				_isHovered: false,
				_animatedBarProgress: 0, // 0 = collapsed, 1 = expanded
				_lastLegendDisplay: undefined, // Track last legend display state
				// Add smooth expand/collapse animation for the color swatch bar
				// We'll use a simple linear interpolation for the bar width and swatch size
				_animateSwatchBar: function (chart, expand) {
					const duration = 180; // ms
					const start = performance.now();
					const initial = this._animatedBarProgress;
					const target = expand ? 1 : 0;
					const animate = (now) => {
						const elapsed = Math.min(1, (now - start) / duration);
						this._animatedBarProgress = initial + (target - initial) * elapsed;
						chart.draw();
						if (elapsed < 1 && this._animatedBarProgress !== target) {
							requestAnimationFrame(animate);
						} else {
							this._animatedBarProgress = target;
							chart.draw();
						}
					};
					requestAnimationFrame(animate);
				},
				afterEvent: function (chart, args) {
					const eventType = args.event.type;
					const e = args.event.native;
					const canvas = chart.canvas;
					if (!canvas || !canvas.getBoundingClientRect) return;
					const colorChoicesCount = colorChoices.length;
					const swatchSize = 18;
					const swatchGap = 6;
					const singleSwatchWidth = swatchSize;
					const allSwatchesWidth = colorChoicesCount * (swatchSize + swatchGap) - swatchGap;
					const swatchAreaWidth = 60 + (this._animatedBarProgress * (allSwatchesWidth - singleSwatchWidth) + singleSwatchWidth);
					const dropdownWidth = Math.max(120, swatchAreaWidth + 10);
					const dropdownHeight = 28;
					let x = canvas.width - dropdownWidth - 18;
					let y = canvas.height - dropdownHeight - 12;
					if (x < 8) x = 8;
					if (y < 8) y = 8;
					const rect = canvas.getBoundingClientRect();
					const mouseX = e.clientX - rect.left;
					const mouseY = e.clientY - rect.top;
					// Expand hover area to the entire plugin bar, not just the swatches
					const inBar = mouseX >= x && mouseX <= x + dropdownWidth && mouseY >= y && mouseY <= y + dropdownHeight;

					if (eventType === 'mousemove') {
						if (!this._isHovered && inBar) {
							this._isHovered = true;
							this._animateSwatchBar(chart, true);
						} else if (this._isHovered && !inBar) {
							this._isHovered = false;
							this._animateSwatchBar(chart, false);
						}
					}
					if (eventType === 'mouseout') {
						if (this._isHovered) {
							this._isHovered = false;
							this._animateSwatchBar(chart, false);
						}
					}
					// Prevent click-through: if swatch bar is hovered and click is on a swatch, stop event propagation
					let barX = x + 60;
					let barW = allSwatchesWidth;
					let barH = swatchSize;
					let barY = y + (dropdownHeight - swatchSize) / 2;
					if ((eventType === 'click' || eventType === 'touchend') && this._isHovered) {
						let swatchX = barX;
						let clickedIdx = null;
						for (let idx = 0; idx < colorChoicesCount; idx++) {
							if (mouseX >= swatchX && mouseX <= swatchX + swatchSize && mouseY >= barY && mouseY <= barY + swatchSize) {
								clickedIdx = idx;
								break;
							}
							swatchX += swatchSize + swatchGap;
						}
						if (clickedIdx !== null) {
							if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
							if (e && typeof e.preventDefault === 'function') e.preventDefault();
							const hex = colorChoices[clickedIdx];
							localStorage.setItem('chartjs_color_' + field, hex);
							chart.options._activeColor = hex;
							chart.data.datasets[0].borderColor = hex;
							chart.data.datasets[0].backgroundColor = hex + '22';
							chart.data.datasets[0].pointBorderColor = hex;
							chart.data.datasets[0].pointHoverBackgroundColor = hex;
							chart.data.datasets[0].pointHoverBorderColor = '#fff';
							chart.options.scales.y.title.color = hex;
							chart.options.scales.y.ticks.color = hex;
							if (chart.options.plugins && chart.options.plugins.title) {
								chart.options.plugins.title.color = hex;
							}
							if (chart.options.plugins && chart.options.plugins.tooltip) {
								chart.options.plugins.tooltip.borderColor = hex;
							}
							chart.update();
						}
					}
					// Disable legend when swatch bar is open
					if (chart.options.plugins && chart.options.plugins.legend) {
						const shouldDisplay = !this._isHovered;
						if (this._lastLegendDisplay !== shouldDisplay) {
							chart.options.plugins.legend.display = shouldDisplay;
							this._lastLegendDisplay = shouldDisplay;
							chart.update('none');
						}
					}
				},
				afterDraw: function (chart) {
					const ctx = chart.ctx;
					const canvas = chart.canvas;
					const colorChoicesCount = colorChoices.length;
					const swatchSize = 18;
					const swatchGap = 6;
					const singleSwatchWidth = swatchSize;
					const allSwatchesWidth = colorChoicesCount * (swatchSize + swatchGap) - swatchGap;
					const swatchAreaWidth = 60 + (this._animatedBarProgress * (allSwatchesWidth - singleSwatchWidth) + singleSwatchWidth);
					const dropdownWidth = Math.max(120, swatchAreaWidth + 10);
					const dropdownHeight = 28;
					let x = canvas.width - dropdownWidth - 18;
					let y = canvas.height - dropdownHeight - 12;
					if (x < 8) x = 8;
					if (y < 8) y = 8;
					ctx.save();
					ctx.globalAlpha = 0.95;
					ctx.fillStyle = '#222';
					ctx.strokeStyle = '#888';
					ctx.lineWidth = 1.5;
					ctx.beginPath();
					ctx.roundRect(x, y, dropdownWidth, dropdownHeight, 7);
					ctx.fill();
					ctx.stroke();
					ctx.globalAlpha = 1;
					ctx.font = 'bold 14px sans-serif';
					ctx.fillStyle = '#fff';
					ctx.textBaseline = 'middle';
					ctx.fillText('Color:', x + 10, y + dropdownHeight / 2);
					let swatchX = x + 60;
					// Interpolate number of swatches to show based on animation progress
					const visibleSwatches = Math.max(1, Math.round(this._animatedBarProgress * (colorChoicesCount - 1) + 1));
					if (visibleSwatches === 1) {
						const activeHex = chart.options._activeColor || currentColor;
						ctx.save();
						ctx.beginPath();
						ctx.arc(swatchX + swatchSize / 2, y + dropdownHeight / 2, 13 / 2, 0, 2 * Math.PI);
						ctx.fillStyle = activeHex;
						ctx.strokeStyle = '#888';
						ctx.lineWidth = 2;
						ctx.fill();
						ctx.lineWidth = 3.5;
						ctx.strokeStyle = '#fff';
						ctx.stroke();
						ctx.restore();
					} else {
						for (let i = 0; i < visibleSwatches; i++) {
							const hex = colorChoices[i];
							ctx.save();
							let isActive = hex.toLowerCase() === (chart.options._activeColor || currentColor).toLowerCase();
							let drawSize = isActive ? 22 : 13;
							ctx.beginPath();
							ctx.arc(swatchX + swatchSize / 2, y + dropdownHeight / 2, drawSize / 2, 0, 2 * Math.PI);
							ctx.fillStyle = hex;
							ctx.strokeStyle = '#888';
							ctx.lineWidth = 2;
							ctx.fill();
							if (isActive) {
								ctx.lineWidth = 3.5;
								ctx.strokeStyle = '#fff';
							}
							ctx.stroke();
							ctx.restore();
							swatchX += swatchSize + swatchGap;
						}
					}
					ctx.restore();
				},
			};

			// Downsample if too many points
			let chartData = data.map((row, i) => ({ x: labels[i], y: row[field] ?? null }));
			if (maxPoints !== 'all' && chartData.length > maxPoints) {
				const step = Math.ceil(chartData.length / maxPoints);
				chartData = chartData.filter((_, i) => i % step === 0);
			}

			const color = customColors[field] || fieldColors[field] || '#1976d2';
			const dataset = {
				label: fieldLabels[field] || field,
				data: chartData,
				borderColor: color,
				backgroundColor: color + '22',
				pointBackgroundColor: '#fff',
				pointBorderColor: color,
				pointBorderWidth: 2,
				pointRadius: 0.1,
				pointHoverRadius: 8,
				pointHoverBackgroundColor: color,
				pointHoverBorderColor: '#fff',
				borderWidth: 3,
				borderCapStyle: 'round',
				borderJoinStyle: 'round',
				cubicInterpolationMode: 'monotone',
				spanGaps: true,
				fill: {
					target: 'origin',
					above: color + '11',
					below: color + '11',
				},
				// Set tension to 0 initially, will animate to 0.4 after creation
				tension: field === fields[0] ? 0 : 0.4,
			};
			// Before creating a chart, check context is valid
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
						display: showLegend,
						position: 'bottom',
						labels: {
							color: '#fff',
							font: { weight: 'bold', size: 13 },
							padding: 18,
						},
					},
					title: {
						display: showTitle,
						text: fieldLabels[field] || field,
						color: color,
						font: { size: 20, weight: 'bold', family: 'inherit' },
						padding: { top: 18, bottom: 8 },
					},
					tooltip: {
						mode: 'index',
						intersect: false,
						backgroundColor: '#222',
						titleColor: '#fff',
						bodyColor: '#fff',
						borderColor: color,
						borderWidth: 2,
						padding: 12,
						caretSize: 8,
					},
					decimation: {
						enabled: maxPoints !== 'all',
						algorithm: 'lttb',
						samples: maxPoints === 'all' ? undefined : maxPoints,
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
						grid: { color: showGrid ? 'rgba(255,255,255,0.08)' : 'transparent' },
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
							color: color,
							font: { weight: 'bold', size: 13 },
						},
						ticks: {
							color: color,
							font: { size: 12 },
							padding: 6,
						},
						grid: { color: color + '22' },
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
						borderColor: color,
						borderWidth: 2,
						radius: 2.5,
						hoverRadius: 8,
						hoverBackgroundColor: color,
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
					onProgress: function (context) {
						throttledAnimLog(`[ChartJS] Animation progress: ${Math.round((100 * context.currentStep) / context.numSteps)}%`);
					},
					onComplete: function () {
						console.log('[ChartJS] Animation complete');
					},
				},
				animations: {
					tension: {
						duration: 2000,
						easing: 'easeOutQuart',
						from: 0,
						to: 0.4,
						loop: false,
					},
				},
				transitions: {
					active: {
						animation: {
							duration: 400,
						},
					},
				},
			};

			const chart = new window.Chart(context, {
				type: 'line',
				data: {
					labels: chartData.map((d) => d.x),
					datasets: [dataset],
				},
				options: chartOptions,
				plugins: [colorDropdownPlugin, zoomResetPlugin],
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
							},
						},
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
							beginAtZero: true,
						},
					},
					animation: {
						duration: 1200,
						easing: 'easeInOutQuart',
						onProgress: function (context) {
							if (context && context.currentStep !== undefined && context.numSteps !== undefined) {
								throttledAnimLog(`[ChartJS] Event chart animation: ${Math.round((100 * context.currentStep) / context.numSteps)}%`);
							}
						},
						onComplete: function () {
							console.log('[ChartJS] Event chart animation complete');
						},
					},
					animations: {
						tension: {
							duration: 1500,
							easing: 'easeOutQuart',
							from: 0,
							to: 0.4,
						},
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
			function safeParseArray(val) {
				if (Array.isArray(val)) return val;
				if (!val || typeof val !== 'string') return [];
				try {
					const clean = val.trim().replace(/^"+|"+$/g, '');
					const arr = JSON.parse(clean);
					if (!Array.isArray(arr)) throw new Error('Not an array');
					return arr;
				} catch {
					return [];
				}
			}

			// Split by referenceMesg
			const sessionMsgs = zoneMsgs.filter((row) => row.referenceMesg === 'session');
			const lapMsgs = zoneMsgs.filter((row) => row.referenceMesg === 'lap');

			// Helper to build datasets for bar charts
			function buildZoneDatasets(msgs, zoneKey, colorBase, labelPrefix, stackName) {
				if (!msgs.length) return [];
				const firstZones = safeParseArray(msgs[0][zoneKey]);
				const numZones = firstZones.length;
				const datasets = [];
				for (let z = 1; z < numZones; z++) {
					const dataArr = msgs.map((row) => {
						const arr = safeParseArray(row[zoneKey]);
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
				const firstZones = safeParseArray(msgs[0][zoneKey]);
				const numZones = firstZones.length;
				const sums = Array(numZones).fill(0);
				msgs.forEach((row) => {
					const arr = safeParseArray(row[zoneKey]);
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

// --- Custom plugin for Zoom Reset Button ---
const zoomResetPlugin = {
	id: 'zoomResetPlugin',
	afterDraw(chart) {
		if (!chart.isZoomedOrPanned || !chart.isZoomedOrPanned()) return;
		const ctx = chart.ctx;
		const canvas = chart.canvas;
		const btnW = 110, btnH = 32;
		const x = canvas.width - btnW - 18;
		const y = 18;
		ctx.save();
		ctx.globalAlpha = 0.92;
		ctx.fillStyle = '#222';
		ctx.strokeStyle = '#888';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.roundRect(x, y, btnW, btnH, 8);
		ctx.fill();
		ctx.stroke();
		ctx.globalAlpha = 1;
		ctx.font = 'bold 15px sans-serif';
		ctx.fillStyle = '#fff';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText('Reset Zoom', x + btnW / 2, y + btnH / 2);
		ctx.restore();
		// Store button bounds for click detection
		chart._zoomResetBtnBounds = { x, y, w: btnW, h: btnH };
	},
	afterEvent(chart, args) {
		if (!chart.isZoomedOrPanned || !chart.isZoomedOrPanned()) return;
		const e = args.event.native;
		if (!e) return;
		const canvas = chart.canvas;
		const rect = canvas.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;
		const btn = chart._zoomResetBtnBounds;
		if (!btn) return;
		if ((args.event.type === 'click' || args.event.type === 'touchend') && mouseX >= btn.x && mouseX <= btn.x + btn.w && mouseY >= btn.y && mouseY <= btn.y + btn.h) {
			if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
			if (e && typeof e.preventDefault === 'function') e.preventDefault();
			if (typeof chart.resetZoom === 'function') chart.resetZoom();
		}
	},
};
