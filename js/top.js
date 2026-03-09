/**
 * top.js
 * New top page engine — scroll-linked KV morph + data injection + minimal UI
 *
 * Standalone: does NOT load ui.js (which triggers maintenanceMode redirect).
 * Provides: header elevation, menu toggle, footer year, scroll morph, data inject.
 * Depends on (loaded before this file): utils.js, data_site.js, data_members.js,
 *   data_news.js, common-layout.js (renderLayout already called).
 */

(function () {
    'use strict';

    /* =============================================
       §0. Math utilities
       ============================================= */

    function clamp(v, lo, hi) {
        return v < lo ? lo : v > hi ? hi : v;
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    /**
     * Sub-range progress: maps global p [0,1] → local t [0,1] for range [a, b].
     * Returns 0 before a, 1 after b.
     */
    function subP(p, a, b) {
        return clamp((p - a) / (b - a), 0, 1);
    }

    /**
     * Ease-out expo — approximates cubic-bezier(0.22, 1, 0.36, 1).
     * Front-loads motion: rapid start, gradual settle.
     */
    function easeOutExpo(t) {
        return t === 0 ? 0 : t === 1 ? 1 : 1 - Math.pow(2, -9 * t);
    }

    /* =============================================
       §1. Minimal UI (subset of ui.js, no maintenance check)
       ============================================= */

    // Footer year
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    // Header elevation on scroll
    const header = document.querySelector('[data-elevate]');
    const syncElevation = function () {
        if (!header) return;
        header.classList.toggle('is-elevated', window.scrollY > 6);
    };
    window.addEventListener('scroll', syncElevation, { passive: true });
    syncElevation();

    // Menu overlay toggle
    const navEl    = document.getElementById('site-nav');
    const openBtn  = document.querySelector('.menu-btn');
    const closeBtn = document.querySelector('.menu-close');

    var menuOpen = false;

    function openMenu() {
        if (!navEl || !openBtn) return;
        menuOpen = true;
        navEl.classList.add('is-open');
        navEl.setAttribute('aria-hidden', 'false');
        openBtn.setAttribute('aria-expanded', 'true');
        document.body.classList.add('nav-open');
    }

    function closeMenu() {
        if (!navEl || !openBtn) return;
        menuOpen = false;
        navEl.classList.remove('is-open');
        navEl.setAttribute('aria-hidden', 'true');
        openBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
    }

    if (openBtn) {
        openBtn.addEventListener('click', function () {
            menuOpen ? closeMenu() : openMenu();
        });
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMenu);
    }
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menuOpen) closeMenu();
    });
    if (navEl) {
        navEl.addEventListener('click', function (e) {
            var t = e.target;
            if (!(t instanceof Element)) return;
            if (t.classList.contains('menu')) closeMenu();
            if (t.closest('a')) closeMenu();
        });
    }

    // To-top button: avoid footer overlap (mirror of ui.js behaviour)
    var toTopBtn = document.querySelector('.to-top');
    var footerEl = document.querySelector('.site-footer');
    if (toTopBtn && footerEl) {
        var lastBottom = '';
        var adjustToTop = function () {
            var footerTop = footerEl.getBoundingClientRect().top;
            var vh = window.innerHeight;
            var overlap = Math.max(0, vh - footerTop);
            var next = (overlap > 0 ? 24 + overlap : 24) + 'px';
            if (next !== lastBottom) {
                toTopBtn.style.bottom = next;
                lastBottom = next;
            }
        };
        window.addEventListener('scroll', adjustToTop, { passive: true });
        window.addEventListener('resize', adjustToTop, { passive: true });
        adjustToTop();
    }

    /* =============================================
       §2. Data injection helpers
       ============================================= */

    var isDebug = sessionStorage.getItem('debugMode') === 'true';
    var fp = window.fixPath || function (p) { return p; };

    /**
     * 2a. Hero KV — reads heroImages from siteConfig.
     * Image paths come from data_site.js; never hardcoded here.
     */
    function initHeroKV() {
        var cfg = window.siteConfig;
        if (!cfg) return;

        // KV character image
        var kvImg = document.getElementById('top-kv-img');
        if (kvImg && cfg.heroImages && cfg.heroImages.character) {
            kvImg.src = fp(cfg.heroImages.character);
        }

        // Logo (theme-aware)
        var logoImg = document.getElementById('top-logo-img');
        if (logoImg && cfg.heroImages) {
            var isDark = document.documentElement.classList.contains('dark');
            var logoPath = isDark
                ? (cfg.heroImages.logoDark || cfg.heroImages.logo)
                : cfg.heroImages.logo;
            if (logoPath) logoImg.src = fp(logoPath);
        }

        // Stage background (low-res texture behind the KV)
        var stageBg = document.getElementById('top-stage-bg');
        if (stageBg && cfg.heroImages && cfg.heroImages.background) {
            stageBg.style.backgroundImage = 'url("' + fp(cfg.heroImages.background) + '")';
        }

        // Random subtitle from heroSubtitle array
        var subtitleEl = document.getElementById('top-subtitle');
        if (subtitleEl && Array.isArray(cfg.heroSubtitle) && cfg.heroSubtitle.length) {
            var subs = cfg.heroSubtitle;
            subtitleEl.textContent = subs[Math.floor(Math.random() * subs.length)];
        }
    }

    /**
     * Build a single news card HTML string.
     * isMain: true → large card (grid-column span)
     */
    function buildNewsCard(item, isMain) {
        var imgPath = item.imagePath ? fp(item.imagePath) : null;
        var imgHtml = imgPath
            ? '<img class="top-news-card__img" src="' + imgPath + '" alt="' + escHtml(item.title) + '" loading="lazy">'
            : '<div class="top-news-card__img-placeholder" aria-hidden="true">✦</div>';

        var href = fp('news/');

        var descHtml = (isMain && item.desc)
            ? '<p class="top-news-card__desc">' + escHtml(item.desc) + '</p>'
            : '';

        return '<a class="top-news-card ' + (isMain ? 'top-news-card--main' : 'top-news-card--side') + ' reveal" href="' + href + '">'
            + '<div class="top-news-card__img-wrap">' + imgHtml + '</div>'
            + '<div class="top-news-card__body">'
            +   '<div class="top-news-card__meta">'
            +     '<span class="top-news-card__category">' + escHtml(item.category || 'お知らせ') + '</span>'
            +     '<span class="top-news-card__date">' + escHtml(item.date || '') + '</span>'
            +   '</div>'
            +   '<div class="top-news-card__title">' + escHtml(item.title) + '</div>'
            +   descHtml
            + '</div>'
            + '</a>';
    }

    /**
     * 2b. Latest news — injects into hero layer AND fallback section.
     * If 0 visible items: hides both elements (Concept繰り上がり).
     */
    function initLatest() {
        if (!window.newsData) return;

        var visible = window.newsData.filter(function (n) {
            return isDebug || !n.hidden;
        });
        var items = visible.slice(0, 3);

        var heroLatestEl  = document.getElementById('top-latest-hero');
        var heroCardsEl   = document.getElementById('top-latest-cards');
        var sectionEl     = document.getElementById('top-latest-section');
        var sectionCards  = document.getElementById('top-latest-section-cards');

        if (items.length === 0) {
            // 0件: Latest両方を非表示（Concept が直後になる）
            if (heroLatestEl) heroLatestEl.style.display = 'none';
            if (sectionEl)    sectionEl.style.display = 'none';
            return;
        }

        var html = items.map(function (item, i) {
            return buildNewsCard(item, i === 0);
        }).join('');

        if (heroCardsEl)  heroCardsEl.innerHTML  = html;
        if (sectionCards) {
            // Set column count to match actual item count (1→1col, 2→2col, 3→3col)
            sectionCards.style.setProperty('--latest-section-cols', String(items.length));
            sectionCards.innerHTML = html;
        }
    }

    /**
     * 2c. Cast Preview — 4 members passing revealLevel ≥ 3 + visibility checks.
     * Replicates filter logic from home.js / people.js.
     */
    function initCastPreview() {
        var grid = document.getElementById('top-cast-grid');
        if (!grid || !window.membersData) return;

        var castConfig   = (window.siteConfig && window.siteConfig.castDisplay) || {};
        var allowedRoles = ['店長', '副店長', '飼育', '野生', '妖怪'];

        var filtered = window.membersData.filter(function (m) {
            if (allowedRoles.indexOf(m.tagLabel) === -1) return false;
            if (!isDebug) {
                if (window.isMemberVisible && !window.isMemberVisible(m, castConfig)) return false;
                if (window.shouldShowItem  && !window.shouldShowItem(m))               return false;
            }
            var level = window.getRevealLevel ? window.getRevealLevel(m) : 3;
            return level >= 3; // Cast Preview: fully public members only
        });

        var preview = filtered.slice(0, 4);

        if (preview.length === 0) {
            var castSection = document.getElementById('top-cast');
            if (castSection) castSection.style.display = 'none';
            return;
        }

        var placeholder = fp(
            (castConfig.placeholderImage) || 'assets/member/silhouette.webp'
        );

        var html = preview.map(function (m) {
            var images  = m.profileImages || [];
            var imgSrc  = images[0] ? fp(images[0]) : placeholder;
            var href    = fp('cast/' + m.id + '/');
            var name    = m.pickupName || m.name;
            var label   = m.tagLabel || '';
            return '<a class="top-cast-card reveal" href="' + href + '">'
                + '<div class="top-cast-card__img-wrap">'
                +   '<img class="top-cast-card__img" src="' + imgSrc + '" alt="' + escHtml(name) + '" loading="lazy">'
                + '</div>'
                + '<div class="top-cast-card__name">' + escHtml(name) + '</div>'
                + '<div class="top-cast-card__label">' + escHtml(label) + '</div>'
                + '</a>';
        }).join('');

        grid.innerHTML = html;
    }

    /**
     * 2d. Concept — injects aboutSection.text from siteConfig.
     * Text is read-only from data (文言改変禁止).
     */
    function initConcept() {
        var blocksEl = document.getElementById('top-concept-blocks');
        if (!blocksEl) return;
        var texts = window.siteConfig && window.siteConfig.aboutSection && window.siteConfig.aboutSection.text;
        if (!Array.isArray(texts) || texts.length === 0) return;

        blocksEl.innerHTML = texts.map(function (t) {
            return '<p class="top-concept__block">' + escHtml(t) + '</p>';
        }).join('');
    }

    /** Minimal HTML escaper for text-only insertion */
    function escHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /* =============================================
       §3. Reveal observer (for sections below hero)
       ============================================= */

    function initReveal() {
        if (!('IntersectionObserver' in window)) {
            // Fallback: show immediately
            document.querySelectorAll('.reveal').forEach(function (el) {
                el.classList.add('is-visible');
            });
            return;
        }

        var revealIo = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    e.target.classList.add('is-visible');
                    revealIo.unobserve(e.target);
                }
            });
        }, { threshold: 0.12 });

        document.querySelectorAll('.reveal').forEach(function (el) {
            revealIo.observe(el);
        });

        // Watch for dynamically injected .reveal nodes (cast cards, news cards)
        if ('MutationObserver' in window) {
            new MutationObserver(function (mutations) {
                mutations.forEach(function (m) {
                    m.addedNodes.forEach(function (node) {
                        if (node.nodeType !== 1) return;
                        if (node.classList && node.classList.contains('reveal')) {
                            revealIo.observe(node);
                        }
                        if (node.querySelectorAll) {
                            node.querySelectorAll('.reveal').forEach(function (el) {
                                revealIo.observe(el);
                            });
                        }
                    });
                });
            }).observe(document.body, { childList: true, subtree: true });
        }
    }

    /* =============================================
       §4. Reduced-motion path
       ============================================= */

    var prefersReducedMotion =
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Always run data injection regardless of motion preference
    initHeroKV();
    initLatest();
    initCastPreview();
    initConcept();

    if (prefersReducedMotion) {
        // Show static fallback Latest section (CSS hides it by default)
        var latestSection = document.getElementById('top-latest-section');
        if (latestSection) {
            latestSection.removeAttribute('aria-hidden');
            latestSection.style.display = 'block';
        }
        // Hero Latest (in-hero) stays hidden via CSS
        // Hero remains at 100vh (CSS handles this via @media prefers-reduced-motion)
        initReveal();
        return; // Skip morph engine
    }

    /* =============================================
       §5. Scroll-linked morph engine
       Uses requestAnimationFrame ticking pattern.
       CSS custom properties are the only interface to CSS.
       ============================================= */

    var heroEl          = document.getElementById('top-hero');
    var kvEl            = document.getElementById('top-kv');
    var overlayEl       = document.querySelector('.top-hero__overlay');
    var copyEl          = document.getElementById('top-copy');
    var actionsEl       = document.getElementById('top-actions');
    var scrollcueEl     = document.getElementById('top-scrollcue');
    var latestHeroEl    = document.getElementById('top-latest-hero');
    var latestHeadingEl = document.getElementById('top-latest-heading');
    var latestCardsEl   = document.getElementById('top-latest-cards');

    if (!heroEl || !kvEl) {
        // DOM not ready or elements missing — still init reveal
        initReveal();
        return;
    }

    var ticking    = false;
    var lastP      = -1;
    var lastMobile = null;

    function isMobile() {
        return window.innerWidth < 769;
    }

    function updateMorph() {
        var scrollY     = window.scrollY;
        var heroTop     = heroEl.offsetTop;
        var heroH       = heroEl.offsetHeight;   // 220vh in px
        var vh          = window.innerHeight;
        var scrollRange = heroH - vh;

        // Global scroll progress p ∈ [0, 1]
        var rawP = scrollRange > 0 ? (scrollY - heroTop) / scrollRange : 0;
        var p    = clamp(rawP, 0, 1);

        var mobile = isMobile();

        // Skip if nothing changed
        if (Math.abs(p - lastP) < 0.00015 && mobile === lastMobile) {
            ticking = false;
            return;
        }
        lastP      = p;
        lastMobile = mobile;

        /* --------------------------------------------------
           KV transform — eased sub-range 0→0.58
           Desktop: scale 1→0.56, tx 0→-420px, ty 0→-250px
           Mobile:  scale 1→0.64, ty 0→-190px (no tx)
        -------------------------------------------------- */
        var kvRaw  = subP(p, 0, 0.58);
        var kvEase = easeOutExpo(kvRaw);

        if (mobile) {
            var mScale  = lerp(1.0,  0.64, kvEase);
            var mTy     = lerp(0,  -190,   kvEase);
            var mRadius = lerp(20,  14,    kvEase);
            kvEl.style.setProperty('--kv-scale',  mScale);
            kvEl.style.setProperty('--kv-tx',     '0px');
            kvEl.style.setProperty('--kv-ty',     mTy + 'px');
            kvEl.style.setProperty('--kv-radius', mRadius + 'px');
        } else {
            var dScale  = lerp(1.0,  0.56, kvEase);
            var dTx     = lerp(0,  -420,   kvEase);
            var dTy     = lerp(0,  -250,   kvEase);
            var dRadius = lerp(28,  18,    kvEase);
            kvEl.style.setProperty('--kv-scale',  dScale);
            kvEl.style.setProperty('--kv-tx',     dTx + 'px');
            kvEl.style.setProperty('--kv-ty',     dTy + 'px');
            kvEl.style.setProperty('--kv-radius', dRadius + 'px');
        }

        /* --------------------------------------------------
           Dark overlay — linear sub-range 0.18→0.58
        -------------------------------------------------- */
        if (overlayEl) {
            overlayEl.style.setProperty(
                '--overlay-opacity',
                lerp(0, 0.44, subP(p, 0.18, 0.58))
            );
        }

        /* --------------------------------------------------
           Copy + Actions fade out — sub-range 0→0.28
        -------------------------------------------------- */
        var copyT  = subP(p, 0, 0.28);
        var copyOp = lerp(1, 0, copyT);
        var copyTy = lerp(0, -24, copyT) + 'px';

        if (copyEl) {
            copyEl.style.setProperty('--copy-opacity', copyOp);
            copyEl.style.setProperty('--copy-ty',      copyTy);
        }
        if (actionsEl) {
            actionsEl.style.setProperty('--copy-opacity', copyOp);
            actionsEl.style.setProperty('--copy-ty',      copyTy);
        }

        /* --------------------------------------------------
           Scroll cue fade out — sub-range 0→0.20
        -------------------------------------------------- */
        if (scrollcueEl) {
            scrollcueEl.style.setProperty(
                '--scrollcue-opacity',
                lerp(1, 0, subP(p, 0, 0.20))
            );
        }

        /* --------------------------------------------------
           Latest (in-hero) — enable pointer events when visible
        -------------------------------------------------- */
        if (latestHeroEl) {
            latestHeroEl.style.setProperty(
                '--latest-events',
                p > 0.36 ? 'auto' : 'none'
            );
        }

        /* --------------------------------------------------
           Latest heading fade in — sub-range 0.32→0.46
        -------------------------------------------------- */
        if (latestHeadingEl) {
            var lhT = subP(p, 0.32, 0.46);
            latestHeadingEl.style.setProperty('--lh-opacity', lerp(0, 1, lhT));
            latestHeadingEl.style.setProperty('--lh-ty',      lerp(32, 0, lhT) + 'px');
        }

        /* --------------------------------------------------
           Latest cards fade in — sub-range 0.40→0.56
        -------------------------------------------------- */
        if (latestCardsEl) {
            var lcT = subP(p, 0.40, 0.56);
            latestCardsEl.style.setProperty('--lc-opacity', lerp(0, 1, lcT));
            latestCardsEl.style.setProperty('--lc-ty',      lerp(40, 0, lcT) + 'px');
        }

        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(updateMorph);
        }
    }

    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick, { passive: true });

    // Initial paint
    updateMorph();

    /* =============================================
       §6. Reveal observer for static sections
       ============================================= */
    initReveal();

})();
