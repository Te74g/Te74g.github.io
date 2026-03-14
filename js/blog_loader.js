/**
 * js/blog_loader.js
 * Blog article loader.
 * Reads window.__blogId (from stub) or ?id=... from URL.
 * Requires: data/blog.js (blogData), data/members.js (membersData)
 */
document.addEventListener('DOMContentLoaded', async () => {
    if (window.manifestPromise) {
        try { await window.manifestPromise; } catch (e) { console.warn('Manifest wait failed', e); }
    }

    if (!window.blogData) {
        console.error('[blog_loader] blogData is not defined.');
        return;
    }

    const id = window.__blogId || new URLSearchParams(window.location.search).get('id');
    if (!id) {
        console.warn('[blog_loader] No blog ID specified.');
        return;
    }

    const article = window.blogData.find(item => item.id === id);

    if (!article) {
        const main = document.querySelector('main');
        if (main) main.innerHTML = '<div class="container" style="padding:60px 0;text-align:center;"><p>記事が見つかりませんでした。</p><a href="../" class="btn btn--ghost" style="margin-top:20px;">一覧に戻る</a></div>';
        return;
    }

    /* ─ タイトル ─ */
    document.title = `あにあめもりあ | ${article.title}`;

    /* ─ 著者名ルックアップ ─ */
    let authorName = '';
    if (article.author && window.membersData) {
        const m = window.membersData.find(mb => mb.id === article.author);
        authorName = m ? (m.pickupName || m.name) : article.author;
    }

    /* ─ ヘッダー ─ */
    const headerEl = document.getElementById('dynamic-article-header');
    if (headerEl) {
        headerEl.innerHTML = `
            <h1 class="cafe-signboard" style="font-size:clamp(1.1rem,3vw,1.6rem);line-height:1.5;margin-bottom:0;">
                ${article.title}
            </h1>
            <div class="cafe-separator"><span class="cafe-separator-icon"></span></div>
            <div style="margin-bottom:10px;color:var(--muted);font-weight:700;font-family:'Zen Old Mincho',serif;letter-spacing:0.1em;display:flex;align-items:center;gap:10px;justify-content:center;flex-wrap:wrap;">
                <time datetime="${(article.date || '').replace(/\./g, '-')}">${article.date || ''}</time>
                ${article.category ? `<span class="tag tag--soft">${article.category}</span>` : ''}
                ${authorName ? `<span class="tag tag--soft">✍ ${authorName}</span>` : ''}
            </div>
        `;
    }

    /* ─ アイキャッチ画像 ─ */
    const imageContainer = document.getElementById('dynamic-article-image');
    if (imageContainer) {
        if (article.image) {
            const imgPath = window.fixPath ? window.fixPath(article.image) : article.image;
            imageContainer.innerHTML = `
                <div style="margin-bottom:32px;">
                    <img src="${imgPath}" alt="アイキャッチ画像"
                        style="width:100%;height:auto;border-radius:12px;box-shadow:var(--shadow);">
                </div>
            `;
        } else {
            imageContainer.innerHTML = '';
        }
    }

    /* ─ 本文 ─ */
    const contentEl = document.getElementById('dynamic-article-content');
    if (contentEl) {
        contentEl.innerHTML = article.content || '<p>本文がありません。</p>';
    }

    /* ─ ライトボックス ─ */
    if (window.initLightbox) {
        window.initLightbox('#dynamic-article-image img, #dynamic-article-content img');
    }
});
