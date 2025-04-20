import { renderSummary } from '../renderSummary.js';

/**
 * @jest-environment jsdom
 */

jest.mock('./patchSummaryFields.js', () => ({
    patchSummaryFields: jest.fn((obj) => obj),
}));
jest.mock('./formatDistance.js', () => ({
    formatDistance: jest.fn((d) => `${d} m`),
}));
jest.mock('./formatDuration.js', () => ({
    formatDuration: jest.fn((s) => `${s} sec`),
}));

describe('renderSummary', () => {
    let container;

    beforeEach(() => {
        document.body.innerHTML = '<div id="content-summary"></div>';
        container = document.getElementById('content-summary');
        // Mock navigator.clipboard
        global.navigator.clipboard = {
            writeText: jest.fn().mockResolvedValue(),
        };
        // Mock window.aq for recordMesgs
        global.window.aq = {
            from: (arr) => ({
                numRows: () => arr.length,
                get: (idx, key) => arr[idx][key],
                columnNames: () => Object.keys(arr[0] || {}),
                array: (key) => arr.map((r) => r[key]),
            }),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
        delete global.window.aq;
        delete global.navigator.clipboard;
    });

    it('renders summary from sessionMesgs', () => {
        const data = {
            sessionMesgs: [
                { total_ascent: 100, total_descent: 80, foo: 'bar' },
            ],
        };
        renderSummary(data);
        expect(container.querySelector('h3').textContent).toBe('Activity Summary');
        expect(container.querySelector('table')).toBeTruthy();
        expect(container.textContent).toContain('total_ascent');
        expect(container.textContent).toContain('100');
        expect(container.textContent).toContain('total_ascent_ft');
        expect(container.textContent).toContain('328 ft');
        expect(container.textContent).toContain('total_descent_ft');
        expect(container.textContent).toContain('262 ft');
    });

    it('renders summary from recordMesgs', () => {
        const data = {
            recordMesgs: [
                { timestamp: 1000, distance: 100, speed: 2, altitude: 10 },
                { timestamp: 2000, distance: 200, speed: 4, altitude: 20 },
            ],
        };
        renderSummary(data);
        expect(container.querySelector('h3').textContent).toBe('Activity Summary');
        expect(container.querySelector('table')).toBeTruthy();
        expect(container.textContent).toContain('total_records');
        expect(container.textContent).toContain('2');
        expect(container.textContent).toContain('total_distance');
        expect(container.textContent).toContain('200 m');
        expect(container.textContent).toContain('avg_speed');
        expect(container.textContent).toContain('max_speed');
        expect(container.textContent).toContain('min_altitude_ft');
        expect(container.textContent).toContain('max_altitude_ft');
    });

    it('renders lap summary if lapMesgs present', () => {
        const data = {
            sessionMesgs: [{ foo: 1 }],
            lapMesgs: [
                { lap_index: 1, total_time: 300, distance: 1000 },
                { lap_index: 2, total_time: 200, distance: 800 },
            ],
        };
        renderSummary(data);
        const lapHeading = Array.from(container.querySelectorAll('h3')).find(
            (el) => el.textContent === 'Lap Summary'
        );
        expect(lapHeading).toBeTruthy();
        const lapTable = lapHeading.parentElement.parentElement.querySelector('table');
        expect(lapTable).toBeTruthy();
        expect(lapTable.textContent).toContain('lap_index');
        expect(lapTable.textContent).toContain('1');
        expect(lapTable.textContent).toContain('2');
    });

    it('shows "No summary data available." if no data', () => {
        renderSummary({});
        expect(container.textContent).toMatch(/no summary data/i);
    });

    it('copies summary CSV to clipboard when button clicked', async () => {
        const data = {
            sessionMesgs: [{ foo: 1, bar: 2 }],
        };
        renderSummary(data);
        const btn = container.querySelector('.copy-btn');
        btn.click();
        // Wait for clipboard.writeText to be called
        await Promise.resolve();
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
        const csv = navigator.clipboard.writeText.mock.calls[0][0];
        expect(csv).toContain('foo,bar');
        expect(csv).toContain('1,2');
    });

    it('copies lap summary CSV to clipboard when button clicked', async () => {
        const data = {
            sessionMesgs: [{ foo: 1 }],
            lapMesgs: [
                { lap_index: 1, total_time: 300 },
                { lap_index: 2, total_time: 200 },
            ],
        };
        renderSummary(data);
        const lapBtn = Array.from(container.querySelectorAll('.copy-btn')).find(
            (btn) => btn.parentElement.textContent.includes('Lap Summary')
        );
        lapBtn.click();
        await Promise.resolve();
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
        const csv = navigator.clipboard.writeText.mock.calls[0][0];
        expect(csv).toContain('lap_index,total_time');
        expect(csv).toContain('1,300');
        expect(csv).toContain('2,200');
    });
});