export function setupTabButton(id, handler) {
	const btn = document.getElementById(id);
	if (btn) btn.onclick = handler;
}