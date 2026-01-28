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
    static initAll() {
        if (typeof membersData === 'undefined') return;

        // Helper to fix paths relative to current page
        const fixPath = (path) => {
            if (!path) return "";
            if (path.match(/^(http|\/\/)/)) return path;

            // Remove ./ if present
            let cleanPath = path;
            if (cleanPath.startsWith("./")) cleanPath = cleanPath.slice(2);

            // Check if we are in a sub-directory
            const subDirs = ["/member/", "/news/", "/partner_events/", "/pages/", "/gallery/"];
            const isSubDir = subDirs.some(dir => window.location.pathname.includes(dir));

            if (isSubDir) {
                return "../" + cleanPath;
            }
            return "./" + cleanPath;
        };

        const containers = document.querySelectorAll('.profile-switcher-container[data-member-id]');
        containers.forEach(container => {
            const id = container.getAttribute('data-member-id');
            const member = membersData.find(m => m.id === id);

            if (member) {
                // Priority: profileImages array > single image
                let images = [];
                if (member.profileImages && member.profileImages.length > 0) {
                    images = member.profileImages.map(p => fixPath(p));
                } else if (member.image) {
                    images = [fixPath(member.image)];
                }

                if (images.length > 0) {
                    // Add class for styling if not present
                    container.classList.add('profile-switcher');

                    // Default options for page-embedded switchers
                    new ProfileImageSwitcher(container, images, { showIndicators: true });
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
window.addEventListener('DOMContentLoaded', () => {
    ProfileImageSwitcher.initAll();
});


/* =========================================
   PROFILE BACKGROUND DYNAMIC SWITCHER
   メンバーのタグに応じて背景画像を切り替える処理
   ========================================= */
(function () {
    window.addEventListener('DOMContentLoaded', () => {
        // ターゲット要素 (背景テクスチャ) を取得
        // クラス名 .profile-bg-texture を想定
        const bgElement = document.querySelector('.profile-bg-texture');
        if (!bgElement || typeof membersData === 'undefined') return;

        // メンバーIDの特定
        // 1. data-member-id 属性を探す (.profile-switcher-container など)
        let memberId = null;
        const switcher = document.querySelector('[data-member-id]');
        if (switcher) {
            memberId = switcher.getAttribute('data-member-id');
        } else {
            // 2. なければURLから推測 (例: profile_ten.html -> ten)
            const match = window.location.pathname.match(/profile_([a-zA-Z0-9]+)\.html/);
            if (match) {
                memberId = match[1];
            }
        }

        if (!memberId) return;

        // データ照合
        const member = membersData.find(m => m.id === memberId);
        if (!member) return;

        // --- 背景画像定義 ---
        const BG_MAP = {
            'A': '../assets/aniamemoria_member_background_A.png', // 飼育
            'B': '../assets/aniamemoria_member_background_B.png', // 妖怪
            'C': '../assets/aniamemoria_member_background_C.png', // 野生
            'D': '../assets/aniamemoria_member_background_D.png', // スタッフ
            'E': '../assets/aniamemoria_member_background_E.png'  // 運営
        };

        // --- 判定ロジック ---
        // 順位: 運営(E) > 飼育(A) = 野生(C) = 妖怪(B) > スタッフ(D)

        const tags = member.tags || "";

        let selectedBg = null;

        if (tags.includes("運営")) {
            selectedBg = BG_MAP['E'];
        } else if (tags.includes("飼育")) {
            selectedBg = BG_MAP['A'];
        } else if (tags.includes("野生")) {
            selectedBg = BG_MAP['C'];
        } else if (tags.includes("妖怪")) {
            selectedBg = BG_MAP['B'];
        } else if (tags.includes("スタッフ")) {
            selectedBg = BG_MAP['D'];
        }

        // --- 適用 ---
        if (selectedBg) {
            // パス補正 (念のため)
            // 現在のページが member/profile_ten.html (1階層深い) と仮定
            // BG_MAPの定義は '../' 始まりなのでそのまま適用可能

            // ただし、もしトップページなどで使う場合は補正が必要だが、
            // これはプロフィールページ専用の処理とする

            bgElement.style.backgroundImage = `url('${selectedBg}')`;

            // ログ出力 (確認用)
            // console.log(`Profile Background Applied: ${selectedBg} for ${member.name}`);
        }
    });
})();

