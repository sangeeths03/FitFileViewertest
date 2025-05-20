// Utility for showing notifications
/**
 * Displays a notification on the screen.
	if (!notification) {
		console.warn('Notification element not found. Unable to display notification.');
		return;
	}
 * @param {string} message - The message to display in the notification.
 * @param {string} [type='info'] - The type of notification. Possible values: 'info', 'error', 'success', etc.
 * @param {number} [duration=6000] - The duration (in milliseconds) for which the notification is displayed.
 */
export function showNotification(message, type = 'info', duration = 6000) {
	const notification = document.getElementById('notification');
	if (!notification) {
		console.warn('Notification element not found. Unable to display notification.');
		return;
	}
	notification.textContent = message;
	notification.className = 'notification ' + type;
	notification.style.display = 'block';
	if (notification.notificationTimeout) {
		clearTimeout(notification.notificationTimeout);
	}
	// Hide the notification after the specified duration
	notification.notificationTimeout = setTimeout(() => {
		notification.style.display = 'none';
	}, duration);
}
