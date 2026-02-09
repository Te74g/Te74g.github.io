/**
 * lightbox.js
 * 汎用ライトボックス機能
 * gallery.css のスタイル定義を使用します。
 */

(function () {
    // -------------------------------------------------------------------------
    // 1. State & Variables
    // -------------------------------------------------------------------------
    let modal, track, closeBtn, prevBtn, nextBtn, mTitle, mDesc, overlay;

    let currentImages = []; // Array of { src: string, title?: string, desc?: string }
    let currentIndex = 0;

    // Zoom & Pan State
    let zoomScale = 1;
    let panX = 0;
    let panY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    // -------------------------------------------------------------------------
    // 2. Modal Construction
    // -------------------------------------------------------------------------
    function ensureModalExists() {
        if (document.getElementById('gallery-modal')) {
            bindElements();
            return;
        }

        const modalHTML = `
            <div id="gallery-modal" class="gallery-modal" aria-hidden="true" style="display:none;">
                <div class="gallery-modal-overlay"></div>
                <div class="gallery-modal-content">
                    <button class="gallery-modal-close" aria-label="閉じる">×</button>
                    <!-- Info overlay (optional) -->
                    <div class="gallery-info" style="display:none;">
                        <h3 id="modal-title" style="margin:0; font-size:1.1rem; color:#fff;"></h3>
                        <p id="modal-desc" style="margin:5px 0 0; font-size:0.9rem; color:#ddd;"></p>
                    </div>
                    <div class="gallery-slider">
                        <button class="gallery-nav prev" aria-label="前へ">‹</button>
                        <div class="gallery-slide-track" id="modal-track">
                            <!-- Slides injected here -->
                        </div>
                        <button class="gallery-nav next" aria-label="次へ">›</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        bindElements();
        bindEvents();
    }

    function bindElements() {
        modal = document.getElementById("gallery-modal");
        track = document.getElementById("modal-track");
        closeBtn = document.querySelector(".gallery-modal-close");
        prevBtn = document.querySelector(".gallery-nav.prev");
        nextBtn = document.querySelector(".gallery-nav.next");
        mTitle = document.getElementById("modal-title");
        mDesc = document.getElementById("modal-desc");
        overlay = document.querySelector(".gallery-modal-overlay");
    }

    function bindEvents() {
        if (!modal) return;

        // Close
        closeBtn?.addEventListener("click", closeLightbox);
        overlay?.addEventListener("click", () => {
            if (!isDragging) closeLightbox();
        });

        // Nav
        prevBtn?.addEventListener("click", (e) => { e.stopPropagation(); prevImage(); });
        nextBtn?.addEventListener("click", (e) => { e.stopPropagation(); nextImage(); });

        // Keyboard
        document.addEventListener("keydown", (e) => {
            if (!modal || modal.style.display === "none") return;
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowRight") nextImage();
            if (e.key === "ArrowLeft") prevImage();
        });

        // Zoom / Pan Events (Pointer & Wheel)
        if (track) {
            // Wheel Zoom
            track.addEventListener("wheel", (e) => {
                if (!track.querySelector(".gallery-slide.is-active")) return;
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.2 : 0.2;
                applyZoom(delta);
            }, { passive: false });

            // Pointer Events
            track.addEventListener("pointerdown", (e) => {
                if (zoomScale <= 1) return;
                isDragging = true;
                startX = e.clientX - panX;
                startY = e.clientY - panY;
                e.preventDefault();
                updateTransform();
            });

            track.addEventListener("pointermove", (e) => {
                if (!isDragging) return;
                e.preventDefault();
                panX = e.clientX - startX;
                panY = e.clientY - startY;
                updateTransform();
            });

            track.addEventListener("pointerup", () => { isDragging = false; updateTransform(); });
            track.addEventListener("pointerleave", () => { isDragging = false; updateTransform(); });

            // Double click/tap
            let lastTap = 0;
            track.addEventListener("click", (e) => {
                if (e.target.tagName !== 'IMG') return;
                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastTap;
                if (tapLength < 300 && tapLength > 0) {
                    e.preventDefault();
                    if (zoomScale > 1) resetZoom();
                    else {
                        zoomScale = 2.5;
                        updateTransform();
                    }
                }
                lastTap = currentTime;
            });
        }
    }

    // -------------------------------------------------------------------------
    // 3. Logic
    // -------------------------------------------------------------------------

    function openLightbox(index) {
        if (!modal || currentImages.length === 0) return;

        currentIndex = index;
        renderSlides();

        // Update Info
        const item = currentImages[currentIndex];
        const infoDiv = modal.querySelector('.gallery-info');
        if (item.title || item.desc) {
            if (infoDiv) infoDiv.style.display = "block";
            if (mTitle) mTitle.textContent = item.title || "";
            if (mDesc) mDesc.textContent = item.desc || "";
        } else {
            if (infoDiv) infoDiv.style.display = "none";
        }

        // Show Modal
        modal.style.display = "flex";
        requestAnimationFrame(() => {
            modal.setAttribute("aria-hidden", "false");
            modal.classList.add("is-open");
        });
        document.body.style.overflow = "hidden";
        document.body.classList.add("lightbox-open");
        resetZoom();
    }

    function closeLightbox() {
        if (!modal) return;
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        setTimeout(() => {
            modal.style.display = "none";
            if (track) track.innerHTML = "";
        }, 300);
        document.body.style.overflow = "";
        document.body.classList.remove("lightbox-open");
    }

    function renderSlides() {
        if (!track) return;
        track.innerHTML = "";

        // Only render current, prev, next for performance? Or all?
        // Since it's usually small for news, render all is fine.
        currentImages.forEach((item, i) => {
            const slide = document.createElement("div");
            slide.className = "gallery-slide";
            if (i === currentIndex) slide.classList.add("is-active");

            const img = document.createElement("img");
            img.src = item.src;
            img.alt = item.title || "";
            img.draggable = false;

            slide.appendChild(img);
            track.appendChild(slide);
        });
        resetZoom();
    }

    function nextImage() {
        if (currentImages.length <= 1) return;
        currentIndex = (currentIndex + 1) % currentImages.length;
        renderSlides(); // Re-render to update active class and transform
    }

    function prevImage() {
        if (currentImages.length <= 1) return;
        currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
        renderSlides();
    }

    function resetZoom() {
        zoomScale = 1;
        panX = 0;
        panY = 0;
        updateTransform();
    }

    function applyZoom(delta) {
        let newScale = zoomScale + delta;
        newScale = Math.min(Math.max(1, newScale), 5);
        if (newScale === 1) { panX = 0; panY = 0; }
        zoomScale = newScale;
        updateTransform();
    }

    function updateTransform() {
        const activeImg = track?.querySelector(".gallery-slide.is-active img");
        if (!activeImg) return;
        activeImg.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomScale})`;

        if (zoomScale > 1) {
            activeImg.style.cursor = isDragging ? "grabbing" : "grab";
        } else {
            activeImg.style.cursor = "zoom-in";
        }
    }


    // -------------------------------------------------------------------------
    // 4. Public API
    // -------------------------------------------------------------------------

    /**
     * initialize Lightbox for specific selector
     * @param {string} selector - CSS selector for images
     */
    window.initLightbox = function (selector) {
        ensureModalExists();

        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) return;

        // Build image list from DOM
        // We create a new list for this specific initialization call?
        // Actually, usually we init once per page or section.
        // Let's assume one gallery per page for simplicity or merge all in page.

        // Strategy: When an image is clicked, we rebuild the list based on the selector
        // so that the order matches the DOM order.

        elements.forEach((el, index) => {
            el.style.cursor = "zoom-in";
            el.addEventListener("click", (e) => {
                e.preventDefault();

                // Re-query to ensure order and content
                const currentElements = document.querySelectorAll(selector);
                currentImages = Array.from(currentElements).map(img => ({
                    src: img.src || img.href, // support <a> wrapping <img> if needed
                    title: img.alt || img.title || "",
                    desc: ""
                }));

                // Find index of clicked element
                const clickedIndex = Array.from(currentElements).indexOf(el);
                openLightbox(clickedIndex >= 0 ? clickedIndex : 0);
            });
        });
    };

})();
