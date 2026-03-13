/**
 * js/common/reveal.js
 * Controls scroll-linked appearance animations via IntersectionObserver.
 */

export function initRevealAnimations() {
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
}
