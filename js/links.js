/**
 * links.js
 * Links list generation — platform card design
 * Depends on: data_links.js, utils.js
 */

(function () {

    /* -------------------------------------------------------
       Platform config
       ------------------------------------------------------- */
    const PLATFORM = {
        x: {
            badge: 'X / Twitter',
            cta: '今すぐフォロー',
            ctaStyle: 'background:#fff; color:#000;',
            glow: 'rgba(255,255,255,0.18)',
            bg: 'linear-gradient(145deg, #0d0d0d 0%, #1c1c1c 100%)',
            border: '1px solid rgba(255,255,255,0.13)',
            shadow: '0 24px 64px rgba(0,0,0,0.75)',
            iconBg: '#000',
            iconBorder: '1px solid rgba(255,255,255,0.18)',
            iconSvg: `<svg width="34" height="34" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>`,
        },
        vrchat: {
            badge: 'VRChat',
            cta: 'グループに参加',
            ctaStyle: 'background: linear-gradient(135deg, #1565c0, #42a5f5); color:#fff;',
            glow: 'rgba(66,165,245,0.28)',
            bg: 'linear-gradient(145deg, #070e1f 0%, #0d1e3c 100%)',
            border: '1px solid rgba(66,165,245,0.22)',
            shadow: '0 24px 64px rgba(7,14,31,0.88)',
            iconBg: 'transparent',
            iconBorder: 'none',
            iconStyle: 'border-radius: 22px; overflow: hidden; background: transparent;',
            iconSvg: `<img src="${window.fixPath ? window.fixPath('assets/icon/VRCicon.webp') : '../assets/icon/VRCicon.webp'}" alt="VRChat" style="width: 100%; height: 100%; object-fit: cover;">`,
        },
        youtube: {
            badge: 'YouTube',
            cta: 'チャンネル登録',
            ctaStyle: 'background: #ff0000; color:#fff;',
            glow: 'rgba(255,0,0,0.22)',
            bg: 'linear-gradient(145deg, #150000 0%, #2a0a0a 100%)',
            border: '1px solid rgba(255,0,0,0.2)',
            shadow: '0 24px 64px rgba(20,0,0,0.8)',
            iconBg: '#ff0000',
            iconBorder: 'none',
            iconSvg: `<svg width="34" height="34" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.2 31.2 0 0 0 24 12a31.2 31.2 0 0 0-.5-5.8zM9.75 15.5V8.5l6.25 3.5-6.25 3.5z"/>
            </svg>`,
        },
        discord: {
            badge: 'Discord',
            cta: 'サーバーに参加',
            ctaStyle: 'background: #5865f2; color:#fff;',
            glow: 'rgba(88,101,242,0.28)',
            bg: 'linear-gradient(145deg, #0b0e24 0%, #111835 100%)',
            border: '1px solid rgba(88,101,242,0.22)',
            shadow: '0 24px 64px rgba(11,14,36,0.88)',
            iconBg: '#5865f2',
            iconBorder: 'none',
            iconSvg: `<svg width="34" height="34" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.3 4.4a19.8 19.8 0 0 0-4.9-1.5.07.07 0 0 0-.08.04 13.8 13.8 0 0 0-.61 1.25 18.3 18.3 0 0 0-5.49 0 12.6 12.6 0 0 0-.62-1.25.07.07 0 0 0-.08-.04A19.7 19.7 0 0 0 3.68 4.4a.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .03.05 19.9 19.9 0 0 0 6 3.03.08.08 0 0 0 .08-.03c.46-.63.87-1.3 1.23-2a.08.08 0 0 0-.04-.11 13.1 13.1 0 0 1-1.87-.89.08.08 0 0 1-.01-.13c.13-.1.25-.2.37-.3a.07.07 0 0 1 .08-.01c3.93 1.79 8.18 1.79 12.06 0a.07.07 0 0 1 .08.01c.12.1.25.2.37.3a.08.08 0 0 1-.01.13 12.3 12.3 0 0 1-1.87.89.08.08 0 0 0-.04.11c.36.7.77 1.36 1.22 1.99a.08.08 0 0 0 .08.03 19.8 19.8 0 0 0 6-3.03.08.08 0 0 0 .03-.05c.5-5.18-.84-9.67-3.55-13.66a.06.06 0 0 0-.03-.03zM8.02 15.3c-1.18 0-2.16-1.08-2.16-2.42s.96-2.42 2.16-2.42c1.21 0 2.17 1.09 2.16 2.42 0 1.34-.96 2.42-2.16 2.42zm7.97 0c-1.18 0-2.16-1.08-2.16-2.42s.96-2.42 2.16-2.42c1.2 0 2.17 1.09 2.16 2.42 0 1.34-.95 2.42-2.16 2.42z"/>
            </svg>`,
        },
        default: {
            badge: 'LINK',
            cta: 'サイトを見る',
            ctaStyle: 'background: linear-gradient(135deg, #b88900, #cfaa6b); color:#1a1207;',
            glow: 'rgba(207,170,107,0.22)',
            bg: 'linear-gradient(145deg, #130e08 0%, #1e1710 100%)',
            border: '1px solid rgba(207,170,107,0.22)',
            shadow: '0 24px 64px rgba(0,0,0,0.65)',
            iconBg: 'rgba(207,170,107,0.15)',
            iconBorder: '1px solid rgba(207,170,107,0.35)',
            iconSvg: `<svg width="34" height="34" viewBox="0 0 24 24" fill="#cfaa6b" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
            </svg>`,
        },
    };

    function detectPlatform(url) {
        if (/x\.com|twitter\.com/i.test(url)) return 'x';
        if (/vrchat\.com/i.test(url)) return 'vrchat';
        if (/youtube\.com|youtu\.be/i.test(url)) return 'youtube';
        if (/discord\.gg|discord\.com/i.test(url)) return 'discord';
        return 'default';
    }

    function createPlatformCard(item) {
        const pKey = item.type || detectPlatform(item.url);
        const p = PLATFORM[pKey] || PLATFORM.default;

        const card = document.createElement('a');
        card.href = item.url;
        card.target = '_blank';
        card.rel = 'noopener';
        card.className = 'link-platform-card reveal';
        card.style.cssText = `background:${p.bg}; border:${p.border}; box-shadow:${p.shadow}; --lc-glow:${p.glow};`;

        const ctaText = item.cta || p.cta;

        card.innerHTML = `
            <div class="link-card-icon" style="background:${p.iconBg}; border:${p.iconBorder || 'none'}; ${p.iconStyle || ''}">
                ${p.iconSvg}
            </div>
            <span class="link-card-badge">${p.badge}</span>
            <h3 class="link-card-title">${item.title}</h3>
            <p class="link-card-desc">${item.desc || ''}</p>
            <span class="link-card-cta" style="${p.ctaStyle}">
                ${ctaText}<span class="link-card-cta-arrow"> →</span>
            </span>
        `;
        return card;
    }

    /* -------------------------------------------------------
       ページ構造構築
       ------------------------------------------------------- */
    const main = document.getElementById('main');
    if (main) {
        main.insertAdjacentHTML('beforeend', `
            <section class="section links-section">
                <div class="container">
                    <header class="section-head reveal">
                        <h1 class="section-title cafe-signboard">関連リンク</h1>
                        <p class="section-lead">最新情報の受け取り・コミュニティへの参加はこちらから！</p>
                    </header>
                    <div id="links-grid" class="links-grid"></div>
                    <div style="margin-top: 48px; text-align: center;">
                        <a href="../index.html" class="btn btn--primary">トップへ戻る</a>
                    </div>
                </div>
            </section>
        `);
    }

    /* -------------------------------------------------------
       カード生成
       ------------------------------------------------------- */
    const grid = document.getElementById('links-grid');
    if (grid && window.linksData) {
        const visible = window.linksData.filter(item => window.shouldShowItem(item));
        visible.forEach(item => grid.appendChild(createPlatformCard(item)));

        // スタガーアニメーション
        requestAnimationFrame(() => {
            grid.querySelectorAll('.link-platform-card').forEach((card, i) => {
                setTimeout(() => card.classList.add('is-visible'), i * 140);
            });
        });
    }

})();
