/**
 * js/blog_loader.js
 * Blog article loader.
 * Reads window.__blogId (from stub) or ?id=... from URL.
 * Requires: data/blog.js (blogData), data/members.js (membersData)
 */
const ALLOWED_HTML_TAGS = new Set([
    'a', 'article', 'aside', 'blockquote', 'br', 'code', 'del', 'div', 'em',
    'figcaption', 'figure', 'h2', 'h3', 'h4', 'hr', 'img', 'li', 'ol', 'p',
    'pre', 'span', 'strong', 'time', 'u', 'ul'
]);

const ALLOWED_HTML_ATTRS = {
    '*': new Set(['class', 'style']),
    a: new Set(['href', 'target', 'rel', 'class', 'style']),
    img: new Set(['src', 'alt', 'loading', 'width', 'height', 'class', 'style']),
    time: new Set(['datetime', 'class', 'style'])
};

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function sanitizeUrl(url) {
    if (typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    const lower = trimmed.toLowerCase();
    if (lower.startsWith('javascript:') || lower.startsWith('vbscript:') || lower.startsWith('data:')) {
        return '';
    }
    return trimmed;
}

function sanitizeStyle(styleValue) {
    if (typeof styleValue !== 'string') return '';
    const lower = styleValue.toLowerCase();
    if (lower.includes('expression(') || lower.includes('@import') || lower.includes('javascript:') || lower.includes('url(')) {
        return '';
    }
    return styleValue;
}

function unwrapElement(element) {
    const parent = element.parentNode;
    if (!parent) return;
    while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
    }
    parent.removeChild(element);
}

function sanitizeRichHtml(html) {
    const template = document.createElement('template');
    template.innerHTML = String(html || '');

    Array.from(template.content.querySelectorAll('*')).forEach((el) => {
        const tag = el.tagName.toLowerCase();
        if (!ALLOWED_HTML_TAGS.has(tag)) {
            unwrapElement(el);
        }
    });

    Array.from(template.content.querySelectorAll('*')).forEach((el) => {
        const tag = el.tagName.toLowerCase();
        const allowedForTag = ALLOWED_HTML_ATTRS[tag] || new Set();
        const allowedGlobal = ALLOWED_HTML_ATTRS['*'];

        Array.from(el.attributes).forEach((attr) => {
            const name = attr.name.toLowerCase();
            const value = attr.value;
            const isAllowed = allowedForTag.has(name) || allowedGlobal.has(name);

            if (name.startsWith('on') || !isAllowed) {
                el.removeAttribute(attr.name);
                return;
            }

            if (name === 'href' || name === 'src') {
                const safeUrl = sanitizeUrl(value);
                if (!safeUrl) {
                    el.removeAttribute(attr.name);
                    return;
                }
                el.setAttribute(attr.name, safeUrl);
            }

            if (name === 'style') {
                const safeStyle = sanitizeStyle(value);
                if (!safeStyle) {
                    el.removeAttribute(attr.name);
                    return;
                }
                el.setAttribute(attr.name, safeStyle);
            }
        });

        if (tag === 'a' && el.getAttribute('target') === '_blank') {
            const relTokens = (el.getAttribute('rel') || '')
                .split(/\s+/)
                .filter(Boolean);
            if (!relTokens.includes('noopener')) relTokens.push('noopener');
            if (!relTokens.includes('noreferrer')) relTokens.push('noreferrer');
            el.setAttribute('rel', relTokens.join(' '));
        }
    });

    return template.innerHTML;
}

document.addEventListener('DOMContentLoaded', async () => {
    if (window.manifestPromise) {
        try { await window.manifestPromise; } catch (e) { console.warn('Manifest wait failed', e); }
    }

    const blogData = Array.isArray(window.blogData) ? window.blogData : [];
    if (blogData.length === 0) {
        console.error('[blog_loader] blogData is not available or empty.');
        return;
    }

    const id = String(window.__blogId || new URLSearchParams(window.location.search).get('id') || '').trim();
    if (!id) {
        console.warn('[blog_loader] No blog ID specified.');
        return;
    }

    const article = blogData.find(item => String(item.id || '') === id);

    if (!article) {
        const main = document.querySelector('main');
        if (main) main.innerHTML = '<div class="container" style="padding:60px 0;text-align:center;"><p>記事が見つかりませんでした。</p><a href="../" class="btn btn--ghost" style="margin-top:20px;">一覧に戻る</a></div>';
        return;
    }

    /* ─ タイトル ─ */
    const safeTitle = escapeHtml(article.title || '');
    document.title = `あにあめもりあ | ${article.title || ''}`;

    /* ─ 著者名ルックアップ ─ */
    let authorName = '';
    if (article.author && Array.isArray(window.membersData)) {
        const m = window.membersData.find(mb => mb.id === article.author);
        authorName = m ? (m.pickupName || m.name) : article.author;
    }

    /* ─ ヘッダー ─ */
    const headerEl = document.getElementById('dynamic-article-header');
    if (headerEl) {
        const safeDate = escapeHtml(article.date || '');
        const safeDateTime = escapeHtml((article.date || '').replace(/\./g, '-'));
        const categoryHtml = article.category
            ? `<span class="tag tag--soft">${escapeHtml(article.category)}</span>`
            : '';
        const authorHtml = authorName
            ? `<span class="tag tag--soft">✍ ${escapeHtml(authorName)}</span>`
            : '';

        headerEl.innerHTML = `
            <h1 class="cafe-signboard" style="font-size:clamp(1.1rem,3vw,1.6rem);line-height:1.5;margin-bottom:0;">
                ${safeTitle}
            </h1>
            <div class="cafe-separator"><span class="cafe-separator-icon"></span></div>
            <div style="margin-bottom:10px;color:var(--muted);font-weight:700;font-family:'Zen Old Mincho',serif;letter-spacing:0.1em;display:flex;align-items:center;gap:10px;justify-content:center;flex-wrap:wrap;">
                <time datetime="${safeDateTime}">${safeDate}</time>
                ${categoryHtml}
                ${authorHtml}
            </div>
        `;
    }

    /* ─ アイキャッチ画像 ─ */
    const imageContainer = document.getElementById('dynamic-article-image');
    if (imageContainer) {
        if (article.image) {
            const imgPath = window.fixPath ? window.fixPath(article.image) : article.image;
            const safePath = sanitizeUrl(imgPath);
            if (safePath) {
                imageContainer.innerHTML = `
                    <div style="margin-bottom:32px;">
                        <img src="${escapeHtml(safePath)}" alt="アイキャッチ画像"
                            style="width:100%;height:auto;border-radius:12px;box-shadow:var(--shadow);">
                    </div>
                `;
            } else {
                imageContainer.innerHTML = '';
            }
        } else {
            imageContainer.innerHTML = '';
        }
    }

    /* ─ 本文 ─ */
    const contentEl = document.getElementById('dynamic-article-content');
    if (contentEl) {
        const rawContent = article.content || '<p>本文がありません。</p>';
        contentEl.innerHTML = sanitizeRichHtml(rawContent);
    }

    /* ─ ライトボックス ─ */
    if (window.initLightbox) {
        window.initLightbox('#dynamic-article-image img, #dynamic-article-content img');
    }
});
