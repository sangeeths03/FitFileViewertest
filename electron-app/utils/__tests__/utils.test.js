import * as toggleTabVisibilityModule from '../toggleTabVisibility.js';
import * as utilsModule from '../../utils.js';

// utils.test.js


describe('utils.js', () => {
    it('should attach toggleTabVisibility to window', () => {
        // Mock window object
        global.window = {};
        // Mock toggleTabVisibility function
        const mockToggleTabVisibility = jest.fn();
        jest.spyOn(toggleTabVisibilityModule, 'toggleTabVisibility').mockImplementation(mockToggleTabVisibility);

        // Re-import utils.js to trigger the code that attaches to window
        jest.resetModules();
        require('../../utils.js');

        expect(window.toggleTabVisibility).toBe(mockToggleTabVisibility);

        // Clean up
        delete global.window;
        jest.restoreAllMocks();
    });

    it('should attach all utility functions to window', () => {
        global.window = {};
        // Mock all utility functions
        const mockFns = {};
        [
            'formatDistance',
            'formatDuration',
            'patchSummaryFields',
            'displayTables',
            'renderTable',
            'copyTableAsCSV',
            'renderChart',
            'renderMap',
            'renderSummary',
            'setActiveTab',
            'toggleTabVisibility',
            'showFitData',
        ].forEach(fnName => {
            mockFns[fnName] = jest.fn();
            jest.doMock(`./utils/${fnName}.js`, () => ({ [fnName]: mockFns[fnName] }), { virtual: true });
        });

        jest.resetModules();
        require('../../utils.js');

        Object.keys(mockFns).forEach(fnName => {
            expect(window[fnName]).toBe(mockFns[fnName]);
        });

        delete global.window;
        jest.resetModules();
        jest.clearAllMocks();
    });
});