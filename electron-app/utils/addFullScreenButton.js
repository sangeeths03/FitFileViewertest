import { getActiveTabContent } from './getActiveTabContent.js';
import { addExitFullscreenOverlay } from './addExitFullscreenOverlay.js';
import { removeExitFullscreenOverlay } from './removeExitFullscreenOverlay.js';

const screenfull = window.screenfull;

export function addFullScreenButton(tabContentId) {
	// Only add one global fullscreen button
	if (document.getElementById('global-fullscreen-btn-wrapper')) return;

	const wrapper = document.createElement('div');
	wrapper.className = 'fullscreen-btn-wrapper';
	wrapper.id = 'global-fullscreen-btn-wrapper';
	wrapper.style.position = 'fixed';
	wrapper.style.top = '24px';
	wrapper.style.right = '24px';
	wrapper.style.zIndex = 2001;
	wrapper.style.pointerEvents = 'none';

	const btn = document.createElement('button');
	btn.id = 'global-fullscreen-btn';
	btn.className = 'fullscreen-btn improved';
	btn.title = 'Toggle Full Screen';
	btn.innerHTML = `
		<span class="fullscreen-icon" aria-hidden="true">
			<!-- Material Design Enter Fullscreen Icon -->
			<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" class="inline-svg">
				<path d="M5 9V5H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M19 5H23V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M23 19V23H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M9 23H5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		</span>
	`;
	btn.style.pointerEvents = 'auto';

	btn.onclick = (e) => {
		e.stopPropagation();
		const activeContent = getActiveTabContent();
		if (!activeContent || !screenfull.isEnabled) return;
		if (!screenfull.isFullscreen) {
			screenfull.request(activeContent);
		} else {
			screenfull.exit();
		}
	};

	wrapper.appendChild(btn);
	document.body.appendChild(wrapper);
}

export function setupFullscreenListeners() {
	if (!screenfull.isEnabled) return;
	screenfull.on('change', () => {
		const activeContent = getActiveTabContent && getActiveTabContent();
		const btn = activeContent && document.getElementById(activeContent.id + '-fullscreen-btn');
		if (screenfull.isFullscreen) {
			if (activeContent) addExitFullscreenOverlay(activeContent);
			if (btn) {
				btn.title = 'Exit Full Screen';
				btn.querySelector('.fullscreen-icon').textContent = '🗗';
			}
		} else {
			if (activeContent) removeExitFullscreenOverlay(activeContent);
			if (btn) {
				btn.title = 'Toggle Full Screen';
				btn.querySelector('.fullscreen-icon').textContent = '⛶';
			}
		}
	});

	window.addEventListener('keydown', (e) => {
		if (e.key === 'F11') {
			e.preventDefault();
			const activeContent = getActiveTabContent && getActiveTabContent();
			if (activeContent && screenfull.isEnabled) {
				if (!screenfull.isFullscreen) {
					screenfull.request(activeContent);
				} else {
					screenfull.exit();
				}
			}
		}
		if (e.key === 'Escape') {
			e.preventDefault();
			if (screenfull.isFullscreen) {
				screenfull.exit();
			} else {
				// If not in browser fullscreen, check for tab pseudo-fullscreen
				const tabContents = document.querySelectorAll('.tab-content');
				let exited = false;
				for (const el of tabContents) {
					if (el.classList.contains('fullscreen')) {
						el.classList.remove('fullscreen');
						removeExitFullscreenOverlay(el);
						exited = true;
					}
				}
				if (!exited && window.electronAPI && typeof window.electronAPI.setFullScreen === 'function') {
					window.electronAPI.setFullScreen(false);
				}
			}
		}
	});
}

export function setupDOMContentLoaded() {
	window.addEventListener('DOMContentLoaded', () => {
		['content-data', 'content-chart', 'content-map', 'content-summary', 'content-altfit'].forEach(addFullScreenButton);
	});
}
