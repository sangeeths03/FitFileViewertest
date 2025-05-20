/**
 * Toggles the visibility of tab content sections by setting the display style.
 * Only the tab content with the specified `visibleTabId` will be shown; all others will be hidden.
 * If `visibleTabId` does not match any of the IDs in `tabContentIds`, no tab content will be displayed.
 *
 * @param {string} visibleTabId - The ID of the tab content element to display.
 */
export function toggleTabVisibility(visibleTabId) {
	const tabContentIds = [
		'content-data',
		'content-chart',
		'content-chartjs',
		'content-map',
		'content-summary',
		'content-altfit',
		'content-zwift',
	];
	// Iterate through each tab content ID to toggle its visibility based on the `visibleTabId`.
	// Validate the DOM structure before toggling visibility
	// Cache DOM elements in a map for better performance
	const elementMap = tabContentIds.reduce((map, id) => {
		const el = document.getElementById(id);
		if (el) {
			map[id] = el;
		} else {
			console.warn(`toggleTabVisibility: Missing element in the DOM: ${id}`);
		}
		return map;
	}, {});

	// Toggle visibility using the cached elements
	Object.entries(elementMap).forEach(([id, el]) => {
		// Set the display style to 'block' if the current ID matches the visibleTabId; otherwise, hide it with 'none'.
		el.style.display = id === visibleTabId ? 'block' : 'none';
	});
}
