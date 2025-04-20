import { showNotification, setLoading } from '../rendererUtils';

/**
 * @jest-environment jsdom
 */

describe('rendererUtils', () => {
    let notification, loadingOverlay;

    beforeEach(() => {
        // Set up DOM elements
        notification = document.createElement('div');
        notification.id = 'notification';
        document.body.appendChild(notification);

        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlay';
        document.body.appendChild(loadingOverlay);

        document.body.style.cursor = '';
    });

    afterEach(() => {
        notification.remove();
        loadingOverlay.remove();
        document.body.style.cursor = '';
        jest.useRealTimers();
    });

    describe('showNotification', () => {
        it('displays the notification with correct message and type', () => {
            showNotification('Test message', 'success', 0);
            expect(notification.textContent).toBe('Test message');
            expect(notification.className).toBe('notification success');
            expect(notification.style.display).toBe('block');
        });

        it('hides the notification after timeout', () => {
            jest.useFakeTimers();
            showNotification('Timeout test', 'info', 100);
            expect(notification.style.display).toBe('block');
            jest.advanceTimersByTime(100);
            expect(notification.style.display).toBe('none');
        });

        it('defaults to error type and 5000ms timeout', () => {
            jest.useFakeTimers();
            showNotification('Default test');
            expect(notification.className).toBe('notification error');
            jest.advanceTimersByTime(5000);
            expect(notification.style.display).toBe('none');
        });

        it('does nothing if notification element is missing', () => {
            notification.remove();
            expect(() => showNotification('No element')).not.toThrow();
        });
    });

    describe('setLoading', () => {
        it('shows overlay and sets cursor to wait when loading', () => {
            setLoading(true);
            expect(loadingOverlay.style.display).toBe('flex');
            expect(document.body.style.cursor).toBe('wait');
        });

        it('hides overlay and resets cursor when not loading', () => {
            setLoading(false);
            expect(loadingOverlay.style.display).toBe('none');
            expect(document.body.style.cursor).toBe('');
        });

        it('does nothing if overlay element is missing', () => {
            loadingOverlay.remove();
            expect(() => setLoading(true)).not.toThrow();
        });
    });
});