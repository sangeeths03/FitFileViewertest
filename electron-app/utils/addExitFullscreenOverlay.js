export function addExitFullscreenOverlay(container) {
	if (container.querySelector('.exit-fullscreen-overlay')) return;
	const overlay = document.createElement('button');
	overlay.className = 'exit-fullscreen-overlay themed-btn exit-fullscreen-btn';
	overlay.innerHTML = 'Exit Fullscreen';
	overlay.onclick = (e) => {
		e.stopPropagation();
		document.exitFullscreen();
	};
	container.appendChild(overlay);
}