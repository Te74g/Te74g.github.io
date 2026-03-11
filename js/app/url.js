/**
 * js/app/url.js
 * 
 * Centralized URL Parsing and Query String Management.
 * Replaces the fragmented URLSearchParams logic scattered across ui.js and people.js.
 */

/**
 * Gets a specific URL parameter.
 * @param {string} param - The query parameter name (e.g., 'tag')
 * @returns {string|null} - The value, or null if it doesn't exist
 */
export const getUrlParam = (param) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
};

/**
 * Updates a URL parameter without reloading the page.
 * Useful for history/state syncing when filters change.
 * @param {string} param 
 * @param {string} value 
 */
export const updateUrlParam = (param, value) => {
    const url = new URL(window.location);
    url.searchParams.set(param, value);
    window.history.replaceState({}, '', url);
};

/**
 * Removes a URL parameter without reloading the page.
 * @param {string} param 
 */
export const removeUrlParam = (param) => {
    const url = new URL(window.location);
    url.searchParams.delete(param);
    window.history.replaceState({}, '', url);
};
