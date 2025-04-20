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
	} catch {}
}

/**
 * Load the persisted theme from localStorage, defaulting to 'dark'.
 * @returns {string}
 */
export function loadTheme() {
	try {
		return localStorage.getItem('ffv-theme') || 'dark';
	} catch {
		return 'dark';
	}
}

/**
 * Listen for theme change events from the Electron main process and apply the theme.
 * @param {(theme: string) => void} onThemeChange
 */
export function listenForThemeChange(onThemeChange) {
	if (window.electronAPI) {
		window.electronAPI.onSetTheme((theme) => {
			onThemeChange(theme);
			window.electronAPI.sendThemeChanged(theme);
		});
	}
}
