/**
 * partners.js
 * Partner Events list generation
 * Depends on: utils.js, data_events.js
 */

(async function () {
    // Wait for Manifest
    if (window.manifestPromise) {
        try { await window.manifestPromise; } catch (e) { console.warn('Manifest wait failed', e); }
    }

    // ---- ページ構造構築 ----
    // HTML 側は <main id="main"></main> だけでよい。
    const main = document.getElementById('main');
    if (main) {
        main.insertAdjacentHTML('beforeend', `
            <section class="section">
                <div class="container">
                    <header class="section-head reveal">
                        <h1 class="section-title cafe-signboard">提携イベント一覧</h1>
                        <p class="section-lead">あにあめもりあと提携している素敵なイベントのご紹介。</p>
                    </header>
                    <div class="perf-strip" aria-hidden="true"></div>
                </div>
            </section>
            <section class="section">
                <div class="container">
                    <div id="partner-events-list-container" class="event-list" role="list"></div>
                </div>
            </section>
        `);
    }

    /* -------------------------------------------------------
       提携イベント一覧 (partner_events.html) の生成
       ------------------------------------------------------- */
    const partnerContainer = document.getElementById("partner-events-list-container");
    if (partnerContainer && window.partnerEventsData) {
        // フィルタリング
        const visibleEvents = window.partnerEventsData.filter(item => window.shouldShowItem(item));

        visibleEvents.forEach(item => {
            const card = document.createElement("article");
            card.className = "event-card reveal is-visible";
            card.setAttribute("role", "listitem");

            let imgUrl = item.image;
            if (!imgUrl && item.images && item.images.length > 0) {
                imgUrl = item.images[0];
            }
            imgUrl = window.fixPath(imgUrl);

            let linkUrl = item.link;
            if (!linkUrl && item.id) {
                linkUrl = `partner_events/event.html?id=${item.id}`;
            }
            linkUrl = window.fixPath(linkUrl);

            const isExternal = linkUrl.startsWith('http');
            const targetAttr = isExternal ? 'target="_blank" rel="noopener"' : '';

            card.innerHTML = `
                <a class="event-card__link" href="${linkUrl}" ${targetAttr}>
                    <div class="event-card__thumb">
                        <img src="${imgUrl}" alt="${item.name}" class="event-card__img" loading="lazy">
                    </div>
                    <div class="event-card__body">
                        <div class="event-card__top">
                            <div class="event-card__meta">
                                ${item.organizerLogo ? `<img src="${window.fixPath(item.organizerLogo)}" alt="" class="event-card__org-icon" aria-hidden="true">` : ''}
                                <span class="event-card__organizer">${item.organizer}</span>
                            </div>
                            <h3 class="event-card__name">${item.name}</h3>
                        </div>
                        <div class="event-card__bottom">
                            <p class="event-card__desc">${item.desc}</p>
                            <div class="event-card__footer">
                                <span class="event-card__date">${item.date}</span>
                                <span class="event-card__cta">詳細を見る</span>
                            </div>
                        </div>
                    </div>
                </a>
            `;
            partnerContainer.appendChild(card);
        });
    }
})();
