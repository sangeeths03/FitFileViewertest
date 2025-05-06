// Utility for About modal dialog

function ensureAboutModal() {
	if (document.getElementById('about-modal')) return;
	const modal = document.createElement('div');
	modal.id = 'about-modal';
	modal.className = 'modal';
	modal.style.display = 'none';
	modal.innerHTML = `
		<div class="modal-content">
			<span id="about-modal-close" class="modal-close" tabindex="0" aria-label="Close About dialog">&times;</span>
			<h2>About Fit File Viewer</h2>
			<p id="about-modal-body"></p>
		</div>
	`;
	document.body.appendChild(modal);
}

export function showAboutModal(html) {
	ensureAboutModal();
	const modal = document.getElementById('about-modal');
	const body = document.getElementById('about-modal-body');
	const closeBtn = document.getElementById('about-modal-close');
	if (modal && body && closeBtn) {
		body.innerHTML = html;
		modal.style.display = 'flex';
		closeBtn.onclick = () => { modal.style.display = 'none'; };
		closeBtn.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') modal.style.display = 'none'; };
		modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
	}
}
