import { applyTheme, loadTheme, listenForThemeChange } from '../theme';

describe('theme.js', () => {
    let originalLocalStorage;
    let originalBodyClassList;
    let originalElectronAPI;

    beforeEach(() => {
        // Mock localStorage
        originalLocalStorage = global.localStorage;
        let store = {};
        global.localStorage = {
            getItem: jest.fn((key) => store[key]),
            setItem: jest.fn((key, value) => { store[key] = value; }),
            clear: jest.fn(() => { store = {}; }),
        };

        // Mock document.body.classList
        originalBodyClassList = document.body.classList;
        document.body.classList = {
            classes: [],
            remove: jest.fn(function (...args) {
                this.classes = this.classes.filter(c => !args.includes(c));
            }),
            add: jest.fn(function (cls) {
                if (!this.classes.includes(cls)) this.classes.push(cls);
            }),
        };

        // Remove electronAPI if present
        originalElectronAPI = window.electronAPI;
        delete window.electronAPI;
    });

    afterEach(() => {
        global.localStorage = originalLocalStorage;
        document.body.classList = originalBodyClassList;
        window.electronAPI = originalElectronAPI;
    });

    describe('applyTheme', () => {
        it('should add the correct theme class and persist it', () => {
            applyTheme('dark');
            expect(document.body.classList.remove).toHaveBeenCalledWith('theme-dark', 'theme-light');
            expect(document.body.classList.add).toHaveBeenCalledWith('theme-dark');
            expect(localStorage.setItem).toHaveBeenCalledWith('ffv-theme', 'dark');
        });

        it('should add the correct theme class for light theme', () => {
            applyTheme('light');
            expect(document.body.classList.add).toHaveBeenCalledWith('theme-light');
            expect(localStorage.setItem).toHaveBeenCalledWith('ffv-theme', 'light');
        });
    });

    describe('loadTheme', () => {
        it('should return the persisted theme', () => {
            localStorage.getItem.mockReturnValue('light');
            expect(loadTheme()).toBe('light');
        });

        it('should default to dark if no theme is persisted', () => {
            localStorage.getItem.mockReturnValue(null);
            expect(loadTheme()).toBe('dark');
        });

        it('should default to dark if localStorage throws', () => {
            localStorage.getItem.mockImplementation(() => { throw new Error('fail'); });
            expect(loadTheme()).toBe('dark');
        });
    });

    describe('listenForThemeChange', () => {
        it('should call onThemeChange and sendThemeChanged when electronAPI is present', () => {
            const onThemeChange = jest.fn();
            const sendThemeChanged = jest.fn();
            const onSetTheme = jest.fn(cb => cb('dark'));
            window.electronAPI = { onSetTheme, sendThemeChanged };

            listenForThemeChange(onThemeChange);

            expect(onSetTheme).toHaveBeenCalled();
            expect(onThemeChange).toHaveBeenCalledWith('dark');
            expect(sendThemeChanged).toHaveBeenCalledWith('dark');
        });

        it('should do nothing if electronAPI is not present', () => {
            const onThemeChange = jest.fn();
            listenForThemeChange(onThemeChange);
            expect(onThemeChange).not.toHaveBeenCalled();
        });
    });
});