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

/* =========================================
   RANDOM PICKUP SYSTEM
   ========================================= */
(function () {
    const pickupContainer = document.getElementById("random-pickup-grid");
    if (!pickupContainer) return;

    // Member Data Source
    const members = [
        { name: "てん", tag: "店長", img: "./assets/member/てん/profile.png", link: "./member/profile_ten.html" },
        { name: "レイノ", tag: "飼育", img: "./assets/member/レイノ/profile.png", link: "./member/profile_rayno.html" },
        { name: "犬も猫も好き", tag: "副店長", img: "./assets/member/犬も猫も好き/profile.png", link: "./member/profile_inumonekomosuki.html" },
        { name: "あまおう", tag: "妖怪", img: "./assets/member/あまおう/profile.png", link: "./member/profile_amaou.html" }
    ];

    // Shuffle and pick 3
    const shuffled = members.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    // Render
    selected.forEach(m => {
        const a = document.createElement("a");
        a.className = "cheki-card reveal";
        a.href = m.link;
        a.innerHTML = `
            <div class="cheki-visual">
                <img src="${m.img}" alt="${m.name}" class="cheki-img">
                <span class="cheki-tag-badge">${m.tag}</span>
            </div>
            <div class="cheki-name">${m.name}</div>
        `;
        pickupContainer.appendChild(a);

        // Trigger generic reveal if IntersectionObserver supports it, 
        // Trigger generic reveal if IntersectionObserver supports it,
        // or just add is-visible immediately for simplicity in this script scope
        setTimeout(() => a.classList.add('is-visible'), 100);
    });
})();

/* =========================================
   PEOPLE FILTERING SYSTEM
   ========================================= */
(function () {
    const searchInput = document.getElementById('people-search');
    const tagFilter = document.getElementById('people-tag-filter');

    // If these elements don't exist, we are not on the people page
    if (!searchInput || !tagFilter) return;

    const applyPeopleFilter = () => {
        const query = (searchInput.value || '').trim().toLowerCase();
        const tag = tagFilter.value || 'all';

        // Select all card containers (grids) and dividers
        const dividers = document.querySelectorAll('.section-divider');
        const allCards = document.querySelectorAll('.cheki-card');

        // 1. Filter individual cards
        allCards.forEach(card => {
            const name = (card.getAttribute('data-name') || '').toLowerCase();
            const tags = (card.getAttribute('data-tags') || '').toLowerCase();

            // Check matches
            const matchesQuery = !query || name.includes(query);
            // Partial match for tags (e.g. selecting '区画長' matches '飼育区画長')
            const matchesTag = tag === 'all' || tags.includes(tag.toLowerCase());

            if (matchesQuery && matchesTag) {
                card.style.display = ''; // Show
                card.classList.add('is-visible'); // Ensure visible
            } else {
                card.style.display = 'none'; // Hide
            }
        });

        // 2. Hide empty sections (divider + grid)
        // This relies on the structure: divider followed by grid
        dividers.forEach(divider => {
            const nextGrid = divider.nextElementSibling;
            if (nextGrid && nextGrid.classList.contains('cheki-grid')) {
                // Check if any visible cards in this grid
                const visibleCards = Array.from(nextGrid.querySelectorAll('.cheki-card')).filter(c => c.style.display !== 'none');

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

    // Run once on load
    applyPeopleFilter();
})();

/* =========================================
   NEWS CAROUSEL SYSTEM
   ========================================= */
(function () {
    const track = document.getElementById("news-carousel-track");
    const prevBtn = document.getElementById("carousel-prev");
    const nextBtn = document.getElementById("carousel-next");

    if (!track) return;

    // News Data (Newest First)
    const newsItems = [
        { title: "ホームページを改装しました", date: "2026.01.20", tag: "お知らせ", img: "./assets/news/test2026-01-20.png", link: "./news/news_20260120.html" },
        { title: "ダミーニュース4", date: "2026.01.20", tag: "お知らせ", img: "./assets/news/test2026-01-20.png", link: "./news/news_dummy4.html" },
        { title: "ダミーニュース3", date: "2026.01.20", tag: "お知らせ", img: "./assets/news/test2026-01-20.png", link: "./news/news_dummy3.html" },
        { title: "ダミーニュース2", date: "2026.01.20", tag: "お知らせ", img: "./assets/news/test2026-01-20.png", link: "./news/news_dummy2.html" },
        { title: "ダミーニュース1", date: "2026.01.20", tag: "お知らせ", img: "./assets/news/test2026-01-20.png", link: "./news/news_dummy1.html" }
    ];

    let currentIndex = 0;

    // Initial Build
    newsItems.forEach((item, i) => {
        const card = document.createElement("a");
        card.href = item.link;
        card.className = "news-card-slide";
        card.innerHTML = `
            <img src="${item.img}" alt="">
            <div class="content">
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
                    <span class="news-date" style="margin:0;">${item.date}</span>
                    <span class="news-tag-label" style="margin:0;">${item.tag}</span>
                </div>
                <div class="title">${item.title}</div>
                <div style="font-size:0.85em; text-align:right; margin-top:auto; font-weight:bold;">もっとみる &rarr;</div>
            </div>
        `;
        track.appendChild(card);
    });

    const cards = Array.from(track.children);
    const total = cards.length;

    const update = () => {
        cards.forEach((card, i) => {
            // Remove all state classes
            card.classList.remove('is-active', 'is-prev', 'is-next', 'is-hidden');

            // Calculate indices
            const prevIndex = (currentIndex - 1 + total) % total;
            const nextIndex = (currentIndex + 1) % total;

            if (i === currentIndex) {
                card.classList.add('is-active');
            } else if (i === prevIndex) {
                card.classList.add('is-prev');
            } else if (i === nextIndex) {
                card.classList.add('is-next');
            } else {
                card.classList.add('is-hidden');
            }
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

    // Swipe Support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    const handleSwipe = () => {
        const threshold = 50;
        if (touchEndX < touchStartX - threshold) {
            // Swipe Left -> Next
            currentIndex = (currentIndex + 1) % total;
            update();
        }
        if (touchEndX > touchStartX + threshold) {
            // Swipe Right -> Prev
            currentIndex = (currentIndex - 1 + total) % total;
            update();
        }
    };
})();
