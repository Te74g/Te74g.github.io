/**
 * utils.js
 * Common utility functions
 */

(function () {
    /**
     * fixPath
     * Adjusts relative paths based on the current page's location.
     * @param {string} path - The path to fix (e.g., "./assets/img.png")
     * @returns {string} - The fixed path (e.g., "../assets/img.png")
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

        // Check if we are in a subdirectory
        const subDirs = ["/member/", "/news/", "/partner_events/", "/pages/", "/gallery/"];
        const isSubDir = subDirs.some(dir => window.location.pathname.includes(dir));

        if (isSubDir) {
            // checking if it already has ../ (simple check)
            if (!cleanPath.startsWith("../")) {
                return "../" + cleanPath;
            }
        }
        return "./" + cleanPath;
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
            'A': 'assets/aniamemoria_member_background_A.png',
            'B': 'assets/aniamemoria_member_background_B.png',
            'C': 'assets/aniamemoria_member_background_C.png',
            'D': 'assets/aniamemoria_member_background_D.png',
            'E': 'assets/aniamemoria_member_background_E.png'
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
            'A': 'assets/aniamemoria_member_frame_A.png',
            'B': 'assets/aniamemoria_member_frame_B.png',
            'C': 'assets/aniamemoria_member_frame_C.png',
            'D': 'assets/aniamemoria_member_frame_D.png',
            'E': 'assets/aniamemoria_member_frame_E.png'
        };

        if (tags.includes("運営")) return FRAME_MAP['E'];
        if (tags.includes("飼育")) return FRAME_MAP['A'];
        if (tags.includes("野生")) return FRAME_MAP['C'];
        if (tags.includes("妖怪")) return FRAME_MAP['B'];
        if (tags.includes("スタッフ")) return FRAME_MAP['D'];

        return null;
    };
})();
