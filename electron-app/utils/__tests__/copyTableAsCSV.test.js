import { copyTableAsCSV } from '../copyTableAsCSV';

describe('copyTableAsCSV', () => {
    let originalClipboard;
    let originalConsole;
    let originalWindow;
    let originalDocument;
    let mockAq;
    let mockTable;
    let csvString;

    beforeEach(() => {
        // Mock console
        originalConsole = global.console;
        global.console = {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
        };

        // Mock window.aq
        csvString = 'col1,col2\n1,"{\"a\":2}"';
        mockAq = {
            from: jest.fn(() => ({
                toCSV: jest.fn(() => csvString),
            })),
        };
        originalWindow = global.window;
        global.window = { aq: mockAq };

        // Mock navigator.clipboard
        originalClipboard = global.navigator?.clipboard;
        global.navigator = {
            clipboard: {
                writeText: jest.fn(() => Promise.resolve()),
            },
        };

        // Mock document for fallback
        originalDocument = global.document;
        global.document = {
            createElement: jest.fn(() => ({
                style: {},
                focus: jest.fn(),
                select: jest.fn(),
            })),
            body: {
                appendChild: jest.fn(),
                removeChild: jest.fn(),
            },
            execCommand: jest.fn(() => true),
        };

        // Mock table
        mockTable = {
            objects: jest.fn(() => [
                { col1: 1, col2: { a: 2 } },
            ]),
        };
    });

    afterEach(() => {
        global.console = originalConsole;
        global.window = originalWindow;
        global.navigator.clipboard = originalClipboard;
        global.document = originalDocument;
    });

    it('calls clipboard.writeText with CSV string if available', async () => {
        await copyTableAsCSV(mockTable, 'Test');
        expect(mockAq.from).toHaveBeenCalled();
        expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith(csvString);
    });

    it('logs error if table.objects is not a function', () => {
        copyTableAsCSV({}, 'Test');
        expect(global.console.error).toHaveBeenCalledWith('Invalid table object: missing objects method');
    });

    it('falls back to textarea if clipboard API is unavailable', () => {
        global.navigator.clipboard = undefined;
        const textareaMock = {
            style: {},
            focus: jest.fn(),
            select: jest.fn(),
        };
        global.document.createElement = jest.fn(() => textareaMock);
        global.document.execCommand = jest.fn(() => true);

        copyTableAsCSV(mockTable, 'Test');

        expect(global.document.createElement).toHaveBeenCalledWith('textarea');
        expect(global.document.body.appendChild).toHaveBeenCalledWith(textareaMock);
        expect(global.document.execCommand).toHaveBeenCalledWith('copy');
        expect(global.document.body.removeChild).toHaveBeenCalledWith(textareaMock);
        expect(global.console.warn).toHaveBeenCalledWith(
            'navigator.clipboard.writeText is not supported. Using fallback.',
        );
    });

    it('serializes nested objects in rows', () => {
        copyTableAsCSV(mockTable, 'Test');
        const calledRows = mockAq.from.mock.calls[0][0];
        expect(typeof calledRows[0].col2).toBe('string');
        expect(() => JSON.parse(calledRows[0].col2)).not.toThrow();
    });

    it('logs error if clipboard.writeText fails', async () => {
        global.navigator.clipboard.writeText = jest.fn(() => Promise.reject('fail'));
        await copyTableAsCSV(mockTable, 'Test');
        // Wait for promise to settle
        await new Promise(setImmediate);
        expect(global.console.error).toHaveBeenCalledWith('Failed to copy CSV:', 'fail');
    });

    it('logs error if fallback execCommand fails', () => {
        global.navigator.clipboard = undefined;
        global.document.execCommand = jest.fn(() => { throw new Error('fail'); });
        copyTableAsCSV(mockTable, 'Test');
        expect(global.console.error).toHaveBeenCalledWith(
            'Failed to copy CSV using fallback:',
            expect.any(Error)
        );
    });
});