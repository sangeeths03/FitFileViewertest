export function addExitFullscreenOverlay(container) {
	if (container.querySelector('.exit-fullscreen-overlay')) return;
	const overlay = document.createElement('button');
	overlay.className = 'exit-fullscreen-overlay themed-btn exit-fullscreen-btn';
	overlay.title = 'Exit Fullscreen';
	overlay.innerHTML = `
		<span class="fullscreen-exit-icon" aria-hidden="true">
			<!-- Material Design Exit Fullscreen Icon -->
			<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" class="inline-svg">
					<path d="M9 19H5V23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M19 9H23V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M19 19H23V23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M9 9H5V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		</span>
	`;
	overlay.onclick = (e) => {
		e.stopPropagation();
		document.exitFullscreen();
	};
	container.appendChild(overlay);
}
