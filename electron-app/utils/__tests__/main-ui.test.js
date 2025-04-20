import * as displayTablesModule from '../displayTables.js';
import * as renderChartModule from '../renderChart.js';
import * as renderMapModule from '../renderMap.js';
import * as renderSummaryModule from '../renderSummary.js';
import * as setActiveTabModule from '../setActiveTab.js';
import * as toggleTabVisibilityModule from '../toggleTabVisibility.js';
import '../../main-ui.js';

/**
 * @jest-environment jsdom
 */



describe('main-ui.js', () => {
    let originalAcquireVsCodeApi;

    beforeEach(() => {
        // Set up DOM structure
        document.body.innerHTML = `
            <span id="activeFileName"></span>
            <div id="tab-data" class="tab"></div>
            <div id="tab-chart" class="tab"></div>
            <div id="tab-map" class="tab"></div>
            <div id="tab-summary" class="tab"></div>
            <div id="content-data"></div>
            <div id="content-chart"></div>
            <div id="content-map"></div>
            <div id="content-summary"></div>
            <div id="background-data-container"></div>
            <div id="background-chart-container"></div>
        `;

        // Mock utility functions
        window.displayTables = jest.fn();
        window.renderChart = jest.fn();
        window.renderMap = jest.fn();
        window.renderSummary = jest.fn();
        window.setActiveTab = jest.fn();
        window.toggleTabVisibility = jest.fn();

        // Set up globalData
        window.globalData = null;

        // Mock acquireVsCodeApi
        originalAcquireVsCodeApi = global.acquireVsCodeApi;
        global.acquireVsCodeApi = undefined;
    });

    afterEach(() => {
        jest.clearAllMocks();
        global.acquireVsCodeApi = originalAcquireVsCodeApi;
    });

    describe('window.showFitData', () => {
        it('sets globalData and updates filename display', () => {
            const data = { cachedFileName: null, cachedFilePath: null };
            const filePath = 'C:\\folder\\test.fit';
            window.showFitData(data, filePath);

            expect(window.globalData).toBe(data);
            const fileSpan = document.getElementById('activeFileName');
            expect(fileSpan.textContent).toContain('test.fit');
            expect(fileSpan.title).toBe(filePath);
            expect(document.title).toContain('test.fit');
        });

        it('calls displayTables if tab-data is active', () => {
            const tabData = document.getElementById('tab-data');
            tabData.classList.add('active');
            const data = { foo: 'bar' };
            window.showFitData(data, 'file.fit');
            expect(window.displayTables).toHaveBeenCalledWith(data);
        });

        it('pre-renders data tables in background if tab-data is not active', () => {
            const data = { foo: 'bar' };
            window.showFitData(data, 'file.fit');
            const bgData = document.getElementById('background-data-container');
            expect(bgData.childNodes.length).toBeGreaterThanOrEqual(0);
            expect(window.displayTables).toHaveBeenCalled();
        });

        it('calls renderChart if tab-chart is active', () => {
            const tabChart = document.getElementById('tab-chart');
            tabChart.classList.add('active');
            const data = { foo: 'bar' };
            window.showFitData(data, 'file.fit');
            expect(window.renderChart).toHaveBeenCalled();
        });

        it('calls renderMap if tab-map is active', () => {
            const tabMap = document.getElementById('tab-map');
            tabMap.classList.add('active');
            const data = { foo: 'bar' };
            window.showFitData(data, 'file.fit');
            expect(window.renderMap).toHaveBeenCalled();
        });

        it('calls renderSummary if tab-summary is active', () => {
            const tabSummary = document.getElementById('tab-summary');
            tabSummary.classList.add('active');
            const data = { foo: 'bar' };
            window.showFitData(data, 'file.fit');
            expect(window.renderSummary).toHaveBeenCalledWith(data);
        });
    });

    describe('window.onload', () => {
        it('calls toggleTabVisibility with content-map', () => {
            window.toggleTabVisibility = jest.fn();
            window.onload();
            expect(window.toggleTabVisibility).toHaveBeenCalledWith('content-map');
        });

        it('sets up tab click handlers and switches tabs', () => {
            const tabData = document.getElementById('tab-data');
            const tabChart = document.getElementById('tab-chart');
            const tabMap = document.getElementById('tab-map');
            const tabSummary = document.getElementById('tab-summary');

            tabData.onclick();
            expect(window.toggleTabVisibility).toHaveBeenCalledWith('content-data');
            expect(window.setActiveTab).toHaveBeenCalledWith('tab-data');

            tabChart.onclick();
            expect(window.toggleTabVisibility).toHaveBeenCalledWith('content-chart');
            expect(window.setActiveTab).toHaveBeenCalledWith('tab-chart');

            tabMap.onclick();
            expect(window.toggleTabVisibility).toHaveBeenCalledWith('content-map');
            expect(window.setActiveTab).toHaveBeenCalledWith('tab-map');

            tabSummary.onclick();
            expect(window.toggleTabVisibility).toHaveBeenCalledWith('content-summary');
            expect(window.setActiveTab).toHaveBeenCalledWith('tab-summary');
        });
    });

    describe('message event listener', () => {
        it('handles fitData message and updates UI', () => {
            const data = { foo: 'bar' };
            const event = new MessageEvent('message', {
                data: { type: 'fitData', data }
            });
            window.displayTables = jest.fn();
            window.renderChart = jest.fn();
            window.renderMap = jest.fn();
            window.renderSummary = jest.fn();

            document.getElementById('tab-chart').classList.add('active');
            document.getElementById('tab-map').classList.add('active');
            document.getElementById('tab-summary').classList.add('active');

            window.dispatchEvent(event);

            expect(window.displayTables).toHaveBeenCalledWith(data);
            expect(window.renderChart).toHaveBeenCalled();
            expect(window.renderMap).toHaveBeenCalled();
            expect(window.renderSummary).toHaveBeenCalledWith(data);
        });
    });
});