const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const recentFiles = require('../recentFiles');

jest.mock('fs');
jest.mock('electron', () => ({
    app: {
        getPath: jest.fn(),
    },
}));

const mockUserDataPath = '/mock/user/data';
const RECENT_FILES_PATH = path.join(mockUserDataPath, 'recent-files.json');

beforeEach(() => {
    jest.clearAllMocks();
    require('electron').app.getPath.mockReturnValue(mockUserDataPath);
});

describe('recentFiles utility', () => {
    describe('loadRecentFiles', () => {
        it('returns parsed array if file exists and is valid', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify(['file1', 'file2']));
            expect(recentFiles.loadRecentFiles()).toEqual(['file1', 'file2']);
            expect(fs.readFileSync).toHaveBeenCalledWith(RECENT_FILES_PATH, 'utf-8');
        });

        it('returns empty array if file does not exist', () => {
            fs.existsSync.mockReturnValue(false);
            expect(recentFiles.loadRecentFiles()).toEqual([]);
        });

        it('returns empty array and logs error if JSON is invalid', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue('not json');
            const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
            expect(recentFiles.loadRecentFiles()).toEqual([]);
            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });
    });

    describe('saveRecentFiles', () => {
        it('writes only up to MAX_RECENT_FILES', () => {
            const list = Array.from({ length: 15 }, (_, i) => `file${i}`);
            recentFiles.saveRecentFiles(list);
            expect(fs.writeFileSync).toHaveBeenCalledWith(
                RECENT_FILES_PATH,
                JSON.stringify(list.slice(0, 10)),
                'utf-8'
            );
        });

        it('logs error if write fails', () => {
            fs.writeFileSync.mockImplementation(() => { throw new Error('fail'); });
            const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
            recentFiles.saveRecentFiles(['file1']);
            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });
    });

    describe('addRecentFile', () => {
        it('adds new file to top of list', () => {
            jest.spyOn(recentFiles, 'loadRecentFiles').mockReturnValue(['file2', 'file3']);
            const saveSpy = jest.spyOn(recentFiles, 'saveRecentFiles').mockImplementation(() => {});
            recentFiles.addRecentFile('file1');
            expect(saveSpy).toHaveBeenCalledWith(['file1', 'file2', 'file3']);
            saveSpy.mockRestore();
        });

        it('moves existing file to top', () => {
            jest.spyOn(recentFiles, 'loadRecentFiles').mockReturnValue(['file1', 'file2']);
            const saveSpy = jest.spyOn(recentFiles, 'saveRecentFiles').mockImplementation(() => {});
            recentFiles.addRecentFile('file2');
            expect(saveSpy).toHaveBeenCalledWith(['file2', 'file1']);
            saveSpy.mockRestore();
        });
    });

    describe('getShortRecentName', () => {
        it('returns basename of file path', () => {
            expect(recentFiles.getShortRecentName('/some/path/file.fit')).toBe('file.fit');
            expect(recentFiles.getShortRecentName('file2.fit')).toBe('file2.fit');
        });
    });
});