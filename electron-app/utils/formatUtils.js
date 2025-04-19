/**
 * Converts a speed value from meters per second to a formatted string
 * displaying both kilometers per hour (km/h) and miles per hour (mph).
 *
 * @param {number|string} val - The speed value in meters per second.
 * @returns {string} The formatted speed string in "xx.xx km/h / xx.xx mph" format.
 */
export function formatSpeed(val) {
	return (
		(Number(val) * 3.6).toFixed(2) +
		' km/h / ' +
		(Number(val) * 2.23694).toFixed(2) +
		' mph'
	);
}

/**
 * Formats an array or a comma-separated string of numbers to a string with each number
 * rounded to a specified number of decimal digits.
 *
 * @param {number[] | string} val - The array of numbers or a comma-separated string of numbers to format.
 * @param {number} [digits=2] - The number of decimal digits to round each number to.
 * @returns {string | number[] | string} A string of formatted numbers separated by commas if the input is an array or a comma-separated string. Returns the original value unchanged if it is neither an array nor a string.
 */
export function formatArray(val, digits = 2) {
	if (Array.isArray(val))
		return val
			.map((v) => {
				if (isNaN(Number(v))) throw new Error(`Invalid number: ${v}`);
				return Number(v).toFixed(digits);
			})
			.join(', ');
	if (typeof val === 'string' && val.includes(','))
		return val
			.split(',')
			.map((v) => {
				if (isNaN(Number(v))) throw new Error(`Invalid number: ${v}`);
				return Number(v).toFixed(digits);
			})
			.join(', ');
	return val;
}
