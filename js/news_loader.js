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
        <section class="section">
            <div class="container" style="max-width: 760px; text-align: center;">
                <div class="parchment-frame">
                    <h1 class="cafe-signboard" style="margin-bottom: 16px;">記事が見つかりませんでした</h1>
                    <p style="margin-bottom: 8px;">指定されたID: ${safeId}</p>
                    <p style="margin-bottom: 20px;">移行時の旧IDの可能性があります。ニュース一覧から最新記事をご確認ください。</p>
                    <a class="btn btn--ghost" href="${window.fixPath ? window.fixPath('news/') : '/news/'}">ニュース一覧へ</a>
                </div>
            </div>
        </section>
    `;
}

function renderArticle(article) {
    document.title = `あにあめもりあ | ${article.title || 'ニュース'}`;

    const headerEl = document.getElementById('dynamic-article-header');
    if (headerEl) {
        const dateText = article.date || '';
        const dateIso = typeof dateText === 'string' ? dateText.replace(/\./g, '-') : '';
        const category = article.category || 'その他';
        headerEl.innerHTML = `
            <h1 class="cafe-signboard" style="font-size: clamp(1.1rem, 3vw, 1.4rem); line-height: 1.5; margin-bottom: 0;">
                ${article.title || ''}
            </h1>
            <div class="cafe-separator"><span class="cafe-separator-icon"></span></div>
            <div style="margin-bottom: 10px; color: var(--muted); font-weight: 700; font-family: 'Zen Old Mincho', serif; letter-spacing: 0.1em;">
                ${dateText ? `<time datetime="${dateIso}">${dateText}</time>` : ''}
                <span class="tag tag--soft" style="margin-left: 10px;">${category}</span>
            </div>
        `;
    }

    const imageContainer = document.getElementById('dynamic-article-image');
    if (imageContainer) {
        const rawPath = article.imagePath || article.image;
        if (rawPath) {
            const imgPath = window.fixPath ? window.fixPath(rawPath) : rawPath;
            imageContainer.innerHTML = `
                <div style="margin-bottom: 32px;">
                    <img src="${imgPath}" alt="記事画像" style="width: 100%; height: auto; border-radius: 12px; box-shadow: var(--shadow);">
                </div>
            `;
        } else {
            imageContainer.innerHTML = '';
        }
    }

    const contentEl = document.getElementById('dynamic-article-content');
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
