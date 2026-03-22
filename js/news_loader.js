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

function renderNotFound(id) {
    const main = document.querySelector('main');
    if (!main) return;
    const safeId = id ? `<code>${id}</code>` : '<code>(none)</code>';
    main.innerHTML = `
        <section class="section news-article-section">
            <div class="container news-article-container" style="max-width: 760px; text-align: center;">
                <div class="news-article-content-frame">
                    <h1 class="news-article-title" style="margin-bottom: 16px;">記事が見つかりませんでした</h1>
                    <p style="margin-bottom: 8px;">指定されたID: ${safeId}</p>
                    <p style="margin-bottom: 20px;">移行時の旧IDの可能性があります。ニュース一覧から最新記事をご確認ください。</p>
                    <a class="btn btn--ghost" href="${window.fixPath ? window.fixPath('news/') : '/news/'}">ニュース一覧へ</a>
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
                        <a href="${window.fixPath ? window.fixPath('news/') : '/news/'}" class="btn btn--ghost">ニュース一覧に戻る</a>
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
    document.title = `あにあめもりあ | ${article.title || 'ニュース'}`;

    const scaffold = ensureArticleScaffold();
    if (!scaffold) return;

    const { headerEl, imageContainer, contentEl } = scaffold;
    if (headerEl) {
        const dateText = article.date || '';
        const dateIso = typeof dateText === 'string' ? dateText.replace(/\./g, '-') : '';
        const category = article.category || 'その他';
        headerEl.innerHTML = `
            <div class="news-article-title-banner">
                <span class="news-article-title-ornament" aria-hidden="true"></span>
                <h1 class="news-article-title">${article.title || ''}</h1>
                <span class="news-article-title-ornament" aria-hidden="true"></span>
            </div>
            <div class="news-article-meta">
                ${dateText ? `<time datetime="${dateIso}" class="news-article-date">${dateText}</time>` : ''}
                <span class="news-article-category">${category}</span>
            </div>
        `;
    }

    if (imageContainer) {
        const rawPath = article.imagePath || article.image;
        if (rawPath) {
            const imgPath = window.fixPath ? window.fixPath(rawPath) : rawPath;
            imageContainer.innerHTML = `
                <figure class="news-article-figure">
                    <img src="${imgPath}" alt="${article.title || '記事画像'}" class="news-article-main-image">
                </figure>
            `;
        } else {
            imageContainer.innerHTML = '';
        }
    }

    if (contentEl) {
        contentEl.innerHTML = article.content || '<p>本文がありません。</p>';
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
