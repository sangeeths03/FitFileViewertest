/**
 * Sets the active tab by adding the 'active' class to the tab button with the given ID,
 * and removing the 'active' class from all other tab buttons.
 *
 * @param {string} tabId - The ID of the tab button to activate.
 * @returns {void} - This function does not return anything.
 */
export function setActiveTab(tabId) {
	const tabButtons = document.querySelectorAll('.tab-button');
	tabButtons.forEach((btn) => {
		btn.classList.remove('active');
	});
	if (typeof tabId === 'string' && tabId.trim() !== '') {
		const tab = document.getElementById(tabId);
		if (tab) {
			tab.classList.add('active');
		}
	} else {
		console.warn('Invalid tabId provided:', tabId);
	}
}
