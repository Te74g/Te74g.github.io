/**
 * Event Page Loader
 * Dynamically loads event content based on URL query parameter `?id=...`
 * Requires: site_data.js (partnerEventsData)
 */
document.addEventListener('DOMContentLoaded', () => {
    if (!window.partnerEventsData) {
        console.error('partnerEventsData is not defined.');
        return;
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

        // Render Header
        const headerEl = document.getElementById('dynamic-event-header');
        if (headerEl) {
            headerEl.innerHTML = '';

            // Prepare Content Wrapper
            const layoutWrapper = document.createElement('div');
            layoutWrapper.className = 'event-header-layout';

            // --- 1. Title Section ---
            const titleContainer = document.createElement('div');
            titleContainer.className = 'event-title-container';

            if (eventItem.titleImage || (eventItem.images && eventItem.images.length > 0)) {
                // Image Title (Primary or Fallback)
                let titleImgPath = eventItem.titleImage;

                // Fallback to first gallery image if no specific title image
                if (!titleImgPath && eventItem.images && eventItem.images.length > 0) {
                    titleImgPath = eventItem.images[0];
                }

                let titleImgDarkPath = eventItem.titleImageDark;

                if (!titleImgPath.startsWith('http') && !titleImgPath.startsWith('../') && !titleImgPath.startsWith('/')) {
                    titleImgPath = '../' + titleImgPath;
                }

                let imgHtml = '';
                if (titleImgDarkPath && !titleImgDarkPath.startsWith('http') && !titleImgDarkPath.startsWith('../') && !titleImgDarkPath.startsWith('/')) {
                    titleImgDarkPath = '../' + titleImgDarkPath;
                }

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
                // Text Title
                titleContainer.innerHTML = `
                    <h1 style="font-size: clamp(1.5rem, 5vw, 2.2rem); font-weight: 900; margin-bottom: 0;">
                        ${eventItem.name}
                    </h1>
                `;
            }
            layoutWrapper.appendChild(titleContainer);

            // --- 2. Organizer Section ---
            if (eventItem.organizer) { // Check if organizer exists (almost always yes)
                const organizerContainer = document.createElement('div');
                organizerContainer.className = 'organizer-info';

                let orgLogoPath = eventItem.organizerLogo || '../assets/logo_placeholder.png'; // Fallback
                if (!orgLogoPath.startsWith('http') && !orgLogoPath.startsWith('../') && !orgLogoPath.startsWith('/')) {
                    orgLogoPath = '../' + orgLogoPath;
                }

                // Check if organizerLogo is actually provided, otherwise maybe just show text or default icon
                // User specifically asked for logo + name
                if (eventItem.organizerLogo) {
                    organizerContainer.innerHTML = `
                        <img src="${orgLogoPath}" alt="${eventItem.organizer}">
                        <span>Organized by ${eventItem.organizer}</span>
                     `;
                } else {
                    // Text only fallback
                    organizerContainer.innerHTML = `<span>Organized by ${eventItem.organizer}</span>`;
                }

                // Apply Optional Text Color Override
                if (eventItem.headerTextColor) {
                    organizerContainer.style.color = eventItem.headerTextColor;
                    if (eventItem.headerTextColor === 'white' || eventItem.headerTextColor === '#fff' || eventItem.headerTextColor === '#ffffff') {
                        organizerContainer.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                        organizerContainer.style.background = 'rgba(0, 0, 0, 0.4)'; // Darker transparency for white text
                    }
                }

                layoutWrapper.appendChild(organizerContainer);
            }

            headerEl.appendChild(layoutWrapper);
        }

        // Apply Background Image (Site Background)
        if (eventItem.backgroundImage) {
            let bgPath = eventItem.backgroundImage;
            if (!bgPath.startsWith('http') && !bgPath.startsWith('../') && !bgPath.startsWith('/')) {
                bgPath = '../' + bgPath;
            }

            // Preloader Logic using Class State (to match site animation)
            const styleId = 'preloader-style';
            if (!document.getElementById(styleId)) {
                const style = document.createElement('style');
                style.id = styleId;
                style.textContent = `
                    body.is-preloading main { opacity: 0; }
                    body.is-preloading .reveal { animation: none !important; opacity: 0 !important; }
                `;
                document.head.appendChild(style);
            }

            document.body.classList.add('is-preloading');

            const bgImg = new Image();

            const revealContent = () => {
                // Prevent double execution
                if (bgImg.dataset.loaded) return;
                bgImg.dataset.loaded = "true";

                // Create Fixed Background Element with Blur
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
                    bgContainer.style.transform = 'scale(1.05)'; // Scale up slightly to avoid blurred edges
                    bgContainer.style.pointerEvents = 'none'; // Click-through
                    document.body.prepend(bgContainer);
                }

                bgContainer.style.backgroundImage = `url('${bgPath}')`;
                bgContainer.style.backgroundSize = 'cover';
                bgContainer.style.backgroundPosition = 'center';
                bgContainer.style.backgroundAttachment = 'fixed'; // Keep it fixed
                bgContainer.style.backgroundRepeat = 'no-repeat';

                // Cleanup body background if set previously
                document.body.style.backgroundImage = 'none';

                // Small delay to ensure background renders
                requestAnimationFrame(() => {
                    document.body.classList.remove('is-preloading');
                });
            };

            bgImg.onload = revealContent;
            bgImg.onerror = revealContent; // Show anyway if error

            // Start load
            bgImg.src = bgPath;

            // Check if already complete (cached)
            if (bgImg.complete) {
                revealContent();
            }

            // Fallback timeout (3s)
            setTimeout(revealContent, 3000);

        } else {
            // No background image, show content immediately (if it was hidden by default, but here we assume it's visible unless JS hides it)
            // We didn't hide it by CSS default, so nothing to do.
        }

        // Render Image with Selector
        const imageContainer = document.getElementById('dynamic-event-image');
        if (imageContainer) {
            // Prepare result variables
            let posterHtml = '';
            let galleryHtml = '';

            // --- Poster Logic ---
            if (eventItem.poster) {
                let posterPath = eventItem.poster;
                if (!posterPath.startsWith('http') && !posterPath.startsWith('../') && !posterPath.startsWith('/')) {
                    posterPath = '../' + posterPath;
                }
                posterHtml = `
                        <div class="event-col-poster">
                            <img src="${posterPath}" class="event-poster-img" alt="${eventItem.name} Poster"
                                onclick="if(window.Lightbox) window.Lightbox.open(['${posterPath}'], 0)">
                        </div>
                    `;
            }

            // --- Gallery Logic ---
            const images = eventItem.images || (eventItem.image ? [eventItem.image] : []);

            if (images.length > 0) {
                let mainImgPath = images[0];
                if (!mainImgPath.startsWith('http') && !mainImgPath.startsWith('../') && !mainImgPath.startsWith('/')) {
                    mainImgPath = '../' + mainImgPath;
                }

                // Double buffer for Cross-Fade
                // We start with Front at z-index 3 (visible) and Back at z-index 2 (hidden)
                galleryHtml += `
                        <div class="event-image-container">
                            <div id="event-bg-layer" class="event-image-bg" style="background-image: url('${mainImgPath}');"></div>
                            
                            <!-- Img A (Start as Back) -->
                            <img id="event-img-a" class="event-main-img" src="" alt="" 
                                 style="position: absolute; top: 0; left: 0; opacity: 0; z-index: 2;">
                            
                            <!-- Img B (Start as Front) -->
                            <img id="event-img-b" class="event-main-img" src="${mainImgPath}" alt="${eventItem.name}"
                                 style="position: relative; z-index: 3; opacity: 1;"
                                 onclick="if(window.Lightbox) window.Lightbox.open(window.currentEventImages, 0)">
                            
                            <!-- Progress Bar -->
                            <div class="event-progress-container">
                                <div id="event-progress-bar" class="event-progress-bar"></div>
                            </div>
                        </div>
                    `;

                // If multiple images, render thumbnails
                if (images.length > 1) {
                    galleryHtml += `<div class="event-thumbnails" style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 10px;">`;

                    images.forEach((img, index) => {
                        let thumbPath = img;
                        if (!thumbPath.startsWith('http') && (!thumbPath.startsWith('../') && !thumbPath.startsWith('/'))) {
                            thumbPath = '../' + thumbPath;
                        }
                        const isActive = index === 0 ? 'border-color: var(--primary); opacity: 1;' : 'border-color: transparent; opacity: 0.6;';

                        galleryHtml += `
                                <div class="thumbnail-item" onclick="switchEventImage(this, '${thumbPath}', ${index}, true)" 
                                     style="flex: 0 0 80px; width: 80px; height: 80px; cursor: pointer; border: 3px solid; border-radius: 8px; overflow: hidden; transition: all 0.2s; ${isActive}">
                                    <img src="${thumbPath}" style="width: 100%; height: 100%; object-fit: cover;">
                                </div>
                            `;
                    });
                    galleryHtml += `</div>`;
                }
            }

            // Store current images for Lightbox usage (Gallery only)
            window.currentEventImages = images.map(img => {
                if (!img.startsWith('http') && !img.startsWith('../') && !img.startsWith('/')) {
                    return '../' + img;
                }
                return img;
            });

            // --- Layout Assembly ---
            if (posterHtml) {
                // Split Layout
                imageContainer.innerHTML = `
                        <div class="event-split-layout">
                            ${posterHtml}
                            <div class="event-col-content">
                                ${galleryHtml}
                                <div id="dynamic-event-content-injected" class="event-description-box"></div> 
                            </div>
                        </div>
                     `;
            } else {
                // Standard Layout (No split)
                imageContainer.innerHTML = galleryHtml + `<div id="dynamic-event-content-injected" class="event-description-box"></div>`;
            }

            // Inject Content into the placeholder
            const contentEl = document.getElementById('dynamic-event-content');
            const injectedContainer = document.getElementById('dynamic-event-content-injected');

            if (contentEl && injectedContainer) {
                injectedContainer.innerHTML = eventItem.content || '<p>詳細情報がありません。</p>';
                injectedContainer.style.marginTop = '20px';
                contentEl.innerHTML = '';
                contentEl.style.display = 'none';
            }

            // --- Auto-Slideshow Logic ---
            if (images.length > 1) {
                const progressBar = document.getElementById('event-progress-bar');

                // Initialize: Start animation
                setTimeout(() => {
                    if (progressBar) progressBar.classList.add('is-running');
                }, 100);

                // Listen for animation end
                if (progressBar) {
                    progressBar.addEventListener('animationend', () => {
                        // Find current index
                        const thumbs = document.querySelectorAll('.thumbnail-item');
                        let currentIndex = 0;
                        thumbs.forEach((thumb, i) => {
                            // Check for the active border color to identify the current thumbnail
                            if (thumb.style.borderColor === 'var(--primary)') {
                                currentIndex = i;
                            }
                        });

                        // Calculate next
                        const nextIndex = (currentIndex + 1) % images.length;
                        const nextThumb = thumbs[nextIndex];

                        // Trigger switch (auto=false for internal call)
                        // We need to pass the element, src, etc.
                        // We can extract src from the thumb image
                        const nextSrc = nextThumb.querySelector('img').src;

                        if (window.switchEventImage) {
                            window.switchEventImage(nextThumb, nextSrc, nextIndex, false); // false = not manual
                        }
                    });
                }
            }

            // Define switcher function globally (Flicker-Free Cross-Fade)
            if (!window.switchEventImage) {
                window.switchEventImage = function (element, src, index, isManual = true) {
                    const imgA = document.getElementById('event-img-a');
                    const imgB = document.getElementById('event-img-b');
                    const bgLayer = document.getElementById('event-bg-layer');
                    const progressBar = document.getElementById('event-progress-bar');

                    // Reset Progress Bar
                    if (progressBar) {
                        progressBar.classList.remove('is-running');
                        void progressBar.offsetWidth; // Force reflow
                        // Restart only if not strictly stopped (optional logic), for now always restart
                        progressBar.classList.add('is-running');
                    }

                    if (!imgA || !imgB) return;

                    // Determine who is Front and who is Back based on Z-Index
                    // Assuming transition works by: Back becomes opaque (hidden behind), Front fades out (reveal Back).

                    let frontImg, backImg;
                    // We check inline style or computed style. Inline is safer since we set it.
                    // Initial state: B is z:3, A is z:2.
                    if (imgA.style.zIndex === '3') {
                        frontImg = imgA;
                        backImg = imgB;
                    } else {
                        frontImg = imgB;
                        backImg = imgA;
                    }

                    // 1. Prepare Back Image
                    backImg.src = src;

                    // 2. Wait for Load
                    const performSwap = () => {
                        // 3. Make Back Image Opaque (Still behind Front, so invisible change)
                        backImg.style.transition = 'none'; // Snap transparency
                        backImg.style.opacity = '1';

                        // Update Background Layer (Optional, behind everything)
                        if (bgLayer) {
                            bgLayer.style.backgroundImage = `url('${src}')`;
                        }

                        // Force Reflow to ensure 'none' transition applies immediately
                        void backImg.offsetWidth;

                        // Restore transition for future, though we don't fade Back *out* yet.
                        // We only fade Front out.
                        backImg.style.transition = '';

                        // 4. Fade Out Front Image (Revealing the Back Image)
                        // Front image has transition defined in CSS.
                        frontImg.style.opacity = '0';

                        // 5. Swap Roles after Transition
                        setTimeout(() => {
                            // Now Front is transparent. Back is opaque.
                            // We swap Z-indexes so Back becomes the new Front (z:3).
                            backImg.style.zIndex = '3';
                            backImg.style.position = 'relative'; // Ensure it takes flow if needed, though they are likely overlapping

                            frontImg.style.zIndex = '2';
                            frontImg.style.position = 'absolute'; // Move to back layer position

                            // Update click handler to new Front
                            backImg.onclick = () => {
                                if (window.Lightbox) window.Lightbox.open(window.currentEventImages, index);
                            };
                            frontImg.onclick = null; // Disable old

                        }, 350); // Slightly longer than 300ms transition
                    };

                    if (backImg.complete) {
                        performSwap();
                    } else {
                        backImg.onload = performSwap;
                    }

                    // Update Active State
                    const thumbs = document.querySelectorAll('.thumbnail-item');
                    thumbs.forEach(thumb => {
                        thumb.style.borderColor = 'transparent';
                        thumb.style.opacity = '0.6';
                    });
                    element.style.borderColor = 'var(--primary)';
                    element.style.opacity = '1';
                };
            }

        }

        // Standard content render check (if not blocked by split layout)
        const contentEl = document.getElementById('dynamic-event-content');
        if (contentEl && contentEl.style.display !== 'none') {
            contentEl.innerHTML = eventItem.content || '<p>詳細情報がありません。</p>';
        }
    } else {
        document.querySelector('main').innerHTML = '<div class="container"><p>イベントが見つかりませんでした。</p></div>';
    }
});
