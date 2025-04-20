import { setActiveTab } from '../setActiveTab';

describe('setActiveTab', () => {
    beforeEach(() => {
        // Set up DOM structure
        document.body.innerHTML = `
            <button id="tab1" class="tab-button">Tab 1</button>
            <button id="tab2" class="tab-button active">Tab 2</button>
            <button id="tab3" class="tab-button">Tab 3</button>
        `;
    });

    it('should add "active" class to the specified tab and remove from others', () => {
        setActiveTab('tab1');
        expect(document.getElementById('tab1').classList.contains('active')).toBe(true);
        expect(document.getElementById('tab2').classList.contains('active')).toBe(false);
        expect(document.getElementById('tab3').classList.contains('active')).toBe(false);
    });

    it('should do nothing if the tabId does not exist', () => {
        setActiveTab('tab4');
        expect(document.getElementById('tab1').classList.contains('active')).toBe(false);
        expect(document.getElementById('tab2').classList.contains('active')).toBe(false);
        expect(document.getElementById('tab3').classList.contains('active')).toBe(false);
    });

    it('should remove "active" from all tabs if tabId is not found', () => {
        setActiveTab('nonexistent');
        document.querySelectorAll('.tab-button').forEach(btn => {
            expect(btn.classList.contains('active')).toBe(false);
        });
    });
});