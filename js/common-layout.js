/**
 * common-layout.js
 * 共通ヘッダー・フッターを動的に生成するためのスクリプト
 */

(function () {
  // -----------------------------------------------------------
  // 1. 各ページで設定されたルートパスを取得 (引数がない場合は自動判定)
  // -----------------------------------------------------------
  // ※ renderLayout関数の引数 path が基本ですが、
  //    scriptタグのdata属性などで渡すことも検討できますが、
  //    今回はシンプルに renderLayout('relative/path/to/root') で呼び出す方式を想定。

  window.renderLayout = function (rootPath) {
    // rootPathの末尾にスラッシュがない場合は補完（空文字以外）
    if (rootPath && !rootPath.endsWith('/') && rootPath !== '') {
      rootPath += '/';
    }
    // rootPathが空文字や undefined の場合は "./" とみなす
    if (!rootPath) rootPath = './';

    // -----------------------------------------------------------
    // 2. HTMLテンプレート (Header)
    // -----------------------------------------------------------
    const headerHTML = `
  <header class="site-header" data-elevate>
    <div class="container header-inner">
      <a class="brand" href="${rootPath}index.html" aria-label="あにあめもりあ（イベント）">
        <picture>
          <source srcset="${rootPath}assets/logo/aniamemoria_logo_darktheme.png" media="(prefers-color-scheme: dark)">
          <img src="${rootPath}assets/logo/aniamemoria_logo.png" alt="あにあめもりあ" class="brand-logo" />
        </picture>
      </a>

      <nav class="pc-nav hide-sm">
        <a href="${rootPath}news/index.html" class="nav-item">ニュース</a>
        <a href="${rootPath}pages/people.html" class="nav-item">キャスト紹介</a>
        <a href="${rootPath}gallery/index.html" class="nav-item">ギャラリー</a>
        <a href="${rootPath}pages/partner_events.html" class="nav-item">提携イベント</a>
        <a href="${rootPath}pages/links.html" class="nav-item">関連リンク</a>
        <a href="${rootPath}pages/aikotoba.html" class="nav-item">合言葉</a>
      </nav>

      <div class="header-socials hide-sm">
        <a href="https://x.com/ANIAMEMORIA" target="_blank" rel="noopener" class="social-link" aria-label="X">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
        <a href="#" target="_blank" rel="noopener" class="social-link" aria-label="YouTube">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
          </svg>
        </a>
        <a href="#" target="_blank" rel="noopener" class="social-link" aria-label="VRChat Group">
          <img src="${rootPath}assets/logo/VRChat Logo Black.png" alt="VRChat" style="width: 32px; height: 32px; object-fit: contain;">
        </a>
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

        <div class="menu-links">
          <a class="menu-link" href="${rootPath}news/index.html">
            <span class="menu-link__jp">ニュース</span>
            <span class="menu-link__sub">NEWS</span>
          </a>
          <a class="menu-link" href="${rootPath}pages/people.html">
            <span class="menu-link__jp">キャスト紹介</span>
            <span class="menu-link__sub">PEOPLE</span>
          </a>
          <a class="menu-link" href="${rootPath}gallery/index.html">
            <span class="menu-link__jp">ギャラリー</span>
            <span class="menu-link__sub">GALLERY</span>
          </a>
          <a class="menu-link" href="${rootPath}pages/partner_events.html">
            <span class="menu-link__jp">提携イベント</span>
            <span class="menu-link__sub">PARTNER</span>
          </a>
          <a class="menu-link" href="${rootPath}pages/links.html">
            <span class="menu-link__jp">関連リンク</span>
            <span class="menu-link__sub">LINKS</span>
          </a>
          <a class="menu-link" href="${rootPath}pages/aikotoba.html">
            <span class="menu-link__jp">合言葉</span>
            <span class="menu-link__sub">AIKOTOBA</span>
          </a>
        </div>

        <div class="menu-foot">
          <div class="menu-socials">
            <a href="https://x.com/ANIAMEMORIA" target="_blank" rel="noopener" class="social-link" aria-label="X">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="#" target="_blank" rel="noopener" class="social-link" aria-label="YouTube">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
              </svg>
            </a>
            <a href="https://vrchat.com/home/group/grp_6d3e7179-6353-4e8b-9f78-c9a2430bfa06" target="_blank" rel="noopener" class="social-link" aria-label="VRChat">
              <img src="${rootPath}assets/logo/VRChat Logo Black.png" alt="VRChat" style="width: 32px; height: 32px; object-fit: contain;">
            </a>
          </div>
        </div>
      </div>
    </nav>
  </header>
        `;

    // -----------------------------------------------------------
    // 3. HTMLテンプレート (Footer)
    // -----------------------------------------------------------
    const footerHTML = `
  <footer class="site-footer">
    <div class="container footer-inner">
      <p class="footer-brand">
        <picture>
          <source srcset="${rootPath}assets/logo/aniamemoria_logo_darktheme.png" media="(prefers-color-scheme: dark)">
          <img src="${rootPath}assets/logo/aniamemoria_logo.png" alt="あにあめもりあ" class="brand-logo" />
        </picture>
      </p>
      <p class="footer-links">
        <a href="${rootPath}privacy.html">プライバシーポリシー</a>
        <a href="${rootPath}terms.html">利用規約</a>
        <a href="${rootPath}pages/contact.html">お問い合わせ</a>
      </p>
      <p class="footer-note">© <span id="year"></span> AniameMoria.</p>
      <a class="to-top" href="#top" aria-label="上へ戻る">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </a>
    </div>
  </footer>
        `;

    // -----------------------------------------------------------
    // 4. プレースホルダーへの注入
    // -----------------------------------------------------------
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');


    if (headerPlaceholder) headerPlaceholder.outerHTML = headerHTML;

    if (footerPlaceholder) footerPlaceholder.innerHTML = footerHTML;

    // -----------------------------------------------------------
    // 5. カレントページのハイライト（簡易実装）
    // -----------------------------------------------------------
    const currentPath = window.location.pathname;
    // リンクのhref属性と現在のパスを比較して is-active を付与
    const navLinks = document.querySelectorAll('.pc-nav .nav-item, .menu-link');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      // hrefが相対パスの場合、絶対パスに変換して比較するなどの正規化が必要だが
      // ここでは簡易的にファイル名が含まれているかで判定
      if (href && href !== '#' && currentPath.includes(href.replace(/^\.\//, ''))) {
        link.classList.add('is-active');
        if (link.classList.contains('nav-item')) {
          link.style.textDecoration = 'underline';
        }
      }
    });
  };
})();
