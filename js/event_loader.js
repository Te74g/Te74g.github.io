/**
 * Event Page Loader
 * Dynamically loads event content based on URL query parameter `?id=...`
 * Requires: site_data.js (partnerEventsData)
 */
/**
 * Event Page Loader
 * Dynamically loads event content based on URL query parameter `?id=...`
 * Requires: site_data.js (partnerEventsData)
 */
document.addEventListener('DOMContentLoaded', async () => {
    if (!window.partnerEventsData) {
        console.error('partnerEventsData is not defined.');
        return;
    }

    // Wait for Manifest to ensure WebP paths are resolved
    if (window.manifestPromise) {
        try { await window.manifestPromise; } catch (e) { console.warn('Manifest wait failed', e); }
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        console.warn('No event ID specified.');
        return;
    }

    const eventItem = window.partnerEventsData.find(item => item.id === id);

    if (eventItem) {
        // Update Title
        document.title = `あにあめもりあ | ${eventItem.name}`;

        // --- Loader Setup ---
        const loaderEl = document.getElementById('opening-loader-overlay');
        const mainEl = document.querySelector('main');
        if (mainEl) mainEl.classList.add('is-preloading');
        document.body.classList.add('is-preloading');

        // Helper to hide loader
        const hideLoader = () => {
            // Explicitly hide the placeholder immediately
            const placeholder = document.getElementById('dynamic-event-content');
            if (placeholder) {
                placeholder.style.display = 'none';
            }

            if (loaderEl) loaderEl.classList.add('is-hidden');
            if (mainEl) mainEl.classList.remove('is-preloading');
            document.body.classList.remove('is-preloading');
        };

        // Helper: Update Progress Gauge (Logo Fill)
        const updateProgress = (percent) => {
            const logoFront = document.querySelector('.loader-logo-front');
            if (logoFront) {
                // percent: 0 to 100
                // clip-path inset: 100% (empty) -> 0% (full)
                const insetVal = Math.max(0, 100 - percent);
                logoFront.style.clipPath = `inset(0 ${insetVal}% 0 0)`;
                // Force reflow to ensure visual update
                void logoFront.offsetWidth;
            }
        };

        // Helper: Preload Image with Promise
        const preloadImage = (src) => {
            return new Promise((resolve, reject) => {
                if (!src) {
                    resolve();
                    return;
                }
                const img = new Image();
                img.onload = () => resolve(src);
                img.onerror = () => {
                    console.warn(`Failed to load: ${src}`);
                    resolve(src); // Resolve anyway to continue chain
                };
                img.src = src;
            });
        };

        // Helper: Path Normalizer -> Use global fixPath for WebP support
        const normalizePath = (path) => {
            return window.fixPath ? window.fixPath(path) : path;
        };

        // Initialize Progress (0%)
        updateProgress(0);

        // --- Step 1: Preload Loader Logo (Critical) ---
        // Determine which logo is being used by the inline script (event.html) or default
        // We re-determine here for waiting purposes
        let loaderLogoSrc = null;
        if (eventItem.titleImage) {
            loaderLogoSrc = normalizePath(eventItem.titleImage);
        } else {
            // Fallback default logo (simplified check)
            loaderLogoSrc = '../assets/logo/aniamemoria_logo.png';
        }

        // Wait for logo (if possible, though inline script might have set it already)
        if (loaderLogoSrc) {
            await preloadImage(loaderLogoSrc);
        }

        // Update Progress: Logo Ready (20%)
        updateProgress(20);

        // --- Step 2: Preload Background (Critical for atmosphere) ---
        if (eventItem.backgroundImage) {
            const bgPath = normalizePath(eventItem.backgroundImage);
            await preloadImage(bgPath);

            // Apply Background
            let bgContainer = document.getElementById('fixed-bg-container');
            if (!bgContainer) {
                bgContainer = document.createElement('div');
                bgContainer.id = 'fixed-bg-container';
                bgContainer.style.position = 'fixed';
                bgContainer.style.top = '0';
                bgContainer.style.left = '0';
                bgContainer.style.width = '100VW';
                bgContainer.style.height = '100VH';
                bgContainer.style.zIndex = '-999';
                bgContainer.style.filter = 'blur(4px)';
                bgContainer.style.transform = 'scale(1.05)';
                bgContainer.style.pointerEvents = 'none';
                document.body.prepend(bgContainer);
            }
            bgContainer.style.backgroundImage = `url('${bgPath}')`;
            bgContainer.style.backgroundSize = 'cover';
            bgContainer.style.backgroundPosition = 'center';
            bgContainer.style.backgroundAttachment = 'fixed';
            bgContainer.style.backgroundRepeat = 'no-repeat';
        }

        // Update Progress: Background Ready (40%)
        updateProgress(40);

        // --- Step 3: Inject Content (Text/Structure) ---
        // Render Header, Content, etc.
        renderEventContent(eventItem, normalizePath);

        // Update Progress: Content Injected (60%)
        updateProgress(60);

        // --- Step 4: Preload Critical Content Images (Poster & Main Image) ---
        const criticalImages = [];
        if (eventItem.poster) criticalImages.push(normalizePath(eventItem.poster));

        // Main Image (Gallery first image)
        const images = eventItem.images || (eventItem.image ? [eventItem.image] : []);
        if (images.length > 0) criticalImages.push(normalizePath(images[0]));

        // Title Image (Header)
        if (eventItem.titleImage && eventItem.titleImage !== loaderLogoSrc) {
            criticalImages.push(normalizePath(eventItem.titleImage));
        }

        // Wait for these critical images
        await Promise.all(criticalImages.map(src => preloadImage(src)));

        // Update Progress: Images Ready (90%)
        updateProgress(90);

        // --- Step 5: All Critical Assets Ready -> Hide Loader ---
        // Small delay to ensure rendering frame and allow gauge to fill visually
        await new Promise(r => setTimeout(r, 400)); // Show 90% state briefly

        updateProgress(100);

        // Allow 100% to be seen
        await new Promise(r => setTimeout(r, 400));

        if (loaderEl) loaderEl.classList.add('is-hidden');
        if (mainEl) mainEl.classList.remove('is-preloading');
        document.body.classList.remove('is-preloading');

        // Final explicit hide
        setTimeout(() => {
            if (loaderEl) loaderEl.style.display = 'none';
        }, 800);


        // --- Step 6: Load Remaining Group Images (Lazy) ---
        // The thumbnails already have specific rendering in renderEventContent.
        // If we want to strictly defer them, we can set them to loading="lazy" there.
        // (Handled in renderEventContent)

        // Start Auto-Slideshow if applicable
        if (images.length > 1) {
            const progressBar = document.getElementById('event-progress-bar');
            if (progressBar) setTimeout(() => progressBar.classList.add('is-running'), 500);
        }

    } else {
        document.querySelector('main').innerHTML = '<div class="container"><p>イベントが見つかりませんでした。</p></div>';
        // Hide loader in error case
        const loaderEl = document.getElementById('opening-loader-overlay');
        if (loaderEl) loaderEl.classList.add('is-hidden');
    }
});

// --- Helper: Render Content (Extracted for readability) ---
function renderEventContent(eventItem, normalizePath) {
    // Render Header
    const headerEl = document.getElementById('dynamic-event-header');
    if (headerEl) {
        headerEl.innerHTML = '';
        const layoutWrapper = document.createElement('div');
        layoutWrapper.className = 'event-header-layout';

        // Title
        const titleContainer = document.createElement('div');
        titleContainer.className = 'event-title-container';

        if (eventItem.titleImage || (eventItem.images && eventItem.images.length > 0)) {
            let titleImgPath = eventItem.titleImage ? normalizePath(eventItem.titleImage) : normalizePath(eventItem.images[0]);
            let titleImgDarkPath = eventItem.titleImageDark ? normalizePath(eventItem.titleImageDark) : null;

            let imgHtml = '';
            if (titleImgDarkPath) {
                imgHtml = `
                    <picture>
                        <source srcset="${titleImgDarkPath}" media="(prefers-color-scheme: dark)">
                        <img src="${titleImgPath}" alt="${eventItem.name}" style="max-width: 300px; width: 100%; height: auto; display: block;">
                    </picture>
                `;
            } else {
                imgHtml = `<img src="${titleImgPath}" alt="${eventItem.name}" style="max-width: 300px; width: 100%; height: auto; display: block;">`;
            }
            titleContainer.innerHTML = imgHtml;
        } else {
            titleContainer.innerHTML = `<h1 style="font-size: clamp(1.5rem, 5vw, 2.2rem); font-weight: 900; margin-bottom: 0;">${eventItem.name}</h1>`;
        }
        layoutWrapper.appendChild(titleContainer);

        // Organizer
        if (eventItem.organizer) {
            const organizerContainer = document.createElement('div');
            organizerContainer.className = 'organizer-info';
            let orgLogoPath = eventItem.organizerLogo ? normalizePath(eventItem.organizerLogo) : '../assets/logo_placeholder.png';

            if (eventItem.organizerLogo) {
                organizerContainer.innerHTML = `<img src="${orgLogoPath}" alt="${eventItem.organizer}"><span>Organized by ${eventItem.organizer}</span>`;
            } else {
                organizerContainer.innerHTML = `<span>Organized by ${eventItem.organizer}</span>`;
            }

            if (eventItem.headerTextColor) {
                organizerContainer.style.color = eventItem.headerTextColor;
                if (eventItem.headerTextColor === 'white' || eventItem.headerTextColor === '#fff' || eventItem.headerTextColor === '#ffffff') {
                    organizerContainer.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                    organizerContainer.style.background = 'rgba(0, 0, 0, 0.4)';
                }
            }
            layoutWrapper.appendChild(organizerContainer);
        }
        headerEl.appendChild(layoutWrapper);
    }

    // Render Image Section
    const imageContainer = document.getElementById('dynamic-event-image');
    if (imageContainer) {
        let posterHtml = '';
        let galleryHtml = '';

        if (eventItem.poster) {
            const posterPath = normalizePath(eventItem.poster);
            posterHtml = `
                <div class="event-col-poster">
                    <img src="${posterPath}" class="event-poster-img" alt="${eventItem.name} Poster"
                        onclick="if(window.Lightbox) window.Lightbox.open(['${posterPath}'], 0)">
                </div>
            `;
        }

        const images = eventItem.images || (eventItem.image ? [eventItem.image] : []);
        if (images.length > 0) {
            const mainImgPath = normalizePath(images[0]);

            // Double buffer for Cross-Fade
            galleryHtml += `
                <div class="event-image-container">
                    <div id="event-bg-layer" class="event-image-bg" style="background-image: url('${mainImgPath}');"></div>
                    <img id="event-img-a" class="event-main-img" src="" alt="" style="position: absolute; top: 0; left: 0; opacity: 0; z-index: 2;">
                    <img id="event-img-b" class="event-main-img" src="${mainImgPath}" alt="${eventItem.name}"
                        style="position: relative; z-index: 3; opacity: 1;"
                        onclick="if(window.Lightbox) window.Lightbox.open(window.currentEventImages, 0)">
                    <div class="event-progress-container">
                        <div id="event-progress-bar" class="event-progress-bar"></div>
                    </div>
                </div>
            `;

            if (images.length > 1) {
                galleryHtml += `<div class="event-thumbnails">`;
                images.forEach((img, index) => {
                    const thumbPath = normalizePath(img);
                    const isActive = index === 0 ? 'is-active' : '';
                    // Added loading="lazy" for optimization
                    galleryHtml += `
                        <div class="thumbnail-item ${isActive}" onclick="switchEventImage(this, '${thumbPath}', ${index}, true)">
                            <img src="${thumbPath}" alt="Thumbnail ${index + 1}" loading="lazy"> 
                        </div>
                    `;
                });
                galleryHtml += `</div>`;
            }
        }

        window.currentEventImages = images.map(img => normalizePath(img));

        // Description & Details
        let descriptionHtml = '';
        if (eventItem.description) {
            descriptionHtml = `<div class="parchment-frame" style="margin-top:0;">${eventItem.description}<div class="watermark-logo"></div></div>`;
        } else if (eventItem.content) {
            descriptionHtml = `<div class="parchment-frame" style="margin-top:0;">${eventItem.content}<div class="watermark-logo"></div></div>`;
        }

        let detailsHtml = '';
        if (eventItem.details) {
            let socialHtml = (eventItem.organizerSocials && eventItem.organizerSocials.length > 0) ? renderOrganizerSocials(eventItem.organizerSocials) : '';
            detailsHtml = `<div class="parchment-frame">${eventItem.details}${socialHtml}<div class="watermark-logo"></div></div>`;
        }

        // Assembly
        if (posterHtml) {
            imageContainer.innerHTML = `
                <div class="event-split-layout">
                    ${posterHtml}
                    <div class="event-col-content">
                        ${galleryHtml}
                        <div id="dynamic-event-content-injected" style="display:flex; flex-direction:column; gap:24px; margin-top:24px;">
                            ${descriptionHtml}
                            ${detailsHtml}
                        </div> 
                    </div>
                </div>
            `;
        } else {
            imageContainer.innerHTML = `
                ${galleryHtml}
                <div id="dynamic-event-content-injected" style="display:flex; flex-direction:column; gap:24px; margin-top:24px;">
                    ${descriptionHtml}
                    ${detailsHtml}
                </div>
            `;
        }
    }

    // Hide placeholder
    const contentEl = document.getElementById('dynamic-event-content');
    if (contentEl) {
        contentEl.innerHTML = '';
        contentEl.style.display = 'none';
    }
}

// ... Listeners & Helper Functions (switchEventImage, renderOrganizerSocials) ...
// (Re-using existing logic below, ensuring window.switchEventImage is available)

// Auto-Slideshow & Switcher Logic (Simplified & Attached)
document.addEventListener('DOMContentLoaded', () => {
    // Note: The main logic above is async, so this part runs. 
    // However, we need to ensure the slide logic attaches AFTER content is injected.
    // The main block waits for injection. But event listeners for progress bar need the element to exist.
    // We already handled progress bar start in the main block.
    // We need to re-attach the 'animationend' listener dynamically or use event delegation.

    // Better approach: Delegated event listener for animationend effectively
    // But since elements are recreated, let's just make the `switchEventImage` global.
});

// Ensure switchEventImage is globally available
window.switchEventImage = function (element, src, index, isManual = true) {
    const imgA = document.getElementById('event-img-a');
    const imgB = document.getElementById('event-img-b');
    const bgLayer = document.getElementById('event-bg-layer');
    const progressBar = document.getElementById('event-progress-bar');

    if (progressBar) {
        progressBar.classList.remove('is-running');
        void progressBar.offsetWidth;
        progressBar.classList.add('is-running');
    }

    if (!imgA || !imgB) return;

    let frontImg, backImg;
    if (imgA.style.zIndex === '3') { frontImg = imgA; backImg = imgB; } else { frontImg = imgB; backImg = imgA; }

    backImg.src = src;

    const performSwap = () => {
        backImg.style.transition = 'none';
        backImg.style.opacity = '1';
        if (bgLayer) bgLayer.style.backgroundImage = `url('${src}')`;
        void backImg.offsetWidth;
        backImg.style.transition = '';
        frontImg.style.opacity = '0';

        setTimeout(() => {
            backImg.style.zIndex = '3';
            backImg.style.position = 'relative';
            frontImg.style.zIndex = '2';
            frontImg.style.position = 'absolute';
            backImg.onclick = () => { if (window.Lightbox) window.Lightbox.open(window.currentEventImages, index); };
            frontImg.onclick = null;
        }, 350);
    };

    if (backImg.complete) performSwap(); else backImg.onload = performSwap;

    const thumbs = document.querySelectorAll('.thumbnail-item');
    thumbs.forEach(thumb => { thumb.style.borderColor = 'transparent'; thumb.style.opacity = '0.6'; });
    element.style.borderColor = 'var(--primary)';
    element.style.opacity = '1';

    // Scroll thumbnail into view only if manually clicked (User request: prevent auto-scroll)
    if (isManual) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
};

// Global Listener for Animation End (Auto Slide)
document.addEventListener('animationend', (e) => {
    if (e.target.id === 'event-progress-bar') {
        const thumbs = document.querySelectorAll('.thumbnail-item');
        let currentIndex = 0;
        thumbs.forEach((thumb, i) => {
            if (thumb.style.borderColor === 'var(--primary)') currentIndex = i;
        });
        const nextIndex = (currentIndex + 1) % thumbs.length;
        const nextThumb = thumbs[nextIndex];
        const nextSrc = nextThumb.querySelector('img').src;
        if (window.switchEventImage) window.switchEventImage(nextThumb, nextSrc, nextIndex, false);
    }
});


// Helper: Render Organizer Social Icons
function renderOrganizerSocials(socials) {
    if (!socials || socials.length === 0) return '';
    let html = '<div style="margin-top: 16px; padding-top: 16px; border-top: 1px dashed var(--line);">';
    html += '<p style="font-size: 0.9rem; font-weight: bold; margin-bottom: 8px;">主催者リンク</p>';
    html += '<div style="display: flex; gap: 10px; flex-wrap: wrap;">';

    socials.forEach(s => {
        let iconHtml = '';
        let colorStyle = 'background:#333; color:#fff;';
        const type = s.type.toLowerCase();

        if (type === 'twitter' || type === 'x') {
            colorStyle = 'background:#000; color:#fff;';
            iconHtml = '<svg style="width:16px;height:16px;" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>';
        } else if (type === 'note') {
            colorStyle = 'background:#fff; color:#333; border:1px solid #ddd;';
            iconHtml = '<img src="../assets/icon/note_icon.svg" alt="note" style="width:16px;height:16px;" onerror="this.src=\'../assets/icon/link_icon.svg\'">';
        } else {
            iconHtml = '🔗';
        }

        html += `
            <a href="${s.url}" target="_blank" rel="noopener" style="
                display:flex; align-items:center; justify-content:center;
                width:36px; height:36px; border-radius:50%; ${colorStyle}
                text-decoration:none;
            ">
                ${iconHtml}
            </a>
        `;
    });

    html += '</div></div>';
    return html;
}
