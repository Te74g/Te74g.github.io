/**
 * ui.js
 * Common UI interactions (Menu, Header, Reveal, etc.)
 */

import { renderLayout } from './app/layout.js';
import { getSiteConfig } from './app/data.js';

export async function initUI() {
    // 1. Build common layout (header/footer) automatically
    await renderLayout();

    // 2. メンテナンスモードリダイレクト (maintenance page is skipped inside)
    if (!window.location.pathname.includes('maintenance.html')) {
        const config = getSiteConfig();
        const bypass = sessionStorage.getItem('maintenanceBypass') === 'true' || sessionStorage.getItem('debugMode') === 'true';

        if (config?.maintenanceMode && !bypass) {
            const basePath = window.fixPath ? window.fixPath('maintenance.html') : './maintenance.html';
            window.location.href = basePath;
            return; // Stop execution if redirecting
        }
    }


    const prefersReducedMotion =
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Handle BFCache (Browser Back/Forward) animation re-trigger
    window.addEventListener('pageshow', (event) => {
        if (event.persisted && !prefersReducedMotion) {
            // Force a reflow to restart the CSS animation
            document.body.style.animation = 'none';
            void document.body.offsetHeight; /* trigger reflow */
            document.body.style.animation = null;
        }
    });

    // Footer year
    const year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());

    // Header elevation
    const header = document.querySelector('[data-elevate]');
    const setElevated = () => {
        if (!header) return;
        header.classList.toggle('is-elevated', window.scrollY > 6);
    };
    window.addEventListener('scroll', setElevated, { passive: true });
    setElevated();

    // MENU overlay
    const menu = document.getElementById('site-nav');
    const openBtn = document.querySelector('.menu-btn');
    const closeBtn = document.querySelector('.menu-close');

    const openMenu = () => {
        if (!menu || !openBtn) return;
        menu.classList.add('is-open');
        menu.setAttribute('aria-hidden', 'false');
        openBtn.setAttribute('aria-expanded', 'true');
        document.body.classList.add('nav-open');
    };

    const closeMenu = () => {
        if (!menu || !openBtn) return;
        menu.classList.remove('is-open');
        menu.setAttribute('aria-hidden', 'true');
        openBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
    };

    const isOpen = () => menu && menu.classList.contains('is-open');

    openBtn?.addEventListener('click', () => (isOpen() ? closeMenu() : openMenu()));
    closeBtn?.addEventListener('click', closeMenu);

    // Close on ESC / outside click / link click
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen()) closeMenu();
    });

    menu?.addEventListener('click', (e) => {
        const t = e.target;
        if (!(t instanceof Element)) return;

        // click outside inner => close
        if (t.classList.contains('menu')) closeMenu();

        // click a link => close
        if (t.closest('a')) closeMenu();
    });

    // Reveal Animation
    // transition ベースのため、is-visible が付かないと opacity:0 のまま。
    // home.js / people.js 等が非同期で挿入する .reveal 要素も拾えるよう
    // MutationObserver でフォールバックする。
    let revealIo = null;

    const revealEl = (el) => {
        if (el.classList.contains('is-visible')) return; // 二重付与防止
        if (prefersReducedMotion) {
            el.classList.add('is-visible');
        } else if (revealIo) {
            revealIo.observe(el);
        } else {
            el.classList.add('is-visible');
        }
    };

    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        revealIo = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.add('is-visible');
                        revealIo.unobserve(e.target); // 可視化後は監視解除
                    }
                });
            },
            { threshold: 0.14 }
        );
    }

    // 静的要素（スクリプト実行時点でDOMにある要素）
    document.querySelectorAll('.reveal').forEach(revealEl);

    // 動的挿入要素（home.js / people.js 等が後から追加する .reveal 要素）
    if ('MutationObserver' in window) {
        new MutationObserver((mutations) => {
            mutations.forEach((m) => {
                m.addedNodes.forEach((node) => {
                    if (node.nodeType !== 1) return;
                    if (node.classList?.contains('reveal')) revealEl(node);
                    node.querySelectorAll?.('.reveal').forEach(revealEl);
                });
            });
        }).observe(document.body, { childList: true, subtree: true });
    }

    // Throttle utility: fn を limit ms に1回だけ実行する
    const throttle = (fn, limit) => {
        let lastRun = 0;
        return function (...args) {
            const now = Date.now();
            if (now - lastRun >= limit) {
                lastRun = now;
                fn.apply(this, args);
            }
        };
    };

    // To Top Button - Prevent overlap with footer
    const toTopBtn = document.querySelector('.to-top');
    const footer = document.querySelector('.site-footer');

    if (toTopBtn && footer) {
        const adjustToTop = () => {
            const footerRect = footer.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // Calculate how much of the footer is visible
            const footerVisibleHeight = Math.max(0, viewportHeight - footerRect.top);

            if (footerVisibleHeight > 0) {
                toTopBtn.style.bottom = `${24 + footerVisibleHeight}px`;
            } else {
                toTopBtn.style.bottom = '24px';
            }
        };

        const throttledAdjust = throttle(adjustToTop, 100);
        window.addEventListener('scroll', throttledAdjust, { passive: true });
        window.addEventListener('resize', throttledAdjust, { passive: true });
        adjustToTop(); // init
    }
}
