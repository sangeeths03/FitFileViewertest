const { buildAppMenu } = require('../buildAppMenu');
const { Menu } = require('electron');
const { loadRecentFiles, getShortRecentName } = require('../recentFiles');

jest.mock('electron', () => {
    return {
        Menu: {
            buildFromTemplate: jest.fn(template => template),
            setApplicationMenu: jest.fn(),
        },
    };
});

jest.mock('./recentFiles', () => ({
    loadRecentFiles: jest.fn(),
    getShortRecentName: jest.fn(),
}));


describe('buildAppMenu', () => {
    let mainWindow;

    beforeEach(() => {
        mainWindow = {
            webContents: {
                send: jest.fn(),
            },
        };
        Menu.buildFromTemplate.mockClear();
        Menu.setApplicationMenu.mockClear();
        loadRecentFiles.mockReset();
        getShortRecentName.mockReset();
    });

    it('should set menu with "No Recent Files" when there are no recent files', () => {
        loadRecentFiles.mockReturnValue([]);
        buildAppMenu(mainWindow);

        expect(Menu.buildFromTemplate).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    label: 'File',
                    submenu: expect.arrayContaining([
                        expect.objectContaining({
                            label: 'Open Recent',
                            submenu: [{ label: 'No Recent Files', enabled: false }],
                        }),
                    ]),
                }),
            ])
        );
        expect(Menu.setApplicationMenu).toHaveBeenCalled();
    });

    it('should set menu with recent files when present', () => {
        loadRecentFiles.mockReturnValue(['/foo/bar.fit', '/baz/qux.fit']);
        getShortRecentName.mockImplementation(f => f.split('/').pop());
        buildAppMenu(mainWindow);

        expect(Menu.buildFromTemplate).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    label: 'File',
                    submenu: expect.arrayContaining([
                        expect.objectContaining({
                            label: 'Open Recent',
                            submenu: [
                                expect.objectContaining({
                                    label: 'bar.fit',
                                    tooltip: '/foo/bar.fit',
                                }),
                                expect.objectContaining({
                                    label: 'qux.fit',
                                    tooltip: '/baz/qux.fit',
                                }),
                            ],
                        }),
                    ]),
                }),
            ])
        );
        expect(Menu.setApplicationMenu).toHaveBeenCalled();
    });

    it('should send "menu-open-file" when Open... is clicked', () => {
        loadRecentFiles.mockReturnValue([]);
        buildAppMenu(mainWindow);

        const template = Menu.buildFromTemplate.mock.calls[0][0];
        const fileMenu = template.find(m => m.label === 'File');
        const openItem = fileMenu.submenu.find(i => i.label === 'Open...');
        openItem.click();

        expect(mainWindow.webContents.send).toHaveBeenCalledWith('menu-open-file');
    });

    it('should send "open-recent-file" with correct file when a recent file is clicked', () => {
        const files = ['/foo/bar.fit'];
        loadRecentFiles.mockReturnValue(files);
        getShortRecentName.mockReturnValue('bar.fit');
        buildAppMenu(mainWindow);

        const template = Menu.buildFromTemplate.mock.calls[0][0];
        const fileMenu = template.find(m => m.label === 'File');
        const openRecent = fileMenu.submenu.find(i => i.label === 'Open Recent');
        const recentItem = openRecent.submenu[0];
        recentItem.click();

        expect(mainWindow.webContents.send).toHaveBeenCalledWith('open-recent-file', '/foo/bar.fit');
    });

    it('should not throw if mainWindow or webContents is missing', () => {
        loadRecentFiles.mockReturnValue(['/foo/bar.fit']);
        getShortRecentName.mockReturnValue('bar.fit');
        expect(() => buildAppMenu(null)).not.toThrow();
        expect(() => buildAppMenu({})).not.toThrow();
    });
});