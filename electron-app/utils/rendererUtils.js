// Utility functions for renderer.js
// Move showNotification and setLoading here

export function showNotification(message, type = 'error', timeout = 5000) {
    const notif = document.getElementById('notification');
    if (!notif) return;
    notif.textContent = message;
    notif.className = `notification ${type}`;
    notif.style.display = 'block';
    if (timeout > 0) {
        setTimeout(() => {
            notif.style.display = 'none';
        }, timeout);
    }
}

export function setLoading(isLoading) {
    const overlay = document.getElementById('loadingOverlay');
    if (!overlay) return;
    overlay.style.display = isLoading ? 'flex' : 'none';
    document.body.style.cursor = isLoading ? 'wait' : '';
}
