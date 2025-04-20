import { toggleTabVisibility } from '../toggleTabVisibility';

describe('toggleTabVisibility', () => {
    const tabContentIds = [
        'content-data',
        'content-chart',
        'content-map',
        'content-summary',
    ];

    // Helper to create mock tab content elements
    function setupDOM() {
        tabContentIds.forEach(id => {
            const el = document.createElement('div');
            el.id = id;
            el.style.display = 'none';
            document.body.appendChild(el);
        });
    }

    // Helper to clean up DOM after each test
    function cleanupDOM() {
        tabContentIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.remove();
        });
    }

    beforeEach(() => {
        setupDOM();
    });

    afterEach(() => {
        cleanupDOM();
    });

    it('shows only the specified tab and hides the others', () => {
        toggleTabVisibility('content-chart');
        tabContentIds.forEach(id => {
            const el = document.getElementById(id);
            if (id === 'content-chart') {
                expect(el.style.display).toBe('block');
            } else {
                expect(el.style.display).toBe('none');
            }
        });
    });

    it('hides all tabs if visibleTabId does not match any', () => {
        toggleTabVisibility('non-existent-id');
        tabContentIds.forEach(id => {
            const el = document.getElementById(id);
            expect(el.style.display).toBe('none');
        });
    });

    it('does not throw if some tab elements are missing', () => {
        // Remove one element
        const el = document.getElementById('content-map');
        if (el) el.remove();
        expect(() => toggleTabVisibility('content-data')).not.toThrow();
        expect(document.getElementById('content-data').style.display).toBe('block');
        expect(document.getElementById('content-chart').style.display).toBe('none');
        expect(document.getElementById('content-summary').style.display).toBe('none');
    });
});