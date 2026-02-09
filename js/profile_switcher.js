/**
 * Profile Image Switcher (Data-Driven & Generalized)
 * - Automatically finds containers with `data-member-id`.
 * - Loads images from global `membersData` (site_data.js).
 * - "Dip to White" Cross-fade animation.
 * - Supports options for indicators and Mobile Touch behavior.
 */
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
                // revealLevelをチェック
                const revealLevel = window.getRevealLevel ? window.getRevealLevel(member) : 3;
                const displayInfo = window.getMemberDisplayInfo ? window.getMemberDisplayInfo(member) : null;

                // revealLevel 2（シルエット）の場合、シルエット画像のみ使用
                let images = [];
                if (revealLevel === 2) {
                    // シルエット画像を使用
                    const silhouetteImg = displayInfo && displayInfo.imagePath
                        ? displayInfo.imagePath[0]
                        : (window.siteConfig?.castDisplay?.placeholderImage || member.image);
                    images = [window.fixPath(silhouetteImg)];
                } else if (revealLevel >= 3) {
                    // 完全公開: 通常の画像を使用
                    if (member.profileImages && member.profileImages.length > 0) {
                        images = member.profileImages.map(p => window.fixPath(p));
                    } else if (member.image) {
                        images = [window.fixPath(member.image)];
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
        this.images.forEach((src, i) => {
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
            this.indicatorContainer.className = "profile-indicators";
            this.images.forEach((_, i) => {
                const dot = document.createElement('span');
                dot.className = "profile-dot";
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

        this.container.addEventListener('touchmove', (e) => {
            this.handleTouch(e);
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

// Auto-init on load
window.addEventListener('DOMContentLoaded', async () => {
    // Wait for manifest here too just in case
    if (window.manifestPromise) {
        try { await window.manifestPromise; } catch (e) { }
    }
    ProfileImageSwitcher.initAll();
});




