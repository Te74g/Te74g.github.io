/**
 * lightbox.js
 * Standalone Lightbox module for zooming and panning images.
 * Ported/Adapted from gallery.js
 */

(function () {
    window.Lightbox = {
        currentImages: [],
        currentIndex: 0,
        modal: null,
        track: null,
        zoomScale: 1,
        panX: 0,
        panY: 0,
        isDragging: false,
        startX: 0,
        startY: 0,

        /**
         * Initialize the lightbox.
         * Expects DOM elements with specific IDs/Classes to exist.
         */
        init: function () {
            this.modal = document.getElementById("gallery-modal");
            this.track = document.getElementById("modal-track");
            const closeBtn = document.querySelector(".gallery-modal-close");
            const prevBtn = document.querySelector(".gallery-nav.prev");
            const nextBtn = document.querySelector(".gallery-nav.next");
            const overlay = document.querySelector(".gallery-modal-overlay");

            if (!this.modal || !this.track) return;

            // Event Listeners
            if (closeBtn) closeBtn.addEventListener("click", () => this.close());
            if (overlay) overlay.addEventListener("click", () => {
                if (!this.isDragging) this.close();
            });

            if (nextBtn) nextBtn.addEventListener("click", (e) => { e.stopPropagation(); this.next(); });
            if (prevBtn) prevBtn.addEventListener("click", (e) => { e.stopPropagation(); this.prev(); });

            // Keyboard
            document.addEventListener("keydown", (e) => {
                if (!this.modal || this.modal.style.display === "none") return;
                if (e.key === "Escape") this.close();
                if (e.key === "ArrowRight") this.next();
                if (e.key === "ArrowLeft") this.prev();
            });

            // Gestures (Zoom/Pan)
            this.setupGestures();
        },

        setupGestures: function () {
            if (!this.track) return;

            // Wheel Zoom
            this.track.addEventListener("wheel", (e) => {
                if (!this.track.querySelector(".gallery-slide.is-active")) return;
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.2 : 0.2;
                this.applyZoom(delta);
            }, { passive: false });

            // Pointer Events
            this.track.addEventListener("pointerdown", (e) => {
                if (this.zoomScale <= 1) return;
                this.isDragging = true;
                this.startX = e.clientX - this.panX;
                this.startY = e.clientY - this.panY;
                e.preventDefault();
                this.updateTransform();
            });

            this.track.addEventListener("pointermove", (e) => {
                if (!this.isDragging) return;
                e.preventDefault();
                this.panX = e.clientX - this.startX;
                this.panY = e.clientY - this.startY;
                this.updateTransform();
            });

            this.track.addEventListener("pointerup", () => {
                this.isDragging = false;
                this.updateTransform();
            });

            this.track.addEventListener("pointerleave", () => {
                this.isDragging = false;
                this.updateTransform();
            });

            // Double Tap
            let lastTap = 0;
            this.track.addEventListener("click", (e) => {
                if (e.target.tagName !== 'IMG') return;
                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastTap;
                if (tapLength < 300 && tapLength > 0) {
                    e.preventDefault();
                    if (this.zoomScale > 1) {
                        this.resetZoom();
                    } else {
                        this.zoomScale = 2.5;
                        this.updateTransform();
                    }
                }
                lastTap = currentTime;
            });
        },

        open: function (images, index = 0) {
            if (!this.modal) this.init();
            if (!this.modal) return;
            if (!images || images.length === 0) return;

            this.currentImages = images;
            this.currentIndex = index;

            this.renderSlides();

            // Reset Info (Optional: Pass title/desc if needed, currently reusing IDs)
            const mTitle = document.getElementById("modal-title");
            const mDesc = document.getElementById("modal-desc");
            if (mTitle) mTitle.textContent = "";
            if (mDesc) mDesc.textContent = "";

            // Show
            this.modal.style.display = "flex";
            requestAnimationFrame(() => {
                this.modal.setAttribute("aria-hidden", "false");
                this.modal.classList.add("is-open");
            });
            document.body.style.overflow = "hidden";
            document.body.classList.add("lightbox-open");
            this.resetZoom();
        },

        close: function () {
            if (!this.modal) return;
            this.modal.classList.remove("is-open");
            this.modal.setAttribute("aria-hidden", "true");
            setTimeout(() => {
                this.modal.style.display = "none";
                this.track.innerHTML = "";
            }, 300);
            document.body.style.overflow = "";
            document.body.classList.remove("lightbox-open");
        },

        renderSlides: function () {
            if (!this.track) return;
            this.track.innerHTML = "";

            this.currentImages.forEach((src, i) => {
                const slide = document.createElement("div");
                slide.className = "gallery-slide";
                if (i === this.currentIndex) slide.classList.add("is-active");

                const img = document.createElement("img");
                img.src = src; // Expect already fixed or relative path, or fix here
                img.alt = "";
                img.draggable = false;

                // Fix path if needed (simple check)
                if (!img.src.startsWith('http') && !img.src.includes('/') && !img.src.startsWith('data:')) {
                    // Assuming relative to where script is run? Using absolute or passed path is safer.
                    // relying on caller to pass valid paths
                }

                slide.appendChild(img);
                this.track.appendChild(slide);
            });
            this.resetZoom();
        },

        next: function () {
            if (this.currentImages.length <= 1) return;
            this.currentIndex = (this.currentIndex + 1) % this.currentImages.length;
            this.updateNav();
            this.resetZoom();
        },

        prev: function () {
            if (this.currentImages.length <= 1) return;
            this.currentIndex = (this.currentIndex - 1 + this.currentImages.length) % this.currentImages.length;
            this.updateNav();
            this.resetZoom();
        },

        updateNav: function () {
            const slides = this.track.querySelectorAll(".gallery-slide");
            slides.forEach((s, i) => {
                s.classList.toggle("is-active", i === this.currentIndex);
            });
        },

        resetZoom: function () {
            this.zoomScale = 1;
            this.panX = 0;
            this.panY = 0;
            this.updateTransform();
        },

        applyZoom: function (delta) {
            let newScale = this.zoomScale + delta;
            newScale = Math.min(Math.max(1, newScale), 5);
            if (newScale === 1) {
                this.panX = 0;
                this.panY = 0;
            }
            this.zoomScale = newScale;
            this.updateTransform();
        },

        updateTransform: function () {
            const activeImg = this.track.querySelector(".gallery-slide.is-active img");
            if (!activeImg) return;
            activeImg.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoomScale})`;
            if (this.zoomScale > 1) {
                activeImg.style.cursor = this.isDragging ? "grabbing" : "grab";
            } else {
                activeImg.style.cursor = "zoom-in";
            }
        }
    };
})();
