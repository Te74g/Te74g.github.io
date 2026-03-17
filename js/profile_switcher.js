/**
 * Profile Image Switcher (Data-Driven & Generalized)
 * - Automatically finds containers with `data-member-id`.
 * - Loads images from global `membersData` (site_data.js).
 * - "Dip to White" Cross-fade animation.
 * - Supports options for indicators and Mobile Touch behavior.
 */
const normalizePathList = (value) => {
    if (window.normalizePathList) {
        return window.normalizePathList(value);
    }

    const extractPath = (entry) => {
        if (typeof entry === 'string') {
            return entry.trim();
        }
        if (entry && typeof entry === 'object') {
            const candidate = entry.repoPath || entry.path || entry.src || entry.url || '';
            return typeof candidate === 'string' ? candidate.trim() : '';
        }
        return '';
    };

    if (Array.isArray(value)) {
        return value.map(extractPath).filter(Boolean);
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return [];
        return trimmed.split(/[\r\n,]+/).map((part) => part.trim()).filter(Boolean);
    }

    if (value && typeof value === 'object') {
        const one = extractPath(value);
        return one ? [one] : [];
    }

    return [];
};

const firstPath = (value) => normalizePathList(value)[0] || null;

class ProfileImageSwitcher {
    constructor(container, images, options = {}) {
        this.container = container;
        this.images = images;
        this.options = Object.assign({
            showIndicators: true
        }, options);

        this.currentIndex = 0;
        this.transitionTimeout = null;

        if (!this.container || !this.images || this.images.length === 0) return;

        this.init();
    }

    /* ----------------------------------------------------
       STATIC INITIALIZER
       Finds all containers and Inits them based on data
       ---------------------------------------------------- */
    static async initAll() {
        if (!window.membersData) return;

        // Wait for Manifest
        if (window.manifestPromise) {
            try { await window.manifestPromise; } catch (e) { console.warn('Manifest wait failed', e); }
        }

        // Using global window.fixPath instead of local definition

        const containers = document.querySelectorAll('.profile-switcher-container[data-member-id]');
        containers.forEach(container => {
            const id = container.getAttribute('data-member-id');
            const member = window.membersData.find(m => m.id === id);

            if (member) {
                // revealLevelをチェック（revealDateによる自動判定を含む）
                const displayInfo = window.getMemberDisplayInfo ? window.getMemberDisplayInfo(member) : null;
                const revealLevel = displayInfo ? displayInfo.level : 3;

                // forms を持つメンバーの場合、最初のフォームのデータを取得
                let effectiveMember = member;
                if (member.forms && member.forms.length > 0) {
                    const firstForm = member.forms[0];
                    const formProfileImages = normalizePathList(firstForm.profileImages);
                    const memberProfileImages = normalizePathList(member.profileImages);
                    const formImage = firstPath(firstForm.image);
                    const memberImage = firstPath(member.image);
                    effectiveMember = {
                        ...member,
                        profileImages: formProfileImages.length > 0 ? formProfileImages : memberProfileImages,
                        image: formImage || memberImage || member.image,
                    };
                }

                // revealLevel 2（シルエット）の場合、シルエット画像のみ使用
                let images = [];
                if (revealLevel === 2) {
                    // シルエット画像を使用
                    const silhouetteImg = firstPath(displayInfo && displayInfo.imagePath)
                        || firstPath(window.siteConfig?.castDisplay?.placeholderImage)
                        || firstPath(effectiveMember.image)
                        || firstPath(effectiveMember.profileImages);
                    if (silhouetteImg) {
                        images = [window.fixPath ? window.fixPath(silhouetteImg) : silhouetteImg];
                    }
                } else if (revealLevel >= 3) {
                    // 完全公開: フォームの画像を優先して使用
                    const profileImages = normalizePathList(effectiveMember.profileImages);
                    if (profileImages.length > 0) {
                        images = profileImages.map((p) => (window.fixPath ? window.fixPath(p) : p));
                    } else {
                        const fallbackImage = firstPath(effectiveMember.image);
                        if (fallbackImage) {
                            images = [window.fixPath ? window.fixPath(fallbackImage) : fallbackImage];
                        }
                    }
                }
                // revealLevel 0-1 はプロフィールページにリダイレクトされるはずなので処理不要

                if (images.length > 0) {
                    // Add class for styling if not present
                    container.classList.add('profile-switcher');

                    // Default options for page-embedded switchers
                    new ProfileImageSwitcher(container, images, { showIndicators: revealLevel >= 3 });
                }
            }
        });
    }

    init() {
        this.container.innerHTML = '';

        // 1. Create Track
        this.track = document.createElement('div');
        this.track.className = 'profile-track';

        // 2. Render Slides
        this.slides = [];
        this.images.forEach((src) => {
            const slide = document.createElement('div');
            slide.className = 'profile-slide';

            const img = document.createElement('img');
            img.src = src;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.draggable = false;
            slide.appendChild(img);

            this.track.appendChild(slide);
            this.slides.push(slide);
        });

        this.container.appendChild(this.track);

        // 3. Create Indicators (Only if multiple images AND showIndicators is true)
        if (this.images.length > 1 && this.options.showIndicators) {
            this.indicatorContainer = document.createElement('div');
            this.indicatorContainer.className = 'profile-indicators';
            this.images.forEach(() => {
                const dot = document.createElement('span');
                dot.className = 'profile-dot';
                this.indicatorContainer.appendChild(dot);
            });
            this.container.appendChild(this.indicatorContainer);
            this.dots = this.indicatorContainer.querySelectorAll('.profile-dot');
        }

        // 4. Random Init
        this.currentIndex = Math.floor(Math.random() * this.images.length);
        this.slides[this.currentIndex].classList.add('is-active');
        if (this.dots) this.updateIndicators();

        // 5. Events (Only if multiple images)
        if (this.images.length > 1) {
            this.setupDesktopEvents();
            this.setupMobileEvents();
        }
    }

    updateIndicators() {
        if (!this.dots) return;
        this.dots.forEach((dot, i) => {
            if (i === this.currentIndex) dot.classList.add('is-active');
            else dot.classList.remove('is-active');
        });
    }

    updateSlide() {
        if (this.transitionTimeout) clearTimeout(this.transitionTimeout);

        // Flash IN (Brightness UP)
        this.container.classList.add('is-flashing');

        // Wait for flash (100ms)
        this.transitionTimeout = setTimeout(() => {
            // Swap Active Slide (While bright)
            this.slides.forEach(s => s.classList.remove('is-active'));
            this.slides[this.currentIndex].classList.add('is-active');

            this.updateIndicators();

            // Flash OUT (Brightness DOWN) - Delay slightly to keep it bright during swap
            setTimeout(() => {
                this.container.classList.remove('is-flashing');
            }, 100);
        }, 100);
    }

    setupDesktopEvents() {
        this.container.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;

            if (width > 0) {
                const segment = width / this.images.length;
                const newIndex = Math.floor(x / segment);

                if (newIndex >= 0 && newIndex < this.images.length && newIndex !== this.currentIndex) {
                    this.currentIndex = newIndex;
                    this.updateSlide();
                }
            }
        });
    }

    setupMobileEvents() {
        // Mobile "Touch Position" logic (Same as PC hover logic but with touch coordinates)
        this.container.addEventListener('touchstart', (e) => {
            // Prevent default if necessary (e.g. scrolling) but usually better to leave it unless full screen
            // Here we just want to switch image on touch
            this.handleTouch(e);
        }, { passive: true });

        let touchMoveTicking = false;
        this.container.addEventListener('touchmove', (e) => {
            if (!touchMoveTicking) {
                touchMoveTicking = true;
                requestAnimationFrame(() => { this.handleTouch(e); touchMoveTicking = false; });
            }
        }, { passive: true });
    }

    handleTouch(e) {
        if (!e.changedTouches || e.changedTouches.length === 0) return;
        const touch = e.changedTouches[0];
        const rect = this.container.getBoundingClientRect();

        // Ensure touch is within bounds (for touch move)
        if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
            touch.clientY >= rect.top && touch.clientY <= rect.bottom) {

            const x = touch.clientX - rect.left;
            const width = rect.width;

            if (width > 0) {
                const segment = width / this.images.length;
                const newIndex = Math.floor(x / segment);

                if (newIndex >= 0 && newIndex < this.images.length && newIndex !== this.currentIndex) {
                    this.currentIndex = newIndex;
                    this.updateSlide();
                }
            }
        }
    }
}

window.ProfileImageSwitcher = ProfileImageSwitcher;

// Auto-init on load
window.addEventListener('DOMContentLoaded', async () => {
    // Wait for manifest here too just in case
    if (window.manifestPromise) {
        try { await window.manifestPromise; } catch (e) { console.warn('Manifest wait failed', e); }
    }
    ProfileImageSwitcher.initAll();
});
