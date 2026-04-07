import { fixPath } from './app/url.js';
import { getGalleryData } from './app/data.js';

function galleryTime(item) {
    const match = String(item?.date || '').match(/^(\d{4})\.(\d{2})\.(\d{2})$/);
    if (!match) return 0;

    const [, year, month, day] = match;
    return Date.UTC(Number(year), Number(month) - 1, Number(day));
}

/**
 * album-book.js
 * 3D page-flip album book for index.html Gallery section.
 * Depends on: utils.js, data_gallery.js
 */

export async function initGalleryPage() {
    'use strict';

    /* ----------------------------------------------------------
       Entry point: wait for DOM ready
       ---------------------------------------------------------- */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        const scene = document.getElementById('album-scene');
        if (!scene) return;

        // Wait for manifestPromise if available (WebP resolution)
        const dataReady = window.manifestPromise
            ? window.manifestPromise.catch(() => { })
            : Promise.resolve();

        dataReady.then(() => buildBook(scene));
    }

    /* ----------------------------------------------------------
       Build the album book inside #album-scene
       ---------------------------------------------------------- */
    function buildBook(scene) {
        const allData = getGalleryData() || [];
        const albums = allData.filter(item => {
            if (typeof window.shouldShowItem === 'function') return window.shouldShowItem(item);
            return !item.hidden;
        }).sort((a, b) => galleryTime(b) - galleryTime(a));

        if (albums.length === 0) {
            scene.innerHTML = `
                <div class="album-empty">
                    <span class="album-empty-icon">📷</span>
                    <p>まだアルバムはありません</p>
                </div>`;
            return;
        }

        // Inject book HTML structure
        scene.innerHTML = `
            <div class="album-wrapper">
                <button class="album-nav" id="album-prev" aria-label="前のページへ">‹</button>

                <div class="album-book">
                    <!-- Left page (static) -->
                    <div class="album-page album-page-left" id="book-page-left"></div>

                    <!-- Right side: background page + 3D flipper overlaid -->
                    <div class="album-right-wrap">
                        <div class="album-page album-page-right" id="book-page-right"></div>

                        <!-- 3D Page Turner — overlays the right page -->
                        <div class="album-page-turner" id="book-turner">
                            <div class="turner-front" id="turner-front"></div>
                            <div class="turner-back">
                                <div class="turner-back-inner" id="turner-back-inner"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <button class="album-nav" id="album-next" aria-label="次のページへ">›</button>
            </div>

            <!-- Page spread indicator -->
            <div class="album-page-indicator" id="album-page-indicator"></div>

            <!-- Album thumbnail selector (shown only when >1 album) -->
            <div class="album-selector" id="album-selector"></div>
        `;

        /* ---- DOM refs ---- */
        const leftPage = document.getElementById('book-page-left');
        const rightPage = document.getElementById('book-page-right');
        const turner = document.getElementById('book-turner');
        const turnerFront = document.getElementById('turner-front');
        const turnerBackIn = document.getElementById('turner-back-inner');
        const prevBtn = document.getElementById('album-prev');
        const nextBtn = document.getElementById('album-next');
        const indicator = document.getElementById('album-page-indicator');
        const selector = document.getElementById('album-selector');

        /* ---- State ---- */
        let currentAlbum = 0;
        let currentSpread = 0;
        let isAnimating = false;

        /* ----------------------------------------------------------
           Helper: build "pages" array for an album
           pages[0] = title page  (type: 'title')
           pages[1..N] = photo pages (type: 'photo')
           ---------------------------------------------------------- */
        function getPages(albumIdx) {
            const album = albums[albumIdx];
            const pages = [{ type: 'title', album }];
            (album.images || []).forEach(src => pages.push({ type: 'photo', src }));
            return pages;
        }

        function totalSpreads(albumIdx) {
            return Math.ceil(getPages(albumIdx).length / 2);
        }

        /* ----------------------------------------------------------
           Helper: render a single page item → HTML string
           ---------------------------------------------------------- */
        function pageHTML(page) {
            if (!page) {
                return '<div class="page-blank"></div>';
            }
            if (page.type === 'title') {
                const a = page.album;
                const newTape = a === albums[0] ? '<span class="album-new-tape">NEW!</span>' : '';
                return `
                    <div class="album-title-page">
                        ${newTape}
                        <div class="album-title-border"></div>
                        <span class="album-title-label">Memory</span>
                        <p class="album-title-name">${escHtml(a.title)}</p>
                        <p class="album-title-date">${escHtml(a.date || '')}</p>
                        ${a.desc ? `<p class="album-title-desc">${escHtml(a.desc)}</p>` : ''}
                    </div>`;
            }
            // photo
            const src = (typeof fixPath === 'function') ? fixPath(page.src) : page.src;
            const safeSrc = src.replace(/"/g, '&quot;');
            return `
                <div class="album-photo-mount" data-src="${safeSrc}">
                    <div class="album-photo-zoom" aria-hidden="true">
                        <div class="album-photo-zoom-icon"></div>
                    </div>
                    <img src="${src}" alt="">
                </div>`;
        }

        function escHtml(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        }

        /* ----------------------------------------------------------
           Load an album at a given spread (no animation)
           ---------------------------------------------------------- */
        function updateSectionBg() {
            const pages = getPages(currentAlbum);
            const ri = currentSpread * 2 + 1;
            const li = currentSpread * 2;
            const photoPage = (pages[ri] && pages[ri].type === 'photo') ? pages[ri]
                            : (pages[li] && pages[li].type === 'photo') ? pages[li]
                            : null;
            if (photoPage) {
                const src = (typeof fixPath === 'function') ? fixPath(photoPage.src) : photoPage.src;
                scene.style.setProperty('--album-bg', `url('${src}')`);
            } else {
                scene.style.removeProperty('--album-bg');
            }
        }

        function preloadAlbumImages(albumIdx) {
            const album = albums[albumIdx];
            (album.images || []).forEach(src => {
                const img = new Image();
                img.src = (typeof fixPath === 'function') ? fixPath(src) : src;
            });
        }

        function loadAlbum(albumIdx, spreadIdx) {
            currentAlbum = albumIdx;
            currentSpread = spreadIdx;
            preloadAlbumImages(albumIdx);

            const pages = getPages(albumIdx);
            const li = spreadIdx * 2;
            const ri = li + 1;

            const leftHTML = pageHTML(pages[li] || null);
            const rightHTML = pageHTML(pages[ri] || null);

            leftPage.innerHTML = leftHTML;
            rightPage.innerHTML = rightHTML;
            turnerFront.innerHTML = rightHTML;
            turnerBackIn.innerHTML = '';

            updateNav();
            buildIndicator();
            updateSelector();
            updateSectionBg();
        }

        /* ----------------------------------------------------------
           Navigate forward — with 3D page flip animation
           ---------------------------------------------------------- */
        function goNext() {
            if (isAnimating) return;

            const pages = getPages(currentAlbum);
            const maxSpread = totalSpreads(currentAlbum) - 1;

            if (currentSpread < maxSpread) {
                // Flip to next spread within same album
                const ns = currentSpread + 1;
                const nLi = ns * 2;
                const nRi = nLi + 1;

                const nextLeft = pageHTML(pages[nLi] || null);
                const nextRight = pageHTML(pages[nRi] || null);

                // Prepare: right-page (background) gets the upcoming right content
                rightPage.innerHTML = nextRight;
                // Turner back gets the upcoming left content
                turnerBackIn.innerHTML = nextLeft;

                // Kick off 3D flip
                isAnimating = true;
                turner.classList.add('is-turning');

                setTimeout(() => {
                    // 1. turner は -180deg で停止中:
                    //    leftPage は turner の裏に隠れており、
                    //    turnerFront は backface-hidden → どちらも不可視なので先に更新しても見えない
                    leftPage.innerHTML = nextLeft;
                    turnerFront.innerHTML = nextRight;

                    // 2. アニメーションなしでターナーを 0deg に戻す（スナップ）
                    //    void offsetWidth のフラッシュ時点では leftPage/turnerFront は既に正しい内容
                    turner.classList.add('no-anim');
                    turner.classList.remove('is-turning');
                    void turner.offsetWidth; // force reflow
                    turner.classList.remove('no-anim');

                    // 3. ターナーが 0deg に戻ると turnerBack は backface-hidden になるので安全にクリア
                    turnerBackIn.innerHTML = '';

                    currentSpread = ns;
                    isAnimating = false;
                    updateNav();
                    buildIndicator();
                    updateSectionBg();
                }, 800);

            } else if (currentAlbum < albums.length - 1) {
                // Move to next album (instant)
                loadAlbum(currentAlbum + 1, 0);
            }
        }

        /* ----------------------------------------------------------
           Navigate backward — instant snap (no animation)
           ---------------------------------------------------------- */
        function goPrev() {
            if (isAnimating) return;

            if (currentSpread > 0) {
                const ps = currentSpread - 1;
                const pages = getPages(currentAlbum);
                const li = ps * 2;
                const ri = li + 1;

                const leftHTML = pageHTML(pages[li] || null);
                const rightHTML = pageHTML(pages[ri] || null);

                leftPage.innerHTML = leftHTML;
                rightPage.innerHTML = rightHTML;
                turnerFront.innerHTML = rightHTML;
                turnerBackIn.innerHTML = '';

                currentSpread = ps;
                updateNav();
                buildIndicator();
                updateSectionBg();

            } else if (currentAlbum > 0) {
                // Move to previous album, last spread
                const prevAlbum = currentAlbum - 1;
                loadAlbum(prevAlbum, totalSpreads(prevAlbum) - 1);
            }
        }

        /* ----------------------------------------------------------
           UI helpers
           ---------------------------------------------------------- */
        function updateNav() {
            const canPrev = currentSpread > 0 || currentAlbum > 0;
            const canNext = currentSpread < totalSpreads(currentAlbum) - 1 || currentAlbum < albums.length - 1;
            prevBtn.disabled = !canPrev;
            nextBtn.disabled = !canNext;
        }

        function buildIndicator() {
            if (!indicator) return;
            const total = totalSpreads(currentAlbum);
            indicator.innerHTML = '';
            for (let i = 0; i < total; i++) {
                const dot = document.createElement('button');
                dot.className = 'album-page-dot' + (i === currentSpread ? ' is-active' : '');
                dot.setAttribute('aria-label', `ページ ${i + 1}`);
                const idx = i; // capture
                dot.addEventListener('click', () => {
                    if (isAnimating || idx === currentSpread) return;
                    const pages = getPages(currentAlbum);
                    const li = idx * 2;
                    const ri = li + 1;
                    const lH = pageHTML(pages[li] || null);
                    const rH = pageHTML(pages[ri] || null);
                    leftPage.innerHTML = lH;
                    rightPage.innerHTML = rH;
                    turnerFront.innerHTML = rH;
                    turnerBackIn.innerHTML = '';
                    currentSpread = idx;
                    updateNav();
                    buildIndicator();
                });
                indicator.appendChild(dot);
            }
        }

        function buildSelector() {
            if (!selector || albums.length <= 1) return;
            selector.innerHTML = '';
            albums.forEach((album, idx) => {
                const btn = document.createElement('button');
                btn.className = 'album-select-btn' + (idx === 0 ? ' is-active' : '');
                btn.setAttribute('aria-label', album.title);
                btn.setAttribute('title', album.title);
                const thumbSrc = (typeof fixPath === 'function')
                    ? fixPath(album.thumb || (album.images && album.images[0]) || '')
                    : (album.thumb || '');
                btn.innerHTML = `<img src="${thumbSrc}" alt="${escHtml(album.title)}" loading="lazy">`;
                btn.addEventListener('click', () => {
                    if (isAnimating || currentAlbum === idx) return;
                    loadAlbum(idx, 0);
                });
                selector.appendChild(btn);
            });
        }

        function updateSelector() {
            if (!selector) return;
            selector.querySelectorAll('.album-select-btn').forEach((el, idx) => {
                el.classList.toggle('is-active', idx === currentAlbum);
            });
        }

        /* ----------------------------------------------------------
           Lightbox — photo zoom on click
           ---------------------------------------------------------- */
        const lb = createLightbox();

        // Delegated click: any .album-photo-mount[data-src] inside scene
        scene.addEventListener('click', e => {
            if (isAnimating) return;
            const mount = e.target.closest('.album-photo-mount[data-src]');
            if (!mount) return;
            const album = albums[currentAlbum];
            const allSrcs = (album.images || []).map(s => (typeof fixPath === 'function') ? fixPath(s) : s);
            lb.open(mount.dataset.src, allSrcs);
        });

        /* ----------------------------------------------------------
           Event listeners (navigation)
           ---------------------------------------------------------- */
        prevBtn.addEventListener('click', goPrev);
        nextBtn.addEventListener('click', goNext);

        // Keyboard navigation (only when album is in viewport)
        document.addEventListener('keydown', e => {
            const rect = scene.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom > 0;
            if (!inView) return;
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
        });

        // Touch swipe support
        let touchStartX = null;
        scene.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
        scene.addEventListener('touchend', e => {
            if (touchStartX === null) return;
            const dx = e.changedTouches[0].clientX - touchStartX;
            touchStartX = null;
            if (Math.abs(dx) < 40) return;
            if (dx < 0) goNext();
            else goPrev();
        }, { passive: true });

        /* ---- Initial load ---- */
        buildSelector();
        loadAlbum(0, 0);
    }

    /* ----------------------------------------------------------
       Lightbox factory (singleton — created once per page)
       Supports prev/next navigation and touch swipe
       ---------------------------------------------------------- */
    function createLightbox() {
        // Reuse if already in DOM
        const existing = document.getElementById('album-lb');
        if (existing) { existing.remove(); }

        const el = document.createElement('div');
        el.id = 'album-lb';
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-modal', 'true');
        el.setAttribute('aria-label', '画像を拡大表示');
        el.innerHTML = `
            <div class="album-lb-backdrop"></div>
            <button class="album-lb-nav album-lb-prev" aria-label="前の写真">‹</button>
            <img class="album-lb-img" src="" alt="">
            <button class="album-lb-nav album-lb-next" aria-label="次の写真">›</button>
            <div class="album-lb-counter"></div>
        `;
        document.body.appendChild(el);

        let srcs = [];
        let currentIdx = 0;

        const backdrop = el.querySelector('.album-lb-backdrop');
        const img = el.querySelector('.album-lb-img');
        const prevNav = el.querySelector('.album-lb-prev');
        const nextNav = el.querySelector('.album-lb-next');
        const counter = el.querySelector('.album-lb-counter');

        function show(idx) {
            if (idx < 0 || idx >= srcs.length) return;
            currentIdx = idx;
            img.src = srcs[idx];
            backdrop.style.setProperty('--lb-bg', `url('${srcs[idx]}')`);
            counter.textContent = `${idx + 1} / ${srcs.length}`;
            prevNav.style.visibility = idx > 0 ? '' : 'hidden';
            nextNav.style.visibility = idx < srcs.length - 1 ? '' : 'hidden';
        }

        function close() {
            el.classList.remove('is-open');
            document.body.classList.remove('album-lb-open');
            setTimeout(() => {
                if (!el.classList.contains('is-open')) {
                    img.src = '';
                }
            }, 350);
        }

        el.querySelector('.album-lb-backdrop').addEventListener('click', close);
        img.addEventListener('click', e => { e.stopPropagation(); close(); });
        prevNav.addEventListener('click', e => { e.stopPropagation(); show(currentIdx - 1); });
        nextNav.addEventListener('click', e => { e.stopPropagation(); show(currentIdx + 1); });

        // Keyboard
        document.addEventListener('keydown', e => {
            if (!el.classList.contains('is-open')) return;
            if (e.key === 'Escape') close();
            if (e.key === 'ArrowLeft') show(currentIdx - 1);
            if (e.key === 'ArrowRight') show(currentIdx + 1);
        });

        // Touch swipe
        let swipeX = null;
        el.addEventListener('touchstart', e => { swipeX = e.touches[0].clientX; }, { passive: true });
        el.addEventListener('touchend', e => {
            if (swipeX === null) return;
            const dx = e.changedTouches[0].clientX - swipeX;
            swipeX = null;
            if (Math.abs(dx) < 40) return;
            if (dx < 0) show(currentIdx + 1);
            else show(currentIdx - 1);
        }, { passive: true });

        return {
            open(src, allSrcs) {
                srcs = allSrcs || [src];
                const idx = srcs.indexOf(src);
                el.classList.add('is-open');
                document.body.classList.add('album-lb-open');
                show(idx >= 0 ? idx : 0);
            }
        };
    }

}
