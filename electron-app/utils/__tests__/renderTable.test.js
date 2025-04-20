import { renderTable } from '../renderTable.js';
import { copyTableAsCSV } from '../copyTableAsCSV.js';

/**
 * @jest-environment jsdom
 */

// Mock the copyTableAsCSV function
jest.mock('./copyTableAsCSV.js', () => ({
    copyTableAsCSV: jest.fn(),
}));

describe('renderTable', () => {
    let container;
    let tableMock;

    beforeEach(() => {
        container = document.createElement('div');
        tableMock = {
            toHTML: jest.fn().mockReturnValue('<thead><tr><th>Col</th></tr></thead><tbody><tr><td>Val</td></tr></tbody>'),
        };
        jest.clearAllMocks();
        // Remove jQuery from window for native tests
        delete window.jQuery;
        // Remove $ from window
        delete window.$;
    });

    test('renders collapsible table section with header and table', () => {
        renderTable(container, 'Test Title', tableMock, 1);

        // Section
        const section = container.querySelector('.table-section');
        expect(section).toBeTruthy();

        // Header
        const header = section.querySelector('.table-header');
        expect(header).toBeTruthy();
        expect(header.querySelector('span').textContent).toBe('Test Title');

        // Copy button
        const copyBtn = section.querySelector('.copy-btn');
        expect(copyBtn).toBeTruthy();
        expect(copyBtn.textContent).toBe('Copy as CSV');

        // Table content (hidden by default)
        const content = section.querySelector('.table-content');
        expect(content).toBeTruthy();
        expect(content.style.display).toBe('none');

        // Table element
        const table = content.querySelector('table');
        expect(table).toBeTruthy();
        expect(table.id).toBe('datatable_1');
        expect(table.innerHTML).toContain('<th>Col</th>');
        expect(table.innerHTML).toContain('<td>Val</td>');
        expect(tableMock.toHTML).toHaveBeenCalledWith({ limit: Infinity });
    });

    test('copy button calls copyTableAsCSV with correct args', () => {
        renderTable(container, 'My Table', tableMock, 2);
        const copyBtn = container.querySelector('.copy-btn');
        copyBtn.click();
        expect(copyTableAsCSV).toHaveBeenCalledWith(tableMock, 'My Table');
    });

    test('header toggles content visibility and icon', () => {
        renderTable(container, 'Toggle Table', tableMock, 3);
        const header = container.querySelector('.table-header');
        const content = container.querySelector('.table-content');
        const icon = header.querySelector('span:last-child');

        // Initially hidden
        expect(content.style.display).toBe('none');
        expect(icon.textContent).toBe('➕');

        // Simulate click to show
        header.click();
        expect(content.style.display).toBe('block');
        expect(icon.textContent).toBe('➖');

        // Simulate click to hide
        header.click();
        expect(content.style.display).toBe('none');
        expect(icon.textContent).toBe('➕');
    });

    test('logs warning if jQuery is not available', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        renderTable(container, 'No jQuery', tableMock, 4);
        expect(warnSpy).toHaveBeenCalledWith(
            '[WARNING] jQuery is not available. Falling back to native DOM methods.',
        );
        warnSpy.mockRestore();
    });

    test('logs debug if table element found without jQuery', async () => {
        jest.useFakeTimers();
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        renderTable(container, 'Native Table', tableMock, 5);
        jest.runAllTimers();
        expect(logSpy).toHaveBeenCalledWith('[DEBUG] DataTable initialization skipped for #datatable_5');
        logSpy.mockRestore();
        jest.useRealTimers();
    });

    test('logs error if table element not found without jQuery', async () => {
        jest.useFakeTimers();
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        // Remove the table after render
        renderTable(container, 'Missing Table', tableMock, 6);
        const table = document.getElementById('datatable_6');
        table.parentNode.removeChild(table);
        jest.runAllTimers();
        expect(errorSpy).toHaveBeenCalledWith('[ERROR] Table element not found for #datatable_6');
        errorSpy.mockRestore();
        jest.useRealTimers();
    });

    test('initializes DataTable if jQuery and DataTable are available', () => {
        // Mock jQuery and DataTable
        const readyMock = jest.fn((cb) => cb());
        const dataTableMock = jest.fn();
        window.jQuery = true;
        window.$ = Object.assign(jest.fn(() => ({
            DataTable: dataTableMock,
        })), {
            fn: { DataTable: true },
        });
        window.$.fn = { DataTable: true };
        window.$.mockImplementation = (selector) => ({
            DataTable: dataTableMock,
        });
        window.$.ready = readyMock;

        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        renderTable(container, 'jQuery Table', tableMock, 7);

        // Simulate setTimeout
        jest.runAllTimers();
        expect(dataTableMock).toHaveBeenCalled();
        expect(logSpy).toHaveBeenCalledWith('[DEBUG] Initializing DataTable for #datatable_7');
        logSpy.mockRestore();
    });

    test('logs error if DataTables.js is not loaded', () => {
        window.jQuery = true;
        window.$ = Object.assign(jest.fn(() => ({
            DataTable: undefined,
        })), {
            fn: {},
        });
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        renderTable(container, 'No DataTables', tableMock, 8);
        jest.runAllTimers();
        expect(errorSpy).toHaveBeenCalledWith('[ERROR] DataTables.js is not loaded');
        errorSpy.mockRestore();
    });

    test('logs error if DataTable init throws', () => {
        window.jQuery = true;
        window.$ = Object.assign(jest.fn(() => ({
            DataTable: () => { throw new Error('fail'); },
        })), {
            fn: { DataTable: true },
        });
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        renderTable(container, 'Throw Table', tableMock, 9);
        jest.runAllTimers();
        expect(errorSpy).toHaveBeenCalledWith(
            '[ERROR] DataTable init failed for #datatable_9',
            expect.any(Error)
        );
        errorSpy.mockRestore();
    });
});