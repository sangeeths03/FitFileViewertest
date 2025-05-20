/**
 * Sets up a tab button by assigning a click event handler to it.
 * 
 * @param {string} id - The ID of the button element.
 * @param {Function} handler - The event handler function to be executed on click.
 * @throws {void} Logs a warning if the button with the given `id` is not found.
 */
export function setupTabButton(id, handler) {
	if (id === null || id === undefined || typeof id !== 'string' || id.trim() === '') {
		console.warn('Invalid button id provided.');
		return;
	}
	
	if (typeof handler !== 'function') {
		console.warn('Invalid handler provided. It must be a function.');
		return;
	}

	const cache = setupTabButton.cache || (setupTabButton.cache = new Map());
	let btn = cache.get(id);

	// Clean up cache if the button is no longer in the DOM
	if (btn && !document.body.contains(btn)) {
		cache.delete(id);
		btn = null;
	}
			console.warn(`Button with id "${id}" not found in the DOM.`);
	if (!btn) {
		btn = document.getElementById(id);
		if (btn) {
			cache.set(id, btn);
		} else {
			console.warn(`Button with id "${id}" not found. Ensure the element exists in the DOM.`);
			return;
		}
	}

	if (!btn._eventHandlers) {
		btn._eventHandlers = new Map();
	}

	if (!btn._eventHandlers.has('click') || btn._eventHandlers.get('click') !== handler) {
		btn.addEventListener('click', handler);
		btn._eventHandlers.set('click', handler);
	}
}
