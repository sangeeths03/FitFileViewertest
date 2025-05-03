/**
 * Toggles the visibility of tab content sections by setting the display style.
 * Only the tab content with the specified `visibleTabId` will be shown; all others will be hidden.
 *
 * @param {string} visibleTabId - The ID of the tab content element to display.
 */
export function toggleTabVisibility(visibleTabId) {
	const tabContentIds = [
		'content-data',
		'content-chart',
		'content-map',
		'content-summary',
		'content-altfit', // Added altfit tab content
	];
	tabContentIds.forEach((id) => {
		const el = document.getElementById(id);
		if (el) el.style.display = id === visibleTabId ? 'block' : 'none';
	});
}
