/**
 * News Article Loader
 * - Resolves article id from __newsId, query, or /news/<slug>/ route
 * - Supports legacy id aliases after migration
 * - Renders a safe fallback instead of blank content
 */

function resolveNewsIdFromRoute() {
    const fromGlobal = (window.__newsId || '').trim();
    if (fromGlobal) return fromGlobal;

    const params = new URLSearchParams(window.location.search);
    const fromQuery = (params.get('id') || '').trim();
    if (fromQuery) return fromQuery;

    const match = window.location.pathname.match(/\/news\/([^/]+)\/?$/i);
    if (!match) return '';
    const slug = decodeURIComponent((match[1] || '').trim());
    if (!slug || slug.toLowerCase() === 'article') return '';
    return slug;
}

function resolveAlias(rawId) {
    const aliases = window.newsIdAliases || {};
    if (!rawId) return rawId;
    if (aliases[rawId]) return aliases[rawId];

    const lower = rawId.toLowerCase();
    const hitKey = Object.keys(aliases).find((key) => key.toLowerCase() === lower);
    return hitKey ? aliases[hitKey] : rawId;
}

function findArticleById(id) {
    const list = Array.isArray(window.newsData) ? window.newsData : [];
    if (!id) return null;

    const direct = list.find((item) => item && item.id === id);
    if (direct) return direct;

    const lower = id.toLowerCase();
    return list.find((item) => item && typeof item.id === 'string' && item.id.toLowerCase() === lower) || null;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function sanitizeStyle(value) {
    return String(value || '')
        .replace(/expression\s*\([^)]*\)/gi, '')
        .replace(/url\s*\(\s*(['"]?)javascript:[^)]*\)/gi, '')
        .trim();
}

function sanitizeHtml(html) {
    const allowedTags = new Set([
        'A', 'B', 'BLOCKQUOTE', 'BR', 'DIV', 'EM', 'FIGCAPTION', 'FIGURE',
        'H2', 'H3', 'H4', 'HR', 'I', 'IMG', 'LI', 'OL', 'P', 'SPAN',
        'STRONG', 'U', 'UL'
    ]);
    const allowedAttrs = new Set(['alt', 'class', 'href', 'rel', 'src', 'style', 'target', 'title']);
    const urlAttrs = new Set(['href', 'src']);

    const template = document.createElement('template');
    template.innerHTML = String(html || '');

    Array.from(template.content.querySelectorAll('*')).forEach((el) => {
        if (!allowedTags.has(el.tagName)) {
            el.replaceWith(...Array.from(el.childNodes));
            return;
        }

        Array.from(el.attributes).forEach((attr) => {
            const name = attr.name.toLowerCase();
            const value = attr.value || '';

            if (name.startsWith('on')) {
                el.removeAttribute(attr.name);
                return;
            }

            if (!allowedAttrs.has(name)) {
                el.removeAttribute(attr.name);
                return;
            }

            if (name === 'style') {
                const cleanStyle = sanitizeStyle(value);
                if (cleanStyle) {
                    el.setAttribute('style', cleanStyle);
                } else {
                    el.removeAttribute(attr.name);
                }
                return;
            }

            if (urlAttrs.has(name)) {
                const trimmed = value.trim();
                const isSafeUrl = /^(https?:|mailto:|tel:|\/|\.\/|\.\.\/|#)/i.test(trimmed);
                if (!trimmed || !isSafeUrl || /^\s*javascript:/i.test(trimmed)) {
                    el.removeAttribute(attr.name);
                }
            }
        });

        if (el.tagName === 'A' && !el.getAttribute('rel')) {
            el.setAttribute('rel', 'noopener noreferrer');
        }

        if (el.tagName === 'IMG') {
            el.setAttribute('loading', 'lazy');
            el.setAttribute('decoding', 'async');
            if (!el.getAttribute('alt')) {
                el.setAttribute('alt', '');
            }
        }
    });

    return template.innerHTML;
}

function renderNotFound(id) {
    const main = document.querySelector('main');
    if (!main) return;

    const safeId = escapeHtml(id || '(none)');
    const newsIndexHref = window.fixPath ? window.fixPath('news/') : '/news/';

    main.innerHTML = `
        <section class="section news-article-section">
            <div class="container news-article-container" style="max-width: 760px; text-align: center;">
                <div class="news-article-content-frame">
                    <h1 class="news-article-title" style="margin-bottom: 16px;">記事が見つかりませんでした</h1>
                    <p style="margin-bottom: 8px;">指定されたID: <code>${safeId}</code></p>
                    <p style="margin-bottom: 20px;">移行時の旧IDの可能性があります。ニュース一覧から最新記事を確認してください。</p>
                    <a class="btn btn--ghost" href="${newsIndexHref}">ニュース一覧へ</a>
                </div>
            </div>
        </section>
    `;
}

function ensureArticleScaffold() {
    const main = document.querySelector('main');
    if (!main) return null;

    let headerEl = document.getElementById('dynamic-article-header');
    let imageContainer = document.getElementById('dynamic-article-image');
    let contentEl = document.getElementById('dynamic-article-content');

    if (headerEl && imageContainer && contentEl) {
        const revealTargets = [
            main.querySelector('.news-article'),
            headerEl,
            main.querySelector('.news-article-content-frame')
        ];
        revealTargets.forEach((el) => {
            if (!el) return;
            el.classList.remove('reveal');
            el.classList.add('is-visible');
        });
        return { headerEl, imageContainer, contentEl };
    }

    const newsIndexHref = window.fixPath ? window.fixPath('news/') : '/news/';
    main.innerHTML = `
        <section class="section news-article-section">
            <div class="container news-article-container">
                <article class="news-article">
                    <header id="dynamic-article-header" class="news-article-header"></header>
                    <div id="dynamic-article-image" class="news-article-image"></div>
                    <div class="news-article-content-frame">
                        <div id="dynamic-article-content"></div>
                        <div class="watermark-logo"></div>
                    </div>
                    <div class="news-article-actions">
                        <a href="${newsIndexHref}" class="btn btn--ghost">ニュース一覧に戻る</a>
                    </div>
                </article>
            </div>
        </section>
    `;

    headerEl = document.getElementById('dynamic-article-header');
    imageContainer = document.getElementById('dynamic-article-image');
    contentEl = document.getElementById('dynamic-article-content');
    return { headerEl, imageContainer, contentEl };
}

function renderArticle(article) {
    const articleTitle = article.title || 'ニュース';
    const articleDate = article.date || '';
    const articleCategory = article.category || 'その他';
    const articleDateIso = typeof articleDate === 'string' ? articleDate.replace(/\./g, '-') : '';

    document.title = `あにあめもりあ | ${articleTitle}`;

    const scaffold = ensureArticleScaffold();
    if (!scaffold) return;

    const { headerEl, imageContainer, contentEl } = scaffold;
    if (headerEl) {
        headerEl.innerHTML = `
            <div class="news-article-title-banner">
                <span class="news-article-title-ornament" aria-hidden="true"></span>
                <h1 class="news-article-title">${escapeHtml(articleTitle)}</h1>
                <span class="news-article-title-ornament" aria-hidden="true"></span>
            </div>
            <div class="news-article-meta">
                ${articleDate ? `<time datetime="${escapeHtml(articleDateIso)}" class="news-article-date">${escapeHtml(articleDate)}</time>` : ''}
                <span class="news-article-category">${escapeHtml(articleCategory)}</span>
            </div>
        `;
    }

    if (imageContainer) {
        imageContainer.innerHTML = '';
        const rawPath = article.imagePath || article.image;
        if (rawPath) {
            const imgPath = window.fixPath ? window.fixPath(rawPath) : rawPath;
            const figure = document.createElement('figure');
            figure.className = 'news-article-figure';

            const img = document.createElement('img');
            img.src = imgPath;
            img.alt = articleTitle;
            img.className = 'news-article-main-image';
            img.loading = 'lazy';
            img.decoding = 'async';

            figure.appendChild(img);
            imageContainer.appendChild(figure);
        }
    }

    if (contentEl) {
        contentEl.innerHTML = sanitizeHtml(article.content || '<p>本文がありません。</p>');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    if (window.manifestPromise) {
        try {
            await window.manifestPromise;
        } catch (e) {
            console.warn('Manifest wait failed', e);
        }
    }

    if (!Array.isArray(window.newsData)) {
        console.error('newsData is not defined.');
        return;
    }

    const rawId = resolveNewsIdFromRoute();
    if (!rawId) {
        renderNotFound('');
        return;
    }

    const resolvedId = resolveAlias(rawId);
    const article = findArticleById(resolvedId);
    if (!article) {
        renderNotFound(rawId);
        return;
    }

    renderArticle(article);

    if (window.initLightbox) {
        window.initLightbox('#dynamic-article-image img, #dynamic-article-content img');
    }
});
