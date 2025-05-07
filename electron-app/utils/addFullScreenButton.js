import { getActiveTabContent } from './getActiveTabContent.js';
import { addExitFullscreenOverlay } from './addExitFullscreenOverlay.js';
import { removeExitFullscreenOverlay } from './removeExitFullscreenOverlay.js';

export function addFullScreenButton(tabContentId) {
	const container = document.getElementById(tabContentId);
	if (!container) return;
	if (document.getElementById(tabContentId + '-fullscreen-btn')) return;

	const wrapper = document.createElement('div');
	wrapper.className = 'fullscreen-btn-wrapper';
	wrapper.style.position = 'absolute';
	wrapper.style.right = '24px';
	wrapper.style.bottom = '24px';
	wrapper.style.zIndex = 1001;
	wrapper.style.pointerEvents = 'none';

	const btn = document.createElement('button');
	btn.id = tabContentId + '-fullscreen-btn';
	btn.className = 'fullscreen-btn improved';
	btn.title = 'Toggle Full Screen';
	btn.innerHTML = '<span class="fullscreen-icon">⛶</span>';
	btn.style.pointerEvents = 'auto';

	btn.onclick = (e) => {
		e.stopPropagation();
		const activeContent = getActiveTabContent();
		if (!activeContent) return;
		if (!document.fullscreenElement) {
			activeContent.requestFullscreen();
			btn.title = 'Exit Full Screen';
			btn.querySelector('.fullscreen-icon').textContent = '🗗';
			addExitFullscreenOverlay(activeContent);
		} else {
			document.exitFullscreen();
			btn.title = 'Toggle Full Screen';
			btn.querySelector('.fullscreen-icon').textContent = '⛶';
			removeExitFullscreenOverlay(activeContent);
		}
	};

	document.addEventListener('fullscreenchange', () => {
		if (!document.fullscreenElement) {
			btn.title = 'Toggle Full Screen';
			btn.querySelector('.fullscreen-icon').textContent = '⛶';
			const activeContent = getActiveTabContent();
			if (activeContent) removeExitFullscreenOverlay(activeContent);
		}
	});

	wrapper.appendChild(btn);
	const parent = container.parentElement;
	if (parent) {
		parent.style.position = 'relative';
		parent.appendChild(wrapper);
	}
}