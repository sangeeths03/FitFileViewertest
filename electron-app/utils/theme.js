// Theme utility functions for theme switching and persistence

/**
 * Apply the given theme to the document body and persist it.
 * @param {string} theme - 'dark' or 'light'
 */
export function applyTheme(theme) {
	document.body.classList.remove('theme-dark', 'theme-light');
	document.body.classList.add(`theme-${theme}`);
	try {
		localStorage.setItem('ffv-theme', theme);
	} catch (error) {
		console.error('Failed to persist theme to localStorage:', error);
	}
}

/**
 * Load the persisted theme from localStorage, defaulting to 'dark'.
 * @returns {string}
 */
export function loadTheme() {
	try {
		return localStorage.getItem('ffv-theme') || 'dark';
	} catch (error) {
		console.error('Error loading theme from localStorage:', error);
		return 'dark';
	}
}

/**
 * Listen for theme change events from the Electron main process and apply the theme.
 * @param {(theme: string) => void} onThemeChange
 */
export function listenForThemeChange(onThemeChange) {
	if (
		window.electronAPI &&
		typeof window.electronAPI.onSetTheme === 'function' &&
		typeof window.electronAPI.sendThemeChanged === 'function'
	) {
		// The callback receives a 'theme' parameter, which is expected to be a string ('dark' or 'light').
		window.electronAPI.onSetTheme((theme) => {
			onThemeChange(theme);
			if (typeof window.electronAPI.sendThemeChanged === 'function') {
				window.electronAPI.sendThemeChanged(theme);
			} else {
				console.warn(
					'sendThemeChanged method is not available on electronAPI.',
				);
			}
		});
	} else {
		console.warn(
			'Electron API is not available. Theme change listener is not active.',
		);
	}
}
