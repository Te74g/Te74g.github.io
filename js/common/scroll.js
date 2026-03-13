/**
 * js/common/scroll.js
 * Handles scroll-based UI features like header elevation and the 'to-top' button.
 */

// Throttle utility
const throttle = (fn, limit) => {
    let lastRun = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastRun >= limit) {
            lastRun = now;
            fn.apply(this, args);
        }
    };
};

export function initScrollEffects() {
    // Header elevation
    const header = document.querySelector('[data-elevate]');
    const setElevated = () => {
        if (!header) return;
        header.classList.toggle('is-elevated', window.scrollY > 6);
    };
    window.addEventListener('scroll', setElevated, { passive: true });
    setElevated();

    // To Top Button - Prevent overlap with footer
    const toTopBtn = document.querySelector('.to-top');
    const footer = document.querySelector('.site-footer');

    if (toTopBtn && footer) {
        const adjustToTop = () => {
            const footerRect = footer.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // Calculate how much of the footer is visible
            const footerVisibleHeight = Math.max(0, viewportHeight - footerRect.top);

            if (footerVisibleHeight > 0) {
                toTopBtn.style.bottom = `${24 + footerVisibleHeight}px`;
            } else {
                toTopBtn.style.bottom = '24px';
            }
        };

        const throttledAdjust = throttle(adjustToTop, 100);
        window.addEventListener('scroll', throttledAdjust, { passive: true });
        window.addEventListener('resize', throttledAdjust, { passive: true });
        adjustToTop(); // init
    }
}
