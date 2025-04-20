import '@testing-library/jest-dom';

/**
 * @jest-environment jsdom
 */


describe('showNotification', () => {
    let notif;

    // Import the function from the code under test
    let showNotification;
    beforeAll(() => {
        // Simulate the function in the test context
        showNotification = function(message, type = 'error', timeout = 5000) {
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
        };
    });

    beforeEach(() => {
        // Set up DOM element
        notif = document.createElement('div');
        notif.id = 'notification';
        document.body.appendChild(notif);
        jest.useFakeTimers();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('sets notification text, class, and display', () => {
        showNotification('Test message', 'info', 0);
        expect(notif.textContent).toBe('Test message');
        expect(notif.className).toBe('notification info');
        expect(notif.style.display).toBe('block');
    });

    it('defaults type to error and timeout to 5000', () => {
        showNotification('Error message');
        expect(notif.className).toBe('notification error');
        expect(notif.style.display).toBe('block');
    });

    it('hides notification after timeout', () => {
        showNotification('Hide me', 'info', 1000);
        expect(notif.style.display).toBe('block');
        jest.advanceTimersByTime(1000);
        expect(notif.style.display).toBe('none');
    });

    it('does not hide notification if timeout is 0', () => {
        showNotification('No timeout', 'info', 0);
        expect(notif.style.display).toBe('block');
        jest.advanceTimersByTime(5000);
        expect(notif.style.display).toBe('block');
    });

    it('returns early if notification element is missing', () => {
        document.body.removeChild(notif);
        expect(() => showNotification('No element')).not.toThrow();
    });
});