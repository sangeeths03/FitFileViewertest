export function formatDuration(seconds) {
	if (seconds == null || isNaN(seconds)) return '';
	seconds = Math.round(seconds);
	if (seconds < 60) return `${seconds} sec`;
	if (seconds < 3600)
		return `${Math.floor(seconds / 60)} min ${seconds % 60} sec`;
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	return `${h} hr${h > 1 ? 's' : ''} ${m} min`;
}
