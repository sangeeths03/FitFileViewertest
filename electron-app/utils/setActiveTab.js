/**
 * Utility function to set the active tab.
 * @param {string} tabId - The ID of the tab button to activate.
 */
export function setActiveTab(tabId) {
	document.querySelectorAll('.tab-button').forEach((btn) => {
		btn.classList.remove('active');
	});
	const tab = document.getElementById(tabId);
	if (tab) tab.classList.add('active');
}