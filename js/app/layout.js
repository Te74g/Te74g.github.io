/**
 * js/app/layout.js
 * Common Header and Footer DOM Builder
 */
import { getUrlDepth, getSubdirectorySegment } from './url.js';

const BRAND_LABEL = '\u3042\u306b\u3042\u3081\u3082\u308a\u3042';
const MENU_ARIA_LABEL = '\u30e1\u30a4\u30f3\u30e1\u30cb\u30e5\u30fc';
const MENU_CLOSE_ARIA_LABEL = '\u30e1\u30cb\u30e5\u30fc\u3092\u9589\u3058\u308b';
const TO_TOP_ARIA_LABEL = '\u4e0a\u3078\u623b\u308b';

// [jp, en, slug]
const menus = [
  ['\u30cb\u30e5\u30fc\u30b9', 'NEWS', 'news/'],
  ['\u30ad\u30e3\u30b9\u30c8\u7d39\u4ecb', 'CAST', 'cast/'],
  ['\u30ae\u30e3\u30e9\u30ea\u30fc', 'GALLERY', 'gallery/'],
  ['\u63d0\u643a\u30a4\u30d9\u30f3\u30c8', 'PARTNER', 'partner/'],
  ['\u95a2\u9023\u30ea\u30f3\u30af', 'LINKS', 'links/'],
  ['\u5408\u8a00\u8449', 'AIKOTOBA', 'aikotoba/'],
];

// [label, slug, url]
const sns = [
  ['X', 'x', 'https://x.com/ANIAMEMORIA'],
  ['VRChat', 'vrchat', 'https://vrchat.com/home/group/grp_6d3e7179-6353-4e8b-9f78-c9a2430bfa06'],
];

const SNS_SVG = {
  x: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  youtube: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>',
};

// [label, slug]
const footerLinks = [
  ['\u30d7\u30e9\u30a4\u30d0\u30b7\u30fc\u30dd\u30ea\u30b7\u30fc', 'privacy/'],
  ['\u5229\u7528\u898f\u7d04', 'terms/'],
  ['\u304a\u554f\u3044\u5408\u308f\u305b', 'contact/'],
];

const resolvePath = (path) => {
  if (window.fixPath && window.imageManifest) return window.fixPath(path);
  return path;
};

export async function renderLayout() {
  if (window.location.pathname.includes('/maintenance/') || window.location.pathname.includes('maintenance.html')) return;

  const depth = getUrlDepth();
  let navRootPath = '';
  for (let i = 0; i < depth; i += 1) {
    navRootPath += '../';
  }
  if (depth === 0) navRootPath = './';

  const logoDark = resolvePath(navRootPath + 'assets/logo/aniamemoria_logo_darktheme.webp');
  const vrchatLogo = resolvePath(navRootPath + 'assets/logo/VRChat Logo Black.webp');

  let pcNavHtml = '';
  let menuLinkHtml = '';
  menus.forEach(([jp, en, slug]) => {
    const href = navRootPath + slug;
    pcNavHtml += `<a href="${href}" class="nav-item">${jp}</a>\n        `;
    menuLinkHtml += `
          <a class="menu-link" href="${href}">
            <span class="menu-link__jp">${jp}</span>
            <span class="menu-link__sub">${en}</span>
          </a>`;
  });

  let snsHtml = '';
  sns.forEach(([label, slug, url]) => {
    const icon = slug === 'vrchat'
      ? `<img src="${vrchatLogo}" alt="VRChat" style="width:32px;height:32px;object-fit:contain;">`
      : (SNS_SVG[slug] || '');
    snsHtml += `<a href="${url}" target="_blank" rel="noopener" class="social-link" aria-label="${label}">${icon}</a>\n        `;
  });

  const footerLinksHtml = footerLinks
    .map(([label, slug]) => `<a href="${navRootPath + slug}">${label}</a>`)
    .join('\n        ');

  const headerHTML = `
  <header class="site-header" data-elevate>
    <div class="container header-inner">
      <a class="brand" href="${navRootPath}" aria-label="${BRAND_LABEL}">
        <img src="${logoDark}" alt="${BRAND_LABEL}" class="brand-logo" />
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

    <nav id="site-nav" class="menu" aria-label="${MENU_ARIA_LABEL}" aria-hidden="true">
      <div class="menu-inner container">
        <div class="menu-head">
          <p class="menu-title">MENU</p>
          <button class="menu-close" type="button" aria-label="${MENU_CLOSE_ARIA_LABEL}">&times;</button>
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

  const footerHTML = `
  <footer class="site-footer">
    <div class="container footer-inner">
      <p class="footer-brand">
        <img src="${logoDark}" alt="${BRAND_LABEL}" class="brand-logo" />
      </p>
      <p class="footer-links">
        ${footerLinksHtml}
      </p>
      <p class="footer-note">&copy; <span id="year"></span> AniameMoria.</p>
      <a class="to-top" href="#top" aria-label="${TO_TOP_ARIA_LABEL}">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </a>
    </div>
  </footer>`;

  const headerPlaceholder = document.getElementById('header-placeholder');
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (headerPlaceholder) {
    headerPlaceholder.outerHTML = headerHTML;
    document.querySelector('.site-header')?.insertAdjacentHTML('afterend', '<div class="nav-backdrop"></div>');
  }
  if (footerPlaceholder) {
    footerPlaceholder.innerHTML = footerHTML;
  }

  const dirSegment = getSubdirectorySegment();
  if (dirSegment) {
    document.querySelectorAll('.pc-nav .nav-item, .menu-link').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      if (href.includes(dirSegment)) {
        link.classList.add('is-active');
      }
    });
  }
}
