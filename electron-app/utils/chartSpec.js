// chartSpec.js
// Vega-Lite chart spec for FIT file viewer

/**
 * Generates a Vega-Lite chart specification for visualizing folded time series data.
 *
 * The chart supports faceting by the 'key' field, interactive interval selection on the x-axis,
 * and overlays multiple layers including lines, rules, and summary text annotations.
 * The configuration is styled for a dark or light theme and supports independent x and y scales per facet.
 *
 * @param {Array<Object>} foldedData - The input data array, where each object should contain at least
 *   'timestamp', 'value', and 'key' fields. 'timestamp' should be a date/time value, 'value' a number,
 *   and 'key' a string or category for faceting.
 * @param {string} theme - 'dark' or 'light' (default: 'dark')
 * @returns {Object} A Vega-Lite v5 chart specification object configured for the provided data.
 */
export function getChartSpec(foldedData, theme = 'dark') {
	const isDark = theme === 'dark';
	const colors = isDark
		? {
			background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
			text: '#e0e0e0',
			fill: '#23263a',
			axis: '#b0b0b0',
			axisDomain: '#888',
			legend: '#e0e0e0',
			line: '#00bcd4', // Material Cyan
			point: '#ffeb3b', // Material Yellow
			firebrick: '#ff5252', // Material Red Accent
			shadow: 'rgba(0,0,0,0.3)'
		} : {
			background: 'linear-gradient(135deg, #fff 0%, #e3e3e3 100%)',
			text: '#23263a',
			fill: '#f0f0f0',
			axis: '#23263a',
			axisDomain: '#888',
			legend: '#23263a',
			line: '#1976d2', // Material Blue
			point: '#ff9800', // Material Orange
			firebrick: '#e53935', // Material Red
			shadow: 'rgba(0,0,0,0.08)'
		};
	return {
		config: {
			background: undefined, // Use view.fill for gradient
			font: 'Inter, Roboto, Segoe UI, Arial, sans-serif',
			text: {
				color: colors.text,
				fontSize: 15,
				font: 'Inter, Roboto, Segoe UI, Arial, sans-serif',
			},
			title: {
				anchor: 'middle',
				fontWeight: '600',
				fontSize: 32,
				color: colors.text,
			},
			header: {
				titleFontSize: 22,
				labelFontSize: 18,
				color: colors.text,
				fontWeight: '500',
			},
			view: {
				height: 800,
				width: 800,
				stroke: null,
				cornerRadius: 18,
				fill: colors.fill, // Use a solid color, not an expression or gradient
				shadow: { color: colors.shadow, blur: 16, offsetX: 0, offsetY: 4 },
			},
			axis: {
				domain: true,
				domainColor: colors.axisDomain,
				domainWidth: 1.5,
				grid: true,
				gridColor: isDark ? '#333' : '#e0e0e0',
				gridDash: [2, 4],
				labelAngle: 0,
				tickSize: 7,
				fontWeight: '400',
				fontSize: 15,
				titleFontSize: 18,
				color: colors.axis,
				titleColor: colors.axis,
				labelColor: colors.axis,
				tickColor: colors.axisDomain,
			},
			legend: {
				fontWeight: '400',
				fontSize: 15,
				titleFontSize: 16,
				color: colors.legend,
				titleColor: colors.legend,
				labelColor: colors.legend,
				symbolType: 'circle',
				symbolSize: 120,
			},
		},
		data: { values: foldedData },
		facet: {
			row: {
				field: 'key',
				header: {
					labelOrient: 'top',
					anchor: 'start',
					fontSize: 20,
					fontWeight: 'bold',
					color: colors.text,
				},
				type: 'nominal',
			},
		},
		spec: {
			layer: [
				{
					mark: {
						type: 'line',
						color: colors.line,
						interpolate: 'monotone',
						strokeWidth: 3,
						strokeCap: 'round',
					},
					encoding: {
						opacity: { value: 0.18 },
						x: {
							field: 'timestamp',
							title: 'Elapsed time (seconds)',
							type: 'temporal',
						},
						y: {
							field: 'value',
							scale: { zero: false },
							title: '',
							type: 'quantitative',
						},
						tooltip: [
							{ field: 'timestamp', type: 'temporal', title: 'Time' },
							{ field: 'value', type: 'quantitative', title: 'Value', format: '.3f' },
							{ field: 'key', type: 'nominal', title: 'Key' }
						],
					},
					name: 'view_11',
				},
				{
					mark: {
						type: 'line',
						color: colors.line,
						interpolate: 'monotone',
						strokeWidth: 4,
						strokeCap: 'round',
					},
					encoding: {
						opacity: { value: 1 },
						x: { field: 'timestamp', type: 'temporal' },
						y: { field: 'value', scale: { zero: false }, type: 'quantitative' },
						tooltip: [
							{ field: 'timestamp', type: 'temporal', title: 'Time' },
							{ field: 'value', type: 'quantitative', title: 'Value', format: '.3f' },
							{ field: 'key', type: 'nominal', title: 'Key' }
						],
					},
					transform: [ { filter: { param: 'param_11' } } ],
				},
				{
					mark: {
						type: 'point',
						color: colors.point,
						size: 100,
						filled: true,
						opacity: 1,
						stroke: colors.line,
						strokeWidth: 2,
					},
					encoding: {
						x: { aggregate: 'min', field: 'timestamp', type: 'temporal' },
						y: { aggregate: 'min', field: 'value', type: 'quantitative' },
						tooltip: [
							{ field: 'timestamp', aggregate: 'min', type: 'temporal', title: 'First Time' },
							{ field: 'value', aggregate: 'min', type: 'quantitative', title: 'First Value', format: '.3f' },
							{ field: 'key', type: 'nominal', title: 'Key' }
						],
					},
					transform: [
						{ filter: "length(data('param_11_store')) > 0" },
						{ filter: { param: 'param_11' } }
					],
				},
				{
					mark: {
						type: 'point',
						color: colors.point,
						size: 100,
						filled: true,
						opacity: 1,
						stroke: colors.line,
						strokeWidth: 2,
					},
					encoding: {
						x: { aggregate: 'max', field: 'timestamp', type: 'temporal' },
						y: { aggregate: 'max', field: 'value', type: 'quantitative' },
						tooltip: [
							{ field: 'timestamp', aggregate: 'max', type: 'temporal', title: 'Last Time' },
							{ field: 'value', aggregate: 'max', type: 'quantitative', title: 'Last Value', format: '.3f' },
							{ field: 'key', type: 'nominal', title: 'Key' }
						],
					},
					transform: [
						{ filter: "length(data('param_11_store')) > 0" },
						{ filter: { param: 'param_11' } }
					],
				},
				{
					mark: {
						type: 'rule',
						color: colors.firebrick,
						strokeDash: [5, 5],
					},
					encoding: {
						x: { aggregate: 'min', field: 'timestamp', type: 'temporal' },
						x2: { aggregate: 'max', field: 'timestamp' },
						y: { aggregate: 'min', field: 'value', scale: { zero: false }, type: 'quantitative' },
					},
					transform: [
						{ filter: "length(data('param_11_store')) > 0" },
						{ filter: { param: 'param_11' } }
					],
				},
				{
					mark: {
						type: 'text',
						color: colors.line,
						dx: 0,
						dy: -50,
						size: 20,
					},
					encoding: {
						text: {
							aggregate: 'mean',
							field: 'value',
							format: '.3f',
							type: 'quantitative',
						},
						x: {
							aggregate: 'mean',
							field: 'timestamp',
							type: 'temporal',
						},
						y: {
							aggregate: 'min',
							field: 'value',
							scale: {
								zero: false,
							},
							type: 'quantitative',
						},
					},
					transform: [
						{ filter: "length(data('param_11_store')) > 0" },
						{
							filter: {
								param: 'param_11',
							},
						},
					],
				},
				{
					mark: {
						type: 'text',
						color: colors.firebrick,
						dx: 0,
						dy: -10,
						size: 14,
					},
					encoding: {
						text: {
							aggregate: 'count',
							field: 'value',
							format: '.3f',
							type: 'quantitative',
						},
						x: {
							aggregate: 'mean',
							field: 'timestamp',
							type: 'temporal',
						},
						y: {
							aggregate: 'min',
							field: 'value',
							scale: {
								zero: false,
							},
							type: 'quantitative',
						},
					},
					transform: [
						{ filter: "length(data('param_11_store')) > 0" },
						{
							filter: {
								param: 'param_11',
							},
						},
					],
				},
				{
					mark: {
						type: 'text',
						color: colors.firebrick,
						dx: -20,
						dy: -10,
						size: 14,
					},
					encoding: {
						text: {
							aggregate: 'min',
							field: 'timestamp',
							formatType: 'time',
							timeUnit: 'hoursminutesseconds',
							type: 'temporal',
						},
						x: {
							aggregate: 'min',
							field: 'timestamp',
							type: 'temporal',
						},
						y: {
							aggregate: 'min',
							field: 'value',
							scale: {
								zero: false,
							},
							type: 'quantitative',
						},
					},
					transform: [
						{ filter: "length(data('param_11_store')) > 0" },
						{
							filter: {
								param: 'param_11',
							},
						},
					],
				},
				{
					mark: {
						type: 'text',
						color: colors.firebrick,
						dx: 20,
						dy: -10,
						size: 14,
					},
					encoding: {
						text: {
							aggregate: 'max',
							field: 'timestamp',
							formatType: 'time',
							timeUnit: 'hoursminutesseconds',
							type: 'temporal',
						},
						x: {
							aggregate: 'max',
							field: 'timestamp',
							type: 'temporal',
						},
						y: {
							aggregate: 'min',
							field: 'value',
							scale: {
								zero: false,
							},
							type: 'quantitative',
						},
					},
					transform: [
						{ filter: "length(data('param_11_store')) > 0" },
						{
							filter: {
								param: 'param_11',
							},
						},
					],
				},
			],
			height: 220,
			width: 'container',
		},
		params: [
			{
				name: 'param_11',
				select: { type: 'interval', encodings: ['x'] },
				views: ['view_11'],
			},
		],
		resolve: { scale: { x: 'independent', y: 'independent' } },
		spacing: 32,
		$schema: 'https://vega.github.io/schema/vega-lite/v5.20.1.json',
	};
}
