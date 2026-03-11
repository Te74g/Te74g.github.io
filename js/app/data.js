/**
 * js/app/data.js
 * 
 * Centralized Data Fetching and Normalization.
 * Replaces the scattered dependencies on global variables inside legacy components.
 */

/**
 * Retrieves the global members data.
 * @returns {Array<Object>} The members array, or an empty array if undefined.
 */
export const getMembersData = () => {
    return window.membersData || [];
};

/**
 * Retrieves the global site config.
 * @returns {Object} Site configuration object.
 */
export const getSiteConfig = () => {
    return window.siteConfig || {};
};
