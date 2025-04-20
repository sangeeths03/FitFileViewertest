/**
 * Utility function to toggle tab visibility.
 * @param {string} visibleTabId - The ID of the tab content to show.
 */
export function toggleTabVisibility(visibleTabId) {
	const tabContentIds = [
		'content-data',
		'content-chart',
		'content-map',
		'content-summary',
	];
	tabContentIds.forEach((id) => {
		const el = document.getElementById(id);
		if (el) el.style.display = id === visibleTabId ? 'block' : 'none';
	});
}