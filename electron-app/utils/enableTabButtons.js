// utils/enableTabButtons.js
// Utility to enable or disable all tab buttons (except Open FIT File)

/**
 * Enable or disable all tab buttons (with class 'tab-button').
 * The Open FIT File button is never disabled.
 * @param {boolean} enabled - true to enable, false to disable
 */
export function setTabButtonsEnabled(enabled) {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(btn => {
        btn.disabled = !enabled;
        if (!enabled) {
            btn.classList.add('tab-disabled');
        } else {
            btn.classList.remove('tab-disabled');
        }
    });
}
