const fs = require('fs');
const path = require('path');
const { app, BrowserWindow } = require('electron');
const { getWindowState, saveWindowState, settingsPath, createWindow } = require('../../windowStateUtils');

jest.mock('fs');
jest.mock('electron', () => {
    const appMock = {
        getPath: jest.fn(() => '/mock/user/data')
    };
    const BrowserWindowMock = jest.fn().mockImplementation((opts) => {
        let bounds = { width: opts.width, height: opts.height, x: opts.x, y: opts.y };
        return {
            getBounds: jest.fn(() => bounds),
            isMinimized: jest.fn(() => false),
            isMaximized: jest.fn(() => false),
            on: jest.fn(),
            loadFile: jest.fn(),
            __setBounds: (b) => { bounds = b; }
        };
    });
    return { app: appMock, BrowserWindow: BrowserWindowMock };
});

describe('windowStateUtils', () => {
    const mockSettingsPath = path.join('/mock/user/data', 'window-state.json');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getWindowState', () => {
        it('returns parsed window state if file exists', () => {
            fs.readFileSync.mockReturnValue('{"width":1000,"height":700,"x":10,"y":20}');
            const state = getWindowState();
            expect(fs.readFileSync).toHaveBeenCalledWith(mockSettingsPath, 'utf8');
            expect(state).toEqual({ width: 1000, height: 700, x: 10, y: 20 });
        });

        it('returns default state if file does not exist or is invalid', () => {
            fs.readFileSync.mockImplementation(() => { throw new Error('not found'); });
            const state = getWindowState();
            expect(state).toEqual({ width: 1200, height: 800 });
        });
    });

    describe('saveWindowState', () => {
        it('writes window bounds if not minimized or maximized', () => {
            const win = {
                isMinimized: jest.fn(() => false),
                isMaximized: jest.fn(() => false),
                getBounds: jest.fn(() => ({ width: 900, height: 600, x: 5, y: 5 }))
            };
            saveWindowState(win);
            expect(fs.writeFileSync).toHaveBeenCalledWith(
                mockSettingsPath,
                JSON.stringify({ width: 900, height: 600, x: 5, y: 5 })
            );
        });

        it('does not write if window is minimized', () => {
            const win = {
                isMinimized: jest.fn(() => true),
                isMaximized: jest.fn(() => false),
                getBounds: jest.fn()
            };
            saveWindowState(win);
            expect(fs.writeFileSync).not.toHaveBeenCalled();
        });

        it('does not write if window is maximized', () => {
            const win = {
                isMinimized: jest.fn(() => false),
                isMaximized: jest.fn(() => true),
                getBounds: jest.fn()
            };
            saveWindowState(win);
            expect(fs.writeFileSync).not.toHaveBeenCalled();
        });
    });

    describe('createWindow', () => {
        it('creates a BrowserWindow with correct options and loads file', () => {
            fs.readFileSync.mockReturnValue('{"width":800,"height":600,"x":100,"y":200}');
            const win = createWindow();
            expect(BrowserWindow).toHaveBeenCalledWith(expect.objectContaining({
                width: 800,
                height: 600,
                x: 100,
                y: 200,
                webPreferences: expect.objectContaining({
                    preload: expect.any(String),
                    nodeIntegration: false,
                    contextIsolation: true,
                    sandbox: false
                })
            }));
            expect(win.loadFile).toHaveBeenCalledWith('index.html');
            expect(win.on).toHaveBeenCalledWith('close', expect.any(Function));
        });

        it('uses default state if no file', () => {
            fs.readFileSync.mockImplementation(() => { throw new Error('not found'); });
            const win = createWindow();
            expect(BrowserWindow).toHaveBeenCalledWith(expect.objectContaining({
                width: 1200,
                height: 800
            }));
        });
    });

    it('exports settingsPath correctly', () => {
        expect(settingsPath).toBe(mockSettingsPath);
    });
});