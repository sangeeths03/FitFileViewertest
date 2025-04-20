import { displayTables } from '../displayTables.js';

describe('displayTables', () => {
    let container;
    let originalAq;
    let renderTableMock;

    beforeAll(() => {
        // Mock renderTable
        jest.unstable_mockModule('./renderTable.js', () => ({
            renderTable: jest.fn(),
        }));
    });

    beforeEach(async () => {
        // Setup DOM
        document.body.innerHTML = '<div id="content-data"></div>';
        container = document.getElementById('content-data');

        // Mock Arquero
        originalAq = window.aq;
        window.aq = {
            from: jest.fn((arr) => ({
                numRows: () => arr.length,
            })),
        };

        // Import renderTable mock
        const mod = await import('../renderTable.js');
        renderTableMock = mod.renderTable;
        renderTableMock.mockClear();
    });

    afterEach(() => {
        window.aq = originalAq;
    });

    it('renders tables in correct order (recordMesgs first)', () => {
        const dataFrames = {
            foo: [{ a: 1 }],
            recordMesgs: [{ b: 2 }],
            bar: [{ c: 3 }],
        };

        displayTables(dataFrames);

        expect(window.aq.from).toHaveBeenCalledTimes(3);
        expect(renderTableMock).toHaveBeenCalledTimes(3);

        // Check order: recordMesgs, bar, foo (alphabetical after recordMesgs)
        expect(renderTableMock.mock.calls[0][1]).toBe('recordMesgs');
        expect(renderTableMock.mock.calls[1][1]).toBe('bar');
        expect(renderTableMock.mock.calls[2][1]).toBe('foo');
    });

    it('uses containerOverride if provided', () => {
        const override = document.createElement('div');
        const dataFrames = { recordMesgs: [{ x: 1 }] };

        displayTables(dataFrames, override);

        expect(renderTableMock).toHaveBeenCalledWith(
            override,
            'recordMesgs',
            expect.anything(),
            0,
        );
    });

    it('logs error if Arquero is missing', () => {
        window.aq = undefined;
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        displayTables({ foo: [] });
        expect(errorSpy).toHaveBeenCalledWith(
            '[ERROR] Arquero (window.aq) is not available.',
        );
        errorSpy.mockRestore();
    });

    it('logs error if container is missing', () => {
        document.body.innerHTML = '';
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        displayTables({ foo: [] });
        expect(errorSpy).toHaveBeenCalledWith(
            '[ERROR] Container element with id "content-data" not found.',
        );
        errorSpy.mockRestore();
    });

    it('skips non-array keys', () => {
        const dataFrames = {
            recordMesgs: [{ a: 1 }],
            notArray: 'string',
        };
        displayTables(dataFrames);
        expect(window.aq.from).toHaveBeenCalledTimes(1);
        expect(renderTableMock).toHaveBeenCalledTimes(1);
        expect(renderTableMock.mock.calls[0][1]).toBe('recordMesgs');
    });

    it('logs error if renderTable throws', () => {
        const dataFrames = { recordMesgs: [{ a: 1 }] };
        renderTableMock.mockImplementation(() => {
            throw new Error('fail');
        });
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        displayTables(dataFrames);
        expect(errorSpy).toHaveBeenCalledWith(
            expect.stringContaining('[ERROR] Failed to render table for key: recordMesgs'),
            expect.any(Error),
        );
        errorSpy.mockRestore();
    });
});