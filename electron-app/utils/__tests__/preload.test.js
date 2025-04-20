const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('preload.js', () => {
    let ipcRendererMock, fsMock, fitParserMock, electronAPI;

    beforeEach(() => {
        ipcRendererMock = {
            invoke: sinon.stub(),
            on: sinon.stub()
        };
        fsMock = {
            readFile: sinon.stub()
        };
        fitParserMock = {
            decodeFitFile: sinon.stub()
        };

        const preload = proxyquire('./preload', {
            electron: { contextBridge: { exposeInMainWorld: (name, api) => { electronAPI = api; } }, ipcRenderer: ipcRendererMock },
            fs: fsMock,
            './fitParser': fitParserMock
        });
    });

    it('should call ipcRenderer.invoke for openFile', async () => {
        ipcRendererMock.invoke.resolves(['file1.fit']);
        const result = await electronAPI.openFile();
        expect(ipcRendererMock.invoke.calledWith('dialog:openFile')).to.be.true;
        expect(result).to.deep.equal(['file1.fit']);
    });

    it('should read file and resolve with ArrayBuffer', async () => {
        const fakeBuffer = Buffer.from([1, 2, 3]);
        fsMock.readFile.yields(null, fakeBuffer);

        const result = await electronAPI.readFile('test.fit');
        expect(fsMock.readFile.calledWith('test.fit')).to.be.true;
        expect(result).to.be.instanceOf(ArrayBuffer);
    });

    it('should reject readFile on error', async () => {
        fsMock.readFile.yields(new Error('fail'), null);

        try {
            await electronAPI.readFile('bad.fit');
            throw new Error('Should have thrown');
        } catch (err) {
            expect(err).to.be.instanceOf(Error);
            expect(err.message).to.equal('fail');
        }
    });

    it('should parse FIT file using fitParser', async () => {
        const arrayBuffer = new Uint8Array([1, 2, 3]).buffer;
        const decoded = { foo: 'bar' };
        fitParserMock.decodeFitFile.resolves(decoded);

        const result = await electronAPI.parseFitFile(arrayBuffer);
        expect(fitParserMock.decodeFitFile.called).to.be.true;
        expect(result).to.deep.equal(decoded);
    });

    it('should get recent files', async () => {
        ipcRendererMock.invoke.resolves(['recent1.fit']);
        const result = await electronAPI.recentFiles();
        expect(ipcRendererMock.invoke.calledWith('recentFiles:get')).to.be.true;
        expect(result).to.deep.equal(['recent1.fit']);
    });

    it('should add recent file', async () => {
        ipcRendererMock.invoke.resolves(['recent1.fit', 'recent2.fit']);
        const result = await electronAPI.addRecentFile('recent2.fit');
        expect(ipcRendererMock.invoke.calledWith('recentFiles:add', 'recent2.fit')).to.be.true;
        expect(result).to.deep.equal(['recent1.fit', 'recent2.fit']);
    });

    it('should register menu-open-file handler', () => {
        const cb = sinon.stub();
        electronAPI.onMenuOpenFile(cb);
        expect(ipcRendererMock.on.calledWith('menu-open-file', cb)).to.be.true;
    });

    it('should register open-recent-file handler and call callback with filePath', () => {
        const cb = sinon.stub();
        electronAPI.onOpenRecentFile(cb);

        const handler = ipcRendererMock.on.getCall(0).args[1];
        handler({}, 'foo.fit');
        expect(cb.calledWith('foo.fit')).to.be.true;
    });
});