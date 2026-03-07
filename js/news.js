/**
 * news.js
 * News list generation and Carousel logic
 * Depends on: utils.js, data_news.js
 */

(async function () {
    // Wait for Manifest
    if (window.manifestPromise) {
        try { await window.manifestPromise; } catch (e) { console.warn('Manifest wait failed', e); }
    }

    /* -------------------------------------------------------
       1. ニュース一覧ページ (news/index.html) の生成
       ------------------------------------------------------- */
    const newsContainer = document.getElementById("news-list-container");
    if (newsContainer) {
        const CARD_STAGGER_MS = 80;
        const NOT_FOUND_MSG = '該当するニュースが見つかりませんでした。';

        const visibleNews = (window.newsData || []).filter(item => window.shouldShowItem(item));

        // --- カード生成 (サムネイルメイン型) ---
        const createNewsCard = (item, index) => {
            const a = document.createElement("a");
            const pageUrl = item.linkPath
                ? window.fixPath(item.linkPath)
                : (item.id ? window.fixPath(`news/article.html?id=${item.id}`) : (item.link || "#"));
            const imgUrl = item.imagePath ? window.fixPath(item.imagePath) : (item.image || "");

            a.href = pageUrl;

            // 最新1件目は大きく表示（スマホではCSSで1列に戻る）
            a.className = index === 0 ? "news-card news-card--featured" : "news-card";
            a.dataset.category = item.category || "その他";

            // 3日以内、または最新1件目（絞り込み結果含む）ならNEWをつける
            const itemDate = new Date(item.date);
            const now = new Date();
            const diffTime = Math.abs(now - itemDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const isNew = diffDays <= 3 || index === 0;
            const badgeHtml = isNew ? `<div class="news-badge-new">NEW!</div>` : '';

            a.innerHTML = `
                ${badgeHtml}
                <div class="news-card-thumb">
                    <img src="${imgUrl}" alt="" loading="lazy">
                </div>
                <div class="news-card-body">
                    <div class="news-card-meta">
                        <span class="news-card-date">${item.date}</span>
                        <span class="news-card-category">${item.category || 'その他'}</span>
                    </div>
                    <p class="news-card-title">${item.title}</p>
                    <p class="news-card-desc">${item.desc || ''}</p>
                </div>
                <div class="watermark-logo"></div>
            `;
            return a;
        };

        // --- アニメーション付きクローン挿入 (フィルター用) ---
        const animateCardsIn = (cards, featuredContainer, listContainer) => {
            cards.forEach((card, i) => {
                const clone = card.cloneNode(true);
                clone.style.setProperty('--card-delay', `${i * CARD_STAGGER_MS}ms`);
                clone.classList.add('card-enter');

                if (i === 0) {
                    clone.classList.add('news-card--featured');
                    featuredContainer.appendChild(clone);
                } else {
                    clone.classList.remove('news-card--featured');
                    listContainer.appendChild(clone);
                }

                requestAnimationFrame(() => requestAnimationFrame(() => {
                    clone.classList.add('is-entering');
                }));
            });
        };

        // --- 初期レンダリング --- (Skipping unaltered rendering code for brevity)
        if (visibleNews.length === 0) {
            newsContainer.innerHTML = `<div class="empty-content"><p>現在お知らせはありません。</p></div>`;
        } else {
            // Container setup for magazine layout
            newsContainer.innerHTML = ''; // clear original
            newsContainer.className = 'news-magazine-layout';

            // Left (Featured) Container
            const featuredWrapper = document.createElement('div');
            featuredWrapper.className = 'news-magazine-featured';

            // Right (Scrollable List) Container
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

            // 初期ロード時のスタガーアニメーション
            const allCards = Array.from(newsContainer.querySelectorAll('.news-card'));
            allCards.forEach((card, i) => {
                card.classList.add('card-enter');
                card.style.setProperty('--card-delay', `${i * CARD_STAGGER_MS}ms`);
            });
            requestAnimationFrame(() => requestAnimationFrame(() => {
                allCards.forEach(card => card.classList.add('is-entering'));
            }));
        }

        // --- フィルターロジック ---
        const tagFilterContainer = document.getElementById("news-tag-filter");
        if (tagFilterContainer) {

            const getFilterState = () => {
                const activeBtn = tagFilterContainer.querySelector('.tag-filter-btn.is-active');
                const category = (activeBtn ? activeBtn.dataset.value : null) || 'all';
                const allCards = Array.from(newsContainer.querySelectorAll('.news-card'));
                const matchingCards = allCards.filter(card =>
                    category === 'all' || card.dataset.category === category
                );
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
                if (!isFiltering) { resetToAll(); return; }
                renderFilter(matchingCards);
            };

            tagFilterContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.tag-filter-btn');
                if (!btn) return;
                tagFilterContainer.querySelectorAll('.tag-filter-btn').forEach(b => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                applyFilter();
            });
        }
    }

    /* -------------------------------------------------------
       2. ニュースカルーセル (index.html)
       ------------------------------------------------------- */
    const track = document.getElementById("news-carousel-track");
    if (track && window.newsData) {
        // フィルタリング
        const visibleNews = window.newsData.filter(item => window.shouldShowItem(item));
        const carouselItems = visibleNews.slice(0, 5); // 最新5件

        carouselItems.forEach((item, i) => {
            const card = document.createElement("a");
            const pageUrl = item.linkPath ? window.fixPath(item.linkPath) : (item.id ? window.fixPath(`news/article.html?id=${item.id}`) : (item.link || "#"));
            const imgUrl = item.imagePath ? window.fixPath(item.imagePath) : (item.image || "");

            card.href = pageUrl;
            card.className = "news-card-slide";

            // 3日以内の判定、または先頭要素
            const itemDate = new Date(item.date);
            const now = new Date();
            const diffTime = Math.abs(now - itemDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const isNew = diffDays <= 3 || i === 0;
            const badgeHtml = isNew ? `<div class="news-badge-new">NEW!</div>` : '';

            card.innerHTML = `
                ${badgeHtml}
                <img src="${imgUrl}" alt="" loading="lazy">
                <div class="content">
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
                        <span class="news-date" style="margin:0;">${item.date}</span>
                        <span class="news-tag-label" style="margin:0;">${item.category}</span>
                    </div>
                    <div class="title">${item.title}</div>
                    <div style="font-size:0.85em; text-align:right; margin-top:auto; font-weight:bold;">もっとみる &rarr;</div>
                </div>
                <!-- Watermark Logo -->
                <div class="watermark-logo"></div>
            `;
            track.appendChild(card);
        });

        // カルーセルの動作ロジック
        const initCarousel = () => {
            const prevBtn = document.getElementById("carousel-prev");
            const nextBtn = document.getElementById("carousel-next");
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

            // Swipe
            let touchStartX = 0;
            let touchEndX = 0;
            track.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
            track.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                if (touchEndX < touchStartX - 50) { currentIndex = (currentIndex + 1) % total; update(); }
                if (touchEndX > touchStartX + 50) { currentIndex = (currentIndex - 1 + total) % total; update(); }
            }, { passive: true });
        };

        initCarousel();
    }
})();
