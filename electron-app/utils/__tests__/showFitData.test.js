import { showFitData } from '../showFitData';

describe('showFitData', () => {
    let originalTitle;
    let globalDataBackup;
    let fileSpan, tabData, tabChart, tabMap, tabSummary, bgData;
    let displayTablesMock, renderChartMock, renderMapMock, renderSummaryMock;

    beforeEach(() => {
        // Backup document.title and globalData
        originalTitle = document.title;
        global.globalData = undefined;

        // Set up DOM elements
        fileSpan = document.createElement('span');
        fileSpan.id = 'activeFileName';
        document.body.appendChild(fileSpan);

        tabData = document.createElement('div');
        tabData.id = 'tab-data';
        document.body.appendChild(tabData);

        tabChart = document.createElement('div');
        tabChart.id = 'tab-chart';
        document.body.appendChild(tabChart);

        tabMap = document.createElement('div');
        tabMap.id = 'tab-map';
        document.body.appendChild(tabMap);

        tabSummary = document.createElement('div');
        tabSummary.id = 'tab-summary';
        document.body.appendChild(tabSummary);

        bgData = document.createElement('div');
        bgData.id = 'background-data-container';
        document.body.appendChild(bgData);

        // Mock window functions
        displayTablesMock = jest.fn();
        renderChartMock = jest.fn();
        renderMapMock = jest.fn();
        renderSummaryMock = jest.fn();
        window.displayTables = displayTablesMock;
        window.renderChart = renderChartMock;
        window.renderMap = renderMapMock;
        window.renderSummary = renderSummaryMock;
    });

    afterEach(() => {
        document.title = originalTitle;
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    it('sets globalData and updates file name and title when filePath is provided', () => {
        const data = {};
        const filePath = 'C:\\folder\\test.fit';
        showFitData(data, filePath);

        expect(global.globalData).toBe(data);
        expect(fileSpan.textContent).toBe('Active: test.fit');
        expect(fileSpan.title).toBe(filePath);
        expect(document.title).toBe('Fit File Viewer - test.fit');
    });

    it('uses cached file name if filePath matches', () => {
        const data = { cachedFileName: 'cached.fit', cachedFilePath: 'abc.fit' };
        const filePath = 'abc.fit';
        showFitData(data, filePath);

        expect(fileSpan.textContent).toBe('Active: cached.fit');
        expect(document.title).toBe('Fit File Viewer - cached.fit');
    });

    it('calls displayTables if data tab is active', () => {
        tabData.classList.add('active');
        const data = { foo: 1 };
        showFitData(data);

        expect(displayTablesMock).toHaveBeenCalledWith(data);
    });

    it('pre-renders data tables in background if data tab is not active', () => {
        const data = { foo: 1 };
        showFitData(data);

        expect(displayTablesMock).toHaveBeenCalled();
        expect(bgData.innerHTML).not.toBe('');
    });

    it('calls renderChart if chart tab is active and data exists', () => {
        tabChart.classList.add('active');
        const data = { foo: 1 };
        showFitData(data);

        expect(renderChartMock).toHaveBeenCalled();
    });

    it('does not call renderChart if chart tab is not active', () => {
        const data = { foo: 1 };
        showFitData(data);

        expect(renderChartMock).not.toHaveBeenCalled();
    });

    it('calls renderMap if map tab is active and data exists', () => {
        tabMap.classList.add('active');
        const data = { foo: 1 };
        showFitData(data);

        expect(renderMapMock).toHaveBeenCalled();
    });

    it('calls renderSummary if summary tab is active', () => {
        tabSummary.classList.add('active');
        const data = { foo: 1 };
        showFitData(data);

        expect(renderSummaryMock).toHaveBeenCalledWith(data);
    });

    it('does not throw if elements are missing', () => {
        document.body.innerHTML = '';
        const data = { foo: 1 };
        expect(() => showFitData(data)).not.toThrow();
    });
});