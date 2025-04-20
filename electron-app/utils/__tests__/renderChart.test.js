import { renderChart } from '../renderChart';

/**
 * @jest-environment jsdom
 */

describe('renderChart', () => {
    let container;

    beforeEach(() => {
        // Set up DOM container
        container = document.createElement('div');
        container.id = 'content-chart';
        document.body.appendChild(container);

        // Mock globalData and Arquero
        window.globalData = {
            recordMesgs: [
                { timestamp: '2024-01-01T00:00:00Z', speed: 10, power: 100 },
                { timestamp: '2024-01-01T00:01:00Z', speed: 12, power: 110 },
            ],
        };
        window.aq = {
            from: jest.fn((data) => ({
                columnNames: () => Object.keys(data[0]),
                fold: (cols, { as }) => ({
                    objects: () => [
                        { timestamp: '2024-01-01T00:00:00Z', key: 'speed', value: 10 },
                        { timestamp: '2024-01-01T00:00:00Z', key: 'power', value: 100 },
                        { timestamp: '2024-01-01T00:01:00Z', key: 'speed', value: 12 },
                        { timestamp: '2024-01-01T00:01:00Z', key: 'power', value: 110 },
                    ],
                }),
            })),
        };
        // Mock vegaEmbed
        global.vegaEmbed = jest.fn(() =>
            Promise.resolve({
                view: {
                    resize: jest.fn().mockReturnThis(),
                    run: jest.fn(),
                },
            })
        );
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
        delete window.globalData;
        delete window.aq;
        delete global.vegaEmbed;
    });

    it('renders chart in default container when no argument is given', async () => {
        await renderChart();
        expect(container.innerHTML).toContain('vega-container');
        expect(global.vegaEmbed).toHaveBeenCalled();
    });

    it('renders chart in container by ID', async () => {
        const custom = document.createElement('div');
        custom.id = 'my-chart-container';
        document.body.appendChild(custom);

        await renderChart('my-chart-container');
        expect(custom.innerHTML).toContain('vega-container');
        expect(global.vegaEmbed).toHaveBeenCalled();
    });

    it('renders chart in container element', async () => {
        const custom = document.createElement('div');
        document.body.appendChild(custom);

        await renderChart(custom);
        expect(custom.innerHTML).toContain('vega-container');
        expect(global.vegaEmbed).toHaveBeenCalled();
    });

    it('shows warning if #vega-container is missing', async () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const custom = document.createElement('div');
        document.body.appendChild(custom);

        // Remove #vega-container after renderChart sets it
        await renderChart(custom);
        custom.innerHTML = '';
        await renderChart(custom);

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('#vega-container element is missing')
        );
        warnSpy.mockRestore();
    });

    it('shows message if no recordMesgs data', () => {
        window.globalData = {};
        renderChart();
        expect(container.innerHTML).toContain('No recordMesgs data available');
    });
});