/**
 * news.js
 * News list and top-page carousel renderer.
 */

import { fixPath } from '../app/url.js';
import { getNewsData } from '../app/data.js';
import { shouldShowItem } from '../app/member-utils.js';
import { isRecentContent } from '../app/freshness.js';

const DEFAULT_CATEGORY = '\u305D\u306E\u4ED6';
const EMPTY_NEWS_MSG = '\u73FE\u5728\u304A\u77E5\u3089\u305B\u306F\u3042\u308A\u307E\u305B\u3093\u3002';
const NOT_FOUND_MSG = '\u8A72\u5F53\u3059\u308B\u30CB\u30E5\u30FC\u30B9\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002';

const getItemCategories = (item) => {
    const categories = Array.isArray(item?.categories) && item.categories.length
        ? item.categories
        : [item?.category || DEFAULT_CATEGORY];
    return categories.map((category) => category || DEFAULT_CATEGORY);
};

const renderCategoryLabels = (item, className) => (
    getItemCategories(item)
        .map((category) => `<span class="${className}">${category}</span>`)
        .join('')
);

export async function initNewsPage() {
    if (window.manifestPromise) {
        try {
            await window.manifestPromise;
        } catch (e) {
            console.warn('Manifest wait failed', e);
        }
    }

    const newsContainer = document.getElementById('news-list-container');
    if (newsContainer) {
        const CARD_STAGGER_MS = 80;
        const visibleNews = (getNewsData() || []).filter((item) => shouldShowItem(item));

        const createNewsCard = (item, index) => {
            const a = document.createElement('a');
            const pageUrl = item.linkPath
                ? fixPath(item.linkPath)
                : (item.id ? fixPath(`news/article/?id=${item.id}`) : (item.link || '#'));
            const imgUrl = item.imagePath ? fixPath(item.imagePath) : (item.image || '');

            a.href = pageUrl;
            a.className = index === 0 ? 'news-card news-card--featured' : 'news-card';
            const categories = getItemCategories(item);
            a.dataset.category = categories[0] || DEFAULT_CATEGORY;
            a.dataset.categories = categories.join('|');

            const isNew = isRecentContent(item.date, index === 0);
            const badgeHtml = isNew ? '<div class="news-badge-new">NEW!</div>' : '';

            a.innerHTML = `
                ${badgeHtml}
                <div class="news-card-thumb">
                    <img src="${imgUrl}" alt="" loading="lazy">
                </div>
                <div class="news-card-body">
                    <div class="news-card-meta">
                        <span class="news-card-date">${item.date}</span>
                        ${renderCategoryLabels(item, 'news-card-category')}
                    </div>
                    <p class="news-card-title">${item.title}</p>
                    <p class="news-card-desc">${item.desc || ''}</p>
                </div>
                <div class="watermark-logo"></div>
            `;
            return a;
        };

        const animateCardsIn = (cards, featuredContainer, listContainer) => {
            cards.forEach((card, i) => {
                const clone = card.cloneNode(true);
                clone.style.setProperty('--reveal-delay', `${i * CARD_STAGGER_MS}ms`);
                clone.classList.add('reveal');

                if (i === 0) {
                    clone.classList.add('news-card--featured');
                    featuredContainer.appendChild(clone);
                } else {
                    clone.classList.remove('news-card--featured');
                    listContainer.appendChild(clone);
                }

                requestAnimationFrame(() => requestAnimationFrame(() => {
                    clone.classList.add('is-visible');
                }));
            });
        };

        if (visibleNews.length === 0) {
            newsContainer.innerHTML = `<div class="empty-content"><p>${EMPTY_NEWS_MSG}</p></div>`;
        } else {
            newsContainer.innerHTML = '';
            newsContainer.className = 'news-magazine-layout';

            const featuredWrapper = document.createElement('div');
            featuredWrapper.className = 'news-magazine-featured';

            const listWrapper = document.createElement('div');
            listWrapper.className = 'news-magazine-list';

            visibleNews.forEach((item, index) => {
                const card = createNewsCard(item, index);
                if (index === 0) {
                    featuredWrapper.appendChild(card);
                } else {
                    listWrapper.appendChild(card);
                }
            });

            newsContainer.appendChild(featuredWrapper);
            if (visibleNews.length > 1) {
                newsContainer.appendChild(listWrapper);
            }

            const allCards = Array.from(newsContainer.querySelectorAll('.news-card'));
            allCards.forEach((card, i) => {
                card.classList.add('reveal');
                card.style.setProperty('--reveal-delay', `${i * CARD_STAGGER_MS}ms`);
            });
            requestAnimationFrame(() => requestAnimationFrame(() => {
                allCards.forEach((card) => card.classList.add('is-visible'));
            }));
        }

        const tagFilterContainer = document.getElementById('news-tag-filter');
        if (tagFilterContainer) {
            const getFilterState = () => {
                const activeBtn = tagFilterContainer.querySelector('.tag-filter-btn.is-active');
                const category = (activeBtn ? activeBtn.dataset.value : null) || 'all';
                const allCards = Array.from(newsContainer.querySelectorAll('.news-card'));
                const matchingCards = allCards.filter((card) => (
                    category === 'all' || (card.dataset.categories || card.dataset.category || '').split('|').includes(category)
                ));
                return { category, isFiltering: category !== 'all', matchingCards };
            };

            const resetToAll = () => {
                const prev = document.getElementById('news-filter-results');
                if (prev) prev.remove();
                newsContainer.style.display = '';
            };

            const renderFilter = (matchingCards) => {
                let filterContainer = document.getElementById('news-filter-results');
                if (!filterContainer) {
                    filterContainer = document.createElement('div');
                    filterContainer.id = 'news-filter-results';
                    filterContainer.className = 'news-magazine-layout';
                    newsContainer.insertAdjacentElement('afterend', filterContainer);
                }
                filterContainer.innerHTML = '';

                if (matchingCards.length === 0) {
                    filterContainer.innerHTML = `<p class="news-no-results">${NOT_FOUND_MSG}</p>`;
                } else {
                    const featuredWrapper = document.createElement('div');
                    featuredWrapper.className = 'news-magazine-featured';

                    const listWrapper = document.createElement('div');
                    listWrapper.className = 'news-magazine-list';

                    filterContainer.appendChild(featuredWrapper);
                    if (matchingCards.length > 1) {
                        filterContainer.appendChild(listWrapper);
                    }

                    animateCardsIn(matchingCards, featuredWrapper, listWrapper);
                }

                newsContainer.style.display = 'none';
                filterContainer.style.opacity = '0';
                filterContainer.style.transition = 'opacity 0.3s ease';
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    filterContainer.style.opacity = '1';
                }));
            };

            const applyFilter = () => {
                const { isFiltering, matchingCards } = getFilterState();
                if (!isFiltering) {
                    resetToAll();
                    return;
                }
                renderFilter(matchingCards);
            };

            tagFilterContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.tag-filter-btn');
                if (!btn) return;
                tagFilterContainer.querySelectorAll('.tag-filter-btn').forEach((b) => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                applyFilter();
            });
        }
    }

    const track = document.getElementById('news-carousel-track');
    if (track && getNewsData()) {
        const visibleNews = getNewsData().filter((item) => shouldShowItem(item));
        const carouselItems = visibleNews.slice(0, 5);

        carouselItems.forEach((item, i) => {
            const card = document.createElement('a');
            const pageUrl = item.linkPath
                ? fixPath(item.linkPath)
                : (item.id ? fixPath(`news/article/?id=${item.id}`) : (item.link || '#'));
            const imgUrl = item.imagePath ? fixPath(item.imagePath) : (item.image || '');
            const title = item.title || 'News';
            const desc = item.desc || '';

            card.href = pageUrl;
            card.className = 'news-card-slide';

            const isNew = isRecentContent(item.date, i === 0);
            const badgeHtml = isNew ? '<div class="news-badge-new">NEW!</div>' : '';
            const mediaHtml = imgUrl
                ? `<img class="news-card-slide__image" src="${imgUrl}" alt="" loading="lazy">`
                : '<div class="news-card-slide__image-placeholder" aria-hidden="true">NO IMAGE</div>';

            card.innerHTML = `
                ${badgeHtml}
                <div class="news-card-slide__media">
                    ${mediaHtml}
                </div>
                <div class="news-card-slide__content">
                    <div class="news-card-slide__meta">
                        <span class="news-date">${item.date}</span>
                        ${renderCategoryLabels(item, 'news-tag-label')}
                    </div>
                    <div class="news-card-slide__title">${title}</div>
                    <div class="news-card-slide__desc">${desc}</div>
                    <div class="news-card-slide__cta">MORE &rarr;</div>
                </div>
                <div class="watermark-logo"></div>
            `;

            const media = card.querySelector('.news-card-slide__media');
            const image = card.querySelector('.news-card-slide__image');
            if (media && image) {
                image.addEventListener('error', () => {
                    image.remove();
                    const placeholder = document.createElement('div');
                    placeholder.className = 'news-card-slide__image-placeholder';
                    placeholder.setAttribute('aria-hidden', 'true');
                    placeholder.textContent = 'NO IMAGE';
                    media.appendChild(placeholder);
                }, { once: true });
            }

            track.appendChild(card);
        });

        const initCarousel = () => {
            const prevBtn = document.getElementById('carousel-prev');
            const nextBtn = document.getElementById('carousel-next');
            const cards = Array.from(track.children);
            const total = cards.length;
            if (total === 0) return;

            let currentIndex = 0;

            const update = () => {
                cards.forEach((card, i) => {
                    card.classList.remove('is-active', 'is-prev', 'is-next', 'is-hidden');
                    const prevIndex = (currentIndex - 1 + total) % total;
                    const nextIndex = (currentIndex + 1) % total;

                    if (i === currentIndex) card.classList.add('is-active');
                    else if (i === prevIndex) card.classList.add('is-prev');
                    else if (i === nextIndex) card.classList.add('is-next');
                    else card.classList.add('is-hidden');
                });
            };
            update();

            prevBtn?.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + total) % total;
                update();
            });
            nextBtn?.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % total;
                update();
            });

            let touchStartX = 0;
            let touchEndX = 0;
            track.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });
            track.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                if (touchEndX < touchStartX - 50) {
                    currentIndex = (currentIndex + 1) % total;
                    update();
                }
                if (touchEndX > touchStartX + 50) {
                    currentIndex = (currentIndex - 1 + total) % total;
                    update();
                }
            }, { passive: true });
        };

        initCarousel();
    }
}
