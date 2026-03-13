/**
 * js/common/menu.js
 * Controls the mobile navigation menu overlay.
 */

export function initMenu() {
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
}
