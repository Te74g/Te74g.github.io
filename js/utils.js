/**
 * utils.js
 * Common utility functions
 */

(function () {
    /**
     * fixPath
     * Adjusts relative paths based on the current page's location.
     * Also resolves to WebP if manifest is loaded and available.
     * @param {string} path - The path to fix (e.g., "./assets/img.png")
     * @returns {string} - The fixed path (e.g., "../assets/img.png" or "../assets_webp/img.webp")
     */
    window.fixPath = (path) => {
        if (!path) return "";
        // Keep absolute paths or protocol-relative paths
        if (path.match(/^(http|\/\/)/)) return path;

        // "assets/..." -> "./assets/..." normalization
        let cleanPath = path;
        if (cleanPath.startsWith("./")) {
            cleanPath = cleanPath.slice(2);
        }

        // --- WebP Resolution Logic ---
        // If manifest is loaded, check if we can swap to WebP
        if (window.imageManifest && cleanPath.includes('assets/')) {
            // Normalize path to key format "assets/..."
            // e.g. "assets/member/ten.png" or "../assets/member/ten.png" -> "assets/member/ten.png"

            // Remove ../ if present for key lookup
            let key = cleanPath;
            if (key.startsWith('../')) {
                key = key.replace(/^(\.\.\/)+/, '');
            }

            // Should start with assets/ to be in manifest
            if (key.startsWith('assets/')) {
                const webpPath = window.imageManifest[key];
                if (webpPath) {
                    // Replace the original path with the WebP path
                    // But we need to preserve the ../ prefix logic below
                    // So we update cleanPath to represent the WebP target
                    // logic below handles ../ prefixing based on subDir check

                    // However, webpPath is "assets_webp/..."
                    // If we just set cleanPath = webpPath, the logic below will add ./ or ../ correctly
                    cleanPath = webpPath;
                    console.info(`[WebP Swap] ${path} -> ${cleanPath}`); // Debug info
                }
            }
        }
        // -----------------------------

        // Check if we are in a subdirectory
        const subDirs = ["/member/", "/news/", "/partner_events/", "/pages/", "/gallery/"];
        const isSubDir = subDirs.some(dir => window.location.pathname.includes(dir));

        if (isSubDir) {
            // checking if it already has ../ (simple check)
            if (!cleanPath.startsWith("../")) {
                // console.log(`[Path Fix] Adding ../ to ${cleanPath} (In Subdir)`);
                return "../" + cleanPath;
            }
        } else {
            // Debug why it might fail
            // console.log(`[Path Fix] Not in subDir? Path: ${window.location.pathname}`);
        }

        // If it already has ../ but we are NOT in subdir, technically we should remove it?
        // But existing logic didn't do that. It just added ./ if not absolute.
        // Let's stick to adding ./ if it doesn't have it and doesn't have ../
        if (!cleanPath.startsWith(".") && !cleanPath.startsWith("/")) {
            return "./" + cleanPath;
        }

        return cleanPath;
    };

    /**
     * WebP Manifest Loading
     */
    window.imageManifest = null;
    window.manifestPromise = null;

    const loadManifest = () => {
        // Prevent multiple fetches
        if (window.manifestPromise) return window.manifestPromise;

        const manifestUrl = window.fixPath('./js/image_manifest.json');
        window.manifestPromise = fetch(manifestUrl)
            .then(res => {
                if (!res.ok) throw new Error('Manifest not found');
                return res.json();
            })
            .then(data => {
                window.imageManifest = data;
                console.log('WebP Manifest loaded');
            })
            .catch(err => {
                console.warn('WebP Manifest load failed, falling back to original images:', err);
                window.imageManifest = {}; // Empty object to prevent errors
            });
        return window.manifestPromise;
    };

    // Start loading immediately
    loadManifest().then(() => {
        // Once manifest is loaded, try to replace static images existing in DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', replaceStaticImages);
        } else {
            replaceStaticImages();
        }
    });

    /**
     * replaceStaticImages
     * Scans the document for <img> tags and replaces their src with WebP path if available.
     */
    window.replaceStaticImages = () => {
        if (!window.imageManifest) return;

        const images = document.querySelectorAll('img');
        const normalize = (p) => p.replace(/^(\.\/|\.\.\/)+/, ''); // Remove ./ or ../ prefixes

        images.forEach(img => {
            // Get the raw src attribute value (not absolute URL)
            const rawSrc = img.getAttribute('src');
            if (!rawSrc) return;

            // Skip external links
            if (rawSrc.match(/^(http|\/\/|data:)/)) return;

            // Resolve to key format "assets/..."
            // Usually rawSrc is like "./assets/img.png" or "assets/img.png"
            let key = rawSrc;

            // Handle different path styles
            if (key.includes('assets/')) {
                // Extract part starting from assets/
                key = key.substring(key.indexOf('assets/'));
            } else {
                // Try to check if it's in the manifest directly (unlikely but possible)
                if (window.imageManifest && window.imageManifest[key]) {
                    // key is match
                } else {
                    return;
                }
            }

            const webpPath = window.imageManifest[key];
            if (webpPath) {
                // Calculate correct relative prefix based on current page depth
                // existing fixPath logic handles adding ../ or ./
                // BUT fixPath expects "assets/..." or "./assets/..." usually
                // Here we want to replace the src with the correct relative WebP path.

                // If we use fixPath(webpPath), it should work if we trust fixPath's logic
                // webpPath is "assets_webp/..."

                const newSrc = window.fixPath(webpPath);

                // Only replace if different to avoid reloading same image if already set
                if (img.getAttribute('src') !== newSrc) {
                    console.info(`[WebP Replace] ${img.getAttribute('src')} -> ${newSrc}`); // Debug info
                    img.setAttribute('src', newSrc);
                }
            }
        });

        // Also handling <source> tags in <picture> elements if necessary? 
        // User asked for <picture> OR JS replacement. 
        // If there are <source> tags pointing to old assets, we might want to update them too.
        const sources = document.querySelectorAll('source');
        sources.forEach(source => {
            const rawSrcset = source.getAttribute('srcset');
            if (!rawSrcset) return;
            if (rawSrcset.match(/^(http|\/\/|data:)/)) return;

            let key = rawSrcset;
            if (key.includes('assets/')) {
                key = key.substring(key.indexOf('assets/'));
                const webpPath = window.imageManifest[key];
                if (webpPath) {
                    source.setAttribute('srcset', window.fixPath(webpPath));
                }
            }
        });
    };


    /**
     * getMemberBackground
     * Returns the background image path based on member tags.
     * @param {string} tags - Space-separated tags string
     * @returns {string|null} - The path to the background image (needs fixPath) or null
     */
    window.getMemberBackground = (tags) => {
        if (!tags) return null;

        const BG_MAP = {
            'A': 'assets_webp/member_parts/aniamemoria_member_background_A.webp',
            'B': 'assets_webp/member_parts/aniamemoria_member_background_B.webp',
            'C': 'assets_webp/member_parts/aniamemoria_member_background_C.webp',
            'D': 'assets_webp/member_parts/aniamemoria_member_background_D.webp',
            'E': 'assets_webp/member_parts/aniamemoria_member_background_E.webp'
        };

        if (tags.includes("運営")) return BG_MAP['E'];
        if (tags.includes("飼育")) return BG_MAP['A'];
        if (tags.includes("野生")) return BG_MAP['C'];
        if (tags.includes("妖怪")) return BG_MAP['B'];
        if (tags.includes("スタッフ")) return BG_MAP['D'];

        return null; // or default?
    };

    /**
     * getMemberFrame
     * Returns the frame image path based on member tags.
     * @param {string} tags - Space-separated tags string
     * @returns {string|null} - The path to the frame image (needs fixPath) or null
     */
    window.getMemberFrame = (tags) => {
        if (!tags) return null;

        const FRAME_MAP = {
            'A': 'assets_webp/member_parts/aniamemoria_member_frame_A.webp',
            'B': 'assets_webp/member_parts/aniamemoria_member_frame_B.webp',
            'C': 'assets_webp/member_parts/aniamemoria_member_frame_C.webp',
            'D': 'assets_webp/member_parts/aniamemoria_member_frame_D.webp',
            'E': 'assets_webp/member_parts/aniamemoria_member_frame_E.webp'
        };

        if (tags.includes("運営")) return FRAME_MAP['E'];
        if (tags.includes("飼育")) return FRAME_MAP['A'];
        if (tags.includes("野生")) return FRAME_MAP['C'];
        if (tags.includes("妖怪")) return FRAME_MAP['B'];
        if (tags.includes("スタッフ")) return FRAME_MAP['D'];

        return null;
    };
    /**
     * getPinClass
     * Returns the CSS class for the push pin color based on tags.
     * @param {string} tags - Space-separated tags string
     * @returns {string} - The CSS class name (e.g., "pin-red")
     */
    window.getPinClass = (tags) => {
        if (!tags) return 'pin-red'; // Default

        if (tags.includes("運営")) return 'pin-red'; // Dark Red
        if (tags.includes("飼育")) return 'pin-brown'; // Brown
        if (tags.includes("野生")) return 'pin-green'; // Green
        if (tags.includes("妖怪")) return 'pin-gray'; // Gray/White
        if (tags.includes("スタッフ")) return 'pin-black'; // Black/Dark

        return 'pin-red'; // Fallback
    };

    /**
     * getPageBackground
     * Returns the background image path for the page body based on member tags.
     * @param {string} tags - Space-separated tags string
     * @returns {string|null} - The path to the background image (needs fixPath) or null
     */
    window.getPageBackground = (tags) => {
        if (!tags) return null;

        const BG_MAP = {
            'A': 'assets_webp/page/shiiku_low_res.webp', // Keeper
            'B': 'assets_webp/page/yo-kai_low_res.webp', // Yokai
            'C': 'assets_webp/page/yasei_low_res.webp', // Wild
            'D': 'assets_webp/page/staff_low_res.webp', // Staff
            'E': 'assets_webp/page/unei_low_res.webp'   // Operation
        };

        if (tags.includes("運営")) return BG_MAP['E'];
        if (tags.includes("飼育")) return BG_MAP['A'];
        if (tags.includes("野生")) return BG_MAP['C'];
        if (tags.includes("妖怪")) return BG_MAP['B'];
        if (tags.includes("スタッフ")) return BG_MAP['D'];

        return null;
    };
})();
