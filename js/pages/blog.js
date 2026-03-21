/**
 * js/pages/blog.js
 * Blog listing page logic.
 * Mirrors news.js structure but targets #blog-list-container.
 */

import { fixPath } from '../app/url.js';
import { getBlogData, getMembersData } from '../app/data.js';
import { shouldShowItem } from '../app/member-utils.js';

export async function initBlogPage() {
    if (window.manifestPromise) {
        try { await window.manifestPromise; } catch (e) { console.warn('Manifest wait failed', e); }
    }

    const blogContainer = document.getElementById('blog-list-container');
    if (!blogContainer) return;

    const CARD_STAGGER_MS = 80;
    const NOT_FOUND_MSG = '該当するブログ記事が見つかりませんでした。';

    /* ── 著者名ルックアップ ── */
    const membersData = getMembersData() || [];
    const getAuthorName = (authorId) => {
        if (!authorId) return '';
        const m = membersData.find(mb => mb.id === authorId);
        return m ? (m.pickupName || m.name) : authorId;
    };

    const visibleBlogs = (getBlogData() || []).filter(item => shouldShowItem(item));

    /* ── カード生成 ── */
    const createBlogCard = (item, index) => {
        const a = document.createElement('a');
        const pageUrl = item.id
            ? fixPath(`blog/article/?id=${item.id}`)
            : (item.link || '#');
        const imgUrl = item.image ? fixPath(item.image) : '';

        a.href = pageUrl;
        a.className = index === 0 ? 'news-card news-card--featured' : 'news-card';
        a.dataset.category = item.category || 'その他';

        const itemDate = new Date((item.date || '').replace(/\./g, '-'));
        const diffDays = Math.ceil(Math.abs(Date.now() - itemDate) / 86400000);
        const isNew = diffDays <= 3 || index === 0;
        const badgeHtml = isNew ? '<div class="news-badge-new">NEW!</div>' : '';

        const authorName = getAuthorName(item.author);
        const authorHtml = authorName
            ? `<span class="news-card-category" style="font-style:italic;">✍ ${authorName}</span>`
            : '';

        a.innerHTML = `
            ${badgeHtml}
            <div class="news-card-thumb">
                ${imgUrl
                    ? `<img src="${imgUrl}" alt="" loading="lazy">`
                    : '<div style="width:100%;height:100%;background:var(--surface,#222);display:flex;align-items:center;justify-content:center;font-size:2rem;">✍</div>'
                }
            </div>
            <div class="news-card-body">
                <div class="news-card-meta">
                    <span class="news-card-date">${item.date || ''}</span>
                    <span class="news-card-category">${item.category || 'その他'}</span>
                    ${authorHtml}
                </div>
                <p class="news-card-title">${item.title || ''}</p>
                <p class="news-card-desc">${item.desc || ''}</p>
            </div>
            <div class="watermark-logo"></div>
        `;
        return a;
    };

    /* ── アニメーション付きクローン挿入（フィルター用） ── */
    const animateCardsIn = (cards, featuredEl, listEl) => {
        cards.forEach((card, i) => {
            const clone = card.cloneNode(true);
            clone.style.setProperty('--reveal-delay', `${i * CARD_STAGGER_MS}ms`);
            clone.classList.add('reveal');
            if (i === 0) {
                clone.classList.add('news-card--featured');
                featuredEl.appendChild(clone);
            } else {
                clone.classList.remove('news-card--featured');
                listEl.appendChild(clone);
            }
            requestAnimationFrame(() => requestAnimationFrame(() => clone.classList.add('is-visible')));
        });
    };

    /* ── 初期レンダリング ── */
    if (visibleBlogs.length === 0) {
        blogContainer.innerHTML = '<div class="empty-content"><p>現在ブログ記事はありません。</p></div>';
    } else {
        blogContainer.innerHTML = '';
        blogContainer.className = 'news-magazine-layout';

        const featuredWrapper = document.createElement('div');
        featuredWrapper.className = 'news-magazine-featured';
        const listWrapper = document.createElement('div');
        listWrapper.className = 'news-magazine-list';

        visibleBlogs.forEach((item, i) => {
            const card = createBlogCard(item, i);
            (i === 0 ? featuredWrapper : listWrapper).appendChild(card);
        });

        blogContainer.appendChild(featuredWrapper);
        if (visibleBlogs.length > 1) blogContainer.appendChild(listWrapper);

        const allCards = Array.from(blogContainer.querySelectorAll('.news-card'));
        allCards.forEach((card, i) => {
            card.classList.add('reveal');
            card.style.setProperty('--reveal-delay', `${i * CARD_STAGGER_MS}ms`);
        });
        requestAnimationFrame(() => requestAnimationFrame(() => {
            allCards.forEach(c => c.classList.add('is-visible'));
        }));
    }

    /* ── フィルターロジック ── */
    const tagFilterContainer = document.getElementById('blog-tag-filter');
    if (!tagFilterContainer) return;

    const applyFilter = () => {
        const activeBtn = tagFilterContainer.querySelector('.tag-filter-btn.is-active');
        const category = (activeBtn ? activeBtn.dataset.value : 'all') || 'all';

        const prev = document.getElementById('blog-filter-results');
        if (prev) prev.remove();

        if (category === 'all') {
            blogContainer.style.display = '';
            return;
        }

        const allCards = Array.from(blogContainer.querySelectorAll('.news-card'));
        const matching = allCards.filter(c => c.dataset.category === category);

        const filterContainer = document.createElement('div');
        filterContainer.id = 'blog-filter-results';
        filterContainer.className = 'news-magazine-layout';
        blogContainer.insertAdjacentElement('afterend', filterContainer);

        if (matching.length === 0) {
            filterContainer.innerHTML = `<p class="news-no-results">${NOT_FOUND_MSG}</p>`;
        } else {
            const fw = document.createElement('div');
            fw.className = 'news-magazine-featured';
            const lw = document.createElement('div');
            lw.className = 'news-magazine-list';
            filterContainer.appendChild(fw);
            if (matching.length > 1) filterContainer.appendChild(lw);
            animateCardsIn(matching, fw, lw);
        }

        blogContainer.style.display = 'none';
        filterContainer.style.opacity = '0';
        filterContainer.style.transition = 'opacity 0.3s ease';
        requestAnimationFrame(() => requestAnimationFrame(() => { filterContainer.style.opacity = '1'; }));
    };

    tagFilterContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.tag-filter-btn');
        if (!btn) return;
        tagFilterContainer.querySelectorAll('.tag-filter-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        applyFilter();
    });
}
