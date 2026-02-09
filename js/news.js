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
        // フィルタリング
        const visibleNews = (window.newsData || []).filter(item => window.shouldShowItem(item));

        // データが空の場合
        if (visibleNews.length === 0) {
            newsContainer.innerHTML = `
                <div class="empty-content">
                    <p>現在お知らせはありません。</p>
                </div>
            `;
        } else {
            visibleNews.forEach(item => {
                const link = document.createElement("a");
                const pageUrl = item.linkPath ? window.fixPath(item.linkPath) : (item.id ? window.fixPath(`news/article.html?id=${item.id}`) : (item.link || "#"));
                const imgUrl = item.imagePath ? window.fixPath(item.imagePath) : (item.image || "");

                link.href = pageUrl;
                link.className = "news-link reveal is-visible";

                link.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                        <span class="news-date">${item.date}</span>
                        <span class="news-tag-label">${item.category}</span>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 140px; gap: 20px; position:relative; z-index:2;">
                        <div style="display:flex; flex-direction:column; justify-content:center;">
                            <h3 style="margin:0 0 8px; font-weight:900; font-size:1.2rem;">${item.title}</h3>
                            <p style="margin:0; font-size:0.9rem; color:var(--muted); line-height:1.6;">
                                ${item.desc || ""}
                            </p>
                        </div>
                        <div>
                            <img src="${imgUrl}" alt="" style="width:100%; height:100px; object-fit:cover; border-radius:8px; border: 1px solid rgba(0,0,0,0.1);">
                        </div>
                    </div>
                    <!-- Watermark Logo -->
                    <div class="watermark-logo"></div>
                `;
                newsContainer.appendChild(link);
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
            card.innerHTML = `
                <img src="${imgUrl}" alt="">
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
