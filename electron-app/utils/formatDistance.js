export function formatDistance(meters) {
	if (meters == null || isNaN(meters)) return '';
	return `${(meters / 1000).toFixed(2)} km / ${(meters / 1609.34).toFixed(2)} mi`;
}