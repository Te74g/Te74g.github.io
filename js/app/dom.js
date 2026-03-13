/**
 * js/app/dom.js
 * Common DOM and Asset Utility functions
 */

export const preloadImage = (src) => {
    return new Promise((resolve) => {
        if (!src) { resolve(); return; }
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => { console.warn(`Failed to load: ${src}`); resolve(src); };
        img.src = src;
    });
};
