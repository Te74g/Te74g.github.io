/**
 * js/app/url.js
 * Centralized URL Parsing, Path Resolution, and Query String Management.
 */

export const getUrlParam = (param) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
};

export const getUrlDepth = () => {
    const pathParts = window.location.pathname.split('/').filter(p => p && !p.includes('.'));
    return pathParts.length;
};

export const getSubdirectorySegment = () => {
    const pathParts = window.location.pathname.split('/').filter(p => p && !p.includes('.'));
    return pathParts.length > 0 ? pathParts[0] : '';
};

export const updateUrlParam = (param, value) => {
    const url = new URL(window.location);
    url.searchParams.set(param, value);
    window.history.replaceState({}, '', url);
};

export const removeUrlParam = (param) => {
    const url = new URL(window.location);
    url.searchParams.delete(param);
    window.history.replaceState({}, '', url);
};

/**
 * WebP Manifest Loading
 */
let imageManifest = null;
let manifestPromise = null;

export const loadManifest = () => {
    if (manifestPromise) return manifestPromise;

    const manifestUrl = fixPath('./js/image_manifest.json');
    manifestPromise = fetch(manifestUrl)
        .then(res => {
            if (!res.ok) throw new Error('Manifest not found');
            return res.json();
        })
        .then(data => {
            imageManifest = data;
            console.log('WebP Manifest loaded');
        })
        .catch(err => {
            console.warn('WebP Manifest load failed, falling back to original images:', err);
            imageManifest = {}; // Empty object to prevent errors
        });
    return manifestPromise;
};

/**
 * Path Fixer & WebP Resolver
 */
export const fixPath = (path) => {
    if (!path) return '';
    // Keep absolute paths, protocol-relative paths, or anchors
    if (path.match(/^(http|\/\/)/) || path.startsWith('#') || path.startsWith('mailto:')) return path;

    // "assets/..." -> "./assets/..." normalization for processing
    let cleanPath = path;

    // Normalize: Strip existing traversal to re-calculate based on current depth
    while (cleanPath.startsWith('../')) cleanPath = cleanPath.substring(3);
    while (cleanPath.startsWith('./')) cleanPath = cleanPath.substring(2);

    // --- WebP Resolution Logic ---
    if (imageManifest && cleanPath.includes('assets/')) {
        let key = cleanPath;
        if (key.startsWith('assets/')) {
            const webpPath = imageManifest[key];
            if (webpPath) {
                cleanPath = webpPath;
            }
        }
    }

    // Calculate required depth from Main Root
    const pathParts = window.location.pathname.split('/').filter(p => p && !p.includes('.'));
    const depth = pathParts.length;

    let prefix = '';
    for (let i = 0; i < depth; i++) {
        prefix += '../';
    }

    if (depth === 0 && !cleanPath.startsWith('.')) {
        return './' + cleanPath;
    }

    return prefix + cleanPath;
};
