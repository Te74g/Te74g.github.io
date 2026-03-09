/**
 * common-layout.js
 * 共通ヘッダー・フッターを動的に生成するためのスクリプト
 */

(function () {

  // =======================================================
  // MENU
  // [jp, en, slug]
  // =======================================================
  const menus = [
    ['ニュース',    'NEWS',     'news/'],
    ['キャスト紹介', 'CAST',    'cast/'],
    ['ギャラリー',  'GALLERY',  'gallery/'],
    ['提携イベント', 'PARTNER', 'partner/'],
    ['関連リンク',  'LINKS',    'links/'],
    ['合言葉',     'AIKOTOBA', 'aikotoba/'],
  ];

  // =======================================================
  // OFFICIAL SNS
  // [label, slug, url]
  // =======================================================
  const sns = [
    ['X',      'x',      'https://x.com/ANIAMEMORIA'],
    ['YouTube','youtube', '#'],
    ['VRChat', 'vrchat',  'https://vrchat.com/home/group/grp_6d3e7179-6353-4e8b-9f78-c9a2430bfa06'],
  ];

  // SVG アイコン (slug → HTML 文字列。画像系は renderLayout 内で処理)
  const SNS_SVG = {
    x: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    youtube: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>',
  };

  // =======================================================
  // FOOTER LINKS
  // [label, slug]
  // =======================================================
  const footerLinks = [
    ['プライバシーポリシー', 'privacy/'],
    ['利用規約',             'terms/'],
    ['お問い合わせ',          'contact/'],
  ];

  // -------------------------------------------------------
  // Path helper (imageManifest 準備後は fixPath に委譲)
  // -------------------------------------------------------
  const resolvePath = (path) => {
    if (window.fixPath && window.imageManifest) return window.fixPath(path);
    return path;
  };

  // =======================================================
  // renderLayout
  // =======================================================
  window.renderLayout = function (rootPath) {
    const navRootPath = rootPath;

    // ---------------------------------------------------
    // ASSETS
    // ---------------------------------------------------
    const logoDark   = resolvePath(rootPath + 'assets/logo/aniamemoria_logo_darktheme.webp');
    const vrchatLogo = resolvePath(rootPath + 'assets/logo/VRChat Logo Black.webp');

    // ---------------------------------------------------
    // BUILD: PC nav + mobile menu links
    // ---------------------------------------------------
    let pcNavHtml    = '';
    let menuLinkHtml = '';
    menus.forEach(([jp, en, slug]) => {
      const href = navRootPath + slug;
      pcNavHtml    += `<a href="${href}" class="nav-item">${jp}</a>\n        `;
      menuLinkHtml += `
          <a class="menu-link" href="${href}">
            <span class="menu-link__jp">${jp}</span>
            <span class="menu-link__sub">${en}</span>
          </a>`;
    });

    // ---------------------------------------------------
    // BUILD: SNS links (header と menu で同一 HTML を共有)
    // ---------------------------------------------------
    let snsHtml = '';
    sns.forEach(([label, slug, url]) => {
      const icon = slug === 'vrchat'
        ? `<img src="${vrchatLogo}" alt="VRChat" style="width:32px;height:32px;object-fit:contain;">`
        : (SNS_SVG[slug] || '');
      snsHtml += `<a href="${url}" target="_blank" rel="noopener" class="social-link" aria-label="${label}">${icon}</a>\n        `;
    });

    // ---------------------------------------------------
    // BUILD: Footer links
    // ---------------------------------------------------
    const footerLinksHtml = footerLinks
      .map(([label, slug]) => `<a href="${navRootPath + slug}">${label}</a>`)
      .join('\n        ');

    // ---------------------------------------------------
    // HEADER HTML
    // ---------------------------------------------------
    const headerHTML = `
  <header class="site-header" data-elevate>
    <div class="container header-inner">
      <a class="brand" href="${navRootPath}" aria-label="あにあめもりあ（イベント）">
        <img src="${logoDark}" alt="あにあめもりあ" class="brand-logo" />
      </a>

      <nav class="pc-nav hide-sm">
        ${pcNavHtml.trimEnd()}
      </nav>

      <div class="header-socials hide-sm">
        ${snsHtml.trimEnd()}
      </div>

      <button class="menu-btn hide-md" type="button" aria-expanded="false" aria-controls="site-nav">
        <span class="menu-btn__label">MENU</span>
        <span class="menu-btn__icon" aria-hidden="true">
          <span></span><span></span><span></span>
        </span>
      </button>
    </div>

    <nav id="site-nav" class="menu" aria-label="メインメニュー" aria-hidden="true">
      <div class="menu-inner container">
        <div class="menu-head">
          <p class="menu-title">MENU</p>
          <button class="menu-close" type="button" aria-label="メニューを閉じる">×</button>
        </div>

        <div class="menu-links">${menuLinkHtml}
        </div>

        <div class="menu-foot">
          <div class="menu-socials">
            ${snsHtml.trimEnd()}
          </div>
        </div>
      </div>
    </nav>
  </header>`;

    // ---------------------------------------------------
    // FOOTER HTML
    // ---------------------------------------------------
    const footerHTML = `
  <footer class="site-footer">
    <div class="container footer-inner">
      <p class="footer-brand">
        <img src="${logoDark}" alt="あにあめもりあ" class="brand-logo" />
      </p>
      <p class="footer-links">
        ${footerLinksHtml}
      </p>
      <p class="footer-note">© <span id="year"></span> AniameMoria.</p>
      <a class="to-top" href="#top" aria-label="上へ戻る">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </a>
    </div>
  </footer>`;

    // ---------------------------------------------------
    // INJECT INTO DOM
    // ---------------------------------------------------
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (headerPlaceholder) headerPlaceholder.outerHTML = headerHTML;
    if (footerPlaceholder) footerPlaceholder.innerHTML = footerHTML;

    // ---------------------------------------------------
    // ACTIVE PAGE HIGHLIGHT
    // ---------------------------------------------------
    const currentPath = window.location.pathname;
    document.querySelectorAll('.pc-nav .nav-item, .menu-link').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const cleanHref  = href.replace(/^(\.\/|\.\.\/)+/, '');
      const dirSegment = cleanHref.replace('index.html', '');
      if (dirSegment.length > 1 && currentPath.includes(dirSegment)) {
        link.classList.add('is-active');
      }
    });
  };

})();
