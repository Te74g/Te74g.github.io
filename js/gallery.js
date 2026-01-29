/**
 * gallery.js
 * Gallery generation and Lightbox logic
 * Depends on: utils.js, data_gallery.js
 */

(function () {
    /* -------------------------------------------------------
       GALLERY GENERATION
       ------------------------------------------------------- */
    const galleryContainer = document.getElementById("gallery-grid");
    if (galleryContainer && window.galleryData) {
        window.galleryData.forEach((item, index) => {
            const card = document.createElement("article");
            card.className = "card reveal is-visible";
            card.style.cursor = "pointer";

            // Thumbnail is either explicit thumb or first image
            const thumbUrl = window.fixPath(item.thumb || (item.images && item.images[0]) || "");

            card.innerHTML = `
                <div class="card-top" style="background-image: url('${thumbUrl}'); background-size: cover; background-position: center; height: 200px; border-radius: 8px 8px 0 0;">
                </div>
                <div style="padding: 1.5rem;">
                    <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px;">
                        <h3 class="card-title" style="margin:0; font-size:1.1rem;">${item.title}</h3>
                        <span style="font-size:0.85rem; color:var(--muted);">${item.date}</span>
                    </div>
                    <p class="card-desc" style="font-size: 0.9rem; color: var(--muted); margin-bottom: 0;">${item.desc || ""}</p>
                    <div style="margin-top:10px; font-size:0.8rem; color:var(--a); font-weight:bold;">
                        写真を見る (${item.images ? item.images.length : 0}枚) &rarr;
                    </div>
                </div>
            `;

            // Click event to open lightbox
            card.addEventListener("click", () => openLightbox(index));
            galleryContainer.appendChild(card);
        });
    }

    /* -------------------------------------------------------
       Lightbox Logic
       ------------------------------------------------------- */
    const modal = document.getElementById("gallery-modal");
    const track = document.getElementById("modal-track");
    const closeBtn = document.querySelector(".gallery-modal-close");
    const prevBtn = document.querySelector(".gallery-nav.prev");
    const nextBtn = document.querySelector(".gallery-nav.next");
    const mTitle = document.getElementById("modal-title");
    const mDesc = document.getElementById("modal-desc");
    const overlay = document.querySelector(".gallery-modal-overlay");

    let currentGalleryIndex = -1;
    let currentImageIndex = 0;
    let currentImages = [];

    // Zoom & Pan State
    let zoomScale = 1;
    let panX = 0;
    let panY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    function openLightbox(galleryIndex) {
        if (!modal || !track || !window.galleryData) return;

        const item = window.galleryData[galleryIndex];
        if (!item || !item.images || item.images.length === 0) return;

        currentGalleryIndex = galleryIndex;
        currentImageIndex = 0;
        currentImages = item.images;

        // Update Info
        if (mTitle) mTitle.textContent = item.title;
        if (mDesc) mDesc.textContent = (item.date ? item.date + " " : "") + (item.desc || "");

        renderSlides();

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
            track.innerHTML = "";
        }, 300);
        document.body.style.overflow = "";
        document.body.classList.remove("lightbox-open");
    }

    function renderSlides() {
        if (!track) return;
        track.innerHTML = "";

        currentImages.forEach((src, i) => {
            const slide = document.createElement("div");
            slide.className = "gallery-slide";
            if (i === currentImageIndex) slide.classList.add("is-active");

            const img = document.createElement("img");
            img.src = window.fixPath(src);
            img.alt = "";
            img.draggable = false;

            slide.appendChild(img);
            track.appendChild(slide);
        });

        updateNav();
        resetZoom();
    }

    function updateNav() {
        const slides = track.querySelectorAll(".gallery-slide");
        slides.forEach((s, i) => {
            s.classList.toggle("is-active", i === currentImageIndex);
        });
    }

    function nextImage() {
        if (currentImages.length <= 1) return;
        currentImageIndex = (currentImageIndex + 1) % currentImages.length;
        renderSlides();
    }

    function prevImage() {
        if (currentImages.length <= 1) return;
        currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
        renderSlides();
    }

    // --- Zoom & Pan Logic ---

    function resetZoom() {
        zoomScale = 1;
        panX = 0;
        panY = 0;
        updateTransform();
    }

    function updateTransform() {
        const activeImg = track.querySelector(".gallery-slide.is-active img");
        if (!activeImg) return;

        activeImg.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomScale})`;

        if (zoomScale > 1) {
            activeImg.style.cursor = isDragging ? "grabbing" : "grab";
        } else {
            activeImg.style.cursor = "zoom-in";
        }
    }

    function applyZoom(delta) {
        let newScale = zoomScale + delta;
        newScale = Math.min(Math.max(1, newScale), 5); // 1x to 5x

        if (newScale === 1) {
            panX = 0;
            panY = 0;
        }

        zoomScale = newScale;
        updateTransform();
    }

    // Events
    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    // Overlay click: Close if not dragging
    if (overlay) overlay.addEventListener("click", () => {
        if (!isDragging) closeLightbox();
    });

    if (nextBtn) nextBtn.addEventListener("click", (e) => { e.stopPropagation(); nextImage(); });
    if (prevBtn) prevBtn.addEventListener("click", (e) => { e.stopPropagation(); prevImage(); });

    if (track) {
        // Wheel Zoom
        track.addEventListener("wheel", (e) => {
            if (!track.querySelector(".gallery-slide.is-active")) return;
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.2 : 0.2;
            applyZoom(delta);
        }, { passive: false });

        // Pointer Events (Mouse/Touch)
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

        track.addEventListener("pointerup", () => {
            isDragging = false;
            updateTransform();
        });

        track.addEventListener("pointerleave", () => {
            isDragging = false;
            updateTransform();
        });

        // Double click/tap to toggle zoom
        let lastTap = 0;
        track.addEventListener("click", (e) => {
            if (e.target.tagName !== 'IMG') return;

            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 300 && tapLength > 0) {
                // Double tap
                e.preventDefault();
                if (zoomScale > 1) {
                    resetZoom();
                } else {
                    zoomScale = 2.5; // Zoom in
                    updateTransform();
                }
            }
            lastTap = currentTime;
        });
    }

    // Keyboard support
    document.addEventListener("keydown", (e) => {
        if (!modal || modal.style.display === "none") return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowRight") nextImage();
        if (e.key === "ArrowLeft") prevImage();
    });

})();
