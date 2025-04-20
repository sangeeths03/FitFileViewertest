const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { createWindow } = require('../../windowStateUtils');
const { buildAppMenu } = require('../buildAppMenu');
const { addRecentFile, loadRecentFiles } = require('../recentFiles');
const main = require('../../main');
const fakeDialog = require('electron').dialog;

// Mock dependencies
jest.mock('./windowStateUtils', () => ({
    createWindow: jest.fn(() => ({ id: 1 }))
}));
jest.mock('./utils/recentFiles', () => ({
    loadRecentFiles: jest.fn(() => ['file1.fit', 'file2.fit']),
    saveRecentFiles: jest.fn(),
    addRecentFile: jest.fn(),
    getShortRecentName: jest.fn()
}));
jest.mock('./utils/buildAppMenu', () => ({
    buildAppMenu: jest.fn()
}));


describe('main.js', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should call buildAppMenu with mainWindow after window creation', async () => {
        // Simulate app ready
        expect(createWindow).toHaveBeenCalled();
        expect(buildAppMenu).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
    });

    test('should add file to recent files and rebuild menu on dialog:openFile', async () => {
        fakeDialog.showOpenDialog = jest.fn().mockResolvedValue({
            canceled: false,
            filePaths: ['test.fit']
        });

        const handler = ipcMain._events['dialog:openFile'];
        const filePath = await handler();
        expect(addRecentFile).toHaveBeenCalledWith('test.fit');
        expect(buildAppMenu).toHaveBeenCalled();
        expect(filePath).toBe('test.fit');
    });

    test('should return recent files on recentFiles:get', async () => {
        const handler = ipcMain._events['recentFiles:get'];
        const files = await handler();
        expect(loadRecentFiles).toHaveBeenCalled();
        expect(files).toEqual(['file1.fit', 'file2.fit']);
    });

    test('should add file to recent files and rebuild menu on recentFiles:add', async () => {
        const handler = ipcMain._events['recentFiles:add'];
        const files = await handler({}, 'added.fit');
        expect(addRecentFile).toHaveBeenCalledWith('added.fit');
        expect(buildAppMenu).toHaveBeenCalled();
        expect(files).toEqual(['file1.fit', 'file2.fit']);
    });
});