/**
 * utils.js
 * Common utility functions
 */

(function () {
    /**
     * fixPath
     * Adjusts relative paths based on the current page's location, supporting master site structure.
     * Also resolves to WebP if manifest is loaded and available.
     * @param {string} path - The path to fix (e.g., "./assets/img.png")
     * @returns {string} - The fixed path (e.g., "../assets/img.png" or "../../assets/img.png")
     */
    /**
     * アイテムの表示可否を判定するヘルパー関数
     * @param {Object} item - データアイテム (news, member, etc.)
     * @returns {boolean} - 表示すべきかどうか
     * 
     * ルール:
     * 1. item.hidden が true の場合:
     *    - window.siteConfig.showHiddenItems が true (Master環境) なら true
     *    - それ以外 (Public環境) なら false
     * 2. それ以外は true
     */
    window.shouldShowItem = (item) => {
        if (!item) return false;
        if (item.hidden) {
            // Masterサイトなどで showHiddenItems: true が設定されていれば表示
            if (window.siteConfig && window.siteConfig.showHiddenItems) {
                return true;
            }
            return false;
        }
        return true;
    };

    /**
     * メンバーの公開レベルを取得
     * @param {Object} member - メンバーオブジェクト
     * @returns {number} - 公開レベル (0: hidden, 1: coming_soon, 2: silhouette, 3: full)
     */
    window.getRevealLevel = (member) => {
        if (!member) return 0;

        // マスターサイト（showHiddenItems: true）では常に完全公開
        if (window.siteConfig && window.siteConfig.showHiddenItems) {
            return 3;
        }

        // revealLevelが未定義の場合は3（完全公開）
        const level = member.revealLevel !== undefined ? member.revealLevel : 3;
        return Math.min(Math.max(0, level), 3); // 0-3の範囲に制限
    };

    /**
     * 公開レベルに応じたメンバー表示情報を取得
     * @param {Object} member - メンバーオブジェクト
     * @returns {Object} - { name, tagLabel, imagePath, linkable, showIntro, showGoals, showSocials }
     */
    window.getMemberDisplayInfo = (member) => {
        const level = window.getRevealLevel(member);
        const config = window.siteConfig?.castDisplay || {};

        // デフォルト値（完全公開）
        let info = {
            level: level,
            name: member.pickupName || member.name,
            fullName: member.name,
            tagLabel: member.tagLabel,
            imagePath: null,
            linkable: true,      // プロフィールページへのリンク可能か
            showIntro: true,     // 自己紹介を表示するか
            showGoals: true,     // 目標を表示するか
            showSocials: true,   // SNSリンクを表示するか
            showMotif: true,     // モチーフ動物を表示するか
        };

        // 画像パスを決定
        if (member.profileImages && member.profileImages.length > 0) {
            info.imagePath = member.profileImages;
        } else if (member.image) {
            info.imagePath = [member.image];
        }

        switch (level) {
            case 0: // hidden
                // 表示しない（呼び出し元でフィルタ）
                info.linkable = false;
                break;

            case 1: // coming_soon
                info.name = config.comingSoonName || "???";
                info.fullName = config.comingSoonName || "???";
                info.tagLabel = "???";
                info.imagePath = config.comingSoonImage ? [config.comingSoonImage] : null;
                info.linkable = false;
                info.showIntro = false;
                info.showGoals = false;
                info.showSocials = false;
                info.showMotif = false;
                break;

            case 2: // silhouette
                // 名前と担当動物は表示、画像はシルエット
                info.imagePath = member.silhouetteImage
                    ? [member.silhouetteImage]
                    : (config.placeholderImage ? [config.placeholderImage] : info.imagePath);
                info.linkable = true; // 一部情報のプロフィールページへはアクセス可能
                info.showIntro = false; // 自己紹介は非表示
                info.showGoals = false; // 目標は非表示
                info.showSocials = false; // SNSは非表示
                info.showMotif = true;  // モチーフ動物は表示
                break;

            case 3: // full
            default:
                // 全て表示（デフォルト値のまま）
                break;
        }

        return info;
    };

    window.fixPath = (path) => {
        if (!path) return "";
        // Keep absolute paths, protocol-relative paths, or anchors
        if (path.match(/^(http|\/\/)/) || path.startsWith("#") || path.startsWith("mailto:")) return path;

        // "assets/..." -> "./assets/..." normalization for processing
        let cleanPath = path;

        // Normalize: Strip existing traversal to re-calculate based on current depth
        // We assume inputs from data files are root-relative (e.g. "assets/img.png" or "./assets/img.png")
        while (cleanPath.startsWith("../")) cleanPath = cleanPath.substring(3);
        while (cleanPath.startsWith("./")) cleanPath = cleanPath.substring(2);

        // --- WebP Resolution Logic ---
        // If manifest is loaded, check if we can swap to WebP
        if (window.imageManifest && cleanPath.includes('assets/')) {
            // Normalize path to key format "assets/..." for lookup
            let key = cleanPath;
            // key is already cleaned up above

            // Should start with assets/ to be in manifest
            if (key.startsWith('assets/')) {
                const webpPath = window.imageManifest[key];
                if (webpPath) {
                    cleanPath = webpPath;
                    console.info(`[WebP Swap] ${path} -> ${cleanPath}`); // Debug info
                }
            }
        }
        // -----------------------------

        // Calculate required depth from Main Root
        // Root (index.html) -> depth 0
        // SubDir (pages/xxx) -> depth 1
        // Master (master/index.html) -> depth 1
        // Master SubDir (master/pages/xxx) -> depth 2

        const subDirs = ["/member/", "/news/", "/partner_events/", "/pages/", "/gallery/"];
        let depth = 0;
        let isMaster = false;

        if (window.location.pathname.includes("/master/")) {
            depth += 1;
            isMaster = true;
        }

        if (subDirs.some(dir => window.location.pathname.includes(dir))) {
            depth += 1;
        }

        // --- Master Site Link Logic ---
        // If in Master Site, distinguish between Shared Resources (Assets) and Local Pages.
        // Shared Resources: point to Main Root (using calculated depth).
        // Local Pages: point to Master Root (reduce depth by 1).

        if (isMaster) {
            // List of directories/files that are SHARED and exist only in Main Root
            const sharedPrefixes = ["assets/", "assets_webp/", "css/", "js/", "_config/"];

            // Check if match
            const isShared = sharedPrefixes.some(p => cleanPath.startsWith(p));

            if (!isShared) {
                // Assuming it's a page link (pages/, news/, index.html etc)
                // We want to link to the copy inside /master/, so reduce traversal depth
                if (depth > 0) depth -= 1;
            }
        }

        // Construct prefix
        let prefix = "";
        for (let i = 0; i < depth; i++) {
            prefix += "../";
        }

        // If we are at root (depth 0) and path doesn't start with ./, add it for consistency
        if (depth === 0 && !cleanPath.startsWith(".")) {
            return "./" + cleanPath;
        }

        return prefix + cleanPath;
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
