// Utility for showing notifications
export function showNotification(message, type = 'info', duration = 6000) {
	const notification = document.getElementById('notification');
	if (!notification) return;
	notification.textContent = message;
	notification.className = `notification ${type}`;
	notification.style.display = 'block';
	setTimeout(() => {
		notification.style.display = 'none';
	}, duration);
}
