/**
 * Sets the active tab by adding the 'active' class to the tab button with the given ID,
 * and removing the 'active' class from all other tab buttons.
 *
 * @param {string} tabId - The ID of the tab button to activate.
 */
export function setActiveTab(tabId) {
	document.querySelectorAll('.tab-button').forEach((btn) => {
		btn.classList.remove('active');
	});
	const tab = document.getElementById(tabId);
	if (tab) tab.classList.add('active');
}
