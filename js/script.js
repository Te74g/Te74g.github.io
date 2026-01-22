(function () {
    const prefersReducedMotion =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Footer year
    const year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());

    // Header elevation
    const header = document.querySelector("[data-elevate]");
    const setElevated = () => {
        if (!header) return;
        header.classList.toggle("is-elevated", window.scrollY > 6);
    };
    window.addEventListener("scroll", setElevated, { passive: true });
    setElevated();

    // MENU overlay
    const menu = document.getElementById("site-nav");
    const openBtn = document.querySelector(".menu-btn");
    const closeBtn = document.querySelector(".menu-close");

    const openMenu = () => {
        if (!menu || !openBtn) return;
        menu.classList.add("is-open");
        menu.setAttribute("aria-hidden", "false");
        openBtn.setAttribute("aria-expanded", "true");
        document.body.classList.add("nav-open");
    };

    const closeMenu = () => {
        if (!menu || !openBtn) return;
        menu.classList.remove("is-open");
        menu.setAttribute("aria-hidden", "true");
        openBtn.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
    };

    const isOpen = () => menu && menu.classList.contains("is-open");

    openBtn?.addEventListener("click", () => (isOpen() ? closeMenu() : openMenu()));
    closeBtn?.addEventListener("click", closeMenu);

    // Close on ESC / outside click / link click
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isOpen()) closeMenu();
    });

    menu?.addEventListener("click", (e) => {
        const t = e.target;
        if (!(t instanceof Element)) return;

        // click outside inner => close
        if (t.classList.contains("menu")) closeMenu();

        // click a link => close
        if (t.closest("a")) closeMenu();
    });

    // Reveal
    const targets = Array.from(document.querySelectorAll(".reveal"));
    if (targets.length) {
        if (prefersReducedMotion) {
            targets.forEach((t) => t.classList.add("is-visible"));
        } else if ("IntersectionObserver" in window) {
            const io = new IntersectionObserver(
                (entries) => {
                    entries.forEach((e) => {
                        if (e.isIntersecting) e.target.classList.add("is-visible");
                    });
                },
                { threshold: 0.14 }
            );
            targets.forEach((t) => io.observe(t));
        } else {
            targets.forEach((t) => t.classList.add("is-visible"));
        }
    }

    // Event filtering (search + status)
    const q = document.getElementById("q");
    const status = document.getElementById("status");
    const grid = document.getElementById("eventGrid");
    const empty = document.getElementById("empty");

    const applyFilter = () => {
        if (!grid) return;

        const query = (q?.value || "").trim().toLowerCase();
        const st = status?.value || "all";
        const cards = Array.from(grid.querySelectorAll("[data-status]"));

        let visible = 0;

        cards.forEach((card) => {
            const s = card.getAttribute("data-status") || "";
            const keywords = (card.getAttribute("data-keywords") || "").toLowerCase();
            const text = (card.textContent || "").toLowerCase();

            const okStatus = st === "all" || s === st;
            const okQuery = !query || keywords.includes(query) || text.includes(query);

            const ok = okStatus && okQuery;
            card.style.display = ok ? "" : "none";
            if (ok) visible += 1;
        });

        if (empty) empty.hidden = visible !== 0;
    };

    q?.addEventListener("input", applyFilter);
    status?.addEventListener("change", applyFilter);
    applyFilter();

    // To Top Button - Prevent overlap with footer
    const toTopBtn = document.querySelector(".to-top");
    const footer = document.querySelector(".site-footer");

    if (toTopBtn && footer) {
        const adjustToTop = () => {
            const footerRect = footer.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // Calculate how much of the footer is visible
            const footerVisibleHeight = Math.max(0, viewportHeight - footerRect.top);

            // Base bottom position is 24px
            // If footer is visible, push the button up by (footerVisibleHeight - some offset if needed)
            // But we simply want it to "stick" above the footer.
            // If footerRect.top is less than viewportHeight, it means footer is in view.

            if (footerVisibleHeight > 0) {
                toTopBtn.style.bottom = `${24 + footerVisibleHeight}px`;
            } else {
                toTopBtn.style.bottom = "24px";
            }
        };

        window.addEventListener("scroll", adjustToTop, { passive: true });
        window.addEventListener("resize", adjustToTop, { passive: true });
        adjustToTop(); // init
    }
})();

/* ==========================================================================
   DATA GENERATION SYSTEM (A案: データ一元管理)
   data.js の内容を読み込んで、自動的にページを作ります。
   ========================================================================== */
(function () {
    // データが読み込まれていなければ何もしない
    // データが読み込まれていなければ何もしない
    if (typeof membersData === 'undefined' && typeof newsData === 'undefined' && typeof partnerEventsData === 'undefined' && typeof linksData === 'undefined') return;

    // パス自動調整関数
    const fixPath = (path) => {
        if (!path) return "";
        // http や / で始まる絶対パスはそのまま
        if (path.match(/^(http|\/\/)/)) return path;

        // "assets/..." のように書かれていることを想定し、
        // "./" で始まっていたら一旦削除して統一する
        let cleanPath = path;
        if (cleanPath.startsWith("./")) {
            cleanPath = cleanPath.slice(2);
        }

        // 現在のURLにサブディレクトリが含まれているか判定
        // 新構成: /member/, /news/, /partner_events/, /pages/ など
        const subDirs = ["/member/", "/news/", "/partner_events/", "/pages/"];
        const isSubDir = subDirs.some(dir => window.location.pathname.includes(dir));

        if (isSubDir) {
            return "../" + cleanPath;
        }
        return "./" + cleanPath;
    };


    /* -------------------------------------------------------
       1. キャスト一覧ページ (people.html) の生成
       ------------------------------------------------------- */
    const peopleContainer = document.getElementById("people-list-container");
    if (peopleContainer && typeof membersData !== 'undefined') {
        // 表示順序の定義
        const sectionOrder = ["運営部", "飼育区画", "野生区画", "妖怪区画", "スタッフ"];

        // データをセクションごとにグループ化
        const grouped = {};
        sectionOrder.forEach(sec => grouped[sec] = []);

        membersData.forEach(member => {
            const sec = member.section || "その他";
            if (!grouped[sec]) grouped[sec] = [];
            grouped[sec].push(member);
        });

        // HTML生成
        sectionOrder.forEach(sec => {
            const list = grouped[sec];
            if (list && list.length > 0) {
                // セクション見出し
                const divider = document.createElement("div");
                divider.className = "section-divider reveal is-visible"; // reveal is-visible to show immediately
                divider.innerHTML = `<span class="section-label">${sec}</span>`;
                peopleContainer.appendChild(divider);

                // グリッド
                const grid = document.createElement("div");
                grid.className = "cheki-grid";

                list.forEach(m => {
                    const link = document.createElement("a");
                    link.href = fixPath(m.link); // パス補正は本来data.jsで./入ってるので不要かもしれないが一応
                    link.className = "cheki-card reveal is-visible";
                    const displayName = m.name.replace(/（.*?）/g, ''); // Clean name for display
                    link.setAttribute("data-name", displayName);
                    link.setAttribute("data-tags", m.tags);

                    link.innerHTML = `
                        <div class="cheki-visual">
                            <img src="${fixPath(m.image)}" alt="${m.name}" class="cheki-img">
                            <span class="cheki-tag-badge">${m.tagLabel}</span>
                        </div>
                        <div class="cheki-name">${displayName}</div>
                    `;
                    grid.appendChild(link);
                });
                peopleContainer.appendChild(grid);
            }
        });
    }


    /* -------------------------------------------------------
       2. ニュース一覧ページ (news/index.html) の生成
       ------------------------------------------------------- */
    const newsContainer = document.getElementById("news-list-container");
    if (newsContainer && typeof newsData !== 'undefined') {
        newsData.forEach(item => {
            const link = document.createElement("a");
            // data.js で imagePath/linkPath を使っている場合の対応
            const pageUrl = item.linkPath ? fixPath(item.linkPath) : (item.link || "#");
            const imgUrl = item.imagePath ? fixPath(item.imagePath) : (item.image || "");

            link.href = pageUrl;
            link.className = "news-link reveal is-visible";

            link.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                    <span class="news-date">${item.date}</span>
                    <span class="news-tag-label">${item.category}</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 140px; gap: 20px;">
                    <div style="display:flex; flex-direction:column; justify-content:center;">
                        <h3 style="margin:0 0 8px; font-weight:900; font-size:1.2rem;">${item.title}</h3>
                        <p style="margin:0; font-size:0.9rem; color:var(--muted); line-height:1.6;">
                            ${item.desc || ""}
                        </p>
                    </div>
                    <div>
                        <img src="${imgUrl}" alt="" style="width:100%; height:100px; object-fit:cover; border-radius:8px;">
                    </div>
                </div>
            `;
            newsContainer.appendChild(link);
        });
    }


    /* -------------------------------------------------------
       3. 提携イベント一覧 (partner_events.html) の生成
       ------------------------------------------------------- */
    const partnerContainer = document.getElementById("partner-events-list-container");
    if (partnerContainer && typeof partnerEventsData !== 'undefined') {
        partnerEventsData.forEach(item => {
            const card = document.createElement("article");
            // 既存のcardスタイルを使いつつ、少しレイアウトを変えるか、newsに近い形式にする
            // ここでは index.html のイベントカード (article.card) のスタイルを流用してみる

            card.className = "card reveal is-visible";
            card.setAttribute("role", "listitem");

            // 画像パス補正
            const imgUrl = fixPath(item.image);
            // リンクパス補正
            const linkUrl = fixPath(item.link);
            const isExternal = linkUrl.startsWith('http');
            const targetAttr = isExternal ? 'target="_blank" rel="noopener"' : '';

            card.innerHTML = `
                <div class="card-top" style="background-image: url('${imgUrl}'); background-size: cover; background-position: center; height: 180px; border-radius: 8px 8px 0 0; position: relative;">
                   <!-- 画像エリア -->
                </div>
                <div style="padding: 1.5rem;">
                    <h3 class="card-title" style="margin-top:0;">${item.name}</h3>
                    <p class="card-desc" style="font-size: 0.9rem; color: var(--muted); margin-bottom: 1rem;">${item.desc}</p>

                    <dl class="meta">
                        <div>
                            <dt>日時</dt>
                            <dd>${item.date}</dd>
                        </div>
                        <div>
                            <dt>主催</dt>
                            <dd>${item.organizer}</dd>
                        </div>
                    </dl>

                    <div class="card-actions" style="margin-top: 1.5rem;">
                        <a class="more" href="${linkUrl}" ${targetAttr}>もっとみる→</a>
                    </div>
                </div>
            `;
            partnerContainer.appendChild(card);
        });
    }


    /* -------------------------------------------------------
       4. 関連リンク一覧 (links.html) の生成
       ------------------------------------------------------- */
    const linksContainer = document.getElementById("links-list-container");
    if (linksContainer && typeof linksData !== 'undefined') {
        linksData.forEach(item => {
            const link = document.createElement("a");
            link.href = item.url;
            link.target = "_blank";
            link.rel = "noopener";
            link.className = "news-link reveal is-visible"; // ニュースのスタイルを流用

            link.innerHTML = `
                <div style="display: flex; flex-direction: column; justify-content: center; padding: 10px 0;">
                    <h3 style="margin:0 0 8px; font-weight:900; font-size:1.2rem;">${item.title} 
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style="margin-left:4px; vertical-align:middle; color:var(--muted);">
                          <path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
                          <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
                        </svg>
                    </h3>
                    <p style="margin:0; font-size:0.9rem; color:var(--muted); line-height:1.6;">
                        ${item.desc || ""}
                    </p>
                    <div style="margin-top:8px; font-size:0.8rem; color:var(--a); word-break: break-all;">
                        ${item.url}
                    </div>
                </div>
            `;
            linksContainer.appendChild(link);
        });
    }


    /* -------------------------------------------------------
       4. ランダムピックアップ (index.html)
       ------------------------------------------------------- */
    const pickupContainer = document.getElementById("random-pickup-grid");
    if (pickupContainer && typeof membersData !== 'undefined') {
        // シャッフルして3人選ぶ
        const shuffled = membersData.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);

        selected.forEach((m, index) => {
            const a = document.createElement("a");
            a.className = "cheki-card reveal";
            a.href = fixPath(m.link);

            // Create container for image
            const visualDiv = document.createElement('div');
            visualDiv.className = "cheki-visual";

            // Just placeholder for structure
            a.appendChild(visualDiv);

            // Name label
            const nameDiv = document.createElement('div');
            nameDiv.className = "cheki-name";
            nameDiv.textContent = m.name;
            a.appendChild(nameDiv);

            pickupContainer.appendChild(a);

            // Initialize Switcher or Static Image
            let images = [];
            if (m.profileImages && m.profileImages.length > 0) {
                images = m.profileImages.map(p => fixPath(p));
            } else if (m.image) {
                images = [fixPath(m.image)];
            }

            if (images.length > 0) {
                // If multiple, interactive switcher without indicators
                if (images.length > 1) {
                    visualDiv.classList.add('profile-switcher');
                    // Ensure ProfileImageSwitcher is available
                    if (window.ProfileImageSwitcher) {
                        new ProfileImageSwitcher(visualDiv, images, { showIndicators: false });
                    } else {
                        // Fallback if class not loaded
                        visualDiv.innerHTML = `<img src="${images[0]}" alt="${m.name}" class="cheki-img"><span class="cheki-tag-badge">${m.tagLabel}</span>`;
                    }
                } else {
                    // Single image standard
                    visualDiv.innerHTML = `<img src="${images[0]}" alt="${m.name}" class="cheki-img"><span class="cheki-tag-badge">${m.tagLabel}</span>`;
                }

                // Add badge manually if switcher is active (switcher clears content)
                // But wait, switcher clears content. We need the badge ON TOP.
                // ProfileImageSwitcher appends track/indicators. We can append badge after.

                // Re-append badge
                const badge = document.createElement('span');
                badge.className = "cheki-tag-badge";
                badge.textContent = m.tagLabel;
                // Ensure z-index is higher than switcher slides (which are 1 or 2)
                badge.style.zIndex = "5";
                visualDiv.appendChild(badge);
            }

            setTimeout(() => a.classList.add('is-visible'), 100);
        });
    }

    /* -------------------------------------------------------
       5. ニュースカルーセル (index.html)
       ------------------------------------------------------- */
    const track = document.getElementById("news-carousel-track");
    if (track && typeof newsData !== 'undefined') {
        const carouselItems = newsData.slice(0, 5); // 最新5件

        carouselItems.forEach((item, i) => {
            const card = document.createElement("a");
            const pageUrl = item.linkPath ? fixPath(item.linkPath) : (item.link || "#");
            const imgUrl = item.imagePath ? fixPath(item.imagePath) : (item.image || "");

            card.href = pageUrl;
            card.className = "news-card-slide";
            card.innerHTML = `
                <img src="${imgUrl}" alt="">
                <div class="content">
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
                        <span class="news-date" style="margin:0;">${item.date}</span>
                        <span class="news-tag-label" style="margin:0;">${item.category}</span>
                    </div>
                    <div class="title">${item.title}</div>
                    <div style="font-size:0.85em; text-align:right; margin-top:auto; font-weight:bold;">もっとみる &rarr;</div>
                </div>
            `;
            track.appendChild(card);
        });

        // カルーセルの動作ロジック (既存のものを再利用)
        const initCarousel = () => {
            const prevBtn = document.getElementById("carousel-prev");
            const nextBtn = document.getElementById("carousel-next");
            const cards = Array.from(track.children);
            const total = cards.length;
            if (total === 0) return;

            let currentIndex = 0;

            const update = () => {
                cards.forEach((card, i) => {
                    card.classList.remove('is-active', 'is-prev', 'is-next', 'is-hidden');
                    const prevIndex = (currentIndex - 1 + total) % total;
                    const nextIndex = (currentIndex + 1) % total;

                    if (i === currentIndex) card.classList.add('is-active');
                    else if (i === prevIndex) card.classList.add('is-prev');
                    else if (i === nextIndex) card.classList.add('is-next');
                    else card.classList.add('is-hidden');
                });
            };
            update();

            prevBtn?.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + total) % total;
                update();
            });
            nextBtn?.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % total;
                update();
            });

            // Swipe
            let touchStartX = 0;
            let touchEndX = 0;
            track.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
            track.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                if (touchEndX < touchStartX - 50) { currentIndex = (currentIndex + 1) % total; update(); }
                if (touchEndX > touchStartX + 50) { currentIndex = (currentIndex - 1 + total) % total; update(); }
            }, { passive: true });
        };

        // カルーセル初期化実行
        initCarousel();
    }

})();


/* =========================================
   PEOPLE FILTERING SYSTEM (絞り込み)
   ※ HTML生成後に動作させる必要があるため、最後に配置
   ========================================= */
(function () {
    const searchInput = document.getElementById('people-search');
    const tagFilter = document.getElementById('people-tag-filter');

    if (!searchInput || !tagFilter) return;

    const applyPeopleFilter = () => {
        const query = (searchInput.value || '').trim().toLowerCase();
        const tag = tagFilter.value || 'all';

        const dividers = document.querySelectorAll('.section-divider');
        const allCards = document.querySelectorAll('.cheki-card');

        // 1. 各カードの表示判定
        allCards.forEach(card => {
            const name = (card.getAttribute('data-name') || '').toLowerCase();
            const tags = (card.getAttribute('data-tags') || '').toLowerCase();

            const matchesQuery = !query || name.includes(query);
            const matchesTag = tag === 'all' || tags.includes(tag.toLowerCase());

            if (matchesQuery && matchesTag) {
                card.style.display = '';
                // 生成時に is-visible を付けていますが、念のため
                card.classList.add('is-visible');
            } else {
                card.style.display = 'none';
            }
        });

        // 2. 空になったセクションを隠す
        dividers.forEach(divider => {
            const nextGrid = divider.nextElementSibling;
            if (nextGrid && nextGrid.classList.contains('cheki-grid')) {
                const visibleCards = Array.from(nextGrid.querySelectorAll('.cheki-card'))
                    .filter(c => c.style.display !== 'none');

                if (visibleCards.length > 0) {
                    divider.style.display = '';
                    nextGrid.style.display = '';
                } else {
                    divider.style.display = 'none';
                    nextGrid.style.display = 'none';
                }
            }
        });
    };

    searchInput.addEventListener('input', applyPeopleFilter);
    tagFilter.addEventListener('change', applyPeopleFilter);


    // 初期実行（生成された直後の状態にフィルタを適用）
    setTimeout(applyPeopleFilter, 100);
})();


/* =========================================
   GALLERY GENERATION & LIGHTBOX
   ========================================= */
(function () {
    const galleryContainer = document.getElementById("gallery-grid");
    if (galleryContainer && typeof galleryData !== 'undefined') {
        const fixPath = (path) => {
            if (!path) return "";
            if (path.match(/^(http|\/\/)/)) return path;
            let cleanPath = path.replace(/^\.\//, '');
            // Check if we are in gallery subdirectory (gallery/index.html) logic
            // This script.js is typically loaded from ../js/script.js relative to gallery/index.html
            // The paths in data.js are relative to root or specified as "assets/...".
            // Since gallery/index.html is one level deep, we usually need prepending "../"
            // But let's check current location.
            const isSubDir = window.location.pathname.includes("/gallery/");
            if (isSubDir && !cleanPath.startsWith("../")) {
                return "../" + cleanPath;
            }
            return isSubDir ? cleanPath : "./" + cleanPath;
        };

        galleryData.forEach((item, index) => {
            const card = document.createElement("article");
            card.className = "card reveal is-visible";
            card.style.cursor = "pointer";

            // Thumbnail is either explicit thumb or first image
            const thumbUrl = fixPath(item.thumb || (item.images && item.images[0]) || "");

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

    // Lightbox Logic
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
        if (!modal || !track || typeof galleryData === 'undefined') return;

        const item = galleryData[galleryIndex];
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

        const fixPath = (path) => {
            if (!path) return "";
            if (path.match(/^(http|\/\/)/)) return path;
            const cleanPath = path.replace(/^\.\//, '');
            const isSubDir = window.location.pathname.includes("/gallery/");
            if (isSubDir && !cleanPath.startsWith("../")) {
                return "../" + cleanPath;
            }
            return isSubDir ? cleanPath : "./" + cleanPath;
        };

        currentImages.forEach((src, i) => {
            const slide = document.createElement("div");
            slide.className = "gallery-slide";
            if (i === currentImageIndex) slide.classList.add("is-active");

            const img = document.createElement("img");
            img.src = fixPath(src);
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
        renderSlides(); // Re-render to clear zoom state simply
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
            // Check if we are zooming. If not, maybe allow swipe? (Swipe logic separate)
            // For now, if zoomScale > 1, allow pan.
            if (zoomScale <= 1) return;

            isDragging = true;
            startX = e.clientX - panX;
            startY = e.clientY - panY;
            e.preventDefault(); // prevent text selection
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
