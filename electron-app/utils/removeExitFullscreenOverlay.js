export function removeExitFullscreenOverlay(container) {
	const overlay = container.querySelector('.exit-fullscreen-overlay');
	if (overlay) overlay.remove();
}
