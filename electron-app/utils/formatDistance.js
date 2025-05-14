/**
 * Formats a distance in meters to a string showing both kilometers and miles.
 *
 * @param {number} meters - The distance in meters to format.
 * @returns {string} The formatted distance as "X.XX km / Y.YY mi", or an empty string if input is invalid.
 */
const METERS_PER_KILOMETER = 1000;
const METERS_PER_MILE = 1609.34;

export function formatDistance(meters) {
	if (meters === null || meters === undefined || Number.isNaN(meters) || meters < 0) return '';
	const kilometers = (meters / METERS_PER_KILOMETER).toFixed(2);
	const miles = (meters / METERS_PER_MILE).toFixed(2);
	const kilometersText = `${kilometers} km`;
	const milesText = `${miles} mi`;
	return `${kilometersText} / ${milesText}`;
}
