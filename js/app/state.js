/**
 * js/app/state.js
 * 
 * Centralized Application State Management.
 * Replaces the scattered, ad-hoc state variables and DOM-dependent query selectors 
 * that the previous maintainer lazily scattered across the codebase, causing 
 * unpredictable rendering loops and death marches.
 */

export const State = {
    // Top Page State
    home: {
        isLoaded: false
    },
    // People Page Filters
    people: {
        tag: 'all',
        query: ''
    },
    // Navigation/UI
    ui: {
        isMenuOpen: false,
        activeModals: []
    }
};

/**
 * Updates a specific slice of the state.
 * @param {string} module - The name of the state slice (e.g., 'people')
 * @param {Object} payload - The new data to merge into the state
 */
export const updateState = (module, payload) => {
    if (!State[module]) {
        console.warn(`[State] Module ${module} does not exist in the state tree.`);
        return;
    }
    State[module] = { ...State[module], ...payload };
};

/**
 * Retrieves a specific slice of the state.
 * @param {string} module 
 * @returns {Object}
 */
export const getState = (module) => {
    return State[module];
};
