/**
 * partners.js
 * Partner Events list generation
 * Depends on: utils.js, data_events.js
 */

(function () {
    /* -------------------------------------------------------
       提携イベント一覧 (partner_events.html) の生成
       ------------------------------------------------------- */
    const partnerContainer = document.getElementById("partner-events-list-container");
    if (partnerContainer && window.partnerEventsData) {
        window.partnerEventsData.forEach(item => {
            const card = document.createElement("article");
            card.className = "card reveal is-visible";
            card.setAttribute("role", "listitem");

            const imgUrl = window.fixPath(item.image);
            const linkUrl = window.fixPath(item.link);
            const isExternal = linkUrl.startsWith('http');
            const targetAttr = isExternal ? 'target="_blank" rel="noopener"' : '';

            card.innerHTML = `
                <div class="card-top" style="background-image: url('${imgUrl}'); background-size: cover; background-position: center; height: 180px; border-radius: 8px 8px 0 0; position: relative;">
                   <!-- 画像エリア -->
                </div>
                <div style="padding: 1.5rem;">
                    <h3 class="card-title" style="margin-top:0;">${item.name}</h3>
                    <p class="card-desc" style="font-size: 0.9rem; color: var(--muted); margin-bottom: 1rem;">${item.desc}</p>

                    <dl class="meta">
                        <div>
                            <dt>日時</dt>
                            <dd>${item.date}</dd>
                        </div>
                        <div>
                            <dt>主催</dt>
                            <dd>${item.organizer}</dd>
                        </div>
                    </dl>

                    <div class="card-actions" style="margin-top: 1.5rem;">
                        <a class="more" href="${linkUrl}" ${targetAttr}>もっとみる→</a>
                    </div>
                </div>
            `;
            partnerContainer.appendChild(card);
        });
    }
})();
