import { renderMap } from '../renderMap';

/**
 * @jest-environment jsdom
 */

// Mock Leaflet global L
const mockSetView = jest.fn().mockReturnThis();
const mockAddTo = jest.fn().mockReturnThis();
const mockFitBounds = jest.fn();
const mockPolyline = jest.fn(() => ({
    addTo: mockAddTo,
    getBounds: () => 'mockBounds',
}));
const mockTileLayer = jest.fn(() => ({
    addTo: mockAddTo,
}));
global.L = {
    map: jest.fn(() => ({
        setView: mockSetView,
        fitBounds: mockFitBounds,
    })),
    tileLayer: mockTileLayer,
    polyline: mockPolyline,
};

describe('renderMap', () => {
    let mapContainer;

    beforeEach(() => {
        document.body.innerHTML = '<div id="content-map"></div>';
        mapContainer = document.getElementById('content-map');
        jest.clearAllMocks();
        window.globalData = undefined;
    });

    it('renders map and polyline when valid coordinates are present', () => {
        window.globalData = {
            recordMesgs: [
                { positionLat: 1073741824, positionLong: 1073741824 }, // 45, 45
                { positionLat: 2147483647, positionLong: 2147483647 }, // ~90, ~90
            ],
        };
        renderMap();
        expect(mapContainer.innerHTML).toContain('leaflet-map');
        expect(L.map).toHaveBeenCalledWith('leaflet-map');
        expect(L.tileLayer).toHaveBeenCalled();
        expect(L.polyline).toHaveBeenCalledWith(
            [
                [45, 45],
                [89.99999997671694, 89.99999997671694],
            ],
            { color: 'blue' }
        );
        expect(mockAddTo).toHaveBeenCalled();
        expect(mockFitBounds).not.toHaveBeenCalled(); // fitBounds is called on map, not on the returned object
    });

    it('shows message if no valid coordinates are present', () => {
        window.globalData = {
            recordMesgs: [
                { positionLat: null, positionLong: null },
                { positionLat: undefined, positionLong: undefined },
            ],
        };
        renderMap();
        expect(mapContainer.innerHTML).toContain('No location data available');
    });

    it('shows message if recordMesgs is missing', () => {
        window.globalData = {};
        renderMap();
        expect(mapContainer.innerHTML).toContain('No location data available');
    });

    it('shows message if globalData is missing', () => {
        window.globalData = undefined;
        renderMap();
        expect(mapContainer.innerHTML).toContain('No location data available');
    });

    it('ignores non-number coordinates', () => {
        window.globalData = {
            recordMesgs: [
                { positionLat: 'foo', positionLong: 'bar' },
                { positionLat: 1073741824, positionLong: 1073741824 },
            ],
        };
        renderMap();
        expect(L.polyline).toHaveBeenCalledWith([[45, 45]], { color: 'blue' });
    });
});