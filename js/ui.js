/**
 * ui.js
 * Common UI interactions (Menu, Header, Reveal, etc.)
 */

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

    // Reveal Animation
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

    // To Top Button - Prevent overlap with footer
    const toTopBtn = document.querySelector(".to-top");
    const footer = document.querySelector(".site-footer");

    if (toTopBtn && footer) {
        const adjustToTop = () => {
            const footerRect = footer.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // Calculate how much of the footer is visible
            const footerVisibleHeight = Math.max(0, viewportHeight - footerRect.top);

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
