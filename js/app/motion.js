/**
 * js/app/motion.js
 * 
 * Centralized Animation and Transition Handlers.
 * Extracts hardcoded `setTimeout`, `requestAnimationFrame`, and inline styles
 * from legacy components to provide clean, reusable motion primitives.
 */

/**
 * Utility to pause execution for a given number of milliseconds
 * Replaces the scattered `const delay = (ms) => new Promise(...)` definitions.
 * @param {number} ms 
 * @returns {Promise<void>}
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Smoothly fades in an element by toggling a CSS class.
 * Ensures the element is rendered and forces a reflow if necessary.
 * @param {HTMLElement} element 
 * @param {string} [visibleClass='is-visible'] 
 * @param {boolean} [forceReflow=false]
 */
export const fadeIn = (element, visibleClass = 'is-visible', forceReflow = false) => {
    if (!element) return;

    if (forceReflow) {
        element.classList.remove(visibleClass);
        void element.offsetWidth; // Force CSS reflow
    }

    requestAnimationFrame(() => {
        element.classList.add(visibleClass);
    });
};

/**
 * Fades out an element directly via inline transition styles if a class toggle is insufficient.
 * @param {HTMLElement} element 
 * @param {number} [durationMs=300] 
 */
export const fadeOutElement = (element, durationMs = 300) => {
    if (!element) return;

    element.style.transition = `opacity ${durationMs}ms ease`;
    element.style.opacity = '0';

    setTimeout(() => {
        element.style.display = 'none';
        element.style.opacity = '';
        element.style.transition = '';
    }, durationMs);
};
