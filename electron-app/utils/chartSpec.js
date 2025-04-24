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
			background: '#181a20',
			text: '#e0e0e0',
			fill: '#23263a',
			axis: '#e0e0e0',
			axisDomain: '#888',
			legend: '#e0e0e0',
			line: '#1f77b4',
			firebrick: 'firebrick',
		} : {
			background: '#fff',
			text: '#23263a',
			fill: '#f0f0f0',
			axis: '#23263a',
			axisDomain: '#888',
			legend: '#23263a',
			line: '#1976d2',
			firebrick: '#b71c1c',
		};
	return {
		config: {
			background: colors.background,
			text: {
				color: colors.text,
				fontSize: 14,
			},
			title: {
				anchor: 'middle',
				fontWeight: 'normal',
				titleFontWeight: 'normal',
				labelFontWeight: 'normal',
				fontSize: 30,
				titleFontSize: 16,
				labelFontSize: 14,
				color: colors.text,
				titleColor: colors.text,
				labelColor: colors.text,
				tickColor: colors.axisDomain,
				domainColor: colors.axisDomain,
			},
			header: {
				titleFontSize: 22,
				labelFontSize: 18,
				color: colors.text,
				titleColor: colors.text,
				labelColor: colors.text,
				fontWeight: 'normal',
				titleFontWeight: 'normal',
				labelFontWeight: 'normal',
			},
			view: {
				height: 800,
				width: 800,
				strokeWidth: 0,
				fill: colors.fill,
			},
			axis: {
				domain: true,
				domainColor: colors.axisDomain,
				domainWidth: 1,
				gridWidth: 1,
				labelAngle: 0,
				tickSize: 5,
				gridCap: 'round',
				gridDash: [2, 4],
				fontWeight: 'normal',
				titleFontWeight: 'normal',
				labelFontWeight: 'normal',
				fontSize: 30,
				titleFontSize: 16,
				labelFontSize: 14,
				color: colors.axis,
				titleColor: colors.axis,
				labelColor: colors.axis,
				tickColor: colors.axisDomain,
			},
			axisX: {
				titleAnchor: 'end',
				titleAlign: 'center',
			},
			axisY: {
				titleAnchor: 'end',
				titleAngle: 0,
				titleAlign: 'center',
				titleY: -15,
				titleX: 0,
			},
			legend: {
				fontWeight: 'normal',
				titleFontWeight: 'normal',
				labelFontWeight: 'normal',
				fontSize: 30,
				titleFontSize: 16,
				labelFontSize: 14,
				color: colors.legend,
				titleColor: colors.legend,
				labelColor: colors.legend,
				tickColor: colors.axisDomain,
				domainColor: colors.axisDomain,
			},
		},
		data: { values: foldedData },
		facet: {
			row: {
				field: 'key',
				header: {
					labelOrient: 'top',
					anchor: 'start',
					fontSize: 18,
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
					},
					encoding: {
						opacity: {
							value: 0.2,
						},
						x: {
							field: 'timestamp',
							title: 'Elapsed time (seconds)',
							type: 'temporal',
						},
						y: {
							field: 'value',
							scale: {
								zero: false,
							},
							title: '',
							type: 'quantitative',
						},
					},
					name: 'view_11',
				},
				{
					mark: {
						type: 'line',
						color: colors.line,
					},
					encoding: {
						opacity: {
							value: 1,
						},
						x: {
							field: 'timestamp',
							type: 'temporal',
						},
						y: {
							field: 'value',
							scale: {
								zero: false,
							},
							type: 'quantitative',
						},
					},
					transform: [
						{
							filter: {
								param: 'param_11',
							},
						},
					],
				},
				{
					mark: {
						type: 'rule',
						color: colors.firebrick,
						strokeDash: [5, 5],
					},
					encoding: {
						x: {
							aggregate: 'min',
							field: 'timestamp',
							type: 'temporal',
						},
						x2: {
							aggregate: 'max',
							field: 'timestamp',
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
						{
							filter: {
								param: 'param_11',
							},
						},
					],
				},
			],
			height: 200,
			width: 'container',
		},
		params: [
			{
				name: 'param_11',
				select: {
					type: 'interval',
					encodings: ['x'],
				},
				views: ['view_11'],
			},
		],
		resolve: {
			scale: {
				x: 'independent',
				y: 'independent',
			},
		},
		spacing: 25,
		$schema: 'https://vega.github.io/schema/vega-lite/v5.20.1.json',
	};
}
