/**
 * kv-scroll.js
 * Scroll-driven KV circle → full-screen expansion.
 * Inspired by 超かぐや姫 official site.
 *
 * アーキテクチャ:
 *   #kv-scroll-zone (height: 200vh) の中に #hero-section (sticky top:0) を配置。
 *   scrollY / travel (= 100vh) で rawP [0..1] を算出し、
 *   clip-path: circle(R%) を 38% → 150% へ easeInOutQuad で補間する。
 */
(function () {
    'use strict';

    // prefers-reduced-motion: アニメーション無効化
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const hero    = document.getElementById('hero-section');
    const zone    = document.getElementById('kv-scroll-zone');
    const content = document.querySelector('.hero-content');
    if (!hero || !zone) return;

    // -------------------------------------------------------
    // Easing & Lerp
    // -------------------------------------------------------
    function easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    const RADIUS_START = 38;  // 初期円半径 (%)
    const RADIUS_END   = 150; // 終端（四隅を完全に覆う値）

    let ticking = false;

    // -------------------------------------------------------
    // Update loop (rAF)
    // -------------------------------------------------------
    function update() {
        // travel = zone 全体の高さ - viewport 高さ = hero が sticky でいられる距離
        const travel = zone.offsetHeight - window.innerHeight;
        if (travel <= 0) {
            // ゾーンが viewport より小さい（ありえないが念のため）
            hero.style.clipPath = 'none';
            ticking = false;
            return;
        }

        const rawP  = Math.max(0, Math.min(1, window.scrollY / travel));
        const eased = easeInOutQuad(rawP);
        const radius = lerp(RADIUS_START, RADIUS_END, eased);

        // circle 拡張（rawP=1 で clip-path 解除 → 完全全画面）
        hero.style.clipPath = rawP >= 1
            ? 'none'
            : `circle(${radius.toFixed(1)}% at 50% 50%)`;

        // .hero-content フェードアウト: rawP 0 → 0.4 の間で opacity 1 → 0
        if (content) {
            const opacity = Math.max(0, 1 - rawP / 0.4);
            content.style.opacity = opacity.toFixed(3);
        }

        ticking = false;
    }

    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    // 初期状態を適用
    update();
})();
